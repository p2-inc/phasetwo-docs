---
id: kubernetes
title: Kubernetes
---

Phase Two's enhanced Keycloak offering is available to use via Kubernetes Helm.

Our recommendation for this is to leverage [Codecentric keycloakx chart](https://github.com/codecentric/helm-charts/tree/master/charts/keycloakx) with the following parameters:

- `image.repository` var set to `quay.io/phasetwo/phasetwo-keycloak`
- `args` var set to `--spi-email-template-provider=freemarker-plus-mustache --spi-email-template-freemarker-plus-mustache-enabled=true --spi-theme-cache-themes=false`

Report any problems to our [Containers repo](https://github.com/p2-inc/phasetwo-containers) when using the Phase Two [Docker images](https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags&tag=latest) in conjunction with it.

Do not use the Phase Two [Helm charts](https://github.com/p2-inc/helm-charts) now. It is deprecated.
