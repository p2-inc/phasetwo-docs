---
id: idp-wizard
title: IdP Wizard
---

The Organization IdP Wizard allows members of an organization with the right roles to self-manage their organization's SSO configuration. It provides guided setup for identity providers without requiring direct access to the full Keycloak admin UI.

Depending on how you configure the wizard, organization administrators can use it to set up:

- SAML identity providers
- OpenID Connect identity providers
- LDAP directory sync, when that option is enabled

This page focuses on the self-service organization flow. For the general administrator-focused overview, see [Wizards](../sso/wizards.md).

## What organization admins can do

With the appropriate organization roles, the wizard can be used to:

- Choose a supported vendor-specific wizard or fall back to a generic SAML, OpenID Connect, or LDAP flow
- Pick the protocol when a provider supports more than one option
- Create a new identity provider for the organization
- Review existing configurations from the wizard dashboard
- Validate a newly created SSO connection before enabling it for users
- Enable, disable, or delete an existing connection when the user's roles allow it
- Set up [IdP-initiated SSO](#idp-initiated-sso), so users can launch your application from their identity provider's dashboard

This is typically paired with verified organization domains and [automatic IdP redirection](./automatic-idp-redirection.md), so users can be routed to the correct provider during sign-in.

## Typical self-service flow

1. An organization administrator opens the wizard from the portal or from a time-limited wizard link.
2. They choose their provider, such as Okta, Entra ID, or a generic SAML or OpenID Connect flow.
3. If the provider supports more than one protocol, the wizard asks them to choose the connection type.
4. The wizard walks them through metadata, URLs, certificates, client credentials, and any vendor-specific steps.
5. On the final confirmation step, they create the identity provider.
6. They use the test sign-in link, when shown, in another browser or incognito window to validate the connection.
7. After validation, they can use verified organization domains plus the appropriate login flow to automatically redirect users to that provider.

## Supported wizard types

The current wizard implementation includes vendor-specific flows for:

- ADFS
- AWS
- Auth0
- Cloudflare
- CyberArk
- Duo
- Entra ID
- Google
- JumpCloud
- LastPass
- Okta
- OneLogin
- Oracle
- PingOne
- Salesforce

There are also generic flows for:

- SAML
- OpenID Connect
- LDAP

Some providers support multiple protocols in the wizard:

- Auth0: SAML and OpenID Connect
- Okta: SAML and LDAP
- Salesforce: SAML and OpenID Connect

:::info
The set of vendor-specific wizards available to your users depends on your distribution. Generic SAML, OpenID Connect, and LDAP flows are the baseline option.
:::

## Create an IdP Wizard link

There are two main ways to create an IdP Wizard link. Which one you choose depends on how you want to expose setup to your users.

#### Admin UI

In the Admin UI, in the Organizations tab, when you select an organization, the upper right context menu allows you to select "Create IdP Wizard link". This will create an IdP Wizard link for the **default** organization user. This is a user that is created by default when the organization is created for the purpose of executing administrative tasks for the organization. It is not associated with a real member of the organization. It has full privileges within the organization, so be careful who and how this link is distributed. It will be active for 1 day following creation.

<figure>
<img src="/docs/organizations/wizard/idp-wizard-link.png" alt="IdP Wizard link creation in Keycloak Admin UI" className="max-w-3xl" />
  <figcaption>Create an IdP Wizard Link</figcaption>
</figure>

#### API

You can programmatically create IdP Wizard links for your users with the API. This allows you to create a link for a specific user. The portal itself will take care of restricting access based on that user's organization permissions. Please refer to the API documentation to [create a link for the organization's admin portal](/api/create-portal-link). Because this is an expiring link, it is recommended that you do not create the link until it has been selected in your application.

[API Link](/api/create-portal-link)

## Testing and validating the connection

The final confirmation step in many SAML and OpenID Connect flows now includes a test sign-in link. This gives the administrator a safe way to verify that the new connection works before handing it over to end users.

- Copy the test link and open it in another browser profile or an incognito/private window.
- Do not open the test link in the same browser session as the wizard, or you may be signed out of the setup flow.
- Use the result of that test to confirm that your metadata, certificates, ACS URL, issuer, redirect URI, and mappers are correct.

When the wizard dashboard is enabled, existing identity providers can also show a validation state. New connections may appear as pending validation until that test flow has been completed.

## Domains and automatic redirection

The wizard creates the identity provider, but domain-based routing is a separate part of the overall setup.

To automatically redirect users to the right provider during login:

