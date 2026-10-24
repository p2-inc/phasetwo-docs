---
slug: azure-ad-b2c-end-of-sale
title: "What Azure AD B2C's end of sale actually means"
date: 2026-10-26
authors: [gpatil]
tags: [keycloak, migration, azure, ciam, comparison]
description: Azure AD B2C is end of sale, not end of life — supported to at least May 2030. What the March 2026 P2 date really was, and the three destinations worth considering.
keywords:
  - azure ad b2c end of sale
  - azure ad b2c end of life
  - azure ad b2c alternative
  - azure ad b2c migration
  - entra external id vs keycloak
---

Azure AD B2C's end of sale means Microsoft stopped selling it to new customers on **1 May
2025** and committed to supporting it **until at least May 2030**. It is not being shut down.
Existing customers keep their tenants, can still create new ones, and keep the SLA, the
security updates and the compliance posture. What ended is the roadmap.

One other date is doing a lot of damage. **Premium P2 was discontinued on 15 March 2026** for
all customers, and tenants moved to P1. That is a pricing-tier retirement, not a tenant
retirement — but it has been reported often enough as "B2C shuts down in March 2026" that it is
worth saying plainly: your tenant is fine, and you have roughly four years to make a decision
rather than four months to execute one.

Four years is enough time to make a good decision and short enough that the one you make now is
the one you live with. Here is what the three realistic destinations actually cost.

<!-- truncate -->

## The dates, and nothing else

Every date below is from [Microsoft's own B2C
FAQ](https://learn.microsoft.com/azure/active-directory-b2c/faq). There are only three.

| Date | What changed | What did **not** change |
|---|---|---|
| **1 May 2025** | B2C is no longer available to purchase for new customers | Existing customers keep using it, and can still create tenants — on P1 |
| **15 March 2026** | Premium P2 discontinued for all customers; tenants switched to P1 | Everything that is not a P2-only feature |
| **May 2030** | The earliest date the support commitment runs to | SLAs, security updates and compliance, all unchanged until then |

Microsoft's wording on the last one is "We'll continue supporting Azure AD B2C until at least
May 2030." *At least* is doing real work there — it is a floor, not an expiry.

The P2 retirement is the one worth understanding properly, because it is the only one that took
a capability away from a running tenant. Microsoft's FAQ describes it as a separate matter from
the end of sale: P2 is retired **in B2C tenants**, P2-only features go with it, ID Protection
among them, and the guidance for teams that depended on it is to integrate a third-party
identity verification provider. Workforce tenants are unaffected.

So the accurate summary of your position is: **end of sale, frozen roadmap, legacy status, one
tier of capability removed, supported for about four more years.** Nothing in that sentence is
an emergency, and nothing in it is good news either.

## What "frozen roadmap" costs you, slowly

A product under support but not under development degrades in ways that do not show up on a
status page.

The features you do not get are the ones the rest of the industry ships in the meantime.
Between now and 2030, standards move — the places where that usually bites a customer identity
deployment are new authentication methods, new token-binding and sender-constraint mechanisms,
and whatever the regulatory environment demands next. B2C will get security fixes for what it
has. It will not get capability it does not have.

The second cost is the one teams underestimate: **the pool of people who know the product
stops growing.** Identity Experience Framework expertise was never abundant. On a product
nobody new can buy, it thins out. If your custom policies are maintained by one person, their
next job offer is a platform risk.

Neither of those is a reason to move this quarter. Both are reasons not to let the decision
drift to 2029.

## Why "B2C retires in March 2026" spread

Because two announcements landed close together and one of them had a hard date on it.

The end of sale is open-ended — "at least May 2030" is not a deadline anyone can build a
headline around. The P2 discontinuation is a specific day, applies to every customer, and
genuinely removes something. Compress those and you get "Microsoft is killing B2C in March
2026", which is wrong in the one direction that causes bad decisions: it makes a four-year
planning problem look like a four-month migration.

If you are being pushed toward a rushed migration on the strength of that date, check the FAQ.
The person pushing is either misinformed or selling.

## Option 1: stay on B2C until 2030

This is the right answer for more teams than vendor blogs admit, and it deserves to be stated
without qualification: **if B2C is working for you, staying is a defensible engineering
decision.**

It fits when most of these are true:

- Your authentication is built on **built-in user flows**, not custom policies.
- You are inside the **50,000 free monthly active users** tier, or comfortably near it.
- Your stack is Azure-native and you use what that gives you — Front Door custom domains,
  Application Insights, federation to your Entra workforce tenant.
- Nobody is asking you about data residency, source access, or what happens to identity if the
  vendor relationship changes.
- You did not depend on a P2-only feature.

What you are buying is zero operational burden and a Microsoft SLA, which are worth a great
deal and which no self-hosted alternative gives you for free. What you are deferring is a
decision, not avoiding it. Put a review in the calendar for 2028 and move on to something that
matters more this year.

## Option 2: move to Microsoft Entra External ID

External ID is Microsoft's named successor and has been generally available since 2024. For a
simple B2C tenant it is the path of least resistance: same vendor, same portal, same Graph API,
same invoice.

The caveats are not hidden — they are in Microsoft's own [migration
guide](https://learn.microsoft.com/entra/external-id/customers/migrate-from-b2c-to-external-id),
which is the document to read before anything else. Its feature-mapping table is the honest
part of the whole discussion:

| B2C | External ID equivalent |
|---|---|
| Custom policies (XML/IEF) | Custom authentication extensions |
| Hosted pages with HTML/CSS | User flows with branding + native authentication |
| Custom policies, user flow conditions | Microsoft Entra conditional access |
| Custom claims in policies | Custom authentication extensions |
| Browser-based flows, web redirects | Native authentication SDKs (local accounts only) |

Read the left column as "what you have" and the right as "what you will build instead". These
are mappings between *concepts*, not a migration path for *artifacts*. There is no converter
that takes `TrustFrameworkExtensions.xml` and emits the equivalent.

The guide is also explicit about one gap that catches enterprise tenants:

> Social identity providers configured through B2C custom policies. Social federation must be
> reconfigured using External ID's built-in social identity provider support. Third-party
> identity providers configured through B2C custom policies aren't supported.

If you federate to a partner's IdP, a regional identity scheme, or anything you wired up
yourself through a custom policy, that is the sentence that decides your project. Check it
first, before you cost anything else.

Two smaller things worth knowing: native authentication — the SDK path that avoids a browser
redirect on mobile — is documented as local-accounts only, and User Insights is being retired
on 31 August 2026 in favour of Azure Monitor with Log Analytics.

None of this makes External ID a bad product. It makes it a **new** product, and Microsoft's
own positioning leans toward new deployments rather than B2C lift-and-shift.

## Option 3: move to Keycloak

Here is the argument, and it only works if you accept the two paragraphs above.

If your B2C tenant is built on custom policies, **you are rewriting your authentication logic
whichever destination you choose.** That is not a Keycloak talking point; it follows from
Microsoft's own feature-mapping table. Once the rewrite is a fixed cost on every option, the
question changes from "which migration is cheapest?" to "where do I want to be standing the
next time a vendor freezes a roadmap?"

That is the whole case. It is not urgency and it is not cost.

Concretely, what Keycloak gives a B2C tenant:

- **Authentication flows that behave like user journeys.** Executions in order, subflows with
  conditions, requirement levels per step. Most orchestration steps become configuration rather
  than XML — see [building a custom authentication
  flow](/tutorials/authentication/custom-flows/).
- **The Authenticator SPI** for the parts that genuinely need code, which is a normal Java
  interface in your own build pipeline rather than a policy language.
- **Full theme control** — login, account, email and admin — so the HTML/CSS customization you
  have in B2C's hosted pages does not narrow to a branding menu. [Keycloak
  themes](/extensions/themes/).
