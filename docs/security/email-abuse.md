---
id: email-abuse
title: Email Bombing and Registration Abuse
description: How Keycloak's forgot-password, verify-email, and registration flows become an email bombing tool, and how to stop bot signups and fake registrations.
---

Any Keycloak flow that sends mail to an address the caller typed can be turned into an email bombing tool: the attacker scripts the forgot-password or registration form and makes your SMTP server deliver mail to a victim, or runs up your sending bill and wrecks your sender reputation. The same unauthenticated registration form lets a bot create thousands of fake accounts. This page covers which requests make Keycloak send mail, which of them it throttles (few), and how to stop bot signups and fake registrations before they cost you deliverability. Every Keycloak behavior described here was reproduced on Keycloak 26.8.1, with a local SMTP sink counting the messages.

## Which unauthenticated requests make Keycloak send mail

Three flows reachable without logging in cause mail to be sent. A fourth, admin-triggered path is included for contrast.

| Request | Trigger | Mail sent | Built-in throttle |
|---|---|---|---|
| Reset credentials (forgot password) | `POST /realms/{realm}/login-actions/reset-credentials` with a username or email | One email per existing address, every time | **None** |
| Verify email after registration | Following the post-registration redirect to the Verify Email required action | One email per account | A per-session cooldown (about 30 seconds) on *resends* only |
| Resend verification | The "resend" link on the verify-email page | One email, then blocked by the cooldown | Yes, per authentication session |
| Magic link / Email OTP | A login flow step that emails a code or link, if you configure one | One email per step entry | Email OTP suppresses a duplicate within the same session; no cross-session cooldown |
| Execute-actions email | `PUT /admin/realms/{realm}/users/{id}/execute-actions-email` | One email | Admin-only; not reachable unauthenticated |

The dangerous one is reset credentials. It has no cooldown, no CAPTCHA, and no rate limit of its own.

## How bad is the forgot-password path?

We scripted the forgot-password flow against one existing address on 26.8.1: open the login page, follow the "Forgot password" link, post the username. Each request returned HTTP 200 with the fixed message *"You should receive an email shortly with further instructions,"* and each produced one message in the SMTP sink.

- 100 requests from fresh sessions completed in about 4.6 seconds single-threaded (~22 requests per second) and sent 100 emails to the one address. That is an email bomb: a victim's inbox flooded with real password-reset mail from your domain.
- Reusing one session did not help the defender: 20 requests in a single session sent 20 emails. There is no per-session suppression.
- A request for an address that is not a user returned the same HTTP 200 and the same message, and sent nothing (the server logged `RESET_PASSWORD_ERROR` / `user_not_found`). So the confirmation does not leak who exists, but the attacker only needs a list of real addresses to make your server mail every one of them on demand.
- The email is sent even when the target account is unverified, and even when brute force detection has locked it. There is no realm setting to restrict password reset to already-verified emails; the `Send Reset Email` step exposes only a `force-login` option.

## How many fake accounts can a bot create?

With self-registration on and no CAPTCHA, the registration form is an open account factory. Scripting the registration POST on 26.8.1 created 52 accounts in under two seconds (~26 per second, single-threaded). Two details matter for email abuse specifically:

- **The registration POST itself sends no mail.** The verify-email message is sent only when the client follows the redirect to the Verify Email required action. A bot that just wants accounts never follows it, so it creates accounts without sending any email at all.
- **A bot that does want to send mail gets one message per new account.** Keycloak's core Verify Email action throttles *resends* to roughly one per 30 seconds per session (we saw *"You must wait 29 seconds before resending the verification email"*), but nothing stops the bot from registering a new account for each email it wants to send.

Fake accounts are not only an email problem. They pollute your user count, consume per-user resources, and in a realm with [organizations](/extensions/organizations/) or self-service can reach features you did not mean to expose to anonymous signups.

## Prevent

### Put a CAPTCHA in front of every mail-sending step

A CAPTCHA that is checked only in the browser is useless here, because the attack scripts post the form directly and never render the widget. The control has to fail closed: a request without a valid token must be rejected.

- **Registration.** Keycloak's built-in [reCAPTCHA](./recaptcha.md) is a registration form action and rejects a submission with a missing or invalid token. It covers registration only. Add it, or the Phase Two [Cloudflare Turnstile](./turnstile.md) registration form action, to the registration flow.
- **Login and email-sending steps.** Core Keycloak has no login CAPTCHA. The Turnstile standalone step does reject a submission without a valid token, and because it does not need to know who the user is, you can place it *before* any step that sends mail — a magic link, an Email OTP, or the username form that precedes a reset. See [the standalone step in Cloudflare Turnstile](./turnstile.md). This is the one built-in way to gate the forgot-password and magic-link paths with a CAPTCHA that blocks.

