---
title: "GDPR and Keycloak: erasure, retention, and residency"
slug: keycloak-gdpr
date: 2026-11-11
authors: [gpatil]
tags: [keycloak, gdpr, compliance, eu-data-residency, data-protection]
description: Which GDPR obligations Keycloak can satisfy, which it silently leaves to you, and which are decided by where you run it. Every claim tested on Keycloak 26.8.2.
keywords:
  [
    keycloak gdpr,
    keycloak gdpr compliance,
    gdpr identity provider,
    keycloak data subject request,
    keycloak data retention,
  ]
---

Keycloak gives you a working mechanism for roughly half of what the GDPR asks of an identity provider, no mechanism at all for the other half, and — the part that costs people — one mechanism that looks like it worked and did not. It has no concept of a data subject request, no data export for one person, no retention default other than *forever*, and no setting anywhere called residency. What it does have is a complete admin API over every record it keeps, which is enough to build the rest if you know which four gaps to fill. This post maps each obligation to the mechanism that actually serves it, tested against **Keycloak 26.8.2** on 2026-11-09, including the moment where a user erases their own account and Keycloak writes a fresh record of their username and IP address on the way out.

<!-- truncate -->

This is an engineering read of the regulation, not legal advice. Where a thing is a judgement call for your DPO rather than a setting, it says so.

## What the official documentation covers

