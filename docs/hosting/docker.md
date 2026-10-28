---
id: docker
title: Docker Image
description: Tags, runtime defaults, and a local quick start for the Phase Two Keycloak image.
---

The Phase Two image is published to Quay as [`quay.io/phasetwo/phasetwo-keycloak`](https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags). It is a drop-in replacement for the official Keycloak image: the same `kc.sh` entrypoint, the same configuration options, and the same `KC_*` environment variables, with the [Phase Two extensions](./index.md#what-is-in-the-image) added. Source, build instructions, and issues are at [p2-inc/phasetwo-containers](https://github.com/p2-inc/phasetwo-containers).

## Tags

Every build is tagged `<keycloak-version>.<build-timestamp>`, for example `26.8.1.1793136408`. Rolling tags point at the newest build on each line:

| Tag      | Points at                           |
| -------- | ----------------------------------- |
| `latest` | The newest build of any version     |
| `26`     | The newest `26.x.y` build           |
| `26.8`   | The newest `26.8.y` build           |
| `26.8.1` | The newest build of Keycloak 26.8.1 |

**Pin the full `<keycloak-version>.<build-timestamp>` tag in production.** Rolling tags move whenever a new build is published, which can change the Keycloak version or the extension versions under you on the next restart. See [Upgrading](./upgrading.md).

## Runtime

- Built on [Chainguard Wolfi](https://github.com/wolfi-dev), with only a Java runtime, `bash`, and a CA bundle installed
- OpenJDK 21
- Runs as a non-root user, uid and gid `2000`
- `linux/amd64` and `linux/arm64`
- A CycloneDX SBOM and SLSA provenance are attached to every published image

Retrieve the SBOM with:

```bash
docker buildx imagetools inspect --format '{{ json .SBOM }}' quay.io/phasetwo/phasetwo-keycloak:latest
```

### Defaults that differ from upstream Keycloak

| Setting              | Value   | Effect                                                                                              |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `KC_HEALTH_ENABLED`  | `true`  | `/health/live`, `/health/ready`, and `/health/started` are served on the management port, `9000`    |
| `KC_METRICS_ENABLED` | `true`  | Prometheus metrics are served on the management port, `9000`                                        |
| `KC_HTTP_ENABLED`    | `false` | Plaintext HTTP is off. Set it to `true` when TLS terminates at a load balancer, ingress, or sidecar |

Exposed ports are `8080` (HTTP), `8443` (HTTPS), and `9000` (health and metrics).

## Quick start

Run a throwaway instance in development mode, with no external database:

```bash
docker run --name phasetwo_test --rm -p 8080:8080 \
    -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
    -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
    -e KC_HTTP_RELATIVE_PATH=/auth \
    quay.io/phasetwo/phasetwo-keycloak:latest \
    start-dev \
    --spi-email-template-provider=freemarker-plus-mustache \
    --spi-email-template-freemarker-plus-mustache-enabled=true \
    --spi-theme-cache-themes=false
```

Open [http://localhost:8080/auth/](http://localhost:8080/auth/) and sign in as `admin` / `admin`. Development mode keeps data in the container and is not for production.

The three `--spi-…` options enable the email templating used by the Phase Two extensions and turn off theme caching so realm-level theme changes show up without a restart. Pass them in production as well.

## The `/auth` path

Phase Two clusters serve Keycloak under `/auth`, and every example in these docs assumes it, for example `https://<host>/auth/realms/<realm>/`. Set `KC_HTTP_RELATIVE_PATH=/auth` to match. If you serve Keycloak at the root instead, drop `/auth` from the paths in these docs.

## Running in production

For production, run `start` instead of `start-dev`, and configure at least:

- a database, see [Database](./database.md)
- `KC_HOSTNAME`, the public hostname of the server, for example `auth.example.com`
- TLS, either on Keycloak (`KC_HTTPS_CERTIFICATE_FILE` and `KC_HTTPS_CERTIFICATE_KEY_FILE`) or at a proxy, with `KC_HTTP_ENABLED=true` and `KC_PROXY_HEADERS` set to `xforwarded` or `forwarded` to match your proxy
- the bootstrap admin, `KC_BOOTSTRAP_ADMIN_USERNAME` and `KC_BOOTSTRAP_ADMIN_PASSWORD`, used only on the first start

The image is built without a database vendor, so the first `start` with `KC_DB` set rebuilds the server configuration before it starts. To skip that step, build your own image `FROM` a pinned Phase Two tag, run `kc.sh build` with your build options, and start it with `start --optimized`. The [Keycloak container guide](https://www.keycloak.org/server/containers) explains the pattern.

Use port `9000` for health checks and metrics: `/auth/health/ready` for readiness and `/auth/health/live` for liveness when the relative path is `/auth`.

The [docker-compose.yml](https://github.com/p2-inc/phasetwo-containers/blob/main/docker-compose.yml) in the containers repo is a working reference configuration with CockroachDB.
