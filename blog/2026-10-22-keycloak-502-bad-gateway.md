---
slug: keycloak-502-bad-gateway
title: "Keycloak 502 Bad Gateway behind a reverse proxy"
date: 2026-10-22
authors: [gpatil]
tags: [keycloak, troubleshooting, proxy, nginx, ops]
description: A Keycloak 502 Bad Gateway is always the proxy, never Keycloak. Six error-log lines, what each one means, and the fix — measured on Keycloak 26.8.1 and nginx 1.29.
keywords:
  - keycloak 502 bad gateway
  - keycloak nginx 502
  - keycloak reverse proxy
  - keycloak proxy-headers
  - upstream sent too big header
---

A Keycloak 502 Bad Gateway never comes from Keycloak. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110#status.502) defines 502 as a status a gateway emits about *its upstream* — so the proxy is telling you it could not get a usable response out of Keycloak, and the explanation is in the proxy's error log rather than anywhere in Keycloak's configuration. Start there, every time. In nginx there are only six lines that produce a 502 in front of Keycloak, each maps to one cause, and three of the six are the Quarkus-era port layout catching out a config written for an older release.

Everything below was reproduced against **Keycloak 26.8.1** behind **nginx 1.29**, and every error string is copied out of a real run.

<!-- truncate -->

## The six lines, and what each one means

Run one failing request and read `error.log`. This table is the whole diagnosis:

| nginx `error.log` | What it means | Fix |
|---|---|---|
| `connect() failed (111: Connection refused)` | Nothing is listening on the port you proxy to | Check the port matrix below |
| `no live upstreams while connecting to upstream` | The proxy has marked every backend down — usually a health check on the wrong port | Probe `:9000/health/ready`, not `:8080/health` |
| `SSL_do_handshake() failed (SSL: error:0A00010B:SSL routines::wrong version number)` | `proxy_pass https://` to a plaintext Keycloak | Use `http://`, or give Keycloak a certificate |
| `upstream prematurely closed connection while reading response header` | `proxy_pass http://` to a TLS Keycloak | Use `https://`, or set `http-enabled=true` |
| `upstream SSL certificate verify error: (18:self-signed certificate)` | Re-encrypt mode, and Keycloak's certificate is not in the proxy's trust store | Trust it explicitly, or terminate at the edge |
| `upstream sent too big header while reading response header` | A response header exceeded `proxy_buffer_size` | Raise the buffers — see below |

If the log says `upstream timed out`, you have a 504, not a 502, and it is a different problem. Keycloak answered too slowly; the proxy never failed to reach it.

## The port matrix

Most `Connection refused` reports are this table. Which ports Keycloak opens depends on the start command and on whether you gave it key material — and nothing about the proxy config tells you which case you are in:

| Keycloak started with | `:8080` | `:8443` |
|---|---|---|
| `start-dev` | listens | refused |
| `start`, certificate configured | refused | listens |
| `start --http-enabled=true`, no certificate | listens | refused |
| `start`, no certificate, no `http-enabled` | **the server does not start** | — |

That last row is the one that wastes an afternoon. The container exits before it binds anything, the proxy reports `Connection refused`, and the actual message is in the Keycloak log:

```console
Key material not provided to setup HTTPS. Please configure your keys/certificates,
or if HTTPS access is not needed see the `http-enabled` option. If you meant to
start the server in development mode, see the `start-dev` command.
```

The second row is the other half. A config that worked against `start-dev` on a laptop and proxies to `http://keycloak:8080` finds nothing there once the server has a certificate, because production Keycloak does not open 8080 unless you ask it to.

Note also that `:9000` is a third listener, for health and metrics, and it only opens when you enable one of them. Keycloak's own guidance is that [you should not proxy it](https://www.keycloak.org/server/reverseproxy): "You should not proxy port 9000 because health checks and metrics use that port directly, and you do not want to expose this information to external callers."

## The TLS mismatch, in both directions

The two handshake errors are the same mistake pointing opposite ways, and they are worth telling apart because the second one does not look like a TLS problem at all.

```console
# proxy_pass https://keycloak:8080  — proxy speaks TLS, Keycloak speaks plaintext
SSL_do_handshake() failed (SSL: error:0A00010B:SSL routines::wrong version number)
  while SSL handshaking to upstream

# proxy_pass http://keycloak:8443  — proxy speaks plaintext, Keycloak speaks TLS
upstream prematurely closed connection while reading response header from upstream
```

`upstream prematurely closed connection` is a generic string that also appears when a backend crashes mid-request, which is why it sends people hunting for an OOM kill that never happened. Before you go looking at memory, check the scheme against the port.

If you run re-encrypt — the mode the Keycloak docs recommend for production, where the proxy terminates the client connection and opens a new TLS connection to Keycloak — then verification is the next thing to get wrong:

