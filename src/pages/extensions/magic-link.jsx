import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "magic-link",
  name: "Magic Link",
  category: "Authentication",
  iconKey: "magic-link",
  diagramKey: "magic-link",
  repo: "p2-inc/keycloak-magic-link",
  meta: {
    title: "Keycloak Magic Link — Passwordless Email Sign-in",
    description:
      "Email-link passwordless login plus API-triggered magic links for invitations, verification, and onboarding flows on Keycloak. Signed, single-use, server-validated.",
  },
  hero: {
    h1: "Passwordless email login for Keycloak.",
    lead: "Email-link sign-in plus API-triggered magic links for invitations, email verification, and onboarding flows. Signed, single-use, server-validated.",
    badges: ["Passwordless", "Signed URLs", "API-Triggered", "Configurable TTL", "Single-Use"],
  },
  problem: {
    heading: "Passwords are the worst part of onboarding.",
    cards: [
      { title: "Passwords kill conversion", body: "Every password requirement at signup costs you new users — especially on B2B trials." },
      { title: "Onboarding is multi-step", body: "Invitation, email verification, password setup — by the time the user finishes, they've forgotten why they signed up." },
      { title: "Reset flows are fragile", body: "Forgot-password flows are an attack surface, a support cost, and a deliverability headache all at once." },
    ],
  },
  approach: {
    heading: "Make email the credential",
    cards: [
      { title: "One signed link, one session", body: "The link is the credential. HMAC-signed, single-use, expires fast." },
      { title: "API-triggered for invites", body: "Generate a magic link from your backend whenever you need one — onboarding, verification, recovery." },
      { title: "Drop-in login flow", body: "Adds a 'Sign in with magic link' option to the standard Keycloak login screen." },
      { title: "Configurable everywhere", body: "TTL, redirect URI, template, per-realm — tune it for the use case." },
    ],
  },
  useCases: {
    heading: "Where magic links shine",
    intro: "Anywhere the user has an email and you'd rather not deal with a password.",
    items: [
      { title: "Passwordless sign-in", sub: "First-class option on the login screen." },
      { title: "Invitations", sub: "Click → join organization. No setup." },
      { title: "Email change confirmation", sub: "Verify the new address before flipping the switch." },
      { title: "Account recovery", sub: "Without the password-reset blast radius." },
    ],
  },
  capabilities: {
    heading: "Everything a production magic link needs",
    items: [
      { title: "HMAC-signed URLs", body: "Tamper-evident. Server validates every link." },
      { title: "Single-use tokens", body: "Token is consumed on first valid click." },
      { title: "Configurable TTL", body: "Short for sign-in, longer for invitations." },
      { title: "API endpoint", body: "POST /magic-link to generate a link from your backend." },
      { title: "Template integration", body: "Plays nicely with the Themes extension for branded emails." },
      { title: "Per-realm config", body: "Different rules per tenant when needed." },
    ],
  },
};

export default function MagicLinkExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
