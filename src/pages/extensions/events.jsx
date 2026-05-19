import React from "react";
import ExtensionPageLayout from "../../components/ExtensionPageLayout";

const meta = {
  title: "Keycloak Webhooks & Events Extension — Audit Export and Event-Driven Workflows",
  description:
    "Open source Keycloak extension that adds webhooks, event scripts, and an audit log REST API on top of the Keycloak event SPI. Export events to your stack and trigger workflows on identity changes.",
};

const hero = {
  title: "Events for Keycloak",
  description:
    "Webhooks, scriptable event handlers, and an audit-log REST API for Keycloak. Export identity events to your observability stack, trigger workflows, and stop being blind to what's happening in your realm.",
  primaryCtaLabel: "View on GitHub",
  primaryCtaHref: "https://github.com/p2-inc/keycloak-events",
  secondaryCtaLabel: "Audit log docs",
  secondaryCtaHref: "/docs/audit-logs",
};

const problem = {
  title: "Keycloak events live in a black box",
  intro:
    "The upstream event SPI runs entirely in-process. It writes to the database and to stdout — and that's the whole story.",
  points: [
    {
      title: "No webhooks",
      description:
        "There's no built-in way to deliver events to an HTTP endpoint, fan them out to a queue, or stream them to your data pipeline.",
    },
    {
      title: "No usable audit API",
      description:
        "Applications that want to show identity history end up reading the Keycloak database directly — fragile, unscoped, and a security smell.",
    },
    {
      title: "Glue code, rebuilt every upgrade",
      description:
        "Every team running Keycloak in production writes a custom event listener provider, and rewrites it every time the SPI changes.",
    },
  ],
};

const whyBuilt = {
  title: "Make Keycloak observable and event-driven",
  intro:
    "We built Events to turn Keycloak from a black box into a normal participant in your platform — observable, scriptable, and integrated.",
  points: [
    {
      title: "Reliable webhooks",
      description:
        "Configurable destinations with HMAC signing, event-type filtering, and built-in retry/backoff. Delivery you can trust as audit evidence.",
    },
    {
      title: "Audit log REST API",
      description:
        "Query identity history through a proper authenticated API, not by going around Keycloak to its database.",
    },
    {
      title: "Scriptable handlers",
      description:
        "JavaScript event handlers run in-process when you need transformation or filtering before events leave the system — no separate service required.",
    },
    {
      title: "Built once, maintained against Keycloak",
      description:
        "Skip rebuilding the same listener provider every upgrade. The extension tracks Keycloak releases.",
    },
  ],
};

const useCases = {
  title: "What teams use it for",
  cards: [
    {
      heading: "Audit log export",
      description:
        "Stream every login, registration, and admin action to your SIEM or data warehouse via webhook. SOC 2 audit evidence without scraping the Keycloak database.",
    },
    {
      heading: "Sync to your product",
      description:
        "When a user is created, deleted, or updated in Keycloak, fire a webhook to your application so your product database stays in sync.",
    },
    {
      heading: "Slack/PagerDuty alerts",
      description:
        "Alert on suspicious patterns — failed admin logins, brute force, mass user deletion — by piping events to a workflow tool.",
    },
    {
      heading: "Event-driven authorization changes",
      description:
        "When a user joins an organization or gets a role, trigger downstream provisioning workflows automatically.",
    },
  ],
};

const capabilities = {
  cards: [
    {
      title: "Webhooks with retry and signing",
      description:
        "Configure webhook destinations with HMAC signing, filter by event type, and rely on built-in retry/backoff for reliable delivery.",
    },
    {
      title: "Scriptable event handlers",
      description:
        "Write JavaScript event handlers that run in-process when you need transformation or filtering before sending events out — without a separate service.",
    },
    {
      title: "Audit log REST API",
      description:
        "Query the audit log from your application via a REST API instead of going around Keycloak to the database. Properly scoped, properly authenticated.",
    },
  ],
};

const getStarted = {
  cards: [
    {
      heading: "Install from GitHub",
      description:
        "Drop the JAR into your Keycloak providers directory, or build from source.",
      linkLabel: "p2-inc/keycloak-events",
      linkUrl: "https://github.com/p2-inc/keycloak-events",
    },
    {
      heading: "Audit log docs",
      description:
        "Audit log section covers the event types and webhook payload shape.",
      linkLabel: "Audit log docs",
      linkUrl: "/docs/audit-logs",
    },
    {
      heading: "Skip the install",
      description:
        "Phase Two managed Keycloak ships with the Events extension and a dashboard for configuring webhooks.",
      linkLabel: "Try the hosted version",
      linkUrl: "https://dash.phasetwo.io/",
    },
  ],
};

export default function EventsExtension() {
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
