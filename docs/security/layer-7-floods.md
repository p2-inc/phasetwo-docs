---
id: layer-7-floods
title: Keycloak DDoS and Login Floods at Layer 7
description: Why a Keycloak login flood is a CPU amplification attack, which endpoints are expensive, and what Keycloak, a WAF, and a DDoS service each do against it.
---

A login flood against Keycloak is an amplification attack on CPU. The attacker sends one small `POST` with a username and a wrong password, and Keycloak answers it by computing a full password hash, which is deliberately slow. On our test node, a failed password login cost about 60 times as much as serving the OpenID discovery document, so about a hundred requests per second from a single laptop saturated a node that serves thousands of ordinary requests per second. Keycloak has a few controls that change that ratio or keep the node responsive, but none of them stop a large or distributed flood. That job belongs in front of Keycloak, at a WAF, CDN, or DDoS service.

This page covers which Keycloak endpoints are expensive, what Keycloak can do about a flood itself, what it can't, and which edge tools cover the rest. Every Keycloak behavior described here was reproduced on Keycloak 26.8.1.

## How we measured

One Keycloak 26.8.1 node in production mode (`start --http-enabled=true --hostname-strict=false`), with the dev-file database, in a container limited to 2 CPUs and 2 GB of memory (`--cpus=2 --memory=2g`) on an Apple M1 Pro laptop. The load generator ran on the same machine, outside the container's CPU limit, with 32 concurrent connections unless stated. The realm had default settings and no password policy. Absolute numbers depend on hardware, database, and JVM. The ratios between them are the point.

## Why Keycloak logins are expensive

Keycloak stores passwords as slow hashes so that a stolen database is expensive to crack. Keycloak 26.8.1 uses Argon2id by default, with 5 iterations, 7 MiB of memory, and parallelism 1, which is one of the minimum configurations the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) recommends. You can see the parameters a user's password was stored with in the credential's `credentialData` through the Admin API.

The cost that protects a stolen database is paid on every login attempt, right or wrong. With both CPUs saturated:

| Request | Requests per second | Median latency |
|---|---|---|
| `GET /realms/{realm}/.well-known/openid-configuration` | about 5,700 | 3 ms |
| `GET /realms/{realm}/protocol/openid-connect/auth` (login page) | about 900 | |
| Token endpoint, `grant_type=client_credentials` | about 440 to 530 | 60 to 80 ms |
| Token endpoint, `grant_type=password`, wrong password | about 80 to 95 | 340 to 400 ms |
| Token endpoint, `grant_type=password`, unknown username | about 80 to 95 | 350 to 390 ms |
| Browser login: load the login page, then post a wrong password | about 70 | |
| Token endpoint, `grant_type=password`, correct password | about 45 | 650 ms |

Each failed password check took about 22 ms of CPU. At 32 concurrent connections the attacker waits 400 ms per request and does almost no work while waiting. A single client can keep a two-core node busy indefinitely.

Two things in that table matter beyond the ratio:

- **An unknown username costs the same as a wrong password.** When the user doesn't exist, Keycloak hashes a dummy password so that the response takes as long as a real check. That closes a timing difference attackers use for [username enumeration](./username-enumeration.md), and it means a flood of made-up usernames is as expensive as one against real accounts.
- **A correct password costs more than a wrong one**, because Keycloak also creates a session and signs tokens. A legitimate login spike after an outage is itself a small flood. Size for it.

## Which endpoints are cheap and which are expensive

| Path | Cost | Why |
|---|---|---|
| `/realms/{realm}/protocol/openid-connect/token` with `grant_type=password` | High | A password hash per request, with no page to put a CAPTCHA on |
| `/realms/{realm}/login-actions/authenticate` (the login form `POST`) | High | A password hash per request |
| `/realms/{realm}/protocol/openid-connect/auth` | Medium | Creates an authentication session and renders the login page on every request |
| Flows that send email: forgot password, magic links, email OTP, registration with verification | High, but not in CPU | Each request can make your SMTP server send a message. See [Email Bombing and Registration Abuse](./email-abuse.md) |
| Token endpoint with `client_credentials`, `refresh_token`, or `authorization_code` | Medium | Token signing and session lookups, no password hash |
| Discovery, JWKS, static theme resources | Low | Served from memory |

We did not measure the CPU cost of the email flows. Their cost is outside Keycloak, in mail delivery and sender reputation.

## What Keycloak can do about a flood

### Reject the password grant before it hashes

Most applications don't need the password grant, and it's the path an attacker scripts first. A [client policy](./client-policies.md) with the `reject-ropc-grant` executor rejects it for every client before any authentication runs. With the policy on, the same flood of wrong passwords was answered at 2,100 to 4,100 requests per second instead of about 80, each with `resource owner password credentials grant is prohibited.`. That doesn't make the endpoint free, but it removes the hash, which is the amplification. Move backend services that log in with a password to [service accounts](../api/service-accounts.md) first. [Credential Stuffing and Account Takeover](./credential-stuffing.md) explains why this is also the most important control against stuffing.

