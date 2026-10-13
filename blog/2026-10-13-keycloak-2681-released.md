---
slug: keycloak-2681-released
title: "Keycloak 26.8.1 Released: 19 CVEs, One Unrated SAML Bypass"
date: 2026-10-13
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.8.1 fixes 19 CVEs, none above medium in Keycloak itself, plus an unrated SAML broker bypass. Upgrade this week if you broker SAML or use mTLS.
keywords: [keycloak 26.8.1, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if you broker SAML, rely on mTLS token binding, or skip OTP by header; otherwise take it next cycle.** Keycloak 26.8.1 fixes 19 CVEs — 18 in Keycloak, all medium or low, plus one high-severity `jackson-databind` issue. The fix most likely to move your schedule has no CVE — an item filed under *Weaknesses* that upstream describes as unauthenticated login as an arbitrary user through the SAML broker.

<!-- truncate -->

## Should you upgrade?

| If you… | When |
|---|---|
| Broker SAML over the HTTP-Redirect binding | **This week** — unrated, but see below |
| Use Token Exchange V2 with mTLS holder-of-key binding | **This week.** The certificate check was absent |
| Skip OTP by HTTP header behind a proxy | **This week**, unless it strips that header everywhere |
| Delegate administration via fine-grained permissions | **Soon.** Three bypasses, one reaching `realm-admin` |
| Everyone else | Next cycle, after the breaking changes |

## The most serious fix has no CVE

[#53354](https://github.com/keycloak/keycloak/issues/53354) is filed under *Weaknesses*, not *Security fixes*. Upstream's title: the SAML broker's HTTP-Redirect binding verifies the signature over a different `SAMLResponse` than it processes, because `;` was accepted as a parameter separator — "unauthenticated login as an arbitrary user".

**No CVE was assigned and no advisory published, so it has no severity and we will not invent one.** Corroborating it: 26.8.1 makes "semicolons are no longer query parameter delimiters" a changed default — the parser half of that fix. [#53116](https://github.com/keycloak/keycloak/issues/53116), same section, is unauthenticated session termination via a SAML `LogoutRequest`, also unrated.

If you broker SAML, read both issues and judge for yourself; "no CVE" is not "no risk".

## Security fixes

22 distinct CVE identifiers appear in the release notes and 19 are fixed here; the other three are cited only as earlier CVEs this release completes or repairs a regression from. Of the 19: **14 medium and 4 low in Keycloak itself, none high or critical**, plus one high in a shipped library.

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-97846](https://nvd.nist.gov/vuln/detail/CVE-2026-97846) / [GHSA-f7cv-8449-mr73](https://github.com/advisories/GHSA-f7cv-8449-mr73) | medium 6.8 | Token Exchange V2 ignores mTLS holder-of-key binding |
| [CVE-2026-96445](https://nvd.nist.gov/vuln/detail/CVE-2026-96445) / [GHSA-jj9w-64w4-2wcx](https://github.com/advisories/GHSA-jj9w-64w4-2wcx) | medium 6.8 | Forged header skips OTP on untrusted paths |
| [CVE-2026-95503](https://nvd.nist.gov/vuln/detail/CVE-2026-95503) / [GHSA-35j3-ccrv-pgvj](https://github.com/advisories/GHSA-35j3-ccrv-pgvj) | medium 6.8 | Kerberos password auth never verifies the KDC |
| [CVE-2026-94000](https://nvd.nist.gov/vuln/detail/CVE-2026-94000) / [GHSA-3g7j-6fqv-v2q4](https://github.com/advisories/GHSA-3g7j-6fqv-v2q4) | medium 6.6 | `manage-users` admin joins admin-role group, becomes `realm-admin` |
| [CVE-2026-97177](https://nvd.nist.gov/vuln/detail/CVE-2026-97177) / [GHSA-pgx8-hgcr-q6rq](https://github.com/advisories/GHSA-pgx8-hgcr-q6rq) | medium 6.6 | User update applies a denied password reset |
| [CVE-2026-103884](https://nvd.nist.gov/vuln/detail/CVE-2026-103884) / [GHSA-xfh5-8fx4-3crm](https://github.com/advisories/GHSA-xfh5-8fx4-3crm) | medium 6.5 | CRL distribution point escapes `conf/` by traversal |
| [CVE-2026-107121](https://nvd.nist.gov/vuln/detail/CVE-2026-107121) / [GHSA-4276-jw29-xwhr](https://github.com/advisories/GHSA-4276-jw29-xwhr) | medium 6.5 | SMTP `starttls=true` falls back to plaintext |
| [CVE-2026-94001](https://nvd.nist.gov/vuln/detail/CVE-2026-94001) / [GHSA-p353-3p63-7h28](https://github.com/advisories/GHSA-p353-3p63-7h28) | medium 6.5 | Credential delete bypasses denied reset-password |
| [CVE-2026-82968](https://nvd.nist.gov/vuln/detail/CVE-2026-82968) / [GHSA-2w6p-j7xq-6p7v](https://github.com/advisories/GHSA-2w6p-j7xq-6p7v) | medium 6.4 | First-broker-login links identity to wrong account |
| [CVE-2026-15943](https://nvd.nist.gov/vuln/detail/CVE-2026-15943) / [GHSA-rpfh-mgxm-c6hc](https://github.com/advisories/GHSA-rpfh-mgxm-c6hc) | medium 5.5 | IdP edit reuses the masked client secret |
| [CVE-2026-94215](https://nvd.nist.gov/vuln/detail/CVE-2026-94215) / [GHSA-v5q7-f26g-qxgh](https://github.com/advisories/GHSA-v5q7-f26g-qxgh) | medium 5.5 | Per-request realm cache leaks across realms |
| [CVE-2026-94213](https://nvd.nist.gov/vuln/detail/CVE-2026-94213) / [GHSA-7238-mjjf-8jj4](https://github.com/advisories/GHSA-7238-mjjf-8jj4) | medium 4.9 | Policy evaluation skips user view authorization |
| [CVE-2026-97311](https://nvd.nist.gov/vuln/detail/CVE-2026-97311) / [GHSA-rc25-9gwp-h85r](https://github.com/advisories/GHSA-rc25-9gwp-h85r) | medium 4.3 | `roles/{role-name}/groups` lists groups caller cannot view |
| [CVE-2026-96446](https://nvd.nist.gov/vuln/detail/CVE-2026-96446) / [GHSA-j24v-wv3r-fjch](https://github.com/advisories/GHSA-j24v-wv3r-fjch) | medium 4.2 | `prompt=none` bypasses PAR single-use |
| [CVE-2026-101333](https://nvd.nist.gov/vuln/detail/CVE-2026-101333) / [GHSA-5fh4-qp8q-2wxm](https://github.com/advisories/GHSA-5fh4-qp8q-2wxm) | low 3.7 | Broker `idp` tag creates unbounded metric series |
| [CVE-2026-18569](https://nvd.nist.gov/vuln/detail/CVE-2026-18569) / [GHSA-pcf4-9g97-7cpf](https://github.com/advisories/GHSA-pcf4-9g97-7cpf) | low 3.7 | Unsigned logout tokens accepted when validation off |
| [CVE-2026-94217](https://nvd.nist.gov/vuln/detail/CVE-2026-94217) / [GHSA-2cpw-3v2x-mh42](https://github.com/advisories/GHSA-2cpw-3v2x-mh42) | low 3.5 | UMA merges scopes across owners on name collision |
| [CVE-2026-94218](https://nvd.nist.gov/vuln/detail/CVE-2026-94218) / [GHSA-rm49-qjx7-5qm5](https://github.com/advisories/GHSA-rm49-qjx7-5qm5) | low 3.1 | 2FA setup enforcement bypassed via `login-actions/restart` |
| [CVE-2026-91777](https://nvd.nist.gov/vuln/detail/CVE-2026-91777) / [GHSA-cxp5-3px4-pw24](https://github.com/advisories/GHSA-cxp5-3px4-pw24) | high 7.5 | `jackson-databind` library, not a Keycloak control |

Two bullets cite "multiple CVEs" in `tools.jackson.core:jackson-databind` and `simple-git` without naming them, so neither can we.

**CVE-2026-97846 is the one most likely to be live in your estate.** mTLS holder-of-key binding makes a stolen token useless without the certificate. Token Exchange V2 never checked for one, so an attacker with client credentials could exchange their way to an unbound token — if you treat that binding as a control, it has not been one.

## If you run 26.7, 26.6 or 26.4

The advisories are no help: **20 of the 22 carry no affected-version data**, so there is no backport map. Verified 13 October against branch histories and tags instead.

| Branch | Newest release | Newest tag | These fixes | Image |
|---|---|---|---|---|
| 26.8 | 26.8.1 | 26.8.1 | all | `26.8.0` — 26.8.1 not built yet |
| 26.7 | 26.7.5 (30 Sep) | 26.7.5 | none | `26.7.5` |
| 26.6 | 26.6.4 (June) | 26.6.7 (7 Sep) | none tagged | `26.6.7` |
| 26.4 | 26.4.7 (Dec 2025) | 26.4.16 (7 Sep) | none | `26.4.16` |

**26.7 is end of life.** Upstream moved it to `archive/release/26.7`; 26.7.5 was its last. Your path is 26.8.

26.6 is still maintained: CVE-2026-15943, CVE-2026-94213, CVE-2026-94215 and CVE-2026-94217 landed on `release/26.6` on 7–9 October, but **no tag has been cut since 26.6.7**, so there is nothing to run yet. 26.4 carries none.

Tags on [`quay.io/phasetwo/keycloak`](https://quay.io/repository/phasetwo/keycloak?tab=tags), including [backport tags upstream never announces](/blog/keycloak-lts-backport-images). 26.8.1 is not built yet — check the list.

## Breaking changes and migration

Six — a lot for a patch. These are the hardening behind the CVEs, and each can break a deployment:

- **SMTP STARTTLS is enforced.** Mail fails instead of downgrading.
- **CRL files load only from `conf/`.** Move them first; CRL and OCSP responses cap at 10 MB.
- **Backchannel logout tokens are always signature-validated**, whatever *Validate Signatures* says — set a JWKS URL or validating key on every OIDC [identity provider](/docs/keycloak/idp/) using it.
- **Semicolons are no longer query parameter delimiters.** Clients relying on them must send `&`.
- **X.509 key usage is validated whether or not the extension is critical**; a legacy option restores it.
- **Client secrets must be re-entered when an IdP's destination changes**; `providerId` is immutable.

Non-security, useful in a cluster: JGroups certificate reload no longer blocks the view-handling thread, and an unreachable node no longer blocks sends to healthy ones ([#53824](https://github.com/keycloak/keycloak/issues/53824), [#53825](https://github.com/keycloak/keycloak/issues/53825)).

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes); all six are there. The official release notes still stop at 26.8.0. From 26.7 you also take [26.8.0's changes](/blog/keycloak-2680-released). Rehearse SMTP and X.509 on staging; our [production checklist](/blog/keycloak-production-checklist) covers the exposure questions above.

Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact) if you would rather not schedule this.
