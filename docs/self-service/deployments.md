---
id: deployments
title: Deployments
---

A Deployment is a Phase Two hosted instance of a Realm in a Phase Two enhanced Keycloak cluster. These clusters can be shared with other customers, or dedicated for customers in paid plans. Free, shared plans are allowed one Deployment per customer, and dedicated plans can create up to 20 Realms per cluster.

### Regions

Shared clusters are currently operating in the following regions:

- AWS US West (Oregon) `us-west-2`
- AWS Europe (Frankfurt) `eu-central-1`

Dedicated clusters can be launched in most AWS or GCP regions by request.

### Creating a Deployment

Once you have logged in the self-service tool, click on the **Deployments** menu item and select the **Create Deployment** button. You must input a name, choose a region, and (optionally) select a cluster if you are creating a Deployment in a dedicated cluster.

### Opening the console

Next to active Deployments in the list, you can select the **Open Console** link to create a login link and open it in another browser window.

![Phase Two Self Service Open Console Link](/docs/self-service-deployments-console-link.png)
