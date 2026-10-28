---
id: upgrading
title: Upgrading
description: Move a self-hosted Phase Two Keycloak deployment to a newer image safely.
---

A new image is published whenever Keycloak releases a version or the bundled extensions change. Each image carries one Keycloak version and the extension versions built for it.

## Before you upgrade

1. **Pin tags.** Run a full `<keycloak-version>.<build-timestamp>` tag so that upgrades happen when you choose. A rolling tag such as `26` or `latest` can move to a different Keycloak minor version on the next restart.
2. **Back up the database.** Keycloak migrates its schema automatically on the first start of a new version, and the extensions migrate their own tables the same way. Migrations are not reversible, so a database backup is your rollback.
3. **Read the Keycloak notes** for every version between yours and the target, in the [Keycloak upgrading guide](https://www.keycloak.org/docs/latest/upgrading/) and the [Keycloak release notes](https://www.keycloak.org/docs/latest/release_notes/).
4. **Test in a staging environment** with a copy of production data, including your themes, custom providers, and realm configuration.

## Rolling out

- **Patch versions** of Keycloak, such as 26.8.0 to 26.8.1, can usually roll out node by node.
- **Minor and major versions** may change the cache or database layout in ways that running nodes can't share. Plan a short window in which every node is stopped before the new version starts, unless the Keycloak upgrade notes for that version say a rolling update is supported.

After the upgrade, check that the realms you depend on load, that login works through your main flows, and that health checks on port `9000` are green.

## Changes specific to the Phase Two image

### Admin console theme in 26.8.0

From image `26.8.0`, the admin console customizations ship as the **`phasetwo-ui`** theme in [keycloak-themes](https://github.com/p2-inc/keycloak-themes). The older `phasetwo.v2` admin theme was removed. Realms whose admin theme is set to `phasetwo.v2` fall back to the server default until you change it to `phasetwo-ui` under **Realm Settings > Themes**.

### Plaintext HTTP off by default

The image sets `KC_HTTP_ENABLED=false`. If TLS terminates in front of Keycloak, set `KC_HTTP_ENABLED=true` explicitly. See [Docker Image](./docker.md#defaults-that-differ-from-upstream-keycloak).

## Where to find what changed

Image changes are made in the open in [p2-inc/phasetwo-containers](https://github.com/p2-inc/phasetwo-containers/commits/main), and each extension's changes are in its own repository, listed on the [Self-Hosting overview](./index.md#what-is-in-the-image). Report problems with an image in the [phasetwo-containers issues](https://github.com/p2-inc/phasetwo-containers/issues).
