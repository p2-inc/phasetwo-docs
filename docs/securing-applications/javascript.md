---
id: javascript
title: Javascript
---

Most modern applications are being built as single-page apps. The easiest way to secure these is with the Javascript [keycloak-js](https://www.npmjs.com/package/keycloak-js) library. If you are using a package manager like NPM, you can use it from there. If you are importing it direclty, the library is served by the server at https://app.phasetwo.io/auth/js/keycloak.js

### Example

You must replace the `<corp-realm>` value with the account name.

```html
<html>
  <head>
    <script src="https://app.phasetwo.io/auth/js/keycloak.js"></script>
    <script>
      var auth = new Keycloak({
      url: 'https://app.phasetwo.io/auth',
        realm: '<corp-realm>',
	    clientId: sample-app'
      });
      auth.init().then(function(authenticated) {
        alert(authenticated ? 'authenticated' : 'not authenticated');
      }).catch(function() {
        alert('failed to initialize');
      });
    </script>
  </head>
  <body>
    <div id="message"></div>
  </body>
</html>
```

A complete specification of what is available in the keycloak-js library is available in their official documentation https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter

