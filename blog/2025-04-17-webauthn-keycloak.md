---
title: "Keycloak Passkeys and WebAuthn: What's the Difference?"
slug: webauthn-keycloak
date: 2025-04-17
authors: [jpatzer]
tags: [phase_two, open_source, webauthn, passkeys, authentication]
description: "Keycloak ships passkeys and WebAuthn security keys as two separate credentials under two separate policies. What each one is, and which one you actually want."
keywords:
  - keycloak passkeys
  - keycloak webauthn
  - passkey vs webauthn
  - keycloak passwordless authentication
  - keycloak biometric authentication
---

Keycloak supports passkeys and WebAuthn out of the box, with no plugin and, as of 26.7, no
custom authentication flow. The thing worth knowing before you turn either on is that
**they are not one feature.** Keycloak treats passwordless passkeys and WebAuthn-as-a-second-factor
as two different credentials, registered by two different required actions, governed by two
different policies. A user who has one does not have the other, and nothing in the admin
console tells you so.

This post is the concept half: what passkeys are, how they relate to WebAuthn, how Keycloak
models the difference, and the recovery and cross-platform problems that bite in production.
For the configuration itself — every click, every default value, every failure mode — see the
tutorial linked below.

<!-- truncate -->

## Passkeys or WebAuthn: which one do you want?

This is the direct answer, and it is the decision most people get wrong on the first try.

| | **Passwordless passkeys** | **WebAuthn as a second factor** |
|---|---|---|
| Replaces the password? | Yes | No — it comes after the password |
| Required action | `webauthn-register-passwordless` | `webauthn-register` |
| Governed by | WebAuthn **Passwordless** Policy | WebAuthn Policy |
| Typical authenticator | Phone or laptop biometrics, synced | Hardware key (YubiKey), device-bound |
| Recovery story | Hard — see below | Easy: the password still works |

Both are enabled by default as required actions on a fresh Keycloak 26.7.4 realm, so "turning
on passkeys" is not about enabling a required action. The two policies above are independent:
raising user-verification requirements on one has no effect on the other. Registering under
one required action does not give the user a credential the other one recognises.

If you want *one* of them and you are not sure which: pick the second factor. It is strictly
additive, it cannot lock anyone out, and you can offer passwordless later to the users who
want it.

## What are passkeys?

**Passkeys** are a modern alternative to passwords. Built on public-key cryptography, passkeys
replace the traditional "something you know" (your password) with "something you have" (your
device) and "something you are" (biometrics like a fingerprint or face scan).

Unlike passwords, passkeys:

- Are resistant to phishing and brute-force attacks
- Can't be reused across sites
- Don't need to be remembered
- Are stored on your device or in a credential manager that supports syncing

They offer the security of hardware security keys (like a YubiKey) but with the convenience of
Face ID or Windows Hello.

## How do passkeys work?

