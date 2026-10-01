---
slug: migrate-auth0-to-keycloak
title: "Migrating from Auth0 to Keycloak: a complete walkthrough"
date: 2026-10-01
authors: [jpatzer]
tags: [keycloak, migration, auth0, users, organizations]
description: How to migrate from Auth0 to Keycloak, tested on 26.7.4 — the user export, why Auth0's bcrypt hashes will not import, and three failures that return HTTP 201.
keywords:
  - migrate auth0 to keycloak
  - auth0 to keycloak migration
  - auth0 user export
  - auth0 password hash export
  - keycloak partial import
---

Migrating from Auth0 to Keycloak is three separate jobs wearing one name. **Profiles move
easily** — Auth0's export job gives you newline-delimited JSON and Keycloak's partial-import
endpoint takes it. **Passwords do not move at all**: Auth0 hashes with bcrypt, Keycloak 26.7.4
ships four password-hashing providers and none of them is bcrypt, so you either reset every
password or stand up a bridge that verifies against the old hashes on first login. **Your
Rules and Actions have to be rewritten**, because there is no equivalent runtime — some of
them become authentication-flow configuration with no code at all, and some become a Java SPI.

The part that costs people a weekend is none of those. It is that Keycloak's admin API
answers `201 Created` to three different malformed migrations and then quietly loses the data.
Everything below was run against Keycloak 26.7.4 on PostgreSQL 16.

<!-- truncate -->

## The short version

1. Export profiles with the Auth0 Management API export job (NDJSON).
2. Request the password-hash export separately — it needs a signed form from a CISO.
3. Set the realm's unmanaged attribute policy, or create user-profile attributes, **before**
   importing anything.
4. Convert the export: derive `firstName` / `lastName`, flatten metadata, map social
   connections to identity-provider aliases.
5. Create the identity providers and enable organizations **before** the import, not after.
6. `POST /admin/realms/{realm}/partialImport` in batches of about 100.
7. Put the bcrypt hashes behind a user-storage bridge so users keep their passwords, or send
   everyone a reset mail.

## What Auth0 will give you

Two exports, obtained two different ways.

The profile export is a Management API job. It is asynchronous — you create it and poll:

```bash
# POST /api/v2/jobs/users-exports, scope: read:users
curl -sX POST "https://$TENANT/api/v2/jobs/users-exports" \
  -H "Authorization: Bearer $MGMT_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"connection_id":"con_abc123","format":"json"}'
# -> {"id":"job_xxx","type":"users_export","status":"pending", ...}

curl -s "https://$TENANT/api/v2/jobs/job_xxx" -H "Authorization: Bearer $MGMT_TOKEN"
# when status is "completed", the response carries a signed download location
```

