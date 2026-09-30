---
slug: keycloak-2675-released
title: "Keycloak 26.7.5 Released: 14 CVEs, 3 Breaking Changes"
date: 2026-09-30
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.5 fixes 14 CVEs and makes three breaking changes. Upgrade this week if you delegate view-clients or use group-based authorization policies.
keywords: [keycloak 26.7.5, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if you delegate `view-clients` to anyone you would not trust with a client secret, or if you use group-based authorization or client policies.** Keycloak 26.7.5 fixes 14 CVEs: ten in Keycloak, all published medium or low, and four in bundled dependencies, one critical. Three breaking changes ship with it, and none of these fixes exists on 26.4, 26.5 or 26.6.

<!-- truncate -->

## Should you upgrade?

| If your realms… | When |
|---|---|
| Grant `view-clients` to read-only admins or automation | **This week.** They can read client secrets in cleartext. |
| Use group-based authorization policies, or the `client-updater-source-groups`, `client-updater-source-host` or `secure-client-uris` conditions | **This week.** Four matching bugs let the wrong principal through. |
| Serve a login page to the public internet | **Undetermined** — see the FreeMarker note. |
| Rely on brute-force lockout, with CIBA or the Device Grant | This week. Both bypass lockout at redemption. |
| Run FIPS mode (`bc-fips`) on Intel hardware | This cycle. An unbounded entropy retry can hang a thread. |
| None of the above | Next normal cycle. |

## Security fixes

Counted from the release notes: 14 security bullets, 14 distinct CVE ids. A fifteenth, CVE-2026-9798, appears only as the earlier issue two of these follow up on.

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-84939](https://nvd.nist.gov/vuln/detail/CVE-2026-84939) / [GHSA-27j2-h3m2-8237](https://github.com/advisories/GHSA-27j2-h3m2-8237) | critical 9.1 | **FreeMarker.** Template-loading path traversal via a malformed locale |
| [CVE-2026-8798](https://nvd.nist.gov/vuln/detail/CVE-2026-8798) / [GHSA-v6w3-qrh8-qccc](https://github.com/advisories/GHSA-v6w3-qrh8-qccc) | high 8.7 (v4) | **bc-fips.** Unbounded RDSEED/RDRAND retry hangs the thread |
| [CVE-2026-13505](https://nvd.nist.gov/vuln/detail/CVE-2026-13505) / [GHSA-98j2-6v39-78w8](https://github.com/advisories/GHSA-98j2-6v39-78w8) | high 8.7 (v4) | **bc-fips.** Finalizer-based zeroisation leaves key material resident |
| [CVE-2025-66021](https://nvd.nist.gov/vuln/detail/CVE-2025-66021) / [GHSA-g9gq-3pfx-2gw2](https://github.com/advisories/GHSA-g9gq-3pfx-2gw2) | high 8.6 (v4) | **OWASP HTML sanitizer.** XSS via `noscript` plus text-in-`style` |
| [CVE-2026-18203](https://nvd.nist.gov/vuln/detail/CVE-2026-18203) / [GHSA-wx5m-whr8-48h5](https://github.com/advisories/GHSA-wx5m-whr8-48h5) | medium 6.5 | Group policy child extension prefix-matches sibling groups |
| [CVE-2026-18207](https://nvd.nist.gov/vuln/detail/CVE-2026-18207) / [GHSA-rfxv-6gx8-3fm6](https://github.com/advisories/GHSA-rfxv-6gx8-3fm6) | medium 6.5 | Source-group condition matches a same-named group elsewhere |
| [CVE-2026-18208](https://nvd.nist.gov/vuln/detail/CVE-2026-18208) / [GHSA-jg59-c35g-76r8](https://github.com/advisories/GHSA-jg59-c35g-76r8) | medium 6.5 | Introspection leaks full claims for an out-of-audience token |
| [CVE-2026-88770](https://nvd.nist.gov/vuln/detail/CVE-2026-88770) / [GHSA-q4q6-f3mm-hfmv](https://github.com/advisories/GHSA-q4q6-f3mm-hfmv) | medium 6.5 | Device Grant redeems tokens for a locked account |
| [CVE-2026-89298](https://nvd.nist.gov/vuln/detail/CVE-2026-89298) / [GHSA-386r-m7rr-67p4](https://github.com/advisories/GHSA-386r-m7rr-67p4) | medium 4.9 | Client Registration GET returns the secret to `view-clients` |
| [CVE-2026-16103](https://nvd.nist.gov/vuln/detail/CVE-2026-16103) / [GHSA-v7m3-vpqr-6m6p](https://github.com/advisories/GHSA-v7m3-vpqr-6m6p) | medium 4.3 | CIBA token redemption skips the lockout check |
| [CVE-2026-18211](https://nvd.nist.gov/vuln/detail/CVE-2026-18211) / [GHSA-6j79-4gfx-fm6f](https://github.com/advisories/GHSA-6j79-4gfx-fm6f) | medium 4.2 | `secure-client-uris` accepts `localhost`-prefixed domains |
| [CVE-2026-93999](https://nvd.nist.gov/vuln/detail/CVE-2026-93999) / [GHSA-82wc-7jr6-wxgm](https://github.com/advisories/GHSA-82wc-7jr6-wxgm) | medium 4.2 | Refresh keeps issuing tokens for a disabled audience client |
| [CVE-2026-18206](https://nvd.nist.gov/vuln/detail/CVE-2026-18206) / [GHSA-2w88-g477-cxmj](https://github.com/advisories/GHSA-2w88-g477-cxmj) | low 3.7 | Source-host wildcard matches any suffix, not just subdomains |
| [CVE-2026-18217](https://nvd.nist.gov/vuln/detail/CVE-2026-18217) / [GHSA-82v3-6227-jc8x](https://github.com/advisories/GHSA-82v3-6227-jc8x) | low 3.4 | SAML redirect binding parameter pollution, wildcard redirects |

**CVE-2026-84939 (critical, 9.1) is FreeMarker's, and nobody has said what it means for Keycloak.** Apache describes a template-loading path traversal that fires when an attacker supplies a malformed locale and localized lookup is on, which it is by default. Keycloak renders login, account and email pages through FreeMarker and takes a locale from the request. Whether that reaches the template loader exploitably is exactly what the advisory does not answer, and neither the release notes nor the upgrading guide mention it. Apache does note reachable files stay bounded by the configured `TemplateLoader`. **We could not determine the Keycloak-specific exposure.** Read [the advisory](https://github.com/advisories/GHSA-27j2-h3m2-8237) and [Red Hat's page](https://access.redhat.com/security/cve/CVE-2026-84939), not our summary; if you use a directory-based theme loader, treat it as the urgent item here.

**CVE-2026-89298 (medium, 4.9) has the cleanest exposure story.** A principal holding `view-clients` — the read-only role you hand an auditor or a dashboard — gets the confidential client secret back in cleartext from the Client Registration GET endpoint. That is a direct path from read-only to client impersonation, and 4.9 understates it if you delegate that role widely.

Both brute-force bypasses need a flow started before the lockout. CVE-2026-16103 is an incomplete fix for CVE-2026-9798 — CIBA *initiation* got the lockout check, redemption did not — and CVE-2026-88770 is the same shape in the Device Grant. If [brute force detection](/docs/security/brute-force-detection/) is load-bearing, these are real.

## If you run 26.6, 26.5 or 26.4

None of the ten Keycloak advisories publishes a `vulnerabilities` array, so there is no upstream backport map here at all. We read the branch diffs instead, 30 September:

| Branch | Newest release | Newest tag | These fixes | Runnable image |
|---|---|---|---|---|
| 26.7 | 26.7.5 | 26.7.5 | all 14 | `quay.io/phasetwo/keycloak:26.7.5` |
| 26.6 | 26.6.4 (June) | 26.6.7 (7 Sep) | **none** | `quay.io/phasetwo/keycloak:26.6.7` |
| 26.5 | 26.5.7 (April) | 26.5.7 | **none** | — |
| 26.4 | 26.4.7 (Dec 2025) | 26.4.16 (7 Sep) | CVE-2025-66021 only | `quay.io/phasetwo/keycloak:26.4.16` |

Keycloak tags backports without publishing a release, so 26.6.7 and 26.4.16 exist unannounced and we publish [container images](/extensions/containers/) for both. But both were cut on 7 September — before four of these CVEs were published — and neither branch diff contains these fixes. **If you are on 26.4 or 26.6, your branch has no patch for any of this**, and 26.5 has had no tag since April.

## Breaking changes

Three, all in the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes).

1. **`client-updater-source-groups` matches the full group path.** A top-level group named simply still works; a *subgroup* named simply must become `/topGroup/level2group`. This is the hardening behind CVE-2026-18207.
2. **`OrganizationProvider#getByAlias` is abstract**, and it and `getByMember` no longer apply fine-grained admin permissions. Only affects custom providers.
3. **Disabled or removed clients never enter `aud` or `resource_access`.** Tokens still issue, so logins and refreshes keep working. This is the CVE-2026-93999 fix; it changes behaviour the moment you disable a client, if a resource server validates JWTs offline on `aud`.

Notable: generated self-signed certificates truncate the CN to 64 characters per RFC 5280, which unbroke SAML client creation under BouncyCastle 1.85.

## What else changed

Quarkus moves to 3.33.4. Two operational fixes: the 26.7.0 `LazyInitializationException` that crashed upgrades after a DB dump/restore ([#51304](https://github.com/keycloak/keycloak/issues/51304)), and ISPN000136 failures from an Infinispan node becoming a command target before its caches were ready ([#52088](https://github.com/keycloak/keycloak/issues/52088)). The release notes page stops at 26.7.0, so the [GitHub release](https://github.com/keycloak/keycloak/releases/tag/26.7.5) is the changelog.

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes), then audit two things on staging: client policy conditions naming a subgroup, and any resource server doing offline `aud` validation. Our [production checklist](/blog/keycloak-production-checklist/) covers the exposure questions above; [26.7.4](/blog/keycloak-2674-released/) is the release this follows.

Rather not schedule this one? Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact).
