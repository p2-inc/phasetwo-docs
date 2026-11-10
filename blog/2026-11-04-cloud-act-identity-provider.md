---
title: "The CLOUD Act and your identity provider"
slug: cloud-act-identity-provider
date: 2026-11-04
authors: [jpatzer]
tags: [keycloak, eu-data-residency, gdpr, compliance, security]
description: What the CLOUD Act does and does not reach when your identity provider has a US parent, which legal process gets which Keycloak data, tested on 26.8.1.
keywords:
  [
    cloud act,
    cloud act identity provider,
    cloud act saas,
    cloud act gdpr,
    keycloak data residency,
  ]
---

The CLOUD Act does not hand anyone a key to a European data centre. It does something narrower, and for an identity provider more awkward than the usual telling. 18 U.S.C. § 2713 makes the location of data irrelevant to whether a provider under US jurisdiction has to produce it, and the process that reaches most of what an identity provider holds is the cheapest instrument in the Stored Communications Act: a subpoena for subscriber records, no warrant, no judicial finding, and no obligation to tell the customer. Below is what the statute says, which level of process reaches which table in a Keycloak realm (tested on 26.8.1), why the defence the CLOUD Act added does not cover an EU customer's identity data on either of its two conditions, and what a vendor with a US parent can honestly promise. Including us.

<!-- truncate -->

This is an engineering and procurement read of public legal texts, not legal advice. Where something is contested, it says so.

## What the CLOUD Act actually changed in 2018

The Clarifying Lawful Overseas Use of Data Act did two things. It added § 2713 to the Stored Communications Act, which reads in full:

> A provider of electronic communication service or remote computing service shall comply with the obligations of this chapter to preserve, backup, or disclose the contents of a wire or electronic communication and any record or other information pertaining to a customer or subscriber within such provider's possession, custody, or control, regardless of whether such communication, record, or other information is located within or outside of the United States.

And it added § 2523, a framework for executive agreements with foreign governments, plus a new motion to quash in § 2703(h) for providers caught between two legal systems.

What it did not do is create a new power to collect anything. The orders are still the ordinary ones in § 2703, written in 1986. The CLOUD Act settled the question those orders had left open, which the government had just lost in the Second Circuit over a mailbox in Dublin: whether a US order reaches data the provider happens to store abroad. The answer is that storage location is not the test. **Possession, custody, or control** is the test.

Two consequences follow for anyone buying hosted identity. A region setting answers a question the statute declines to ask. And because the test is about the provider rather than the data, the analysis turns on corporate structure and operational access, which is the subject of [data residency vs data sovereignty for your identity provider](/blog/data-residency-vs-data-sovereignty-identity-provider/).

## Three levels of process, and which one reaches an IdP

The SCA is a tiered statute. What the government must obtain depends on what it is asking for, not on how sensitive you think the data is.

| Instrument | Statute | Standard | What it reaches |
| --- | --- | --- | --- |
| Warrant | § 2703(a), (b) | Probable cause, judge | Contents of a wire or electronic communication |
| Court order | § 2703(d) | "Specific and articulable facts" showing relevance | Any non-content record about a subscriber |
| Subpoena | § 2703(c)(2) | Administrative or grand jury subpoena; no judge | A specific enumerated list, below |

The list in § 2703(c)(2) is the one to read closely, because it is the only category obtainable without a court looking at the request at all. A provider must disclose the:

> (A) name; (B) address; (C) local and long distance telephone connection records, or **records of session times and durations**; (D) **length of service (including start date)** and types of service utilized; (E) telephone or instrument number or other subscriber number or identity, including **any temporarily assigned network address**; and (F) means and source of payment for such service

Then § 2703(c)(3): "A governmental entity receiving records or information under this subsection is not required to provide notice to a subscriber or customer."

Read that enumeration again with a login system in mind. Session times and durations. A temporarily assigned network address. Start date and type of service. It was drafted for telephone billing records and dial-up accounts. It describes an identity provider's primary data model almost field for field.

## What those categories look like against a real realm

Everything below ran on a stock Keycloak 26.8.1 against PostgreSQL 17, with one user, one client, three successful logins and one failed one:

```bash
docker run -d --name kc --network kcnet --memory 1536m -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -e KC_DB=postgres -e KC_DB_URL="jdbc:postgresql://pg:5432/keycloak" \
  -e KC_DB_USERNAME=kc -e KC_DB_PASSWORD=kcpass \
  quay.io/keycloak/keycloak:26.8.1 start-dev
```

