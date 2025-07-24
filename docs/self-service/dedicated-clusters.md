---
id: dedicated-clusters
title: Dedicated Clusters
---

Dedicated clusters are available with paid plans. These Clusters use isolated compute, network and storage resources. Customers using dedicated clusters can create up to 20 Realms per cluster. If you need more, please contact your account representative or email [support@phasetwo.io](mailto:support@phasetwo.io).

For more information view the [Hosting](/hosting) and [Pricing](/pricing) pages.

## Creating a Cluster

Creating a new cluster can be started in a couple of ways:

1. Visit the [create cluster link](https://dash.phasetwo.io/clusters/create).
2. From the [Overview page](https://dash.phasetwo.io/) and the [Clusters page](https://dash.phasetwo.io/clusters/), click **Create Cluster** in the top right.

At this time, only a Premium cluster can be created via self-serve, for Enterprise clusters, please contact [sales@phasetwo.io](mailto:sales@phasetwo.io). We will be releasing the ability to create Enterprise clusters very soon.

You must select a region, select an owning organization, and input a name to identify the cluster, and optionally provide a domain name you wish to use. Choose between Annual or Monthly billing.

![Keycloak Phase Two Dedicated Cluster Creation](/docs/dash-create-premium-cluster.png)

Once you have input the required information, you will be sent to [Stripe](https://stripe.com), our payment partner, to set up your billing account and payment method.

Following successful billing setup, you will be returned to the [Clusters view](https://dash.phasetwo.io/clusters) while your Cluster is provisioned. This is usually fast, but can take up to 24 hours in some cases. You will be notified by email and in the [Clusters view](https://dash.phasetwo.io/clusters) when the Cluster is live.

<img
src="/docs/dash-cluster-card.png"
alt="Keycloak Phase Two Dedicated Cluster Card"
style={{ width: "40%", borderRadius: "8px" }}
/>

### Regions

Dedicated clusters are currently available in the following regions using the self-service dashboard:

- AWS US East (N. Virginia) `us-east-1`
- AWS US West (Oregon) `us-west-2`
- AWS Europe (Frankfurt) `eu-central-1`

If you wish to launch a dedicated cluster in one of the following regions, we can provision it for you with an additional monthly fee. Please contact [sales@phasetwo.io](mailto:sales@phasetwo.io) for more information.

- AWS Asia-Pacific (Mumbai) `ap-south-1`
- AWS Asia-Pacific (Singapore) `ap-southeast-1`
- AWS Europe (Ireland) `eu-west-1`
- GCP Asia-Pacific (Jurong West) `asia-southeast1`
- GCP Europe (St. Ghislain) `europe-west1`
- GCP South America (São Paulo) `southamerica-east1`
- GCP US Central (Iowa) `us-central1`
- GCP US East (South Carolina) `us-east1`
- GCP US West (California) `us-west2`

#### Global clusters

For use cases that require global proximity to users and region failover behavior, we are currently in _beta_ for our global clusters. Global server load balancing provides geographic region affinity and failover to connect your users with the closest, available instances.

These clusters are backed by [CockroachDB](https://www.cockroachlabs.com/) multi-region clusters, which are hosted and operated by Cockroach Labs. There are two price tiers for global clusters, depending on your use of our shared CockroachDB clusters, or your own dedicated clusters.

Please contact [sales@phasetwo.io](mailto:sales@phasetwo.io) to talk to us about your global cluster use case.

### Custom domains

Support for custom domains is available for all cloud providers. In order to set up a custom domain that you already own, specify the desired domain when creating the cluster or visit the cluster config page for that specific cluster. Go to the Domains tab and add your desired domain.

Following addition of the domain and setup of your cluster, you will need to create 2 DNS records.

1. Validation record for certificates
2. Vanity record for your desired domain.

For all cloud providers use the following format for the vanity:

- Premium: CNAME `yourdomain.com` TO `{cluster_name}.{region}.{cloud_provider}.auth.ac`
- Enterprise: CNAME `yourdomain.com` TO `{cluster_name}.{region}.{cloud_provider}.global.auth.ac`

If your validation times out, remove the record and re-add it. Values should remain the same so you will not have to update DNS a second time.

<img
src="/docs/dash-cname-validated.png"
alt="Validated CNAME"
style={{ width: "60%", borderRadius: "8px" }}
/>

<img
src="/docs/dash-cname-pending-validation.png"
alt="Pending Validation CNAME"
style={{ width: "60%", borderRadius: "8px" }}
/>

Your cluster will be available from your custom domain within 24 hours of correct configuration of the DNS records.

### Migrating from a shared deployment

If you currently have a free, shared deployment, and you would like to migrate that deployment into your dedicated cluster, this can be done in a one-time operation. This is a batch operation, and will require 24 hours to process, so immediate migrations are not available. Please contact your customer success representative at [support@phasetwo.io](mailto:support@phasetwo.io) and indicate the deployment name you want to migrate, the target cluster, and the time you want to initiate the migration.

## Using a Cluster

Clusters are used much the same as our shared deployments. You can create up to 20 Realms per cluster.

### Creating Deployments in your Cluster

Once your Cluster has been provisioned, you can create Deployments as before, but you will open the create Deployment modal from the Cluster. Access to the admin console for those Realms is the same, using the _Open Console_ link next to each Deployment.

### Billing

Access to invoices and ability to change payment information can be accessed in the action menu next to the Cluster. This will take you to [Stripe](https://stripe.com), our payment partner, to access your billing history and update your payment information. This is restricted to users with the appropriate organization roles.

### Deleting a Cluster

Clusters that have reached the provisioing or active state cannot be immediately deleted. If you wish to delete your Cluster and end your subscription, you can schedule the deletion. Your cluster will be available until the end of your montly billing period. At that point, there will begin a 7-day grace period where the cluster will be available, and a 14-day grace period where the data will be preserved. Following that, the cluster will be de-provisioned and all data will be purged from our systems for security and compliance reasons.

#### Refunds

There are no refunds available for subscriptions paid on a monthly basis.

If you have paid annually, and you have more than one month left in your subscription period, you will be refunded a pro-rated amount following the end of the 14-day grace period. This refund will come through your payment method registered with Stripe.

## SLA

Please refer to our [Service Level Agreement](/company/sla) for more information.
