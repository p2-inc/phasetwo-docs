---
slug: replace-ecommerce-login-with-keycloak
title: "Replacing homegrown e-commerce login with Keycloak"
date: 2026-10-23
authors: [jpatzer]
tags: [keycloak, security, migration, authentication, organizations]
description: How an e-commerce store replaces homegrown login with Keycloak, migrates customers without password resets, and defends the login page against credential stuffing.
keywords:
  - keycloak ecommerce
  - replace homegrown authentication
  - ecommerce login security
  - keycloak credential stuffing
  - keycloak customer identity
---

The login page is the most attacked page on an online store, and it is rarely the one anyone designed for attack. Homegrown e-commerce login usually starts as a users table, a bcrypt column and a session cookie, and it grows a password reset, a mobile API, a trade-account flag and a social button over the years. What it almost never grows is a defense against credential stuffing: automated replay of email and password pairs leaked from other sites, aimed at whichever of your customers reused one. **Replacing homegrown login with Keycloak gives a store one identity service for web, app and back office, with social login, B2B accounts and branded pages built in, and you can move customers onto it without asking anyone to reset a password.** It does not make the login page safe on its own. The defaults leave doors open that attackers look for first, and the rest of this post covers both halves: what you gain, and what has to be layered on top.

<!-- truncate -->

## Why does homegrown store login fall behind?

The trouble is rarely the password hashing. Most homegrown systems hash correctly. It is everything around the hash:

| Need | Typical homegrown login | Keycloak |
|---|---|---|
| Social login (Google, Apple, Facebook) | One provider, bolted on, often a separate account per provider | Identity providers configured per realm, with linking to an existing account by email |
| Web, mobile app and back-office services | Separate session logic per surface, often a shared API key for services | One OpenID Connect issuer; browser, app and service clients each get the grant they need |
| B2B or trade customers | A flag on the user row, pricing logic scattered through the app | [Organizations](/extensions/organizations/) with members, roles and per-company identity providers |
| Two-factor and passkeys | Usually absent | OTP, WebAuthn and passkeys as flow steps |
| Branded login and email | Hand-built templates | [Keycloak themes](/extensions/themes/) for login, account and email pages |
| Audit trail of logins | Application logs, if anyone added them | Login and admin events with IP, client and error |
| Bot and credential-stuffing defense | Rarely more than a per-IP limit | Brute force detection built in, CAPTCHA by extension; still needs configuration (below) |

The last row is the one that matters most, and it is the one Keycloak does not solve by being installed.

## What does a store get from Keycloak?

**One login for every surface.** The storefront, the mobile app, the customer-service tool and the order API all trust the same issuer. A customer who signs in on the app is the same subject in your order system, and your backend services authenticate as themselves through service accounts instead of borrowing a human's password.

**Social login that does not fork the customer.** When someone who registered with an email address later taps "Continue with Google", Keycloak recognizes the matching email and offers to link the Google identity to the existing account once the customer proves they own it, rather than creating a second one. See [Social Login](/docs/authentication/social-login).

**Trade accounts as a first-class object.** Stores that sell to both consumers and businesses usually end up with a business flag on the user and a lot of conditional code. Organizations model the company itself: its members, their roles inside it, and optionally the company's own SSO. A buyer at a contractor firm signs in through their employer's identity provider and lands in the right account. The [multi-tenancy post](/blog/multi-tenancy-with-keycloak-organizations) walks through the model.

**Login that looks like your store.** Themes cover the login, registration, password reset and email templates, so the moment a customer is most likely to abandon does not look like a different site.

## How do you move customers without a password reset?

A forced password reset at cutover costs you customers. A fraction will not open the email, and some of those were about to buy something. Lazy migration avoids it: Keycloak checks each customer's password against your old system the first time they sign in, then stores its own hash and never asks the old system again.

The [user migration](/docs/user-migration) extension does this with two endpoints you add to your legacy system: a `GET` that returns the user's profile and a `POST` that answers whether a password is correct. The sequence that works:

1. **Stand up the realm and theme first**, and point a staging copy of the storefront at it.
2. **Add the two legacy endpoints** and configure the *User migration using a REST client* provider under User federation.
3. **Run old and new side by side.** Customers who sign in through Keycloak are migrated on that login; everyone else is still served by the old system until you switch them.
4. **Move the web storefront**, then back-office tools.
5. **Move the mobile app last.** App releases go through store review and customers update on their own schedule, so the old login has to keep working for older app versions until they age out.
6. **Bulk-import the long tail** who never signed in during the window, and send those customers a reset email when they return.

One thing to know before you do this: while migration is running, a sign-in for an email address Keycloak has not seen yet is checked against your legacy endpoint. Credential stuffing aimed at the new login therefore lands on the old system too. Rate-limit and monitor those endpoints like the public login they effectively are.

If you are coming from a hosted provider rather than your own database, the [Auth0 to Keycloak walkthrough](/blog/migrate-auth0-to-keycloak) covers the export and the password-hash problem in detail.

## What do attackers try against a store's Keycloak?

These are patterns we have seen against production realms we run and support. None of them needs a vulnerability in Keycloak; each uses a default or a gap in the configuration.

