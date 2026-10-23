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

## Will your customers understand it?

Most of them already know more than you might expect. In the [FIDO Alliance's 2025 consumer survey](https://fidoalliance.org/fido-alliance-champions-widespread-passkey-adoption-and-a-passwordless-future-on-world-passkey-day-2025/) of 1,389 adults across five countries, 74% had heard of passkeys and 69% had turned them on for at least one account. About half already considered them more secure (53%) or more convenient (54%) than passwords.

The word itself is the hard part. Microsoft found that "passkey" was often unfamiliar, but "face, fingerprint, or PIN" was well understood, so its screens connect the two. It also tested how to pitch them: a message about faster sign-in drew 27% click-through and one about security 24%, while "easier" did noticeably worse. And customers enroll when you ask them, not on their own: about a quarter of the people who saw Microsoft's prompt engaged with it, while enrollment from account settings was under 1% of the total.

That plays out differently depending on who your customer is:

- **The customer who has never heard the word.** Think of the least technical person who buys from you. They have never set up a passkey on purpose, but they unlock their phone with their face or fingerprint every day. Show them "Sign in with your face, fingerprint, or screen lock," not "Create a passkey." Keep their password and email recovery working so they are never stuck, and never make the passkey a condition of signing in.
- **The average customer.** They have probably already been offered a passkey by Google, Apple, or a large retailer, and may have accepted. Ask once, right after a successful sign-in, and lead with speed, the message that tested best. If they decline, do not ask again on every visit.
- **The technical customer.** They want control. They will register more than one passkey, keep them in a password manager, or use a hardware security key, and they will look for a place to see and remove their passkeys. Keycloak's [Account Console](/docs/keycloak/account-console) covers that, and this is the one group for whom settings-based enrollment works.

Across all three, the pattern is the same: a plain-language prompt at the right moment does more than any amount of availability in a settings page.

## Introducing passkeys in Keycloak

On Keycloak 26.7 and later, passwordless passkeys are a realm setting rather than a flow you build. **Realm settings → Login → Enable Passkeys** turns them on for the stock browser flow, which then offers a passkey option and tags the username field for browser autofill. Users who have not registered a passkey sign in exactly as before.

The rollout that works is gradual:

1. **Turn on passkeys without removing passwords.** Existing customers keep signing in the way they know, and passkeys appear as an option.
2. **Prompt enrollment right after sign-in, not at a gate.** Microsoft invites users to enroll immediately after they authenticate, and nearly everyone who starts registration finishes it. Do not put registration between a customer and their checkout. In Keycloak, do this as an application-initiated action: after sign-in, show your own short prompt, and if the customer says yes, send them to the authorization endpoint with `kc_action=webauthn-register-passwordless`. Keycloak shows the registration page with a cancel option and reports the outcome back to your application in `kc_action_status`. Avoid setting **Webauthn Register Passwordless** as a required action on users instead: a required action has to be completed before the user can continue, which is exactly the gate to avoid. The [Account Console](/docs/keycloak/account-console) lets users add and remove passkeys themselves, but expect few to find it unprompted.
3. **Leave the default mediation alone.** The default, conditional mediation, offers passkeys through the browser's autofill without an extra dialog, which is the fastest experience for users who have one and invisible to users who do not.
4. **Measure before and after.** Record time from the login page loading to the user landing back in your application, and the share of sign-in attempts that succeed, split by method. Those are the two numbers every published study uses, and they are the ones your own customers will feel.

The full setup, including passkeys as a second factor instead of a replacement and the ways each setup can fail quietly, is in [Passkeys and WebAuthn in Keycloak](/tutorials/authentication/passkeys-webauthn). If you want to know which credential type you actually want, start with [Keycloak passkeys and WebAuthn: what's the difference?](/blog/webauthn-keycloak). The [Passkeys](/docs/authentication/passkeys) docs cover the Phase Two specifics.

## When a passkey doesn't work

Passkeys are supported in every current major browser and operating system, but "supported" is not "works every time for every customer." Plan for the attempts that fail, because a customer who cannot get in will not wait for you to fix it. The common causes:

- **An older browser or operating system** that does not support passkeys, or a managed work device where they are turned off by policy.
- **An in-app browser.** A customer who taps your link inside a social or messaging app often lands in that app's embedded browser, which may not support passkeys at all. Your own mobile app has the same problem if it shows login in an embedded web view; use the system browser for sign-in instead, which is the recommended practice for OAuth in native apps anyway.
- **The passkey is on a different device.** A passkey saved to a phone is not automatically on the customer's work laptop. Signing in with a phone by scanning a QR code works, but it needs Bluetooth on both devices and the phone nearby.
- **The passkey was deleted** from the device or password manager, while Keycloak still has it registered.
- **The customer cancels the prompt, or the fingerprint or face check fails.** The browser reports a timeout, a cancellation and a refusal as the same generic error, so your login page cannot tell them apart. Treat them all as "offer another way."

None of these should end in a dead end. The fallback design that works:

1. **Keep the password on the same page.** Keycloak's **Enable Passkeys** setting already does this. The login page keeps the username and password fields and adds the passkey option next to them, so a customer whose passkey fails can type their password without going anywhere.
2. **Offer a passwordless fallback if you have dropped passwords.** In a flow where the passkey is one of several alternative steps, Keycloak shows a **Try another way** link that lets the customer pick a different method. A [magic link](/docs/authentication/magic-links) or an email one-time code is the natural choice, because every customer has an inbox and nothing to remember.
3. **Say it in plain language.** "Use your password instead" or "Email me a sign-in link" next to the passkey button, not an error code. The customer who never wanted a passkey should not have to understand why it failed.
4. **Keep recovery independent of the passkey.** **Forgot password** or an emailed link must work for a customer who has lost every device. Never make the passkey the only way back into an account. Encourage customers to use passkeys that sync across their devices, so one lost phone is not a lost account.
5. **Measure the fallback rate.** Track how often a passkey attempt ends with the customer signing in another way, by browser and platform. A rising rate on one platform is usually an in-app browser or an operating system update, and it is much cheaper to find in a dashboard than in support tickets.

Treat the passkey as the fast path, not the only path. The speed gains in the published numbers come from the customers for whom it works, and the fallback is what keeps the rest from abandoning.

## What to watch for

- **Direct grant.** Passkeys only work in browser flows. A client with Direct Access Grants enabled accepts a password at the token endpoint with no passkey step at all. Turn it off; see [Sign-in Methods, Grant Types and Clients](/docs/authentication/sign-in-methods).

## Do this next

Turn on passkeys in a non-production realm, register one, and time a sign-in with it against a sign-in with a password and your current second factor. Then put the same two numbers on a dashboard for production before you enable it there, so you can show the difference.

If you run Keycloak with Phase Two, passkeys are available on every cluster and need no extension or custom flow. The [go-live checklist](/docs/getting-started/launch-checklist) covers the rest of what to check before launch.
