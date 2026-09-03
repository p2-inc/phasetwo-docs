---
slug: scim-explained
title: "SCIM Explained: What It Is, When You Need It, and How Keycloak Does It"
date: 2026-09-03
authors: [gpatil]
tags: [keycloak, scim, provisioning, standards, organizations]
description: What SCIM actually is, when you need it instead of SSO alone, and a working walkthrough of Keycloak's native SCIM API — tested on 26.7.3, with real requests and responses.
keywords:
  - scim
  - what is scim
  - scim provisioning
  - scim vs saml
  - keycloak scim
---

**SCIM — System for Cross-domain Identity Management — is a standard REST API for creating,
updating, and deactivating user accounts across systems.** SSO answers "can this person log
in?" SCIM answers "does this person have an account at all, and should they still?"

If you sell to enterprises, you will be asked for it. This post covers what it is, when you
actually need it, and a working walkthrough of Keycloak's native SCIM API — which arrived
as a preview feature and is not enabled by default.

Everything here was run against **Keycloak 26.7.3**.

<!-- truncate -->

## What problem SCIM solves

Without it, enterprise onboarding looks like this: someone joins, IT adds them to Okta, and
then a human logs into your app and creates their account too. Someone leaves, IT disables
their Okta account — and the account in your app stays active until somebody remembers.

That gap is the whole reason SCIM exists. It is a security problem before it is a
convenience problem: **the leaver whose account never got deactivated is one of the most
common ways access outlives employment.**

SCIM standardises four operations across vendors:

| Event in the IdP | SCIM call to your app |
|---|---|
| Employee joins | `POST /Users` |
| Details change | `PATCH /Users/{id}` |
| Joins a team | `PATCH /Groups/{id}` |
| Employee leaves | `PATCH /Users/{id}` setting `active: false` |

Note the last one. **SCIM deactivates; it usually does not delete.** Most IdPs send
`active: false` rather than `DELETE`, because audit trails need the record to survive.
Systems that treat deprovisioning as deletion get this wrong and lose history.

## SCIM vs SAML vs OIDC — they solve different problems

This is the most common confusion, and the comparison is not apples to apples:

| | SAML / OIDC | SCIM |
|---|---|---|
| Question answered | Can this person log in *right now*? | Should this person have an account? |
| When it runs | At login | Continuously, in the background |
| Direction | User's browser → your app | IdP server → your API |
| Without it | No SSO | Manual account admin, and stale leavers |

They are complementary, not alternatives. A typical enterprise deal wants **both**: SAML or
OIDC so people can log in, SCIM so the account list stays correct.

### Do you actually need it?

Be honest about this, because SCIM is real work:

**You probably need it if:** you sell to companies with hundreds of employees; your buyers
ask about "provisioning" or "deprovisioning"; you have per-seat pricing (customers want
their seat count to track reality automatically); or you have compliance requirements around
timely access removal.

**You probably don't yet if:** your customers are small teams; users self-register; or
just-in-time provisioning at first login is sufficient. **JIT provisioning** — creating the
account the first time someone logs in via SSO — covers a lot of ground and costs almost
nothing. It just cannot deprovision, because a leaver simply never logs in again.

That is the honest dividing line: *if you need deprovisioning, you need SCIM.*

## Keycloak's native SCIM API

Keycloak ships a SCIM 2.0 server. Two things are not obvious:

1. **It is a preview feature**, off by default.
2. **It must also be enabled per realm** — the feature flag alone gets you a 404.

### Enable it

Start the server with the feature:

```bash
docker run -p 8081:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.7.3 start-dev --features=scim-api
```

You'll see it confirmed at boot:

```
INFO [org.keycloak.common.Profile] Preview features enabled: scim-api:v1
```

Then enable it on the realm:

```bash
kcadm.sh update realms/myrealm -s scimApiEnabled=true
```

Miss that second step and every SCIM request returns `404`, while the server log says:

```
WARN [org.keycloak.scim.services.ScimRealmResourceFactory] SCIM API is not enabled for realm 'myrealm'
```

Your base URL is then:

```
{server}/realms/{realm}/scim/v2
```

### Authenticate — and the audience trap

SCIM clients authenticate with a bearer token from a service account:

```bash
kcadm.sh create clients -r myrealm \
  -s clientId=scim-client -s publicClient=false \
  -s serviceAccountsEnabled=true -s secret=CHANGEME

kcadm.sh add-roles -r myrealm --uusername service-account-scim-client \
  --cclientid realm-management \
  --rolename manage-users --rolename view-users --rolename query-users
```

Now the part that will cost you an afternoon. The token needs an audience mapper, and **the
audience is not the client id — it is the SCIM base URL itself**:

