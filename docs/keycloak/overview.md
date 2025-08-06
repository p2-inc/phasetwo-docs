---
id: overview
title: Keycloak Overview
---

[Keycloak](https://keycloak.org) is a capable open-source identity and access management (IAM) solution backed by [Red Hat](https://www.redhat.com/). It is governed by the Apache License 2.0 allowing for individuals and organizations to use and customize it. It is designed and built for enterprise-grade Single Sign-On (SSO).

Keycloak excels at centralizing authentication and authorization across multiple applications and services.Supporting industry-standard protocols including OAuth 2.0, OpenID Connect, and SAML, Keycloak seamlessly integrates with existing infrastructure such as LDAP servers and Microsoft Active Directory. What truly sets Keycloak apart is its remarkable configurability and flexibility - offering both an intuitive administrative UI and the ability to extend functionality through custom extensions.

Whether you're running a simple web application or a complex microservices architecture, Keycloak adapts to meet your specific security requirements without compromising on functionality. Vanilla Keycloak, while powerful, lacks some of the main features that most businesses or individuals need to run a production-grade application. This is where Phase Two comes in. We have built a collection of essential Keycloak extensions that enhance its capabilities, making it easier to use, operate, and scale. All of our deployments use that the Phase Two [base image](https://quay.io/organization/phasetwo) which includes those [extensions](https://github.com/p2-inc). For paid customers, you can further customize your Keycloak deployment with custom extensions that meet your specific needs.

Phase Two will be the first to tell you that while Keycloak's capabilities are vast and complex, this complexity translates into incredible versatility. There is certainly a learning curve, but the investment pays dividends in the comprehensive identity management solutions you can build. The following sections will help you understand Keycloak's features and configuration options, empowering you to harness its full potential for your organization's security needs.

## Keycloak Core Capabilities

Here’s an overview of its core features and how they support secure, scalable identity architecture.

### Single Sign-On (SSO)

One of the most important and widely desired features for an authentication system. Add multiple identity providers and enable those on login pages to allow for seamless authentication across multiple applications with a single login. Keycloak's SSO capability improves user experience and reduces password fatigue—ideal for organizations managing multiple services. Learn more about [SSO](../sso/index.md)

### Identity Brokering

Allow users to sign in using existing identities from **social platforms** (Google, Facebook, GitHub, etc.) or **enterprise IdPs** (like Azure AD, SAML, or OpenID Connect providers). Keycloak acts as a broker, unifying identity sources under one system. Combining Identity Brokering with SSO allows users to authenticate using their preferred identity provider while maintaining a consistent user experience across applications.

The ways in which Keycloak acts as an Identity Broker vary slightly. Review our pages on [CIAM](./ciam.md), [IdP](./idp.md), and [IAM](./iam.md) to see how Keycloak can be used in different contexts.

### Multi-Factor Authentication (MFA)

Increase account security with configurable MFA options, including TOTP (e.g., Google Authenticator), SMS, and custom authenticators. MFA can be enforced globally or per client. These are added and configured via Authentication Flows, allowing you to create custom authentication flows that suit your security requirements. Learn more about [Authentication Flows](../authentication/index.md).

### Token-Based Authentication

Keycloak uses industry-standard tokens (JWTs) for stateless authentication and authorization. Tokens support scopes, roles, and expiration policies to ensure secure and efficient access control across microservices and APIs.

JWT's are a subject unto themselves. See our articles on [JWTs](/articles/category/json-web-tokens-jwt/).

### Protocol Support

Keycloak is based on standard protocols and provides support for:

- [**OpenID Connect (OIDC)**](https://openid.net/connect/)
- [**OAuth 2.0**](https://oauth.net/2/)
- [**SAML 2.0**](https://en.wikipedia.org/wiki/SAML_2.0)

This ensures interoperability with modern applications and legacy systems alike.

### User Federation and External Identity Sync

Integrate with external directories like LDAP and Microsoft Active Directory. Keycloak federates users in real-time, avoiding the need for data migration while centralizing identity management. You can also implement your own provider if you have users in other stores, such as a relational database.

For more specialized needs, implement custom sync logic with the Keycloak User Storage SPI.

### Role-Based Access Control (RBAC)

Control who can access what. Assign fine-grained permissions using roles, groups, and scopes—supporting both application-level, realm-level, and organizational-level role models for secure authorization at scale.

### Web Admin Console

A web-based admin UI provides full control over users, clients, realms, roles, policies, and more—no CLI knowledge required. Admins can manage configurations easily and securely. That said, the API is also available for programmatic access to Keycloak's capabilities, allowing for automation and integration with other systems.

### Account Console

A web-based user account management console allows users to manage their own accounts, including profile information, password changes, and MFA settings. This self-service capability reduces administrative overhead and improves user satisfaction. The theme for this can also be customized to match your brand.

### Theme & Page Customization

Customize Keycloak’s login, registration, and account pages to match your brand. Use FreeMarker templates with HTML, CSS, and JavaScript support to tailor the user experience. Or use [Keycloakify](https://keycloakify.dev) to easily customize your app with CSS or fully custom React or Angular components. Keycloakify also provides backwards compatibility between Keycloak versions, so you can upgrade Keycloak without worrying about breaking your customizations.

To simplify quick theme customization, see Phase Two's [Customizing UI](../getting-started/customizing-ui.md) documentation.

---

### 💡 Phase Two Enhancements

While Keycloak offers a rich set of features out-of-the-box, operating it at scale requires additional tooling. Phase Two provides:

- Production-ready base images with essential extensions pre-installed
- UI and API enhancements
- Hosted and self-hosted deployment options
- Enterprise support and consulting

Explore our [Keycloak overview](../introduction/open-source.md) to see how we elevate Keycloak for SaaS builders and enterprise teams.
