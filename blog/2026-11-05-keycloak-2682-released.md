---
slug: keycloak-2682-released
title: "Keycloak 26.8.2: 33 CVEs and a Critical SAML Bypass"
date: 2026-11-05
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.8.2 fixes 33 CVEs, one a critical unauthenticated SAML signature bypass. The 26.6.9 and 26.4.18 backports leave that one out. Upgrade now if you use SAML.
keywords: [keycloak 26.8.2, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade now if Keycloak terminates or brokers SAML; within the week otherwise.** Keycloak 26.8.2 fixes 33 CVEs. The one that should move your schedule is critical and needs no credentials — a signature bypass in the SAML HTTP-Redirect binding that upstream describes as leading to full account takeover of federated users. The harder problem is that **26 of the 33 have no published advisory yet**, so most of this release carries no severity you can plan against.

<!-- truncate -->

That 33 is upstream's *Security fixes* list counted entry by entry; 36 CVE ids appear in the notes, three cited only as earlier issues this release repairs.

## Should you upgrade?

| If you… | When |
|---|---|
| Terminate or broker SAML over the HTTP-Redirect binding | **Now.** CVE-2026-117691, CVSS 9.1, no authentication needed |
| Run 26.8.0 or 26.8.1 with organizations enabled | **Now.** Account takeover through identity-first login, [reproduced on 26.8.1](https://github.com/keycloak/keycloak/issues/54688) |
| Expose any realm endpoint to the internet | **This week.** Five denial-of-service fixes, four of them unauthenticated, one a [single-request JVM kill](https://github.com/keycloak/keycloak/issues/54693) |
| Allow Dynamic Client Registration | **This week.** Four fixes for protocol mappers that forge `sub`, `aud`, `azp` or role claims |
| Run 26.6 or 26.4 | **Take the backport now**, but it leaves out the critical SAML fix. See below |
| Run 26.7 | No patch. The branch is end of life. See below |

Budget time for it. 26.8.2 ships **fourteen breaking changes** — most of them the hardening behind these CVEs.

## The fix that should move your schedule

[CVE-2026-117691](https://nvd.nist.gov/vuln/detail/CVE-2026-117691) / [GHSA-c85j-3hq2-q6wj](https://github.com/advisories/GHSA-c85j-3hq2-q6wj), **critical, CVSS 9.1** (`AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N`). Keycloak processed percent-encoded query parameter names — `%53AMLResponse` — while signature verification matched only literal ones. An attacker supplies a crafted unsigned SAML message and the server acts on it instead of the signed one.

This is the second verification bypass in the same code path in two releases: [26.8.1](/blog/keycloak-2681-released) fixed the variant that abused `;` as a parameter separator. If you deferred that upgrade you are carrying both. Any realm with a SAML [identity provider](/docs/keycloak/idp/) or a SAML client on the redirect binding is exposed; OIDC-only realms are not.

The advisory went up the same day as the release and carries no affected-version data, so treat "every 26.8.x before 26.8.2" as the working assumption and [read it directly](https://github.com/advisories/GHSA-c85j-3hq2-q6wj).

## The other critical is a library, not a Keycloak control

[CVE-2026-111497](https://nvd.nist.gov/vuln/detail/CVE-2026-111497) / [GHSA-9v8h-qqgm-4m35](https://github.com/advisories/GHSA-9v8h-qqgm-4m35) is the Brotli decoder out-of-bounds write ("Node2Shell"), rated **critical 9.8** with an EPSS of 0.83. Both numbers describe **Google Brotli 1.0.3 through 1.2.0**, not Keycloak — the fixed versions in that advisory are 1.0.10, 1.1.1 and 1.2.1, which are Brotli releases, not Keycloak ones. Keycloak's own exposure is not separately rated.

Keycloak did not upgrade the library. It **excluded `brotli4j` from the Quarkus HTTP paths** ([#54333](https://github.com/keycloak/keycloak/issues/54333)), removing the decoder from the distribution. The published sources do not settle whether an unauthenticated request could reach it before — read the advisory.

## Security fixes

Seven of the 33 have a published advisory:

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-117691](https://nvd.nist.gov/vuln/detail/CVE-2026-117691) / [GHSA-c85j-3hq2-q6wj](https://github.com/advisories/GHSA-c85j-3hq2-q6wj) | critical 9.1 | SAML redirect binding acts on an unsigned message |
| [CVE-2026-111497](https://nvd.nist.gov/vuln/detail/CVE-2026-111497) / [GHSA-9v8h-qqgm-4m35](https://github.com/advisories/GHSA-9v8h-qqgm-4m35) | critical 9.8 | Brotli decoder overflow — the library, not a Keycloak control |
| [CVE-2026-96448](https://nvd.nist.gov/vuln/detail/CVE-2026-96448) / [GHSA-x6m6-7qg7-7r64](https://github.com/advisories/GHSA-x6m6-7qg7-7r64) | medium 6.6 | FGAP v2 role check ignores composites, so a limited admin can assign `realm-admin` |
| [CVE-2026-92358](https://nvd.nist.gov/vuln/detail/CVE-2026-92358) / [GHSA-prm3-wvj6-64vx](https://github.com/advisories/GHSA-prm3-wvj6-64vx) | medium 6.4 | Account-link proof survives unlink; the external IdP can relink silently |
| [CVE-2026-107889](https://nvd.nist.gov/vuln/detail/CVE-2026-107889) / [GHSA-gv8g-wx99-6r59](https://github.com/advisories/GHSA-gv8g-wx99-6r59) | medium 5.5 | Stored XSS on the login page via a `kcSanitize` bypass |
| [CVE-2026-105305](https://nvd.nist.gov/vuln/detail/CVE-2026-105305) / [GHSA-ggxp-hq23-v84f](https://github.com/advisories/GHSA-ggxp-hq23-v84f) | medium 5.4 | Device Authorization Grant ignores `minimum.acr.value`, bypassing MFA |
| [CVE-2026-107623](https://nvd.nist.gov/vuln/detail/CVE-2026-107623) / [GHSA-qxj8-968q-qm7w](https://github.com/advisories/GHSA-qxj8-968q-qm7w) | medium 4.3 | A DCR update silently disables offline token revocation on backchannel logout |

**The other 26 have no advisory, so they carry no severity and we will not estimate one.** Their titles are not reassuring — [account takeover via an authentication race](https://github.com/keycloak/keycloak/issues/54706), [a missing Admin API audience check](https://github.com/keycloak/keycloak/issues/54713), [UMA cross-owner resource access](https://github.com/keycloak/keycloak/issues/54696) — but a title is not a rating. Read the issues from the [release notes](https://github.com/keycloak/keycloak/releases/tag/26.8.2) and judge your own exposure. "Unrated" is a gap in the public record, not a verdict either way.

## If you run 26.7, 26.6 or 26.4

:::info Updated 2026-11-06: 26.6 and 26.4 backports are out
When this was published no backport existed. Upstream has since tagged **26.6.8 and 26.6.9** and **26.4.17 and 26.4.18**, without release notes, and we have built images for all four. **Neither branch has the critical SAML fix, CVE-2026-117691.**
:::

There are no release notes for the backports, so we matched each of the 33 fixes to upstream commits on the release branches. The result:

| Branch | Image | Of the 33 fixes | Missing |
|---|---|---|---|
| 26.8 | [`26.8.2`](https://quay.io/repository/phasetwo/keycloak?tab=tags&tag=26.8.2) | all 33 | none |
| 26.6 | [`26.6.9`](https://quay.io/repository/phasetwo/keycloak?tab=tags&tag=26.6.9) | 29 | **CVE-2026-117691** (critical SAML bypass), plus three we could not match to a commit: [CVE-2026-107623](https://github.com/keycloak/keycloak/issues/53749), [CVE-2026-112201](https://github.com/keycloak/keycloak/issues/54687), [CVE-2026-96457](https://github.com/keycloak/keycloak/issues/54699) |
| 26.4 | [`26.4.18`](https://quay.io/repository/phasetwo/keycloak?tab=tags&tag=26.4.18) | 14 | **CVE-2026-117691**, the Admin API audience check, the organization `SSO_AUTH` takeover, the FGAP v2 composite fix, the Device Grant ACR fix, the stored XSS and 13 more |
| 26.7 | `26.7.5` | none | all 33. 26.7 is end of life |

26.6.9 is 26.6.8 with only the version number changed, and 26.4.18 adds one client-policy fix on top of 26.4.17, so take the newer tag on each branch. The backports ship the hardening that goes with their fixes, so check the [breaking changes](#breaking-changes-and-migration) below. On 26.6 nearly all of them apply, including the Admin API audience check. On 26.4 the SAML broker, SOAP, DCR mapper and verified-email changes apply.

**If you use SAML on 26.6 or 26.4, the backport is not enough.** It does include the SAML 1.1 and SOAP denial-of-service fixes, the issuer check and the holder-of-key check, but the redirect-binding signature bypass is open on both branches. Either move to 26.8.2 or stop accepting SAML over the HTTP-Redirect binding until upstream backports the fix. Upstream gives no date for that, and the [advisory](https://github.com/advisories/GHSA-c85j-3hq2-q6wj) still has no affected-version data.

On 26.7 nothing has changed. `release/26.7` is archived, so 26.8.2 is the only patched path.

All tags live on [`quay.io/phasetwo/keycloak`](https://quay.io/repository/phasetwo/keycloak?tab=tags), [including the backports upstream tags but never announces](/blog/keycloak-lts-backport-images).

## Breaking changes and migration

Fourteen, which is a lot for a patch. The ones most likely to break you:

- **The Admin REST API enforces an audience check** through a new `kc-admin-api` client scope (CVE-2026-19688). Service accounts calling the Admin API need it.
- **Protocol mapper management via the Admin API is restricted to realm administrators**, and client registration policies limit mapper types, default roles and full scope.
- **SAML 1.1 request parsing is off by default**; SOAP endpoints cap requests at 120,000 bytes.
- **The SAML broker requires a valid bearer subject confirmation and rejects `ProxyRestriction` assertions**, and the SAML adapter validates the IdP issuer.
- **Token exchange tokens can no longer outlive the subject token.**
- **IdP auto-linking requires a verified email** (CVE-2026-97175), as does organization domain-based membership.

The official [release notes](https://www.keycloak.org/docs/latest/release_notes/index.html) still stop at 26.8.0; all fourteen are in the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes).

## How to upgrade

Rehearse the Admin API scope and SAML broker changes on staging; both fail quietly. Our [production checklist](/blog/keycloak-production-checklist) covers the exposure questions above, and [self-service upgrades](/docs/self-service/upgrades) covers the mechanics.

Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact) if you would rather not schedule this one yourself.
