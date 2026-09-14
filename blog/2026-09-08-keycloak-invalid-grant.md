---
slug: keycloak-invalid-grant
title: "Keycloak invalid_grant: the eight things it actually means"
date: 2026-09-08
authors: [jpatzer]
tags: [keycloak, troubleshooting, oidc, oauth2, tokens]
description: Keycloak's invalid_grant covers eight unrelated failures. A tested map from every error_description string to its real cause, on Keycloak 26.7.3.
keywords:
  - keycloak invalid grant
  - keycloak invalid_grant
  - keycloak code not valid
  - keycloak session doesn't have required client
  - keycloak refresh token reuse
---

Keycloak returns `invalid_grant` for at least eight unrelated failures, and the error code
itself tells you nothing. The useful field is `error_description`, which Keycloak fills in
with a short string that maps almost one-to-one onto a cause:

```json
{"error":"invalid_grant","error_description":"Code not valid"}
```

`invalid_grant` is OAuth's designated bucket for "the grant you presented is no good", so
Keycloak uses it for expired codes, replayed codes, PKCE mismatches, rotated refresh tokens,
dead sessions, revoked offline tokens, and bad passwords alike. Read the description, find
it in the table below, stop guessing.

Everything here was run against **Keycloak 26.7.3** on 2026-09-07, with realm defaults
except where a test says otherwise.

<!-- truncate -->

## The whole map, in one table

Every string below came out of a live server. `error` was `invalid_grant` and the status was
`400` for all of them.

| `error_description` | Grant type | What actually happened |
|---|---|---|
| `Code not valid` | `authorization_code` | Code expired **or** was already redeemed — same message for both |
| `Incorrect redirect_uri` | `authorization_code` | `redirect_uri` at the token endpoint differs from the one sent to `/auth`, or was omitted |
| `Auth error: Found different client_id in clientSession` | `authorization_code` | A different client is trying to redeem the code |
| `PKCE code verifier not specified` | `authorization_code` | You sent a `code_challenge` but no `code_verifier` |
| `PKCE verification failed: Invalid code verifier` | `authorization_code` | The verifier is malformed — wrong length or wrong character set |
| `PKCE verification failed: Code mismatch` | `authorization_code` | The verifier is well-formed but does not hash to the challenge |
| `Maximum allowed refresh token reuse exceeded` | `refresh_token` | Rotation is on and you replayed a superseded refresh token |
| `Session doesn't have required client` | `refresh_token` | The client session was torn down — usually by a replay a moment earlier |
| `Session not active` | `refresh_token` | The user session is gone: logout, or it was administratively removed |
| `Token is not active` | `refresh_token` | SSO idle or max lifespan exceeded, or clock skew between nodes |
| `Stale token` | `refresh_token` | A not-before policy was pushed after the token was issued |
| `Offline user session not found` | `refresh_token` | The offline session was revoked or aged out |
| `Invalid refresh token` | `refresh_token` | Not a refresh token at all — an access token or ID token, typically |
| `Invalid refresh token. Token client and authorized client don't match` | `refresh_token` | The refresh token belongs to a different client |
| `Invalid user credentials` | `password` | Wrong password, unknown user, **or** a brute-force lockout |
| `Account disabled` | `password` | `enabled=false` on the user |
| `Account is not fully set up` | `password` | A required action is pending — `VERIFY_PROFILE`, `UPDATE_PASSWORD`, and friends |

The rest of this post is the eight causes those strings group into, in the order you are
likely to hit them.

## 1. The code was already redeemed — and it just killed the session

Redeem an authorization code twice and the second attempt fails, which is what you would
expect. What nobody expects is what happens to the tokens from the *first*, successful
exchange:

