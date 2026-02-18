---
id: native-apps
title: Native Applications - iOS, Android, and macOS
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/G3Mgh_h9cNU?si=GnmCRi2Hqt7M-Bq6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Native applications are applications that are installed on a device, such as a mobile phone or desktop computer. Integrating an authentication system into a native application can be more complex than integrating it into a web application, due to the need to handle authentication flows and token management on the client side. 

The first thing to know is that Keycloak 100% supports native applications. Just like any other "Client" in Keycloak, you can create a Client for your native application and configure it to use the appropriate authentication flow. However, what is important to know is that doing a fully native integration is very difficult. The recommended way with the least amount of friction, is to use the [AppAuth library](https://appauth.io/) which supports Android, iOS, and macOS.

The experience when using AppAuth is that your users will be redirected to the browser to sign in, and then redirected back to the app. This is a much easier experience to implement than trying to do a fully native experience. This is handled by a webview within the app. It looks like a window slides in or up, can be configured to be full screen, and then slides back out when the user is done signing in. This is a much easier experience to implement than trying to do a fully native experience.

The reason to use the library, is that Keycloak does not have a native SDK for iOS, Android, or macOS. It would require a significant amount of work to replicate all the flows required to do a fully native experience. As an example, if you wanted to have a passcode 2fa, or a TOTP 2fa, you would need to implement that logic yourself. With the AppAuth library, you can leverage the existing flows that Keycloak has built-in, and you can also leverage the existing flows that Keycloak has built-in for 2fa. The implementation time is significantly reduced by using the library, and you can still provide a great user experience. Many companies use this approach for their native applications and it is both secure and user friendly.

To get started, you can follow the documentation for the AppAuth library for your specific platform. You will need to configure your Keycloak Client to use the appropriate authentication flow, and then you can use the library to handle the authentication flow in your app.

### Setting up a Keycloak Client for a Native Application

When setting up a Keycloak Client for a native application, you will need to configure the Client to use the appropriate authentication flow. This typically involves setting the Authentication flow to "Standard Flow". You will also need to configure the "Valid Redirect URIs" to include the URI that your app will use to redirect back after authentication. This is typically a custom URI scheme that you define for your app, such as `myapp://callback`.

You may also wish to apply a specific theme to this client to match the look and feel of your app. It is common for native apps to lack a header and footer often seen on web apps. To do this, you can create a [custom theme](/docs/getting-started/customizing-ui/) in Keycloak and then apply that theme to your Client. Using Keycloakify allows you to create a "variant" that can quickly hide your header and footer. 

In the AppAuth iOS example, here are a set of the changes you would need to make: 

```
static NSString *const kRedirectURI = @"io.phasetwo.appauth:/oauth2redirect/keycloak";  // This is the redirect URI you will use to interact with the AppAuth library. This is linked to the URL Scheme.
static NSString *const kClientID = @"AppAuth-iOS-Example"; // This is the Client ID you set in Keycloak when you created the Client for your native app.
static NSString *const kIssuer = @"https://phasetwo.us-west-2.aws.auth.ac/realms/merman"; // Full URL to your Keycloak realm. 
```

URL Scheme for this would be: `io.phasetwo.appauth`