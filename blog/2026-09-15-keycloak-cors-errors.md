---
slug: keycloak-cors-errors
title: "Keycloak CORS errors: why your SPA gets blocked"
date: 2026-09-15
authors: [gpatil]
tags: [keycloak, troubleshooting, cors, spa, oidc]
description: A Keycloak CORS error almost always means one thing — the origin is not in the client's Web Origins. Here is the exact matching rule, tested on 26.7.3.
keywords:
  [
    keycloak cors error,
    keycloak web origins,
    configuring cors keycloak oidc client,
    keycloak invalid origin,
    keycloak admin api cors,
  ]
---

A Keycloak CORS error is almost never a CORS-configuration problem in the general sense. There is no CORS server setting to turn on. Keycloak decides per request by comparing the browser's `Origin` header against the **Web Origins** list on the OIDC client named in that request, using exact string matching. If it matches, the response carries `Access-Control-Allow-Origin`. If it does not, you get `403` with the body `{"error":"Invalid origin"}` — and the browser reports it as a CORS failure, which sends most people to the wrong place.

So the first thing to do is not to read a CORS guide. It is to open the Network tab, find the failing request, and check whether the status is 403 with that body. That single fact splits every cause below into two halves.

<!-- truncate -->

Everything here was run against **Keycloak 26.7.3** in `start-dev`, with real `curl` output.

## The 30-second fix

1. Find the `client_id` in the failing request's form body (or the `azp` claim of the bearer token, if it is an API call).
2. In the admin console, open **Clients → that client → Settings → Web Origins**.
3. Add the browser origin **exactly**: scheme, host, port, no trailing slash, no path. `http://localhost:5173`, not `http://localhost:5173/`.
4. Save. No restart, no cache flush — the next request picks it up.