### Put the CAPTCHA before the password, not after it

A CAPTCHA only saves CPU if it rejects the request before the password is checked. To show the difference, we bound two direct grant flows to a test client, one with a rejecting step before the username and password steps and one with it after them. With the step first, a flood of wrong passwords was rejected at about 835 requests per second. With the step last, throughput was about 89 per second, the same as no step at all, because the wrong password fails before the step is reached.

Keycloak's username step also hashes a dummy password for unknown usernames, so the gate has to come before the username step, not just before the password step, to save CPU on made-up usernames.

In a browser flow this means:

- The **Cloudflare Turnstile validation** standalone step, placed before the username and password form, rejects a request without a valid token before any hash. It also blocks credential stuffing. See [Cloudflare Turnstile](./turnstile.md).
- The **Cloudflare Turnstile Username Password Form** checks the token after the username and password are accepted, so every attempt in a flood is still hashed. It's useful against stuffing when configured to block, but it does nothing for CPU.

Neither protects the token endpoint, which renders no page. That's another reason to reject the password grant.

### Limit the HTTP queue so the node sheds load

By default, Keycloak queues requests it can't process yet without a limit. Under a flood, every request waits behind the flood, including your users'. With 200 concurrent flooding connections, our node kept hashing at its maximum rate of about 80 per second, the median flood request took 2.6 seconds, and a discovery request from a real client took 2 seconds. At 600 connections the median was 7 seconds and climbing.

`http-max-queued-requests` (environment variable `KC_HTTP_MAX_QUEUED_REQUESTS`) caps the queue. Requests beyond it get `503 Service Unavailable` immediately, with an empty body and no `Retry-After` header. With the limit set to 10 and the same 200-connection flood, Keycloak answered about 7,000 requests per second with 503 in a median of 13 ms, and the requests it accepted completed in about 1.2 seconds.

Know what this does and doesn't buy:

- **It keeps the node alive and its latency bounded.** The node doesn't build an unbounded backlog, and it recovers as soon as the flood stops.
- **It doesn't protect your users.** The queue can't tell an attacker from a user. During the flood, 99 of 100 discovery requests and all 20 correct-password logins we sent got 503. The limit trades a slow outage for a fast one.
- **Shedding isn't free.** Answering 7,000 rejections per second cost CPU, and hash throughput fell from about 90 to about 50 per second while it happened.
- **Your load balancer has to handle 503s well.** If it retries 503s on another node, it multiplies the flood across the cluster. If its health check hits a path that is also shed, it may take the node out of rotation. Keycloak serves health checks on the separate management port (9000 by default, with `health-enabled=true`). Point health checks there, and test how they behave under a flood with your queue limit set; we did not test that.

The right value depends on your thread pool (`http-pool-max-threads`, by default the greater of 50 and four times the number of processors) and how long you're willing to let a request wait. Pick it from a load test of your own login traffic, not from our numbers.

### Choose the password hash cost knowingly

The hash parameters decide how many login attempts a CPU can absorb, and they also decide how hard a stolen database is to crack. These are the same knob. On our node:

| Hash | Wrong-password attempts per second |
|---|---|
| Argon2id, 5 iterations, 7 MiB (the 26.8.1 default) | about 80 to 95 |
| Argon2id, 1 iteration, 7 MiB (`hashIterations(1)`) | about 356 |
| PBKDF2-SHA512, 210,000 iterations (`hashAlgorithm(pbkdf2-sha512)`) | about 6 |

Lowering the iterations quadruples the attempts the node can absorb, and it makes every offline guess against a leaked hash about as many times cheaper. It also drops below OWASP's minimum. We don't recommend it as a flood defense. The controls above and at the edge reduce the number of hashes instead of their strength. If you do weaken the hash, record it as a risk decision, not a performance tweak.

The PBKDF2 row matters for older realms. Earlier Keycloak versions used PBKDF2 by default, and with no password policy set, Keycloak 26.8.1 kept a user's existing PBKDF2 hash after that user logged in successfully. Only when we set the policy to `hashAlgorithm(argon2)` explicitly did the next successful login rehash it. A realm upgraded from an older version can therefore spend fifteen times as much CPU per failed attempt on its long-standing users as on new ones. Check `credentialData` on a few older users. If you need FIPS mode, Argon2 isn't available to you and the PBKDF2 cost applies.

### Brute force detection doesn't reduce the cost

