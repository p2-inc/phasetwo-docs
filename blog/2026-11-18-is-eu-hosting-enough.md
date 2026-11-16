---
title: "Is EU hosting enough? An honest answer"
slug: is-eu-hosting-enough
date: 2026-11-18
authors: [gpatil]
tags: [keycloak, eu-data-residency, gdpr, compliance, security]
description: EU hosting settles where identity data is stored and very little else. What you can verify yourself, what only disclosure answers, and who it is enough for.
keywords:
  [
    sovereignty washing,
    eu hosted vs eu owned,
    eu hosting data sovereignty,
    keycloak data residency,
    european identity provider,
  ]
---

No. EU hosting is not enough on its own, and we would rather write that sentence ourselves than have a procurement questionnaire extract it from us. Choosing an EU region settles one question — where the identity data is stored — and leaves three open: which company you contract with, which laws that company is subject to, and who can reach the data in order to operate it. We are a [managed Keycloak](/hosting/dedicated-clusters/) vendor whose EU clusters run in Frankfurt and whose contracting entity, Phase Two, Inc., is incorporated in the United States, so we are squarely inside the critique rather than above it. What follows is which parts of a residency claim you can verify without the vendor's cooperation, which parts come down to disclosure, and the buyers for whom EU hosting plus a documented transfer position is genuinely sufficient — and the ones for whom it structurally is not. The fast-moving regulatory facts below were re-checked on 16 November 2026.

<!-- truncate -->

## Four claims that get compressed into one word

"European" does a lot of work in vendor copy. Pulled apart, it is at least four separate claims, and they are checkable to very different degrees.

| Claim               | What it means                                                                    | Who can check it                                               |
| ------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **EU-hosted**       | The data is stored and processed in a European data centre                       | You, from outside, for the parts that answer on the network    |
| **EU-operated**     | The service is provided by an EU or EEA legal entity                             | You, from the contract and the company register                |
| **EU-administered** | The people and systems with standing access to the running service are in the EU | Only the vendor, by disclosure                                 |
| **EU-owned**        | The company and its parent are European, and so is its infrastructure supplier   | You, from the ownership structure — if the vendor publishes it |

The distance between the first row and the third is the whole argument. An identity provider holds every person who can sign in to anything you run, plus a log of when and from where they did it, so the gap between "stored in Frankfurt" and "reachable only from Frankfurt" matters more here than it does for a file store or a CDN.

The vocabulary is not ours. The analytics vendor Plausible published the clearest short version of it — "EU-hosted does not always mean EU-owned. And that difference matters" — separating EU-hosted, EU-operated and EU-owned infrastructure as three distinct layers, and concluding that EU hosting "should be treated as the start of the conversation, not the end of it." That is right, and it is right about us.

## The critique is correct, and we are inside it

The European industry has a name for the failure mode: _sovereignty washing_, the practice of advertising a data-centre location as though it answered the jurisdictional question. The German identity vendor cidaas states it plainly on its digital sovereignty page — "true digital sovereignty does not end at the data center", because "data access may still be possible even if the data is physically stored in Europe" — and answers the obvious question in its FAQ with a flat no: hosting in Germany is not sufficient, because "in addition to the hosting location, you must also consider the ownership structure, jurisdiction and technological dependencies."

We agree with every clause of that, including the part that counts against us. Three consequences we will state before a reviewer has to find them:

- **We do not describe ourselves as sovereign.** Phase Two, Inc. is US-incorporated and is the company you contract with, so we cannot claim to sit outside US legal process. What the statute actually says, and which legal instrument reaches which table in a realm, is in [the CLOUD Act and your identity provider](/blog/cloud-act-identity-provider/).
- **We are not eligible for the directories that enforce ownership rules, and we do not ask for exceptions.** european-alternatives.eu requires, verbatim, that "the company is based in an EU, EEA, EFTA, or DCFTA member country or in the UK" and that "if the company has a parent or holding company, this company is also based in" one of those. We fail the first line, not merely the second.
- **We will not hold SecNumCloud qualification.** Its criteria include ownership and control conditions a US-parented company cannot satisfy, which is a structural fact about us and not a roadmap item.

What we do claim is narrower and checkable: EU residency for identity data, a named contracting entity, a published data map, a transfer position written down rather than implied, and a count of government requests received. The rest of this post is about how much of that you can verify yourself.

## One thing you can verify without asking the vendor

