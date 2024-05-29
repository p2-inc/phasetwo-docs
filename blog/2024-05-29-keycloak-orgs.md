---
slug: orgs
title: Phase Two's Organizations, a Keycloak Multi-Tenant Extension and Keycloak's Upcoming Organization's Feature
description: Phase Two's Organization extensions bring single-realm multi-tenancy to Keycloak. Keycloak is officially developing a native version, but it's not a one-to-one replacement.
authors: phasetwo
tags:
  [
    open_source,
    release,
    keycloak,
    phase_two,
    organizations,
    multi_tenant,
    multi_tenancy,
  ]
---

Since we first released our (most) popular Keycloak extension, Keycloak [Organizations](https://phasetwo.io/product/organizations/) (Orgs) and made it available as open source on [Github](https://github.com/p2-inc/keycloak-orgs), the Keycloak maintainers have decided to build into native organization support.

This begs the question? What is different between Keycloak's upcoming organizations feature and the Phase Two Organization Extension?

To understand the difference it's important to first understand what the Phase Two Organization extension is. When we initially built this extension, we were struggling to solve the problem of "multi-tenant" Keycloak. During that process we learned a lot.

Other approaches that we tried and decided against were:

- One Realm for each tenant
- Using existing Keycloak Groups to model Organizations, Roles and Memberships

Each of these approaches had trade-offs of scale or frailty we found undesirable or unacceptable to meet our requirements. We proceeded to create the Organization extension now in use by hundreds of companies.

### What you get in Phase Two's Organization Extension

Within the extension, the following are treated in a first-class manner

1. **Organizations**: "tenants" or "customers" as commonly used. A Realm can have multiple Organizations.
1. **Memberships**: the relationship of Users to Organizations. Users may be members of multiple Organizations.
1. **Roles**: mechanisms of role-based security specific to an Organization, much like Keycloak Realm Roles and Client Roles. In addition to a set of standard roles related to Organization data visibility and management, administrators can create Roles unique to an organization. Users who are Members of Organizations can be granted that Organization's Roles.
1. **Invitations**: allow Users and non-Users to be invited to join an Organization. Invitations can be created by administrators or Organization members with permission.
1. **Domains**: email domains that are used to automatically select Organization IdPs using the optional authenticators. Included is a facility to validate customer domain ownership using DNS records.

### What does that translate to for my workflow and business use-cases?

Organizations are about empowering your customers and developers. They are about being able to segment customers into the right logical unit for interaction with your application. Effectively, they allow much more fine-grained ability to mimic the structure of a business in real-life within Keycloak, including permissions (roles, authorization).

1. Self-management for your customers through the [Admin Portal](https://phasetwo.io/product/adminportal/) to enable [membership management](https://phasetwo.io/docs/organizations/membership/) and [invitations](https://phasetwo.io/docs/organizations/invitations/).
1. Self-management for your developers via strong [API capabilities](https://phasetwo.io/api/category/organizations/)
1. Enterprise [SSO](https://phasetwo.io/docs/sso/) Login for each customer
1. Enhanced [roles](https://phasetwo.io/docs/organizations/roles/), permissions and authorization per customer.
1. [Domain-based association](https://phasetwo.io/docs/sso/setup/#associating-organizations) for registration and sign-up.
1. Attribute management to apply and manage metadata to members of the organization.
1. [Active organization](https://github.com/p2-inc/keycloak-orgs/blob/main/docs/active-organization.md) for the ability to switch between organizations (when part of many organizations).

### Main differences between Keycloak's Organization feature and Phase Two's Organzation extension

The Keycloak team at RedHat has [announced](https://github.com/keycloak/keycloak/discussions/23948) that they will be building an Organizations feature into the core product. We have previously offered to change our license and donate our extension to the project, but this was not considered. We participated in some of the public discussions around this feature, as well as provided feedback on their product features privately.

Work has begun, and they plan to [release](https://github.com/keycloak/keycloak/issues/28609) some base features with `experimental` support in Keycloak `25`. They expect a full feature set and promotion to `preview` by Keycloak `26`. There are a few GitHub issues that indicate the features they plan to release, but there is not a comprehensive requirements or product feature plan available publicly.

It has been our goal since building this extension to have this approach to multi-tenancy built into Keycloak, and we have proven through many customers/user that is serves a real need. We're excited to see what they will build, and are flattered they have used our extension for inspiration.

We have several hundred customers and users of this extension, and there have been many asking about the future of this extension, given the above. We've put together these notes, and will continue to update them as we learn more.

- First of all, **this extension is not going away**. In addition to the fact we have long-term support agreements with many of our customers, we also don't currently have a picture of what Keycloak's implementation will ultimately look like.
- We continue to believe that our (Phase Two's) value is in **making Keycloak easy to use**, primarily for an audience that is using it as a CIAM tool for enterprise SaaS applications. We have tailored the feature set to that audience, and will continue to build out tools on top of our own organizations extension, such as the [admin portal](https://github.com/p2-inc/phasetwo-admin-portal) and [IdP wizards](https://github.com/p2-inc/idp-wizard) to facilitate making your app enterprise-ready quickly.
- We plan **not** to enable native Keycloak organizations in our hosted product, and it will be set (in env vars) off in our Docker images.
- We have initiated a project to move our organizations (and other) admin UI tools **outside** of the Keycloak Admin UI. In addition to proving very time consuming because of the pace of breaking changes, we realized that we can iterate faster for customer value by building our own admin UI. More information on that coming soon.
- We will continue to participate in discussions with RedHat and the Keycloak maintainers to advocate for our customers' needs and the features we have proven over >3 years.
- **IF** there is eventually sufficient feature parity between native Keycloak organizations and this extension, we will provide a migration path

This will probably cause a lot of confusion as native Keycloak organizations is released. We appreciate the patience and support that customers and users have shown us, and we hope to continue to support you with [great Keycloak extensions and tools](https://github.com/p2-inc).