Whatever CAPTCHA you choose, test that it fails closed before you rely on it, exactly as in [Test that the CAPTCHA fails closed](./recaptcha.md#test-that-the-captcha-fails-closed). A CAPTCHA that logs a failure but lets the request through protects nothing.

### Turn off what you do not use

- **Disable self-registration** if your users are provisioned some other way (SSO, admin API, [user migration](/docs/keycloak/idp/)). With `registrationAllowed` off, the registration form is gone and the account-factory and its verify-email mail disappear with it.
- **Disable password reset** on realms where it has no legitimate use. With `resetPasswordAllowed` off, the "Forgot password" link is not rendered and the reset-credentials flow is unavailable, which removes the email bomb entirely. On 26.8.1 the link disappeared from the login page as soon as we turned the setting off.

Both are trade-offs against usability: without self-service reset, a locked-out user needs an administrator. Make the call per realm.

### Rate-limit the mail-sending endpoints at the edge

Because Keycloak does not throttle reset credentials itself, a volume control has to live in front of it. Per-IP [rate limiting](./rate-limiting.md) stops a single source from firing hundreds of reset requests, which is the shape of a basic email bomb. It does far less against a campaign spread across many addresses, each sending a few requests — the same limitation that makes per-IP limits weak against [credential stuffing](./credential-stuffing.md) and [password spraying](./password-spraying.md). For distributed floods aimed at your mail pipeline, you need a layer that can see request patterns across sources: bot management or a CDN with abuse controls, the category discussed in [Layer 7 floods](./layer-7-floods.md).

### Protect your sender reputation and quota

An email bomb costs you even when the victim is someone else's user. Every message your server sends to an address that did not ask for it is a spam complaint waiting to happen, and enough of them get your sending domain throttled or blocklisted — at which point your real password-reset and verification mail stops arriving.

- Send through an SMTP provider that enforces its own per-recipient and per-account rate limits and maintains a suppression list, so a burst is capped and repeated bounces or complaints stop delivery automatically.
- Watch your bounce and complaint rates. A spike is often the first sign of registration or reset abuse, before you notice it anywhere else.
- Keep SPF, DKIM, and DMARC aligned on your sending domain. They do not stop abuse, but they keep your legitimate mail deliverable while you deal with it, and a DMARC report stream is another place abuse shows up.

### A note on SMS

Keycloak has no built-in SMS sending, so there is no out-of-the-box "SMS pumping" surface (an attacker driving premium-rate SMS traffic through a victim's account). If you have added an SMS authenticator through an extension, the same reasoning applies: gate it with a CAPTCHA that fails closed, rate-limit it, and use a provider with spend controls.

## Detect

- **Watch the SMTP side, not just Keycloak.** A jump in messages sent, bounces, or complaints at your mail provider is the clearest signal of a reset or verification bomb. Keycloak's own logs show `SEND_RESET_PASSWORD` and `SEND_VERIFY_EMAIL` events, and `RESET_PASSWORD_ERROR` with `user_not_found` for reset attempts against addresses that are not users — a burst of those means someone is probing your reset endpoint with a list.
- **Watch registration volume.** A spike in `REGISTER` events, especially from few source addresses or with throwaway email domains, is bot signups. Save events so you can see it; on a self-hosted realm, event saving is off by default (see the Detect section of [Credential Stuffing](./credential-stuffing.md)).

## Respond

1. **Gate the abused flow.** Add the Turnstile standalone step before the mail-sending step, or the registration CAPTCHA, and confirm it fails closed. Everything else is cleanup while the path stays open.
2. **Throttle or suppress at the mail provider** so in-flight bombs stop reaching the victim and your reputation stops bleeding.
3. **Clean up fake accounts.** Query `REGISTER` events for the abuse window and delete the accounts created, or disable them, through the Admin API.
4. **Check your sending reputation** after the burst — your provider's deliverability dashboard, and whether your domain landed on any blocklist — and request delisting if needed.

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| A web application firewall with per-IP [rate limits](./rate-limiting.md) by tier in front of your cluster | A CAPTCHA that fails closed on every mail-sending step. The [Cloudflare Turnstile](./turnstile.md) standalone and registration steps are included in every cluster and are off until you configure them |
| Registration, reset, and send events captured into the Phase Two [audit log](/docs/audit-logs), independent of your realm's event settings | Whether self-registration and password reset are on at all, per realm |
| [Metrics](../self-service/metrics.md) and [logs](../self-service/logs.md) in the dashboard to spot volume spikes | Your SMTP provider and its rate limits, suppression list, and SPF/DKIM/DMARC |
| [IP restrictions](../self-service/restrictions.md) for public paths on Enterprise | Monitoring your own sender reputation, bounce, and complaint rates |
| Help during an incident: email [support@phasetwo.io](mailto:support@phasetwo.io) | Cleaning up fake accounts after an abuse run |

For bot management and distributed email floods, you need a tool category Keycloak and a per-IP WAF do not cover: a CDN or bot-management service such as Cloudflare, Akamai, or AWS WAF with bot controls.

## Related

- [Credential Stuffing and Account Takeover](./credential-stuffing.md)
- [Cloudflare Turnstile](./turnstile.md) and [Keycloak reCAPTCHA](./recaptcha.md)
- [Rate Limiting](./rate-limiting.md) and [Layer 7 floods](./layer-7-floods.md)
- [Username Enumeration](./username-enumeration.md)
- [Securing Keycloak in production](./index.md)
