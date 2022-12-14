---
id: portal-link
title: Portal Link
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

The hosted account management experience can be easily linked to from your application. Branding is automatic using the same variables for customizing the login UI.

### Generating the link

If you are using the Javascript [keycloak-js](https://www.npmjs.com/package/keycloak-js) library, you can direct your user to the hosted account management interface in one of two ways.

```javascript
  // Redirects the user to the Account Management Console.
  keycloak.accountManagement();
  
  // Returns the URL to the Account Management Console.
  //   Options is an Object, where:
  //   - redirectUri - Specifies the uri to redirect to when redirecting back to the application.
  var options = { redirectUri: "https://example.com/someuri" };
  keycloak.createAccountUrl(options);
```

### Listening for changes

Once the user has made changes to their details, they seamlessly return to your application. You can be informed of changes by using [audit webhooks](../audit-logs/webhooks).
