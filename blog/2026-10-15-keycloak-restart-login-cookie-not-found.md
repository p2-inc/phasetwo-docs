---
slug: keycloak-restart-login-cookie-not-found
title: '"Restart login cookie not found" in Keycloak'
date: 2026-10-15
authors: [jpatzer]
tags: [keycloak, troubleshooting, cookies, authentication, sessions]
description: "Keycloak's \"Restart login cookie not found\" means no KC_RESTART cookie arrived, never that it expired. Four branches, five causes, one fix. Tested on 26.8.0."
keywords:
  - restart login cookie not found keycloak
  - keycloak restart login cookie
  - keycloak cookie not found
  - kc_restart cookie
  - keycloak cookie_not_found
---

"Restart login cookie not found. It may have expired; it may have been deleted or cookies are disabled in your browser." Keycloak shows this on a dead-end HTTP 400 page, and the message is more confident than it should be. It means exactly one thing: the request arrived with **no `KC_RESTART` cookie at all**. Not a stale one, not a rejected one. None. That cookie has no expiry to run out, so "it may have expired" is the one explanation that is never true. A rejected cookie produces a different message. And the page tells the user to "Click Back to Application", which on a default client renders no link to click.

Here is what the cookie is for, how to tell in one log line which failure you have, and the one client field that turns the dead end into a recoverable page.

<!-- truncate -->

Everything below was reproduced against `quay.io/keycloak/keycloak:26.8.0` in `start-dev`.

## What `KC_RESTART` is

Keycloak sets three cookies when you hit the authorization endpoint:

```
Set-Cookie: AUTH_SESSION_ID=<snip>;Path=/realms/demo/;Secure;HttpOnly;SameSite=None
Set-Cookie: KC_AUTH_SESSION_HASH="<snip>";Path=/realms/demo/;Max-Age=60;Secure;SameSite=None
Set-Cookie: KC_RESTART=<snip>;Path=/realms/demo/;Secure;HttpOnly;SameSite=None
```

`AUTH_SESSION_ID` points at the server-side authentication session, which lives for the realm's **Login timeout** (`accessCodeLifespanLogin`, 1800 seconds out of the box), described in the admin console as "Max time a user has to complete a login."

`KC_RESTART` is the fallback. It is an encrypted JWE (`alg=dir`, `enc=A256GCM`) sealed with the realm's AES key, carrying the client id, the redirect URI, the protocol and the client notes: enough to rebuild the flow from scratch. It measured **836 bytes** on a realm with one plain OIDC client, it has **no `Max-Age`**, and Keycloak deletes it the moment a login completes. No `Max-Age` means it is a browser-session cookie: it dies when the browser session does, and never a minute sooner.

So the auth session is what times out, and the restart cookie is what rescues you when it does.

## The four branches, and how to tell them apart

When a request reaches `/realms/<realm>/login-actions/*` and the authentication session is not there, these are the four outcomes. The authorization endpoint itself never produces any of them, because it always starts a fresh flow. If you are seeing this error, the URL in the address bar contains `login-actions`.

| What Keycloak has | HTTP | What the user sees | Events logged |
|---|---|---|---|
| A usable `KC_RESTART` | 302 | The login page again, with "Your login attempt timed out. Login will start from the beginning." | `expired_code` with `restart_after_timeout="true"` |
| No `KC_RESTART`, no SSO session | 400 | **"Restart login cookie not found…"** | `cookie_not_found` |
| A `KC_RESTART` it cannot use | 400 | "An error occurred, please login again through your application." | `invalid_code`, then `cookie_not_found` |
| No `KC_RESTART`, but a live SSO session | 302 to the client | `error=temporarily_unavailable&error_description=authentication_expired` | `already_logged_in` |

The last row is checked after the other two failures, so an existing SSO session replaces the error page rather than adding to it. That is the case the user never sees.

Two things fall out of the table. First, a plain login timeout does **not** produce this error. With the restart cookie still in the browser you get a silent restart and a polite banner. If you are seeing the error, the cookie is gone, which means the browser never had it or threw it away.

Second, `error="cookie_not_found"` in the event log is not diagnostic on its own: rows two and three both log it. The distinguishing mark is whether an `invalid_code` event precedes it in the same request:

```bash
# Realm Settings → Sessions → Events, or:
kcadm.sh update events/config -r demo -s eventsEnabled=true \
  -s 'enabledEventTypes=["LOGIN","LOGIN_ERROR"]'
kcadm.sh get events -r demo -q type=LOGIN_ERROR -q max=10
```

```json
[ { "type": "LOGIN_ERROR", "clientId": "webapp",
    "ipAddress": "172.17.0.1", "error": "cookie_not_found" } ]
```

One `cookie_not_found` by itself is this error. An `invalid_code` immediately before it means the cookie *did* arrive and Keycloak refused it. That happens when the realm's AES key has been regenerated since the cookie was issued, when the client in the cookie has been deleted, or when the cookie belongs to a different client than the `client_id` in the URL. Deleting and recreating a realm's `aes-generated` key provider invalidates every outstanding `KC_RESTART` in every user's browser at once; so does restoring a realm from an export.

