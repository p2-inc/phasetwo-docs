---
id: index
title: Securing Keycloak in Production
description: Keycloak security hardening as a threat model. Every common attack on a production realm, what Keycloak covers, what you configure, and where you need another tool.
---

Securing Keycloak in production means closing every path a login can take, not only the login page your users see. Keycloak ships the controls for most attacks against an identity provider, but many of them are off by default, a few only work in combination, and some attacks are outside what any identity server can stop on its own. This page is the map: each common attack on a public Keycloak realm, what Keycloak does about it by default, what you have to configure, where you need another tool, and the page that goes deeper.

It draws on incidents we have worked on with customers. Behavior described in this section was reproduced on Keycloak 26.8.1.

## What attacks on a public realm look like

Once a realm is reachable from the internet, automated scanners find it, usually within days. What follows is rarely a vulnerability in Keycloak. It is the realm's own defaults, used at scale:

- **Scripts, not browsers.** Attack traffic posts straight to the login and token endpoints and never renders a page, so it never runs JavaScript and never produces a CAPTCHA token. A control that only works in the browser is a control the attacker never sees.
- **Leaked passwords, one try per account.** Most campaigns replay email and password pairs leaked from other sites, from a pool of addresses that changes every few attempts. Per-user lockout and per-IP rate limits each see too little of it to trigger.
- **Every way in, in turn.** Every realm has the same built-in clients, so the attacker knows their IDs in advance. When one path is closed, the same campaign shows up on the next within hours: an application client, then the password grant on `admin-cli`, then `account-console`, then `security-admin-console`. A realm is only as protected as its least protected client.
- **Failures are loud, takeovers are quiet.** Failed logins flood the log. The logins that worked do not appear in it at all by default, and only the event store shows them.

## Threats, defenses and gaps

The core of this section. For each threat: what Keycloak gives you, what you have to turn on, and what it cannot do.

| Threat | Keycloak by default | What you configure | Where you need another tool | Go deeper |
|---|---|---|---|---|
| Credential stuffing | Same error for unknown user and wrong password | Reject the password grant with a client policy, a CAPTCHA that fails closed on every browser flow, brute force detection, event storage | Bot management at the edge for very large campaigns | [Credential Stuffing and Account Takeover](./credential-stuffing.md) |
| Password spraying | Nothing; brute force detection is off | Brute force detection, a CAPTCHA, an interim gate on the direct grant flow | Distributed-attack detection across accounts | [Password Spraying](./password-spraying.md) |
| Brute force against one account | Nothing; off by default | Brute force detection, and a plan for lockout being used against you | — | [Brute Force Detection](./brute-force-detection.md) |
| Layer-7 login floods | Every login costs a full password hash | An HTTP queue limit, a CAPTCHA checked before the password, sizing | A WAF with rate rules; bot management | [Layer-7 Floods](./layer-7-floods.md) |
| Volumetric DDoS | Nothing an application server can do | — | A CDN or DDoS scrubbing service in front of the cluster | [Layer-7 Floods](./layer-7-floods.md) |
| Email bombing and bot signups | No throttle on password reset: in testing, 100 requests sent 100 emails in under five seconds. Registration is open to scripts once enabled | A CAPTCHA before every step that sends email, CAPTCHA on registration, self-registration off if unused | Bot management; your email provider's rate limits | [Email Abuse](./email-abuse.md) |
| Username enumeration | Login gives the same response and timing for known and unknown users. Registration says when a username or email exists | Reset and registration settings, a username-first flow with care | — | [Username Enumeration](./username-enumeration.md) |
| Phishing proxies (adversary in the middle) | TOTP and email codes can be relayed | Passkeys or WebAuthn, short SSO idle times, re-authentication for sensitive actions | Lookalike-domain monitoring and takedown | [Phishing-Resistant Login](./phishing-resistant-login.md) |
| Breached passwords | Policies are checked only when a password is set | A password blacklist, refreshed on a schedule | A breached-password service at registration and password change | [Credential Stuffing](./credential-stuffing.md) |
| Stolen tokens and session cookies | Five-minute access tokens. Refresh token rotation is off, and logout does not recall an access token already issued | Lifespans, refresh token rotation, DPoP, offline access only where needed | — | [Tokens and Sessions](./tokens-and-sessions.md) |
| OAuth protocol attacks | `iss` in every authorization response and framing headers on. Wildcard redirect URIs, PKCE `plain` and refresh token reuse are all allowed | Client policies for PKCE, no implicit or password grants, client authentication | — | [RFC 9700 for Keycloak](./oauth-security-bcp.md) |
| Admin console exposure | `/admin` is served on the same hostname as login | Restrict `/admin` paths by network, disable unused built-in clients | A proxy or WAF rule if you self-host | [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md) |
| Clickjacking and framing | `X-Frame-Options: SAMEORIGIN` and a CSP with `frame-ancestors 'self'` | Keep them under **Realm Settings → Security Defenses**; widen only for origins you control | — | [RFC 9700 for Keycloak](./oauth-security-bcp.md) |
| Undetected takeovers | Events are not saved, and the log omits successful logins | Event storage with a long enough retention, login metrics | A SIEM or anomaly detection | [Detecting Attacks](./detecting-attacks.md) |
| Known vulnerabilities | Upstream security advisories with each release | Upgrade on a schedule and track advisories | — | [Keycloak release notes](/blog/keycloak-2681-released) |

