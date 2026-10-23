---
slug: keycloak-disable-admin-cli-account-clients
title: "Which Keycloak clients should be enabled when you go live?"
date: 2026-10-23
authors: [rtufisi]
tags: [keycloak, security, authentication, production, clients]
description: Automated scanners probe every default Keycloak client the day your realm goes public. Which clients and grant types to leave on, which to turn off, and why disabling clients is mostly the wrong lever. Measured on Keycloak 26.8.1.
keywords:
  - keycloak admin-cli disable
  - keycloak go live clients
  - keycloak account client security
  - keycloak direct access grants
  - keycloak credential stuffing
  - keycloak cloudflare turnstile captcha
---

The day a Keycloak realm is reachable from the internet, automated scanners find it. They read `/realms/<name>/.well-known/openid-configuration`, try every client ID that ships with every realm against the token endpoint and the login pages, and start replaying username and password pairs leaked from other sites. The traffic arrives from a different residential IP on almost every request, so it looks nothing like one noisy attacker. What you are trying to stop is not a single brute-force run. It is account takeover through credential stuffing, plus the enumeration that tells an attacker which of your users exist.

So the go-live question is not "should I disable admin-cli?" It is "which clients, and which grant types, should be on at all?" The short answer: the password grant off on every client, enforced by policy; only the clients you actually use exposed; a CAPTCHA on every flow that renders a login page; and `account` left enabled. Disabling a client is one tool among several, and for `account` it is usually the wrong one.

Everything below was reproduced against **Keycloak 26.8.1**, and every error string is copied out of a real response.

<!-- truncate -->

## What the probe sees

This is the first request a scanner sends: `POST /realms/prod/protocol/openid-connect/token` with `grant_type=password`, `client_id=admin-cli` and a wrong password. Here is what it gets back from four states of the same realm:

| Realm state | Status and error | What the attacker learns |
|---|---|---|
| Defaults | `400` `invalid_grant`: "Invalid user credentials" | Password grant is live. Start the dictionary. |
| Direct Access Grants off on `admin-cli` | `400` `unauthorized_client`: "Client not allowed for direct access grants" | Client exists, door shut. Try the other five IDs. |
| `admin-cli` disabled | `401` `invalid_client`: "Invalid client or Invalid client credentials" | Same answer as a client that never existed. |
| Client policy rejecting the grant | `400` `invalid_grant`: "resource owner password credentials grant is prohibited." | No client here takes a password. Move on. |

The full body of the default response, for reference:

```json
{"error":"invalid_grant","error_description":"Invalid user credentials"}
```

A wrong password and an unknown username return the same body, so usernames do not leak. Which clients exist, and which accept passwords, does.

## admin-cli: the grant is the problem, not the client

Out of the box, `admin-cli` is the only built-in client with the password grant on:

| Client | Public | Direct Access Grants | Full scope allowed |
|---|---|---|---|
| `admin-cli` | yes | **on** | **on** |
| `security-admin-console` | yes | off | on |
| `account`, `account-console` | yes | off | off |
| `realm-management`, `broker` | bearer-only | off | off |

**It bypasses your browser flow.** The default direct grant flow is username, password, then a conditional OTP step that only fires for users with a TOTP device. Side by side with the browser flow on the same server:

```console
direct grant                       browser (forms subflow)
  Username Validation  REQUIRED      Username Password Form     REQUIRED
  Password             REQUIRED      Browser - Conditional 2FA  CONDITIONAL
  Conditional OTP      CONDITIONAL     Condition - credential   REQUIRED
    OTP                REQUIRED        OTP Form                 ALTERNATIVE
                                       WebAuthn Authenticator   DISABLED
                                       Recovery Codes           DISABLED
```

No WebAuthn, no passkeys, no CAPTCHA, none of the steps you added to the browser flow. A passkey-only user gets a token for a password alone. [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.4), the OAuth 2.0 Security Best Current Practice, says the password grant "MUST NOT be used" and "is not designed to work with two-factor authentication".

**It is the cleaner target for credential stuffing.** Brute force detection does cover the token endpoint, but it is per user. A spray of one guess per username per window, from a rotating pool of residential IPs, slides under per-user lockout and under per-IP limits at the proxy at the same time. Edge rate limiting is worth having; it is not what stops this.

