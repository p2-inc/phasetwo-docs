---
slug: migrate-okta-to-keycloak
title: "Migrating from Okta to Keycloak"
date: 2026-10-20
authors: [gpatil]
tags: [keycloak, migration, okta, saml, scim]
description: How to migrate from Okta to Keycloak, tested on 26.8.1 — the app inventory that sets the schedule, why Okta never exports a password hash, and how to run both at once.
keywords:
  - migrate okta to keycloak
  - okta to keycloak migration
  - okta alternatives
  - okta user export
  - keycloak partial import
---

Migrating from Okta to Keycloak is not a user migration. The users are the easy part: Okta's
Users API hands you profiles and group membership, and Keycloak's partial-import endpoint
takes them. Two other things decide how long this takes. **Okta will not give you password
hashes** — they are an import-only field, so every user either resets a password or
authenticates through Okta one last time while you drain. And **every SAML and OIDC
application has to be re-pointed by hand**, one at a time, because the assertion consumer
URL, the entity ID and the signing certificate all change when the identity provider does.

So the schedule is set by the app inventory, not by the user count. A thousand users is one
afternoon. Forty SAML apps is a quarter. Everything below was run against Keycloak 26.8.1 in
`start-dev`, and the Okta side is from Okta's published API specification, read on
2026-10-19.

<!-- truncate -->

## The short version

1. Inventory the apps first: `GET /api/v1/apps`, filter on `signOnMode` **client-side**, and
   count the SAML ones. That number is your project plan.
2. Export users (`GET /api/v1/users`) and groups, and remember that the default listing
   **omits deprovisioned users**.
3. In the target realm, in this order: set the unmanaged attribute policy, create the groups,
   create any identity providers your federated users came from.
4. Convert the export and `POST /admin/realms/{realm}/partialImport` in batches of about 100.
5. Verify the import by reading users back — three things vanish at HTTP 200 if step 3 was
   skipped.
6. Decide the password story: reset everyone, or broker Okta and drain. There is no third
   option that moves hashes.
7. Add Okta as an identity provider in Keycloak, with a first-broker-login flow that links
   to the accounts you just imported instead of duplicating them.
8. Move apps one at a time to Keycloak, keeping Okta live behind it.
9. When the last app is moved and the last user has logged in, remove the Okta identity
   provider and turn the tenant off.

## What Okta gives you, and what it never will

| Okta object | Leaves the tenant? | Lands in Keycloak as |
|---|---|---|
| User profile (`profile.*`) | Yes | user fields + attributes |
| Okta user id | Yes | an attribute — keep it, you need it for reconciliation |
| Group membership | Yes | group membership (groups must exist first) |
| Group **rules** | Readable (`/api/v1/groups/rules`) | nothing — no equivalent, re-implement or flatten |
| App assignments | Yes, per app | client scope / role design you write yourself |
| SAML app settings | Yes, per app | a new SAML client, with new URLs and a new certificate |
| **Password hashes** | **No** | — |
| MFA enrolments | Factor *list* only, never the seed | — users re-enrol |
| Okta sign-on policies, network zones, device assurance | Readable | authentication flows and conditions you design |
| Inline hooks, Workflows | Readable | authenticator SPI, event listeners, or nothing |
| System log | Yes, 90 days | not an import target |

The password row is the one that decides your project. Okta's API reference describes the
hash object as something that "may be specified in a password object when creating or
updating a user, but not for other operations" — it is write-only, an on-ramp for people
moving *to* Okta. Read a user back and `credentials.password` is an empty object. There is
no support process that unseals it, which is a real difference from some other vendors, and
worth knowing before you promise anyone a silent migration.

## Inventory the apps before anything else

Two gotchas here, both of which cost an afternoon if you meet them at the wrong moment.

`GET /api/v1/apps` **cannot filter on `signOnMode`.** Okta's specification lists the
supported filter properties as `id`, `status`, `credentials.signing.kid`,
`settings.slo.enabled` and `name` — that is the whole list. The `signOnModes` filter you may
find in examples belongs to the app *catalog* endpoint, not to your installed apps. So pull
everything and filter locally:

```bash
# 200 is the maximum page size; follow the `next` link, do not build your own cursor
curl -s -H "Authorization: SSWS $OKTA_TOKEN" \
  "https://$ORG/api/v1/apps?limit=200&filter=status+eq+%22ACTIVE%22" \
| jq -r '.[] | [.id, .signOnMode, .label] | @tsv' \
| sort -k2
```

