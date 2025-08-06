---
id: idp
title: Keycloak as an Identity Provider Broker (IdP)
---

## What Is an IdP Broker?

An Identity Provider (IdP) Broker acts as an intermediary between a service provider (your application) and multiple external identity providers (such as Google, Microsoft, or enterprise SAML/OIDC providers). It standardizes the authentication experience for users, regardless of which identity provider they use.

Keycloak, functioning as an IdP Broker, simplifies the integration of multiple identity sources into a unified system. It enables authentication across various identity providers while presenting a single, consistent entry point to users.

---

## IdP Broker Use Cases

IdP Brokers are especially useful in federated identity environments. Common use cases include:

- **Partner access** to shared services in a B2B environment, where each partner uses their own IdP
- **Multi-organization platforms** (e.g., SaaS tools) where each customer has their own enterprise IdP
- **Single entry point for diverse user bases**, such as internal employees via SAML and customers via [social logins](../authentication/social-login.md)
- **Simplifying integration with multiple social identity providers** in B2C applications

By brokering identities, Keycloak enables users to authenticate using their preferred identity provider without the need for redundant credential management.

![CIAM](/docs/keycloak/ciam.png)

---

## Why Keycloak for IdP Brokering?

Keycloak offers a flexible and robust IdP Brokering model that supports multiple protocols and use cases.

### B2B Identity Federation

Keycloak is well-suited for **Business-to-Business (B2B)** scenarios. It allows organizations to federate identities from:

- Customer or partner IdPs
- Other Keycloak instances (or between Keycloak realms on the same instance)
- Standard-compliant IdPs using SAML or OpenID Connect

This supports secure, scalable authentication across business boundaries.

Phase Two simplifies this process and setup with our [Organizations extension](../organizations/identity-providers.md).

### Protocol Translation & Normalization

Keycloak acts as a bridge between various protocols, enabling:

- SAML ↔ OIDC transformations
- Standardized token issuance (e.g., JWTs for downstream services)
- Role and attribute mapping between external IdPs and internal representations

### Consistent Login Experience

Keycloak consolidates the login flow into a single user-facing entry point, regardless of the upstream identity provider. This ensures a seamless experience and enables branding, language, and flow customizations.

### Dynamic IdP Routing

With Keycloak, you can configure:

- **Home realm discovery** based on email domains
- **Pre-selected IdPs** via URL parameters
- **Custom login flows** to prompt users for IdP selection

This makes it easier to deliver tailored experiences for multi-tenant or partner-driven applications.

Phase Two simplifies this process and setup with our Organizations extension's [home IdP discovery](../organizations/membership.md).

### Account Linking & User Management

Keycloak supports automatic or manual **account linking**, helping reconcile identities from different IdPs to a single user record. This is essential when users have accounts in multiple systems or migrate from one IdP to another.

---

By acting as a centralized broker, Keycloak simplifies the complexity of identity federation across diverse systems. It is a critical component for any organization that wants to provide secure, seamless access across multiple identity sources—without compromising user experience or security.
