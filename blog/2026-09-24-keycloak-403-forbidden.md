---
slug: keycloak-403-forbidden
title: "Keycloak 403 Forbidden: client, realm and admin API causes"
date: 2026-09-24
authors: [jpatzer]
tags: [keycloak, troubleshooting, admin-api, roles, permissions]
description: A Keycloak 403 Forbidden means the token was accepted and the permissions were not. Here is how to tell which of the three surfaces failed, measured on 26.7.4.
keywords:
  [
    keycloak 403 forbidden,
    keycloak admin api 403,
    keycloak admin console 403,
    keycloak realm-management roles,
    keycloak fine-grained admin permissions,
  ]
---

A Keycloak 403 Forbidden always means the same thing: your token was accepted, and the permissions attached to it were not enough. That is the whole difference from a 401, which means the token itself was rejected — missing, expired, malformed, or signed by another realm. Checking which of the two you have is the fastest useful thing you can do, because 401 sends you to the token and 403 sends you to role mappings, and they share no fixes.

After that, the question is which surface returned it. The Keycloak admin console, the Admin REST API and your own application all return 403 for unrelated reasons, and the response body tells you which one you are looking at without any further digging.

<!-- truncate -->

Everything below was run against **Keycloak 26.7.4** in `start-dev`, with the status codes quoted from real requests.

## Read the body, not the status

Keycloak's 403s carry four distinct bodies. Each one points at exactly one cause.

| Response body | What failed | Go to |
|---|---|---|
| `{"error":"HTTP 403 Forbidden"}` | Admin REST API: the caller lacks the role or permission for that endpoint | The admin API sections below |
| `{"error":"No realm access"}` | The admin console: the user has no admin role in this realm at all | The console section |
| `{"error":"Token issued for an application that is not the admin console: app"}` | You called a console endpoint with a token from your own client | Use the Admin REST API instead |
| `{"error":"Invalid origin"}` | The browser origin is not in the client's Web Origins | [Keycloak CORS errors](/blog/keycloak-cors-errors) |

The last one is the reason CORS and 403 get confused so often. It is a 403, it is thrown by Keycloak, and the browser never shows you the body.

## 401 or 403?

One `curl` settles it. Same endpoint, four callers:

```
no Authorization header            401 {"error":"HTTP 401 Unauthorized"}
Bearer abc.def.ghi                 401 {"error":"HTTP 401 Unauthorized"}
valid token, no admin roles        403 {"error":"HTTP 403 Forbidden"}
valid token from a different realm 403 {"error":"HTTP 403 Forbidden"}
```

Note the last row. A token minted by realm `A` and presented to `/admin/realms/B/...` is a **403**, not a 401. Keycloak authenticates it fine; it simply carries no authority over realm B. People spend a long time re-checking issuers and JWKS for that one.

## The Admin REST API: the role is more specific than you think

`realm-management` splits every resource three ways, and the split is not the one most people assume. Measured, one role at a time, on a fresh realm:

| Role granted | `GET /users` | `GET /users/{id}` | `PUT /users/{id}` | `POST /users` |
|---|---|---|---|---|
| `query-users` | **200** | 403 | 403 | 403 |
| `view-users` | **200** | **200** | 403 | 403 |
| `manage-users` | **200** | **200** | **204** | **201** |

The same shape holds for clients, and it is worth seeing twice because it is the pattern:

| Role granted | `GET /clients` | `GET /clients/{id}` | `GET /groups` | `GET /groups/{id}` |
|---|---|---|---|---|
| `query-clients` | **200** | 403 | 403 | 403 |
| `view-clients` | **200** | **200** | 403 | 403 |
| `query-groups` | 403 | 403 | **200** | 403 |
| `view-users` | 403 | 403 | **200** | **200** |

So: `query-*` searches, `view-*` reads one object, `manage-*` writes. The symptom this produces is distinctive and nearly always misread — **the user list loads and clicking a user 403s**. That is `query-users` without `view-users`, and it looks like a bug in the console.

Two more from the same table worth knowing. There is no `view-groups` role: groups are governed by `view-users`, which is why granting `view-users` quietly opens `/groups` too. And `view-realm` covers `/roles` and `/keys` but not `/identity-provider/instances`, which needs `view-identity-providers`.

`GET /admin/realms` is the one endpoint that does not 403 for insufficient permission. With no admin role it returns 403; with any admin role at all it returns **200 and a filtered list** of the realms you can see. An empty-looking realm list is not a bug.

## The role is assigned and it still 403s

