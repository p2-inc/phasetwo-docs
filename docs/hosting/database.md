---
id: database
title: Database
description: Configure PostgreSQL or CockroachDB for the Phase Two Keycloak image, and cache discovery between nodes.
---

The Phase Two image supports every database upstream Keycloak supports, plus CockroachDB. PostgreSQL is the simplest choice for most self-hosted deployments.

## PostgreSQL

Configure PostgreSQL exactly as you would for upstream Keycloak. The driver is included.

```bash
KC_DB=postgres
KC_DB_URL_HOST=db.example.internal
KC_DB_URL_PORT=5432
KC_DB_URL_DATABASE=keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=<from your secret store>
```

See the [Keycloak database guide](https://www.keycloak.org/server/db) for the full set of options.

## CockroachDB

Phase Two runs its managed clusters on CockroachDB. The image includes the CockroachDB JDBC driver, and Keycloak is built from the [p2-inc/keycloak](https://github.com/p2-inc/keycloak) fork, which adds CockroachDB support.

```bash
KC_DB=cockroach
KC_DB_URL_HOST=crdb.example.internal
KC_DB_URL_PORT=26257
KC_DB_URL_DATABASE=keycloak
KC_DB_URL_PROPERTIES=?sslmode=verify-full&useCockroachMetadata=true
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=<from your secret store>
```

- **`useCockroachMetadata=true` is required** in `KC_DB_URL_PROPERTIES`.
- If you set `KC_DB_URL` directly, it uses the `jdbc:cockroachdb://…` scheme, not `jdbc:postgresql://…`.
- The CockroachDB driver is a provider in `/opt/keycloak/providers/`. If you build a custom image on top of this one with a multi-stage build, copy the `providers/` directory across so the driver comes with it.

The containers repo's [docker-compose.yml](https://github.com/p2-inc/phasetwo-containers/blob/main/docker-compose.yml) runs Keycloak against a single-node CockroachDB and is a working starting point.

## Cache discovery between nodes

When you run more than one Keycloak node, the nodes must find each other to share their caches. Since Keycloak 26.1, the default transport stack is `jdbc-ping`, which uses a table in the Keycloak database for discovery, so no extra network configuration is needed as long as every node uses the same database.

The image also ships `cache-ispn-jdbc-ping.xml`, a minimal cache configuration you can select with `KC_CACHE_CONFIG_FILE=cache-ispn-jdbc-ping.xml` if you manage the cache configuration file yourself. See the [Keycloak caching guide](https://www.keycloak.org/server/caching) for the other transport stacks.
