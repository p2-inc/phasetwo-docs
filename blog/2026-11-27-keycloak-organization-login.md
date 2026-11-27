---
title: "Keycloak organization login vs Auth0 and WorkOS"
slug: keycloak-organization-login
date: 2026-11-27
authors: [rtufisi]
tags: [keycloak, organizations, multi-tenancy, sso, authentication, auth0, workos]
description: Can Keycloak organization login replace Auth0 Organizations or WorkOS? The B2B login cases it solves, how each one maps, and where it still falls short.
keywords:
  - keycloak organization login
  - keycloak tenant aware login
  - auth0 organizations alternative
  - workos alternative keycloak
  - keycloak multi-tenant login
---

Keycloak organization login can replace the tenant-aware login that Auth0 Organizations, WorkOS and Microsoft Entra ID sell to B2B SaaS teams. With the open-source Phase Two [Keycloak organizations](/extensions/organizations/) extension, one realm can send each customer's employees to their own company SSO, keep non-members out of a customer's tenant, let people who work for several customers choose one, and tell your application which customer the user is signed in to.

Below are the login situations B2B products run into, what the hosted vendors call each one, how Keycloak handles it, and when Keycloak is the wrong choice. Every case was run on Keycloak 26.8.2 with keycloak-orgs 0.200 and keycloak-magic-link 0.95, and the screenshots come from that run.

<!-- truncate -->

## What is tenant-aware login?

Tenant-aware login means the identity provider knows which customer organization a user is signing in to, not only who the user is. It sends them to that organization's sign-in method, refuses them if they are not a member, and puts the organization in the token so the application never has to guess. In Keycloak, organizations come from the Phase Two extension and the decision is made by its **Select Organization** step in the login flow.

## Which login cases does it solve?

| Situation | What Auth0 / WorkOS call it | What Keycloak uses |
|---|---|---|
| Employees of a customer must use their company's SSO | Home realm discovery, domain discovery | Home IdP Discovery by the organization's email domain |
| Only members of a customer may enter its tenant | Business-user applications, membership required | Select Organization rejects non-members |
| A user works for several customers | Organization picker | Organization picker after sign-in |
| The app already knows the tenant (deep link, subdomain) | `organization` parameter | `account_hint` |
| Switching customer without signing out | New `/authorize`, or refresh-token switch | `account_hint` on an existing session, or the switch API |
| Invited users who sign in with Google or Apple | Invitations | Invitations, auto-join on first sign-in |
| Customers with no SSO and no passwords | Magic link / passwordless | Magic link, email OTP, passkeys |
| Extra rules for some customers only | Actions, per-org policy | Conditions on organization attributes |

### Your customer wants their employees on their own SSO

The most common enterprise request: "our people sign in with Okta, not with a password in your app." The user types their work email, Keycloak matches the domain to the customer's organization, and redirects to that organization's [Keycloak identity provider](/docs/keycloak/idp/). After the first sign-in, the user is added to the organization automatically, so the customer's IT team never has to provision anyone by hand.

![Identity-first sign-in page with a Google button](/blog/keycloak-organization-login/identity-first-login.png)

Customers can set up their own SAML or OIDC connection through the IdP wizard, with no charge per connection. [Automatic IdP redirection](/docs/organizations/automatic-idp-redirection/) covers the setup.

### Only members may enter a customer's tenant

A contractor who left one of your customers should not be able to sign in to that customer's tenant, even with a valid account elsewhere in your product. Select Organization checks membership at sign-in. A user who asks for an organization they do not belong to gets an error page instead of a token, and a user with no organization at all can be refused the same way.

![Invalid Organization error for a non-member](/blog/keycloak-organization-login/not-a-member.png)

It needs the most care, because the check is part of a flow you build rather than a switch you turn on. More on that below.

### One person, several customers

