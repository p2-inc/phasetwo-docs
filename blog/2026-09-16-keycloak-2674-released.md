---
slug: keycloak-2674-released
title: "Keycloak 26.7.4: Two Unauthenticated Crashes, Upgrade Now"
date: 2026-09-16
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.4 fixes six CVEs. Two are unauthenticated denial of service against any internet-facing server, so upgrade this week — 26.6 and 26.4 have tags.
keywords: [keycloak 26.7.4, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if your login pages are reachable from the internet.** Keycloak 26.7.4 fixes six CVEs. Two are rated high and need no account at all: an unauthenticated attacker can crash the server by flooding the theme localization endpoints with junk locale tags, or by replaying malformed SAML redirects. Neither reads data — both take you down. A third high lets an authenticated user walk past the Authorization Services policy enforcer, and the fix for it is the release's one breaking change.

<!-- truncate -->

## Should you upgrade?

| If your deployment… | When |
|---|---|
| Serves login pages to untrusted networks | **This week.** Unauthenticated memory exhaustion, no config needed. |
| Has any SAML client or SAML broker enabled | **This week.** Second unauthenticated crash, same effect. |
| Uses the Authorization Services policy enforcer | **This week, and test.** Bypass fix changes URI matching. |
| Grants the `impersonation` role to non-super admins | **This week.** Privilege escalation, no advisory published. |
| Brokers identities from an external IdP | Soon. Username collision can lock a user out. |
| Runs on MySQL or MariaDB | Soon. Replay gate accepted reused artifacts. |
| Is on 26.5 | **Move to 26.7.** Nothing is being backported there. |

## Security fixes

Six security bullets in the release notes, six distinct CVE ids, counted from the source.

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-74909](https://nvd.nist.gov/vuln/detail/CVE-2026-74909) / [GHSA-5639-qg9x-rw29](https://github.com/advisories/GHSA-5639-qg9x-rw29) | high 8.1 | Encoded characters trick the policy enforcer into a weaker policy |
| [CVE-2026-79651](https://nvd.nist.gov/vuln/detail/CVE-2026-79651) / [GHSA-8qv5-pjhw-3gx4](https://github.com/advisories/GHSA-8qv5-pjhw-3gx4) | high 7.5 | Unauthenticated locale tags fill an unbounded cache until OOM |
| [CVE-2026-18212](https://nvd.nist.gov/vuln/detail/CVE-2026-18212) / [GHSA-wgrv-cjmx-4vfw](https://github.com/advisories/GHSA-wgrv-cjmx-4vfw) | high 7.5 | SAML redirect DEFLATE helpers leak native zlib memory |
| [CVE-2026-17526](https://nvd.nist.gov/vuln/detail/CVE-2026-17526) / none | **unrated** | The `impersonation` role can impersonate a realm administrator |
| [CVE-2026-19607](https://nvd.nist.gov/vuln/detail/CVE-2026-19607) / none | **unrated** | Brokered e-mail collides with an existing username |
| [CVE-2026-90997](https://nvd.nist.gov/vuln/detail/CVE-2026-90997) / none | **unrated** | MySQL/MariaDB row counts let a replay gate accept reused artifacts |

**The two crashes are the reason to move now.** [CVE-2026-79651](https://github.com/advisories/GHSA-8qv5-pjhw-3gx4) is the broader one: theme message lookups accepted arbitrary locale tags from unauthenticated requests and cached each one permanently. Anyone who can load your login page can fill that cache. [CVE-2026-18212](https://github.com/advisories/GHSA-wgrv-cjmx-4vfw) needs SAML turned on — repeated malformed SAML redirect requests leak native zlib memory until the process dies. Both are `AV:N/AC:L/PR:N/UI:N` with availability impact only: nothing is read or altered, you just stop answering. Rate limiting in front of Keycloak reduces the rate, not the exposure.

**[CVE-2026-74909](https://github.com/advisories/GHSA-5639-qg9x-rw29) is the highest-scored and the narrowest** — it applies only if the Authorization Services policy enforcer sits in front of an application. Keycloak calls it an incomplete fix for earlier matrix-parameter stripping: an authenticated user encodes a semicolon or dot segment and the enforcer matches a less restrictive resource than intended.

**Three CVEs have no published advisory, so they carry no severity** — no entry existed in GitHub's global advisory database on 16 September. Rank them from the CVE records yourself. Of the three, the impersonation escalation is the one we would not sit on: if helpdesk accounts hold the `impersonation` role, assume it reached realm administrators until you have upgraded.

The three advisories that do exist carry an **empty affected-versions array** — no vulnerable range, no patched version. The branch table below comes from the fix commits on Keycloak's release branches instead.

## If you run 26.6 or 26.4

Five of the six fixes were backported and tagged on **7 September**, nine days before 26.7.4 shipped. Keycloak cut tags but published no GitHub release for them, so there is nothing announcing that your branch is covered. Verified 16 September:

| Branch | Newest release | Newest tag | These fixes | Runnable image |
|---|---|---|---|---|
| 26.7 | 26.7.4 | 26.7.4 | all six | `quay.io/phasetwo/keycloak:26.7.4` |
| 26.6 | 26.6.4 | 26.6.7 (7 Sep) | five — not CVE-2026-90997 | `quay.io/phasetwo/keycloak:26.6.7` |
| 26.4 | 26.4.7 | 26.4.16 (7 Sep) | five — not CVE-2026-90997 | `quay.io/phasetwo/keycloak:26.4.16` |
| 26.5 | 26.5.7 | 26.5.7 | none | — |

The MySQL/MariaDB row-count fix landed on `release/26.7` on 15 September and has not appeared on 26.6 or 26.4. We cannot tell whether those branches are affected and unfixed or simply not affected — if you run 26.6 or 26.4 on MySQL or MariaDB, that is the open question. There is no `release/26.5` branch upstream, which is why that row is empty.

We publish [container images](/extensions/containers/) for these tags, including the ones upstream never released. Check the [tag list](https://quay.io/repository/phasetwo/keycloak?tab=tags) rather than assuming.

## Breaking changes

One, and it is the CVE-2026-74909 fix. Authorization Services now normalizes resource URIs before matching: matrix parameters stripped, dot segments resolved, encoded slashes decoded and collapsed, trailing slashes removed, query strings and fragments dropped. So `/api/admin`, `/api/admin/`, `/api/admin?foo=bar` and `/api/admin;x=1` are now one resource. If your policies deliberately distinguished those forms, they will stop distinguishing them. The [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) has the full list.

## What else changed

Quarkus moves to 3.33.3.2. Of nine bug fixes, three are worth knowing: the Oracle 19 OCI driver startup crash present since 26.6.0 (#52233), a cached `isUserManagedAccessAllowed()` returning `isEnabled()` (#52172), and the admin console throwing on sub-group clicks (#52241).

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) first — the [release notes page](https://www.keycloak.org/docs/latest/release_notes/index.html) is labelled 26.7.4 but its newest section is still 26.7.0. If you use the policy enforcer, replay your resource set against a staging realm before production. Our [security docs](/docs/security/) cover the rate limiting and brute-force controls worth having in front of both DoS bugs, and the [production checklist](/blog/keycloak-production-checklist) covers the rest. For the previous round, see [26.7.3](/blog/keycloak-2673-released).

Rather not schedule this one? Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact).
