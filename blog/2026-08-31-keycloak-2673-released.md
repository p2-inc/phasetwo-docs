---
slug: keycloak-2673-released
title: "Keycloak 26.7.3 Released: 20 CVEs, One Fixed Build"
date: 2026-08-31
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.3 fixes 20 CVEs. Upgrade now if you broker Google or Microsoft logins or delegate realm admin — the 26.6 and 26.4 branches have no fixed tag yet.
keywords:
  [
    keycloak 26.7.3,
    keycloak release,
    keycloak news,
    keycloak security update,
  ]
---

**Bottom line: upgrade this week if you broker Google or Microsoft logins and treat the hosted-domain or tenant setting as an access control, or if you delegate realm administration. Otherwise take it in your normal cycle — after reading the breaking changes, one of which can break logins.** Keycloak 26.7.3 fixes 20 CVEs: one high, 17 medium, one low, one with no advisory. **26.7.3 is the only build carrying them** — the newest 26.6 and 26.4 tags were cut on 11 August, before the fixes landed.

<!-- truncate -->

## Do you need to act this week?

| If you… | Verdict |
| --- | --- |
| Broker Google or Microsoft logins, treat hosted-domain or tenant as a boundary, **and** enable token exchange | Upgrade now. Two CVEs mean that restriction is not enforced on the exchange path — an account in any other domain or tenant gets in. |
| Delegate administration — FGAP v2, organizations, sub-admins | Upgrade this week. Ten of the 20 need a delegated admin account; together they undo much of what FGAP is for. |
| One realm, no brokering, no delegated admin | Normal cycle. The rest need an intercepted authorization code or existing client credentials. |

None is a pre-authentication takeover. But the token-exchange pair turns a control administrators believe they have into one they do not.

## Which build actually has the fixes?

