---
slug: keycloak-2667-released
title: "Keycloak 26.6.7 Released: 8 CVEs, Announced Nowhere"
date: 2026-09-07
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.6.7 fixes 8 CVEs including an unauthenticated crash. Upgrade this week — and note it ships as a bare git tag with no release announcement.
keywords: [keycloak 26.6.7, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if your login pages are reachable from an untrusted network.** [CVE-2026-79651](https://nvd.nist.gov/vuln/detail/CVE-2026-79651) (high, 7.5) lets an unauthenticated request grow a cache until the server runs out of memory. Keycloak 26.6.7 fixes 8 CVEs — three high, four medium, one unrated, counted as distinct ids in the `26.6.6...26.6.7` commit range. It is also the 26.6 patch our [26.7.3 post](/blog/keycloak-2673-released) said did not exist yet. Upstream never announced it: a git tag dated 7 September, no GitHub release, no blog post, no upgrading-guide entry.

<!-- truncate -->

## Should you upgrade?

| If your realms… | When |
|---|---|
| Serve login pages to untrusted networks | **This week.** Unauthenticated memory exhaustion. |
| Use Authorization Services policy enforcement | **This week.** CVE-2026-74909, 8.1, encoded paths dodge policies. |
| Broker identities whose e-mail may match a local username | **This week.** CVE-2026-19607, unrated. |
| Delegate admin rights with FGAP v2 | Next normal cycle. Four medium fixes. |
| Sit on 26.6.4 or earlier | You pick up five more CVEs on the way. |

## Security fixes

New in 26.6.7:

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-74909](https://nvd.nist.gov/vuln/detail/CVE-2026-74909) / [GHSA-5639-qg9x-rw29](https://github.com/advisories/GHSA-5639-qg9x-rw29) | high 8.1 | Policy enforcer matches encoded paths loosely |
| [CVE-2026-79651](https://nvd.nist.gov/vuln/detail/CVE-2026-79651) / [GHSA-8qv5-pjhw-3gx4](https://github.com/advisories/GHSA-8qv5-pjhw-3gx4) | high 7.5 | Unbounded locale cache crashes the server |
| [CVE-2026-35563](https://nvd.nist.gov/vuln/detail/CVE-2026-35563) / [GHSA-85rw-g4f4-jprr](https://github.com/advisories/GHSA-85rw-g4f4-jprr) | high, no CVSS | LDAP client skips TLS hostname check (dependency) |
| [CVE-2026-16089](https://nvd.nist.gov/vuln/detail/CVE-2026-16089) / [GHSA-63wm-fvw8-h2hp](https://github.com/advisories/GHSA-63wm-fvw8-h2hp) | medium 5.4 | Auth code redeemable by another client |
| [CVE-2026-16072](https://nvd.nist.gov/vuln/detail/CVE-2026-16072) / [GHSA-mp76-m6c2-jqh5](https://github.com/advisories/GHSA-mp76-m6c2-jqh5) | medium 4.9 | Org manager creates members via invite link |
| [CVE-2026-16105](https://nvd.nist.gov/vuln/detail/CVE-2026-16105) / [GHSA-w32v-46r7-99r7](https://github.com/advisories/GHSA-w32v-46r7-99r7) | medium 4.9 | Composite-role endpoints skip authorization |
| [CVE-2026-16108](https://nvd.nist.gov/vuln/detail/CVE-2026-16108) / [GHSA-mvwh-6438-3v8w](https://github.com/advisories/GHSA-mvwh-6438-3v8w) | medium 4.3 | Default-group reads disclose hidden groups |
| [CVE-2026-19607](https://nvd.nist.gov/vuln/detail/CVE-2026-19607) / none | **unrated** | Brokered e-mail collides with existing username |

**CVE-2026-79651 sets the schedule.** Theme localization endpoints accept arbitrary locale tags from unauthenticated requests and keep them in an unbounded in-memory cache. Vector `AV:N/AC:L/PR:N/UI:N`, high availability impact — no credentials, no user interaction, and reachable wherever your login pages are.

**CVE-2026-74909 (8.1) is narrower but worse where it lands.** The policy enforcer failed to normalize percent-encoded matrix parameters and dot segments, so an authenticated user could shape a URL that matched a weaker policy than intended. Exposure requires Authorization Services policy enforcement.

**CVE-2026-35563 is rated high, but we could not put it on a running-server path.** The advisory is against `org.apache.directory.api:api-ldap-client-api`, fixed at **library version 2.1.8** — not a Keycloak version. Keycloak's change ([#51540](https://github.com/keycloak/keycloak/pull/51540)) touches only `pom.xml`, `testsuite/` and the `util/embedded-ldap` test utility; LDAP federation uses JNDI. Check [the advisory](https://github.com/advisories/GHSA-85rw-g4f4-jprr) against your own build rather than taking the "high" at face value.

**No advisory is published for CVE-2026-19607 yet, so it carries no severity.** The fix detects a brokered e-mail colliding with an existing username. Weigh it from [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-19607).

### If you are coming from 26.6.4

26.6.4 is the newest 26.6 with an actual GitHub release, so most people are on it. You also pick up five CVEs from 26.6.5 and 26.6.6, neither released either — thirteen in total.

| CVE / advisory | Severity | Landed in |
|---|---|---|
| [CVE-2026-15571](https://nvd.nist.gov/vuln/detail/CVE-2026-15571) / [GHSA-m639-f4cw-m3hm](https://github.com/advisories/GHSA-m639-f4cw-m3hm) | high 7.3 | 26.6.6 — account takeover via legacy linking |
| [CVE-2026-16100](https://nvd.nist.gov/vuln/detail/CVE-2026-16100) / [GHSA-xj3w-m54w-h7p9](https://github.com/advisories/GHSA-xj3w-m54w-h7p9) | medium 6.5 | 26.6.5 — metric-label explosion exhausts memory |
| [CVE-2026-17048](https://nvd.nist.gov/vuln/detail/CVE-2026-17048) / [GHSA-p3wj-5684-x596](https://github.com/advisories/GHSA-p3wj-5684-x596) | medium 5.5 | 26.6.6 — admin API leaks vault-resolved secrets |
| [CVE-2026-14614](https://nvd.nist.gov/vuln/detail/CVE-2026-14614) / [GHSA-p39j-8498-pcjw](https://github.com/advisories/GHSA-p39j-8498-pcjw) | medium 5.4 | 26.6.5 — FGAP v2 client-scope assignment bypass |
| [CVE-2026-45292](https://nvd.nist.gov/vuln/detail/CVE-2026-45292) / [GHSA-rcgg-9c38-7xpx](https://github.com/advisories/GHSA-rcgg-9c38-7xpx) | medium 5.3 | 26.6.6 — OpenTelemetry baggage (dependency, fixed at 1.62.0) |

## Which version carries your fix

No Keycloak-proper advisory lists affected or patched versions, so this comes from comparing git tags. Checked 16 September:

| Branch | Newest release | Newest tag | Phase Two image |
|---|---|---|---|
| 26.7 | 26.7.4 (16 Sep) | 26.7.4 | `26.7.3` — 26.7.4 not built yet |
| 26.6 | 26.6.4 (26 Jun) | **26.6.7** (7 Sep) | `26.6.6` — 26.6.7 not built yet |
| 26.4 | 26.4.7 (Dec 2025) | 26.4.16 (7 Sep) | `26.4.15` — 26.4.16 not built yet |

Keycloak tags backports without publishing a release, which is why 26.6.7 exists but nothing told you. We publish [container images](/extensions/containers/) for those tags — but the newest we have built on each branch is the one above, not 26.6.7. Check [the tag list](https://quay.io/repository/phasetwo/keycloak?tab=tags) before you pin.

Two gaps. **26.4.16 carries CVE-2026-74909, CVE-2026-79651 and CVE-2026-19607 but not the four FGAP fixes or CVE-2026-35563** — they are absent from the 26.4 changelog. And **26.7.4, published 16 September, lists three further CVEs with no 26.6 equivalent**; on 26.7, read [its announcement](https://www.keycloak.org/2026/09/keycloak-2674-released) instead.

## Breaking changes

The [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) has no entry for 26.6.5, 26.6.6 or 26.6.7 — it jumps from 26.6.4 to 26.7.0. The changes are real, just filed under the 26.7 heading where each fix first shipped:

- **Authorization Services URI matching now normalizes matrix parameters, dot segments and percent-encoding** (under 26.7.4). This is the CVE-2026-74909 fix, and it can change which policy a request matches. Test enforcement rules on staging — it is the one thing here that breaks a working deployment.
- **Legacy client-initiated account linking is disabled by default** (under 26.7.2, arrives via 26.6.6). If you still use it, it stops working.

## What else changed

58 commits. Operator-visible: a native zlib leak in SAML `DeflateUtil`, impersonation now requiring the admin to outrank the target, and Quarkus 3.33.3.2.

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) under 26.7.1–26.7.4, not 26.6 — that is where your backports are documented. The [release notes](https://www.keycloak.org/docs/latest/release_notes/index.html) stop at 26.7.0. Our [security docs](/docs/security/) and [production checklist](/blog/keycloak-production-checklist) cover the settings several of these CVEs bypassed.

Tracking unannounced backports across three branches is a poor use of your week. Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows under SOC 2 Type II and ISO 27001. [Talk to us](/contact).