```console
upstream SSL certificate verify error: (18:self-signed certificate)
  while SSL handshaking to upstream
```

nginx does not verify upstream certificates by default, so this only appears once you have correctly turned `proxy_ssl_verify on`. Point `proxy_ssl_trusted_certificate` at the CA that signed Keycloak's certificate rather than at the system bundle, and keep `proxy_ssl_server_name on` so SNI matches.

## When only the login page 502s

This is the one that reads as impossible: the discovery document is fine, the admin console is fine, and `/protocol/openid-connect/auth` returns 502 for some clients and not others.

Keycloak sets `KC_RESTART` on the authorization endpoint — an encrypted token carrying the auth session, including the `redirect_uri` and the `state` your application sent. So the size of the response headers is controlled by your *client*, not by Keycloak. Measuring the response header block against the length of `state`, with a short `redirect_uri`:

| `state` length | Keycloak response headers | Through nginx defaults |
|---|---|---|
| 0 | 1,728 B | 200 |
| 800 | 3,148 B | 200 |
| 1,320 | 4,076 B | 200 |
| **1,340** | **4,111 B** | **502** |
| 1,500 | 4,396 B | 502 |

The break is at 4,096 bytes, which is nginx's default `proxy_buffer_size` — one memory page. Roughly 1.8 bytes of response header per byte of `state`, so an OIDC library that packs a PKCE verifier, a nonce and a return URL into `state`, or a client with a long `redirect_uri`, crosses it while a simpler client on the same realm never does. Raising the buffers clears it:

```nginx
location / {
    proxy_pass http://keycloak:8080;
    proxy_buffer_size        16k;
    proxy_buffers          8 16k;
    proxy_busy_buffers_size  32k;
}
```

Re-measured with those three lines, a `state` of 3,000 characters and 7,061 bytes of response headers returns 200. This is a header-*size* limit, not a token-size limit — the request-side version of the same squeeze shows up as [HTTP 431](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/431) and is a different fix.

## When every request 502s after an upgrade

Keycloak serves health and metrics on the management port, and `/health` on the main port is simply not a route:

| | `:8080` | `:9000` |
|---|---|---|
| `/health` | 404 | 200 |
| `/health/ready` | 404 | 200 |

A readiness probe or load-balancer health check still pointed at `http://keycloak:8080/health` gets a 404, marks the backend unhealthy, and every request through the proxy becomes a 502 even though Keycloak is serving traffic normally. The log line is the giveaway, because it is about the pool rather than about one connection:

```console
no live upstreams while connecting to upstream
```

Two things to check together: the probe URL must be `:9000/health/ready`, and `health-enabled` must be `true` — the management port does not open at all unless health or metrics is enabled, so a probe against `:9000` on a default server is also refused.

## What a 502 is not

Three failures sit next to this one and none of them produce a 502:

- **403 Forbidden** on requests through the proxy means `proxy-headers` is unset. The Keycloak docs are explicit: "If you are using a reverse proxy for anything other than TLS passthrough and do not set the `proxy-headers` option, then by default you will see 403 Forbidden responses to requests via the proxy that perform origin checking." Set `proxy-headers=xforwarded` (or `forwarded`), and never with TLS passthrough.
- **504 Gateway Timeout** is Keycloak being slow, not unreachable.
- **A login that bounces** is a cookie problem, covered in [Keycloak infinite redirect loop at login](/blog/keycloak-login-redirect-loop).

## Stop it recurring

Pin the proxy-side settings next to the server-side ones, so the pair cannot drift apart:

```properties title="conf/keycloak.conf"
hostname=https://auth.example.com
http-enabled=true
proxy-headers=xforwarded
proxy-trusted-addresses=10.0.0.0/8
health-enabled=true
```

Then assert it in CI. One request through the public URL for `/realms/<realm>/.well-known/openid-configuration` and one for `:9000/health/ready` catches every cause above on the commit that introduces it — the first fails on a wrong port, a wrong scheme, an untrusted certificate or undersized buffers, and the second fails on the probe that would otherwise take the whole pool down an hour later. The [Keycloak production checklist](/blog/keycloak-production-checklist) has the rest of the settings that belong in that file.

---

A 502 is a short debugging session once you accept that the answer is in the proxy's log and not in Keycloak's. If you would rather not own the proxy, the certificate chain and the port layout across upgrades, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with a 30-day Starter trial from $149/month, configured and probed correctly on day one. Staying self-hosted is the right call for plenty of teams: [CORS errors](/blog/keycloak-cors-errors) and [403 Forbidden](/blog/keycloak-403-forbidden) cover the two failures most often mistaken for this one, and [custom domains](/docs/self-service/custom-domains) covers the hostname side of putting Keycloak behind a name your users type.
