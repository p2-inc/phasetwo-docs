---
id: magic-links
title: Magic Links
---

Magic links are a type of password-less authentication that let your users log in by following a link that is emailed to them, rather than typing a username and password. We wrote a blog post with more details and the advantages and disadvantages in the [Magic Links Guide](/blog/set-up-magic-links).

Email must be configured before setting up magic links. See the [email setup guide](/docs/getting-started/email#server-configuration) if you haven't already done that.

Magic links are provided by the open source [keycloak-magic-link](https://github.com/p2-inc/keycloak-magic-link) extension, which is included on every Phase Two cluster. It provides three authenticators you can use in a browser flow:

| Authenticator               | What the user does                                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Magic Link**              | Enters their email and follows the emailed link. The login completes on the device where the link is opened, so the link can be opened on another device. |
| **Magic Link continuation** | Enters their email and follows the emailed link. The login completes in the original browser tab, which waits until the link has been opened.             |
| **Email OTP**               | Enters their email, then types a 6-digit code that is emailed to them. See [One-time Passwords](./otps.md#email-otp).                                     |

For codes sent by text message, we recommend the extension described in [SMS OTP](./otps.md#sms-otp). Please [contact support](/contact) for assistance.

### Configuring magic links

New realms include a flow named `magic link` in the **Flows** tab of the **Authentication** section. If your realm doesn't have it, create one as described in [Create a magic link flow](#create-a-magic-link-flow).

Open the configuration for the _Magic Link_ step by clicking the gear icon on its row. The options are:

- _Alias_ is a name for this configuration.
- _Force create user_ creates a new user when an email is entered that doesn't match an existing user. This lets magic links register new users. It is on by default.
- _Update profile on create_ adds an UPDATE_PROFILE required action if the user was created, so the user fills in other required fields, such as first and last name.
- _Update password on create_ adds an UPDATE_PASSWORD required action if the user was created.
- _Allow magic link to be reusable_ lets the link be used more than once until it expires. It is on by default.
- _Token lifespan_ is how long the link is valid, in seconds. It defaults to one day.

![Keycloak Phase Two Magic Link Configuration](/docs/auth-magic-links-authenticator-config.png)

Save the configuration and go back to the flow page. In the _Action_ menu in the upper right, select _Bind flow_, and choose _Browser flow_.

### Login UI

After binding the magic link flow to the browser flow, reload your login screen. There is only a field for the email address, and the password field is gone.

![Keycloak Phase Two Magic Link Login Page](/docs/auth-magic-links-login.png)

After the user enters a valid email address, a magic link is sent to that email, and the login screen asks the user to click the link to complete the login.

![Keycloak Phase Two Magic Link Email Sent](/docs/auth-magic-links-email-sent.png)

### Create a magic link flow

To build the flow yourself, or a variation of it:

1. In **Authentication** > **Flows**, duplicate the `browser` flow and give it a name, such as `browser with magic link`.
2. In the forms sub-flow, delete the _Username Password Form_ and the conditional OTP sub-flow.
3. Add the _Magic Link_ step to the forms sub-flow, and set it to _Required_. It renders its own email form, so you don't need a separate username form.
4. Configure the step as described above, and bind the flow to the browser flow.

Use _Magic Link continuation_ instead of _Magic Link_ if you want the login to complete in the browser where it started. Its configuration has an _Expiration time_, in minutes, after which the waiting login page resets. It defaults to 10 minutes.

### Creating magic links from your application

The extension also adds a REST endpoint, `POST /auth/realms/<realm>/magic-link`, that creates a magic link for a user and either emails it or returns it to your application. The caller needs the `manage-users` role. Links created this way log the user in directly, without running an authentication flow. The parameters are documented in the [keycloak-magic-link README](https://github.com/p2-inc/keycloak-magic-link#resource).

:::caution Single-page apps
A magic link is an authorization response that your application didn't start. If the link sends users to a single-page app that uses `keycloak-js` or a similar library, pass `"response_mode": "fragment"` (or whatever response mode your client uses) together with a random `state` when you create the link. Without them, Keycloak 26.6.5 and later reject the follow-up login with `Invalid parameter: redirect_uri`. See [Using magic links with a single-page app](https://github.com/p2-inc/keycloak-magic-link#using-magic-links-with-a-single-page-app-keycloak-js-oidc-client-ts-) for the details.
:::

### Account activation

For realms where some users still need to verify their email or set their first password, such as self-registered or migrated users, the extension includes an _Activation Gate_ step. It asks for the email first, then sends users whose accounts still need activation an email with the steps they have to complete, and lets activated users continue to the password form. See [Account Activation](https://github.com/p2-inc/keycloak-magic-link#account-activation) in the extension's README.
