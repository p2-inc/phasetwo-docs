---
id: server-setup
title: Native Login - Keycloak Server Setup
sidebar_label: Server setup
description: Install Phase Two's native authentication extensions in Keycloak, create a native login flow and client, and configure DPoP, passkeys, email and SMS codes, and push approvals for iOS, Android, React Native and Flutter apps.
---

Native login needs Phase Two's native authentication extensions in Keycloak, a login flow built from native authenticators, and a client that is allowed to use it. This page covers that server side; the [iOS](./ios.md), [Android](./android.md), [React Native](./react-native.md) and [Flutter](./flutter.md) pages cover the app.

:::tip Phase Two hosted Keycloak
On Phase Two hosted Keycloak you don't install anything yourself. [Contact us](/contact) to have native authentication enabled on your cluster, including DPoP and the push notification settings. The flow and client configuration below is the same.
:::

## Requirements

- Keycloak 26.4, 26.6 or 26.8. The extensions are built against 26.8 and tested against stock 26.4, 26.6 and 26.8 servers; versions older than 26.4 aren't supported.
- HTTPS, with Keycloak's external hostname configured so that the URLs the app calls match the issuer in the tokens.

The project is below 1.0, so the protocol and APIs may change between releases. The extensions and the SDKs share one version number; use matching releases and pin exact versions.

## Install the extensions