The subscriber record, through the administrative API a customer uses:

```console
$ kcadm.sh get users/f1261d8f-... -r eu-demo
{
  "id" : "f1261d8f-6a11-43c5-813a-d2d7634eea72",
  "username" : "anja.k",
  "firstName" : "Anja",
  "lastName" : "Kowalski",
  "email" : "anja.kowalski@example.de",
  "emailVerified" : false,
  "enabled" : true,
  "createdTimestamp" : 1793610882190
}
```

`createdTimestamp` is § 2703(c)(2)(D), length of service including start date, sitting in a field by itself.

Sessions are the part most people assume are ephemeral. They are not. `persistent-user-sessions` is a supported feature enabled by default in current Keycloak, so an online session is a database row, and it survives a restart:

```console
$ psql -U kc -d keycloak -c "SELECT user_session_id, offline_flag,
    data::json->>'ipAddress' AS ip_address,
    to_timestamp(created_on) AS created,
    to_timestamp(last_session_refresh) AS last_refresh
  FROM offline_user_session WHERE user_id = (SELECT id FROM user_entity WHERE username='anja.k');"

     user_session_id      | offline_flag | ip_address |        created         |      last_refresh
--------------------------+--------------+------------+------------------------+------------------------
 lBxvFPTvlf7ivgKUpWvSMi6A |            0 | 172.18.0.1 | 2026-11-02 09:14:48+00 | 2026-11-02 09:14:48+00
 nxYnop4FGJIoseD5t7sIudRH |            0 | 172.18.0.1 | 2026-11-02 09:14:48+00 | 2026-11-02 09:14:48+00
 KocEVFq5b9fgEwwZk3tjxedG |            1 | 172.18.0.1 | 2026-11-02 09:14:48+00 | 2026-11-02 09:14:48+00
```

The table is named for offline sessions and holds both; `offline_flag = 0` is an ordinary online session. `created` and `last_session_refresh`, bounded by the realm's idle and maximum lifespans — 1,800 and 36,000 seconds by default — are records of session times and durations. The IP address is in the row.

The event store is the same shape and longer-lived:

```console
$ psql -U kc -d keycloak -c "SELECT type, to_timestamp(event_time/1000) AS at, ip_address, error
                             FROM event_entity ORDER BY event_time;"
    type     |           at           | ip_address |          error
-------------+------------------------+------------+--------------------------
 LOGIN       | 2026-11-02 09:14:48+00 | 172.18.0.1 |
 LOGIN       | 2026-11-02 09:14:48+00 | 172.18.0.1 |
 LOGIN       | 2026-11-02 09:14:48+00 | 172.18.0.1 |
 LOGIN_ERROR | 2026-11-02 09:14:48+00 | 172.18.0.1 | invalid_user_credentials
```

A realm with events enabled and no `eventsExpiration` set keeps those rows indefinitely, which makes retention a decision you have already made by not making it. The mechanics are in [user events in Keycloak](/blog/user-events-in-keycloak/) and [how we scaled Keycloak event storage](/blog/scaling-keycloak-event-storage/).

So the mapping, category by category:

| § 2703(c)(2) | Where it is in a Keycloak realm | Reachable by subpoena alone |
| --- | --- | --- |
| (A) name | `user_entity.first_name`, `last_name`, `username` | Yes |
| (B) address | Email, and any address attribute the realm defines | Yes |
| (C) records of session times and durations | `offline_user_session.created_on`, `last_session_refresh` | Yes |
| (D) length of service, start date, type of service | `user_entity.created_timestamp`; client and protocol per session | Yes |
| (E) subscriber identity, temporarily assigned network address | `user_entity.id`, and `ipAddress` on every session and event | Yes |
| (F) means and source of payment | Not in Keycloak. In whatever billing system you run | Not from the IdP |

What is left for a warrant is thin. An identity provider is not a mailbox: it does not store the contents of your users' communications, it stores facts about them and about when they signed in. Almost everything of value in it falls on the records side of the line, which is the side with the lowest bar and no notice requirement.

The credential store is the one genuine limit, and it is cryptographic rather than legal:

```console
$ psql -U kc -d keycloak -c "SELECT c.type, left(c.secret_data,34) AS secret_data, c.credential_data
                             FROM credential c JOIN user_entity u ON u.id=c.user_id
                             WHERE u.username='anja.k';"
   type   |            secret_data             |                          credential_data
----------+------------------------------------+--------------------------------------------------------------------
 password | {"value":"ive1qXfpydxQKbca/h08A656 | {"hashIterations":5,"algorithm":"argon2","additionalParameters":
                                               |  {"hashLength":["32"],"memory":["7168"],"type":["id"],
                                               |   "version":["1.3"],"parallelism":["1"]}}
```

