---
id: connect
title: Connect
description: Phase Two Connect solves one of the top issues with on-prem software installation and onboarding, connecting the customer identity provider.
---

Phase Two Connect solves one of the top issues with on-prem software installation and onboarding: connecting the customer identity provider. It allows the vendor to implement a simple, standard interface, giving them access to an extensive catalog of identity provider support, with guided onboarding wizards for the customer.

If your software is currently secured using Keycloak, Phase Two or another OIDC method, updating it to use Phase Two Connect is a quick integration that will give you significant automation to one of the most time-consuming aspects of on-prem software customer onboarding.

See a short video demonstrating how the Phase Two Connect "wizards" streamline IdP setup:

<iframe width="560" height="315" src="https://www.youtube.com/embed/9HJWdJqnE0I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The standard [Phase Two Docker image](https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags) contains the base version of Phase Two Connect by default. This restricts the IdP onboarding wizards to the generic SAML, OIDC and LDAP protocol wizards. If you are a licensee with a support agreement, talk to your customer success representative about accessing your private image registry.

### Realm Import

You are encouraged **not** to use the `master` realm to secure your deployed application. A default realm with your initial setup parameters can be imported on install. Please see the [guide](https://www.keycloak.org/server/importExport) on importing a realm a startup. Your specific method will depend on if you are deploying with Kubernetes or some other mechanism.

### Onboarding Guide

It is recommended to provide your on-prem customers with an onboarding guide that includes a way of accessing their Keycloak credentials following initial installtion in their cluster. You can create a link to the Phase Two Connect onboarding portal using the following format:

```
    https://<host>:<port>/auth/realms/<realm>/wizard/
```

Your customer will use their admin credentials to login and setup their IdP integration.
