---
slug: keycloak-2675-released
title: "Keycloak 26.7.5: 14 CVEs, and 26.6/26.4 Have No Patch"
date: 2026-09-30
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.5 fixes 14 CVEs, one critical in a bundled library. Upgrade this week on 26.7 — and if you run 26.6 or 26.4, no patched tag exists yet.
keywords: [keycloak 26.7.5, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if you are on 26.7. If you are on 26.6 or 26.4, the fixes are merged to your branch but nobody has tagged a release, so there is no build to take.** Keycloak 26.7.5 fixes 14 CVEs: ten in Keycloak, none rated above medium (6.5), and four in bundled libraries, one of them critical. Three breaking changes, one of which changes what lands in your tokens.

<!-- truncate -->

## Should you upgrade?

| If you… | When |
|---|---|
| Run 26.7.x | **This week.** The only build with these fixes. |
| Grant `view-clients` to anyone who should not hold a client secret | **This week.** CVE-2026-89298 leaks it. |
| Use CIBA or the device grant with brute-force protection | **This week.** Two lockout bypasses. |
| Run `aud`-sensitive resource servers | Test first — disabled clients leave `aud`. |
| Run 26.6, 26.5 or 26.4 | You cannot — see below. |

## Security fixes

Counted from the release notes: 14 bullets, 14 CVEs. CVE-2026-9798 also appears, but only as the earlier flaw CVE-2026-16103 finishes fixing.

**In Keycloak:**

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-18203](https://nvd.nist.gov/vuln/detail/CVE-2026-18203) / [GHSA-wx5m-whr8-48h5](https://github.com/advisories/GHSA-wx5m-whr8-48h5) | medium 6.5 | Child-group policy uses a text prefix, so sibling groups pass |
| [CVE-2026-18207](https://nvd.nist.gov/vuln/detail/CVE-2026-18207) / [GHSA-rfxv-6gx8-3fm6](https://github.com/advisories/GHSA-rfxv-6gx8-3fm6) | medium 6.5 | Client policy source-group condition matches by name, not path |
| [CVE-2026-18208](https://nvd.nist.gov/vuln/detail/CVE-2026-18208) / [GHSA-jg59-c35g-76r8](https://github.com/advisories/GHSA-jg59-c35g-76r8) | medium 6.5 | Introspection leaks full claims for an out-of-audience token |
| [CVE-2026-88770](https://nvd.nist.gov/vuln/detail/CVE-2026-88770) / [GHSA-q4q6-f3mm-hfmv](https://github.com/advisories/GHSA-q4q6-f3mm-hfmv) | medium 6.5 | Device grant issues tokens to a brute-force-locked account |
| [CVE-2026-89298](https://nvd.nist.gov/vuln/detail/CVE-2026-89298) / [GHSA-386r-m7rr-67p4](https://github.com/advisories/GHSA-386r-m7rr-67p4) | medium 4.9 | Confidential client secret returned to the `view-clients` role |
| [CVE-2026-16103](https://nvd.nist.gov/vuln/detail/CVE-2026-16103) / [GHSA-v7m3-vpqr-6m6p](https://github.com/advisories/GHSA-v7m3-vpqr-6m6p) | medium 4.3 | CIBA lockout bypass at token redemption |
| [CVE-2026-18211](https://nvd.nist.gov/vuln/detail/CVE-2026-18211) / [GHSA-6j79-4gfx-fm6f](https://github.com/advisories/GHSA-6j79-4gfx-fm6f) | medium 4.2 | `secure-client-uris` localhost exception accepts `localhost`-prefixed hosts |
| [CVE-2026-93999](https://nvd.nist.gov/vuln/detail/CVE-2026-93999) / [GHSA-82wc-7jr6-wxgm](https://github.com/advisories/GHSA-82wc-7jr6-wxgm) | medium 4.2 | Token-exchange refresh keeps issuing for a disabled audience client |
| [CVE-2026-18206](https://nvd.nist.gov/vuln/detail/CVE-2026-18206) / [GHSA-2w88-g477-cxmj](https://github.com/advisories/GHSA-2w88-g477-cxmj) | low 3.7 | Source-host wildcard matches any suffix, not just subdomains |
| [CVE-2026-18217](https://nvd.nist.gov/vuln/detail/CVE-2026-18217) / [GHSA-82v3-6227-jc8x](https://github.com/advisories/GHSA-82v3-6227-jc8x) | low 3.4 | SAML redirect-binding parameter pollution |

**In bundled libraries** — these ranges are the library's version, not Keycloak's, and the three highs publish a CVSS v4 score only (8.6–8.7):

| CVE / advisory | Severity | Package, fixed at |
|---|---|---|
| [CVE-2026-84939](https://nvd.nist.gov/vuln/detail/CVE-2026-84939) / [GHSA-27j2-h3m2-8237](https://github.com/advisories/GHSA-27j2-h3m2-8237) | **critical 9.1** | `org.freemarker:freemarker` ≥ 2.2.0 ≤ 2.3.34 → 2.3.35 |
| [CVE-2026-8798](https://nvd.nist.gov/vuln/detail/CVE-2026-8798) / [GHSA-v6w3-qrh8-qccc](https://github.com/advisories/GHSA-v6w3-qrh8-qccc) | high | `org.bouncycastle:bc-fips` ≥ 2.1.0 < 2.1.3 → 2.1.3 |
| [CVE-2026-13505](https://nvd.nist.gov/vuln/detail/CVE-2026-13505) / [GHSA-98j2-6v39-78w8](https://github.com/advisories/GHSA-98j2-6v39-78w8) | high | `org.bouncycastle:bc-fips` → 1.0.2.7 / 2.0.2 / 2.1.3 per series |
| [CVE-2025-66021](https://nvd.nist.gov/vuln/detail/CVE-2025-66021) / [GHSA-g9gq-3pfx-2gw2](https://github.com/advisories/GHSA-g9gq-3pfx-2gw2) | high | `owasp-java-html-sanitizer` = 20240325.1 → 20260101.1 |

**CVE-2026-84939 is the only critical, and we cannot tell you whether it reaches you.** FreeMarker is Keycloak's theme engine, and a malformed locale identifier can traverse outside the intended template directory when localized lookup is on, which is the default. 26.7.4 shipped FreeMarker 2.3.32; 26.7.5 moves to 2.3.35. What no source we read says is whether Keycloak's own configuration is reachable — the advisory's caveat is that reachable files stay bounded by the configured `TemplateLoader`. Read [it](https://github.com/advisories/GHSA-27j2-h3m2-8237) before putting a number in a risk register; treat 9.1 as a ceiling.

**CVE-2026-89298 has the clearest exposure test here.** Anyone holding `view-clients` — a read-only auditor, a support tier, a dashboard service account — can read confidential client secrets in cleartext from the client registration GET endpoint. Needing high privileges holds it to 4.9, but "read-only admin" has not been read-only. Check who holds it first.

## If you run 26.6, 26.5 or 26.4

**The code is on your branch. Nobody has tagged it.** No Keycloak advisory here publishes a `vulnerabilities` array, so we read the branch trees, 30 September:

| Branch | Newest tag | What that tag actually has | Runnable image |
|---|---|---|---|
| 26.7 | 26.7.5 | all 14 | `quay.io/phasetwo/keycloak:26.7.5` |
| 26.6 | 26.6.7 (7 Sep) | CVE-2025-66021 only | `quay.io/phasetwo/keycloak:26.6.7` |
| 26.5 | 26.5.7 (April) | **none — branch archived** | — |
| 26.4 | 26.4.16 (7 Sep) | CVE-2025-66021 only | `quay.io/phasetwo/keycloak:26.4.16` |

Since those tags, `release/26.6` has moved 35 commits ahead and carries FreeMarker 2.3.35, `bc-fips` 2.1.3 and most of the Keycloak fixes; `release/26.4` is 16 ahead with FreeMarker and the SAML fix, `bc-fips` still at 2.1.2. Upstream labels them `26.6.8` and `26.4.17`; both 404 from the tags API today. Keycloak normally tags backports without announcing them, so [images exist](/extensions/containers/) for versions with no GitHub release ([more here](/blog/keycloak-lts-backport-images)) — here there is nothing to build from. Move to 26.7.5, or wait.

## Breaking changes

Three, in the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes):

- **Disabled clients leave the token audience.** A disabled or removed client no longer enters `aud`, and its roles drop out of `resource_access`. Tokens still issue, so logins keep working — but a resource server validating `aud` offline will start rejecting. This is the CVE-2026-93999 fix, and the one to test.
- **`client-updater-source-groups` matches full group paths.** A top-level group named simply is unaffected; a *subgroup* must become `/topGroup/level2group`.
- **`OrganizationProvider#getByAlias` is abstract** and no longer applies fine-grained admin permissions. Only affects custom providers.

## What else changed

Thirty bug fixes and Quarkus 3.33.4. Two worth knowing: [#51304](https://github.com/keycloak/keycloak/issues/51304), a `LazyInitializationException` breaking 26.7.0 upgrades after a DB dump and restore, and [#52257](https://github.com/keycloak/keycloak/issues/52257), a reused `EventBuilder` emitting the wrong event type — if a federated-identity link was logged and emailed as a login, that was it. The [release notes](https://www.keycloak.org/docs/latest/release_notes/index.html) still stop at 26.7.0.

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes), then test the `aud` change on staging — the only one that can break a working integration. [26.7.4](/blog/keycloak-2674-released) is the release this follows; our [production checklist](/blog/keycloak-production-checklist) covers the exposure questions above.

Stuck on 26.6 or 26.4 with no patch to take? Our [managed Keycloak](/hosting/dedicated-clusters/) clusters get [upgraded for you](/docs/self-service/upgrades), under SOC 2 Type II and ISO 27001. [Talk to us](/contact).
