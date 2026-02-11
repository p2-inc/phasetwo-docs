---
id: identity-providers
title: Organization Identity Providers
sidebar_label: Identity Providers
---

Identity providers (IdPs) can be associated with an organization for the purpose of directing users to authenticate with the IdP via a verified email domain, and for automatically granting membership to users who authenticate with that IdP.

### Associating an identity provider

There are two ways that an IdP can be associated with an organization.

#### Admin portal

If you have activated the organizations and SSO portions of the admin portal, members of the organization with the appropriate roles can set up their IdPs on their own. When they create and manage IdPs this way, they will be automatcially associated with the user's organization.

#### Admin UI

The admin UI contains an **Identity providers** section where full details of all IdPs can be created and managed. Also, the IdP wizards that are available to your organization administrators through the admin portal are also available to site administrators by navigating to `https://{host}/auth/realms/{realm}/wizard/`.

Because IdPs created using the admin UI or wizards are done by a site administrator, there is no organization associated by default. To do so, you can navigate to the **Organizations** section, select the organization for assignment and select the **Identity providers** tab. Making the association here will create the necessary relationships with the organization.

![Keycloak Phase Two Organizations IDP Association](/docs/organizations-idps-associate.png)

### Verified domains

The purpose of associating domains with an organization is to allow identity providers to be conditionally shown based on email domain of a user who is logging in. In the **Settings** tab of each organizations, you can add multiple domains. When an authentication flow is configured properly to allow for redirection based on email domain, these are the domains that will be used to look up the associating identity provider.

![Keycloak Phase Two Organizations Domains](/docs/organizations-idps-domains.png)

### Adding IdP and organization information to the token

Following a successful login using an IdP associated with an organization, a few values will be set in what are called "User Session Notes".

- `org_id` - The ID of the organization associated with the IdP.
- `identity_provider` - The IdP alias of the broker used to perform the login.
- `identity_provider_identity` - The IdP username of the currently authenticated user.

These are values that survive the duration of a user login session, and can be used in token mappers. In order to add such a mapper in the admin UI, navigate to the client you are using, select the **Client scopes** tab, select the `{client}-dedicated` scope link, select the _Mappers_ tab and configure a new mapper of type `User Session Notes`. You can choose the _Token Claim Name_ that you require, and configure which tokens it is included.

![Keycloak Phase Two Organizations Protocol Mapper](/docs/organizations-idps-mapper.png)

### Handling user in multiple organization, each with a specific IdP

When using organization specific IdP and users are part of multiple organizations, it may lead to a situation where a user is authenticated against IdP `acme-corp-idp` which is used by organization `acme-corp` while accessing organization `beta-corp` assets. In this case you might want to force the user to authenticate against `beta-corp-idp` while remaining authenticated against `acme-corp-idp` if they wish to switch back to `acme-corp` assets.

This can be achieved by using `prompt=login` as the `idpHint` to force the user to log into the `beta-corp-idp`. This is described in more detail in the [SSO documentation](/docs/sso/sso-without-auth/#add-identity-provider-redirect-to-your-application).

### Assigning multiple IdPs to an organization

On the main realms page, under **Manage Settings**, that "Multiple IDPs enabled" is selected in the modal.

![Organizations Multiple IdPs enabled](/docs/organizations/identity-providers/organizations-multiple-idps.png)

Once this is enabled, you can assign multiple IdPs to an organization by navigating to the **Identity providers** tab of the organizations details and using the **Add identity provider** button.

![Organizations Details Identity Providers](/docs/organizations/identity-providers/organization-details-identity-providers.png)

### API access

It is possible to manage all aspects of the identity provider and its relationship to the organization using the [API](/api/phase-two-admin-rest-api). You will notice that the method in the Phase Two API are similar to those in the Keycloak Admin API. If you are building software that is targeted at organization administrators, you should use the Phase Two API, as it uses the permission model for organizations, and is not compatible with the Keycloak Admin API.
