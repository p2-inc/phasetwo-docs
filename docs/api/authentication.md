---
id: authentication
sidebar_label: Authentication
title: Authentication API
---

Every request to the Phase Two and Keycloak admin APIs needs an access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

For backend services and integrations, get the token for a [service account](./service-accounts.md) using the client credentials grant. If your own application calls the APIs on behalf of a logged-in user, you can use that user's access token instead, as long as the user has the admin roles the API requires.

A Keycloak admin client library, such as the [Keycloak Admin Client for JavaScript](https://github.com/keycloak/keycloak/tree/main/js/libs/keycloak-admin-client), or one of our [SDKs](./sdks.md), can take care of getting an access token and refreshing it when it expires.

### Client credentials grant example

The `client_credentials` grant is used with a confidential client that has _Client authentication_ and _Service account roles_ turned on. See [Access Service Accounts](./service-accounts.md) to set one up. Replace the host, realm, client ID, and secret with your own.

```
POST /auth/realms/my-realm/protocol/openid-connect/token
Host: <your-cluster-host>
Accept: application/json
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=api-client&client_secret=<client-secret>
```

Or with curl:

```bash
curl -s https://<your-cluster-host>/auth/realms/my-realm/protocol/openid-connect/token \
  -d grant_type=client_credentials \
  -d client_id=api-client \
  -d client_secret=<client-secret>
```

### Example response

The response is a JSON document containing the access token, its type, and its lifetime in seconds.

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 300,
  "token_type": "Bearer",
  "scope": "profile email"
}
```

Use the `access_token` value in the `Authorization: Bearer <access_token>` header of your API requests, and request a new token when it expires. The client credentials grant does not return a refresh token.

### Why not the password grant?

The password grant (direct access grant), where an application sends a user's username and password to the token endpoint, is deprecated by the [OAuth 2.0 Security Best Current Practice](/docs/security/oauth-security-bcp) and skips the protections in your browser login flow, such as second factors. Use a service account for automation instead, and keep _Direct access grants_ turned off on your clients. See [Sign-in Methods and Grant Types](/docs/authentication/sign-in-methods) for more.
