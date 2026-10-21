---
slug: data-residency-vs-data-sovereignty-identity-provider
title: "Data residency vs data sovereignty for your identity provider"
date: 2026-10-21
authors: [gpatil]
tags: [keycloak, eu-data-residency, gdpr, compliance, security]
description: Data residency is where your identity data is stored. Data sovereignty is whose law and whose hands reach it. What each fixes, tested on Keycloak 26.8.1.
keywords:
  [
    data sovereignty vs data residency,
    data residency,
    digital sovereignty,
    keycloak data residency,
    identity provider data sovereignty,
  ]
---

Data residency is a statement about geography: your identity data is stored and processed in a named region and does not leave it. Data sovereignty is a statement about law and control: which legal systems can compel access to that data, and who holds the keys and the administrative credentials that make access technically possible. They are not the same claim, and the gap between them matters more for an identity provider than for almost any other system you run, because the IdP holds a record of every person who can sign in to anything you operate and a log of when and from where they did it. Below: both definitions, each applied to the four classes of data a Keycloak realm actually stores, the point where a region setting stops helping — demonstrated against Keycloak 26.8.1 — and the rubric European buyers have started scoring vendors with.

<!-- truncate -->

## The difference in one table

| | Data residency | Data sovereignty |
| --- | --- | --- |
| The question it answers | Where are the bytes written? | Who can lawfully compel access, and who can technically perform it? |
| Determined by | The region you pick when the service is provisioned | Corporate ownership, governing law, key custody, who holds admin access |
| Evidence a buyer can check | Region configuration, data centre locations, subprocessor list | Corporate structure, the processing agreement, a transfer impact assessment, key custody, access logs |
| How a vendor changes it | A different region | A different owner, a different jurisdiction, or a different operating model |
| Who reviews it internally | Infrastructure and architecture | Legal and the DPO |
| What it costs to verify | An afternoon | A contract negotiation |

A third term turns up in the same conversations. **Data localisation** is a legal requirement that certain data stay in a country — it is residency imposed by a regulator rather than chosen by a buyer. Residency is the control; localisation is one of the reasons you might need it; sovereignty is a separate axis that residency alone does not move.

The practical consequence is that residency is cheap and verifiable, sovereignty is expensive and contestable, and most vendor marketing quietly substitutes the first for the second. When a page says "your data never leaves the EU" and the question you asked was "can a non-EU authority compel it", you have been answered on the wrong axis.

## Why the gap is wider for an identity provider

Most systems hold one kind of data. An identity provider holds four, and they do not behave the same way under either control. Everything below was run against a stock Keycloak 26.8.1:

```bash
docker run -d --name kc -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.8.1 start-dev
```

After creating a realm, a user and a confidential client, and performing one login:

```console
$ kcadm.sh get events -r eu-demo --fields type,clientId,userId,ipAddress,time
[ { "time" : 1792402757656, "type" : "LOGIN", "clientId" : "portal",
    "userId" : "cb45f9ae-...", "ipAddress" : "172.17.0.1" } ]

$ kcadm.sh get clients/dbf8b3a4-.../user-sessions -r eu-demo
[ { "id" : "gCeFoM8Gbw5CEH-WxILJEf26", "username" : "anja",
    "ipAddress" : "172.17.0.1", "start" : 1792402757000 } ]
```

| Class | What it is | What residency settles | What residency leaves open |
| --- | --- | --- | --- |
| Credentials | Password hashes — argon2id by default in 26.x | Where the hash sits | Nothing, directly: a hash is not reversible. See the signing-key row, which makes that moot |
| Profile | Username, email, name, attributes, group and role membership | Where the records sit | They are readable in cleartext by anyone operating the database |
| Sessions | Active sessions, each carrying a username and an **IP address** | Where the session store sits | A session record is personal data about where your user was, not only that they signed in |
| Events | Login and admin events, with IP, user id and client id | Where the event store sits | Retention. Turn events on and no `eventsExpiration` field appears at all, so events accumulate until you set one |
| Realm signing keys | The private keys that sign every token the realm issues | Where the key material sits | Who can read it — the subject of the next section |

