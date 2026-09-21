---
id: regions
title: Available Regions
---

## Available Regions

A cluster's region is set at creation and **cannot be changed later**, so check
it against any data residency requirement before you launch. See the
[launch checklist](../getting-started/launch-checklist.md).

Dedicated clusters are available in the following regions using the self-service
dashboard:

- AWS Europe (Frankfurt) `eu-central-1`
- AWS US East (N. Virginia) `us-east-1`
- AWS US West (Oregon) `us-west-2`

If you wish to launch a dedicated cluster in one of the following regions, we can provision it for you with an additional monthly fee. Please contact [sales@phasetwo.io](mailto:sales@phasetwo.io) for more information.

- AWS Europe (Ireland) `eu-west-1`
- AWS Asia-Pacific (Mumbai) `ap-south-1`
- AWS Asia-Pacific (Singapore) `ap-southeast-1`
- GCP Europe (St. Ghislain) `europe-west1`
- GCP Asia-Pacific (Jurong West) `asia-southeast1`
- GCP South America (São Paulo) `southamerica-east1`
- GCP US Central (Iowa) `us-central1`
- GCP US East (South Carolina) `us-east1`
- GCP US West (California) `us-west2`

### Where your data stays

**Cluster data does not leave the region you chose.** For a cluster in Frankfurt
that means the Keycloak database, sessions, the event store and realm signing
keys all stay in `eu-central-1`.

**Backups for EU clusters are held in AWS Europe (Ireland) `eu-west-1`** — on
every EU cluster, on every plan, at no additional cost. That is why Ireland
appears in both lists above: running a *primary* cluster there is a paid option,
while *backing up* an EU cluster there is standard. An EU deployment therefore
stays inside the EU end to end, Frankfurt for the live cluster and Ireland for
its backups.

For the full breakdown of which class of data lives where, who can reach it, and
which of our own business systems run outside the EU, see [EU data residency](/hosting/eu-data-residency/).

### Global clusters

For use cases that require global proximity to users and region failover behavior, we are currently in _beta_ for our global clusters. Global server load balancing provides geographic region affinity and failover to connect your users with the closest, available instances.

These clusters are backed by [CockroachDB](https://www.cockroachlabs.com/) multi-region clusters, which are hosted and operated by Cockroach Labs. There are two price tiers for global clusters, depending on your use of our shared CockroachDB clusters, or your own dedicated clusters.

A global cluster spans regions by design, so if you have a data residency requirement, confirm the region set with us before launching one.

Please contact [sales@phasetwo.io](mailto:sales@phasetwo.io) to talk to us about your global cluster use case.
