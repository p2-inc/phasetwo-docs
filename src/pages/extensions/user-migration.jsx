import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Keycloak User Migration Extension — Migrate Without Password Resets",
  description:
    "Open source Keycloak extension that migrates users from a legacy identity provider on first login. No bulk password reset, no user friction.",
};

const hero = {
  title: "User Migration for Keycloak",
  description:
    "Move users from a legacy identity provider to Keycloak without forcing a password reset. Users authenticate against the old system on first login, then migrate silently into Keycloak.",
  imageSrc: "/img/user-migration.svg",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/keycloak-user-migration",
  secondaryCtaLabel: "Read the docs",
  secondaryCtaHref: "/docs/user-migration",
};

const problem = {
  title: "\"Export and import\" doesn't actually migrate users",
  intro:
    "Every Keycloak migration project hits the same wall: you can move user records, but you can't move the credentials they log in with.",
  points: [
    {
      title: "Password hashes don't transfer",
      description:
        "Legacy systems use hash algorithms Keycloak can't import — and third-party IdPs like Auth0 don't release the hashes at all.",
    },
    {
      title: "Forced resets cause churn",
      description:
        "Making every user reset their password is a churn event nobody wants to own. Active users complain; inactive users never come back.",
    },
    {
      title: "Migrations stall",
      description:
        "Teams stay on the legacy IdP, the Keycloak rollout slips by quarters, and the dual-system tax compounds.",
    },
  ],
};

const whyBuilt = {
  title: "Migrate users on first login, transparently",
  intro:
    "The only pattern that actually works at scale: keep the old system online, validate against it once on first login, and silently migrate the user into Keycloak.",
  points: [
    {
      title: "Just-in-time migration",
      description:
        "Keycloak calls your legacy endpoint on first login. On success, it creates the user locally and never asks the legacy system about them again.",
    },
    {
      title: "Simple HTTP contract",
      description:
        "Two endpoints on the legacy side: authenticate and lookup. Implementable in any language against any user store.",
    },
    {
      title: "No forced password reset",
      description:
        "Users log in once with their existing credential and they're migrated. The legacy system can stay online until traffic naturally drains.",
    },
    {
      title: "Zero-churn cutover",
      description:
        "Run Keycloak and the legacy IdP side-by-side until every active user has migrated naturally, then retire the old one.",
    },
  ],
};

const useCases = {
  title: "What teams use it for",
  cards: [
    {
      heading: "Migrate from a legacy IdP",
      description:
        "Move off Auth0, Okta, or a homegrown user store without forcing users to reset their password. They log in once with their existing credential and they're migrated.",
    },
    {
      heading: "Phase out a custom auth system",
      description:
        "Replace a years-old custom login system without coordinating a password reset across your entire user base.",
    },
    {
      heading: "Acquired company onboarding",
      description:
        "Bring an acquired company's users onto the parent SSO platform without making them all create new accounts.",
    },
    {
      heading: "Zero-churn cutover",
      description:
        "Run Keycloak and the legacy system side-by-side until every active user has migrated naturally, then retire the old one.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "Just-in-time migration",
      description:
        "Implemented as a Keycloak user federation provider. On first login, Keycloak calls your legacy endpoint; on success, it creates the user locally and never asks the legacy system again.",
    },
    {
      title: "Simple HTTP contract",
      description:
        "The legacy side is just an authenticate endpoint and a lookup endpoint. Implementable in any language against any user store.",
    },
  ],
};

const getStarted = {
  cards: [
    {
      heading: "Install from GitHub",
      description:
        "Federation provider JAR. Drop into your Keycloak providers directory and configure per realm.",
      linkLabel: "p2-inc/keycloak-user-migration",
      linkUrl: "https://github.com/p2-inc/keycloak-user-migration",
    },
    {
      heading: "Read the docs",
      description:
        "Configuration and the HTTP contract your legacy endpoint needs to satisfy.",
      linkLabel: "User migration docs",
      linkUrl: "/docs/user-migration",
    },
    {
      heading: "Need help migrating?",
      description:
        "Phase Two offers migration services for teams moving off Auth0, Okta, or homegrown systems.",
      linkLabel: "Migration support",
      linkUrl: "/support/migrate-to-keycloak",
    },
  ],
};

export default function UserMigrationExtension() {
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