1. Set up the identity provider with the wizard.
2. Add and verify the organization's email domains.
3. Configure the login flow for [automatic IdP redirection](./automatic-idp-redirection.md).

For more on managing identity providers and associating them with organizations, see [Identity Providers](./identity-providers.md).

## IdP-initiated SSO

Most connections the wizard creates are service provider (SP) initiated: the user starts at your application, clicks sign in, and is sent to their identity provider. With IdP-initiated SSO, the user starts at their identity provider instead, for example by clicking an application tile on their Okta, PingOne, or Microsoft dashboard, and lands in your application already signed in.

Use IdP-initiated SSO when your customers expect to launch your application from their identity provider's app dashboard. You can offer it alongside a regular SP-initiated connection, but each IdP-initiated setup creates its own identity provider.

For background on how the flow works in Keycloak, and on its security trade-offs, see [Keycloak SAML IdP-Initiated Flow with Okta](/blog/keycloak-saml-identity-provider-idp-initiated-flow-with-okta).

### Available wizards

- **Generic SAML.** Choose the **SAML (IdP-initiated)** option when you pick the protocol for the generic SAML provider. IdP-initiated wizards are marked with an `idp-initiated` badge in the provider list.
- **Provider-specific wizards** for Okta, PingOne, and Entra ID, which walk through the IdP-initiated application setup in each provider's own console.
- **Generic OIDC**, for identity providers that sign users in with OpenID Connect but can still launch an application from a dashboard tile. See [IdP-initiated SSO with an OIDC identity provider](#idp-initiated-sso-with-an-oidc-identity-provider).

IdP-initiated setup works both realm-wide and for a single organization, in the same way as the other wizards.

### What the wizard creates

Keycloak only accepts an unsolicited SAML response when it is addressed to a specific client, so each IdP-initiated setup creates a pair of objects that share an alias:

| Object            | Name                    | Purpose                                                                                                                              |
| ----------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Identity provider | `{alias}`               | Trusts your customer's identity provider and maps its attributes to Keycloak users, like any other wizard-created identity provider. |
| SAML client       | `idp-initiated-{alias}` | Receives the IdP-initiated login and decides where to send the user afterward (the target application).                              |

On the confirmation step, the wizard creates the client first, then the identity provider, then the attribute mappers. If a step fails and you retry, the wizard reuses the client from the earlier attempt instead of creating a duplicate.

Your customer configures their identity provider to post SAML responses to this assertion consumer service (ACS) URL, which the wizard shows on its first step:

```
https://{server}/realms/{realm}/broker/{alias}/endpoint/clients/idp-initiated-{alias}
```

This URL differs from the ACS URL of a regular SP-initiated SAML connection: the `/clients/idp-initiated-{alias}` suffix tells Keycloak which client the login is for.

### Choosing the target application

After the user signs in, Keycloak sends them to the target application you choose in the wizard:

- **OIDC application.** Enter the application's home page. This fits most modern applications: Keycloak redirects the user to the home page, and the application then signs them in with OpenID Connect as usual. Because the user already has a Keycloak session, that sign-in completes without another prompt.
- **SAML application (Redirect binding).** Enter the application's ACS URL. Keycloak sends the SAML response to the application with the HTTP-Redirect binding.
- **SAML application (POST binding).** Enter the application's ACS URL. Keycloak posts the SAML response to the application with the HTTP-POST binding. Choose this when the application only accepts POST, which is common.

:::note
With an OIDC application as the target, Keycloak still delivers a SAML response, so it arrives as a parameter on the home page URL. The application doesn't need it and should ignore it, and ideally remove it from the address bar, before starting its normal OpenID Connect sign-in.
:::

### Steps in the generic SAML wizard

1. **Create a SAML application** in your identity provider. Copy the IdP-initiated ACS URL and the Entity ID that the wizard shows into the application's settings.
2. **Provide the identity provider's metadata**, from a URL, a file, or manual entry.
3. **Choose the target application**: an OIDC application's home page, or a SAML application's ACS URL with the Redirect or POST binding.
4. **Map attributes** from the identity provider to Keycloak user attributes.
5. **Assign users** to the application in your identity provider.
6. **Confirm** to create the client, the identity provider, and the mappers.

The provider-specific wizards follow the same shape, with instructions tailored to each provider's console.

### IdP-initiated SSO with an OIDC identity provider

OpenID Connect has no equivalent of an unsolicited SAML response, so with the generic OIDC wizard the upstream identity provider doesn't post anything to Keycloak. Instead, its application tile (often called the "initiate login URI") points at Keycloak's IdP-initiated URL for the paired client, with a hint that names the identity provider:

```
https://{server}/realms/{realm}/protocol/saml/clients/idp-initiated-{alias}?kc_idp_hint={alias}
```

When the user clicks the tile, Keycloak sends them straight to the OIDC identity provider to sign in, then on to the target application. This relies on the **Identity Provider Redirector** step in the realm's browser flow, which honors `kc_idp_hint`. The stock browser flow includes it; if you have customized the browser flow, make sure it is still there.

### Behavior to be aware of

- **Existing sessions.** A user who already has a Keycloak session goes straight to the target application without visiting the identity provider again. This is normal single sign-on behavior.
- **Deleting the connection.** Deleting the identity provider, from the wizard dashboard, the organization API, or the admin console, also deletes its `idp-initiated-{alias}` client, and deleting the client also deletes the identity provider. Unlinking the identity provider from an organization keeps both.
- **Organization admins.** In organization mode, the wizard creates the client through the organization API, which only accepts IdP-initiated SAML clients. Organization admins need the organization's `manage-identity-providers` role; realm-wide setup needs the `manage-clients` and `manage-identity-providers` realm-management roles.

## Setting realm attributes for manual control

There are reasonable defaults, but the wizard behavior depends on a small set of realm attributes. See the [`idp-wizard` repository](https://github.com/p2-inc/idp-wizard?tab=readme-ov-file#configuration) for the source configuration reference.

| Realm attribute key                             | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_providerConfig.wizard.apiMode`                | `onprem`    | `onprem` or `cloud`. `onprem` uses the Keycloak Admin APIs to set up an Identity Provider, so the user must have the correct `realm-management` roles. `cloud` uses the Phase Two Organizations API, so the user must have membership in an organization with the correct organization roles. A "picker" will be shown to the user if they have both and/or roles in more than one organization. |
| `_providerConfig.wizard.emailAsUsername`        | `false`     | When building Identity Provider mappers, should the IdP email address be mapped to the Keycloak `username` field.                                                                                                                                                                                                                                                                                |
| `_providerConfig.wizard.enableDashboard`        | `true`      | Show a minimal dashboard showing the state of the setup.                                                                                                                                                                                                                                                                                                                                         |
| `_providerConfig.wizard.enableDirectorySync`    | `true`      | Show Directory Sync section.                                                                                                                                                                                                                                                                                                                                                                     |
| `_providerConfig.wizard.enableGroupMapping`     | `true`      | Currently does nothing.                                                                                                                                                                                                                                                                                                                                                                          |
| `_providerConfig.wizard.enableIdentityProvider` | `true`      | Show Identity Provider section.                                                                                                                                                                                                                                                                                                                                                                  |
| `_providerConfig.wizard.enableLdap`             | `true`      | Allow LDAP config.                                                                                                                                                                                                                                                                                                                                                                               |
| `_providerConfig.wizard.enableScim`             | `true`      | Allow SCIM config. (not currently used)                                                                                                                                                                                                                                                                                                                                                          |
| `_providerConfig.wizard.trustEmail`             | `false`     | Toggle _trust email_ in the IdP config.                                                                                                                                                                                                                                                                                                                                                          |
| `_providerConfig.assets.logo.url`               | _none_      | URL for logo override. Inherited from `keycloak-orgs` config so we can use the same logo.                                                                                                                                                                                                                                                                                                        |
| `_providerConfig.wizard.appName`                | `Phase Two` | App name to appear in the HTML title.                                                                                                                                                                                                                                                                                                                                                            |

### Practical guidance

- Set `_providerConfig.wizard.apiMode` to `cloud` when organization administrators should manage their own connections through the portal or a portal link.
- Use `_providerConfig.wizard.enableIdentityProvider`, `_providerConfig.wizard.enableDirectorySync`, and `_providerConfig.wizard.enableLdap` to control which setup paths appear.
- Use `_providerConfig.wizard.enableDashboard` if you want users to see existing configurations and validation status from within the wizard experience.
- Use `_providerConfig.wizard.emailAsUsername` and `_providerConfig.wizard.trustEmail` to influence the broker configuration that the wizard creates.
- Use `_providerConfig.assets.logo.url` and `_providerConfig.wizard.appName` to white-label the wizard for your own product or customer onboarding flow.
- `_providerConfig.wizard.enableGroupMapping` and `_providerConfig.wizard.enableScim` are present in the configuration model, but they are not currently active setup paths in the wizard UI.
