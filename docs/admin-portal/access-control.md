---
id: access-control
title: Access Control
---

Access to components in the admin portal is dictated by the User's roles, both globally and within their organization.

### Profile

Profile access requires the User to have the following `account` Client roles. These are granted to all Users by default, so you don't need to change anything unless you wish to revoke these roles. These roles can be managed in the **Users** section of the Admin UI by selecting the User you wish to edit and navigating to their **Role mapping** tab.

- Details - requires `view-profile` to view, and `manage-account` to change profile data
- Security - requires `view-profile` to view, `manage-account` to change credentials, and `manage-account-links` to add or change any social or brokered logins

### Organization

Access to each of the Organization components is controlled by the User's member roles within the organization. There are no organization default roles, so you must grant these to Users after they are created and added to the organization. Member roles can be managed in the **Organizations** section of the Admin UI by selecting the Organization you wish to manage, finding the User in the **Members** tab, and managing their roles using the context menu on the right.

- Details: requires `view-organization` to view, and `manage-organization` to change
- Members & Invitations: requires `view-organization`
  - requires `view-members` to see members, and `manage-members` to remove or edit them
  - requires `view-roles` to see member roles
  - requires `view-invitations` to see pending invitations, and `manage-invitations` and `view-roles` to invite new users
  - requires `view-organization`, `manage-organization`, `view-identity-providers` and `manage-identity-providers` to use the SSO setup wizards and view/remove Identity Providers

### Setting Realm Attributes for Manual Control

Most of the visibility of functionality in the Portal is controlled by user permissions. However, it is also possible to control visibility through Realm Attributes.

When setting the attributes manually, the values are: 
| `_providerConfig.portal.profile.enabled` | Profile section (whole) | `true` |
| `_providerConfig.portal.profile.password.enabled` | Password update | `true` |
| `_providerConfig.portal.profile.twofactor.enabled` | 2fa create/update | `true` |
| `_providerConfig.portal.profile.activity.enabled` | Device activity | `true` |
| `_providerConfig.portal.profile.linked.enabled` | Linked accounts | `true` |
| `_providerConfig.portal.org.enabled` | Organizations section (whole) | `true` |
| `_providerConfig.portal.org.details.enabled` | Details edit | `true` |
| `_providerConfig.portal.org.members.enabled` | Members list | `true` |
| `_providerConfig.portal.org.invitations.enabled` | Invitations | `true` |
| `_providerConfig.portal.org.domains.enabled` | Domains | `true` |
| `_providerConfig.portal.org.sso.enabled` | SSO (requires idp-wizard extension) | `true` |
| `_providerConfig.portal.org.events.enabled` | Events | `true` |

For more on manually setting Realm Attributes for the Admin Portal, view the [Github repo](https://github.com/p2-inc/phasetwo-admin-portal/blob/main/README.md#visibility)