---
title: Phase Two Releases Self Service Resource Management
slug: self-service-resource-management
date: 2025-09-22
authors: phasetwo
tags:
  [
    phase_two,
    hosting,
    self-service,
    resources,
    keycloak,
    extensions,
    themes,
    dedicated-clusters,
  ]
description: Phase Two now offers self-service resource management for dedicated clusters, allowing customers to easily add and remove resources through our dashboard.
---

We’re excited to announce the release of **Self-Service Resource Management** in the Phase Two Dash. This new capability empowers customers running **dedicated Keycloak clusters** to directly upload and manage their own resources—such as custom themes and extensions—without waiting for Phase Two intervention.

<!-- truncate -->

:::info
**Available for Dedicated Clusters Only**  
Self-Service Resource Management is an exclusive feature for Phase Two customers with dedicated Keycloak clusters. Shared or multi-tenant environments do not include this capability. Upgrade to a dedicated cluster plan to take advantage of this feature.
:::

## Why this matters

Traditionally, managing custom Keycloak resources in Kubernetes is complex, time-consuming, and error-prone. It often requires deep knowledge of deployment pipelines, containerization, and manual version tracking. With Self-Service Resource Management, Phase Two eliminates those hurdles by giving you a streamlined interface in the Dash to manage your resources safely and reliably.

Because this feature is only available for **dedicated clusters**, customers benefit from the highest level of flexibility, security, and control over their Keycloak environments.

## Key Features

- **Direct uploads**  
  Upload `.jar` files (themes or extensions) directly through the dashboard, tied to your dedicated cluster.

- **Versioning support**  
  Create and manage resource versions. You can pin versions to specific Keycloak builds, which is especially useful for testing compatibility with future major Keycloak releases.

- **Cluster-safe updates**  
  Phase Two automatically manages cluster restarts to ensure resources are applied without risking downtime or instability.

- **Faster release cycles**  
  Reduce dependency on Phase Two deployment reviews. Customers can move quickly, automate feature rollouts, and test updates on their own timeline.

- **Simplified workflows**  
  Avoid the overhead of Kubernetes resource management, CI/CD pipeline adjustments, and manual rollbacks. Resource management is as simple as point-and-click.

## What this means for customers

This feature brings enterprise-grade flexibility and speed to teams that rely on custom Keycloak deployments. Whether you’re testing a new extension for an upcoming Keycloak version or rolling out an updated theme across environments, you can now do it in minutes—not days. And with Phase Two’s guardrails in place, you still benefit from the reliability and security of our managed hosting platform.

---

Want to learn more? Log in to the [Phase Two Dash](https://dash.phasetwo.io) and try uploading your first resource today. This feature is included with all **dedicated cluster plans**. For any questions or concerns, please reach out to [support@phasetwo.io](mailto:support@phasetwo.io).
