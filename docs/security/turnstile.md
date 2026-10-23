---
id: turnstile
title: Cloudflare Turnstile
---

[Cloudflare Turnstile](https://www.cloudflare.com/application-services/products/turnstile/) is a CAPTCHA that usually runs without asking the user to solve anything. Phase Two's open-source [keycloak-magic-link](https://github.com/p2-inc/keycloak-magic-link) extension adds it to Keycloak as authentication steps you can place in login and registration flows. Keycloak's built-in reCAPTCHA covers registration only, so Turnstile is how you put a CAPTCHA in front of login.

The extension is included in every Phase Two cluster. It is off until you add your own Cloudflare site key and secret and edit your flows. Nothing changes on your login pages until you do.

## What you need

1. **A Turnstile widget in your Cloudflare account**, for the hostname your users sign in on. If you use a [custom domain](../self-service/custom-domains.md), that is the custom domain. Cloudflare gives you a **site key** and a **secret**.
2. **The CAPTCHA host allowed by your realm's Content Security Policy.** Under **Realm Settings → Security Defenses**, add `https://challenges.cloudflare.com` to the `frame-src` directive of the Content-Security-Policy header. The directive is a space-separated list.
3. **The `cloudflare-turnstile` login theme**, which renders the widget. Set it for the realm under **Realm Settings → Themes**, or for one client under that client's **Login settings**. It extends the standard `keycloak` login theme. If you use your own login theme, it needs to render the widget the same way.

## Configuration

All the Turnstile steps share the same settings, entered by selecting the step's gear icon in the flow editor:

| Setting | Description |
|---|---|
| **Turnstile Site Key** | The widget's site key from Cloudflare |
| **Turnstile Secret** | The widget's secret key from Cloudflare |
| **Action** | A label for the widget, defaulting to `login`. Keycloak rejects a token whose action doesn't match, so use a different action for each place you put a widget. |
| **Siteverify URL** | Cloudflare's verification endpoint. Leave the default. |

Each step can be set to **Required** or **Disabled**.

## The steps

### Cloudflare Turnstile Username Password Form

A drop-in replacement for the standard **Username Password Form** in a browser flow. It shows the widget on the login page next to the username and password fields.

**On its own, it does not block a login.** The Turnstile token is checked only after the username and password have been accepted. If the check fails, the step records the failure on the login session and the login continues. A script that posts the login form without a token and with a valid password completes the login, unless you configure what happens next. Choose one of these:

- **Turn on _Verify email on CAPTCHA failure_.** When valid credentials arrive without a valid token, the user's email is marked unverified and the Verify Email required action is added, so the login can't finish without access to the user's inbox. The flag stays on the account, so a real user whose check failed will also have to verify their email again.
- **Add a conditional subflow after the form** containing **Condition - Turnstile Failed** set to Required, followed by a step that requires something the attacker doesn't have. An email-based step such as Email OTP works for every user. An OTP or WebAuthn step only protects users who already have that factor enrolled. A user without one is sent to enroll a new authenticator, and an attacker who knows the password can enroll their own.

If the step's configuration is missing the site key or action, it behaves exactly like the standard Username Password Form and shows no widget.

### Cloudflare Turnstile validation (standalone step)

A separate page that shows only the Turnstile challenge. Place it before the username and password form in a browser flow, or before any step that sends email, such as a magic link or Email OTP. It doesn't need to know who the user is, so it can come first.

This step rejects a submission without a valid token. A script that skips it and posts credentials doesn't get past it. It is the strongest option against credential stuffing, at the cost of one extra page before sign-in.

### Condition - Turnstile Failed

A condition for conditional subflows. It matches when the Turnstile check on the Username Password Form failed during the current login. Its **Negate** setting inverts the match. Use it to add friction only for sessions that failed the challenge, as described above.

### Cloudflare Turnstile validation (registration form action)

A form action for the **registration** flow. It adds the widget to the registration form and rejects the submission if the token is missing or invalid. Use it in place of, or alongside, the built-in [reCAPTCHA](./recaptcha.md).

## Test before you rely on it

Cloudflare publishes [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), including a secret that always fails verification. In a non-production realm, configure your flow with the always-failing secret, then follow [Test that the CAPTCHA fails closed](./recaptcha.md#test-that-the-captcha-fails-closed). If a scripted login without a token still reaches your application, the flow is failing open.

## What Turnstile does not cover

Turnstile protects flows that render a page. A direct grant (`grant_type=password` on the token endpoint) renders nothing, so an attacker can skip every browser step by using it. Turn the password grant off with a [client policy](./client-policies.md) when you add a CAPTCHA, or the CAPTCHA can be bypassed. See [Credential Stuffing and Account Takeover](./credential-stuffing.md) for the full picture.
