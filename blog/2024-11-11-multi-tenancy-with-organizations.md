---
slug: multi-tenancy-with-keycloak-organizations
title: Implement Multi-Tenancy Applications with Keycloak Organizations
description: Applications needing to leverage Keycloak to consolidate logins can leverage Keycloak Organizations.
authors: phasetwo
tags: [keycloak, phase_two, organizations, multitenant]
---

### Overview

A multi-tenant application is a software architecture where a single instance of an application serves multiple, distinct customer groups or “tenants.” Each tenant, often representing an organization or user group, shares the same underlying infrastructure and codebase but operates within its own securely isolated environment. This allows each tenant to have individualized data, configurations, and sometimes even unique customizations, while benefiting from a shared platform that reduces overall resource demands and maintenance. Multi-tenancy is commonly used in SaaS (Software as a Service) applications, enabling businesses to scale efficiently, lower costs, and streamline updates while ensuring that each tenant’s data and settings remain private and distinct from others within the same application. This approach is particularly valuable in enterprise applications, where companies may need to provide access to different organizations, departments, or customer groups within a single solution.

This post will cover a few things

- Concept of how to implement this with Keycloak and Phase Two's [Organization](https://phasetwo.io/product/organizations/) extension ([Github](https://github.com/p2-inc/keycloak-orgs)).
- Proof-of-concept implementation that will include how to configure a Keycloak instance with clients, organizations, roles, and example applications to consume these implementations.

We have also given a detailed talk at Keycloak Dev Day on [Multi-Tenancy within a Single Realm](./2024-04-10-keycloak-orgs-presentation.md).

The implementation, while not difficult, does require knowledge of how to use Keycloak. If you're unclear at any point, please reach out [sales@phasetwo.io](mailto:sales@phasetwo.io).

### Why use Organizations Instead of Multiple Realms?

Using Phase Two’s Keycloak Extension for [Organizations](https://phasetwo.io/product/organizations/) provides a more efficient and scalable way to implement multi-tenancy than managing multiple realms in Keycloak. Here’s why:

1. Resource Efficiency: Each realm in Keycloak creates isolated resources, which can lead to increased memory and CPU usage as the number of realms grows. By using a single realm with organizational support, you can maintain performance while still supporting multiple tenants.
2. Centralized Management: Managing numerous realms can become complex, especially for shared configurations and customizations. The extension allows you to manage users, roles, and configurations within a single realm, reducing overhead.
3. Simplified User Access Control: With organizations, you can easily segment users by tenant within the same realm. This allows for straightforward user and role management without needing to duplicate settings across realms.
4. Improved Scalability: As your application scales, the single-realm approach with organizational structures is more sustainable, reducing maintenance and potential errors. It supports a logical separation for tenants without the performance and management limitations of numerous realms.

Overall, the extension simplifies and optimizes Keycloak for multi-tenant applications, focusing on efficient resource usage and management scalability.

### Conceptualizing Multi-Tenant Implementation

We're going to use the following example system:

- 2 applications
- 2 tenants of each applications
- Single Keycloak realm
- Two Keycloak Organizations to represent the tenants
- Role names that match the applications

We can visualize this in the following diagram:

![System](/blog/multi_tenant/system.png)

In Keycloak, we match the system implementation by doing the following:

- Two Clients match the two Applications. More Clients added per tenant.
- Two Organizations match the two Tenants. This could be scaled out for additional tenants.
- One role per Tenant within each Organization.

If we break this down specifically with the names:

_Application system_

- Two applications: Zoo, Aquarium
- Two tenants: California, New York

_Keycloak system_

- Two clients: Zoo, Aquarium
- Two organizations: California, New York
- Two roles per for Org: zoo, aquarium

In order for users to then have access to the various Clients and Tenants, we would add them as members to the Organization, then assign them roles that match their access.

We can visualize this as follows:

![User Access](/blog/multi_tenant/user-access.png)

This represents following access:

- User 1
  - Zoo application, California tenant
  - Aquarium application, California tenant
  - Aquarium application, New York tenant
- User 2
  - Zoo application, California tenant
  - Zoo application, New York tenant

Users are granted roles to represent application access. Users are made members of an Organization to represent tenant access.

Consuming and implementing this representation can be done via the Organizations API on the [`/me` endpoint](https://phasetwo.io/api/get-me/).

### Sample Implementation

Now that we've discussed how the system is designed, let's work through an example of this application.

#### Keycloak Configuration

We'll be using Phase Two's [free hosted Keycloak](/hosting) to set up a deployment and associated organizations. Visit [Phase Two Dashboard](https://phasetwo.io/dashboard) to sign up for a free account and create a deployment. After you have created the deployment, click the "Open Console" link to go to the Keycloak deployment.

Next we'll configure Keycloak and then configure the applications.

##### Configuring Keycloak

1. Go to the Clients tab. We will create two Clients. Provide a `Client ID` of `aquarium` and `zoo` to each. Enter a value of `*` for `Valid redirect URIs` (don't use this for production).
2. Go to the Users tab. Add a user with a username of `jane`, first name of `jane`, and last name of `goodall`. Add a second user with a username of `jacques`, first name of `jacques`, and last name of `cousteau`.
3. Go to the Organizations tab. Create two Organizations. Name one `california` and the other `new york`. For each organization, create two roles: `aquarium` and `zoo`. For each organization, add the two user's created to them as members.
4. Inside the `california` organization, assign the `aquarium` role to the `jacques` user. Assign the `zoo` role to the `jane` user.
5. Inside the `newyork` organization, assign the `aquarium` role to both users. Assign the `zoo` role only to the `jane` user.

At this point we should have all we require for configuring our client applications as needed.

##### Configuring Client Applications

We won't go through all the steps required to build a client application in this post. We have a `nx` [monorepo](https://github.com/p2-inc/examples/tree/main/multitenant) generated for use where you can clone it and change the OIDC client config to speak to the correct applications.

Update the associated values make use of the Keycloak configuration you created above: realm name, clients, and so on. The app is setup already with a scaffold to pull the `/orgs/me` endpoint.

Once you have the application setup (check readme for more details), log in as the `jane` and `jacques` user to see the variation of which organization and roles they have access to. You'll see a variation of this:

![Organizations](/blog/multi_tenant/orgs.png)

### In Conclusion

Creating a multi-tenant application isn't necessarily easy, but it is well within the capability of Keycloak. If you end up leveraging our Organization's extension to support multi-tenancy, let us [know](mailto:sales@phasetwo.io).
