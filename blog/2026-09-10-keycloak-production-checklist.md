---
slug: keycloak-production-checklist
title: Keycloak Production Readiness Checklist
date: 2026-09-10
authors: [jpatzer]
tags: [keycloak, operations, production, hosting, configuration]
description: A tested Keycloak production readiness checklist for 26.7.3 — the two settings that block startup, the eleven defaults that are wrong for production, and the probe your load balancer gets wrong.
keywords:
  - keycloak production ready checklist
  - keycloak production configuration
  - keycloak production deployment
  - keycloak default configuration
  - keycloak production checklist
---

A Keycloak production readiness checklist has to answer two different questions, and most
published ones only answer the first. Keycloak's `start` command refuses to boot until you settle two
things, and it prints a clear error for each, so those are easy. The harder list is everything
it will happily let you ship wrong: brute force protection is off, your audit log accepts
forged IP addresses from anyone, event tables grow forever, and the readiness endpoint
disagrees with your load balancer for the first few seconds of every restart.

Everything below was run against `quay.io/keycloak/keycloak:26.7.3`. Where a number appears, it
came out of a terminal, not from memory.

<!-- truncate -->

## Start here: the minimum production configuration

**Keycloak 26.7.3 in production mode will not start until you give it two things:** TLS key
material *or* `http-enabled=true`, and a `hostname` *or* `hostname-strict=false`. A third,
`db`, is currently only a deprecation warning if you leave it unset, which is worse than an
error because the server then runs on H2. Behind a TLS-terminating proxy, the smallest
configuration that both starts and is safe to serve traffic is eight lines:

```properties title="conf/keycloak.conf"
db=postgres
db-url=jdbc:postgresql://pg:5432/keycloak
hostname=https://sso.example.com
http-enabled=true
proxy-headers=xforwarded
proxy-trusted-addresses=10.0.0.0/8
health-enabled=true
metrics-enabled=true
```

