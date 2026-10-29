---
slug: keycloak-slow-user-migration
title: "Keycloak slow migration vs fast migration: moving your users"
date: 2026-10-29
authors: [jpatzer]
tags: [keycloak, migration, users, extensions]
description: Slow (lazy, just-in-time) and fast (bulk) user migration to Keycloak — how each works, which GitHub repo to use for slow migration, how to import password hashes for a fast one, and how to combine them.
keywords:
  - keycloak slow migration
  - keycloak slow migration github
  - keycloak lazy migration
  - keycloak user migration plugin
  - keycloak just in time user migration
  - keycloak-user-migration
  - keycloak fast migration
  - keycloak bulk user import
  - keycloak import password hashes
---

A **slow migration** moves users from a legacy system into Keycloak one at a time, as each of them logs in. It goes by other names too: lazy migration, just-in-time (JIT) migration, trickle migration. Nobody gets a password reset email, there is no cutover weekend, and users who never come back are never migrated.

The other side is a **fast migration**: a bulk import that moves every user into Keycloak at once, before or at cutover. It is quicker to finish and easier to reason about, but it needs something a slow migration doesn't, usually the users' password hashes.

Keycloak doesn't ship slow migration. You add it with a user storage provider, and the one almost everyone uses is open source on GitHub: [daniel-frak/keycloak-user-migration](https://github.com/daniel-frak/keycloak-user-migration). This post covers how slow and fast migrations work, where the code lives, how to choose, and how to combine the two so a slow migration doesn't drag on for months.

| | Slow migration | Fast migration |
|---|---|---|
| When users move | One at a time, at their next login | All at once, at import |
| Password hashes needed | No, the legacy system checks passwords | Yes, or users set a new password |
| Legacy system after cutover | Must stay up and answer the migration endpoints | Can be turned off |
| Dormant users | Never migrated unless you add a final step | Migrated with everyone else |
| Time to finish | Weeks to months, plus a long tail | Hours to days |

<!-- truncate -->

## Not the same as a slow Keycloak upgrade

Searching for "Keycloak slow migration" also turns up a different problem: the **database schema migration** Keycloak runs when you upgrade it, which can take a long time on large realms. That is a version upgrade, not a user migration, and it is out of scope here. If that is what you're dealing with, see [Upgrading](/docs/hosting/upgrading). The rest of this post is about moving *users* from another system into Keycloak.

## How slow migration works

Keycloak's [user storage SPI](https://www.keycloak.org/docs/latest/server_development/index.html#_user-storage-spi) lets Keycloak ask an external system about a user it has never seen. The migration provider turns that into two HTTP endpoints that you add to your legacy system:

1. A user types their username and password into the Keycloak login page.
2. Keycloak doesn't know the user, so the provider calls `GET {your-url}/{username}`. Your legacy system returns the user's profile: email, name, attributes, roles, groups, and optionally TOTP devices and organizations.
3. The provider calls `POST {your-url}/{username}` with `{"password": "..."}`. Your legacy system checks the password against its own hash and returns `200` if it's correct.
4. Keycloak creates the user, hashes the password with its own algorithm (Argon2 by default), and logs them in.
5. On every later login, Keycloak authenticates the user locally. The legacy system isn't called again.

Because your legacy system checks the password, you never need to export password hashes, and you never need Keycloak to understand the old hashing scheme. That is the main reason to choose a slow migration: many identity providers, Okta and Azure AD B2C among them, won't give you the hashes at all.

## The GitHub repos

