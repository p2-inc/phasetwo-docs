import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "organizations",
  name: "Organizations",
  category: "B2B & Multi-tenant",
  iconKey: "organizations",
  diagramKey: "organizations",
  repo: "p2-inc/keycloak-orgs",
  docsHref: "/docs/organizations/",
  meta: {
    title: "Keycloak Organizations Extension — Multi-tenant B2B Identity",
    description:
      "Open source Keycloak extension that adds first-class organizations: per-tenant SSO, invitations, roles, and APIs. Built for B2B SaaS on Keycloak.",
  },
  hero: {
    h1: "First-class multi-tenant organizations for Keycloak.",
    lead: "Per-customer organizations with their own SSO, members, roles, invitations, and APIs — the foundation for B2B identity on Keycloak.",
    badges: ["Per-Org SSO", "Invitations", "Roles & Permissions", "REST API + SDKs", "Webhooks"],
  },
  problem: {
    heading: "Multi-tenant B2B identity isn't a built-in Keycloak feature — until now.",
    cards: [
      { title: "Multi-tenancy is glued together, badly", body: "Most B2B apps end up with tenant tables wired into auth — no consistent way to invite users, manage roles per org, or hand off SSO setup." },
      { title: "Customers expect their IdP, not yours", body: "Every enterprise wants to bring their own Okta, Azure, or SAML setup. Building per-tenant SSO from scratch is months of engineering work." },
      { title: "Admin work eats your support team", body: "Inviting users, managing roles, configuring SSO — without self-serve tools, your support team becomes the customer's identity admin." },
    ],
  },
  approach: {
    heading: "Organizations as a first-class entity",
    intro: "Not a column on the user table. A real entity with its own identity, membership, roles, IdP, and audit trail.",
    cards: [
      { title: "Self-serve by default", body: "Invitations and SSO config happen in your app, not your Keycloak console. Customer admins manage their own users." },
      { title: "APIs that match how you ship", body: "REST endpoints, JS/Java/Go SDKs, webhooks for every org event. Treat orgs like any other resource." },
      { title: "Open standards underneath", body: "OIDC, SAML, SCIM. No bespoke protocols. If you can speak SSO, you can plug into Organizations." },
      { title: "Audit-ready from day one", body: "Every org has a scoped event stream — who joined, who invited them, what role they have, when SSO was changed." },
    ],
  },
  useCases: {
    heading: "What teams ship with Organizations",
    intro: "B2B SaaS teams use Organizations to model the customer hierarchy their billing, permissions, and onboarding flows already assume.",
    items: [
      { title: "B2B SaaS multi-tenancy", sub: "Per-customer scopes for data, billing, and roles." },
      { title: "Enterprise customer onboarding", sub: "Hand off SSO + invitations to the customer's admin." },
      { title: "Partner / supplier networks", sub: "External orgs with limited, time-scoped access." },
      { title: "Per-customer compliance", sub: "SOC 2 / HIPAA scopes that don't bleed across tenants." },
    ],
  },
  capabilities: {
    heading: "Everything multi-tenant identity needs",
    items: [
      { title: "Per-Org SSO", body: "Each organization can point at its own Okta, Azure, Google, or SAML IdP." },
      { title: "Invitations", body: "Send and accept invites with the role and org pre-assigned. Token-signed, expiring URLs." },
      { title: "Per-Org roles", body: "Define roles that only exist within an org. Permissions stay scoped." },
      { title: "Member management API", body: "Add, remove, transfer, suspend — all via REST. SDKs for JS, Java, and Go." },
      { title: "Domain auto-assignment", body: "New signups land in the right org automatically based on their email domain." },
      { title: "Audit log per org", body: "Every membership, role, and SSO change emitted as a Keycloak event." },
      { title: "SCIM 2.0 provisioning", body: "Sync users and groups from the customer's IdP without writing glue." },
      { title: "Webhooks", body: "Every org event posts to your URL — invitations, role changes, SSO updates." },
      { title: "Open source", body: "Run it yourself, fork it, or contribute upstream. Same code as our hosted product." },
    ],
  },
};

export default function OrganizationsExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
