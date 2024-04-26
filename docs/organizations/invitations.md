---
id: invitations
title: Invitations
---

Invitations provide a way to allow Keycloak and organization administrators to invite new members to the organization.
Invitations can be managed by the Keycloak admin in the Organizations tab of the Admin UI. You can enable organization administrators to manage invitations using the organization portal or building it into your application using the API.

![Keycloak Phase Two Organizations Invites](/docs/organizations-invitations-invite.png)

### Setup

Invitees may or may not be existing users. If you choose to allow invitations to emails that are not represented by existing users, you must allow registration to your application, or use an authentication flow that automatically creates user accounts (such as [magic link](/docs/authentication/magic-links) authentication).

It is possible to pre-select any roles for a user by passing the `roles` array in the API (pre-selecting in the Admin UI is currently not implemented). This will automatically add the user to the given roles upon user creation and acceptance of the invitation.

Adapt the [Authentication](https://github.com/p2-inc/keycloak-orgs?tab=readme-ov-file#authentication) according to your needs.

Note: Users must have a verified email address to accept an invitation, as it presents a security issue to allow any User to register with an unverified email address and claim the invitation.

Following user creation and authentication, invitees will be prompted to accept or decline any outstanding invitations. In addition to any roles that were selected in the invitation, the user will automatically be added as a member to the inviting organization.

### Options for user registration

#### Self-registration

This option requires either creating users on behalf of them before sending the invitation or enabling user registration on the realm.

Invitees will receive an email indicating the realm, organization and inviter. It is possible to add a specific application redirect URI so that they will be redirected to a specific location in the application.

#### Magic-Link

This approach uses another extension in order to provide a [magic link](https://github.com/p2-inc/keycloak-magic-link) that will first register the user, authenticate them, and then present them with the required action to accept the invitation. This approach is preferred when user registration is disabled. It requires the following steps:

- [Create a magic link](https://phasetwo.io/api/create-magic-link) using `force_create=true` (to create a user if one does not exist) and `send_email=false` to skip sending the magic link to the user.
- Use the returned magic link when [creating an invitation](https://phasetwo.io/api/add-organization-invitation). Set the `redirectUri={magic-link}`.

### API access

It is possible to [create](/api/add-organization-invitation), [remove pending](/api/remove-organization-invitation) and [fetch all outstanding](/api/get-organization-invitations) organization invitations using the API.
