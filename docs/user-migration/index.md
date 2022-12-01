---
id: index
title: User Migration
---

Customers who have legacy user databases they wish to import can use this feature as part of initial or ongoing migration to Phase Two. We use a variant of this [Keycloak user migration extension](https://github.com/daniel-frak/keycloak-user-migration).

In order to migrate your users with this extension, you must implement a web service so that we can securely validate the users and receive their information. The API to be implemented is documented in the next section [User Migration API](api). There is an example implementation in Java on Github [legacy-system-example](https://github.com/daniel-frak/keycloak-user-migration/tree/master/docker/legacy-system-example).

You can add a legacy migration in the **User federation** section of the Admin UI. Select the **User migration using a REST client** provider and configure your endpoints. 
