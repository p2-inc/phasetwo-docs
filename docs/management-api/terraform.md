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
providers in them. That division mirrors the two APIs: `phasetwo_*` resources are the
[Management API](/api/management-api-index), and everything inside a realm is Keycloak's own API
plus our [Extensions API](/api/extensions-api-index).

To manage what is inside a realm, hand off to the
[Keycloak provider](https://registry.terraform.io/providers/keycloak/keycloak/latest/docs) with a
credential scoped to that realm. Create one with
[`deployment.credential.create`](/api/management/deployments):

```bash
curl -s -X POST \
  "https://api.phasetwo.io/v2/deployments/$DEPLOYMENT_ID/credentials" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "terraform, ci pipeline"}'
```

```json
{
  "client_id": "terraform-9f3c1a2b",
  "client_secret": "…",
  "server_url": "https://my-cluster.phasetwo.io",
  "realm": "production",
  "description": "terraform, ci pipeline"
}
```

Everything the Keycloak provider needs is in that response:

```hcl
provider "keycloak" {
  url           = "https://my-cluster.phasetwo.io"
  realm         = "production"
  client_id     = "terraform-9f3c1a2b"
  client_secret = var.keycloak_client_secret
  initial_login = false
}
```

:::caution `initial_login = false` is not optional here

By default the Keycloak provider authenticates when Terraform *configures* it, which happens during
`terraform plan` — before anything has been created. If the same configuration also creates the
cluster, plan fails against a cluster that does not exist yet:

```
Error: error initializing keycloak provider
failed to perform initial login to Keycloak: ... 401 Unauthorized
```

`initial_login = false` defers the login until the provider first has to act on a resource, by
which point the cluster is up. The trade is that a wrong credential is no longer caught at plan
time — it surfaces during apply.

:::

:::caution The secret is shown once

It is not stored and cannot be read back. If you lose it, revoke the credential and create
another. `deployment.credential.list` returns the credentials that exist and what they are for,
but never their secrets.

:::

### This manual step is going away

Creating the credential out of band is interim. A `phasetwo_realm_credential` resource is planned,
which removes the manual step entirely — one `terraform apply` creates the cluster, the realm, the
credential, and then uses that credential to configure inside the realm:

```hcl
resource "phasetwo_realm_credential" "terraform" {
  deployment_id = phasetwo_realm.production.id
  description   = "terraform"
}

provider "keycloak" {
  url           = phasetwo_realm_credential.terraform.server_url
  realm         = phasetwo_realm_credential.terraform.realm
  client_id     = phasetwo_realm_credential.terraform.client_id
  client_secret = phasetwo_realm_credential.terraform.client_secret
  initial_login = false
}
```

Configuring a provider from a resource created in the same apply is usually a dead end in Terraform,
which is why this is worth spelling out: with `initial_login = false` it works, including
`terraform destroy` ordering. Until the resource ships, the steps above are the way to do it.

### Create one credential per holder

Each credential is independently revocable, so a credential per pipeline, per environment or per
engineer means a leak costs you one revocation rather than a rotation everywhere:

```bash
# list what exists
curl -s "https://api.phasetwo.io/v2/deployments/$DEPLOYMENT_ID/credentials" \
  -H "Authorization: Bearer $TOKEN" | jq

# revoke one
curl -s -X DELETE \
  "https://api.phasetwo.io/v2/deployments/$DEPLOYMENT_ID/credentials/terraform-9f3c1a2b" \
  -H "Authorization: Bearer $TOKEN"
```

Revoking deletes the client from the realm, so it takes effect immediately — any Terraform run
still holding it starts failing to authenticate rather than quietly continuing.

### Keep it out of state, and out of git

The Keycloak provider writes `client_secret` into `terraform.tfstate` in plain text. That is true
of any provider credential, but it is worth saying plainly because the state file travels: treat
the state backend as holding a realm-admin credential, and give it the access controls that
implies. Use a remote backend with encryption and restricted reads, pass the secret through a
variable rather than committing it, and do not reuse one credential across environments.

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
