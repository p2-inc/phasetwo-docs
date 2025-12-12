---
id: regions
title: Available Regions
---

## Available Regions

Dedicated clusters are currently available in the following regions using the self-service dashboard:

- AWS US East (N. Virginia) `us-east-1`
- AWS US West (Oregon) `us-west-2`
- AWS Europe (Frankfurt) `eu-central-1`

If you wish to launch a dedicated cluster in one of the following regions, we can provision it for you with an additional monthly fee. Please contact [sales@phasetwo.io](mailto:sales@phasetwo.io) for more information.

- AWS Asia-Pacific (Mumbai) `ap-south-1`
- AWS Asia-Pacific (Singapore) `ap-southeast-1`
- AWS Europe (Ireland) `eu-west-1`
- GCP Asia-Pacific (Jurong West) `asia-southeast1`
- GCP Europe (St. Ghislain) `europe-west1`
- GCP South America (São Paulo) `southamerica-east1`
- GCP US Central (Iowa) `us-central1`
- GCP US East (South Carolina) `us-east1`
- GCP US West (California) `us-west2`

### Global clusters

For use cases that require global proximity to users and region failover behavior, we are currently in _beta_ for our global clusters. Global server load balancing provides geographic region affinity and failover to connect your users with the closest, available instances.

These clusters are backed by [CockroachDB](https://www.cockroachlabs.com/) multi-region clusters, which are hosted and operated by Cockroach Labs. There are two price tiers for global clusters, depending on your use of our shared CockroachDB clusters, or your own dedicated clusters.

Please contact [sales@phasetwo.io](mailto:sales@phasetwo.io) to talk to us about your global cluster use case.
