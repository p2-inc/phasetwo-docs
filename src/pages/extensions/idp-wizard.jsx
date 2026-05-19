import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Keycloak IdP Setup Wizard — Self-Serve SAML & OIDC Configuration",
  description:
    "Open source Keycloak extension that gives end customers a guided wizard to configure their own SAML or OIDC identity provider. No tickets, no console access.",
};

const hero = {
  title: "IdP Wizard for Keycloak",
  description:
    "A guided, self-serve flow that lets your customers configure their own SAML or OIDC identity provider — without filing a support ticket or learning the Keycloak admin console.",
  imageSrc: "/img/idp-setup-wizard.svg",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/idp-wizard",
  secondaryCtaLabel: "Read the docs",
  secondaryCtaHref: "/docs/organizations/idp-wizard",
};

const problem = {
  title: "SSO setup is the slowest part of every B2B onboarding",
  intro:
    "Configuring SAML or OIDC in the Keycloak admin console is fast for engineers and miserable for everyone else.",
  points: [
    {
      title: "Field names don't match",
      description:
        "Keycloak's terminology doesn't line up with what Okta, Azure AD, or Google Workspace call the same fields — every step is a translation exercise.",
    },
    {
      title: "One typo silently breaks login",
      description:
        "Certificates, metadata URLs, and entity IDs are unforgiving. Mistakes don't fail loudly; they just produce a broken login flow at 3am.",
    },
    {
      title: "Every customer needs a screen-share",
      description:
        "For B2B teams, this turns every new customer SSO setup into a support engagement with a senior engineer in the loop.",
    },
  ],
};

const whyBuilt = {
  title: "Customer SSO should be self-serve, not a support ticket",
  intro:
    "The Keycloak admin console is the right tool for the engineer who owns the realm — and the wrong tool to put in front of a customer.",
  points: [
    {
      title: "Step-by-step, per provider",
      description:
        "Tailored flows for Okta, Azure AD, Google Workspace, OneLogin, ADFS, and generic SAML/OIDC — with screenshots and the exact fields each provider asks for.",
    },
    {
      title: "Validate before saving",
      description:
        "The wizard tests the connection before writing config. Certificate mismatches and callback typos surface as errors, not as broken logins.",
    },
    {
      title: "Built to embed in your product",
      description:
        "Drop the wizard inside the Admin Portal or surface it as a standalone page. Customers configure SSO from inside your app, not inside Keycloak.",
    },
    {
      title: "Removes the biggest support cost",
      description:
        "SSO onboarding was the single largest support burden we saw across teams running Keycloak in B2B. This was our answer.",
    },
  ],
};

const useCases = {
  title: "What teams use it for",
  cards: [
    {
      heading: "Customer-led SSO setup",
      description:
        "Embed the wizard into your app and let customer IT admins finish their SSO setup without a Phase Two or Keycloak login.",
    },
    {
      heading: "Provider-specific guidance",
      description:
        "Step-by-step instructions tailored to Okta, Azure AD, Google Workspace, OneLogin, ADFS, and generic SAML/OIDC providers.",
    },
    {
      heading: "Pre-flight validation",
      description:
        "Test the connection before saving. Catch certificate mismatches, callback URL typos, and metadata issues before they break login.",
    },
    {
      heading: "Per-organization attachment",
      description:
        "Combined with the Organizations extension, each org gets its own wizard-configured IdP — fully scoped to that tenant.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "Guided multi-step flows",
      description:
        "A consistent UX for every supported provider. Users follow numbered steps with screenshots, paste in the URLs and certificates the wizard asks for, and finish with a working IdP.",
    },
    {
      title: "Embeddable in your app",
      description:
        "Drop into the Admin Portal or surface as a standalone page. Customers configure SSO from inside your product, not inside Keycloak.",
    },
  ],
};

const getStarted = {
  cards: [
    {
      heading: "Install from GitHub",
      description:
        "Available as a Keycloak theme/extension bundle. Build from source or pull the pre-built release.",
      linkLabel: "p2-inc/idp-wizard",
      linkUrl: "https://github.com/p2-inc/idp-wizard",
    },
    {
      heading: "Read the docs",
      description:
        "Setup, supported providers, and how to embed the wizard inside the Admin Portal.",
      linkLabel: "IdP Wizard docs",
      linkUrl: "/docs/organizations/idp-wizard",
    },
    {
      heading: "Skip the install",
      description:
        "Phase Two managed Keycloak ships with the IdP Wizard wired into the Admin Portal.",
      linkLabel: "Try the hosted version",
      linkUrl: "https://dash.phasetwo.io/",
    },
  ],
};

export default function IdpWizardExtension() {
  return (
    <ExtensionPageLayout
      meta={meta}
      hero={hero}
      problem={problem}
      whyBuilt={whyBuilt}
      useCases={useCases}
      capabilities={capabilities}
      getStarted={getStarted}
    />
  );
}
