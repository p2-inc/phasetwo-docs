---
title: "Native login for Keycloak: sign users in with your app's own screens on iOS and Android"
slug: native-login-keycloak-ios-android
date: 2026-11-10
authors: [jpatzer]
tags: [phase_two, keycloak, mobile, ios, android, passkeys, mfa, oauth]
description: Phase Two's open native authentication for Keycloak lets iOS and Android apps sign users in with native screens instead of a browser. Passwords, passkeys, TOTP, one-time codes, push approvals and step-up run in the app, on top of Keycloak's own authentication flows.
keywords:
  [
    keycloak native login,
    keycloak mobile sdk,
    keycloak ios sdk,
    keycloak android sdk,
    native authentication keycloak,
    oauth first-party apps,
    keycloak passkeys mobile,
    keycloak push mfa,
  ]
---

Today we're opening up [native authentication for Keycloak](https://github.com/p2-inc/native-apps): a set of Keycloak extensions and iOS and Android SDKs that let a mobile app sign users in with its own screens instead of a browser. Passwords, passkeys, TOTP, email and SMS codes, recovery codes, push approvals with number matching, step-up and required actions all run natively, while Keycloak still decides what the user has to do. The SDKs are Apache 2.0, and the code is on GitHub.

<!-- truncate -->

## Why we built it

The standard way to add Keycloak login to a mobile app is the system browser: the app opens Keycloak's login page in an in-app browser sheet, the user signs in, and the browser hands an authorization code back to the app. It's secure and it's what we've recommended for years, in our own [native apps guide](/docs/securing-applications/native-apps) too. It also has costs that product teams keep raising with us. The iOS "wants to use … to sign in" prompt appears before the user sees anything. The login page is a web page inside a native app, themed to look native but never quite matching. And every factor the flow asks for is a web page, so passkeys, push approvals and biometrics don't feel like part of the app.

The alternative most teams reach for is worse: the password grant, where the app posts a username and password straight to the token endpoint. It only handles passwords, it skips the authentication flow entirely, so MFA, required actions and brute-force rules configured in Keycloak don't apply, and OAuth 2.1 drops it.

The IETF has been working on a better answer, [OAuth 2.0 for First-Party Applications](https://datatracker.ietf.org/doc/draft-ietf-oauth-first-party-apps/) (FiPA): the app talks to an authorization challenge endpoint, the server answers with what it needs next, and the app collects it natively until the server issues an authorization code. We built that for Keycloak, and SDKs that turn it into native screens.

## How it works

The Keycloak extensions add a challenge endpoint to each realm. A login starts with a request from the app, and Keycloak runs the client's normal authentication flow. Instead of rendering a login page, each step comes back as a structured JSON challenge:

```json
{
  "error": "insufficient_authorization",
  "auth_session": "<opaque>",
  "challenges": [
    { "type": "username", "id": "<execution>", "label": "Username", "required": true }
  ]
}
```

The SDK shows the matching screen, sends the answer back, and repeats until Keycloak returns an authorization code, which the SDK exchanges for tokens with PKCE. Because Keycloak is still running the flow, everything you configure there applies: conditional second factors, brute-force protection, required actions, levels of authentication for step-up. You change the login in the admin console, not in the app.

Anything the native flow can't handle falls back to the system browser for that login, so a social login button or a custom authenticator without a native version still works.

## What runs natively

- **Passwords and saved passwords.** Both SDKs work with the platform password managers: AutoFill on iOS and Credential Manager on Android, including saving a new password after sign-in.
- **Passkeys.** Sign in with a passkey using the platform APIs, enroll one right after a password login, or register one later from inside the app.
- **Second factors.** TOTP, email and SMS one-time codes, and recovery codes, each as a native screen with the countdowns and "try another way" choices you'd expect.
- **Push approvals.** Users enroll their phone from the app and approve sign-ins with number matching, through APNs on iOS and Firebase Cloud Messaging on Android. Push builds on ba-itsys' open-source [Keycloak push MFA extension](https://github.com/ba-itsys/keycloak-push-mfa-extension).
- **Step-up.** An app can ask for a higher level of authentication for a sensitive action, such as a transfer, and the user only answers the extra factor.
- **Required actions.** Updating a password, verifying an email with a code, accepting terms and registering a passkey happen in the app instead of bouncing to the browser.

Sessions and tokens can be bound to a key on the device with DPoP, so a token copied off the device can't be used without that key. The SDKs keep tokens in the Keychain on iOS and the Android Keystore on Android.

## SDKs with default screens you can replace

Each SDK has a core layer and a UI layer. The core handles the protocol: the challenge loop, PKCE, DPoP, tokens, refresh and logout, credential storage, and push. The UI layer adds default screens for every challenge type, in SwiftUI on iOS and Jetpack Compose on Android, so a working login is a few lines of code. Any screen can be replaced with your own design, one challenge type at a time, and you can skip the UI layer entirely and build every screen yourself.

The repository also has demo apps for both platforms and a Docker Compose setup with a preconfigured realm, so you can try every flow on your laptop.

## Tested against Keycloak itself

Every exchange between the SDKs and Keycloak is recorded by the extensions' integration tests, which run against real Keycloak 26.4, 26.6 and 26.8 servers. Both SDKs replay those recordings in their own test suites, so a change on the server that would break a client fails the build before it ships. The protocol is written up in the repository for anyone building a client on another platform.

## What stays in the browser

Some flows belong on Keycloak's own pages, so they stay in the browser: new-user registration, forgotten-password recovery, TOTP enrollment, and social and enterprise identity-provider login.

## Try it

The [native-apps repository](https://github.com/p2-inc/native-apps) has the extensions, both SDKs, the demo apps and the developer documentation. The project is below 1.0, so the protocol and APIs may still change between releases. The SDKs and demo setup are Apache 2.0, and the Keycloak extensions are under the Elastic License 2.0, like our other extensions. If you'd like native login on a Phase Two hosted Keycloak, or help bringing it into your app, [get in touch](/contact).
