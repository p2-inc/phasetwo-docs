---
id: deployments
title: Realms (Deployments)
---

A Deployment is a Phase Two hosted instance of a Keycloak Realm in a Phase Two enhanced Keycloak cluster. These clusters can be shared with other customers, or dedicated for customers in paid plans. Free, shared plans are allowed one Deployment per customer, and dedicated plans can create up to 20 Realms per cluster.

## Regions

Shared clusters are currently operating in the following regions:

- AWS US West (Oregon) `us-west-2`
- AWS Europe (Frankfurt) `eu-central-1`

Dedicated clusters can be launched in most AWS or GCP regions by request.

## Creating a realm (deployment)

Once you have logged in the self-service tool, you have two options to [create a new realm](https://dash.phasetwo.io/realms/add-realm).

Single realms do not live in dedicated clusters but in the shared Phase Two infrastructure.

1. Open this link directly: [Add Realm](https://dash.phasetwo.io/realms/add-realm)
1. Click on the **Add Realm** button in the top right area of the "Overview" page.
<figure>
  <img src="/docs/dashboard/overview-add-realm.png" className="max-w-xl"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Add Realm from Overview</figcaption>
</figure>
1. Click on the [**Realms**](https://dash.phasetwo.io/realms) menu item and select the **Create Realm** button (top right).
<figure>
  <img src="/docs/dashboard/realms-create-realm.png" className="max-w-xl"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Add Realm from realms</figcaption>
</figure>
1. Fill out necessary details.You must input a name (unique), choose a region (`eu-central-1` or `us-west-2` at present), and assign it to an Organization for management. All users have an organization created by default upon sign-up.
<figure>
  <img src="/docs/dashboard/realms-add-realm.png" className="max-w-xl"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Add Realm information</figcaption>
</figure>

## Adding a realm to a cluster

Adding a realm to an existing cluster is available within the context of the specific cluster.

1. Visit the [cluster overview page](https://dash.phasetwo.io/clusters). Locate the cluster you want to add a realm to
<figure>
  <img src="/docs/dashboard/clusters.png" className="max-w-2xl"  alt="Phase Two Dash Cluster" />
  <figcaption>Cluster overview</figcaption>
</figure>
2. From the overview page, click "Add Realm" on the cluster card.
<figure>
  <img src="/docs/dashboard/clusters-add-realm.png" className="max-w-2xl"  alt="Phase Two Dash Cluster Overview Add Realm" />
  <figcaption>Add realm from cluster overview</figcaption>
</figure>
3. Or from the Cluster details page, click "Add Realm" in the top right.
<figure>
  <img src="/docs/dashboard/cluster-details-add-realm.png" className="max-w-2xl"  alt="Phase Two Dash Cluster Details" />
  <figcaption>Cluster details add realm</figcaption>
</figure>
4. Enter information and create the realm.
<figure>
  <img src="/docs/dashboard/cluster-add-realm.png" className="max-w-2xl"  alt="Phase Two Dash Cluster Details" />
  <figcaption>Cluster details add realm</figcaption>
</figure>

## Opening the admin console for a realm

From the [realms view](https://dash.phasetwo.io/realms) find the realm you want to use. Click the "Arrow" or **Console** button to create a login link and open it in another browser window. Or on the realm detail view, click **Console** in the rop right.

<figure>
  <img src="/docs/dash-v2-open-console-realms-view.png" className="max-w-xl" alt="Phase Two Realms View Open Console Link" />
  <figcaption>Open Console Link from Realm Card</figcaption>
</figure>

## Realm status

1. `Pending`: Realm is pending creation. It should resolve and be ready soon.
1. `Active`: Realm is ready to be used.
1. `Disabled`: Realm is currently unavailable.

If you experience an issue with a realm not working, please [contact support](mailto:support@phasetwo.io).

## Issues with access to the Admin Console

> The Open Console link doesn't work

Access to the Admin Console using the _Open Console_ link requires your Deployment Realm to have a user with the username `admin`, which is automatically created when the Deployment is provisioned. In order to maintain access using this mechanism, you **must not** change this username or its role mappings. Sometimes, if you have _Email as username_ set in your Realm, you might inadvertently change the username by changing the email. If you have lost access and need us to restore the admin account, please email [support@phasetwo.io](mailto:support@phasetwo.io).

You can also create a backup account to access your Deployment directly. Create an account with all `realm-management` Client Roles assigned, and you will be able to log in and use the direct link to the Admin Console below. You can also create admin accounts that are assigned restricted permissions (e.g. only managing users) by selecting a subset of the `realm-management` Client Roles.

## Direct Admin Console URL

You may choose to access the Admin Console directly for users with admin roles. Construct the URL as below:

```
https://{cluster-host}/auth/admin/{realm-name}/console

- cluster-host: The hostname of the Cluster (shared or dedicated)
- realm-name: The name of the Deployment
```

> I've lost access to the Admin Console!

In addition to the above issue with removing the `admin` account, another restriction is that you cannot change the name of your Deployment in the _Realm Settings_ of the Account Console. While it is technically supported in Keycloak, it can produce problems, and causes the metadata we use to log you in from the dashboard to be inaccurate. Because of this, we do not support changing Deployment names after they are created. If you need to change the name, you can delete your Deployment and create a new one.
