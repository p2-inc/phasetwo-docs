import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Keycloak Admin Portal — Self-Service UI for End Customers",
  description:
    "Open source Keycloak extension providing a scoped, embeddable admin UI safe to expose to customer organization admins. Manage users, SSO, roles, and invitations without the Keycloak console.",
};

const hero = {
  title: "Admin Portal for Keycloak",
  description:
    "An embeddable, scoped admin UI safe to expose to your customers. Their organization admins manage users, SSO, roles, and invitations — without ever touching the Keycloak console.",
  imageSrc: "/img/hero-service-portal.svg",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/phasetwo-admin-portal",
  secondaryCtaLabel: "Read the docs",
  secondaryCtaHref: "/docs/admin-portal",
};

const problem = {
  title: "The Keycloak admin console is not safe for customers",
  intro:
    "It's powerful and dangerous — fine for the engineer who owns the deployment, catastrophic for a customer org admin who just needs to invite their team.",
  points: [
    {
      title: "Exposes everything",
      description:
        "Every realm, every user, every client, every flow. There's no way to scope a session to a single organization.",
    },
    {
      title: "Wrong audience, wrong UX",
      description:
        "The admin console is built for IT, not for end customers. Even with scoping it would feel like exposing your control plane.",
    },
    {
      title: "Roll your own is a maintenance trap",
      description:
        "Building a custom customer admin on top of the Keycloak REST API works — until Keycloak ships breaking API changes and your UI rots.",
    },
  ],
};

const whyBuilt = {
  title: "A reference customer-admin UI, maintained for you",
  intro:
    "Every B2B Keycloak team eventually builds a customer-facing admin. We built it once, properly, and open sourced it.",
  points: [
    {
      title: "Scoped by construction",
      description:
        "Org admins see only their org's users, roles, and IdPs. Cross-tenant access is structurally impossible — not just hidden in the UI.",
    },
    {
      title: "Brandable from configuration",
      description:
        "Logo, colors, and copy via the standard Keycloak theme properties. Make it feel like part of your product without forking the code.",
    },
    {
      title: "Portal links, like Stripe",
      description:
        "Issue short-lived portal links from your backend so users launch into the portal already authenticated, deep-linked to the right view.",
    },
    {
      title: "Tracks Keycloak releases",
      description:
        "It's the same portal we ship in our managed product. Maintained against the latest Keycloak so self-hosted teams don't have to reinvent it every quarter.",
    },
  ],
};

const useCases = {
  title: "What teams use it for",
  cards: [
    {
      heading: "Customer self-service",
      description:
        "Org admins invite users, manage SSO, and assign roles inside their organization — without filing tickets or waiting on your support team.",
    },
    {
      heading: "Embedded inside your app",
      description:
        "Drop the portal into your product via a generated portal link. Users launch in already authenticated, in your brand.",
    },
    {
      heading: "Profile and credential self-management",
      description:
        "End users update their profile, change their password, set up MFA, and manage their login methods themselves.",
    },
    {
      heading: "Audit-safe admin surface",
      description:
        "Every admin action flows through the Keycloak admin API with proper auditability — not direct database writes or bespoke endpoints.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "Scoped to one organization",
      description:
        "Org admins see only their org's users, roles, and IdPs. Cross-tenant access is structurally impossible — not just hidden in the UI.",
      imageSrc: "/img/standards-based-security.svg",
      imageAlt: "",
    },
    {
      title: "Brandable to match your product",
      description:
        "Configure logo, colors, and content from the Keycloak admin to make the portal feel like part of your application.",
      imageSrc: "/img/customizable-branding.svg",
      imageAlt: "",
    },
    {
      title: "Portal link generation",
      description:
        "Issue short-lived portal links from your backend so users launch into the portal already authenticated — like a Stripe customer portal, for identity.",
      imageSrc: "/img/portal-link-generation.svg",
      imageAlt: "",
    },
  ],
};

const getStarted = {
  cards: [
    {
      heading: "Install from GitHub",
      description:
        "React app + Keycloak theme. Build from source or pull the prebuilt release artifact.",
      linkLabel: "p2-inc/phasetwo-admin-portal",
      linkUrl: "https://github.com/p2-inc/phasetwo-admin-portal",
    },
    {
      heading: "Read the docs",
      description:
        "Install, configure, brand, and generate portal links.",
      linkLabel: "Admin Portal docs",
      linkUrl: "/docs/admin-portal",
    },
    {
      heading: "Skip the install",
      description:
        "Phase Two managed Keycloak ships with the Admin Portal pre-configured and brandable from the dashboard.",
      linkLabel: "Try the hosted version",
      linkUrl: "https://dash.phasetwo.io/",
    },
  ],
};

export default function AdminPortalExtension() {
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
