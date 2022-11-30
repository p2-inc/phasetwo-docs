---
id: api
title: Audit Log API
---

Customers can use the existing audit logging mechanism to include their own application's events. There is a single API method that will consume events in the representation below and make them available for searching, filtering and exporting.

## Endpoint

Events can be posted to the following endpoint. Note that `host`, `port` and `realm` must be replaced with your values. This endpoint accepts and returns JSON content.

```shell
POST https://<host>:<port>/auth/realms/<realm>/events
```

## Authentication

Only authenticated users may send events at this time. The current user login access token should be used for browser requests in the `Authorization` HTTP header as below. Backend requests can be made using a service account or other admin access token.

```shell
Authorization: Bearer <accessToken>
```

## Field definitions

### Event

The Event object describes the full action that took place in the system. 

| Name | Type | Required | Description |
| - | - | - | - |
| uid | string | provided | An ID unique to this event |
| time | number | optional [^1] | UNIX timestamp of the event |
| realmId | string | provided | The realm ID where the action took place |
| authDetails | [AuthDetails](#authdetails) | provided | - |
| type | string | required | A description of the action that took place |
| operationType | string | optional | What operation was executed on a resource (CREATE, DELETE, UPDATE, ACTION) |
| resourcePath | string | optional | If the action changed a resource, this is meant to be the / delimited resource path |
| resourceType | string | optional | If the action changed a resource, this is the resource's type |
| details | object | optional | An optional hash of values pertaining to the action that took place |
| error | string | optional | An optional error string for tracing purposes if the action resulted in a failure |

[^1]: If time is not passed by the caller, it will be provided by the server

### AuthDetails

The AuthDetails object provides information on the logged in user executing the action. When posting an event, AuthDetails should be omitted, as it will automatically be provided by the server. 

| Name | Type | Required | Description |
| - | - | - | - |
| realmId | string | provided | The realm ID of the logged in user |
| clientId | string | provided | The client ID the user was logged into |
| userId | string | provided | The user ID of the logged in user |
| ipAddress | string | provided | The IP address of the logged in user |
| username | string | provided | The username of the logged in user |
| sessionId | string | provided | A unique ID of the current login session |

## Responses

HTTP status codes are used to indicate types of successful or failure states. A short JSON object will also be returned, with content indicating more informatin about an error state.

| Status code | Description |
| - | - |
| 202 | Event received |
| 400 | Malformed event |
| 403 | API rate limit exceeded |
| 409 | Reserved event type |
| 5xx | Server error |

## Example

```bash
curl https://app.phasetwo.io/auth/realms/company.app/events \
  --header "Content-Type: application/json" \
  --header "Accept: application/json" \
  --header "Authorization: Bearer <accessToken>" \
  --data "{ \"type\": \"foo.bar\" }"
```
