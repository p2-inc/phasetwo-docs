---
slug: keycloak-smtp-not-sending
title: "Keycloak email not sending: SMTP debugging"
date: 2026-11-26
authors: [jpatzer]
tags: [keycloak, troubleshooting, smtp, email, ops]
description: Keycloak email not sending? The page says it worked either way. Read the events, then the exception. Eight SMTP failures reproduced on 26.8.2, and the cause of each.
keywords:
  - keycloak email not sending
  - keycloak smtp not working
  - keycloak smtp error
  - keycloak starttls required
  - send_reset_password_error
---

import TroubleshootingCallout from "@site/src/components/TroubleshootingCallout";

When Keycloak email is not sending, the one thing you cannot use as evidence is the screen. The forgot-password page prints **"You should receive an email shortly with further instructions"** whether the message was delivered, the relay rejected the credentials, or the realm has no SMTP server configured at all. So the diagnosis never starts with the user's report. It starts in three places, in this order: the realm's **events** tell you whether Keycloak tried, the **`Caused by:` chain** in the server log tells you which phase failed, and the first line of the `EmailException` tells you whether you are looking at a connection problem, an authentication problem or a rejected message.

Everything below was reproduced on **Keycloak 26.8.2** in a container, against a real SMTP server with plaintext, STARTTLS, implicit TLS and SMTP AUTH. Every error string, log line and timing is copied from a run on 2026-11-23.

<!-- truncate -->

## Why the page says it worked

Ten configurations produced that same sentence on that same page: a working relay, a wrong password, authentication switched off against a relay that requires it, each of the two encryption settings wrong, an unroutable host, an unresolvable host, no SMTP configuration at all, a user with no email address, and a username that does not exist. It is deliberate. The response has to be identical for a user who does not exist, or the form becomes an account-enumeration oracle. The cost is that a dead relay stays invisible until someone complains.

If you are still filling the fields in rather than debugging them, [configure SMTP so Keycloak can send email](/tutorials/authentication/smtp/) covers the fields, the ports and the provider settings. This post assumes they are set and mail still is not arriving.

## Step 1: did Keycloak even try?

Turn the email events on, then reproduce the failure once:

```bash
kcadm update events/config -r prod -s eventsEnabled=true \
  -s 'enabledEventTypes=["SEND_RESET_PASSWORD","SEND_RESET_PASSWORD_ERROR","SEND_VERIFY_EMAIL","SEND_VERIFY_EMAIL_ERROR","RESET_PASSWORD_ERROR"]' \
  -s eventsExpiration=3600

kcadm get events -r prod | jq -r '.[] | "\(.type) \(.error // "-") \(.details.username)"'
```

What comes back splits the problem in half before you read a single stack trace:

| Event type | `error` | What happened |
|---|---|---|
| `SEND_RESET_PASSWORD` | — | The relay accepted the message. The problem is downstream |
| `SEND_RESET_PASSWORD_ERROR` | `email_send_failed` | Keycloak reached the SMTP step and it failed. Go to step 2 |
| `RESET_PASSWORD_ERROR` | `invalid_email` | The user has no email address. SMTP never ran |
| `RESET_PASSWORD_ERROR` | `user_not_found` | No such username. SMTP never ran |
| Nothing at all | — | The flow never reached the email execution |

**The fifth entry in that `enabledEventTypes` list is the one most guides leave out, and it is why this check so often comes back empty.** `invalid_email` and `user_not_found` are not `SEND_*` events at all. They are `RESET_PASSWORD_ERROR`, a separate type. With only the four `SEND_*` types enabled, a user whose account simply has no email address on it produces **no stored event**, and the Events tab shows a realm where nothing is wrong. The server log still carries the line; the admin console does not.

<TroubleshootingCallout variant="config" error="smtp-not-sending" />

## Step 2: read the exception, not the event

On 26.8.2 the event is no longer worth reading past the `error` field. Every transport failure now records the same reason:

```
reason="Error when attempting to send the email to the server. More information is
available in the server log."
```

Configuration errors still report themselves properly: a realm with no sender address gives you `Invalid sender address 'null'` in the event itself. Anything that happens on a socket sends you to the log. There, two message codes carry the detail, and they are what you alert on:

```
ERROR [org.keycloak.services] KC-SERVICES0029: Failed to send email: …
ERROR [org.keycloak.services] KC-SERVICES0026: Failed to send password reset email: …
```

The first line of the `EmailException` after `KC-SERVICES0029` names the phase that broke, which is most of the diagnosis:

| First line | Phase that failed |
|---|---|
| `Non authenticated connect failed` | TCP connect or the TLS upgrade, before any credentials went out |
| `Password based SMTP connect failed` | The connection and TLS worked; `AUTH` did not |
| `SMTPSendFailedException: 5xx …` | Connected and authenticated; the relay rejected the message |

Then read the `Caused by:` chain to the bottom. These are the eight endings, all reproduced:

