---
id: webhooks
title: Webhooks
---

Webhooks let your application listen for audit events at an HTTP endpoint. Each event is sent to your endpoint as JSON, in the same format described for [access](./access.md) and [admin](./admin.md) events and the [Audit Log API](./api.md).

To send events to Microsoft Sentinel, Datadog or Google SecOps instead of an endpoint you build, see [Send Events to a SIEM](./siem/index.md).

## Enable webhooks

Turn on the webhook event listener in the admin console: go to **Realm settings** > **Events** > **Event listeners**, add `ext-event-webhook` to the list, and save.

## Managing webhook subscriptions

Webhooks are managed with a REST resource on your realm. Reading webhooks requires the `view-events` role and changing them requires `manage-events`, both from the `realm-management` client. On a hosted cluster you can also create and manage webhooks from a realm's **Webhooks** page in the [Dashboard](https://dash.phasetwo.io/). If you are using one of the supported languages, we recommend our [SDKs](/docs/api/sdks) rather than building the requests yourself.

| Path                                      | Method   | Payload        | Returns                 | Description                                           |
| ----------------------------------------- | -------- | -------------- | ----------------------- | ----------------------------------------------------- |
| `/auth/realms/:realm/webhooks`            | `GET`    |                | List of webhook objects | Get webhooks                                          |
| `/auth/realms/:realm/webhooks`            | `POST`   | Webhook object | `201`                   | Create webhook                                        |
| `/auth/realms/:realm/webhooks/:id`        | `GET`    |                | Webhook object          | Get webhook                                           |
| `/auth/realms/:realm/webhooks/:id`        | `PUT`    | Webhook object | `204`                   | Update webhook                                        |
| `/auth/realms/:realm/webhooks/:id`        | `DELETE` |                | `204`                   | Delete webhook                                        |
| `/auth/realms/:realm/webhooks/:id/secret` | `GET`    |                | Secret object           | Get the webhook's signing secret                      |
| `/auth/realms/:realm/webhooks/formats`    | `GET`    |                | List of payload formats | Get the available [payload formats](#payload-formats) |

The webhook object has this format:

```json
{
  "id": "475cd2fd-3ca8-4c22-b5c8-c8b8927dcc10",
  "enabled": "true",
  "url": "https://example.com/some/webhook",
  "secret": "ofj09saP4",
  "authType": "hmac",
  "algorithm": "HmacSHA256",
  "audience": null,
  "eventTypes": ["*"],
  "payloadFormat": null,
  "config": {},
  "createdBy": "ff730b72-a421-4f6e-9e4e-7fc7f53bac88",
  "createdAt": "2021-04-21T18:25:43-05:00"
}
```

For creating and updating webhooks, `id`, `createdBy` and `createdAt` are ignored. `secret` is not returned when fetching webhooks; use the `/secret` endpoint, which requires `manage-events`.

| Field           | Description                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`       | Whether events are sent to this webhook                                                                                                                                          |
| `url`           | Where events are posted                                                                                                                                                          |
| `eventTypes`    | Which events are sent. See [Event types](#event-types).                                                                                                                          |
| `authType`      | How requests are authenticated. See [Verifying webhook payloads](#verifying-webhook-payloads).                                                                                   |
| `secret`        | The shared secret, for the `hmac` auth type                                                                                                                                      |
| `algorithm`     | The signing algorithm, for the `hmac` and `bearer` auth types                                                                                                                    |
| `audience`      | The token audience, for the `bearer` auth type                                                                                                                                   |
| `payloadFormat` | A [payload format](#payload-formats). Leave it out to send the standard event JSON.                                                                                              |
| `config`        | Settings for the payload format and for the `headers` and `oauth2-client-credentials` auth types, as a JSON object of string values. Secret values are returned as `**********`. |

### Event types

The `eventTypes` field is an array of expressions that match the type of event. It can contain a wildcard, such as `*` (send all events), `access.*` (send all access events), or `admin.CLIENT-*` (send all admin events about clients). It can also be a specific event type, such as `admin.USER-CREATE` (only send user creation events by an admin) or `access.REGISTER` (only send self-registration events). An expression can also be a regular expression that matches the whole type, such as `admin.USER-.*` (send all admin events about users).

## Verifying webhook payloads

When the receiver is an endpoint you build, each webhook authenticates its payload in one of three ways, set by the `authType` field:

| `authType` | Header                        | How your endpoint verifies it                                                                                              |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `hmac`     | `X-Keycloak-Signature`        | Compute the keyed HMAC of the raw request body with the webhook's `secret`, and compare it to the header value.            |
| `bearer`   | `Authorization: Bearer <jwt>` | Verify a short-lived JWT signed by the realm's signing key against the realm's published keys. No shared secret is needed. |
| `none`     | —                             | The payload is not signed.                                                                                                 |

If `authType` is omitted, a webhook with a `secret` uses `hmac`, and one without a secret uses `none`.

Two more auth types, `headers` and `oauth2-client-credentials`, are for receivers that you don't build and that expect an API key or an OAuth2 token, such as a SIEM's ingestion API. See [Authenticating to the platform](./siem/index.md#authenticating-to-the-platform).

**HMAC.** Provide a `secret`, and optionally an `algorithm`: `HmacSHA256` (the default) or `HmacSHA1` for backward compatibility. The RFC 2104 HMAC of the request body is sent in the `X-Keycloak-Signature` header. Always compute the HMAC over the raw body bytes, before any JSON parsing.

**Bearer JWT.** Provide an `audience`. Each delivery attempt carries a freshly minted JWT, signed with the realm's active signing key (`RS256` by default). Validate it the same way you validate access tokens from the realm, using the realm's JWKS at `https://<your-cluster-host>/auth/realms/<realm>/protocol/openid-connect/certs`. The token contains:

| Claim                 | Value                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `iss`                 | The realm issuer                                                                                    |
| `aud`                 | The webhook's `audience`                                                                            |
| `iat` / `exp`         | Issued-at and expiry. Tokens are short-lived and minted for every attempt, including retries.       |
| `jti`                 | A unique token ID                                                                                   |
| `request_body_sha256` | Hex-encoded SHA-256 of the exact request body, so the token can't be replayed with a different body |

## Payload formats

A payload format changes what a webhook posts, so that events can go straight to a log or SIEM platform's ingestion API in the shape that platform expects. Set it with the webhook's `payloadFormat` field, and put its options in `config`.

| `payloadFormat`  | Sends to                                      | Guide                                              |
| ---------------- | --------------------------------------------- | -------------------------------------------------- |
| Not set          | Your own endpoint, as the standard event JSON | This page                                          |
| `azure-sentinel` | Microsoft Sentinel                            | [Microsoft Sentinel](./siem/microsoft-sentinel.md) |
| `datadog`        | Datadog Logs and Cloud SIEM                   | [Datadog](./siem/datadog.md)                       |
| `google-secops`  | Google Security Operations                    | [Google SecOps](./siem/google-secops.md)           |

[Send Events to a SIEM](./siem/index.md) explains how formats, their authentication and their secrets work.

## Retries

If your endpoint does not return a 2xx response, the delivery is retried with exponential backoff, for up to 15 minutes. After that the delivery is dropped. Deliveries are scheduled after the transaction that produced the event has been committed, so an event you receive always corresponds to a change that happened.

## Client performance

Your endpoint should return a 2xx response _immediately_ and do any processing afterward. If it doesn't, deliveries can back up and you may miss events, because retries don't continue forever.

## Delivery history

When the server is configured to store webhook deliveries, these additional endpoints let you inspect and resend individual deliveries. Reading requires `view-events` and resending requires `manage-events`.

| Path                                                 | Method | Payload                                    | Returns                            | Description       |
| ---------------------------------------------------- | ------ | ------------------------------------------ | ---------------------------------- | ----------------- |
| `/auth/realms/:realm/webhooks/:id/sends`             | `GET`  | `first`, `max` query params for pagination | Webhook send objects (brief)       | List deliveries   |
| `/auth/realms/:realm/webhooks/:id/sends/:sid`        | `GET`  |                                            | Webhook send object (with payload) | Get one delivery  |
| `/auth/realms/:realm/webhooks/:id/sends/:sid/resend` | `POST` |                                            | `202`                              | Resend a delivery |

If you run Keycloak yourself, delivery storage is turned on with the `storeWebhookEvents` option of the `ext-event-webhook` event listener. See the keycloak-events [webhooks documentation](https://github.com/p2-inc/keycloak-events/blob/main/docs/webhooks.md#recording-what-was-sent) for details.

## Example

To create a webhook for all events on the `test` realm, signed with HMAC:

```
POST /auth/realms/test/webhooks

{
  "enabled": "true",
  "url": "https://webhooks.example.com/keycloak",
  "secret": "A3jt6D8lz",
  "eventTypes": [
    "*"
  ]
}
```

## Testing

A request inspection service such as [Pipedream](https://pipedream.com/) is an easy way to see webhook payloads before you build your own endpoint.
