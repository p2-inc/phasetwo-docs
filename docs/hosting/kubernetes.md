---
id: kubernetes
title: Kubernetes
description: Deploy the Phase Two Keycloak image on Kubernetes with the codecentric keycloakx Helm chart or the Keycloak Operator.
---

The Phase Two image works with any Kubernetes tooling that deploys upstream Keycloak. We recommend one of two options:

- the [codecentric `keycloakx` Helm chart](https://github.com/codecentric/helm-charts/tree/master/charts/keycloakx), if you deploy with Helm
- the [Keycloak Operator](https://www.keycloak.org/operator/installation), if you prefer an operator and custom resources

Either way, the settings that matter are the ones on the [Docker Image](./docker.md) and [Database](./database.md) pages. This page shows how to express them.

## Helm: codecentric keycloakx

Add the chart repository:

```bash
helm repo add codecentric https://codecentric.github.io/helm-charts
helm repo update
```

A starting `values.yaml` for PostgreSQL behind an ingress that terminates TLS:

```yaml
image:
  repository: quay.io/phasetwo/phasetwo-keycloak
  # Pin a full build tag. See "Tags" on the Docker Image page.
  tag: "26.8.1.1793136408"

# The image runs as uid/gid 2000; the chart defaults to 1000.
podSecurityContext:
  fsGroup: 2000
securityContext:
  runAsUser: 2000
  runAsGroup: 2000
  runAsNonRoot: true

command:
  - "/opt/keycloak/bin/kc.sh"
  - "start"
  - "--spi-email-template-provider=freemarker-plus-mustache"
  - "--spi-email-template-freemarker-plus-mustache-enabled=true"
  - "--spi-theme-cache-themes=false"

# Every Phase Two doc assumes the /auth path. This is also the chart default.
http:
  relativePath: "/auth"

# TLS terminates at the ingress, so Keycloak serves HTTP behind it.
proxy:
  enabled: true
  mode: xforwarded
  http:
    enabled: true

database:
  vendor: postgres
  hostname: db.example.internal
  port: 5432
  database: keycloak
  username: keycloak
  existingSecret: keycloak-db
  existingSecretKey: password

extraEnv: |
  - name: KC_HOSTNAME
    value: auth.example.com
  - name: KC_BOOTSTRAP_ADMIN_USERNAME
    valueFrom:
      secretKeyRef:
        name: keycloak-bootstrap-admin
        key: username
  - name: KC_BOOTSTRAP_ADMIN_PASSWORD
    valueFrom:
      secretKeyRef:
        name: keycloak-bootstrap-admin
        key: password

ingress:
  enabled: true
  # Fill in your ingress class, rules, and TLS. See the chart README.
```

```bash
helm install keycloak codecentric/keycloakx -f values.yaml
```

Notes:

- **Probes.** The chart's liveness, readiness, and startup probes already target the management port (`9000`) under the relative path, so they work with the image as is.
- **Cache discovery.** The chart's default cache stack is `jdbc-ping`, which uses the database for discovery between nodes. No extra service or network policy is needed for it.
- **CockroachDB.** Set `database.vendor: cockroach` and add `KC_DB_URL_PROPERTIES` with `useCockroachMetadata=true` to `extraEnv`. See [Database](./database.md#cockroachdb).
- **User and group IDs.** If your cluster enforces a specific UID range, as OpenShift does, follow your platform's guidance instead of the `2000` values above.

The chart's [README](https://github.com/codecentric/helm-charts/tree/master/charts/keycloakx) covers ingress, autoscaling, custom themes, and the rest of its options.

## Keycloak Operator

The [Keycloak Operator](https://www.keycloak.org/operator/installation) manages Keycloak through a `Keycloak` custom resource. Point it at the Phase Two image:

```yaml
apiVersion: k8s.keycloak.org/v2alpha1
kind: Keycloak
metadata:
  name: keycloak
spec:
  image: quay.io/phasetwo/phasetwo-keycloak:26.8.1.1793136408
  # The image isn't pre-built for your database, so let Keycloak build on start.
  startOptimized: false
  db:
    vendor: postgres
    host: db.example.internal
    database: keycloak
    usernameSecret:
      name: keycloak-db
      key: username
    passwordSecret:
      name: keycloak-db
      key: password
  http:
    tlsSecret: keycloak-tls
  hostname:
    hostname: auth.example.com
  additionalOptions:
    - name: http-relative-path
      value: /auth
    - name: spi-email-template-provider
      value: freemarker-plus-mustache
    - name: spi-email-template-freemarker-plus-mustache-enabled
      value: "true"
    - name: spi-theme-cache-themes
      value: "false"
```

Use an operator version that matches the image's Keycloak version. If you build your own optimized image `FROM` the Phase Two image, as described on the [Docker Image](./docker.md#running-in-production) page, you can leave `startOptimized` at its default.
