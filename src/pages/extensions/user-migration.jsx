import React from "react";
import ExtensionSubpage from "../../components/extensions/ExtensionSubpage";

const CONTENT = {
  slug: "user-migration",
  name: "User Migration",
  category: "Operations",
  iconKey: "user-migration",
  diagramKey: "user-migration",
  repo: "p2-inc/keycloak-user-migration",
  docsHref: "/docs/user-migration/",
  meta: {
    title: "Keycloak User Migration — Lazy Migration from Legacy IdPs",
    description:
      "Federation provider that validates first-login credentials against your legacy IdP, then transparently migrates users to Keycloak. No mass password reset.",
  },
  hero: {
    h1: "Move to Keycloak without forcing a password reset.",
    lead: "A federation provider that validates first-login credentials against your legacy IdP, then transparently migrates users to Keycloak. No mass email, no support hit.",
    badges: ["Lazy Migration", "Auth0 · Cognito · REST · LDAP · SQL", "No Reset Emails", "Transparent To Users"],
  },
  problem: {
    heading: "Migrating to a new IdP usually means breaking your users.",
    cards: [
      { title: "Password hashes don't move", body: "Most legacy IdPs won't export password hashes. The 'easy' path is to email everyone a reset — and watch your active user count crater." },
      { title: "Big-bang migrations are risky", body: "Cutting all users over in one weekend leaves no rollback, no canary, and a worst-case support load." },
      { title: "Long tail of inactive accounts", body: "You'd rather not migrate the 30% of users who haven't logged in this year. But which 30%?" },
    ],
  },
  approach: {
    heading: "Migrate on first login, transparently",
    cards: [
      { title: "Federation, not export", body: "Keycloak federates to your legacy system. First-login auth happens there." },
      { title: "Validate, then import", body: "If the legacy system says the password is right, we create a local Keycloak account with the profile." },
      { title: "Subsequent logins are local", body: "After the first login, the user authenticates against Keycloak directly. Legacy IdP becomes optional." },
      { title: "Inactive users self-select out", body: "Anyone who never logs in is never migrated. Cleanup happens organically." },
    ],
  },
  useCases: {
    heading: "Whose migrations get easier",
    intro: "Anyone moving off Auth0, Cognito, a custom database, LDAP, or any legacy IdP — without a 6-month coordinated cutover.",
    items: [
      { title: "Auth0 / Okta exit", sub: "Most common path — federate, then migrate." },
      { title: "Cognito → Keycloak", sub: "Federation hits the Cognito user pool." },
      { title: "Legacy SQL user table", sub: "Bring-your-own REST endpoint." },
      { title: "LDAP consolidation", sub: "Standard LDAP federation, lazy-migrated." },
    ],
  },
  capabilities: {
    heading: "Everything you'd want from a migration",
    items: [
      { title: "Bring-your-own REST endpoint", body: "Implement a tiny endpoint that takes username+password, returns a profile." },
      { title: "Auth0 / Cognito connectors", body: "Pre-built integrations for the most common sources." },
      { title: "LDAP / SQL federation", body: "Stock Keycloak federation patterns, batteries included." },
      { title: "Profile mapping", body: "Map legacy attributes to Keycloak attributes — name, email, custom." },
      { title: "Migration progress dashboard", body: "See how many users have migrated, who's left, when the tail flatlines." },
      { title: "Cut-over when you're ready", body: "Once migration % is high enough, disable federation and run pure Keycloak." },
    ],
  },
};

export default function UserMigrationExtension() {
  return <ExtensionSubpage content={CONTENT} />;
}
