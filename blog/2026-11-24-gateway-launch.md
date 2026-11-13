---
title: "Gateway: Keycloak login in front of any website, without changing it"
slug: gateway-launch
date: 2026-11-24
draft: true
authors: [gpatil]
tags: [phase_two, keycloak, gateway, reverse_proxy, security]
description: Gateway puts your Phase Two realm's login in front of an existing website. No OIDC library, no code changes, and nothing to deploy. Your site only has to refuse requests that don't carry a secret.
keywords:
  - keycloak reverse proxy
  - keycloak authenticating proxy
  - oauth2-proxy alternative
  - protect internal tools with keycloak
  - authentik proxy outpost alternative
---

Every company has a website that is public by accident. An admin console that was only ever
meant for staff. A Grafana that someone put on the internet for a demo. A staging environment
with a shared password in the team wiki. A vendor dashboard that has no login of its own.

The right fix is the same every time: put it behind the identity provider everyone already signs
in with. The usual way to do that is to add an OIDC library to the application, or to deploy and
run an authenticating proxy in front of it. Both are real work, and the application is usually
the kind nobody wants to touch.

Today we're launching **Gateway**, which makes it a dashboard form. Gateway puts your Phase Two
realm's login in front of an existing website. The website doesn't change, and there is nothing
for you to deploy.

<!--truncate-->

## How it works

You give Gateway two hostnames: the one your users visit, say `admin.example.com`, and the one
where the site actually runs, say `admin-origin.example.com`. Then:

1. Phase Two creates an OIDC client for the site in your realm and gives you an **origin secret**.
2. You make the site, or the load balancer in front of it, refuse requests that don't carry that
   secret. That's a few lines of nginx, or a few lines of middleware.
3. Phase Two **checks** that your site refuses them. It sends requests with the secret, without
   it, with a wrong one and with forged identity headers, and won't let you go live unless only the
   first gets through.
4. You point `admin.example.com` at Phase Two with a CNAME. We issue the certificate.
5. You select **Activate**.

From then on, a visitor to `admin.example.com` is sent to your realm's login page: the same
passkeys, social logins, MFA and customer SSO as the rest of your applications. After they sign
in, Gateway checks your access policy and forwards the request to your site with the secret.

The origin secret is what makes this safe. Without it, anyone who found your origin's address
could skip the login entirely. With most authenticating proxies, locking the origin down is left
to you. Gateway won't activate an app until it has seen your origin refuse a request without the
secret.

## Who gets in

By default, anyone who can sign in to the realm reaches the site. Usually you want less than that,
so each app has an access policy: rules on path prefixes and methods that require realm roles,
client roles, groups or claim values, or deny a path outright. Here, reports are open to everyone
who signs in, `/admin` only to the `/staff` group, and everything else is refused:

```hcl
policy = {
  default = "deny"
  rules = [
    { path_prefix = "/reports", methods = ["GET"] },
    { path_prefix = "/admin", groups_any = ["/staff"] },
  ]
}
```

A user who fails the policy never reaches your site.

## Telling your site who the user is

Your site keeps working without knowing who the user is. If it wants to know, Gateway can send
the user's ID, email, name, groups and roles as headers.

For anything that matters, turn on the **identity assertion** instead: a JWT signed with ES256,
valid for 60 seconds and issued for that one app, on every request. Your site verifies it against
a published JWKS with any JWT library. It proves who the user is however the request reached you.

## Automate it

Gateway is in the [Management API](/api/management/gateway) and the
[Terraform provider](/docs/management-api/terraform#gateway-apps). In Terraform, a single apply
can create the app, the CNAME and your origin's secret, then verify the origin and activate it once
DNS is ready:

```hcl
resource "phasetwo_gateway_app" "admin" {
  realm_id        = phasetwo_realm.app.id
  name            = "Internal admin console"
  public_hostname = "admin.example.com"
  origin_url      = "https://admin-origin.example.com"
}

resource "phasetwo_gateway_app_activation" "admin" {
  realm_id   = phasetwo_gateway_app.admin.realm_id
  app_id     = phasetwo_gateway_app.admin.id
  depends_on = [aws_route53_record.admin, aws_secretsmanager_secret_version.origin_secret]
}
```

If the origin serves a request without the secret, the apply fails instead of putting an open
site live.

## What it isn't

We'd rather you know the limits before you find them.

- **Your site has to be reachable from the internet** over HTTPS with a valid certificate. Gateway
  doesn't tunnel into private networks.
- **It's for browsers.** Gateway signs people in with a session cookie. APIs called by other
  services should validate Keycloak tokens themselves.
- **It's a full proxy**, not a forward-auth endpoint for a proxy you already run.
- **No WebSockets yet.**

If you're comparing Keycloak with authentik, this is the gap we hear about most. authentik's proxy
outposts put a login in front of apps with no authentication. Keycloak doesn't, and running
oauth2-proxy yourself is one more thing to operate. Gateway is our answer for websites. Our
[authentik comparison](/keycloak-alternatives/authentik/) has the details, including where
authentik still goes further.

## Try it

Gateway is rolling out to dedicated clusters now. Open a realm in the
[dashboard](https://dash.phasetwo.io/) and look for **Gateway**, or email
[support@phasetwo.io](mailto:support@phasetwo.io) to have it turned on. Setup is in the
[Gateway docs](/docs/self-service/gateway), and the changes your site needs are in
[Protecting an existing application with Gateway](/docs/securing-applications/gateway).
