---
id: tokens-and-sessions
title: Tokens and Sessions
description: Keycloak token lifespans, refresh token rotation, offline sessions, and what a stolen token or session cookie gets an attacker, with the settings that limit it.
---

Every successful sign-in creates a session in Keycloak and hands the application a set of tokens. How long each lasts, and how refresh tokens are handled, decides two things you care about in production: how long a stolen token stays useful, and whether real users get signed out when they should not. This page covers the settings and the client-side handling that goes with them. Behavior described here was checked against Keycloak 26.8.1.

## How sessions and tokens fit together

- **The SSO session** (the _user session_) is created when a user signs in through the browser and is shared by every client they use in that browser. Its lifetime is set by _SSO Session Idle_ and _SSO Session Max_ in **Realm Settings > Sessions**.
- **A client session** sits inside the user session, one per application the user has signed in to. A client session can end while the SSO session continues, which matters for the [refresh race](#concurrent-refreshes) below.
- **The access token** is what the application sends to APIs. It is short-lived and cannot be revoked once issued, so its lifespan is the window in which a leaked token works.
- **The refresh token** lets the application get a new access token without sending the user back to the login page, for as long as the session is alive.
- **An offline session** is a separate, long-lived session created when a client requests the `offline_access` scope. It is not tied to the SSO session and survives the user signing out of the browser.

## Defaults and what to set

| Setting | Where | Default in a new realm | Recommendation |
|---|---|---|---|
| Access Token Lifespan | Realm Settings > Tokens | 5 minutes | Keep it short, typically 5 to 15 minutes. |
| SSO Session Idle | Realm Settings > Sessions | 30 minutes | Match how long a user can be inactive before signing in again. |
| SSO Session Max | Realm Settings > Sessions | 10 hours | Set the longest a user can stay signed in, regardless of activity. |
| Client Session Idle and Max | Realm Settings > Sessions, or per client under **Advanced** | Unset, so the SSO values apply | Set per client only when one application needs a shorter session than the rest. |
| Offline Session Idle | Realm Settings > Sessions | 30 days | Shorten it if you allow offline access at all. |
| Offline Session Max Limited | Realm Settings > Sessions | Off, so offline sessions have no hard limit | Turn it on and set _Offline Session Max_. |
| Revoke Refresh Token | Realm Settings > Tokens | Off | Turn it on, together with the client-side handling below. |
| Refresh Token Max Reuse | Realm Settings > Tokens | `0` | See [Choosing Max Reuse](#choosing-max-reuse). |

## Offline sessions

`offline_access` is an optional client scope by default: a client only gets an offline session if it asks for the scope. Mobile apps often make it a **default** scope so users stay signed in for weeks. That is a reasonable product decision, but it means:

- **An offline token is a long-lived credential.** Anyone who has it can get access tokens until the offline session expires or is removed.
- **Signing a user out does not remove it.** In testing, an admin _Sign out_ of a user (`POST /admin/realms/{realm}/users/{id}/logout`) removed their regular sessions, and the offline session was still listed and its refresh token still worked.
- **Resetting the password does not remove it either.** An offline refresh token issued before an admin password reset kept working afterward.

To end an offline session, delete it explicitly. List a user's offline sessions per client with `GET /admin/realms/{realm}/users/{id}/offline-sessions/{clientUuid}`, then remove each with:

```http
DELETE /admin/realms/{realm}/sessions/{sessionId}?isOffline=true
```

After that, the offline refresh token fails with `Offline user session not found`. Include this step in any account takeover response. See [Credential Stuffing](./credential-stuffing.md).

Grant `offline_access` only to clients that need it, and keep it as an optional scope everywhere else.

## Refresh token rotation

With _Revoke Refresh Token_ on, every refresh returns a new refresh token, and the old one stops working once it has been used more than _Refresh Token Max Reuse_ times. If an attacker steals a refresh token and uses it, the real application's next refresh fails, so the theft is detected and contained instead of silently continuing.

Rotation is the right setting. It also means your applications have to refresh carefully, because Keycloak cannot tell a stolen token being replayed from your own application sending the same token twice.

### Concurrent refreshes

The failure looks like this: two parts of the same application notice the access token has expired at the same moment and both send the same refresh token. In testing with _Revoke Refresh Token_ on and _Max Reuse_ at `0`, two refreshes sent together with the same token produced:

1. One request succeeds and returns new tokens.
2. The other fails with `400 {"error":"invalid_grant","error_description":"Maximum allowed refresh token reuse exceeded"}`.
3. Keycloak treats the reuse as a possible theft and removes the client session. The **winning** request's new access token is now rejected by the userinfo endpoint, and its new refresh token fails with `Session doesn't have required client`.
4. The SSO session survives. The application shows the user as signed out, but the next redirect to Keycloak signs them straight back in.

Users report this as being "randomly logged out", often with the detail that pressing back shows them signed in again. The common causes are:

- several API calls failing with `401` at once, each triggering its own refresh
- more than one browser tab or window refreshing from the same stored token
- an HTTP timeout that abandons a slow refresh and retries it with the same refresh token, when the first request had already reached Keycloak and used it

### Handling refreshes in the application

The fix belongs in the client, and it is the same whatever library you use:

- **Single-flight the refresh.** Keep one in-flight refresh and have every caller wait on it, rather than each caller starting its own. If you use `keycloak-js`, concurrent `updateToken()` calls on one `Keycloak` instance already share a single request. Hand-rolled OIDC code usually does not.
- **Coordinate across tabs.** Tabs that share stored tokens need a cross-tab lock, such as the [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API) around the refresh, or a [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) so one tab refreshes and the others pick up the result. Re-read the stored token after taking the lock, because another tab may already have refreshed.
- **Refresh shortly before expiry.** Refresh on a timer, or before a request when the access token has less than about 30 seconds left. Refreshing in response to each `401` is what turns several failing calls into several refreshes.
- **Never retry a refresh with the same token.** If a refresh request times out and you do not know whether Keycloak received it, assume the token is spent. Do a silent re-authentication, an authorization request with `prompt=none`, instead of sending it again.
- **Treat `invalid_grant` as "sign in again", not "signed out".** Try a silent re-authentication first. If the SSO session is alive, the user never notices. Only show a signed-out state if that fails.

A single-flight refresh in a single-page app takes only a few lines:

```ts
let inFlight: Promise<Tokens> | null = null;

export function refreshTokens(): Promise<Tokens> {
  // Every caller shares the one request that is already running.
  inFlight ??= navigator.locks
    .request("token-refresh", async () => {
      const current = loadTokens();
      // Another tab may have refreshed while we waited for the lock.
      if (current.expiresAt - Date.now() > 30_000) return current;
      const next = await postRefresh(current.refreshToken);
      saveTokens(next);
      return next;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}
```

### Choosing Max Reuse

| Max Reuse | Effect | Use it when |
|---|---|---|
| `0` | Any second use of a refresh token is treated as theft and ends the client session | Your clients single-flight their refreshes and coordinate across tabs |
| `1` | A refresh token can be used twice, so one duplicate refresh succeeds instead of ending the session | You need relief from duplicate refreshes while the client-side fix ships |

`1` is a mitigation, not a fix. In testing with _Max Reuse_ at `1`, both duplicate refreshes succeeded, but each returned a different new refresh token, and continuing with the one that was not issued last sometimes failed with `Stale token` and ended the client session. An application that keeps whichever response arrived last can still sign users out, less often. Single-flight refreshes in the client are what make the problem go away, and once they are in place you can return to `0`.

## Stolen tokens and replay

A token is a bearer credential: whoever holds it can use it. What a stolen one is worth depends on which token it is and how your services check it.

| Stolen | What the attacker gets | What limits it |
|---|---|---|
| Access token | API access until it expires | The access token lifespan. Logging the user out does not recall it from a service that validates tokens locally |
| Refresh token | New access tokens until the session ends | Refresh token rotation, which turns a replay into a detected reuse; session idle and max lifespans |
| Offline token | New access tokens for as long as the offline session lives, 30 days idle by default | Removing `offline_access` from clients that don't need it; revoking offline sessions explicitly |
| Session cookies from a phishing proxy | A signed-in browser session, without needing the password or the second factor | Phishing-resistant sign-in with passkeys; short SSO idle times; re-authentication for sensitive actions |

**Logout ends the session, not the access token.** In testing, after an admin logout of the user, the session's refresh token failed with `Session not active`, token introspection returned `{"active":false}`, and the userinfo endpoint rejected the access token. The access token itself was unchanged and still had nearly its full lifespan left. A resource server that validates the signature and `exp` locally, which is what most do, keeps accepting it until it expires. If you need revocation to take effect immediately for some APIs, have those APIs introspect the token, or keep the access token lifespan short. See [Validating tokens](/tutorials/securing-applications/validating-tokens) for the trade-off.

**Sender-constrained tokens make a stolen token useless on its own.** With DPoP, the client proves possession of a private key on every request, and the token is bound to that key, so a copied token fails without it. DPoP is enabled by default in Keycloak 26.8.1, and the client must support it. [RFC 9700 for Keycloak](./oauth-security-bcp.md) covers DPoP and mTLS-bound tokens alongside the rest of the OAuth security guidance.

**Session cookies are the target of phishing proxies.** An adversary-in-the-middle proxy relays the login, including a TOTP or email code, and keeps the session cookies Keycloak sets afterwards. Shorter SSO idle times and re-authentication before credential changes limit what the attacker can do with them. Passkeys stop the theft in the first place. See [Phishing-resistant login](./phishing-resistant-login.md).

After an account takeover, end both the regular and the offline sessions. The admin logout does not touch offline sessions. The steps are in [Credential Stuffing and Account Takeover](./credential-stuffing.md#respond).

## Related

- [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md)
- [Credential Stuffing](./credential-stuffing.md) for revoking sessions after an account takeover
- [Go-Live Checklist](../getting-started/launch-checklist.md#tokens-and-sessions)