Two of those deserve a sentence each. The IP address on a session and on an event makes login telemetry location data about your users, which is why "only metadata" is a weak defence for an IdP. And the retention default is genuinely absent rather than generous — this is the config immediately after switching event logging on:

```console
$ kcadm.sh get events/config -r eu-demo
{ "eventsEnabled" : true, "eventsListeners" : [ "jboss-logging" ],
  "enabledEventTypes" : [ "LOGOUT", "LOGIN_ERROR", "LOGIN", "REFRESH_TOKEN" ],
  "adminEventsEnabled" : true, "adminEventsDetailsEnabled" : true }
```

No `eventsExpiration` key is returned until you set one. Setting it is one call — `kcadm.sh update events/config -r eu-demo -s eventsExpiration=2592000` for thirty days — and on a realm that has been running for a year without it, doing so is not a free operation. The mechanics of purging a large event table are in [user events in Keycloak](/blog/user-events-in-keycloak/) and [how we scaled Keycloak event storage](/blog/scaling-keycloak-event-storage/).

## The test a region setting cannot pass

Here is the sharpest version of the distinction, and it is checkable on your own laptop in five minutes.

Generate a signing key yourself — the thing a buyer does when they want *control* rather than *location* — and load it into the realm with Keycloak's `rsa` key provider, which takes an existing PEM private key and certificate rather than generating one:

```bash
openssl genrsa -out eu-sign.key 2048
openssl req -new -x509 -key eu-sign.key -out eu-sign.crt -days 365 -subj "/CN=eu-demo"

PK=$(grep -v '^-----' eu-sign.key | tr -d '\n')
CRT=$(grep -v '^-----' eu-sign.crt | tr -d '\n')

curl -s -X POST http://127.0.0.1:8080/admin/realms/eu-demo/components \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"eu-imported-rsa","providerId":"rsa",
       "providerType":"org.keycloak.keys.KeyProvider",
       "config":{"priority":["200"],"active":["true"],"enabled":["true"],
                 "algorithm":["RS256"],
                 "privateKey":["'"$PK"'"],"certificate":["'"$CRT"'"]}}'
```

With priority 200 it becomes the active RS256 key, and the public half is immediately published to every relying party:

```console
$ curl -s http://127.0.0.1:8080/realms/eu-demo/protocol/openid-connect/certs \
    | jq -r '.keys[] | "\(.kid)  \(.alg)  \(.use)"'
Kow7HwRH1GIYwD_q3nzWJHMHDD-6NlvXeSzaVcn_NoE  RS256  sig
rQLZRIk2xyyn2ZOp9Kp9oMpInO6Axnx0kgsZxSeP8SM  RSA-OAEP  enc
7oWmsgS6YGt3dM1zmGpZA8S1v_AwvrV2IcHFdWGF4f0  RS256  sig
```

Now read it back through the administrative API, the way a customer would:

```console
$ curl -s ".../admin/realms/eu-demo/components/66cd252d-..." -H "Authorization: Bearer $TOKEN"
{
  "name": "eu-imported-rsa",
  "providerId": "rsa",
  "config": {
    "privateKey": [ "**********" ],
    "certificate": [ "MIIDBTCCAe2gAwIBAgIUP8OY..." ],
    "active": [ "true" ],
    "priority": [ "200" ],
    "algorithm": [ "RS256" ]
  }
}
```

Masked. The same is true of `POST /admin/realms/eu-demo/partial-export`, which returns 121 top-level keys of realm configuration with every private key either masked or omitted. That is the customer-facing path, and it behaves correctly.

Now take the operator's path — stop the server and run `kc.sh export` against the same database:

```bash
docker stop kc && docker cp kc:/opt/keycloak/data/. ./kcdata/
docker run --rm -v "$PWD/kcdata:/opt/keycloak/data" quay.io/keycloak/keycloak:26.8.1 \
  export --dir /opt/keycloak/data/export --realm eu-demo
```

```console
$ grep -o '"privateKey"' kcdata/export/eu-demo-realm.json | wc -l
3
$ grep -o '\*\*\*\*\*\*\*\*\*\*' kcdata/export/eu-demo-realm.json | wc -l
0
```

