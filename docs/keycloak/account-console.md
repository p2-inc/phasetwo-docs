---
id: account-console
title: Keycloak Account Console
sidebar_label: Account Console
---

Keycloak includes a built-in **Account Console** for end users. It is typically available at:

- `/realms/{realm}/account/`

Depending on your deployment and version, you may also see older paths that include `/auth/`.

The Account Console allows users to manage parts of their own profile, credentials, sessions, and linked accounts. In many CIAM use cases this is helpful. In others, especially when you want customers to manage users only through your application or a curated admin experience, you may want to disable it.

## When to disable the Account Console

Disabling the Account Console is a common requirement when:

- customers should not manage users through Keycloak UI
- your product provides its own user profile and credential management flows
- you want to prevent direct use of Keycloak's `/account` user-management endpoints
- you want all customer self-service to happen through a more limited interface such as the [Admin Portal](../admin-portal/index.md)

## Customizing the Account Console UI

If you do want to keep the Account Console available, you may still want to customize its user experience and branding.

This is an important distinction in Keycloak:

- the **login theme** controls login, registration, and related authentication pages
- the **account theme** controls the user-facing Account Console

Customizing one does not automatically customize the other.

If you are using the Phase Two `phasetwo-ui` theme, selecting it as the **Account** theme in **Realm Settings > Themes** applies consistent branding (colors, logo, fonts) to the Account Console automatically. No additional configuration is required beyond the settings in **Extensions > Styles**.

For teams using [Keycloakify](https://docs.keycloakify.dev/theme-types/account-theme), the Account Console can be customized with a dedicated **account theme**. Keycloakify supports two main account-theme models:

- **Single-page account theme**: based on the newer Account Console experience, best when you want the latest account-console capabilities and are comfortable customizing React-based components
- **Multi-page account theme**: closer to the traditional theme model, better when you want simpler template and CSS customization with a structure more like the login theme

Keycloakify also makes an important architectural point: you may not need a full account theme at all if your goal is only to let users do a few focused tasks such as:

- updating profile details
- changing a password
- registering or managing MFA methods
- deleting their own account

In those cases, many teams choose to expose only the specific flows they need in their application or in a curated self-service experience, instead of giving users the full Keycloak Account Console.

If your goal is:

- **full self-service, but with your branding**: customize the Account Console theme
- **limited self-service only**: disable the Account Console and expose only selected actions through your app or the [Admin Portal](../admin-portal/index.md)
- **no self-service through Keycloak UI at all**: disable the Account Console as described below

For implementation details and theme tradeoffs, see the Keycloakify documentation on the [Account Theme](https://docs.keycloakify.dev/theme-types/account-theme).

## `account` and `account-console` are different clients

Two built-in clients are involved, and they need different treatment:

- **`account-console`** is the public client behind the Account Console UI. It has its own login page, which uses the realm's browser flow. If your users have no reason to use it, it is one more login page for automated attacks to use against their accounts.
- **`account`** is not a login surface. It holds the `manage-account`, `manage-account-links` and `view-profile` roles and is the audience the Account REST API at `/realms/{realm}/account/` checks for.

**Keep `account` enabled.** Disabling it does shut the Account REST API off (every call returns `404 {"error":"account management not enabled"}`), but other parts of Keycloak expect it. When an admin sends an _execute actions_ or _verify email_ message without naming a client, Keycloak 26 finds `account` unavailable and creates a confidential `_system` client to issue the link instead, logging `Client 'account' not available. Creating system client '_system' for system operations`. The next security review then finds a client nobody created. Removing the roles, described below, closes the API without that side effect.

## Best practice: block the UI and remove account-management permissions

If your goal is to fully prevent end users from using Keycloak's account management experience, the strongest approach is to do both:

1. **Block access to the Account Console UI**
2. **Remove the account client roles that allow account-management API calls**

Using only one of these controls is usually not enough.

## Option 1: Block the Account Console UI

The Account Console is backed by the `account-console` client. A simple way to block interactive access is to assign a dedicated authentication flow that always denies access.

### Create a deny flow

1. Go to **Authentication**.
2. Create a new flow, for example `Deny all`.
3. Add a single execution: **Deny access**.
4. Mark that execution as **Required**.

### Assign it to the `account-console` client

1. Go to **Clients**.
2. Open the `account-console` client.
3. Go to **Advanced**.
4. Find **Authentication flow overrides**.
5. Assign your deny flow as the browser flow override for this client.

After that, direct access to the Account Console UI will return an access denied experience instead of loading the self-service pages.

This is the best control when your primary goal is: "No customer should manage users via the Keycloak UI."

A simpler alternative is to turn the `account-console` client's **Enabled** switch off, after which its login redirect shows Keycloak's _Client disabled_ page. Either way, disable `account-console`, not `account`.

## Option 2: Remove account-management roles

Blocking the UI does not by itself remove the permissions that back account-management operations. If you also want to prevent users from making authorized calls to the account endpoints, remove the default `account` client roles that grant those capabilities.

The most important roles are:

- `manage-account`
- `manage-account-links`
- `view-profile`

### What these roles do

- `manage-account` allows profile and credential changes
- `manage-account-links` allows management of linked or brokered logins
- `view-profile` allows profile visibility in account-management experiences

### Where to change them

In the Admin UI, review the realm's **Default roles** and any user or group role mappings that grant `account` client roles by default. If these roles are assigned automatically to new users, remove them there.

If users or groups already have them directly, you should remove those mappings as well.

### What changes as you remove them

These results come from removing the roles from `default-roles-{realm}` and calling the Account REST API with a fresh token, in Keycloak 26.8.1:

| Default roles include | Read profile (`GET /realms/{realm}/account/`) | Update profile (`POST`) |
|---|---|---|
| `manage-account` and `view-profile` (the default) | `200` | `204` |
| `view-profile` only | `200` | `403` |
| Neither | `401`, because the token no longer has the `account` audience | `401` |

Tokens issued before the change keep their roles until they expire, so expect the old behavior for up to one access token lifespan.

## Recommended combinations

Choose the combination that matches your intent:

- **Hide the Keycloak UI only**: use the deny flow on `account-console`
- **Prevent UI and API-based account management**: use the deny flow and remove `account` roles
- **Allow limited self-service**: keep the Account Console disabled and expose only the capabilities you want through the [Admin Portal](../admin-portal/index.md)

## If you still need self-service

If the requirement is not "no self-service at all" but rather "no direct Keycloak UI," the better pattern is often to disable the Account Console and use a more controlled experience.

Phase Two's [Admin Portal](../admin-portal/index.md) lets you expose selected profile and security functions with role-based visibility. For example, you can control whether users can view profile details, update passwords, manage two-factor authentication, or manage linked identities. See [Access Control](../admin-portal/access-control.md).

If you keep any self-service, through the Account Console or your own application, the remaining risk is a hijacked session being used to change the account's credentials or email address. Reduce it by:

- **requiring re-authentication for credential changes**, by starting them as an application-initiated action with `kc_action` and a low `max_age`, so the user must sign in again immediately before the change
- **keeping SSO Session Idle short**, so an abandoned session cannot be picked up later. See [Tokens and Sessions](../security/tokens-and-sessions.md)
- **requiring the current password** when a user changes their password

## Summary

To block end users from managing themselves through Keycloak directly:

- put a **Deny access** flow on the `account-console` client, or disable it
- remove default `account` client roles like `manage-account`
- keep the `account` client itself enabled

That combination blocks the built-in UI and reduces or removes authorization to the underlying account-management endpoints as well.
