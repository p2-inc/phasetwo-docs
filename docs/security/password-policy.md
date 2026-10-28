---
id: password-policy
title: Password Policy
---

Keycloak provides a flexible password policy system that allows you to enforce various rules for user passwords. This is crucial for maintaining security and ensuring that users create strong passwords. While this guide is to provide information on how to set up strong passwords, it is not a substitute for multi-factor authentication (MFA), which is highly recommended for all accounts.

We recommend using a password manager to generate and store complex passwords. This not only helps in creating strong passwords but also makes it easier for users to manage them without the need to remember every password. This recommendation can be communicated to users through your application's user interface or documentation.

## Setting Up Password Policies

All policies are set in the Keycloak Admin Console:

1. Log in to the Keycloak Admin Console via the Phase Two Dashboard.
2. Visit the realm you want to configure. Open the console link for the specific realm.
3. Navigate to the **Authentication** section in the left sidebar.
4. Open the **Policies** tab, then the **Password policy** tab, and use _Add policy_ to add each rule.

<figure>
  <img src="/docs/security/policy-options.png" className="max-w-xl"  alt="Phase Two Policy Options" />
  <figcaption>Policy Options</figcaption>
</figure>

### Suggested Configurations

- **Minimum Length**: Set a minimum length for passwords. A minimum of **12 characters** is recommended.
- **Character Types**: Require a mix of character types (uppercase, lowercase, numbers, and special characters) to ensure complexity.
- **Password History**: Prevent users from reusing recent passwords by setting a password history policy

Just like in the popular XKCD comic, there is no substitute for a long passphrase/password.

<a href="https://xkcd.com/936" target="_blank" rel="noopener noreferrer">
  <img src="https://imgs.xkcd.com/comics/password_strength.png" alt="XKCD Comic on Passwords" className="max-w-lg" />
</a>

### Multi-Factor Authentication (MFA)

Keycloak provides a robust multi-factor authentication system that can be configured to enhance security. It is highly recommended to enable MFA for all accounts, especially those with administrative privileges or sensitive data access.

Second factors you can offer include:

- [Authenticator apps](../authentication/otps.md) (TOTP)
- [Email OTP](../authentication/otps.md#email-otp)
- [WebAuthn](../authentication/webauthn.md) security keys and biometrics
- SMS OTP (requires an additional extension) - [contact support](/contact)

You can also remove passwords from the login entirely with [passkeys](../authentication/passkeys.md) or [magic links](../authentication/magic-links.md), or hand authentication to your users' own identity providers with [enterprise SSO](../authentication/sso.md) or [social login](../authentication/social-login.md).

To use these, configure an authentication flow that includes them. To make users set up a second factor, enable the matching [required action](../authentication/otps.md#required-action) and set it as a default action.
