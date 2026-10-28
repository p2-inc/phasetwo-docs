---
id: organizations-events
title: Organization Events
sidebar_label: Events
---

## Admin Events

Changes to organizations through the Organizations API produce these admin events:

| Path                                                            | Method   | Resource type             | Operation |
| --------------------------------------------------------------- | -------- | ------------------------- | --------- |
| `/auth/realms/:realm/orgs`                                      | `POST`   | ORGANIZATION              | CREATE    |
| `/auth/realms/:realm/orgs/:orgId`                               | `PUT`    | ORGANIZATION              | UPDATE    |
| `/auth/realms/:realm/orgs/:orgId`                               | `DELETE` | ORGANIZATION              | DELETE    |
| `/auth/realms/:realm/orgs/:orgId/members/:userId`               | `PUT`    | ORGANIZATION_MEMBERSHIP   | CREATE    |
| `/auth/realms/:realm/orgs/:orgId/members/:userId`               | `DELETE` | ORGANIZATION_MEMBERSHIP   | DELETE    |
| `/auth/realms/:realm/orgs/:orgId/roles`                         | `POST`   | ORGANIZATION_ROLE         | CREATE    |
| `/auth/realms/:realm/orgs/:orgId/roles`                         | `PUT`    | ORGANIZATION_ROLE         | CREATE    |
| `/auth/realms/:realm/orgs/:orgId/roles`                         | `PATCH`  | ORGANIZATION_ROLE         | DELETE    |
| `/auth/realms/:realm/orgs/:orgId/roles/:roleName`               | `PUT`    | ORGANIZATION_ROLE         | UPDATE    |
| `/auth/realms/:realm/orgs/:orgId/roles/:roleName`               | `DELETE` | ORGANIZATION_ROLE         | DELETE    |
| `/auth/realms/:realm/orgs/:orgId/roles/:roleName/users/:userId` | `PUT`    | ORGANIZATION_ROLE_MAPPING | CREATE    |
| `/auth/realms/:realm/orgs/:orgId/roles/:roleName/users/:userId` | `DELETE` | ORGANIZATION_ROLE_MAPPING | DELETE    |
| `/auth/realms/:realm/users/:userId/orgs/:orgId/roles`           | `PUT`    | ORGANIZATION_ROLE_MAPPING | CREATE    |
| `/auth/realms/:realm/users/:userId/orgs/:orgId/roles`           | `PATCH`  | ORGANIZATION_ROLE_MAPPING | DELETE    |
| `/auth/realms/:realm/orgs/:orgId/invitations`                   | `POST`   | INVITATION                | CREATE    |
| `/auth/realms/:realm/orgs/:orgId/invitations/:invitationId`     | `DELETE` | INVITATION                | DELETE    |
| `/auth/realms/:realm/orgs/:orgId/domains/:domainName/verify`    | `POST`   | DOMAIN                    | UPDATE    |
| `/auth/realms/:realm/orgs/import`                               | `POST`   | ORGANIZATION_IMPORT       | CREATE    |

The admin event's `type` combines the resource type and operation, for example `admin.ORGANIZATION-CREATE`. See [Admin events](../audit-logs/admin.md).

## User events

Some organization actions also produce user (access) events.

### Organization management

| Path                                              | Method   | Event type     |
| ------------------------------------------------- | -------- | -------------- |
| `/auth/realms/:realm/users/switch-organization`   | `PUT`    | UPDATE_PROFILE |
| `/auth/realms/:realm/orgs/:orgId/members/:userId` | `DELETE` | UPDATE_PROFILE |

### Invitations

**Event type**: `CUSTOM_REQUIRED_ACTION`

![invitation-required-action-success](/docs/organizations/active/events/invitation-required-action-success-event.png)

![invitation-required-action-error](/docs/organizations/active/events/invitation-required-action-error-event.png)

### Post IdP login ("Add user to org" Authenticator)

**Event type**: `IDENTITY_PROVIDER_POST_LOGIN`

![add-to-organization-success](/docs/organizations/active/events/add-to-organization-success-event.png)

![remove-organization-invitation-event](/docs/organizations/active/events/remove-organization-invitation-event.png)

### PortalLink

**Event type**: `EXECUTE_ACTION_TOKEN`

![portal-link-success](/docs/organizations/active/events/portal-link-success-event.png)