If the client is `admin-cli`, stop: that one can never work from a browser. See [the admin API section](#the-admin-rest-api-needs-its-own-client).

## Your preflight is not the problem

This is the measurement that surprises people. A CORS preflight carries no body, so Keycloak has no `client_id` and cannot know which client's Web Origins to check. It therefore approves every preflight:

```bash
curl -s -i -X OPTIONS \
  http://localhost:8080/realms/cors-lab/protocol/openid-connect/token \
  -H "Origin: http://totally-unrelated.example" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://totally-unrelated.example
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

The origin check happens on the **actual** request:

```bash
curl -s -i -X POST \
  http://localhost:8080/realms/cors-lab/protocol/openid-connect/token \
  -H "Origin: http://localhost:3000" \
  -d client_id=spa-exact -d grant_type=authorization_code -d code=x
```

```
HTTP/1.1 403 Forbidden
{"error":"Invalid origin"}
```

(The code is fake, so an allowed origin returns `400 invalid_grant` here — the presence or
absence of the CORS headers is the whole signal.)

So if your browser console says *"Response to preflight request doesn't pass access control check"*, the preflight genuinely failed — which means something in front of Keycloak answered it, not Keycloak. If the console says *"No 'Access-Control-Allow-Origin' header is present"* on the POST itself, it is the Web Origins list or a proxy.

Note also that `403 {"error":"Invalid origin"}` never reaches your JavaScript. The browser strips the response before your `catch` block sees it. You will only find it in the Network tab or in `docker logs`.

## The matching rules, measured

Every row below is one run against 26.7.3: set Web Origins, send the origin, record the status.

| Web Origins entry | Browser `Origin` | Result |
|---|---|---|
| `http://localhost:5173` | `http://localhost:5173` | **200** |
| `http://localhost:5173/` | `http://localhost:5173` | 403 |
| `http://localhost:5173/app` | `http://localhost:5173` | 403 |
| `HTTP://LOCALHOST:5173` | `http://localhost:5173` | 403 |
| `https://app.example.com` | `http://app.example.com` | 403 |
| `https://app.example.com` | `https://app.example.com:443` | 403 |
| `https://*.example.com` | `https://a.example.com` | 403 |
| `http://localhost` | `http://localhost:5173` | 403 |
| `http://localhost:5173` | `http://127.0.0.1:5173` | 403 |
| `*` | `null` | **200** |

Byte-for-byte string comparison. No wildcards, no scheme normalization, no default-port folding, no case folding, and `127.0.0.1` is not `localhost`. The trailing slash is the single most common cause — the admin console will happily accept `http://localhost:5173/` because it accepts any string.

## `+` and `*`

Two special values, and they are not symmetric:

| Value | Means | Use when |
|---|---|---|
| `+` | Allow the origins of this client's **Valid redirect URIs** | Almost always. One list to maintain. |
| `*` | Allow any origin | Local experiments only. |
| *(empty)* | Allow nothing | Server-to-server clients. Correct default. |

`+` derives origins from absolute redirect URIs, so `https://app.example.com/callback` yields `https://app.example.com`. Verified limits: a wildcard **host** in a redirect URI (`https://*.example.com/callback`) contributes nothing, and a relative redirect URI (`/callback/*`) only contributes if the client has a **Root URL** set, in which case the origin comes from that. You can mix — `["+", "https://extra.example.com"]` allows both sets.

`*` deserves a warning that is usually stated backwards. The common claim is that `*` breaks credentialed requests. On 26.7.3 it does not: Keycloak **reflects** the caller's origin rather than emitting a literal `*`, and still sends `Access-Control-Allow-Credentials: true`. That is worse, not better. It also means `Origin: null` — sandboxed iframes, `data:` documents, some redirect chains — gets `Access-Control-Allow-Origin: null` and a credentialed response. Do not ship `*`.

## The admin REST API needs its own client

The Admin REST API applies the same rule, against the Web Origins of the client that **issued the bearer token**. The trap is that the obvious client to reach for is the wrong one. In a fresh realm:

| Built-in client | Web Origins |
|---|---|
| `admin-cli` | *(empty)* |
| `account`, `account-console` | *(empty)* |
| `security-admin-console` | `+` |

`admin-cli` is the client every tutorial uses for `kcadm.sh`, and it has no Web Origins, so a browser app that authenticates with it is rejected before it ever reaches an admin endpoint:

```
POST /realms/cors-lab/protocol/openid-connect/token  (client_id=admin-cli)
403 {"error":"Invalid origin"}
```

Create your own public client for the admin SPA, give it the realm-management roles it needs, and set its Web Origins. Then it works:

```
GET /admin/realms/cors-lab/users?max=1
Origin: http://localhost:5173
→ 200, Access-Control-Allow-Origin: http://localhost:5173
```

One more thing worth knowing, because the official docs imply otherwise: the check on token-bearing endpoints uses the client's **current** configuration, not the `allowed-origins` claim baked into the token. We confirmed this by removing an origin from the client and replaying a token that still listed it in its claim — the request went from 200 to 403. Fixing Web Origins takes effect immediately; you do not need users to re-authenticate.

## When it is the proxy, not Keycloak

Two failures that no amount of Web Origins editing will fix. Both were reproduced with nginx in front of Keycloak.

**The proxy strips `Origin`.** A `proxy_set_header Origin "";` anywhere in the chain, or a gateway that normalizes headers, and Keycloak sees a same-origin request. It returns `200` and *no* `Access-Control-Allow-Origin` at all, so the browser blocks a perfectly successful response:

```
HTTP/1.1 200 OK
Content-Type: application/json
(no Access-Control-* headers)
```

**The proxy adds its own `Access-Control-Allow-Origin`.** Someone hit a CORS error, added `add_header Access-Control-Allow-Origin "*" always;` to the nginx config, and now every response carries two:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Origin: *
```

Chrome rejects this outright — *"the 'Access-Control-Allow-Origin' header contains multiple values ... but only one is allowed"* — so the well-meant fix breaks the requests that previously worked. Keycloak sets its own CORS headers on every OIDC endpoint. Your proxy must set none.

A smaller one: Keycloak does not send `Vary: Origin`. The endpoints that matter carry `Cache-Control: no-store` or `no-cache`, so a well-behaved CDN will not cache one origin's headers and serve them to another — but a CDN configured to override cache headers will, and the symptom is a CORS error that only some users see.

## When it is not CORS at all

- **The login redirect.** `/protocol/openid-connect/auth` sends no CORS headers and never has. It is a top-level navigation, not a fetch. If you see a CORS error there, your code is calling the authorization endpoint with `fetch()` instead of redirecting the browser. Use the redirect.
- **Discovery and JWKS work from any origin.** `/.well-known/openid-configuration` and `/protocol/openid-connect/certs` answer every origin, by design. "Discovery loads but the token call fails" is the normal shape of this bug, not a clue.
- **A 400 or 401 that you cannot read.** Once the origin is allowed, the browser hands you the response — and it often turns out the real error was [`invalid_grant`](/blog/keycloak-invalid-grant) or [`Invalid parameter: redirect_uri`](/blog/keycloak-invalid-redirect-uri) all along. CORS was hiding it.

## Reproduce the whole thing in a minute

```bash
docker run -d --name kc -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.7.3 start-dev

docker exec kc /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 --realm master --user admin --password admin

docker exec kc /opt/keycloak/bin/kcadm.sh create clients -r master \
  -s clientId=spa-exact -s publicClient=true \
  -s 'redirectUris=["http://localhost:5173/*"]' \
  -s 'webOrigins=["http://localhost:5173"]'

# allowed origin → 400 invalid_grant, but with CORS headers
# change 5173 to 3000  → 403 {"error":"Invalid origin"}, no CORS headers
curl -s -i -X POST \
  http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Origin: http://localhost:5173" \
  -d client_id=spa-exact -d grant_type=authorization_code -d code=x \
  | head -6

docker rm -f kc
```

Ten seconds of setup beats an afternoon of guessing which layer is lying to you.

## What the official docs cover

The [Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/index.html#_oidc_clients) describes the Web Origins field, and it is worth reading for the security rationale. Two gaps to be aware of: it documents the field mainly in terms of the `allowed-origins` claim being embedded in the token for *client adapters* to enforce — which describes the retired Java adapters, not what a modern Keycloak server does on its own endpoints — and it does not cover `+`, `*`, the matching rules, or the `Invalid origin` response. The tables above are the part that is missing.

## Stop it recurring

Put Web Origins in your realm export or Terraform, alongside redirect URIs, and use `+` so there is one list to get wrong instead of two:

```json
{
  "clientId": "spa",
  "publicClient": true,
  "redirectUris": ["https://app.example.com/*"],
  "webOrigins": ["+"],
  "attributes": { "post.logout.redirect.uris": "https://app.example.com/*" }
}
```

Then add one line to your smoke tests: a `POST` to the token endpoint with the production `Origin` header, asserting the response carries `Access-Control-Allow-Origin`. It catches the trailing slash before your users do.

---

Most CORS reports are a missing string in one field, and the expensive part is the hour spent proving which of the browser, the proxy and Keycloak is at fault. If you would rather not spend it, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with a 30-day Starter trial from $149/month. If you are staying self-hosted, the [Keycloak tutorials](/tutorials/) — the [first token walkthrough](/tutorials/getting-started/your-first-token/) covers the `allowed-origins` claim — and the [securing applications docs](/docs/securing-applications/javascript) cover the browser side of this.
