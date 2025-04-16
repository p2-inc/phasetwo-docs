---
title: Webauthn and Passkeys with Keycloak
slug: webauthn-keycloak
date: 2025-04-17
authors: phasetwo
tags: [phase_two, open_source, webauthn, passkeys, authentication]
---

# A Passwordless Future with Keycloak: Using Passkeys and WebAuthn

Passwords are on their way out. From phishing to password reuse, they've become one of the weakest links in modern authentication. The solution? **Passkeys**—a phishing-resistant, user-friendly, and increasingly supported replacement for traditional passwords.

In this post, we’ll break down what passkeys are, how they work, which platforms support them, how they relate to WebAuthn, and how you can integrate them into your Keycloak authentication flows. Finally, we’ll explore some of the real-world considerations and challenges.

<!-- truncate -->

## What Are Passkeys?

**Passkeys** are a modern alternative to passwords. Built on public-key cryptography, passkeys replace the traditional "something you know" (your password) with "something you have" (your device) and "something you are" (biometrics like a fingerprint or face scan).

Unlike passwords, passkeys:

- Are resistant to phishing and brute-force attacks
- Can’t be reused across sites
- Don’t need to be remembered
- Are stored securely on your device or in a password manager that supports syncing

They offer the security of hardware security keys (like YubiKey) but with the convenience of Face ID or Windows Hello.

---

## How Do Passkeys Work?

Passkeys use **public-private key pairs** ([link](https://en.wikipedia.org/wiki/Public-key_cryptography)). Here’s how a typical passkey login works:

1. A website (relying party) sends a challenge to the user's browser.
2. The user’s device uses a previously stored private key (protected by a biometric or PIN) to sign the challenge.
3. The browser returns the signed challenge to the website.
4. The website uses the stored public key to verify the response and complete authentication.

No secrets are ever sent over the wire. This eliminates common password-based vulnerabilities.

---

## Where Are Passkeys Supported?

Passkeys are no longer a concept of the future—they're here, and support is growing fast. To get a quick idea, here are some of the existing systems that offer support.

| Platform              | Passkey Support                                                   |
| --------------------- | ----------------------------------------------------------------- |
| **Apple**             | Face ID / Touch ID via iCloud Keychain (macOS, iOS)               |
| **Google**            | Android and Chrome support passkeys via Google Password Manager   |
| **Microsoft**         | Windows Hello and Edge support WebAuthn-based passkeys            |
| **Password Managers** | 1Password and Dashlane have launched passkey support              |
| **Browsers**          | Chrome, Safari, Edge, and Firefox (with varying levels of polish) |

Cross-platform syncing is also becoming easier thanks to initiatives like **FIDO2** and **passkey.ro**.

---

## What’s the Relationship Between Passkeys and WebAuthn?

**WebAuthn** (Web Authentication API) is the W3C standard that enables passwordless login in web applications. Passkeys are a **user-friendly implementation of WebAuthn credentials**, often synced across devices via a cloud provider (like iCloud or Google Password Manager).

WebAuthn supports two main registration types:

- **Roaming authenticators** like hardware keys (YubiKey)
- **Platform authenticators** like biometrics on a phone or laptop (e.g., Touch ID, Windows Hello)

**Passkeys** use platform authenticators and often add cross-device syncing on top. So while WebAuthn is the standard, passkeys are the experience users interact with.

---

## Adding Passkeys to Keycloak

**Keycloak supports WebAuthn natively**, meaning you can offer passkeys as a sign-in method today—no plugins or external tools required.

### Setup Steps

Test this next section using Phase Two's [Free Deployment](https://phasetwo.io/dashboard).

1. **Enable user registration** in your realm settings.
2. Under **Authentication → Required Actions**, enable:
   - `WebAuthn Register`
   - `WebAuthn Register Passwordless`
3. Create a custom browser login flow:
   - Duplicate the built-in browser flow.
   - Remove the `Username Password Form` step. (optional if you don't want this as an option)
   - Add a `Username Form` and the `WebAuthn Passwordless Authenticator` step.
   - Set the WebAuthn step to `Required`.
4. Bind this new flow as your realm's **browser flow**.

With this flow, users will log in using passkeys—no passwords, just their fingerprint, face, or device confirmation.

> ✅ **Pro tip:** You can also offer passkeys as a second factor or as an upgrade path after initial password login.

---

## Challenges and Considerations

Implementing passkeys is powerful, but not without complexity. A few things to keep in mind:

### Device Recovery

If a user loses their device or wipes their phone, their passkey is lost unless it’s synced to the cloud (e.g., iCloud, Google). Ensure fallback options exist—like email OTP or re-registration.

### Cross-Platform Compatibility

Passkeys behave differently across OSes and browsers. For example, Windows Hello may not sync with a MacBook’s Touch ID. Testing across platforms is key.

### User Education

Passkeys are unfamiliar to many users. Provide clear onboarding, and consider hybrid flows that gradually move users from password-based logins to passkeys.

### Deployment Architecture

If your Keycloak deployment involves multiple realms or external IDPs, you'll need to ensure your WebAuthn configuration is consistent across them.

---

## Why Phase Two?

At **Phase Two**, we offer more than just Keycloak hosting—we help teams **architect for modern identity**.

Need help rolling out passkeys and passwordless login in your apps? We can help you:

- Customize your Keycloak flows for WebAuthn
- Audit your security settings and fallback options
- Ensure your deployment scales with your users
- Keep your Keycloak up-to-date with the latest passkey support

Let’s build a secure, passwordless future—together.

📩 [Reach out to the team →](mailto:sales@phasetwo.io)
👉 [Get Started with Free Managed Keycloak](https://phasetwo.io/dashboard)
