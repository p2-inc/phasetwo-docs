---
id: service-accounts
title: Service Accounts
---

It is recommended to create one (or more) service accounts in order to call the Phase Two and Keycloak admin APIs. A service account can be thought of as a special type of user that is associated with each Client in Keycloak, but does not have user status in your application.

### Creating a client

Each OIDC client has a built-in service account which allows it to obtain an access token. You can create an configure such a client in the **Client** section by selecting the _Create client_ button. This will guide you through a wizard to set up your client. The important values to choose are:

- _Client ID_ use a value that indicates to you this is to be used for API access. E.g. `api-client`
- _Client authentication_ must be set to **On**
- _Service accounts roles_ must be selected.

![Keycloak Create Service Account Settings](/docs/api-service-accounts-client-1.png)
![Keycloak Create Service Account Config](/docs/api-service-accounts-client-2.png)

Once you have set up the client, find your _Client secret_ in the **Credentials** tab of the client you just created. Copy and save it for later use.

![Keycloak Create Service Account Client Secret](/docs/api-service-accounts-client-secret.png)

### Mapping roles

There will be a **Service accounts roles** tab in the client. Select this in order to grant roles to the service account user. The **Assign role** button can be used to find roles to grant. The roles you select will likely be found by selecting _Filter by clients_ and looking for roles in the `realm-management` client.

![Keycloak Create Service Account Client Roles](/docs/api-service-accounts-roles.png)

The roles you grant to the service account user, will be dictated by how you intend to use the API. If you will just use it to look up users, you will only need to grant the `view-users` and `query-users` roles. If you are using it to manage organizations you will need to grant the `view-organizations`, `manage-organizations`, `view-users` and `query-users` roles. A full matrix of roles is beyond the scope of this document, but more information can be found in the [Phase Two API](/api/phase-two-admin-rest-api) and the [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html) documentation.
