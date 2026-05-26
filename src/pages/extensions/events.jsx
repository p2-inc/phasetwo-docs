import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "events",
  name: "Events & Webhooks",
  category: "Operations",
  iconKey: "events",
  diagramKey: "events",
  repo: "p2-inc/keycloak-events",
  meta: {
    title: "Keycloak Events & Webhooks — Export Identity Events",
    description:
      "Webhooks and scriptable event handlers for Keycloak. Subscribe to logins, registrations, role changes — anything Keycloak emits — and route them to your stack.",
  },
  hero: {
    h1: "Webhooks and scriptable handlers for every identity event.",
    lead: "Export audit events, post to webhooks, trigger workflows. Subscribe to logins, registrations, role changes — anything Keycloak emits — and route them to your stack.",
    badges: ["Webhooks", "Script Handlers", "Filtering", "Retry + DLQ", "Signed Payloads"],
  },
  problem: {
    heading: "Identity events shouldn't be trapped inside Keycloak.",
    cards: [
      { title: "Audit logs need to leave", body: "Compliance, observability, fraud detection — all want events out of Keycloak and into your platform." },
      { title: "Workflows want a trigger", body: "When a user joins an org, you want to create rows in your DB, post to Slack, kick off provisioning. Polling isn't the answer." },
      { title: "Keycloak's built-in SPI is too low-level", body: "Implementing event listeners as Java SPI works, but it's painful to iterate on and not portable across clusters." },
    ],
  },
  approach: {
    heading: "Identity events as a normal eventing system",
    cards: [
      { title: "Webhooks first", body: "POST signed JSON to any URL. Standard HTTP. No glue code." },
      { title: "Scriptable handlers", body: "Or write a script (JS) that runs on each event — filter, map, transform." },
      { title: "Retry, DLQ, idempotency", body: "Treat it like any other webhook system. Failures don't lose events." },
      { title: "Realm-scoped or global", body: "Subscribe to a tenant's events or all of them." },
    ],
  },
  useCases: {
    heading: "Where event routing pays off",
    intro: "Anywhere identity changes need to be visible somewhere else.",
    items: [
      { title: "Audit log export", sub: "All identity events into S3, Datadog, or SIEM." },
      { title: "CRM sync", sub: "New signups → Salesforce / HubSpot contact." },
      { title: "Slack notifications", sub: "Alert on suspicious logins or role changes." },
      { title: "Workflow triggers", sub: "Provisioning, billing, onboarding kicks." },
    ],
  },
  capabilities: {
    heading: "Everything you'd want from a webhook system",
    items: [
      { title: "Subscribe per event type", body: "USER_LOGIN, ROLE_CHANGE, PASSWORD_RESET — opt in to what you need." },
      { title: "Webhook destinations", body: "Any HTTPS URL. Standard JSON payload." },
      { title: "JS script handlers", body: "Run small scripts inside Keycloak for filter / map / fanout." },
      { title: "Retry with backoff", body: "Failed deliveries retry with exponential backoff." },
      { title: "DLQ", body: "Events that fail repeatedly land in a dead-letter queue you can replay." },
      { title: "Signed payloads", body: "HMAC-signed so the receiver can verify origin." },
    ],
  },
};

export default function EventsExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