Nothing past those eight lines is enforced by the server, and the rest of this page is the
unenforced part. There is a
[downloadable copy of the whole checklist](pathname:///checklist/keycloak-production-checklist.md) if you
want it in a ticket. If you are running on Phase Two rather than self-hosting, the
server-level items are already done and the
[platform launch checklist](/docs/getting-started/launch-checklist) is the application-side
list you want instead.

## What actually blocks startup

Two hard gates and two warnings, in the order you hit them. Run `start` with nothing configured
and you get the first warning and the first gate together:

```console
$ docker run --rm quay.io/keycloak/keycloak:26.7.3 start
WARNING: Usage of the default value for the db option in the production profile is
deprecated. Please explicitly set the db instead.
Key material not provided to setup HTTPS. Please configure your keys/certificates, or if
HTTPS access is not needed see the `http-enabled` option. If you meant to start the server
in development mode, see the `start-dev` command.
```

Tell it a proxy handles TLS and you hit the second:

```console
$ docker run --rm quay.io/keycloak/keycloak:26.7.3 start --db=dev-file --http-enabled=true
ERROR: Failed to start server in (production) mode
ERROR: Failed to start quarkus
ERROR: hostname is not configured; either configure hostname, or set hostname-strict to false
```

`hostname-strict` defaults to `true`, which is why an unset hostname is fatal rather than a
warning. Set the hostname to an `https://` URL but forget `proxy-headers` and the server starts
anyway, with a warning that is worth reading rather than scrolling past:

```console
WARNING: Likely misconfiguration detected. When using an edge proxy, you must use
`proxy-headers`.
```

That last one is a warning and not an error, and it is the single most common source of
"Keycloak generates the wrong redirect URLs" reports. If your public URL is HTTPS and Keycloak
is speaking plain HTTP to a proxy, `proxy-headers` is how it learns the difference.

## Change these eleven defaults before you launch

None of these produce an error. All of them produce an incident eventually.

| # | Setting | Default in 26.7.3 | Set it to | Why |
|---|---|---|---|---|
| 1 | `db` | `dev-file` (H2) | `postgres` or another supported vendor | Deprecated in the production profile; H2 has no place under real load |
| 2 | `proxy-trusted-addresses` | *all addresses trusted* | your proxy's CIDR | Any caller can forge the client IP (see below) |
| 3 | `health-enabled` | `false` | `true` | No `/health/ready` means your orchestrator is guessing |
| 4 | `metrics-enabled` | `false` | `true` | You cannot alert on what you do not export |
| 5 | `db-pool-max-size` | `100` **per node** | `max_connections / nodes` minus headroom | Three nodes want 300 connections; PostgreSQL 17 ships with 100 total |
| 6 | Realm `bruteForceProtected` | `false` | `true` | Password spraying is free until you turn it on |
| 7 | Realm `eventsEnabled` / `adminEventsEnabled` | `false` / `false` | `true` | No login history, no admin audit trail |
| 8 | Realm `eventsExpiration` | *unset* | an explicit duration | Unset means the events table never stops growing |
| 9 | Realm password policy | *no policy at all* | length + a blacklist at minimum | A fresh realm accepts a one-character password |
| 10 | Realm `offlineSessionMaxLifespanEnabled` | `false` | `true` if you issue offline tokens | Otherwise a token refreshed inside 30 days lives forever |
| 11 | Bootstrap admin user | left in place | deleted, after a real admin exists | It is flagged `is_temporary_admin` for a reason |

Rows 6 through 11 are **per realm**, not server-wide, so they do not live in `keycloak.conf`
and they are not covered by your configuration management unless you have put realm config
under version control too. Every one of those values came out of a realm created seconds
earlier with `kcadm.sh create realms -s realm=prodcheck -s enabled=true`:

```console
$ kcadm.sh get realms/prodcheck --fields sslRequired,bruteForceProtected,eventsEnabled,\
adminEventsEnabled,eventsExpiration,passwordPolicy,offlineSessionMaxLifespanEnabled
{
  "offlineSessionMaxLifespanEnabled" : false,
  "sslRequired" : "external",
  "bruteForceProtected" : false,
  "eventsEnabled" : false,
  "adminEventsEnabled" : false
}
```

Note what is missing from that output: `eventsExpiration` and `passwordPolicy` are not `null`,
they are absent, because a new realm has neither. Which is why this works:

```console
$ kcadm.sh set-password -r prodcheck --username bob --new-password 'a'
$ echo $?
0
```

## Your audit log accepts forged IP addresses by default

This is the item most checklists miss, and it is one option long.

`proxy-trusted-addresses` documents its own default as "By default all addresses are trusted."
Combined with `proxy-headers=xforwarded`, that means Keycloak will believe the
`X-Forwarded-For` header on any request that reaches it, from anywhere. Six unauthenticated
failed logins with a rotating forged header:

```bash
for ip in 203.0.113.10 203.0.113.11 203.0.113.12 203.0.113.13 203.0.113.14 203.0.113.15; do
  curl -s -o /dev/null -X POST \
    "https://sso.example.com/realms/proxytest/protocol/openid-connect/token" \
    -H "X-Forwarded-For: $ip" \
    -d "client_id=cli&grant_type=password&username=alice&password=wrong"
done
```

land in the event store with exactly the IP addresses the attacker chose (newest first,
trimmed):

```console
$ kcadm.sh get events -r proxytest --fields type,ipAddress,error
[ {
  "type" : "LOGIN_ERROR",
  "ipAddress" : "203.0.113.15",
  "error" : "user_temporarily_disabled"
}, {
  "type" : "LOGIN_ERROR",
  "ipAddress" : "203.0.113.14",
  "error" : "user_temporarily_disabled"
}, {
  "type" : "USER_DISABLED_BY_TEMPORARY_LOCKOUT",
  "ipAddress" : "203.0.113.11"
}, {
  "type" : "LOGIN_ERROR",
  "ipAddress" : "203.0.113.10",
  "error" : "invalid_user_credentials"
} ]
```

Add one option, `--proxy-trusted-addresses=10.99.99.0/24`, chosen so the caller's real address
is *not* in the trusted range, and the identical forged request records the socket address
instead:

```console
$ kcadm.sh get events -r proxytest --fields type,ipAddress,error
[ {
  "type" : "LOGIN_ERROR",
  "ipAddress" : "172.17.0.1",
  "error" : "invalid_user_credentials"
} ]
```

Two honest caveats. First, this is not a brute force bypass: the lockout in that first trace
fired on the third attempt despite the rotating IP, because Keycloak's brute force detection
counts failures per user, not per address. Second, that same property is the real limitation —
Keycloak has no built-in per-IP throttling, so if you want one you need it at the proxy. What
header spoofing does buy an attacker is a poisoned audit trail and a way to defeat any IP
allow/deny list you layered on top, which is enough.

## Your readiness probe is right and your load balancer is wrong

`--server-async-bootstrap` documents itself as "endpoints are opened while the bootstrap runs
in the background", and it is "enabled by default when the health endpoints are also enabled".
The consequence is a window where the port answers and the server is not usable. Polling the
main port and `/health/ready` every 400ms through a restart, on an already-built image with a
file-backed H2 database (trimmed):

```console
t=5.6s  oidc=000  ready=000
t=6.0s  oidc=503  ready=503
t=8.7s  oidc=503  ready=503
t=9.1s  oidc=503  ready=200
```

The body during that window is explicit:

```console
$ curl -s http://kc:8080/realms/master/.well-known/openid-configuration
Bootstrap in progress. Retry in 2 seconds.
```

Which is fine, because `/health/ready` reports `"KeycloakInitialized" : "DOWN"` for exactly the
same interval. It is only a problem if your readiness check is a TCP connect, or an HTTP check
against the main port that treats any response as success — both of which pass roughly three
seconds early. Three seconds of 503s per node per rolling restart is a lot of failed logins on
a busy realm, and it is invisible in the Keycloak log, which reports success at the *start* of
the window:

```console
09:57:35,446 INFO [io.quarkus] Keycloak 26.7.3 on JVM (powered by Quarkus 3.33.3.1)
                   started in 5.399s. Listening on: http://0.0.0.0:8080.
09:57:38,907 INFO [org.keycloak...KeycloakApplication] Bootstrap completed in 3.689000 seconds
```

Two lines, 3.5 seconds apart, and the first one is the one everybody greps for. On a real
database with a schema migration to run, the gap is longer. Probe `/health/ready`, or set
`server-async-bootstrap=false` and accept a slower but honest startup.

One more thing about health: it is on the management port, not the main one.

```console
$ curl -s -o /dev/null -w '%{http_code}\n' http://kc:8080/health
404
$ curl -s http://kc:9000/health
{"status":"UP","checks":[{"name":"Graceful Shutdown","status":"UP"},
{"name":"Keycloak database connections async health check","status":"UP"},
{"name":"Keycloak Initialized","status":"UP"},
{"name":"Keycloak cluster health check","status":"UP"}]}
```

`health-enabled` and `metrics-enabled` are both build-time options, so changing them
re-augments the image. Set them in your `Dockerfile`, not in your deployment.

## Clustering advice from 2024 is now wrong

If you are copying a production checklist written before 26.x, check this section against
`kc.sh start --help-all` before you trust it.

- **`cache-stack` defaults to `jdbc-ping`.** Node discovery through the database, over TCP, with
  no extra configuration. The `kubernetes` stack that every older guide tells you to set is now
  listed as deprecated, along with `tcp`, `udp`, `jdbc-ping-udp`, `ec2`, `azure` and `google`.
  The best action is usually no action.
- **Cluster traffic is already encrypted.** `cache-embedded-mtls-enabled` defaults to `true`,
  and Keycloak generates and rotates the certificates itself every 30 days. The startup log
  says so: `JGroups Encryption enabled (mTLS)`.
- **Sessions survive a full restart.** `persistent-user-sessions` is enabled by default in
  26.x, and it takes three commands to confirm: get a refresh token, restart the server,
  refresh it.

  ```bash
  RT=$(curl -s -X POST "$KC/realms/proxytest/protocol/openid-connect/token" \
    -d "client_id=cli&grant_type=password&username=carol&password=Passw0rd!x" \
    | jq -r .refresh_token)

  docker restart kc
  until curl -sf -o /dev/null "$MGMT/health/ready"; do sleep 2; done

  curl -s -o /dev/null -w '%{http_code}\n' \
    -X POST "$KC/realms/proxytest/protocol/openid-connect/token" \
    -d "client_id=cli&grant_type=refresh_token&refresh_token=$RT"
  # 200
  ```

  That is a single node with a local in-memory cache and a file-backed database, and the
  session still worked. The pre-26 advice to size your cluster around not losing sessions on
  restart no longer applies, though you still need the cluster for cache invalidation.

You still have to open the ports. On a default 26.7.3 start, JGroups binds `7800` for the stack
and `57800` for `FD_SOCK2` failure detection. Both between nodes only.

## Fix the two realm defaults that look like bugs

Two failure modes worth naming, because the first report is always filed as a bug.

**A user created over the Admin API cannot log in.** Create a user with just a username and a
password, and the token endpoint returns:

```console
{"error":"invalid_grant","error_description":"Account is not fully set up"}
```

Nothing is broken. The default user profile marks email, first name and last name required, so
a user missing them is incomplete. Either supply them, or change the user profile. This bites
every user-import script exactly once.

**Password hashing is a memory budget now.** 26.7.3 hashes with argon2id, and it records the
parameters on the credential, so you can read them back rather than trust a blog post:

```console
$ kcadm.sh get users/$ID/credentials -r prodcheck | jq -r '.[0].credentialData' | jq .
{
  "hashIterations": 5,
  "algorithm": "argon2",
  "additionalParameters": {
    "hashLength": ["32"],
    "memory": ["7168"],
    "type": ["id"],
    "version": ["1.3"],
    "parallelism": ["1"]
  }
}
```

7168 KiB of memory per hash, held for the duration of the hash. That is deliberate and good for
password security, and it means a login spike is a memory spike. Size for concurrent
authentications, not for steady-state sessions, and watch
`keycloak_credentials_password_hashing_validations_total`.

## Export login metrics, not just JVM metrics

`metrics-enabled=true` gives you JVM and HTTP metrics, but not login outcomes. Those are behind
a feature flag plus an option, both easy to miss:

```bash
kc.sh start --optimized \
  --metrics-enabled=true \
  --features=user-event-metrics \
  --event-metrics-user-enabled=true \
  --event-metrics-user-tags=realm,clientId
```

Which produces the counter every Keycloak dashboard should start with:

```console
$ curl -s http://kc:9000/metrics | grep keycloak_user_events
# TYPE keycloak_user_events counter
# HELP keycloak_user_events Keycloak user events
keycloak_user_events_total{client_id="admin-cli",error="",event="login",realm="master"} 1.0
keycloak_user_events_total{client_id="cli",error="user_not_found",event="login",realm="m1"} 3.0
```

The default tag set is `realm` only, on purpose — adding `clientId` and `idp` multiplies
cardinality. Add them deliberately. If you also want the event history rather than just the
counters, that is a separate problem with a separate answer; we wrote up how we moved
[Keycloak event storage out of the database entirely](/blog/scaling-keycloak-event-storage/),
and why the default JPA event store is the wrong place for it at volume.

## Do not run start-dev, and set a queue limit

**Never run `start-dev` in production**, and here is a concrete reason beyond the banner it
prints. Theme resources are served with different cache headers in each mode:

```console
# same file, same version, two servers
$ RES=/resources/lsuo4/common/keycloak/vendor/patternfly-v5/patternfly.min.css

$ curl -sD - -o /dev/null "http://dev-server:8080$RES" | grep -i cache-control
Cache-Control: no-cache

$ curl -sD - -o /dev/null "http://prod-server:8080$RES" | grep -i cache-control
Cache-Control: max-age=2592000
```

Thirty days versus nothing, on every CSS and font file on your login page. If you need a
different value for a CDN it is one option, `spi-theme-static-max-age`, which we confirmed by
starting with `--spi-theme-static-max-age=1234` and watching the header come back as
`max-age=1234`. For more on getting themes right in the
first place, our [Keycloak themes](/extensions/themes/) extension and the
[UI customization docs](/docs/getting-started/customizing-ui) cover the build side.

**Set `http-max-queued-requests`.** It is unset by default, so an overloaded server queues
requests rather than shedding them. Set it and excess requests get an immediate
`503 Server not Available` instead, which is a much better failure than a queue nobody is
draining. Pair it with `http-pool-max-threads`, which defaults to `max(4 × cores, 50)`, so a
2-core container gets 50 threads rather than the 8 you might have assumed.

## What this checklist does not cover

Being specific about the gaps matters more than padding the list.

- **Sizing.** There is no honest CPU or memory number that is not measured on your workload.
  Argon2 memory per concurrent hash and your token lifespans move it more than user count does.
- **Backup and restore.** `kc.sh export` is not a backup — it does not capture everything you
  need to rebuild a realm, and the gaps are not obvious until you try a restore. Take
  database-level backups and rehearse the restore.
- **Multi-site.** Everything above was verified on a single node. Cross-site replication has
  its own failure modes and its own upstream guide.
- **Upgrades.** Rehearse the schema migration against a restored copy. The
  [26.7.3 release notes](/blog/keycloak-2673-released/) are a good example of why the version
  you pin matters more than the checklist you followed.

For the settings themselves, the upstream
[Configuring Keycloak for production](https://www.keycloak.org/server/configuration-production)
guide is the reference for what each option does, and
[the reverse proxy guide](https://www.keycloak.org/server/reverseproxy) has the path-exposure
table you want in front of you while writing proxy rules. This page is the part they leave to
you: what to set, in what order, and what it looks like when you get it wrong.

If you would rather not own the server-level half of this list, our
[managed Keycloak](/hosting/dedicated-clusters/) clusters come with the proxy, TLS, probe and
cluster configuration already in place, plus [event and request metrics](/docs/self-service/metrics)
and log retention in the dashboard. Either way, work down the
[downloadable checklist](pathname:///checklist/keycloak-production-checklist.md) once before
your next launch — the realm-level rows are yours in both cases.