Part of a residency claim is independently testable, which is unusual in compliance work. AWS publishes every IP range it operates together with the region it belongs to, so a vendor that publishes its static addresses has handed you both halves of the check. Ours are in the [egress IP addresses](/docs/self-service/egress-ip-addresses/) documentation; take the three Frankfurt ones and the three Ireland ones and look them up against AWS's own file:

```bash
curl -s -o ip-ranges.json https://ip-ranges.amazonaws.com/ip-ranges.json
python3 - <<'EOF'
import json, ipaddress
d = json.load(open("ip-ranges.json"))
print("published", d["createDate"])
for ip in ["3.123.175.173", "3.77.61.190", "3.68.147.134",
           "52.214.48.166", "52.210.84.63", "52.49.216.138"]:
    a = ipaddress.ip_address(ip)
    hits = [p for p in d["prefixes"] if a in ipaddress.ip_network(p["ip_prefix"])]
    hits.sort(key=lambda p: ipaddress.ip_network(p["ip_prefix"]).prefixlen, reverse=True)
    print(ip, hits[0]["ip_prefix"], hits[0]["region"])
EOF
```

```console
published 2026-11-16-05-37-05
3.123.175.173 3.120.0.0/14 eu-central-1
3.77.61.190 3.64.0.0/12 eu-central-1
3.68.147.134 3.64.0.0/12 eu-central-1
52.214.48.166 52.208.0.0/13 eu-west-1
52.210.84.63 52.208.0.0/13 eu-west-1
52.49.216.138 52.48.0.0/14 eu-west-1
```

The same lookup works on whatever your own cluster's hostname resolves to, and on any other vendor's. It is worth running: a vendor whose "EU region" egresses from `us-east-1` has a problem no amount of copy fixes.

The limits matter more than the result. That output confirms the region of the addresses the service sends traffic from. It says nothing about where backups are written, where the control plane that manages the cluster runs, which staff hold credentials to it, or who owns the company. A network check sees only the surface that answers on the network, and the questions a data protection officer cares most about all sit behind it. [Data residency vs data sovereignty for your identity provider](/blog/data-residency-vs-data-sovereignty-identity-provider/) works through where that line falls; the per-class map of which of our systems sit where is in [where your Keycloak data lives](/blog/where-your-keycloak-data-lives/).

## The question no check answers: who read it

The access question is the one that separates a residency claim from a sovereignty one, and it has an uncomfortable property: your identity provider cannot answer it for you. Here is the measurement, taken on **Keycloak 26.8.2** on 16 November 2026.

**Keycloak's admin events record administrative changes, not administrative reads.** With auditing fully enabled, creating a user writes an admin event naming the account and the IP address that did it. Listing every user in the realm — usernames, email addresses, names — writes nothing at all. The only record of a read is the HTTP access log, which is disabled by default and identifies the caller by source IP rather than by name. So "who looked at my users" is a question answered by an operator's disclosure practices, not by the product.

Start a server with both kinds of auditing available, create a realm with two users, and turn admin-event auditing on:

```bash
docker run -d --name kc --memory 1536m -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.8.2 start-dev --http-access-log-enabled=true

K() { docker exec kc /opt/keycloak/bin/kcadm.sh "$@"; }
K config credentials --server http://localhost:8080 --realm master \
  --user admin --password admin
K create realms -s realm=eu-check -s enabled=true
K update events/config -r eu-check -s eventsEnabled=true \
  -s adminEventsEnabled=true -s adminEventsDetailsEnabled=true
K create users -r eu-check -s username=anna.schmidt -s email=anna@example.de \
  -s firstName=Anna -s lastName=Schmidt -s enabled=true
K create users -r eu-check -s username=ben.mueller -s email=ben@example.de \
  -s enabled=true

KC=http://127.0.0.1:8080
TOKEN=$(curl -s -d client_id=admin-cli -d username=admin -d password=admin \
  -d grant_type=password "$KC/realms/master/protocol/openid-connect/token" \
  | jq -r .access_token)
```

The writes are audited, in the detail you would want. Events come back newest first, so index 1 is the first user we created:

```console
$ curl -s -H "Authorization: Bearer $TOKEN" "$KC/admin/realms/eu-check/admin-events" | jq '.[1]'
{
  "id": "b9f24f65-8e37-471d-b34c-0dce624745a7",
  "time": 1794821699791,
  "realmId": "c7ba2024-f0fb-48c7-9e8a-9864d9ff279d",
  "authDetails": {
    "realmId": "0e2a4112-b836-4da6-bb1d-7ffcd43f7e82",
    "clientId": "fdc0019b-e750-498b-a345-c5e8a1527716",
    "userId": "40e56595-5e3d-4677-b39d-4ef22bfd6a60",
    "ipAddress": "127.0.0.1"
  },
  "operationType": "CREATE",
  "resourceType": "USER",
  "resourcePath": "users/40d166d8-5883-418b-8f11-98a9cff36eaa",
  "representation": "{\"username\":\"anna.schmidt\",\"firstName\":\"Anna\",\"lastName\":\"Schmidt\",\"email\":\"anna@example.de\",\"enabled\":true}"
}
```

Now read the data back — the whole user list, then one user in full — and count the audit records again:

```console
$ curl -s -H "Authorization: Bearer $TOKEN" "$KC/admin/realms/eu-check/users" | jq -r '.[].email'
anna@example.de
ben@example.de
$ curl -s -H "Authorization: Bearer $TOKEN" \
    "$KC/admin/realms/eu-check/users/40d166d8-5883-418b-8f11-98a9cff36eaa" | jq -r .email
anna@example.de
$ curl -s -H "Authorization: Bearer $TOKEN" "$KC/admin/realms/eu-check/admin-events" \
    | jq -r '.[] | "\(.operationType) \(.resourceType) \(.resourcePath)"'
CREATE USER users/fe45e585-bdd7-4ac9-916d-f69ee52330c7
CREATE USER users/40d166d8-5883-418b-8f11-98a9cff36eaa
UPDATE REALM events/config
$ curl -s -H "Authorization: Bearer $TOKEN" "$KC/admin/realms/eu-check/events" | jq length
0
```

Three admin events, all of them writes: the realm-settings update and the two user creations. Zero user events. Every personal data field in that realm was read twice and the audit trail does not know it happened. This is not a defect — the documentation describes admin events as auditing the Admin Console's REST invocations, and it is the state-changing invocations that are saved — but it is a fact worth knowing before you ask a vendor for "the access logs".

The one thing that _is_ logged on the read side is the HTTP access log, which you have to turn on, and which tells you less than you want:

```console
2026-11-16 09:35:01,125 INFO [org.keycloak.http.access-log] (executor-thread-1)
  172.17.0.1 - - [16/Nov/2026:09:35:01 +0000]
  "GET /admin/realms/eu-check/users/40d166d8-5883-418b-8f11-98a9cff36eaa HTTP/1.1" 200 426
```

An address and a path. No account, no token subject, no reason.

There is one exception, and it covers the access route people worry about most. Impersonation, an administrator becoming one of your users, is recorded as a user event that names the impersonator:

```console
$ curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    "$KC/admin/realms/eu-check/users/40d166d8-5883-418b-8f11-98a9cff36eaa/impersonation"
{"redirect":"http://127.0.0.1:8080/realms/eu-check/account","sameRealm":false}
$ curl -s -H "Authorization: Bearer $TOKEN" "$KC/admin/realms/eu-check/events" | jq '.[0]'
{
  "id": "8e7d5bc4-0524-4342-8d88-214cd138962c",
  "time": 1794821701179,
  "type": "IMPERSONATE",
  "realmId": "c7ba2024-f0fb-48c7-9e8a-9864d9ff279d",
  "userId": "40d166d8-5883-418b-8f11-98a9cff36eaa",
  "sessionId": "2QFQjrALo1bIHv59Z0G0fH9k",
  "ipAddress": "172.17.0.1",
  "details": {
    "impersonator_realm": "master",
    "impersonator": "admin",
    "impersonator_id": "40e56595-5e3d-4677-b39d-4ef22bfd6a60"
  }
}
```

Keep that distinction in mind when you read any vendor's answer about administrative access, ours included. Reads through the product are invisible by default, and reads at the infrastructure layer (the database, a backup, a host) are outside Keycloak entirely, visible only in systems the operator controls and chooses to describe. A region setting does not touch any of it. The practical levers are the ones in [data residency requirements for SaaS authentication](/blog/data-residency-requirements-saas-authentication/): named transfer mechanisms, a subprocessor list with an objection right, and a contractual answer about who may administer and under what controls.

## Who EU hosting is enough for