| Bottom of the `Caused by:` chain | Cause | Fix |
|---|---|---|
| `MessagingException: STARTTLS is required but host does not support STARTTLS` | StartTLS is enabled and the relay does not advertise it. New behaviour; see below | Use a relay that supports STARTTLS, or untick StartTLS |
| `SSLException: Unsupported or unrecognized SSL message` | **Enable SSL** ticked against a STARTTLS or plaintext port | `ssl=false`, `starttls=true`, port 587 |
| `MessagingException: Could not convert socket to TLS` → `SSLHandshakeException: (certificate_unknown) PKIX path building failed` | The relay's certificate does not chain to anything in the JVM truststore | Mount the CA and set `KC_TRUSTSTORE_PATHS` |
| `MailConnectException: Couldn't connect to host, port: …; timeout 10000` → `SocketTimeoutException: Connect timed out` | Nothing is listening, or a firewall is dropping the packets | Port and egress rules |
| `UnknownHostException: <host>` | The name does not resolve **from inside the Keycloak container** | DNS, or a container that is not on the same network |
| `AuthenticationFailedException: 535 5.7.8 Authentication credentials invalid` | Username or password rejected | Credentials, and read the provider notes below |
| `SMTPSendFailedException: 530 5.7.0 Authentication required` | The **Authentication** switch is off and the relay requires `AUTH` | Turn it on |
| `EmailException: Invalid sender address 'null'` | No **From** address, which means no SMTP configuration at all on this realm | SMTP is per realm; a copied realm does not inherit it |

Timing separates two of those. A wrong hostname fails in 48 ms; an unroutable one runs out the default 10-second read timeout, and **the forgot-password page took 10,105 ms to answer**. Keycloak sends mail on the request thread, so a relay that fails slowly makes login and registration fail slowly with it. `connectionTimeout`, `timeout` and `writeTimeout` are per-realm, in milliseconds. Set them below your users' patience.

## Did your mail stop the day you upgraded?

If email worked before an upgrade and fails afterwards with `STARTTLS is required but host does not support STARTTLS`, nothing on your side changed. [CVE-2026-107121](https://github.com/advisories/GHSA-4276-jw29-xwhr) closed a fallback. With **Enable StartTLS** ticked, Keycloak used to carry on in the clear when the relay did not advertise `STARTTLS`, sending credentials and message body unencrypted. It now refuses. The [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) states it plainly: "If the SMTP server does not support STARTTLS, sending email fails instead of falling back to plaintext."

The advisory carries no affected-version data, so we tested the branches ourselves. Same realm config, same relay, StartTLS enabled, relay offering no `STARTTLS`. The 26.8 tags are the upstream images; the 26.6 and 26.4 tags are our [backport images](/blog/keycloak-lts-backport-images), built from the upstream tags on those branches.

| Version | Result |
|---|---|
| 26.8.0 | Delivered — authenticated and sent in plaintext |
| 26.8.1 | Fails |
| 26.8.2 | Fails |
| 26.6.7 | Delivered — authenticated and sent in plaintext |
| 26.6.9 | Fails |
| 26.4.18 | Delivered — authenticated and sent in plaintext |

Two things follow from that. On 26.8.1 or later, or on 26.6.9, this is why your mail stopped, and the honest fix is a relay that supports STARTTLS rather than unticking the box. On 26.4.18, the newest tag on that branch, the old behaviour was still there when we tested it: your mail is working *because* Keycloak is willing to send your SMTP password in the clear.

Turn on the SMTP conversation and the log tells you which case you are in:

```bash
kcadm update realms/prod -s 'smtpServer.debug=true'
```

```
EHLO keycloak-0
250-SIZE 52428800
250-AUTH LOGIN PLAIN
250-ENHANCEDSTATUSCODES
DEBUG SMTP: STARTTLS required but not supported
```

No `250-STARTTLS` in that list is the whole story. Turn `debug` off afterwards: it writes your SMTP exchange to a log that is probably shipped somewhere.

## Why "Test connection" passed

Because it answers a slightly different question. It returns the same `{"errorMessage":"Failed to send email"}` and HTTP 500 for unrelated causes: a STARTTLS failure and an admin account with no email address on it are indistinguishable through that endpoint. And a password of ten literal asterisks is read as "use the stored one" — posting that mask against a realm with a stored SMTP password returns `204`, while the same request against a realm without one fails. That is the trap in a realm import. An export writes the SMTP password out as exactly that mask, so the imported realm stores the mask, every send fails with `535`, and the console shows a password field that looks filled in.

## What if the relay took it and the user still has nothing?

A `SEND_RESET_PASSWORD` event with no error means Keycloak's job finished at `250`, and the rest belongs to the provider. Three rejections get mistaken for Keycloak bugs:

- **Amazon SES** returns `535 Authentication Credentials Invalid` when you paste IAM keys in. [SMTP credentials are not AWS credentials](https://docs.aws.amazon.com/ses/latest/dg/troubleshoot-smtp.html), and they are per region. A new account is also in the sandbox, where `554 Message rejected: Email address is not verified` applies to **recipients** as well as to your sender.
- **Microsoft 365** disables SMTP AUTH by default; it has to be [enabled per mailbox](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission), and security defaults being on disables it outright. No Keycloak log will ever mention a tenant setting.
- **Google Workspace** needs an app password, which needs 2-Step Verification on the account.

Everything after that is deliverability: SPF, DKIM and DMARC on a domain you control. Authentication mail in a spam folder is the same outage as mail that never sent, and it is the one your monitoring will not catch.

## Keep it from going quiet

Alert on `SEND_RESET_PASSWORD_ERROR` and `SEND_VERIFY_EMAIL_ERROR` rather than on support tickets, add `RESET_PASSWORD_ERROR` so a user with no address is visible too, and pipe them somewhere you already look — [exporting Keycloak events to a SIEM](/blog/keycloak-events-siem-export) covers the mechanics. Then set the three timeouts, and read [email bombing and registration abuse](/docs/security/email-abuse/) before these forms start sending again.

Debugging a relay once is a reasonable afternoon; doing it after every upgrade is not. Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with the upgrade path and the plumbing underneath it already handled, so [start a trial](https://dash.phasetwo.io/) and stop debugging this yourself.
