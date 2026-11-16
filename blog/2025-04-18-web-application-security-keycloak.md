---
title: Do You Need a WAF in Front of Keycloak?
slug: waf-keycloak
date: 2025-04-18
last_update:
  date: 2026-11-19
authors: [jpatzer]
tags: [keycloak, security, web_application_security, ddos, operations]
description: What a WAF in front of Keycloak can see, the rules worth writing for the token and admin paths, and what the edge cannot stop. Tested on Keycloak 26.8.2.
keywords:
  [
    keycloak waf,
    waf for keycloak,
    keycloak ddos protection,
    keycloak edge security,
    keycloak reverse proxy security,
  ]
---

A WAF in front of Keycloak buys you four things Keycloak cannot do for itself: it absorbs volumetric floods that would otherwise fill your network link, it rate-limits by IP address and path, it fences the admin paths to networks you name, and it scores clients that are not real browsers. It does not reduce what a single login costs your CPU, it cannot see a campaign spread thinly across thousands of addresses, and it cannot write a rule about which OAuth client or grant type a request is using, because on the token endpoint both of those live in the request body. So the honest answer to "do I need a WAF" is: if your login page is public, yes, and it covers about half of what you need. The other half is Keycloak configuration that no edge device can do for you.

<!-- truncate -->

This post is about the edge half. The Keycloak half (the HTTP queue limit, the password-grant rejection, where a CAPTCHA has to sit to save CPU) is measured in [Layer-7 floods against Keycloak](/docs/security/layer-7-floods), and the whole picture is in [securing Keycloak in production](/docs/security/).

Everything below was checked on 2026-11-16 against `quay.io/keycloak/keycloak:26.8.2` started in production mode (`start --http-enabled=true --hostname-strict=false`). Where a header value or an error message appears, it came out of a terminal.

## What an edge rule can actually see

A WAF rule is written against the parts of a request that arrive before the application reads the body: the address, the method, the path, the query string, the headers, and in some products a sampled TLS or HTTP/2 fingerprint. Here is how that maps onto Keycloak's endpoints.

| Request attribute                                                | Visible to an edge rule?                        | What it lets you do with Keycloak                                  |
| ---------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| Client IP                                                        | Yes                                             | Per-IP rate limits, allowlists, geo and ASN rules                  |
| Path                                                             | Yes                                             | Different limits for the expensive paths than for static resources |
| Realm                                                            | Yes — it is a path segment, `/realms/{realm}/…` | Per-realm limits; fence one realm and not another                  |
| `client_id` on the browser login paths                           | Yes — it is in the query string                 | Scope a rule to one client's browser login                         |
| `client_id` and `grant_type` on `/protocol/openid-connect/token` | **No** — form body only                         | Nothing. See below                                                 |
| Username, password, refresh token                                | No — form body                                  | Nothing                                                            |
| TLS / HTTP client fingerprint                                    | Yes, in products that offer it                  | Bot scoring on the browser paths                                   |

The browser row is real and useful: Keycloak puts `client_id` in the query string of the authorization request _and_ in the form action of the login page it renders, so the POST that carries the password carries the client in the URL too:

```
action="http://localhost:8080/realms/master/login-actions/authenticate?session_code=4_WqGIPNbOx7eP…&execution=ca458acf-…&client_id=security-admin-console&tab_id=ws9Rk9XddIo"
```

The token endpoint row is the one that defeats a rule people reach for first.

## Why "block the password grant on admin-cli" cannot be an edge rule

The request an attacker scripts is one `POST` to the token endpoint. Its path is the same for every client and every grant type in the realm; the only thing that distinguishes them is the form body. Keycloak will not read either field from anywhere else, so you cannot persuade your own clients to put them somewhere a rule can see:

```console
$ curl -s -X POST "$KC/realms/master/protocol/openid-connect/token?client_id=admin-cli" \
    -d "grant_type=password&username=admin&password=wrong"
{"error":"invalid_client","error_description":"Invalid client or Invalid client credentials"}

$ curl -s -X POST "$KC/realms/master/protocol/openid-connect/token?grant_type=password" \
    -d "client_id=admin-cli&username=admin&password=wrong"
{"error":"invalid_request","error_description":"Missing form parameter: grant_type"}
```

