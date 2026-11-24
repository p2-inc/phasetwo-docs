---
slug: schrems-ii-transfer-impact-assessment-identity-provider
title: "Schrems II and the transfer impact assessment for an IdP"
date: 2026-11-25
authors: [jpatzer]
tags: [keycloak, eu-data-residency, gdpr, compliance, security]
description: The six-step EDPB transfer impact assessment applied to an identity provider, what a remote administrator can read in a Keycloak realm, and our own answers.
keywords:
  [
    schrems ii,
    transfer impact assessment,
    standard contractual clauses identity provider,
    gdpr chapter v identity provider,
    keycloak data residency,
  ]
---

A transfer impact assessment is the written analysis _Schrems II_ requires before you rely on standard contractual clauses to move personal data outside the EEA, and an identity provider needs one even when every byte of its database sits in Frankfurt. The reason is in one footnote of the EDPB's own guidance: **remote access from a third country is itself a transfer**, so a support engineer in Seattle opening an admin console against an EU cluster is doing the thing Chapter V regulates, whether or not a row is ever copied out of the region. Below is the six-step assessment from EDPB Recommendations 01/2020 applied to an IdP specifically, a measurement of exactly which categories of personal data a remote administrator can read in the clear on Keycloak 26.8.2, and our own answers to each step, including the two that go against us.

<!-- truncate -->

## The six steps, in the order you have to do them

This is the roadmap in EDPB Recommendations 01/2020, final version adopted 18 June 2021, lifted straight from its table of contents.

1. **Know your transfers.** Map every transfer, including onward transfers to subprocessors, and verify the data transferred is limited to what is necessary.
2. **Identify the transfer tools you are relying on.** Adequacy decision, Article 46 safeguard, or an Article 49 derogation.
3. **Assess whether the Article 46 tool is effective** in light of all circumstances of the transfer — that is, whether the destination country's law and practice undermine it.
4. **Adopt supplementary measures** if Step 3 says the tool alone is not enough.
5. **Take the procedural steps** that the chosen tool requires.
6. **Re-evaluate at appropriate intervals.**

Only Step 3 is about the United States. The other five are about your own system, and for an identity provider they are more revealing than most people expect, because an IdP is unusual: it holds a record for every person who can sign in to anything you run, plus a log of when and from where each of them did.

## Why an identity provider needs one even when nothing is copied out

Recommendations 01/2020 says it twice. Footnote 23 to Step 1: "remote access by an entity from a third country to data located in the EEA is also considered a transfer." And paragraph 13: "remote access from a third country (for example in support situations) and/or storage in a cloud situated outside the EEA offered by a service provider, is also considered to be a transfer," citing the EDPB's own _Schrems II_ FAQ, which puts it as "even providing access to data from a third country, for instance for administration purposes, also amounts to a transfer."

So the question a residency page answers — where is the data stored — is not the question Chapter V asks. Chapter V asks who can reach it, from where, and under what law. A [managed Keycloak](/hosting/dedicated-clusters/) service with an EU region and a globally distributed operations team has a transfer to assess. Ours does, and we describe it on the [EU data residency](/hosting/eu-data-residency/) page rather than waiting to be asked.

One leg of this is easier than people assume. A transfer from the EEA to the United Kingdom is covered by the Commission's renewed adequacy decisions, adopted 19 December 2025 and running to 27 December 2031, so no Article 46 tool and no TIA is needed for that leg at all. The TIA exists for the US leg.

## Step 1: what a remote administrator can actually read

Step 1 asks for categories of data, categories of data subjects, purposes, recipients, and — the column that decides Step 4 — the **format** of the data: plain text, pseudonymised, or encrypted. For an identity provider that column has to be measured, not assumed, because the administrative API and the database do not expose the same things.

Everything below ran against a stock Keycloak 26.8.2 on PostgreSQL 17, in a realm with one user, one client and one login:

```bash
docker run -d --name kcdb --memory 384m \
  -e POSTGRES_USER=kc -e POSTGRES_PASSWORD=kc -e POSTGRES_DB=kc postgres:17

docker run -d --name kc --memory 1536m -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -e KC_DB=postgres -e KC_DB_URL="jdbc:postgresql://<kcdb-ip>:5432/kc" \
  -e KC_DB_USERNAME=kc -e KC_DB_PASSWORD=kc \
  quay.io/keycloak/keycloak:26.8.2 start-dev

KC=http://127.0.0.1:8080
TOKEN=$(curl -s -X POST "$KC/realms/master/protocol/openid-connect/token" \
  -d client_id=admin-cli -d username=admin -d password=admin \
  -d grant_type=password | jq -r .access_token)
U=$(curl -s "$KC/admin/realms/eu-tia/users?username=anja" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')
```

