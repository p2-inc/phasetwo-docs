---
id: setup
title: Setup
---

The standard [Phase Two Docker image](https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags) contains the base version of Phase Two Connect by default. This restricts the IdP onboarding wizards to the generic SAML, OIDC and LDAP protocol wizards. If you are a licensee with a support agreement, talk to your customer success representative about accessing your private image registry.

### Realm import 

You are encouraged **not** to use the `master` realm to secure your deployed application. A default realm with your initial setup parameters can be imported on install. Please see the [guide](https://www.keycloak.org/server/importExport) on importing a realm a startup. Your specific method will depend on if you are deploying with Kubernetes or some other mechanism.

### Onboarding Guide

It is recommended to provide your on-prem customers with an onboarding guide that includes a way of accessing their Keycloak credentials following initial installtion in their cluster. You can create a link to the Phase Two Connect onboarding portal using the following format:
```
    https://<your-host-name>/auth/realms/<your-realm-name>/wizard/
```

Your customer will use their admin credentials to login and setup their IdP integration.
