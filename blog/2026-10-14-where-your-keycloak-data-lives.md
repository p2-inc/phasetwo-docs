---
slug: where-your-keycloak-data-lives
title: "Where your Keycloak data lives: Frankfurt, Ireland, and what leaves the EU"
date: 2026-10-14
authors: [jpatzer]
tags: [keycloak, eu-data-residency, gdpr, hosting, compliance]
description: Where Phase Two stores each class of your Keycloak data, Frankfurt and Ireland, who can reach it, what runs in the US, and which company you contract with.
keywords:
  [
    where your keycloak data lives,
    managed keycloak eu,
    keycloak data residency,
    keycloak hosting europe,
    keycloak gdpr,
  ]
---

Here is where your Keycloak data lives with us. The Keycloak database, sessions, event store, backups and realm signing keys for an EU cluster run in AWS Frankfurt (`eu-central-1`), with backups in Ireland (`eu-west-1`), and are never replicated outside the EU. Three things of ours do run in the United States: the dashboard you sign in to, support tickets, and billing. You contract with Phase Two UK, Ltd, registered in England and Wales, company number 16815578. Our parent company, Phase Two, Inc., is incorporated in the United States, and our control plane runs there, so administrators outside the EU can reach your cluster in order to operate it. Under Chapter V of the GDPR that access is a restricted transfer, and we would rather write it down here than have you find it in a risk assessment.

<!-- truncate -->

## What your identity provider actually holds

Before you can say where data lives you have to enumerate it, and the honest way to do that is against a running server rather than from a diagram. Everything below was run against Keycloak 26.8.0:

```bash
docker run -d --name kc -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.8.0 start-dev
```

After creating a realm, one user and one client and performing a single login, four endpoints return four classes of personal data:

```console
$ kcadm.sh get users -r eu-demo -q username=anja --fields username,email,firstName,lastName
[ { "username": "anja", "firstName": "Anja", "lastName": "Keller", "email": "anja@example.de" } ]

$ kcadm.sh get users/6734fb1b-.../credentials -r eu-demo
[ { "type": "password", "createdDate": 1791799823228,
    "credentialData": "{\"hashIterations\":5,\"algorithm\":\"argon2\",
      \"additionalParameters\":{\"memory\":[\"7168\"],\"type\":[\"id\"],\"parallelism\":[\"1\"]}}" } ]

$ kcadm.sh get clients/0c98853f-.../user-sessions -r eu-demo --fields username,ipAddress,start
[ { "username": "anja", "ipAddress": "172.17.0.1", "start": 1791799828000 } ]

$ kcadm.sh get events -r eu-demo --fields type,clientId,userId,ipAddress,time
[ { "time": 1791799828405, "type": "LOGIN", "clientId": "portal",
    "userId": "6734fb1b-...", "ipAddress": "172.17.0.1" } ]
```

Profile, credential, session, event. A fifth class, the realm signing keys, comes back from `kcadm.sh get keys`, and it matters because whoever holds them can mint a token for any user in the realm.

Two details are worth stopping on. The session and the event both carry an IP address, so a login record is personal data about where your user was, not only that they signed in. And the default event configuration has no `eventsExpiration` field at all, so saved events accumulate until you set one. That retention decision is the controller's, which means yours: see [user events in Keycloak](/blog/user-events-in-keycloak/) and the [audit log documentation](/docs/audit-logs/).

## Where each class lives

| What Keycloak holds | Stored in | Who can reach it | Leaves the EU? |
| --- | --- | --- | --- |
| Users, credentials, groups, roles, client config | Frankfurt `eu-central-1` | Phase Two operations staff, including staff outside the EU | No |
| Sessions and cache | Frankfurt `eu-central-1` | Phase Two operations staff, including staff outside the EU | No |
| Event store, login and admin events | Frankfurt `eu-central-1` | Phase Two operations staff, including staff outside the EU | No |
| Backups | Ireland `eu-west-1` | Phase Two operations staff, including staff outside the EU | No |
| Realm signing keys | Frankfurt, AWS KMS | Phase Two operations staff | No |
| Cluster logs and metrics | Frankfurt `eu-central-1` | Phase Two engineering, including staff outside the EU | No |
| Dashboard account metadata | United States | Phase Two staff | **Yes** |
| Support tickets and attachments | United States | Phase Two support staff | **Yes** |
| Billing and invoicing | United States | Phase Two finance staff | **Yes** |

