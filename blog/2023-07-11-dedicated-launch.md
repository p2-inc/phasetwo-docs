---
slug: dedicated-launch
title: Launching Dedicated Clusters
author: Phase Two
tags: [ release, keycloak, phase_two, cockroach ]
---

We're excited today to announce the launch of our dedicated clusters offering. Our Phase Two enhanced Keycloak distribution is now available as a hosted, dedicated cluster in the region of your choice.

About 9 months ago, we launched our self-service, shared deployments, offering customers the ability to [create](https://phasetwo.io/dashboard/) Phase Two enhanced Keycloak realms on our shared clusters. Over that period, we've provided over 700 free realms for testing and small production use cases. Many of you have reached out to us asking about an SLA, isolated resources, and ability to grow into larger use cases. Based on your requests and feedback, we built out our dedicated cluster offering.

### What is Phase Two again?

Phase Two helps SaaS builders accelerate time-to-market and enterprise adoption with powerful SSO, identity and user management features. To that end, Phase Two has created an enhanced distribution of [Keycloak](https://www.keycloak.org/) that bundles several essential open source extensions for modern SaaS use cases. We support hosted and on-prem customers for a variety of use cases.

### Why dedicated?

Dedicated clusters allow us to provide compute, network and storage isolation for customer workloads, and to easily deploy in the region where customer's users are. With dedicated clusters, we can guarantee an [SLA](docs/sla) that meets customer's needs with no resource contention from other customers.

### How did you do it?

We built out our dedicated cluster offering using the best-of-breed open source tools and managed services.

The core consists of Kubernetes clusters in each supported AWS and GCP region. New dedicated clusters are provisioned instantly using FluxCD, a continuous delivery solution that gives us the history and auditability of git. Monitoring and alerting is done using Prometheus, Grafana, and a suite of external services that give us a complete view of cluster health.

The database tier uses a managed CockroachDB service provided by [Cockroach Labs](https://www.cockroachlabs.com/). Phase Two is the only provider that is capable of hosting the current Keycloak distribution (the "legacy" store) using CockroachDB. Working with Cockroach Labs gives us the expertise and reliability from hosting thousands of customer clusters at massive scale. 

### Take me to it!

Starting today, you'll be able to [log into the updated dashboard](https://phasetwo.io/dashboard), and create your dedicated cluster by selecting a region and setting up your billing information.

![](/docs/dedicated-clusters-create.png)

Following successful billing setup, you will be returned to the Dashboard while your Cluster is provisioned. Once provisioned, you'll be able to create up to 20 realms per cluster, using the same easy setup as you are used to in the shared deployment offering.

![](/docs/dedicated-clusters-pending.png)

### How much does it cost?

[Plans](https://phasetwo.io/#pricing) start at $499US per month when paid annually. This provides a set of compute, network and storage resources that have been tested for common use cases for up to 20 realms and 1 million users. If your use case is uncommon or you plan to scale beyond that, our system is designed to scale up with your needs. Our plans scale linearly with resource demands beyond our minimums.

We will continue to support a robust Free tier. 

### What's next? (psst... Global clusters)

Many of our on-prem, suppport customers with large use cases asked us to build out a solution for massive-scale, fault-tolerant, multi-region use cases. One of the great parts of building support for Keycloak's existing storage system for CockroacDB is that we've been able to explore use cases that were previously impossible using the standard Keycloak distribution, or required complex, error-prone configurations. For use cases with these requirements, plus global proximity to users and regional failover, we built global clusters, backed by CockroachDB multi-region database, for which we are now in *beta*.

These clusters provide a minimum of 3 global regions, with 3 instances of Phase Two enhanced Keycloak per region. Global server load balancing provides geographic region affinity and failover to connect your users with the closest, available instances.

There will be two price tiers for global clusters, depending on your use of our shared CockroachDB clusters, or your own dedicated clusters. We expect to launch general availability of global clusters later in Q3 2023.

Please contact [sales@phasetwo.io](mailto:sales@phasetwo.io) to talk to us about your global cluster use case.



