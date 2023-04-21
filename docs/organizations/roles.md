---
id: roles
title: Roles
---

Members of an organization can have role assignments that are specific to that organization. These are separate from Keycloak realm and client roles, and do not inherit from them. There are a set of default roles that control access to functionality within Phase Two, and additional roles can be added for your application purposes. Role creation, management and assigment can be done in the Organizations tab of the Admin UI.

### Default roles

The default roles can be assigned to users to give them access to view and manage organization data.

| Name | Access |
| --- | --- |
| view-organization | View organization details. |
| manage-organization | Update organization details. Delete the organization. |
| view-members | View memberships. |
| manage-members | Add and remove memberships. |
| view-roles | View roles and assignements. |
| manage-roles | Create and remove roles and assignments. |
| view-invitations | View outstanding invitations. |
| manage-invitations | Create and remove pending invitations. |
| view-identity-providers | View configured identity providers for SSO. |
| manage-identity-providers | Create, manage and remove identity providers for SSO. |
 
![](/docs/organizations-roles-list.png)
 
### Custom roles

Custom roles can be created in the Roles section of each organization in the Organizations tab of the Admin UI. It is important to note that a role is created for **each organization individually**. If you wish to have the same role name for multiple organization, it is recommended that you create them programmatically on organization creation.

![](/docs/organizations-roles-create.png)

### Adding roles to the token

It is possible to map organization roles into the access token, ID token or userinfo endpoint response using the **Organization Role** token claim mapper for OIDC. If you have users that will have a large number of organization memberships or roles per organization, it is recommended that you only add the claim to the userinfo endpoint response, as it may cause large token sizes. 

### API access

It is possible to [create](/api/create-organization-role), [update](/api/update-organization-role), [delete](/api/delete-organization-role) and [fetch all](/api/get-organization-roles) organization roles, as well as [grant](/api/grant-user-organization-role), [revoke](/api/revoke-user-organization-role), [verify](/api/check-user-organization-role) and [fetch all](/api/get-user-organization-roles) user assignments using the API.
