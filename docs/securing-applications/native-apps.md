---
id: native-apps
title: Native Applications - iOS, Android, and macOS
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/G3Mgh_h9cNU?si=GnmCRi2Hqt7M-Bq6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Native applications are installed on a device, such as a phone or a desktop computer. Keycloak fully supports them: like any other application, a native app gets a Client in Keycloak and signs users in with OpenID Connect. There are two ways to build the login:

- **Browser-based login** with a library such as [AppAuth](https://appauth.io/). The app opens Keycloak's login page in the system browser, and the browser hands the result back to the app. This works with any Keycloak, needs no extensions, and is the simplest place to start.
- **Native login** with Phase Two's [native authentication for Keycloak](https://github.com/p2-inc/native-apps). The app signs users in with its own screens, and Keycloak still runs the authentication flow. Choose this when the login has to look and feel like part of the app.

| | Browser-based login (AppAuth) | Native login |
| --- | --- | --- |
| Login screens | Keycloak's login pages, themed to match the app | The app's own screens: SwiftUI and Jetpack Compose defaults you can replace |
| Server requirements | Any Keycloak | Phase Two's native authentication extensions, Keycloak 26.4 to 26.8 |
| Platforms | iOS, Android, macOS and more | iOS 17+ and Android 9+ (API 28) |
| Authentication flows | Every Keycloak flow and authenticator | Native versions of username, password, passkey, TOTP, email and SMS codes, recovery codes, push approval and common required actions; anything else falls back to the browser |
| Registration, password reset, social login | In the browser | In the browser |

## Browser-based login with AppAuth

With AppAuth, the login slides up in a system browser sheet (`ASWebAuthenticationSession` on iOS, Custom Tabs on Android), and the app receives an authorization code when the user is done. Because the login runs in the browser rather than an embedded webview, the app never sees the user's password, and the browser can reuse an existing Keycloak session. Every flow and second factor you configure in Keycloak works without any code in the app.

To get started, follow the AppAuth documentation for your platform: [iOS and macOS](https://github.com/openid/AppAuth-iOS) or [Android](https://github.com/openid/AppAuth-Android).

### Setting up a Keycloak Client for browser-based login

1. Create an **OpenID Connect** client and leave **Client authentication** off: a native app is a public client, because it can't keep a secret.
1. Under **Capability config**, keep **Standard flow** checked.
1. Add the URI that the browser redirects back to under **Valid redirect URIs**. This is typically a custom URI scheme you define for your app, such as `myapp://callback`.
1. In the client's **Advanced** tab, set **Proof Key for Code Exchange Code Challenge Method** to `S256`. AppAuth sends PKCE on every login.

You may also wish to apply a specific theme to this client to match the look and feel of your app. Native apps usually lack the header and footer of a web app. To do this, create a [custom theme](/docs/getting-started/customizing-ui/) in Keycloak and apply it to your Client. Keycloakify lets you create a "variant" that hides the header and footer.

In the AppAuth iOS example, these are the values you would change:

```
static NSString *const kRedirectURI = @"io.phasetwo.appauth:/oauth2redirect/keycloak";  // The redirect URI, linked to the app's URL scheme.
static NSString *const kClientID = @"AppAuth-iOS-Example"; // The Client ID you set in Keycloak for your native app.
static NSString *const kIssuer = @"https://<your-keycloak-host>/auth/realms/<your-realm>"; // Full URL to your Keycloak realm.
```

The URL scheme for this example is `io.phasetwo.appauth`.

## Native login

Native login follows the IETF draft [OAuth 2.0 for First-Party Applications](https://datatracker.ietf.org/doc/draft-ietf-oauth-first-party-apps/). Phase Two's extensions add a challenge endpoint to each realm. When the app starts a login, Keycloak runs the client's authentication flow, and instead of rendering a login page it returns each step as a JSON challenge: a username, a password, a passkey assertion, a one-time code. The SDK shows a native screen for each challenge and sends the answer back until Keycloak returns an authorization code, which the SDK exchanges for tokens with PKCE. Brute-force protection, conditional second factors, required actions and step-up still come from your Keycloak configuration. The [launch post](/blog/native-login-keycloak-ios-android) explains why we built it and what it supports.

The [native-apps repository](https://github.com/p2-inc/native-apps) has the extensions, the iOS and Android SDKs, demo apps for both platforms, and the developer documentation. The project is below 1.0, so the protocol and APIs may still change between releases.

### Setting up Keycloak for native login

1. **Install the extensions.** Each [release](https://github.com/p2-inc/native-apps/releases) has a `keycloak-native-auth-providers-<version>.zip`. Put all of its jars in Keycloak's `providers/` directory and rebuild or restart Keycloak; the jars depend on each other, so install them together. On Phase Two hosted Keycloak, [contact us](/contact) to have them enabled on your cluster.
1. **Create a flow with native authenticators.** Copy your login flow and use the native executions, such as `native-username`, `native-password`, `native-passkey` and `native-totp`, in place of the browser ones. The repository's [demo realm](https://github.com/p2-inc/native-apps/tree/main/keycloak-native-auth/demo/realm-export) has complete examples, including step-up, one-time codes and push.
1. **Create the client.** An **OpenID Connect** client with **Client authentication** off, **Standard flow** on, and **Proof Key for Code Exchange Code Challenge Method** set to `S256`. Add the attribute `native-auth.enabled` with the value `true`; clients without it are refused by the challenge endpoint. Bind the native flow to the client under **Advanced** → **Authentication flow overrides** (or make it the realm's browser flow), and add a redirect URI for the browser fallback.
1. **Add the SDK to your app.** On iOS, add the Swift package from the repository by version tag. On Android, each release has a `keycloak-native-android-<version>-maven-repo.zip` with the libraries (`io.phasetwo.keycloak.nativeauth:keycloak-native-android`, `keycloak-native-ui` and `keycloak-native-push`). The [developer documentation](https://github.com/p2-inc/native-apps/tree/main/docs) covers configuration, the default screens, passkeys, push and troubleshooting for both platforms.

Passkeys need your app associated with a domain that matches Keycloak's WebAuthn relying party ID (`apple-app-site-association` on iOS, `assetlinks.json` on Android). Push approvals need an APNs key or a Firebase project configured on the server; the repository's documentation lists the settings.
