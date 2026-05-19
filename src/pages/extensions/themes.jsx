import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Keycloak Themes — Modern, Accessible, Brandable Login UI",
  description:
    "Open source Keycloak themes from Phase Two. Production-ready login, registration, and account themes built for branding, accessibility, and modern web standards.",
};

const hero = {
  title: "Themes for Keycloak",
  description:
    "Modern, accessible, brandable login and account themes for Keycloak — production-ready out of the box, no FreeMarker archaeology required.",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/keycloak-themes",
};

const problem = {
  title: "Keycloak's default theme is showing its age",
  intro:
    "Functional, dated, and quietly inaccessible. The login page is the first surface every user sees — and the upstream default doesn't match the bar modern SaaS sets.",
  points: [
    {
      title: "Branding is an afterthought",
      description:
        "Login is one of the most-seen surfaces of your product and a primary brand touchpoint — yet Keycloak treats it as a server admin concern, not a customer-facing experience.",
    },
    {
      title: "No modern dev tooling",
      description:
        "FreeMarker templates live outside the modern frontend ecosystem. No React, no component libraries, no design tokens, no Storybook — and no hot reload while you iterate.",
    },
    {
      title: "Testing is painful",
      description:
        "There's no straightforward way to visually test theme changes in isolation. You build, deploy, click through every flow by hand, and hope you didn't break a screen you forgot existed.",
    },
    {
      title: "Themes rot on upgrade",
      description:
        "Every Keycloak release can move templates underneath you. Custom themes built in haste become a release blocker.",
    },
    {
      title: "Accessibility is an afterthought",
      description:
        "Semantic markup, focus management, and color contrast in the default theme don't pass current accessibility standards without rework.",
    },
  ],
};

const whyBuilt = {
  title: "The starting line we wanted for our own product",
  intro:
    "We built and open sourced our theme suite as the baseline we wanted in our managed product — and that the wider Keycloak community deserves.",
  points: [
    {
      title: "Modern visual defaults",
      description:
        "Clean, contemporary login and account screens that don't need redesign before they can ship.",
    },
    {
      title: "Accessibility-first",
      description:
        "Semantic markup, proper focus management, and contrast that actually passes — not bolted on after the fact.",
    },
    {
      title: "Configuration over customization",
      description:
        "Logos, colors, and copy through standard Keycloak theme properties. Reach for FreeMarker only when you really need to.",
    },
    {
      title: "Built on Keycloakify",
      description: (
        <>
          We leverage{" "}
          <a
            href="https://www.keycloakify.dev/"
            target="_blank"
            rel="noreferrer"
            className="link-primary"
          >
            Keycloakify
          </a>{" "}
          so themes can be written in React with modern tooling, hot reload, and Storybook — and stay version-compatible across Keycloak releases instead of breaking on every upgrade.
        </>
      ),
    },
    {
      title: "Maintained against Keycloak",
      description:
        "New theme releases tracking upstream Keycloak versions, so login doesn't break on the next upgrade.",
    },
  ],
};

const useCases = {
  title: "What teams use it for",
  cards: [
    {
      heading: "White-label SaaS login",
      description:
        "Match your product's brand without writing FreeMarker. Override colors and logos from configuration; deeper customization through the standard theme inheritance chain.",
    },
    {
      heading: "Accessibility-first surfaces",
      description:
        "Semantic markup, proper focus management, and contrast that actually passes — without bolting it on after the fact.",
    },
    {
      heading: "Consistent across login and account",
      description:
        "Themes cover the login flow, account console, and admin surfaces in one bundle. Users get one branded experience end-to-end.",
    },
    {
      heading: "Up-to-date with Keycloak releases",
      description:
        "Maintained against current Keycloak versions, so upgrades don't break your login page.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "Drop-in installation",
      description:
        "Install as a Keycloak theme bundle and select it per realm. Override branding from the admin console without rebuilding.",
    },
    {
      title: "Configuration over customization",
      description:
        "Logos, colors, and copy via standard Keycloak theme properties. Reach for FreeMarker only when you need to.",
    },
  ],
};

const getStarted = {
  cards: [
    {
      heading: "Install from GitHub",
      description:
        "Theme bundle JAR. Drop into your Keycloak providers directory and select the theme per realm.",
      linkLabel: "p2-inc/keycloak-themes",
      linkUrl: "https://github.com/p2-inc/keycloak-themes",
    },
    {
      heading: "Skip the install",
      description:
        "Phase Two managed Keycloak ships with the themes preinstalled and brandable from the dashboard.",
      linkLabel: "Try the hosted version",
      linkUrl: "https://dash.phasetwo.io/",
    },
  ],
};

export default function ThemesExtension() {
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