Keycloak backports to a **git tag** and usually publishes no release for it, so people on older branches look, find nothing, and assume nothing shipped. Phase Two builds [images](https://quay.io/repository/phasetwo/keycloak?tab=tags) for those tags — but here the tags are the problem:

| Branch | Newest release | Newest tag | Fixed? | Image |
| --- | --- | --- | --- | --- |
| 26.7 | 26.7.3 | 26.7.3 | **Yes** | `quay.io/phasetwo/keycloak:26.7.3` |
| 26.6 | 26.6.4 | 26.6.6 (11 Aug) | **No** — merged to `release/26.6` 19–28 Aug, after the tag. No 26.6.7 yet. | `:26.6.6` (pre-fix) |
| 26.4 | 26.4.7 | 26.4.15 (11 Aug) | **No** — the commits are not on `release/26.4` at all. | `:26.4.15` (pre-fix) |
| 26.5 | 26.5.7 | 26.5.7 | **No** — there is no `release/26.5` branch. | — |

Derived from tag and branch commit dates; 18 of 20 advisories publish no version range. If you cannot move to 26.7, treat these as unfixed and watch for a 26.6.7 tag.

## Security fixes

| CVE | Severity | What it is | Exposed when |
|---|---|---|---|
| [CVE-2026-18215](https://nvd.nist.gov/vuln/detail/CVE-2026-18215) · [GHSA](https://github.com/advisories/GHSA-v8h5-7wp9-qxxv) | Medium 6.8 | Token exchange ignores the configured Microsoft tenant | MS token exchange |
| [CVE-2026-18214](https://nvd.nist.gov/vuln/detail/CVE-2026-18214) · [GHSA](https://github.com/advisories/GHSA-wmhp-w67v-6jm5) | Medium 6.8 | Token exchange ignores the Google hosted-domain restriction | Google token exchange |
| [CVE-2026-18571](https://nvd.nist.gov/vuln/detail/CVE-2026-18571) · [GHSA](https://github.com/advisories/GHSA-5vmc-qhfj-qxc3) | Medium 6.6 | `POST /users` adds groups the caller cannot manage | FGAP v2 |
| [CVE-2026-17059](https://nvd.nist.gov/vuln/detail/CVE-2026-17059) · [GHSA](https://github.com/advisories/GHSA-4w3x-69m8-478c) | Medium 6.5 | `GET /roles/{role}/users` returns PII unfiltered | Delegated admin |
| [CVE-2026-18572](https://nvd.nist.gov/vuln/detail/CVE-2026-18572) · [GHSA](https://github.com/advisories/GHSA-mcjq-c4g7-wcfh) | Medium 6.5 | UMA claim token overrides the time-policy clock | Time policies |
| [CVE-2026-18573](https://nvd.nist.gov/vuln/detail/CVE-2026-18573) · [GHSA](https://github.com/advisories/GHSA-wm3j-jpqg-fwv2) | Medium 6.5 | Access-type policy checked against the old client type | Client policies |
| [CVE-2026-79652](https://nvd.nist.gov/vuln/detail/CVE-2026-79652) · [GHSA](https://github.com/advisories/GHSA-9f9p-c2v5-98rx) | Medium 5.9 | `jwt-bearer` grant ignores `consentRequired` | Consent-gated clients |
| [CVE-2026-16089](https://nvd.nist.gov/vuln/detail/CVE-2026-16089) · [GHSA](https://github.com/advisories/GHSA-63wm-fvw8-h2hp) | Medium 5.4 | Authorization codes redeemable by another client session | Any realm |
| [CVE-2026-16093](https://nvd.nist.gov/vuln/detail/CVE-2026-16093) · [GHSA](https://github.com/advisories/GHSA-jmhg-9c54-p575) | Medium 5.4 | Signed-JWT policy bypassed by an unsigned assertion header | Client policies |
| [CVE-2026-18570](https://nvd.nist.gov/vuln/detail/CVE-2026-18570) · [GHSA](https://github.com/advisories/GHSA-r6f5-hj4x-7mq7) | Medium 5.4 | Full-scope policy bypassed by omitting `fullScopeAllowed` | Client management |
| [CVE-2026-16072](https://nvd.nist.gov/vuln/detail/CVE-2026-16072) · [GHSA](https://github.com/advisories/GHSA-mp76-m6c2-jqh5) | Medium 4.9 | Org managers mint members via stored invite links | Organizations |
| [CVE-2026-18201](https://nvd.nist.gov/vuln/detail/CVE-2026-18201) · [GHSA](https://github.com/advisories/GHSA-fvjx-r757-3r6r) | Medium 5.5 | IdP creation binds brokers to orgs without permission | Organizations |
| [CVE-2026-16105](https://nvd.nist.gov/vuln/detail/CVE-2026-16105) · [GHSA](https://github.com/advisories/GHSA-w32v-46r7-99r7) | Medium 4.9 | No per-role authz on composite-role endpoints | Delegated admin |
| [CVE-2026-16106](https://nvd.nist.gov/vuln/detail/CVE-2026-16106) · [GHSA](https://github.com/advisories/GHSA-78mv-phq4-25fv) | Medium 4.9 | Delegated admin strips privileged child roles | Delegated admin |
| [CVE-2026-16108](https://nvd.nist.gov/vuln/detail/CVE-2026-16108) · [GHSA](https://github.com/advisories/GHSA-mvwh-6438-3v8w) | Medium 4.3 | Default-group reads disclose hidden groups | FGAP v2 |
| [CVE-2026-16104](https://nvd.nist.gov/vuln/detail/CVE-2026-16104) · [GHSA](https://github.com/advisories/GHSA-qh48-wwv4-fmr8) | Medium 4.3 | Authenticator config returns raw reCAPTCHA secrets | View-only admins |
| [CVE-2026-18218](https://nvd.nist.gov/vuln/detail/CVE-2026-18218) · [GHSA](https://github.com/advisories/GHSA-vhxw-j6h3-48jm) | Medium 4.2 | Client not-before revocation silently ignored | Token revocation |
| [CVE-2026-18209](https://nvd.nist.gov/vuln/detail/CVE-2026-18209) · [GHSA](https://github.com/advisories/GHSA-c8xx-fr3x-6m5w) | Low 3.4 | Forbidden-parameter check misses the URL fragment | Wildcard redirects |
| [CVE-2026-35563](https://nvd.nist.gov/vuln/detail/CVE-2026-35563) · [GHSA](https://github.com/advisories/GHSA-85rw-g4f4-jprr) | High | LDAP client skips certificate hostname checks | See below |
| [CVE-2026-19729](https://nvd.nist.gov/vuln/detail/CVE-2026-19729) | **Unrated** | Path traversal still allows filesystem probing | See below |

**CVE-2026-35563, the only "high", is not a Keycloak version.** It covers `org.apache.directory.api:api-ldap-client-api` `>= 2.0.0, < 2.1.8`, fixed in that library at **2.1.8**. The backport commit calls it an ApacheDS upgrade; a separate issue here calls the inherited Apache DS CVEs a *testing* dependency. We could not establish whether the vulnerable client sits on the runtime LDAP path or only in test scope. If you federate over LDAPS, read [the advisory](https://github.com/advisories/GHSA-85rw-g4f4-jprr) and check your dependency tree.

No advisory is published for CVE-2026-19729 yet, so it carries no severity and we have left it unrated.

## Breaking changes

All in the [migration guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes):

- **Redirect URIs containing OIDC response parameters are rejected.** Any client with `state`, `code` or `session_state` in a registered redirect URI stops working. This is the CVE-2026-18209 fix — audit before your window, not during it.
- **`kc.`-prefixed claims are reserved** and filtered before policy evaluation; ticket claims now win on collision.
- **`inviteLink` is deprecated**, no longer returned by the Admin REST API for [Keycloak organizations](/extensions/organizations/).

No new features. Non-security fixes worth having: admin API cost growing super-linearly with realm count since 26.7.1, high CPU after upgrade, lightweight-token role resolution scanning every realm per request.

## How to upgrade

Audit your redirect URIs, read the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/), move to `26.7.3`, then re-test [identity provider](/docs/keycloak/idp/) logins. If CVE-2026-16104 applies, rotate your [reCAPTCHA](/docs/security/recaptcha/) secret. For the audit trail, see [scaling Keycloak event storage](/blog/scaling-keycloak-event-storage).

Cycles like this are the argument for [managed Keycloak](/hosting/dedicated-clusters/): we track the tags upstream never announces and publish images for them, under [SOC 2 Type II](/blog/soc-2-type-II-compliance) and [ISO 27001](/blog/iso-27001-certification).