This is the expensive one, because the admin console shows the role assigned. Turn off **Full scope allowed** on the calling client and the role stops reaching the request:

```
fullScopeAllowed = true
  "resource_access": { "realm-management": { "roles": ["view-users", ...] } }
  GET /admin/realms/f403/users  →  200

fullScopeAllowed = false
  "resource_access": null
  GET /admin/realms/f403/users  →  403
```

The role mapping on the service account is untouched. The client's scope is a ceiling on top of it, and with full scope off you must also add `realm-management` roles to the client's **Client scopes → Dedicated scope → Scope** tab. Do that and both the claim and the 200 come back.

There is a detail here that decides whether you tell people to log out. The Admin REST API does **not** read the role list out of the token's claims — it resolves your roles server-side per request. We granted `view-users` after minting a token, replayed the *same, unchanged* token, and it went from 403 to 200 with no new claims in it. The scope ceiling, on the other hand, is evaluated live too: turning off full scope made a previously-working token start failing immediately.

Practically: **after a role change, nobody needs to re-authenticate.** After a scope change, nobody needs to re-authenticate either. If you are still seeing 403 after fixing role mappings, a stale token is not the explanation.

## Cross-realm: the roles live on a different client

Administering realm `f403` from an account in `master` uses a different set of role objects, and this trips up almost every first attempt at delegated administration.

- **Inside realm `f403`**, admin roles are client roles of `realm-management`, which also has the `realm-admin` composite.
- **Inside `master`**, each realm gets its own client named **`<realm>-realm`** — here, `f403-realm`. There is no `realm-management` client in `master` at all, and `f403-realm` has no `realm-admin` composite.

Measured with one `master` user:

```
view-users on master-realm  →  GET /admin/realms/master/users  200
                               GET /admin/realms/f403/users    403
view-users on f403-realm    →  GET /admin/realms/f403/users    200
```

If you are granting admin rights in `master` and getting 403 against a tenant realm, this is almost certainly it.

## `manage-users` cannot grant what it does not have

Keycloak refuses privilege escalation through the user API, and the refusal is a 403 like any other. A caller holding `view-users` and `manage-users` can edit a user and assign ordinary realm roles, but:

```
POST /admin/realms/f403/users/{id}/role-mappings/clients/{realm-management}
     [{"name":"manage-realm"}]
→ 403 {"error":"HTTP 403 Forbidden"}
```

