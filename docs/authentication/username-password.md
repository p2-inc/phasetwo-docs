---
id: username-password
title: Username-Password
---

Username-password authentication is part of the default `browser` flow. If you select this flow from the **Flows** tab, you will see the steps that make up the flow.

### Steps

The first step, called *Cookie* redirects already authenticated and active users back to the application, not requiring a login challenge.

*Kerberos*, disabled by default, can be ignored for now.

The next step, *Identity Provider Redirector* is used in the case where your application code sends the user to login with a `kc_idp_hint` parameter set. This would be used in the case where you are storing the association between a user and their identity provider outside of Keycloak, and you wish to automatically redirect the user to that IdP.

The *forms* section of the steps contains a form for input of the username and password, and conditional logic to determine if the user has an OTP method configured.

![](/docs/auth-username-password-flow.png)

### Login UI

When testing the default authentication flow, you will be presented with a simple form. Note that the appearance of *Remember me* and *Forgot password* elements are conditional on how you have set up your Realm. Additionaly, you may have already customized your login style, which may lead to different styling.

![](/docs/auth-username-password-login.png)
