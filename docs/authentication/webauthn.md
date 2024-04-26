---
id: webauthn
title: WebAuthn
---

WebAuthn is a web standard for password-free login. At it's core, it is a browser-based API that allows for web applications to simplify and secure user authentication by using registered devices (phones, laptops, etc) as factors. It uses public key cryptography to protect users from advanced phishing attacks.

Most modern browsers support WebAuthn, and there are currently many technologies that can be used. External devices such as Yubikeys, integrated software and hardware such Apple and Google Passkeys, and even all-software implementations are all examples.

## Configuring WebAuthn

It is possible to use WebAuthn both as a second factor (2FA), in addition to username-password, or as a replacement for the password (so-called "passwordless"). We'll describe configuration for both here.

### 2FA

#### Required action

Prior to authentication setup, go to the **Required actions** tab and enable the _Webauthn Register_ action. If you wish to make it mandatory that your users set up a WebAuthn device, also turn on _Set as default action_.

![Keycloak Authentication WebAuthN Required Actions](/docs/auth-webauthn-2fa-ra.png)

#### Flow

Use of WebAuthn for is similar to how we used [one-time passcodes](../otps) in the previous section. We'll start by duplicating the `browser` authentication flow we used there. In the **Flows** tab, duplicate the `browser` flow. Name it something like `webauthn 2fa`.

Delete the _OTP Forms_ step, and replace it with _WebAuthn Authenticator_. Make sure it is set to _Required_

![Keycloak Authentication WebAuthN Flow](/docs/auth-webauthn-2fa-flow.png)

#### Login UI

After binding the new flow to the _Browser flow_, go back and reload your login screen. It will be a normal username and password entry screen. Following username-password authentication, if you have set _Webauthn Register_ as a required action, the user will be prompted to set up their WebAuthn device.

![Keycloak Authentication WebAuthN Security Key Register](/docs/auth-webauthn-register.png)

The user can potentiall have multiple device choices, based on their device and previous configurations. Depending on the type of device the user selects, they will be prompted by the browser to validate that they wish to use this device with the application. This example is for a hardware security key.

![Keycloak Authentication WebAuthN Register Device](/docs/auth-webauthn-register-device.png)

The browser will also prompt the user to create a label for the device, which allows easy recognition of which device they used in future sessions (e.g. "My Blue Yubikey").

![Keycloak Authentication WebAuthN Label Device](/docs/auth-webauthn-register-label.png)

That label will be used when the user is challenged on previous authentication attempts to prompt them to provide that device as a second factor.

![Keycloak Authentication WebAuthN Key Name](/docs/auth-webauthn-2fa-key.png)

### Passwordless

Because of the superior security inherent in many devices, it is becoming popular to use WebAuthn as a replacement for passwords. This section will describe a configuration for using WebAuthn to implement a passwordless login flow.

#### Required action

Again, prior to authentication setup, go to the **Required actions** tab and enable the _Webauthn Register Passwordless_ action. If you wish to make it mandatory that your users set up a WebAuthn device instead of using a password, also turn on _Set as default action_.

![Keycloak Authentication Passwordless Required Actions](/docs/auth-webauthn-passwordless-ra.png)

#### Flow

In the **Flows** tab, duplicate the `browser` flow. Name it something like `webauthn passwordless`.

- Delete the _Username Password Form_ and replace it with _Username Form_. Make it _Required_. This will allow collection of only the username or email before the WebAuthn challenge.
- Delete the _Conditional OTP_ sub-flow.
- In the forms section, below the _Username Form_, add the _WebAuthn Passwordless Authenticator_ step. Make it _Required_.

![Keycloak Authentication Passwordless Flow](/docs/auth-webauthn-passwordless-flow.png)

Note that this flow makes an assumption that the user has registered a WebAuthn device on registration, or by previous requirement. If the user has not done so, this flow will not allow them to authenticate.

#### Login UI

After binding the new flow to the _Browser flow_, go back and reload your login screen. You will see that there is only a field for the username or email address, and the password field is gone.

![Keycloak Authentication Passwordless Login](/docs/auth-webauthn-passwordless-login.png)

Once a user enters the email address or username of an existing user with a WebAuthn Passwordless device setup, the next step is a prompt to use that device to complete authentication.

![Keycloak Authentication Passwordless Security Key](/docs/auth-webauthn-passwordless-key.png)
