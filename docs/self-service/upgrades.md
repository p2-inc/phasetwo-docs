---
id: upgrades
title: Keycloak Upgrades
description: How Keycloak version upgrades are handled on Phase Two hosted clusters, what to expect during one, and what you need to do afterwards.
---

Phase Two performs Keycloak version upgrades on hosted clusters. There is no upgrade action in the dashboard, and you do not need to plan or execute one yourself. This page covers what happens during an upgrade and the two things that are your responsibility around it.

## Which version your cluster runs

Phase Two selects the Keycloak version a cluster is provisioned on, and moves it forward over time. There is no version selector when you [create a cluster](./create-a-cluster.md) and no way to pin, choose, or roll back a version from the dashboard.

Upgrades are automatic on every tier. On Enterprise clusters they can be coordinated with you rather than simply applied, and custom plans can run to an agreed schedule.

If you need to know which version a cluster is on, or you have a requirement to be on a particular version, email [support@phasetwo.io](mailto:support@phasetwo.io).

## What happens during an upgrade

Upgrades run against your cluster in place, and the effect depends on the size of the version change.

- **Minor version upgrades** are routine. Your cluster runs at reduced capacity briefly while the new version rolls out, and a database migration may run as part of it.
- **Major version upgrades** are more involved, because Keycloak's own schema and behavior change between majors. Expect a short interruption rather than a purely rolling update.

Both are excluded from uptime calculations under our [Service Level Agreement](/company/sla), which treats scheduled maintenance and version upgrade redeployments as planned rather than unplanned downtime. We notify customers ahead of changes that may affect them.

## What you need to do

### Re-upload themes and extensions after a major upgrade

Themes and extensions are uploaded per Keycloak major version. A JAR uploaded for one major is not carried forward to the next, so after a major upgrade you must upload your themes and extensions again for the new version and refresh your cluster resources.

Build and test those JARs against the new Keycloak major before uploading them. Keycloak's SPIs change between majors, and an extension compiled against the old one may fail to load — the [checks we run on upload](./resources.md#automated-extension-checks) are advisory and will not stop a broken extension from being deployed. See [Cluster Resources](./resources.md).

### Test your applications

Keycloak majors can change token contents, endpoint behavior, and login page markup. If you maintain a custom theme, an extension, or an application that depends on specific claim structure, verify it against the new version rather than assuming it carries over.

The most reliable way to do this is to keep a non-production realm — ideally on a separate cluster — that you can exercise your full login flow against. See the [Go-Live Checklist](../getting-started/launch-checklist.md#before-you-announce) for what that pass should cover.

## Coordinating an upgrade

If an upgrade needs to land inside or outside a particular window — around a launch, an audit, or a freeze period — email [support@phasetwo.io](mailto:support@phasetwo.io). Coordination is part of the Enterprise tier and available by arrangement on custom plans.