Each [release](https://github.com/p2-inc/native-apps/releases) has a `keycloak-native-auth-providers-<version>.zip` with the provider jars: the challenge endpoint, the native authenticators and required actions, email and SMS codes, and push support (including a build of the open-source [Keycloak push MFA extension](https://github.com/ba-itsys/keycloak-push-mfa-extension) that the push feature builds on). The jars depend on each other, so install all of them together:

```bash
unzip keycloak-native-auth-providers-0.2.0.zip -d native-auth
cp native-auth/*.jar /opt/keycloak/providers/
/opt/keycloak/bin/kc.sh build
```

Then restart Keycloak. To check the installation, open the realm's native metadata, which lists the endpoints and the challenge types the server supports:

```bash
curl https://<your-keycloak-host>/realms/<your-realm>/native-auth/metadata
```

Add `/auth` before `/realms` if your Keycloak is served under that path.

The extensions are licensed under the [Elastic License 2.0](https://github.com/p2-inc/native-apps/blob/main/keycloak-native-auth/COPYING), like Phase Two's other Keycloak extensions; the SDKs are Apache 2.0.

## Create the native flow

The challenge endpoint runs its own top-level authentication flow, separate from the realm's browser flow. By default it runs the flow with the alias `native`, so the simplest setup is to create a flow named `native` under **Authentication**. You don't bind it anywhere, because the endpoint finds it by alias; in particular, don't make it the realm's browser flow.

Build it from these native authenticators:

| Provider ID | Shown in the admin console as | Use |
| --- | --- | --- |
| `native-username` | Native: Username | Identifies the user by username or email. Unknown users get a convincing password challenge that always fails, so the login doesn't reveal which accounts exist. |
| `native-password` | Native: Password | The user's Keycloak password. |
| `native-passkey` | Native: Passkey | A passkey, either after the username or before it (discoverable login). Uses the realm's WebAuthn Passwordless policy. Set `enrol-on-first-login` to offer passkey registration to users who don't have one yet. |
| `native-totp` | Native: TOTP | An existing authenticator-app code, following the realm's OTP policy. |
| `native-otp` | Native: one-time code (email / SMS) | A code sent by email or SMS, with resend cooldown and attempt limits. |
| `native-recovery-code` | Native: recovery code | One of the user's recovery codes. |
| `native-push` | Native: push MFA (approve on device) | An approval on the user's enrolled phone, optionally with number matching. |

Keycloak's condition executions, such as **Condition - user configured** and **Condition - Level of Authentication**, work in the native flow too. A typical flow looks like the realm browser flow with the native authenticators swapped in:

```text
native
├── Native: Username                          REQUIRED
├── Primary factor (sub-flow)                 REQUIRED
│   ├── Native: Passkey                       ALTERNATIVE
│   └── Native: Password                      ALTERNATIVE
└── Second factor (sub-flow)                  CONDITIONAL
    ├── Condition - user configured           REQUIRED
    ├── Native: TOTP                          ALTERNATIVE
    ├── Native: one-time code (email / SMS)   ALTERNATIVE
    ├── Native: recovery code                 ALTERNATIVE
    └── Native: push MFA (approve on device)  ALTERNATIVE
```

Alternatives are offered to the user as choices ("try another way"), in flow order, and only when the user has the credential: a user without a passkey isn't offered one. Put steps that must all happen in separate required sub-flows rather than mixing required and alternative executions at one level.

Only native authenticators and conditions belong in this flow. If an execution tries to render a browser page, the login ends with a server error. If you'd rather send those logins to the browser, set the realm attribute `native-auth.non-native-execution` to `redirect_to_web`.

The repository's [demo realm](https://github.com/p2-inc/native-apps/tree/main/keycloak-native-auth/demo/realm-export) has complete, importable examples: the flow above, a passkey-first flow, step-up with levels of authentication, email and SMS codes, and push.

## Enable the native required actions

Required actions run after the factors and before the app receives its tokens. Under **Authentication** > **Required actions**, enable the native versions of the actions you use:

| Provider ID | Serves |
| --- | --- |
| `native-update-password` | Keycloak's **Update Password** |
| `native-verify-email` | Keycloak's **Verify Email**, with a code sent by email instead of a link |
| `native-terms` | Keycloak's **Terms and Conditions** |
| `native-passkey-register` | Registering a passkey in the app |
| `native-push-enroll` | Enrolling the phone for push approvals, in place of `push-mfa-register` |

Keep Keycloak's own actions enabled as well: they still serve browser logins, and the native versions take over only during a native login. Any other pending required action, such as **Update Profile**, sends the user to the system browser to finish that sign-in. That handoff uses Keycloak's pushed authorization requests (enabled by default) and the client's redirect URI.

## Create the client

1. Create an **OpenID Connect** client with **Client authentication** off. A mobile app is a public client and has no secret.
1. Under **Capability config**, keep **Standard flow** checked. The app exchanges its authorization code at the standard token endpoint.
1. In the client's **Advanced** tab, set **Proof Key for Code Exchange Code Challenge Method** to `S256`. The SDKs send PKCE on every login; requiring it on the client makes the server enforce it.
1. Under **Valid redirect URIs**, add the URI the browser returns to when a login has to finish on the web, for example `myapp://auth/callback`. A successful native login doesn't redirect, but the browser fallback does.
1. Add the client attribute `native-auth.enabled` with the value `true`. The challenge endpoint refuses clients without it.

Client and realm attributes aren't editable as free-form fields in the admin console; set them with the Admin REST API, `kcadm.sh` or a realm import. In a client representation:

```json
{
  "clientId": "my-app",
  "publicClient": true,
  "standardFlowEnabled": true,
  "redirectUris": ["myapp://auth/callback"],
  "attributes": {
    "pkce.code.challenge.method": "S256",
    "native-auth.enabled": "true"
  }
}
```

Optional attributes:

| Where | Attribute | Effect |
| --- | --- | --- |
| Client | `native-auth.flow-alias` | Runs a different native flow for this client, for example a passkey-first flow. |
| Realm | `native-auth.flow-alias` | Changes the realm's default native flow from `native`. |
| Client | `native-auth.web-fallback-redirect-uri` | The redirect URI used for the browser fallback. Defaults to the first registered redirect URI without a wildcard. |
| Realm | `native-auth.non-native-execution` | `redirect_to_web` sends logins that hit a browser-only execution to the browser instead of failing. |
| Realm | `native-auth.passkey-registration-max-age` | How recently, in seconds, the user must have signed in to register a passkey or enroll for push after login. Default `300`. |

The [configuration reference](https://github.com/p2-inc/native-apps/blob/main/keycloak-native-auth/README.md#configuration-reference) lists every setting.

## DPoP

We recommend DPoP for every native client. With DPoP, Keycloak binds the authorization code, the access token and the refresh token to a key that the SDK keeps on the device, in the Secure Enclave on iOS and the Android Keystore on Android where the device has one, so a token copied off the device is useless without it. The SDKs send DPoP proofs by default; binding happens when Keycloak's DPoP feature is enabled on the server. Check that the realm's native metadata lists `dpop_signing_alg_values_supported`.

:::caution Your APIs must accept DPoP
APIs that receive DPoP-bound access tokens must accept `Authorization: DPoP <token>` and validate the `DPoP` proof that comes with each request (its signature, method, URL, age, replay, and the token's `cnf.jkt`). The SDKs build these headers for the app. If an API can only accept `Bearer` tokens, don't enable DPoP for the clients that call it until it can.
:::

## Passkeys

Passkeys use the realm's **WebAuthn Passwordless Policy** (under **Authentication** > **Policies**): its relying party ID, user verification and resident key settings apply to both passkey login and registration. The relying party ID must be Keycloak's host or a parent domain of it, and the app must be associated with that domain:

- **iOS**: add an Associated Domains entitlement `webcredentials:<rp-id>` to the app, and serve `https://<rp-id>/.well-known/apple-app-site-association` listing the app.
- **Android**: serve `https://<rp-id>/.well-known/assetlinks.json` with a `delegate_permission/common.get_login_creds` statement for the app's package name and signing certificate fingerprint. Add the app's origin, `android:apk-key-hash:<base64url SHA-256 of the signing certificate>`, to the policy's **Extra Origins**, once per signing key (debug and release keys differ).

iOS signs passkey assertions for the origin `https://<rp-id>`. If that isn't Keycloak's public URL, add it to **Extra Origins** as well. The same domain association lets iCloud Keychain, Google Password Manager and other password managers offer the site's saved passwords in the app, so it's worth serving even for password-only logins.

## Email and SMS codes

The `native-otp` authenticator sends codes through a channel set in its execution configuration: `email` (the default, through the realm's SMTP settings, with the email text in the theme template `native-otp.ftl`) or `sms-webhook`. The SMS channel posts `{"to": "<number>", "message": "<text>"}` to a webhook you provide, which forwards it to your SMS provider:

```bash
--spi-native-otp-sender--sms-webhook--url=https://sms.example.com/send
--spi-native-otp-sender--sms-webhook--token=<optional bearer token>
--spi-native-otp-sender--sms-webhook--phone-attribute=phoneNumber
```

The phone number comes from the user attribute named by `phone-attribute`, which your user profile must allow.

## Push approvals

Push approvals let a user approve a sign-in on a phone they enrolled earlier, optionally by picking the number shown on the login screen. To use them, add `native-push` to the native flow's second factor, enable the `push-mfa-register` and `native-push-enroll` required actions, and configure a sender for each platform you ship:

- **APNs (iOS)**: an Apple Push Notification service key from your Apple developer account.

  ```bash
  --spi-push-notification-sender--apns--team-id=<Apple team ID>
  --spi-push-notification-sender--apns--key-id=<key ID>
  --spi-push-notification-sender--apns--key-file=/opt/keycloak/conf/apns-key.p8
  --spi-push-notification-sender--apns--topic=<your app's bundle ID>
  --spi-push-notification-sender--apns--environment=production
  ```

- **Firebase Cloud Messaging (Android)**: a Firebase project with your Android app registered, and its service-account key file.

  ```bash
  --spi-push-notification-sender--fcm--google-fcm-url=https://fcm.googleapis.com/v1/projects/<project id>/messages:send
  GOOGLE_APPLICATION_CREDENTIALS=/opt/keycloak/conf/fcm-service-account.json
  ```

A notification is only a hint: the app fetches the pending approval from Keycloak and signs its answer with the device key, so push also works without a sender, with the app checking for pending approvals when it opens. Push approvals use the same device key as DPoP, so enable DPoP for clients that use push.

## Try it locally

The repository's [demo](https://github.com/p2-inc/native-apps/tree/main/keycloak-native-auth) runs Keycloak with the extensions, a preconfigured realm with test users, a mail catcher and a sample API in Docker Compose, and each SDK has an example app that signs in against it. The [developer documentation](https://github.com/p2-inc/native-apps/tree/main/docs) covers the protocol, every authenticator's options, flow examples, troubleshooting and the security model in depth.
