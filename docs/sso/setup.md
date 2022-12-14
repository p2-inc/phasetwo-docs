---
id: setup
title: Setup
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

Once you have setup the authentication flow for SSO as described in the previous section [SSO](../authentication/sso), you can create connections to the Organizations' identity providers and then associating them with the Organizations they represent.

### Configuring identity providers

In order to manually setup an identity provider to be used for single sign-on for an organization, in the Admin UI, you can select the **Identity providers** section. Using the **Add provider** button, you can add `SAML` or `OpenID Connect` types. There is further Keycloak documentation describing all of the options in detail.
- [SAML](https://www.keycloak.org/docs/latest/server_admin/index.html#saml-v2-0-identity-providers)
- [OpenID Connect](https://www.keycloak.org/docs/latest/server_admin/index.html#_identity_broker_oidc)

It is also possible to use the identity provider setup wizards, described in the next section: [Wizards](wizards).

### Associating organizations

If you have not already created an Organization, check out the section on [Organizations](../organizations). Once you have created an organization, navigate to that organization's **Identity provider** tab and select the identity provider you created that you wish to associate with the organization.

This will setup the identity provider to automatically associate Users who authentication with that identity provider with the associated organization, and allow the identity provider to be discovered during the authentication process using the domain of the User's email address.