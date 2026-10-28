---
id: index
title: Self-Hosting
description: Run the Phase Two Keycloak image on your own infrastructure — what is in the image, what stays with the managed service, and where to start.
---

Phase Two publishes the same Keycloak image that runs our managed clusters, so you can run it on your own infrastructure. Organizations self-host when they have compliance, data residency, or network requirements that a managed service can't meet, or when they ship Keycloak inside their own product to customer sites.

If you don't have one of those requirements, the [managed service](/hosting/dedicated-clusters) is usually less work. See [Managed vs Self-Hosted](/hosting/self-host-vs-managed) for a side-by-side comparison, and [Pricing](/pricing) for support options when you self-host.

## What is in the image

The image is `quay.io/phasetwo/phasetwo-keycloak`. It is Keycloak built from the [p2-inc/keycloak](https://github.com/p2-inc/keycloak) fork, which differs from upstream only in adding CockroachDB support, plus the Phase Two extensions:

| Component               | What it does                                                                         | Source                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Organizations           | Multi-tenant organizations, roles, invitations, and domains, with APIs               | [p2-inc/keycloak-orgs](https://github.com/p2-inc/keycloak-orgs)                                             |
| Events                  | Event listeners, including webhooks                                                  | [p2-inc/keycloak-events](https://github.com/p2-inc/keycloak-events)                                         |
| Magic Link              | Passwordless login by email link or code                                             | [p2-inc/keycloak-magic-link](https://github.com/p2-inc/keycloak-magic-link)                                 |
| Themes                  | Login, email, and admin theme customization, including the `phasetwo-ui` admin theme | [p2-inc/keycloak-themes](https://github.com/p2-inc/keycloak-themes)                                         |
| Admin Portal            | Self-service portal for users and organization admins                                | [p2-inc/phasetwo-admin-portal](https://github.com/p2-inc/phasetwo-admin-portal)                             |
| IdP Wizards             | Guided SSO and directory sync setup                                                  | [p2-inc/idp-wizard](https://github.com/p2-inc/idp-wizard)                                                   |
| SCIM Server             | SCIM 2.0 user and group provisioning                                                 | [p2-inc/keycloak-scim-server](https://github.com/p2-inc/keycloak-scim-server)                               |
| Atomic Auth Flows       | Create and change authentication flows in a single API call                          | [p2-inc/keycloak-atomic-auth-flows](https://github.com/p2-inc/keycloak-atomic-auth-flows)                   |
| User Migration          | Migrate users from a legacy system on first login                                    | [daniel-frak/keycloak-user-migration](https://github.com/daniel-frak/keycloak-user-migration)               |
| Apple Identity Provider | Sign in with Apple                                                                   | [klausbetz/apple-identity-provider-keycloak](https://github.com/klausbetz/apple-identity-provider-keycloak) |

The image itself is built in the open at [p2-inc/phasetwo-containers](https://github.com/p2-inc/phasetwo-containers), which is also where to report image issues. For licensing, see [Open Source](../introduction/open-source.md).

## What stays with the managed service

Self-hosting gives you the server and the extensions. These are part of the managed service and are not in the image:

- The [dashboard](../self-service/index.md) for creating clusters and realms, custom domains, IP restrictions, logs, metrics, and environment variables
- Operation of the database, backups, and monitoring
- Version upgrades, security patching, and capacity planning
- The uptime [SLA](/company/sla) on Premium and Enterprise clusters

## Where to start

- [Docker image](./docker.md): tags, runtime defaults, and a local quick start
- [Database](./database.md): PostgreSQL or CockroachDB, and cache discovery
- [Kubernetes](./kubernetes.md): deploying with Helm or the Keycloak Operator
- [Upgrading](./upgrading.md): moving between image versions safely
- [On-prem distribution](./on-prem.md): shipping Keycloak to your customers' sites

Before going live, work through the [Keycloak Production Readiness Checklist](/blog/keycloak-production-checklist). Every server-level item in it applies when you self-host.
