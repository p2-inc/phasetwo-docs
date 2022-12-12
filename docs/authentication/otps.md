---
id: otps
title: One-time Passwords
---

A one-time password (OTP) is an automatically generated numeric or alphanumeric string of characters that authenticates a user for a single transaction or login session. An OTP is more secure than a static password, especially a user-created password, which can be weak and/or reused across multiple accounts.

We currently support authenticator apps such as Google Authenticator and FreeOTP, but many others are likely compatible.

### Configuring OTP

As part of the default `browser` flow, you may have noticed in the forms section that there are conditional steps to determine if the user has an OTP authentication method configured. This means that OTP checking is already built into the default flow. We're done, right? But what if we want to force the user to configure an OTP application?

#### Required action

In order to force users to configure OTP, you must go to the **Required actions** tab of the **Authentication** section and set *Enabled* and *Set as default action* both to **ON** for *Configure OTP*. This will force the user to set up an OTP method as a barrier to registration and login.

![](/docs/auth-otps-required-action.png)

However, this setting will only apply to new users. For existing users, you must go to the **Users** section, select the user you wish to edit, and add *Configure OTP* to the *Required user actions* field. 

![](/docs/auth-otps-user-action.png)

### Login UI

After updating the required action default or giving a test user the action, nothing will change until the user has successfully passed the username-password challenge. After that, the user is presented with a QR code and instructions for setting up their authenticator application.

![](/docs/auth-otps-app-setup.png)

On subsequent logins, users will be prompted to enter the OTP from their app during each authentication attempt.

![](/docs/auth-otps-code-challenge.png)

### Create OTP flow

:::caution

This section is currently under construction. Check back soon for updates.

:::
