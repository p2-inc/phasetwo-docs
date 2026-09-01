---
slug: keycloak-2673-released
title: "Keycloak 26.7.3 Released: 20 CVEs and No Backports"
date: 2026-08-31
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: "Keycloak 26.7.3 fixes 20 CVEs. Upgrade this week if you use token exchange, FGAP v2, or client policies, and read the redirect_uri change before deploying."
keywords: [keycloak 26.7.3, keycloak release, keycloak news, keycloak security update]
---

**Bottom line on Keycloak 26.7.3: upgrade this week if you use external-token exchange with Google or Microsoft brokering, Fine-Grained Admin Permissions v2 with delegated administrators, or client policies to enforce signed-JWT client authentication. Everyone else on 26.7.x should take it in your normal cycle this month, but read the `redirect_uri` change first because it can break working clients on upgrade. If you are on 26.6 or 26.4, there is no patch on your branch: as of 1 September 2026 Keycloak has shipped no backport release, and 26.7.3 is the only build carrying these fixes.**

Keycloak 26.7.3 was published on 31 August 2026 and it is almost entirely a security release. Nothing in it is a remotely exploitable, pre-authentication takeover. Nearly everything in it is an authorization control that you deliberately configured and that turns out not to have been enforced.

<!-- truncate -->

## How many CVEs are in Keycloak 26.7.3?

Twenty, and the number is easy to get wrong, so here is the derivation.

The release body has 20 bullets under **Security fixes**, each carrying exactly one distinct CVE identifier. Counting every CVE identifier anywhere in the body with `grep -o 'CVE-[0-9]\{4\}-[0-9]*' | sort -u | wc -l` returns **22**. The two extras are `CVE-2026-9083` and `CVE-2026-9794`, both cited as *earlier* fixes that proved incomplete rather than as new issues. So: 20 CVEs fixed, 22 CVE identifiers mentioned. Alongside them the release lists 6 hardening items under "Weaknesses" that were not assigned CVEs, and 19 bug fixes.

Of the 20 fixed CVEs, GitHub's global advisory database has a published advisory for 19. Their severities, exactly as published: **1 high, 17 medium, 1 low**. The twentieth, `CVE-2026-19729`, has no published advisory, so it carries no severity and we describe it as unrated rather than guessing. That single gap is not a story about the release; the other 19 are rated.

The one **high** is not Keycloak code. It is `CVE-2026-35563` in the Apache Directory LDAP API that Keycloak bundles. Every CVE in Keycloak's own code in this release is rated medium or low.

## Should you upgrade to 26.7.3?

Read this as three groups.

**Upgrade this week** if any of these describe your deployment:

- You broker **Google or Microsoft logins** and permit external-token exchange. Two separate medium (6.8) flaws mean the hosted-domain and tenant restrictions you configured are simply not checked on that path. Someone with a valid Google or Microsoft account in an unrelated domain or tenant can trade it for a token in your realm. If you configured those restrictions, you configured them because they matter.
- You run **Fine-Grained Admin Permissions v2** and delegate administration. Five of the twenty are tagged `admin/fine-grained-permissions`, and a sixth hits the role-container endpoints: group assignment during user creation, composite-role deletion, hidden group and role metadata, and user PII in role listings. If your delegated-admin model is a security boundary rather than a convenience, these are your CVEs.
- You use **client policies** to force signed-JWT client authentication, or the full-scope-disabled executor. Both can be bypassed, one with a forged unsigned assertion header and one by omitting a field from the request.
- You revoke tokens using **not-before policies**. `CVE-2026-18218` means a client-level revocation can be silently ignored, which is a control you only find broken during an incident.
- You connect to **LDAP or Active Directory over TLS**. Hostname verification was missing in the bundled LDAP client, so a certificate issued for any host your trust store accepts will be accepted for your directory. Exploitation needs network man-in-the-middle position, which narrows it, but the severity is published as high.

**Take it in your normal cycle** if you are on 26.7.x, use none of the above, and do not delegate administration. The realistic exposure across the rest is an administrator who already holds real privileges going slightly beyond them. That is worth fixing, and it is not worth a 2 a.m. change window.

**You have a decision to make** if you are on 26.6 or earlier. See the backport section below.

We are not going to tell you nobody is affected. Of the 18 CVEs here with a published CVSS vector, 17 have `PR:L` or `PR:H`, meaning the attacker must already hold a client credential or an admin account. That is a real mitigating factor. It is also exactly the boundary many teams treat as a hard tenant separation, so whether "an admin can exceed their permissions" is a shrug or an incident depends entirely on who your admins are. The one exception, `CVE-2026-18209`, needs no privileges but is rated low and requires a wildcard redirect URI plus a client that trusts fragment parameters.

## Every CVE fixed in Keycloak 26.7.3

