---
id: react-native
title: Native Login for React Native
sidebar_label: React Native
description: Sign users in to Keycloak from a React Native or Expo app with your own screens using Phase Two's keycloak-native-react-native module, with passkeys, push approvals, DPoP and tokens kept in the Keychain or Android Keystore.
---

`@p2-inc/keycloak-native-react-native` signs users in to Keycloak with your app's own React Native screens. It is a New Architecture TurboModule over Phase Two's [iOS](./ios.md) and [Android](./android.md) SDKs: the native side runs the login protocol, keeps credentials in the Keychain or Android Keystore, holds the DPoP key in the Secure Enclave or Keystore, and runs the passkey, saved-password, browser and push ceremonies. JavaScript gets the login as a typed challenge model and default React screens that you can replace one challenge type at a time. An Expo config plugin does the native setup.

The module is licensed under Apache 2.0. It is below 1.0, so its API may change between releases. Your Keycloak needs the native authentication extensions; see [Server setup](./server-setup.md).

## Requirements

- React Native 0.84 or later with the New Architecture. With Expo, SDK 56 or later in a development build or EAS; Expo Go isn't supported.
- iOS 17 or later.
- Android 9 (API 28) or later: `minSdk 28`, `compileSdk 36`, and Kotlin 2.2 or later. React Native 0.87 and later already use Kotlin 2.2; on 0.84 to 0.86, set `kotlinVersion = "2.2.20"` in `android/build.gradle` and use it for the Kotlin Gradle plugin.
- A Keycloak client set up for native login as described in [Server setup](./server-setup.md).

## Install

:::info Release line
The module shares one version line with the server extensions and the native SDKs, starting with 0.3.0. Below 1.0 any release may change the API, so pin an exact version.
:::

```bash
npm install @p2-inc/keycloak-native-react-native
```

