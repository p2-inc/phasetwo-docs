---
id: sso-without-auth
title: SSO Without Auth
---

Many Phase Two customers use their own authentication and user management systems, and only rely on Phase Two for its comprehensive SSO support. It is not required to use both in order to get the full power of our SSO integrations and customer self-management portal.

In order to set up Phase Two for SSO only, there are a few steps you must take.

1. When you are setting up your customer IdP, make a note of the alias you use. It is required to make it unique, and it is also recommended to make it something that is memorable and easy to associate with the customer. For example, `acme-corp-saml`.
2. In the "Authentication" section of the Admin UI, uner the "Bindings" tab, select "SSO only" for the "Browser Flow" and save.
3. Import the [keycloak-js](https://www.npmjs.com/package/keycloak-js) Javascript library into your code, and initialze as documented in the [Securing Applications](../securing-applications/javascript) section.
```javascript
  var keycloak = new Keycloak();
  keycloak.init().then(function(authenticated) {
    console.log(authenticated ? 'authenticated' : 'not authenticated');
  }).catch(function() {
    console.log('failed to initialize');
  });
```
4. When you want to send the user to their SSO provider, set the `idpHint` parameter to the alias you used in Step 1. Refer to the documentation on [options](https://www.keycloak.org/docs/latest/securing_apps/#login-options) to control other features. Note that if you do not specify an `idpHint` parameter in the options variable, the login flow will automatically fall back to using the email domain rules you have specified to help the user find their SSO IdP using their email address.
```javascript
  // call the login function with the following options in order to initiate the SSO login flow
  var options = { prompt: "login", idpHint: "acme-corp-saml" };
  keycloak.login(options);
```
5. Once the user has complete the SSO login flow, the keycloak-js library will handle processing the secure token flow with Phase Two, and will then redirect the user to the page where you initiated the login flow (or where you directed it to based on the `redirectUri` value in the options variable). In order to capture the information received from the user IdP, you must register the `onAuthSuccess` callback function. It is also good practice to register `onAuthError` to catch problems with the user SSO authentication process.
```javascript
  keycloak.onAuthSuccess = function () {
    token = keycloak.tokenParsed;
    // do something with the result
    console.log("Email", token['email']);
    console.log("First Name", token['given_name']);
    console.log("Last Name", token['family_name']);
  };
  keycloak.onAuthError = function(errorData) {
    // do something with the error
    console.log("Error", errorData.error);
    console.log("Description", errorData.error_description);
  };
```

Note that this is very similar to the normal login process when you are using Phase Two as the primary source of user authentication. However, the significant difference is that the keycloak-js adapter is not initialized in a way that requires login (thus making the page inaccessible).
	