Group the output by `signOnMode`. `SAML_2_0` and `OPENID_CONNECT` are migrations you will
schedule individually. `SECURE_PASSWORD_STORE`, `BOOKMARK` and `BROWSER_PLUGIN` are the
password-vaulting and tile-only integrations — Keycloak does not do those at all, and
pretending otherwise at the start of a project is how you end up explaining it at the end.

Then, per app, two calls that tell you who breaks when you move it:

```bash
curl -s -H "Authorization: SSWS $OKTA_TOKEN" "https://$ORG/api/v1/apps/$APP/users?limit=200"
curl -s -H "Authorization: SSWS $OKTA_TOKEN" "https://$ORG/api/v1/apps/$APP/groups?limit=200"
```

The SAML metadata endpoint is `GET /api/v1/apps/{appId}/sso/saml/metadata`, and it
**requires a `kid` query parameter** naming the signing key. It returns Okta's metadata, which
is useful as a record of what the service provider is currently trusting — the certificate in
it is the one you are about to invalidate. Keep a copy per app; it is the fastest way to
answer "what changed" when an app breaks a week later.

## Export users and groups

```bash
# default page size is 200; DEPROVISIONED users are omitted from a plain listing
curl -s -H "Authorization: SSWS $OKTA_TOKEN" \
  "https://$ORG/api/v1/users?limit=200" -D headers.txt \
| jq -c '.[]' >> users.ndjson
# then follow the rel="next" link from headers.txt until there isn't one
```

Okta's own documentation is explicit that a plain listing "omits users that have a status of
`DEPROVISIONED`". If you want them — and for an audit trail you often do — ask for them
with a search instead: `?search=status+eq+%22DEPROVISIONED%22`. The distinction matters
because a deprovisioned Okta user and a missing Okta user look identical in an export, and
"why is this person gone" is a question that arrives three months after the cutover.

Group membership comes from the group side: `GET /api/v1/groups` then
`GET /api/v1/groups/{groupId}/users` for each. Flatten that into a
`{oktaUserId: [groupName, ...]}` map before you convert anything.

While you are there, read `GET /api/v1/groups/rules`. Okta group rules — "everyone in
department X joins group Y" — have no Keycloak equivalent. They are either a thing your HR
system does over SCIM after the move, or a thing you stop doing. Finding that out now is
better than finding it out when the first new hire has no access.

## Convert the export

The status mapping is the only interesting part. Okta has eight user states and Keycloak has
`enabled` plus required actions:

| Okta status | Keycloak `enabled` | Required action | Why |
|---|---|---|---|
| `ACTIVE` | `true` | — | |
| `PROVISIONED` | `true` | `UPDATE_PASSWORD` | activated, never set a password |
| `STAGED` | `true` | `UPDATE_PASSWORD` | never activated |
| `RECOVERY` | `true` | `UPDATE_PASSWORD` | mid-reset when you exported |
| `PASSWORD_EXPIRED` | `true` | `UPDATE_PASSWORD` | |
| `LOCKED_OUT` | `true` | — | lockout is brute-force state, not a user property; it does not transfer |
| `SUSPENDED` | `false` | — | |
| `DEPROVISIONED` | `false` | — | only present if you asked for them |

