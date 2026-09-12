---
id: api-keys
title: API keys
sidebar_label: API keys
description: Create an API secret for your Phase Two organization, exchange it for an access token with the client credentials grant, and make your first Management API call.
keywords:
  - phase two api key
  - phase two api secret
  - client credentials grant
  - keycloak service account token
---

# API keys

An **API secret** is how code authenticates to the [Management API](/api/management-api-index).
It is an OIDC client with the client credentials grant enabled: you get a client ID and a client
secret, you exchange them for a short-lived access token, and you send that token as a bearer
header.

There is no long-lived "API key" header. If you have used APIs where a single static key goes in
every request, the difference here is one extra step — a token exchange — in return for tokens
that expire on their own.

## 1. Create the secret

In the console:

1. Go to **Teams** and open the team (organization) that owns the clusters you want to manage.
2. Open the **API Credentials** tab.
3. **Create credential**. Give it a name, and select the organization roles it should hold.
4. Copy the **client secret**.

:::danger The client secret is shown once

It is not recoverable. Every later read of the credential returns `********` for the secret
field. If you lose it, revoke the credential and create another — there is no reset.
:::

You need `manage-organization` and `view-organization` on the team to manage its credentials. An
organization may hold **at most 10** API secrets; creating an eleventh returns a 400.

### Choosing roles

The roles you grant decide what tokens from this secret can do. The API checks them per
operation, so this is a real boundary and not a label:

| Intent                        | Grant                         | Result                                       |
| ----------------------------- | ----------------------------- | -------------------------------------------- |
| Provision and manage clusters | `manage-clusters` (plus view) | Full read/write on the org's clusters        |
| Read-only monitoring          | view roles only               | 200 on reads, **403 on writes**              |
| Billing automation            | `manage-billing`              | Payment methods, subscriptions, portal links |

You can only grant roles you hold yourself — the API rejects an attempt to escalate. Create a
separate secret per consumer rather than one shared secret with every role; revoking one then
does not break the others.

## 2. Exchange it for a token

Against the **console** host, not the API host:

```bash
export PHASETWO_CLIENT_ID='your-client-id'
export PHASETWO_CLIENT_SECRET='your-client-secret'

TOKEN=$(curl -s -X POST \
  https://app.phasetwo.io/auth/realms/self/protocol/openid-connect/token \
  -d grant_type=client_credentials \
  -d client_id="$PHASETWO_CLIENT_ID" \
  -d client_secret="$PHASETWO_CLIENT_SECRET" \
  | jq -r .access_token)
```

The realm is `self` — the Phase Two control-plane realm, the one the console itself logs you
into. It is not one of your realms.

<details>
<summary>Why <code>/auth/realms/self</code> and not <code>api.phasetwo.io</code>?</summary>

The token endpoint belongs to the control-plane Keycloak, which is served under `/auth` on the
console host. The Management API is served on its own hostname. They are different services, so
they have different URLs — and a token request to `api.phasetwo.io` will not find the token
endpoint.

Put another way: `app.` issues the credential, `api.` accepts it.

</details>

## 3. Call the API

Against the **API** host, with the token as a bearer header:

```bash
curl -s https://api.phasetwo.io/v2/clusters \
  -H "Authorization: Bearer $TOKEN" | jq
```

If that returns your clusters, you are set up. A useful next call is
[`org.list`](/api/management/orgs), which tells you the organization IDs you will need for
almost everything else:

```bash
curl -s https://api.phasetwo.io/v2/orgs \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, name, roles}'
```

The `roles` array in that response is exactly what your secret was granted — a quick way to
confirm the permissions landed as intended.

## Tokens expire

Access tokens are short-lived. There is no refresh token in the client credentials grant, which
is the point: you re-run the exchange when you need a new one.

For anything long-running, fetch a token, use it, and re-fetch on a 401 rather than caching it
for a fixed duration:

```bash
call_api() {
  local path="$1"
  local status
  status=$(curl -s -o /tmp/p2.out -w '%{http_code}' \
    "https://api.phasetwo.io/v2${path}" -H "Authorization: Bearer $TOKEN")
  if [ "$status" = "401" ]; then
    TOKEN=$(get_token)          # re-exchange, then retry once
    status=$(curl -s -o /tmp/p2.out -w '%{http_code}' \
      "https://api.phasetwo.io/v2${path}" -H "Authorization: Bearer $TOKEN")
  fi
  [ "$status" -lt 300 ] || { echo "HTTP $status" >&2; cat /tmp/p2.out >&2; return 1; }
  cat /tmp/p2.out
}
```

## Storing the credential

Treat the client secret like any other deployment secret.

- **CI:** a masked secret in the runner's own store — GitHub Actions secrets, GitLab CI
  variables. Never in the workflow file.
- **Terraform:** `PHASETWO_CLIENT_ID` / `PHASETWO_CLIENT_SECRET` environment variables, so it
  never lands in `.tf` files or state. See the
  [provider guide](/docs/management-api/terraform).
- **Local development:** a `.env` your `.gitignore` already covers, or your OS keychain.

A leaked secret is as powerful as the roles you gave it, which is the argument for narrow,
per-consumer credentials.

## Rotating and revoking

Rotation is create-then-revoke, and needs no downtime because the two credentials coexist:

1. Create a second secret with the same roles.
2. Deploy it wherever the old one is configured.
3. Confirm traffic is using it.
4. Revoke the old one in the console, or with
   [`org.apiSecret.delete`](/api/management/orgs).

Revoking stops new tokens immediately. **Tokens already issued keep working until they
expire** — revocation is not retroactive, so treat a compromised secret as compromised for the
remaining token lifetime and check the audit log for what it did.

## Troubleshooting

| Symptom                          | Cause                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `401` from the token endpoint    | Wrong client ID or secret, or a typo in the realm — it is `self`                |
| `401` from `api.phasetwo.io`     | Token expired, or you sent the client secret instead of the token               |
| `403` on a write, `200` on reads | The secret lacks the organization role. This is working as designed             |
| `404` on the token endpoint      | You posted to `api.phasetwo.io` instead of `app.phasetwo.io`                    |
| `400` creating a secret          | Already at the 10-per-organization cap, or you asked for a role you do not hold |
| Secret shows `********`          | Expected on every read after creation. Create a new one                         |

## Next

- [Automation recipes](/docs/management-api/recipes) — provision a cluster, onboard a tenant,
  attach a domain
- [Terraform provider](/docs/management-api/terraform) — the declarative route
- [API reference](/api/management-api-index) — all 73 endpoints
