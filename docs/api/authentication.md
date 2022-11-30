---
id: authentication
title: Authentication
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

Authentication is achieved by using the `Authentication: Bearer <token>` header in all requests. This is either the access token received from a normal authentication, or by a request directly to the OpenID Connect token endpoint.
    
It is recommended that you use a Keycloak Admin Client, such as [this one for Javascript](https://github.com/keycloak/keycloak-nodejs-admin-client), as they take care of authetication, getting an access token, and refreshing it when it expires.

#### Client credentials grant example
```
POST /auth/realms/test-realm/protocol/openid-connect/token
Host: app.phasetwo.io
Accept: application/json
Content-type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=admin-cli&client_secret=fd649804-3a74-4d69-acaa-8f065c6b7da1
```

#### Password grant example
```
POST /auth/realms/test-realm/protocol/openid-connect/token
Host: app.phasetwo.io
Accept: application/json
Content-type: application/x-www-form-urlencoded

grant_type=password&username=uname@foo.com&password=pwd123AZY&client_id=admin-cli
```

