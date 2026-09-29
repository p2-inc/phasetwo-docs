---
id: create-a-cluster
title: Create a Cluster
---

Creating a cluster can be done through our [Dash](https://dash.phasetwo.io/) self-service tool, or by contacting [Phase Two](mailto:sales@phasetwo.io) for assistance.

## Starting cluster creation

Creating a new cluster can be started in a couple of ways:

1. Visit the [create cluster link](https://dash.phasetwo.io/clusters/create) directly.
2. From the [Overview page](https://dash.phasetwo.io/) or the [Clusters page](https://dash.phasetwo.io/clusters/), click **Create Cluster** in the top right.

## Choosing a tier

Dedicated clusters are available in three tiers. For custom requirements (multi-region, on-prem, custom DPA, a 99.99% SLA, or higher limits) you should message our team to discuss further.

**Users are unlimited on every tier.** There is no cap on how many users you register, and no cap on how many of them use the cluster. What differs between tiers is the amount of authentication load the cluster is sized for.

| Tier       | Best for                                          | Sized for active users | Uptime             | Notes                                                                               |
| ---------- | ------------------------------------------------- | ---------------------- | ------------------ | ----------------------------------------------------------------------------------- |
| Starter    | New projects and small teams moving to production | 5K                     | 95% target, no SLA | Includes a 30-day free trial. Monthly billing only.                                 |
| Premium    | Growing products with real traffic                | 100K                   | 99.5% SLA          | Monthly or annual billing.                                                          |
| Enterprise | High-scale products needing priority support      | 500K                   | 99.95% SLA         | Monthly or annual billing. The SLA can be extended to 99.99% for an additional fee. |

### What "active users" means here

The sizing figures assume an active user, in a given month:

- logs in **30 times**, and
- refreshes their token **1,000 times**

That is roughly 1,030 token requests per active user per month. If your traffic is lighter, a tier carries more users than its headline number; if it is heavier — short refresh lifespans, chatty machine-to-machine clients, bursts of logins — it carries fewer.

These are **soft limits**, not enforced quotas. Nothing is blocked, throttled, or surcharged if you go past the sizing for your tier, but performance may degrade, usually as higher latency on the token endpoints. We monitor CPU and memory on every cluster and reach out proactively; if you do see degradation, we will work with you to adjust the use case, resize the cluster, or both.

All tiers run on isolated, high-availability infrastructure and include the core Keycloak + Phase Two feature set, custom domains, and theming. For current pricing and the full feature-by-feature breakdown, see the [Pricing page](/pricing) or open **Detailed comparison** in the create flow.

### Billing period

Use the **monthly / annual** toggle to choose your billing period. Premium and Enterprise offer a discounted annual rate; Starter is monthly only. The summary on the right reflects your selection before checkout.

## Cluster details

After selecting a tier, provide the cluster details:

- **Region** — where the cluster runs.
- **Organization** — the owning organization (you must have the `manage-clusters` role in it).
- **Name** — a unique identifier for the cluster (letters, numbers, dashes, and underscores).
- **Domain** — optionally, a custom domain you wish to use. You can also configure this later.

## Checkout and the Starter trial

Once you have entered the required information, you will be sent to [Stripe](https://stripe.com), our payment partner, to set up your billing account and payment method.

For the **Starter** tier, a 30-day free trial is applied automatically at checkout — you will not be charged during the trial, and billing begins when it ends. The trial is available once per customer.

Following successful billing setup, you will be returned to the [Clusters view](https://dash.phasetwo.io/clusters) while your cluster is provisioned. This is usually fast, but can take longer in some cases. You will be notified by email and in the [Clusters view](https://dash.phasetwo.io/clusters) when the cluster is live. If there is any issue during set-up, the Phase Two team will reach out to you directly.

<img
src="/docs/dash-cluster-card.png"
alt="Keycloak Phase Two Dedicated Cluster Card"
style={{ width: "40%", borderRadius: "8px" }}
/>
