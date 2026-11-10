---
id: gateway
title: Protecting an existing application with Gateway
sidebar_label: Any website, with Gateway
description: Put Keycloak login in front of a website without adding an OIDC library. Make the origin require Gateway's secret, run correctly behind the proxy, and optionally verify the signed identity assertion.
keywords:
  - keycloak reverse proxy
  - protect website with keycloak without code
  - verify identity assertion jwt
  - oauth2-proxy alternative
---

The other guides in this section add an OIDC library to your application. This one doesn't.
With [Gateway](../self-service/gateway.md), Phase Two signs users in to your realm and forwards
their requests to your application. Your application only has to do two things:

1. **Refuse every request that didn't come through Gateway.** This is required.
2. **Behave well behind a reverse proxy.** Most applications already do.

Then, if your application wants to know who the user is, it can read headers or verify a signed
assertion.

Use Gateway when the application is a website people use in a browser and you don't want to
change its code: an internal tool, an admin console, a third-party dashboard, a staging
environment. Use an OIDC library instead when the application needs tokens of its own, such as a
single-page app calling your APIs, a mobile app, or an API used by other services.

The examples below use `admin.example.com` as the public hostname and
`https://admin-origin.example.com` as the origin. Set the app up in the dashboard first; it gives
you the **origin secret**, which is shown only once.

## 1. Require the origin secret

Gateway sends the secret in the `X-Phasetwo-Origin-Secret` header on every request it forwards.
Anyone who knows your origin's address can reach it directly, so the origin has to refuse any
request whose header doesn't match. Without this check, the login is optional.

The check must:

- **Cover every path**, including static files, health checks and anything added later. Put it in
  front of routing, not inside one route.
- **Answer `401` or `403`** when the header is missing or wrong. Gateway's verification treats a
  `404`, a redirect or an error as inconclusive and won't let you activate.
- **Let the verification path return `2xx`** when the secret is present.
- **Accept two secrets during a rotation.** Configure an optional second value now, so rotating
  later is a configuration change rather than a code change.

Keep the secret out of source control. Load it from your secrets manager or an environment
variable.

### nginx

Put the check in the `server` block so that it applies before any `location`:

```nginx title="/etc/nginx/conf.d/admin-origin.conf"
server {
    listen 443 ssl;
    server_name admin-origin.example.com;

    ssl_certificate     /etc/ssl/certs/admin-origin.pem;
    ssl_certificate_key /etc/ssl/private/admin-origin.key;

    # Defines $gateway_secret (and, during a rotation, $gateway_secret_next).
    include /etc/nginx/gateway-secret.conf;

    set $gateway_ok 0;
    if ($http_x_phasetwo_origin_secret = $gateway_secret) { set $gateway_ok 1; }
    # During a rotation, until the new secret is promoted:
    # if ($http_x_phasetwo_origin_secret = $gateway_secret_next) { set $gateway_ok 1; }
    if ($gateway_ok = 0) { return 403; }

    # Don't pass the secret on to the application, where it could end up in logs.
    proxy_set_header X-Phasetwo-Origin-Secret "";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $http_x_forwarded_host;
    proxy_set_header X-Forwarded-For $http_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;

    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

```nginx title="/etc/nginx/gateway-secret.conf (mode 0600, readable only by nginx)"
set $gateway_secret "p2os_...";
```

### Node.js (Express)

Register the middleware before anything else, including `express.static`:

```js title="gateway.js"
import { timingSafeEqual } from "node:crypto";

const secrets = [
  process.env.GATEWAY_ORIGIN_SECRET,
  process.env.GATEWAY_ORIGIN_SECRET_NEXT, // set only during a rotation
]
  .filter(Boolean)
  .map((s) => Buffer.from(s));

export function requireGateway(req, res, next) {
  const got = Buffer.from(req.get("x-phasetwo-origin-secret") ?? "");
  const ok = secrets.some(
    (s) => s.length === got.length && timingSafeEqual(s, got),
  );
  if (!ok) return res.status(403).send("Forbidden");
  next();
}
```

```js title="server.js"
import express from "express";
import { requireGateway } from "./gateway.js";

const app = express();
app.use(requireGateway);
// Requests only arrive through Gateway, so its X-Forwarded-* headers can be trusted.
app.set("trust proxy", true);
app.use(express.static("public"));
app.get("/healthz", (req, res) => res.send("ok"));
```

### Python (any WSGI application)

This middleware works for Flask, Django and anything else that speaks WSGI:

```python title="gateway.py"
import hmac
import os