```python
#!/usr/bin/env python3
"""okta_to_keycloak.py — convert an Okta user export into Keycloak partial-import batches.

    python3 okta_to_keycloak.py users.ndjson --memberships memberships.json \
        --out out/ --batch 100 --idp-alias google
"""
import argparse, json, os

STATUS = {
    "ACTIVE":           (True,  []),
    "PROVISIONED":      (True,  ["UPDATE_PASSWORD"]),
    "STAGED":           (True,  ["UPDATE_PASSWORD"]),
    "RECOVERY":         (True,  ["UPDATE_PASSWORD"]),
    "PASSWORD_EXPIRED": (True,  ["UPDATE_PASSWORD"]),
    "LOCKED_OUT":       (True,  []),
    "SUSPENDED":        (False, []),
    "DEPROVISIONED":    (False, []),
}
CORE = {"login", "email", "firstName", "lastName"}


def convert(okta, memberships, idp_alias):
    p = okta.get("profile", {})
    enabled, actions = STATUS.get(okta.get("status", "ACTIVE"), (True, []))

    attrs = {"oktaId": [okta["id"]]}
    for k, v in p.items():
        if k in CORE or v in (None, "", [], {}):
            continue
        attrs[k] = [str(x) for x in v] if isinstance(v, list) else [v]

    user = {
        "username": p["login"].lower(),
        "email": (p.get("email") or p["login"]).lower(),
        "firstName": p.get("firstName"),
        "lastName": p.get("lastName"),
        "enabled": enabled,
        "emailVerified": okta.get("status") in
            ("ACTIVE", "PASSWORD_EXPIRED", "LOCKED_OUT", "RECOVERY"),
        "attributes": attrs,
        "groups": ["/" + g for g in memberships.get(okta["id"], [])],
    }
    if actions:
        user["requiredActions"] = actions

    provider = (okta.get("credentials") or {}).get("provider") or {}
    if provider.get("type") == "FEDERATION" and idp_alias:
        # a user who signed in to Okta through Google or an upstream SAML IdP:
        # link them to the same provider in Keycloak, and never ask them for a password
        user["federatedIdentities"] = [{
            "identityProvider": idp_alias,
            "userId": okta["id"],
            "userName": p["login"].lower(),
        }]
        user.pop("requiredActions", None)
    return user


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("users")
    ap.add_argument("--memberships", help='JSON: {oktaUserId: ["group", ...]}')
    ap.add_argument("--out", default="out")
    ap.add_argument("--batch", type=int, default=100)
    ap.add_argument("--idp-alias", default="")
    ap.add_argument("--if-exists", default="SKIP", choices=["FAIL", "SKIP", "OVERWRITE"])
    args = ap.parse_args()

    memberships = json.load(open(args.memberships)) if args.memberships else {}
    os.makedirs(args.out, exist_ok=True)

    users, groups = [], set()
    for line in open(args.users):
        if line.strip():
            u = convert(json.loads(line), memberships, args.idp_alias)
            groups.update(g.lstrip("/") for g in u["groups"])
            users.append(u)

    open(os.path.join(args.out, "groups.txt"), "w").write("\n".join(sorted(groups)) + "\n")
    for n, i in enumerate(range(0, len(users), args.batch), start=1):
        json.dump({"ifResourceExists": args.if_exists, "users": users[i:i + args.batch]},
                  open(os.path.join(args.out, f"batch-{n:03d}.json"), "w"), indent=1)
    print(f"{len(users)} users, {len(groups)} groups -> {args.out}/")


if __name__ == "__main__":
    main()
```

It writes `groups.txt` as well as the batches, because of the next section.

## Import it, then check what did not arrive

Partial import is a single transaction per request, which is the good news: a batch either
lands completely or not at all. The bad news is the failure modes are inconsistent. Three
things in an Okta-shaped payload behave differently from each other, and only one of them
tells you.

**A group that does not exist fails the whole request, loudly but unhelpfully.** The response
is a bare 500:

```json
{"error":"unknown_error","error_description":"For more on this error consult the server log."}
```

and the actual cause is only in the server log:

```
ERROR [org.keycloak.services.error.KeycloakErrorHandler] Uncaught server error:
java.lang.RuntimeException: Unable to find group specified by path: /Engineering
```

Nothing was written. Create the groups from `groups.txt` first:

```bash
while read -r g; do
  kcadm create groups -r acme -s "name=$g"
done < out/groups.txt
```

**Realm roles are the opposite** — a role named in `realmRoles` that does not exist is
created for you, and the mapping is applied. Convenient, and worth knowing so you are not
surprised by a realm full of roles you did not design.

**Attributes disappear silently.** A realm created today has no unmanaged attribute policy,
so `oktaId`, `department`, `employeeNumber` and the rest are dropped — with
`"added": 5` and HTTP 200 in the response. Set the policy before importing:

```bash
kcadm get users/profile -r acme > up.json
jq '.unmanagedAttributePolicy = "ADMIN_EDIT"' up.json > up2.json
kcadm update users/profile -r acme -f up2.json
```

(Declaring each attribute explicitly in the user profile is the tidier choice for anything
you intend to keep; the unmanaged policy is the fast one for a migration.)

**Federated identities disappear silently too**, if the identity provider alias is not
already configured in the realm. Import a user whose `federatedIdentities` names `google`
before the `google` provider exists and the response is `"added": 1` — and the link is
simply not there. Create the identity providers first, even as placeholders.

With all three in place, the import is unremarkable, which is the goal:

```
added 5 skipped 0

isaac.brock@example.com  enabled=True  actions=-                oktaId=00ub0oNGTSWTBKOLGLNR
    groups: ['/All Employees', '/Engineering']
    links: []
sam@partner.example      enabled=True  actions=-                oktaId=00u3fed4wQRSTUVWXYZA
    groups: ['/Partners']
    links: [('google', '00u3fed4wQRSTUVWXYZA')]
lee.ng@example.com       enabled=True  actions=UPDATE_PASSWORD  oktaId=00u2bcd8xYGHIJKLMNOP
    groups: ['/All Employees', '/Engineering']
    links: []
dana@example.com         enabled=False actions=-                oktaId=00u1ero7vZFVEIYLWPBN
    groups: ['/All Employees', '/Support']
    links: []
```

One more thing to know before you re-run anything: `ifResourceExists: "OVERWRITE"` does not
update users in place. It deletes and recreates them, and **the Keycloak user id changes**.
If an application has already stored `sub` as a foreign key, a re-run of the import breaks
it. Use `SKIP` for repeat runs and reconcile deliberately against the `oktaId` attribute.

## Passwords: pick one of two, because there is no third

| Option | What users experience | What it costs you |
|---|---|---|
| Reset everything | One password-reset mail each, at cutover | Support load in a single week; anyone who ignores the mail is locked out |
| Broker Okta and drain | Nothing, until you turn Okta off | Okta stays live and paid for the length of the drain |
| Verify against Okta on first login (ROPC bridge) | Nothing; the password follows them | Only works for password-only users; see below |