`format: "json"` produces [NDJSON](https://github.com/ndjson/ndjson-spec) — one user object per
line — because the files get large. Take it over CSV: the CSV writer is capped at 30 fields and
cannot emit `app_metadata` or `user_metadata` as objects, only as individually named leaf
fields, which means you have to know every key in advance.

The password export is not an API at all. Auth0 documents it as a **support case**: you supply
the tenant name and an ASCII-armored PGP public key, a second tenant administrator confirms the
request, and a CISO, CSO or VP-level signatory signs an acknowledgment form — a typed name is
not accepted. Auth0 gives no ETA, states that not all requests qualify, and the download link
expires after three days and only works for the case creator while they still hold the tenant
administrator role.

Start that request first. It is the long pole, and every decision about passwords below depends
on whether it comes back.

What arrives is NDJSON again, keyed on email, with the hash in a `passwordHash` field:

```json
{"_id":"5dea9f9c82dd7c0e76e4ec93","email":"frank@example.com","email_verified":true,
 "passwordHash":"$2b$10$RmYRk0ZyhOxT1Um4S8oHiuA...","password_set_date":"2024-03-13T10:02:11.000Z",
 "connection":"Username-Password-Authentication"}
```

`$2b$10$` is bcrypt at cost factor 10. Hold that thought.

## Where each Auth0 object lands in Keycloak

| Auth0 | Keycloak 26.7.4 | Moves cleanly? |
|---|---|---|
| `user_id` | a user attribute (`auth0_user_id`) | Yes — keep it, you will need it for reconciliation |
| `email`, `email_verified`, `username`, `blocked` | `email`, `emailVerified`, `username`, `enabled` (inverted) | Yes |
| `given_name` / `family_name` / `name` | `firstName`, `lastName` | **Only if you derive them** — see below |
| `app_metadata`, `user_metadata` | user attributes | Only with the user profile configured first |
| `identities[]` where `isSocial` | `federatedIdentities[]` | Only if the identity provider already exists |
| `app_metadata.roles` (by convention) | realm roles | Yes — `partialImport` creates missing roles |
| Password | — | **No.** bcrypt; see "Passwords" |
| MFA enrolments | `otp` credential | Usually not; see "What you lose" |
| Organizations | Keycloak organizations | Yes, once enabled per realm |
| Rules, Actions, Hooks | authentication flows, mappers, SPI | Rewritten, not migrated |
| Logs, `logins_count`, `last_login` | — | No |

## The converter

This reads the profile export and writes partial-import batches. It deliberately does nothing
with passwords.

```python
#!/usr/bin/env python3
"""auth0_to_keycloak.py — convert an Auth0 NDJSON export into Keycloak partial-import batches.

    python3 auth0_to_keycloak.py users.ndjson --out out/ --batch 100
"""
import argparse, json, os, sys

# Auth0 connection strategy -> the Keycloak identity provider alias you created
IDP_ALIAS = {
    "google-oauth2": "google",
    "github": "github",
    "windowslive": "microsoft",
    "facebook": "facebook",
}


def split_name(u):
    """Auth0 populates given_name/family_name for social connections. Database users
    often carry only `name`, or nothing — and a Keycloak user with no firstName or
    lastName is locked out at first login by VERIFY_PROFILE."""
    first, last = u.get("given_name"), u.get("family_name")
    if not (first and last):
        name = (u.get("name") or "").strip()
        # Auth0 defaults `name` to the email address when nothing else is set
        if name and "@" not in name:
            parts = name.split(None, 1)
            first = first or parts[0]
            last = last or (parts[1] if len(parts) > 1 else "-")
    return first or (u.get("nickname") or u["email"].split("@")[0]), last or "-"


def flatten(prefix, obj, out):
    """Keycloak attribute values are lists of strings. Nested metadata becomes dotted
    keys; anything that is not a scalar is stored as JSON."""
    for k, v in obj.items():
        key = f"{prefix}.{k}"
        if isinstance(v, dict):
            flatten(key, v, out)
        elif isinstance(v, (list, tuple)):
            out[key] = ([json.dumps(v)] if any(isinstance(i, (dict, list)) for i in v)
                        else [str(i) for i in v])
        elif v is not None:
            out[key] = [str(v).lower() if isinstance(v, bool) else str(v)]


def convert(u):
    first, last = split_name(u)
    attrs = {"auth0_user_id": [u["user_id"]]}
    for field in ("app_metadata", "user_metadata"):
        if u.get(field):
            flatten(field.split("_")[0], u[field], attrs)
    if u.get("created_at"):
        attrs["auth0_created_at"] = [u["created_at"]]

    fed = []
    for ident in u.get("identities", []):
        alias = IDP_ALIAS.get(ident["provider"]) if ident.get("isSocial") else None
        if alias:
            fed.append({"identityProvider": alias,
                        "userId": str(ident["user_id"]),
                        "userName": u.get("email", "")})

    return {
        "username": u.get("username") or u["email"],
        "email": u.get("email"),
        "emailVerified": bool(u.get("email_verified")),
        "firstName": first,
        "lastName": last,
        "enabled": not u.get("blocked", False),
        "attributes": attrs,
        "federatedIdentities": fed,
        "realmRoles": u.get("app_metadata", {}).get("roles", []),
        "requiredActions": [],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("export")
    ap.add_argument("--out", default="out")
    ap.add_argument("--batch", type=int, default=100)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    batch, n, files, skipped = [], 0, 0, 0

    def flush():
        nonlocal batch, files
        if not batch:
            return
        files += 1
        with open(os.path.join(args.out, f"batch-{files:04d}.json"), "w") as fh:
            json.dump({"ifResourceExists": "SKIP", "users": batch}, fh)
        batch = []

    for line in open(args.export):
        line = line.strip()
        if not line:
            continue
        u = json.loads(line)
        if not u.get("email"):
            skipped += 1            # passwordless / SMS-only users need their own pass
            continue
        batch.append(convert(u))
        n += 1
        if len(batch) >= args.batch:
            flush()
    flush()
    print(f"{n} users -> {files} batches ({skipped} skipped: no email)", file=sys.stderr)


if __name__ == "__main__":
    main()
```

`ifResourceExists: "SKIP"` makes the import idempotent, which matters more than it sounds: you
will run it more than once.

## Import, and the batch size nobody mentions

```bash
curl -sX POST "$KC/admin/realms/$REALM/partialImport" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d @out/batch-0001.json
# {"overwritten":0,"added":100,"skipped":0,"results":[...]}
```

Batch size is not a matter of taste. Importing the same 5,000 generated users into a fresh
realm five times, varying only the batch size:

| Users per request | Seconds for 5,000 | Users/sec |
|---|---|---|
| 50 | 18.5 | 270 |
| **100** | **13.5** | **370** |
| 500 | 23.4 | 214 |
| 1,000 | 38.7 | 129 |
| 5,000 (one request) | 169.8 | 29 |

One 5,000-user request is **12.6x slower** than the same 5,000 users in requests of 100. Cost
per user rises with batch size, so the intuition that fewer, larger requests is cheaper is
exactly backwards here. For comparison, creating the same users one at a time through
`POST /admin/realms/{realm}/users` on a single connection managed 142/sec — slower than
batches of 100, but not by the margin you would guess, and it gives you a per-user error
instead of one opaque result array.

Measured on a 2-vCPU container against PostgreSQL 16, Keycloak in dev mode. Your absolute
numbers will differ; the shape of the curve is the point.

One operational detail that will bite a naive script: the `master` realm's
`accessTokenLifespan` is **60 seconds** by default. A single 5,000-user request took 170
seconds, so the token that was valid when the request started had expired long before the next
one. Fetch a fresh token before every batch.

## Three things that fail with HTTP 201

This is the section worth the price of admission. Each of these returns a success code and
loses data.

### 1. Every custom attribute is discarded

Keycloak's declarative user profile has been on by default since 24, and
[the documentation is explicit](https://www.keycloak.org/docs/latest/server_admin/index.html#_understanding-managed-and-unmanaged-attributes)
that unmanaged attributes are "completely ignored by Keycloak, by default". Ignored, not
rejected:

```console
$ curl -sX POST "$KC/admin/realms/t1/users" -H "Authorization: Bearer $T" \
    -d '{"username":"alice","email":"alice@example.com","enabled":true,
         "firstName":"A","lastName":"B",
         "attributes":{"auth0_user_id":["auth0|65f"],"plan":["pro"]}}'
HTTP 201

$ curl -s "$KC/admin/realms/t1/users?username=alice" ... | jq .[0].attributes
null
```

Every `app_metadata` and `user_metadata` value you carefully flattened is gone, and the run was
green. Fix it before the import, not after — there is no backfill that does not mean running
the whole thing again:

```bash
# read the profile, flip the policy, put it back
curl -s "$KC/admin/realms/$REALM/users/profile" -H "Authorization: Bearer $T" \
  | jq '.unmanagedAttributePolicy = "ENABLED"' > profile.json
curl -sX PUT "$KC/admin/realms/$REALM/users/profile" -H "Authorization: Bearer $T" \
  -H 'Content-Type: application/json' -d @profile.json
```

With that set, the same request round-trips `{"auth0_user_id":["auth0|65f"],"plan":["pro"]}`.

`ENABLED` is the blunt instrument, and Keycloak's own docs recommend against it as a permanent
state. The better end point is to declare the attributes you actually migrated in the user
profile, with validators, and leave the policy alone. `ENABLED` during the migration and a
declared profile afterwards is a reasonable path; just do not leave it on and forget.

### 2. Users with no name cannot log in

Auth0's `given_name` and `family_name` are populated for social connections. Database-connection
users frequently have neither, and Auth0 defaults `name` to the email address. Map the fields
one-to-one and you get a user with a correct password hash and no `firstName`:

```console
$ # carol imported with a valid pbkdf2-sha512 credential, no firstName/lastName
$ curl -s -d client_id=mt -d username=carol -d 'password=S3cret-pass!' \
       -d grant_type=password "$KC/realms/t1/protocol/openid-connect/token"
{"error":"invalid_grant","error_description":"Account is not fully set up"}

$ # ...and the wrong password, for contrast
{"error":"invalid_grant","error_description":"Invalid user credentials"}
```

Two distinct errors, which is how you know the hash verified and something after it refused.
The something is `VERIFY_PROFILE`, evaluated at login against the user profile, where
`firstName` and `lastName` are required by default. It does **not** appear in the user's
`requiredActions` array — that reads `[]` — so an admin looking at the user representation
sees nothing wrong.

Set `firstName` and `lastName` and the same request issues a token. That is why the converter
above works so hard on `split_name`: a fallback of "-" for a missing surname is ugly, and it is
better than a locked-out account. Relaxing the user profile or disabling `VERIFY_PROFILE`
realm-wide also works and is worse, because it turns a data problem into a permanent
configuration change.

### 3. Social logins silently become new accounts

`federatedIdentities` entries that name an identity-provider alias which does not exist are
dropped. The import reports `"action":"ADDED"` for the user:

```console
$ # google/github IdPs not yet created
$ curl -s ".../users/$ID/federated-identity" -H "Authorization: Bearer $T"
[]

$ # exactly the same import, after creating the two identity providers
[{"identityProvider":"github","userId":"000000000000000000000500","userName":"user500@example.com"}]
```

Nothing warns you. The consequence only shows up at cutover, when every Google user arrives at
a login page that does not recognise them and is offered account creation or an account-link
challenge. Create the identity providers first. Realm roles are the exception that proves the
rule — `partialImport` happily creates a missing realm role and assigns it.

## Passwords: why the bcrypt hashes will not import

Keycloak 26.7.4 ships exactly four password-hashing providers:

```console
$ curl -s "$KC/admin/serverinfo" ... | jq '.providers["password-hashing"].providers | keys'
["argon2","pbkdf2","pbkdf2-sha256","pbkdf2-sha512"]
```

Ask for bcrypt explicitly and you get a clean failure:

```console
$ curl -sX PUT "$KC/admin/realms/t1" -H "Authorization: Bearer $T" \
    -d '{"realm":"t1","passwordPolicy":"hashAlgorithm(bcrypt)"}'
{"errorMessage":"Invalid config for hashAlgorithm: Password hashing provider not found"}
HTTP 400
```

That is the good case. The bad case is importing a user whose credential names an algorithm the
server has never heard of:

```console
$ curl -sX POST "$KC/admin/realms/t1/users" -H "Authorization: Bearer $T" \
    -d '{"username":"erin", ... ,"credentials":[{"type":"password",
         "credentialData":"{\"hashIterations\":10,\"algorithm\":\"bcrypt\"}",
         "secretData":"{\"value\":\"$2b$10$N9qo8uLOickgx2ZMRZoMye...\",\"salt\":\"\"}"}]}'
HTTP 201

$ curl -s -d client_id=mt -d username=erin -d 'password=S3cret-pass!' \
       -d grant_type=password "$KC/realms/t1/protocol/openid-connect/token"
{"error":"invalid_grant","error_description":"Invalid user credentials"}
```

Created. Shows a password credential in the admin console. Cannot authenticate, ever, and the
error is indistinguishable from a user who typed the wrong password. If you load a million
bcrypt hashes this way you will not find out until support does.

Keycloak's credential format itself is fine — it just has to be an algorithm the server
implements. A pbkdf2-sha512 credential built by hand authenticates on the first try:

```python
salt, iters = os.urandom(16), 210000
dk = hashlib.pbkdf2_hmac("sha512", password, salt, iters, dklen=64)
credential = {
    "type": "password",
    "credentialData": json.dumps({"hashIterations": iters, "algorithm": "pbkdf2-sha512"}),
    "secretData": json.dumps({"value": base64.b64encode(dk).decode(),
                              "salt": base64.b64encode(salt).decode()}),
}
```

Useful if you are coming from a system that used PBKDF2. Useless for Auth0.

So there are three honest options:

| Option | Users notice | Work | Use when |
|---|---|---|---|
| Force a reset for everyone | Yes — one mail, one reset each | Lowest | Small user base, or you never got the hash export |
| Bridge to the bcrypt hashes, rehash on first login | No | A day | The normal answer |
| Write a bcrypt `PasswordHashProvider` SPI | No | More, and permanent | You want bcrypt to remain the realm's algorithm |

The third keeps bcrypt alive in your estate forever, which is the opposite of what a migration
is for. The second is the one to reach for.

## The bridge, tested end to end

The [user-storage SPI](https://www.keycloak.org/docs/latest/server_development/index.html#_user-storage-spi)
lets Keycloak ask an external system about a user it has never seen. The open-source
[keycloak-user-migration](https://github.com/daniel-frak/keycloak-user-migration) provider —
the upstream of the one behind our [user migration](/docs/user-migration/) service — turns that
into two HTTP endpoints you implement: a `GET` that returns the user, and a `POST` that answers
whether a password is correct.

Here the "legacy system" is nothing but the two NDJSON files Auth0 sent you:

```python
def do_GET(self):                    # {base}/{username}
    p = USERS[self.username()]["profile"]
    self.json(200, {
        "id": p["user_id"].split("|")[-1],
        "username": p["email"], "email": p["email"],
        "firstName": ..., "lastName": ...,
        "enabled": not p.get("blocked", False),
        "emailVerified": p.get("email_verified", False),
        "attributes": {"auth0_user_id": [p["user_id"]]},
        "roles": p.get("app_metadata", {}).get("roles", []),
    })

def do_POST(self):                   # {"password": "..."} -> 200 or 401
    h = USERS[self.username()]["hash"]["passwordHash"]     # "$2b$10$..."
    ok = bcrypt.checkpw(self.body()["password"].encode(), h.encode())
    self.send_response(200 if ok else 401)
    self.end_headers()
```

One detail that cost me twenty minutes: the provider **percent-encodes the username in the
path**, so `frank@example.com` arrives as `frank%40example.com`. Call `unquote()` before you
look anything up, or every user is a 404 and every login is `Invalid user credentials`.

Register it as a user-storage component pointed at that service:

```bash
curl -sX POST "$KC/admin/realms/$REALM/components" \
  -H "Authorization: Bearer $T" -H 'Content-Type: application/json' \
  -d '{"name":"auth0-bridge",
       "providerId":"User migration using a REST client",
       "providerType":"org.keycloak.storage.UserStorageProvider",
       "parentId":"'"$REALM_ID"'",
       "config":{"URI":["http://bridge:9000"],"enabled":["true"],"priority":["0"],
                 "cachePolicy":["DEFAULT"],"MIGRATE_UNMAPPED_ROLES":["true"],
                 "UPDATE_USER_ON_LOGIN":["true"]}}'
```

An empty realm, and a user who exists only in an Auth0 export file:

```console
$ curl -s "$KC/admin/realms/lazy/users/count" -H "Authorization: Bearer $T"
0

$ curl -s -d client_id=mt -d 'username=frank@example.com' \
       -d 'password=correct-horse-battery' -d grant_type=password \
       "$KC/realms/lazy/protocol/openid-connect/token"
{"access_token":"eyJhbGciOiJSUzI1NiIs...","expires_in":300, ...}

$ curl -s ".../users/$ID/credentials" -H "Authorization: Bearer $T" | jq -r '.[].credentialData'
{"hashIterations":5,"algorithm":"argon2","additionalParameters":
 {"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}
```

The user materialised with their profile, their `billing-admin` realm role and their
`auth0_user_id` attribute, and the password they typed was rehashed with **Keycloak's** default
algorithm — argon2id, 7168 KiB, one pass — not stored as bcrypt. Every successful login retires
one bcrypt hash. Wrong passwords still return `Invalid user credentials`, because the bridge
answered 401.

Two things to know about this path. The unmanaged-attribute trap applies here too: with the
default policy the `auth0_user_id` the bridge returns is dropped just as silently as in a bulk
import. And the bridge holds every password hash you own, so it belongs on an internal network,
behind the provider's `API_TOKEN` option, with a decommission date in the calendar. When logins
against it drop to near zero, mail the stragglers a reset link and delete it.

## Rules and Actions

Auth0 is retiring Rules and Hooks — **end of life 18 November 2026**, after which they stop
executing and are removed; they have been read-only since November 2024 (checked against
Auth0's deprecation documentation on 2026-09-28). If you are already rewriting them as Actions,
that is the cheapest moment you will ever get to ask whether they should be Actions at all.

There is no Keycloak equivalent of the Actions runtime. There are four different places the
work goes, and the first one needs no code:

| Auth0 trigger | What it usually does | Keycloak equivalent |
|---|---|---|
| `post-login` adding claims from metadata | enrich the token | Protocol mapper — `oidc-usermodel-attribute-mapper`, configuration only |
| `post-login` requiring MFA conditionally | step-up by role, group or risk | `conditional-user-role` / `conditional-user-attribute` in a browser sub-flow, configuration only |
| `post-login` denying a login | block by domain, geography, state | Custom `Authenticator` (SPI, Java) |
| `pre-user-registration` validating input | reject bad signups | User-profile validators, or a registration form action |
| `post-user-registration`, `post-change-password` | notify another system | Event listener SPI — or our [events and webhooks](/extensions/events/) extension |
| `credentials-exchange` (M2M) | shape a client-credentials token | Protocol mappers on the service-account client |
| `send-phone-message` | custom SMS provider | Custom required action / authenticator |

The first two are the ones that matter, because between them they cover most of the `post-login`
Actions in a typical tenant, and both are realm configuration rather than a build artifact. The
claim path in particular is a straight swap — after mapping `app_metadata.plan` to an attribute,
a stock attribute mapper puts it in the access token:

```json
{ "preferred_username": "user0@example.com", "email": "user0@example.com", "plan": "free" }
```

For the ones that really are code, [custom authentication flows](/tutorials/authentication/custom-flows/)
covers the shape of an `Authenticator`. Budget properly for this part: it is the only part of an
Auth0 migration that is genuinely a rewrite, and it is the part people discover last.

## Organizations

If you use Auth0 Organizations, Keycloak has had a native equivalent since 26 — organizations
with domains, members, and identity providers bound per organization. It is a realm-level
switch that is **off by default**, and the failure is a 404 that reads like a missing endpoint:

```console
$ curl -sX POST "$KC/admin/realms/t1/organizations" -H "Authorization: Bearer $T" \
    -d '{"name":"acme","alias":"acme","domains":[{"name":"acme.test"}]}'
{"errorMessage":"Organizations not enabled for this realm."}
HTTP 404

$ curl -sX PUT "$KC/admin/realms/t1" -H "Authorization: Bearer $T" \
    -d '{"realm":"t1","organizationsEnabled":true}'
HTTP 204
# same POST now returns 201, and POST .../organizations/{id}/members with a
# JSON-quoted user id returns 201
```

Enable it before you import, so organization membership can be assigned in the same pass.

Native organizations cover membership, domains and per-organization identity providers. What
they do not cover is the part of Auth0 Organizations your customers actually touch: invitations,
per-organization roles, and a portal where a customer's own admin configures their SSO
connection without filing a ticket with you. That is what our
[Keycloak organizations extension](/extensions/organizations/) adds on top, and it is the reason the
[WorkOS migration](/blog/workos-keycloak-migration/) tooling exists in the shape it does.

## What you lose

Every migration guide that skips this section is selling something.

- **MFA enrolments, in practice.** TOTP secrets do come in the same PGP export, and Keycloak
  will accept an `otp` credential on import — `totp` flips to `true` and no `CONFIGURE_TOTP`
  action is set. Whether the codes then validate depends on an encoding detail: Keycloak stores
  `secretData.value` as the **raw** secret and base32-encodes it when it builds the
  `otpauth://` URI, while authenticator secrets are handed around already base32-encoded. Import
  the base32 string as-is and every code is rejected. Base32-decode it first and, if the result
  is printable text, it works — I tested both. For a normal 160-bit random secret the decoded
  bytes are not text and do not survive the round trip, and the import still returns 201. Plan
  on re-enrolment and treat anything better as a bonus.
- **WebAuthn and passkeys.** Not portable at all: the credential is bound to the relying-party
  ID. Every passkey user re-enrols.
- **Attack Protection.** Auth0's breached-password detection, bot detection and suspicious-IP
  throttling have no direct counterpart. Keycloak has brute-force detection and a password
  blacklist policy; they are not the same product.
- **Passwordless and SMS-only users.** They have no email in the export, which is why the
  converter counts and skips them. They need their own migration decision.
- **Login history.** `logins_count`, `last_login` and the Auth0 log stream do not transfer. Keep
  them as attributes if anything downstream reads them, and expect a gap in your dashboards.
- **The Actions marketplace.** Every third-party integration wired in through an Action is your
  problem again.
- **Universal Login's hosted pages.** Keycloak themes are more powerful and are a project. Do
  not schedule the theme work inside the migration window.

## When not to do this

If Auth0 is not on your bill's critical path and nobody is asking for data residency, source
access or a fixed cost, this migration has no return. It is roughly a week of engineering for
a small tenant, plus the Actions rewrite, plus a support burst at cutover. Teams that get
value from it usually have at least one of: a per-MAU bill growing faster than revenue, a
compliance requirement Auth0's tiers do not reach, or extensibility needs the Actions sandbox
cannot serve. The [Keycloak and Auth0 comparison](/keycloak-alternatives/auth0/) lays out that
trade-off properly.

And if you are moving to Keycloak to escape an operations bill, price the operations bill.
Keycloak is a JVM application with a database, a cache and a certificate rotation story;
running it well is a real job. That is the case for [managed Keycloak](/hosting/dedicated-clusters/)
rather than a VM you own — and either way, read the
[production readiness checklist](/blog/keycloak-production-checklist/) before you put a
migrated realm in front of users.

## Do this next

Run the converter against 50 users from a sandbox tenant into a throwaway realm today, before
you file the password-hash request. Ninety percent of what you will learn about your own Auth0
data — which users have no name, which metadata keys exist, how many social identities you
actually have — comes out of that first 50-user round trip, and it costs an afternoon.

We do this migration as a service, including the bridge and the Actions rewrite. If you want
someone who has done it before to run the cutover, [talk to us about migrating to Keycloak](/support/migrate-to-keycloak/).