- **Any OIDC or SAML [identity provider](/docs/keycloak/idp/)**, plus LDAP and Active Directory
  federation, without a supported-list gate.
- **Your own database**, which means your credentials are portable the next time this question
  comes up.
- **Deployment anywhere** — your cloud, on-premise, Kubernetes — which is how a residency
  requirement gets answered rather than negotiated.

And the honest other side. Keycloak is a JVM application with a database, a cache, a
certificate story and a quarterly release cadence, and **only the latest minor gets community
patches** — 26.8 at the time of writing, released 1 October 2026. Running it well is a real
job. Either you staff it or you buy [managed Keycloak](/hosting/dedicated-clusters/); pretending
it is free is how migrations go wrong.

## The four questions that decide this

Answer these before you cost anything.

1. **How much of your logic is in custom policies?** Open the Azure portal, go to Identity
   Experience Framework, and count the policy files and the orchestration steps. Zero means all
   three options are cheap. A `TrustFrameworkExtensions.xml` with ten orchestration steps and
   REST calls means one expensive rebuild, on any destination.
2. **Do you federate to anything outside the built-in social providers?** If yes, read
   Microsoft's unsupported-features note again and establish whether External ID can do it at
   all before you treat it as the default.
3. **Does anyone need identity to run somewhere specific?** A customer contract, a regulator, a
   data protection impact assessment. If yes, a single-cloud product is a structural problem and
   no amount of feature parity fixes it.
4. **What is your MAU trajectory?** Inside 50,000, B2C is free and cost is not an argument for
   anything. Well past it, the per-MAU line is worth modelling against fixed infrastructure
   cost — but model it, do not assume it.

If the answers are "none, no, no, under 50k", stay on B2C. That is a real recommendation and we
will put it in writing.

## Do this next

Spend an afternoon producing one artifact: an inventory of your tenant. User flows, custom
policy files and their orchestration steps, every identity provider and how it was configured,
every custom claim, and your current MAU. That document is the input to all three options and
it is the thing nobody has when they ask for an estimate.

The side-by-side is on [Keycloak vs. Azure AD B2C](/keycloak-alternatives/azure-ad-b2c/), and if
you want someone who has done this to read your inventory and tell you what it costs, [talk to
us about migrating to Keycloak](/support/migrate-to-keycloak/). If the answer is "stay until
2028", we will tell you that too.
