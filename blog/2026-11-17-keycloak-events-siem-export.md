---
title: "Send Keycloak events straight to Microsoft Sentinel, Datadog and Google SecOps"
slug: keycloak-events-siem-export
date: 2026-11-17
authors: [gpatil]
tags: [phase_two, keycloak, events, security, open_source, hosting, release]
description: Phase Two webhooks can now post Keycloak login and admin events directly to Microsoft Sentinel, Datadog Cloud SIEM and Google Security Operations, in each platform's own format. Open source in keycloak-events 0.70 and available on every Phase Two hosted cluster.
keywords:
  [
    keycloak siem,
    keycloak microsoft sentinel,
    keycloak datadog,
    keycloak google secops,
    keycloak chronicle,
    keycloak events webhook,
    keycloak audit log export,
    keycloak security monitoring,
  ]
---

Keycloak webhooks from Phase Two can now send login and admin events directly to **Microsoft Sentinel**, **Datadog Cloud SIEM** and **Google Security Operations**, each in the format that platform's ingestion API and detection content expect. You set a `payloadFormat` on a webhook, give it the platform's credentials, and events start arriving. There is no log shipper, agent or translation function to run in between.

The feature is open source in [keycloak-events](https://github.com/p2-inc/keycloak-events) 0.70, and it is available today on every Phase Two hosted cluster.

<!-- truncate -->

## Why we built it

Your identity provider sees every login, every failed password, every new admin and every role change. Those are the events a security team most wants in its SIEM, next to the firewall and endpoint logs, where detection rules can correlate them.

Getting them there from Keycloak has taken more work than it should. Keycloak itself has no listener that sends events to an external system, so the usual route is to write events to the server log and run a log shipper that forwards them. Our [webhooks](/docs/audit-logs/webhooks) already removed the shipper, but they post our own event JSON, and no SIEM ingests that as it is. Each platform wants requests to its own API, authenticated its own way, with fields named the way its parsers read them. So teams ended up writing and operating a small service whose only job was to receive a webhook and repost it in another shape.

Payload formats move that translation into the webhook.

## What's new

**Three payload formats.** Each is a guide of its own in the docs, with the setup steps for the platform's side as well as Keycloak's.

| Platform                                                       | `payloadFormat`  | What arrives                                                                                                                                                              |
| -------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Microsoft Sentinel](/docs/audit-logs/siem/microsoft-sentinel) | `azure-sentinel` | Rows in a custom Log Analytics table, sent through the Azure Monitor Logs Ingestion API, with a column per event field and ready to query in KQL                          |
| [Datadog](/docs/audit-logs/siem/datadog)                       | `datadog`        | Log entries with `source:keycloak` and the same message line Keycloak's own event logger writes, so Datadog's Keycloak log pipeline and its Cloud SIEM content pack apply |
| [Google SecOps](/docs/audit-logs/siem/google-secops)           | `google-secops`  | Records for a webhook feed with the Keycloak log type, in the envelope that Google's published field mapping for its Keycloak parser reads                                |

**Two ways to authenticate to an ingestion API.** These platforms don't verify an HMAC signature the way your own endpoint would. They expect an API key or an OAuth2 token, so webhooks have two new auth types:

- `headers` sends static request headers, such as Datadog's `DD-API-KEY`.
- `oauth2-client-credentials` gets a token with the client credentials grant and sends it as a bearer token. Microsoft Sentinel uses it, with an Entra app registration. Tokens are cached, refreshed before they expire, and fetched again if the platform answers `401`.

**Secrets that stay secret.** API keys and client secrets are stored with the webhook and are never returned by the API. When you read a webhook they come back as `**********`, and sending that value back on an update keeps what is stored, so you can edit a webhook without re-entering its credentials.

**Retries that know when to stop.** Failed sends are retried with exponential backoff, as before. A format also knows which responses can't succeed on a retry, such as a rejected API key or a table that doesn't exist, and doesn't keep sending those.

## What it looks like

This webhook sends every access and admin event in a realm to Datadog:

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

From then on a failed login shows up in Datadog's Log Explorer under `source:keycloak @evt.name:LOGIN_ERROR`, with the user, the client IP address and the realm as attributes.

The other two take a little more setup on the platform's side. Sentinel needs a custom table, a data collection rule and an app registration; Google SecOps needs a webhook feed and an API key. The guides give the commands and the console steps for each. `eventTypes` works as it does for any webhook, so you can send only what your detections use, for example `access.LOGIN_ERROR` and `admin.*`, and leave out high-volume events such as token refreshes.

## What it doesn't do

It is worth being plain about the limits.

- **It doesn't backfill.** A webhook sends events that happen after it is created.
- **It doesn't batch.** Each event is one request. That is simple and fast to arrive, but check your platform's rate limits before sending every event type from a busy realm. Batching is on our list.
- **It isn't a guaranteed-delivery pipeline.** A send that keeps failing is dropped after 15 minutes of retries. On Phase Two hosting, the [audit log](/docs/audit-logs) remains the complete record.
- **The parsing on the other side belongs to the vendor.** We build each payload from the vendor's published documentation, and our tests check the output against it. Google's Keycloak parser in particular is theirs to change, and we have not yet verified that format against a live SecOps tenant, so check a few events in your own tenant before you rely on detections. If something doesn't parse the way a guide says, [open an issue](https://github.com/p2-inc/keycloak-events/issues).

## Availability

**On Phase Two hosting.** Payload formats are available on every hosted cluster. Enable the `ext-event-webhook` listener in your realm, create the webhook through the API, and follow the guide for your platform under [Send Events to a SIEM](/docs/audit-logs/siem). If your SIEM restricts where requests come from, allow your cluster's [egress IP addresses](/docs/self-service/egress-ip-addresses). Enterprise clusters also have [Telemetry Export](/docs/self-service/telemetry-export), which streams logs and authentication events to an OpenTelemetry endpoint; the two work side by side.

**Open source.** The formats are in [keycloak-events](https://github.com/p2-inc/keycloak-events) from version 0.70, and in the `phasetwo-keycloak` image. If you run the server, you can also give the server-wide catch-all webhook a format, so every realm's events go to your SIEM from one setting.

**Your own format.** Formats are a Keycloak provider interface, so a platform we haven't covered is a small extension: one class that turns an event into a request body, and a factory that registers it. The [payload format documentation](https://github.com/p2-inc/keycloak-events/blob/main/docs/webhook-payload-formats.md#writing-your-own-format) describes the interface, and the three built-in formats are working examples. If you write one for another SIEM, we'd welcome a pull request.

## Get started

- [Send Events to a SIEM](/docs/audit-logs/siem): how formats, authentication and secrets work
- [Microsoft Sentinel](/docs/audit-logs/siem/microsoft-sentinel), [Datadog](/docs/audit-logs/siem/datadog) and [Google SecOps](/docs/audit-logs/siem/google-secops) guides
- [keycloak-events on GitHub](https://github.com/p2-inc/keycloak-events)

Don't have a cluster yet? [Create one in the dashboard](https://dash.phasetwo.io/) and try it with your SIEM.