One page. The Server Administration Guide has a section called [Personal data collected by Keycloak](https://www.keycloak.org/docs/latest/server_admin/index.html#_personal_data_collected_by_keycloak), and it is three bullets long: basic profile data, the same for social logins, and "device information collected for audit and security purposes, such as the IP address, operating system name, and the browser name." Then three guidelines about customisation, credentials being hashed, and authorization services holding object ownership.

That is accurate and it is the whole of it. There is no official guidance on erasure, on retention, on building a subject access package, or on where any of it is stored. Everything below is the part the guide skips.

## The mapping, obligation by obligation

| Obligation | Keycloak mechanism | What you still have to supply |
| --- | --- | --- |
| Art. 15 access | `GET /users/{id}`, `/credentials`, `/sessions`, `/consents`, `/events?user=` | The assembly, the format, and the one-month clock |
| Art. 16 rectification | Admin API and Account Console | Nothing — this one is complete |
| Art. 17 erasure | `DELETE /users/{id}`; self-service Delete Account action | Event store, admin-event representations, backups, logs |
| Art. 18 restriction | `enabled: false` — the closest thing there is | Everything else; see below |
| Art. 20 portability | Per-user JSON from the admin API; `kc.sh export` for the realm | A machine-readable format a human asked for |
| Art. 21 / 7(3) objection and withdrawal | `DELETE /users/{id}/consents/{clientId}` | Knowing that this, not logout, is the one that works |
| Art. 5(1)(e) storage limitation | `eventsExpiration`, `adminEventsExpiration`, session timeouts, workflows | Your log pipeline, which Keycloak does not manage |
| Art. 25 data protection by design | Unmanaged attributes are off by default | Watching what happens when you turn them on |
| Art. 30 records of processing | The admin API is the inventory | The document |
| Art. 32 security | Argon2id by default, brute-force detection, TLS | Operations |
| Art. 33 breach notification | Admin events plus an event listener | The 72-hour chain and someone to run it |
| Chapter V transfers | **Nothing.** Keycloak has no region, no residency flag | Where you run it, and who can log in to administer it |

Two rows in that table are not what most teams assume, and one row is empty. Those three are the rest of this post.

## Art. 15: there is no export button, so here is the package

Nothing in Keycloak assembles "everything you hold about me". Five endpoints hold the parts, and in 26.8.2 they return this:

```bash
# profile, including any custom attributes
curl -s -H "Authorization: Bearer $T" \
  "$KC/admin/realms/$REALM/users/$UID"

# credential metadata — note what this does and does not contain
curl -s -H "Authorization: Bearer $T" \
  "$KC/admin/realms/$REALM/users/$UID/credentials"
```

```json
[
  {
    "id": "120dd02a-953b-412f-bdd4-6b66688ee666",
    "type": "password",
    "createdDate": 1794214768785,
    "credentialData": "{\"hashIterations\":5,\"algorithm\":\"argon2\",\"additionalParameters\":{\"hashLength\":[\"32\"],\"memory\":[\"7168\"],\"type\":[\"id\"],\"version\":[\"1.3\"],\"parallelism\":[\"1\"]}}"
  }
]
```

The credentials endpoint returns metadata and no `secretData`: the algorithm, the parameters and the creation date, never the hash or the salt. That is the right answer for a subject access request — the person is entitled to know that you hold a password credential and how it is protected, not to receive the material that authenticates them. It is also a small piece of free evidence for an Art. 32 answer, since it shows what your realm is actually hashing with rather than what you believe it is.

Then sessions, consents, and the event rows:

```bash
curl -s -H "Authorization: Bearer $T" "$KC/admin/realms/$REALM/users/$UID/sessions"
curl -s -H "Authorization: Bearer $T" "$KC/admin/realms/$REALM/users/$UID/consents"
curl -s -H "Authorization: Bearer $T" "$KC/admin/realms/$REALM/events?user=$UID"
```

Sessions carry the IP address. Events carry the IP address, the username, the client, and in `details` a set of per-event fields that varies by type. Both are personal data about an identified person and both belong in the package.

The user-facing half is the Account REST API, which the Account Console runs on and which you can call directly with the user's own token:

```bash
curl -s -H "Authorization: Bearer $UAT" -H "Accept: application/json" \
  "$KC/realms/$REALM/account/sessions/devices"
```

```json
[{"os":"Other","device":"Other","lastAccess":1794214885,"current":true,
  "sessions":[{"id":"6R6fqTy-CYlfsRSYLUxpYunj","ipAddress":"172.17.0.1",
  "started":1794214885,"expires":1794250885,"browser":"curl/8.18.0"}]}]
```

Useful to know when a DPO asks whether the person can see this themselves: for profile, devices, linked accounts and credential metadata, yes. For the event store, no — there is no self-service view of it, so that part of an access request lands on you.

## Art. 17: the deletion writes a new record about the person

The documentation for the self-service Delete Account action says: "This action is irreversible. All your data in Keycloak will be removed."

We ran it. A realm with events enabled, a user called `bruno`, the `delete_account` required action enabled and the `delete-account` role assigned; then the real browser flow, `kc_action=delete_account`, login, confirm. The account goes:

```
confirm:200
GET /admin/realms/gdpr/users/62277568-... -> 404 {"error":"User not found"}
```

And the event store gains a row:

```json
{"type": "DELETE_ACCOUNT",
 "userId": "62277568-bf43-4f6f-bb20-aa35b2add13c",
 "ipAddress": "172.17.0.1",
 "details": {"username": "bruno", "custom_required_action": "delete_account", ...}}
```

The act of erasure is itself logged as an event containing the erased person's username, their internal id and the IP address they did it from — and with no expiration set, which is the default, that row has no end date. The same is true of the admin API route: after `DELETE /users/{id}` returns 204 and the user returns 404, `GET /events?user={id}` still returns their logins with username and IP, and a stored admin-event representation still carries their email address and phone number as plain JSON.

None of that makes the delete wrong. Audit records of a deletion have a defensible basis, and you may well need them. It makes "all your data will be removed" wrong, which matters, because that sentence is what a team quotes to its DPO. Erasure on Keycloak is a delete plus a decision about the event store, and the inventory of exactly what remains and where is in [what personal data Keycloak stores and how to erase it](/tutorials/users/personal-data-gdpr/).

## Art. 18 and 7(3): disable is not restriction, and logout is not withdrawal

Setting `enabled: false` is the only lever that resembles restriction of processing. Here is precisely what it reaches, on 26.8.2:

| After `PUT {"enabled": false}` | Result |
| --- | --- |
| New logins | Refused |
| Refresh token | `invalid_grant` — `"User disabled"` |
| Token introspection at the resource server | `{"active": false}` immediately |
| `/userinfo` with the existing access token | `401` |
| The existing access token, validated locally against the realm JWKS | **Still passes, for the rest of its lifetime** |
| The user's session row, with its IP address | **Still there** |

The fifth row is the one to design around. An access token that was minted before you disabled the account still verifies against the realm's public key, still contains `preferred_username` and `email`, and any resource server doing offline JWT validation — which is the recommended pattern for most APIs — will keep accepting it until `exp`. On a stock realm that is 300 seconds:

```
iat 1794214821 exp 1794215121 lifetime_s 300
```

Five minutes is fine for an offboarding. It is not fine as an answer to "processing has been restricted as of now", and it is not fine if someone has raised `accessTokenLifespan` to an hour to cut traffic. If you need processing to stop at a defined instant, the resource server has to introspect, or you have to accept the token lifespan as your true response time and write that number down.

Withdrawal of consent has the same shape of trap, in the other direction. An admin logout does not do it:

```bash
curl -X POST .../users/$UID/logout      # 204
curl -d "grant_type=refresh_token" -d "refresh_token=$OFFLINE_RT" .../token
# -> {"access_token": "...", "expires_in": 300, ...}
```

A 204, and the offline refresh token still mints access tokens. Offline tokens survive logout by design — that is what offline access is — and on a stock realm they live for 30 days (`refresh_expires_in: 2592000`). The thing that actually ends them is revoking the grant:

```bash
curl -X DELETE .../users/$UID/consents/app       # 204
curl -d "grant_type=refresh_token" -d "refresh_token=$OFFLINE_RT" .../token
# -> {"error":"invalid_grant","error_description":"Offline user session not found"}
```

So when someone withdraws consent or asks you to stop, `DELETE /users/{id}/consents/{clientId}` is the call. `POST /logout` reports success and leaves a 30-day credential in the hands of the application you were asked to cut off. The consents endpoint is also how you find them: an offline token shows up there as an `additionalGrants` entry labelled `Offline Token`, which is the only place the admin API names it in plain language.

## Art. 5(1)(e): four retention clocks, three of them unset

Storage limitation is not one setting. For an identity provider it is four, and Keycloak ships three of them switched off.

1. **Events.** Off by default; once on, kept forever unless you set an expiration, and the two expirations live in two different places with two different APIs. The mechanics, the units, and what the purge actually does are in [Keycloak event retention: expiration settings for GDPR](/tutorials/data-protection/event-retention/).
2. **Sessions and offline sessions.** These do have defaults — 10 hours for an SSO session, 30 days for an offline one — which is to say they have defaults you chose by not changing them. An offline session is a 30-day record of a person's device and IP.
3. **The accounts themselves.** A dormant account is retained personal data, and nothing deletes one. Keycloak now ships [workflows](https://www.keycloak.org/2025/10/workflows-experimental-26-4) for exactly this — notify, then disable, then delete on a schedule — and on 26.8.2 the `WORKFLOWS` feature is enabled by default, which we confirmed against the server's own feature list. The trap is that the obvious rule also deletes service accounts and takes their clients down with them. The tested version is in [automating offboarding and deprovisioning](/tutorials/workflows/user-offboarding/).
4. **The log stream**, which nobody counts. The default event listener is `jboss-logging`, so error events go to stdout at `WARN`:

   ```
   WARN [org.keycloak.events] type="LOGIN_ERROR", realmName="gdpr",
   clientId="app", userId="7f9703d0-...", ipAddress="172.17.0.1",
   error="invalid_user_credentials", username="erika"
   ```

   No successful login appeared in the container log at the default level; every failure did. Username and IP, leaving the database entirely, into a pipeline with its own retention, its own access control and frequently its own region. Keycloak's retention settings do not reach one line of it.

## Art. 25: the silent 204

Try to store an attribute Keycloak does not know about:

```bash
curl -X PUT -d '{"username":"erika", ..., "attributes":{"phoneNumber":["+49 30 1234567"]}}' \
  .../users/$UID
# 204
curl .../users/$UID | jq .attributes
# -> absent
```

The write is accepted, the attribute is dropped, and nothing tells you. Unmanaged attributes are `Disabled` by default in Keycloak 26, which is a genuinely good default — declared attributes only, data minimisation enforced by the schema. Set `unmanagedAttributePolicy: ENABLED` on `/users/profile` and the identical request stores the phone number.

Both states have a consequence worth knowing before an audit. Left at the default, an integration that thinks it is writing a national ID or a birthday is writing nothing, and your record of processing says you hold a field you do not. Switched on — commonly during a migration, and then left on — every attribute anything writes becomes stored personal data that no schema declares and no DPO has seen. Declare the attributes you need in the user profile and turn the policy back off when the migration ends.

## Chapter V: residency is not a Keycloak setting

There is no region field. Keycloak stores what you point it at, so the question "where does our identity data live" has five answers and none of them is in the realm configuration:

| Where identity data lands | What decides its location |
| --- | --- |
| The database | Your `--db-url` |
| Sessions and cache | Your Infinispan topology, and whether it spans sites |
| The event store | The same database, unless an event listener ships events elsewhere |
| Backups | Your backup policy and the region you replicate to |
| Logs and metrics | Your log pipeline, which is usually the least EU thing you own |

And a sixth that is not storage at all: who can authenticate to the admin console, and from where. Remote administrative access to EU-hosted data from outside the EU is a restricted transfer under Chapter V even when no byte is copied out, which is the argument that catches vendors whose data map is clean and whose on-call rota is not. The [network layer of that](/docs/self-service/restrictions/) is configurable; the organisational layer is a staffing decision.

If you are working through this as a buyer rather than an operator, the three companion pieces are [data residency vs data sovereignty for your identity provider](/blog/data-residency-vs-data-sovereignty-identity-provider/), the [DPO's checklist for a SaaS authentication vendor](/blog/data-residency-requirements-saas-authentication/), and [what a US parent actually means under the CLOUD Act](/blog/cloud-act-identity-provider/).

## Where we stand

On our [EU data residency](/hosting/eu-data-residency/) clusters: the Keycloak database, sessions, the event store and the realm signing keys are in Frankfurt (`eu-central-1`), backups are in Ireland (`eu-west-1`), and identity data is never replicated outside the EU. Backups are retained for 30 days, which is also the answer to "when is an erasure complete in your backups" — the live delete is immediate, the backup copies age out within the window, and a restore does not resurrect an erased record. The detail is in [backups and data retention](/docs/self-service/backups-and-data-retention/).

The unflattering half, in the same place: our control plane runs in the United States, our engineering team is distributed, and administrative access to an EU cluster can therefore come from outside the EU. That is a restricted transfer and we disclose it rather than describing EU-only administration we do not operate by default. You contract with Phase Two UK, Ltd (company number 16815578, registered in England and Wales); Phase Two, Inc. in Seattle is the parent. EU→UK transfers run on the European Commission's renewed adequacy decision of 2025-12-19, which runs to 2031-12-27. We are not certified under the EU–US Data Privacy Framework and do not rely on it for EU customer data. Dashboard metadata, support tickets and billing are in the US, so do not put end-user personal data in a support ticket. We have received zero government or law-enforcement requests to date. The regulatory facts in this paragraph were re-checked on 2026-11-09. Our [data processing agreement](/company/data-processing/) carries Art. 28(3) terms with contractual incident notification in 48–72 hours, which is short enough to feed your own Art. 33 clock. Support is in English only.

## What we could not make work

Three honest gaps, because they will come up in your own review:

- **There is no per-user export in the admin API.** `POST /partial-export` has a `users` key, which is the trap: on a realm with one human user and one service account it returned a single entry, and that entry was the service account. Real users come out of `kc.sh export` or out of iterating `/users` yourself. The exit path for a whole realm, with what it loses, is in [exporting a realm for portability](/tutorials/data-protection/exit-export/).
- **Erasure cannot reach a token already issued.** Nothing in Keycloak invalidates a JWT that a resource server validates offline. Your true response time for "stop processing now" is your access token lifespan, whatever you set it to.
- **We did not test SQL-level residue beyond what the admin API exposes.** The API view and the table view agreed everywhere we checked them, but the authoritative inventory is the database one.

The next step, if you are standing a realm up for a European deployment: enable events, set both expirations on day one rather than after the first audit, declare your attributes in the user profile and leave unmanaged attributes disabled, and decide — before anyone asks — whether your answer to "processing has stopped" is introspection or a token lifespan.

If you would rather the storage, backup and key-residency half of that list were somebody else's problem, that is what [EU data residency](/hosting/eu-data-residency/) on our managed clusters is for, and our [data processing agreement](/company/data-processing/) is available to your DPO without an NDA.
