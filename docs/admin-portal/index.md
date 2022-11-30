---
id: index
title: Admin Portal
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

The Phase Two Admin Portal allows you to offer self-management of User Profile and Organization features to your customers from within your application with almost no code. A portal link can be generated in your application that will take a logged in user to the Admin Portal.

### Access control

Access to components in the admin portal is dictated by the User's roles, both globally and within their organization.

#### Profile

Profile access requires the User to have the following `account` Client roles. These are granted to all Users by default, so you don't need to change anything unless you wish to revoke these roles. These roles can be managed in the **Users** section of the Admin UI by selecting the User you wish to edit and navigating to their **Role mapping** tab.
- Details - requires `view-profile` to view, and `manage-account` to change profile data
- Security - requires `view-profile` to view, `manage-account` to change credentials, and `manage-account-links` to add or change any social or brokered logins

#### Organization

Access to each of the Organization components is controlled by the User's member roles within the organization. There are no organization default roles, so you must grant these to Users after they are created and added to the organization. Member roles can be managed in the **Organizations** section of the Admin UI by selecting the Organization you wish to manage, finding the User in the **Members** tab, and managing their roles using the context menu on the right.
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
