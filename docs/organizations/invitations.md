---
id: invitations
title: Invitations
---

Invitations provide a way to allow Keycloak and organization administrators to invite new members to the organization. 
Invitations can be managed by the Keycloak admin in the Organizations tab of the Admin UI. You can enable organization administrators to manage invitations using the organization portal or building it into your application using the API.

![](/docs/organizations-invitations-invite.png)

### Setup

Invitees may or may not be existing users. If you choose to allow invitations to emails that are not represented by existing users, you must allow registration to your application, or use an authentication flow that automatically creates user accounts (such as [magic link](/docs/sso/magic-link) authentication). 

It is possible to pre-select any roles for a user by selecting in the Admin UI, or passing the `roles` array in the API. This will automatically add the user to the given roles upon user creation and acceptance of the invitation.

Invitees will receive an email indicating the realm, organization and inviter. It is possible to add a specific application redirect URI so that they will be redirected to a specific location in the application.

Following user creation and authentication, invitees will be prompted to accept or decline any outstanding invitations. In addition to any roles that were selected in the invitation, the user will automatically be added as a member to the inviting organization.

### API access

It is possible to [create](/api/create-an-invitation-to-an-organization), [remove pending](/api/remove-a-pending-invitation) and [fetch all outstanding](/api/get-organization-invitations) organization invitations using the API.
