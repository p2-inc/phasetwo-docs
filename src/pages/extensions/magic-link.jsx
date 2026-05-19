import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Keycloak Magic Link Extension — Passwordless Email Login",
  description:
    "Open source Keycloak extension that adds email magic link login plus API-triggered magic links for invitations and onboarding flows.",
};

const hero = {
  title: "Magic Link for Keycloak",
  description:
    "Email-link passwordless authentication for Keycloak, plus an API for issuing magic links from your application — for invitations, onboarding, and account recovery flows.",
  imageSrc: "/img/img-magic-links.svg",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/keycloak-magic-link",
  secondaryCtaLabel: "Read the guide",
  secondaryCtaHref: "/blog/set-up-magic-links",
};

const problem = {
  title: "Keycloak has no built-in email magic link flow",
  intro:
    "\"Passwordless\" in upstream Keycloak means WebAuthn or OTP — neither of which is what users mean when they ask for \"send me a login link.\"",
  points: [
    {
      title: "The Slack/Notion UX is missing",
      description:
        "The dominant SaaS login pattern of 2026 — type your email, click a link, you're in — has no first-party support in Keycloak.",
    },
    {
      title: "Teams rebuild it badly",
      description:
        "Everyone ends up writing their own version, with custom auth flows, ad-hoc email integration, and inconsistent expiry and single-use semantics.",
    },
    {
      title: "Invitation flows go nowhere",
      description:
        "Without a programmatic way to issue links, invitation, onboarding, and recovery flows fall back to passwords or password resets.",
    },
  ],
};

const whyBuilt = {
  title: "An authenticator and an API, in one extension",
  intro:
    "We built Magic Link to fill two gaps at once: the user-driven \"email me a link\" flow and the server-driven \"issue a link to this user\" API.",
  points: [
    {
      title: "Drop-in authenticator",
      description:
        "Use as a standard step in any Keycloak authentication flow. Replaces — or complements — the password authenticator.",
    },
    {
      title: "Server-side issue API",
      description:
        "Request a link from your backend and email it through your existing transactional mail pipeline. The piece that actually unlocks invitations and onboarding.",
    },
    {
      title: "Auto-create on first click",
      description:
        "Optionally create the user account on first redemption. Combined with the issue API, that's a full invitation flow in one round trip.",
    },
    {
      title: "Recovery and step-up",
      description:
        "Time-bound, single-use, audit-logged. Use as account recovery or as step-up re-authentication before sensitive actions.",
    },
  ],
};

const useCases = {
  title: "What teams use it for",
  cards: [
    {
      heading: "Passwordless login",
      description:
        "Users type their email, get a one-time link, click it, and they're in. The Slack/Notion/Linear pattern, on Keycloak.",
    },
    {
      heading: "Invitation flows",
      description:
        "Issue a magic link from your backend when someone is invited to an organization. They click and land already authenticated and onboarded.",
    },
    {
      heading: "Step-up re-authentication",
      description:
        "Trigger an email-link re-auth before sensitive actions — payment changes, role assignment, account deletion — without forcing a password.",
    },
    {
      heading: "Account recovery",
      description:
        "Use as a recovery path when users lose access to their primary credential. Time-bound, single-use, audit-logged.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "Authenticator + API",
      description:
        "Use as a standard authenticator in any Keycloak flow, and as a REST API to issue links server-side. One extension, both modes.",
      imageSrc: "/img/magic-links.svg",
      imageAlt: "",
    },
    {
      title: "Auto-create users on first link",
      description:
        "Optionally create the user account on first click. Combined with the invitation use case, this is the entire onboarding flow in one round-trip.",
      imageSrc: "/img/user-account-management.svg",
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
      linkLabel: "p2-inc/keycloak-magic-link",
      linkUrl: "https://github.com/p2-inc/keycloak-magic-link",
    },
    {
      heading: "Read the guide",
      description:
        "Walkthrough of the authenticator setup and API usage.",
      linkLabel: "Magic Link blog post",
      linkUrl: "/blog/set-up-magic-links",
    },
    {
      heading: "Skip the install",
      description:
        "Phase Two managed Keycloak ships with Magic Link enabled and the issue-link API ready to use.",
      linkLabel: "Try the hosted version",
      linkUrl: "https://dash.phasetwo.io/",
    },
  ],
};

export default function MagicLinkExtension() {
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
