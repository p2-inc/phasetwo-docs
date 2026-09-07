# Keycloak production readiness checklist

Verified against **Keycloak 26.7.3** (2026-09-10). Companion to
<https://phasetwo.io/blog/keycloak-production-checklist/>, which explains the reasoning and
shows the tested output behind each item.

Everything below was run against `quay.io/keycloak/keycloak:26.7.3`.

---

## 1. Server will not start without these

- [ ] `db` set explicitly. The default value is deprecated in the production profile.
- [ ] TLS key material configured (`https-certificate-file` + `https-certificate-key-file`,
      or a keystore), **or** `http-enabled=true` because a proxy terminates TLS.
- [ ] `hostname` set to the full public URL, or `hostname-strict=false` if the proxy
      rewrites `Host`. `hostname-strict` defaults to `true`, so an unset hostname is a
      hard start failure.

## 2. Proxy and hostname

- [ ] `proxy-headers` set to `xforwarded` or `forwarded` (never both, never neither).
- [ ] `proxy-trusted-addresses` set to your proxy's IPs/CIDRs. **Default: all addresses
      are trusted**, which lets any caller forge the client IP in your audit log.
- [ ] `hostname-admin` set if the admin console lives on a separate hostname.
- [ ] `/admin/`, `/realms/master/`, `/metrics` and `/health` blocked at the proxy.
- [ ] `hostname-debug` left at `false`.

## 3. Database

- [ ] Supported production database. `kc.sh start --help-all` on 26.7.3 lists
      `dev-file, dev-mem, mariadb, mssql, mysql, oracle, postgres, tidb` — the two
      `dev-*` values are not production databases.
- [ ] `db-pool-max-size` × node count ≤ database `max_connections` minus headroom.
      Keycloak's default is **100 per node**; PostgreSQL 17's default `max_connections`
      is **100** in total.
- [ ] `db-schema` set if you share a database.
- [ ] Schema migrations rehearsed against a restored copy of production, not run blind
      on first boot of a new version.
- [ ] Restore tested, not just backup configured.

## 4. Cluster and cache

- [ ] `cache=ispn` (the production default) and **not** overridden to `local`.
- [ ] `cache-stack` left at the `jdbc-ping` default, or set to a non-deprecated value.
      `kubernetes`, `tcp`, `udp`, `ec2`, `azure`, `google` and `jdbc-ping-udp` are all
      deprecated in 26.7.
- [ ] `cache-embedded-mtls-enabled` left at `true` (default). Certificates are generated
      and rotated automatically every 30 days.
- [ ] JGroups port (7800 by default) and `FD_SOCK2` port (57800) open between nodes only.
- [ ] `persistent-user-sessions` left enabled (default). Sessions survive a full restart.

## 5. Health, metrics, probes

- [ ] `health-enabled=true` (build-time option).
- [ ] `metrics-enabled=true` (build-time option).
- [ ] Management port 9000 reachable from the orchestrator, blocked from the internet.
- [ ] Readiness probe on `/health/ready`, **not** a TCP check. The main port accepts
      connections and returns `503 Bootstrap in progress. Retry in 2 seconds.` for
      several seconds after Quarkus reports "started".
- [ ] Liveness probe on `/health/live`, startup probe on `/health/started`.
- [ ] `server-async-bootstrap=false` if you would rather the port stay shut until
      bootstrap finishes.
- [ ] `event-metrics-user-enabled=true` plus `--features=user-event-metrics` if you want
      per-realm login and failure counters in Prometheus.

## 6. Startup time and image

- [ ] `kc.sh build` run at image-build time, `start --optimized` at runtime. An unbuilt
      image re-augments on every start.
- [ ] Providers, themes and the JDBC driver baked into the image, not mounted at runtime.
- [ ] Version pinned to an exact tag. Never `latest`.

## 7. Realm settings (per realm, not server-wide)

- [ ] Brute force protection enabled. Default: **off**.
- [ ] User events enabled with an expiration set. Default: off, and with no expiration
      the events table grows forever.
- [ ] Admin events enabled (with details) for audit.
- [ ] Password policy configured. Default: **no policy at all**.
- [ ] `sslRequired` reviewed. Default is `external`.
- [ ] Access token lifespan reviewed (default 300s) and SSO session idle/max
      (default 1800s / 36000s).
- [ ] Offline session max lifespan enabled if you issue offline tokens. Default:
      disabled, so a token refreshed within 30 days lives indefinitely.
- [ ] `revokeRefreshToken` considered for public clients. Default: off.
- [ ] Temporary bootstrap admin replaced with a real account and deleted. Look for the
      `is_temporary_admin` attribute.
- [ ] Realm keys rotation policy decided.

## 8. Themes and static assets

- [ ] Running `start`, not `start-dev`. Dev mode serves theme resources with
      `Cache-Control: no-cache`; production serves `max-age=2592000`.
- [ ] `spi-theme-static-max-age` tuned only if your CDN needs a different value.
- [ ] Custom themes cache-busted by a new image tag rather than by disabling caching.

## 9. Load shedding and limits

- [ ] `http-max-queued-requests` set. Unset means unbounded queueing under overload.
- [ ] `http-pool-max-threads` reviewed. Default is `max(4 × cores, 50)`.
- [ ] Rate limiting in front of `/realms/*/protocol/openid-connect/token` and
      `/realms/*/login-actions/*`.
- [ ] Password hashing cost budgeted. 26.7.3 defaults to argon2id with 7168 KiB of
      memory per hash, which is RAM you need during a login spike.

## 10. Operations

- [ ] Logs shipped off the node in JSON (`log-console-output=json`).
- [ ] Alert on `keycloak_user_events_total{event="login",error!=""}` rate.
- [ ] Upgrade path rehearsed, including the realm/DB migration step.
- [ ] Runbook for "all nodes down" that does not require the admin console to be up.
