---
id: otps
title: One-time Passwords
---

A one-time password (OTP) is an automatically generated numeric or alphanumeric string of characters that authenticates a user for a single transaction or login session. An OTP is more secure than a static password, especially a user-created password, which can be weak and/or reused across multiple accounts.

We currently support authenticator apps such as Google Authenticator and FreeOTP, but many others are likely compatible.

If you need SMS OTP it requires an additional extension. Please [contact support](/contact) for assistance.

### Configuring OTP

As part of the default `browser` flow, you may have noticed in the forms section that there are conditional steps to determine if the user has an OTP authentication method configured. This means that OTP checking is already built into the default flow. We're done, right? But what if we want to force the user to configure an OTP application?

#### Required action

In order to force users to configure OTP, you must go to the **Required actions** tab of the **Authentication** section and set _Enabled_ and _Set as default action_ both to **ON** for _Configure OTP_. This will force the user to set up an OTP method as a barrier to registration and login.

![Keycloak OTP Default Action Configure](/docs/auth-otps-required-action.png)

However, this setting will only apply to new users. For existing users, you must go to the **Users** section, select the user you wish to edit, and add _Configure OTP_ to the _Required user actions_ field.

![Keycloak Required User Actions Configure OTP](/docs/auth-otps-user-action.png)

### Login UI

After updating the required action default or giving a test user the action, nothing will change until the user has successfully passed the username-password challenge. After that, the user is presented with a QR code and instructions for setting up their authenticator application.

![Keycloak OTP Setup Instructions](/docs/auth-otps-app-setup.png)

On subsequent logins, users will be prompted to enter the OTP from their app during each authentication attempt.

![Keycloak OTP Challenge Code Screen](/docs/auth-otps-code-challenge.png)

### Create OTP flow

:::caution

This section is currently under construction. Check back soon for updates.

:::
