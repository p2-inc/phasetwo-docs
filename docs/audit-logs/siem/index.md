---
id: index
title: Send Events to a SIEM
sidebar_label: SIEM Export
description: Send Keycloak access and admin events straight to Microsoft Sentinel, Datadog Cloud SIEM or Google Security Operations with webhook payload formats.
---

A [webhook](../webhooks.md) normally posts each event as Phase Two's audit event JSON, which suits an endpoint you build yourself. A security information and event management (SIEM) platform expects something else: its own ingestion API, its own authentication, and events in the shape its parsers and detection rules read.

A **payload format** closes that gap. Set one on a webhook and Keycloak posts each event straight to the platform's ingestion API, in that platform's format. Nothing runs in between: no log shipper, no agent and no function to translate events.

| Platform                   | `payloadFormat`  | Events arrive as                                                                   | Guide                                         |
| -------------------------- | ---------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| Microsoft Sentinel         | `azure-sentinel` | Rows in a custom Log Analytics table, through the Azure Monitor Logs Ingestion API | [Microsoft Sentinel](./microsoft-sentinel.md) |
| Datadog Cloud SIEM         | `datadog`        | Logs that Datadog's Keycloak pipeline and Cloud SIEM content pack recognize        | [Datadog](./datadog.md)                       |
| Google Security Operations | `google-secops`  | Records for a webhook feed with the Keycloak log type                              | [Google SecOps](./google-secops.md)           |

Payload formats are part of the open source [keycloak-events](https://github.com/p2-inc/keycloak-events) extension, from version 0.70. They are available on every Phase Two hosted cluster, and in the `phasetwo-keycloak` image if you run Keycloak yourself.

## What it does and doesn't do

- **It sends events as they happen,** one request per event, to the URL you give the webhook.
- **It sends the events you choose.** The webhook's `eventTypes` decides which events go to the platform, the same as for any webhook.
- **It retries failed sends** with exponential backoff for up to 15 minutes. Responses that can't succeed on a retry, such as a rejected API key, are not retried. Each guide lists them.
- **It doesn't set anything up on the platform.** You create the table, feed or API key there first. Each guide has the steps.
- **It doesn't backfill.** Only events that happen after the webhook is created are sent.
- **It doesn't guarantee delivery.** An event whose retries run out is not sent again, and pending sends are lost if the server restarts. For a complete record, use the Phase Two [audit log](../index.md) as the source of truth.
- **It doesn't batch.** A busy realm makes one request per event, so check your platform's rate limits if you send every event type.

## Before you start

These steps are the same for every platform.

### 1. Enable the webhook listener

In the admin console, go to **Realm settings** > **Events** > **Event listeners**, add `ext-event-webhook`, and click **Save**. Do this in each realm whose events you want to send.

### 2. Get an access token

Webhooks are created with the [webhooks API](../webhooks.md#managing-webhook-subscriptions), which needs an access token for a user or [service account](/docs/api/service-accounts) with the `manage-events` role of the `realm-management` client. See [API authentication](/docs/api/authentication) for how to get one.

### 3. Allow your cluster's addresses, if the platform restricts them

If your SIEM's ingestion endpoint only accepts requests from known addresses, allow your cluster's [egress IP addresses](/docs/self-service/egress-ip-addresses).

Then follow the guide for your platform.

## How a SIEM webhook is configured

A SIEM webhook is an ordinary webhook with three more fields:

| Field           | Description                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------- |
| `payloadFormat` | The format, from the table above                                                               |
| `authType`      | How Keycloak authenticates to the platform: `headers` or `oauth2-client-credentials`           |
| `config`        | A JSON object of string values: the settings for the `authType`, and any options of the format |

For example, a webhook that sends every access and admin event to Datadog:

```shell
curl -X POST "https://<your-cluster-host>/auth/realms/<realm>/webhooks" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "url": "https://http-intake.logs.datadoghq.com/api/v2/logs",
    "eventTypes": ["access.*", "admin.*"],
    "payloadFormat": "datadog",
    "authType": "headers",
    "config": {
      "header.DD-API-KEY": "<api-key>",
      "tags": "env:prod"
    }
  }'
```

The request returns `201` when the webhook is created. It returns `400` if the format isn't installed, if a format option is invalid, or if the `authType` is missing a setting it needs.

### Authenticating to the platform

Ingestion APIs authenticate with an API key or an OAuth2 token, not with the HMAC signature that webhooks use for your own endpoints. Two auth types read their settings from `config`:

| `authType`                  | `config` entries                                                                           | What is sent                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `headers`                   | One or more entries named `header.` followed by the header name                            | Each entry as a request header. `header.DD-API-KEY` is sent as the `DD-API-KEY` header.                       |
| `oauth2-client-credentials` | `oauth2.tokenUrl`, `oauth2.clientId`, `oauth2.clientSecret`, and optionally `oauth2.scope` | `Authorization: Bearer` with a token that Keycloak gets from the token URL using the client credentials grant |

OAuth2 tokens are cached and refreshed a minute before they expire. If the platform answers `401`, the cached token is dropped and the retry gets a new one.

### Secrets

Header values, `oauth2.clientSecret`, and any format option marked secret are stored with the webhook and are never returned by the API. When you read a webhook they appear as `**********`.

To change a webhook without re-entering its secrets, send `**********` back for the values you want to keep. Any other value replaces the stored one.

### Changing or removing a format

Update the webhook with `PUT`:

- Leave `payloadFormat` out to keep the current format.
- Set `payloadFormat` to `""` to go back to the standard audit event JSON.

### Listing the formats on your cluster

`GET https://<your-cluster-host>/auth/realms/<realm>/webhooks/formats` returns the installed formats and their options. It requires the `view-events` role.

```json
[
  {
    "id": "datadog",
    "helpText": "Datadog Logs intake ...",
    "properties": [
      {
        "name": "service",
        "label": "Service",
        "helpText": "The Datadog service attribute.",
        "type": "String",
        "defaultValue": "keycloak",
        "secret": false
      }
    ]
  }
]
```

## Other ways to get events out

| If you want                                                          | Use                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Events at an endpoint you build                                      | A standard [webhook](../webhooks.md)                                            |
| Logs and authentication events streamed to an OpenTelemetry endpoint | [Telemetry Export](/docs/self-service/telemetry-export), on Enterprise clusters |
| A platform that isn't listed above                                   | A standard webhook to a collector you run, or your own payload format (below)   |

## Running Keycloak yourself

Everything on these pages works the same on your own Keycloak with the [keycloak-events](https://github.com/p2-inc/keycloak-events) extension, version 0.70 or later. Two things are available only when you operate the server:

- **A server-wide webhook** that sends every realm's events in a payload format, configured with environment variables.
- **Your own payload formats.** A format is a Keycloak provider, so you can add one for another platform.

Both are described in the extension's [payload format documentation](https://github.com/p2-inc/keycloak-events/blob/main/docs/webhook-payload-formats.md).