What the service-provider side sees over the admin API — which is the surface a remote support session actually uses — is this:

```console
$ curl -s "$KC/admin/realms/eu-tia/users/$U" -H "Authorization: Bearer $TOKEN" \
    | jq -S 'del(.access, .disableableCredentialTypes, .requiredActions)'
{
  "createdTimestamp": 1795425701871,
  "email": "anja.keller@example.de",
  "emailVerified": true,
  "enabled": true,
  "firstName": "Anja",
  "id": "ceaee510-921c-40ca-a628-bb32c487dd09",
  "lastName": "Keller",
  "notBefore": 0,
  "totp": false,
  "username": "anja"
}
```

Credentials are the exception, and they are the one row in the whole map where the format column says something other than "plain text":

```console
$ curl -s "$KC/admin/realms/eu-tia/users/$U/credentials" -H "Authorization: Bearer $TOKEN" | jq -S .
[
  {
    "createdDate": 1795425701927,
    "credentialData": "{\"hashIterations\":5,\"algorithm\":\"argon2\",\"additionalParameters\":{\"hashLength\":[\"32\"],\"memory\":[\"7168\"],\"type\":[\"id\"],\"version\":[\"1.3\"],\"parallelism\":[\"1\"]}}",
    "id": "f162e9b7-3b5f-4e79-81a5-09077c88ef00",
    "type": "password"
  }
]
```

The hash itself is not returned over this path at all — only its parameters. That is a real limit, and it is also the narrowest possible one: it protects the password and nothing else. For what the same records look like from the database side, and which of them fall under which tier of US compelled process, see [the CLOUD Act and your identity provider](/blog/cloud-act-identity-provider/).

The honest summary of Step 1 for an IdP, then:

| Category                                                  | Format a remote administrator sees                                                     | Can it be withheld and the service still work?              |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Username, email, given and family name                    | Plain text                                                                             | No. Lookup, login and account linking all need them         |
| Declared profile attributes                               | Plain text                                                                             | Only by not declaring them                                  |
| Session records, including IP address                     | Plain text                                                                             | No. The session is the thing being administered             |
| Login and admin events, including IP address and username | Plain text                                                                             | Retention can be bounded; content cannot be masked natively |
| Group and role assignments                                | Plain text                                                                             | No                                                          |
| Password credential                                       | argon2id digest, parameters only over the API                                          | Already withheld                                            |
| Realm signing keys                                        | Not readable over the admin API; readable from the database or an operator-side export | Partly — see below                                          |

Realm keys deserve their own line because the customer-facing and operator-facing paths differ, and the difference is measurable; it is the subject of [data residency vs data sovereignty](/blog/data-residency-vs-data-sovereignty-identity-provider/) and not repeated here.

### Two things that widen the map without anyone deciding to

**Unmanaged attributes.** Keycloak's declarative user profile is on by default, with four attributes declared and the unmanaged attribute policy unset, which means disabled. Post a user with extra attributes anyway and the call succeeds while the attributes vanish:

```console
$ curl -s "$KC/admin/realms/eu-tia/users/profile" -H "Authorization: Bearer $TOKEN" \
    | jq -c '{unmanagedAttributePolicy, declared: [.attributes[].name]}'
{"unmanagedAttributePolicy":null,"declared":["username","email","firstName","lastName"]}

$ curl -s -o /dev/null -w "%{http_code}\n" -X POST "$KC/admin/realms/eu-tia/users" \
    -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
    -d '{"username":"anja","email":"anja.keller@example.de","firstName":"Anja",
         "lastName":"Keller","enabled":true,
         "attributes":{"department":["Finanzen"],"employeeId":["DE-40219"]}}'
201

$ docker exec kcdb psql -U kc -d kc -c \
    "SELECT ua.name, ua.value FROM user_attribute ua
       JOIN user_entity u ON u.id = ua.user_id WHERE u.username = 'anja';"
 name | value
------+-------
(0 rows)
```

