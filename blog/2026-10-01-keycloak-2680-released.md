---
slug: keycloak-2680-released
title: "Keycloak 26.8.0: SCIM and Multi-Cluster v2 Go Supported"
date: 2026-10-01
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.8.0 promotes SCIM, multi-cluster v2 and client secret rotation to supported, and adds token exchange delegation. Seven CVEs, none high or critical.
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

## What's new

This is a feature release that happens to carry CVEs, not the other way round.

### Promoted to supported

**[SCIM](/blog/scim-explained) is supported.** A standards-based interface for managing users and groups in a realm, so an IdP or an HR system pushes joiners, movers and leavers instead of you writing against the Admin API. The promotion brings multivalued user attributes, User Profile permissions, Fine-Grained Admin Permissions honoured in search filters, and performance work for large user bases.

**Multi-cluster v2 is supported**, enabled with `--features=stateless`. Two or more clusters share session state through the database, with no external Infinispan cluster and no cross-site replication to run, and there is now a bare-metal and VM deployment guide alongside the Kubernetes one. **Multi-cluster v1 — the `multi-site` feature — is deprecated** and will be removed in a future major, so if you run it, that migration is on your roadmap whether or not you take 26.8.0.

**Client secret rotation is supported.** Driven by client policies, with up to two secrets live at once, so consumers move to the new one on their own schedule rather than inside a window where the old one is already dead.

### Preview

**Token exchange delegation** lets a user consent to a client acting on their behalf through a new `delegation:client:<client-id>` parameterized scope. The issued token carries an `act` claim naming the actor, and the part that matters if you are pointing agents at this: **it cannot reach the Admin API even when the client holds service-account credentials**, so a leaked delegation token does not escalate into one. Authorization runs exclusively through FGAP v2's `delegate` and `delegate-members` scopes, standard token exchange now rejects subject tokens carrying delegation claims, and a new client policy executor restricts `may_act` per client. Separately, tokens issued from an impersonation session now always carry `act` and the impersonator's identity — not optional, not disableable.

**Verifiable credential issuance (OID4VCI)** moves to preview (`--features=oid4vc-vci`), adding revocation when refresh tokens are revoked, an Application Initiated Action so a user can request a credential inside a session, and configurable key attestation. Acting as a verifier (OID4VP) and the mdoc format stay experimental.

**Admin API v2 for clients** moves to preview (`--features=client-admin-api:v2`): strict validation, an accurate OpenAPI spec, a generated JavaScript client and a CLI. The Operator's `KeycloakOIDCClient` and `KeycloakSAMLClient` custom resources were promoted with it — declarative client management without a reconciler of your own. **Parameterized scopes** (formerly dynamic scopes) also reach preview.

### Operational changes worth knowing

- **Indexes skipped during migration now build themselves.** An upgrade on a large table used to skip index creation and leave it to you; Keycloak now builds them in the background after startup, non-blocking, on PostgreSQL, Oracle, MySQL/MariaDB and supported SQL Server editions, and recreates invalid PostgreSQL indexes left by a failed earlier attempt.
- **Cluster and node names are first-class options** — `--cache-embedded-cluster-name` and `--cache-embedded-node-name`, replacing low-level SPI configuration. The node name used to be random on every start, which made metrics, logs and JGroups diagnostics hard to correlate; under the Operator it is now the pod name.
- **Encrypted PKCS#8 private keys work for HTTPS** via `--https-certificate-key-file-password`, so a key no longer has to be decrypted or wrapped in a keystore first.
- **An SSRF guard for legacy adapter node registration, if you turn it on.** A confidential client could register an attacker-chosen hostname at `/clients-managements/register-node`, which Keycloak would then call for management callbacks such as logout propagation. The new `secure-client-node-hostname` executor validates hostnames against configured patterns — **opt-in, and inert until you attach it to a client policy.**
- **An `invite-user` workflow step** sends the action-token email when a user is created, instead of an external call to `execute-actions-email`.
- Experimental: a Vert.x-based outbound HTTP client (`--features=http-client:v2`) replacing Apache HTTP Client for all outgoing connections, a Helm chart for installing the Operator, and Shared Signals emitting RISC `account-disabled` and `account-enabled` events.

### Organizations: shared identity providers

An identity provider can now be linked to more than one organization — one corporate IdP serving several business units or subsidiaries, each its own organization, each link carrying its own auto-membership and membership-type configuration. Domain routing moves off the identity provider and onto the domain, so each domain names the provider that handles it and whether to auto-redirect, and a domain gate keeps a user from being auto-added to an organization that does not claim their email domain.

**Read that as Keycloak's _native_ Organizations gaining a capability our extension shipped more than two years ago.** [Phase Two Organizations has supported shared IdPs since July 2024](/blog/phase-two-organizations-shared-idps) ([keycloak-orgs#249](https://github.com/p2-inc/keycloak-orgs/issues/249), closed 9 July 2024) — three months before native Organizations existed at all, which arrived in 26.0 on 4 October 2024. The driving case has not changed either: customers with hundreds of organizations authenticating against a single Google Workspace OIDC integration rather than hundreds of separate SAML ones.

The two implementations are not the same thing, so this is not a migration you are behind on. If you run [our Organizations extension](/extensions/organizations/), you already have shared IdPs and 26.8.0 changes nothing for you. If you are on native Organizations, this is where that gap closes, on upstream's own model — the domain gate and the `MANAGED`/`Unmanaged` membership types are native concepts, and the IdP-link migration under *Breaking changes* below is yours, not ours.

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

## Breaking changes and migration

Four to rehearse. Login failures now persist to the database by default, adding DB load (`login-failures:v1` restores the old behaviour, deprecated). Organization IdP links became many-to-many: existing ones migrate as `MANAGED`, new ones default to `Unmanaged`. A custom `social-providers.ftl` needs testing against the redesigned login page. And client GET endpoints no longer return secrets to `view-clients` holders, breaking view-only tooling that read them.

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes), then rehearse on staging: login failures is the change with a capacity consequence, and indexes skipped during migration now build in the background afterwards. Our [production checklist](/blog/keycloak-production-checklist) covers the exposure questions above; [26.7.5](/blog/keycloak-2675-released), published twelve hours before this one, was the last release we covered.

Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001. [Talk to us](/contact) if you would rather not schedule this one.
