---
slug: data-residency-requirements-saas-authentication
title: "Data residency requirements for SaaS authentication"
date: 2026-10-28
authors: [gpatil]
tags: [keycloak, eu-data-residency, gdpr, compliance, security]
description: The data residency requirements a DPO sends an authentication vendor, the document that answers each one, what a thin answer looks like, and ours filled in.
keywords:
  [
    data residency requirements,
    saas authentication data residency,
    keycloak data residency,
    gdpr identity provider,
    data processing agreement identity provider,
  ]
---

Data residency requirements for a SaaS authentication service are not one requirement, they are four, and only the first of them is about a region. You have to name where each class of identity data is stored. You have to name a lawful transfer mechanism for every touchpoint outside that region, including remote administrative access, which is a transfer and not an exception to one. You have to hold Article 28 processing terms that say so in writing. And you have to be able to produce an inventory of where the identity data goes *after* it is stored — the brokers, mail relays, event listeners and relying parties your own realm sends it to. Below is the checklist a data protection officer sends, the document that answers each item, what a thin answer looks like, our own answers including the unflattering ones, and the commands that generate that fourth item from a running Keycloak realm, tested on 26.8.1.

<!-- truncate -->

## Where the requirement actually comes from

The single most useful thing to know before answering a residency questionnaire: **the GDPR does not require data localisation.** Chapter V regulates *transfers* out of the EEA, it does not mandate storage inside it. Almost every hard location requirement an authentication vendor is asked to meet comes from somewhere else — a sector rule, a national scheme, or a procurement framework — and those are the ones with teeth.

| Where it comes from | What it says about location | What it asks you to produce |
| --- | --- | --- |
| GDPR Chapter V (Art. 44–49) | Nothing about storage location. Any transfer out of the EEA needs adequacy, an Art. 46 safeguard, or a derogation | The transfer mechanism per touchpoint, plus a transfer impact assessment where SCCs are used |
| GDPR Art. 28 | Nothing. Data location is a Chapter V disclosure, not an Art. 28 clause | A written processing agreement with the 28(3) content, a subprocessor list, notice and objection rights |
| DORA Art. 30(3) (financial entities, since 17 Jan 2025) | Contract must state the locations where data is processed and stored, and notify changes | Quantitative SLAs, audit and access rights, exit plan, subcontracting terms — and your entry in their Register of Information |
| NIS2 Art. 21(2)(d) and Art. 23 | Nothing about location; supply-chain security pushes the controls onto you | An incident notification window short enough to feed their 24-hour early warning and 72-hour notification |
| HDS v2 (French health data) | Hosting in the EEA, and a published map of any extra-EEA transfer or access | Certification through the host, and the transfer map |
| BSI C5 (German public sector) | Not a location rule, but jurisdiction, data location and subcontractors are explicit "Umfeldparameter" | A C5 attestation or a credible mapping from ISO 27001 |
| Commission Cloud Sovereignty Framework; the Cloud and AI Development Act proposal of 3 June 2026 (Art. 16) | Location is one objective among eight, scored as a floor rather than an average | A scored self-assessment — see [data residency vs data sovereignty](/blog/data-residency-vs-data-sovereignty-identity-provider/) for the SEAL levels |

So "what are your data residency requirements" arriving from a procurement team is usually shorthand for a set of contract terms and evidence artifacts, of which the region field is the cheapest part. A vendor that answers only the region field has answered one row of seven.

## The checklist, and the document that answers each item

Ten items, in the order a DPO tends to send them. The middle column is the one worth internalising: every requirement here is satisfied by a *document*, and a vendor who can only answer in conversation cannot actually satisfy it.