- **They try every way in, not just your login page.** A realm ships with built-in clients, and the admin CLI client accepts a password posted straight to the token endpoint. That path renders no page, so a CAPTCHA on your login page never sees it. Block one entry point and the traffic moves to the next one within hours.
- **A CAPTCHA that fails open is not a CAPTCHA.** A login step that records a failed challenge and then lets the attempt continue looks fine in the admin console and stops nothing. Test it by posting a login without a token and checking you are refused.
- **Lockout does not stop credential stuffing.** Brute force detection counts failures per user. A stuffing run tries one leaked password per email address and moves on, from a different residential IP every few attempts, so no single account or address ever crosses a threshold.
- **Your own services become the casualty.** If a backend service signs in with a shared admin username and password, an attacker hammering that username locks the account, and your order sync goes down with it. Services should use client credentials, which have no password to guess.
- **Successful logins are the hard part to find.** Failed attempts are loud. The accounts that matter are the ones where the leaked password worked, and those only show up in the event store, which by default keeps events for a short window.

The [admin-cli and account client post](/blog/keycloak-disable-admin-cli-account-clients) covers which built-in clients to leave on at go-live and why, and [Credential Stuffing and Account Takeover](/docs/security/credential-stuffing) is the full prevent, detect and respond guide.

## How does Phase Two layer the defenses?

No single control stops credential stuffing, so we stack them. On a Phase Two dedicated cluster:

| Layer | What it does | Where it is configured |
|---|---|---|
| Edge rate limits | Per-IP request limits at the edge, sized to your cluster tier, with a `429` and `Retry-After` when a source exceeds them | Set by us; see [Rate Limiting](/docs/security/rate-limiting) |
| CAPTCHA on login and registration | Cloudflare Turnstile authenticators are included in every cluster image; you add your Cloudflare site key and place them in your flows so a failed challenge blocks the login | You turn it on; see [Turnstile](/docs/security/turnstile) |
| Admin path restrictions | Limits the Admin Console and Admin API to your office or VPN addresses (Premium and Enterprise) | Dashboard; see [Cluster Restrictions](/docs/self-service/restrictions) |
| No exposed master realm | The master realm is not customer-accessible, so there is no cluster-wide admin login to attack | Managed by us |
| Events, metrics and logs | Login events are captured automatically; login volume, failure rates and logs are available to your on-call team | [Audit Logs](/docs/audit-logs), [Metrics](/docs/self-service/metrics), [Logs](/docs/self-service/logs) |
| Go-live hardening | Password grant off with client policies, unused self-service clients disabled, brute force detection on | You apply it; our [go-live checklist](/docs/getting-started/launch-checklist) lists every item |

Two of these are worth being plain about. Turnstile is ready in every cluster but is not switched on until you configure it, because it needs your own Cloudflare account and a flow change only you can approve. And per-IP rate limiting on its own does not stop a distributed stuffing run; it stops a single source from overwhelming the cluster. The CAPTCHA, the closed password grant and the event monitoring are what deal with the distributed case.

## What else should a store plan for?

**Peak season.** Size the cluster for the busiest hour of the year, not the average. Our tiers are sized by active users (see [Dedicated Clusters](/docs/self-service/dedicated-clusters)), and per-IP limits apply to your own traffic too: a backend that calls Keycloak for every order from one address, or a store full of customers behind one carrier NAT, can hit a limit a home shopper never will. Tell us before a launch or a load test so we can size it and tell it apart from an attack.

**Long-lived mobile sessions.** Customers expect the app to stay signed in for weeks. That usually means offline tokens and refresh token rotation, and rotation has a trap: two parts of the app refreshing at the same moment can sign the customer out. The fix belongs in the app, with one refresh in flight at a time. The [invalid_grant post](/blog/keycloak-invalid-grant) shows the failure and the settings involved.

**Guest checkout.** Do not make sign-in a condition of buying. Guest checkout stays in your store, not in Keycloak; offer account creation after the order is placed, when the customer has a reason to want one, and attach the order to the new account.

**Remediation before you need it.** Decide now what you will do when a stuffing run gets through: how you find the accounts where the password worked, how you reset them, and how you revoke their sessions, including the offline sessions a mobile app holds, which an ordinary logout leaves in place.

## When should a store not do this?

If your platform already provides customer accounts you are happy with (a hosted commerce platform's built-in login, for example) and you have one storefront and no app, adding Keycloak is a second system to run for little gain. It earns its place when you have more than one surface to sign into, B2B customers, a mobile app, or a homegrown login you no longer want to own.

## Do this next

Before you migrate anyone, stand up a realm, turn off the password grant, add a CAPTCHA to the browser flow, and try to sign in to it the way an attacker would: post a password to the token endpoint, then post the login form without a CAPTCHA token. If either works, you have found your first go-live item.

If you would rather start from a cluster where those defenses are already layered in, our [managed Keycloak](/hosting/dedicated-clusters/) is SOC 2 Type II and ISO/IEC 27001 certified, with reports at [trust.phasetwo.io](https://trust.phasetwo.io). We also run the [migration to Keycloak](/support/migrate-to-keycloak/) as a service.
