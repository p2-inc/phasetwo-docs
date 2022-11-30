---
id: index
title: Admin Portal
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

Self-service management of User Profile and Organization

The Phase Two Admin Portal allows you to offer self-management features to your customers from within your application with almost no code. A portal link can be generated in your application that will take a logged in user to the Admin Portal.

### Access control

Access to components in the admin portal is dictated by the User's roles, both globally and within their organization.

#### Profile

Profile access requires the User to have the following `account` Client roles

#### Organization

Access to each of the Organization components is controlled by the User's member roles within the organization.
- Details: requires `view-organization` to view, and `manage-organization` to change
- Members & Invitations: requires `view-organization`
    - requires `view-members` to see members, and `manage-members` to remove or edit them
    - requires `view-roles` to see member roles
    - requires `view-invitations` to see pending invitations, and `manage-invitations` and `view-roles` to invite new users
    - requires `view-organization`, `manage-organization`, `view-identity-providers` and `manage-identity-providers` to use the SSO setup wizards and view/remove Identity Providers

### Component guides

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