[Brute force detection](./brute-force-detection.md) protects accounts, not CPU. An attempt against a locked account is still hashed, against the dummy password, so the response looks the same as for an unlocked one. With an account permanently locked, a flood against it ran at the same rate and the same full CPU as one against an unlocked account. With a temporary lockout, throughput against the locked account fell to about 50 per second while using about one CPU, but each attempt cost the same CPU as before. We didn't find out what serializes those requests, and it isn't a defense. Brute force detection is also counted per user, so a flood spread across many usernames never triggers it. Keep it on for what it's for.

### Size for the hash, not for the request count

Plan capacity in failed password checks per second per core. On our rig, a core handled about 45 at default settings. Measure yours with a load test of failed logins against a non-production realm, using the same hash settings, database, and CPU limits as production. A node sized from the cost of a token refresh or a page load will saturate at a small fraction of the rate you expect. Adding nodes raises the rate a flood needs to reach, but you pay for every core the attacker keeps busy, so scaling is a way to buy time, not a defense.

## What Keycloak can't do

- **Volumetric and network-layer DDoS.** A flood that fills your network link, or a SYN or UDP flood, never reaches Keycloak as a request. Nothing an application server does can help. You need a CDN or DDoS scrubbing service in front, such as Cloudflare, Akamai, or AWS Shield Advanced.
- **Distinguish attackers from users.** Keycloak has no per-IP rate limit, and its queue limit sheds everyone equally.
- **Distributed floods below any per-IP threshold.** A flood from tens of thousands of residential proxy addresses, each sending a few requests a minute, looks per address like ordinary users. A per-IP rate limit, at Keycloak or the edge, doesn't see it. Stopping it takes something that scores clients, such as a bot management service or a CAPTCHA before the password.

## What edge tools cover

| Tool | What it stops | What it doesn't |
|---|---|---|
| CDN or DDoS scrubbing service | Volumetric and network floods; absorbs raw request volume across a large network | Low-rate, well-formed login attempts |
| WAF with rate-based rules | Floods from a small number of addresses. Scope tighter limits to `/protocol/openid-connect/token` and `/login-actions/authenticate` than to static resources | Distributed floods under the per-IP limit |
| Bot management | Distributed automated clients, by fingerprint and behavior rather than address | Abuse by real people in real browsers. It also adds cost and some false positives |
| CAPTCHA before the password | Scripted login form posts, before any hash | The token endpoint, which has no page |

### Why per-client rules don't work on the token endpoint

It's tempting to write an edge rule such as "block the password grant on `admin-cli`" or "rate-limit client X more tightly". On the authorization endpoint this works, because `client_id` is in the query string. On the token endpoint it doesn't. `client_id` and `grant_type` are fields in the form-encoded `POST` body, or for confidential clients `client_id` is inside the `Authorization` header. Rate-based rules generally key on the address, path, headers, or query string, not on body fields. Even where your WAF can read the body, the attacker picks the `client_id`, so a rule on one client only moves the flood to another. Every realm has built-in clients with known IDs. Limit the token path as a whole at the edge, and reject the password grant inside Keycloak with the client policy.

## How to tell you're under a flood

The signals that a flood is in progress, rather than a stuffing campaign, are about volume and saturation:

- CPU at the container or pod limit, with request latency rising together on the token and login-actions paths.
- A jump in `LOGIN_ERROR` events, often with `user_not_found` when the usernames are made up.
- With metrics enabled, `http_server_requests_seconds_count` by `uri` and `status` on the management port. Shed requests appear as `status="503"`, so a nonzero 503 rate means the queue limit is doing its job and users are being turned away.

[Detecting Attacks on Keycloak](./detecting-attacks.md) covers the event and metric queries and what to alert on.

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| A web application firewall in front of your cluster with per-IP [rate limits](./rate-limiting.md) by tier | Rejecting the password grant with a [client policy](./client-policies.md), after moving backend services to [service accounts](../api/service-accounts.md) |
| [IP restrictions](../self-service/restrictions.md) for `/admin` paths on Premium and Enterprise, and for public paths on Enterprise | A CAPTCHA before the password in your browser flows. The [Cloudflare Turnstile](./turnstile.md) extension is included in every cluster and is off until you configure it |
| [Metrics](../self-service/metrics.md) and [logs](../self-service/logs.md) in the dashboard, and event capture into the [audit log](/docs/audit-logs) | Your [password policy](./password-policy.md), including the hash algorithm, and [brute force detection](./brute-force-detection.md) |
| Help during an incident: email [support@phasetwo.io](mailto:support@phasetwo.io) | A CDN, DDoS scrubbing, or bot management service of your own in front of the cluster, if you need protection beyond per-IP limits. Tell us before you add one, because the per-IP limit then applies to the proxy's addresses |

## Related

- [Credential Stuffing and Account Takeover](./credential-stuffing.md)
- [Password Spraying and Brute Force](./password-spraying.md)
- [Email Bombing and Registration Abuse](./email-abuse.md)
- [Detecting Attacks on Keycloak](./detecting-attacks.md)
- [Rate Limiting](./rate-limiting.md)
