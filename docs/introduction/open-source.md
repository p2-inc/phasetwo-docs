---
id: open-source
title: Open Source
---

The core extensions to Keycloak that Phase Two is built on will always be open source, so that you can migrate to your own Keycloak deployment. Below is a list of the extensions and where to find them.

### Components and repos

| Component           | Repository                                             | Description                                                                                                  |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Organizations       | https://github.com/p2-inc/keycloak-orgs                | Multi-tenant organizations, with their members, roles, invitations, domains, identity providers, and APIs.   |
| Events              | https://github.com/p2-inc/keycloak-events              | Event listener implementations, including webhooks.                                                          |
| Magic Link          | https://github.com/p2-inc/keycloak-magic-link          | Magic link and email OTP authenticators, and a REST resource for creating magic links.                       |
| Themes and Admin UI | https://github.com/p2-inc/keycloak-themes              | The `phasetwo-ui` login, account, admin, and email theme, plus theme customization through realm attributes. |
| Admin Portal        | https://github.com/p2-inc/phasetwo-admin-portal        | Self-management for users, and for the admins of their organizations.                                        |
| IdP Wizards         | https://github.com/p2-inc/idp-wizard                   | Guided setup of identity providers, for SSO admins and organization admins.                                  |
| SCIM Server         | https://github.com/p2-inc/keycloak-scim-server         | Inbound SCIM provisioning of users and groups.                                                               |
| Atomic Auth Flows   | https://github.com/p2-inc/keycloak-atomic-auth-flows   | Config-as-code updates to authentication flows, applied safely as a single change.                           |
| Transactional Email | https://github.com/p2-inc/keycloak-transactional-email | Sending Keycloak emails through a transactional email provider instead of SMTP.                              |
| User Migration      | https://github.com/p2-inc/keycloak-user-migration      | User migration storage provider that pulls users from a legacy system on first login.                        |

### Docker

We distribute a [Docker image](https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags) that combines these extensions with Keycloak. The [Dashboard](/docs/self-service/) is the easiest way to try Phase Two, and includes additional features. If you want to run it yourself, the Docker image is the fastest way. Documentation and examples for using it are in the [phasetwo-containers](https://github.com/p2-inc/phasetwo-containers) repository, and the image always includes the most recent version of these extensions. See [Self-Hosting](/docs/hosting/) for more.

### What isn't there

Not all of Phase Two's software is open source. The parts that are not are those that aren't needed to migrate to your own Keycloak deployment. This includes the changes to the underlying storage architecture that let Phase Two run at larger scale than a standard Keycloak deployment, the hosted Dashboard and control plane, and some vendor-specific identity provider wizards.

If you are a paying customer and need an extension that is not yet open source, [contact us](mailto:support@phasetwo.io) about early access.

### Dual licensing

The open source Phase Two extensions are licensed under the [Elastic License v2](https://github.com/elastic/elasticsearch/blob/main/licenses/ELASTIC-LICENSE-2.0.txt). Paying customers of the hosted offering use the license in our [SaaS Service Agreement](/company/service-agreement). On-prem and other licensees can refer to their own service agreements.

#### Open source license

With the Elastic License, you can use and host the Phase Two Keycloak extensions as part of your own product. You may not sell the extensions as a hosted or managed service, which includes bundling and distribution by companies who sell their products for on-prem and private cloud use. You are free to create derivative works, but they must maintain the same license, copyright and other notices. You may not represent the Phase Two Keycloak extensions as your own work of authorship.

#### Paid license

Paying customers that have accepted our service agreements can use, host and distribute the Phase Two Keycloak extensions in accordance with the restrictions defined in those agreements. You will have access to extensions that are not available as open source, such as some vendor-specific identity provider wizards. Modifications and additional extensions are permitted. You may not use, host or distribute the extensions in a way that is competitive to Phase Two.