**iOS.** Run `pod install`. The pod brings in the iOS SDK as a Swift package. For passkeys and saved passwords, add the Associated Domains entitlement `webcredentials:<rp-id>` (see [Server setup](./server-setup.md#passkeys)). If your app hits linker errors with pods that include Swift packages, build with `USE_FRAMEWORKS=dynamic`.

**Android.** The browser fallback registers an activity result launcher, which Android only allows while the activity is being created. Register it in `MainActivity`:

```kotlin
import io.phasetwo.keycloak.nativeauth.reactnative.KeycloakNativeActivity

override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  KeycloakNativeActivity.register(this)
}
```

and declare the SDK's callback activity for your redirect URI in `AndroidManifest.xml`:

```xml
<activity
  android:name="io.phasetwo.keycloak.nativeauth.sdk.android.NativeAuthRedirectActivity"
  android:exported="true"
  android:theme="@android:style/Theme.Translucent.NoTitleBar">
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="myapp" android:host="auth" android:path="/callback" />
  </intent-filter>
</activity>
```

### Expo

The config plugin does both platforms' setup during `npx expo prebuild`:

```json
{
  "expo": {
    "plugins": [
      [
        "@p2-inc/keycloak-native-react-native",
        {
          "redirectUri": "myapp://auth/callback",
          "associatedDomains": ["<your-keycloak-host>"]
        }
      ]
    ]
  }
}
```

It registers the activity, declares the callback activity for `redirectUri`, raises the Android `minSdk`, `compileSdk` and Kotlin versions where needed, sets the iOS deployment target to 17.0, and adds `webcredentials:` entries for `associatedDomains`.

## Quick start

### Configure

Create one instance per issuer and client, and keep it for the life of the app. The issuer is your realm's URL, including `/realms/<realm>`:

```ts
import { KeycloakNative } from "@p2-inc/keycloak-native-react-native";

export const kc = KeycloakNative.configure({
  issuer: "https://<your-keycloak-host>/realms/<your-realm>",
  clientId: "my-app",
});
```

Options include `dpop` (`automatic` by default), `ephemeralWebSession` for a browser fallback that shares no cookies, and `storageNamespace`.

### Sign in with the default screens

`NativeLoginScreen` takes an unstarted login flow, starts it, shows a screen for each challenge, and reports the result. It doesn't store credentials or navigate; your app does both:

```tsx
import { useEffect, useState } from "react";
import {
  NativeLoginScreen,
  type NativeLoginFlow,
} from "@p2-inc/keycloak-native-react-native";

function Login({ onSignedIn }: { onSignedIn(): void }) {
  const [flow, setFlow] = useState<NativeLoginFlow>();
  useEffect(() => {
    kc.authentication.startLogin({ scope: "openid profile" }).then(setFlow);
  }, []);
  if (!flow) return null;
  return (
    <NativeLoginScreen
      kc={kc}
      flow={flow}
      onResult={async (result) => {
        if (result.kind === "authorized") {
          await kc.credentialsManager.store(result.credentials);
          onSignedIn();
        }
        flow.release();
      }}
    />
  );
}
```

The default screens cover usernames, passwords, passkeys, TOTP, email and SMS codes, recovery codes, push approvals, the native required actions, "try another way" choices, resend countdowns and the browser fallback. They ship in English and German and follow the device locale.

### Call your API

`resourceRequestHeaders` returns the headers for a request, refreshing the tokens natively when they're about to expire: `Authorization: Bearer …`, or `Authorization: DPoP …` with a `DPoP` proof when the tokens are DPoP-bound:

```ts
const url = "https://api.example.com/me";
const headers = await kc.resourceRequestHeaders("GET", url);
const response = await fetch(url, { method: "GET", headers });
```

Build new headers for every request, with the exact method and URL you send, because a DPoP proof is bound to both.

## Customize the screens

Replace one default screen with `presenters`, keeping the others:

```tsx
<NativeLoginScreen
  kc={kc}
  flow={flow}
  presenters={{ totp: MyTotpScreen }}
  onResult={handleResult}
/>
```

A presenter receives the typed `challenge` and its alternatives, whether a request is in flight, the strings, and actions to `submit` an answer, `switchTo` another alternative or `cancel`. The building blocks of the default screens, such as `ChallengeFrame` and `PrimaryButton`, are exported. `chooser` replaces the "try another way" list, `header` adds content such as a logo above every screen, and `strings` replaces some or all texts.

To build every screen yourself, drive the flow: `start()` returns the first step, and each `respond` returns the next, until the step's `kind` is `authorized`:

```ts
const flow = await kc.authentication.startLogin({ scope: "openid profile" });
let step = await flow.start();
while (step.kind === "challenges") {
  const challenge = step.supportedChallenges[0];
  switch (challenge.type) {
    case "passkey":
      step = await flow.usePasskey(challenge);
      break;
    case "totp":
      step = await flow.respond({ kind: "totp", code: await askForCode(challenge.params.digits) }, challenge);
      break;
    // … one case per challenge type your app supports
  }
}
const credentials =
  step.kind === "authorized" ? step.credentials : await kc.webFallback.complete(step.request, flow);
await kc.credentialsManager.store(credentials);
flow.release();
```

`challenge.params` is typed per challenge type. An error on a challenge, such as a wrong password, comes back inline on the next set of challenges rather than as a thrown error. Passkey ceremonies and push enrollment run natively in one call, so WebAuthn material and device keys never pass through JavaScript.

## Passkeys and saved passwords

Passkeys need the app associated with the realm's passkey domain: an Associated Domains entry on iOS, and `assetlinks.json` plus the app's signing-key origin on Android (see [Server setup](./server-setup.md#passkeys)). The default screens then offer passkey login and registration. `kc.registerNewPasskey(label)` registers one later for the signed-in user; if they signed in too long ago, it is refused until they step up.

The same association lets password managers offer the site's saved passwords. The default screens offer "Use a saved password" and, on Android, offer to save a typed password after sign-in; iOS AutoFill does that by itself. `kc.pickSavedPassword()` and `kc.savePassword(username, password)` do the same for custom screens.

## Push approvals

The device side of push approvals is `kc.push`. Keep your notification library (for example React Native Firebase Messaging): pass its token to the module and forward its messages.

```ts
// Enroll from inside the app, or let Keycloak ask for it during login with pushRegistration.
await kc.push.enroll("Pixel 9", { type: "fcm", id: await messaging().getToken() });

// Token changes.
messaging().onTokenRefresh((id) => kc.push.updateProvider({ type: "fcm", id }));

// Messages: decode, then show the approval.
messaging().onMessage(async (message) => {
  const payload = await kc.push.handleMessage(message.data ?? {});
  if (payload) navigation.navigate("Approvals", { focus: payload.cid });
});
```

On iOS, pass the APNs device token as hex with `type: "apns"`. `<PushApprovalsScreen kc={kc} focus={cid} />` lists pending approvals with number matching; show it when a notification is tapped and when the app opens, because a backgrounded app may not see the message until the user taps it. The server needs an APNs key and a Firebase service account (see [Server setup](./server-setup.md#push-approvals)). Push uses the DPoP key as the device key, so sign in with DPoP enabled.

## Tokens, DPoP and logout

- **Refresh tokens stay native.** Only the access token and ID token reach JavaScript. The refresh token stays in the Keychain or Keystore, the SDK refreshes natively, and there is deliberately no way to export it: every npm package in the app can read what JavaScript holds, AsyncStorage is plain text, developer tools and crash reporters capture values, and over-the-air updates can replace the JavaScript. If a backend or web view needs a session, have your server exchange tokens.
- **DPoP.** The module uses DPoP automatically, with a Secure Enclave or Keystore key where the device has one. Tokens are bound once Keycloak's DPoP feature is on; your APIs must then accept `Authorization: DPoP` (see [Server setup](./server-setup.md#dpop)). `kc.dpopKeyThumbprint()` returns the key's thumbprint, which resource servers compare with the token's `cnf.jkt`.
- **Step-up.** `kc.authentication.stepUp({ acrValues: "2" })` returns a flow that asks only for what the higher level needs.
- **Logout.** `kc.credentialsManager.logout()` ends the session on the server and clears local credentials.

## Full guide

The [React Native integration guide](https://github.com/p2-inc/native-apps/blob/main/docs/react-native-integration.md) on GitHub covers every option and challenge type, errors, push and the Expo plugin in more detail. The module's [example app](https://github.com/p2-inc/native-apps/tree/main/react-native/keycloak-native-react-native/example) signs in against a local Keycloak with several flows.
