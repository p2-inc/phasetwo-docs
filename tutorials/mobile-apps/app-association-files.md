---
id: app-association-files
title: Write the App Association Files That Let Mobile Apps Autofill Your Login
description: Build apple-app-site-association and assetlinks.json correctly so iOS and Android will share saved passwords — and later passkeys — between your app and your Keycloak login page.
keywords:
  - apple-app-site-association
  - assetlinks.json
  - webcredentials associated domains
  - password autofill mobile app
  - digital asset links keycloak
difficulty: intermediate
time: 30 minutes
---

# Write the App Association Files That Let Mobile Apps Autofill Your Login

If your mobile app opens a Keycloak login page, iOS and Android will not offer to autofill a saved password there unless the login domain publishes a file naming your app. The same files later govern whether a passkey created on that page can be used from the app.

Nothing reports the failure. There is no log line, no console warning, no rejected request — autofill simply never appears. This tutorial builds both files correctly and verifies them before you ship a build.

Everything here is plain Keycloak and plain platform tooling. No Phase Two account is needed to follow it, though you do need to be able to serve files from the root of your login domain — see [where to serve them](#where-these-files-have-to-live) at the end.

## What you need

- Your Keycloak login domain, e.g. `auth.example.com`
- **iOS**: your Apple Team ID and the app's bundle identifier
- **Android**: your package name and the SHA-256 fingerprint of the signing certificate
- `curl` and `jq`

## How the linking works

A website and an app are linked only when **both sides declare each other, independently**.

The app declares which domains it trusts. The domain declares which apps it trusts. The operating system fetches the domain's file itself, out of band — not as part of any request your app makes — and only treats the two as sharing credentials when both halves agree.

That symmetry is why a mistake on either side produces the same silent nothing.

## Step 1: gather your identifiers

**Apple.** Your Team ID is in the [Apple Developer account page](https://developer.apple.com/account) under Membership — ten characters, e.g. `A1B2C3D4E5`. Your bundle identifier is in Xcode under Signing & Capabilities, e.g. `com.example.app`. The app ID you need is the two joined with a dot:

```
A1B2C3D4E5.com.example.app
```

**Android.** Your package name is `applicationId` in `app/build.gradle`. The fingerprint comes from the certificate that signs the build users install:

```bash
keytool -list -v -keystore my-release.keystore -alias my-alias | grep SHA256
```

:::warning Use the Play App Signing fingerprint
If your app is distributed through Google Play with Play App Signing enabled — the default — Google re-signs your upload with a different key. The fingerprint that matters is the one in **Play Console → Test and release → Setup → App signing**, not your local upload key.

Getting this wrong is the single most common cause of "it works in internal testing and fails in production". You can list both; extra fingerprints are harmless.
:::

## Step 2: write `apple-app-site-association`

Create a file named exactly `apple-app-site-association` — **no extension**:

```json
{
  "webcredentials": {
    "apps": ["A1B2C3D4E5.com.example.app"]
  }
}
```

`webcredentials` is the section that governs password and passkey sharing. If you also want tapping a link to open your app, add an `applinks` section to the same file — it is fetched once and both sections are read.

On the app side, add the domain to the `com.apple.developer.associated-domains` entitlement in Xcode:

```
webcredentials:auth.example.com
```

## Step 3: write `assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.get_login_creds"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.app",
      "sha256_cert_fingerprints": [
        "AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90"
      ]
    }
  }
]
```

`delegate_permission/common.get_login_creds` is the credential-sharing relation. For deep links you would add a second statement using `delegate_permission/common.handle_all_urls`.

Fingerprints are uppercase hex, colon-separated, exactly as `keytool` prints them.

## Step 4: serve them correctly

Both files go at the root of the login domain:

```
https://auth.example.com/.well-known/apple-app-site-association
https://auth.example.com/.well-known/assetlinks.json
```

Three requirements that are easy to miss:

- **`Content-Type: application/json`.** `apple-app-site-association` has no file extension, so object storage and many web servers default it to `binary/octet-stream`. Apple rejects that outright and reports nothing.
- **No redirects.** Google's validator refuses them explicitly: *"redirects are disallowed for security reasons."* Serve the file at the path, do not redirect to it.
- **Publicly reachable, no auth.** The OS fetches these anonymously.

## Step 5: verify before shipping a build

Both platforms run public validators, so you never need to install an app to test this.

**Apple** — what its CDN actually holds for your domain:

```bash
curl https://app-site-association.cdn-apple.com/a/v1/auth.example.com
```

**Google** — a real parse, with useful errors:

```bash
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://auth.example.com&relation=delegate_permission/common.get_login_creds"
```

A successful Google response returns your statement and no `debugString`. When something is wrong, `debugString` names it precisely — a redirect, a 404, a malformed fingerprint.

:::tip Apple's CDN caches for up to 24 hours
Apple serves association files through its own CDN, so a corrected file can take a day to reach devices. While developing, build with `?mode=developer` in the associated-domains entitlement to bypass the cache — otherwise you will spend an afternoon debugging a file that was already right.
:::

## Where these files have to live

They must be served from the **exact host** your login page uses. A file on `example.com` does not cover `auth.example.com`.

Google's Digital Asset Links specification states it directly:

> Subdomains should not be considered to match: that is, if the statement file is hosted on `www.example.com`, then `www.puppies.example.com` should not be considered a match.

There are two partial exceptions, both current as of this writing — platform behaviour here does change, so check the vendor documentation before relying on either:

- **iOS** supports a wildcard in the entitlement. With `webcredentials:*.example.com`, iOS fetches the file from your apex domain and it covers subdomains.
- **Android** has no wildcard, but a statement file can `include` another URL, delegating to a central file. That still means serving something on the login subdomain, though it can be a small stub.

So in most setups at least one file has to come from the domain hosting your login page. If that domain belongs to your identity provider, they are the only ones who can serve it.

On Phase Two, custom domains can serve these files directly — see [Custom Domains](/docs/self-service/custom-domains/#app-association-files).

## A note on passkeys

The same files govern passkeys, not just saved passwords.

A passkey is bound to a **relying party ID**, which is a domain, and that binding is fixed when the credential is created. For a passkey created on your login page to work inside your app, the app must be associated with that domain through these files.

Changing the relying party ID later does not migrate existing passkeys — it invalidates them. If passkeys are on your roadmap, settle which domain hosts your login page before you enrol anyone.