## The five ways the cookie goes missing

**1. The login page was opened in one cookie jar and submitted from another.** A login URL that gets bookmarked, forwarded, pasted into a chat, or opened by a password manager in a fresh window carries a valid `session_code` and no cookies. Both the `GET` and the `POST` of that URL return the error. This is the most common cause and the least interesting one: the link was never reusable.

**2. The browser threw the cookies away in between.** `KC_RESTART` and `AUTH_SESSION_ID` are both session cookies. A browser restart, "clear cookies on quit", closing the private window, or a mobile OS evicting a backgrounded tab all discard them while the login page is still on screen. The user comes back, clicks Sign In, and lands here.

**3. The cookies never reached the browser at all.** Keycloak marks all three `Secure; SameSite=None` unconditionally, so plain HTTP on a real hostname, an unset `proxy-headers`, a hostname the form posts to that the user never visited, or a proxy stripping a path prefix will all silently drop them. That family is the subject of its own post. [The Keycloak infinite redirect loop at login](/blog/keycloak-login-redirect-loop/) covers the diagnostics and the four fixes, and it is worth ruling out first if the error is reproducible rather than occasional.

**4. The login page is in an iframe.** `SameSite=None` is necessary for a third-party context but not sufficient: Safari blocks third-party cookies by default and will refuse them outright, and the flow dies at the first POST. Keycloak's own position is that the browser wins — its [JavaScript adapter](/docs/securing-applications/javascript) disables the session status iframe when it detects this. Use a top-level redirect for the login itself.

**5. It is not a user.** Uptime monitors, synthetic checks, load tests and crawlers replay captured login URLs without a cookie jar, and each attempt logs `cookie_not_found`. Every reproduction in this post was produced with `curl` and no cookie jar, which is precisely what your monitoring does. Before chasing a user-facing bug, check whether the events cluster on one IP or one user agent.

## Make the page recoverable: set the client's Home URL

The message ends with "Click Back to Application to login again." Whether that link exists depends on a client field most people leave blank. Keycloak's `error.ftl` renders it only when the client has a base URL:

```
<#if client?? && client.baseUrl?has_content>
    <p><a id="backToApplication" href="${client.baseUrl}">${msg("backToApplication")}</a></p>
</#if>
```

A client created through the admin console or `kcadm` has no `baseUrl` by default, so the error page comes back with **zero links on it**: a genuine dead end, telling the user to click something that is not there. Set it and the link appears:

```bash
kcadm.sh update clients/<id> -r demo -s baseUrl=https://app.example.com/
```

```html
<a id="backToApplication" href="https://app.example.com/">« Back to Application</a>
```

That is Clients → your client → Settings → **Home URL** in the admin console. It costs nothing, it applies to every Keycloak error page, and it converts the most common unrecoverable state in the login flow into one click.

## "Cookie not found" is the same error

If you are searching for "Cookie not found. Please make sure cookies are enabled in your browser.", you are looking at this error on an older server. Both strings are the same message key, `cookieNotFoundMessage`, raised from the same code path. The wording changed in the 26.1 line: 26.0 and earlier shipped the short sentence, 26.1 and later ship the long one. Nothing about the behaviour changed with it.

## Stop it recurring

There is no lifespan to tune here and no `KC_RESTART` setting to add. The cookie either arrives or it does not. What you can do:

1. **Set Home URL on every client.** One field, and the dead-end page gains an exit.
2. **Handle `authentication_expired` in the application.** When the SSO session is alive but the tab's auth session is not, Keycloak redirects to the client with `error=temporarily_unavailable&error_description=authentication_expired` rather than showing a page. Keycloak's guidance is to immediately resubmit the authentication request, which succeeds silently against the existing SSO session. An app that treats it as a hard failure shows the user an error for a state Keycloak already recovered from.
3. **Fix the cookie transport before anything else** if the error is reproducible rather than intermittent. Reproducible means configuration; intermittent means browsers and bots.
4. **Separate the bots from the users** in the event log before estimating impact, and raise the realm's Login timeout only if real users are genuinely taking more than 30 minutes to sign in — [session and token timeouts](/tutorials/sessions/timeouts/) covers what else that setting moves.

---

This error is cheap to diagnose once you know that it describes an absent cookie rather than an expired one, and that the event log distinguishes the two cases it covers. The expensive part is usually everything underneath it — the proxy, the hostnames, the TLS chain that decides whether the cookies arrive. If you would rather not own that, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with a 30-day Starter trial from $149/month, configured correctly on day one. Staying self-hosted is the right call for plenty of teams: [the redirect loop post](/blog/keycloak-login-redirect-loop/) covers the transport failures that cause most of these, [`invalid_grant`](/blog/keycloak-invalid-grant/) covers what breaks after the login page succeeds, and the [production checklist](/blog/keycloak-production-checklist/) has the proxy and hostname settings in one place.
