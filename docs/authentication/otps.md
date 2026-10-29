---
id: otps
title: One-time Passwords
---

A one-time password (OTP) is an automatically generated numeric or alphanumeric code that authenticates a user for a single login. An OTP is more secure than a static password, especially a user-created password, which can be weak or reused across multiple accounts.

Phase Two supports two kinds of OTP:

- **Authenticator apps** (TOTP), such as Google Authenticator, Microsoft Authenticator, and FreeOTP. This is built into Keycloak.
- **Email OTP**, where a 6-digit code is emailed to the user. This is provided by the [keycloak-magic-link](https://github.com/p2-inc/keycloak-magic-link) extension.

Keycloak has no built-in SMS sending. For codes sent by text message, see [SMS OTP](#sms-otp), which uses an additional extension.

## Authenticator apps

### Configuring OTP

The default `browser` flow already contains a conditional OTP step, which asks for a code from users who have set up an authenticator app. To make users set one up, use a required action.

#### Required action

To force users to configure OTP, go to the **Required actions** tab of the **Authentication** section and turn on both _Enabled_ and _Set as default action_ for _Configure OTP_. New users must then set up an OTP app as part of registration.

![Keycloak OTP Default Action Configure](/docs/auth-otps-required-action.png)

The default action only applies to new users. For existing users, go to the **Users** section, select the user, and add _Configure OTP_ to their _Required user actions_.

![Keycloak Required User Actions Configure OTP](/docs/auth-otps-user-action.png)

To require OTP for every user, including existing ones, without editing each user, change the flow itself so the OTP step is required. See [Set Up TOTP Multi-Factor Authentication](/tutorials/authentication/totp-mfa/) for the flow changes and what to watch out for.

### Login UI

After you set the required action, nothing changes until the user has passed the username and password step. Then the user is shown a QR code and instructions for setting up their authenticator app.

![Keycloak OTP Setup Instructions](/docs/auth-otps-app-setup.png)

On later logins, users are asked for the code from their app.

![Keycloak OTP Challenge Code Screen](/docs/auth-otps-code-challenge.png)

## Email OTP

Email OTP sends a 6-digit code to the user's email address, which they type into the login page. It can be used on its own as a password-less login, or after the password as a second factor. Email must be [configured](/docs/getting-started/email#server-configuration) first.

### Create an email OTP flow

1. In **Authentication** > **Flows**, duplicate the `browser` flow and give it a name, such as `browser with email otp`.
2. In the forms sub-flow:
   - For **password-less login**, replace the _Username Password Form_ with a _Username Form_, followed by an _Email OTP_ step set to _Required_.
   - For **email OTP as a second factor**, keep the _Username Password Form_, and add an _Email OTP_ step after it, set to _Required_.
3. Optionally configure the _Email OTP_ step with the gear icon. _Force create user_ creates a user when an unknown email is entered, and _Email subject with code_ puts the code in the email subject line.
4. In the _Action_ menu, select _Bind flow_ and choose _Browser flow_.

Email OTP is weaker than an authenticator app or a [passkey](./passkeys.md) as a second factor, because anyone with access to the user's mailbox can complete it. For flows that combine several methods, see [Complex Flows](./complex-flows.md) and [Custom authentication flows](/tutorials/authentication/custom-flows/).

## SMS OTP

SMS OTP sends a code to the user's mobile phone as a second factor. Keycloak doesn't include it, so we use the open source [SMS authenticator](https://github.com/netzbegruenung/keycloak-mfa-plugins/tree/main/sms-authenticator) from [netzbegruenung/keycloak-mfa-plugins](https://github.com/netzbegruenung/keycloak-mfa-plugins). It isn't part of the Phase Two image. On a managed cluster, [contact support](/contact) and we will add it to your cluster. If you [self-host](/docs/hosting/), download the `sms-authenticator` jar for your Keycloak version from the project's [releases](https://github.com/netzbegruenung/keycloak-mfa-plugins/releases) and add it to the `providers` directory.

The extension doesn't send messages itself. It makes an HTTP POST to your SMS provider's API, so you need an account with a provider such as Twilio, Vonage, or AWS SNS behind an HTTP endpoint, and you configure the request shape (URL, authentication, and the names of the message and phone-number fields) to match that provider's API.

### Configuring SMS OTP

1. In **Authentication** > **Required actions**, enable _Phone Validation_ and _Update Mobile Number_.
2. In **Authentication** > **Flows**, duplicate the `browser` flow. In the conditional OTP sub-flow, add an _SMS Authentication (2FA)_ step next to the _OTP Form_ and set both to _Alternative_.
3. Configure the _SMS Authentication (2FA)_ step with the gear icon. Name the configuration alias `sms-2fa`: the extension uses the execution with that alias to send the confirmation code when a user registers a new phone number. Then enter your provider's API URL, credentials, and field names. The full list of options is in the [extension's README](https://github.com/netzbegruenung/keycloak-mfa-plugins/tree/main/sms-authenticator#setup).
4. In the _Action_ menu, select _Bind flow_ and choose _Browser flow_.

Users set up SMS by entering and confirming their phone number in the [account console](/docs/keycloak/account-console). To require it, turn on _Force 2FA_ in the step's configuration: users who have no other second factor must then set up SMS at their next login.

### Custom login themes

The extension adds its own login pages: `login-sms.ftl` for entering the code, `mobile_number_form.ftl` for entering a phone number, and `select-country.ftl` for choosing the country code. A theme that extends the default `keycloak` or `phasetwo` login theme renders them without changes. If your login theme replaces every page, for example a [Keycloakify](https://www.keycloakify.dev/) theme, you need to add these three pages to it. Use the extension's [templates](https://github.com/netzbegruenung/keycloak-mfa-plugins/tree/main/sms-authenticator/src/main/resources/theme-resources/templates) as the reference for the fields each form must post.

### Security considerations

SMS is the weakest second factor Phase Two can offer. Codes can be intercepted through SIM swapping or phone-number porting, and like any typed code they don't stop a [phishing proxy](/docs/security/phishing-resistant-login). Prefer an authenticator app or a [passkey](./passkeys.md) where your users can use one.

SMS also costs money per message, which makes the phone-number and resend steps a target for SMS pumping, where an attacker triggers messages to premium-rate numbers. Protect the login with [rate limiting](/docs/security/rate-limiting) and a CAPTCHA such as [Turnstile](/docs/security/turnstile), and set spend limits and country restrictions with your SMS provider.
