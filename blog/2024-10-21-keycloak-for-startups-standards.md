---
slug: keycloak-for-startups-standards
title: "Why your startup should use Keycloak for SSO and User Management - Part 1: Standards"
description: Every commercial and open source IAM offering is an implementation of the same standards.
authors: phasetwo
tags: [keycloak, phase_two, startup, standards]
---

:::note

In this [series](./2024-10-18-keycloak-for-startups-overview.md) we are proposing Keycloak as a superior alternative to commercial identity offerings.

- [Part 2: Data Ownership](./2024-10-28-keycloak-for-startups-data.md)

:::

### Part 1: Standardized Protocols and Minimal Feature Set Differentiation

In the realm of Identity and Access Management (IAM) solutions, it's essential to recognize that many offerings, both commercial and open source, operate on standardized protocols such as OpenID Connect (OIDC), Security Assertion Markup Language (SAML), System for Cross-domain Identity Management (SCIM), Lightweight Directory Access Protocol (LDAP), and more. This adherence to standardized protocols often results in minimal differentiation at the feature set level across various options. Let's delve into this further:

<!--truncate-->

1. **Protocol Compliance**: Whether it's OIDC for modern authentication, SAML for Single Sign-On ([SSO](/product/sso/)), SCIM for user provisioning, or LDAP for directory services, IAM solutions are built upon established industry standards. This adherence ensures interoperability and compatibility with a wide range of applications and systems, irrespective of the chosen solution.

2. **Core Functionality**: At their core, [IAM solutions](./2024-03-11-open-source-iam.md) primarily focus on fundamental functionalities such as authentication, authorization, user provisioning, and identity federation. These functionalities form the backbone of IAM systems and are present across all offerings, regardless of whether they are commercial or open source.

3. **Feature Parity**: While commercial IAM solutions may tout additional features or value-added services, the underlying feature set remains largely consistent across the board. Basic [functionalities](/product/identity/) such as user authentication, role-based access control (RBAC), multi-factor authentication (MFA), and audit logging are standard offerings in both commercial and open-source IAM solutions.

4. **Customization and Extensibility**: Differentiation often occurs at the level of [customization and extensibility](./2024-09-27-keycloak-extensions-presentation.md) rather than core features. Both commercial and open-source IAM solutions provide APIs, SDKs, and extension points that enable organizations to tailor the platform to their specific requirements, integrate with existing systems, and extend functionality as needed.

5. **Vendor-Specific Enhancements**: While the core feature set may be similar across IAM solutions, vendors may differentiate themselves through vendor-specific enhancements, integrations, or ecosystem partnerships. However, these enhancements typically cater to niche use cases or specific industries and may not significantly impact the overall feature parity among IAM solutions.

6. **Closed Development**: One of the key issues is that many commercial solutions are developed in isolation of public audits and community scrutiny. Companies build and operate these core secuirty protocols and standards behind a veil of secrecy, not sharing their implementations to allow review by security professionals and standards bodies. In contrast, open source solutions are built to allow full review and participation by both. Keycloak has been through many independent reviews and audits, and has a mature process for handling security issues in a timely fashion. Do you want these critical security implementations to be built with a rigor for review, or something one developer slapped together from a few examples and ChatGPT sessions?

#### Conclusion 1: Making Informed Decisions Beyond Feature Sets

In conclusion, while it's true that there is minimal differentiation on the feature set level among IAM solutions due to standardized protocols, organizations should focus on other factors when evaluating and selecting a solution. Considerations such as cost-effectiveness, customization capabilities, vendor support, community engagement, and alignment with organizational goals should weigh heavily in the decision-making process.

Ultimately, the choice between commercial and open-source IAM solutions should be driven by factors beyond the core feature set, with organizations prioritizing flexibility, scalability, security, and long-term sustainability in their IAM strategy.

_Read [Part 2: Data Ownership](./2024-10-28-keycloak-for-startups-data.md) now._

Get in touch at [sales@phasetwo.io](sales@phasetwo.io) to learn more.
