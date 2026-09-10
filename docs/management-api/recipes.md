---
id: recipes
title: Automation recipes
sidebar_label: Automation recipes
description: Worked Management API examples — provision a cluster, onboard a tenant realm, attach a custom domain, lock down admin access by IP, and rotate credentials.
keywords:
  - keycloak automation
  - provision keycloak cluster api
  - keycloak multi-tenant realm automation
---

# Automation recipes

End-to-end examples against the [Management API](/api/management-api-index). Each assumes you
have a token in `$TOKEN` and the two environment variables below — if not, start with
[API keys](/docs/management-api/api-keys).

```bash
export API=https://api.phasetwo.io/v2
export TOKEN="$(curl -s -X POST \
  https://app.phasetwo.io/auth/realms/self/protocol/openid-connect/token \
  -d grant_type=client_credentials \
  -d client_id="$PHASETWO_CLIENT_ID" \
  -d client_secret="$PHASETWO_CLIENT_SECRET" | jq -r .access_token)"
```

All examples use `curl` and `jq` for legibility. In real automation, reach for the
[Terraform provider](/docs/management-api/terraform) for anything resource-shaped — these
recipes are the imperative equivalent, useful when you need control Terraform does not give you.

---

## 1. Provision a cluster

The full path from nothing to a usable Keycloak.

### Pick an organization and a payment method

```bash
ORG_ID=$(curl -s $API/orgs -H "Authorization: Bearer $TOKEN" \
  | jq -r '.[] | select(.name=="acme") | .id')

PM_ID=$(curl -s $API/orgs/$ORG_ID/billing/payment-methods \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.is_default) | .id')
```

A saved payment method matters: supply `payment_method_id` and the subscription is charged
directly. **Omit it and the response is a Stripe Checkout link instead**, which needs a browser
and cannot be completed from a script.

### Check the name and region

Cluster names are globally unique and become part of the default hostname, so check before you
commit to one:

```bash
curl -s "$API/clusters/name-available?name=acme-prod" \
  -H "Authorization: Bearer $TOKEN" | jq
# { "name": "acme-prod", "available": true }

curl -s $API/clusters/regions -H "Authorization: Bearer $TOKEN" | jq -r '.[].name'
```

### Create it

```bash
CLUSTER=$(curl -s -X POST $API/clusters \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d @- <<JSON
{
  "name": "acme-prod",
  "region": "US_EAST_1",
  "tier": "premium",
  "billing_period": "MONTHLY",
  "org_id": "$ORG_ID",
  "payment_method_id": "$PM_ID"
}
JSON
)
CLUSTER_ID=$(echo "$CLUSTER" | jq -r '.cluster.id // .cluster_id')
```

The response has [three shapes](/api/management/clusters), and which one you get depends on the
payment method:

| Response                | Meaning                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| `cluster` set           | Charged and created. This is the scriptable path                    |
| `link` set              | No payment method given — open the Stripe Checkout URL in a browser |
| `requires_action: true` | The card needs 3-D Secure. Complete `client_secret` with Stripe.js  |

Only the first is automatable end to end. Handle the others by failing loudly rather than
silently doing nothing.

### Wait for ACTIVE

Creation returns before the cluster exists. Provisioning takes a few minutes:

```bash
until [ "$(curl -s $API/clusters/$CLUSTER_ID \
    -H "Authorization: Bearer $TOKEN" | jq -r .status)" = "ACTIVE" ]; do
  sleep 20
done
HOST=$(curl -s $API/clusters/$CLUSTER_ID -H "Authorization: Bearer $TOKEN" | jq -r .host)
echo "cluster up at $HOST"
```

States you may pass through: `BILLING_SETUP` → `PENDING_PAYMENT` → `PROVISIONING` → `ACTIVE`.
`SETUP_EXCEPTION` means it failed — stop and look, do not retry blindly.

---

## 2. Onboard a tenant with its own realm

The common multi-tenant pattern: one realm per customer, created on demand.

```bash
curl -s -X POST $API/clusters/$CLUSTER_ID/deployments \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"tenant-acme"}'
```

The name becomes the Keycloak realm name — max 255 characters, lowercased automatically, and
rejected if reserved. Check first with
`GET /clusters/$CLUSTER_ID/deployments/name-available?name=...` if the name is user-supplied.

Realm count is capped by tier (starter 5, premium 20, enterprise 100); exceeding it returns 409.

### Then configure it with Keycloak's own API

The realm arrives empty. Everything inside it — clients, identity providers, users — is the
realm's own API, on the **cluster's** host:

```bash
# a link that signs an admin straight into the new realm's console
curl -s -X POST $API/deployments/$DEPLOYMENT_ID/console-link \
  -H "Authorization: Bearer $TOKEN" | jq -r .link

# or a token scoped to that deployment, for driving its Admin REST API
curl -s -X POST $API/deployments/$DEPLOYMENT_ID/token \
  -H "Authorization: Bearer $TOKEN" | jq -r '.access_token, .base_url'
```

That token plus `base_url` is the handoff point between the two APIs: from here you are talking
to Keycloak, using [the Extensions API](/api/extensions-api-index) for organizations and SCIM
and Keycloak's own admin API for the rest.

### Import an existing realm instead

To migrate a realm you already have, post its export as multipart:

