---
slug: keycloak-2680-released
title: "Keycloak 26.8.0: SCIM and Multi-Cluster v2 Go Supported"
date: 2026-10-01
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.8.0 fixes seven CVEs, none high or critical, so there is no emergency to schedule. SCIM and multi-cluster v2 are now supported, not preview.
keywords: [keycloak 26.8.0, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: not urgent — plan it, don't rush it.** Keycloak 26.8.0 fixes seven CVEs, published as six medium and one low, none high or critical. Schedule it because SCIM, multi-cluster v2 and client secret rotation move from preview to supported, and brute-force lockouts now persist to your database by default.

<!-- truncate -->

## Should you upgrade?

| If you… | When |
|---|---|
| Let restricted admins manage identity providers | **Soon.** They can grant themselves `realm-admin`; only 26.8.0 has the fix |
| Broker OIDC with `trustEmail=true` and link on email | **Soon**, unless you control that provider |
| Use group policies with one group name in two paths | **Soon** |
| Want SCIM, stateless or secret rotation supported | Plan it |
| Everyone else | Normal cycle, after the breaking changes |

## Security fixes

Seven distinct CVE identifiers appear in the notes: five under *Security fixes* (one bundles two `jackson-databind` CVEs) and one under *Bugs*. Four are Keycloak; three are shipped libraries, not a failed Keycloak control. Severities as published.

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-12388](https://nvd.nist.gov/vuln/detail/CVE-2026-12388) / [GHSA-jxqv-2jjx-692h](https://github.com/advisories/GHSA-jxqv-2jjx-692h) | medium 6.5 | A restricted IdP admin adds a Hardcoded Role mapper and takes `realm-admin` |
| [CVE-2026-14781](https://nvd.nist.gov/vuln/detail/CVE-2026-14781) / [GHSA-c96p-56gh-3pvw](https://github.com/advisories/GHSA-c96p-56gh-3pvw) | medium 4.8 | OIDC broker applies the id_token's `email_verified` to a different `userinfo` address |
| [CVE-2026-19608](https://nvd.nist.gov/vuln/detail/CVE-2026-19608) / [GHSA-qxf7-g44v-fgwh](https://github.com/advisories/GHSA-qxf7-g44v-fgwh) | medium 5.3 | Name-only group claims let a same-named group satisfy a path-specific policy |
| [CVE-2026-4633](https://nvd.nist.gov/vuln/detail/CVE-2026-4633) / [GHSA-rhgq-f8x5-j2jc](https://github.com/advisories/GHSA-rhgq-f8x5-j2jc) | low 3.7 | Identity-first login reveals which email domains are Organizations, and which accounts exist |
| [CVE-2026-54515](https://nvd.nist.gov/vuln/detail/CVE-2026-54515) / [GHSA-5jmj-h7xm-6q6v](https://github.com/advisories/GHSA-5jmj-h7xm-6q6v) | medium 5.3 | `jackson-databind`: case-insensitive matching restores `@JsonIgnoreProperties` fields |
| [CVE-2026-59889](https://nvd.nist.gov/vuln/detail/CVE-2026-59889) / [GHSA-5gvw-p9qm-jgwh](https://github.com/advisories/GHSA-5gvw-p9qm-jgwh) | medium 6.5 | `jackson-databind`: `@JsonView` not enforced on `@JsonUnwrapped` containers |
| [CVE-2026-59903](https://nvd.nist.gov/vuln/detail/CVE-2026-59903) / [GHSA-8c42-7qj2-3j46](https://github.com/advisories/GHSA-8c42-7qj2-3j46) | medium 6.5 | Netty's `CorsHandler` overwrites your `Vary` header, enabling CDN cache poisoning |

**CVE-2026-12388 is the one that could change your week.** It needs an administrator account, but a narrow one: if you delegate identity-provider management without granting realm administration, that boundary does not hold, and no setting closes it.

**CVE-2026-4633's advisory does not describe this fix.** Its range, `< 26.6.1` and `< 26.4.12`, covers an earlier instance of the same flaw; upstream reused the identifier for a [second instance](https://github.com/keycloak/keycloak/issues/52676) fixed here without updating the advisory. On 26.6 or 26.7 the range says you are patched; against this one you are not.

## If you run 26.7, 26.6 or 26.4

No backport of the four Keycloak CVEs has landed on another live branch. Verified 1 October against branch histories and each tag's Quarkus BOM:

| Branch | Newest release | Newest tag | These fixes | Runnable image |
|---|---|---|---|---|
| 26.8 | 26.8.0 | 26.8.0 | all seven | *(not published yet)* |
| 26.7 | 26.7.5 | 26.7.5 | dependencies only | `quay.io/phasetwo/keycloak:26.7.5` |
| 26.6 | 26.6.4 (June) | 26.6.7 | jackson only | `quay.io/phasetwo/keycloak:26.6.7` |
| 26.4 | 26.4.7 (Dec 2025) | 26.4.16 | jackson only | `quay.io/phasetwo/keycloak:26.4.16` |

26.7.5 picked up Netty 4.1.138 via Quarkus 3.33.4 without naming CVE-2026-59903; 26.6.7 and 26.4.16 remain on 4.1.136. CVE-2026-19608 and the Netty fix carry `backport/26.6` and `backport/26.7` labels — intended, but neither commit is on those branches yet. We publish [container images](/extensions/containers/) for backport tags upstream never announces; check the [tag list](https://quay.io/repository/phasetwo/keycloak?tab=tags), as the 26.8.0 image was not built at the time of writing. **26.5 is archived and will get nothing.**

## What's new

- **[SCIM](/blog/scim-explained) is supported**, with multivalued attributes, User Profile permissions and FGAP in search filters.
- **Multi-cluster v2 is supported** via `--features=stateless`: several clusters, sessions in the database, no external Infinispan. v1 (`multi-site`) is deprecated.
- **Client secret rotation is supported**: two live secrets at once, so nothing breaks mid-rotation.
- **[Shared identity providers across organizations](/blog/phase-two-organizations-shared-idps)**: one corporate IdP backs several, each with its own auto-membership rules.
- **Token exchange delegation (preview)** for agents and automation; the token cannot reach the Admin API even from a service account.

## Breaking changes and migration

Four to rehearse. Login failures now persist to the database by default, adding DB load (`login-failures:v1` restores the old behaviour, deprecated). Organization IdP links became many-to-many: existing ones migrate as `MANAGED`, new ones default to `Unmanaged`. A custom `social-providers.ftl` needs testing against the redesigned login page. And client GET endpoints no longer return secrets to `view-clients` holders, breaking view-only tooling that read them.

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes), then rehearse on staging: login failures is the change with a capacity consequence, and indexes skipped during migration now build in the background afterwards. Our [production checklist](/blog/keycloak-production-checklist) covers the exposure questions above; [26.7.4](/blog/keycloak-2674-released) was the last one we covered.

Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact) if you would rather not schedule this one.
