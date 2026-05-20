import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "idp-wizard",
  name: "IdP Wizard",
  category: "B2B & Multi-tenant",
  iconKey: "idp-wizard",
  diagramKey: "idp-wizard",
  repo: "p2-inc/idp-wizard",
  meta: {
    title: "Keycloak IdP Wizard — Self-serve SAML & OIDC Setup",
    description:
      "Open source Keycloak extension that gives customer admins a guided UI to configure their own SAML or OIDC identity provider — no support ticket required.",
  },
  hero: {
    h1: "Let your customers set up their own SSO. No support tickets required.",
    lead: "A guided, customer-facing wizard that walks each tenant admin through configuring their own SAML or OIDC identity provider — without filing a ticket with you.",
    badges: ["SAML 2.0", "OIDC", "Auto-Discovery", "Claim Mapping", "Embeddable"],
  },
  problem: {
    heading: "SSO configuration is one of the biggest support burdens in B2B.",
    cards: [
      { title: "Every customer wants their IdP", body: "Okta, Azure, Google, Ping, custom SAML — every enterprise customer brings their own. Setting each one up is bespoke work." },
      { title: "Configuration trips up admins", body: "Entity IDs, ACS URLs, claim mapping, signing certs — most customer admins have never seen these before and end up emailing you screenshots." },
      { title: "Your team becomes their helpdesk", body: "Without a self-serve flow, SSO setup means a back-and-forth that can take days. You can't ship faster than your support backlog." },
    ],
  },
  approach: {
    heading: "Configuration that looks like a product, not a config file",
    intro: "We turned SSO setup into a guided UI that the customer admin uses inside your app.",
    cards: [
      { title: "Pick the IdP, not the protocol", body: "Customer picks 'Okta' or 'Azure' — we generate the right SAML or OIDC config under the hood." },
      { title: "Auto-discover everything we can", body: "Metadata URLs, tenant IDs, claim names — we pull what's discoverable, only ask for the rest." },
      { title: "Test before you save", body: "Built-in test login so customers know it works before going live." },
      { title: "Embed it anywhere", body: "Drop the wizard into your own admin UI. Or use it standalone." },
    ],
  },
  useCases: {
    heading: "Where self-serve SSO pays off",
    intro: "Whenever an enterprise customer needs SSO and your team doesn't want to be in the middle of it.",
    items: [
      { title: "Enterprise tier onboarding", sub: "Self-serve the highest-value step." },
      { title: "Trial → paid upgrade", sub: "Customer flips on SSO themselves." },
      { title: "Multi-product orgs", sub: "Same wizard configures SSO across all products." },
      { title: "White-label SaaS", sub: "Embed in your customer's branded admin UI." },
    ],
  },
  capabilities: {
    heading: "Walkthrough setup, production-grade plumbing",
    items: [
      { title: "Okta / Azure / Google quick-start", body: "Pre-built recipes for the most common enterprise IdPs." },
      { title: "Generic SAML & OIDC", body: "Fall back to a guided generic flow for anything else." },
      { title: "Metadata auto-import", body: "Paste a URL, we fetch the SAML metadata for them." },
      { title: "Claim mapping UI", body: "Map IdP claims to Keycloak attributes without editing XML." },
      { title: "Test login flow", body: "Verify the connection works before exposing it to end users." },
      { title: "Embed via iframe or SDK", body: "Drop the wizard into your own admin surface." },
    ],
  },
};

export default function IdpWizardExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