A `201` and no attributes. Read that in both directions: the default is data minimisation, which is the right default and which your TIA can cite; and if a migration script of yours relies on arbitrary attributes, it is failing silently right now. Setting the policy to `ENABLED` stores them and puts every one of them in the plain-text column of your map, so the policy is a transfer decision as much as a schema one.

**Admin event representations.** Turning on admin events with details copies the full resource representation into the event store on every write:

```console
$ curl -s "$KC/admin/realms/eu-tia/admin-events?max=1" -H "Authorization: Bearer $TOKEN" \
    | jq -S '.[0] | del(.id, .realmId, .time)'
{
  "authDetails": {
    "clientId": "0787a8fe-c360-46b2-870a-0398a1b6d172",
    "ipAddress": "172.17.0.1",
    "realmId": "0c7b887f-01e0-4dee-84c4-3957a520f275",
    "userId": "6d159246-7514-45af-8af7-15a50aeeb901"
  },
  "operationType": "UPDATE",
  "representation": "{\"username\":\"anja\",\"firstName\":\"Anja\",\"lastName\":\"Keller\",\"email\":\"anja.keller@example.de\",\"emailVerified\":true,\"enabled\":true}",
  "resourcePath": "users/ceaee510-921c-40ca-a628-bb32c487dd09",
  "resourceType": "USER"
}
```

That is a second copy of the user record, in a table with no expiry configured by default, created by a setting most people enable for audit reasons without noticing it duplicates personal data. Keep it on — an audit trail is worth more than the tidiness — but put the admin event store in your map, bound its retention, and read [the audit log documentation](/docs/audit-logs/) before you decide how long.

## Step 3: assessing US law and practice, as of 23 November 2026

Step 3 is where a TIA either does work or recites marketing. The EDPB wants the law _and the practice_: who may demand access, through which mechanism, with what oversight and what redress, plus reported precedents. For an identity provider operated from the United States the shortlist is small.

| Instrument                  | What it reaches in an IdP                                                                                                                  | Status, checked 23 November 2026                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FISA Section 702            | Communications of non-US persons from an "electronic communication service provider"; whether a B2B identity service is one is contestable | Statutory authority lapsed in June 2026 when Congress did not reauthorise it; collection continues under Foreign Intelligence Surveillance Court certifications approved in March 2026 and running to 17 March 2027. Nothing enacted since; the current push is to attach a renewal to must-pass legislation |
| Executive Order 12333       | Collection abroad, outside the FISA framework, with no judicial authorisation                                                              | Unchanged, and the reason transit encryption is on every supplementary-measures list                                                                                                                                                                                                                         |
| CLOUD Act, 18 U.S.C. § 2713 | Data in a provider's "possession, custody, or control", wherever stored — so an EU region does not remove it                               | Unchanged. The analysis is in [the CLOUD Act and your identity provider](/blog/cloud-act-identity-provider/)                                                                                                                                                                                                 |
| UK–US Data Access Agreement | Qualifying serious-crime orders served directly on UK providers                                                                            | In force since 3 October 2022. Relevant if a UK entity is in your chain                                                                                                                                                                                                                                      |

The oversight and redress half of Step 3 is moving faster than the statutes. The Privacy and Civil Liberties Oversight Board — the body EDPB guidance names as a source for assessing US practice — has been below its three-member statutory quorum since early 2025, which stops it starting new investigations or issuing board reports. The D.C. Circuit heard argument on 17 November 2026 on whether the removals that caused this were lawful, and had not ruled as of this writing. Separately, the EU–US Data Privacy Framework remains in force and remains under appeal before the Court of Justice in Case C-703/25 P, with no hearing announced; on 31 July 2026 the EDPB asked the Commission to assess whether the Supreme Court's decision in _Trump v. Slaughter_ affects the FTC's ability to enforce the framework's commitments.

None of that changes a TIA's conclusion by itself. It changes what a defensible TIA has to say in Step 6 about how often it is re-read.

## Step 4: which supplementary measures survive contact with an IdP

This is the uncomfortable part, and a TIA that skips it is not a TIA. Annex 2 of Recommendations 01/2020 works through seven use cases. Two of them describe exactly what a managed identity provider is, and the EDPB's conclusion for both is the same sentence.

