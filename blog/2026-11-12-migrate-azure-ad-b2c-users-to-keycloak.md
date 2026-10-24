---
slug: migrate-azure-ad-b2c-users-to-keycloak
title: "Migrating Azure AD B2C users without password hashes"
date: 2026-11-12
unlisted: true
authors: [gpatil]
tags: [keycloak, migration, azure, users, identity-providers]
description: Azure AD B2C exports no password hashes. The three patterns that move users to Keycloak anyway — and why the usual just-in-time bridge is the wrong default for B2C specifically.
keywords:
  - migrate azure ad b2c to keycloak
  - azure ad b2c password hash export
  - azure b2c user migration
  - keycloak just in time user migration
  - azure ad b2c identity provider keycloak
---

Azure AD B2C will not give you password hashes. Microsoft Graph's `passwordProfile` is a write
path — you set a password on an account you are creating — and there is no property, endpoint
or support process that reads one back. So moving users to Keycloak means moving profiles,
which is easy, and then dealing with credentials, which is the whole project.

There are three patterns, and most migrations use two of them. **Broker B2C as an OIDC identity
provider** and let users keep signing in through it while applications move. **Validate the
password at first login** against B2C and store it locally. **Send a reset** to whoever is
left at the cutover date.

The received wisdom — the pattern that works for Auth0 and Cognito — is that the second one is
the default. **For B2C it is not**, and the reason is in Microsoft's own documentation: the
only endpoint that can validate a B2C password from your code is the ROPC endpoint, which is
documented as local-accounts-only and explicitly unsupported server-to-server. Start from
brokering instead.

Everything below was run against **Keycloak 26.8.1** in `start-dev`; the Java compiles against
26.8.1. Every HTTP status and response body is copied from an actual run.

<!-- truncate -->

## The short version

1. Inventory the directory: how many users are local accounts, how many are federated, how many
   have MFA enrolled. This decides everything else.
2. Export profiles with Microsoft Graph, including `identities` and your `extension_` attributes.
3. **Declare every attribute in the Keycloak realm's user profile before importing anything.**
4. Create the B2C identity provider in Keycloak and bulk-import profiles pre-linked to it.
5. Move applications to Keycloak. Users still authenticate at B2C, through Keycloak.
6. Migrate credentials behind that: a credential bridge where ROPC works, a reset for the rest.
7. Switch B2C off only when the broker has gone a full billing cycle without being used.

## What Graph gives you, and what it does not

The export is a straightforward Graph query. The parts people miss are `identities` and the
extension attributes.

```bash
# Scopes: User.Read.All (or User.ReadWrite.All if you are also cleaning up)
curl -s -H "Authorization: Bearer $GRAPH_TOKEN" \
  'https://graph.microsoft.com/v1.0/users?$select=id,displayName,givenName,surname,identities,otherMails,accountEnabled,createdDateTime,extension_831374b3bd5041bfaa54263ec9e050fc_loyaltyNumber&$top=999'
```

