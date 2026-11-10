---
id: browser-login
title: Browser-Based Login with AppAuth
sidebar_label: Browser-based login (AppAuth)
description: Set up a Keycloak client for browser-based login from iOS, macOS and Android apps with AppAuth, using the system browser, PKCE and a custom redirect URI scheme.
---

Browser-based login works with any Keycloak and needs no extensions. The app opens Keycloak's login page in a system browser sheet (`ASWebAuthenticationSession` on iOS and macOS, Custom Tabs on Android) and receives an authorization code when the user is done, which it exchanges for tokens with PKCE. Because the login runs in the system browser rather than an embedded webview, the app never sees the user's password, and the browser can reuse an existing Keycloak session. Every flow and second factor you configure in Keycloak works without any code in the app. See the [overview](./index.md) for how this compares with native login.

<iframe width="560" height="315" src="https://www.youtube.com/embed/G3Mgh_h9cNU?si=GnmCRi2Hqt7M-Bq6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

[AppAuth](https://appauth.io/) is the OpenID Foundation's library for this pattern. To get started, follow the AppAuth documentation for your platform: [iOS and macOS](https://github.com/openid/AppAuth-iOS) or [Android](https://github.com/openid/AppAuth-Android).

## Setting up a Keycloak client

1. Create an **OpenID Connect** client and leave **Client authentication** off: a native app is a public client, because it can't keep a secret.
1. Under **Capability config**, keep **Standard flow** checked.
1. Add the URI that the browser redirects back to under **Valid redirect URIs**. This is typically a custom URI scheme you define for your app, such as `myapp://callback`.
1. In the client's **Advanced** tab, set **Proof Key for Code Exchange Code Challenge Method** to `S256`. AppAuth sends PKCE on every login.

You may also wish to apply a specific theme to this client to match the look and feel of your app. Native apps usually lack the header and footer of a web app. To do this, create a [custom theme](/docs/getting-started/customizing-ui/) in Keycloak and apply it to your client. Keycloakify lets you create a "variant" that hides the header and footer.

## Configuring the AppAuth example

In the AppAuth iOS example, these are the values you would change:

```objectivec
static NSString *const kRedirectURI = @"io.phasetwo.appauth:/oauth2redirect/keycloak";  // The redirect URI, linked to the app's URL scheme.
static NSString *const kClientID = @"AppAuth-iOS-Example"; // The Client ID you set in Keycloak for your native app.
static NSString *const kIssuer = @"https://<your-keycloak-host>/auth/realms/<your-realm>"; // Full URL to your Keycloak realm.
```

The URL scheme for this example is `io.phasetwo.appauth`.

The issuer is your realm's URL, which is also where AppAuth finds the realm's OpenID Connect discovery document. You can copy it from the **OpenID Endpoint Configuration** link in **Realm settings**.

## Moving to native login later

The client above is also most of what [native login](./server-setup.md) needs: a public client with the standard flow and PKCE S256, and a registered redirect URI, which native login uses for the steps that still open the browser. Switching an app over is a matter of installing the extensions, adding the native flow and client attribute on the server, and replacing AppAuth with one of the SDKs.
