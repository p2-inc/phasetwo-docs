---
id: portal-link
title: Portal Link
---

The hosted account management experience can be easily linked to from your application. Branding is automatic using the same variables for customizing the login UI.

### Generating the link

The link is a simple template, similar to the Keycloak Account Management Console.
```
  https://{host}/auth/realms/{realm}/portal/
```

For example:
```
  https://usw2.auth.ac/auth/realms/foobar/portal/
```
