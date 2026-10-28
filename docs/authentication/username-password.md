---
id: username-password
title: Username-Password
---

Username-password authentication is part of the default `browser` flow. If you select this flow from the **Flows** tab, you will see the steps that make up the flow.

### Steps

The first step, _Cookie_, sends users who already have an active session back to the application without a login challenge.

_Kerberos_ is disabled by default and can be ignored unless you use Kerberos.

_Identity Provider Redirector_ is used when your application sends the user to log in with the `kc_idp_hint` parameter. Use it when you store the association between a user and their identity provider outside of Keycloak, and want to send the user straight to that identity provider.

Realms created on recent Keycloak versions may also have an _Organization_ sub-flow at this point. It belongs to Keycloak's built-in Organizations feature and has no effect unless that feature is turned on for the realm. Phase Two's own [Organizations](/docs/organizations/) extension uses [its own discovery steps](/docs/organizations/automatic-idp-redirection) instead.

The _forms_ sub-flow contains the _Username Password Form_, followed by the _Browser - Conditional 2FA_ sub-flow, which asks for a second factor, such as an OTP code, from users who have one set up.

![Keycloak Authentication Browser Flow Username Password](/docs/auth-username-password-flow.png)

### Login UI

When testing the default authentication flow, you will be presented with a simple form. Note that the appearance of _Remember me_ and _Forgot password_ elements are conditional on how you have set up your Realm. Additionally, you may have already customized your login style, which may lead to different styling.

![Keycloak Authentication Browser Flow Username Password Login](/docs/auth-username-password-login.png)