The third row is the one people ask for, so here is exactly where it stops. Okta supports the
OAuth 2.0 **password grant**, which means a bridge — a
[user storage provider](/docs/user-migration/) that verifies a typed password against Okta
once, then stores it in Keycloak — is technically possible. The
[`keycloak-user-migration`](https://github.com/p2-inc/keycloak-user-migration) plugin
implements that pattern against two REST endpoints you supply, a `GET` that returns the user
and a `POST` that answers 200 if the password is right.

The limits are real and Okta documents them: the grant has to be enabled both on the app and
on the authorization server, Okta describes the flow as not recommended and a last resort,
and its own list of conditions for using it includes that **you do not need your users to use
multifactor authentication**. So the bridge covers password-only users, and anyone on
a factor still needs a reset. In most enterprise Okta tenants that is the wrong way round —
which is why, for the enterprise case, brokering is the better answer and this section is
mostly here to stop you spending a week on the other one.

One interaction to plan for: a user created by partial import is a local Keycloak user with
no federation link, so a storage provider is never consulted for them. The bridge only fires
for users Keycloak does not already have. Pre-import profiles **or** let the bridge create
users on first login — doing both to the same person just means the bridge never runs.

## Run both at once: broker Okta, then drain

This is the migration that works for an organisation with apps it cannot move in one night.
Keycloak becomes the front door immediately; Okta becomes an upstream identity provider
behind it; apps move one at a time; the last step is deleting the provider.

Add Okta as an OIDC [identity provider](/docs/keycloak/idp/) in Keycloak, pointed at
`https://$ORG/.well-known/openid-configuration` (or your custom authorization server's
discovery document), with a Keycloak-redirect-URI app registered on the Okta side.

The part that needs configuring is what happens on the *first* brokered login for a user you
already imported. The stock `first broker login` flow asks them to confirm:

```
Account already exists
User with email isaac.brock@example.com already exists. How do you want to continue?
  [Review profile]  [Add to existing account]
```

That is correct behaviour for a public IdP and wrong for this job: you control both ends, and
every one of these users is a person you already imported. Replace the flow with one that
links automatically:

```bash
kcadm create authentication/flows -r acme \
  -s alias=okta-auto-link -s providerId=basic-flow -s topLevel=true -s builtIn=false
kcadm create authentication/flows/okta-auto-link/executions/execution -r acme \
  -s provider=idp-create-user-if-unique
kcadm create authentication/flows/okta-auto-link/executions/execution -r acme \
  -s provider=idp-auto-link
# set both executions to ALTERNATIVE, then point the provider at the flow
kcadm update identity-provider/instances/okta -r acme \
  -s firstBrokerLoginFlowAlias=okta-auto-link
```

Tested on 26.8.1: with that flow, a brokered login for an imported user goes straight through
to the application with no prompt, the realm user count does not change, and the link lands
on the existing account:

```json
[{"identityProvider":"okta","userId":"a739cff6-f94e-4707-972c-89b10ae56ff7",
  "userName":"isaac.brock@example.com"}]
```

Two warnings, both of which bite in practice.

**`idp-auto-link` matches on the username in the brokered token.** If Okta sends
`preferred_username: rita` and you imported `rita@example.com`, nothing matches and the user
sees `Invalid username or password` — a message that sends everyone looking at the password
when the problem is the join key. The event tells the truth and is worth having a listener
for:

```
type="IDENTITY_PROVIDER_FIRST_LOGIN_ERROR" error="invalid_user_credentials"
identity_provider="okta" identity_provider_identity="rita"
```

Import the username in the form Okta will send, which for most tenants is `profile.login`.

**Automatic linking trusts the upstream provider completely.** Anyone who can set an email
or username at the IdP can take over the matching local account. During a cutover you own the
IdP, so that is an acceptable trade for a week or a quarter. It is not a permanent setting:
remove the flow when the drain is done, along with the provider.

## What you lose, plainly

- **MFA enrolments.** The factors API lists what a user enrolled; the shared secret appears
  only in an enrolment response. Everyone re-enrols. Schedule it, communicate it, and expect
  it to be the single largest source of tickets. (If you issued hardware TOTP tokens and
  still hold the seed file, those can be re-provisioned — that is the one exception.)
- **Okta Verify push, device trust and FastPass.** No equivalent. Keycloak has WebAuthn and
  OTP, which is a different security model, not a port.
- **Group rules, sign-on policies, network zones.** Readable, not portable. They become
  authentication flows, conditions and client policies that you design.
- **Inline hooks and Workflows.** Rewritten against the authenticator SPI or an event
  listener.
- **Outbound provisioning to downstream apps.** This is the one people miss, so it has its
  own section below.
- **The Okta dashboard tile.** Keycloak has no app portal. IdP-initiated SAML gets you part
  of the way — we wrote up
  [how that flow actually works](/blog/keycloak-saml-identity-provider-idp-initiated-flow-with-okta/)
  — and the rest is a page of links somebody maintains.
- **The system log, after 90 days.** Export what you need for audit before the tenant closes.

## SCIM: the arrow turns around

If Okta provisions users into your SaaS applications, read this twice. Okta's documentation
is clear about the direction: "Okta acts as the SCIM client, sending requests to your SCIM
server to manage the user and group lifecycle." Okta pushes *out* to downstream apps.

Keycloak's [SCIM support](/blog/scim-explained/), promoted to supported in
[26.8.0](/blog/keycloak-2680-released/), is the other side of that arrow. Keycloak is the SCIM
*server*: an HR system or an identity governance platform pushes users *into* a realm. Nothing
in core Keycloak pushes users out to Workday, Slack or Zoom the way Okta's provisioning tab
does. A realm-side toggle plus a service-account client gets you the inbound half — the
mechanics are in our
[SCIM API tutorial](/tutorials/scim/getting-started/) — and the outbound half is a separate
decision: keep Okta running for provisioning only, buy an IGA tool, or drive the downstream
APIs from Keycloak events.

What does carry across cleanly is identity continuity. Map a user-profile attribute to the
SCIM `externalId` and populate it with the Okta user id you kept in `oktaId`, and any system
that was addressing people by Okta id keeps working after the tenant is gone. That one
mapping is worth doing on day one, because it is nearly free then and a reconciliation
project later.

## A cutover order that works

1. **Inventory** apps, groups, group rules and policies. Decide what is not coming.
2. **Stand up the realm**: unmanaged attribute policy, groups, identity providers, user
   profile attributes including the `externalId` mapping.
3. **Import users**, with `SKIP`, in batches of 100. Verify by reading them back, not by
   reading the response.
4. **Broker Okta** with the auto-link flow. Test with one real account before anyone else
   sees it.
5. **Move apps one at a time**, lowest-traffic first, each with its own rollback: the old
   Okta app stays configured until the new one is proven.
6. **Watch the drain.** Users who have never logged in through Keycloak still only exist as
   imported profiles; the brokered login count is your progress bar.
7. **Cut the tether**: remove the identity provider, delete the auto-link flow, require
   password or passkey enrolment, export the Okta system log, close the tenant.

Step 5 is where the quarter goes. Everything above it is a week.

If you are weighing the move rather than running it, the
[Keycloak and Okta comparison](/keycloak-alternatives/okta/) covers what you give up in
product terms, and the [production readiness checklist](/blog/keycloak-production-checklist/)
is the other half of "Keycloak is free" — the half that is not.

Running Keycloak yourself is a real job on top of the migration, and the two are easier
apart: [managed Keycloak](/hosting/dedicated-clusters/) means the cutover is the only project
you are running that quarter. If you want someone who has done this before to plan the app
order and sit on the drain with you, [talk to us about migrating to
Keycloak](/support/migrate-to-keycloak/).
