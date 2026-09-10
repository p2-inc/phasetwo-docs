---
title: "Your Keycloak Infrastructure, Now Scriptable: The Phase Two Management API"
slug: phasetwo-management-api
date: 2026-09-15
draft: true
authors: [gpatil]
tags: [phase_two, keycloak, api, automation, dedicated-clusters, config_as_code]
description: Every action in the Phase Two console is now an API call — create clusters, add realms, attach custom domains, manage extensions and IP rules. 73 endpoints, authenticated with an API secret and the client credentials grant.
---

Everything you can do in the Phase Two console, you can now do from code.

Create a dedicated Keycloak cluster. Add a realm to it. Attach a custom domain and watch the
certificate get issued. Upload a custom provider. Restrict the admin console to your office IP
range. Pull yesterday's logs. **73 endpoints**, one API secret, no browser.

<!--truncate-->

## Why this exists

Phase Two runs dedicated Keycloak clusters. Until now, provisioning one meant clicking through
the console — which is fine the first time, and less fine when you are standing up a realm per
customer, rebuilding a staging environment weekly, or trying to make a production change with a
reviewable audit trail.

The console was the only interface. Now it is one of two.

## The shape of it

The Management API is the **control plane**. It manages clusters themselves and everything
attached to them:

|                    |                                                                              |
| ------------------ | ---------------------------------------------------------------------------- |
| **Clusters**       | Create, inspect, delete; regions, name availability, metrics, restart status |
| **Realms**         | Add and remove realms on a cluster; import an existing realm export          |
| **Custom domains** | Attach a hostname, read the DNS records to create, promote to primary        |
| **Extensions**     | Upload custom providers and themes, manage per-version builds                |
| **Configuration**  | Custom SPI environment variables; admin and realm IP allow/deny lists        |
| **Operations**     | List and download logs                                                       |
| **Billing**        | Subscriptions, payment methods, billing contacts                             |

What it deliberately does _not_ do is touch the inside of a realm. There is no endpoint here to
create a user or a client — those belong to Keycloak's own Admin REST API, and to
[our extensions to it](https://phasetwo.io/api/extensions-api-index), pointed at your cluster.

The division is clean, and it is worth internalising because it is the thing people trip on: the
**Management API gets you a realm; Keycloak's API configures it.** One creates the box, the other
works inside it.

## Getting a token

An **API secret** is an OIDC client-credentials client scoped to your team. Create one in the
console under your team's **API Credentials** tab — you get a client ID and secret, and the
secret is shown exactly once.

Then the standard exchange:

```bash
TOKEN=$(curl -s -X POST \
  https://app.phasetwo.io/auth/realms/self/protocol/openid-connect/token \
  -d grant_type=client_credentials \
  -d client_id="$PHASETWO_CLIENT_ID" \
  -d client_secret="$PHASETWO_CLIENT_SECRET" | jq -r .access_token)

curl -s https://api.phasetwo.io/v2/clusters -H "Authorization: Bearer $TOKEN" | jq
```

Note the two hostnames. You authenticate against `app.phasetwo.io` — the console host, which
owns the token endpoint — and call `api.phasetwo.io`. Two different hosts in one script is
unusual enough to deserve a comment where you write it down.

## Least privilege is real here

An API secret holds **organization roles**, and the API checks them per operation. A secret
created with only view roles returns `200` on reads and `403` on writes.

That makes read-only credentials genuinely useful rather than aspirational:

```bash
# a monitoring job's secret: view roles only
curl -s $API/clusters/$ID/metrics -H "Authorization: Bearer $TOKEN"   # 200
curl -s -X DELETE $API/clusters/$ID -H "Authorization: Bearer $TOKEN" # 403
```

You can only grant roles you hold yourself, so a secret cannot escalate. Create one per consumer
rather than one shared credential with everything — revoking a narrow secret then does not break
four other jobs. Ten per organization.

## Provision a cluster, end to end

The bit worth showing in full, because the asynchronous parts are where hand-written automation
usually goes wrong:

```bash
# 1. Which org, and which saved card
ORG_ID=$(curl -s $API/orgs -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[] | select(.name=="acme") | .id')
PM_ID=$(curl -s $API/orgs/$ORG_ID/billing/payment-methods \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.is_default) | .id')

# 2. Create it
CLUSTER_ID=$(curl -s -X POST $API/clusters \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"name\":\"acme-prod\",\"region\":\"US_EAST_1\",\"tier\":\"premium\",
       \"billing_period\":\"MONTHLY\",\"org_id\":\"$ORG_ID\",
       \"payment_method_id\":\"$PM_ID\"}" | jq -r '.cluster.id')

# 3. Wait. Creation returns before the cluster exists.
until [ "$(curl -s $API/clusters/$CLUSTER_ID \
    -H "Authorization: Bearer $TOKEN" | jq -r .status)" = "ACTIVE" ]; do
  sleep 20
done

# 4. A realm on it
curl -s -X POST $API/clusters/$CLUSTER_ID/deployments \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"tenant-acme"}'
```

Supply `payment_method_id` and the subscription is charged directly. **Omit it and you get a
Stripe Checkout link back instead** — which needs a browser and cannot be completed from a
script. That is the single most common surprise, so the response has three documented shapes and
your automation should branch on which one it got.

## Three things that will bite you

We would rather tell you now than have you find out on a Friday.

**Provisioning is asynchronous.** `POST /clusters` returns before the cluster exists. Poll
`status` until `ACTIVE`; don't sleep-and-hope.

**Some changes restart Keycloak.** Adding an environment variable or reconciling extensions
restarts the cluster's Keycloak. The API refuses a second one while the first is in flight — a
`409`, deliberately, rather than queuing it silently. Watch `restart-status` and serialize.

**Deleting a cluster is deferred, and the name stays reserved.** Unless it never completed
billing setup, delete moves the cluster to `PENDING_DELETION`, bills to the end of the period,
and holds its name. A create/destroy/recreate loop on one name will fail on the second create.
Use distinct names in ephemeral environments.

## The spec is the product

The whole surface is one OpenAPI 3 document, and it is what generates the reference pages:

- [`/openapi-management.yaml`](https://phasetwo.io/openapi-management.yaml)
- [`/openapi-management.json`](https://phasetwo.io/openapi-management.json)

Operation IDs are `{resource}.{operation}` — `cluster.list`, `cluster.domain.detail`,
`org.apiSecret.create` — mirroring the URL hierarchy, so an ID tells you where an endpoint sits
without a lookup. Generated clients derive method names from them, which is also why they are
stable.

Point a generator at it and you have a client in whatever language you like. Or don't: we have
already done it for Terraform, and that is [Thursday's post](/blog/phasetwo-terraform-provider).

## Start here

- [**API keys**](https://phasetwo.io/docs/management-api/api-keys) — create a secret, get a
  token, make a call
- [**Automation recipes**](https://phasetwo.io/docs/management-api/recipes) — provision a
  cluster, onboard a tenant, attach a domain, rotate credentials
- [**API reference**](https://phasetwo.io/api/management-api-index) — all 73 endpoints with
  try-it

Available now to every Phase Two account. If you build something with it we would like to hear
about it.
