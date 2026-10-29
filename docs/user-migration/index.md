---
id: index
title: User Migration
description: Slow (lazy, just-in-time) user migration to Keycloak with the keycloak-user-migration plugin — users move from your legacy system as they log in, with no password reset.
---

If you have a legacy user database, you can migrate its users to Phase Two as they log in, without a bulk export of password hashes. This is often called a slow, lazy, or just-in-time migration. For a walkthrough of planning and finishing one, see [Keycloak slow migration](/blog/keycloak-slow-user-migration/). We include the [Keycloak user migration extension](https://github.com/daniel-frak/keycloak-user-migration) on every cluster (our fork is at [p2-inc/keycloak-user-migration](https://github.com/p2-inc/keycloak-user-migration)).

To migrate users with this extension, you implement a small web service that looks up users and validates their passwords in your legacy system. The API it must implement is documented in the next section, [User Migration API](api). There is an example implementation in Java on GitHub: [legacy-system-example](https://github.com/daniel-frak/keycloak-user-migration/tree/master/docker/legacy-system-example).

Add the migration in the **User federation** section of the admin console. Select the **User migration using a REST client** provider and configure your endpoint.

### Fast migration

The extension migrates users as they log in, which is often called a slow migration. If you want every user in Keycloak at once instead, use a fast migration: a bulk import of your users through **Realm settings** > **Action** > **Partial import**, or the `POST /admin/realms/{realm}/partialImport` endpoint. If your legacy system can export PBKDF2 or Argon2 password hashes, include them and users keep their passwords. Otherwise, set the `UPDATE_PASSWORD` required action so users choose a new one.

You can combine the two: run the slow migration until most active users have moved, then bulk-import the users who are left and turn the migration off. The [Keycloak slow migration vs fast migration](/blog/keycloak-slow-user-migration/) post covers both approaches and how to choose. Please [contact support](/contact) if you'd like help planning a migration.

### Turning the migration off

Each migrated user stays linked to the migration provider until the user logs in with a password, which moves their credential into Keycloak and removes the link. Users who only ever log in through an identity provider, such as social login or enterprise SSO, keep the link.

Keycloak won't let a user log in while they are linked to a disabled provider, and deleting a provider deletes the users it imported. Before you disable or delete the migration provider, unlink its users: open the provider in **User federation** and choose _Unlink users_ from the _Action_ menu, or call the admin API's `POST /admin/realms/<realm>/user-storage/<provider-id>/unlink-users` endpoint.
