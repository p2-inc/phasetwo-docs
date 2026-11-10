---
id: android
title: Native Login for Android
sidebar_label: Android
description: Sign users in to Keycloak from an Android app with your own Jetpack Compose screens using Phase Two's Kotlin libraries, with passkeys, Credential Manager, push approvals over FCM, DPoP and Android Keystore token storage.
---

Phase Two's Android libraries sign users in to Keycloak with your app's own screens. They run the native login protocol, exchange the authorization code with PKCE, keep tokens in storage sealed by the Android Keystore, bind them to a Keystore key with DPoP, and run passkey, Credential Manager, browser fallback and push approval ceremonies. There are four libraries, all in the group `io.phasetwo.keycloak.nativeauth`:

- **`keycloak-native-core`**: the login flow, tokens and refresh, DPoP and the push protocol, in plain Kotlin. It comes in transitively.
- **`keycloak-native-android`**: the Android pieces: Keystore storage and keys, Credential Manager for passkeys and saved passwords, and the browser fallback.
- **`keycloak-native-ui`**: default Jetpack Compose (Material 3) screens for every challenge type, each replaceable with your own.
- **`keycloak-native-push`**: push approvals over Firebase Cloud Messaging.

The libraries are licensed under Apache 2.0. They are below 1.0, so their API may change between releases. Your Keycloak needs the native authentication extensions; see [Server setup](./server-setup.md).

## Requirements

- Android 9 (API 28) or later: `minSdk 28`.
- `compileSdk 36` or later, and Kotlin 2.2 or later. The `ui` library also needs the Compose compiler plugin matching your Kotlin version.
- A Keycloak client set up for native login as described in [Server setup](./server-setup.md).

These are the minimums from release 0.3.0. Release 0.2.0 compiles against SDK 37.

## Install

The libraries are on Maven Central from 0.3.0:

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
  repositories {
    google()
    mavenCentral()
  }
}
```

```kotlin
// app/build.gradle.kts
dependencies {
  implementation("io.phasetwo.keycloak.nativeauth:keycloak-native-android:0.3.0")
  implementation("io.phasetwo.keycloak.nativeauth:keycloak-native-ui:0.3.0")    // default Compose screens
  implementation("io.phasetwo.keycloak.nativeauth:keycloak-native-push:0.3.0")  // push approvals over FCM
}
```

Every GitHub release also attaches the libraries as a Maven repository zip (`keycloak-native-android-<version>-maven-repo.zip`) for builds without access to Maven Central.

Pin exact versions: before 1.0, any release may change the API.

## Quick start

### Configure

Create one instance per issuer and client, and keep it for the life of the app, so credentials, the DPoP key and refreshes stay consistent. Passkeys, saved passwords and the browser fallback need the activity on screen, so the usual shape is an instance on your `Application` whose platform pieces look up the current activity when they need it:

```kotlin
import android.app.Activity
import android.app.Application
import io.phasetwo.keycloak.nativeauth.sdk.KeycloakNative
import io.phasetwo.keycloak.nativeauth.sdk.android.AuthTabWebPresenter
import io.phasetwo.keycloak.nativeauth.sdk.android.CredentialManagerPasskeyPlatform
import io.phasetwo.keycloak.nativeauth.sdk.android.CredentialManagerSavedPasswordPlatform
import io.phasetwo.keycloak.nativeauth.sdk.android.KeystoreDPoPKeys
import io.phasetwo.keycloak.nativeauth.sdk.android.KeystoreSecureStore
import io.phasetwo.keycloak.nativeauth.sdk.errors.NativeAuthError
import io.phasetwo.keycloak.nativeauth.sdk.web.WebAuthenticationPresenter
import java.lang.ref.WeakReference
import java.net.URI

class ExampleApp : Application() {
  /** Set from ActivityLifecycleCallbacks (onActivityResumed / onActivityPaused). */
  @Volatile var currentActivity: WeakReference<Activity> = WeakReference(null)

  /** Set in MainActivity.onCreate. */
  @Volatile var authTab: AuthTabWebPresenter? = null

