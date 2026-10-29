---
id: phishing-resistant-login
title: Phishing-Resistant MFA in Keycloak vs Evilginx
description: How adversary in the middle phishing proxies like Evilginx defeat OTP codes on a Keycloak login, and why passkeys are phishing-resistant MFA that stops them.
---

An adversary in the middle (AitM) phishing proxy, such as Evilginx and the kits built like it, sits between your user and your real Keycloak login page. The user sees your genuine login page, served through a lookalike domain. They type their password and their TOTP or email code, the proxy passes both to Keycloak, and when the login succeeds the proxy keeps the session cookies. One-time codes do not stop this, because the user enters them into the proxy, which forwards them in real time. Phishing-resistant MFA in Keycloak means WebAuthn and passkeys, because the browser binds the credential to your domain and will not use it on the attacker's.

This page explains what the proxy takes, which factors survive it, how to make passkeys the path that matters, and what to set so a stolen session is worth less. Every Keycloak behavior described here was reproduced on Keycloak 26.8.1. The WebAuthn origin checks are stated from the WebAuthn specification and were not reproduced with a live proxy. We did not run a phishing tool.

## What an AitM proxy takes from a Keycloak login

A reverse proxy phishing kit does not fake your login page. It fetches the real one from Keycloak, rewrites links so the browser stays on the lookalike domain, and relays every request and response. From Keycloak's point of view the proxy is just a browser.

The proxy ends up with three things:

- **The password**, read from the form post as it passes through.
- **Any one-time code**: TOTP, email OTP, or SMS. The code is valid because the real user generated it a few seconds earlier, and the proxy uses it at once.
- **The session cookies** Keycloak sets after login. In 26.8.1 a browser login sets these on the realm path (`/realms/{realm}/`):

| Cookie | Attributes in 26.8.1 | What it is |
|---|---|---|
| `AUTH_SESSION_ID` | `Secure; HttpOnly; SameSite=None` | The in-progress login. Set when the login page loads. |
| `KEYCLOAK_IDENTITY` | `Secure; HttpOnly; SameSite=None`, no `Max-Age` unless remember-me is on | The SSO session. This is the one that signs the user in. |
| `KEYCLOAK_SESSION` | `Secure; SameSite=None; Max-Age` equal to SSO Session Max (36000 seconds by default), not `HttpOnly` | Session identifier readable by scripts for session status checks. |

The session cookie is the prize. In testing, copying `KEYCLOAK_IDENTITY` alone into a different HTTP client, with a different user agent, and sending an authorization request with `prompt=none` returned an authorization code for the user. Nothing ties the session to the browser, device, or IP address that created it. The attacker can sign in to every application in the realm until the SSO session ends, without the password and without a second factor.

### What the cookie attributes do and do not protect

`Secure`, `HttpOnly` and `SameSite` protect against other attacks: `HttpOnly` stops injected script from reading `KEYCLOAK_IDENTITY`, `Secure` keeps cookies off plain HTTP, and `SameSite` limits which cross-site requests carry them.

None of these stop an AitM proxy. The proxy is not script on your page and does not need to read cookies from the browser. It is the server the browser is talking to, so it sees every `Set-Cookie` header from Keycloak in the response before the browser does. `KEYCLOAK_SESSION` not being `HttpOnly` does not matter here either way.

## Which factors stop an AitM proxy

