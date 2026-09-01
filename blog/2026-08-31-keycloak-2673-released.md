---
slug: keycloak-2673-released
title: "Keycloak 26.7.3 Released: 20 CVEs, none an emergency"
date: 2026-08-31
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.3 fixes 20 CVEs, but none needs an emergency window. Three breaking changes and the missing backport for 26.4, 26.5 and 26.6 do need a plan.
keywords: [keycloak 26.7.3, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: no emergency window, but upgrade this week if you use external token exchange with Google or Microsoft, or fine-grained admin permissions (FGAP) v2 with delegated admins.** Keycloak 26.7.3 fixes 20 CVEs. The only **high** one is in a test-scope dependency and does not reach a running server — our reading, evidence below. Everything that does is medium or lower and needs a privileged account or an opt-in feature. The three breaking changes will bite you before any CVE does. If you run 26.4, 26.5 or 26.6, **no tag carrying these fixes exists yet.**

<!-- truncate -->

## Should you upgrade?

Ahead of your normal cycle in two cases. One: you restrict a Google or Microsoft [Keycloak identity provider](/docs/keycloak/idp/) by hosted domain or tenant and have external token exchange enabled — CVE-2026-18214 and CVE-2026-18215 (medium, 6.8) let an external token past that restriction. Two: you delegate realm admin under FGAP v2 to people you would not hand `manage-users`.

Otherwise, take it for the performance regressions below, not the CVEs.

## The one high-severity CVE looks test-scope

[CVE-2026-35563](https://nvd.nist.gov/vuln/detail/CVE-2026-35563) ([GHSA-85rw-g4f4-jprr](https://github.com/advisories/GHSA-85rw-g4f4-jprr), high, 8.8 CVSS v4) lacks TLS hostname verification in the Apache Directory LDAP client API. Its fixed version, **2.1.8, is the library's, not Keycloak's.** Upstream lists it under "Security fixes" unqualified, which reads like your LDAP federation is exposed. It probably is not:

- Every `org.apache.directory.api` usage in `keycloak/keycloak` sits under `util/embedded-ldap` or `testsuite/`, and only testsuite modules depend on `embedded-ldap`.
- `federation/ldap` reaches your directory through JNDI (`javax.naming.ldap`) instead.
- The fix commit is "Upgrade ApacheDS to 2.0.0.AM27", and [#51785](https://github.com/keycloak/keycloak/issues/51785) here is titled "Multiple CVEs inherited from Apache DS used for testing".

That is our analysis, not an upstream statement — read the advisory if certainty matters.

## All 20 CVEs

The [release body](https://github.com/keycloak/keycloak/releases/tag/26.7.3) carries 22 distinct CVE identifiers; two are back-references to earlier CVEs whose fixes proved incomplete, leaving 20 fixed here: one high, 17 medium, one low, one unrated.

| CVE | Severity | Exposed if | Advisory |
|---|---|---|---|
| [CVE-2026-35563](https://nvd.nist.gov/vuln/detail/CVE-2026-35563) | high | Test scope (see above) | [GHSA-85rw-g4f4-jprr](https://github.com/advisories/GHSA-85rw-g4f4-jprr) |
| [CVE-2026-18215](https://nvd.nist.gov/vuln/detail/CVE-2026-18215) | medium | Microsoft IdP tenant restriction | [GHSA-v8h5-7wp9-qxxv](https://github.com/advisories/GHSA-v8h5-7wp9-qxxv) |
| [CVE-2026-18214](https://nvd.nist.gov/vuln/detail/CVE-2026-18214) | medium | Google IdP hosted-domain restriction | [GHSA-wmhp-w67v-6jm5](https://github.com/advisories/GHSA-wmhp-w67v-6jm5) |
| [CVE-2026-18571](https://nvd.nist.gov/vuln/detail/CVE-2026-18571) | medium | FGAP v2 + `POST /users` | [GHSA-5vmc-qhfj-qxc3](https://github.com/advisories/GHSA-5vmc-qhfj-qxc3) |
| [CVE-2026-17059](https://nvd.nist.gov/vuln/detail/CVE-2026-17059) | medium | FGAP v2 (leaks user PII) | [GHSA-4w3x-69m8-478c](https://github.com/advisories/GHSA-4w3x-69m8-478c) |
| [CVE-2026-18572](https://nvd.nist.gov/vuln/detail/CVE-2026-18572) | medium | UMA time policies | [GHSA-mcjq-c4g7-wcfh](https://github.com/advisories/GHSA-mcjq-c4g7-wcfh) |
| [CVE-2026-18573](https://nvd.nist.gov/vuln/detail/CVE-2026-18573) | medium | Client access-type condition | [GHSA-wm3j-jpqg-fwv2](https://github.com/advisories/GHSA-wm3j-jpqg-fwv2) |
| [CVE-2026-79652](https://nvd.nist.gov/vuln/detail/CVE-2026-79652) | medium | `jwt-bearer` + `consentRequired` | [GHSA-9f9p-c2v5-98rx](https://github.com/advisories/GHSA-9f9p-c2v5-98rx) |
| [CVE-2026-18201](https://nvd.nist.gov/vuln/detail/CVE-2026-18201) | medium | Organizations + IdP creation | [GHSA-fvjx-r757-3r6r](https://github.com/advisories/GHSA-fvjx-r757-3r6r) |
| [CVE-2026-16093](https://nvd.nist.gov/vuln/detail/CVE-2026-16093) | medium | Signed-JWT assertion policy | [GHSA-jmhg-9c54-p575](https://github.com/advisories/GHSA-jmhg-9c54-p575) |
| [CVE-2026-16089](https://nvd.nist.gov/vuln/detail/CVE-2026-16089) | medium | OIDC; needs an intercepted code | [GHSA-63wm-fvw8-h2hp](https://github.com/advisories/GHSA-63wm-fvw8-h2hp) |
| [CVE-2026-18570](https://nvd.nist.gov/vuln/detail/CVE-2026-18570) | medium | `full-scope-disabled` policy | [GHSA-r6f5-hj4x-7mq7](https://github.com/advisories/GHSA-r6f5-hj4x-7mq7) |
| [CVE-2026-16072](https://nvd.nist.gov/vuln/detail/CVE-2026-16072) | medium | Organization invitation links | [GHSA-mp76-m6c2-jqh5](https://github.com/advisories/GHSA-mp76-m6c2-jqh5) |
| [CVE-2026-16105](https://nvd.nist.gov/vuln/detail/CVE-2026-16105) | medium | Admin composite-role endpoints | [GHSA-w32v-46r7-99r7](https://github.com/advisories/GHSA-w32v-46r7-99r7) |
| [CVE-2026-16106](https://nvd.nist.gov/vuln/detail/CVE-2026-16106) | medium | FGAP v2 composite deletion | [GHSA-78mv-phq4-25fv](https://github.com/advisories/GHSA-78mv-phq4-25fv) |
| [CVE-2026-16108](https://nvd.nist.gov/vuln/detail/CVE-2026-16108) | medium | FGAP v2 hidden groups | [GHSA-mvwh-6438-3v8w](https://github.com/advisories/GHSA-mvwh-6438-3v8w) |
| [CVE-2026-16104](https://nvd.nist.gov/vuln/detail/CVE-2026-16104) | medium | reCAPTCHA + FGAP v2 | [GHSA-qh48-wwv4-fmr8](https://github.com/advisories/GHSA-qh48-wwv4-fmr8) |
| [CVE-2026-18218](https://nvd.nist.gov/vuln/detail/CVE-2026-18218) | medium | Client not-before revocation | [GHSA-vhxw-j6h3-48jm](https://github.com/advisories/GHSA-vhxw-j6h3-48jm) |
| [CVE-2026-18209](https://nvd.nist.gov/vuln/detail/CVE-2026-18209) | low | `redirect_uri` fragment check | [GHSA-c8xx-fr3x-6m5w](https://github.com/advisories/GHSA-c8xx-fr3x-6m5w) |
| [CVE-2026-19729](https://nvd.nist.gov/vuln/detail/CVE-2026-19729) | unrated | Realm-admin filesystem probing | none published |

No advisory is published for CVE-2026-19729 yet, so it carries no severity. Separately, the [CVE-2026-9794](https://nvd.nist.gov/vuln/detail/CVE-2026-9794) advisory claims a fix in 26.6.3 while [#52017](https://github.com/keycloak/keycloak/issues/52017) here calls that fix incomplete — trust the release notes and read the advisory.

## If you are not on 26.7

None of the 20 has reached 26.4, 26.5 or 26.6: the newest tag on each branch predates 26.7.3 and none names these CVE ids in a commit. Nineteen of the 21 advisories publish no version ranges, so that comes from tags, not advisory metadata.

Keycloak tags backports without publishing releases, which is why 26.4 looks stalled at 26.4.7 when it is really at 26.4.15. We build images for those tags:

| Branch | Newest release | Newest tag | Has these fixes | Runnable image |
|---|---|---|---|---|
| 26.7 | 26.7.3 | 26.7.3 | yes | `quay.io/phasetwo/keycloak:26.7.3` |
| 26.6 | 26.6.4 (26 Jun) | 26.6.6 (11 Aug) | **no** | `quay.io/phasetwo/keycloak:26.6.6` |
| 26.5 | 26.5.7 (2 Apr) | 26.5.7 | **no** | *(none published)* |
| 26.4 | 26.4.7 (1 Dec 2025) | 26.4.15 (11 Aug) | **no** | `quay.io/phasetwo/keycloak:26.4.15` |

[Tag list](https://quay.io/repository/phasetwo/keycloak?tab=tags) checked 1 September 2026.

## Breaking changes

Three, all consequences of CVE fixes, in the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) — the only doc covering this release, since the release notes page still stops at 26.7.0:

- **Redirect URIs containing OIDC response parameters** (`state`, `code`, `session_state`) are now rejected by default. If a client carries `state` in its registered `redirect_uri`, logins break.
- **Claims prefixed `kc.` are reserved** for server-controlled evaluation context attributes, so authorization policies reading a `kc.` claim from a client-supplied claim token change behaviour.
- **Organization invitation links are no longer returned** by the Admin REST API invitation endpoints, breaking automation that read the link out of the response — check this if you script [Keycloak organizations](/extensions/organizations/).

## Also fixed

Three regressions worth the upgrade alone if you run many realms: admin API cost growing super-linearly with realm count since 26.7.1 ([#51554](https://github.com/keycloak/keycloak/issues/51554)), sustained high CPU on all nodes after upgrade ([#51523](https://github.com/keycloak/keycloak/issues/51523)), and lightweight access tokens resolving every role in every realm on every admin API request ([#51707](https://github.com/keycloak/keycloak/issues/51707)).

Related: [security capabilities on dedicated clusters](/blog/dedicated-clusters-security-capabilities) and [what SOC 2 Type II covered](/blog/soc-2-type-II-compliance).

Our [managed Keycloak](/hosting/dedicated-clusters/) clusters run 26.7.3, including backport tags upstream never released. If tracking twenty advisories a month is not your job, that is what you are buying.