  val kc: KeycloakNative by lazy {
    KeycloakNative.configure(
      URI("https://<your-keycloak-host>/realms/<your-realm>"),
      "my-app",
      KeycloakNative.Options(
        hardwareKeys = KeystoreDPoPKeys(this),
        secureStore = KeystoreSecureStore(this, namespace = "my-app"),
        passkeyPlatform = CredentialManagerPasskeyPlatform(this) { currentActivity.get() },
        savedPasswordPlatform = CredentialManagerSavedPasswordPlatform(this) { currentActivity.get() },
        webPresenter = WebAuthenticationPresenter { url, redirectUri ->
          val presenter = authTab
            ?: throw NativeAuthError(NativeAuthError.Code.WEB_FALLBACK_FAILED, errorDescription = "No activity to open the browser from")
          presenter.authenticate(url, redirectUri)
        },
      ),
    )
  }
}
```

The browser fallback registers an activity result launcher, which Android only allows while the activity is being created, so create the `AuthTabWebPresenter` in `onCreate`:

```kotlin
class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    (application as ExampleApp).authTab = AuthTabWebPresenter(this)
    setContent { LoginScreen((application as ExampleApp).kc) }
  }
}
```

Single-activity apps can pass the activity directly: `CredentialManagerPasskeyPlatform(activity)` and `CredentialManagerSavedPasswordPlatform(activity)`. When the browser doesn't support Auth Tabs, the callback arrives through `NativeAuthRedirectActivity`, which you declare for your redirect URI:

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

### Sign in with the default screens

`NativeLoginScreen` takes an unstarted login flow, starts it when it enters the composition, shows a screen for each challenge, and reports the result. It doesn't store credentials or navigate; your app does both:

```kotlin
@Composable
fun LoginScreen(kc: KeycloakNative) {
  val scope = rememberCoroutineScope()
  var flow by remember { mutableStateOf<NativeLoginFlow?>(null) }
  var signedIn by remember { mutableStateOf(false) }
  var message by remember { mutableStateOf<String?>(null) }

  Column {
    val current = flow
    when {
      signedIn -> Text("Signed in")
      current != null -> NativeLoginScreen(kc, current, onResult = { result ->
        when (result) {
          is NativeLoginResult.Authorized -> scope.launch {
            try {
              kc.credentialsManager().store(result.credentials)
              signedIn = true
            } catch (e: NativeAuthError) {
              message = e.code
            }
            flow = null
          }
          NativeLoginResult.Cancelled -> flow = null
          is NativeLoginResult.Failed -> {
            message = result.error.code
            flow = null
          }
        }
      })
      else -> Button(onClick = {
        message = null
        flow = kc.authentication().startLogin(LoginParameters(scope = "openid profile", deviceName = "Example Pixel"))
      }) { Text("Sign in") }
    }
    message?.let { Text(it) }
  }
}
```

The imports are in the packages `io.phasetwo.keycloak.nativeauth.sdk.challenge` (`LoginParameters`, `NativeLoginFlow`) and `io.phasetwo.keycloak.nativeauth.sdk.ui` (`NativeLoginScreen`, `NativeLoginResult`). Create a new flow for each login attempt. The default screens cover usernames, passwords, passkeys, TOTP, email and SMS codes, recovery codes, push approvals, the native required actions, "try another way" choices, resend countdowns and the browser fallback. Their strings are in English and German and follow the app's locale.

### Call your API

`CredentialsManager` returns stored credentials, refreshing them when they're about to expire, and `resourceRequestHeaders` builds the headers for a request: `Authorization: Bearer …`, or `Authorization: DPoP …` with a `DPoP` proof when the tokens are DPoP-bound:

```kotlin
val credentials = kc.credentialsManager().credentials(minTtl = 60.seconds)
val headers = kc.resourceRequestHeaders(credentials, "GET", URI("https://api.example.com/me"))
```

Build new headers for every request, with the exact method and URL you send, because a DPoP proof is bound to both.

## Customize the screens

Replace one default screen with `presenters`, keeping the others:

```kotlin
NativeLoginScreen(
  kc, flow,
  presenters = mapOf(ChallengeType.Totp to { context -> MyTotpScreen(context) }),
  onResult = ::handleResult,
)
```

Your composable receives a `ChallengePresentationContext` with the current challenge and its alternatives, whether a request is in flight, and actions to `submit` an answer, `switchTo` another alternative or `cancel`. `chooser` replaces the "try another way" list, and `header` adds content, such as a logo, above every screen.

To build every screen yourself, skip the `ui` library and drive the flow: `start()` returns the first step, and each `respond` returns the next, until the step is `FlowStep.Authorized`:

```kotlin
val flow = kc.authentication().startLogin(LoginParameters(scope = "openid profile"))
var step = flow.start()
// For a username challenge, after your screen collected the input:
step = flow.respond(ChallengeAnswer.Username(enteredUsername), challenge)
```

A step is `Challenges` (render the choices in server order and answer one), `Authorized` (store the credentials), or `RedirectToWeb` (finish in the browser with `kc.webFallback().complete(request, flow)`). An error on a challenge, such as a wrong password, comes back inline on the next set of challenges rather than as a thrown error.

## Passkeys and saved passwords

Passkeys go through Credential Manager, which needs a Google account and a screen lock on the device. Android only lets an app use passkeys for a domain that vouches for it: serve `assetlinks.json` on the realm's passkey domain and add the app's signing-key origin to the realm's passkey policy (see [Server setup](./server-setup.md#passkeys)). The default screens then offer passkey login and registration. To register a passkey later, from a settings screen:

```kotlin
val credentials = kc.credentialsManager().credentials()
val registered = kc.passkeys().registerNewPasskey(label = "Pixel", credentials = credentials)
```

If the user signed in too long ago, registration is refused until they step up (sign in again).

The same `assetlinks.json` statement lets Google Password Manager and other providers offer the site's saved passwords in the app. The default screens set autofill content types, offer "Use a saved password", and after a sign-in with a typed password show Credential Manager's "Save password?" prompt. Custom screens call `kc.savePassword(username, password)` themselves.

## Push approvals

With `keycloak-native-push`, users enroll the phone, during login when Keycloak asks for it or later from the app, and approve sign-ins on it:

```kotlin
val push = kc.push()
val enrollment = push.enrollWithFcm(deviceLabel = "Pixel")   // or push.enroll("Pixel") without FCM
val pending = push.pendingApprovals()
```

`PushApprovalsScreen(push)` from the `ui` library shows pending approvals with the requesting app and number matching. For notifications, add Firebase to the app with your project's `google-services.json`, ask for `POST_NOTIFICATIONS` on Android 13 and later, and forward FCM tokens and messages from your `FirebaseMessagingService` to `kc.push().onNewFcmToken(token)` and `kc.push().handle(message)`. The server needs your Firebase project's service account (see [Server setup](./server-setup.md#push-approvals)). Treat a notification as a hint to fetch pending approvals, never as an approval, and check for pending approvals whenever the app opens.

## Tokens, DPoP and logout

- **Storage.** `KeystoreSecureStore` seals credentials with a Keystore key and keeps them out of backups. To require user authentication for the tokens, pass your own `SecureStore` as `credentialsStore`.
- **DPoP.** With `hardwareKeys` set, the SDK uses DPoP automatically with a Keystore key, in StrongBox when the device has one, and a software key otherwise. Tokens are bound once Keycloak's DPoP feature is on; your APIs must then accept `Authorization: DPoP` (see [Server setup](./server-setup.md#dpop)). Use `DPoPMode.HARDWARE` if your policy requires a hardware key.
- **Step-up.** `kc.authentication().stepUp(acrValues = "2")` returns a flow that asks only for what the higher level needs. Drive it like a login, or pass it to `NativeLoginScreen`, and store the new credentials.
- **Logout.** `kc.credentialsManager().logout()` ends the session on the server and clears local credentials, even when offline.

## Full guide

The [Android integration guide](https://github.com/p2-inc/native-apps/blob/main/docs/android-integration.md) on GitHub covers every challenge type and answer, errors and retries, the browser fallback, FCM details and cancellation. The repository's [Android demo app](https://github.com/p2-inc/native-apps/tree/main/android/demo) signs in against a local Keycloak with every flow.