Some WAFs can inspect a form-encoded body. Even then the rule is worth little, because the attacker chooses the `client_id`, every realm ships with the same built-in clients, and a rule naming one of them moves the flood to the next. Confidential clients make it worse: their `client_id` can arrive inside an `Authorization: Basic` header instead of the body.

Limit the token path as a whole at the edge, and kill the grant inside Keycloak with a [client policy](/docs/security/client-policies). That is the division of labour for most of this post.

## The rules worth writing

| Path                                                                              | Rule                                              | Why                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `/realms/*/protocol/openid-connect/token`, `/realms/*/login-actions/authenticate` | The tightest per-IP rate limit you can live with  | Every request here can cost a full password hash  |
| `/realms/*/protocol/openid-connect/auth`, registration, reset password            | A moderate limit, plus bot scoring or a challenge | Renders a page, creates a session, or sends email |
| `/resources/`                                                                     | No limit; cache it instead                        | Static theme assets, served from memory           |
| `/admin/`                                                                         | Allowlist your networks                           | Admin console and the Admin REST API              |
| `/realms/master/`                                                                 | Allowlist the same networks                       | The admin realm's own login. See below            |
| `/metrics`, `/health`, port 9000                                                  | Never exposed                                     | Management port, not part of the public surface   |

Keycloak's own [reverse proxy guide](https://www.keycloak.org/server/reverseproxy) publishes a version of that exposure table and is worth following. What it does not tell you is how to size the limits, so: a single cold browser login on 26.8.2 is **three dynamic requests** (the authorization request, the form POST, and the token exchange) plus **five static requests** for the theme CSS, the favicon and one script. A warm cache drops the five. If the limit counts every path, as most per-IP limits do, an office behind one NAT address can reach it with a few dozen people signing in at the start of the day. Count logins, multiply by eight, then decide.

### Fencing `/admin` does not protect the admin realm

This is the one most teams get wrong, because the rule looks complete. `/admin` serves the console SPA and the Admin REST API, and blocking it does stop a stranger loading the console in a browser. It does not stop them attacking the admin realm's credentials, because the authentication happens somewhere else entirely. Here is a full `security-admin-console` login, run with `curl` against 26.8.2. Every request is under `/realms/master/`, and not one is under `/admin`:

```console
GET  /realms/master/protocol/openid-connect/auth?client_id=security-admin-console&…   200
POST /realms/master/login-actions/authenticate?session_code=…&client_id=security-admin-console   302
POST /realms/master/protocol/openid-connect/token   (grant_type=authorization_code)   200
```

The authorization code comes back in the `Location` header of the second response, so the attacker never has to follow the redirect into `/admin` to finish. And the shorter version skips the browser entirely:

```console
POST /realms/master/protocol/openid-connect/token
     client_id=admin-cli&grant_type=password&username=admin&password=…
```

