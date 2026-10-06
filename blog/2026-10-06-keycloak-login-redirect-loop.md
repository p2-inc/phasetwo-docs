---
slug: keycloak-login-redirect-loop
title: "Keycloak infinite redirect loop at login"
date: 2026-10-06
authors: [jpatzer]
tags: [keycloak, troubleshooting, cookies, proxy, oidc]
description: A Keycloak infinite redirect loop at login is almost always a dropped cookie. Three diagnostics that name the cause and four fixes, tested on Keycloak 26.8.0.
keywords:
  - keycloak login loop infinite redirect
  - keycloak redirect loop
  - keycloak cookie not found
  - keycloak samesite cookie
  - keycloak x-forwarded-proto
---

A Keycloak infinite redirect loop at login almost always means one thing: a cookie Keycloak set on the way to the login page did not come back on the way out of it. Keycloak has no session to resume, so it starts the flow again, and the browser bounces between your application and `/protocol/openid-connect/auth` until it gives up.

The reason this is so common is in the `Set-Cookie` headers. Keycloak 26.8.0 marks **every** cookie in the login flow `Secure; SameSite=None`, unconditionally — there is no setting that relaxes it. A browser will not store a `Secure` cookie that arrives over plain `http://`, and it will not store `SameSite=None` without `Secure`. So the loop is usually not an OIDC problem at all. It is a transport problem that the OIDC layer reports as a lost session.

<!-- truncate -->

Everything below was reproduced against Keycloak 26.8.0 in `start-dev`.

## Three diagnostics, in order

Do these before changing any configuration. Together they name the cause in about a minute.

1. **Read the Keycloak server log during one failing attempt.** A dropped cookie produces a specific event:

   ```
   WARN [org.keycloak.events] type="LOGIN_ERROR", realmId="369ce479-...",
   realmName="master", clientId="loopdemo", userId="null",
   ipAddress="172.17.0.1", error="cookie_not_found"
   ```

   `error="cookie_not_found"` means Keycloak received the request and found no auth session cookie on it. That is causes 1 through 4 below. No event at all means the browser is looping before it reaches Keycloak — that is cause 5.

2. **Look at the URL the loop lands on.** If it carries `error=login_required`, the loop is a silent SSO check, not a login:

   ```
   https://app.example.com/cb?error=login_required&state=xyz&iss=https%3A%2F%2Fauth.example.com%2Frealms%2Fmaster
   ```

3. **Compare the host in the browser's address bar with the host in the login form's `action` attribute.** If they differ, you have cause 3, and nothing else needs investigating.

## What Keycloak actually sets

Requesting the authorization endpoint over plain HTTP, with no proxy headers:

```
Set-Cookie: AUTH_SESSION_ID=<snip>;Version=1;Path=/realms/master/;Secure;HttpOnly;SameSite=None
Set-Cookie: KC_AUTH_SESSION_HASH="<snip>";Version=1;Path=/realms/master/;Max-Age=60;Secure;SameSite=None
Set-Cookie: KC_RESTART=<snip>;Version=1;Path=/realms/master/;Secure;HttpOnly;SameSite=None
```

After a successful password POST, `KEYCLOAK_IDENTITY` and `KEYCLOAK_SESSION` arrive with the same three attributes. Note the `Path`: `/realms/<realm>/`, not `/`.

One detail explains most "but it works on my laptop" reports. Browsers treat `localhost`, `127.0.0.1` and `[::1]` as [potentially trustworthy origins](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_contexts), so they accept `Secure` cookies there over plain HTTP. The same image on a real hostname over plain HTTP drops all five cookies. Local development cannot reproduce this class of bug.

## Cause 1: plain HTTP on a real hostname

The browser silently discards every cookie above, posts the login form without `AUTH_SESSION_ID`, and gets HTTP 400 with "Restart login cookie not found. It may have expired; it may have been deleted or cookies are disabled in your browser." Clicking back to the application restarts the flow, which is the loop.

**Fix:** terminate TLS. There is no supported way to make Keycloak emit these cookies without `Secure`.

## Cause 2: TLS at the proxy, `proxy-headers` unset

`proxy-headers` has **no default value**. If a proxy terminates TLS and you have not set it, Keycloak builds URLs and evaluates origins as if the request arrived on `http://` at the backend address. The Keycloak docs are explicit about the consequence: "If you are using a reverse proxy for anything other than TLS passthrough and do not set the `proxy-headers` option, then by default you will see 403 Forbidden responses to requests via the proxy that perform origin checking."

**Fix:** set it to match what your proxy sends, and set the hostname explicitly.

```
KC_PROXY_HEADERS=xforwarded     # X-Forwarded-For/-Proto/-Host/-Port/-Prefix
KC_HOSTNAME=https://auth.example.com
```

Use `forwarded` instead if your proxy emits the RFC 7239 `Forwarded` header. Never set either with TLS passthrough.

## Cause 3: the form posts to a host that never saw the cookie

With `hostname` set to an absolute URL, Keycloak does not redirect requests that arrive elsewhere. It renders the login page on whatever host you reached, with the form action pointing at the configured one:

```
# request arrives at http://10.0.1.7:8080/, KC_HOSTNAME=https://auth.example.com
action="https://auth.example.com/realms/master/login-actions/authenticate?session_code=..."
```