Passkeys use [public-private key pairs](https://en.wikipedia.org/wiki/Public-key_cryptography).
Here's how a typical passkey login works:

1. A website (relying party) sends a challenge to the user's browser.
2. The user's device uses a previously stored private key (protected by a biometric or PIN) to
   sign the challenge.
3. The browser returns the signed challenge to the website.
4. The website uses the stored public key to verify the response and complete authentication.

No shared secret is ever sent over the wire. That is what removes the whole password-based
class of attacks: there is nothing on the server worth stealing and nothing for a phishing
page to capture.

## What's the relationship between passkeys and WebAuthn?

**WebAuthn** (Web Authentication API) is the W3C standard that enables passwordless login in
web applications. Passkeys are a **user-friendly implementation of WebAuthn credentials**,
usually synced across a user's devices by a credential manager such as iCloud Keychain or
Google Password Manager.

WebAuthn supports two registration types:

- **Roaming authenticators** — hardware keys like a YubiKey, which stay device-bound
- **Platform authenticators** — biometrics built into a phone or laptop (Touch ID, Windows Hello)

Passkeys typically use platform authenticators and add syncing on top. So WebAuthn is the
standard and passkeys are the experience users actually interact with — which is why Keycloak's
admin console says "WebAuthn" in the policy names and "Passkeys" in the login settings, for
what is the same underlying protocol.

## Where are passkeys supported?

Passkeys are no longer a concept of the future. Some of the existing systems that support them:

| Platform | Passkey support |
| --- | --- |
| **Apple** | Face ID / Touch ID via iCloud Keychain (macOS, iOS) |
| **Google** | Android and Chrome support passkeys via Google Password Manager |
| **Microsoft** | Windows Hello and Edge support WebAuthn-based passkeys |
| **Credential managers** | 1Password and Dashlane have launched passkey support |
| **Browsers** | Chrome, Safari, Edge, and Firefox (with varying levels of polish) |

Using a passkey stored on one device to sign in on another is not syncing — it is FIDO's
**hybrid transport** (the QR-code-plus-Bluetooth flow), which is part of CTAP rather than
something any one vendor provides. Syncing, where it happens at all, is done by the credential
manager, and it does not cross ecosystems: a passkey in iCloud Keychain does not appear in
Google Password Manager.

## Adding passkeys to Keycloak

On Keycloak 26.7, passwordless passkeys are a realm setting, not a flow you build. **Realm
settings → Login → Enable Passkeys** turns them on for the stock browser flow, which then
offers a passkey sign-in option and tags the username field for browser autofill. The same
switch is reachable over the admin API:

```bash
# Verified against quay.io/keycloak/keycloak:26.7.4
kcadm.sh update realms/<realm> -s 'webAuthnPolicyPasswordlessPasskeysEnabled=true'
```

With the switch off, the rendered login page contains no WebAuthn markup at all and the
username field carries `autocomplete="username"`. With it on, the same page carries
`autocomplete="username webauthn"` and the passkey option. Nothing else changed: no flow was
copied, no execution was added.

WebAuthn as a second factor is a different switch. The stock browser flow already contains a
**WebAuthn Authenticator** execution, sitting disabled inside the *Browser - Conditional 2FA*
sub-flow. Copy the browser flow, change that one execution's requirement, and bind the copy.
There is nothing to add.

Older guides — including an earlier version of this post — tell you to duplicate the browser
flow, delete the *Username Password Form*, and insert a *WebAuthn Passwordless Authenticator*
by hand. That still works, but on 26.7 it is no longer necessary for the common case, and
hand-built flows are where the failure modes live.

The full procedure for both setups, with the defaults, the verification steps and the six ways
it fails quietly, is in
[Passkeys and WebAuthn in Keycloak](/tutorials/authentication/passkeys-webauthn). Our
[Passkeys](/docs/authentication/passkeys) and [WebAuthn](/docs/authentication/webauthn) docs
cover the Phase Two specifics.

## Challenges and considerations

Passkeys are powerful, but not free. A few things to plan for.

### Device recovery

This is the one that generates tickets. If a user loses or wipes their device, their passkey
is gone unless the credential manager synced it — and device-bound authenticators like a
YubiKey never sync by design. Register a fallback before you make passkeys the only factor:
recovery codes, [email OTP or TOTP](/tutorials/authentication/totp-mfa), or a re-registration
path through a verified email address.

### Cross-platform compatibility

Passkeys behave differently across operating systems and browsers, and they do not cross
ecosystems. A passkey created in Windows Hello is not available on a MacBook's Touch ID, so a
user with a work laptop and a personal phone on different platforms needs two registrations,
not one. Test on every platform you actually support.

### User education

Passkeys are still unfamiliar to a lot of people. Provide clear onboarding, and consider a
hybrid rollout that moves users off passwords gradually rather than in one cutover.

### Deployment architecture

The WebAuthn policies are per-realm, and the relying party ID is part of them. If you run
multiple realms, multiple domains, or federate to external identity providers, the policies
have to be configured deliberately on each — a passkey registered against one relying party ID
will not validate against another. Getting this wrong is a common cause of "it worked in
staging".

## Where to go next

Turn on the second factor first, prove it in a copy of your browser flow, then decide whether
passwordless is worth the recovery work. The step-by-step is in the
[Passkeys and WebAuthn tutorial](/tutorials/authentication/passkeys-webauthn); if you need to
express something the built-in flows cannot, [custom authentication
flows](/tutorials/authentication/custom-flows) is the next stop, and the rest of the
[Keycloak tutorials](/tutorials/) cover the surrounding pieces.

If you would rather not own the upgrade path that keeps passkey support current, our
[managed Keycloak](/hosting/dedicated-clusters/) clusters track upstream releases for you.
[Start a free trial](https://dash.phasetwo.io/) and the configuration above works on day one.
