---
id: environment-variables
title: Environment Variables
---

Configure your Keycloak cluster's environment variables directly from the Phase Two Dash. This allows you to set custom environment variables that can be used by your Keycloak instance and any custom extensions you may have deployed.

### Add and Remove Environment Variables

Go to your cluster's page > Config tab > Keycloak features.

#### Add a New Environment Variable

1. Click **Add Environment Variable** to add a new variable.
2. Choose if the variable will be plaintext or a secret. Once a secret is created, its value will be hidden and cannot be viewed again. It cannot be changed, only deleted.
3. Enter the **Name** and **Value** for the environment variable, then click **Save** to apply the changes.

<figure>
  <img src="/docs/dashboard/cluster-env-var-overview.png" className="max-w-2xl"  alt="Phase Two Dash - Cluster Environment Variable Overview" />
  <figcaption>Keycloak Features Environment Variable Overview</figcaption>
</figure>
<figure>
  <img src="/docs/dashboard/cluster-env-var-add.png" className="max-w-2xl"  alt="Phase Two Dash - Cluster Add Environment Variable" />
  <figcaption>Add Environment Variable</figcaption>
</figure>

#### Remove an Environment Variable

1. Click the **Trashcan** button next to the environment variable you wish to remove.
2. Confirm the deletion in the popup dialog by clicking **Remove**.

<figure>
  <img src="/docs/dashboard/cluster-env-var-remove.png" className="max-w-2xl"  alt="Phase Two Dash - Cluster Remove Environment Variable" />
  <figcaption>Remove Features Environment Variable</figcaption>
</figure>

### Applying Changes

After adding or removing environment variables, the Phase Two team will review and apply the changes to your cluster.
