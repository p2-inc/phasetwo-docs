---
id: open-source
title: Open Source
---

The core extensions to Keycloak that Phase Two is built on will always be open source so that you can migrate to your own Keycloak deployment. Below is a list of the relevant extensions and their current status.

### Components and repos

| Component      | Status             | Repository                                        | Description                                                                               |
| -------------- | ------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Events         | :white_check_mark: | https://github.com/p2-inc/keycloak-events         | All event listener implementations.                                                       |
| Magic Link     | :white_check_mark: | https://github.com/p2-inc/keycloak-magic-link     | Magic Link Authentication. Created with an Authenticator or Resource.                     |
| Organizations  | :white_check_mark: | https://github.com/p2-inc/keycloak-orgs           | Organizations multi-tenant entities, resources and APIs.                                  |
| Themes         | :white_check_mark: | https://github.com/p2-inc/keycloak-themes         | Login and email theme customizations via Realm attributes without deploying an extension. |
| Admin UI       | :white_check_mark: | https://github.com/p2-inc/keycloak-ui             | Admin UI customizations.                                                                  |
| Admin Portal   | :white_check_mark: | https://github.com/p2-inc/phasetwo-admin-portal   | User self-management for their account and organizations.                                 |
| User Migration | :white_check_mark: | https://github.com/p2-inc/keycloak-user-migration | User migration storage provider and API client.                                           |

### Docker

We distribute a [Docker image](https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags) that combines the above extensions with the Keycloak image. While the online [Self-service tool](/docs/self-service/) is the easiest way to try Phase Two, and includes additional features and extensions, if you want to try it on your own, the Docker image is the fastest way to do it. Documentation and examples for using it are in the [phasetwo-containers](https://github.com/p2-inc/phasetwo-containers) repository. The most recent version of these extension are included.

### What isn't there

It is important to note that not all of Phase Two's extensions will be available as open source. The extensions that are considered "non-core" relate to functionality that is not essential in order to migrate to your own Keycloak deployment. This includes all changes to the underlying storage architecture that allows Phase Two to achieve larger scale than a standard Keycloak deployment. This also includes the user experience features targeted at IdP onboarding, such as the Phase Two Connect on-prem wizards and dashboards.

Also, if you are currently a paying customer, either for the hosted version or Phase Two Connect, and there is an extension that is not yet open sourced, you can request early access. Please [contact us](mailto:support@phasetwo.io) for more information.

### Dual licensing

The open source Phase Two extensions are licensed under the [Elastic License v2](https://github.com/elastic/elasticsearch/blob/main/licenses/ELASTIC-LICENSE-2.0.txt). Paid customers for the self-service or hosted offerings are using the license specified in our [SaaS Service Agreement](/company/service-agreement). On-prem and other licensees can refer to their specific service agreements.

#### Open source license

With the Elastic License, you can use and host the Phase Two Keycloak extensions as part of your own product. You may not sell the extensions as a hosted or managed service, which includes bundling and distribution by companies who sell their products for on-prem and private cloud use. You are free to create derivative works, but they must maintain the same license, copyright and other notices. You may not represent the Phase Two Keycloak extensions as your own work of authorship.

#### Paid license

Paying customers that have accepted our service agreements can use, host and distribute the Phase Two Keycloak extensions in accordance with the restrictions defined in those agreements. You will have access to extensions that are not available as open source, such as our identity provider vendor wizards. Modifications and additional extensions are permitted. You may not use, host or distribute the extensions in a way that is competitive to Phase Two.