| What the DPO asks for | The artifact that answers it | What a thin answer looks like |
| --- | --- | --- |
| 1. Where each class of identity data is stored — database, sessions, event store, backups, signing keys — and whether the region is fixed at creation | A data map, one row per class, with the region and the infrastructure provider | "Hosted in the EU" with no breakdown, or a region list that does not mention backups |
| 2. Which of the vendor's *own* systems sit outside that region — dashboard, ticketing, billing, monitoring, logging | The same data map, continued past the flattering rows | A map that stops at the Keycloak database |
| 3. Whether staff outside the region can administer the service | A statement that names it as a Chapter V restricted transfer, with the access controls | "Support is EU-based" without saying where engineering and the control plane are |
| 4. Which transfer mechanism covers each touchpoint outside the region | Named instrument: an adequacy decision, or SCCs with the module, or a Data Privacy Framework certification number | "We're GDPR compliant", or a DPF claim you cannot find in the US Commerce Department list |
| 5. The transfer impact assessment | A written TIA covering FISA 702, EO 12333 and the CLOUD Act, with request history and challenge policy | "Available under NDA" for a document that exists to be read by your DPO, or no TIA at all |
| 6. Which legal entity is the counterparty, where it is incorporated, who owns it, and whether the parent is a subprocessor | The DPA's parties clause, plus a company registration number you can look up | A trading name, a marketing entity, or a parent that appears nowhere in the agreement |
| 7. The subprocessor list, with notice and an objection right before additions | A published, dated list naming the service each one performs (Art. 28(2) and 28(4)) | A list "available on request", or authorisation with no objection right |
| 8. The breach notification window, in hours | The DPA clause, stated numerically | "Without undue delay", quoted back from Art. 33(2) as though it were a commitment |
| 9. Audit and access rights, and whether DORA Art. 30(3) terms are acceptable | SOC 2 Type II report, ISO 27001 certificate, pen test summaries — and a written position on on-site audit | Certifications offered in place of an answer about audit rights, or a flat refusal to negotiate |
| 10. What an export contains and what deletion at end of service commits to | An export format, a worked example, and the Art. 28(3)(g) clause | An "export" that turns out to be configuration without users, or deletion with no evidence of it |

Three of those get fudged more than the rest.

**Item 3 is the one most vendors skip,** and it is the one most likely to come back during a supervisory authority review. Remote access to EU-stored data from a third country is itself a restricted transfer under Chapter V. A vendor whose engineers are distributed globally and whose control plane sits outside the EU is performing transfers every time someone opens a terminal, whether or not a byte of your database is ever copied abroad. The answer you want is not "no" — it is a precise description plus the safeguard.

**Item 4 is where a residency claim either holds or does not.** For a US touchpoint, the three available answers are an adequacy decision, SCCs plus a TIA, or a Data Privacy Framework certification. They are not equivalent, and the third is worth a sentence on its current state.

**Item 5 is the one nobody can bluff.** A TIA is six steps from EDPB Recommendations 01/2020: map the transfer, identify the tool, assess the destination country's law, add supplementary measures, formalise them, re-evaluate. It runs to pages and names statutes. A vendor who has one will send it; a vendor who has not will offer certifications instead.

Three facts behind items 4 and 5 that move, and that we re-verified on **26 October 2026**. The **EU–US Data Privacy Framework is in force**; Philippe Latombe's appeal against the General Court's dismissal of his challenge is pending before the Court of Justice as Case C-703/25 P, with Microsoft admitted as an intervener by order of 4 June 2026 and no hearing announced. **UK adequacy** was renewed by the Commission on 19 December 2025 and runs to 27 December 2031, so an EU-to-UK transfer needs no additional safeguard today. And **FISA Section 702's statutory authority lapsed in June 2026** when Congress did not reauthorise it, while collection continues under Foreign Intelligence Surveillance Court certifications approved in March 2026 and running to 17 March 2027 — a lapsed statute over a live programme, which is why a TIA written in the last six months should not read as though the exposure went away.

## The item you have to produce yourself: where does your realm send data?

Items 1 to 10 are about the vendor. There is an eleventh that no questionnaire asks and every DPO eventually needs, because it is the controller's own answer rather than the processor's: **where does identity data go once it is in the realm?** Keycloak's own documentation has a [Personal data collected by Keycloak](https://www.keycloak.org/docs/latest/server_admin/index.html) section that enumerates what the server holds. It does not enumerate where the server sends it, and that is the part a transfer map needs.

Five outbound paths exist in a stock realm, and all five are readable from the Admin API. Everything below ran against Keycloak 26.8.1 on a realm with a brokered IdP and an SMTP relay configured:

```bash
docker run -d --name kc -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.8.1 start-dev

KC=http://127.0.0.1:8080
TOKEN=$(curl -s -X POST "$KC/realms/master/protocol/openid-connect/token" \
  -d client_id=admin-cli -d username=admin -d password=admin \
  -d grant_type=password | jq -r .access_token)
R=eu-demo
```