That attribute name is not a typo. B2C stores custom attributes against the `b2c-extensions-app`
application registration, and
[names them](https://learn.microsoft.com/azure/active-directory-b2c/user-profile-attributes)
`extension_ApplicationClientID_AttributeName` with the hyphens stripped out of the client ID.
Find the app under App registrations, take its Application (client) ID, remove the hyphens.
Get this wrong and `$select` silently returns nothing for that field — an empty column, not an
error.

`identities` is the one that decides your plan:

```json
"identities": [
  { "signInType": "emailAddress", "issuer": "contoso.onmicrosoft.com",
    "issuerAssignedId": "jsmith@yahoo.com" },
  { "signInType": "federated", "issuer": "facebook.com",
    "issuerAssignedId": "5eecb0cd" }
]
```

A `signInType` of `federated` means the user has **no password in B2C at all** — their
credential lives at Facebook or Google. Those users do not need credential migration; they need
the same social provider configured in Keycloak and their `issuerAssignedId` carried across as a
federated identity link. Count them first. In most consumer tenants they are a large fraction of
the directory, and they are the easy half.

What Graph will not give you:

- **Password hashes.** No property, no export job, no support ticket. `passwordProfile` is
  write-only in practice.
- **MFA secrets.** Phone numbers used for MFA are reachable through the phone authentication
  method APIs; TOTP secrets are not portable, and neither is anything WebAuthn.
- **Sign-in history.** It lives in the audit logs on their own retention, not on the user.

## Why the usual just-in-time bridge is the wrong default for B2C

The standard pattern for a legacy IdP is a Keycloak user storage provider that validates the
first login against the old system and then writes the credential locally. We use it for other
migrations and it works well.

For B2C it runs into three documented walls at once. The only way your code can check a B2C
password is the [resource owner password credentials
flow](https://learn.microsoft.com/azure/active-directory-b2c/add-ropc-policy), and Microsoft's
page on it says:

> **Server-to-server**: The identity protection system needs a reliable IP address gathered from
> the caller (the native client) as part of the interaction. In a server-side API call, only the
> server's IP address is used. If a dynamic threshold of failed authentications is exceeded, the
> identity protection system may identify a repeated IP address as an attacker.

A Keycloak cluster validating logins against B2C is precisely a server-side API call from a
small, fixed set of IP addresses. That is the configuration Microsoft is describing as
unsupported, and the failure mode is not an error you can handle — it is your migration traffic
being throttled as an attack, intermittently, under load, at cutover.

The same page adds two more limits:

> ROPC supports local accounts only. Users can't sign in with federated identity providers.

> ROPC doesn't work when there's any interruption to the authentication flow that needs user
> interaction. For example, when a password expires or needs to be changed, multifactor
> authentication is required, or when more information needs to be collected during sign-in.

So the bridge cannot serve your federated users, cannot serve anyone with MFA, and cannot serve
anyone whose password needs changing — and it does all of that from an IP address Microsoft's
protection system is entitled to treat as hostile. On a tenant that is mostly local accounts
without MFA it is still a good tool. As the *default* it is a bad bet, and this is the single
biggest difference between a B2C migration and an Auth0 one.

## Pattern 1: broker B2C as an identity provider

This is where to start. Keycloak federates to B2C over standard OIDC, your applications move to
Keycloak immediately, and nobody's password moves at all on day one.

```bash
kcadm.sh create identity-provider/instances -r b2c \
  -s alias=b2c -s providerId=oidc -s enabled=true -s trustEmail=true \
  -s 'config.authorizationUrl=https://contoso.b2clogin.com/contoso.onmicrosoft.com/B2C_1_signupsignin/oauth2/v2.0/authorize' \
  -s 'config.tokenUrl=https://contoso.b2clogin.com/contoso.onmicrosoft.com/B2C_1_signupsignin/oauth2/v2.0/token' \
  -s 'config.jwksUrl=https://contoso.b2clogin.com/contoso.onmicrosoft.com/B2C_1_signupsignin/discovery/v2.0/keys' \
  -s 'config.issuer=https://contoso.b2clogin.com/11111111-1111-1111-1111-111111111111/v2.0/' \
  -s 'config.useJwksUrl=true' -s 'config.clientId=...' -s 'config.clientSecret=...' \
  -s 'config.clientAuthMethod=client_secret_post' -s 'config.defaultScope=openid' \
  -s 'config.syncMode=FORCE'
# HTTP 201
```

Three details that are specific to B2C and cost time if you miss them.

**The issuer is not the authorization host.** Authorization and token endpoints live under
`contoso.b2clogin.com/contoso.onmicrosoft.com/<policy>/`, but the `iss` claim in the token is
`https://contoso.b2clogin.com/<tenant-guid>/v2.0/` — the directory GUID, not the domain name.
Set `config.issuer` from an actual decoded token, not from the endpoint URLs, or validation
fails with a mismatch that reads like a configuration typo.

**The policy is part of the URL.** Every B2C user flow and custom policy is a separate OIDC
issuer path. If you run a sign-up/sign-in policy and a separate profile-edit policy, the broker
points at the sign-in one and the others become your problem to replicate in Keycloak.

**`trustEmail` is a decision, not a default.** B2C verifies email on local accounts, so trusting
it is usually right and it skips a redundant verification step at first login. For federated
accounts it means trusting whatever Facebook asserted. Decide deliberately.

Then map the claims you need onto Keycloak attributes:

```bash
kcadm.sh create identity-provider/instances/b2c/mappers -r b2c \
  -s name=loyalty -s identityProviderAlias=b2c \
  -s identityProviderMapper=oidc-user-attribute-idp-mapper \
  -s 'config.claim=extension_loyaltyId' \
  -s 'config."user.attribute"=extension_loyaltyId' \
  -s 'config.syncMode=INHERIT'
# HTTP 201
```

What you get: applications on Keycloak from week one, a single place to add new authentication,
and a B2C dependency you can remove on your own schedule rather than inside a cutover window.
What you still owe: getting the credentials across before you can turn B2C off, because a user
whose only credential is at B2C stops working the moment B2C does.

## Pattern 2: the credential bridge, where ROPC still works

For the subset the limits above do not exclude — local accounts, no MFA — a user storage
provider validates the first login against B2C and writes the password into Keycloak. Keycloak
ships exactly two storage providers out of the box:

```
['kerberos', 'ldap']
```

So this is a JAR you build and drop in `providers/`, the same as any other SPI. The core of it:

```java
@Override
public boolean isValid(RealmModel realm, UserModel user, CredentialInput input) {
  if (!supportsCredentialType(input.getType()) || !isConfiguredFor(realm, user, input.getType())) {
    return false;
  }
  String password = input.getChallengeResponse();
  if (!validateAgainstB2c(user.getEmail(), password)) {
    return false;
  }

  // B2C said yes. Store the credential locally and stop asking B2C about this user.
  user.credentialManager().updateCredential(UserCredentialModel.password(password, false));
  user.setSingleAttribute("b2c_migration_state", "migrated");
  return true;
}
```

and the call itself, against the ROPC policy:

```java
String url = "https://%s.b2clogin.com/%s.onmicrosoft.com/%s/oauth2/v2.0/token"
    .formatted(tenant, tenant, policy);

String form = "grant_type=password&response_type=token id_token"
    + "&client_id=" + enc(clientId)
    + "&scope=" + enc("openid " + clientId)
    + "&username=" + enc(username)
    + "&password=" + enc(password);
// 200 means the credential is right. Anything else -- including AADB2C90225 for a
// bad password and a throttle response for too many calls from one IP -- is a no,
// and the two are not distinguishable here. Log the body; do not retry in-flow.
return res.statusCode() == 200;
```

Gate it on an attribute (`b2c_migration_state`) so the provider only consults B2C for users that
have not migrated yet. Without that gate every login in the realm pays a round trip to Azure
forever, including the ones that already have a local password.

Three things to get right before this goes near production:

- **Log the error body, and alert on the rate.** A bad password and a throttle look the same to
  the caller. If the share of failures jumps, you are being rate-limited, not suffering a sudden
  outbreak of forgotten passwords — and you need to know that within minutes, not at the end of
  the week.
- **Set a password policy in Keycloak that your migrated passwords satisfy.** B2C enforces
  Microsoft Entra's strong password strength and does not expire passwords, so the bar is
  already decent — but if your Keycloak realm demands something B2C did not, the credential you
  just validated will be rejected on write.
- **Keycloak rehashes on write.** The password lands under one of the four hashing providers
  Keycloak ships — `argon2`, `pbkdf2`, `pbkdf2-sha256`, `pbkdf2-sha512`, with Argon2 the
  default — so you end up with better storage than you started with. That is the one genuine
  upside of not being able to export hashes.

The same pattern, against a provider that *does* hand over hashes, is in [migrating from Auth0
to Keycloak](/blog/migrate-auth0-to-keycloak/). We maintain tooling for this shape of problem —
see the [user migration extension](/extensions/user-migration/).

## Pattern 3: the reset mail for whoever is left

There is always a tail: dormant accounts, people on holiday, anyone the bridge could not serve.
Flag them with a required action and they are prompted at next login.

```bash
curl -X PUT "$KC/admin/realms/b2c/users/$U" -H "$A" -H 'Content-Type: application/json' \
  -d '{"requiredActions":["UPDATE_PASSWORD"]}'
# HTTP 204
```

```json
requiredActions: ['UPDATE_PASSWORD']
```

Budget for support volume rather than for engineering here. A reset wave is a helpdesk event,
and the thing that reduces it is sequencing — run it after the broker has been live long enough
that the active users have already migrated themselves, so the mail only reaches people who
genuinely were not coming back soon.

## Importing the profiles, and the attribute that disappears

Keycloak's `partialImport` endpoint takes the profiles in batches, and you can pre-link each user
to the B2C broker so their first login through it attaches to the right account rather than
creating a duplicate:

```json
{
 "ifResourceExists": "SKIP",
 "users": [{
   "username": "carol@example.com", "email": "carol@example.com", "emailVerified": true,
   "firstName": "Carol", "lastName": "Diaz", "enabled": true,
   "attributes": { "extension_loyaltyId": ["GB99887766"],
                   "b2c_object_id": ["7b2d1f3a-0000-4000-8000-abcdefabcdef"] },
   "federatedIdentities": [{ "identityProvider": "b2c",
                             "userId": "7b2d1f3a-0000-4000-8000-abcdefabcdef",
                             "userName": "carol@example.com" }]
 }]
}
```

The `userId` in `federatedIdentities` must be B2C's `objectId` — the GUID — because that is what
arrives in the `sub` claim, and it is what Keycloak matches on. Not the email.

Now the part that will cost you a day if you meet it in production. That import returns:

```json
{"overwritten":0,"added":1,"skipped":0,
 "results":[{"action":"ADDED","resourceType":"USER","resourceName":"carol@example.com", ...}]}
```

and the user it created looks like this:

```
enabled: True emailVerified: True
attributes: {'extension_loyaltyId': ['GB99887766']}
federationLink: (none)
```

**`b2c_object_id` is gone.** It was not declared in the realm's user profile, the realm's
`unmanagedAttributePolicy` is unset — which means `DISABLED` — and an undeclared attribute is
discarded on write. The import reported success. Nothing warned.

Declare it and the same import keeps it:

```
# after adding b2c_object_id to the user profile
stored attributes: {'b2c_object_id': ['bbbbbbbb-1111-2222-3333-444444444444']}
```

B2C's `objectId` is the only stable key you have for reconciling the two directories during a
dual run, so losing it silently on a million-row import is the expensive version of this
mistake. **Declare every attribute you intend to import, then import one user and read it back
before you import the rest.** The four policy values and what each one does are in [managed vs
unmanaged attributes](/tutorials/users/user-profile/).

Two smaller notes from the same run. The broker link *is* recorded correctly —

```json
[{"identityProvider":"b2c","userId":"7b2d1f3a-0000-4000-8000-abcdefabcdef","userName":"carol@example.com"}]
```

— and `federationLink` being empty is not a bug: that field refers to a user storage provider,
which is a different mechanism from an identity-provider link. If you run both patterns you will
see both, and they mean different things.

## Which pattern, and when

| Your users | Pattern | Why |
|---|---|---|
| Federated (`signInType: federated`) | Broker, then configure the social provider directly | There is no password to migrate. They are the easy half |
| Local accounts, no MFA | Broker + credential bridge | ROPC works for exactly this group |
| Local accounts with MFA enrolled | Broker, then reset | ROPC cannot complete a flow that needs interaction |
| Anyone the bridge has not caught by cutover | Reset mail | There is always a tail |
| Dormant beyond your retention policy | Do not migrate | Cheapest user is one you delete first |

And the timelines, as ranges rather than promises:

| Tenant | Elapsed |
|---|---|
| Built-in user flows, mostly social, under ~100k users | 3–6 weeks |
| Local accounts, custom claims, one or two federations | 6–10 weeks |
| Custom policies, several enterprise federations, MFA at scale | 2–4 months |

In every one of those, the user migration is the predictable part. The variance is in the
[custom-policy rewrite](/blog/azure-ad-b2c-custom-policies-to-keycloak/).

## Dual-run, and when to switch B2C off

While the broker is live, both directories are authoritative for something, and drift is the
risk. Three rules keep it manageable.

**Make Keycloak the write path as early as you can.** New sign-ups go to Keycloak, profile edits
go to Keycloak. B2C becomes read-only in practice even though nothing enforces it. Two systems
accepting writes to the same user is the thing that produces a reconciliation project nobody
scoped.

**Reconcile on `objectId`, on a schedule.** Users created directly in B2C during the dual run,
and users deleted there, both need to reach Keycloak. A weekly diff on the GUID is enough, and
it is the reason the attribute above matters.

**Switch off on evidence, not on a date.** Keycloak records a login event when a user
authenticates through the broker. When that count has been zero for a full billing cycle — long
enough to cover monthly-active users — the broker is unused and B2C can go. Turning it off on a
calendar date instead is how you lock out the quarterly users.

Keep the B2C tenant in place, unused, for a while after that. It costs nothing under the free
MAU tier and it is the only rollback you have.

## What you lose

Every migration guide that skips this section is selling something.

- **MFA enrolments.** TOTP secrets do not leave B2C and WebAuthn credentials are bound to the
  relying-party ID, so they cannot move by construction. Everyone re-enrols. Sequence this
  deliberately — a forced re-enrolment in the same week as a password reset is a bad week.
- **Password history.** Nothing carries over, so a user can set the password they just had.
- **ID Protection signals.** Already gone with P2 in March 2026, but if you were relying on
  risk-based output in any form, Keycloak's brute-force detection and client policies are not
  the same product and do not claim to be.
- **Azure-native integration.** Front Door custom domains, Application Insights, the
  Azure Monitor wiring. All replaceable, none free.
- **Sign-in history.** Audit logs stay in B2C on their own retention. Export anything you are
  obliged to keep *before* you stop paying attention to the tenant.
- **The B2C support contract.** You are swapping a Microsoft SLA for your own operations team
  or someone else's. Price that honestly — it is the main argument for [managed
  Keycloak](/hosting/dedicated-clusters/) over a VM you maintain.

## Do this next

Run one Graph query and count three numbers: total users, users whose `identities` contains a
`federated` entry, and users with a registered MFA method. Those three numbers tell you which
row of the decision table you are in, and you cannot be given a sensible estimate without them.

```bash
curl -s -H "Authorization: Bearer $GRAPH_TOKEN" \
  'https://graph.microsoft.com/v1.0/users?$select=id,identities&$top=999' \
| python3 -c 'import sys,json
d=json.load(sys.stdin)["value"]
fed=[u for u in d if any(i["signInType"]=="federated" for i in u["identities"])]
print(f"{len(d)} users, {len(fed)} federated, {len(d)-len(fed)} local")'
```

Then stand up Keycloak 26.8.1, point a test realm's identity provider at your B2C sign-in
policy, and log in once. Everything above either works or does not work in that first
round trip, and it costs an afternoon.

The decision about whether to move at all is in [what Azure AD B2C's end of sale actually
means](/blog/azure-ad-b2c-end-of-sale/), and the side-by-side is on [Keycloak vs. Azure AD
B2C](/keycloak-alternatives/azure-ad-b2c/). We do this migration as a service, bridge and
reconciliation included — [talk to us about migrating to
Keycloak](/support/migrate-to-keycloak/).
