---
id: social-login
title: Social Login
---

Given the use of the default `browser` flow, configured social identity providers will be added to your authentication flow by default.

### Configuring social providers

In the **Identity provders** section, a new social provider can be added with the _Add provider_ button. There are several built-in options you may select from. Many social providers that don't have built-in options can also be configured using standard OpenID Connect v1.0.

Each provider requires you to do some initial setup on the administrative side of your social login provider. These options are usually referred to as "Applications" or "Login with X". When setting up each social provider, the wizards will take you through the information that is required from the social provider, usually some kind of Client ID and Client Secret.

Complete examples of all social providers is currently outside of the scope of this section, but the following example should be instructive.

#### Example: GitHub

Before you begin the GitHub portion of the setup, select _GitHub_ from the _Add provider_ dropdown button, and copy the _Redirect URI_ from the next page.

##### GitHub setup

The **Settings** section of either a personal or organization GitHub account contains a **Developer settings** section. In the **OAuth Apps** part of that section select _New OAuth App_.

Name your application, give it the URL of your choosing, and paste the _Redirect URI_ into the field labeled _Authorization callback URL_.

![Github Add Oauth Application Authorization Callback URL](/docs/auth-social-login-github-newapp.png)

After clicking _Register application_, select the _Generate new client secret_ button.

![Github Generate a New Client Secret](/docs/auth-social-login-github-generate.png)

Copy the new client secret before navigating away, as GitHub will not display it again.

![Github Copy Client Secret](/docs/auth-social-login-github-copy-secret.png)

Finally, go back to the admin UI and paste the Client ID and Client Secret values from GitHub into the fields, and select _Add_ to complete the setup.

![Keycloak Add Github Provider Client Secret](/docs/auth-social-login-github-client.png)

### Login UI

After setting up one or more social identity providers as above, go back and reload your login screen. You will see that the social logins are automatically displayed as alternative authentication mechanism.

![Keycloak Auth Social Login](/docs/auth-social-login-login.png)

If you wish to temporarily disable a social provider, you can go into the identity provider configuration and either set _Enabled_ to **OFF** or set _Hide on login page_ to **ON**.

### Using tokens from social providers

In some cases, it is desirable to store the tokens granted to your user so that they can be used for other purposes, such as calling social APIs. Extending the GitHub example above, you may wish to offer your users the ability to manage their GitHub repositories from your application.

There are two fields in the identity provider configuration that may be set to facilitate this use case.

- _Scopes_ A space-separated list of scopes that are sent when asking for authorization. It usually defaults to only `openid`, which causes the minimum data to be shared when These will be dictated by the social provider. In the GitHub example, you may also want to include `repo`, as a granted token with that scope will be authorized to manage the user's repositories.
- _Store tokens_ Enables token storage following authentication.

Once you have set these values, then the token will be available for retrieval. More documentation on using external identity provider tokens can be found in the Keycloak documentation on [retrieving external IDP tokens](https://www.keycloak.org/docs/latest/server_admin/#retrieving-external-idp-tokens).