**Use Case 6**, transfer to a processor that requires access to data in the clear: where the processor needs the clear data to do the job, the EDPB is "incapable of envisioning an effective technical measure to prevent that access from infringing on the data subject's fundamental rights." **Use Case 7**, business transfers including by way of remote access, reaches the same conclusion. And paragraph 95 closes the obvious escape: "transport encryption and data-at-rest encryption even taken together, do not constitute a supplementary measure that ensures an essentially equivalent level of protection if the data importer is in possession of the cryptographic keys."

An identity provider cannot be run on pseudonymised data — it exists to attribute a login to a specific person — and the operator holds the keys to the storage it operates. So the honest Step 4 for _any_ managed IdP with non-EU administrative access, ours included, is: there is no technical measure that makes the clear-text access go away, and what remains is narrowing, logging and contract. Say that plainly rather than listing AES-256 and hoping nobody opens Annex 2.

What does narrow it, measurably:

**Scope the operator's own account.** Keycloak's realm-management roles are granular enough to give an on-call operator event access without user access. Build one holding only `view-events` on the realm:

```bash
CID=$(curl -s "$KC/admin/realms/master/clients?clientId=eu-tia-realm" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')
ROLE=$(curl -s "$KC/admin/realms/master/clients/$CID/roles/view-events" \
  -H "Authorization: Bearer $TOKEN" | jq -c '[{id, name}]')
curl -s -X POST "$KC/admin/realms/master/users/$OPS/role-mappings/clients/$CID" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$ROLE"

OPSTOK=$(curl -s -X POST "$KC/realms/master/protocol/openid-connect/token" \
  -d client_id=admin-cli -d username=ops-oncall -d password="$OPS_PW" \
  -d grant_type=password | jq -r .access_token)
```

It does what it says:

```console
$ curl -s -w "\nHTTP %{http_code}\n" "$KC/admin/realms/eu-tia/users" -H "Authorization: Bearer $OPSTOK"
{"error":"HTTP 403 Forbidden"}
HTTP 403

$ curl -s "$KC/admin/realms/eu-tia/events" -H "Authorization: Bearer $OPSTOK" \
    | jq -c '.[] | {type, ipAddress, username: .details.username}'
{"type":"LOGIN","ipAddress":"172.17.0.1","username":"anja"}
```

Worth doing, and incomplete in a way worth knowing before you write it into a TIA. `view-events` carries the **admin** event stream as well, and with representations enabled that stream holds the records the `403` just withheld:

```console
$ curl -s "$KC/admin/realms/eu-tia/admin-events" -H "Authorization: Bearer $OPSTOK" \
    | jq -r '.[] | select(.resourceType == "USER") | .representation'
{"username":"anja","firstName":"Anja","lastName":"Keller","email":"anja.keller@example.de","emailVerified":true,"enabled":true}
```

Same name, same email address, through an endpoint the operator could still reach. A control that looks like separation of duties has a hole in it unless admin event details are off or the role set is split further — and we found that by testing the control rather than by reading the role name, which is the part of Step 4 that most often goes unwritten.

| Supplementary measure                                                                        | Effective for an IdP?                                                                                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Transport encryption                                                                         | Yes, for Step 3's EO 12333 exposure in transit. Not for access by the importer                          |
| At-rest encryption, operator-held keys                                                       | No — Recommendations 01/2020 ¶95, explicitly                                                            |
| Pseudonymisation                                                                             | No. Attribution to a named person is the service                                                        |
| Keys in a host keystore rather than the realm database, via the `java-keystore` key provider | Partly. It moves key custody; it does not reduce what an administrator reads                            |
| Role-scoped operator accounts                                                                | Partly, and verify it — see the admin event stream above                                                |
| Bounded event retention and declared-attribute-only profiles                                 | Yes, for the volume and categories transferred, which is Step 1's minimisation duty                     |
| Published request policy, challenge commitments, transparency count                          | Organisational, and the EDPB is clear these do not by themselves overcome problematic third-country law |

## Steps 5 and 6: file it, then put a date on re-reading it

Step 5 for SCCs is mostly good news: you do not need supervisory authority authorisation to _add_ supplementary measures to the Commission's clauses, as long as they do not contradict them. You do need authorisation if you modify the clauses themselves.