SECRETS = [
    s.encode()
    for s in (
        os.environ.get("GATEWAY_ORIGIN_SECRET"),
        os.environ.get("GATEWAY_ORIGIN_SECRET_NEXT"),  # set only during a rotation
    )
    if s
]


class RequireGateway:
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        got = environ.get("HTTP_X_PHASETWO_ORIGIN_SECRET", "").encode()
        if not any(hmac.compare_digest(got, s) for s in SECRETS):
            start_response("403 Forbidden", [("Content-Type", "text/plain")])
            return [b"Forbidden"]
        return self.app(environ, start_response)
```

Wrap the application where it is created:

```python
# Flask
app.wsgi_app = RequireGateway(app.wsgi_app)

# Django, in wsgi.py
application = RequireGateway(get_wsgi_application())
```

### A load balancer or CDN

If a load balancer, API gateway or CDN sits in front of your origin, the check can live there
instead: a rule that returns `403` unless `X-Phasetwo-Origin-Secret` equals the secret. Make sure
the rule runs before any rule that serves content, and that nothing else routes around it.

Restricting the origin to Gateway's IP addresses is **not** a substitute. Gateway runs on a shared
edge network whose addresses other people can also send requests from. The secret is what proves
a request came through your app's Gateway.

### Then verify

In the dashboard, select **Verify origin**. Gateway sends four requests to your verification path:
with the secret, without it, with a wrong one, and with forged identity headers. It expects a
`2xx` for the first and a `401` or `403` for the rest. You can check the same thing yourself:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://admin-origin.example.com/healthz
# 403

curl -s -o /dev/null -w '%{http_code}\n' \
  -H "X-Phasetwo-Origin-Secret: $GATEWAY_ORIGIN_SECRET" \
  https://admin-origin.example.com/healthz
# 200
```

## 2. Run correctly behind Gateway

Gateway is a reverse proxy, so the usual rules for running behind one apply. These are the
details that matter.

**The `Host` header is the origin's hostname.** Gateway connects to your origin by its own name,
so TLS and virtual hosting work unchanged. The public hostname is in `X-Forwarded-Host`, and
`X-Forwarded-Proto` is always `https`. If your application builds absolute URLs, build them from
those headers or from configuration, not from `Host`.

**The client's IP address is in `X-Forwarded-For`** and in the standard `Forwarded` header.
Gateway replaces any values the browser sent rather than appending to them.

**Redirects to your origin's hostname are rewritten.** A `Location` header pointing at
`https://admin-origin.example.com/...` reaches the browser as `https://admin.example.com/...`.
Absolute links inside HTML pages are not rewritten, so prefer relative links.

**Cookies work as before.** A cookie your application sets with `Domain=admin-origin.example.com`
becomes a host-only cookie on the public hostname. Cookie names starting with `__Host-p2_` are
reserved for Gateway's session and are not passed in either direction.

**Responses are never shared-cached.** Every response is for one signed-in user, so Gateway
removes `public` and `s-maxage`, marks the response `private` unless it is already `private` or
`no-store`, and adds `Vary: Cookie`.

**Some request headers are not forwarded.** `Authorization`, `X-HTTP-Method-Override` and similar
method-override headers, and any header beginning with `X-Phasetwo-` that the browser sent, are
dropped. An application that relies on HTTP Basic authentication will stop seeing credentials.
Gateway's login replaces it.

**Paths under `/_p2/` belong to Gateway.** They are never forwarded. Gateway uses them for
sign-in, sign-out and its public keys.

**A base path in the origin URL is added for you.** With an origin URL of
`https://origin.example.com/admin`, a request for `/users` reaches your application as
`/admin/users`, and a redirect to `/admin/settings` reaches the browser as `/settings`.

**WebSockets are not supported yet.** Upgrade requests get a `501`.

**Your application's own login, if it has one, still runs.** Users will sign in twice. Turn it off,
or have the application sign users in from the identity Gateway sends.

## 3. Use the user's identity

This step is optional. Choose what Gateway sends in the app's **Identity sent to your origin**
settings.

### Headers

The simplest option. With headers enabled, your application receives some or all of:

| Header                     | Value                                 |
| -------------------------- | ------------------------------------- |
| `X-Phasetwo-Auth-User-Id`  | The user's ID in the realm (`sub`)    |
| `X-Phasetwo-Auth-Email`    | Email address                         |
| `X-Phasetwo-Auth-Username` | Username                              |
| `X-Phasetwo-Auth-Name`     | Full name                             |
| `X-Phasetwo-Auth-Groups`   | Groups, by full path, as a JSON array |
| `X-Phasetwo-Auth-Roles`    | Realm roles, as a JSON array          |

