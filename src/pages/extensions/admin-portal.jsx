import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "admin-portal",
  name: "Admin Portal",
  category: "B2B & Multi-tenant",
  iconKey: "admin-portal",
  diagramKey: "admin-portal",
  repo: "p2-inc/keycloak-admin-ui",
  docsHref: "/docs/admin-portal/",
  meta: {
    title: "Keycloak Admin Portal — Customer-Safe Admin UI",
    description:
      "Embeddable, scoped Keycloak admin UI that lets customer admins manage their own users, roles, and SSO without exposing the Keycloak console.",
  },
  hero: {
    h1: "An admin UI that's safe to put in your customer's hands.",
    lead: "Customer admins shouldn't see your Keycloak console. The Admin Portal is a scoped, embeddable UI that lets them manage their own users, roles, and SSO — and nothing more.",
    badges: ["Scoped By Org", "Embeddable", "Brandable", "No Keycloak Console Exposure"],
  },
  problem: {
    heading: "Exposing the Keycloak console to customers is a non-starter.",
    cards: [
      { title: "Too much surface area", body: "The Keycloak admin console shows realm-wide settings. One misclick and a customer changes your global config." },
      { title: "Wrong language for customers", body: "Realms, clients, identity providers — Keycloak's terminology doesn't match what your customer thinks about." },
      { title: "Brand mismatch", body: "Keycloak's default UI looks like Keycloak. Your customers expect your brand inside their settings." },
    ],
  },
  approach: {
    heading: "A portal scoped to the customer, not the realm",
    cards: [
      { title: "Per-Organization scope", body: "Every action is scoped to one organization. No cross-tenant leakage by construction." },
      { title: "Customer-shaped vocabulary", body: "'Members', 'Teams', 'SSO' — not 'Users', 'Roles', 'Identity providers'." },
      { title: "Embeddable in your app", body: "Drop the portal into your existing admin UI, theme it, and it inherits your brand." },
      { title: "Reuses Organizations + IdP Wizard", body: "Built on the rest of the suite — every org capability surfaces in the portal automatically." },
    ],
  },
  useCases: {
    heading: "Where the Admin Portal goes",
    intro: "Anywhere customer admins need to manage their own identity surface without bothering your support team.",
    items: [
      { title: "Customer settings page", sub: "Embedded in yourapp.com/admin." },
      { title: "Trial / onboarding flow", sub: "Invite the team, set up SSO, ship." },
      { title: "Self-serve enterprise UI", sub: "Compliance, audit, role assignments." },
      { title: "Partner admin surface", sub: "Limited-scope identity admin for partners." },
    ],
  },
  capabilities: {
    heading: "Customer-safe identity management",
    items: [
      { title: "Member management", body: "Invite, remove, suspend, change role — all via the portal." },
      { title: "SSO setup (with IdP Wizard)", body: "Customers configure their own IdP. No tickets." },
      { title: "Role assignment", body: "Per-Org roles, no cross-tenant leakage." },
      { title: "Audit log view", body: "Customer admins see what happened in their org." },
      { title: "Brandable", body: "Logo, colors, copy. Fits inside your app." },
      { title: "iFrame or React SDK", body: "Embed the portal with one tag or one component." },
    ],
  },
};

export default function AdminPortalExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
