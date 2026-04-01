---
id: passkeys
title: Passkeys
sidebar_label: Passkeys
---

Passkeys are a modern authentication method built on **WebAuthn**. They let users authenticate with a device they already control, such as a phone, laptop, hardware security key, or platform authenticator, instead of relying only on passwords.

In Phase Two and Keycloak, passkeys can be used in two main ways:

- as a **passwordless login method**
- as a **second factor (2FA)** after username and password

If you are looking for the lower-level protocol and flow details, see [WebAuthn](./webauthn.md).

## Why use passkeys?

Passkeys are popular because they improve both security and user experience:

- **Phishing resistance:** authentication uses public key cryptography rather than shared secrets
- **Better user experience:** users can authenticate with biometrics, device PINs, or hardware keys
- **Reduced password burden:** passkeys can reduce password resets and credential reuse
- **Flexible deployment:** they can be introduced gradually as either 2FA or full passwordless login

## Passkeys as a second factor

One common pattern is to keep username and password as the primary sign-in method, then require a passkey as the second factor.

This is a good fit when:

- you want stronger MFA without fully removing passwords yet
- users are already familiar with a username/password login
- you want to roll out passkeys incrementally

In Keycloak, this setup uses the standard **WebAuthn Authenticator** in the browser flow.

For this pattern:

1. Enable the **Webauthn Register** required action.
2. Duplicate your browser flow.
3. Replace the OTP step with **WebAuthn Authenticator**.
4. Bind the updated flow to the browser flow you want users to use.

For the detailed step-by-step configuration, see the **2FA** section in [WebAuthn](./webauthn.md).

## Passkeys for passwordless login

Passkeys can also replace passwords entirely. In this model, the user enters only a username or email address, then completes login with their registered device.

This is a good fit when:

- you want a passwordless login experience
- you want to reduce password reset and credential management overhead
- you want a stronger default login experience for users with modern devices

In Keycloak, this setup uses **WebAuthn Passwordless Authenticator**.

For this pattern:

1. Enable the **Webauthn Register Passwordless** required action.
2. Duplicate your browser flow.
3. Replace **Username Password Form** with **Username Form**.
4. Remove conditional OTP if it is no longer needed.
5. Add **WebAuthn Passwordless Authenticator** as a required step.

For the full setup walkthrough, see the **Passwordless** section in [WebAuthn](./webauthn.md).

## Choosing between 2FA and passwordless

Use passkeys as **2FA** when:

- you want a lower-risk migration path
- passwords still need to remain available
- some users may not be ready for passwordless-only login

Use passkeys for **passwordless** when:

- you want the cleanest sign-in experience
- your user base can reliably register and use passkey-capable devices
- you are ready to center authentication around device-based credentials

Many teams start with passkeys as a second factor and later move to passwordless once adoption is high enough.

## Related guides

- [WebAuthn](./webauthn.md)
- [One-Time Passwords](./otps.md)
- [Understanding Flows](./understanding-flows.md)
- [Complex Flows](./complex-flows.md)
