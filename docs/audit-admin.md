---
id: audit-admin
title: Admin
---

:::note
Please [contact us](mailto:support@phasetwo.io) for access.
:::

Actions performed from the Phase Two dashboard or using the administrative API are recorded as events.

## Example

The following is an example of the detail contained in an admin event:

```json
{
  "uid":"31db295f-4bc7-4ba0-b689-65197efb5c6e",
  "time":1588696343501,
  "realmId":"master",
  "type":"admin.CLIENT-CREATE"
  "resourceType":"CLIENT",
  "operationType":"CREATE",
  "resourcePath":"clients/396664b6-40c5-4d45-bedf-2d8dd0f2af0e",
  "authDetails":{
    "realmId":"master",
    "clientId":"54aee1f9-2fe5-4049-99e8-3b72277a8e43",
    "userId":"f7cd3491-7c6c-480c-bc5c-b2b3b0fb048c",
    "ipAddress": "78.195.109.209",
    "username":"admin"
  }
}
```

## Event types

All admin event types are indicated in the `type` field of the json event with the `admin.` prefix. This field is a concatenation of the `resourceType` and `operationType`.

### Operation types

This fields indicates what operation was executed on a resource. This is limited to `CREATE`, `DELETE`, `UPDATE`, `ACTION`. `ACTION` is a placeholder for actions that do not fit the classic CRUD model for a resource. For example...

### Resource types

| Name | Description |
| - | - |
| AUTH_EXECUTION | - |
| AUTH_EXECUTION_FLOW | - |
| AUTH_FLOW | - |
| AUTHENTICATOR_CONFIG | - |
| AUTHORIZATION_POLICY | - |
| AUTHORIZATION_RESOURCE | - |
| AUTHORIZATION_RESOURCE_SERVER | - |
| AUTHORIZATION_SCOPE | - |
| CLIENT | - |
| CLIENT_INITIAL_ACCESS_MODEL | - |
| CLIENT_ROLE | - |
| CLIENT_ROLE_MAPPING | - |
| CLIENT_SCOPE | - |
| CLIENT_SCOPE_MAPPING | - |
| CLUSTER_NODE | - |
| COMPONENT | - |
| CUSTOM | - |
| GROUP | - |
| GROUP_MEMBERSHIP | - |
| IDENTITY_PROVIDER | - |
| IDENTITY_PROVIDER_MAPPER | - |
| PROTOCOL_MAPPER | - |
| REALM | - |
| REALM_ROLE | - |
| REALM_ROLE_MAPPING | - |
| REALM_SCOPE_MAPPING | - |
| REQUIRED_ACTION | - |
| USER | - |
| USER_FEDERATION_MAPPER | - |
| USER_FEDERATION_PROVIDER | - |
| USER_LOGIN_FAILURE | - |
| USER_SESSION | - |

### Resource path

