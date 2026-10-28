---
id: billing
title: Billing & Subscriptions
description: How billing works for Phase Two dedicated clusters — subscriptions, payment methods, invoices and receipts, billing contacts, failed payments, cancelling a subscription, and what happens to your data afterwards.
---

Every dedicated cluster has its own subscription, billed through [Stripe](https://stripe.com), our payment partner. Payment methods belong to your team and can be shared across its clusters. This page covers everything after [Create a Cluster](./create-a-cluster.md): paying, invoices, changing payment details, cancelling, and what happens to your data.

## Where to find billing in the dashboard

| What                                                  | Where                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| A cluster's plan, billing period, and status          | **Clusters > (cluster) > Config > Subscription**                                      |
| Invoice history, update the card for one subscription | **Clusters > (cluster) > Config > Subscription > Manage subscription > Manage**       |
| Cancel a subscription and delete the cluster          | **Clusters > (cluster) > Config > Subscription > Cancel subscription**                |
| Your team's saved payment methods                     | **Teams > (team) > Billing**                                                          |
| Who receives billing emails                           | **Teams > (team) > Members**, then **Add billing contact** in a member's actions menu |

**Manage** opens the Stripe billing portal in a new tab. The portal is where you see past invoices, download receipts, and update the payment method for that subscription.

## Roles and access

Billing actions are controlled by [team roles](./your-organization.md#roles):

| To                                                               | You need                                      |
| ---------------------------------------------------------------- | --------------------------------------------- |
| View the team's payment methods                                  | `view-billing`                                |
| Add, remove, or set the default payment method                   | `manage-billing`                              |
| Open the billing portal, cancel a subscription, delete a cluster | `manage-clusters`                             |
| View or change the team's billing contacts                       | `view-organization` and `manage-organization` |

If an action is missing from your view, ask an admin of your team to grant the role.

## Plans and billing periods

Clusters come in three tiers: **Starter**, **Premium**, and **Enterprise**. Premium and Enterprise can be billed monthly or annually, and the annual rate is discounted. Starter is billed monthly only. See [Choosing a tier](./create-a-cluster.md#choosing-a-tier) and the [Pricing page](/pricing) for details.

Subscriptions renew automatically at the end of each billing period until you cancel.

## Free trial

The **Starter** tier includes a 30-day free trial, applied automatically at checkout and available once per customer. You enter a payment method at checkout but are not charged during the trial. When the trial ends, the first monthly payment is taken and the subscription continues.

If you cancel during the trial, you are not charged.

## Checkout

When you create a cluster you are sent to Stripe Checkout to enter a payment method. Once checkout completes you return to the dashboard while the cluster is provisioned.

If you close the checkout before finishing, the cluster waits for billing to be set up. Open it from the [Clusters view](https://dash.phasetwo.io/clusters) and use **Enter Payment Details** on the **Finish setting up billing** notice to pick up where you left off.

## Managing payment methods

Open **Teams > (team) > Billing** to manage the cards your team has on file. From there you can:

- **Add payment method.** You are sent to Stripe to enter the card, then returned to the Billing page.
- **Set a default.** The default card is offered first when you create a new cluster.
- **Remove a card.** A card that is billing an active subscription can't be removed. Switch that subscription to another card first, from its **Manage subscription** portal.

To change the card used by one cluster's subscription, open that cluster's **Config > Subscription** and choose **Manage**.

## Invoices and receipts

Invoice history for a cluster is in the billing portal (**Config > Subscription > Manage**). Phase Two also emails:

- **A receipt** each time a payment succeeds, itemized by cluster.
- **A renewal reminder** about a week before a subscription renews. Trials and subscriptions that are set to cancel don't get one.
- **A payment-failed notice** if a payment doesn't go through, with what to do next and the relevant dates.

These go to the billing email on the Stripe account and to your team's [billing contacts](#billing-contacts). You may also receive notices directly from Stripe, for example when a trial is about to end or a card is about to expire.

## Billing contacts

Billing contacts are team members who receive copies of billing emails: receipts, renewal reminders, failed-payment notices, and cluster deletion notices. To add one, open **Teams > (team) > Members**, open the member's actions menu, and choose **Add billing contact**. Billing contacts are marked with a card icon in the member list. Use **Remove billing contact** to stop the emails.

Being a billing contact only adds the person to these emails. It grants no access, so give them `view-billing` as well if they need to see payment methods.

## Changing your plan

To move a cluster to a different tier or billing period, or for any other question about your plan, email [support@phasetwo.io](mailto:support@phasetwo.io) with the cluster name and the change you want.

## Failed payments

If a renewal payment fails, Stripe retries it automatically. If the payment still can't be collected, or the subscription ends without being renewed, the cluster is marked **Billing required**. The cluster keeps running and its configuration and data are untouched while you resolve it.

Open the cluster in the dashboard. The notice explains what happened and offers one of two actions:

- **Pay Outstanding Invoice**, which takes you to Stripe to pay the invoice that failed.
- **Enter Payment Details**, which takes you to Stripe to start a new subscription for the cluster.

Once payment succeeds the cluster returns to normal. Nothing is re-provisioned.

If billing isn't resolved, the cluster is eventually removed. The notice and the emails Phase Two sends state the removal date and how long data is kept after it, so keep your [billing contacts](#billing-contacts) and payment methods current.

## Cancelling a subscription

Cancelling a subscription schedules its cluster for deletion. To cancel:

1. Open **Clusters > (cluster) > Config > Subscription**.
2. Choose **Cancel subscription**.
3. Review the deletion timeline in the **Destroy this cluster?** dialog and confirm.

You need the `manage-clusters` role. Cancelling from the Stripe billing portal (**Manage subscription > Manage**) has the same effect.

The cluster stays available until the end of the period you have already paid for. You receive an email with the full timeline.

## What happens to your cluster and data

After the paid period ends:

| When                          | What happens                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------- |
| End of the billing period     | The subscription ends. No further charges.                                   |
| Up to 7 days after period end | Grace period. The cluster stays available.                                   |
| 7 days after period end       | The cluster is removed. Its data is retained but the cluster no longer runs. |
| 14 days after period end      | All realms and data are permanently purged and can't be recovered.           |

Export anything you may want later, such as realm exports and users, before the period ends rather than relying on the retention window. See [Backups and Data Retention](./backups-and-data-retention.md).

## Undoing a cancellation

Before the billing period ends, you can resume the subscription from the Stripe billing portal (**Manage subscription > Manage**), or email [support@phasetwo.io](mailto:support@phasetwo.io) and we will restore it. After the cluster has been removed, contact support as soon as possible. Once the data is purged it can't be restored.

## Refunds

Subscription payments are non-refundable. This applies to monthly and annual billing. Annual billing is discounted in exchange for the full-year commitment. See the [Terms of Service](/company/terms) for details.

## Directly invoiced clusters

Some contracts are invoiced directly by Phase Two rather than through Stripe. For those clusters, **Config > Subscription** shows "Your cluster is billed directly by Phase Two" instead of the billing portal. Email [support@phasetwo.io](mailto:support@phasetwo.io) with any billing question.

## Automating billing

The [Management API](../management-api/index.md) can list your team's payment methods and create clusters against one, or return a checkout link for a person to complete. API keys need the `manage-billing` scope for this. See the [API keys](../management-api/api-keys.md), [recipes](../management-api/recipes.md#1-provision-a-cluster), and [Terraform](../management-api/terraform.md) pages.

## FAQ

**How do I change the billing email, billing address, or tax ID on my invoices?**
Open the billing portal from **Config > Subscription > Manage**. If a field isn't editable there, email [support@phasetwo.io](mailto:support@phasetwo.io).

**How do I move a cluster to another team?**
Email [support@phasetwo.io](mailto:support@phasetwo.io) with the cluster name and the destination team.

**Who do I contact about billing?**
[support@phasetwo.io](mailto:support@phasetwo.io).