| Factor | Survives an AitM proxy? | Why |
|---|---|---|
| Password | No | Typed into the proxied page and forwarded. |
| TOTP (authenticator app) | No | The user reads the code from their phone and types it into the proxied page. The proxy replays it within its validity window. |
| Email OTP | No | Same as TOTP. The code arrives by email and is typed into the proxied page. |
| SMS code | No | Same as TOTP, plus SIM-swap risk. Not built into Keycloak; it needs an [extension](../authentication/otps.md#sms-otp). |
| Push approval | Usually no | The user approves a login that the proxy started. Number matching helps against push fatigue, not against a proxy, because the proxy shows the user the number. Not built into Keycloak. |
| Magic link, standard | Mostly yes, but weak | See below. The link goes to the real domain, so the session is created in the browser that opens it, not in the proxy. |
| Magic link continuation | No | See below. The login completes on the page that started it, which is the proxied page. |
| WebAuthn security key or passkey | Yes | The browser binds the credential to your domain and the origin it is used from, and Keycloak checks both. |

### Magic links

Magic links come from the Phase Two magic link extension ([Magic Links](../authentication/magic-links.md)). The extension has two variants, and they behave differently against a proxy. We worked this out from the extension's source and documentation. It was not reproduced, because it needs real email delivery.

- **The standard magic link** creates the session on the device where the link is clicked. The link in the email points at your real Keycloak hostname, not the lookalike, so clicking it signs in the user's own browser and leaves the proxy's login unfinished. That protects against the relay. It is still a bearer link in an inbox, so anyone who can read the mailbox can use it, and a phishing page can ask the user to paste it.
- **Magic link continuation** keeps the login on the original page. That page polls Keycloak every few seconds until the link is clicked, then completes the login there. Under an AitM proxy, the original page is the proxied one, so the click completes the attacker's login. Do not use continuation where AitM phishing is in your threat model.

Neither variant counts as phishing-resistant MFA. The standard link avoids the relay, but its security depends on the mailbox.

## Why WebAuthn and passkeys resist phishing

A WebAuthn credential, whether a passkey or a hardware security key, is created for one relying party ID (RP ID), which is a domain such as `auth.example.com`. Two checks then stop a lookalike domain, one in the browser and one in Keycloak. These are requirements of the [W3C Web Authentication specification](https://www.w3.org/TR/webauthn-2/), not something we measured with a live proxy.

1. **The browser will not use the credential on another domain.** A page can only request credentials for an RP ID that is its own domain or a parent of it (WebAuthn Level 2, section 5.1.4.1). A page on `auth-example.login-portal.test` cannot request `auth.example.com` credentials, so the user's passkey is not offered there at all.
2. **Keycloak checks the origin and the RP ID in the signed response.** The browser writes the page's origin into `clientDataJSON`, and the authenticator signs it together with a hash of the RP ID. The server must reject the assertion if the origin or the RP ID hash does not match what it expects (section 7.2). If the proxy registers or requests a credential under its own domain, the result does not match your realm.

The user cannot override either check by being fooled. That is the difference from OTP codes, where the user is the only check and the lookalike domain is designed to beat them.

### The WebAuthn policy settings that matter

Both WebAuthn policies (**Authentication → Policies → Webauthn Policy** and **Webauthn Passwordless Policy**) have these settings. The defaults in a new 26.8.1 realm:

| Setting | Default | What to do |
|---|---|---|
| Relying Party ID | Empty, which means Keycloak's hostname | Leave it empty, or set it to your login domain or a parent you control. Decide before users enroll, because credentials are bound to it at registration. See [Custom Domains](../self-service/custom-domains.md). |
| Extra Origins | Empty | Add only origins you own, such as an Android app origin. Every origin listed here is accepted in the origin check. Never add a domain you don't control. |
| User Verification Requirement | `not specified` (2FA policy), `required` (passwordless policy) | Keep `required` for passwordless. User verification is about the person holding the device, not about phishing. |
| Attestation Conveyance Preference | `not specified` | Only needed if you restrict which authenticator models may register. Not required for phishing resistance. |

### Set the hostname

Keycloak computes its own origin from its hostname. In testing with no `--hostname` set, the issuer in `.well-known/openid-configuration` followed whatever `Host` header the request carried, including a lookalike name. With `--hostname` set, the issuer stayed fixed regardless of the `Host` header. Run production Keycloak with an explicit hostname (or `hostname-strict` left on), so the origin Keycloak expects is your domain and not one a proxy supplied.

## Make passkeys the path that counts

Turning on passkeys adds a phishing-resistant option. It does not remove the phishable ones, and an AitM proxy controls what the user sees. It can hide the passkey button, show only the password field, or click **Try another way** to reach an OTP step. If a user can still sign in with a password and a code, the proxy can steer them to that path. Phishing resistance is only as strong as the weakest method an account can use.

For the setup itself, see [Passkeys](../authentication/passkeys.md), [WebAuthn](../authentication/webauthn.md), and the step-by-step [Passkeys and WebAuthn tutorial](/tutorials/authentication/passkeys-webauthn). The decisions that matter for phishing:

- **Start with the accounts worth phishing.** Administrators, support staff who can reset other users, and anyone with access to sensitive data. Bind those users to a flow where WebAuthn is required, rather than an alternative to OTP.
- **Close the fallbacks for those accounts.** Remove OTP as an alternative in their flow, and remove the password once they have a working passkey and a second one registered. Keep account recovery behind a process that is not just another phishable code, for example a support-verified reset.
- **Ask users to register two passkeys**, or a passkey and a security key, so losing one device does not push them back to a password.
- **Turn off the password grant.** Direct grant has no WebAuthn step, so a phished password still works there. See [Credential Stuffing](./credential-stuffing.md) and [Client Policies](./client-policies.md).
- **Use step-up for sensitive actions.** Applications can request a higher level of authentication with `acr_values` and a flow that requires WebAuthn for that level, so a password session can read but not change things.

## Reduce what a stolen session is worth

A phishing-resistant factor stops the proxy getting a session. For users who still sign in with phishable factors, these settings limit what the attacker does with one. Lifespans and revocation are covered in [Tokens and Sessions](./tokens-and-sessions.md).

- **Shorten SSO Session Idle and Max.** The defaults are 30 minutes and 10 hours. The cookie works until the session ends or is revoked.
- **Require recent authentication for credential changes.** When an application sends a user to change their password or register a credential with `kc_action` (for example `kc_action=UPDATE_PASSWORD`), Keycloak checks the required action's **Maximum Age of Authentication** (`max_auth_age`, default 300 seconds). In testing with it set to 5 seconds, a replayed session cookie went straight to the change-password page immediately after login, and got the login form once 5 seconds had passed. The default means a session captured at login can change the password without re-authenticating for five minutes, and a proxy captures it at login. Lower it to a value close to zero for `UPDATE_PASSWORD`, and check the same setting on the credential registration actions you use: `webauthn-register-passwordless` has it too.
- **Re-authenticate before sensitive actions in your application.** Send an authorization request with `prompt=login` or `max_age=0`. In testing, both showed the login form even with a valid session cookie, then check `auth_time` in the returned ID token. Re-authentication only helps if it asks for a factor the proxy cannot relay. If it asks for a password again and the user is still on the proxied page, the proxy relays that too.
- **Revoke sessions when you suspect phishing.** End the user's sessions and offline sessions as described in [Credential Stuffing](./credential-stuffing.md). Changing the password does not end existing sessions.

## Detect

Keycloak cannot see the proxy, but it records what the proxy does.

- **A `LOGIN` event's IP address is the proxy's.** For a proxied login, the address recorded is the proxy's server, typically a hosting provider, not the user's network. Logins for many different users from one hosting-provider address in a short window are a strong signal.
- **Session reuse looks like a normal login.** In testing, a `LOGIN` event produced by a replayed `KEYCLOAK_IDENTITY` cookie had exactly the same details as one produced by typing the password. You cannot filter for replays by event details. Compare IP addresses over time, using events and the user sessions list (`GET /admin/realms/{realm}/users/{id}/sessions`, which shows each session's IP, start and last access): the same user appearing from two networks within minutes is the signal.
- **Watch for credential changes right after login**, such as `UPDATE_PASSWORD`, `UPDATE_TOTP`, or a new WebAuthn registration from the same address that just signed in. Attackers register their own factor to keep access.

Saving events is off by default on a self-hosted realm. Turn it on, as described in [Credential Stuffing](./credential-stuffing.md), and see [Detecting Attacks](./detecting-attacks.md).

## Where Keycloak stops

Keycloak protects the login it serves. It cannot see a lookalike domain, an email, or the user's browser. These defenses belong to other tools:

- **Lookalike-domain monitoring and takedown.** Certificate Transparency monitoring catches certificates issued for names like yours, and brand-protection or takedown services handle reporting the site to the registrar and host.
- **Email security.** Most AitM campaigns start with an email. Inbound filtering in your email provider, and SPF, DKIM and DMARC on your own domains so attackers cannot send as you.
- **Browser and endpoint protections.** Browser safe-browsing lists, managed browser policies, and password managers, which will not autofill on a lookalike domain.
- **A consistent, recognizable login domain.** Users learn the address they sign in on. Serving login from your own domain, rather than a vendor domain, gives them one name to recognize. See [Custom Domains](../self-service/custom-domains.md).

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| WebAuthn and passkeys in every cluster, as in standard Keycloak | The WebAuthn policies, which users must use passkeys, and the flows that close their fallbacks |
| [Custom domains](../self-service/custom-domains.md) for your login page | Which domain hosts login, decided before users enroll passkeys |
| The [Magic Links](../authentication/magic-links.md) extension in every cluster | Whether to use magic links, and which variant |
| Event capture into the Phase Two [audit log](/docs/audit-logs), independent of your realm's event settings, plus [logs](../self-service/logs.md) and [metrics](../self-service/metrics.md) in the dashboard | Session lifespans, `max_auth_age` on required actions, and re-authentication in your applications |
| A web application firewall with per-IP [rate limits](./rate-limiting.md) by tier, and [IP restrictions](../self-service/restrictions.md) for `/admin` paths on Premium and Enterprise | Lookalike-domain monitoring, takedown, and email security, which sit outside Keycloak |
| Help during an incident: email [support@phasetwo.io](mailto:support@phasetwo.io) | Revoking sessions and resetting credentials for phished users |

## Related

- [Passkeys](../authentication/passkeys.md) and [WebAuthn](../authentication/webauthn.md)
- [Passkeys and WebAuthn tutorial](/tutorials/authentication/passkeys-webauthn)
- [Tokens and Sessions](./tokens-and-sessions.md)
- [Credential Stuffing and Account Takeover](./credential-stuffing.md)
- [Securing Keycloak in production](./index.md)
