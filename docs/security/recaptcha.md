---
id: recaptcha
title: Keycloak reCaptcha
---

At present, Keycloak supports reCaptcha for registration. You can use reCaptcha v2 or v3. To enable reCaptcha, the present registration Authentication flow must have the reCaptcha step set to Required. You must then also fill in the appropriate keys. 

1. Go to Authentication > Flows > registration. In the registration flow, toggle reCaptcha to Required. 
1. Then click the gear icon to bring up the configuration interface. Add the appropriate keys for the reCaptcha version you are using.
1. To test this, you can go to the registration page and you should see the reCaptcha widget. Adjust the threshold up to 1.0 to ensure it triggers. 

We recommend v3 as it is more user friendly, but v2 is also supported.

Presently, only registration has this flow built-in. For a CAPTCHA on the login form, use [Cloudflare Turnstile](./turnstile.md), which is included in every Phase Two cluster and covers login, registration, and steps that send email. Where you place its steps decides whether a failed challenge actually blocks a login, so run the test below either way.

## Test that the CAPTCHA fails closed

A CAPTCHA only helps if a request without a valid token is rejected. Attack scripts post the login or registration form directly without ever rendering the page, so they never produce a token. Before you rely on any CAPTCHA, including a custom authenticator, send the form without one:

1. Open the login or registration page in a browser and copy the form's `action` URL, which includes the `session_code`, `execution`, and `tab_id` parameters.
1. Post the form fields to that URL with `curl`, leaving out the CAPTCHA response field.
1. Confirm the response is the form again with an error, not a redirect to your application. Then check the realm's events: there should be no `LOGIN` or `REGISTER` event for that attempt.

If the attempt succeeds, the CAPTCHA is failing open. It may log a failure while still letting the request through. That failure is silent: legitimate users see the widget and everything looks normal.

Also check where the CAPTCHA is bound. If it is only in a flow assigned to one client through an authentication flow override, every other client, including the built-in `account-console` and `security-admin-console`, still uses the realm's default browser flow without it. See [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md).

### Enabling reCaptcha with Google

This is a basic set of steps, but will require you to have a Google account and to have registered your site with Google reCaptcha. Go to [Google Cloud reCAPTCHA](https://console.cloud.google.com/security/recaptcha). Enable the API to be used and create a new reCaptcha key. For testing purposes, leave the domain verification off. 

In addition, you will need an [API key](https://console.cloud.google.com/apis/credentials) to use the reCaptcha API.