| Repo | What it is |
|---|---|
| [daniel-frak/keycloak-user-migration](https://github.com/daniel-frak/keycloak-user-migration) | The upstream plugin. Releases are versioned per Keycloak major version (6.x for Keycloak 26). Start here if you self-host. |
| [legacy-system-example](https://github.com/daniel-frak/keycloak-user-migration/tree/master/docker/legacy-system-example) | A sample legacy service in the same repo that implements both endpoints. Useful for seeing the exact request and response shapes. |
| [p2-inc/keycloak-user-migration](https://github.com/p2-inc/keycloak-user-migration) | Phase Two's fork, which we keep in step with upstream. It's installed on every Phase Two cluster, so managed customers don't need to build or deploy anything. |
| [p2-inc/workos-keycloak-migrator](https://github.com/p2-inc/workos-keycloak-migrator) | A worked example of a complete migration off WorkOS, including a bridge that serves the two endpoints. |

To install the upstream plugin on a self-hosted Keycloak, download the release jar that matches your Keycloak major version, put it in the `providers` directory, and run `kc.sh build`. If you run the [Phase Two image](/docs/hosting/), it's already included.

## Running a migration

### 1. Build the two endpoints

The full contract is in the [User Migration API](/docs/user-migration/api) docs. A few things catch people out:

- **The username is percent-encoded in the path.** `frank@example.com` arrives as `frank%40example.com`. Decode it before you look anything up, or every user returns a 404.
- **Any non-`200` from the `GET` means "user not found"**, and any non-`200` from the `POST` means "wrong password". A timeout or a rate limit looks the same as a bad password to the user, so log and alert on your error rate.
- **Secure the endpoints.** They answer the question "is this the password?", so they are as sensitive as your login page. The provider supports bearer tokens and basic auth. Use HTTPS, and restrict access to Keycloak's [egress IP addresses](/docs/self-service/egress-ip-addresses) if you can.

If you are migrating from a hosted IdP rather than your own database, the `POST` usually calls that IdP's password grant or authentication API. Check that the IdP allows server-to-server calls at your login volume first. Our [Azure AD B2C](/blog/migrate-azure-ad-b2c-users-to-keycloak/) post explains why that check fails for B2C, and the [Auth0](/blog/migrate-auth0-to-keycloak/) post shows a bridge that checks exported bcrypt hashes instead.

### 2. Add the provider to your realm

In the admin console, go to **User federation**, choose **User migration using a REST client**, and enter your endpoint's base URL. The options you're most likely to set are:

- **Legacy role conversion** and **Group role conversion**, to map legacy role and group names to Keycloak ones.
- **Update user on login** (`UPDATE_USER_ON_LOGIN`), to refresh the profile from the legacy system while users are still linked to it.
- **Bearer token** or **basic auth** credentials for your endpoints.

The full option list is in the [upstream README](https://github.com/daniel-frak/keycloak-user-migration#optional---additional-configuration).

### 3. Point your applications at Keycloak

Users can only be migrated when they log in through Keycloak, so the migration starts when your applications switch to Keycloak for login. You can move applications one at a time. A user who logs in to the first migrated application is migrated for all of them.

### 4. Watch progress

Compare the number of users in your Keycloak realm with the number of active users in your legacy system. The gap closes quickly at first, as your active users log in, and then flattens out. The flat part is your long tail: dormant accounts and people who log in rarely.

### 5. Finish the migration

There's no need to wait for 100%. Once the curve has flattened, decide what to do with the remainder. Usually that means bulk-importing their profiles and setting the `UPDATE_PASSWORD` required action on each of them, so they choose a new password at their next login, or simply not migrating them.

Before you disable or delete the provider, **unlink its users**. Keycloak won't let a user log in while they're linked to a disabled provider, and deleting a provider deletes the users it imported. Open the provider in **User federation** and choose _Unlink users_ from the _Action_ menu. The details are in [Turning the migration off](/docs/user-migration/#turning-the-migration-off).

## Fast migration: moving everyone at once

A fast migration is a bulk import. You export users from the legacy system, transform them into Keycloak's user format, and import them in one run. There's no bridge to keep running, and from the moment the import finishes every user exists in Keycloak, which matters if you need to assign roles, add users to [organizations](/docs/organizations/), or provision them to other systems before they ever log in.

What decides whether users notice is the password.

### With password hashes

If your legacy system can export password hashes in a format Keycloak can verify, you can import them and users keep their passwords. Keycloak verifies PBKDF2 (`pbkdf2`, `pbkdf2-sha256`, `pbkdf2-sha512`) and Argon2 hashes natively. Each user's credential carries the hash, the salt, and the parameters:

```json
{
  "username": "frank@example.com",
  "email": "frank@example.com",
  "enabled": true,
  "emailVerified": true,
  "credentials": [
    {
      "type": "password",
      "secretData": "{\"value\":\"<base64 hash>\",\"salt\":\"<base64 salt>\"}",
      "credentialData": "{\"hashIterations\":27500,\"algorithm\":\"pbkdf2-sha256\"}"
    }
  ]
}
```

Import users in batches through the admin console's **Partial import** (under **Realm settings** > **Action**) or the `POST /admin/realms/{realm}/partialImport` endpoint. When a user logs in, Keycloak rehashes their password if it was stored with a different algorithm or iteration count than the realm's [password policy](/docs/security/password-policy) asks for (Argon2 by default), so imported hashes are upgraded as users return.

Bcrypt, which many legacy systems and Auth0 use, isn't verified natively. You either add a custom password hash provider for it, which keeps bcrypt in your realm permanently, or validate bcrypt hashes in a slow-migration bridge, as in the [Auth0 migration](/blog/migrate-auth0-to-keycloak/) post.

### Without password hashes

If you can't export hashes (Okta and Azure AD B2C won't give them to you), a fast migration imports profiles only. Users then need a way in without their old password:

- Set the `UPDATE_PASSWORD` required action on each user and send a reset email, so they choose a new password.
- Let them in by [magic link or email code](/docs/authentication/magic-links) instead of a password.
- If they come from enterprise SSO or social login, configure the same [identity providers](/docs/authentication/sso) in Keycloak. They have no password to migrate.

A mass reset email is the cost slow migration exists to avoid. Some users won't open it, and they will reach support instead.

## Combining slow and fast migration

Most real migrations use both, even with the user migration plugin installed. A slow migration on its own has no end date: the legacy system has to keep running until the last dormant user logs in, which might be never. Use a fast step to finish it:

1. **Run the slow migration first.** Turn on the provider, switch your applications to Keycloak, and let your active users move over as they log in. Most of them do so in the first few weeks.
2. **Set a cutover date** once the migrated count has flattened out. Tell users that accounts not used by then will need a new password.
3. **Bulk-import the rest.** Export the users who haven't migrated and import them with a fast migration, using their hashes if you have them, or with `UPDATE_PASSWORD` set if you don't.
4. **Unlink the provider's users** and turn the provider off, as described in [Turning the migration off](/docs/user-migration/#turning-the-migration-off). Then shut down the legacy endpoints.

You can also run it the other way round: bulk-import profiles first, so every user exists in Keycloak with their roles and organizations, and keep the old system as an identity provider for logins until users have set a Keycloak password. Pick whichever order your legacy system makes easiest, but plan the fast step from the start, so that a slow migration has a finish line.

### Choosing

- **You can export hashes Keycloak verifies:** fast migration. It's simpler, and nobody notices.
- **You can't export hashes, but the legacy system can check a password from a server:** slow migration for active users, then a fast import of the tail at cutover.
- **The legacy system can only check passwords on its own login page:** broker it as an [identity provider](/docs/authentication/sso) while you move applications, then bulk-import profiles and have users set a new password.
- **Most users log in through social login or enterprise SSO:** fast import of profiles, and configure the same identity providers in Keycloak.

## On Phase Two

The user migration provider is installed on every Phase Two cluster, so a slow migration only needs the two endpoints and the steps above, and a fast migration is a partial import through the admin console or API. See [User Migration](/docs/user-migration/) to get started, or [contact us](/contact) if you'd like help planning one.
