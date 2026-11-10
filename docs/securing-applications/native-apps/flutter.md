---
id: flutter
title: Native Login for Flutter
sidebar_label: Flutter
description: Sign users in to Keycloak from a Flutter app with your own widgets using Phase Two's keycloak_native_flutter plugin, with passkeys, push approvals, DPoP and tokens kept in the Keychain or Android Keystore.
---

`keycloak_native_flutter` signs users in to Keycloak with your app's own Flutter screens. It is a plugin over Phase Two's [iOS](./ios.md) and [Android](./android.md) SDKs: the native side runs the login protocol, keeps credentials in the Keychain or Android Keystore, holds the DPoP key in the Secure Enclave or Keystore, and runs the passkey, saved-password, browser and push ceremonies. Dart gets the login as sealed challenge classes and default widgets that you can replace one challenge type at a time.

The plugin is licensed under Apache 2.0. It is below 1.0, so its API may change between releases. Your Keycloak needs the native authentication extensions; see [Server setup](./server-setup.md).

## Requirements

- Flutter 3.35 or later.
- iOS 17 or later, with Flutter's Swift Package Manager integration (the default; the plugin has no podspec).
- Android 9 (API 28) or later: `minSdk 28`, `compileSdk 37`, and Kotlin 2.2 or later. Flutter's current app template already uses a newer Kotlin; apps created from older templates may have to raise `org.jetbrains.kotlin.android` in `android/settings.gradle.kts`.
- A Keycloak client set up for native login as described in [Server setup](./server-setup.md).

## Install