```console
$ curl -s "$KC/admin/realms/$R/identity-provider/instances" -H "Authorization: Bearer $TOKEN" \
    | jq -r '.[] | "\(.alias)\t\(.providerId)\t\(.config.tokenUrl // .config.singleSignOnServiceUrl // "-")"'
corp-sso	oidc	https://login.corp-example.com/oauth2/v1/token

$ curl -s "$KC/admin/realms/$R/components?type=org.keycloak.storage.UserStorageProvider" \
    -H "Authorization: Bearer $TOKEN" | jq -r 'length as $n | "user federation providers: \($n)"'
user federation providers: 0

$ curl -s "$KC/admin/realms/$R" -H "Authorization: Bearer $TOKEN" \
    | jq -r '.smtpServer | "\(.host // "-"):\(.port // "-")  from=\(.from // "-")"'
smtp.us-east-1.example.com:587  from=no-reply@example.de

$ curl -s "$KC/admin/realms/$R/events/config" -H "Authorization: Bearer $TOKEN" \
    | jq -c '{eventsListeners, eventsExpiration}'
{"eventsListeners":["jboss-logging"],"eventsExpiration":null}

$ curl -s "$KC/admin/realms/$R/clients" -H "Authorization: Bearer $TOKEN" \
    | jq -r '.[] | select(.redirectUris | length > 0) | "\(.clientId)\t\(.redirectUris | join(","))"'
account	/realms/eu-demo/account/*
account-console	/realms/eu-demo/account/*
portal	https://portal.example.de/*
security-admin-console	/admin/eu-demo/console/*
```

Read those five results as a transfer map. The brokered provider means authentication requests and returned claims traverse a third party — in this case one on a `.com` host whose region you have to look up rather than assume. The mail relay means every verification and reset email, each carrying an address and usually a name, leaves through whoever operates `smtp.us-east-1.example.com`; the hostname is a hint and not evidence, so check the contract behind it. The event listeners are where login records go, and `"eventsExpiration": null` means no retention is configured at all — the mechanics of fixing that on a realm that has run for a year without it are in [user events in Keycloak](/blog/user-events-in-keycloak/) and the [audit log documentation](/docs/audit-logs/), and a listener that ships events off-cluster is itself a transfer worth naming, which is what the [webhooks documentation](/docs/audit-logs/webhooks/) describes. The relying parties are recipients too, and the next section measures exactly what they receive.

One quirk to save you ten minutes: `kcadm.sh get realms/eu-demo --fields smtpServer` returns `{ }` rather than the configuration, because the field filter does not descend into nested objects. Fetch the whole realm representation and filter client-side, as above.

## Cut what leaves in the token

A relying party is a recipient of personal data, and by default it receives more than most people assume. Here is the ID token a confidential client gets from a stock realm, decoded:

```console
$ curl -s -X POST "$KC/realms/$R/protocol/openid-connect/token" \
    -d client_id=portal -d client_secret="$SECRET" -d grant_type=password \
    -d username=anja -d "password=$PW" -d scope=openid \
  | jq -r .id_token | cut -d. -f2 | tr '_-' '/+' | base64 -d | jq -S .
{
  "aud": "portal",
  "email": "anja@example.de",
  "email_verified": false,
  "family_name": "Keller",
  "given_name": "Anja",
  "name": "Anja Keller",
  "preferred_username": "anja",
  "sub": "07c581f0-db2f-4f0b-9c64-e83653fd61eb",
  ...
}
```

Email, full name and username, to every client, on every login, whether or not the application needs any of it. That comes from the `profile` and `email` client scopes, which are **default** scopes on every new client — meaning they apply whether or not the client asks. Move them from default to optional and the client gets them only when it requests them:

```bash
CID=$(curl -s "$KC/admin/realms/$R/clients?clientId=portal" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

for n in profile email; do
  SID=$(curl -s "$KC/admin/realms/$R/client-scopes" -H "Authorization: Bearer $TOKEN" \
    | jq -r --arg n "$n" '.[] | select(.name==$n) | .id')
  curl -s -X DELETE "$KC/admin/realms/$R/clients/$CID/default-client-scopes/$SID" \
    -H "Authorization: Bearer $TOKEN"
  curl -s -X PUT "$KC/admin/realms/$R/clients/$CID/optional-client-scopes/$SID" \
    -H "Authorization: Bearer $TOKEN"
done
```

The measured effect, same client, same credentials, two different `scope` values:

```console
$ # scope=openid
["acr","at_hash","aud","azp","exp","iat","iss","jti","sid","sub","typ"]

$ # scope=openid profile email
["acr","at_hash","aud","azp","email","email_verified","exp","family_name","given_name",
 "iat","iss","jti","name","preferred_username","sid","sub","typ"]
```

