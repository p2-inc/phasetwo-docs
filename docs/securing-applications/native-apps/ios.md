---
id: ios
title: Native Login for iOS
sidebar_label: iOS
description: Sign users in to Keycloak from an iOS app with your own SwiftUI screens using Phase Two's KeycloakNative Swift package, with passkeys, push approvals, DPoP and Keychain token storage.
---

The `KeycloakNative` Swift package signs users in to Keycloak with your app's own screens. It runs the native login protocol, exchanges the authorization code with PKCE, keeps tokens in the Keychain, binds them to a Secure Enclave key with DPoP, and runs passkey, password AutoFill, browser fallback and push approval ceremonies. It has three products:

- **`KeycloakNativeCore`**: the login flow, tokens and refresh, DPoP, passkeys and the browser fallback. No UI.
- **`KeycloakNativeUI`**: default SwiftUI screens for every challenge type, each replaceable with your own.
- **`KeycloakNativePush`**: push enrollment and sign-in approvals.

The package has no third-party dependencies and is licensed under Apache 2.0. It is below 1.0, so its API may change between releases. Your Keycloak needs the native authentication extensions; see [Server setup](./server-setup.md).

## Requirements

- iOS 17 or macOS 14.
- Xcode with Swift 6.
- A Keycloak client set up for native login as described in [Server setup](./server-setup.md).

## Install

Add the package from the repository by version tag. In Xcode, choose **File** > **Add Package Dependencies**, enter `https://github.com/p2-inc/native-apps`, and set the dependency rule to **Exact Version** `0.2.0`. Then add the products you need to your app target. In a `Package.swift`:

```swift
dependencies: [
  .package(url: "https://github.com/p2-inc/native-apps", exact: "0.2.0"),
],
targets: [
  .target(
    name: "MyApp",
    dependencies: [
      .product(name: "KeycloakNativeCore", package: "native-apps"),
      .product(name: "KeycloakNativeUI", package: "native-apps"),
    ]
  ),
]
```

