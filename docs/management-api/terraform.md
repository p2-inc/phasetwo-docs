---
id: terraform
title: Terraform provider
sidebar_label: Terraform provider
description: Manage Phase Two clusters, realms, custom domains, IP rules, environment variables and extensions declaratively with the p2-inc/phasetwo Terraform provider.
keywords:
  - phasetwo terraform provider
  - keycloak terraform
  - terraform keycloak cluster
  - infrastructure as code keycloak
---

# Terraform provider

The [`p2-inc/phasetwo`](https://registry.terraform.io/providers/p2-inc/phasetwo) provider manages
the same resources as the [Management API](/api/management-api-index), declaratively. Its API
client is generated from the same OpenAPI spec that generates the reference, so the two stay in
step.

For anything resource-shaped — a cluster and the realms, domains and rules on it — this is less
code than driving the API, and it handles the parts that are tedious to get right by hand:
polling for `ACTIVE`, serializing the changes that restart Keycloak, and the deferred-delete
semantics.

## Setup

```hcl
terraform {
  required_providers {
    phasetwo = {
      source  = "p2-inc/phasetwo"
      version = "~> 0.1"
    }
  }
}

provider "phasetwo" {
  environment = "app" # or "app-staging"
}
```

Credentials come from the environment, which keeps them out of `.tf` files and out of state:

```bash
export PHASETWO_CLIENT_ID='...'
export PHASETWO_CLIENT_SECRET='...'
```

Both are from an API secret — see [API keys](/docs/management-api/api-keys). The provider does
the client-credentials exchange for you.

| Argument        | Environment variable     | Notes                                                        |
| --------------- | ------------------------ | ------------------------------------------------------------ |
| `client_id`     | `PHASETWO_CLIENT_ID`     |                                                              |
| `client_secret` | `PHASETWO_CLIENT_SECRET` | Sensitive                                                    |
| `access_token`  | `PHASETWO_ACCESS_TOKEN`  | Use a token you already hold instead; **not refreshed**      |
| `environment`   | `PHASETWO_ENVIRONMENT`   | `app` (default) or `app-staging`                             |
| `base_url`      | `PHASETWO_BASE_URL`      | Self-hosted or local; the auth root, overrides `environment` |
| `realm`         | `PHASETWO_REALM`         | Defaults to `self`                                           |

## A first cluster

Organizations and payment methods are **referenced, not managed** — both involve browser flows,
so create them in the console and look them up:

```hcl
data "phasetwo_organization" "team" {
  name = "acme"
}

data "phasetwo_payment_method" "default" {
  organization_id = data.phasetwo_organization.team.id
  default         = true
}

resource "phasetwo_cluster" "main" {
  name              = "acme-prod"
  region            = "US_EAST_1"
  tier              = "premium"
  organization_id   = data.phasetwo_organization.team.id
  payment_method_id = data.phasetwo_payment_method.default.id
}

resource "phasetwo_realm" "app" {
  cluster_id   = phasetwo_cluster.main.id
  name         = "app"
  display_name = "Acme Application"
}

output "keycloak_host" {
  value = phasetwo_cluster.main.host
}
```

`payment_method_id` is **required** here even though the API treats it as optional: omitting it
makes the API return a Stripe Checkout link, and Terraform cannot open a browser.

## What it manages

| Resource                                | Manages                                          |
| --------------------------------------- | ------------------------------------------------ |
| `phasetwo_cluster`                      | A dedicated cluster                              |
| `phasetwo_realm`                        | A realm (deployment) on a cluster                |
| `phasetwo_cluster_domain`               | A custom hostname, and the DNS records to create |
| `phasetwo_cluster_primary_host`         | Which domain the cluster serves on               |
| `phasetwo_cluster_ip_rules`             | Admin and realm IP allow/deny lists              |
| `phasetwo_cluster_environment_variable` | A custom SPI environment variable                |
| `phasetwo_cluster_extension`            | A custom provider or theme                       |
| `phasetwo_cluster_extension_version`    | A per-Keycloak-version build of one              |

Data sources: `phasetwo_organization`, `phasetwo_organizations`, `phasetwo_payment_method`,
`phasetwo_cluster`, `phasetwo_realm`, `phasetwo_regions`.

## Custom domains take two applies

By design, and the provider will not let you do it in one:

```hcl
resource "phasetwo_cluster_domain" "auth" {
  cluster_id = phasetwo_cluster.main.id
  host       = "auth.acme.com"
}

# Create these at your DNS provider from domain_records.
output "dns_records_to_create" {
  value = phasetwo_cluster_domain.auth.domain_records
}

# Second apply, once the records resolve and the certificate is issued.
resource "phasetwo_cluster_primary_host" "auth" {
  cluster_id = phasetwo_cluster.main.id
  host       = phasetwo_cluster_domain.auth.host
}
```

`wait_for_certificate` is off by default because turning it on in the same apply that produces
the records you have not yet created would deadlock. If your DNS is itself in Terraform, set it
with a `depends_on` covering those records.

## Things that will surprise you

**Every cluster argument forces replacement.** There is no in-place change to a cluster — not
the tier, not the region. Replacing destroys the cluster and every realm on it. Terraform says
so in the plan; read it.

**Destroy is deferred, and the name stays reserved.** Unless the cluster never completed billing
setup, `terraform destroy` moves it to `PENDING_DELETION` and teardown happens at the end of the
billing cycle. It bills until then, and the name is not free — so a create/destroy/recreate loop
under one name **will fail**. The provider warns on destroy. Use distinct names in ephemeral
environments.

**Env var and extension changes restart Keycloak.** The provider serializes them per cluster and
waits for each restart, so a config with several works — but an apply touching many takes as long
as that many restarts.

**A `SECRET` env var cannot be read back.** The API returns a mask, so the provider keeps the last
applied value in state and cannot detect a change made outside Terraform.

**Tier limits are server-side** and surface as 409s during apply:

| Tier         | Realms | Themes | Extensions | Domains | IP rules |
| ------------ | ------ | ------ | ---------- | ------- | -------- |
| `starter`    | 5      | 1      | 0          | 2       | 0        |
| `premium`    | 20     | 1      | 1          | 5       | 2        |
| `enterprise` | 100    | ∞      | ∞          | 15      | ∞        |

## Configuring what is inside the realm

The provider stops at the realm boundary — it creates realms, not the clients and identity
providers in them. Hand off to a Keycloak provider pointed at the cluster:

```hcl
provider "keycloak" {
  url       = phasetwo_cluster.main.host
  client_id = "admin-cli"
  # ...
}
```

That division mirrors the two APIs: `phasetwo_*` resources are the
[Management API](/api/management-api-index), and everything inside a realm is Keycloak's own API
plus our [Extensions API](/api/extensions-api-index).

## Local development

To run against a local Keycloak, point `base_url` at the auth root:

```hcl
provider "phasetwo" {
  base_url = "http://localhost:8080/auth"
  realm    = "self"
}
```

## Reference

Full schema for every resource and data source is on the
[Terraform Registry](https://registry.terraform.io/providers/p2-inc/phasetwo/latest/docs). The
source is at [p2-inc/terraform-provider-phasetwo](https://github.com/p2-inc/terraform-provider-phasetwo).
