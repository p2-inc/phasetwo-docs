---
id: open-source
title: Open Source
---

The core extensions to Keycloak that Phase Two is built on will always be open source so that you can migrate to your own Keycloak deployment. Below is a list of the relevant extensions and their current status.

### Components and repos

| Component | Status | Repository | Description |
| --- | --- | --- | --- |
| Events | :white_check_mark: | https://github.com/p2-inc/keycloak-events | All event listener implementations. |
| User Migration | :white_check_mark: | https://github.com/p2-inc/keycloak-user-migration | User migration storage provider and API client. |
| Organizations | :white_check_mark: | https://github.com/p2-inc/keycloak-orgs | Organizations multi-tenant entities, resources and APIs. |
| Login Theme | *Spring 2022* | | Customizable login theme. |
| Admin UI | *Summer 2022* | | Admin UI customizations. |

### Notes

It is important to note that not all of Phase Two's extensions will be available as open source. The extensions that are considered "non-core" relate to functionality that is not essential in order to migrate to your own Keycloak deployment. This includes all changes to the underlying storage architecture that allows Phase Two to achieve larger scale than a standard Keycloak deployment. This also includes the user experience features targeted at IdP onboarding, such as the organization portal and Phase Two Connect on-prem wizards and dashboard.

Also, if you are currently a paying customer, either for the hosted version or Phase Two Connect, and there is an extension that is not yet open sourced, you can request early access. Please [contact us](mailto:support@phasetwo.io) for more information.
