---
slug: keycloak-2674-released
title: "Keycloak 26.7.4: 6 CVEs, Two Unauthenticated DoS"
date: 2026-09-16
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.4 fixes six CVEs, five rated high. Upgrade this week if your login or SAML endpoints face the internet — two are unauthenticated DoS.
keywords: [keycloak 26.7.4, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if your login page or SAML endpoints are reachable from the internet, or if you run stateless mode on MySQL/MariaDB. Otherwise take it in your normal cycle.** Keycloak 26.7.4 fixes six CVEs — five published as high, one medium. Two of them let an unauthenticated attacker exhaust memory and crash the server by hitting endpoints that are open by definition. One breaking change, in Authorization Services URI matching.

<!-- truncate -->

## Should you upgrade?

| If your realms… | When |
|---|---|
| Serve a login page to the public internet | **This week.** Unauthenticated OOM via the locale parameter. |
| Expose SAML endpoints (redirect binding) | **This week.** Unauthenticated native memory leak. |
| Run stateless mode on MySQL or MariaDB | **This week, to 26.7.4 specifically.** Replay protection was not working, and only this release has the fix. |
| Use the policy enforcer or UMA permissions | **This week**, and re-read your resource URIs — behaviour changed. |
| Grant the `impersonation` role to non-admins | **This week.** It reached realm admins. |
| Keycloak reachable only from inside your network | Next normal cycle. |

## Security fixes

Counted from the release notes: six security bullets, six distinct CVE identifiers.

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-74909](https://nvd.nist.gov/vuln/detail/CVE-2026-74909) / [GHSA-5639-qg9x-rw29](https://github.com/advisories/GHSA-5639-qg9x-rw29) | high 8.1 | Encoded characters trick the policy enforcer into a weaker policy |
| [CVE-2026-79651](https://nvd.nist.gov/vuln/detail/CVE-2026-79651) / [GHSA-8qv5-pjhw-3gx4](https://github.com/advisories/GHSA-8qv5-pjhw-3gx4) | high 7.5 | Unauthenticated OOM via unbounded locale caching |
| [CVE-2026-18212](https://nvd.nist.gov/vuln/detail/CVE-2026-18212) / [GHSA-wgrv-cjmx-4vfw](https://github.com/advisories/GHSA-wgrv-cjmx-4vfw) | high 7.5 | SAML DEFLATE helpers leak native zlib memory |
| [CVE-2026-17526](https://nvd.nist.gov/vuln/detail/CVE-2026-17526) / [GHSA-j7cq-x5cp-qpcx](https://github.com/advisories/GHSA-j7cq-x5cp-qpcx) | high 7.2 | The `impersonation` role can impersonate a realm administrator |
| [CVE-2026-19607](https://nvd.nist.gov/vuln/detail/CVE-2026-19607) / [GHSA-h87q-rx56-87wm](https://github.com/advisories/GHSA-h87q-rx56-87wm) | medium 5.3 | Brokered username collision locks the legitimate user out |
| CVE-2026-90997 / [GHSA-xpwp-2pcm-8xq3](https://github.com/keycloak/keycloak/security/advisories/GHSA-xpwp-2pcm-8xq3) | high 7.4 | MySQL/MariaDB row counts make replay gates accept reused artifacts |

**CVE-2026-79651 (high, 7.5) has the broadest exposure here.** The theme localization endpoints accept arbitrary locale tags from unauthenticated requests and cache them permanently in memory, with no bound. If anyone on the internet can load your login page, they can send unique locale tags until the process dies. There is no configuration that opts you out.

**CVE-2026-90997 (high, 7.4) was published late**, several hours after the other five, as [GHSA-xpwp-2pcm-8xq3](https://github.com/keycloak/keycloak/security/advisories/GHSA-xpwp-2pcm-8xq3). In stateless mode on MySQL or MariaDB, a row-count semantics mismatch between the driver and Keycloak's logic breaks replay protection: an attacker who has intercepted a single-use artifact — a JWT client assertion (`private_key_jwt`), a DPoP proof, or a TOTP code — can replay it against the token endpoint or the login flow. The interception requirement is what holds the score to 7.4 rather than higher. If you cannot take 26.7.4 immediately, the advisory's workaround is to disable the stateless feature. Note that the advisory is not in the [global advisory database](https://github.com/advisories) or NVD yet, so only the Keycloak-repository link above resolves.

**CVE-2026-74909 (high, 8.1) needs the policy enforcer**, not plain OIDC. Percent-encoded semicolons still slipped past matrix-parameter stripping — an incomplete-fix follow-up — so an authenticated user could dress a URL up until it matched a permissive resource such as a catch-all `/*`. It drives the breaking change below.

**Sources disagree on CVE-2026-18212.** The advisory publishes it as high (7.5); the upstream issue [#52839](https://github.com/keycloak/keycloak/issues/52839) is labelled `severity/medium`. The impact is the same either way — unauthenticated native memory exhaustion from malformed SAML redirect requests. Read [the advisory](https://github.com/advisories/GHSA-wgrv-cjmx-4vfw) if the number matters to you.

## If you run 26.6, 26.5 or 26.4

Five of the six advisories list no affected or patched versions at all — their `vulnerabilities` array is empty. The upstream issues carry `release/` labels instead, and the commits are visible in the branch diffs. Verified 16 September:

| Branch | Newest release | Newest tag | These fixes | Runnable image |
|---|---|---|---|---|
| 26.7 | 26.7.4 | 26.7.4 | all six | `quay.io/phasetwo/keycloak:26.7.4` |
| 26.6 | 26.6.4 (June) | 26.6.7 (7 Sep) | five — **not** CVE-2026-90997 | `quay.io/phasetwo/keycloak:26.6.7` |
| 26.5 | 26.5.7 | 26.5.7 (April) | **none** | — |
| 26.4 | 26.4.7 (Dec 2025) | 26.4.16 (7 Sep) | five — **not** CVE-2026-90997 | `quay.io/phasetwo/keycloak:26.4.16` |

Keycloak tags backports without publishing a GitHub release, so 26.6.7 and 26.4.16 exist and carry five of these six fixes even though nothing announced them — we publish [container images](/extensions/containers/) for both. The row-count fix landed on 15 September, after those tags were cut, so it is on 26.7 only. That branch is also the only one with stateless mode: there is no stateless-mode code in the 26.6.7 or 26.4.16 trees. The late advisory settles it — GHSA-xpwp-2pcm-8xq3 is the one here that does publish a range, `>= 26.7.0, < 26.7.4` on `org.keycloak:keycloak-model-jpa`, so 26.6 and 26.4 are out of scope rather than unfixed.

**If you are on 26.5, there is no patch and there will not be one.** Upstream has moved the branch to `archive/release/26.5`; `release/26.4`, `release/26.6` and `release/26.7` are the live ones. Plan the move to 26.7.

## Breaking change

One, in the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes): Authorization Services now normalizes a request URI before matching it against a configured resource — matrix parameters and dot segments resolved, `%2F` decoded, trailing slash stripped, query string and fragment dropped. If your policies distinguish `/api/admin` from `/api/admin/` or `/api/admin?x=1`, they no longer do. This is the hardening behind CVE-2026-74909.

## What else changed

The [release notes](https://www.keycloak.org/docs/latest/release_notes/index.html) still stop at 26.7.0, so the GitHub release is the only changelog. Two of the nine bug fixes are worth knowing: the Oracle 19 OCI fat driver no longer crashes Keycloak on startup ([#52233](https://github.com/keycloak/keycloak/issues/52233), broken since 26.6.0), and cached realms stopped reporting `isUserManagedAccessAllowed()` as `isEnabled()` ([#52172](https://github.com/keycloak/keycloak/issues/52172)) — if UMA looked mysteriously on, that was why. Quarkus moves to 3.33.3.2.

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) first, then test URI normalization on a staging realm if you use Authorization Services — it is the only change here that can alter an access decision. Our [production checklist](/blog/keycloak-production-checklist) covers the exposure questions above; [26.7.3](/blog/keycloak-2673-released) is the release this one follows.

Rather not schedule this one? Our [managed Keycloak](/hosting/dedicated-clusters/) clusters get patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact).
