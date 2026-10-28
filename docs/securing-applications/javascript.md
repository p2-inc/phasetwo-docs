---
id: javascript
title: JavaScript
---

Most modern applications are built as single-page apps. A straightforward way to secure one is the [keycloak-js](https://www.npmjs.com/package/keycloak-js) library. Install it from npm:

```bash
npm install keycloak-js
```

Keycloak no longer serves the adapter from the server (the old `/auth/js/keycloak.js` path was removed in Keycloak 26), so load it from npm or bundle it with your app. Use a version of keycloak-js that is the same as or newer than your cluster's Keycloak version.

### Client setup

Create a client for your app in the admin console with _Client authentication_ off and _Standard flow_ on, and add your app's URL to _Valid redirect URIs_ and _Web origins_. See [Sample Application](/docs/getting-started/sample#client-setup) for the steps.

### Example

Replace `<your-cluster-host>`, `<realm>` and `<client-id>` with the values for your cluster.

```javascript
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://<your-cluster-host>/auth",
  realm: "<realm>",
  clientId: "<client-id>",
});

try {
  const authenticated = await keycloak.init({
    onLoad: "login-required",
    pkceMethod: "S256",
  });
  console.log(authenticated ? "authenticated" : "not authenticated");
  console.log("Access token", keycloak.token);
} catch (error) {
  console.error("Failed to initialize", error);
}
```

`<your-cluster-host>` is your cluster's hostname from the [Dashboard](https://dash.phasetwo.io/), or a [custom domain](/docs/self-service/custom-domains) attached to it.

The complete keycloak-js reference is in the Keycloak [JavaScript adapter](https://www.keycloak.org/securing-apps/javascript-adapter) guide. For framework-specific setups, such as React, Vue and Angular, see the other pages in this section and the [p2-inc/examples](https://github.com/p2-inc/examples) repository.
