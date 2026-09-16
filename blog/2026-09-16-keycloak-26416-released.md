---
slug: keycloak-26416-released
title: "Keycloak 26.4.16: Two High CVEs, No Announcement"
date: 2026-09-16
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Upgrade this week. Keycloak 26.4.16 fixes two high-severity CVEs, one exploitable with no account at all — and it shipped as a git tag with no release notes.
keywords: [keycloak 26.4.16, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week, and this week specifically if your login pages are reachable from the internet.** Keycloak 26.4.16 fixes two high-severity CVEs. One needs no account at all: an unauthenticated attacker can exhaust server memory and crash the process. The other lets an authenticated user walk past the Authorization Services policy enforcer. Neither is a remote code execution and neither leaks credentials, but the first has no precondition worth the name.

The awkward part: there is no GitHub release for 26.4.16. It is a bare tag, with no release notes and no announcement. Same for the 26.6 fix.

<!-- truncate -->

## Should you upgrade?

| If your realms… | When |
|---|---|
| Serve login or account pages to the public internet | **This week.** Unauthenticated memory exhaustion. |
| Protect app endpoints with the Authorization Services policy enforcer | **This week.** Path matching could be tricked with encoded characters. |
| Broker identity providers with "login with email" enabled | **This week.** A brokered address could collide with an existing username. |
| Grant the `impersonation` role to non-realm-admins | **Plan it.** Privilege escalation fixed in the same range. |
| Use SAML redirect binding | **Plan it.** A native zlib state leak was fixed. |
| Run 26.5.x | **Migrate off.** There is no `release/26.5` branch and no fix. |

## Security fixes

Three CVE identifiers in this release appear in the published advisory data:

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-74909](https://nvd.nist.gov/vuln/detail/CVE-2026-74909) / [GHSA-5639-qg9x-rw29](https://github.com/advisories/GHSA-5639-qg9x-rw29) | **high 8.1** | Policy enforcer applies the wrong policy to an encoded path |
| [CVE-2026-79651](https://nvd.nist.gov/vuln/detail/CVE-2026-79651) / [GHSA-8qv5-pjhw-3gx4](https://github.com/advisories/GHSA-8qv5-pjhw-3gx4) | **high 7.5** | Unauthenticated memory exhaustion via theme locale lookups |
| [CVE-2026-19607](https://nvd.nist.gov/vuln/detail/CVE-2026-19607) / none | **unrated** | Brokered e-mail collides with an existing username |

The changelog on this tag lists 12 CVE identifiers, but it is cumulative for the whole 26.4 branch: the `26.4.15...26.4.16` diff is 16 commits, and these three are the advisory-backed CVEs among them. The other nine landed in earlier 26.4 patches.

**CVE-2026-79651 (high, 7.5) is the one that sets the timeline.** Keycloak's theme message lookups accepted arbitrary locale tags from unauthenticated requests and cached every one of them in memory, permanently and without a bound. Send enough unique locale tags and the server runs out of heap. The CVSS vector is `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H` — no privileges, no user interaction, availability impact only. If your login page is public, you are exposed; there is no configuration that turns this off.

**CVE-2026-74909 (high, 8.1) depends on how you deploy.** The Authorization Services policy enforcer failed to normalize percent-encoded matrix parameters, dot segments and slashes before matching a request against your policies, so an authenticated user could dress up a path and get a more permissive policy than intended. It only reaches you if you run the policy enforcer in front of an application; if you use Keycloak purely as an OIDC or SAML issuer, this one is not yours. Upstream labels it an incomplete fix for earlier matrix-parameter stripping, so treat "we patched that already" with suspicion.

**CVE-2026-19607 has no published advisory, so it carries no severity.** The fix makes first-broker-login detect a brokered e-mail colliding with an existing local username, which matters when login-with-email is enabled. Weigh it from [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-19607).

Two further security commits in this range close CVE identifiers that were not in the advisory data we verified, so we are not naming them here: an impersonation privilege escalation and a SAML DEFLATE zlib state leak. Both are itemised in the [upstream 26.7.4 release notes](https://github.com/keycloak/keycloak/releases/tag/26.7.4), which cover the same coordinated fix set.

## The release that was never announced

Keycloak cuts a git tag for a backport but usually does not publish a GitHub release for it. On the 26.4 branch, **the last published release is 26.4.7, from December 2025**: every patch since, 26.4.8 through 26.4.16, exists only as a tag. Go looking for release notes for your branch and you will conclude there is no fix. There is. Verified against the GitHub API today:

| Branch | Newest release | Newest tag | Has the fix |
|---|---|---|---|
| 26.7 | 26.7.4 | 26.7.4 | Yes |
| 26.6 | *(26.6.4 — predates the fix)* | 26.6.7 | Yes, in the tag only |
| 26.4 | *(26.4.7 — predates the fix)* | 26.4.16 | Yes, in the tag only |
| 26.5 | 26.5.7 (April) | 26.5.7 | **No. Nothing newer exists.** |

If you are on 26.5, that bottom row is the important one: there is no `release/26.5` branch upstream and no 26.5.8 tag, so no backport is coming. Plan the move to 26.6 or 26.7.

We publish container images for these tags at [`quay.io/phasetwo/keycloak`](https://quay.io/repository/phasetwo/keycloak?tab=tags), including versions upstream never released. As of publication the newest are 26.7.3, 26.6.6 and 26.4.15; builds for this fix set are not up yet, so check the tag list before pulling.

## Breaking changes

One, and it is the CVE-2026-74909 fix: resource URI matching in Authorization Services now normalizes matrix parameters, dot segments, percent-encoding and query or fragment components before evaluating policies. Policy paths that relied on the old un-normalized behaviour will match differently, so test policy evaluation before production. Full detail is in the [upstream migration guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes).

Note that the official [release notes](https://www.keycloak.org/docs/latest/release_notes/index.html) track 26.7.4 and say nothing under any 26.4.x heading, and there is no upstream blog post for 26.4.16.

## How to upgrade

Standard patch upgrade within the 26.4 branch, no database migration beyond what Keycloak applies at startup. Follow the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/), and if you run the policy enforcer, exercise your policies against encoded paths before and after. Our [production checklist](/blog/keycloak-production-checklist) covers what to verify on the way back up, and the [26.7.3 write-up](/blog/keycloak-2673-released/) explains the backport pattern behind this.

If tracking tag-only backports across three branches is not how you want to spend your week, that is what [managed Keycloak](/hosting/dedicated-clusters/) is for. Our [security practices](/docs/security/) page documents CVE response under SOC 2 Type II and ISO/IEC 27001.
