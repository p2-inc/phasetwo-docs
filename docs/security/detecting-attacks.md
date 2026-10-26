---
id: detecting-attacks
title: Detecting Attacks on Keycloak with Events and Metrics
description: Detecting attacks on Keycloak means shipping events somewhere that alerts. What the log, event store and metrics show, the queries to run, and what to alert on.
---

Detecting attacks on Keycloak is mostly a matter of getting its events to something that can alert. Keycloak records the raw material: a user event for every login and failure, admin events for every change, a login counter in its metrics, and a log line per event. It has no detection engine. It does not correlate events, score risk, or notify anyone, so nothing happens until you ship that material somewhere that does.

The lesson from incidents we have worked on with customers is that failed logins are loud and successful takeovers are quiet. The default log is full of `LOGIN_ERROR` lines during an attack and shows none of the `LOGIN` events that worked. This page covers where each kind of signal lives, how to turn on the parts that are off, the queries and alerts that find takeovers, and what you need beyond Keycloak. Every Keycloak behavior described here was reproduced on Keycloak 26.8.1.

## What Keycloak records, and what each source shows

| Source | On by default | Shows successful `LOGIN` | Good for |
|---|---|---|---|
| Server log (`jboss-logging` listener) | Yes | No, logged at `DEBUG` | Seeing that an attack is happening |
| Event store (user events) | No | Yes, with client, user, IP and session | Finding which accounts were taken over |
| Admin events | No | Not applicable | Auditing changes, including your own remediation |
| Metrics (`keycloak_user_events_total`) | No | Yes, as a count | Alerting on rates |

Every event listener receives events whether or not the event store is on. The store, the log and the metrics are independent: you can have any combination of them.

## Why the log misses takeovers

The default `jboss-logging` listener writes error events at `WARN` and success events at `DEBUG`. With the default `INFO` log level, an attack looks like this:

```
WARN  [org.keycloak.events] type="LOGIN_ERROR", realmName="demo", clientId="admin-cli", userId="null", ipAddress="203.0.113.1", error="user_not_found", auth_method="openid-connect", grant_type="password", client_auth_method="client-secret", username="nobody1@example.com"
```

The successful password grant for a real user, sent from one of the attacker's addresses a moment later, produced no line at all. Neither did any admin event. Brute force lockouts are missing too: `USER_DISABLED_BY_TEMPORARY_LOCKOUT` is written at the success level, so it only appears once you raise it.

Set the levels with two server options. The error level shown is the default; the success level is the one to change:

```
--spi-events-listener--jboss-logging--success-level=info
--spi-events-listener--jboss-logging--error-level=warn
```

With `success-level=info`, every `LOGIN` appears in the log with the client, user, session ID, IP address and grant type, and admin events appear as `operationType="…"` lines. Expect a large increase in log volume on a busy realm, since every login, code exchange and admin call now writes a line. If you only want the log for alerting on failures, leave the success level alone and use the event store or metrics for the successes.

## Turn on the event store

The event store is what answers "which accounts did the attacker get into?" A new realm has it off:

```json
{
  "eventsEnabled": false,
  "eventsListeners": ["jboss-logging"],
  "adminEventsEnabled": false,
  "adminEventsDetailsEnabled": false
}
```

Turn it on under **Realm Settings → Events → User events settings**, or with `PUT /admin/realms/{realm}/events/config`. Check these settings:

- **Saved types.** The default list covers 102 of the 132 event types in 26.8.1, including `LOGIN`, `LOGIN_ERROR`, `CODE_TO_TOKEN`, `CLIENT_LOGIN`, `UPDATE_PASSWORD`, `RESET_PASSWORD` and both lockout types. It leaves out `REFRESH_TOKEN`, `INTROSPECT_TOKEN`, `USER_INFO_REQUEST` and `USER_SESSION_DELETED`, among others. Without `REFRESH_TOKEN`, a stolen offline token being refreshed for weeks leaves no trace in the store. Add it if you can afford the volume.
- **Expiration.** Unset means events are kept until you delete them. If you set one, make it longer than the time it might take you to notice an attack, which in practice is weeks, not days.
- **The API replaces the whole configuration.** A `PUT` to `events/config` that omits `eventsExpiration` clears it. Read the current configuration, change what you need, and send it all back.