Step 6 is the one that rots. Accountability is continuing, and a TIA written in 2024 that still describes Section 702 as a statute in force, or the PCLOB as quorate, is evidence of a process rather than a position. Reasonable triggers to pin a review to: 17 March 2027, when the current FISC certifications run out; a judgment in C-703/25 P; the D.C. Circuit's ruling on the PCLOB removals; and the four-year review of the UK adequacy decisions, ahead of their 27 December 2031 sunset.

## Our own answers

Same six steps, our side, with the two rows that do not flatter us left in.

| Step                      | Phase Two                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Know your transfers    | EU clusters keep the database, sessions, event store, backups and realm signing keys in Frankfurt (`eu-central-1`), with backups in Ireland (`eu-west-1`), never replicated outside the EU. Dashboard metadata, support ticketing and billing run in the United States. The class-by-class map is in [where your Keycloak data lives](/blog/where-your-keycloak-data-lives/) and the regions are in the [regions documentation](/docs/self-service/regions/) |
| 1b. The transfer we have  | **Our control plane runs in the United States and our team works remotely from the United States and Europe, so administrative access to an EU cluster can come from outside the EU.** Access is granted to named operations roles, goes through zero-trust network access with SSO and MFA, and is logged                                                                                                                                                   |
| 2. Transfer tool          | Standard Contractual Clauses, Commission Implementing Decision (EU) 2021/914, incorporated into the [data processing agreement](/company/data-processing/). We are **not** certified under the EU–US Data Privacy Framework and do not rely on it                                                                                                                                                                                                            |
| 3. Assessment             | The instruments in the table above, against the categories in the Step 1 table. Our reported precedent is the only number that matters here and it is **zero** government or law-enforcement requests received to date, published on the [government requests](/company/government-requests/) page                                                                                                                                                           |
| 4. Supplementary measures | Transport and at-rest encryption; keys for EU clusters held in the EU, by us; named-role access rather than team-wide; logging of administrative action; the request policy above. We do not claim a technical measure that defeats clear-text access, because per Annex 2 there is not one                                                                                                                                                                  |
| 5. Procedural             | The clauses are incorporated unmodified; the assessment is written down and we share it on request, without an NDA                                                                                                                                                                                                                                                                                                                                           |
| 6. Re-evaluation          | Against the triggers listed above, and the regulatory facts on these pages carry the date they were checked                                                                                                                                                                                                                                                                                                                                                  |

Two rows we would rather not write, written anyway. **Administrative access logs are examined in our SOC 2 Type II audit but are not exposed to customers** — a TIA reviewer should treat an access log they cannot read as a control they cannot verify, and we would like to change that. And **our contractual breach notification window is 72 hours**, which is three times the 24-hour early warning NIS2 gives you; raise it during contracting rather than during an incident.

## What we do not claim

- We do not describe ourselves as sovereign, and we do not claim to be outside US legal process. Phase Two, Inc. is US-incorporated and is the party to your agreement; a UK contracting entity, Phase Two UK, Ltd, is available on request. The longer version is in [is EU hosting enough?](/blog/is-eu-hosting-enough/)
- Encryption keys for EU clusters are held by us, in the EU. They are not customer-held, and per paragraph 95 that means they do not count as a supplementary measure against access by us.
- A transfer impact assessment is our analysis of our own transfers. It is not legal advice to you, and your DPO's conclusion on the same facts is the one that governs your deployment.

If you are writing the controller-side half of this, the questionnaire it tends to arrive as is in [data residency requirements for SaaS authentication](/blog/data-residency-requirements-saas-authentication/), and the Article 28 terms behind our answers are on the [data processing agreement](/company/data-processing/) page. If you want the assessment itself, ask — the full map and the clauses that carry it start at [EU data residency](/hosting/eu-data-residency/), and no NDA is required to read either.

_Keycloak behaviour was tested on 26.8.2 with PostgreSQL 17, against the 26.8.2 Server Administration Guide. EDPB Recommendations 01/2020 was read in its final version of 18 June 2021, including Annex 2. Regulatory facts were verified on 23 November 2026: the status of FISA Section 702 against the Brennan Center's Section 702 resource page as updated 16 November 2026; the PCLOB quorum and the D.C. Circuit argument of 17 November 2026 against current legal reporting; Case C-703/25 P against current legal reporting, which has the appeal pending with no hearing announced; the EDPB's 31 July 2026 letter to the Commission concerning Trump v. Slaughter; and UK adequacy against the Commission's renewal of 19 December 2025._
