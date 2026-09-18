---
id: telemetry-export
title: Telemetry Export
---

Stream your dedicated cluster's Keycloak logs and authentication events to **your own** observability system over [OTLP](https://opentelemetry.io/docs/specs/otlp/), the OpenTelemetry wire protocol. You give us an endpoint and a token; we deliver continuously.

This is for teams who already run an observability stack and want Keycloak data alongside everything else — correlated with application traces, retained under their own policy, queried with their own tools.

:::caution Experimental
Telemetry Export is **experimental and unsupported**. The record shape, the attribute names, and the configuration options may change in a backwards-incompatible way. Do not build production alerting or compliance reporting on it yet, and tell us at [support@phasetwo.io](mailto:support@phasetwo.io) if you want to try it — it is not enabled on every account.
:::

## What you need

- A **dedicated cluster**. Export is not available on shared or Starter clusters.
- An **HTTPS OTLP logs endpoint**, reachable from the public internet, with a certificate signed by a public CA. Certificates are verified — a self-signed certificate will not work.
- A **bearer token** for that endpoint.

The endpoint must resolve to a public address. Private, loopback, link-local, and reserved ranges are rejected, and so is any hostname that fails to resolve at all. If your collector sits inside a private network, put a public gateway in front of it and allowlist [our egress IP addresses](./egress-ip-addresses.md).

## Turning it on

