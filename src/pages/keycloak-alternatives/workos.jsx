import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. WorkOS — Phase Two",
  description:
    "A 2026 comparison of Keycloak vs. WorkOS — cost, deployment, maintenance, and features — and why managed Keycloak is a strong open-source alternative to WorkOS for enterprise SSO and SCIM.",
  keywords:
    "keycloak vs workos, workos alternative, open source workos alternative, workos pricing, enterprise sso, scim, managed keycloak",
};

const hero = {
  variant: "B",
  headline: <>Enterprise SSO without the <span className="strike">per-connection</span> toll.</>,
  lede: (
    <>
      WorkOS is a developer-focused platform for enterprise SSO, SCIM, and directory sync, billed per
      connection. Keycloak is the open-source alternative that delivers the same enterprise standards —
      priced on <b>infrastructure, not per connection</b> — with the option of managed hosting from
      Phase Two.
    </>
  ),
  secondaryCta: { label: "See the comparison →", href: "#glance" },
  miniRows: [
    { feat: "Per-connection pricing", vendor: "$$$", keycloak: "lim" },
    { feat: "Open-source core", vendor: "no", keycloak: "yes" },
    { feat: "Self-host / on-premise", vendor: "no", keycloak: "yes" },
    { feat: "SAML / OIDC / SCIM", vendor: "yes", keycloak: "yes" },
    { feat: "Vendor lock-in", vendor: { label: "High", red: true }, keycloak: "yes" },
  ],
};

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, usage-based", keycloak: "Open-source (Apache 2.0), no license fee", check: true },
  { dim: "Pricing driver", vendor: "Per-connection / per-organization SSO", keycloak: "Fixed infrastructure / hosting cost, not per-connection", check: true },
  { dim: "Cost predictability", vendor: "Scales with SSO connections & orgs", keycloak: "Predictable, decoupled from connection count", check: true },
  { dim: "Deployment", vendor: "Cloud / SaaS only", keycloak: "Self-hosted, your cloud, on-premise, or managed", check: true },
  { dim: "Data residency / sovereignty", vendor: "Limited control", keycloak: "Full control over environment and data location", check: true },
  { dim: "Standards", vendor: "SAML, OIDC, SCIM", keycloak: "SAML, OpenID Connect, OAuth 2.0, SCIM", check: true },
  { dim: "Extensibility", vendor: "API-first, bounded", keycloak: "Full source access — SPI extensions, themes, custom code", check: true },
  { dim: "Vendor lock-in", vendor: "High", keycloak: "Low — portable, standards-based", check: true },
];

