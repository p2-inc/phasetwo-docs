---
slug: keycloak-lts-backport-images
title: "Keycloak LTS: the security backports nobody publishes"
date: 2026-09-23
authors: [gpatil]
tags: [keycloak, release, security, upgrades, phase_two]
description: Keycloak backports security fixes to 26.4 and 26.6, then cuts no release and builds no image. We build them, at quay.io/phasetwo/keycloak. Plus where LTS is heading.
keywords: [keycloak lts, keycloak long term support, keycloak backport, keycloak version support, keycloak 26.4 docker image]
---

**Keycloak publishes releases and container images for the current minor version only. It does backport selected security fixes to the two most recent even-numbered branches, and it tags them — but it cuts no GitHub release and builds no image from those tags.** As of today there are nine such tags on `release/26.4` and three on `release/26.6`, containing fixes for CVEs that were announced months ago, that you cannot `docker pull` from anywhere upstream.

Phase Two now builds them. `quay.io/phasetwo/keycloak:26.4.16` and `quay.io/phasetwo/keycloak:26.6.7` exist today, built from the tag's own Dockerfile, and we intend to keep building the two previous minor lines alongside the current one for as long as upstream keeps backporting to them.

<!-- truncate -->

## The fixes exist. The artifacts don't.

Verified against the upstream repository and both registries on 22 September 2026:

| Branch | Last GitHub release | Last tag | Tags with no release | Upstream image for the newest tag |
|---|---|---|---|---|
| `release/26.7` | 26.7.4 (16 Sep 2026) | 26.7.4 | — | yes |
| `release/26.6` | 26.6.4 (26 Jun 2026) | 26.6.7 (7 Sep 2026) | 26.6.5, 26.6.6, 26.6.7 | **no** |
| `release/26.4` | 26.4.7 (1 Dec 2025) | 26.4.16 (7 Sep 2026) | 26.4.8 … 26.4.16 — **nine** | **no** |
| `archive/release/26.5` | 26.5.7 (2 Apr 2026) | 26.5.7 | — | yes, branch archived |

Read the 26.4 row again. The last thing anyone could install on that line was published on 1 December 2025. Nine more tags have been cut since, the first on 15 January and the most recent on 7 September, every one of them carrying backported fixes. `quay.io/keycloak/keycloak:26.4.7` is still the newest 26.4 image upstream offers.

