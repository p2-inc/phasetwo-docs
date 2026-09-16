---
slug: keycloak-26416-released
title: "Keycloak 26.4.16 Released: Two High CVEs, No Announcement"
date: 2026-09-16
authors: [gpatil]
tags: [keycloak, release, security, upgrades]
description: Keycloak 26.4.16 fixes two high-severity CVEs, including an unauthenticated crash. Upgrade this week — and note it ships as a git tag with no GitHub release.
keywords: [keycloak 26.4.16, keycloak release, keycloak news, keycloak security update]
---

**Bottom line: upgrade this week if you run Keycloak 26.4.** Keycloak 26.4.16 carries the fix for an unauthenticated denial of service that needs nothing more than a reachable login page ([CVE-2026-79651](https://nvd.nist.gov/vuln/detail/CVE-2026-79651), high, 7.5) and an authorization bypass in the policy enforcer ([CVE-2026-74909](https://nvd.nist.gov/vuln/detail/CVE-2026-74909), high, 8.1). The awkward part is finding it: 26.4.16 exists only as a git tag. There is no GitHub release, no post on keycloak.org, and no entry in the upgrading guide.

<!-- truncate -->

## Should you upgrade?

| If your deployment… | When |
|---|---|
| Serves login pages to an untrusted network | **This week.** Any unauthenticated client can exhaust heap. |
| Uses Authorization Services or the policy enforcer | **This week.** Encoded path tricks reach a more permissive policy. |
| Brokers logins from an external IdP | **This week.** An attacker can lock a user out by colliding on username. |
| Runs 26.4 behind a private network with none of the above | Next normal cycle, but read the breaking change below. |

There is no configuration under which we would tell you to skip this. CVE-2026-79651 needs no account, no client credentials and no unusual feature flag — just the ability to send requests to the theme localization endpoints, which every login page depends on.

## Security fixes

Counted from the tag: `26.4.15...26.4.16` is 16 commits and contains **three distinct CVE identifiers**. The release body we were given lists 12, but it is the cumulative history of the 26.4 branch — CVE-2026-37977, for example, was patched in 26.4.13. The three below are what is new in this tag.

| CVE / advisory | Severity | What it is |
|---|---|---|
| [CVE-2026-74909](https://nvd.nist.gov/vuln/detail/CVE-2026-74909) / [GHSA-5639-qg9x-rw29](https://github.com/advisories/GHSA-5639-qg9x-rw29) | **high 8.1** | Policy enforcer applies the wrong policy to an encoded path |
| [CVE-2026-79651](https://nvd.nist.gov/vuln/detail/CVE-2026-79651) / [GHSA-8qv5-pjhw-3gx4](https://github.com/advisories/GHSA-8qv5-pjhw-3gx4) | **high 7.5** | Unauthenticated out-of-memory via unbounded locale caching |
| [CVE-2026-19607](https://nvd.nist.gov/vuln/detail/CVE-2026-19607) / [GHSA-h87q-rx56-87wm](https://github.com/advisories/GHSA-h87q-rx56-87wm) | medium 5.3 | Brokered login collides with an existing username, locking it out |

**CVE-2026-79651 is the one that will page you.** Keycloak accepted arbitrary locale tags from unauthenticated requests and cached them permanently in memory with no bound. Send enough unique tags and the server runs out of heap and dies. The fix bounds the locales the theme message lookup will accept.

**CVE-2026-74909 only matters if you use Authorization Services.** The policy enforcer failed to normalize percent-encoded matrix parameters (`%3B`), dot segments (`%2E%2E`) and encoded slashes, so a mutated form of a protected URI could fall through to a more permissive resource — a catch-all `/*`, typically. Upstream calls this an incomplete fix for earlier work in the same code. If you do not use Authorization Services, this does not reach you.

**One thing we could not verify.** Upstream's [26.7.4 announcement](https://www.keycloak.org/2026/09/keycloak-2674-released) lists six CVE fixes in this coordinated drop; the 26.4.16 notes name three of them. Three commits in this tag look like the remaining fixes — impersonation privilege checks, a SAML DEFLATE state leak, a SAML ECP fault disclosure — but none of them names a CVE, and we will not map a commit message to an identifier. Read the upstream list and compare against `26.4.15...26.4.16` yourself if you need certainty.

## Which version carries the fix

The advisories for all three CVEs list no affected package ranges and no patched version, so they cannot answer this. The tags can. Checked 16 September:

| Branch | Newest upstream release | Newest tag | These three fixes | Runnable image |
|---|---|---|---|---|
| 26.7 | 26.7.4 (16 Sep) | 26.7.4 | yes | `quay.io/phasetwo/keycloak:26.7.4` |
| 26.6 | 26.6.4 (26 Jun) | 26.6.7 | yes, in the **tag** — no release | `quay.io/phasetwo/keycloak:26.6.7` |
| 26.5 | 26.5.7 (2 Apr) | 26.5.7 | **no — nothing tagged** | — |
| 26.4 | 26.4.7 (Dec 2025) | 26.4.16 | yes, in the **tag** — no release | `quay.io/phasetwo/keycloak:26.4.16` |

If you are on 26.5, there is no fix for you. Move to 26.6.7 or 26.7.4.

Keycloak cuts tags for backports without publishing a release, which is why 26.4.16 and 26.6.7 look like they do not exist. They do. We build [container images](/extensions/containers/) from those tags, and all three above were pushed on 16 September — check the [tag list](https://quay.io/repository/phasetwo/keycloak?tab=tags) rather than assuming a version is there.

## Breaking changes

One, and it is not documented for your branch. The CVE-2026-74909 fix changes URI matching in Authorization Services: matrix parameters are stripped, dot segments resolved, `%2F` decoded, trailing slashes dropped, and query strings and fragments ignored before comparison. Resources you were distinguishing by any of those are now treated as equivalent.

The [upgrading guide](https://www.keycloak.org/docs/latest/upgrading/#migration-changes) documents this under "Migrating to 26.7.4". There is no 26.4.16 entry, but the same change is in this tag — read the 26.7.4 section and apply it to your config.

## How to upgrade

Pull the tag or the image, review your Authorization Services resources against the 26.7.4 migration notes, and test on a staging realm first. The [release notes](https://www.keycloak.org/docs/latest/release_notes/index.html) cover 26.7.4 but stop at 26.4.6 for your branch. Our [security docs](/docs/security/) cover the brute-force and rate-limiting controls worth having in front of an endpoint like the one CVE-2026-79651 abused; the [production checklist](/blog/keycloak-production-checklist) covers the rest. For the previous drop on this branch, see our [26.7.3 write-up](/blog/keycloak-2673-released).

If tracking untagged backports is not how you want to spend this week, our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows under SOC 2 Type II and ISO 27001. [Talk to us](/contact).