So the edge rule has to cover `/realms/master/` as well, and the Keycloak side has to cover the clients: [disabling `admin-cli` and the account clients](/blog/keycloak-disable-admin-cli-account-clients) is the companion change. Restricting the console with `hostname-admin` is not a substitute either. It changes the URLs Keycloak generates, and the upstream [hostname guide](https://www.keycloak.org/server/hostname) says plainly that it "does not prevent accessing the Administration REST API endpoints via the frontend URL". The restriction has to be at the proxy.

Be aware of what you break. An allowlist on `/realms/master/` stops CI pipelines and Terraform runs that fetch an admin token from outside your network, and it stops realm-scoped admins if you created any in the master realm. Decide where that automation lives before you write the rule, not after.

## What a CDN may and may not cache

A CDN is the other half of the edge story, and the useful part is narrow. Measured on 26.8.2:

| Path                                                        | `Cache-Control` on 26.8.2                           | Cache at the edge?                   |
| ----------------------------------------------------------- | --------------------------------------------------- | ------------------------------------ |
| `/resources/{version}/…` (theme CSS, JS, images)            | `max-age=2592000`                                   | Yes. This is the whole prize         |
| `/realms/{realm}/protocol/openid-connect/auth` (login page) | `no-store, must-revalidate, max-age=0`              | **Never**                            |
| `/realms/{realm}/login-actions/authenticate`                | `no-store, must-revalidate, max-age=0`              | **Never**                            |
| `/realms/{realm}/.well-known/openid-configuration`          | `no-cache, must-revalidate, no-transform, no-store` | No, and it is already cheap to serve |
| `/realms/{realm}/protocol/openid-connect/certs` (JWKS)      | `no-cache`                                          | No                                   |
| `/admin/…`, `/realms/{realm}/account/`                      | `no-cache`                                          | No                                   |

The thirty-day `max-age` on theme resources is safe because the path carries a version segment — `/resources/tvopk/login/keycloak.v2/css/styles.css` — that is derived from the build. It stayed the same across restarts of the same image and changed when we started the same image in development mode instead, so an upgrade naturally produces new URLs rather than stale cached assets.

The danger is a "cache everything" page rule applied to the hostname. A cached login page is not merely wrong, it is a working session belonging to someone else: that response sets `AUTH_SESSION_ID`, `KC_RESTART` and `KC_AUTH_SESSION_HASH` scoped to `/realms/{realm}/`, and embeds a single-use `session_code` in the form action. Serve one user's copy to the next and you get [restart login cookie not found](/blog/keycloak-restart-login-cookie-not-found) at best. Respect `no-store`, and if you want a safelist instead of trusting it, cache `/resources/` and nothing else.

## Geo and ASN rules: what they actually buy

Country blocking is worth doing only when your user base is genuinely bounded: an internal tool for one country, or a regulated service that cannot be used elsewhere. It is trivially bypassed with a proxy, so treat it as noise reduction, not a control. Logging in on holiday is the support ticket it generates.

ASN rules are the better instrument. Login traffic from cloud and hosting providers is almost never human, so a rule that challenges or blocks the datacenter ASNs on the login paths removes a visible share of scripted attempts for very few false positives, as long as you exclude the ASNs your own backends come from. Neither rule touches the campaigns that matter most: residential proxy networks sell exactly the residential addresses and plausible geography your rules are configured to allow.

## What the edge cannot do, however good it is

- **Make a login cheaper.** A password check costs a full hash whether it arrived through a WAF or not, which is why a flood is an amplification attack on your CPU. The sizing, the queue limit and the CAPTCHA placement are all in [Layer-7 floods against Keycloak](/docs/security/layer-7-floods).
- **See a distributed campaign.** Attempts spread across thousands of addresses, a few per address, sit under every per-IP limit including ours. That is what bot scoring and a CAPTCHA that fails closed are for, and why [credential stuffing](/docs/security/credential-stuffing) is a Keycloak-side problem.
- **Protect a path it is not in front of.** If the origin still answers on its own address, every rule above is advisory. Lock the origin to the edge's addresses, or to a shared secret header the edge sets and your proxy requires.
- **Be trusted blindly for the client IP.** Once you terminate TLS at an edge you need `proxy-headers=xforwarded` or Keycloak logs and rate-limits the proxy's address. But `proxy-trusted-addresses` defaults to trusting every source, so anyone who reaches the origin directly can then forge the client IP in your audit log. Set both together; the [production readiness checklist](/blog/keycloak-production-checklist) has the demonstration.
- **Replace brute force detection.** It is counted per user, inside Keycloak, and the edge has no view of accounts at all.

## So: do you need one?

| Your deployment                                     | Verdict                                                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Realm reachable only from a VPN or private network  | No. Spend the effort on `/realms/master/` access and the client settings instead                                                                  |
| Public login for employees or a known customer list | A per-IP rate limit and an `/admin` plus `/realms/master/` allowlist. That is most of the value                                                   |
| Public CIAM, consumer scale, registration open      | Yes, with bot scoring on the browser paths, and a CDN or scrubbing service for volumetric cover                                                   |
| Already on managed hosting                          | Check what the per-IP limits are before adding a second layer; two rate limiters that cannot see each other produce support tickets, not security |

The last row applies to us too. Phase Two [managed Keycloak](/hosting/dedicated-clusters/) clusters sit behind a firewall with per-IP [rate limits by tier](/docs/security/rate-limiting) and optional IP restrictions on the admin paths, and that is the ceiling of what per-IP limiting can do for anyone: it does not stop a distributed campaign, and we say so on the page. Tell us before you put your own CDN in front, because the limit then counts your CDN's addresses rather than your users'.

Start with the Keycloak half, because it is free and it is where the amplification lives: reject the password grant, put the CAPTCHA before the password, set a queue limit. Then write the edge rules above. If you would rather inherit that configuration than build it, our clusters ship with it and our SOC 2 Type II and ISO 27001 reports are in the [Trust Center](https://trust.phasetwo.io).