Six personal-data claims gone from the default path, and the token still authenticates. The honest caveat: this breaks any application that reads `email` or `name` from the ID token without asking for the scope, which is a common shortcut — so audit what your clients request before you change the realm, and expect to fix a frontend or two. Moving the scopes to *optional* rather than deleting them is what keeps that fix a one-line change on the client side. What a token asserts and what signs it is in [JWKS explained](/blog/jwks-explained/) and the [JWT tutorials](/tutorials/jwts/).

## Our answers, filled in

Same ten items, our side of them, including the rows we would rather not write.

| # | Phase Two |
| --- | --- |
| 1 | EU clusters: database, sessions, event store and realm signing keys in Frankfurt (`eu-central-1`), backups in Ireland (`eu-west-1`), never replicated outside the EU. A cluster's region is fixed at creation. Full list in the [regions documentation](/docs/self-service/regions/) |
| 2 | Dashboard account metadata, support tickets and billing run in the United States. That is our business systems, not your end users' identity data, and it is in the data map rather than omitted from it |
| 3 | **Yes.** Our control plane runs in the US and our engineering team is distributed globally, so administrative access to an EU cluster can come from outside the EU. We disclose it as a Chapter V restricted transfer; access is limited to named operations roles and logged internally |
| 4 | EU to UK: the Commission's adequacy decision of 19 December 2025. US administrative access: Standard Contractual Clauses, Commission Implementing Decision (EU) 2021/914, incorporated into the DPA. We are **not** certified under the Data Privacy Framework and do not rely on it |
| 5 | A transfer impact assessment exists and we share it on request, without an NDA |
| 6 | Phase Two UK, Ltd, registered in England and Wales, company number 16815578, 2 Leman Street, London E1W 9US. Parent: Phase Two, Inc., Seattle, United States, which acts as a subprocessor to the UK entity and is named as such in the agreement |
| 7 | Published in the Trust Center with the service each one performs. Notice before adding or replacing one, and an objection right |
| 8 | **48 to 72 hours.** Read that against your own clock: NIS2 gives you 24 hours for an early warning, so raise it during contracting rather than during an incident |
| 9 | SOC 2 Type II and ISO/IEC 27001, both current, with penetration test summaries. DORA Art. 30(3) audit and access rights are negotiated rather than refused |
| 10 | Realm configuration and users export through the Admin API and `kc.sh export`; a database dump on request. Deletion at end of service under Art. 28(3)(g), carried out on request. We do **not** yet issue a certificate of deletion — if your risk assessment needs one, ask and it goes in the contract |

The whole data map, class by class, is in [where your Keycloak data lives](/blog/where-your-keycloak-data-lives/), and the Article 28 terms behind rows 4 through 10 are on the [data processing agreement](/company/data-processing/) page.

## What we do not claim

- We do not describe ourselves as sovereign. Our parent is US-incorporated, so we cannot claim immunity from US legal process, and we would read any vendor that does claim it carefully. What we do with a legal demand is on the [government requests](/company/government-requests/) page; the count received to date is zero.
- We will not hold SecNumCloud qualification — it requires European ownership a US-parented company cannot satisfy — and we hold no BSI C5 attestation of our own.
- Realm signing keys for EU clusters are held in our key management service in the Frankfurt region. They are our keys in our KMS; we do not offer bring-your-own-key on hosted clusters today.
- Administrative access logs are examined in our SOC 2 Type II audit but are not exposed to customers. We would like to change that.
- Support is in English only.

## Where to start

Run the five Admin API calls above against your own realm first. The result is the one artifact in this whole checklist that no vendor can produce for you, it takes about a minute, and in our experience it is where the surprise is — an SMTP relay or an event listener nobody wrote down beats a region field nobody checked.

If you are evaluating us against that list, the complete map, the subprocessor list and the questions our own DPO gets most are on the [EU data residency](/hosting/eu-data-residency/) page, and the terms behind them are on the [data processing agreement](/company/data-processing/) page.

*Keycloak behaviour in this post was tested on 26.8.1 against the 26.8.1 Server Administration Guide. Regulatory facts were verified on 26 October 2026: UK adequacy against the Commission's December 2025 renewal; the status of Case C-703/25 P against current legal reporting, which has the appeal pending with no hearing announced and Microsoft admitted as an intervener by order of 4 June 2026; and the status of FISA Section 702 against reporting from June 2026 onward and the Brennan Center's explainer as updated on 16 October 2026, with nothing enacted since. DORA Art. 30(3), GDPR Art. 28 and Chapter V, and EDPB Recommendations 01/2020 were read in their published texts.*
