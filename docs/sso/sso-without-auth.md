---
id: sso-without-auth
title: SSO Without Auth
---

Many Phase Two customers use their own authentication and user management systems, and rely on Phase Two only for its SSO support. You don't have to use both to get the full power of our SSO integrations and the customer self-management portal.

### Authentication flow setup

To use Phase Two for SSO only, the browser flow should never ask for a password. It should send users either to the identity provider your application names, or to the one that matches their email domain.

1. When you set up your customer's identity provider, note the alias you use. It must be unique, and we recommend making it easy to associate with the customer, for example `acme-corp-saml`.
2. In the **Authentication** section of the admin console, duplicate the `browser` flow and name it, for example, `sso only`.
3. In the new flow, keep the _Cookie_ and _Identity Provider Redirector_ steps. The redirector sends users straight to the identity provider named in the login request.
4. In the forms sub-flow, delete the _Username Password Form_ and the conditional 2FA sub-flow, and add the _Username Auth Note Form_ followed by the _Home IdP Discovery_ step, both _Required_. This is the fallback for logins that don't name an identity provider: users enter their email and are redirected to their organization's identity provider by email domain. See [Automatic IdP Redirection](../organizations/automatic-idp-redirection.md#setting-up-an-authentication-flow-for-automatic-idp-redirection) for this part of the flow in detail.
5. In the _Action_ menu, select _Bind flow_ and bind the new flow to the _Browser flow_.

### Add identity provider redirect to your application

1. Add the [keycloak-js](https://www.npmjs.com/package/keycloak-js) library to your application and initialize it, as described in the [JavaScript](../securing-applications/javascript.md) section. Don't use `onLoad: "login-required"`, because your application, not Keycloak, decides when a user needs to sign in.

```javascript
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "https://<your-cluster-host>/auth",
  realm: "<realm>",
  clientId: "<client-id>",
});

keycloak
  .init({ pkceMethod: "S256" })
  .then((authenticated) => {
    console.log(authenticated ? "authenticated" : "not authenticated");
  })
  .catch(() => {
    console.log("failed to initialize");
  });
```

2. When you want to send the user to their SSO provider, set the `idpHint` option to the alias from Step 1. See the keycloak-js [login options](https://www.keycloak.org/securing-apps/javascript-adapter) for the other options. If you leave out `idpHint`, the flow falls back to asking for the user's email and matching it against your organizations' email domains.

```javascript
// start the SSO login for this user's identity provider
keycloak.login({ prompt: "login", idpHint: "acme-corp-saml" });
```

3. After the user completes the SSO login, keycloak-js completes the token exchange with Phase Two and returns the user to the page where you started the login, or to the `redirectUri` you passed in the options. Register the `onAuthSuccess` callback to read the information received from the user's identity provider, and `onAuthError` to catch problems with the SSO login.

```javascript
keycloak.onAuthSuccess = () => {
  const token = keycloak.tokenParsed;
  // do something with the result
  console.log("Email", token["email"]);
  console.log("First Name", token["given_name"]);
  console.log("Last Name", token["family_name"]);
};
keycloak.onAuthError = (errorData) => {
  // do something with the error
  console.log("Error", errorData.error);
  console.log("Description", errorData.error_description);
};
```

This is very similar to the normal login process when Phase Two is the primary source of user authentication. The significant difference is that keycloak-js is not initialized in a way that requires login, so your pages stay accessible, and it is your responsibility to store the association between your users and their identity provider alias.
