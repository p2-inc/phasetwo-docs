---
slug: keycloak-2673-released
title: "Keycloak 26.7.3 Released: 20 CVEs, No Fix for 26.4–26.6"
date: 2026-08-31
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.3 fixes 20 CVEs. Not an emergency, but upgrade this week if you use external token exchange or FGAP v2 — and 26.4-26.6 have no patch yet.
keywords: [keycloak 26.7.3, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: not an emergency, but upgrade this week if you use token exchange with a Google or Microsoft broker, or FGAP v2 to delegate admin rights. On 26.4, 26.5 or 26.6 there is no patch for you today.** Keycloak 26.7.3 fixes 20 CVEs — one high, 17 medium, one low, one unrated — plus two breaking changes. Every one needs a delegated admin account, client credentials, or an intercepted authorization code; the single high is in a test-only dependency.

<!-- truncate -->

## Should you upgrade?

| If your realms… | When |
|---|---|
| Exchange Google or Microsoft tokens via token exchange | **This week.** Domain and tenant limits went unenforced. |
| Delegate admin rights with FGAP v2 | **This week.** Six fixes; sub-admins could act outside scope. |
| Run on 26.4, 26.5 or 26.6 | **Plan the move to 26.7** — no backport is tagged. |
| Use redirect URIs with `state`, `code` or `session_state` | **Test first** — now rejected by default. |
| None of the above | Next normal cycle. |

## Security fixes

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-35563](https://nvd.nist.gov/vuln/detail/CVE-2026-35563) / [GHSA-85rw-g4f4-jprr](https://github.com/advisories/GHSA-85rw-g4f4-jprr) | high | LDAP client skips TLS hostname check |
| [CVE-2026-18215](https://nvd.nist.gov/vuln/detail/CVE-2026-18215) / [GHSA-v8h5-7wp9-qxxv](https://github.com/advisories/GHSA-v8h5-7wp9-qxxv) | medium 6.8 | Token exchange ignores Microsoft tenant limit |
| [CVE-2026-18214](https://nvd.nist.gov/vuln/detail/CVE-2026-18214) / [GHSA-wmhp-w67v-6jm5](https://github.com/advisories/GHSA-wmhp-w67v-6jm5) | medium 6.8 | Token exchange ignores Google domain limit |
| [CVE-2026-18571](https://nvd.nist.gov/vuln/detail/CVE-2026-18571) / [GHSA-5vmc-qhfj-qxc3](https://github.com/advisories/GHSA-5vmc-qhfj-qxc3) | medium 6.6 | User creation adds unpermitted groups |
| [CVE-2026-17059](https://nvd.nist.gov/vuln/detail/CVE-2026-17059) / [GHSA-4w3x-69m8-478c](https://github.com/advisories/GHSA-4w3x-69m8-478c) | medium 6.5 | Role-members endpoint leaks user PII |
| [CVE-2026-18572](https://nvd.nist.gov/vuln/detail/CVE-2026-18572) / [GHSA-mcjq-c4g7-wcfh](https://github.com/advisories/GHSA-mcjq-c4g7-wcfh) | medium 6.5 | Claim token overrides time-policy clock |
| [CVE-2026-18573](https://nvd.nist.gov/vuln/detail/CVE-2026-18573) / [GHSA-wm3j-jpqg-fwv2](https://github.com/advisories/GHSA-wm3j-jpqg-fwv2) | medium 6.5 | Client update dodges access-type policy |
| [CVE-2026-79652](https://nvd.nist.gov/vuln/detail/CVE-2026-79652) / [GHSA-9f9p-c2v5-98rx](https://github.com/advisories/GHSA-9f9p-c2v5-98rx) | medium 5.9 | JWT-bearer grant skips consent |
| [CVE-2026-18201](https://nvd.nist.gov/vuln/detail/CVE-2026-18201) / [GHSA-fvjx-r757-3r6r](https://github.com/advisories/GHSA-fvjx-r757-3r6r) | medium 5.5 | IdP creation binds broker to organization |
| [CVE-2026-16093](https://nvd.nist.gov/vuln/detail/CVE-2026-16093) / [GHSA-jmhg-9c54-p575](https://github.com/advisories/GHSA-jmhg-9c54-p575) | medium 5.4 | Unsigned header bypasses signed-JWT policy |
| [CVE-2026-16089](https://nvd.nist.gov/vuln/detail/CVE-2026-16089) / [GHSA-63wm-fvw8-h2hp](https://github.com/advisories/GHSA-63wm-fvw8-h2hp) | medium 5.4 | Auth code redeemable by another client |
| [CVE-2026-18570](https://nvd.nist.gov/vuln/detail/CVE-2026-18570) / [GHSA-r6f5-hj4x-7mq7](https://github.com/advisories/GHSA-r6f5-hj4x-7mq7) | medium 5.4 | Omitted field bypasses full-scope policy |
| [CVE-2026-16072](https://nvd.nist.gov/vuln/detail/CVE-2026-16072) / [GHSA-mp76-m6c2-jqh5](https://github.com/advisories/GHSA-mp76-m6c2-jqh5) | medium 4.9 | Org manager creates members via invite |
| [CVE-2026-16105](https://nvd.nist.gov/vuln/detail/CVE-2026-16105) / [GHSA-w32v-46r7-99r7](https://github.com/advisories/GHSA-w32v-46r7-99r7) | medium 4.9 | Composite-role endpoints skip authorization |
| [CVE-2026-16106](https://nvd.nist.gov/vuln/detail/CVE-2026-16106) / [GHSA-78mv-phq4-25fv](https://github.com/advisories/GHSA-78mv-phq4-25fv) | medium 4.9 | Delegated admin removes privileged roles |
| [CVE-2026-16108](https://nvd.nist.gov/vuln/detail/CVE-2026-16108) / [GHSA-mvwh-6438-3v8w](https://github.com/advisories/GHSA-mvwh-6438-3v8w) | medium 4.3 | Default-group reads disclose hidden groups |
| [CVE-2026-16104](https://nvd.nist.gov/vuln/detail/CVE-2026-16104) / [GHSA-qh48-wwv4-fmr8](https://github.com/advisories/GHSA-qh48-wwv4-fmr8) | medium 4.3 | View-only admin sees reCAPTCHA secrets |
| [CVE-2026-18218](https://nvd.nist.gov/vuln/detail/CVE-2026-18218) / [GHSA-vhxw-j6h3-48jm](https://github.com/advisories/GHSA-vhxw-j6h3-48jm) | medium 4.2 | Client not-before revocation ignored |
| [CVE-2026-18209](https://nvd.nist.gov/vuln/detail/CVE-2026-18209) / [GHSA-c8xx-fr3x-6m5w](https://github.com/advisories/GHSA-c8xx-fr3x-6m5w) | low 3.4 | Redirect-URI injection via URL fragment |
| [CVE-2026-19729](https://nvd.nist.gov/vuln/detail/CVE-2026-19729) / none | **unrated** | Path-traversal probing (incomplete 9083 fix) |

Counted from the release notes: 20 security bullets, 20 CVE ids.

**CVE-2026-18214 and CVE-2026-18215 (medium, 6.8)** are the reason to move. If you restricted a Google broker to a Workspace domain or a Microsoft broker to one tenant, token exchange ignored that: a valid token from any other domain bought a Keycloak token.

**CVE-2026-35563 (high, 8.8) does not reach a running server.** [The upstream issue](https://github.com/keycloak/keycloak/issues/50785) calls it "present in Keycloak's development dependencies", the fix was an ApacheDS test-server upgrade, and `org.apache.directory.api` appears only under `util/embedded-ldap/` and `testsuite/`. LDAP federation uses JNDI.

**CVE-2026-19729 has no advisory, so it carries no severity.** Keycloak calls it an incomplete fix for [CVE-2026-9083](https://nvd.nist.gov/vuln/detail/CVE-2026-9083) ([GHSA-7pm9-g8jh-3m74](https://github.com/advisories/GHSA-7pm9-g8jh-3m74)) — filesystem probing by a `manage-realm` admin. Weigh it from [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-19729).

## If you run 26.4, 26.5 or 26.6

Every advisory here lists affected and patched versions as "Unknown". The upstream issues do better — each carries `release/` labels naming the branches its fix is headed for. Checked 2 September:

| Branch | Newest release | Newest tag | These fixes |
|---|---|---|---|
| 26.7 | 26.7.3 | 26.7.3 | all 20 |
| 26.6 | 26.6.4 | 26.6.6 (11 Aug) | all 20 labelled `26.6.7` — **not tagged yet** |
| 26.5 | 26.5.7 | 26.5.7 | none labelled |
| 26.4 | 26.4.7 | 26.4.15 (11 Aug) | CVE-2026-19729 only, labelled `26.4.16` — **not tagged yet** |

Keycloak tags backports without publishing a release, so 26.6.6 and 26.4.15 are real despite nothing announcing them, and we publish [container images](/extensions/containers/) for both. Both predate this work. If a row above applies, the answer is 26.7.3.

## Breaking changes

Two, both in the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes):

- **OIDC parameters in redirect URIs are rejected by default** — those containing `state`, `code` or `session_state` now fail. This is the hardening behind CVE-2026-18209. Escape hatches exist (`allow-oidc-params-in-redirect-uris`, per-client `allow.oidc.params.in.redirect.uris`) but are deprecated and go in Keycloak 27.
- **Authorization services claim handling** — the `kc.` prefix is reserved, and user claims using it are filtered before policy evaluation. On a collision, permission-ticket claims beat `claim_token` claims.

Also deprecated: `inviteLink` is no longer returned by the organization invitation endpoints — the fix for CVE-2026-16072.

## What else changed

Three of 19 bug fixes matter at many-realm scale: admin API cost growing super-linearly with realm count since 26.7.1 (#51554), lightweight access tokens resolving every role in every realm per admin request (#51707), and sustained high CPU on all nodes (#51523). If your cluster got hot after 26.7.1, this is it — the shape of problem behind our [event-storage work](/blog/scaling-keycloak-event-storage).

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) first; the [release notes](https://www.keycloak.org/docs/latest/release_notes/index.html) stop at 26.7.0. Test the redirect-URI change on a staging realm — the only thing here that breaks a working login. Our [security docs](/docs/security/) cover controls several of these CVEs bypassed; [Organizations](/blog/orgs-scim-experimental) users, note the invitation change.

Rather not schedule it? Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact).