Three private keys, nothing masked, in an 83 KB file — the two keys Keycloak generated for the realm, plus the one I imported and which the API had just refused to show me. The client secret comes out in cleartext in the same file. And the exported key is not an equivalent key, it is *the* key:

```console
$ openssl pkey -in roundtrip.pem -pubout | openssl sha256
SHA2-256(stdin)= ae9f19087063dc4a7ec22e4d74d9e9e85ef25d89d6aadfd4db2d289ccdb6c960
$ openssl pkey -in eu-sign.key -pubout | openssl sha256
SHA2-256(stdin)= ae9f19087063dc4a7ec22e4d74d9e9e85ef25d89d6aadfd4db2d289ccdb6c960
```

**This is the whole argument in one measurement.** Whoever can run that export holds the key that signs every token in the realm, and can therefore mint a valid token for any user without touching a password hash — which is why the irreversibility of argon2 protects less than it looks like it does. Residency decides which country that file is written in. It decides nothing at all about who is allowed to run the command, and that second question is sovereignty.

None of this is a Keycloak defect. An identity provider has to be able to sign, so some component has to be able to read the key; key custody is a deployment decision, not a product one. It is a defect in a *procurement process* that checks the region field and stops.

## The rubric European buyers are starting to use

If you need a vocabulary for this that is not a vendor's, the European Commission published one. Its Cloud Sovereignty Framework, first presented in October 2025 for a tender under the Cloud III Dynamic Purchasing System, scores a provider on eight sovereignty objectives — strategic, legal and jurisdictional, data and AI, operational, supply chain, technology, security and compliance, and environmental — and assigns a Sovereignty Effectiveness Assurance Level, SEAL-0 to SEAL-4. The implementation guidance published on 1 June 2026 defines them:

| Level | Commission's definition |
| --- | --- |
| SEAL-0 | **No sovereignty.** "Service, technology or operations under exclusive control of non-EU third parties, governed entirely by non-EU jurisdictions." |
| SEAL-1 | **Jurisdictional sovereignty.** "EU law formally applies with limited practical enforceability; service, technology or operations under exclusive control of non-EU third parties." |
| SEAL-2 | **Data sovereignty.** "EU jurisdictions apply, with material dependencies remain; service, technology or operations under indirect control of non-EU third parties." |
| SEAL-3 | **Technological sovereignty.** "EU jurisdictions apply, EU actors exercising meaningful but not full influence; service, technology or operations under marginal control of non-EU third parties." |
| SEAL-4 | **Full digital sovereignty.** "Technology and operations under complete EU control, subject only to EU jurisdiction, with no critical non-EU dependencies." |

Three things in that document matter more than the labels.

First, the scoring rule: "the overall SEAL level is the lowest SEAL level achieved in any of the objectives." Sovereignty is scored as a floor, not an average. A vendor can be excellent on data location and still sit at the level its ownership earns, because strategic and jurisdictional sovereignty are their own objectives and no region setting touches them.

Second, what the data objective actually asks for. SOV-3 is not "stored in the EU"; its criteria include "ensuring that only the customer, not the provider, has effective control over cryptographic access to their data" and "strict confinement of storage and processing to European jurisdictions, with no fallback to third countries". That first clause is the export test above, written as a procurement question.

Third, the Commission's own caveat, from its lessons-learnt section: SEAL-4 "is not today relevant in the context of EU Sovereignty considering existing dependence to specific supply chains (chips, hardware)". In the April 2026 award the minimum was SEAL-2; the providers that did best reached SEAL-3. The top of the scale was not reached by anyone, which is a useful corrective to any vendor — European or not — claiming the whole of it.

## The law that residency does not move

The reason none of this collapses into "just pick Frankfurt" is a single sentence of US law. 18 U.S.C. § 2713, added by the CLOUD Act in March 2018, reads in full:

> A provider of electronic communication service or remote computing service shall comply with the obligations of this chapter to preserve, backup, or disclose the contents of a wire or electronic communication and any record or other information pertaining to a customer or subscriber within such provider's possession, custody, or control, regardless of whether such communication, record, or other information is located within or outside of the United States.