Turn on **Admin events** too, and **Include representation** if you want the changed fields recorded. Admin events show who changed what: an attacker who reaches the Admin API, and your own remediation calls, such as `ACTION` on `users/{id}/reset-password` and `users/{id}/logout`. Password values are not recorded in the representation. Admin events have their own expiration, stored as the realm attribute `adminEventsExpiration`, which the admin console sets under **Admin events settings**.

## Query the event store during an incident

The Admin API exposes the store at `GET /admin/realms/{realm}/events`. The caller needs the `view-events` role. Filters:

| Parameter | Matches |
|---|---|
| `type` | Event type. Repeat it to match several, for example `type=LOGIN&type=LOGIN_ERROR` |
| `client` | Client ID, such as `admin-cli` |
| `user` | User ID (not username) |
| `ipAddress` | Source address as Keycloak saw it |
| `dateFrom`, `dateTo` | Dates, such as `2026-10-01` |
| `first`, `max` | Paging. The default page is 100 events; ask for more explicitly |

The IP address is only useful if Keycloak sees the real client address. Behind a load balancer or proxy, configure `--proxy-headers` so the store doesn't record the proxy's address for every event.

Failed logins for unknown users are saved with `userId` empty and the submitted name in `details.username`, so you can count usernames per address even when they don't exist in the realm.

### Which accounts logged in on a client real users don't use

If your users never sign in through `admin-cli`, `account-console` or `security-admin-console`, a `LOGIN` there for an ordinary user is the clearest single sign of a takeover we have seen.

```bash
for c in admin-cli account-console security-admin-console; do
  curl -s -H "Authorization: Bearer $TOKEN" \
    "$KC/admin/realms/$REALM/events?type=LOGIN&client=$c&dateFrom=2026-10-01&max=1000" |
  jq -r '.[] | [(.time/1000|todate), .clientId, .details.username, .ipAddress] | @tsv'
done
```

```
2026-10-26T17:44:15Z	admin-cli	alice	192.168.65.1
```

Administrators legitimately use `security-admin-console`, and on `admin-cli` so do scripts that still use the password grant. Exclude those accounts by name before you treat the rest as compromised.

### Which addresses had both failures and successes

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "$KC/admin/realms/$REALM/events?type=LOGIN&type=LOGIN_ERROR&dateFrom=2026-10-01&max=10000" |
jq -r 'group_by(.ipAddress)[]
  | {ip: .[0].ipAddress,
     errors: (map(select(.type=="LOGIN_ERROR")) | length),
     logins: map(select(.type=="LOGIN") | .details.username)}
  | select(.errors > 0 and (.logins | length) > 0)
  | [.ip, .errors, (.logins | unique | join(","))] | @tsv'
```

Each output line is an address, its failure count, and the accounts it logged into. A shared corporate or mobile carrier address will show up here legitimately; an address with hundreds of failures and a handful of successes is the attacker finding reused passwords. For large windows, page with `first` and `max` instead of one huge request.

## Alert on login metrics

The event store is for investigation. For alerting on rates, use metrics. Two options turn on the counter:

```
--metrics-enabled=true
--event-metrics-user-enabled=true
--event-metrics-user-tags=realm,clientId
```

The `user-event-metrics` feature these depend on is enabled by default in 26.8.1. Metrics are served on the management port, `http://<host>:9000/metrics`, not on the main HTTP port. The counter looks like this:

```
keycloak_user_events_total{client_id="admin-cli",error="",event="login",realm="demo"} 1.0
keycloak_user_events_total{client_id="admin-cli",error="user_not_found",event="login",realm="demo"} 127.0
keycloak_user_events_total{client_id="admin-cli",error="invalid_user_credentials",event="login",realm="demo"} 2.0
```

