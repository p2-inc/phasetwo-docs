---
slug: keycloak-2673-released
title: "Keycloak 26.7.3 Released: 20 Security Fixes, No Advisories Yet"
date: 2026-08-31
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: "Keycloak 26.7.3 fixes 20 CVEs across OIDC, token exchange, organizations and admin permissions. Upgrade this week, but no advisories are published yet."
keywords: [keycloak 26.7.3, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: schedule Keycloak 26.7.3 this week if you run OIDC clients, token exchange, fine-grained admin permissions v2, organizations, or LDAP user federation. That is almost every production deployment.** The release notes list 20 security fixes, and several are described as authentication or authorization bypasses rather than information leaks. We cannot tell you how severe they are, because Keycloak has not published a security advisory for any of them yet, so there is no official severity, no CVSS vector, and no affected-version range to check against. Treat the absence of ratings as missing information, not as reassurance.

<!-- truncate -->

## What we can and cannot tell you about these CVEs

This is the unusual part of this release, so it goes first.

Keycloak's published GitHub Security Advisories currently stop at 6 August 2026. Keycloak 26.7.3 shipped on 31 August 2026. Every advisory in the feed today is already fixed in 26.7.1 or earlier. **Not one of the 20 CVE identifiers in the 26.7.3 release notes has a published advisory behind it.**

The release notes do assign CVE identifiers to all 20 issues. We are deliberately not reproducing those identifiers in this post. An identifier with no advisory behind it carries no severity rating, no CVSS vector, and no list of affected versions, so quoting it here would give you something that looks checkable but is not. The identifiers are in the [26.7.3 release notes](https://github.com/keycloak/keycloak/releases/tag/26.7.3) if you need them for a ticket, and each fix below links to its upstream issue.

What this means in practice:

- **We cannot rank these fixes.** Nobody outside the Keycloak security team can, yet.
- **We cannot give you a backport map.** Normally an advisory lists one affected range per branch, and that tells you which patch on your branch carries the fix. There are no advisories, so there are no ranges.
- **If you need a severity before you can raise a change request**, check [Keycloak's advisory list](https://github.com/keycloak/keycloak/security/advisories) directly rather than trusting this post or any other. The ratings will appear there first.

## Should you upgrade?

Yes, and sooner than a normal patch. Here is the reasoning, bounded to what the sources actually support.

Of the 20 security fixes, the ones that describe a control being bypassed rather than data being exposed are what drive the urgency:

- A **required signed-JWT assertion policy can be bypassed with unsigned assertion headers** ([#50997](https://github.com/keycloak/keycloak/issues/50997)). If you enforce signed client assertions, this is a check you believed you had.
- **Authorization codes can be retargeted to another client session** ([#51003](https://github.com/keycloak/keycloak/issues/51003)).
- **Microsoft and Google external token exchange bypass the configured tenant and hosted-domain restrictions** ([#51282](https://github.com/keycloak/keycloak/issues/51282), [#51287](https://github.com/keycloak/keycloak/issues/51287)). If you use those restrictions as a tenancy boundary, that boundary was not holding.
- **The LDAP client did not verify that the server certificate matched the intended LDAP hostname** ([#50785](https://github.com/keycloak/keycloak/issues/50785)). This one matters only if your LDAP connection is TLS-protected and you assumed the certificate was being checked.

Who is most exposed, by configuration:

| If you use | Fixes that apply | Read as |
|---|---|---|
| OIDC clients, client policies, token issuance | 7 | Upgrade this week |
| Fine-grained admin permissions v2, delegated admin | 6, plus 5 unrated weaknesses | Upgrade this week |
| Token exchange with Microsoft or Google IdPs | 2 | Upgrade this week |
| Organizations | 2 | Upgrade this week |
| LDAP federation over TLS | 1 | Upgrade this week |
| Authorization services / UMA | 1 | Upgrade this week |
| None of the above, no admin API exposure | Path-probing fix only | Normal cycle |

The last row is the only honest "not urgent" case, and it is narrow.

## Security fixes

### The one fix with a published advisory

Exactly one CVE named in the 26.7.3 notes has an advisory you can read today, and it is there because the notes say its **previous fix was incomplete**:

| CVE | Advisory | Published severity | CVSS | Affected |
|---|---|---|---|---|
| [CVE-2026-9083](https://nvd.nist.gov/vuln/detail/CVE-2026-9083) | [GHSA-9jrw-8xf7-xqhq](https://github.com/keycloak/keycloak/security/advisories/GHSA-9jrw-8xf7-xqhq) | medium | 4.9 (`AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:N/A:N`) | `< 26.6.4` |

**The sources conflict here, and the conflict is worth your attention.** The published advisory says CVE-2026-9083 is fixed in 26.6.4. The 26.7.3 release notes say the fix was incomplete and that relative path traversal still enables filesystem probing *in 26.6.4* ([#51745](https://github.com/keycloak/keycloak/issues/51745)). If you upgraded to 26.6.4 specifically to close that advisory, you should assume it is still open on your deployment. The advisory has not been updated to say so. Check it directly before you conclude otherwise.

A second incomplete-fix case sits in the bug list rather than the security list: SAML ECP fault strings still disclose whether a client exists ([#52017](https://github.com/keycloak/keycloak/issues/52017)). The notes call it an incomplete fix of an earlier SAML CVE whose advisory we could not find in the published feed, so we are not naming that identifier either.

### Which release carries the fix on your branch

**There is no backport.** As of 1 September 2026, the newest tag on the 26.6 branch is 26.6.6, dated 11 August 2026, three weeks before 26.7.3 was cut. It cannot contain these fixes. There is no 26.6.7, no 26.5.x, and no 26.4.x release carrying them either.

So if you are on 26.6 or older, **26.7.3 is currently the only release with these fixes in it**, and taking them means a minor-version move, not a patch. Waiting for a backport is defensible, but make that call knowing none has been announced and none is visible in the tags.

### The rest

The remaining fixes cluster into four groups. None has a published severity.

**Fine-grained admin permissions v2** is the largest group, and every item is a delegated admin doing something they should not be able to do, or seeing something they should not see: hidden groups disclosed through realm default-group reads ([#51001](https://github.com/keycloak/keycloak/issues/51001)), raw reCAPTCHA secrets exposed in authenticator config ([#51005](https://github.com/keycloak/keycloak/issues/51005)), privileged child roles removable through role-composite deletion ([#51112](https://github.com/keycloak/keycloak/issues/51112)), user PII returned from `GET /roles/{role}/users` without the per-user view filter ([#51142](https://github.com/keycloak/keycloak/issues/51142)), and unpermitted groups attachable during user creation via `POST /users` ([#51378](https://github.com/keycloak/keycloak/issues/51378)). Missing per-role authorization on composite endpoints ([#51002](https://github.com/keycloak/keycloak/issues/51002)) sits alongside these. A further six issues are filed as "weaknesses" with no CVE assigned at all, and five of those are also FGAP v2 disclosure gaps. If FGAP v2 is how you separate tenants or teams, this release is the one to take.

**OIDC and client policy** covers the assertion and authorization-code issues above, plus client not-before revocation being ignored when the realm not-before is older but nonzero ([#51279](https://github.com/keycloak/keycloak/issues/51279)), a redirect-URI parameter-injection check that inspected only the query string and not the fragment ([#51286](https://github.com/keycloak/keycloak/issues/51286)), client access-type conditions evaluated against the pre-update client type ([#51380](https://github.com/keycloak/keycloak/issues/51380)), full-scope-disabled policy validation bypassed by omitting `fullScopeAllowed` ([#51382](https://github.com/keycloak/keycloak/issues/51382)), and the `jwt-bearer` grant not enforcing `consentRequired` ([#52028](https://github.com/keycloak/keycloak/issues/52028)).

**Organizations**: managers could create managed members through stored registration links without `manage-users` ([#50998](https://github.com/keycloak/keycloak/issues/50998)), and generic identity-provider creation could bind brokers to organizations without `manage-organizations` ([#51283](https://github.com/keycloak/keycloak/issues/51283)). Both are privilege boundaries inside multi-tenant setups.

**Authorization services**: a UMA claim token could override the time policy's clock ([#51379](https://github.com/keycloak/keycloak/issues/51379)), which makes time-based policies bypassable by the caller they are meant to constrain.

## What else is in it: the 26.7.1 performance regression is fixed

If you upgraded to 26.7.1 or 26.7.2 and watched CPU climb, this release is the fix, and that is a genuine reason to take it beyond the security work.

Three related issues land together. Admin API per-request cost was growing super-linearly with realm count, a regression introduced in 26.7.1 ([#51554](https://github.com/keycloak/keycloak/issues/51554)). Lightweight access token role resolution was resolving all roles across all realms on every admin API request ([#51707](https://github.com/keycloak/keycloak/issues/51707)). Together these produced the reports of sustained high CPU on all nodes after upgrade ([#51523](https://github.com/keycloak/keycloak/issues/51523)). The pattern is the same in each: work proportional to total realm or role count on a per-request path. If you run many realms on one cluster, this is the release that stops that scaling with your tenant count.

The upstream notes publish no before-and-after numbers and we have not benchmarked it, so we are not going to quote a speedup. If you were affected, you already have the graph.

Also fixed: an NPE in `RoleUtils.expandCompositeRoles` when a cached client scope referenced a deleted role ([#51589](https://github.com/keycloak/keycloak/issues/51589)), `SQLGrammarException: The incoming request has too many parameters` ([#51510](https://github.com/keycloak/keycloak/issues/51510)), client session note removals not persisting with persistent user sessions ([#52038](https://github.com/keycloak/keycloak/issues/52038)), V1 token exchange stripping the DPoP sender constraint from a bound access token ([#50963](https://github.com/keycloak/keycloak/issues/50963)), and an admin UI regression in the JS admin client introduced in 26.7.2 ([#51983](https://github.com/keycloak/keycloak/issues/51983)).

No new features are described for 26.7.3. The upstream release notes page still documents 26.7.0 as the most recent feature release.

## Breaking changes and migration

There are three, and two of them are the hardening behind the security fixes above. Check these before you roll:

**1. `kc.` claims are now reserved.** Custom claims prefixed with `kc.` are filtered out of user-supplied data before policy evaluation, because that prefix is now reserved for server-controlled evaluation context attributes. If your authorization policies read a claim named `kc.something`, rename it. Related: where a UMA permission ticket and a claim token contain the same key, **ticket claims now take precedence**, reversing the previous behaviour where the claim token silently won.

**2. Redirect URIs containing OIDC response parameters are rejected by default.** A `redirect_uri` carrying `state`, `code`, or `session_state` is now refused, because those collide with the parameters Keycloak appends after authentication or logout. This is the fix for the parameter-injection issue in [#51286](https://github.com/keycloak/keycloak/issues/51286). Two deprecated escape hatches exist if a client depends on the old behaviour, both slated for removal in Keycloak 27:

```
# Server-wide, in the OpenID Connect provider configuration
allow-oidc-params-in-redirect-uris

# Per-client attribute
allow.oidc.params.in.redirect.uris
```

Reach for these only to buy time while you fix the client. The same release also fixes a regression where this check wrongly rejected legitimate OIDC response parameters in a logout `redirect_url` ([#51712](https://github.com/keycloak/keycloak/issues/51712)), so test your logout flows specifically.

**3. `inviteLink` is deprecated in organization invitation API responses.** The field held a signed registration token and is no longer returned. Email delivery is unchanged, so this only affects you if you were reading `inviteLink` out of the API to deliver invitations yourself. `getInviteLink()` and `setInviteLink()` go away in a future major. This is the counterpart to the stored-registration-link issue in [#50998](https://github.com/keycloak/keycloak/issues/50998). If you build [Keycloak organizations](/extensions/organizations/) into a self-service onboarding flow, this is the one most likely to break your code.

## How to upgrade

```
quay.io/keycloak/keycloak:26.7.3
```

Read the [official upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) before you roll, particularly the "Migrating to 26.7.3" section covering the three changes above. If you are coming from 26.6 or older you are crossing a minor boundary and pick up the 26.7.0, 26.7.1 and 26.7.2 migration steps too, including the legacy client-initiated account linking endpoint being disabled by default in 26.7.2 and the stricter admin role validation in 26.7.1. Take a database backup, roll one node, and check your logs for rejected redirect URIs before you continue.

If you broker to external providers, the token exchange fixes are worth a specific test pass against your [Keycloak identity provider](/docs/keycloak/idp/) configuration, since tenant and hosted-domain restrictions now actually constrain the exchange.

## Where we would leave it

Take this one. The security content is broad, it touches the boundaries most deployments rely on, and the performance fixes give you a second reason. What we would not do is read the missing severity ratings as good news. Check [Keycloak's advisories](https://github.com/keycloak/keycloak/security/advisories) again in a week, when these 20 should have ratings and affected ranges attached.

Our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched by us against exactly this kind of release, under [SOC 2 Type II](/blog/soc-2-type-II-compliance) and [ISO/IEC 27001](/blog/iso-27001-certification) controls.
