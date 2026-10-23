---
id: passkeys
title: Passkeys
sidebar_label: Passkeys
---

Passkeys let users sign in with the device they already have, using a fingerprint, face, or device PIN, instead of typing a password. They are built on **WebAuthn**: the private key stays on the user's device and is bound to your domain, so there is nothing to phish, leak, or replay from another site's breach.

They are also faster. In published measurements from Google, Microsoft and the FIDO Alliance, passkey sign-in took roughly half the time of a password or less, and succeeded far more often. Our customers report the same after introducing them. The figures and sources are in [Passkeys make login faster](/blog/keycloak-passkeys-faster-login).

This page covers how to turn passkeys on, how to get users to enroll, and how to make sure nobody gets stuck when a passkey doesn't work. For the lower-level WebAuthn settings and the hand-built flows, see [WebAuthn](./webauthn.md). For a step-by-step walkthrough with verification commands, see the [Passkeys and WebAuthn tutorial](/tutorials/authentication/passkeys-webauthn).

## Two ways to use passkeys

- **Passwordless sign-in.** The passkey replaces the password, and because it already combines something the user has with a biometric or PIN, it replaces the second factor too. This is the fast path and the one most teams want.
- **Second factor (2FA).** The user signs in with a password and then confirms with a passkey. This strengthens MFA without changing the first step.

## Turn on passwordless passkeys

Keycloak has a single realm setting for this. You do not need to copy or edit a flow.

1. In the Admin Console, go to **Realm settings → Login → Login screen customization**.
2. Turn on **Enable Passkeys**.

That changes the standard login page in two ways. The username field now offers saved passkeys through the browser's autofill, and a **Sign in with Passkey** button appears. The password field stays where it was, so users who don't have a passkey sign in exactly as before, and users who do can pick it from the autofill or the button.

A **Passkey Mediation** setting appears next to the switch. Leave it on the default, **Conditional**, which offers passkeys through autofill without an extra dialog. It is the fastest experience for users who have a passkey, and invisible to users who don't.

## Passkeys as a second factor

The standard browser flow already contains a **WebAuthn Authenticator** step, disabled, inside the **Browser - Conditional 2FA** sub-flow, next to the OTP step. You don't need to add or remove steps. Duplicate the browser flow, change that step's requirement in the copy, and bind the copy as the realm's browser flow. Don't delete the OTP step: that throws away every authenticator app your users have already set up.

How you set the requirement decides whether the passkey is optional or mandatory:

- **Optional:** set **WebAuthn Authenticator** to **Alternative**. Users who have registered a passkey for 2FA are asked for it after their password. Users who have both a passkey and an authenticator app are shown one of them with a **Try another way** link to pick the other. Users with no second factor sign in with their password alone and are not sent to enroll. Invite users to register a passkey with `kc_action=webauthn-register`, as described below.
- **Mandatory:** set **WebAuthn Authenticator** to **Required** and disable that sub-flow's **Condition - user configured**, so users without a passkey are sent to register one. The [tutorial](/tutorials/authentication/passkeys-webauthn) walks through this setup and how to confirm each change took effect. There are two steps named *Condition - user configured* in the browser flow; change only the one inside **Browser - Conditional 2FA**.

## Getting users to enroll

Availability alone does not get passkeys used. Microsoft found that enrollment from account settings was under 1% of its total, while about a quarter of users who were prompted at the right moment engaged with the prompt. Plan the prompt.

**Ask right after a successful sign-in, and let the user decline.** The best way to do this in Keycloak is an application-initiated action. After the user signs in, show your own short prompt in your application. If they accept, send them back to the authorization endpoint with `kc_action=webauthn-register-passwordless` added to the request. Keycloak shows the registration page with an option to cancel, then returns the user to your application with `kc_action_status` set to `success`, `cancelled`, or `error`, so you know whether to ask again later.

**Avoid making registration a required action for everyone.** Setting **Webauthn Register Passwordless** as a default action, or adding it to users, forces them to register before they can continue. That puts a gate between your users and your application, and the users least comfortable with passkeys are the ones it stops. Use it only for small groups you have told in advance.

**Use words people recognize.** "Passkey" is unfamiliar to many users, while "face, fingerprint, or screen lock" is not. To change the button label, go to **Realm settings → Localization → Realm overrides**, choose the language, and override the key `webauthn-doAuthenticate`, for example with "Sign in with face, fingerprint, or screen lock." In Microsoft's testing, a prompt about faster sign-in drew the most engagement, so lead with speed.

**Let users manage their own passkeys.** The [Account Console](../keycloak/account-console.md) lets users add more than one passkey and remove ones they no longer use. Technical users will look for it; most others will not find it unprompted.

## When a passkey doesn't work

Passkeys are supported in all current major browsers and operating systems, but individual attempts still fail. The common causes:

- An older browser or operating system, or a managed device where passkeys are turned off by policy.
- An in-app browser. Links opened inside social and messaging apps often load in an embedded browser that may not support passkeys. Your own mobile app has the same problem if it shows the login page in an embedded web view; open sign-in in the system browser instead.
- The passkey is saved on another device. Signing in with a phone by scanning a QR code works, but needs Bluetooth on both devices and the phone nearby.
- The passkey was deleted from the device or password manager while Keycloak still has it registered.
- The user cancels the prompt, or the biometric check fails. The browser reports a cancellation, a timeout, and a refusal with the same generic error.

How the standard login page handles these, with **Enable Passkeys** on:

| What happens | Result |
|---|---|
| The browser doesn't support passkeys, or autofill isn't available | Nothing visible. The passkey autofill is skipped and the password field works as usual. |
| The user dismisses the passkey autofill | Nothing visible. They stay on the login page and can type their password. |
| The user clicks **Sign in with Passkey** and then cancels, or the passkey fails | The login page reloads with a message that the passkey operation was not allowed or timed out and to try again. The password field is still there. |

In every case the user stays on a page where they can still type their password. The same message appears when a user's passkey for a second factor isn't on the device they're using.

To keep everyone able to sign in:

1. **Keep a password or another method available** until you know passkeys work for all of your users. With **Enable Passkeys**, the password stays on the same page.
2. **If you remove passwords, offer an alternative.** When a flow has more than one alternative step and the user has more than one available, Keycloak shows a **Try another way** link. A [magic link](./magic-links.md) or email one-time code works for every user, because everyone has an inbox and nothing to remember.
3. **Keep recovery independent of the passkey.** **Forgot password** or an emailed link must work for a user who has lost every device. Encourage passkeys that sync across a user's devices, so one lost phone is not a lost account.
4. **Measure.** Track sign-in time and success rate by method, and how often a passkey attempt ends with the user signing in some other way, broken down by browser and platform. A rising fallback rate on one platform usually points to an in-app browser or an operating system update.

## Passkeys and the token endpoint

Passkeys only work in browser flows. A client with **Direct Access Grants** enabled accepts a username and password at the token endpoint with no passkey step at all, so a user who has moved to passkeys can still be signed in with their old password that way. Turn direct grants off for every client that doesn't need them; see [Sign-in Methods, Grant Types and Clients](./sign-in-methods.md).

## Related guides

- [WebAuthn](./webauthn.md)
- [Passkeys and WebAuthn tutorial](/tutorials/authentication/passkeys-webauthn)
- [Magic Links](./magic-links.md)
- [One-Time Passwords](./otps.md)
- [Understanding Flows](./understanding-flows.md)
- [Go-Live Checklist](../getting-started/launch-checklist.md)