Three details matter when you write queries. The `event` label is the lowercase type without the `_error` suffix: a failed login is `event="login"` with a non-empty `error` label, and a successful one has `error=""`. The `client_id` label only exists if you add `clientId` to `--event-metrics-user-tags`; the default tags are `realm` only, to keep cardinality down. And the counter does not depend on the event store, so it counts logins in realms whose events are off. Use `--event-metrics-user-events` to limit which event types create series.

Example PromQL, summed across all Keycloak pods:

```promql
# Failed logins per second, by realm: alert when well above the same time yesterday
sum by (realm) (rate(keycloak_user_events_total{event="login", error!=""}[10m]))
  > 5 * sum by (realm) (rate(keycloak_user_events_total{event="login", error!=""}[10m] offset 1d))

# Share of failures for users that don't exist: stuffing lists are mostly other sites' users
sum by (realm) (rate(keycloak_user_events_total{event="login", error="user_not_found"}[10m]))
  / sum by (realm) (rate(keycloak_user_events_total{event="login"}[10m]))

# Any successful login on admin-cli outside the master realm (needs the clientId tag)
sum by (realm) (increase(keycloak_user_events_total{event="login", error="", client_id="admin-cli", realm!="master"}[15m])) > 0

# Brute force lockouts
sum by (realm) (increase(keycloak_user_events_total{event="user_disabled_by_temporary_lockout"}[15m])) > 10
```

The thresholds are starting points. Set them from a week of your own traffic.

## Get events off the server

The event store lives in Keycloak's database, which is the wrong place to search a month of history and the first place an attacker with admin access could delete from. Send events somewhere else as they happen.

Keycloak 26.8.1 ships four event listeners: `jboss-logging`, `email`, `micrometer-user-event-metrics` (the metrics counter, which runs without being added to a realm), and `workflow-event-listener`. None of them sends events to an external system. The usual route with stock Keycloak is the log: raise the success level as above, write JSON logs, and have your log shipper forward the `org.keycloak.events` category. Otherwise you write an `EventListenerProvider` of your own.