This is not a secret. The maintainers describe the situation plainly, and a [long discussion about fixing it](https://github.com/keycloak/keycloak/discussions/51010) ran from July until it was closed on 11 September. The person who opened it, a Keycloak collaborator, put the consequence first: "I guess a lot of people have found out about this and are using these 'LTS' branches to create their own releases based on these tags (as we do)."

## Why "upgrade or stay vulnerable" keeps people on old versions

Keycloak's position has been consistent for years, and maintainer Stian Thorgersen stated it directly in the [follow-up poll](https://github.com/keycloak/keycloak/discussions/52655):

> Keycloak currently only supports the latest release. This essentially means when there is a new major or minor release users are forced to upgrade immediately to receive any new security or bug fixes.

There is no grace period. When 26.7.0 shipped, 26.6 stopped being supported that day. Asked about a critical CVE where the 26.6 backport existed but was not published, the same maintainer wrote: "that is part of using on a non-supported release (which 26.6.x became the second 26.7.x was released)."

The intent behind that policy is to keep the community current. The effect is close to the opposite, and the reason is in how upgrades actually get done. From a participant in the discussion:

> Each Keycloak upgrade requires a significant amount of cross-system validation, including integration/regression testing and performance testing. We therefore don't necessarily want to move immediately to the next LTS, which can still be relatively young when we start our upgrade process.

Put those two facts together and you get a trap. A minor upgrade can take weeks of validation because Keycloak minors do occasionally change behaviour — 26.7.4 alone [shipped a breaking change to Authorization Services URI matching](/blog/keycloak-2674-released). But the moment the next minor lands, the version you are still validating is unsupported. So the choice on every CVE is: ship an unvalidated upgrade into production, or accept the vulnerability.

Teams that cannot do the first thing end up doing the second, repeatedly, and each repetition puts them further behind — and the exposure questions in our [production checklist](/blog/keycloak-production-checklist) are exactly the ones that decide how bad that is for you. That is how you end up with an installed base sitting on versions that are years old. It is not negligence. It is the rational response to a policy that prices a security patch at the cost of a full regression cycle. Another participant described the three available options and called them what they are: "None of the solutions is currently ideal."

The tell is that upstream is *already* doing the work. Backports to 26.4 and 26.6 are real commits by real maintainers, tagged and public. The security engineering is done. What is missing is a build.

## The CentOS shape of this

If you were around for it, the shape is familiar. Red Hat published its sources; the binaries were the product. CentOS took those published sources, rebuilt them, and shipped a binary distribution that a large tier of users ran happily for a decade.

The Keycloak situation has the same shape and a different cause. There is no licence wall here and nothing is being withheld — the maintainers are capacity-limited and have said so in the open. Stian's objection to supporting both an LTS line and the previous minor was explicitly about effort: "we're then going from supporting 1 release to supporting 3 releases."

The reason the 26.4 and 26.6 branches receive backports at all is worth understanding, because it tells you how durable they are. [Red Hat build of Keycloak](https://access.redhat.com/support/policy/updates/red_hat_build_of_keycloak_notes) tracks the even-numbered community minors — 26.0, 26.2, 26.4 — skipping the odd ones, and supports each for far longer than the community's latest-only window. That paid support obligation is why fixes keep landing on `release/26.4` nine months after its last community release, and that work is done in the open, in the public repository, as public tags.

So the sources are there, maintained, for reasons that are not going away. The button that turns them into something you can run is simply not pressed.

## What is actually in our images

Nothing of ours. These are not the Phase Two distribution — that is [a different image](/extensions/containers/), with our extension suite baked in. `quay.io/phasetwo/keycloak` is stock Keycloak and contains no Phase Two code, no patches, and no configuration changes.

The build uses the tag's own `quarkus/container/Dockerfile` and `ubi-null.sh`, so the base is the same `ubi9-micro`, the entrypoint is the same `/opt/keycloak/bin/kc.sh`, and it runs as the same UID 1000. Where upstream published a release tarball for a tag, we use it, which means identical bits to upstream's own image. For the backport tags — the ones this exists for — there is no tarball, so the tag is built from source. Images are `linux/amd64` and `linux/arm64` with build attestations, and every one is smoke-tested before it is pushed.

Verify it yourself:

```bash
docker run --rm quay.io/phasetwo/keycloak:26.4.16 --version
```

```
Keycloak 26.4.16
JVM: 21.0.12.1 (Red Hat, Inc. OpenJDK 64-Bit Server VM 21.0.12.1+1-LTS)
OS: Linux 7.0.12-linuxkit aarch64
```

One detail that matters if you pin by tag: **a backport never moves `latest`.** Upstream maintains several streams at once and tags do not arrive in version order — a 26.4 backport can be published after a 26.7 release. `latest` moves only when the version being pushed is the highest we have ever published, which keeps it pointing at the current line.

A poller checks upstream's tag list every six hours, because a fork receives no events when upstream pushes a tag.

## What we are committing to, and what we are not

**Committing to:** container images for the current minor line and the two previous minor lines, which today means 26.7.x, 26.6.x and 26.4.x, for as long as upstream keeps backporting to those branches.

**Not committing to:** anything resembling a support contract on those images. Three limits worth being explicit about.

We cannot ship a fix upstream did not backport. When 26.7.4 fixed six CVEs, the 26.6.7 and 26.4.16 tags carried five of them; the sixth landed on 26.7 only, after those tags were cut. Building an image does not change what is in the tree. [The 26.7.4 writeup](/blog/keycloak-2674-released) has the per-CVE breakdown.

We will not patch. Every image is the upstream tag. The moment we started carrying our own security patches we would be maintaining a fork, which is a different promise and one we are not making here.

The CockroachDB image is narrower. [`quay.io/phasetwo/keycloak-crdb`](https://quay.io/repository/phasetwo/keycloak-crdb) carries the CockroachDB port, and it currently follows the 26.6 and 26.7 streams — `26.6.7` and `26.7.4` are both published. The 26.4 CockroachDB line stops at 26.4.7, the last upstream release on that branch, and we have not extended it to the 26.4 backports. If you run Keycloak on CockroachDB and need 26.4.16, tell us and we will look at it.

And 26.5 is over. The branch is `archive/release/26.5`, there will be no more tags, and no image is coming from us or anyone else.

## Where upstream is heading

This is a stopgap, and we would rather not be doing it. Upstream is actively deciding what to do, and the decision looks close.

The original discussion is closed. In its place there is an open poll, [Extended release support](https://github.com/keycloak/keycloak/discussions/52655), with four options and a [tracking issue](https://github.com/keycloak/keycloak/issues/52656). The four:

| Option | What it means |
|---|---|
| Latest-1, 3-month cadence | The last two minors supported. About 6 months of support per minor, 3 months to migrate. |
| Latest-1, 6-month cadence | The last two minors, with fewer minors. About 12 months of support, 6 months to migrate. |
| LTS with no overlap | Every even release gets extended support, but no overlap between them. |
| LTS with extended maintenance | An LTS gets full support until the next LTS, then extended maintenance for important security issues and mission-critical bugs. |

At the time of writing the poll has 46 votes: LTS with extended maintenance leads on 23, latest-1 at a 3-month cadence has 14, latest-1 at 6 months has 9, and LTS with no overlap has none at all. Maintainers have said they may not pick the most popular option, and that capacity allows exactly one.

Two things are already decided regardless of which wins. Keycloak 27.0 is planned for 2027, with 26.x supported for around six months afterwards; 26.8 is planned as the last 26.x release, giving it roughly twelve months in total. And whatever overlap mechanism is chosen applies to 27.x and later only — it is explicitly not being retrofitted to 26.x. Whatever happens in that poll, the 26.4 and 26.6 gaps on the table above stay exactly as they are.

If you have an opinion, the poll is open and it is one click. It is the cheapest influence you will ever have over a dependency this central.

The other variable is Red Hat. RHBK's supported builds are the commercial reason those backport branches stay alive, and how much of that surfaces publicly could change what any of this is worth. If upstream starts publishing releases and images for the backport tags, we will stop building them and say so here.

## Should you use these images?

| If you are on… | Do this |
|---|---|
| 26.7.x | Stay on the supported line. Upstream's image or ours, it makes no difference. |
| 26.6.x | Take `26.6.7` — it is three backports ahead of the newest installable release — then plan 26.7. |
| 26.4.x | Take `26.4.16`. Then plan your route off 26.4 before 27.0, because that line will not outlive it. |
| 26.5.x | Nothing is coming. Move to 26.7. |
| Older than 26.4 | Upstream backports nothing there. You are on your own, and the gap only grows. |

The honest version: **if you can upgrade to the current supported minor, do that instead.** A backport image is not equivalent to being on a supported line. It gets you the fixes a maintainer chose to backport, and nothing else, and the set of things that qualify narrows as a branch ages. It buys you time to do the upgrade properly. It does not replace the upgrade.

Start with [`docker run --rm quay.io/phasetwo/keycloak:26.4.16 --version`](https://quay.io/repository/phasetwo/keycloak) against whichever tag matches your line, then work out the last CVE your running version actually has.

If you would rather this were not your problem: our [managed Keycloak](/hosting/dedicated-clusters/) clusters are patched in our maintenance windows, under SOC 2 Type II and ISO 27001, and [we handle the version moves](/docs/self-service/upgrades) rather than handing you a deadline. [Talk to us](/contact).
