---
slug: keycloak-passkeys-faster-login
title: "Passkeys make login faster. Here is the data, and how to roll them out in Keycloak"
date: 2026-10-23
authors: [jpatzer]
tags: [keycloak, passkeys, webauthn, authentication, security]
description: Google, Microsoft and the FIDO Alliance all measured passkey sign-in against passwords. Passkeys came out two to three times faster and far more reliable. What the numbers say, why it happens, and how to introduce passkeys in Keycloak without forcing anyone.
keywords:
  - keycloak passkeys
  - passkeys faster login
  - passkey login time
  - passkey sign-in success rate
  - keycloak passwordless login
---

Every second a customer spends on your login page is a second they might spend somewhere else. Typing an email and password, mistyping it, waiting for a code, switching to an authenticator app, or giving up and resetting the password are all time between someone deciding to sign in and actually getting in. **Passkeys remove most of those steps, and every large published measurement shows the same result: sign-in with a passkey takes about half the time, or less, and fails far less often.** Our own customers report the same: after introducing passkeys, they measured login times drop by several seconds per sign-in.

This post collects the published figures, explains where the time goes, and shows how to introduce passkeys in Keycloak alongside the password login you already have.

<!-- truncate -->

## What the published numbers say

Three organizations with very large sign-in volumes have published measurements comparing passkeys with passwords. They measured different things in different ways, so the figures are not interchangeable, but they all point in the same direction.

| Source | Sign-in time | Sign-in success |
|---|---|---|
| [Google](https://security.googleblog.com/2023/05/making-authentication-faster-than-ever.html), March–April 2023 data | 14.9 seconds with a passkey, 30.4 seconds with a password | 63.8% for same-device passkeys, 13.8% for passwords |
| [Microsoft](https://www.microsoft.com/en-us/security/blog/2024/12/12/convincing-a-billion-users-to-love-passkeys-ux-design-insights-from-microsoft-to-boost-adoption-and-security/), December 2024 | 3x faster than a password, 8x faster than a password plus traditional MFA | 98% with a passkey, 32% with a password |
| [FIDO Alliance Passkey Index](https://fidoalliance.org/wp-content/uploads/2025/10/FIDO-Passkey-Index-October-2025.pdf), October 2025 | 8.5 seconds with a passkey, 31.2 seconds with traditional MFA, a 73% decrease | 93% with a passkey, 63% with other methods |

The FIDO Alliance figures are worth a closer look if you run a store. They come from a survey of nine organizations that have run passkeys for one to three years, including Amazon, Target, PayPal and Mercari, so this is not a lab result. The same report notes up to an 81% reduction in sign-in-related help desk incidents. Microsoft adds a figure that matters for rollout: 99% of users who start passkey registration finish it.

"Success rate" deserves a word. These are the share of sign-in attempts that end with the user signed in. A password attempt that fails because of a typo, a forgotten password, or an abandoned reset counts as a failure. That is why the gap is so wide. Passkeys do not just save seconds on the happy path; they cut out the unhappy paths that cost the most time of all.

## Where the time goes

A password sign-in has more steps than it looks like:

1. Type or autofill the email address.
2. Type or autofill the password, or fail to remember it.
3. If MFA is on, wait for an SMS or email code, or open an authenticator app, and type six digits.
4. On any mistake, start again, and after a few mistakes, reset the password by email.

A passkey sign-in is one step after the email address, and often not even that. The browser offers the passkey in the username field's autofill, the user confirms with a fingerprint, face, or device PIN, and they are in. There is nothing to type, nothing to remember, and no code to wait for. Because a passkey is already a possession factor confirmed with a biometric or PIN, it replaces the password and the second factor at once, which is why the gap against "password plus MFA" is so much larger than against a password alone.

## Faster and harder to steal

The speed is the easy sell. The security benefit is the one that compounds. A passkey is a key pair: the private key never leaves the user's device and is bound to your domain. There is no shared secret on your side to leak, nothing a phishing page can collect, and nothing an attacker can replay from another site's breach.

That last point is what matters for credential stuffing, the automated replay of leaked passwords that every public login page faces. A customer who signs in with a passkey has nothing for that attack to guess. Keep in mind that as long as the password path stays open for an account, an attacker can still try it, so passkeys reduce your exposure as adoption grows rather than eliminating it on day one. The rest of the defenses still matter: see [Credential Stuffing and Account Takeover](/docs/security/credential-stuffing).

## Introducing passkeys in Keycloak

On Keycloak 26.7 and later, passwordless passkeys are a realm setting rather than a flow you build. **Realm settings → Login → Enable Passkeys** turns them on for the stock browser flow, which then offers a passkey option and tags the username field for browser autofill. Users who have not registered a passkey sign in exactly as before.

The rollout that works is gradual:

1. **Turn on passkeys without removing passwords.** Existing customers keep signing in the way they know, and passkeys appear as an option.
2. **Invite enrollment at a calm moment, not at a gate.** Microsoft's finding that nearly everyone who starts registration finishes it comes with a design lesson in the same post: offer the passkey after a successful sign-in, when the user has a reason to say yes. Do not put registration between a customer and their checkout. Users can add a passkey from the [Account Console](/docs/keycloak/account-console), or you can set the **Webauthn Register Passwordless** required action on the users you want to enroll.
3. **Leave the default mediation alone.** The default, conditional mediation, offers passkeys through the browser's autofill without an extra dialog, which is the fastest experience for users who have one and invisible to users who do not.
4. **Measure before and after.** Record time from the login page loading to the user landing back in your application, and the share of sign-in attempts that succeed, split by method. Those are the two numbers every published study uses, and they are the ones your own customers will feel.

The full setup, including passkeys as a second factor instead of a replacement and the ways each setup can fail quietly, is in [Passkeys and WebAuthn in Keycloak](/tutorials/authentication/passkeys-webauthn). If you want to know which credential type you actually want, start with [Keycloak passkeys and WebAuthn: what's the difference?](/blog/webauthn-keycloak). The [Passkeys](/docs/authentication/passkeys) docs cover the Phase Two specifics.

## What to watch for

- **Account recovery.** A customer who loses their only device needs a way back in. Keep email-based recovery working, and encourage users to register passkeys that sync across their devices.
- **Shared and older devices.** Some customers will sign in from a device that cannot hold a passkey. The password path, or a [magic link](/docs/authentication/magic-links), covers them.
- **Direct grant.** Passkeys only work in browser flows. A client with Direct Access Grants enabled accepts a password at the token endpoint with no passkey step at all. Turn it off; see [Sign-in Methods, Grant Types and Clients](/docs/authentication/sign-in-methods).

## Do this next

Turn on passkeys in a non-production realm, register one, and time a sign-in with it against a sign-in with a password and your current second factor. Then put the same two numbers on a dashboard for production before you enable it there, so you can show the difference.

If you run Keycloak with Phase Two, passkeys are available on every cluster and need no extension or custom flow. The [go-live checklist](/docs/getting-started/launch-checklist) covers the rest of what to check before launch.