The [server admin guide](https://www.keycloak.org/docs/latest/server_admin/index.html#realm-specific-roles) states the rule — an admin can only assign admin roles they hold themselves — without saying what it looks like when it bites. It looks like a generic 403 on a role-mapping call that worked for every other role you tried.

## Fine-grained admin permissions, now on by default

`ADMIN_FINE_GRAINED_AUTHZ_V2` is a **default-enabled** feature in 26.7.4 (v1 is present but deprecated and off). Enabling **Admin Permissions** on a realm is still per-realm and still opt-in, and it is additive: we enabled it on a realm where a service account held `view-users` and that account kept its 200s.

What changes is that you can now grant admin rights *without* a `realm-management` role, and the 403 boundary it produces is sharper than people expect. With a single permission granting `view` on one specific user to a role:

```
GET /admin/realms/f403/users/{bob}   200      ← the permitted user
GET /admin/realms/f403/users/{dave}  403
GET /admin/realms/f403/users         403      ← not a filtered list
PUT /admin/realms/f403/users/{bob}   403      ← view is not manage
```

That third line is the trap. A per-user `view` permission does not make the search endpoint return a subset — it 403s outright. Granting `view` on the `Users` resource type rather than on named users turns both list and detail into 200s.

## When the console 403s but the API works

The same setup produces a user who can read the Admin REST API and cannot open the admin console:

```
GET /admin/f403/console/whoami  →  403 {"error":"No realm access"}
GET /admin/realms/f403/users    →  200
```

The console's `whoami` call requires at least one of `query-users`, `query-groups`, `query-clients` or `query-organizations` on `realm-management`. Fine-grained permissions alone do not satisfy it. Adding `query-users` flipped `whoami` to 200 immediately, and the console then shows only the Users section, with the fine-grained permissions deciding what is inside it. The [docs cover this requirement](https://www.keycloak.org/docs/latest/server_admin/index.html#_realm_access_control); what they do not mention is that the failure is `No realm access`, which reads like a session problem rather than a missing role.

## Nothing is logged, and that is expected

Across every denial above, Keycloak wrote **zero** lines to the server log at default levels. Not a warning, not an admin event. A realistic session of admin 403s produced a 20-line log containing two unrelated login errors and nothing else. So do not go looking for the cause in `docker logs` or your log aggregator — it is not there, and the absence is not a sign that the request never arrived.

What to do instead, in order:

1. **Decode the token.** `azp` tells you which client issued it, `iss` tells you which realm. A mismatch with the realm in the URL path is the 403.
2. **Check `resource_access`.** If `realm-management` is missing but the console shows the role assigned, it is the scope ceiling above.
3. **Compare the endpoint against the table above.** `query-` vs `view-` accounts for a surprising share of these.
4. **If the realm has Admin Permissions enabled**, use **Permissions → Evaluate** in the console, which answers the question directly rather than by bisection.

## When it is your own application returning the 403

Not every 403 in a Keycloak deployment comes from Keycloak. If your resource server is rejecting a valid token, three causes cover most of it, and all three are visible in the decoded token.

**The role is there but your code reads the wrong place.** A client role lands in `resource_access.<clientId>.roles`; a realm role lands in `realm_access.roles`. Spring Security's default converter reads neither without a custom `JwtAuthenticationConverter`.

**The audience is missing.** This one has a non-obvious mechanism. Keycloak adds a resource server to `aud` because the user holds a client role for it — not because anything was configured. So the same client scope switch drops both at once:

```
fullScopeAllowed = true      "aud": ["orders-api", "account"]
                             "resource_access": { "orders-api": { "roles": ["orders-read"] } }

fullScopeAllowed = false     "aud": null
                             "resource_access": null
```

If your resource server validates audience, it now rejects every token, and the fix is a scope mapping or an explicit audience mapper, not a code change.

**It is the CORS check.** `{"error":"Invalid origin"}` is a 403 that your JavaScript never sees. [The CORS post](/blog/keycloak-cors-errors) covers the matching rules; if you are chasing a 403 you cannot read from the browser, start there.

## Reproduce it in a minute

This runs as written and prints `403`, then `200`, then `403`:

```bash
docker run -d --name kc -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.7.4 start-dev

KC="docker exec kc /opt/keycloak/bin/kcadm.sh"
$KC config credentials --server http://localhost:8080 \
  --realm master --user admin --password admin

$KC create realms -s realm=demo403 -s enabled=true
$KC create clients -r demo403 -s clientId=svc -s serviceAccountsEnabled=true \
  -s secret=sekret -s standardFlowEnabled=false

get_token() {
  curl -s -X POST http://localhost:8080/realms/demo403/protocol/openid-connect/token \
    -d client_id=svc -d client_secret=sekret -d grant_type=client_credentials \
    | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])'
}

TOKEN=$(get_token)
curl -s -o /dev/null -w "before:  %{http_code}\n" -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/realms/demo403/users

$KC add-roles -r demo403 --uusername service-account-svc \
  --cclientid realm-management --rolename view-users

TOKEN=$(get_token)
curl -s -o /dev/null -w "after:   %{http_code}\n" -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/realms/demo403/users
curl -s -o /dev/null -w "clients: %{http_code}\n" -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/realms/demo403/clients

docker rm -f kc
```

Swap `view-users` for `query-users` and re-run against `/users/{id}` to see the split that produces the "list works, detail 403s" report.

## Stop it recurring

Put the service account's role mappings in your realm export or Terraform next to the client, so the client and the roles that make it useful cannot drift apart:

```json
{
  "clientId": "svc",
  "serviceAccountsEnabled": true,
  "fullScopeAllowed": true,
  "serviceAccountClientRoles": {
    "realm-management": ["view-users", "query-groups"]
  }
}
```

Then assert it. One integration test per service account, calling the narrowest endpoint it actually needs and asserting 200, catches a scope change or a dropped role mapping on the commit that caused it rather than in production. Grant the specific roles from the table above rather than `realm-admin` — `realm-admin` makes every 403 go away, including the ones that were protecting you.

---

Most Keycloak 403s are one missing client role and twenty minutes of proving which layer refused. If you would rather not spend the twenty minutes, Phase Two runs [managed Keycloak](/hosting/dedicated-clusters/) with a 30-day Starter trial from $149/month, and our team has debugged these role graphs more times than is reasonable. Staying self-hosted is fine too: the [Keycloak tutorials](/tutorials/) cover client and realm setup from scratch, [`invalid_grant`](/blog/keycloak-invalid-grant) covers the errors that show up once the 403 clears, and the [service accounts docs](/docs/api/service-accounts) walk through provisioning an admin API client with the right roles the first time.
