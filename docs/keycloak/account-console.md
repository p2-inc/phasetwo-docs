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

## Recommended combinations

Choose the combination that matches your intent:

- **Hide the Keycloak UI only**: use the deny flow on `account-console`
- **Prevent UI and API-based account management**: use the deny flow and remove `account` roles
- **Allow limited self-service**: keep the Account Console disabled and expose only the capabilities you want through the [Admin Portal](../admin-portal/index.md)

## If you still need self-service

If the requirement is not "no self-service at all" but rather "no direct Keycloak UI," the better pattern is often to disable the Account Console and use a more controlled experience.

Phase Two's [Admin Portal](../admin-portal/index.md) lets you expose selected profile and security functions with role-based visibility. For example, you can control whether users can view profile details, update passwords, manage two-factor authentication, or manage linked identities. See [Access Control](../admin-portal/access-control.md).

## Summary

To block end users from managing themselves through Keycloak directly:

- put a **Deny access** flow on the `account-console` client
- remove default `account` client roles like `manage-account`

That combination blocks the built-in UI and reduces or removes authorization to the underlying account-management endpoints as well.
