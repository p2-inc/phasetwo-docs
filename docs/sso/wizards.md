---
id: wizards
title: Wizards
---

The identity provider setup wizards give you a guided way to configure SSO and directory sync without working directly in the full Keycloak UI. They are the same flows used in the Admin Portal and in the Phase Two Connect onboarding experience.

These wizards are useful when you are onboarding a customer alongside their IT administrator, when you want a more repeatable setup path for common providers, or when you need to hand off setup to organization administrators without exposing the full admin console.

## What the wizards cover

- Guided setup for SAML and OpenID Connect identity providers
- Optional directory sync setup using LDAP
- Vendor-specific setup guides for common enterprise identity platforms
- Generic SAML, OpenID Connect, and LDAP fallback wizards when a vendor-specific flow is not available
- A final validation step so you can test the connection before rolling it out to end users

:::info
The exact set of available wizards depends on your distribution. The base/open distribution includes the generic SAML, OpenID Connect, and LDAP flows. Licensed Phase Two Connect distributions may also include vendor-specific wizards.
:::

## Supported vendors

Based on the current `idp-wizard` implementation, vendor-specific guides are available for:

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

Some providers expose more than one protocol in the wizard:

- Auth0: SAML and OpenID Connect
- Okta: SAML and LDAP
- Salesforce: SAML and OpenID Connect

If your provider is not listed, use one of the generic protocols instead.

## Launching the wizards as an administrator

From the Admin UI, go to the **Clients** section of the realm where you want to add the identity provider. In the `idp-wizard` client, click the link in the **Home URL** column. This opens the wizard in a separate browser window as your current administrator.

In this mode, the wizard is typically running in `_providerConfig.wizard.apiMode=onprem`, which means it uses the Keycloak Admin API to create or update the identity provider. The user launching it should have the required `realm-management` permissions.

After the wizard completes:

1. Create the identity provider on the final confirmation step.
2. Return to the Admin UI and review it under **Identity providers**.
3. If you are using Organizations, associate that identity provider with the correct organization in the **Organizations** section.

## Testing a new SSO connection

Many SAML and OIDC flows now include a test sign-in link on the final confirmation step. Use that link to verify the configuration before you consider setup complete.

- Copy the link and open it in a different browser profile or an incognito/private window.
- Do not open the test link in the same browser session you are using for the wizard, or you may sign yourself out mid-setup.
- If the test succeeds, return to the wizard or admin console and finish rollout.

This test flow is especially useful for catching certificate, ACS URL, issuer, redirect URI, or mapper mistakes before end users see the new SSO option.

## Launching the wizards for an organization

For self-service organization setup, including portal links, existing configuration status, and organization-specific validation, see the [IdP Wizard documentation](../organizations/idp-wizard.md).