**Disabling it does not shrink the Admin API.** Admin requests are authorized from the roles of the *user* behind the token, filtered by what the client may scope. A realm admin's `admin-cli` token carries no roles at all (it is a lightweight token) and still gets `200` from `/admin/realms/prod/users`. The same user through an application client with Full scope allowed on gets the same `200`, now with every `realm-management` role visible in `resource_access`. With Full scope allowed off on that client, the call returns `403`, and 26.8.1 logs a warning for every token issued with the switch on:

```console
WARN  [org.keycloak.protocol.oidc.endpoints.TokenEndpoint.full-scope-allowed] Client 'webapp' in the realm
'prod' has 'Full scope allowed' switch enabled. This client switch is deprecated and will be removed in the
future. Please update your client settings to disable the switch and configure needed roles, which this
client application needs, to the client role scope
```

So the hardening is per realm:

- **Reject the password grant with a [client policy](/docs/security/client-policies).** A client profile with the `reject-ropc-grant` executor, *Auto-configure* on, bound to a policy with the `any-client` condition. Every client then answers `resource owner password credentials grant is prohibited.`, and any client created or updated afterwards has Direct Access Grants switched off for you. Set *Auto-configure* explicitly: left unset, client creation fails with a null pointer on 26.8.1. The same executor ships inside the built-in `oauth-2-1-for-public-client` and `oauth-2-1-for-confidential-client` profiles.
- **Automation uses service accounts.** A confidential client, `client_credentials` only, with the specific `realm-management` roles it needs. A `provisioner` client holding only `manage-users` lists users with `200` and is refused on `/clients` with `403`, which is the shape a user-sync job should have. `realm-admin` belongs to people behind MFA, not to a secret in a pipeline.
- **Full scope allowed off** on every application client, enforced with the `full-scope-disabled` executor if you have many.
- **Non-master realms: disable `admin-cli`** once nothing runs `kcadm` against them. In master, keep it only while tooling depends on it and restrict `/admin/*` and `/realms/master/*` at the edge. On a Phase Two cluster, admin-path [IP restrictions](/docs/self-service/restrictions) do this and master is not exposed to customers.

## account and account-console: remove the roles, not the client

`account` is not a login surface. It is the audience and role container for the Account REST API: `/realms/prod/account/` accepts a token that carries `manage-account` or `view-profile` under `resource_access.account`, and users get those roles through `default-roles-<realm>`.

Disabling it does work as a kill switch; console and API both return `404 {"error":"account management not enabled"}`. It also has a side effect that changed in Keycloak 26. `execute-actions-email` and `send-verify-email` called without a `client_id` used to fail with `400 Client is not enabled`. Since 26.0.0 Keycloak creates a confidential client named `_system` on the fly and issues the email link against it:

```console
WARN  [org.keycloak.models.utils.SystemClientUtil] Client 'account' not available. Creating system client
'_system' for system operations
```

The reset email still arrives, and the next audit finds a client nobody created. If the goal is no self-service through Keycloak:

- **Disable `account-console`**, the PKCE public client behind the UI, or bind a Deny-access flow override to it as [Account Console](/docs/keycloak/account-console) describes.
- **Remove `manage-account` and `manage-account-links` from `default-roles-<realm>`.** Measured: reads of `/account/` still return `200` through `view-profile`, writes return `403`. Remove `view-profile` too and the token loses the `account` audience entirely, so every call returns `401`.

If you keep self-service, the residual risk is a hijacked session changing credentials. Require re-authentication for credential changes with `kc_action` and `max_age`, keep SSO idle short, and require the current password on password change.

## security-admin-console, realm-management, broker

`security-admin-console` is a bigger surface than either client above: in a non-master realm it is the realm-scoped admin UI at `/admin/<realm>/console/`, public, PKCE, Full scope allowed on. If no realm-scoped administrator uses it, disable it; the login redirect then renders Keycloak's `Client disabled.` page. Otherwise keep it and block the path at the edge. On a Phase Two cluster, keep it enabled: the dashboard's Console link signs in through it. Restrict `/admin/*` with [IP restrictions](/docs/self-service/restrictions) instead.

