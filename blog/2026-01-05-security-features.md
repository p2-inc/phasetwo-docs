---
title: Security Capabilities Now Available for Keycloak Clusters
slug: dedicated-clusters-security-capabilities
date: 2026-01-05
authors: phasetwo
tags: [phase_two, hosting, open_source, keycloak, security]
description: Enhance the security of your Keycloak clusters with new features available on the Phase Two Dash.
---

At Phase Two, we are committed to providing our customers with the most secure and reliable managed Keycloak hosting platform. As part of this commitment, we are excited to announce the release of new security capabilities for Keycloak clusters available through the Phase Two Dash.

<!-- truncate -->

## New Security Features

We have introduced the first of several new security features that can be easily configured through the Phase Two Dash. These features are designed to enhance the security posture of your Keycloak clusters and provide you with greater control over your authentication environment.

The initial set of security features includes the ability to configure **IP level access** to your Keycloak clusters. There are three types of IP restrictions you can apply:

1. **Admin Paths**: Restrict access to the administrative interfaces of your Keycloak instance (e.g., /admin, /auth/admin) to specific IP addresses or ranges. This ensures that only authorized personnel can access sensitive admin functions.
2. **Public Allowed Paths**: Specify IP addresses that are allowed to access public endpoints (e.g., /token). This is useful for limiting access to known clients while blocking all other traffic. Particularly useful for development and staging environments.
3. **Public Blocked Paths**: Block specific IP addresses from accessing public endpoints (e.g., /token). This allows you to prevent known malicious IPs from interacting with your Keycloak instance without affecting legitimate traffic. Or to just block abuse to your application for any reason.

## How to Configure Security Features

Visit your cluster's page > Config tab > Restrictions to manage IP restrictions for your Keycloak cluster. You can easily add or remove IP addresses or CIDR ranges for each type of restriction.

Learn more in the [Cluster Restrictions documentation](https://phasetwo.io/docs/self-service/restrictions/).

---

Want to learn more or have feedback? Log in to the [Phase Two Dash](https://dash.phasetwo.io) and try adding your IP restriction now. This feature is included with all **dedicated cluster plans**. For any questions or concerns, please reach out to [support@phasetwo.io](mailto:support@phasetwo.io).
