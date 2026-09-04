---
slug: app-association-custom-domains
title: "Keycloak Custom Domains Can Now Serve App Association Files"
date: 2026-09-05
authors: [jpatzer]
tags: [keycloak, custom-domains, passkeys, mobile, autofill]
description: Phase Two custom domains can now serve apple-app-site-association, assetlinks.json and a change-password redirect, so mobile apps can autofill saved passwords and share passkeys with a Keycloak login page.
keywords:
  - keycloak mobile app autofill
  - apple-app-site-association keycloak
  - assetlinks.json keycloak
  - keycloak passkeys mobile
  - keycloak custom domain
---

**Custom domains on Phase Two can now serve the files iOS and Android use to link a domain to a mobile app.** Upload them from the dashboard and they are live in minutes — no deploy, no cluster restart.

That closes a gap that had nothing to do with Keycloak's capabilities and everything to do with where Keycloak sits in a mobile login flow.

<!-- truncate -->

## The gap

Mobile platforms decide whether an app may use a saved credential by checking the **domain that served the login page**. If your users sign in at `auth.example.com`, that is the origin the password manager files the credential under, and the origin iOS and Android will consult later.

Both platforms consult it the same way: they fetch a file from a fixed path at the root of that domain, out of band, and check whether it names your app.

```
https://auth.example.com/.well-known/apple-app-site-association
https://auth.example.com/.well-known/assetlinks.json
```

Which puts the identity provider in an awkward position. Keycloak serves paths under `/realms/`, `/admin/` and `/resources/` — it has never owned the root of the domain, and on deployments that run it under a path prefix it has no root to own at all. So the files could not come from Keycloak, and they could not come from the app team either, because the app team does not control the login domain.

The result was a silent failure. Autofill never appeared, nothing logged an error, and teams reasonably concluded it was a device setting.

## What we changed

Phase Two custom domains now serve three things at the root of the domain:

| Path | Purpose |
| --- | --- |
| `/.well-known/apple-app-site-association` | Links the domain to your iOS app |
| `/.well-known/assetlinks.json` | Links the domain to your Android app |
| `/.well-known/change-password` | Where password managers send someone to change their password |

They are served at the edge rather than by the cluster, which has a few consequences worth knowing. Uploads apply in minutes instead of needing a restart, so correcting a fingerprint is not a deployment event. They keep serving during a cluster restart, which matters because a failed fetch gets cached by Apple for hours. And each domain on a cluster gets its own content, which is what makes this work for white-label products where every tenant has a different app.

Everything else under `/.well-known/` still returns 404 — deliberately. The change-password specification relies on an unknown well-known URL *not* returning 200, and a catch-all would quietly break how password managers detect support.

## Why we think this belongs in the platform

Phase Two exists because running Keycloak well involves a long tail of work that has nothing to do with Keycloak itself. Certificates, custom domains, upgrades, themes, extension packaging — each is small, each is somebody's afternoon, and collectively they are the reason teams end up staffing an identity platform rather than using one.

App association files are a clean example. The requirement comes from Apple and Google, the fix is two small JSON files, and the only reason it is hard is that the files have to live somewhere Keycloak has never served from. Nothing about it is intellectually interesting. It is just infrastructure that has to exist, and it sits precisely at the boundary where a hosted provider can help and an app team cannot.

Passkeys make it more pressing. A passkey is bound to a relying party ID, which is a domain, and that binding is fixed when the credential is created — you cannot change it later without invalidating every passkey already enrolled. Teams planning passkeys in a native app need the domain and the association files settled *before* the first enrolment, not after.

## Getting started

**Setting up the domain** — adding a custom domain, DNS and certificate issuance, and where to upload the files in the dashboard: [Custom Domains](/docs/self-service/custom-domains/#app-association-files). Available on Premium and Enterprise plans.

**Writing the files** — Team IDs, package names, signing fingerprints, the entitlement on the app side, and how to verify with Apple's and Google's public validators before shipping a build: [Write the App Association Files That Let Mobile Apps Autofill Your Login](/tutorials/mobile-apps/app-association-files). That tutorial is vendor-neutral and works against any Keycloak.

One thing worth reading before you start, because it surprises most people: **subdomains do not inherit**. A file on `example.com` does not cover `auth.example.com`. iOS offers a wildcard entitlement and Android offers a delegating `include`, but as of this writing at least one file generally has to be served from the domain your login page actually runs on. Platform behaviour here does change — check the vendor documentation before relying on either exception.
