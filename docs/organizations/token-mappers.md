---
id: token-mappers
title: Token Mappers
sidebar_label: Token Mappers
---

Token mappers allow you to map information about the user, their organization, or other attributes into the access token, ID token, or `userinfo` endpoint response. This can be useful for applications that need to know about the user's organization or other attributes in order to make authorization decisions.

You can create a mapping at the realm level or the client level, depending on your needs. The process is the same. The following overlaps with configuration of the [active organization mapper](./active-organization.md).

### Configure the mapper

**1. Create client scope**

In your realm Client scopes, add a new client-scope, set the configuration and name as you wish.

![client-scope](/docs/organizations/token-mappers/create-client-scope.png)

**2. Use an organization mapper**

Phase Two provides predefined mappers for organization information, but you can also create your own custom mappers if you need to map other information. Select "Configure a new mapper" adn from the list you can select

* [Active Organization](./active-organization.md)
* Organization Attribute
* Organization Role
* Organization Specific Attribute 

For example the "Active Organization" mapper,

![available-mapper](/docs/organizations/active/active-organization/mappers/2.configurable-active-organization-mapper.png)

On the add mapper screen, adjust as needed.

![add-mapper](/docs/organizations/token-mappers/add-mapper.png)

**3. Configure the mapper**

By default, all properties are pre-configured. You can remove what you want and the mapper will adjust the claim.

_Example with all pre-configured properties_:  
![mapper-configuration](/docs/organizations/active/active-organization/mappers/3.mapper-configuration.png)

Will produce this claim in token:

```json
  "active_organization": {
    "role": [
      "view-organization",
      "view-members",
      "view-roles"
    ],
    "name": "My Organization",
    "id": "75bc86cb-8527-43af-b598-0873fa2bfea6",
    "attribute": {
      "test": [
        "test"
      ]
    }
  },
```

_Example with only id property_:  
![mapper-configuration](/docs/organizations/active/active-organization/mappers/3.1.mapper-configuration.png)

Will produce this claim in token:

```json
  "active_organization": {
    "id": "75bc86cb-8527-43af-b598-0873fa2bfea6"
  },
```

**4. Add new client scope to public client**

On your public client (used by your FE application) add the newly created client scope.

![client-client-scopes](/docs/organizations/active/active-organization/mappers/4.configure-client-client-scopes.png)

**5. Token claims**  
Then, after authentication, you should have the active organization info into the token claims.

![token-claims](/docs/organizations/active/active-organization/mappers/5.token-claims.png)