The Phase Two [keycloak-events](https://github.com/p2-inc/keycloak-events) extension adds listeners that do this. It is included in the `phasetwo-keycloak` image. According to its README:

- **`ext-event-webhook`** sends user and admin events, in a unified format with `access.` and `admin.` type prefixes, to webhook subscriptions you manage through a REST resource at `/realms/{realm}/webhooks`. Payloads can be signed with a shared secret, and failed sends are retried with exponential backoff. See [Webhooks](/docs/audit-logs/webhooks).
- **`ext-event-http`** posts each event to a single configured URI, optionally HMAC-signed in an `X-Keycloak-Signature` header, with retries.
- **`ext-event-script`** runs a JavaScript function for each event inside Keycloak.

We did not exercise these listeners for this page. Whichever route you use, add the listener alongside `jboss-logging` rather than in place of it, and have the receiver answer immediately: a slow endpoint backs up the queue, and retries do not continue forever.

## Signals worth alerting on

| Event | Filter | Why it matters | False positives |
|---|---|---|---|
| `LOGIN` | Client is `admin-cli`, `account-console` or `security-admin-console`; user is not an administrator | The attacker confirmed a password on a client your users don't use. The clearest takeover signal | Administrators, scripts still on the password grant, users who really do use the account console |
| `LOGIN_ERROR` | Rate well above baseline | A campaign has started | Marketing sends, a broken client retrying with a stale password |
| `LOGIN_ERROR` | `error="user_not_found"` share rising | Stuffing lists are mostly addresses that aren't your users | Users mistyping their email after a username format change |
| `LOGIN` | IP address also produced many `LOGIN_ERROR` in the window | The attacker found reused passwords | Shared NAT addresses: offices, carriers, VPNs |
| `LOGIN_ERROR` | Many distinct `details.username` per IP, or one username from many IPs | Stuffing or spraying from one source, or one account under distributed attack | Shared addresses; a user with a misconfigured client on several devices |
| `USER_DISABLED_BY_TEMPORARY_LOCKOUT`, `USER_DISABLED_BY_PERMANENT_LOCKOUT` | Count above baseline | Brute force detection is firing, possibly as a deliberate lockout of real users | One user forgetting their password |
| `UPDATE_PASSWORD`, `UPDATE_EMAIL`, `UPDATE_CREDENTIAL`, `REMOVE_CREDENTIAL` | Shortly after a suspicious `LOGIN` on the same user | The attacker is keeping the account | Real users changing their own settings |
| Admin event | `CREATE`, `UPDATE` or `DELETE` on `REALM_ROLE_MAPPING`, `CLIENT_ROLE_MAPPING`, `CLIENT` or `REALM`, from an unexpected admin user or IP | Someone with admin access is changing the realm | Your own deployments and configuration-as-code runs |

## What a SIEM or anomaly detection tool adds

Keycloak counts and stores. It does not reason about who a user normally is. These are the capabilities you get from a SIEM, a log analytics platform with detection rules, or a dedicated identity threat detection product, and that Keycloak does not have:

- **Impossible travel.** Two logins for one user from locations too far apart for the time between them.
- **Velocity and baselining.** Rates per user, per address and per network compared with that entity's own history, not a fixed threshold.
- **New device or new network.** A login from a device or ASN the user has never used.
- **IP reputation.** Matching source addresses against feeds of known proxies, hosting providers, Tor exits and previous attack sources.
- **Correlation across systems.** Joining a Keycloak `LOGIN` with what the same session did next in your application.
- **Case management and alert routing.** Grouping related alerts into one incident and paging the right person.

Examples in this space include Splunk, Elastic Security, Microsoft Sentinel, Datadog Cloud SIEM and Sumo Logic. All of them need the events delivered to them first, which is the work in the previous sections.

## Retention: export before it expires

- **Export the attack window as soon as you notice an attack.** Save the user events for the window and the admin events for your remediation outside Keycloak before an expiration setting or a cleanup removes them. In 26.8.1, expired events are not hidden at query time: they stay visible until a scheduled cleanup task deletes them, which in our test happened within 15 minutes. Don't count on the time between expiry and deletion to save you.
- **Plan for database growth during a campaign.** Every failed attempt writes one row: 120 scripted attempts in our test wrote 120 `LOGIN_ERROR` rows. A campaign of millions of attempts writes millions of rows to the same database that serves logins. Watch table size and set an expiration that balances forensics against storage, and keep the long history in the system you forward events to.
- **Keep a copy the realm's admins can't delete.** Anyone with `manage-events` can clear the store with `DELETE /admin/realms/{realm}/events`. A copy elsewhere is the only copy an attacker with admin access can't remove.

## When an alert fires

Detection ends where response starts. Close the path the attacker used, identify the accounts with a successful `LOGIN` from the campaign, set a new random password on each, end their sessions and offline sessions, and export the evidence. The steps and API calls are in [Credential Stuffing and Account Takeover: Respond](./credential-stuffing.md#respond).

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| Event capture into the Phase Two [audit log](/docs/audit-logs), independent of your realm's event settings and its expiration | Saving events in the realm too, if you want to query them through the Admin API |
| Event and request [metrics](../self-service/metrics.md) in the dashboard, including successful and failed logins and lockout reasons | Alert rules in your own monitoring, from events you forward |
| Cluster, event and request [logs](../self-service/logs.md) in the dashboard | Forwarding events to your own systems with the `ext-event-webhook` listener and [webhooks](/docs/audit-logs/webhooks) |
| Help during an incident: email [support@phasetwo.io](mailto:support@phasetwo.io) | Any SIEM or anomaly detection, and responding to what it finds |

On Enterprise clusters, [Telemetry Export](../self-service/telemetry-export.md) streams logs and authentication events to your own OTLP endpoint. It is marked experimental.

## Related

- [Credential Stuffing and Account Takeover](./credential-stuffing.md)
- [Password Spraying](./password-spraying.md)
- [Brute Force Detection](./brute-force-detection.md)
- [Tokens and Sessions](./tokens-and-sessions.md)
- [Securing Keycloak in Production](./index.md)
