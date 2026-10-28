---
id: on-prem
title: On-Prem Distribution
description: Ship the Phase Two Keycloak image with your software to customer sites, and let your customers connect their own identity provider with the setup wizards.
---

Software vendors are often asked by customers in government and regulated industries to deploy on-prem, inside the customer's network, and to connect to the customer's own identity provider. The Phase Two image is built for that: you ship it alongside your application, and your customer's IT admin connects their identity provider through guided setup wizards rather than the Keycloak admin console.

For the commercial side of on-prem deployments, see [On-Prem](/product/onprem) or contact [sales@phasetwo.io](mailto:sales@phasetwo.io).

See a short video of the wizards in action:

<iframe width="560" height="315" src="https://www.youtube.com/embed/9HJWdJqnE0I" title="IdP setup wizards demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Deploying the image

Deploy the image the same way you would for your own infrastructure. See [Docker Image](./docker.md), [Database](./database.md), and [Kubernetes](./kubernetes.md). Pin a full image tag in what you ship, so every customer site runs a version you have tested.

## Importing your realm on install

Don't use the `master` realm to secure your application. Create a realm with your application's clients, roles, flows, and theme, export it, and import it on install. Keycloak can import realm files at startup with `--import-realm`. See the Keycloak guide to [importing and exporting realms](https://www.keycloak.org/server/importExport).

## Onboarding your customer's identity provider

Give your customers an onboarding guide that explains how to get their Keycloak admin credentials after installation and where to set up SSO. The [IdP wizards](../sso/wizards.md) are served from each realm at:

```
https://<host>/auth/realms/<realm>/wizard/
```

Your customer signs in with an admin account for that realm and follows the wizard for their identity provider. The wizard creates the identity provider and lets them test the connection before rolling it out to users.

If your customers also manage their own users and organizations, the [Admin Portal](../admin-portal/index.md) is served from the same realm at `https://<host>/auth/realms/<realm>/portal/`.

### Available wizards

The public image includes the generic SAML, OpenID Connect, and LDAP wizards, which work with any standards-compliant identity provider. Vendor-specific wizards are available to licensees with a support agreement through a private image registry. Talk to your customer success representative about access.

## Licensing

The Phase Two extensions are released under the Elastic License 2.0, and Keycloak itself under Apache 2.0. See [Open Source](../introduction/open-source.md) for what that allows, and contact [sales@phasetwo.io](mailto:sales@phasetwo.io) about support for on-prem deployments.
