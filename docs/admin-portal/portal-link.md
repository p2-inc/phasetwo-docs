---
id: portal-link
title: Portal Link
---

The hosted account management experience can be easily linked to from your application. Branding is automatic, using the same settings you use to customize the login UI.

### Generating the link

The link is a simple template, similar to the Keycloak Account Console:

```
https://<your-cluster-host>/auth/realms/<realm>/portal/
```

`<your-cluster-host>` is your cluster's hostname from the [Dashboard](https://dash.phasetwo.io/), or a [custom domain](/docs/self-service/custom-domains) attached to it. For example, with a custom domain of `auth.example.com` and a realm named `foobar`:

```
https://auth.example.com/auth/realms/foobar/portal/
```
