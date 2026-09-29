---
id: dedicated-clusters
title: Dedicated Clusters
---

Dedicated clusters are available with paid plans. These Clusters use isolated compute, network, and storage resources. Dedicated clusters come in three tiers — **Starter**, **Premium**, and **Enterprise** — which differ in capacity and limits. See [Create a Cluster](./create-a-cluster.md) for how to choose a tier.

### Users and cluster sizing

**Users are unlimited on every tier.** There is no cap on how many users you register, and no restriction on how many users can be on a cluster.

What differs between tiers is the authentication load each cluster is sized for:

| Tier       | Sized for active users |
| ---------- | ---------------------- |
| Starter    | 5K                     |
| Premium    | 100K                   |
| Enterprise | 500K                   |

Those figures assume an active user logs in **30 times** and refreshes their token **1,000 times** per month.

These are **soft limits**. Exceeding them is not blocked, throttled, or surcharged, but performance may degrade — usually as higher latency on the token endpoints. We monitor CPU and memory on every cluster and reach out proactively; if you see degradation, we will work with you to adjust the use case, size the cluster correctly, or both. See [Choosing a tier](./create-a-cluster.md#choosing-a-tier) for the full explanation.

The limits in the rest of this page — realms, resources, IP restrictions, custom domains — are hard limits enforced by the control plane, unlike the sizing figures above.

### Realm limits by tier

The number of Realms you can create depends on the cluster tier:

| Tier       | Realms per cluster |
| ---------- | ------------------ |
| Starter    | Up to 5            |
| Premium    | Up to 20           |
| Enterprise | Up to 100          |

If you need more, please contact your account representative or email [support@phasetwo.io](mailto:support@phasetwo.io).

For more information view the [Hosting](/hosting) and [Pricing](/pricing) pages.

## Creating Realms in your Cluster

Once your Cluster has been provisioned, you can create Realms in it. Open the create Realm modal from the Cluster, and access the admin console for each one using the _Open Console_ link next to it. Learn more about [creating realms](./realms.md).

The number of Realms you can create depends on your cluster tier (see the table above).

## Billing

Access to invoices and ability to change payment information can be accessed in the action menu next to the Cluster. This will take you to [Stripe](https://stripe.com), our payment partner, to access your billing history and update your payment information. This is restricted to users with the appropriate organization roles.

## Deleting a Cluster

Clusters that have reached the provisioing or active state cannot be immediately deleted. If you wish to delete your Cluster and end your subscription, you can schedule the deletion. Your cluster will be available until the end of your montly billing period. At that point, there will begin a 7-day grace period where the cluster will be available, and a 14-day grace period where the data will be preserved. Following that, the cluster will be de-provisioned and all data will be purged from our systems for security and compliance reasons.

## Refunds

There are no refunds available for subscriptions paid on a monthly basis.

If you have paid annually, and you have more than one month left in your subscription period, you will be refunded a pro-rated amount following the end of the 14-day grace period. This refund will come through your payment method registered with Stripe.

## SLA

Premium clusters carry a 99.5% uptime guarantee and Enterprise clusters 99.95%. On Enterprise, that commitment can be extended to **99.99% for an additional fee** — email [sales@phasetwo.io](mailto:sales@phasetwo.io) to scope it. Starter clusters are operated on a best-effort basis and are not covered by an SLA.

Please refer to our [Service Level Agreement](/company/sla) for more information.
