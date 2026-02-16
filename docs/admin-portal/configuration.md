---
id: configuration
title: Configuration
---

In the **Styles**->_Portal_ section of the admin UI, it is possible to configure user access to portions of the portal. This has the effect of limiting the self-management functionality that is available to your users. The sections that can be toggled are:

- _Profile_ View and edit profile information such as first name, last name and email. View and edit credentials, linked account, and manage authenticated sessions.
  - _Password update_ Update password.
  - _2FA create/update_ Add and remove 2FA mechanisms like OTP and WebAuthn.
  - _Device activity_ View and terminate active authentication sessions.
  - _Linked accounts_ View, create and remove links with social and other identity providers.
- _Organizations_ View and (conditionally) edit details of organizations for which a user is a member.
  - _Details_ View and edit organization profile information.
  - _Members_ View and manage organization members and their roles. Invite new members.
  - _Invitations_ Invite new members.
  - _Domains_ Add and verify email domains for SSO login.
  - _SSO_ Create and update SSO connections to organization identity provider.
  - _Events_ View events related to organization member activity.

![Keycloak Phase Two Portal Style and Visibility Configuration](/docs/admin-portal-config.png)

### Styles

Currently, the logo and favicon set in the general styles section will be used when rendering the portal in order to preserve your branding.

![Keycloak Phase Two General Logo Configurations](/docs/admin-portal-general-styles.png)

Additionally, you can override three colors used in the portal, and optionally override the entire CSS. See the [Admin Portal source code](https://github.com/p2-inc/phasetwo-admin-portal) for details for overriding the stylesheet.

![Keycloak Phase Two General Style Configuration](/docs/admin-portal-portal-styles.png)
