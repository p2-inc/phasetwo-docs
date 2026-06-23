---
id: dashboard-overview
title: Dashboard Overview
---

The Dashboard is the application for interacting with the Phase Two application. It runs off our [APIs](../api/index.md) meaning you can setup and automate any part of this for your own use-cases.

## Login/Register

<figure>
  <img src="/docs/dash-login.png" className="max-w-xl"  alt="Phase Two Dash Login" />
  <figcaption>Login</figcaption>
</figure>

Learn more about the [Login process](./access.md)

## Overview

A general view of the current infrastructure that your team has, including the number of realms and dedicated clusters you have access to. New users see quick-start cards to create their first cluster; once you have infrastructure, the page summarizes it with at-a-glance stats and per-section detail.

<!-- <figure>
  <img src="/docs/dashboard/overview.png" className="max-w-3xl"  alt="Phase Two Dash Overview" />
  <figcaption>Overview</figcaption>
</figure> -->

## Clusters

Dedicated infrastructure from Phase Two is known as a Cluster. This is a highly-available setup for running your Keycloak instance. For more information, view our [Clusters](./dedicated-clusters.md) page.

<figure>
  <img src="/docs/dashboard/clusters.png" className="max-w-3xl"  alt="Phase Two Dash Cluster" />
  <figcaption>Cluster</figcaption>
</figure>

## Realms

Single realms have historically been used for testing or trialing Phase Two. For a specific realm, launch the Keycloak Admin UI by clicking "console". For more information, view our [Realms](./deployments.md) page.

Single realms are being replaced by the [Starter](./create-a-cluster.md) dedicated cluster tier; new projects should start with a Starter cluster, while existing single realms remain accessible.

<figure>
  <img src="/docs/dashboard/realms.png" className="max-w-3xl"  alt="Phase Two Dash Realms" />
  <figcaption>Realms</figcaption>
</figure>

## Team

Teams are the way in which you add team members to access either your realm or dedicated cluster. For more information, view our [team](./your-organization.md) page.

<figure>
  <img src="/docs/dashboard/team.png" className="max-w-3xl"  alt="Phase Two Dash Team" />
  <figcaption>Team</figcaption>
</figure>