const sections = [
  {
    id: "cost",
    kicker: "01 — TCO",
    title: "Cost of Ownership",
    body: (
      <>
        <p>WorkOS is attractive early: its AuthKit user-management product is free up to a high MAU ceiling, which makes the platform feel inexpensive for B2C-style auth. The cost shows up where WorkOS makes its money — the enterprise features SaaS companies actually sell on, billed per connection.</p>
        <p>As of 2026, the enterprise building blocks are priced roughly like this:</p>
        <table className="ptable">
          <thead><tr><th>Capability</th><th>How it's billed</th><th>Price</th></tr></thead>
          <tbody>
            <tr><td className="plan">AuthKit (user management)</td><td>Per MAU</td><td className="price">Free to 1M MAU, then ~$2,500/mo per additional 1M</td></tr>
            <tr><td className="plan">Single Sign-On (SSO)</td><td>Per connection / month</td><td className="price">$125 each (tiered down to ~$50 at volume)</td></tr>
            <tr><td className="plan">Directory Sync (SCIM)</td><td>Per connection / month</td><td className="price">$125 each (tiered down to ~$50 at volume)</td></tr>
            <tr><td className="plan">Audit Logs</td><td>Per SIEM stream / events</td><td className="price">$125/mo per stream + $99/mo per 1M events</td></tr>
            <tr><td className="plan">Custom Domain</td><td>Flat</td><td className="price">$99/mo</td></tr>
          </tbody>
        </table>
        <p className="footnote">Figures reflect WorkOS's published list pricing as of 2026 (<a href="https://workos.com/pricing" target="_blank" rel="noreferrer" className="ilink">workos.com/pricing</a>); 200+ connections and Enterprise agreements are quote-based.</p>
        <p>The per-connection model is the catch. Every enterprise customer you onboard typically needs both SSO and SCIM — two separately billed connections — so the bill scales directly with your most valuable B2B customers. A few dozen enterprise logos can turn an "inexpensive" platform into a five- or six-figure annual line item.</p>
        <p>Keycloak, by contrast, supports unlimited SAML/OIDC identity providers and SCIM directories with no per-connection fee. Your cost is the infrastructure it runs on — fixed, and decoupled from how many enterprise customers you connect.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>With Phase Two <Link to="/hosting/" className="ilink">managed hosting</Link>, you add enterprise connections without adding line items. See a side-by-side <Link to="/pricing/hosting/" className="ilink">pricing estimate vs. WorkOS</Link>.</p>
      </>
    ),
  },
  {
    id: "architecture",
    kicker: "02 — Deployment",
    title: "Architecture & Deployment",
    body: (
      <>
        <p>WorkOS is a cloud-based service, so there is little infrastructure to set up. That enables quick deployment and removes much of the DevOps burden. The trade-off is that enterprises with strict regulatory or data-residency requirements often need on-premise options that a SaaS-only model can't fully provide.</p>
        <p>Keycloak can be deployed on-premise, in your own cloud, or via a <Link to="/hosting/" className="ilink">managed cloud service</Link>. Because you control the deployment environment, it conforms to compliance and data-sovereignty needs and gives you greater control over your security and compliance standards.</p>
        <p className="verdict"><span className="verdict-tag depends">Winner: Depends</span></p>
        <p>If you need on-premise or strict data control, Keycloak wins clearly — and it still gives you the flexibility to <Link to="/hosting/self-host-vs-managed/" className="ilink">self-host or use managed hosting</Link>.</p>
      </>
    ),
  },
  {
    id: "maintenance",
    kicker: "03 — Operations",
    title: "Maintenance",
    body: (
      <>
        <p>A strong advantage of WorkOS is that it's a managed service. From a DevOps perspective, it requires minimal maintenance — the WorkOS team handles updates, security patches, and infrastructure, keeping the system up to date. This comes at a cost, though, since customization is comparatively limited.</p>
        <p>Self-hosted Keycloak requires more attention: organizations must allocate resources for installing, configuring, and updating the software, as well as managing the underlying infrastructure. This can be a drawback for teams without the necessary expertise. Phase Two removes this trade-off entirely: with <Link to="/hosting/" className="ilink">managed hosting</Link> and <Link to="/support/zero-downtime-upgrades/" className="ilink">zero-downtime upgrades</Link>, you get Keycloak's control without the operational load.</p>
        <p className="verdict"><span className="verdict-tag tie">Winner: WorkOS for self-hosted Keycloak — a tie when Keycloak is managed by Phase Two</span></p>
      </>
    ),
  },
  {
    id: "functionality",
    kicker: "04 — Capability",
    title: "Functionality & Flexibility",
    body: (
      <>
        <p>WorkOS is purpose-built for the enterprise-readiness checklist — SSO, Directory Sync (SCIM), Audit Logs, and admin portals — exposed through clean, developer-friendly APIs. It does that job well, but it is intentionally focused: it is not a full identity platform for your own users, and customization stops at the edges of its API.</p>
        <p>Keycloak covers the same enterprise standards — SAML, OpenID Connect, and SCIM — and adds a complete identity platform on top: your own user store, fine-grained authorization (RBAC and ABAC), social login, MFA, and fully themeable login flows. Being open source, the customization ceiling is the source code itself. A standout capability is Keycloak's <Link to="/product/onprem/" className="ilink">on-premise deployment</Link> options.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>WorkOS is excellent at the slice it covers; Keycloak covers that slice and the rest of your identity needs in one deployment.</p>
      </>
    ),
  },
  {
    id: "integrating",
    kicker: "05 — Interop",
    title: "Integrating Keycloak with external systems like WorkOS",
    body: (
      <>
        <p>For organizations looking to transition from WorkOS to Keycloak — or to integrate Keycloak with systems already using WorkOS — Keycloak's flexibility offers a significant advantage. Keycloak can act as a broker that sits between WorkOS and your applications, letting you leverage the strengths of both platforms during a transition.</p>
        <p>Keycloak's identity-brokering capability lets it delegate authentication to external identity providers (IdPs) such as WorkOS. Keycloak can manage internal permissions and roles, provide additional security checks, and maintain a consistent, user-friendly login experience across systems. This makes <Link to="/support/migrate-to-keycloak/" className="ilink">migrating off WorkOS</Link> a low-risk, phased process — you can move one piece at a time without disrupting user access or security.</p>
      </>
    ),
  },
  {
    id: "best",
    kicker: "06 — Verdict",
    title: "Which IAM solution is best for me?",
    body: (
      <>
        <p>WorkOS is a strong fit for SaaS teams that want to ship enterprise SSO and SCIM fast and are comfortable paying per connection as they add enterprise customers. For teams that want to avoid per-connection costs, own their user data, or need on-premise deployment, Keycloak is the more flexible and cost-stable choice.</p>
        <p>At Phase Two, we run Keycloak so you don't have to — combining the open standards WorkOS is known for with a complete, self-ownable identity platform and a fixed, predictable cost. We offer robust Keycloak <Link to="/hosting/" className="ilink">hosting</Link>, <Link to="/support/migrate-to-keycloak/" className="ilink">migration</Link>, and <Link to="/support/" className="ilink">support</Link>.</p>
      </>
    ),
  },
];

