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

### Conceptualizing Multi-Tenant Implementation

We're going to use the following example system:

- 2 applications
- 2 tenants of each applications
- Single Keycloak realm
- Two Keycloak Organizations to represent the tenants
- Role names that match the applications

We can visualize this in the following diagram:

![System](/static/blog/multi_tenant/system.png)

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

![User Access](/static/blog/multi_tenant/user-access.png)

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

We'll be using Phase Two's [free hosted Keycloak](/hosting) to set up a deployment

### Why take this route instead of having multiple realms?
