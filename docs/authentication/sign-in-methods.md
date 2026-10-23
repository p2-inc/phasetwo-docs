---
id: sign-in-methods
title: Sign-in Methods, Grant Types and Clients
sidebar_label: Sign-in Methods and Grant Types
---

How a user signs in to Keycloak is decided by three things working together: the **grant type** an application uses to ask for tokens, the **client settings** that allow that grant, and the **authentication flow** Keycloak runs for it. Most security gaps we see in production come from a mismatch between the three: a protection is added to one flow, and an attacker uses a grant or a client that runs a different one.

This page lays out each piece and how they fit, so you can decide what to enable before you go live. The behavior described here was checked against Keycloak 26.8.1.

## Grant types

A grant type is the way a client asks the token endpoint for tokens. Each one is switched on per client, in the client's **Settings** tab under **Capability config**, and each one runs a different flow, or none at all.

| Grant type | Client setting that enables it | Flow that runs | User involved | Browser-flow protections apply? | Recommendation |
|---|---|---|---|---|---|
| Authorization code + PKCE | _Standard flow_ | Browser flow | Yes | Yes: CAPTCHA, OTP and other second factors, passkeys, identity provider redirects, required actions | The default for every interactive login, including single-page and mobile apps. Require PKCE on public clients. |
| Client credentials | _Client authentication_ on, plus _Service account roles_ | Client authentication flow only | No, the client acts as itself | Not applicable | The right grant for backend services and integrations. See [Service Accounts](../api/service-accounts.md). |
| Direct access grant (resource owner password credentials) | _Direct access grants_ | Direct grant flow | Yes, the client collects the password itself | **No.** Only the steps in the direct grant flow run | Turn off everywhere. See [below](#the-direct-grant-flow). |
| Refresh token | Issued alongside the grants above | None. Keycloak checks the session, not the user | Indirectly | No | Keep refresh token rotation on and handle concurrent refreshes. See [Tokens and Sessions](../security/tokens-and-sessions.md). |
| Device authorization | _OAuth 2.0 Device Authorization Grant_ | Browser flow, on a second device | Yes | Yes, on the device where the user approves | Only for input-constrained devices such as TVs and CLIs. |
| Token exchange | _Standard Token Exchange_ | None. Keycloak validates the incoming token | Indirectly | No | Only for services that need to call other services on a user's behalf, with a restricted audience. |
| Client-initiated backchannel authentication (CIBA) | _OIDC CIBA Grant_ | An external authentication device you provide | Yes | No | Rare. Only with a backchannel authentication provider in place. |

Two notes on the table:

- **Client credentials never returns a refresh token.** The service asks for a new access token when the old one expires. This is expected, and it means there is no long-lived session to steal.
- **A disabled grant fails cleanly.** With _Direct access grants_ off, a password request returns `400 {"error":"unauthorized_client","error_description":"Client not allowed for direct access grants"}`, and the device and token exchange endpoints refuse in the same way when their switch is off.

## Which flow runs

Each realm has a binding for every flow type under **Authentication**, and Keycloak picks the flow from the grant:

| Flow binding | Default flow | Runs for |
|---|---|---|
| Browser flow | `browser` | Authorization code, device authorization (on the approving device) |
| Direct grant flow | `direct grant` | Direct access grants |
| Client authentication flow | `clients` | Any confidential client proving its identity, including client credentials |

A client can replace the realm's browser or direct grant flow with its own, in the client's **Advanced** tab under **Authentication flow overrides**. An override changes that one flow for that one client and nothing else:

- **A browser flow override does not touch the direct grant flow.** In testing, a client whose browser flow override was a flow that always denies access still received tokens through a direct access grant.
- **Every other client keeps the realm default.** A browser flow override on your web application leaves `account-console`, `security-admin-console` and any other client on the realm's browser flow.

### The per-client override trap

Overrides are a common way to add a CAPTCHA or a second factor for the clients that matter. The trouble is that attackers do not have to use those clients. If the protected flow is bound only through overrides, every client without an override is an unprotected login page for the same users, and the built-in clients exist in every realm.

We have seen a credential stuffing campaign move between clients exactly this way: from the application's protected login, to the account console, to the realm's admin console login, and to the token endpoint through `admin-cli`, each time the previous path was closed.

To avoid it:

- **Bind protections at the realm level.** Make the flow with your CAPTCHA and second factor the realm's browser flow, and use overrides only to make a specific client stricter, never as the only place a protection lives.
- **Turn off grants nobody uses.** A flow you do not run cannot be attacked. In particular, turn off _Direct access grants_ on every client, including `admin-cli`, and enforce it with a [client policy](../security/client-policies.md) so new clients cannot turn it back on.
- **Review the built-in clients** in the [next section](#built-in-clients).

## Sign-in methods by grant

Which methods a user can sign in with depends on the flow that runs, not just on what you configured in the browser flow:

| Sign-in method | Browser flow | Direct grant flow |
|---|---|---|
| [Username and password](./username-password.md) | Yes | Yes |
| Password + [OTP](./otps.md) | Yes | Only through the default conditional OTP step, for users who already have an OTP credential |
| Password + [WebAuthn](./webauthn.md) security key | Yes | No |
| [Passkeys](./passkeys.md) | Yes | No |
| [Magic link](./magic-links.md) or email OTP | Yes | No |
| [Social login](./social-login.md) and [enterprise SSO](./sso.md) | Yes | No |
| CAPTCHA ([Turnstile](../security/turnstile.md) or [reCAPTCHA](../security/recaptcha.md)) | Yes | No |
| Required actions such as _Update password_ or _Verify email_ | Yes, completed in the browser | No, the request fails instead |

### The direct grant flow

The default `direct grant` flow is short:

| Step | Requirement |
|---|---|
| Username Validation | Required |
| Password | Required |
| Direct Grant - Conditional OTP | Conditional |
| &nbsp;&nbsp;Condition - user configured | Required |
| &nbsp;&nbsp;OTP | Required |

Nothing you add to the browser flow appears here. A user who signs in with a passkey in the browser can still get a token with a password alone, if they have one, and there is no page to put a CAPTCHA on. [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html), the OAuth 2.0 Security Best Current Practice, says the password grant must not be used.

The direct grant flow also answers differently depending on account state. A correct password for a user with a pending required action, such as _Update password_, returns `Account is not fully set up` instead of `Invalid user credentials`. That tells an attacker the password is right even though no token was issued. If you reset compromised accounts, do it by setting a new random password rather than only adding the _Update password_ required action. See [Credential Stuffing](../security/credential-stuffing.md).

## Built-in clients

Every realm is created with the same six clients. Their defaults, as created in Keycloak 26.8.1:

| Client | Type | Standard flow | Direct access grants | Full scope allowed | What it is for | Go-live guidance |
|---|---|---|---|---|---|---|
| `admin-cli` | Public | Off | **On** | **On** | Command-line tools such as `kcadm` | Turn off _Direct access grants_. Move automation to [service accounts](../api/service-accounts.md). |
| `security-admin-console` | Public, PKCE | On | Off | On | The Admin Console login for the realm | On a Phase Two hosted cluster, **keep it enabled and unchanged**: the dashboard's Console link signs in through it. Restrict `/admin` paths with [IP restrictions](../self-service/restrictions.md) instead. Self-hosted, disable it if no realm administrators use it. |
| `account` | Public | On | Off | Off | Holds the account roles and is the audience for the Account REST API | Keep enabled. See [Account Console](../keycloak/account-console.md). |
| `account-console` | Public, PKCE | On | Off | Off | The end-user Account Console | Disable or deny it if your users should not self-manage through Keycloak. See [Account Console](../keycloak/account-console.md). |
| `realm-management` | Bearer-only | Not applicable | Off | Off | Holds the realm admin roles | Leave alone. |
| `broker` | Bearer-only | Not applicable | Off | Off | Holds the identity broker roles | Leave alone. |

For the reasoning behind each line, and what an automated scanner learns from each client, see [Which Keycloak clients should be enabled when you go live?](/blog/keycloak-disable-admin-cli-account-clients).

Your own clients deserve the same review. When you create one, check every switch on the **Capability config** step instead of accepting what is selected, and for each client confirm:

- **Only the grants it uses are on.** Usually that is _Standard flow_ for an application, or _Service account roles_ for a backend.
- **Public clients require PKCE**, with the `S256` method.
- **_Full scope allowed_ is off**, with only the roles the client needs added under **Client scopes**.
- **_Offline access_ is optional, not default,** unless the client genuinely needs long-lived sessions. See [Tokens and Sessions](../security/tokens-and-sessions.md#offline-sessions).

## Related

- [Understanding Flows](./understanding-flows.md) for building and binding flows
- [Client Policies](../security/client-policies.md) to enforce these settings across a realm
- [Credential Stuffing](../security/credential-stuffing.md) for how attackers use these paths, and how to respond
- [Go-Live Checklist](../getting-started/launch-checklist.md)
