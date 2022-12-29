---
id: authentication
title: Authentication
---

Authentication is achieved by using the `Authentication: Bearer <token>` header in all requests. This is either the access token received from a normal authentication, or by a request directly to the OpenID Connect token endpoint.
    
It is recommended that you use a Keycloak Admin Client, such as [this one for Javascript](https://github.com/keycloak/keycloak-nodejs-admin-client), as they take care of authentication, getting an access token, and refreshing it when it expires.

### Example requests

#### Client credentials grant example
The `client_credentials` grant type is used if you are following the recommended convention of making a service account to call the APIs. See the previous section on [service accounts](service-accounts) if you need to set one up. 
```
POST /auth/realms/test-realm/protocol/openid-connect/token
Host: app.phasetwo.io
Accept: application/json
Content-type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=admin-cli&client_secret=fd649804-3a74-4d69-acaa-8f065c6b7da1
```

#### Password grant example
The `password` grant type can be used if normal users are using their credentials to obtain a token manually for the purpose of calling the APIs.
```
POST /auth/realms/test-realm/protocol/openid-connect/token
Host: app.phasetwo.io
Accept: application/json
Content-type: application/x-www-form-urlencoded

grant_type=password&username=uname@foo.com&password=pwd123AZY&client_id=admin-cli
```

### Example response

The response to each type will be a JSON document containing the access token and some information about type and expiration.

```json
{
    "access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "token_type":"bearer",
    "expires_in":60
}
```

The `access_token` value will be used in the `Authorization: Bearer {access_token}` header for all authenticated API requests.