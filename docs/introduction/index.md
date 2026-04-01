---
id: index
title: Introduction
---

Welcome to Phase Two. We have built a toolkit for some of the most common features and pain points you will encounter when building your SaaS application. Initially, we have focused on authentication and authorization use cases. Our goal is to build secure and easy-to-use tools that will accelerate your time to market and adoption by enterprise customers.

Phase Two is unique in that it allows you to build against a common set of tools, libraries and APIs whether you are using our hosted version for a public cloud product, hosting it yourself, or deploying to a customer site.

We are constantly looking for ways to improve our documentation, APIs and developer experience. If you have suggestions or requests, please don't hesitate to [contact us](mailto:support@phasetwo.io). If you prefer a more hands-on approach, you can submit a pull request in our Github [documentation repository](https://github.com/p2-inc/phasetwo-docs/tree/main/docs).

## Common Scenarios

These are some of the most common implementation paths teams look for when getting started.

:::tip Customer-Managed Enterprise SSO
If you want organization administrators to configure their own SAML or OIDC identity provider, associate verified domains, and automatically redirect users to the correct login experience:

- Start with [Organizations](../organizations/index.md)
- Let organization admins self-manage setup with the [IdP Wizard](../organizations/idp-wizard.md)
- Associate providers and verified domains in [Organization Identity Providers](../organizations/identity-providers.md)
- Configure login routing with [Automatic IdP Redirection](../organizations/automatic-idp-redirection.md)
- See the end-user flow in [Enterprise SSO](../authentication/sso.md)
:::

:::tip SAML Attribute Mapping and Federation
If you are connecting a SAML identity provider or service provider and need users to land with the correct attributes and claims after login:

- Understand the federation model in [Keycloak as an Identity Provider Broker](../keycloak/idp.md)
- Review the SAML request, response, and assertion model in [SAML, Simplified](/blog/introduction-to-simple-saml)
- Expose the right claims to applications with [Token Mappers](../organizations/token-mappers.md)
:::

## Authentication Flows

These are the main guides most teams reach for when designing a login experience.

- Start with [Authentication](../authentication/index.md) for the overview of the available login methods
- Learn how flow configuration works in [Understanding Flows](../authentication/understanding-flows.md)
- Add authenticator-app based MFA with [One-Time Passwords](../authentication/otps.md)
- Set up modern device-based authentication with [Passkeys](../authentication/passkeys.md)
- Set up passkeys, security keys, or passwordless login with [WebAuthn](../authentication/webauthn.md)
- Implement email-first or passwordless sign-in with [Magic Links](../authentication/magic-links.md)
- Combine multiple factors and conditions in [Complex Flows](../authentication/complex-flows.md)

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