```bash
curl -s -X POST $API/clusters/$CLUSTER_ID/deployments/import \
  -H "Authorization: Bearer $TOKEN" \
  -F file=@realm-export.json \
  -F deployment-name=tenant-acme
```

The import is asynchronous — poll the deployment until it leaves `PENDING`. **Users are not
supported in the file**; an export containing a `users` array is rejected. Migrate users
separately.

---

## 3. Attach a custom domain

Three steps, because DNS is involved and you own that part.

```bash
DOMAIN=$(curl -s -X POST $API/clusters/$CLUSTER_ID/domains \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"host":"auth.acme.com"}')
DOMAIN_ID=$(echo "$DOMAIN" | jq -r .domain.id)
```

**Create the DNS records it returns**, at your DNS provider:

```bash
curl -s $API/clusters/$CLUSTER_ID/domains/$DOMAIN_ID/status \
  -H "Authorization: Bearer $TOKEN" | jq '.domain.domain_records'
```

Then wait for the certificate, and only then promote it:

```bash
until [ "$(curl -s $API/clusters/$CLUSTER_ID/domains/$DOMAIN_ID/status \
    -H "Authorization: Bearer $TOKEN" | jq -r .certificate_status)" = "ISSUED" ]; do
  sleep 60
done

curl -s -X PUT $API/clusters/$CLUSTER_ID/host \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"host":"auth.acme.com"}'
```

Order matters. Promoting before the certificate is issued returns 409, and the promotion also
probes the host for reachability before switching — so a domain that does not resolve yet is
refused rather than half-applied.

---

## 4. Lock down admin access by IP

```bash
curl -s -X POST $API/clusters/$CLUSTER_ID/ip-rules \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d @- <<'JSON'
{
  "adminAllowedIpRules": [
    { "alias": "office",  "address": "203.0.113.0/24" },
    { "alias": "ci",      "address": "198.51.100.7/32" }
  ]
}
JSON
```

:::warning This replaces the whole category

Each category you include becomes the complete set — rules you omit are **removed**. To add one
rule, read the current list, append, and send the whole thing. Omit a category entirely to leave
it untouched.

Locking admin access to an allowlist that does not include you locks _you_ out of the admin
console. Include your own egress IP.
:::

Rule counts are capped by tier (premium 2, enterprise unlimited, starter none).

---

## 5. Set an environment variable (and handle the restart)

Custom SPI configuration. Names must not start with `KC_` unless they start with `KC_SPI_`:

```bash
curl -s -X POST $API/clusters/$CLUSTER_ID/env-vars \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"KC_SPI_MY_PROVIDER_TIMEOUT","value":"30","type":"STRING"}'
```

**This restarts Keycloak.** The API rejects a second restart-inducing change while one is in
flight, with a 409. To apply several, serialize them:

```bash
wait_for_restart() {
  while [ "$(curl -s $API/clusters/$CLUSTER_ID/restart-status \
      -H "Authorization: Bearer $TOKEN" | jq -r .restart_in_progress)" = "true" ]; do
    sleep 15
  done
}

for kv in "KC_SPI_A=1" "KC_SPI_B=2"; do
  wait_for_restart
  curl -s -X POST $API/clusters/$CLUSTER_ID/env-vars \
    -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
    -d "{\"name\":\"${kv%%=*}\",\"value\":\"${kv#*=}\",\"type\":\"STRING\"}"
done
```

A `SECRET`-typed variable's value cannot be read back — reads return a mask — so keep the source
of truth wherever you generated it.

---

## 6. Rotate an API secret with no downtime

The two credentials coexist, so overlap them:

```bash
NEW=$(curl -s -X POST $API/orgs/$ORG_ID/secrets \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"ci-2026-09","roles":["manage-clusters","view-organization"]}')

echo "$NEW" | jq -r '.client_id, .client_secret'   # secret is shown ONLY here
```

Deploy the new pair, confirm traffic has moved, then revoke the old:

```bash
curl -s -X DELETE $API/orgs/$ORG_ID/secrets/$OLD_SECRET_ID \
  -H "Authorization: Bearer $TOKEN"
```

Already-issued tokens survive until they expire — revocation is not retroactive. Cap of 10
secrets per organization, so clean up as you go.

---

## 7. Pull logs

```bash
curl -s "$API/clusters/$CLUSTER_ID/logs?from=2026-09-01T00:00:00Z&max=20" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[].file_name'
```

The listing has no download URLs. Fetch one file at a time to get a short-lived presigned URL:

```bash
URL=$(curl -s "$API/clusters/$CLUSTER_ID/logs/$(printf %s "$FILE" | jq -sRr @uri)?minutes=10" \
  -H "Authorization: Bearer $TOKEN" | jq -r .temp_url)
curl -s "$URL" | gunzip | head
```

Log paths contain slashes, so URL-encode the path segment — that is what the `jq -sRr @uri`
is doing.

---

## Error handling worth building in

| Status | Meaning                                                         | What to do                                  |
| ------ | --------------------------------------------------------------- | ------------------------------------------- |
| `401`  | Token expired or absent                                         | Re-exchange and retry once                  |
| `403`  | Secret lacks the organization role                              | Fix the roles; do not retry                 |
| `409`  | Conflict — restart in flight, name taken, tier cap, wrong state | Back off and poll, or fail with the message |
| `400`  | Validation                                                      | Read the body; it names the field           |

409 is the one worth special-casing: it is the API telling you _not yet_ rather than _no_, and
the body distinguishes the cases.
