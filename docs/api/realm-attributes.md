---
id: realm-attributes
title: Realm Attributes
sidebar_label: Realm Attributes
description: Reference for every _providerConfig realm attribute read by the Phase Two extensions, with the owning extension, allowed values and default for each key.
---

Realm attributes are key-value pairs stored on a realm. The Phase Two extensions use them for per-realm configuration: branding, Admin Portal visibility, IdP wizard behavior, organization settings, event listeners and email. Every key they read starts with `_providerConfig.`.

This page lists all of those keys. Each one was checked against the source of the extension that reads it. Where another page explains a feature in more depth, the section links to it.

## Setting attributes

Attribute values are always strings. A boolean is the string `true` or `false`, and a number is its decimal form. An unset attribute takes the default shown in the tables below.

### Admin UI

Set the Admin theme (**Realm settings** > **Themes**) to `phasetwo-ui` and refresh the page. **Realm settings** then has an **Attributes** tab. The tab only shows keys that start with `_providerConfig.`, and new or edited keys must use that prefix.

Most branding and portal keys also have a form in the **Styles** panel, and the organization keys have one under **Organizations** > **Manage Settings**. Prefer those forms where they exist, because they validate the values.

### Admin REST API

Attributes are part of the realm representation, so you can set them with the [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html#_realms_admin_resource), `kcadm.sh` or a realm import. A `PUT` that includes `attributes` replaces the realm's whole attribute map. Fetch the realm, merge your change into `attributes`, and put the result back:

```bash
curl -s -H "Authorization: Bearer $TOKEN" "$KC/admin/realms/$REALM" \
  | jq '.attributes["_providerConfig.portal.org.events.enabled"] = "false"' \
  | curl -s -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      -d @- "$KC/admin/realms/$REALM"
```

## Logo and icons

These three keys are shared. Set them once and every surface that shows a logo uses them.

| Key                                  | Value | Default                  | Read by                                                    |
| ------------------------------------ | ----- | ------------------------ | ---------------------------------------------------------- |
| `_providerConfig.assets.logo.url`    | URL   | The theme's bundled logo | Themes (login and account pages), Admin Portal, IdP wizard |
| `_providerConfig.assets.favicon.url` | URL   | The bundled favicon      | Themes, Admin Portal                                       |
| `_providerConfig.assets.appicon.url` | URL   | The bundled app icon     | Themes, Admin Portal (shown when the sidebar is collapsed) |

Extensions: [keycloak-themes](https://github.com/p2-inc/keycloak-themes), [phasetwo-admin-portal](https://github.com/p2-inc/phasetwo-admin-portal), [idp-wizard](https://github.com/p2-inc/idp-wizard). More detail: [Customizing the UI](../getting-started/customizing-ui.md#manually-by-realm-attributes).

## Brand tokens

Extensions: [keycloak-themes](https://github.com/p2-inc/keycloak-themes) (the `phasetwo-ui` login theme and email templates) and [phasetwo-admin-portal](https://github.com/p2-inc/phasetwo-admin-portal). More detail: [Customizing the UI](../getting-started/customizing-ui.md#manually-by-realm-attributes) and [Admin Portal configuration](../admin-portal/configuration.md#theme-tokens).

Each token is one attribute named `_providerConfig.assets.theme.v2.<token>`. The login theme, the Admin Portal and the email templates all read the same attributes.

A color token accepts a `#rgb` or `#rrggbb` hex value, a CSS color keyword, or a single `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()` or `oklch()` function. A value in any other form is ignored. Every color token also has a dark-mode override named `dark<Token>`, for example `_providerConfig.assets.theme.v2.darkBackground`.

| Token                 | Login default (light / dark) | Portal default (light / dark) |
| --------------------- | ---------------------------- | ----------------------------- |
| `background`          | `#ffffff` / `#0a0a0a`        | `#ffffff` / `#09090b`         |
| `foreground`          | `#0a0a0a` / `#fafafa`        | `#09090b` / `#fafafa`         |
| `primary`             | `#3b82f6` / `#3b82f6`        | `#1570c2` / `#1570c2`         |
| `primaryForeground`   | `#ffffff` / `#ffffff`        | `#ffffff` / `#ffffff`         |
| `secondary`           | `#60a5fa` / `#1e3a5f`        | `#f4f4f5` / `#27272a`         |
| `secondaryForeground` | `#0a0a0a` / `#fafafa`        | `#18181b` / `#fafafa`         |
| `muted`               | `#f4f4f5` / `#27272a`        | `#f4f4f5` / `#27272a`         |
| `mutedForeground`     | `#71717a` / `#a1a1aa`        | `#71717a` / `#a1a1aa`         |
| `border`              | `#e4e4e7` / `#3f3f46`        | `#e4e4e7` / `#27272a`         |

The remaining tokens have no fixed default:

| Token              | Value          | When unset                                        |
| ------------------ | -------------- | ------------------------------------------------- |
| `card`             | Color          | Follows `background`                              |
| `cardForeground`   | Color          | Follows `foreground`                              |
| `accent`           | Color          | Follows `muted`                                   |
| `accentForeground` | Color          | Follows `foreground`                              |
| `input`            | Color          | Follows `border`                                  |
| `ring`             | Color          | Follows `primary`                                 |
| `radius`           | CSS length     | `0.625rem` on login pages, `0.5rem` in the portal |
| `fontFamily`       | CSS font stack | The surface's own font stack                      |

When `primary` or `secondary` is set and its dark override is not, dark mode uses the light value. When `primaryForeground` or `secondaryForeground` is unset and its background is set, a readable near-black or white is chosen. Email templates only use tokens you have set explicitly, and never the defaults above.

## Login theme

Extension: [keycloak-themes](https://github.com/p2-inc/keycloak-themes). More detail: [Customizing the UI](../getting-started/customizing-ui.md#manually-by-realm-attributes).

These are the older login color keys. In the `phasetwo-ui` theme each one is the fallback for a brand token, used only when the matching `theme.v2` attribute is unset.

| Key                                                   | Value | Default | Description                                                              |
| ----------------------------------------------------- | ----- | ------- | ------------------------------------------------------------------------ |
| `_providerConfig.assets.login.primaryColor`           | Color | None    | Fallback for `primary`. Also sets the PatternFly primary and link colors |
| `_providerConfig.assets.login.secondaryColor`         | Color | None    | Fallback for `secondary`. Also sets the PatternFly hover colors          |
| `_providerConfig.assets.login.backgroundColor`        | Color | None    | Fallback for `background`                                                |
| `_providerConfig.assets.login.primaryForegroundColor` | Color | None    | Fallback for `primaryForeground`                                         |
| `_providerConfig.assets.login.css`                    | CSS   | None    | Appended to the login stylesheet after everything else                   |

Each of the four color keys has a dark-mode form with a `-dark` suffix, such as `_providerConfig.assets.login.primaryColor-dark`. It is the fallback for the matching `dark<Token>` attribute.

## Email

Extension: [keycloak-themes](https://github.com/p2-inc/keycloak-themes). More detail: [Email](../getting-started/email.md#realm-attributes).

| Key                                                  | Value           | Default                       | Description                                                                                   |
| ---------------------------------------------------- | --------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `_providerConfig.assets.logo.base64`                 | Data URI        | The Phase Two logo            | Logo for `phasetwo-ui` emails, for example `data:image/png;base64,...`                        |
| `_providerConfig.assets.email.footer.line1`          | Text            | The realm's display name      | First footer line                                                                             |
| `_providerConfig.assets.email.footer.line2`          | Text            | None                          | Second footer line                                                                            |
| `_providerConfig.theme.email.templates.<template>`   | Template source | The selected theme's template | Overrides one email template, for example `...templates.html/password-reset.ftl`              |
| `_providerConfig.theme.email.messages.<message-key>` | Text            | The theme's message           | Overrides one message bundle entry used by email templates                                    |
| `_providerConfig.messages.email.<message-key>`       | Text            | The theme's message           | Older form of the key above. Still read. The `theme.email.messages` form wins if both are set |
| `_providerConfig.theme.email.parent`                 | Theme name      | `mustache`                    | Base theme for the legacy `attributes` and `attributes-v2` email themes                       |

See [Content templates](../getting-started/email.md#content-templates) for what a template override should contain.

## Admin Portal

Extension: [phasetwo-admin-portal](https://github.com/p2-inc/phasetwo-admin-portal). More detail: [Access control](../admin-portal/access-control.md#setting-realm-attributes-for-manual-control) and [Admin Portal configuration](../admin-portal/configuration.md).

### Visibility

Each key shows or hides one part of the portal. The value must be exactly `true` to enable a section. Any other value disables it. User permissions still apply on top of these flags.

| Key                                                   | Default | Controls                                                       |
| ----------------------------------------------------- | ------- | -------------------------------------------------------------- |
| `_providerConfig.portal.profile.enabled`              | `true`  | The whole profile section                                      |
| `_providerConfig.portal.profile.password.enabled`     | `true`  | Password update                                                |
| `_providerConfig.portal.profile.twofactor.enabled`    | `true`  | Two-factor setup                                               |
| `_providerConfig.portal.profile.passwordless.enabled` | `true`  | Passwordless (WebAuthn) credentials                            |
| `_providerConfig.portal.profile.activity.enabled`     | `true`  | Device activity                                                |
| `_providerConfig.portal.profile.linked.enabled`       | `true`  | Linked accounts. Also requires identity providers in the realm |
| `_providerConfig.portal.org.enabled`                  | `true`  | The whole organizations section                                |
| `_providerConfig.portal.org.details.enabled`          | `true`  | Organization details                                           |
| `_providerConfig.portal.org.members.enabled`          | `true`  | Members list                                                   |
| `_providerConfig.portal.org.invitations.enabled`      | `true`  | Invitations                                                    |
| `_providerConfig.portal.org.domains.enabled`          | `true`  | Domains                                                        |
| `_providerConfig.portal.org.sso.enabled`              | `true`  | SSO setup. Requires the IdP wizard                             |
| `_providerConfig.portal.org.events.enabled`           | `true`  | Events                                                         |
| `_providerConfig.portal.org.attributes.enabled`       | `true`  | Organization attributes editor                                 |

### Styles

The portal takes its colors from the [brand tokens](#brand-tokens) and its logo from the [shared logo keys](#logo-and-icons). These keys are specific to the portal:

| Key                                               | Value | Default | Description                                                               |
| ------------------------------------------------- | ----- | ------- | ------------------------------------------------------------------------- |
| `_providerConfig.assets.portal.css`               | CSS   | None    | Appended after the generated variables, so it overrides them              |
| `_providerConfig.assets.portal.primaryColor700`   | Color | None    | Legacy. Fallback for the `primary` token when `theme.v2.primary` is unset |
| `_providerConfig.assets.portal.primaryColor100`   | Color | None    | Legacy. Read, but no longer affects rendering                             |
| `_providerConfig.assets.portal.primaryColor200`   | Color | None    | Legacy. Read, but no longer affects rendering                             |
| `_providerConfig.assets.portal.primaryColor400`   | Color | None    | Legacy. Read, but no longer affects rendering                             |
| `_providerConfig.assets.portal.primaryColor500`   | Color | None    | Legacy. Read, but no longer affects rendering                             |
| `_providerConfig.assets.portal.primaryColor600`   | Color | None    | Legacy. Read, but no longer affects rendering                             |
| `_providerConfig.assets.portal.primaryColor900`   | Color | None    | Legacy. Read, but no longer affects rendering                             |
| `_providerConfig.assets.portal.secondaryColor800` | Color | None    | Legacy. Read, but no longer affects rendering                             |
| `_providerConfig.assets.portal.secondaryColor900` | Color | None    | Legacy. Read, but no longer affects rendering                             |

## IdP wizard

Extension: [idp-wizard](https://github.com/p2-inc/idp-wizard). More detail: [IdP Wizard](../organizations/idp-wizard.md#setting-realm-attributes-for-manual-control) and [SSO wizards](../sso/wizards.md).

| Key                                           | Value               | Default                                 | Description                                                                                                                                                |
| --------------------------------------------- | ------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_providerConfig.wizard.apiMode`              | `onprem` or `cloud` | `onprem`                                | `onprem` uses the Keycloak Admin API, so the user needs `realm-management` roles. `cloud` uses the Organizations API, so the user needs organization roles |
| `_providerConfig.wizard.version`              | `v1` or `v2`        | The server default, `v2` unless changed | Which wizard frontend to serve. An unrecognized value falls back to the server default                                                                     |
| `_providerConfig.wizard.auth-realm-override`  | Realm name          | The current realm                       | Realm the wizard authenticates against, when it differs from the realm being configured                                                                    |
| `_providerConfig.wizard.emailAsUsername`      | Boolean             | `false`                                 | Map the IdP email address to the Keycloak `username` when building mappers                                                                                 |
| `_providerConfig.wizard.trustEmail`           | Boolean             | `false`                                 | Turn on _trust email_ in the identity provider the wizard creates                                                                                          |
| `_providerConfig.wizard.usernameMapperImport` | Boolean             | `true`                                  | Use `IMPORT` sync mode for the username mapper instead of `INHERIT`                                                                                        |
| `_providerConfig.wizard.enableLdap`           | Boolean             | `true`                                  | Offer LDAP setup                                                                                                                                           |
| `_providerConfig.wizard.enableDashboard`      | Boolean             | `true`                                  | Show the dashboard of existing setup. Wizard `v1` only                                                                                                     |
| `_providerConfig.wizard.enableGroupMapping`   | Boolean             | `true`                                  | Read and passed to the frontend, but currently has no effect                                                                                               |
| `_providerConfig.wizard.appName`              | Text                | None                                    | Product name shown by the wizard: in the page title in `v1`, and next to the logo in `v2`                                                                  |

The server default for `version` is set with `--spi-realm-restapi-extension-wizard-default-version`. The wizard's logo comes from [`_providerConfig.assets.logo.url`](#logo-and-icons).

## Organizations

Extension: [keycloak-orgs](https://github.com/p2-inc/keycloak-orgs). More detail: [Organizations configuration](../organizations/configuration.md).

The first seven keys can also be read and written together with `GET` and `PUT /realms/{realm}/orgs/config`, or under **Organizations** > **Manage Settings** in the Admin UI.

| Key                                                 | Value      | Default                 | Description                                                                                                                                |
| --------------------------------------------------- | ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `_providerConfig.orgs.config.createAdminUser`       | Boolean    | `true`                  | Create a default admin user for each new organization. See [Create admin user](../organizations/configuration.md#create-admin-user)        |
| `_providerConfig.orgs.config.sharedIdps`            | Boolean    | `false`                 | Allow one identity provider to be shared by several organizations. See [Shared IdPs](../organizations/configuration.md#shared-idps)        |
| `_providerConfig.orgs.config.multipleIdps`          | Boolean    | `false`                 | Allow an organization to have more than one active identity provider. See [Multiple IdPs](../organizations/configuration.md#multiple-idps) |
| `_providerConfig.orgs.config.validateIdp`           | Boolean    | `false`                 | Mark new organization identity providers as pending until validated. See [Validate IdP](../organizations/configuration.md#validate-idp)    |
| `_providerConfig.orgs.portalLink.expirationInSecs`  | Integer    | `86400` (one day)       | Lifetime of a portal link, in seconds. See [Portal link expiration](../organizations/configuration.md#portal-link-expiration)              |
| `_providerConfig.orgs.config.defaultApplicationUri` | URL        | None                    | Link used in invitation emails when the invitation has no redirect URI of its own                                                          |
| `_providerConfig.orgs.config.scimEnabled`           | Boolean    | `false`                 | Enable SCIM for organizations. See [SCIM](../organizations/scim.md#enabling-scim-for-the-realm)                                            |
| `_providerConfig.orgs.defaults.syncMode`            | Sync mode  | `FORCE`                 | Sync mode for identity providers created or linked through the Organizations API, when the request does not give one                       |
| `_providerConfig.orgs.defaults.postBrokerFlow`      | Flow alias | `post org broker login` | Post-broker-login flow for identity providers created or linked through the Organizations API, when the request does not give one          |
| `_providerConfig.orgs.dnsRecordKey`                 | DNS label  | `_org-domain-ownership` | Label of the DNS record used to verify an organization domain. The record name is `<label>.<domain>`                                       |

## Events

Extension: [keycloak-events](https://github.com/p2-inc/keycloak-events). More detail: the [keycloak-events README](https://github.com/p2-inc/keycloak-events#use).

The script and HTTP listeners can run several instances per realm. Each instance is one attribute whose key ends in an index of your choosing, such as `.0` or `.1`, and whose value is a JSON object. A listener only runs once it is also enabled under **Realm settings** > **Events** > **Event listeners**.

| Key                                              | Value                         | Default                                                 | Description                                                                                                                 |
| ------------------------------------------------ | ----------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `_providerConfig.ext-event-script.<N>`           | JSON                          | None                                                    | One script for the `ext-event-script` listener. Fields: `scriptName`, `scriptDescription`, `scriptCode`                     |
| `_providerConfig.ext-event-http.<N>`             | JSON                          | None                                                    | One target for the `ext-event-http` listener. `targetUri` is required. Optional fields cover HMAC signing and retry backoff |
| `_providerConfig.ext-event-email.includedEvents` | Event types separated by `##` | `LOGIN_ERROR`, `UPDATE_CREDENTIAL`, `REMOVE_CREDENTIAL` | Event types for which the `ext-event-email` listener emails the user. Unknown types are skipped                             |

## Transactional email

Extension: [keycloak-transactional-email](https://github.com/p2-inc/keycloak-transactional-email). More detail: its [configuration reference](https://github.com/p2-inc/keycloak-transactional-email/blob/main/docs/configuration.md), which lists the template names and the provider behavior.

| Key                                                       | Value                                          | Default                              | Description                                                                                                                            |
| --------------------------------------------------------- | ---------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `_providerConfig.ext-email-template.provider`             | Provider ID                                    | None, which disables the extension   | One of `sendgrid`, `brevo`, `postmark`, `mailtrap`, `mailgun`, `customerio`, `resend`, `awsses`                                        |
| `_providerConfig.ext-email-template.template.<name>`      | Template ID                                    | None                                 | The provider's template for one email type, such as `template.password-reset`. Add a `.<locale>` suffix for a locale-specific template |
| `_providerConfig.ext-email-template.smtp.fromDisplayName` | Text                                           | The realm's SMTP "From display name" | Sender display name. Takes an optional `.<locale>`, `.<name>` or `.<name>.<locale>` suffix to set it per locale, per template, or both |
| `_providerConfig.ext-email-template.event-date-format`    | `auto`, `dmy`, `mdy`, `ymd`, or a date pattern | `auto` (locale-aware)                | Format of the event date in event notification emails                                                                                  |

Each provider then has its own credential keys under `_providerConfig.ext-email-template.<provider>.`:

| Provider     | Required keys                                  | Optional keys | Default `api-url`                                |
| ------------ | ---------------------------------------------- | ------------- | ------------------------------------------------ |
| `sendgrid`   | `api-key`                                      | `api-url`     | `https://api.sendgrid.com/v3/mail/send`          |
| `brevo`      | `api-key`                                      | `api-url`     | `https://api.brevo.com/v3/smtp/email`            |
| `postmark`   | `server-token`                                 | `api-url`     | `https://api.postmarkapp.com/email/withTemplate` |
| `mailtrap`   | `api-token`                                    | `api-url`     | `https://send.api.mailtrap.io/api/send`          |
| `mailgun`    | `api-key`, `domain`                            | `api-url`     | `https://api.mailgun.net/v3`                     |
| `customerio` | `api-key`                                      | `api-url`     | `https://api.customer.io/v1/send/email`          |
| `resend`     | `api-key`                                      | `api-url`     | `https://api.resend.com/emails`                  |
| `awsses`     | `access-key-id`, `secret-access-key`, `region` | `api-url`     | The SES endpoint for the configured region       |

## Keys that are not read

These keys appear in older documentation or sample realm exports, but no extension reads them. Setting them has no effect.

- `_providerConfig.wizard.enableDirectorySync`
- `_providerConfig.wizard.enableIdentityProvider`
- `_providerConfig.wizard.enableScim`
- `_providerConfig.wizard.logoUrl`. Use [`_providerConfig.assets.logo.url`](#logo-and-icons) instead.