A cluster's region is fixed at creation and cannot be changed afterwards, so check it against your residency requirement before you launch. Ireland is the standing backup on every EU cluster, on every plan, at no extra cost; running a *primary* cluster there is a separate, paid option, and the full list is in the [regions documentation](/docs/self-service/regions/).

## Stored in the EU is not the same as touched only in the EU

The last three rows are our business systems rather than your end users' identity data, and they are in the table because a version printing only the first six would be the more flattering document and the less useful one. One of them has a practical consequence: ticketing runs in the United States, so send us realm names, client IDs, error strings and correlation IDs, and do not paste user records into a ticket.

The larger point is in the third column. Our control plane, meaning provisioning, monitoring, alerting and ticketing, is a single instance in the United States, and our engineering team is spread across several countries. Operating your cluster, upgrading it, restoring it, responding at three in the morning, means reaching into it, and some of the people doing that are outside the EU.

Remote access to EU-stored data from a third country is itself a restricted transfer under Chapter V of the GDPR. It is covered by the Standard Contractual Clauses in Commission Implementing Decision (EU) 2021/914, incorporated into our [data processing agreement](/company/data-processing/) along with a transfer impact assessment we will share on request. Access is limited to named operations roles and logged internally. One limitation stated plainly: those logs are examined in our SOC 2 Type II audit but are not exposed to customers today, and we would like to change that.

## Who you contract with, and what that does not buy you

Phase Two UK, Ltd is the contracting party for customers in the EU and the UK. The European Commission renewed its adequacy decision for the United Kingdom on 19 December 2025, valid until 27 December 2031, so an EU-to-UK transfer needs no additional safeguard.

What the UK entity does not buy you is immunity. Phase Two, Inc. is incorporated in the United States, and under the US CLOUD Act a provider subject to US jurisdiction can be compelled to disclose data in its "possession, custody, or control" wherever that data is stored. We do not claim to sit outside that. What we can tell you is what we do with a request, published on our [government requests](/company/government-requests/) page: route it to one place, challenge what is overbroad, redirect it to you where we can, notify you unless prohibited, disclose the minimum, and publish the count. To date that count is zero.

## What we do not claim

- We do not describe ourselves as sovereign, and we will not hold SecNumCloud qualification: it requires European ownership a US-parented company cannot satisfy.
- We do not offer bring-your-own-key on hosted clusters. Realm signing keys for EU clusters sit in Frankfurt and do not leave the EU, but they are our keys in our KMS.
- We are not certified under the EU-US Data Privacy Framework and do not rely on it as a transfer mechanism.
- Support is in English only.
- Our contractual breach notification window is 48 to 72 hours. NIS2 gives you 24 hours for an early warning, so raise this during contracting rather than discovering the gap during an incident.

## Checking it, and leaving

An exit claim is worth as much as the export behind it. A realm configuration export is one API call, and returned 121 top-level keys for a stock realm in under a second:

```bash
curl -s -X POST \
  "$KC/admin/realms/eu-demo/partial-export?exportClients=true&exportGroupsAndRoles=true" \
  -H "Authorization: Bearer $TOKEN" -o realm.json
```

Note what that does *not* contain: users. `partial-export` returns configuration, so user records come from the Admin API or from `kc.sh export --users different_files`, and credentials come from a database dump we provide on request. Deletion at the end of service is an Article 28(3)(g) commitment carried out on request; we do not yet issue a certificate of deletion, and if your risk assessment needs one, ask and we will put it in your contract. For the same guarantees inside your own realm, see the [offboarding tutorial](/tutorials/workflows/user-offboarding/) and [how we scaled Keycloak event storage](/blog/scaling-keycloak-event-storage/).

The whole map, with the subprocessor list and the questions a DPO tends to send, is on our [EU data residency](/hosting/eu-data-residency/) page, and the Article 28 terms behind it are on the [data processing agreement](/company/data-processing/) page. If you want the same arrangement under your own name, [managed Keycloak](/hosting/dedicated-clusters/) clusters launch in Frankfurt from the dashboard.

*Regulatory facts in this post were verified on 12 October 2026: the UK adequacy decisions renewed on 19 December 2025 and running to 27 December 2031, and the EU-US Data Privacy Framework in force with the appeal in Case C-703/25 P pending before the Court of Justice. Keycloak output was produced on 26.8.0.*
