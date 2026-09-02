---
slug: keycloak-invalid-redirect-uri
title: 'Keycloak "Invalid parameter: redirect_uri" — Every Cause and Fix'
date: 2026-09-02
authors: [gpatil]
tags: [keycloak, troubleshooting, oidc, clients, security]
description: Why Keycloak rejects your redirect_uri, with a tested matching table for Keycloak 26 — including the query-string rule that breaks most OAuth callbacks.
keywords:
  - keycloak invalid parameter redirect_uri
  - keycloak redirect uri mismatch
  - invalid redirect uri keycloak
  - keycloak redirect_uri
---

You clicked "Log in", Keycloak showed you **"We are sorry… Invalid parameter: redirect_uri"**,
and no amount of staring at the admin console explains why.

The short answer: the `redirect_uri` your application sent does not match, **character for
character after wildcard expansion**, any entry in that client's *Valid redirect URIs*. The
long answer is that Keycloak's matching rules are stricter and stranger than almost everyone
assumes — in particular, **it will reject any `redirect_uri` containing a query string, no
matter what you registered**.

Everything below was tested against Keycloak 26.7.3.

<!-- truncate -->

## First: stop guessing, read the server log

The browser deliberately shows you nothing useful. Keycloak will not echo the rejected URI
back to the page, because doing so would make it an open redirector and a phishing tool.

The server log has no such constraint, and it tells you exactly what was sent:

```
WARN [org.keycloak.events] type="LOGIN_ERROR", realmName="demo", clientId="c-multi",
  error="invalid_redirect_uri", redirect_uri="http://localhost:3000/cb?tenant=acme"
```

```bash
docker logs <container> 2>&1 | grep invalid_redirect_uri
```

Put the `redirect_uri="..."` value next to your registered list and the mismatch is usually
obvious in about five seconds. **This one step solves most cases**, and almost nobody knows
the log line exists.

## The matching rules, tested

Here is what Keycloak 26.7.3 actually does. Every row was run against a live server.

### Exact registration — `http://localhost:3000/callback`

| Sent `redirect_uri` | Result |
|---|---|
| `http://localhost:3000/callback` | ✅ accepted |
| `http://localhost:3000/callback/` | ❌ rejected — trailing slash |
| `http://localhost:3000/Callback` | ❌ rejected — path is case-sensitive |
| `http://localhost:3000/callback?x=1` | ❌ rejected — query string |
| `http://localhost:3000/callback#frag` | ❌ rejected |
| `http://localhost:3000/other` | ❌ rejected |

### Wildcard registration — `http://localhost:3000/*`

| Sent `redirect_uri` | Result |
|---|---|
| `http://localhost:3000/callback` | ✅ accepted |
| `http://localhost:3000/` | ✅ accepted |
| `http://localhost:3000` | ✅ accepted |
| `http://localhost:3000/a/b/c` | ✅ accepted — `*` crosses path segments |
| `http://localhost:3000/cb?code=1` | ❌ **rejected — query string** |
| `https://localhost:3000/callback` | ❌ rejected — scheme must match |
| `http://localhost:3001/callback` | ❌ rejected — port must match |
| `http://evil.com/?x=http://localhost:3000/` | ❌ rejected |

### Trailing slashes are significant in *both* directions

| Registered | Sent | Result |
|---|---|---|
| `http://localhost:3000` | `http://localhost:3000` | ✅ |
| `http://localhost:3000` | `http://localhost:3000/` | ❌ |
| `http://localhost:3000/` | `http://localhost:3000` | ❌ |
| `http://localhost:3000/` | `http://localhost:3000/` | ✅ |

`http://localhost:3000` and `http://localhost:3000/` are **different registrations**. If you
don't know which one your library sends, register both.

### `*` is a substring wildcard, not a path wildcard

Registered `http://localhost:3000/cb*`:

| Sent | Result |
|---|---|
| `http://localhost:3000/cb` | ✅ |
| `http://localhost:3000/cbXYZ` | ✅ — matches mid-segment |
| `http://localhost:3000/cb/deep` | ✅ — crosses the `/` boundary |
| `http://localhost:3000/cb?code=1` | ❌ — still blocked by the query rule |

And registered `http://localhost:3000/a/*` accepts `http://localhost:3000/a` — the wildcard
is generous at the prefix boundary but stops dead at a `?`.

## The query-string rule, which catches nearly everyone

**Keycloak 26.7.3 rejects any `redirect_uri` containing a `?`, regardless of the registered
pattern.** We tried to register our way around it and could not:

