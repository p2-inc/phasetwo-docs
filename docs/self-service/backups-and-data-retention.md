---
id: backups-and-data-retention
title: Backups and Data Retention
description: How Phase Two backs up hosted cluster data, what backups are and are not for, what you should retain yourself, and how long data survives cluster deletion.
---

Phase Two operates the database behind your hosted cluster, which means backups are our responsibility rather than yours. This page covers what we do, what that does and does not protect you from, and what is worth keeping on your own side.

## What Phase Two backs up

Your cluster's data — realms, users, clients, sessions, and configuration — lives in a database we operate and back up. Database snapshots are taken hourly, are encrypted, and are stored separately from the production data they protect. Restores are tested periodically, and our business continuity and disaster recovery plan is tested at least annually.

You do not need to configure, schedule, or verify any of this.

## What backups are for

Backups exist so that Phase Two can recover the platform from an infrastructure failure. That is a different thing from undoing a change you made, and the distinction matters:

- **Covered.** Loss of a database node, an availability zone, or the underlying infrastructure. Recovery is our responsibility and does not require you to do anything.
- **Not covered as a self-service operation.** Rolling your realm back to an earlier point in time because a user, client, or configuration change was made in error. There is no point-in-time restore you can trigger from the dashboard, and a restore request is not a routine operation.

If you delete a realm, a client, or a set of users by mistake, treat that as data you need to be able to reconstruct yourself. Contact [support@phasetwo.io](mailto:support@phasetwo.io) as early as possible if you believe you need help, but do not plan around a restore being available.

## What to keep on your own side

Two things are worth maintaining independently of our backups:

- **Realm configuration.** Export your realm configuration and keep it in version control. This is your record of intended configuration, it makes changes reviewable, and it is the fastest route to rebuilding a realm. See the [Go-Live Checklist](../getting-started/launch-checklist.md).
- **Anything you cannot reconstruct.** If your application depends on user attributes, group structure, or organization membership that exists only in Keycloak, consider exporting it periodically through the [API](/docs/api). Credentials are not exportable in a reusable form, by design.

## Retention when a cluster is deleted

Deleting a cluster does not purge its data immediately. After the deletion takes effect there is a grace period during which the cluster remains available, followed by a longer window in which the data is preserved but the cluster is not running. After that, the data is purged permanently and cannot be recovered by us or by you.

For the current grace and preservation periods, see [Dedicated Clusters](./dedicated-clusters.md#deleting-a-cluster). If you are deleting a cluster and may want the data later, export what you need before the deletion rather than relying on the preservation window.

## Recovery objectives and compliance documentation

Our recovery time and recovery point objectives are documented in our Business Continuity and Disaster Recovery Plan. That document, along with our SOC 2 Type II report and ISO 27001 certificate, is available through our trust center at [trust.phasetwo.io](https://trust.phasetwo.io/) by request — they are listed there, and access is granted on approval rather than being downloadable by anonymous visitors.

If you need recovery objectives, backup specifics, or a completed security questionnaire for a review, email [support@phasetwo.io](mailto:support@phasetwo.io) and we will route it appropriately.