Read the two operative phrases together. The test is **possession, custody, or control**; the location of the data is explicitly made irrelevant. A region choice is an answer to a question the statute declines to ask. What *does* move the analysis is the practical ability to obtain the data: who holds the keys, who can reach the control plane, which entity is the contracting processor, and what organisational separation actually exists between it and any non-EU parent. Those are sovereignty controls, and they are the ones worth negotiating.

Two facts we re-verified on **19 October 2026**, because both move and both get misstated. The EU–US Data Privacy Framework is in force and listed as a current adequacy decision; Philippe Latombe's appeal against the General Court's dismissal of his challenge is pending before the Court of Justice as Case C-703/25 P, with no hearing announced. And FISA Section 702's statutory authority lapsed in June 2026 when Congress did not reauthorise it, while collection continues under Foreign Intelligence Surveillance Court certifications approved in March 2026 and running to March 2027. A lapsed statute is not a dead programme, and anyone telling you otherwise is selling on a technicality.

## What to ask an identity provider

Ten minutes of questions that separate the two axes. A vendor who answers all ten in writing is being straight with you, whatever the answers are.

1. Which region holds the realm database, the session store, the event store and the backups — and is the region fixed at creation?
2. Which of your own systems (dashboard, ticketing, billing, monitoring, logging) sit outside that region?
3. Who are the subprocessors, and do you commit to notice and an objection right before adding one?
4. Can staff outside the EU administer an EU cluster? Under what controls, and are the access logs available to me?
5. Where is the realm signing key held, who can read it, and can I supply or rotate it?
6. Which legal entity is my counterparty, where is it incorporated, and who owns it?
7. Which transfer mechanism covers each non-EU touchpoint, and will you share the transfer impact assessment?
8. What is your contractual breach notification window, in hours?
9. How many government or law-enforcement requests have you received, and what is your challenge-and-notify policy?
10. What does an export contain, in what format, and what is the deletion commitment at the end of service?

Questions 1 to 3 are residency. Questions 4 to 7 are sovereignty. Questions 8 to 10 are what you actually live with. A vendor that answers 1 to 3 enthusiastically and goes quiet on 4 to 7 has told you something.

## Where we stand

We offer residency, and we do not offer sovereignty by ownership. Identity data for an EU cluster is stored and processed in Frankfurt (`eu-central-1`) with the standing backup in Ireland (`eu-west-1`), and is not replicated outside the EU. Your counterparty is Phase Two UK, Ltd, registered in England and Wales, company number 16815578, and the European Commission renewed its adequacy decision for the United Kingdom on 19 December 2025. Our parent, Phase Two, Inc., is incorporated in the United States, which is why § 2713 is quoted above rather than explained away, and our control plane runs in the US with a globally distributed engineering team — so administrative access to an EU cluster can come from outside the EU, which is a restricted transfer we disclose rather than discover with you.

On the key question specifically: realm signing keys for EU clusters are held in our key management service in the Frankfurt region. They are our keys in our KMS. We do not offer bring-your-own-key on hosted clusters today, and we would rather write that sentence than let a residency claim imply it. We are not certified under the Data Privacy Framework and do not rely on it. On question 9, what we do with a legal demand and how many we have received is on our [government requests](/company/government-requests/) page; the count is still zero. The full data map, class by class, is in [where your Keycloak data lives](/blog/where-your-keycloak-data-lives/); the region list is in the [regions documentation](/docs/self-service/regions/); what a token actually asserts, and what signs it, is in [JWKS explained](/blog/jwks-explained/) and the [JWT tutorials](/tutorials/jwts/).

If residency plus a written account of the sovereignty gap is enough for your risk assessment, our [EU data residency](/hosting/eu-data-residency/) page has the whole map, the subprocessor list and the questions our DPO is asked most. The Article 28 terms behind it are on the [data processing agreement](/company/data-processing/) page.

*Keycloak behaviour in this post was tested on 26.8.1 against the 26.8.1 server administration documentation. Regulatory facts were verified on 19 October 2026: the text of 18 U.S.C. § 2713 against the US Code as published by the Government Publishing Office; the Cloud Sovereignty Framework SEAL definitions against the Commission's implementation guidance of 1 June 2026; the UK and EU–US adequacy decisions against the Commission's adequacy decisions page; and the status of FISA Section 702 against reporting from June 2026 onward, with nothing enacted since.*