`KeycloakNativeUI` brings in `KeycloakNativeCore` and `KeycloakNativePush`. Pin an exact version: before 1.0, any release may change the API, and `from:` would also pull in later breaking `0.x` releases. Releases are listed on [GitHub](https://github.com/p2-inc/native-apps/releases).

## Quick start

### Configure

Create one instance per issuer and client, and keep it for the life of the app, so credentials, the DPoP key and refreshes stay consistent. The issuer is your realm's URL, including `/realms/<realm>`:

```swift
import KeycloakNativeCore

let kc = KeycloakNative.configure(
  issuer: URL(string: "https://<your-keycloak-host>/realms/<your-realm>")!,
  clientId: "my-app"
)
```

To change defaults such as the DPoP mode, pass a `KeycloakNative.Options` value as the `options:` argument.

### Sign in with the default screens

`NativeLoginView` takes an unstarted login flow, starts it when it appears, shows a screen for each challenge, and reports the result. It doesn't store credentials or navigate; your app does both:

```swift
import SwiftUI
import KeycloakNativeCore
import KeycloakNativeUI

@MainActor
struct LoginScreen: View {
  let kc: KeycloakNative
  @State private var flow: NativeLoginFlow?
  @State private var signedIn = false
  @State private var message: String?

  var body: some View {
    VStack {
      if signedIn {
        Text("Signed in")
      } else if let flow {
        NativeLoginView(kc: kc, flow: flow) { result in
          switch result {
          case .authorized(let credentials):
            Task { @MainActor in
              do {
                try await kc.credentialsManager().store(credentials)
                signedIn = true
              } catch {
                message = error.localizedDescription
              }
              self.flow = nil
            }
          case .cancelled:
            self.flow = nil
          case .failed(let error):
            message = error.code
            self.flow = nil
          }
        }
      } else {
        Button("Sign in") {
          message = nil
          flow = kc.authentication().startLogin(
            LoginParameters(scope: "openid profile", deviceName: "Example iPhone")
          )
        }
      }
      if let message { Text(message) }
    }
  }
}
```

Create a new flow for each login attempt. The default screens cover usernames, passwords, passkeys, TOTP, email and SMS codes, recovery codes, push approvals, the native required actions, "try another way" choices, resend countdowns and the browser fallback. They ship in English and German.

### Call your API

`CredentialsManager` returns stored credentials, refreshing them when they're about to expire, and `resourceRequestHeaders` builds the headers for a request: `Authorization: Bearer …`, or `Authorization: DPoP …` with a `DPoP` proof when the tokens are DPoP-bound:

```swift
let credentials = try await kc.credentialsManager().credentials(minTTL: 60)
let url = URL(string: "https://api.example.com/me")!
var request = URLRequest(url: url)
let headers = try await kc.resourceRequestHeaders(for: credentials, method: "GET", url: url)
for (name, value) in headers { request.setValue(value, forHTTPHeaderField: name) }
```

Build new headers for every request, with the exact method and URL you send, because a DPoP proof is bound to both.

## Customize the screens

Replace one default screen with `.challengePresenter(for:)`, keeping the others:

```swift
NativeLoginView(kc: kc, flow: flow, onResult: handleResult)
  .challengePresenter(for: .totp) { context in
    MyTOTPScreen(context: context)
  }
```

Your view receives a `ChallengePresentationContext` with the current challenge and its alternatives, whether a request is in flight, and actions to `submit` an answer, `switchTo` another alternative or `cancel`. `.challengeChooser` replaces the "try another way" list, and `.nativeLoginStrings(bundle:)` supplies your own strings.

To build every screen yourself, use `KeycloakNativeCore` alone and drive the flow: `start()` returns the first step, and each `respond` returns the next, until the step is `.authorized(credentials)`:

```swift
let flow = kc.authentication().startLogin(LoginParameters(scope: "openid profile"))
var step = try await flow.start()
// For a username challenge, after your screen collected the input:
step = try await flow.respond(.username(enteredUsername), to: challenge)
```

A step is `.challenges` (render the choices in server order and answer one), `.authorized` (store the credentials), or `.redirectToWeb` (finish in the system browser with `kc.webFallback().complete(request, flow: flow)`). An error on a challenge, such as a wrong password, comes back inline on the next set of challenges rather than as a thrown error.

## Passkeys and saved passwords

Passkeys need the app associated with the realm's passkey domain: an Associated Domains entitlement `webcredentials:<rp-id>` and an `apple-app-site-association` file on that domain (see [Server setup](./server-setup.md#passkeys)). The default screens then offer passkey login and registration. To register a passkey later, from a settings screen:

```swift
let credentials = try await kc.credentialsManager().credentials()
let registered = try await kc.passkeys().registerNewPasskey(label: "iPhone", credentials: credentials)
```

If the user signed in too long ago, registration is refused until they step up (sign in again).

The same association lets iCloud Keychain and other password managers offer the site's saved passwords. The default screens set the right text content types, offer "Use a saved password", and iOS offers to save a typed password after sign-in. Custom screens should set `.username`, `.password`, `.newPassword` and `.oneTimeCode` content types themselves.

## Push approvals

With `KeycloakNativePush`, users enroll the phone, during login when Keycloak asks for it or later from the app, and approve sign-ins on it:

```swift
import KeycloakNativePush

let push = kc.push()
let enrollment = try await push.enroll(deviceLabel: "iPhone")
let pending = try await push.pendingApprovals()
```

`PushApprovalsView(push:)` shows pending approvals with the requesting app and number matching. For notifications, register for remote notifications as usual, enroll with the APNs token, and call `push.updateAPNsToken(_:)` when it changes; the server needs an APNs key (see [Server setup](./server-setup.md#push-approvals)). Treat a notification as a hint to fetch pending approvals, never as an approval, and check for pending approvals when the app comes to the foreground.

## Tokens, DPoP and logout

- **Storage.** Credentials live in the Keychain, scoped to the issuer and client. To require Face ID or Touch ID to read them, give the credentials their own `KeychainStore` with access control through `Options.credentialsStore`.
- **DPoP.** The SDK uses DPoP automatically, with a Secure Enclave key when the device has one. Tokens are bound once Keycloak's DPoP feature is on; your APIs must then accept `Authorization: DPoP` (see [Server setup](./server-setup.md#dpop)). Set `options.dpop = .secureEnclave` if your policy requires a hardware key.
- **Step-up.** `kc.authentication().stepUp(acrValues: "2")` returns a flow that asks only for what the higher level needs. Drive it like a login and store the new credentials.
- **Logout.** `kc.credentialsManager().logout()` ends the session on the server and clears local credentials, even when offline.

## Full guide

The [iOS integration guide](https://github.com/p2-inc/native-apps/blob/main/docs/ios-integration.md) on GitHub covers every challenge type and answer, errors and retries, biometry-protected credentials, push details and cancellation. The repository's [iOS demo app](https://github.com/p2-inc/native-apps/tree/main/ios/KeycloakNativeDemo) signs in against a local Keycloak with every flow.