| Registered | Sent | Result |
|---|---|---|
| `http://localhost:3000/*` | `http://localhost:3000/cb?tenant=acme` | ❌ |
| `http://localhost:3000/cb*` | `http://localhost:3000/cb?tenant=acme` | ❌ |
| `http://localhost:3000/cb?*` | `http://localhost:3000/cb?tenant=acme` | ❌ |

If your app is sending its own query parameters on the callback URL — a tenant hint, a
"return to this page" pointer, a feature flag — **that is your bug**, and no redirect URI
configuration will fix it.

### What to do instead

Use the `state` parameter. That is what it is for: opaque round-tripped application state,
returned to you untouched after login, and it doubles as CSRF protection.

```js
// ❌ Keycloak will reject this
const redirectUri = "https://app.example.com/cb?returnTo=/reports";

// ✅ Same information, correct mechanism
const redirectUri = "https://app.example.com/cb";
const state = btoa(JSON.stringify({ returnTo: "/reports", nonce: crypto.randomUUID() }));
```

Read `state` back in your callback handler. Every mainstream OIDC library supports this;
most will manage `state` for you if you stop fighting them.

## The other causes, most common first

**1. Trailing slash mismatch.** Your library appends `/`, your registration doesn't have one.
See the table above. Register both forms.

**2. Wrong port in development.** Vite on 5173, Next on 3000, your registration says the
other. The port is part of the match.

**3. `http` vs `https`.** Terminating TLS at a proxy and forwarding plain HTTP inside makes
your app build an `http://` callback while you registered `https://`. Fix the proxy headers
(`X-Forwarded-Proto`) rather than registering the insecure URI.

**4. The client isn't the one you think.** Multiple clients, similar names, and you're
editing the wrong one — or you're in the wrong realm entirely. The log line names the
`clientId`; check it against what your app sends.

**5. Configuration didn't reach the server you're testing.** Realm imported into one instance,
browser pointed at another. More common than it sounds with Docker Compose.

**6. IdP-initiated or broker flows.** The `redirect_uri` in play may be constructed by
Keycloak's broker rather than your app, and needs registering on the *client* the broker
finally lands on.

## Verify your fix without a browser

Ask the authorization endpoint directly:

```bash
CLIENT=demo-app
REDIRECT=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" \
  "http://localhost:3000/callback")

curl -s "http://localhost:8080/realms/demo/protocol/openid-connect/auth\
?client_id=$CLIENT&redirect_uri=$REDIRECT&response_type=code&scope=openid" \
  | grep -q "Invalid parameter" && echo "REJECTED" || echo "accepted"
```

That is exactly how the tables above were produced. It turns a ten-minute click-and-reload
loop into a one-second check, and it is trivial to wrap in a loop over every URI your app
might send.

## Stop it recurring: register URIs as code

Redirect URIs drift because they are edited by hand in a console, per environment, by
whoever is unblocking themselves that afternoon. Put them in version control instead:

```bash
kcadm.sh update clients/$CLIENT_UUID -r demo \
  -s 'redirectUris=["https://app.example.com/callback","https://app.example.com/callback/"]' \
  -s 'webOrigins=["https://app.example.com"]'
```

Or with the Terraform provider, so every environment is derived from one definition rather
than remembered.

## A word on wildcards and security

It is tempting to end the pain with `*` or `https://app.example.com/*` and move on. Resist
the broad version.

Redirect URI validation is the control that stops an attacker turning your login endpoint
into a credential-stealing redirector: they send a victim to a genuine Keycloak login, and
the authorization code lands on a host they own. Every wildcard you add widens that.

Practical rules:

- **Never** register a bare `*`, or a wildcard covering a whole host you don't fully control.
- Avoid wildcards on anything that serves user-generated content.
- Prefer a small list of exact URIs. You usually need two or three, not a pattern.
- Wildcards in development are fine. Wildcards in production want a reason.

Keycloak has tightened wildcard handling over successive releases precisely because loose
patterns were being exploited. If an upgrade broke a redirect that used to work, that is
usually why — and the fix is a narrower URI, not a workaround.

## The short version

1. Read the server log for `error="invalid_redirect_uri"` — it names the exact URI.
2. Compare it to the registered list, watching for trailing slashes, port, and scheme.
3. If it has a `?`, that's your problem — move the data into `state`.
4. Verify with `curl` against the authorization endpoint, not by clicking.
5. Register the URIs as code so it doesn't drift back.

---

Running Keycloak in production means owning these details across every environment and every
upgrade. [Phase Two](/hosting/dedicated-clusters/) runs managed Keycloak so you don't have to
— including the upgrades that change wildcard behaviour. Or work through the
[Keycloak tutorials](/tutorials/) if you'd rather learn it yourself.