Agencies, consultants, managed service providers and your own support staff often belong to several customer organizations. After they sign in, Keycloak shows them the list of organizations they belong to and asks which one to use. There is no limit on the list; Auth0's picker shows the [first 20 organizations](https://auth0.com/docs/manage-users/organizations/login-flows-for-organizations).

If they belong to exactly one, the picker is skipped. If the application asks with `prompt=select_account`, the standard OpenID Connect value, the picker is shown even to users who are already signed in, without asking for their password again.

![Organization picker listing acme and globex](/blog/keycloak-organization-login/organization-picker.png)

### Your app already knows the customer

When the user arrives from `globex.app.example.com` or from a link inside a customer's workspace, asking them to pick is friction. The application passes `account_hint=globex` (by organization id, or by name if you enable that) and Keycloak skips the picker, checks membership and signs the user in to that organization.

### Switching customer without signing out

Support engineers move between customers all day. With an existing session, a new sign-in request with a different `account_hint` switches the organization without a password prompt. From inside the application, the [switch active organization](/api/switch-active-organization/) endpoint does the same and returns new tokens. WorkOS does this with a [refresh-token exchange](https://workos.com/changelog/organization-switching-apis); Auth0 with a new `/authorize` request.

### Invited users who prefer Google or Apple

Smaller customers often invite people who use Google rather than a company SSO. The invitation records the organization and the roles. When the invited person signs in with Google or Apple for the first time, the invitation is applied and they land in the right organization with the right roles. People who were never invited stay out.

![Error for an uninvited Google user](/blog/keycloak-organization-login/uninvited-social-user.png)

### Customers with no SSO who do not want passwords

Many B2B customers are small, with no identity provider and no appetite for another password. Magic links, email one-time codes and passkeys give them passwordless sign-in that is still tied to the organization. The organization check runs either before the magic link is sent, so a non-member never receives one, or right after the user proves who they are. See [magic links](/docs/authentication/magic-links/).

![Magic link sent page for a shop member](/blog/keycloak-organization-login/magic-link-sent.png)

### Some customers need stricter rules

Your bank customer requires MFA; your design-agency customer does not. A condition on an organization attribute runs an extra step, such as MFA or accepting terms, only for organizations that carry that attribute. The same idea pins a white-label application to its own customer: compare an attribute on the organization with one on the application, and refuse anyone from another tenant. In Auth0 this is an Action you write in code.

## What does your application get back?

The token carries the active organization: its id, its name, the user's roles **in that organization**, and the organization's attributes, configured per client scope. Your API reads one claim to know which customer's data the request is for. The same organization roles reach SAML applications through a mapper.

![active_organization claim with role, id and attributes](/blog/keycloak-organization-login/active-organization-claim.png)

## What do you have to get right?

The hosted vendors enforce the tenant for you once an application is configured for it. In Keycloak you get the pieces and assemble the flow, so the check exists only where you put it. Three rules cover most of it:

1. **Check federated users after they come back from their identity provider**, in the identity provider's post-broker flow. A check placed after the redirect in the browser flow never runs for them: in our test, a user with no organization signed in through an identity provider and got a token anyway.
2. **Choose when to check passwordless users.** Checking before the magic link is sent means non-members never get an email. But that check runs on a typed address, so its answer can tell a stranger which accounts exist. If that matters more, check right after an email code or passkey instead.
3. **Have your API verify the organization claim.** Reject tokens whose organization is missing or does not match the customer whose data is being requested. The application decides whether to ask for a specific organization, so the API is the last line.

The [Select Organization docs](/docs/organizations/active-organization-authenticator/) cover the configuration.

## Does it hold up in a real run?

We built one realm with three customer organizations, a test identity provider standing in for a company SSO and for Google, and a mail catcher, then signed in through a real browser for each case.

| Case | Result |
|---|---|
| Work email on the customer's domain | Sent to the customer's SSO, joined the organization on first sign-in |
| Member of another customer asks for Acme | Refused with "Invalid Organization." |
| User in two customers | Picker listed both; the token carried the chosen one, with that organization's role and attributes |
| `account_hint` from the app | Picker skipped, signed in to the named organization |
| Switch on an existing session, and through the API | Both switched organizations with no password prompt |
| Invited user signs in with Google | Joined the inviting organization |
| Uninvited user signs in with Google | Refused |
| Magic link, member | Email sent; the link signed them in to their organization |
| Magic link, non-member | Refused, and no email sent |
| No `prompt` or `account_hint`, user with no organization | Signed in, with no organization in the token: the check is opt-in outside identity-provider logins |

Not covered in this run: per-organization MFA and pinning an application to one customer.

## Can an AI coding agent set this up for you?

Yes. The open-source [Phase Two Keycloak skills](https://github.com/p2-inc/keycloak-skills) for Claude Code, Cursor and Codex include an intent for each organization-aware login case. Ask the agent in plain words, such as "only members of Acme can sign in" or "send acme.com users to their Okta". It builds the flow, binds it, and checks the result against your Keycloak.

| Case | Skill intent |
|---|---|
| Employees use their company's SSO, routed by email domain | [`admin:corporate-sso`](https://github.com/p2-inc/keycloak-skills/blob/main/plugins/phasetwo/skills/keycloak/references/admin-corporate-sso.md) |
| Only members of an organization may sign in with a password | [`admin:org-restrict-login`](https://github.com/p2-inc/keycloak-skills/blob/main/plugins/phasetwo/skills/keycloak/references/admin-org-restrict-login.md) |
| Only members may sign in through an identity provider | [`admin:idp-org-restrict-login`](https://github.com/p2-inc/keycloak-skills/blob/main/plugins/phasetwo/skills/keycloak/references/admin-idp-org-restrict-login.md) |
| Passwordless magic link for members only | [`admin:passwordless-magic-link-org-restrict`](https://github.com/p2-inc/keycloak-skills/blob/main/plugins/phasetwo/skills/keycloak/references/admin-passwordless-magic-link-org-restrict.md) |

Each intent comes in two variants: one that uses Keycloak's Admin REST API directly, and one that uses the Phase Two MCP server. The [launch post](/blog/keycloak-skills-mcp-launch/) covers installation.

## When should you not use this?

- **Users who work in two customers at once, side by side.** The active organization is stored on the user, not the session. Two tabs or two devices in different organizations share it, and the most recent choice wins at the next token refresh. WorkOS, Clerk and Descope keep it per session. If your users routinely keep two tenants open, this will hurt.
- **You want the tenant enforced without building a flow.** If nobody on the team will own the login flows and review them like code, a hosted product that enforces membership by configuration is safer.
- **You want drop-in UI components.** There is no ready-made organization switcher component or SDK hook. You build the switcher against the API.
- **You resolve tenants from subdomains inside the identity provider.** Today your application turns `acme.app.example.com` into an `account_hint`; there is an [open issue](https://github.com/p2-inc/keycloak-orgs/issues/439) to do it in Keycloak.

## Should you switch?

| If you need | Keycloak + Phase Two |
|---|---|
| Company SSO per customer, self-service setup, no per-connection fees | Strong fit |
| Members-only tenants, multi-customer users, deep links, switching | Strong fit, with the flow rules above |
| Passwordless tenant login for small customers | Strong fit |
| Per-customer policies without writing code | Strong fit |
| Per-tab or per-device tenants, ready-made UI components | Not yet |

The [multi-tenancy tutorial](/tutorials/authorization/multi-tenancy/) helps decide whether organizations are the right model at all. If you are moving from a hosted vendor, the migration guides for [WorkOS](/blog/workos-keycloak-migration/) and [Auth0](/blog/migrate-auth0-to-keycloak/) cover users, organizations and connections.

The organizations extension is open source at [p2-inc/keycloak-orgs](https://github.com/p2-inc/keycloak-orgs). Every Phase Two [managed Keycloak](/hosting/dedicated-clusters/) cluster ships with it installed.
