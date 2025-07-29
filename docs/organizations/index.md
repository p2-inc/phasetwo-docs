---
id: index
title: Organizations Docs
sidebar_label: Organizations
---

The Organizations feature represents an significant enhancement to standard Keycloak that allows business-to-business (B2B) customers to better manage their partners and customers, and to customize the ways that end-users access their applications. Phase Two customers can use Organizations to:

- Represent their business customers and partners in Phase Two and manage their membership.
- Represent attributes and roles, unique to business customers and partners.
- Provide streamlined invitations to Organizations.
- Allow the self-management of business customers' Identity Providers and Users using our hosted portal and setup wizards.
- Build administration capabilities into their products, using Organizations APIs, so that those businesses can manage their own organizations.

## Multi-Tenant Keycloak

Keycloak’s native architecture was not designed for high-scale multi-tenancy, as each realm is fully isolated. Creating and managing hundreds of realms quickly becomes a performance bottleneck and a maintenance burden.

Phase Two’s [Organizations](https://github.com/p2-inc/keycloak-orgs) feature addresses this by enabling true multi-tenancy within a single realm. This allows businesses to support many tenants without compromising performance or operational simplicity. Instead of duplicating configuration across realms, you can manage users, roles, and access control per organization in a unified structure.

We’ve explored this topic in more detail on our [blog](/blog/multi-tenancy-options-keycloak).

## Creating and managing organizations

Organizations can be managed in the Admin UI in the **Organizations** section. It is possible here to create Organizations, and manage their attributes, membership, invitations, roles, and associated identity providers.

![Keycloak Phase Two Organization Settings](/docs/organizations-index-details.png)

## Feature guides

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
