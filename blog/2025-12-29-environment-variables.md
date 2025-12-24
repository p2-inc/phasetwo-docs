---
title: Configure Environment Variables for Dedicated Keycloak Clusters
slug: dedicated-clusters-environment-variables
date: 2025-12-29
authors: phasetwo
tags: [phase_two, hosting, open_source, keycloak]
description: How to set environment variables for dedicated Keycloak clusters on the Phase Two Dash
---

Phase Two has been storming ahead with our managed Keycloak hosting platform, [dash.phasetwo.io](https://dash.phasetwo.io). As part of our commitment to providing flexible and powerful hosting solutions, we are excited to announce that users can now set environment variables for their dedicated Keycloak clusters directly through the Phase Two Dash.

<!-- truncate -->

## Why Environment Variables?

Environment variables are a crucial aspect of configuring and managing applications. They allow you to customize the behavior of your Keycloak instances without modifying the underlying code or configuration files. This is especially important for managing sensitive information such as API keys and other configuration settings. For customers building custom Keycloak extensions or integrating with third-party services, the ability to set environment variables is essential.

With this new feature, you can easily manage your Keycloak cluster's environment variables through a user-friendly interface, streamlining the deployment and configuration process. Updates are applied seamlessly, requiring no downtime for your authentication services.

## How to Set Environment Variables

Within your cluster, visit your cluster's page > Config tab > Keycloak features. From there, you can add new environment variables or remove existing ones. You have the option to set variables as plaintext or as secrets, ensuring that sensitive information remains secure.

Learn more in the [Environment Variables documentation](https://phasetwo.io/docs/self-service/environment-variables/).

---

Want to learn more or have feedback? Log in to the [Phase Two Dash](https://dash.phasetwo.io) and try adding your first environment variable. This feature is included with all **dedicated cluster plans**. For any questions or concerns, please reach out to [support@phasetwo.io](mailto:support@phasetwo.io).