## Which login paths a CAPTCHA can protect

A CAPTCHA only protects a request that comes from a rendered page. That rules it out for several of the paths an attacker will use, which is why rejecting or gating those paths matters as much as the CAPTCHA itself.

| Login path | Can a CAPTCHA apply? | The control that fits |
|---|---|---|
| Browser username and password | Yes, checked before the password | A CAPTCHA that fails closed, bound to the realm's default browser flow so built-in clients get it too |
| Username-first login | Yes, on the username step | The same, which also slows enumeration |
| Registration | Yes | A registration CAPTCHA |
| Reset password, magic link, email codes | Yes, as a step before the email is sent | A standalone CAPTCHA step |
| `account-console`, `security-admin-console` | Only if the CAPTCHA is in the realm's default browser flow | Disable unused clients, restrict `/admin` |
| Password grant (`grant_type=password`) | **No.** No page is rendered | Reject it with a client policy, or gate the direct grant flow until you can |
| Client credentials, token exchange, CIBA | **No.** No user password is involved | Confidential clients with strong client authentication, client policies |
| Refresh | Not needed; the request is already bound to a session | Refresh token rotation |

Edge rules can help with the browser paths, which carry `client_id` in the query string. On the token endpoint, `client_id` is in the `POST` body, which most edge rules cannot read, so blocking the password grant for one client at the edge does not work. Do it in Keycloak.

## What to do before go-live, in order

1. **Know your entry points.** List every client and which grant types it allows. [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md) maps which protections apply to which path, and [Which Keycloak clients should be enabled when you go live?](/blog/keycloak-disable-admin-cli-account-clients) covers the built-in ones.
2. **Reject the password grant realm-wide** with a [client policy](./client-policies.md), after moving backend services to [service accounts](../api/service-accounts.md). If a service still depends on it, [gate the direct grant flow](./password-spraying.md) in the meantime.
3. **Put a CAPTCHA that fails closed in the realm's default browser flow**, before the password, and before every step that sends email. See [Cloudflare Turnstile](./turnstile.md), and test it with a request that carries no token.
4. **Turn on brute force detection** and save login and lockout events with a retention longer than the time it would take you to notice an attack.
5. **Set token and session lifespans** deliberately, with refresh token rotation and offline access only for the clients that need it. See [Tokens and Sessions](./tokens-and-sessions.md).
6. **Offer passkeys**, which are the factor that holds up against phishing proxies. See [Passkeys](../authentication/passkeys.md).
7. **Restrict the admin paths** to your own networks.
8. **Decide where events go and who gets alerted.** See [Detecting Attacks](./detecting-attacks.md).

The full pre-launch list is the [Go-Live Checklist](../getting-started/launch-checklist.md). For the server-level half of a self-hosted deployment (hostname, proxy headers, TLS, probes, clustering), see the [Keycloak production readiness checklist](/blog/keycloak-production-checklist).

## Where Keycloak stops

Keycloak is an identity server, not a network edge or a security operations tool. Plan for these separately:

- **Volumetric DDoS protection.** Traffic that saturates the network or the load balancer never reaches Keycloak in a form it can refuse. Use a CDN or scrubbing service.
- **Bot management.** Telling a scripted browser from a person across many requests, beyond a CAPTCHA on one form, is an edge product.
- **Breached-credential intelligence.** Keycloak cannot know which passwords leaked elsewhere after they were set.
- **Detection and response.** Keycloak records events; it does not correlate them, score risk, or alert. Ship events to a SIEM or a monitoring stack that does.
- **Lookalike domains and phishing.** Passkeys make a phishing proxy fail at login, but finding and taking down the lookalike domain is outside the identity server.

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| A web application firewall in front of your cluster with per-IP [rate limits](./rate-limiting.md) by tier | Rejecting the password grant with a [client policy](./client-policies.md) |
| [IP restrictions](../self-service/restrictions.md) for `/admin` paths on Premium and Enterprise, and for public paths on Enterprise | A CAPTCHA in your browser flows. The [Cloudflare Turnstile](./turnstile.md) authenticators are included in every cluster and are off until you configure them |
| Event capture into the Phase Two [audit log](/docs/audit-logs), independent of your realm's event settings, plus [metrics](../self-service/metrics.md) and [logs](../self-service/logs.md) in the dashboard | [Brute force detection](./brute-force-detection.md), your [password policy](./password-policy.md) and [password blacklist](./password-blacklist.md) |
| A master realm that is not exposed to customers, and the server, proxy and TLS configuration | Which built-in clients stay on. Keep `security-admin-console` enabled on a hosted cluster; the dashboard's Console link signs in through it |
| A [SOC 2 Type II](/blog/soc-2-type-II-compliance) and [ISO 27001](/blog/iso-27001-certification) certified operation | Token and session lifespans, and passkeys for your users |
| Help during an incident: email [support@phasetwo.io](mailto:support@phasetwo.io) | Remediating affected accounts and notifying users |

### Guides

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
