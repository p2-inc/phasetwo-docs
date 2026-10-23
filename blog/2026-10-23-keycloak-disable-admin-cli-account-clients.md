---
slug: keycloak-disable-admin-cli-account-clients
title: "Should you disable admin-cli and account in a production Keycloak realm?"
date: 2026-10-23
authors: [rtufisi]
tags: [keycloak, security, authentication, production, clients]
description: Disabling Keycloak's built-in clients is mostly the wrong lever. Turn off Direct Access Grants everywhere, remove what each client actually exposes, and put a CAPTCHA in front of the flows bots hit. Measured on Keycloak 26.8.1.
keywords:
  - keycloak admin-cli disable
  - keycloak account client security
  - keycloak direct access grants
  - keycloak credential stuffing
  - keycloak cloudflare turnstile captcha
---

Mostly no, and the question points at the wrong lever. Every Keycloak realm ships with the same six client IDs, so the first thing an automated attacker does after finding `/realms/<name>/.well-known/openid-configuration` is post `grant_type=password&client_id=admin-cli` to the token endpoint and read the error. The probe costs nothing, it arrives from a different IP every time, and with LLM-driven tooling the follow-up is a dictionary run that adapts to whatever your realm answers. The exposure is not that `admin-cli` *exists*. It is that `admin-cli` is a public client with **Direct Access Grants** on and full scope on, and any other client configured that way is exactly as dangerous. Turning the password grant off everywhere is mandatory. Disabling clients is a secondary, case-by-case call, and for `account` it is usually the wrong one.

Everything below was reproduced against **Keycloak 26.8.1**, and every error string is copied out of a real response.

<!-- truncate -->

## What the probe sees

One request, `POST /realms/prod/protocol/openid-connect/token` with `grant_type=password`, `client_id=admin-cli` and a wrong password, against four states of the same realm:

| Realm state | Response | What the attacker learns |
|---|---|---|
| Defaults | `400 {"error":"invalid_grant","error_description":"Invalid user credentials"}` | Password grant is live. Start the dictionary. |
| Direct Access Grants off on `admin-cli` | `400 {"error":"unauthorized_client","error_description":"Client not allowed for direct access grants"}` | Client exists, door shut. Try the other five IDs. |
| `admin-cli` disabled | `401 {"error":"invalid_client","error_description":"Invalid client or Invalid client credentials"}` | Same answer as a client that never existed. |
| Client policy rejecting the grant | `400 {"error":"invalid_grant","error_description":"resource owner password credentials grant is prohibited."}` | No client here takes a password. Move on. |

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

- **Reject the password grant with a client policy.** A client profile with the `reject-ropc-grant` executor, *Auto-configure* on, bound to a policy with the `any-client` condition. Every client then answers `resource owner password credentials grant is prohibited.`, and any client created or updated afterwards has Direct Access Grants switched off for you. Set *Auto-configure* explicitly: left unset, client creation fails with a null pointer on 26.8.1. The same executor ships inside the built-in `oauth-2-1-for-public-client` and `oauth-2-1-for-confidential-client` profiles.
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

`security-admin-console` is a bigger surface than either client above: in a non-master realm it is the realm-scoped admin UI at `/admin/<realm>/console/`, public, PKCE, Full scope allowed on. If no realm-scoped administrator uses it, disable it; the login redirect then renders Keycloak's `Client disabled.` page. Otherwise keep it and block the path at the edge.

`realm-management` and `broker` are bearer-only role containers. There is no flow to attack, and the admin roles and the broker `read-token` role hang off them. Leave them alone.

## Rate limiting is not enough: put a CAPTCHA in the flow

Per-IP limits assume the attacker has an IP. Per-user lockout assumes they want one user. Credential stuffing today has neither property, which is why a CAPTCHA earns its place: it taxes the automation, not the address. Keycloak's built-in reCAPTCHA only covers [registration](/docs/security/recaptcha), so for login you need an extension. The [Cloudflare Turnstile integration](https://github.com/p2-inc/keycloak-magic-link/blob/main/README.md#cloudflare-turnstile-captcha) in our open-source `keycloak-magic-link` extension is the one we recommend and ship on every Phase Two cluster. It is three authenticators sharing one configuration (site key, secret, action), which is what makes it a flow edit rather than a project:

- **Cloudflare Turnstile Username Password Form** replaces the stock login form with the widget embedded in the page. Unconfigured, it behaves exactly like the original. Its *Verify email on CAPTCHA failure* option turns a failed challenge into a forced email verification instead of a hard block, so a real user on a flaky network still gets in and a bot does not.
- **Condition - Turnstile Failed** gates a 2FA subflow on the CAPTCHA result: Required means only sessions that failed the challenge are asked for a second factor, Disabled means 2FA for everyone with a factor enrolled. Adaptive friction from one requirement toggle.
- **Cloudflare Turnstile validation** is a standalone challenge page to place before any step that sends email, such as magic link or email OTP, so bots cannot turn your SMTP relay into a flood.
- **The registration form action** validates the challenge on sign-up and skips it for users who are already identified, so invitations keep working while bulk account creation, and the abusive takeovers that follow it, stop.

Setup is two settings: `https://challenges.cloudflare.com` in `frame-src` under *Security Defenses*, and the `cloudflare-turnstile` login theme on the realm or one client. No image puzzles, which matters when the people solving it are your customers.

This closes the loop with the first section. A CAPTCHA protects flows that render a page. The token endpoint renders nothing, so with the password grant enabled an attacker simply takes the path without one. The two controls only work together.

## The checklist

| Client | Default | Production |
|---|---|---|
| `admin-cli` | public, password grant on, full scope on | Password grant off, policy-enforced. Disable in non-master realms once nothing uses it. |
| `security-admin-console` | public, PKCE, full scope on | Disable where no realm-scoped admins exist, or block `/admin/*` at the edge. |
| `account` | public, role container, API audience | Keep enabled. Remove `manage-account` and `manage-account-links` from default roles if self-service is unwanted. |
| `account-console` | public, PKCE | Disable or deny-flow when self-service is unwanted. |
| `realm-management`, `broker` | bearer-only | Leave alone. |
| Your application clients | whatever you clicked | Password grant off, full scope off, PKCE, Turnstile on login and registration. |

---

All of this fits in a realm export you keep in version control. If you would rather start from a realm configured this way, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with Turnstile, magic links and admin-path restrictions included, and a 30-day Starter trial from $149/month. Self-hosting is the right call for plenty of teams: the [production readiness checklist](/blog/keycloak-production-checklist) covers the server-side settings next to these, [brute force detection](/docs/security/brute-force-detection) covers the per-user side, and [the WAF question](/blog/waf-keycloak) covers what belongs at the edge. The [go-live checklist](/docs/getting-started/launch-checklist) is where it all lands before launch.
