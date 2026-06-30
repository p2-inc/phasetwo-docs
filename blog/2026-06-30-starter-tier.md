---
slug: starter-tier-launch
title: Introducing the Starter Cluster Tier — Phase Two Keycloak from $149/month
date: 2026-06-30
authors: phasetwo
tags: [release, starter, pricing, keycloak, phase_two, dedicated]
description: A new dedicated-cluster tier for teams moving from evaluation to a production-ready Phase Two Keycloak deployment. $149/month, 30-day free trial, all the features of our dedicated clusters. Also covering the wind-down of our free shared-realm offering.
---

Today we're launching a new way to run Phase Two: the **Starter** cluster tier, available at **$149 per month**. Starter bundles the same feature set as our existing dedicated clusters into a plan that's accessible for teams getting their use case off the ground or running development environments with lower SLA needs. It also includes a **30-day free trial**, so you can validate your setup before committing.

[Log into the dashboard](https://dash.phasetwo.io/) and click **Create Cluster** to pick the new tier and provision yours.

<!--truncate-->

## What you get

A Starter cluster is a real dedicated Phase Two Keycloak cluster — not a shared realm carved out of someone else's resources. That means:

- **Your own dedicated compute, network, and storage.** No noisy neighbors, no shared connection limits, no contention for cache.
- **The full Phase Two enhanced Keycloak distribution** — [Organizations](https://phasetwo.io/product/organizations/), [Magic Links](https://phasetwo.io/product/magic-link/), [Webhooks](https://phasetwo.io/product/webhooks/), the [IdP Wizard](https://phasetwo.io/product/sso/#idp-wizard), and the rest of our [open-source extension library](https://github.com/p2-inc) bundled in.
- **Custom domains** (CNAME) for your login portals.
- **Cluster observability** — uptime, logs, and usage metrics surfaced through the [new dashboard](/blog/dashboard-launch).
- **The same managed CockroachDB tier** powering our larger plans, in partnership with [Cockroach Labs](https://www.cockroachlabs.com/).
- **All the regions we support** — pick whichever is closest to your users.

Starter is built to be genuinely capable, with resource limits set where most early-stage teams actually need them — enough headroom for real production workloads and development environments. When you need more, our existing higher-capacity cluster offerings are ready for you. They've proven themselves capable for many teams pushing serious throughput, with a larger resource envelope and a matching SLA — and you can scale straight up from Starter into them without re-provisioning.

## Who it's for

We built Starter for two specific shapes of team:

1. **Teams ready to move past evaluation.** You've validated Phase Two on a free realm, you're getting close to a real launch, and you want to put your auth on its own infrastructure with a predictable monthly price.
2. **Dev and staging environments.** You're already running a dedicated cluster in production and want a matching environment that doesn't double your bill. Starter is intentionally priced so a team can comfortably run a cluster-per-environment without thinking twice.

If your use case is large or mission-critical from day one, our [higher-capacity clusters](/pricing) remain the right choice. Starter is the on-ramp, not the destination — and clusters scale up from Starter into the larger tiers without a re-provision.

## Try it for 30 days, free

Every new Starter cluster includes a **30-day free trial**. That's enough time to wire your application up against a real cluster, run integration tests, validate SSO connections, and decide whether it fits the way you work. If you're still validating at day 30, talk to us — we'd rather give you the runway than rush you.

## How to provision one

1. [Open the dashboard](https://dash.phasetwo.io/).
2. Click **Create Cluster**.
3. Pick **Starter** as the tier.
4. Choose your region.
5. Watch it provision (most clusters are live within 30 minutes).

Detailed setup walkthroughs live in the [Cluster docs](/docs/self-service/dedicated-clusters).

## What this means for our free shared realms

Alongside the Starter launch, **we are discontinuing our free, shared-realm offering**. Free realms have served us well — they've onboarded thousands of teams over the years and given us a clear picture of how people validate Phase Two — but they've also become harder to operate sustainably as our paying-customer footprint has grown.

The Starter tier (with its 30-day trial) is now the path from "I want to try this" to "I'm running it in production." We think it's a clearer journey, and it gives us a single class of infrastructure we can invest in deeply rather than splitting effort between shared and dedicated systems.

### Migration timeline

If you currently have active realms on our free, shared infrastructure:

- **You have 30 days from today (2026-06-30) — through 2026-07-30 — to upgrade and migrate your realms** if you want to preserve them.
- After 2026-07-30, the shared infrastructure will be shut down and its data permanently deleted.

To migrate, create a Starter (or larger) cluster from the dashboard, export your realm config from the shared instance, and import it into your new cluster. If you'd like a hand with the steps, our team is happy to walk through it with you.

## We're here to help

- **Technical or migration questions** — email [support@phasetwo.io](mailto:support@phasetwo.io).
- **Pricing, upgrade paths, or help picking the right tier** — email [sales@phasetwo.io](mailto:sales@phasetwo.io).

Whichever way you contact us, the actual humans who built and operate the infrastructure are the ones writing back.

## Thank you

If you've used Phase Two — free shared realm or dedicated cluster — you're part of the reason we're able to launch this tier today. We're grateful you picked us for your Keycloak hosting, and we're going to keep working to make the platform more reliable, more affordable, and more useful for what you're building.

If we've helped, we'd love a [⭐ on GitHub](https://github.com/p2-inc) or a follow on [LinkedIn](https://www.linkedin.com/company/phase-two-tech). It genuinely matters.

— The Phase Two Team