`realm-management` and `broker` are bearer-only role containers. There is no flow to attack, and the admin roles and the broker `read-token` role hang off them. Leave them alone.

## Rate limiting is not enough: put a CAPTCHA in the flow

Per-IP limits assume the attacker has an IP. Per-user lockout assumes they want one user. Credential stuffing today has neither property, which is why a CAPTCHA earns its place: it taxes the automation, not the address. Keycloak's built-in reCAPTCHA only covers [registration](/docs/security/recaptcha), so for login you need an extension. The [Cloudflare Turnstile integration](https://github.com/p2-inc/keycloak-magic-link/blob/main/README.md#cloudflare-turnstile-captcha) in our open-source `keycloak-magic-link` extension is the one we recommend. It is included in every Phase Two cluster and stays off until you add your own Cloudflare keys and place it in your flows; [Cloudflare Turnstile](/docs/security/turnstile) walks through it. It is three authenticators sharing one configuration (site key, secret, action), which is what makes it a flow edit rather than a project:

- **Cloudflare Turnstile Username Password Form** replaces the stock login form with the widget embedded in the page. Unconfigured, it behaves exactly like the original. On its own it does not block anything: it checks the challenge after the password is accepted and only records a failure on the session, so a scripted login with a valid password still gets tokens. Pair it with one of the next two steps. Its *Verify email on CAPTCHA failure* option is the other way to make it block: a failed challenge stops the login at email verification, at the cost of marking the account's email as unverified, real users included.
- **Condition - Turnstile Failed** gates a 2FA subflow on the CAPTCHA result: Required means only sessions that failed the challenge are asked for a second factor, Disabled means 2FA for everyone with a factor enrolled. Adaptive friction from one requirement toggle. Use a factor every user already has, such as email OTP. With an OTP Form step, a user who has no authenticator yet is sent to set one up, so an attacker holding the password enrolls their own.
- **Cloudflare Turnstile validation** is a standalone challenge page. Placed before the login form, it refuses a submission without a valid token outright, which is the simplest way to stop scripted logins. Place it before any step that sends email too, such as magic link or email OTP, so bots cannot turn your SMTP relay into a flood.
- **The registration form action** validates the challenge on sign-up, so bulk account creation, and the abusive takeovers that follow it, stop.

Setup is two settings: `https://challenges.cloudflare.com` in `frame-src` under *Security Defenses*, and the `cloudflare-turnstile` login theme on the realm or one client. No image puzzles, which matters when the people solving it are your customers.

This closes the loop with the first section. A CAPTCHA protects flows that render a page. The token endpoint renders nothing, so with the password grant enabled an attacker simply takes the path without one. The two controls only work together.

## Go-live defaults for every client

This is what each client should look like on the day you launch. The rest of the launch list is in the [go-live checklist](/docs/getting-started/launch-checklist).

| Client | Default | Production |
|---|---|---|
| `admin-cli` | public, password grant on, full scope on | Password grant off, policy-enforced. Disable in non-master realms once nothing uses it. |
| `security-admin-console` | public, PKCE, full scope on | Disable where no realm-scoped admins exist, or block `/admin/*` at the edge. On Phase Two, keep it and use IP restrictions. |
| `account` | public, role container, API audience | Keep enabled. Remove `manage-account` and `manage-account-links` from default roles if self-service is unwanted. |
| `account-console` | public, PKCE | Disable or deny-flow when self-service is unwanted. |
| `realm-management`, `broker` | bearer-only | Leave alone. |
| Your application clients | whatever you clicked | Password grant off, full scope off, PKCE, Turnstile on login and registration, placed so a failed challenge blocks. |

---

All of this fits in a realm export you keep in version control. If you would rather start from a realm configured this way, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with Turnstile, magic links and admin-path restrictions included, and a 30-day Starter trial from $149/month. Self-hosting is the right call for plenty of teams: the [production readiness checklist](/blog/keycloak-production-checklist) covers the server-side settings next to these, [brute force detection](/docs/security/brute-force-detection) covers the per-user side, and [the WAF question](/blog/waf-keycloak) covers what belongs at the edge. The [go-live checklist](/docs/getting-started/launch-checklist) is where it all lands before launch.
