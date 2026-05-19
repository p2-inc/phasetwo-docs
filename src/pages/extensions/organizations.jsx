import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Keycloak Organizations Extension — Multi-tenant B2B Identity",
  description:
    "Open source Keycloak extension that adds first-class organizations: per-tenant SSO, invitations, roles, and APIs. Built for B2B SaaS on Keycloak.",
};

const hero = {
  title: "Organizations for Keycloak",
  description:
    "First-class multi-tenancy for Keycloak. Per-organization SSO, invitations, roles, and APIs — the foundation for shipping B2B identity without bending Keycloak realms.",
  imageSrc: "/img/hero-organizations.svg",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/keycloak-orgs",
  secondaryCtaLabel: "Read the docs",
  secondaryCtaHref: "/docs/organizations",
};

const problem = {
  title: "Keycloak realms weren't designed for B2B tenancy",
  intro:
    "Teams shipping SaaS on Keycloak hit the same wall: every customer needs their own SSO, roles, and admin — but the realm model wasn't built for that.",
  points: [
    {
      title: "No first-class tenant",
      description:
        "Keycloak has realms, groups, and attributes — none of which represent \"this user belongs to this customer\" in a way the rest of the system understands.",
    },
    {
      title: "A realm per customer doesn't scale",
      description:
        "Spinning up a realm per customer multiplies operational cost and breaks shared concerns like product roles, branding, and admin tooling.",
    },
    {
      title: "Shared realms have no tenancy",
      description:
        "A single shared realm has no concept of \"this customer signs in through this SAML provider\" — so per-customer SSO becomes a custom mapper hack.",
    },
  ],
};

const whyBuilt = {
  title: "We wanted multi-tenancy to be a first-class primitive",
  intro:
    "Every B2B team running Keycloak was solving the same problem in slightly different — and usually broken — ways. We took the opposite approach.",
  points: [
    {
      title: "Organizations are a real object",
      description:
        "Their own table, their own APIs, their own admin endpoints — not a convention on top of groups or attributes.",
    },
    {
      title: "Identity providers attach to orgs",
      description:
        "Each organization can own one or more SAML/OIDC providers. Home IdP discovery routes users to the right login based on email domain.",
    },
    {
      title: "Roles and tokens are org-aware",
      description:
        "Token mappers surface org membership and role claims so your application authorizes on (user, org, role) without extra lookups.",
    },
    {
      title: "Battle-tested in production",
      description:
        "It's the multi-tenancy layer under every Phase Two managed deployment and used by the open source SaaS-on-Keycloak community.",
    },
  ],
};

const useCases = {
  title: "What teams use it for",
  cards: [
    {
      heading: "B2B SaaS customer SSO",
      description:
        "Each customer gets their own organization with their own SAML or OIDC identity provider. Users authenticate through their employer's IdP and land in the right tenant automatically.",
    },
    {
      heading: "Customer-managed teams",
      description:
        "Org admins invite their own users, assign their own roles, and manage their own membership through the Admin Portal — without ever touching the Keycloak console.",
    },
    {
      heading: "Per-tenant authorization",
      description:
        "Roles and permissions defined per-organization, with the org as a first-class entity in every token claim. Your app authorizes on (user, org, role) instead of guessing from groups.",
    },
    {
      heading: "Programmatic provisioning",
      description:
        "Full REST API to create orgs, attach IdPs, send invitations, and manage members — drop it behind your signup flow or sync from your CRM.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "Per-organization identity providers",
      description:
        "Attach one or more SAML/OIDC providers to each organization. Home IdP discovery routes users to the right login flow based on email domain.",
      imageSrc: "/img/org-specific-configuration.svg",
      imageAlt: "",
    },
    {
      title: "Invitations and membership",
      description:
        "Email-based invitations, accept/decline flows, and member management built in. Customers onboard their own teams.",
      imageSrc: "/img/streamlined-invitations.svg",
      imageAlt: "",
    },
    {
      title: "Roles, permissions, and token mappers",
      description:
        "Organization-scoped roles with token mappers that surface org membership and role claims in every access token — so your app can authorize without extra lookups.",
      imageSrc: "/img/org-roles-permissions.svg",
      imageAlt: "",
    },
  ],
};

const getStarted = {
  cards: [
    {
      heading: "Install from GitHub",
      description:
        "Drop the JAR into your Keycloak providers directory, or build from source.",
      linkLabel: "p2-inc/keycloak-orgs",
      linkUrl: "https://github.com/p2-inc/keycloak-orgs",
    },
    {
      heading: "Read the docs",
      description:
        "Configuration, identity providers, roles, token mappers, and the full REST API reference.",
      linkLabel: "Organizations docs",
      linkUrl: "/docs/organizations",
    },
    {
      heading: "Skip the install",
      description:
        "Phase Two managed Keycloak ships with Organizations and the Admin Portal pre-configured.",
      linkLabel: "Try the hosted version",
      linkUrl: "https://dash.phasetwo.io/",
    },
  ],
};

export default function OrganizationsExtension() {
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