```bash
# 1. exchange the code — succeeds, we keep the refresh token
curl -s -X POST "$TOKEN_URL" -d grant_type=authorization_code -d client_id=web \
  -d client_secret=$SECRET -d code=$CODE -d redirect_uri=http://localhost:3000/callback

# 2. exchange the same code again
{"error":"invalid_grant","error_description":"Code not valid"}

# 3. now use the refresh token that worked ten seconds ago
{"error":"invalid_grant","error_description":"Session doesn't have required client"}
```

Keycloak treats a redeemed code turning up a second time as a stolen code, and detaches the
client from the user session. The legitimate client — the one that redeemed correctly — is
logged out as collateral.

This is why `Session doesn't have required client` shows up in bug reports as "users get
randomly logged out". It is almost never random. Something replayed a grant. The usual
culprits are a React effect firing twice under StrictMode, a callback route that runs on both
server and client, or a user refreshing the callback page.

## 2. The code expired

Same message, different cause. Authorization codes live for `accessCodeLifespan`, which the
admin console calls **Client login timeout** under Realm settings → Tokens, and which
[the server admin guide](https://www.keycloak.org/docs/latest/server_admin/index.html#_timeouts)
describes as the maximum time before clients must finish the authorization code flow. It
ships at **60 seconds**.

Sixty seconds is generous for a redirect and a back-channel call, and mean if your callback
handler blocks on something slow — a user lookup against a legacy directory, a cold Lambda,
a provisioning call. Do the token exchange first, everything else after.

### Telling the two apart

The response is identical, and so is the server log: both produce
`type="CODE_TO_TOKEN_ERROR", error="invalid_code"` with no distinguishing reason. The
`code_id` detail is what separates them. Turn on event storage and read the sequence:

```bash
kcadm.sh update events/config -r demo \
  -s eventsEnabled=true \
  -s 'enabledEventTypes=["LOGIN","CODE_TO_TOKEN","CODE_TO_TOKEN_ERROR"]'
kcadm.sh get events -r demo -q max=10
```

```text
# replayed code — a successful exchange for the same code_id
LOGIN                code_id=KP3veSsloJww7HFfIJF_5A4r
CODE_TO_TOKEN        code_id=KP3veSsloJww7HFfIJF_5A4r
CODE_TO_TOKEN_ERROR  code_id=KP3veSsloJww7HFfIJF_5A4r  error=invalid_code

# expired code — nothing ever redeemed it
LOGIN                code_id=oqgn0iFSvrCod8rFFN4jPXmJ
CODE_TO_TOKEN_ERROR  code_id=oqgn0iFSvrCod8rFFN4jPXmJ  error=invalid_code
```

A `CODE_TO_TOKEN` between the `LOGIN` and the error means replay. No `CODE_TO_TOKEN` means
expiry. That single check has settled more of these arguments than any amount of reading
application logs.

## 3. The `redirect_uri` changed between the two calls

```json
{"error":"invalid_grant","error_description":"Incorrect redirect_uri"}
```

The `redirect_uri` in the token request must be byte-identical to the one in the
authorization request. Registering both on the client is not enough — we sent
`http://localhost:3000/callback` to `/auth` and `http://localhost:3000/cb2` to the token
endpoint with both registered, and it was rejected. Omitting the parameter entirely gives the
same error.

The server log spells it out where the response does not:

```text
error="invalid_redirect_uri", reason="Parameter 'redirect_uri' did not match originally
saved redirect URI used in initial OIDC request. Saved redirectUri:
http://localhost:3000/callback, redirectUri parameter: http://localhost:3000/cb2"
```

This is a different failure from the one that stops you at the login screen. If you never got
a code at all, you want
[Invalid parameter: redirect_uri](/blog/keycloak-invalid-redirect-uri) instead.

## 4. PKCE — three failures, three distinct messages

Keycloak is unusually helpful here, and the three messages mean genuinely different things.

| Message | Meaning |
|---|---|
| `PKCE code verifier not specified` | The `code_verifier` parameter is missing from the token request |
| `PKCE verification failed: Invalid code verifier` | The verifier does not satisfy RFC 7636 syntax |
| `PKCE verification failed: Code mismatch` | The verifier is syntactically fine but hashes to a different challenge |

The syntax rule is a verifier of 43–128 characters from the unreserved set. We confirmed the
boundary against a live server: a 43-character verifier that is simply wrong returns
`Code mismatch`, and the same wrong verifier at 42 characters returns `Invalid code verifier`.

That distinction is worth knowing, because it tells you which bug you have. `Invalid code
verifier` means your generator is broken — usually base64 instead of base64url, or truncating
to 32 characters. `Code mismatch` means the generator is fine and you lost the verifier
between the two requests: regenerated it, stored it in a cookie that got dropped on the
cross-site redirect, or ran the two halves of the flow on different instances of a
horizontally scaled app.

A missing `code_challenge` on the *authorization* request is not an `invalid_grant` at all.
Keycloak fails it earlier, redirecting back with
`error=invalid_request&error_description=Missing+parameter%3A+code_challenge_method`.

## 5. Refresh token rotation and the concurrency trap

This one is worth measuring, because the setting that causes it is frequently turned on for
good reasons by someone who then spends a week debugging the result.

With **Revoke Refresh Token** (`revokeRefreshToken`) enabled, each refresh invalidates the
token you presented. **Refresh Token Max Reuse** (`refreshTokenMaxReuse`) controls how many
replays are tolerated, and defaults to `0` — none. Replay a superseded token and you get:

```json
{"error":"invalid_grant","error_description":"Maximum allowed refresh token reuse exceeded"}
```

Now fire three refreshes concurrently with the same token, which is exactly what a browser
app with three tabs, or a service with a connection pool, does the moment an access token
expires:

| Realm setting | Result of 3 concurrent refreshes with one token |
|---|---|
| `revokeRefreshToken=false` (shipped default) | 3 × new token issued |
| `revokeRefreshToken=true`, `refreshTokenMaxReuse=0` | 1 × new token, 1 × `Maximum allowed refresh token reuse exceeded`, 1 × `Session doesn't have required client` |
| `revokeRefreshToken=true`, `refreshTokenMaxReuse=2` | 3 × new token issued |

Read the middle row carefully. The third request does not merely fail — by the time it
arrives the reuse has already detached the client session, so the *new* refresh token
returned to the first caller is dead too. One racing tab logs the user out of all of them.

Rotation is a real security control and we are not telling you to leave it off. But if you
turn it on, either serialise refreshes behind a single-flight lock in every client, or set
`refreshTokenMaxReuse` to a small non-zero number and accept a narrow replay window. Turning
rotation on and changing nothing else is the option that produces support tickets.

## 6. The session is gone

Four different messages, all meaning "the session behind this refresh token no longer
exists":

- **`Session not active`** — someone hit the logout endpoint, or an admin removed the session.
- **`Token is not active`** — the session passed `ssoSessionIdleTimeout` (default 30 minutes)
  or `ssoSessionMaxLifespan` (default 10 hours). We reproduced this by dropping idle timeout
  to 60 seconds and waiting it out.
- **`Stale token`** — a not-before policy was pushed. Realm settings → Sessions → Revocation,
  or the per-client equivalent, sets a timestamp and every token issued before it dies
  instantly. Easy to forget you clicked it.
- **`Offline user session not found`** — an offline token whose session was revoked, either
  by the revocation endpoint or by the user removing consent.

`Token is not active` is also what clock skew looks like. If it appears immediately after
issuing a token, on a multi-node cluster, on tokens that should have 29 minutes left, check
that the nodes agree on the time before you touch any Keycloak setting. We did not reproduce
that case directly — it needs two nodes with genuinely divergent clocks — but the failure
mode is the same message, and comparing `date` across nodes rules it in or out in a second.

## 7. The direct grant, where the message is deliberately unhelpful

The password grant returns three messages, and one of them is a lie by design:

```text
wrong password:      {"error":"invalid_grant","error_description":"Invalid user credentials"}
unknown user:        {"error":"invalid_grant","error_description":"Invalid user credentials"}
disabled user:       {"error":"invalid_grant","error_description":"Account disabled"}
required action:     {"error":"invalid_grant","error_description":"Account is not fully set up"}
```

`Invalid user credentials` covers wrong password and non-existent user identically, so the
endpoint cannot be used to enumerate accounts. It also covers a **brute-force lockout**. With
`bruteForceProtected=true` and `failureFactor=3`, we sent four bad passwords and then the
correct one:

```text
attempt 4 (bad):                 {"error_description":"Invalid user credentials"}
attempt 5 (CORRECT password):    {"error_description":"Invalid user credentials"}
```

The admin guide is explicit that this masking is intentional, so an attacker cannot tell a
locked account from a wrong password. Neither can your support team. The server log does
distinguish them:

```text
error="invalid_user_credentials"   ← wrong password
error="user_temporarily_disabled"  ← locked out
```

And you can check and clear a specific user's lockout state directly:

```bash
kcadm.sh get attack-detection/brute-force/users/$USER_ID -r demo
kcadm.sh delete attack-detection/brute-force/users/$USER_ID -r demo
```

`Account is not fully set up` is the one people misdiagnose most. It means a required action
is pending — and on a fresh realm, `VERIFY_PROFILE` fires for any user missing an email,
first name, or last name. Users created by script or by a migration hit this constantly while
looking perfectly fine in the console.

## 8. That is not this client's refresh token

Two messages, both meaning the token you presented is not the thing the endpoint wanted:

- **`Invalid refresh token`** — you sent something that is not a refresh token. Posting an
  access token here is the single most common version, usually a variable mix-up. Decode the
  `typ` claim; a refresh token says `Refresh` (or `Offline`), an access token says `Bearer`.
- **`Invalid refresh token. Token client and authorized client don't match`** — the token is
  real but was issued to a different `client_id`. Common when a gateway and a frontend share
  token storage, or when someone copies a token between environments.

If you are not sure what you are holding, decode it. Our
[token walkthrough tutorial](/tutorials/getting-started/your-first-token/) covers reading
every claim, including the ones that make valid tokens get rejected.

## Things that look like `invalid_grant` and are not

Worth stating plainly, because the outline for this post originally listed the first one as
an `invalid_grant` cause and testing said otherwise:

| Failure | What you actually get |
|---|---|
| Wrong client secret | `401` + `{"error":"unauthorized_client","error_description":"Invalid client or Invalid client credentials"}` |
| Missing `code_challenge` when PKCE is required | `302` back to the app with `error=invalid_request` |
| Direct access grants disabled on the client | `unauthorized_client` |

If you are looking at `unauthorized_client` or `invalid_client`, stop reading this post — the
problem is client authentication, not the grant.

## The short version

1. Read `error_description`, not `error`. It names the cause.
2. `Code not valid` is expired or replayed; check the event log for a `CODE_TO_TOKEN` with
   the same `code_id` to tell which.
3. `Session doesn't have required client` means something replayed a grant a moment earlier.
   Find the double request; do not raise a timeout.
4. Three PKCE messages, three different bugs. `Invalid code verifier` is your generator,
   `Code mismatch` is your storage.
5. If you enable refresh token rotation, fix concurrent refreshes at the same time.
6. `Invalid user credentials` might be a lockout. Only the server log knows.

Keep `docker logs` on the Keycloak container open in a second terminal while you debug any of
this. The response is deliberately vague; the log is not.

---

Most of these are one-line configuration answers once you know which of the eight you are
looking at — the expensive part is the afternoon spent finding out. If you would rather not
spend it, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with a 30-day
Starter trial from $149/month, and the session and token settings above already tuned. If you
are staying self-hosted, the [Keycloak tutorials](/tutorials/) and the
[securing applications docs](/docs/securing-applications/) cover the client-side half of this.
