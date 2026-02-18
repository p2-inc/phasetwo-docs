---
id: recaptcha
title: Keycloak reCaptcha
---

At present, Keycloak supports reCaptcha for registration. You can use reCaptcha v2 or v3. To enable reCaptcha, the present registration Authentication flow must have the reCaptcha step set to Required. You must then also fill in the appropriate keys. 

1. Go to Authentication > Flows > registration. In the registration flow, toggle reCaptcha to Required. 
1. Then click the gear icon to bring up the configuration interface. Add the appropriate keys for the reCaptcha version you are using.
1. To test this, you can go to the registration page and you should see the reCaptcha widget. Adjust the threshold up to 1.0 to ensure it triggers. 

We recommend v3 as it is more user friendly, but v2 is also supported.

Presently, only registration has this flow built-in. For this to be applied to the login flow, you need to create a custom authenticator. If you need this, please contact support for assistance.

### Enabling reCaptcha with Google

This is a basic set of steps, but will require you to have a Google account and to have registered your site with Google reCaptcha. Go to [Google Cloud reCAPTCHA](https://console.cloud.google.com/security/recaptcha). Enable the API to be used and create a new reCaptcha key. For testing purposes, leave the domain verification off. 

In addition, you will need an [API key](https://console.cloud.google.com/apis/credentials) to use the reCaptcha API.