```bash
kcadm.sh create clients/$CLIENT_UUID/protocol-mappers/models -r myrealm \
  -s name=scim-audience -s protocol=openid-connect \
  -s protocolMapper=oidc-audience-mapper \
  -s 'config."included.custom.audience"=http://localhost:8081/realms/myrealm/scim/v2' \
  -s 'config."access.token.claim"=true'
```

We tried `scim`, `scim-api`, `urn:keycloak:scim`, and the client id. All of them return:

```json
{"schemas":["urn:ietf:params:scim:api:messages:2.0:Error"],
 "status":"401","detail":"Invalid token audience"}
```

Only the full base URL works. Get a token the usual way:

```bash
curl -X POST {server}/realms/myrealm/protocol/openid-connect/token \
  -d grant_type=client_credentials -d client_id=scim-client -d client_secret=CHANGEME
```

### Check what it supports before you build

`ServiceProviderConfig` is the first call any SCIM client makes, and for Keycloak 26.7.3 it
returns some limitations worth knowing up front:

```json
{
  "patch":          { "supported": true },
  "bulk":           { "supported": false, "maxOperations": 0 },
  "filter":         { "supported": true, "maxResults": 100 },
  "changePassword": { "supported": false },
  "sort":           { "supported": false },
  "etag":           { "supported": false }
}
```

Read that carefully:

- **`bulk` is not supported.** An IdP syncing 10,000 users will make 10,000 calls. Plan for
  the rate, and for how your infrastructure handles a Monday-morning bulk sync.
- **`sort` is not supported.** Clients that assume stable ordering across pages need testing.
- **`filter` caps at 100 results per page.** Pagination is mandatory, not optional.
- **`changePassword` is not supported** — passwords stay with the IdP, which is correct.

### It works

Creating a user:

```bash
curl -X POST "$BASE/Users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],
    "userName":"bob","active":true,
    "name":{"givenName":"Bob","familyName":"Example"},
    "emails":[{"value":"bob@example.com","primary":true}]
  }'
```

```json
{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "id": "7b4b1d91-0ce6-44d0-9c77-766ae5dadcb3",
  "meta": {
    "resourceType": "User",
    "created": "2026-08-31T21:52:58.866Z",
    "location": ".../scim/v2/Users/7b4b1d91-0ce6-44d0-9c77-766ae5dadcb3"
  },
  "userName": "bob",
  "name": { "formatted": "Bob Example", "familyName": "Example", "givenName": "Bob" },
  "active": true,
  "emails": [{ "value": "bob@example.com", "type": "work", "primary": true }]
}
```

That user is a normal Keycloak user — `kcadm.sh get users` returns it immediately. SCIM is a
protocol surface over the same user store, not a parallel one.

Filtering works as specified:

```bash
curl -G "$BASE/Users" -H "Authorization: Bearer $TOKEN" \
  --data-urlencode 'filter=userName eq "bob"'
```

```json
{ "schemas": ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
  "totalResults": 1, "itemsPerPage": 1, ... }
```

## What "supports SCIM" should mean when a buyer asks

Vendors claim SCIM support at wildly different depths. If you are evaluating — or being
evaluated — these are the questions that separate a real implementation from a checkbox:

1. **Users and groups, or users only?** Group sync is where most implementations stop, and
   it is usually what the customer actually wants.
2. **Does deactivation work?** `active: false` must disable access immediately. This is the
   single most important operation and the most commonly half-implemented.
3. **Is `PATCH` supported, or only `PUT`?** Okta and Entra ID lean on `PATCH`. `PUT`-only
   support causes data loss when the IdP sends a partial update.
4. **Which filters?** `eq` is table stakes. Real IdPs use more.
5. **How does it handle a user who already exists?** Duplicate handling is where sync loops
   are born.
6. **Is there rate limiting, and what happens on bulk sync?** Especially with no bulk
   endpoint.

## Where this leaves you

Keycloak's native SCIM API is real, it works, and it is preview — which means it may change
before it stabilises, and you should not assume the audience quirk above is permanent. For a
new integration it is the right place to start.

The gap it does not close is **multi-tenant** provisioning: a B2B SaaS usually needs each
customer organization to have its own SCIM endpoint and its own credentials, so one
customer's IdP cannot see or touch another's users. That is a different shape of problem to
realm-level SCIM, and it is why we built
[SCIM for Organizations](/docs/organizations/scim/) as an extension.

If you're implementing SCIM against Keycloak, start with the native API above and reach for
per-organization endpoints when you have more than one customer wanting to sync.

---

Further reading: [RFC 7644](https://datatracker.ietf.org/doc/html/rfc7644) is the SCIM
protocol specification and is unusually readable. Keycloak's own
[SCIM documentation](https://www.keycloak.org/docs/latest/server_admin/index.html) covers the
full endpoint surface.

Running Keycloak in production — including preview features you'd rather not operate
yourself? [That's what we do](/hosting/dedicated-clusters/).
