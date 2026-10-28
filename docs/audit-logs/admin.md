---
id: admin
title: Admin
---

Changes made in the admin console or through the admin APIs are recorded as admin events.

## Example

The following is an example of the detail contained in an admin event:

```json
{
  "uid": "31db295f-4bc7-4ba0-b689-65197efb5c6e",
  "time": 1588696343501,
  "realmId": "master",
  "type": "admin.CLIENT-CREATE",
  "resourceType": "CLIENT",
  "operationType": "CREATE",
  "resourcePath": "clients/396664b6-40c5-4d45-bedf-2d8dd0f2af0e",
  "authDetails": {
    "realmId": "master",
    "clientId": "54aee1f9-2fe5-4049-99e8-3b72277a8e43",
    "userId": "f7cd3491-7c6c-480c-bc5c-b2b3b0fb048c",
    "ipAddress": "78.195.109.209",
    "username": "admin"
  }
}
```

## Event types

All admin event types are indicated in the `type` field of the json event with the `admin.` prefix. This field is a concatenation of the `resourceType` and `operationType`.

### Operation types

This field indicates what operation was executed on a resource. It is one of `CREATE`, `DELETE`, `UPDATE`, or `ACTION`. `ACTION` is used for operations that don't fit the classic CRUD model, such as sending a user a required-actions email, logging out all of a user's sessions, or testing an LDAP connection.

### Resource types

| Name                          | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| REALM                         | The realm and its settings                                   |
| REALM_ROLE                    | A realm role                                                 |
| REALM_ROLE_MAPPING            | A realm role granted to a user or group                      |
| REALM_SCOPE_MAPPING           | A realm role in a client or client scope's scope             |
| AUTH_FLOW                     | An authentication flow                                       |
| AUTH_EXECUTION_FLOW           | A sub-flow within an authentication flow                     |
| AUTH_EXECUTION                | A step within an authentication flow                         |
| AUTHENTICATOR_CONFIG          | The configuration of an authentication step                  |
| REQUIRED_ACTION               | A required action                                            |
| REQUIRED_ACTION_CONFIG        | The configuration of a required action                       |
| IDENTITY_PROVIDER             | An identity provider                                         |
| IDENTITY_PROVIDER_MAPPER      | An identity provider mapper                                  |
| PROTOCOL_MAPPER               | A protocol mapper on a client or client scope                |
| USER                          | A user                                                       |
| USER_LOGIN_FAILURE            | A user's brute force detection state                         |
| USER_SESSION                  | A user session                                               |
| USER_FEDERATION_PROVIDER      | A user federation provider, such as LDAP                     |
| USER_FEDERATION_MAPPER        | A user federation mapper                                     |
| USER_PROFILE                  | The realm's user profile configuration                       |
| GROUP                         | A group                                                      |
| GROUP_MEMBERSHIP              | A user's membership in a group                               |
| CLIENT                        | A client                                                     |
| CLIENT_INITIAL_ACCESS_MODEL   | An initial access token for dynamic client registration      |
| CLIENT_ROLE                   | A client role                                                |
| CLIENT_ROLE_MAPPING           | A client role granted to a user or group                     |
| CLIENT_SCOPE                  | A client scope                                               |
| CLIENT_SCOPE_MAPPING          | A role in a client scope's scope                             |
| CLIENT_SCOPE_CLIENT_MAPPING   | A client scope assigned to a client                          |
| CLUSTER_NODE                  | A registered cluster node for a client                       |
| COMPONENT                     | A component, such as a key provider or user storage provider |
| AUTHORIZATION_RESOURCE_SERVER | A client's authorization services settings                   |
| AUTHORIZATION_RESOURCE        | An authorization resource                                    |
| AUTHORIZATION_SCOPE           | An authorization scope                                       |
| AUTHORIZATION_POLICY          | An authorization policy or permission                        |
| CUSTOM                        | A custom resource type                                       |

Phase Two's [Organizations](../organizations/events.md) extension adds these resource types for organization changes: `ORGANIZATION`, `ORGANIZATION_MEMBERSHIP`, `ORGANIZATION_ROLE`, `ORGANIZATION_ROLE_MAPPING`, `INVITATION`, `DOMAIN`, and `ORGANIZATION_IMPORT`.

### Resource path

The `resourcePath` field is the path of the changed resource relative to the realm in the admin API, delimited by `/`. For example, `clients/396664b6-40c5-4d45-bedf-2d8dd0f2af0e` is a client, and `users/f7cd3491-7c6c-480c-bc5c-b2b3b0fb048c/role-mappings/realm` is a user's realm role mappings.