Compelled production of that row yields an argon2id digest, not a password. It also yields nothing about what the account can do that the role and group tables do not say more directly. Note the asymmetry worth knowing about: the administrative API masks `secret_data` and the database does not, which is the same gap, in a different column, as the signing-key export demonstrated in the residency and sovereignty post.

Two caveats, because this mapping is an argument and not a holding. The line between "contents" and "a record" has been litigated for forty years and is not crisp at the edges. And whether a business-to-business managed identity service is even a provider of "remote computing service" is itself a live question, since § 2711(2) defines that as "the provision **to the public** of computer storage or processing services". If a provider falls outside the definition, the SCA's tiers do not apply to it and the government uses an ordinary grand jury subpoena against the company instead. That is a different route to the same place, not a shelter.

## The defence the CLOUD Act added, and why it misses you

Section 2703(h) is the part of the Act that was sold as the protection for foreign customers. A provider may move to quash within 14 days of service where it reasonably believes both that the subscriber is not a US person and does not reside in the US, and that disclosure "would create a material risk that the provider would violate the laws of a **qualifying foreign government**".

A qualifying foreign government, per § 2703(h)(1)(A), is one "with which the United States has an executive agreement that has entered into force under section 2523".

As of 2 November 2026 the Department of Justice's own CLOUD Act page lists exactly two such agreements, with the United Kingdom (signed 3 October 2019, in force 3 October 2022) and Australia. For the European Union it lists a 2019 joint statement opening negotiations and a 3 March 2023 announcement that negotiations had resumed, and no agreement. No EU member state has one individually.

So for an EU customer's identity data the statutory motion fails twice over. It fails on subject matter, because § 2703(h)(2)(A) is written for "the contents of a wire or electronic communication" and the material at issue is records. And it fails on the foreign government, because the GDPR is not the law of a qualifying foreign government within the meaning of the section. What is left is the ordinary common-law comity argument that providers made before 2018, which is available, slower, and entirely dependent on the provider's willingness to spend money on it.

This is worth stating plainly because it inverts the usual pitch. The CLOUD Act's own safety valve was built for the UK arrangement, and it is the UK leg of a structure like ours, not the EU leg, that it was designed to relieve.

## What EU law compels, in the other direction

A European buyer evaluating US legal exposure in isolation is measuring one side of a vice.

The UK–US Data Access Agreement works both ways: US authorities can serve qualifying serious-crime orders directly on UK providers, and UK authorities on US providers, with each side barred from targeting the other's persons. And since **18 August 2026**, Regulation (EU) 2023/1543 has applied — the e-Evidence Regulation, under which a judicial authority in one member state can serve a European Production Order directly on a service provider offering services in the Union, with a ten-day deadline and eight hours in an emergency.

Against that sits Article 48 GDPR, "Transfers or disclosures not authorised by Union law", which says that a third-country court judgment or administrative decision requiring a controller or processor to disclose personal data "may only be recognised or enforceable in any manner if based on an international agreement, such as a mutual legal assistance treaty, in force between the requesting third country and the Union or a Member State".

A US order compelling production of EU identity data and Article 48 point in opposite directions, and there is no EU–US executive agreement to reconcile them. That unresolved conflict is the actual risk a DPO is asking you about. It is not solved by hosting in Frankfurt, and it is not solved by a vendor's assurances either. It is a gap in the treaty layer that providers sit inside.

## This is not the statute most people mean

Two different things get argued under one name, and separating them improves every conversation that follows.

The CLOUD Act route is criminal process. There is a specific case, a named target, a court somewhere in the chain, and a defined list of what may be produced. A provider can see it, log it, challenge it, and in most circumstances tell you about it.

Foreign-intelligence collection under FISA Section 702 is a different regime, programmatic rather than case-by-case, directed at non-US persons abroad, and accompanied by secrecy obligations that make provider transparency largely unavailable. Section 702's statutory authority lapsed in June 2026 and, as of 2 November 2026, Congress has not reauthorised it; collection continues under Foreign Intelligence Surveillance Court certifications approved in March 2026 and valid until 17 March 2027. A lapsed statute is not a dead programme. Anyone who tells you Section 702 "expired" and stops there is giving you the half of the sentence that sells.

## What actually moves the analysis

