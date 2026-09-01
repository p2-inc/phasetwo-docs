---
slug: keycloak-2673-released
title: "Keycloak 26.7.3: 20 CVEs and a redirect_uri Break"
date: 2026-08-31
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.7.3 fixes 20 CVEs. Upgrade this week if you use delegated admin, token exchange, or organizations — and read the redirect_uri breaking change first.
keywords: [keycloak 26.7.3, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if you delegate administration to sub-admins, broker or exchange Google and Microsoft tokens, or use organizations or UMA authorization services. Everyone else can take it in a normal cycle — but read the `redirect_uri` breaking change first, because it breaks logout flows that work today.** Keycloak 26.7.3 (31 August 2026) fixes 20 CVEs: one published high, 17 medium, one low, one with no advisory. None is an unauthenticated takeover; almost every one is a privilege boundary that did not hold.

<!-- truncate -->

## Should you upgrade?

Two configurations need action this week. If you delegate administration, six of these — five in fine-grained admin permissions (FGAP v2), one in role management — let a delegated admin read hidden groups and roles, pull user PII, and escalate through role and group assignment. If you broker or exchange Google or Microsoft tokens, the hosted-domain and tenant restrictions are not enforced on the exchange path.

Everything else needs a privileged admin account or a registered client, so it can wait for your normal cycle. Only two of the six name FGAP v2 in the fix itself, so do not assume that leaving FGAP off covers you — check whether you have delegated admins at all.

## The 20 CVEs

| CVE | Severity | What it is | Advisory |
|---|---|---|---|
| [CVE-2026-35563](https://nvd.nist.gov/vuln/detail/CVE-2026-35563) | High/8.8 | LDAP client skips hostname check (dependency) | [GHSA](https://github.com/advisories/GHSA-85rw-g4f4-jprr) |
| [CVE-2026-16072](https://nvd.nist.gov/vuln/detail/CVE-2026-16072) | Medium/4.9 | Org managers add members without `manage-users` | [GHSA](https://github.com/advisories/GHSA-mp76-m6c2-jqh5) |
| [CVE-2026-16089](https://nvd.nist.gov/vuln/detail/CVE-2026-16089) | Medium/5.4 | Auth code retargeted to another session | [GHSA](https://github.com/advisories/GHSA-63wm-fvw8-h2hp) |
| [CVE-2026-16093](https://nvd.nist.gov/vuln/detail/CVE-2026-16093) | Medium/5.4 | Signed-JWT policy bypassed by unsigned headers | [GHSA](https://github.com/advisories/GHSA-jmhg-9c54-p575) |
| [CVE-2026-16104](https://nvd.nist.gov/vuln/detail/CVE-2026-16104) | Medium/4.3 | Authenticator config exposes reCAPTCHA secrets | [GHSA](https://github.com/advisories/GHSA-qh48-wwv4-fmr8) |
| [CVE-2026-16105](https://nvd.nist.gov/vuln/detail/CVE-2026-16105) | Medium/4.9 | No per-role authz on composite endpoints | [GHSA](https://github.com/advisories/GHSA-w32v-46r7-99r7) |
| [CVE-2026-16106](https://nvd.nist.gov/vuln/detail/CVE-2026-16106) | Medium/4.9 | Delegated admin removes privileged child roles | [GHSA](https://github.com/advisories/GHSA-78mv-phq4-25fv) |
| [CVE-2026-16108](https://nvd.nist.gov/vuln/detail/CVE-2026-16108) | Medium/4.3 | Default-group reads disclose hidden groups | [GHSA](https://github.com/advisories/GHSA-mvwh-6438-3v8w) |
| [CVE-2026-17059](https://nvd.nist.gov/vuln/detail/CVE-2026-17059) | Medium/6.5 | Role-users endpoint returns unfiltered PII | [GHSA](https://github.com/advisories/GHSA-4w3x-69m8-478c) |
| [CVE-2026-18201](https://nvd.nist.gov/vuln/detail/CVE-2026-18201) | Medium/5.5 | IdP creation binds brokers to organizations | [GHSA](https://github.com/advisories/GHSA-fvjx-r757-3r6r) |
| [CVE-2026-18214](https://nvd.nist.gov/vuln/detail/CVE-2026-18214) | Medium/6.8 | Google exchange ignores hosted-domain limit | [GHSA](https://github.com/advisories/GHSA-wmhp-w67v-6jm5) |
| [CVE-2026-18215](https://nvd.nist.gov/vuln/detail/CVE-2026-18215) | Medium/6.8 | Microsoft exchange ignores configured tenant | [GHSA](https://github.com/advisories/GHSA-v8h5-7wp9-qxxv) |
| [CVE-2026-18218](https://nvd.nist.gov/vuln/detail/CVE-2026-18218) | Medium/4.2 | Client not-before revocation ignored | [GHSA](https://github.com/advisories/GHSA-vhxw-j6h3-48jm) |
| [CVE-2026-18570](https://nvd.nist.gov/vuln/detail/CVE-2026-18570) | Medium/5.4 | Full-scope policy bypassed by omitting field | [GHSA](https://github.com/advisories/GHSA-r6f5-hj4x-7mq7) |
| [CVE-2026-18571](https://nvd.nist.gov/vuln/detail/CVE-2026-18571) | Medium/6.6 | Group-assignment bypass on `POST /users` | [GHSA](https://github.com/advisories/GHSA-5vmc-qhfj-qxc3) |
| [CVE-2026-18572](https://nvd.nist.gov/vuln/detail/CVE-2026-18572) | Medium/6.5 | UMA claim token overrides policy clock | [GHSA](https://github.com/advisories/GHSA-mcjq-c4g7-wcfh) |
| [CVE-2026-18573](https://nvd.nist.gov/vuln/detail/CVE-2026-18573) | Medium/6.5 | Access-type condition uses old type | [GHSA](https://github.com/advisories/GHSA-wm3j-jpqg-fwv2) |
| [CVE-2026-79652](https://nvd.nist.gov/vuln/detail/CVE-2026-79652) | Medium/5.9 | `jwt-bearer` grant ignores `consentRequired` | [GHSA](https://github.com/advisories/GHSA-9f9p-c2v5-98rx) |
| [CVE-2026-18209](https://nvd.nist.gov/vuln/detail/CVE-2026-18209) | Low/3.4 | `redirect_uri` injection via URL fragment | [GHSA](https://github.com/advisories/GHSA-c8xx-fr3x-6m5w) |
| [CVE-2026-19729](https://nvd.nist.gov/vuln/detail/CVE-2026-19729) | **Unrated** | Path-traversal probing (incomplete CVE-2026-9083 fix) | none, [#51745](https://github.com/keycloak/keycloak/issues/51745) |

Severities are as published; CVE-2026-35563 has a v4 vector only. The notes also cite CVE-2026-9083 and CVE-2026-9794 as incomplete earlier fixes, not fixes shipped here.

**The one high-severity item is a dependency, and likely not on your runtime classpath.** CVE-2026-35563 is in the Apache Directory LDAP client API, patched at 2.1.8 — a library version, not a Keycloak version. Upstream [#50785](https://github.com/keycloak/keycloak/issues/50785) calls it a *development* dependency, pulled in transitively by ApacheDS for tests. If that holds, a running server never loads it and the 8.8 overstates your risk. We have not verified the runtime classpath, so check the [advisory](https://github.com/advisories/GHSA-85rw-g4f4-jprr) and your own SBOM.

**CVE-2026-19729 has no published advisory, so it carries no severity** — unrated, not low. Its predecessor CVE-2026-9083 was medium and required `manage-realm`.

## If you are not on 26.7, read this

Upstream labels all 20 issues for `26.6.7`, which does not exist. The newest 26.6 tag is 26.6.6, cut 11 August, and 10 of the 20 fixes closed on `main` after that. Only CVE-2026-19729 is also labelled `26.4.16`; the other 19 carry no 26.4 label, and nothing is labelled for 26.5.

| Branch | Newest release | Newest tag | Runnable image | Carries these fixes? |
|---|---|---|---|---|
| 26.7 | 26.7.3 | 26.7.3 | `quay.io/phasetwo/keycloak:26.7.3` | Yes, all 20 |
| 26.6 | 26.6.4 | 26.6.6 | `quay.io/phasetwo/keycloak:26.6.6` | No — labelled 26.6.7, not yet tagged |
| 26.5 | 26.5.7 | 26.5.7 | *(none published)* | No — no 26.5 backport labelled |
| 26.4 | 26.4.7 | 26.4.15 | `quay.io/phasetwo/keycloak:26.4.15` | Only CVE-2026-19729, in 26.4.16, not tagged |

Keycloak tags backports without publishing releases: 26.6.5, 26.6.6 and 26.4.8 through 26.4.15 are tags with nothing announced behind them, which is why someone on 26.6 concludes there is no patch. We publish images for those tags, including ones upstream never released — the [tag list](https://quay.io/repository/phasetwo/keycloak?tab=tags) is the authority, not this table. Our extensions image is still at 26.6.6.

## Two breaking changes to read first

Both fall out of the security work; both are in the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes).

**OIDC parameters in redirect URIs are rejected by default.** A `redirect_uri` or `post_logout_redirect_uri` containing `state`, `code` or `session_state` is refused, fragment included — the fix for CVE-2026-18209. If yours points at a Keycloak login URL it stops working; point it at a callback in your own app. `allow-oidc-params-in-redirect-uris` (server) and `allow.oidc.params.in.redirect.uris` (per client) restore the old behaviour, but both are deprecated and removed in Keycloak 27.

**`kc.`-prefixed claims are reserved.** Authorization services filter user-supplied `kc.*` claims before policy evaluation, and permission-ticket claims now beat `claim_token` on collision — CVE-2026-18572. Rename any custom `kc.*` claim your policies read. Separately, `inviteLink` is no longer returned by the [Keycloak organizations](/extensions/organizations/) invitation endpoints and now reads `null`.

## What else landed

Six hardening items without CVEs and 19 bug fixes. Three matter on 26.7.1 and 26.7.2: admin API cost growing super-linearly with realm count ([#51554](https://github.com/keycloak/keycloak/issues/51554)), lightweight access tokens resolving every role in every realm per admin request ([#51707](https://github.com/keycloak/keycloak/issues/51707)), and sustained high CPU after upgrade ([#51523](https://github.com/keycloak/keycloak/issues/51523)).

## How to upgrade

Fix any `post_logout_redirect_uri` pointing at Keycloak itself, then pull the image:

```bash
docker pull quay.io/phasetwo/keycloak:26.7.3
```

On staging, test a logout carrying a `state` parameter and any policy reading custom claims. Our [Keycloak identity provider](/docs/keycloak/idp/) docs cover the Google and Microsoft restrictions; [our organizations and SCIM work](/blog/orgs-scim-experimental) covers the changed invitation endpoints.

Working through 20 CVEs and two behaviour changes is a week nobody budgeted for, and our [managed Keycloak](/hosting/dedicated-clusters/) clusters get this applied for you. If you run it yourself, start with the [security capabilities we build into those clusters](/blog/dedicated-clusters-security-capabilities).