Ordered by published severity, then CVSS. Severities are quoted from the GitHub advisory as published; we have not adjusted or estimated any of them.

| CVE | Severity | What it lets someone do | You are exposed if | Sources |
|---|---|---|---|---|
| `CVE-2026-35563` | **high** (no CVSS published) | Accept a TLS certificate issued for an unrelated host on an LDAP connection, enabling LDAP server impersonation | You connect to LDAP/AD over TLS. **This is the bundled Apache Directory LDAP API, not Keycloak code** — the fixed version 2.1.8 is the library's, not Keycloak's | [GHSA](https://github.com/advisories/GHSA-85rw-g4f4-jprr) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-35563) · [#50785](https://github.com/keycloak/keycloak/issues/50785) |
| `CVE-2026-18215` | **medium** (6.8) | Exchange a Microsoft access token from a *different* Entra tenant for a Keycloak token, bypassing the configured tenant restriction | You broker Microsoft/Entra logins **and** allow external-token exchange | [GHSA](https://github.com/advisories/GHSA-v8h5-7wp9-qxxv) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18215) · [#51282](https://github.com/keycloak/keycloak/issues/51282) |
| `CVE-2026-18214` | **medium** (6.8) | Exchange a Google access token from a *different* Workspace domain for a Keycloak token, bypassing the hosted-domain restriction | You broker Google logins **and** allow external-token exchange | [GHSA](https://github.com/advisories/GHSA-wmhp-w67v-6jm5) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18214) · [#51287](https://github.com/keycloak/keycloak/issues/51287) |
| `CVE-2026-18571` | **medium** (6.6) | Add a newly created user to groups the acting admin has no permission to manage, via `POST /users` | FGAP v2 is enabled and you delegate user creation | [GHSA](https://github.com/advisories/GHSA-5vmc-qhfj-qxc3) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18571) · [#51378](https://github.com/keycloak/keycloak/issues/51378) |
| `CVE-2026-17059` | **medium** (6.5) | Read names and email addresses of users a restricted admin should not see, via `GET /roles/{role}/users` | FGAP v2 is enabled and you delegate any admin role | [GHSA](https://github.com/advisories/GHSA-4w3x-69m8-478c) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-17059) · [#51142](https://github.com/keycloak/keycloak/issues/51142) |
| `CVE-2026-18572` | **medium** (6.5) | Bypass a time-based authorization policy by putting a forged time value in the claim token | You use Authorization Services with time policies | [GHSA](https://github.com/advisories/GHSA-mcjq-c4g7-wcfh) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18572) · [#51379](https://github.com/keycloak/keycloak/issues/51379) |
| `CVE-2026-18573` | **medium** (6.5) | Create a public client, then update it to confidential with weaker auth, escaping a client policy that only checks the pre-update type | You enforce client authentication via client policies and delegate client management | [GHSA](https://github.com/advisories/GHSA-wm3j-jpqg-fwv2) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18573) · [#51380](https://github.com/keycloak/keycloak/issues/51380) |
| `CVE-2026-79652` | **medium** (5.9) | Obtain a token for a consent-gated client through the `jwt-bearer` grant without the user's consent | You rely on `consentRequired` **and** enable the JWT bearer grant | [GHSA](https://github.com/advisories/GHSA-9f9p-c2v5-98rx) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-79652) · [#52028](https://github.com/keycloak/keycloak/issues/52028) |
| `CVE-2026-18201` | **medium** (5.5) | Bind a new identity provider to an organization without `manage-organizations`, influencing how that org's users log in | You use Organizations and delegate identity-provider management | [GHSA](https://github.com/advisories/GHSA-fvjx-r757-3r6r) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18201) · [#51283](https://github.com/keycloak/keycloak/issues/51283) |
| `CVE-2026-16093` | **medium** (5.4) | Satisfy a "signed JWT required" client policy with a forged unsigned assertion header, then authenticate with a client secret instead | You use client policies to mandate signed-JWT client authentication | [GHSA](https://github.com/advisories/GHSA-jmhg-9c54-p575) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-16093) · [#50997](https://github.com/keycloak/keycloak/issues/50997) |
| `CVE-2026-16089` | **medium** (5.4) | Redeem an intercepted authorization code at an attacker-controlled client, getting tokens for the victim's identity | Any OIDC deployment; requires intercepting a code and user interaction (AC:H, UI:R) | [GHSA](https://github.com/advisories/GHSA-63wm-fvw8-h2hp) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-16089) · [#51003](https://github.com/keycloak/keycloak/issues/51003) |
| `CVE-2026-18570` | **medium** (5.4) | Create a full-scope client despite a full-scope-disabled policy, simply by omitting `fullScopeAllowed` from the request | You use the full-scope-disabled client-policy executor | [GHSA](https://github.com/advisories/GHSA-r6f5-hj4x-7mq7) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18570) · [#51382](https://github.com/keycloak/keycloak/issues/51382) |
| `CVE-2026-16072` | **medium** (4.9) | Mint an organization invitation for an address you don't control, read the secret registration link over the API, and create members without `manage-users` | You use Organizations and delegate org management | [GHSA](https://github.com/advisories/GHSA-mp76-m6c2-jqh5) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-16072) · [#50998](https://github.com/keycloak/keycloak/issues/50998) |
| `CVE-2026-16105` | **medium** (4.9) | Strip essential child roles from built-in admin roles through name-based composite endpoints | You grant `manage-realm` to admins you don't fully trust | [GHSA](https://github.com/advisories/GHSA-w32v-46r7-99r7) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-16105) · [#51002](https://github.com/keycloak/keycloak/issues/51002) |
| `CVE-2026-16106` | **medium** (4.9) | Remove privileged child roles from a composite the acting admin isn't authorized to manage | FGAP v2 is enabled and you delegate role management | [GHSA](https://github.com/advisories/GHSA-78mv-phq4-25fv) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-16106) · [#51112](https://github.com/keycloak/keycloak/issues/51112) |
| `CVE-2026-16108` | **medium** (4.3) | See names and IDs of hidden default groups via the default-groups endpoint and realm representation | FGAP v2 is enabled and you use default groups | [GHSA](https://github.com/advisories/GHSA-mvwh-6438-3v8w) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-16108) · [#51001](https://github.com/keycloak/keycloak/issues/51001) |
| `CVE-2026-16104` | **medium** (4.3) | Read raw reCAPTCHA secret keys from the authenticator config endpoint with view-only permissions | You configure reCAPTCHA and have view-only admins or ship admin logs off-box | [GHSA](https://github.com/advisories/GHSA-qh48-wwv4-fmr8) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-16104) · [#51005](https://github.com/keycloak/keycloak/issues/51005) |
| `CVE-2026-18218` | **medium** (4.2) | Have a client-level not-before token revocation silently ignored when the realm's not-before is older but nonzero | You revoke tokens with not-before policies — this one breaks an incident-response control | [GHSA](https://github.com/advisories/GHSA-vhxw-j6h3-48jm) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18218) · [#51279](https://github.com/keycloak/keycloak/issues/51279) |
| `CVE-2026-18209` | **low** (3.4) | Inject duplicate OIDC response parameters through the URL *fragment*, which the parameter-pollution check didn't inspect | A client is registered with a wildcard redirect URI **and** the app trusts fragment parameters | [GHSA](https://github.com/advisories/GHSA-c8xx-fr3x-6m5w) · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-18209) · [#51286](https://github.com/keycloak/keycloak/issues/51286) |
| `CVE-2026-19729` | **unrated** | Probe arbitrary filesystem paths as `manage-realm`, determining which files the Keycloak process can read — the fix for CVE-2026-9083 was incomplete | You grant `manage-realm` to admins you don't fully trust | no GHSA · [CVE](https://nvd.nist.gov/vuln/detail/CVE-2026-19729) · [#51745](https://github.com/keycloak/keycloak/issues/51745) |

Two notes on reading that table honestly:

- **`CVE-2026-35563` is a dependency, not Keycloak.** The fixed version `2.1.8` is the Apache Directory LDAP API's version, not a Keycloak version. The story is "Keycloak shipped a vulnerable library", and the remediation is the Keycloak build that bundles the updated library.
- **`CVE-2026-19729` has no advisory yet.** No GHSA is published for it, so it has no severity and no CVSS, and we have not invented one. The release body describes it as an incomplete fix for `CVE-2026-9083` ([GHSA-7pm9-g8jh-3m74](https://github.com/advisories/GHSA-7pm9-g8jh-3m74), medium 4.9), with path traversal still enabling filesystem probing in 26.6.4. If you grant `manage-realm` broadly, read that earlier advisory and treat this as the same class of issue. Two of the twenty are second attempts at earlier fixes, which is a reasonable prompt to check your own patch level rather than assume a CVE you patched in June is closed.

## Which patch release on my branch has the fix?

For once, the answer is not "check the advisory", because the advisories do not say.

Normally the `vulnerabilities[]` array on each advisory gives you the affected version range and first patched version per branch, and that array is the backport map. Here, **18 of the 19 published advisories carry no affected-version ranges at all.** Only the Apache LDAP advisory (`>= 2.0.0, < 2.1.8`, patched in `2.1.8`) and the older `CVE-2026-9794` have any. We cannot derive a per-branch backport map from this data, and we are not going to guess one.

What we can state from the release history is stronger and worse. As of 1 September 2026, the newest release on each branch is:

| Branch | Newest release | Published |
|---|---|---|
| 26.7 | **26.7.3** | 31 August 2026 |
| 26.6 | 26.6.4 | 26 June 2026 |
| 26.5 | 26.5.7 | 2 April 2026 |
| 26.4 | 26.4.7 | 1 December 2025 |

**No upstream backport release exists.** These twenty fixes are available in 26.7.3 and, upstream, nowhere else. The release body itself confirms this for at least one issue, describing the path traversal as "still enables filesystem probing in 26.6.4". And GitHub's record for the older `CVE-2026-9794` lists the 26.4 branch as affected at `<= 26.4.7` with no first-patched version, which is consistent with 26.4 no longer receiving fixes.

If you are on 26.6 or older and any of the exposure conditions above apply to you, upgrading to 26.7.3 is your only route. Verify that against the [advisories](https://github.com/advisories) and the [Red Hat CVE pages](https://access.redhat.com/security/) linked from each one before you plan around it; a backport could land after this post is published, and Red Hat Build of Keycloak errata run on their own schedule.

## Breaking changes: three behaviour changes that can break working clients

This is the part that will cost you time, and all three come from security fixes. The [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) documents them under 26.7.3.

**OIDC parameters in redirect URIs are now rejected by default.** A redirect URI containing `state`, `code`, or `session_state` is refused. This is the fix for `CVE-2026-18209`, and it is the change most likely to break something you rely on. If you have a client that legitimately carries those names in its redirect URI, you can restore the old behaviour with the `allow-oidc-params-in-redirect-uris` server option, or per client with the `allow.oidc.params.in.redirect.uris` attribute. Both are deprecated and scheduled for removal in Keycloak 27, so treat them as a window to fix your clients, not a setting.

**Claims prefixed `kc.` are now reserved.** Authorization Services filters them out before policy evaluation, and where a UMA permission ticket and a claim token contain the same key, the ticket now wins. That is the fix for `CVE-2026-18572`. If you push custom claims with that prefix, they will stop arriving.

**Organization invitation links are gone from Admin API responses.** The `inviteLink` field on `OrganizationInvitationRepresentation` is deprecated and no longer returned, along with `getInviteLink()` and `setInviteLink()`. That closes `CVE-2026-16072`. If you automate invitations for [Keycloak organizations](/extensions/organizations/) by reading that field out of an API response, that code breaks on upgrade.

## What else changed

Nineteen bug fixes, and several are performance regressions that landed in this same 26.7 line and are worth knowing about if you skipped 26.7.1 or 26.7.2:

- Admin API per-request cost growing super-linearly with realm count since 26.7.1 (#51554), sustained high CPU on all nodes after upgrade (#51523), and lightweight access token role resolution resolving every role across every realm on each admin API request (#51707). If you run many realms on one cluster and saw admin API latency climb after 26.7.1, these three are your explanation.
- `SQLGrammarException: The incoming request has too many parameters` (#51510), an NPE in `RoleUtils.expandCompositeRoles` when a cached client scope references a deleted role (#51589), and client session note removals not persisting with persistent user sessions (#52038).
- V1 token exchange stripping the DPoP sender constraint from a bound access token (#50963), and creating an organization without a domain failing outright (#50825).

No new features. This is a patch release doing what patch releases are for.

## How to upgrade

Read the [migration changes](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) for 26.7.3 first, then the [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/) proper. One source caveat: the [release notes page](https://www.keycloak.org/docs/latest/release_notes/index.html) is labelled 26.7.3 but its newest version heading is 26.7.0, so it does not document this release. The upgrading guide does, and the [release itself](https://github.com/keycloak/keycloak/releases/tag/26.7.3) is the authoritative list. Before you deploy, grep your client configuration for redirect URIs containing `state`, `code`, or `session_state`, and grep your automation for `inviteLink` and for claims beginning `kc.`. Those three checks cover the breaking changes. If you broker Google or Microsoft logins, this is also a good moment to review whether external-token exchange is enabled on those [Keycloak identity provider](/docs/keycloak/idp/) configurations at all, because if it is not, two of the highest-scoring CVEs here do not reach you.

For deeper hardening around a Keycloak deployment, our own notes on [WAF and edge protection](/blog/waf-keycloak) and the [security capabilities we run on dedicated clusters](/blog/dedicated-clusters-security-capabilities) cover the layers that sit in front of these controls, and the [security documentation](/docs/security/) covers what you can turn on inside Keycloak today.

Every [managed Keycloak](/hosting/dedicated-clusters/) cluster we run is patched by us, on our schedule, with the breaking changes above tested against customer client configurations first. Our [SOC 2 Type II and ISO 27001 controls](https://trust.phasetwo.io) cover that patch process if you need to show your auditor who is responsible for it.
