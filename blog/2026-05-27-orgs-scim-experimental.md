---
title: Experimental SCIM 2.0 provisioning for Organizations
slug: orgs-scim-experimental
date: 2026-05-27
authors: phasetwo
tags: [phase_two, keycloak, organizations, scim, provisioning, open_source]
description: Per-organization SCIM 2.0 endpoints for Keycloak, built on Metatavu's keycloak-scim-server. Experimental, but already in production use.
---

We're shipping experimental SCIM 2.0 provisioning for the Phase Two [Organizations extension](https://github.com/p2-inc/keycloak-orgs). Each organization in a realm can now act as its own SCIM 2.0 service provider, so an upstream IdP like Okta or Entra ID can push users into a specific tenant rather than into the realm as a whole.

This is the piece of the multi-tenant story that Keycloak's stock SCIM support doesn't address today, and it's been a heavily requested item from customers running Organizations in production.

<!-- truncate -->

## How this differs from Keycloak's experimental SCIM

Keycloak shipped its own experimental SCIM 2.0 capability in version `26.6`, and it's worth being clear about how the two relate, because the names overlap but the scopes don't:

- **Keycloak's SCIM is realm-level.** An external IdP provisions users into the realm. There is one SCIM endpoint per realm and one population of users. That model is fine when a realm represents a single customer or a single workforce — it's the classic Keycloak deployment shape.
- **Our SCIM is organization-level.** An external IdP provisions users into a specific organization within a realm. There is one SCIM endpoint *per organization*, and each one has its own authentication configuration, its own optional IdP federation link, and its own member graph. The realm can host thousands of organizations, each backed by a different upstream identity system, without those populations bleeding into each other.

If you're running a B2B SaaS where each customer is an Organization, the realm-level model isn't what you want — you'd be asking every customer's IT department to provision into a shared pool. The per-organization model is the natural fit: each customer's IdP gets its own SCIM URL, its own credentials, and provisions only into its own tenant.

Both are experimental. They're not in competition — they're solving different problems at different layers — and over time we expect the realm-level and organization-level capabilities to coexist in the same Keycloak deployment.

## What's in the release

The capability ships disabled by default and is gated by a realm-level flag. Once enabled, each organization gets:

- A SCIM 2.0 endpoint at `/realms/{realm}/scim/v2/organizations/{orgId}/` exposing the standard SCIM resources (`/ServiceProviderConfig`, `/ResourceTypes`, `/Schemas`, `/Users`, `/Groups`).
- A **SCIM** tab in the organization detail page of the admin UI for configuring authentication and provisioning behavior.
- A REST configuration API at `/realms/{realm}/orgs/{orgId}/scim` for the same operations.
- Four authentication modes for inbound provisioning calls: `KEYCLOAK` (Bearer access token), `EXTERNAL_JWT` (validated against an upstream issuer + JWKS), `EXTERNAL_SECRET` (shared bearer secret), and `EXTERNAL_BASIC` (HTTP Basic). Cleartext secrets and passwords are hashed with Argon2id before persistence.
- Optional federation to the organization's configured identity provider, so provisioned users can immediately sign in via the org's existing SSO.

The full surface is documented in [`docs/scim.md`](https://github.com/p2-inc/keycloak-orgs/blob/main/docs/scim.md) in the keycloak-orgs repo.

### What "experimental" means here

The API shape, the configuration schema, and the realm-level enablement flag may change in a backwards-incompatible way before we mark it stable. If you take a dependency, pin to a specific version of `keycloak-orgs` and read the changelog before upgrading.

That caveat isn't theoretical — we're still iterating on the authentication mode set, the configuration shape for credential rotation, and the exact semantics around the IdP linkage. We'd rather get those right than freeze them prematurely.

## Credit where it's due: Metatavu's keycloak-scim-server

The SCIM 2.0 server implementation underneath this is [Metatavu's `keycloak-scim-server`](https://github.com/Metatavu/keycloak-scim-server) — an open-source SCIM provider that handles the protocol-level work of speaking SCIM 2.0 to upstream IdPs. We've been building on top of it, contributing back, and maintaining a fork tuned for the per-organization model.

Metatavu's project is itself under active development, and so is our use of it. The two efforts are happening in parallel: Metatavu is iterating on the core SCIM server, and we're iterating on the organization-aware layer that sits on top. Neither codebase is "done."

What both projects do have, despite the experimental label, is **active production users today**. Metatavu has been running their SCIM server in real deployments, and Phase Two customers are already using the per-organization variant against real upstream IdPs. The "experimental" tag reflects the rate of change in the API surface, not the maturity of the underlying provisioning logic.

If you're evaluating this for a production rollout, the realistic posture is: it works, it's being used, and you should expect to update your integration when the configuration shape evolves. Pin versions and follow the changelog.

## Getting started

If you're already running Phase Two's Keycloak extensions, upgrade to the latest `keycloak-orgs`, enable the realm-level `scimEnabled` flag, and the SCIM tab will appear on each organization. The [SCIM docs](https://github.com/p2-inc/keycloak-orgs/blob/main/docs/scim.md) walk through the realm flag, the per-organization configuration, and each of the four authentication modes.

If you want to skip the self-host setup, you can try this on a free realm in the [Phase Two Dashboard](https://dash.phasetwo.io/) — the same Organization SCIM capability is available there.

Feedback, bug reports, and use-case stories are all welcome on the [keycloak-orgs issue tracker](https://github.com/p2-inc/keycloak-orgs/issues) or directly to [support@phasetwo.io](mailto:support@phasetwo.io). The faster we hear from real integrations, the faster we get this to stable.