const matrix = {
  savings: "~80%",
  rows: [
    { feat: "Per-connection pricing penalty", vendor: "$$$", keycloak: "lim" },
    { feat: "Open-source core", vendor: "no", keycloak: "yes" },
    { feat: "Self-hostable (no lock-in)", vendor: "no", keycloak: "yes" },
    { feat: "On-premise / data residency", vendor: "no", keycloak: "yes" },
    { feat: "Unlimited IdP connections without per-seat fees", vendor: "$$$", keycloak: "yes" },
    { feat: "Custom SAML / OIDC IdPs & SCIM", vendor: "yes", keycloak: "yes" },
    { feat: "Full source access & SPI extensions", vendor: "lim", keycloak: "yes" },
    { feat: "Federate / broker existing IdP", vendor: "lim", keycloak: "yes" },
    { feat: "24/7 escalation with Keycloak experts", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Keycloak a good alternative to WorkOS?",
    a: <p>Yes. Keycloak supports the same enterprise standards as WorkOS — SAML, OpenID Connect, and SCIM — and adds a full identity platform (your own users, RBAC/ABAC, MFA, themeable login), while being open source and free of per-connection licensing.</p>,
    text: "Yes. Keycloak supports the same enterprise standards as WorkOS — SAML, OpenID Connect, and SCIM — and adds a full identity platform (your own users, RBAC/ABAC, MFA, themeable login), while being open source and free of per-connection licensing.",
  },
  {
    q: "Is Keycloak cheaper than WorkOS?",
    a: <p>For teams with many enterprise customers, usually yes. WorkOS bills per SSO/SCIM connection, so cost scales with your B2B logos. Keycloak supports unlimited connections and is priced on infrastructure, which stays largely fixed as you grow.</p>,
    text: "For teams with many enterprise customers, usually yes. WorkOS bills per SSO/SCIM connection, so cost scales with your B2B logos. Keycloak supports unlimited connections and is priced on infrastructure, which stays largely fixed as you grow.",
  },
  {
    q: "Can I migrate from WorkOS to Keycloak?",
    a: <p>Yes. Keycloak can broker or replace WorkOS connections during a phased cutover, so you can move enterprise customers across incrementally without disrupting their SSO. See <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>,
    text: "Yes. Keycloak can broker or replace WorkOS connections during a phased cutover, so you can move enterprise customers across incrementally without disrupting their SSO.",
  },
  {
    q: "Does Keycloak support SAML, OIDC, and SCIM?",
    a: <p>Yes. Keycloak is built on SAML and OpenID Connect, supports unlimited identity-provider connections, and offers SCIM directory provisioning through extensions.</p>,
    text: "Yes. Keycloak is built on SAML and OpenID Connect, supports unlimited identity-provider connections, and offers SCIM directory provisioning through extensions.",
  },
  {
    q: "Can Keycloak be self-hosted or run on-premise?",
    a: <p>Yes. Keycloak can run on-premise, in your own cloud, or as a managed service — a key advantage over WorkOS's cloud-only model for data-residency and compliance.</p>,
    text: "Yes. Keycloak can run on-premise, in your own cloud, or as a managed service — a key advantage over WorkOS's cloud-only model for data-residency and compliance.",
  },
];

const migration = {
  heading: "Already using WorkOS?",
  body: "Moving to Keycloak is more approachable than most teams expect. We import users, broker authentication during a phased cutover, and move you off WorkOS without disrupting access.",
};

const bigcta = {
  heading: "See how much you'd save.",
  body: "A 30-minute demo and a custom proposal — keyed to your current WorkOS contract — usually beats your renewal.",
};

export default function KeycloakVsWorkOS() {
  return (
    <ComparisonLayout
      vendor="WorkOS"
      slug="workos"
      accent="magenta"
      meta={meta}
      hero={hero}
      atAGlance={atAGlance}
      sections={sections}
      matrix={matrix}
      faqs={faqs}
      migration={migration}
      bigcta={bigcta}
    />
  );
}