Since the test is possession, custody or control, the only interventions that change anything are the ones that change what the provider can technically or organisationally obtain. In rough order of how much they matter for an identity provider:

1. **Who can read the realm signing keys.** Whoever can read them can mint a valid token for any user, which makes key custody the highest-leverage control in the system.
2. **Who can reach the control plane**, from where, under what approval, and whether that access is logged.
3. **Which legal entity is your counterparty**, where it is incorporated, and whether the relationship with any non-EU parent is a real organisational separation or an org chart.
4. **What the data model keeps at all.** Retention you have set is data that cannot be produced, because it no longer exists. See [the DPO checklist for SaaS authentication](/blog/data-residency-requirements-saas-authentication/) for the version of this a procurement team will send you.
5. **Region**, last, because it is the control that changes the least and is quoted the most.

A corporate structure by itself insulates nothing. Courts apply a "legal right or practical ability" test to data held by affiliates, and a parent is routinely treated as controlling a subsidiary's data. The honest question to put to any vendor is not "where is it hosted" but "what could you actually hand over if you were ordered to, and who inside your company could execute that".

## The quote your buyer will bring you

On 10 June 2025, before the French Senate's commission of inquiry into public procurement and digital sovereignty, the rapporteur asked Anton Carniaux, director of public and legal affairs at Microsoft France, under oath, whether he could guarantee that French citizens' data entrusted to Microsoft would never be transmitted to the US government without the explicit agreement of the French authorities. The answer, from the official record:

> « Non, je ne peux pas le garantir, mais, encore une fois, cela ne s'est encore jamais produit. »
>
> "No, I cannot guarantee it, but, once again, it has never yet happened."

Earlier in the same hearing, on what happens when an order is legally founded: « Lorsque nous sommes obligés de les donner, nous les donnons. » When we are obliged to hand them over, we hand them over.

Quote it with the caveat. Both halves are true, and the second half is the one that gets dropped by whichever side is quoting it. The answer applies to us in exactly the same way, which is why we would rather write it here than have you find it in a risk assessment.

## Where we stand

Phase Two, Inc. is incorporated in the United States and is your counterparty, so we cannot and do not claim to be beyond the reach of § 2713. Identity data for an EU cluster is stored and processed in Frankfurt with the standing backup in Ireland and is not replicated outside the EU, while our control plane runs in the US and our engineers are distributed globally, so administrative access to an EU cluster can come from outside the EU. That is a restricted transfer and we disclose it rather than discover it with you. Realm signing keys for EU clusters are held in our key management service in the Frankfurt region; they are our keys in our KMS, and we do not offer bring-your-own-key on hosted clusters today. We are not certified under the EU–US Data Privacy Framework and do not rely on it.

What we do when a demand arrives — route it to one place, verify it, push it back to you as controller, challenge what is overbroad, notify you unless prohibited, disclose the minimum, publish the count — is written out on our [government requests](/company/government-requests/) page, along with the count itself, which is still zero. The per-class map of what lives where is in [where your Keycloak data lives](/blog/where-your-keycloak-data-lives/), and the region list is in the [regions documentation](/docs/self-service/regions/).

If none of that is sufficient for your risk profile, that is a legitimate conclusion rather than an objection to handle, and running upstream Keycloak yourself remains the answer we would give you. We would rather you ran it somewhere we do not host it than bought a promise from us that no company shaped like ours can keep.

The full map, the subprocessor list and the transfer mechanisms are on the [EU data residency](/hosting/eu-data-residency/) page, which is also where our [managed Keycloak](/hosting/dedicated-clusters/) regions are described. The Article 28 terms, including the subprocessor objection right and the breach notification window, are on the [data processing agreement](/company/data-processing/) page.

---

*Keycloak behaviour was tested on 26.8.1 with PostgreSQL 17 on 2 November 2026, against the 26.8 server administration and features documentation. Legal texts were verified the same day against primary sources: 18 U.S.C. §§ 2703, 2711 and 2713 as published by the US Government Publishing Office; Article 48 GDPR; Regulation (EU) 2023/1543 and its 18 August 2026 application date; the Department of Justice's CLOUD Act resources page for the list of executive agreements in force; the European Commission's adequacy decisions page for the UK and EU–US decisions; and the Sénat's official compte rendu of the 10 June 2025 hearing for the quotations. The status of FISA Section 702 was checked against reporting and the Brennan Center's explainer as last updated 16 October 2026; nothing had been enacted as of 2 November 2026. Whether a particular record is "content" or "a record", and whether a given service is a "remote computing service", are questions courts decide case by case.*