The browser stored `AUTH_SESSION_ID` for the first host and posts to the second, which receives no cookie. That POST returns 400 and logs `error="cookie_not_found"`. Health checks hitting the pod IP, a second ingress, and an internal DNS name used by one service all produce this.

The mirror image is `hostname-strict=false`, where the issuer floats with the request headers:

| Request | `issuer` in the discovery document |
|---|---|
| `X-Forwarded-Host: auth.example.com`, `X-Forwarded-Proto: https` | `https://auth.example.com/realms/master` |
| no forwarded headers | `http://10.0.1.7:8080/realms/master` |

Two routes to the same server mint tokens with two issuers. Whichever one your application did not configure gets rejected, and a rejected token sends the user back to login.

**Fix:** set `hostname` to the exact absolute URL users reach, leave `hostname-strict` at its default of `true`, and make every other route to Keycloak fail rather than work.

## Cause 4: a path prefix the proxy strips

Serving Keycloak under `/auth` and stripping the prefix before it reaches the server leaves the cookie scoped to the wrong path — the browser is at `/auth/realms/master/...` and the cookie says `/realms/master/`. Adding the header fixes the scope:

```
# no X-Forwarded-Prefix
Set-Cookie: AUTH_SESSION_ID=<snip>;Path=/realms/master/;Secure;HttpOnly;SameSite=None
# X-Forwarded-Prefix: /auth
Set-Cookie: AUTH_SESSION_ID=<snip>;Path=/auth/realms/master/;Secure;HttpOnly;SameSite=None
```

**Fix:** send `X-Forwarded-Prefix` from the proxy (and set `proxy-headers=xforwarded`), or stop stripping the prefix and set `KC_HTTP_RELATIVE_PATH=/auth`. Pick one; doing both double-prefixes every URL.

## Cause 5: the loop Keycloak never sees

Two variants, neither of which logs anything on the server.

**Silent check-SSO.** `keycloak-js` with `onLoad: 'check-sso'` sends `prompt=none`. With the session cookies present Keycloak returns a code; without them it returns `error=login_required` — and an app that treats that as "start a login" loops. Keycloak's JavaScript adapter documentation is direct about why the cookies go missing: silent `check-sso` "is not supported and falls back to regular (non-silent) `check-sso` by default" when the browser blocks cookies in third-party contexts, and the session status iframe "is automatically disabled if such browser behavior is detected". Safari blocks third-party cookies by default and Firefox partitions them, so this reproduces today regardless of what Chrome does. Handle `login_required` as a terminal "not logged in" state, and keep `silentCheckSsoFallback` at its default.

**Your own session cookie.** With `response_mode=form_post`, Keycloak returns an auto-submitting cross-site POST:

```html
<BODY Onload="document.forms[0].submit()">
  <FORM METHOD="POST" ACTION="https://app.example.com/cb">
```

A `SameSite=Lax` application session cookie is sent on top-level GET navigations and **not** on that POST. The framework sees no session, redirects to Keycloak, and loops. Either use `response_mode=query`, or mark the application's session cookie `SameSite=None; Secure`.

## Verify the fix without guessing

Keycloak ships the answer as a page. Set `KC_HOSTNAME_DEBUG=true` and open `/realms/master/hostname-debug` — it prints the frontend, backend and admin URLs the server will actually generate, next to the headers it received:

```
URL       Value                     Header             Value
Frontend  https://auth.example.com/ Host               proxy.example.com
Backend   https://auth.example.com/ X-Forwarded-Host   proxy.example.com
Admin     https://auth.example.com/ X-Forwarded-Proto  https
```

If the three URLs are not what users type, stop and fix that first. Turn the option off afterwards — it is off by default for a reason.

## Stop it recurring

Pin the four values in your deployment manifest rather than discovering them again next quarter, and treat any route that does not go through the proxy as a bug:

```
KC_HOSTNAME=https://auth.example.com
KC_HOSTNAME_STRICT=true
KC_PROXY_HEADERS=xforwarded
KC_HTTP_ENABLED=true          # only because the proxy terminates TLS
```

Then assert it. One CI check that fetches `/realms/<realm>/.well-known/openid-configuration` through the public URL and asserts `issuer` equals the configured hostname catches causes 2, 3 and 4 on the commit that introduces them. It is three lines of `curl` and `jq`, and it is the only one of these failures that is cheap to detect before users find it.

---

Redirect loops are rarely hard once you know which of the five it is; they are expensive because nothing in the browser says "cookie discarded" and the server log entry is one line among thousands. If you would rather not own the proxy, the hostname settings and the TLS chain, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with a 30-day Starter trial from $149/month, terminated and configured correctly on day one. Staying self-hosted is the right call for plenty of teams: [`invalid_grant`](/blog/keycloak-invalid-grant) covers the errors that appear once the loop clears, [`Invalid parameter: redirect_uri`](/blog/keycloak-invalid-redirect-uri) covers the other half of callback failures, the [production checklist](/blog/keycloak-production-checklist) has the rest of the proxy settings, and the [JavaScript adapter docs](/docs/securing-applications/javascript) cover `check-sso` setup end to end.