1. Open your cluster in the [self-service dashboard](https://dash.phasetwo.io/clusters) and go to **Logs → Export**.
2. Switch on **Enable export**.
3. Enter your **Endpoint**, for example `https://otel.example.com:443`.
4. Choose a **Protocol** — **OTLP over HTTP** (recommended) or **OTLP over gRPC**. HTTP traverses load balancers, proxies, and WAFs far more reliably.
5. Paste your **Authorization token**. It is sent as `Authorization: Bearer <token>`, stored encrypted, and never displayed again.
6. Use **Test endpoint** to check the address before committing to it. This changes nothing.
7. **Save**.

Changes take **a couple of minutes** to take effect, not seconds. Configuration propagates to the export service in your cluster's region and is applied without restarting anything.

### The endpoint path

For OTLP over HTTP, the logs path is appended for you. Give us the base URL — `https://otel.example.com:443` becomes `https://otel.example.com:443/v1/logs`. If your collector serves OTLP under a prefix, include it (`https://otel.example.com/telemetry`) and we will append `/v1/logs` to that.

## What you receive

Everything arrives as the **OTLP logs** signal. Keycloak authentication events are delivered as structured log records, not as traces or metrics.

### Resource attributes

Set once per batch, on every record:

| Attribute | Value |
| --- | --- |
| `service.name` | `keycloak` |
| `service.namespace` | `phasetwo` |
| `deployment.environment.name` | `production` |
| `phasetwo.cluster.id` | your cluster name |
| `phasetwo.region` | the region your cluster runs in |

Nothing about Phase Two's own infrastructure is included — no pod names, node names, internal addresses, or account identifiers.

### Telling logs and events apart

Every record body carries `phasetwo.signal`, which is `log` or `event`. This is the field to filter on first:

```
phasetwo.signal:"event" AND keycloak.event.type:"LOGIN_ERROR"
```

### Log records

Keycloak server logs, scoped to the `org.keycloak.*` and `io.phasetwo.*` loggers. JVM, Quarkus, connection-pool, and clustering internals are **not** exported.

| Field | Contains |
| --- | --- |
| `log_message` | the log message |
| `loggerName` | the Java logger |
| `threadName` | the emitting thread |
| `mdc` | Keycloak's mapped diagnostic context — realm, user, client where present |
| `stackTrace`, `exception.type`, `exception.message` | present on errors |
| `phasetwo.signal` | `log` |

`SeverityText` and `SeverityNumber` come from the log level, so `severity >= WARN` works in your backend.

### Event records

Authentication and admin events, rebuilt from Keycloak's event data into flat attributes so you can query them semantically rather than pattern-matching log text.

| Attribute | From |
| --- | --- |
| `keycloak.event.class` | `USER` or `ADMIN` |
| `keycloak.event.type` | `LOGIN`, `LOGIN_ERROR`, `REGISTER`, `LOGOUT`, … |
| `keycloak.event.id` | event id |
| `keycloak.event.error` | error code, when the event failed |
| `keycloak.realm.id`, `keycloak.realm.name` | the realm |
| `keycloak.user.id` | the end user |
| `keycloak.client.id` | the OIDC client |
| `keycloak.session.id` | the session |
| `client.address` | the end user's IP address |
| `keycloak.event.details` | the event details, as a JSON string |
| `phasetwo.signal` | `event` |

Admin events additionally carry `keycloak.operation.type`, `keycloak.resource.type`, `keycloak.resource.path`, `keycloak.auth.user.id`, `keycloak.auth.client.id`, `keycloak.auth.realm.id`, `keycloak.auth.realm.name`, `keycloak.event.representation`, and `client.address` for the acting administrator.

`keycloak.event.details` and `keycloak.event.representation` stay JSON strings rather than being flattened. Their shape varies by event type, and expanding them would produce an unbounded set of fields — expensive on a metrics-billed backend, and enough to breach field limits on some search backends. Parse them on your side if you need them.

**Event timestamps are the event's own time**, not the time the log line was written.

**Event severity is derived, not inherited.** Keycloak logs a failed login at `INFO`, which is not useful to you. We set `WARN` when the event carries an error and `INFO` otherwise, so `severity >= WARN` is a working filter for authentication failures.

:::warning Events contain end-user data
Exported events include end-user IP addresses and user IDs in the clear. This is the same data Keycloak records internally. Make sure the destination is an appropriate place for it under your own data-protection obligations before you enable export.
:::

## Where it works

Anything that accepts OTLP logs. Customers are running it against:

- OpenSearch, via [Data Prepper](https://opensearch.org/docs/latest/data-prepper/)
- [Grafana](https://grafana.com/) Cloud and Alloy, and Loki's OTLP endpoint
- [Datadog](https://www.datadoghq.com/)
- [SigNoz](https://signoz.io/)
- Elastic, New Relic, Honeycomb, Dynatrace
- Any [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) you run yourself

An OpenTelemetry Collector in front of your own storage is the most flexible option: it gives you a place to re-map attributes, drop fields, or fan out to more than one destination without changing anything here.

## Delivery, retries, and failure

Delivery is continuous and buffered, per cluster.

- If your endpoint is **slow or briefly unavailable**, records queue on disk and are retried until it comes back. Nothing is lost, and delivery to other customers is unaffected.
- If your endpoint stays **unavailable for a long time**, the queue eventually reaches its limit and the oldest records are discarded. How long that takes depends on your cluster's volume — typically days, not hours.
- **Turning export off stops delivery immediately** and discards anything still queued. That is deliberate: a destination you have switched off should stop receiving data.

Phase Two alerts internally when a cluster's export stops delivering or starts dropping records, and we will get in touch. **We cannot tell whether your backend accepted a record after we delivered it** — a token your collector rejects looks like a failed delivery; a record your pipeline silently drops does not. Check your own backend after enabling export rather than assuming success.

The **Delivery status** panel on the export page does not yet report live delivery state. Treat it as unimplemented for now.

## Current limitations

These are real and deliberate. All of them are things we expect to change.

- **Logs and events are all or nothing.** You cannot export events without logs, or the reverse.
- **Scope is Keycloak only.** JVM and container internals are never exported and cannot be requested.
- **Logs signal only.** No metrics, no traces. Keycloak does not emit traces, and metrics export is separate work.
- **One destination per cluster.** Fan out on your side with a collector.
- **No filtering or sampling** before delivery. Everything in scope is sent.
- **No redaction option.** Records are exported as Keycloak produces them.

## Related

- [Logs](./logs.md) — viewing the same data in the dashboard, with no setup
- [Metrics](./metrics.md) — charted authentication and request activity
- [Egress IP addresses](./egress-ip-addresses.md) — allowlist these if your collector is behind a firewall
- [Backups and data retention](./backups-and-data-retention.md)
