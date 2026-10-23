---
id: rate-limiting
title: Rate Limiting
---

Phase Two dedicated clusters sit behind a web application firewall (WAF) that limits how many requests a single IP address can send. The limit protects your cluster from being overwhelmed by any one source, whether that is a misbehaving script, a load test nobody mentioned, or an attack from a single host.

## Limits by tier

The limit counts every request from one client IP address over a rolling five-minute window, across all paths: login pages, the token endpoint, the Admin API, and static resources.

| Tier | Requests per IP per 5 minutes | Sustained average |
|---|---|---|
| Starter | 1,000 | about 3 per second |
| Premium | 2,000 | about 7 per second |
| Enterprise | 4,000 | about 13 per second |

Server-to-server traffic counts the same as browser traffic, and there is no allowlist that exempts an address from the limit. Starter is deliberately tight: if your sustained traffic from one address is above it, that is a signal to move to a higher tier. Enterprise customers who need a different limit can arrange one with us.

## What happens when the limit is reached

Once an address goes over its limit, the WAF blocks further requests from it:

- The response is HTTP `429 Too Many Requests` with a short Phase Two branded page.
- The response includes `Retry-After: 300` and `Cache-Control: no-store`.
- Blocking usually starts within a minute or two of crossing the limit, so a short burst can get somewhat past the nominal number before it is stopped.
- The block lifts on its own once the address's request rate over the previous five minutes falls back below the limit, typically within a few minutes. Blocked requests still count toward the rate, so a client that keeps retrying stays blocked. Honor `Retry-After`.

Other addresses are not affected. Your users keep signing in while one source is blocked.

## Staying under the limit

Most legitimate traffic is far below these limits. The cases that reach them are usually backend jobs that run from a single address:

- **Reuse access tokens.** A job that requests a new token for every Admin API call doubles its request count. Request a token once and reuse it until shortly before it expires.
- **Page through results.** Use `first` and `max` on list endpoints instead of one request per user, and avoid per-user lookups when a single search returns what you need.
- **Spread bulk work out.** A nightly sync of every user in one burst will hit the limit. Throttle it, or spread it across a longer window.
- **Coordinate load tests with us in advance.** A load test from one machine will be blocked like any other single source. Email [support@phasetwo.io](mailto:support@phasetwo.io) before you run one.
- **Tell us if you put your own proxy or CDN in front of the cluster.** All traffic then reaches the WAF from the proxy's addresses, so the per-IP limit applies to each proxy node rather than to each of your users.

## What rate limiting does not stop

A per-IP limit is aimed at volume from one source. It is not a defense against credential stuffing. Those campaigns spread their attempts across thousands of residential proxy addresses, each sending a few requests, which stays well under any per-IP limit. Use these alongside it:

- [Cloudflare Turnstile](./turnstile.md) or another CAPTCHA on browser logins, configured to reject submissions without a valid token
- A [client policy](./client-policies.md) that rejects the password grant, which no CAPTCHA can protect
- [Brute force detection](./brute-force-detection.md) for repeated guesses against one account

[Credential Stuffing and Account Takeover](./credential-stuffing.md) covers how these fit together.
