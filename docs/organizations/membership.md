---
id: membership
title: Membership
---

Users who are associated with an organization are considered members. The relationship of users to organizations can be managed in the Organizations tab of the Admin UI. [Invitations](invitations) also provide a way to allow organization administrators to invite new members to the organization. If you are associating an identity provider with an organization, all users who authenticate through an associated identity provider will automatically be added as members to the organization.

![](/docs/organizations-membership-list.png)

### Anonymous organization administrator

When an organization is created, you will notice that a user is created with the username `org-admin-{org_id}`. This is a machine user that can be used for the purpose of sending admin portal links over email to *known, trusted* administrators who don't otherwise have access through the application. It is recommended that you do not edit this user or make any changes to its setup, or it could compromise the security of your application. 

### Adding organizations to the token

It is possible to map organization membership into the access token, ID token or userinfo endpoint response using the **Organization Role** token claim mapper for OIDC. It is possible to configure the mapper to exclude the roles. If you have users that will have a large number of organization memberships or roles per organization, it is recommended that you only add the claim to the userinfo endpoint response, as it may cause large token sizes. 

### API access

It is possible to [create](/api/add-organization-member), [verify](/api/check-organization-membership), [delete](/api/remove-organization-member) and [fetch all](/api/get-organization-memberships) organization memberships using the API.
