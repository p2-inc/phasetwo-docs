import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "themes",
  name: "Themes",
  category: "Authentication",
  iconKey: "themes",
  diagramKey: "themes",
  repo: "p2-inc/keycloak-themes",
  meta: {
    title: "Keycloak Themes — Modern, Accessible, Brandable UI",
    description:
      "Modern login, account, and admin themes for Keycloak. Easy per-tenant branding, accessible by default, production-ready out of the box.",
  },
  hero: {
    h1: "Modern, accessible, brandable Keycloak themes.",
    lead: "Login, account, and admin themes that look like 2026 instead of 2010 — and that are easy to customize per-tenant.",
    badges: ["Login UI", "Account UI", "Admin UI", "Per-Tenant Branding", "Accessible"],
  },
  problem: {
    heading: "The default Keycloak UI ages your product.",
    cards: [
      { title: "It looks like a 2010 enterprise tool", body: "Customers see your login first. Stock Keycloak doesn't match the polish of the rest of your app." },
      { title: "Customization means forking FreeMarker", body: "Real branding work in stock Keycloak means writing FreeMarker templates — not a UI designer's day job." },
      { title: "Per-tenant branding is bespoke", body: "Different logos and palettes per customer means juggling theme overlays manually." },
    ],
  },
  approach: {
    heading: "Themes built like a product UI",
    cards: [
      { title: "Modern visual baseline", body: "Type, spacing, color, density — calibrated to feel like a modern app." },
      { title: "Brandable in minutes", body: "Logo, palette, copy — change them per realm, per organization." },
      { title: "Accessible by default", body: "WCAG AA contrast, keyboard nav, screen-reader friendly." },
      { title: "Covers login, account, admin", body: "All three surfaces themed consistently. No mixed visual language." },
    ],
  },
  useCases: {
    heading: "Where the themes go",
    intro: "Anywhere your customer sees a Keycloak surface — and anywhere your team didn't want to spend a sprint fighting FreeMarker.",
    items: [
      { title: "Branded login screens", sub: "Logo + palette per realm or org." },
      { title: "White-label SaaS", sub: "Customer's brand on their own login." },
      { title: "Self-service account pages", sub: "Modern UX for password, MFA, sessions." },
      { title: "Internal admin", sub: "A console your ops team likes to use." },
    ],
  },
  capabilities: {
    heading: "Polish, out of the box",
    items: [
      { title: "Modern login theme", body: "Drop-in replacement for the default login UI." },
      { title: "Modern account theme", body: "Cleaner self-service account page." },
      { title: "Modern admin theme", body: "A console your operators won't dread." },
      { title: "Per-realm branding", body: "Logos, colors, copy — different per realm." },
      { title: "Per-Organization branding", body: "When paired with Organizations, brand per tenant." },
      { title: "Accessible defaults", body: "Contrast ratios, keyboard nav, ARIA labels in place." },
    ],
  },
};

export default function ThemesExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
