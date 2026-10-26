---
id: oauth-security-bcp
title: "RFC 9700 for Keycloak: OAuth Security Best Practice"
description: RFC 9700 OAuth security best practices mapped to Keycloak settings and client policy executors, with a tested realm-wide profile and the errors clients get.
---

RFC 9700, the OAuth 2.0 Security Best Current Practice (January 2025), is the IETF's current list of OAuth security best practices, what an OAuth deployment must and should do: exact redirect URI matching, PKCE, no implicit grant, no password grant, protected refresh tokens, sender-constrained and audience-restricted access tokens, and defenses against mix-up and clickjacking. Keycloak can enforce most of it server-side, but a default realm does not. Several of the requirements are off until you turn them on, and the main tool for turning them on realm-wide is a [client policy](./client-policies.md).

This page maps each requirement to the Keycloak setting or executor that covers it, gives one realm-wide profile for the baseline, and shows what a non-compliant client gets back. It extends the baseline in [Client Policies](./client-policies.md). Every Keycloak behavior described here was reproduced on Keycloak 26.8.1.

## What does RFC 9700 require, and what does Keycloak do by default?

Section numbers and requirement levels are from [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html). "Default" means a new realm on Keycloak 26.8.1 with no client policies.

| RFC 9700 requirement (section, level) | Keycloak setting or executor | Default in 26.8.1 | Notes |
|---|---|---|---|
| Compare redirect URIs by exact string match (2.1, 4.1.3, MUST) | `secure-redirect-uris-enforcer` with `oauth-2-1-compliant` | Not met. Trailing `*` wildcards are allowed in _Valid redirect URIs_ | The executor rejects wildcard registrations when a client is created or saved. See [how wildcard matching works](/blog/keycloak-invalid-redirect-uri). |
| Allow a variable port for native apps' loopback redirect URIs (4.1.3, MUST) | Built in | Met | `http://127.0.0.1/cb` registered, `http://127.0.0.1:51234/cb` accepted. |
| No `http` redirect URIs except native loopback (2.6, MUST NOT) | `secure-redirect-uris-enforcer` | Not met. `http` URIs can be registered | With the settings below, `http` is accepted only for `127.0.0.1` and `[::1]` with no port. |
| No open redirectors (2.1, MUST NOT; 4.11.2) | Built in | Met | An unregistered `redirect_uri` gets a Keycloak error page (`Invalid parameter: redirect_uri`), never a redirect. |
| Clients prevent CSRF (2.1, MUST) | PKCE, plus the client's own `state` or `nonce` check | Partly | Keycloak returns `state` but does not require it. The RFC lets clients rely on PKCE instead. |
| Mix-up defense when a client talks to more than one authorization server (2.1, REQUIRED; clients SHOULD use RFC 9207 `iss`) | Built in. Per client: **Exclude Issuer From Authentication Response** | Met | Every authorization response, including errors, carried `iss`. The client still has to check it. |
| PKCE for public clients (2.1.1, MUST); for confidential clients (RECOMMENDED) | `pkce-enforcer` | Not met. PKCE is optional, and `plain` is accepted | With the executor, a missing or `plain` challenge is rejected, for every client the policy covers. |
| Use S256 (2.1.1, SHOULD) | `pkce-enforcer` | Not enforced | Discovery lists `plain` and `S256`. The executor accepts only `S256`. |
| Reject PKCE downgrade (2.1.1, 4.8.2, MUST) | Built in | Met | A token request with `code_verifier` for a code issued without a challenge: `PKCE code verifier specified but challenge not present in authorization`. |
| Detect constant PKCE challenges (2.1.1, "encouraged") | None | Not done | The same `code_challenge` was accepted on dozens of requests in a row. |
| No implicit grant or other response types that return access tokens from the authorization endpoint (2.1.2, SHOULD NOT) | `reject-implicit-grant` | Off per client, but any client can turn it on | Discovery still lists `token` and hybrid response types. |
| Sender-constrained access tokens (2.2.1, SHOULD) | DPoP: **Require DPoP bound tokens** per client, or `dpop-bind-enforcer`. mTLS: **OAuth 2.0 Mutual TLS Certificate Bound Access Tokens Enabled**, or `holder-of-key-enforcer` | Off | DPoP is a supported feature in 26.8.1, enabled by default, not a preview. See [below](#how-do-you-sender-constrain-tokens-with-dpop-or-mtls). |
| Refresh tokens for public clients sender-constrained or rotated (2.2.2, 4.14.2, MUST) | **Revoke Refresh Token** in **Realm Settings → Tokens**, or DPoP on public clients | Not met. Rotation is off and a refresh token can be reused indefinitely | A refresh token was accepted three times in a row in a default realm. |
| Expire refresh tokens after inactivity (4.14.2, SHOULD) | _SSO Session Idle_, _Client Session Idle_ | Met (30 minutes) | See [Tokens and Sessions](./tokens-and-sessions.md). |
| Least privilege and audience-restricted access tokens (2.3, SHOULD) | Audience mappers, client scopes, `full-scope-disabled` | Not met | A default access token's `aud` is `account`, not your API. Resource Indicators (RFC 8707) is an experimental feature, off by default. |
| No resource owner password credentials grant (2.4, MUST NOT) | `reject-ropc-grant` | Partly. Off on new clients, on for `admin-cli` | See [Credential Stuffing](./credential-stuffing.md) for why `admin-cli` matters. |
| Enforce client authentication (2.5, SHOULD); use asymmetric methods (RECOMMENDED) | `secure-client-authenticator` | New confidential clients use `client-secret` | Allow `client-jwt` (`private_key_jwt`) and `client-x509` (mTLS). |
| Publish authorization server metadata (2.6, RECOMMENDED) | Built in | Met | `/realms/{realm}/.well-known/openid-configuration` lists PKCE methods, DPoP algorithms, mTLS support and the `iss` parameter. |
| No CORS at the authorization endpoint (2.6, MUST NOT) | Built in | Met | `/auth` returned no `Access-Control-Allow-Origin`, even for the client's own origin. |
| Never redirect a credential POST with 307 (4.12, MUST NOT; use 303, SHOULD) | Built in | MUST met, SHOULD not | The login form POST is answered with `302`. |
| Prevent clickjacking (4.16, MUST); use CSP (SHOULD) | **Realm Settings → Security defenses → Headers** | Met | `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-src 'self'; frame-ancestors 'self'; object-src 'none';` on the login page and on error pages. |

## Apply the baseline as one realm-wide policy

The first profile covers what can apply to every client: no password grant, no implicit or hybrid flow, PKCE with S256, and exact `https` redirect URIs, with loopback and private-use schemes for native apps. The second, for asymmetric client authentication, is disabled, because enabling it breaks every confidential client that uses a secret.

It replaces the two-policy baseline in [Client Policies](./client-policies.md). The differences: PKCE applies to confidential clients too, as RFC 9700 recommends, and redirect URIs are validated. On a Phase Two hosted cluster, remove the `secure-redirect-uris-enforcer` entry before applying it; [the hosted section](#on-a-phase-two-hosted-cluster) explains why.

```json title="Profiles"
{
  "profiles": [
    {
      "name": "rfc9700-baseline",
      "description": "RFC 9700: code flow with PKCE S256, no implicit or password grant, exact https redirect URIs",
      "executors": [
        { "executor": "reject-ropc-grant", "configuration": { "auto-configure": "true" } },
        { "executor": "reject-implicit-grant", "configuration": { "auto-configure": "true" } },
        { "executor": "pkce-enforcer", "configuration": { "auto-configure": "true" } },
        {
          "executor": "secure-redirect-uris-enforcer",
          "configuration": {
            "oauth-2-1-compliant": "true",
            "allow-http-scheme": "true",
            "allow-ipv4-loopback-address": "true",
            "allow-ipv6-loopback-address": "true",
            "allow-private-use-uri-scheme": "true"
          }
        }
      ]
    },
    {
      "name": "rfc9700-asymmetric-client-auth",
      "description": "RFC 9700 2.5: private_key_jwt or mTLS for confidential clients",
      "executors": [
        {
          "executor": "secure-client-authenticator",
          "configuration": {
            "allowed-client-authenticators": ["client-jwt", "client-x509"],
            "default-client-authenticator": "client-jwt"
          }
        }
      ]
    }
  ]
}
```

```json title="Policies"
{
  "policies": [
    {
      "name": "rfc9700-all-clients",
      "enabled": true,
      "conditions": [{ "condition": "any-client", "configuration": {} }],
      "profiles": ["rfc9700-baseline"]
    },
    {
      "name": "rfc9700-confidential-clients",
      "enabled": false,
      "conditions": [{ "condition": "client-access-type", "configuration": { "type": ["confidential"] } }],
      "profiles": ["rfc9700-asymmetric-client-auth"]
    }
  ]
}
```

Load them with `PUT /admin/realms/{realm}/client-policies/profiles` and `PUT /admin/realms/{realm}/client-policies/policies`, or paste them into the JSON editors under **Realm Settings → Client policies**. `allow-http-scheme` looks wrong but is needed: with `oauth-2-1-compliant` on, it permits `http` only for `127.0.0.1` and `[::1]` without a port. `http://app.example.com/cb`, `http://localhost/cb` and `http://127.0.0.1:8080/cb` were all still rejected. Without it, the loopback options have no effect, which is also true of the built-in `oauth-2-1-for-public-client` profile.

### What a non-compliant client gets back

| Request | Response with the baseline in place |
|---|---|
| Create or save a client with `https://app.example.com/*` or `http://app.example.com/cb` | `400 {"error":"invalid_request","error_description":"Invalid Redirect Uri: invalid uri"}` |
| Create a client with `http://localhost/cb` or `http://127.0.0.1:8080/cb` | `400 … "Invalid Redirect Uri: invalid loopback address"` |
| Create a client with implicit flow and direct access grants turned on | `201`, saved with both turned off and _PKCE Method_ set to `S256` (auto-configure) |
| Authorization request without `code_challenge`, public or confidential client | Redirect to the client with `error=invalid_request&error_description=Missing parameter: code_challenge_method` |
| Authorization request with `code_challenge_method=plain` | Redirect with `error=invalid_request&error_description=Invalid parameter: invalid code_challenge_method` |
| `response_type=token` or `code token` on a client that still has implicit flow on | Redirect with `#error=invalid_request&error_description=Implicit/Hybrid flow is prohibited.` |
| `grant_type=password` on any client | `400 {"error":"invalid_grant","error_description":"resource owner password credentials grant is prohibited."}` |
| Authorization request whose `redirect_uri` uses `http` on a non-loopback host | Keycloak error page: `Invalid Redirect Uri: invalid uri` |

With `rfc9700-confidential-clients` enabled:

| Request | Response |
|---|---|
| Create a confidential client with `clientAuthenticatorType` `client-secret` | `400 {"error":"invalid_client_metadata","error_description":"Invalid client metadata: token_endpoint_auth_method"}` |
| Create a confidential client without naming an authenticator | `201`, set to `client-jwt` |
| Token request from an **existing** client that authenticates with a secret | `400 {"error":"invalid_request","error_description":"Configured client authentication method not allowed for client"}` |

The last row is a request-time check. It breaks secret-based clients the moment the policy is enabled, not when they are next saved. Move each one to a signed JWT (`private_key_jwt`, with a JWKS URL or uploaded key) or to mTLS first, then enable the policy.

## What the baseline does not fix on its own

**Existing wildcard registrations keep working.** `secure-redirect-uris-enforcer` validates registered URIs only when a client is created or saved. On an authorization request it checks the `redirect_uri` in the request, not how it was matched, so a client registered with `https://spa.example.com/*` before the policy existed still accepted `https://spa.example.com/cb` afterwards. To get exact matching, replace each wildcard with the full callback URIs. Saving a client with a wildcard fails with `Invalid Redirect Uri: invalid uri`, which tells you which clients still need it.

**The built-in console clients can't be saved while the policy is on.** `security-admin-console` and `account-console` are registered with wildcards (`/admin/{realm}/console/*` and `/realms/{realm}/account/*`), so saving them without changes returned `Invalid Redirect Uri: invalid uri`, and so did `broker`. Signing in through both consoles still worked, because their actual redirect URIs are exact `https` URLs. If you need to change one of these clients, disable `rfc9700-all-clients`, make the change, and enable it again. Two workarounds failed in testing. `allow-wildcard-context-path` lets the consoles be saved but accepts wildcards on every other client too. A negative `client-attributes` condition to exempt the built-ins was not evaluated on client creation, so new clients with wildcards got through.

**PKCE on confidential clients may need application changes.** Many server-side libraries send PKCE only when configured to. Check before enabling, or start with the public-only PKCE policy from [Client Policies](./client-policies.md).

**Refresh token rotation is a realm setting, not a policy.** Turn on **Revoke Refresh Token** in **Realm Settings → Tokens** to meet section 2.2.2 for public clients that don't use DPoP. With it on, replaying an old refresh token returned `Maximum allowed refresh token reuse exceeded` and ended the client session, so the newest refresh token then failed with `Session doesn't have required client`. That is the RFC's rotation behavior, and it means your applications must not refresh concurrently. [Tokens and Sessions](./tokens-and-sessions.md) covers how to handle that.

## How do you sender-constrain tokens with DPoP or mTLS?

Sender-constrained tokens are a SHOULD in RFC 9700. They also satisfy the refresh token MUST for public clients. Both need client-side work, so turn them on per client or per group of clients, not with `any-client`.

**DPoP (RFC 9449)** is enabled by default in 26.8.1 (`DPOP` is a default feature in `/admin/serverinfo`). Turn it on for a client with **Require DPoP bound tokens** in the client's **Advanced** tab, which sets the `dpop.bound.access.tokens` attribute, or with the `dpop-bind-enforcer` executor. On a public client with DPoP required:

- A token request without a proof returns `{"error":"invalid_request","error_description":"DPoP proof is missing"}`.
- With a proof, `token_type` is `DPoP` and the access token carries `cnf.jkt`, the key's thumbprint.
- A refresh with a proof from a different key returns `DPoP confirmation doesn't match DPoP proof`. Public clients' refresh tokens are bound too.
- The userinfo endpoint rejects the token sent as `Bearer` and accepts it as `DPoP` with a matching proof.

Two details matter. First, `dpop-bind-enforcer` enforces at request time only for clients that have the attribute. With the executor active, an existing public client that had not been saved since still got tokens without a proof, with auto-configure on or off. Turn the switch on for each existing client, or save it. Second, in testing the proof's `htu` had to be the URL the request was actually sent to, not the configured frontend hostname, or the request failed with `DPoP HTTP URL mismatch`. If a proxy rewrites the host, test DPoP through it before relying on it. Your resource servers also have to validate DPoP proofs, not only the token. For confidential clients, the setting's help text says only access tokens are bound, because client authentication already sender-constrains their refresh tokens. We tested DPoP on public clients only.

**mTLS (RFC 8705)** binds tokens to the client's TLS certificate: **OAuth 2.0 Mutual TLS Certificate Bound Access Tokens Enabled** per client, or `holder-of-key-enforcer`. It needs Keycloak, and every proxy in front of it, to request and pass on client certificates. We did not test mTLS for this page.

## Can the FAPI profiles do this for you?

Keycloak ships ready-made global profiles. You attach them to a policy the same way as your own. They are listed by `GET /admin/realms/{realm}/client-policies/profiles?include-global-profiles=true`.

| Global profile | What it adds beyond the baseline |
|---|---|
| `oauth-2-1-for-public-client` | Redirect URI rules, PKCE, DPoP binding (auto-configure), no implicit or password grant. It does not set `allow-http-scheme`, so loopback `http` redirect URIs are rejected. |
| `oauth-2-1-for-confidential-client` | Confidential clients only, `client-jwt` or `client-x509` authentication, mTLS holder-of-key, PKCE, no implicit or password grant |
| `fapi-2-security-profile` | All of the above for confidential clients, plus PAR (`secure-par-content`), PS256 signatures, `consent-required` and `full-scope-disabled` |
| `fapi-2-dpop-security-profile` | The same, with DPoP instead of mTLS holder-of-key |
| `fapi-2-message-signing`, `fapi-2-dpop-message-signing` | Adds signed request objects |

The FAPI 2.0 profiles go well beyond RFC 9700. `consent-required` puts a consent screen on every client the policy covers, and `full-scope-disabled` removes role mappings your applications may depend on. Don't attach a global profile to `any-client`. Apply it to the clients built for it, and test in a non-production realm first.

## What Keycloak can't enforce

Some RFC 9700 requirements are about how clients and resource servers behave, and no server setting reaches them:

- **Checking `state`, `nonce` and `iss`.** Keycloak sends them. The client has to verify them and abort on a mismatch.
- **Audience checks at the resource server.** Section 2.3 requires the resource server to refuse tokens not meant for it. Keycloak can put the right `aud` in the token with an audience mapper. Only the API can reject the wrong one.
- **Where browser apps keep tokens.** Storage in `localStorage`, in memory, or behind a backend-for-frontend is the application's choice. See [JWT Security Best Practices](/tutorials/jwts/jwt-security-best-practices).
- **Open redirectors on the client's site (4.1.3) and `postMessage` flows (4.17).** Both are application code.
- **A stricter CSP.** Section 4.16's example adds `script-src 'self'`. The default login theme uses inline scripts, so adding that to the realm's CSP will likely break the login page. Test any change under **Security defenses** in a browser.

## On a Phase Two hosted cluster

Client policies, realm token settings and security headers are realm configuration, and you set them yourself, exactly as on a self-hosted Keycloak.

| We provide | You configure |
|---|---|
| Keycloak with DPoP and client policies available | The client policies on this page, and [the baseline](./client-policies.md) they extend |
| A web application firewall with per-IP [rate limits](./rate-limiting.md) by tier | **Revoke Refresh Token** and session lifetimes ([Tokens and Sessions](./tokens-and-sessions.md)) |
| [IP restrictions](../self-service/restrictions.md) for `/admin` paths on Premium and Enterprise, and for public paths on Enterprise | Exact redirect URIs, audience mappers and the client authenticator on each client |
| Event capture into the Phase Two [audit log](/docs/audit-logs), independent of your realm's event settings | Security headers under **Security defenses** |
| A master realm that is not exposed to customers | DPoP on the public clients whose code supports it |
| Help: email [support@phasetwo.io](mailto:support@phasetwo.io) | Testing every policy in a non-production realm first |

Keep `security-admin-console` enabled and leave its Root URL unchanged. The dashboard's Console link signs in through it, and the platform updates this client when it maintains your deployment. **On a hosted cluster, leave `secure-redirect-uris-enforcer` out of any profile bound to `any-client`.** It rejects saves of the built-in console clients, which would block that maintenance. Apply exact redirect URIs to your own clients instead, by registering full callback URIs on each one, and use the rest of the baseline realm-wide. If you need the redirect URI executor enforced, talk to us at [support@phasetwo.io](mailto:support@phasetwo.io) first.

mTLS-bound tokens need the client certificate to reach Keycloak through every proxy in front of it. Ask us before planning on mTLS for a hosted cluster.

## Related

- [Client Policies](./client-policies.md): how policies, profiles and executors fit together, and the two-policy baseline
- [Tokens and Sessions](./tokens-and-sessions.md): refresh token rotation and the concurrent refresh problem
- [Credential Stuffing and Account Takeover](./credential-stuffing.md): why the password grant has to go
- [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md)
- [Securing Keycloak in production](./index.md)