:::info Coming to pub.dev with the next release
The plugin will be published on pub.dev as `keycloak_native_flutter` with release 0.3.0, together with the Android libraries on Maven Central that it depends on. Until then it lives in the [repository](https://github.com/p2-inc/native-apps/tree/main/flutter/keycloak_native_flutter), where its example app builds the SDKs from source and signs in against the local demo Keycloak.
:::

```yaml
# pubspec.yaml
dependencies:
  keycloak_native_flutter: ^0.3.0
```

**iOS.** Raise the deployment target to 17.0 (`IPHONEOS_DEPLOYMENT_TARGET` in the Runner project). For passkeys and saved passwords, add the Associated Domains entitlement `webcredentials:<rp-id>` (see [Server setup](./server-setup.md#passkeys)). The browser fallback needs no URL scheme registration.

**Android.** Raise `minSdk` to 28 and `compileSdk` to 37 in `android/app/build.gradle.kts`. The browser fallback registers an activity result launcher, which needs a `ComponentActivity`, so make `MainActivity` a `FlutterFragmentActivity`:

```kotlin
import io.flutter.embedding.android.FlutterFragmentActivity

class MainActivity : FlutterFragmentActivity()
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

## Quick start

### Configure

Create one instance per issuer and client, and keep it for the life of the app. The issuer is your realm's URL, including `/realms/<realm>`:

```dart
import 'package:keycloak_native_flutter/keycloak_native_flutter.dart';

final kc = await KeycloakNative.configure(
  issuer: Uri.parse('https://<your-keycloak-host>/realms/<your-realm>'),
  clientId: 'my-app',
);
```

`KeycloakNativeOptions` include `dpop` (`DPoPMode.automatic` by default), `ephemeralWebSession` for a browser fallback that shares no cookies, and `storageNamespace`.

### Sign in with the default screens

`NativeLoginView` takes an unstarted login flow, starts it, shows a screen for each challenge, and reports the result. It doesn't store credentials or navigate; your app does both:

```dart
class Login extends StatefulWidget {
  const Login({super.key, required this.onSignedIn});
  final VoidCallback onSignedIn;

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  NativeLoginFlow? _flow;

  @override
  void initState() {
    super.initState();
    kc.authentication
        .startLogin(const LoginParameters(scope: 'openid profile'))
        .then((flow) => setState(() => _flow = flow));
  }

  @override
  Widget build(BuildContext context) {
    final flow = _flow;
    if (flow == null) return const SizedBox.shrink();
    return NativeLoginView(
      kc: kc,
      flow: flow,
      onResult: (result) async {
        if (result is NativeLoginAuthorized) {
          await kc.credentialsManager.store(result.credentials);
          widget.onSignedIn();
        }
        await flow.dispose();
      },
    );
  }
}
```

The default screens cover usernames, passwords, passkeys, TOTP, email and SMS codes, recovery codes, push approvals, the native required actions, "try another way" choices, resend countdowns and the browser fallback. They ship in English and German and follow the app's locale.

### Call your API

`resourceRequestHeaders` returns the headers for a request, refreshing the tokens natively when they're about to expire: `Authorization: Bearer …`, or `Authorization: DPoP …` with a `DPoP` proof when the tokens are DPoP-bound. With `package:http`, a client that adds them to every request looks like this:

```dart
class KeycloakClient extends http.BaseClient {
  KeycloakClient(this.kc, [http.Client? inner]) : inner = inner ?? http.Client();
  final KeycloakNative kc;
  final http.Client inner;

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    request.headers.addAll(
      await kc.credentialsManager.resourceRequestHeaders(request.method, request.url),
    );
    return inner.send(request);
  }
}
```

Build new headers for every request, with the exact method and URL you send, because a DPoP proof is bound to both.

## Customize the screens

Replace one default screen with `presenters`, keeping the others:

```dart
NativeLoginView(
  kc: kc,
  flow: flow,
  presenters: {ChallengeType.totp: (context, p) => MyTotpScreen(p)},
  onResult: handleResult,
);
```

A presenter receives a `ChallengePresentation` with the typed challenge and its alternatives, whether a request is in flight, the strings, and actions to `submit` an answer, `switchTo` another alternative or `cancel`. The default screens and their building blocks, such as `ChallengeFrame` and `Countdown`, are exported. `chooser` replaces the "try another way" list, `header` adds content such as a logo above every screen, and `strings` replaces the texts; subclass `NativeLoginStrings` to reword them or add a language.

To build every screen yourself, drive the flow: `start()` returns the first step, and each `respond` returns the next, until the step is an `AuthorizedStep`:

```dart
final flow = await kc.authentication.startLogin(const LoginParameters(scope: 'openid profile'));
var step = await flow.start();
while (step is ChallengesStep) {
  final challenge = step.supportedChallenges.first;
  step = await switch (challenge) {
    PasskeyChallenge() => flow.usePasskey(challenge),
    UsernameChallenge() => flow.respond(ChallengeAnswer.username(await askForUsername()), challenge),
    PasswordChallenge() => flow.respond(ChallengeAnswer.password(await askForPassword()), challenge),
    TotpChallenge(:final digits) => flow.respond(ChallengeAnswer.totp(await askForCode(digits)), challenge),
    _ => throw UnsupportedError('${challenge.type}'), // … one case per challenge type your app supports
  };
}
final credentials = switch (step) {
  AuthorizedStep(:final credentials) => credentials,
  RedirectToWebStep() => await kc.webFallback.complete(flow),
  ChallengesStep() => throw StateError('unreachable'),
};
await kc.credentialsManager.store(credentials);
await flow.dispose();
```

`Challenge` is a sealed class with one subclass per type and typed getters for its parameters. An error on a challenge, such as a wrong password, comes back inline on the next set of challenges rather than as a thrown error. Passkey ceremonies and push enrollment run natively in one call, so WebAuthn material and device keys never pass through Dart.

## Passkeys and saved passwords

Passkeys need the app associated with the realm's passkey domain: an Associated Domains entry on iOS, and `assetlinks.json` plus the app's signing-key origin on Android (see [Server setup](./server-setup.md#passkeys)). The default screens then offer passkey login and registration. `kc.passkeys.registerNewPasskey(label: …)` registers one later for the signed-in user; if they signed in too long ago, it is refused until they step up.

The same association lets password managers offer the site's saved passwords. The default screens offer "Use a saved password" and, on Android, offer to save a typed password after sign-in; iOS AutoFill does that by itself. `kc.pickSavedPassword()` and `kc.savePassword(username, password)` do the same for custom screens.

## Push approvals

The device side of push approvals is `kc.push`. The plugin doesn't register with APNs or FCM itself: keep your messaging plugin (for example `firebase_messaging`), pass its token to the SDK and forward its messages.

```dart
// Enroll from inside the app, or let Keycloak ask for it during login with pushRegistration.
await kc.push.enroll('Pixel 9',
    registration: PushProviderRegistration('fcm', await FirebaseMessaging.instance.getToken()));

// Token changes.
FirebaseMessaging.instance.onTokenRefresh
    .listen((token) => kc.push.updatePushProvider(PushProviderRegistration('fcm', token)));

// Messages: decode, then show the approval.
FirebaseMessaging.onMessage.listen((message) async {
  final notification = await kc.push.handleMessage(message.data.map((k, v) => MapEntry(k, '$v')));
  if (notification != null) {
    navigator.push(MaterialPageRoute(builder: (_) => PushApprovalsView(push: kc.push, focus: notification.cid)));
  }
});
```

On iOS, pass the APNs device token as hex with type `apns`. `PushApprovalsView` lists pending approvals with number matching; show it when a notification is tapped and when the app opens, because a backgrounded app may not see the message until the user taps it. The server needs an APNs key and a Firebase service account (see [Server setup](./server-setup.md#push-approvals)). Push uses the DPoP key as the device key, so sign in with DPoP enabled.

## Tokens, DPoP and logout

- **Refresh tokens stay native.** Only the access token and ID token reach Dart. The refresh token stays in the Keychain or Keystore, the SDK refreshes natively, and there is deliberately no way to export it: third-party packages run in the same isolate and can read Dart memory, common persistence packages such as `shared_preferences` store plain text, and values end up in logs and crash reports. `Credentials.hasRefreshToken` tells you whether there is one.
- **DPoP.** The plugin uses DPoP automatically, with a Secure Enclave or Keystore key where the device has one. Tokens are bound once Keycloak's DPoP feature is on; your APIs must then accept `Authorization: DPoP` (see [Server setup](./server-setup.md#dpop)). Use `DPoPMode.hardware` if your policy requires a hardware key.
- **Step-up.** `kc.authentication.stepUp(const LoginParameters(acrValues: '2'))` returns a flow that asks only for what the higher level needs.
- **Logout.** `kc.credentialsManager.logout()` ends the session on the server and clears local credentials.

## Full guide

The [Flutter integration guide](https://github.com/p2-inc/native-apps/blob/main/docs/flutter-integration.md) on GitHub covers every option and challenge type, errors, step-up and push in more detail. The plugin's [example app](https://github.com/p2-inc/native-apps/tree/main/flutter/keycloak_native_flutter/example) signs in against a local Keycloak with several flows.