Gateway strips any `X-Phasetwo-` header a browser sends, so these values come from Gateway. But
your application can only rely on that because it rejects requests without the origin secret. If
the secret check is ever missing, anyone can send these headers directly. For anything that
matters, use the assertion.

### The signed identity assertion

With the assertion enabled, every request carries `X-Phasetwo-Auth-Assertion`: a JWT signed with
ES256, valid for 60 seconds, and issued for this app alone. Verifying it proves who the user is
independently of the network path.

Validate it with:

| Check           | Value                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Signature       | ES256, with keys from the JWKS URL on the app's page, or `https://admin.example.com/_p2/jwks.json` |
| `typ` header    | `p2-assertion+jwt`                                                                                 |
| `iss`           | The **assertion issuer** on the app's page                                                         |
| `aud`           | The **app ID**                                                                                     |
| `exp` and `nbf` | Current, allowing a few seconds of clock skew                                                      |

Besides `sub` and the standard JWT claims, it carries the claims you selected, such as `email`,
`groups` or `realm_roles`, and three that say where it came from: `p2_app` (the app ID),
`p2_deployment` (the realm's deployment ID) and `p2_issuer` (the realm's OIDC issuer).

Fetch keys from the JWKS URL and cache them, refetching when a token names a key ID you haven't
seen. Both libraries below do this, which is what lets Phase Two rotate signing keys without
breaking your application.

**Node.js**, with [`jose`](https://github.com/panva/jose):

```js
import { createRemoteJWKSet, jwtVerify } from "jose";

const keys = createRemoteJWKSet(
  new URL("https://admin.example.com/_p2/jwks.json"),
);

export async function currentUser(req) {
  const { payload } = await jwtVerify(
    req.get("x-phasetwo-auth-assertion"),
    keys,
    {
      issuer: process.env.GATEWAY_ASSERTION_ISSUER,
      audience: process.env.GATEWAY_APP_ID,
      algorithms: ["ES256"],
      typ: "p2-assertion+jwt",
      clockTolerance: 10,
    },
  );
  return payload; // payload.sub, payload.email, payload.groups, ...
}
```

**Python**, with [PyJWT](https://pyjwt.readthedocs.io/) (`pip install "pyjwt[crypto]"`):

```python
import os

import jwt

keys = jwt.PyJWKClient("https://admin.example.com/_p2/jwks.json")


def current_user(headers):
    token = headers["X-Phasetwo-Auth-Assertion"]
    if jwt.get_unverified_header(token).get("typ") != "p2-assertion+jwt":
        raise jwt.InvalidTokenError("not a Gateway assertion")
    return jwt.decode(
        token,
        keys.get_signing_key_from_jwt(token).key,
        algorithms=["ES256"],
        audience=os.environ["GATEWAY_APP_ID"],
        issuer=os.environ["GATEWAY_ASSERTION_ISSUER"],
        leeway=10,
        options={"require": ["exp", "iat", "sub"]},
    )
```

The assertion is for your application to read, not to pass on. It expires in a minute and is
bound to this app. If your application calls other services on the user's behalf, those services
need their own Keycloak tokens.

## 4. Add a sign-out link

Sign-out is a `POST` to `/_p2/logout` on the public hostname. It ends the Gateway session and the
user's Keycloak session:

```html
<form method="post" action="/_p2/logout">
  <button type="submit">Sign out</button>
</form>
```

A plain link to `/_p2/logout` works too. It shows a confirmation page with a sign-out button.
Gateway refuses a sign-out `POST` that comes from another site, so another site can't sign your
users out.

## 5. Handle an expired session in your frontend

When a session ends, a page load sends the user to the login page and then back to where they
were. Anything else, such as a `fetch` call or a form submission, gets a `401` instead, because
a redirect to a login page would be useless to it:

```json
{
  "error": "login_required",
  "login_url": "/_p2/auth/start?return_to=%2Fapi%2Freports"
}
```

Send the user to `login_url`, or reload the page:

```js
const res = await fetch("/api/reports");
if (res.status === 401) {
  const { login_url } = await res.json();
  window.location.assign(login_url);
}
```

## Before you activate

- [ ] A request to the origin without the secret gets `403`, on every path you try, including
      static files.
- [ ] **Verify origin** in the dashboard shows **Verified**.
- [ ] Sign-in returns to the page you started on.
- [ ] Redirects inside the application stay on the public hostname.
- [ ] If you use the identity headers or assertion, a user who shouldn't see something doesn't.
- [ ] The secret is in your secrets manager, not in a repository.

Then select **Activate**. Setup steps, access policies and secret rotation are in
[Gateway](../self-service/gateway.md).
