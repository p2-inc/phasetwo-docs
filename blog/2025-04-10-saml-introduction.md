---
title: "SAML, Simplified."
slug: introduction-to-simple-saml
date: 2025-04-10
authors: phasetwo
tags: [phase_two, open_source, saml, authentication]
---

SAML has a bit of a reputation. For many developers, it lives in that shadowy corner of the B2B internet where XML still rules and stack traces seem to go on forever. If you've ever had the misfortune of debugging a malformed `<Assertion>`, you know the pain. But here's the thing: it doesn't have to be a nightmare.

At Phase Two, we provide [managed hosting](/hosting) and [enterprise support](/support) for [Keycloak](https://www.keycloak.org/), a leading open-source Identity and Access Management platform. And while [OIDC](https://openid.net/specs/openid-connect-core-1_0-final.html) has become the default for most modern applications, [SAML](https://en.wikipedia.org/wiki/SAML_2.0) is still alive and well—especially in enterprise environments.

This post is a gentle (and opinionated) introduction to what SAML is, how it works, and why it still matters particularly if you're implementing SAML [SSO](/product/sso/) in Keycloak.

<!-- truncate -->

### What even is SAML?

SAML — short for Security Assertion Markup Language — is a standardized XML-based protocol used to exchange authentication and authorization data between parties, most commonly between an Identity Provider (IdP) and a Service Provider (SP).

The core idea? Let users log in once (with the IdP) and then access multiple systems (the SPs) without re-authenticating. That's Single Sign-On (SSO), and it's where SAML shines.

To make this concrete, imagine you're using Google Workspace to access your company's internal tools. You open up a tool like Jira (that's the Service Provider — it provides the service you want to use). But instead of logging in directly, you're redirected to Google to sign in — that's your Identity Provider. Google verifies who you are, then sends a message back to Jira saying, “Yes, this is the correct user, and here's some information about them.” The service (Jira) trusts that identity because it already trusts Google. In simple terms: the IdP is who you log in with, the SP is what you're trying to access.

### Keycloak and SAML

Keycloak supports both sides of the SAML flow. It can act as:

- A **SAML Identity Provider**, enabling users to authenticate in Keycloak and then access SAML-based applications.
- A **SAML Service Provider**, allowing external IdPs (like Okta, Azure AD, or even legacy ADFS systems) to federate users into Keycloak-managed apps.

That flexibility is one of Keycloak's greatest strengths — and also where things can get a bit complex.

### The SAML Triad: User, SP, IdP

Let's simplify things. In a typical Keycloak-based SAML setup, you're dealing with three entities:

1. The **User**: someone trying to log in.
2. The **Service Provider (SP)**: your application.
3. The **Identity Provider (IdP)**: Keycloak or another IdP.

When Keycloak is the IdP, it authenticates the user and issues a SAML response back to the SP. When Keycloak is the SP, it receives the SAML response and handles session creation internally.

### What does a SAML flow look like in Keycloak?

Let's say Keycloak is acting as the **SAML Service Provider**. Here's the basic flow:

1. A user tries to access your app.
2. The app redirects the user to Keycloak (the SP).
3. Keycloak identifies that the user should log in via SAML (based on their realm or identity provider configuration).
4. Keycloak sends a SAML AuthnRequest to the external IdP (e.g., Okta).
5. The IdP authenticates the user and sends a signed SAML Response back to Keycloak.
6. Keycloak parses the assertion, validates the signature, and creates a user session.

From there, the user gets access to the protected application—without having logged in directly with your app or even with Keycloak.

### SAML messages: what you're actually passing around

In SAML, two XML messages do most of the heavy lifting:

- **AuthnRequest** (from SP → IdP): "Hey, can you authenticate this user for me?"
- **Response** (from IdP → SP): "Yes, here's proof that I authenticated them."

The Response contains one or more Assertions, which are signed blobs of XML confirming that the user is who they say they are. It might look like gibberish to humans, but to systems like Keycloak, it's gold.

And yes, validating those signatures is as fussy as it sounds. But Keycloak handles most of that for you — so long as your trust relationships are properly configured.

#### The SAML Request

Before a user is authenticated, Keycloak (acting as the Service Provider) initiates the SAML flow by sending a SAML AuthnRequest to the configured Identity Provider. This request is typically passed via a browser redirect and contains metadata about who's asking for authentication and when.

Let's look at an example SAML Request

```xml
<AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:protocol" ID="saml_req_42kpl9zyx0qndmlwv5a6t93ne" Version="2.0" IssueInstant="2025-04-04T15:00:00Z">
    <Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">
        https://auth.phasetwo.io/auth/realms/my-tenant/broker/saml-client/endpoint
    </Issuer>
</AuthnRequest>
```

The Issuer tells the IdP who is requesting authentication. The ID is used to match the incoming response back to this request.

#### The SAML Response

When your Keycloak instance is acting as a SAML Service Provider, it will receive a SAML Response from the Identity Provider (IdP) after a user successfully authenticates. This response contains critical information like who the user is, how they authenticated, and whether the response is trusted.

Let's look at an example SAML Response and break down the pieces:

```xml
<Response IssueInstant="2025-04-04T12:00:00Z" Version="2.0" ID="_abc12345-6789-4def-90ab-abcdef123456" xmlns="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
    <saml:Issuer>https://idp.example.org</saml:Issuer>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha256"/>
            <ds:Reference URI="#_abc12345-6789-4def-90ab-abcdef123456">
                <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#">
                        <InclusiveNamespaces PrefixList="saml ds xs xsi" xmlns="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                    </ds:Transform>
                </ds:Transforms>
                <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha256"/>
                <ds:DigestValue>XYZ123abc4567890=</ds:DigestValue>
            </ds:Reference>
        </ds:SignedInfo>
        <ds:SignatureValue>
            MIIEogIBAAKCAQEA2vGfZPjld7vFq3sGpKUqLbHu0XzX7r8VcU38D1bAgm...
        </ds:SignatureValue>
        <ds:KeyInfo>
            <ds:X509Data>
                <ds:X509Certificate>
                    MIIC+zCCAeOgAwIBAgIJAKN+FfK01MywMA0GCSqGSIb3DQEBCwUAMBoxGDAW
                    BgNVBAMTD2lkcC5leGFtcGxlLm9yZzAeFw0yNTA0MDEwMDAwMDBaFw0yNjA0MDEw
                    MDAwMDBaMBoxGDAWBgNVBAMTD2lkcC5leGFtcGxlLm9yZzCBnzANBgkqhkiG9w0B
                    AQEFAAOBjQAwgYkCgYEAzRPl2OslkTfI4E4zVFYoxwHavwJ3uPDbGb8y03wvNVYl
                    cCy+YBk6yXfiOlNwYQwcz92XJgYBj6+9oA+2bkfy3hDR9QO5Prcb2XtU6cKkB3vC
                    Z2IUXgsyF7ibOa9hRLo3A7N8Y3RhPG64Q9OcEv0bPPOb/NcAV+UBrQ9rEwUCAwEA
                    AaNQME4wHQYDVR0OBBYEFH8GhkeIDx4MKZFOZkYI2gfnSkQOMB8GA1UdIwQYMBaA
                    FH8GhkeIDx4MKZFOZkYI2gfnSkQOMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEL
                    BQADgYEAFM6CvlquE7ZzpFLiJbR4TG0OCpgG4S2kgNR4+a6+6Zsd+wNoUNdPVFcU
                    Y4xLf3pJStIjMNxtQPC8j6WxZ9Hk8M+jfqU1mKPgM4zk9C2FJ9GVz9NNVrphTAjO
                    O6eFcX7zBhf8U4WshjWfHg==
                </ds:X509Certificate>
            </ds:X509Data>
        </ds:KeyInfo>
    </ds:Signature>
    <Status>
        <StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </Status>
    <Assertion ID="_def45678-90ab-4abc-a1b2-cdef56789012" IssueInstant="2025-04-04T12:00:00Z" Version="2.0" xmlns="urn:oasis:names:tc:SAML:2.0:assertion">
        <Issuer>https://idp.example.org</Issuer>
        <Subject>
            <NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
                hello@phasetwo.io
            </NameID>
            <SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"/>
        </Subject>
        <Conditions NotBefore="2025-04-04T12:00:00Z" NotOnOrAfter="2025-04-04T12:05:00Z">
            <AudienceRestriction>
                <Audience>https://sp.myapp.com</Audience>
            </AudienceRestriction>
        </Conditions>
        <AuthnStatement AuthnInstant="2025-04-04T11:59:59Z">
            <AuthnContext>
                <AuthnContextClassRef>
                    urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
                </AuthnContextClassRef>
            </AuthnContext>
        </AuthnStatement>
    </Assertion>
</Response>
```

- The `<Assertion>` is where claims about the user are made—like their email or login timestamp.
- The `<Signature>` helps ensure this data hasn't been tampered with.
- The `<Audience>` defines who this message is meant for—your SP.

Keycloak does the heavy lifting of verifying signatures, extracting claims, and creating a session. But understanding the anatomy of a SAML Response helps when troubleshooting or configuring trust relationships.

### Trust is everything

For SAML to work securely, the SP and IdP must have a pre-configured trust relationship. That means each side has the other's metadata (usually containing certificates, endpoints, and supported bindings) and knows how to verify signatures.

In Keycloak, setting up a SAML identity provider (or service provider) involves uploading or referencing that metadata and tweaking a few settings. Once configured, Keycloak will:

- Automatically validate incoming assertions
- Map attributes from the assertion into user claims
- Create or update user accounts based on SAML attributes
- Apply realm-wide policies like required roles or groups

### But...why use SAML in 2025?

SAML isn't new, sleek, or trendy. But it's everywhere in large enterprises, government systems, and educational institutions. If you want to work with those organizations—or provide identity federation across organizational boundaries—you'll need to speak SAML.

Even if your app is all-in on OIDC, SAML bridges can help you bring legacy systems into a modern identity framework. That's where Keycloak really shines: it lets you federate multiple identity providers (SAML, OIDC, LDAP, etc.) into a consistent, centralized user management plane.

### Why let keycloak handle SAML?

Here's the kicker: you don't want to write your own SAML implementation. Parsing, validating, and verifying SAML messages is error-prone and fraught with subtle security pitfalls. With Keycloak (and managed services like [Phase Two](/hosting)), you don't have to.

Keycloak abstracts away the complexity. And at Phase Two, we abstract away the operational burden of [hosting](/hosting) and [securing](/product/identity) Keycloak itself. We provide:

- Production-grade Keycloak hosting
- Built-in SAML and OIDC support
- Multi-tenant federation capabilities
- Automated updates and backups
- Support from experts who live and breathe auth

TL;DR

- SAML is a complex but powerful standard for SSO.
- Keycloak provides full support for SAML, both as an IdP and SP.
- Use SAML when you need to integrate with enterprise IdPs or legacy systems.
- Don't roll your own — let Keycloak (and Phase Two) handle it.

Need help configuring SAML in Keycloak? Schedule a consultation today or get in touch at [sales@phasetwo.io](mailto:sales@phasetwo.io)