This is the part the argument usually skips. "EU-hosted is not sovereignty" is true, and it often gets deployed as though it meant "EU-hosted is worthless", which is not. Residency plus a documented transfer position is a complete answer for a large class of buyers and a structurally incomplete one for a smaller, specific class.

| Buyer                                                | Is EU hosting plus a documented transfer position enough? | What actually decides it                                                                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| EU/EEA company under the GDPR alone                  | **Usually yes**                                           | Chapter V paperwork: SCCs for any non-EU touchpoint, a transfer impact assessment, Art. 28 terms. The GDPR does not mandate localisation |
| Financial entity under DORA                          | **Usually yes, with negotiation**                         | Art. 30(3) clauses — audit and access rights, exit plan, sub-outsourcing, data location — not the vendor's nationality                   |
| NIS2 essential or important entity                   | **Usually yes**                                           | Supply-chain measures under Art. 21(2)(d) and an incident window short enough to feed your own 24-hour early warning                     |
| French health data (HDS)                             | **Only with the right host**                              | Hosting on an HDS-certified provider plus a published map of extra-EEA transfers and access                                              |
| German public sector, KRITIS operators               | **Generally no**                                          | Procurement practice expects BSI C5 and, increasingly, jurisdictional assurance a non-EU parent cannot give                              |
| French _cloud de confiance_ / SecNumCloud tenders    | **No, structurally**                                      | Ownership and control criteria that exclude non-EU-controlled companies outright                                                         |
| EU public procurement under the proposed CADA levels | **Level 1 yes, higher no**                                | Assurance levels above the entry tier add third-country-control limits and EU-ownership tests                                            |

Two notes on that last row. The Cloud and AI Development Act is a Commission proposal of 3 June 2026 and is not law; its four assurance levels are the vocabulary public buyers are rehearsing, not a rule anyone is enforcing yet. And the levels bind public procurement, not private companies — a private buyer borrowing them as a scorecard is making a choice, not following a requirement.

If you are in one of the bottom three rows, no US-incorporated managed vendor is your answer, and the honest recommendation is to stop evaluating us on that axis. The alternative that actually works is running Keycloak yourself, or with an EU-owned operator: it is the same open-source server, the exit path is a realm export, and our [exit runbook](/tutorials/data-protection/exit-export/) is written so that leaving is a documented procedure rather than a negotiation.

## Where we stand, in one paragraph

Identity data for an EU cluster is stored and processed in Frankfurt (`eu-central-1`) with backups in Ireland (`eu-west-1`) and is not replicated outside the EU. You contract with Phase Two, Inc., incorporated in the United States, under an Art. 28 [data processing agreement](/company/data-processing/) incorporating the Standard Contractual Clauses; customers who need a UK contracting entity can contract with Phase Two UK, Ltd on request. Our control plane runs in the US and our team works remotely from the United States and Europe, so administrative access to an EU cluster can come from outside the EU — a restricted transfer under Chapter V, disclosed here rather than discovered later. Realm signing keys are stored with the realm in its database in the Frankfurt region; they are held by us, not by you, and we do not offer bring-your-own-key on hosted clusters today. Administrative access is logged internally and examined in our SOC 2 Type II audit, but those logs are not exposed to customers — after the section above, you can see exactly why we would like to change that. We hold SOC 2 Type II and ISO/IEC 27001. We are not certified under the EU–US Data Privacy Framework and do not rely on it. Support is in English only. Government or law-enforcement requests received to date: zero, with the handling policy published on our [government requests](/company/government-requests/) page.

Three regulatory facts re-checked on **16 November 2026**, because all three move and all three get misstated in vendor copy. The EU–US Data Privacy Framework is in force; Philippe Latombe's appeal against its upholding is pending before the Court of Justice as Case C-703/25 P, with no hearing announced. FISA Section 702's statutory authority lapsed in June 2026 when Congress did not reauthorise it, while collection continues under Foreign Intelligence Surveillance Court certifications running to March 2027 — a lapsed statute is not a dead programme, and nothing has been enacted since. And the European Commission's adequacy decisions for the United Kingdom were renewed on 19 December 2025 and run to 27 December 2031, which is what makes the UK contracting option frictionless for an EU customer who takes it.

## What to do with this

Run the egress check against whichever identity provider you are evaluating, then ask the two questions the check cannot reach: who may administer the service, and what record of that access will you ever see. The answers, not the region field, are the decision — and ours are written out on the [EU data residency](/hosting/eu-data-residency/) page, with the contractual version in our [data processing agreement](/company/data-processing/).
