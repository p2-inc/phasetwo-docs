import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Auth0 — Phase Two",
  description:
    "A 2026 comparison of Keycloak vs. Auth0 — cost, deployment, maintenance, and features — and why managed Keycloak is a strong open-source alternative to Auth0.",
  keywords:
    "keycloak vs auth0, auth0 alternative, open source auth0 alternative, auth0 pricing, managed keycloak",
};

const hero = {
  variant: "C",
  headline: <>Auth0's bill grows with you. <span className="grad">Keycloak's doesn't.</span></>,
  lede: (
    <>
      Auth0 is a popular, fully managed cloud platform. Keycloak is the open-source alternative that
      competes strongly on <b>cost, control, and flexibility</b> — and pairing it with a managed host
      like Phase Two often gives you the best of both.
    </>
  ),
  secondaryCta: { label: "See the cost breakdown →", href: "#cost" },
  chart: {
    title: "Annual identity spend vs. monthly active users",
    xLabels: ["1k", "25k", "100k MAU"],
    legendVendor: "Auth0 (per-MAU)",
    ariaLabel: "Cost growth: Auth0 climbs, Keycloak stays flat",
  },
};

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, subscription", keycloak: "Open-source (Apache 2.0), no license fee", check: true },
  { dim: "Pricing driver", vendor: "Per monthly active user (MAU) + features", keycloak: "Fixed infrastructure / hosting cost, not per-user", check: true },
  { dim: "Cost predictability", vendor: "Scales with users and features", keycloak: "Predictable, decoupled from user growth", check: true },
  { dim: "Deployment", vendor: "Cloud / SaaS only", keycloak: "Self-hosted, your cloud, on-premise, or managed", check: true },
  { dim: "Data residency / sovereignty", vendor: "Limited control", keycloak: "Full control over environment and data location", check: true },
  { dim: "Standards", vendor: "OAuth 2.0, OIDC, SAML", keycloak: "SAML, OpenID Connect, OAuth 2.0" },
  { dim: "Extensibility", vendor: "Actions framework (bounded)", keycloak: "Full source access — SPI extensions, themes, custom code", check: true },
  { dim: "Vendor lock-in", vendor: "High", keycloak: "Low — portable, standards-based", check: true },
];

const sections = [
  {
    id: "cost",
    kicker: "01 — TCO",
    title: "Cost of Ownership",
    body: (
      <>
        <p>Auth0 operates on a subscription model that can be appealing for startups or small projects. Its free tier is generous on paper — up to 25,000 monthly active users (MAU) — but it's bounded on connections, organizations, and features, and most production workloads quickly outgrow it.</p>
        <p>Here's the catch: Auth0's list prices look modest until you map them to how a real application actually uses the platform. As of 2026, Auth0's published pricing (per month, billed monthly) scales roughly like this:</p>
        <table className="ptable">
          <thead><tr><th>Monthly active users</th><th>B2C Essentials</th><th>B2B Essentials</th></tr></thead>
          <tbody>
            <tr><td className="plan">1,000</td><td className="price">$70</td><td>$300</td></tr>
            <tr><td className="plan">5,000</td><td className="price">$350</td><td>$1,300</td></tr>
            <tr><td className="plan">10,000</td><td className="price">$700</td><td>$2,100</td></tr>
            <tr><td className="plan">20,000</td><td className="price">$1,400</td><td>$3,800</td></tr>
          </tbody>
        </table>
        <p className="footnote">Figures reflect Auth0's published list pricing as of 2026 (<a href="https://auth0.com/pricing" target="_blank" rel="noreferrer" className="ilink">auth0.com/pricing</a>); Auth0 changes pricing periodically — confirm current rates for your tier and region.</p>
        <p>Two things push the real bill well beyond the headline numbers. First, the features you actually need live in higher tiers and add-ons — SAML and LDAP/Active Directory federation, log streaming, additional enterprise SSO connections (around $100/month each on B2B plans), metered M2M tokens, and the newer AI Agents add-on. Second, "users" and "organizations" aren't cheap: if you sell to businesses, Auth0's B2B model costs materially more than B2C at the same scale.</p>
        <p>For anything beyond mid-size, Auth0 routes you into a custom Enterprise contract. In practice these negotiations tend to land in the six figures annually once SSO, MFA, organizations, and log streaming are bundled in. The problem isn't any single number — it's that the total is hard to predict and climbs with every feature and every user you add.</p>
        <p>Keycloak, by contrast, is free to use regardless of users or scale. The primary cost is hosting and operating the software, which means your spend tends to be fixed — driven by infrastructure rather than user counts or feature gates.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>Leveraging Phase Two's <Link to="/hosting/" className="ilink">managed hosting</Link> keeps that spend predictable as you grow. See a side-by-side <Link to="/pricing/hosting/" className="ilink">pricing estimate vs. Auth0</Link>.</p>
      </>
    ),
  },
  {
    id: "architecture",
    kicker: "02 — Deployment",
    title: "Architecture & Deployment",
    body: (
      <>
        <p>Auth0 is a cloud-based service, so there is little infrastructure to set up. That enables quick deployment and removes much of the DevOps burden. The trade-off is that enterprises with strict regulatory or data-residency requirements often need on-premise options that a SaaS-only model can't fully provide.</p>
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
        <p>As a managed service, Auth0 requires minimal maintenance from your side — it handles updates, security patches, and infrastructure.</p>
        <p>Self-hosted Keycloak requires more attention: installation, configuration, upgrades, and the underlying infrastructure. Phase Two removes this trade-off entirely: with <Link to="/hosting/" className="ilink">managed hosting</Link> and <Link to="/support/zero-downtime-upgrades/" className="ilink">zero-downtime upgrades</Link>, you get Keycloak's control without the operational load.</p>
        <p className="verdict"><span className="verdict-tag tie">Winner: Auth0 for self-hosted Keycloak — a tie when Keycloak is managed by Phase Two</span></p>
      </>
    ),
  },
  {
    id: "functionality",
    kicker: "04 — Capability",
    title: "Functionality & Flexibility",
    body: (
      <>
        <p>Auth0 offers a broad set of authentication features out of the box — social logins, enterprise federation, database connections — and supports OAuth 2.0, OpenID Connect, and SAML. Customization happens through its Actions framework, which can become difficult to manage as logic grows outside the main application.</p>
        <p>Keycloak matches Auth0 on core functionality and the same protocols, with customizable login, registration, and account-management UIs. Being open source, it lets developers extend the codebase far more freely — a higher ceiling for customization. A standout capability is Keycloak's <Link to="/product/onprem/" className="ilink">on-premise deployment</Link> options.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>The two are comparable on features, but Keycloak is far more extensible and configurable.</p>
      </>
    ),
  },
  {
    id: "integrating",
    kicker: "05 — Interop",
    title: "Migrating from Auth0 to Keycloak",
    body: (
      <>
        <p>Moving off Auth0 is more approachable than many teams expect. Keycloak imports users, supports gradual cutover, and brokers identities so you can transition without disrupting access — see <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>
        <p>You can also run Keycloak alongside Auth0 during a transition: Keycloak can act as a broker that delegates authentication to an external IdP such as Auth0. That lets you keep existing Auth0 connections while Keycloak handles internal permissions, roles, and a consistent login experience — a low-risk path to migrating one piece at a time.</p>
      </>
    ),
  },
  {
    id: "best",
    kicker: "06 — Verdict",
    title: "Which IAM solution is best for me?",
    body: (
      <>
        <p>Choosing between Auth0 and Keycloak largely depends on your organization's needs. Auth0 is an excellent choice for teams that want a fully managed developer experience and are comfortable with per-MAU, per-feature costs. For organizations that prioritize cost savings and predictability, can manage their infrastructure, or require extensive customization, Keycloak emerges as a powerful, budget-friendly alternative.</p>
        <p>Ultimately, we at Phase Two believe marrying the two together is the strongest match. We offer robust Keycloak <Link to="/hosting/" className="ilink">hosting</Link>, <Link to="/support/migrate-to-keycloak/" className="ilink">migration</Link>, and <Link to="/support/" className="ilink">support</Link>. Leveraging Keycloak means ongoing costs are relatively fixed, so concerns about user growth or feature needs don't have to factor into every decision.</p>
      </>
    ),
  },
];

const matrix = {
  savings: "~80%",
  rows: [
    { feat: "Per-MAU pricing penalty", vendor: "$$$", keycloak: "lim" },
    { feat: "Open-source core", vendor: "no", keycloak: "yes" },
    { feat: "Self-hostable (no lock-in)", vendor: "no", keycloak: "yes" },
    { feat: "On-premise / data residency", vendor: "no", keycloak: "yes" },
    { feat: "Advanced features without add-on tiers", vendor: "$$$", keycloak: "yes" },
    { feat: "Custom SAML / OIDC IdPs", vendor: "yes", keycloak: "yes" },
    { feat: "Full source access & SPI extensions", vendor: "lim", keycloak: "yes" },
    { feat: "Federate / broker existing IdP", vendor: "lim", keycloak: "yes" },
    { feat: "24/7 escalation with Keycloak experts", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Keycloak a good alternative to Auth0?",
    a: <p>Yes. Keycloak supports the same core standards as Auth0 (OAuth 2.0, OpenID Connect, SAML) and matches it on most authentication and authorization features, while being open source and free of per-user licensing. The main trade-off is operational overhead, which a managed host like Phase Two removes.</p>,
    text: "Yes. Keycloak supports the same core standards as Auth0 (OAuth 2.0, OpenID Connect, SAML) and matches it on most features, while being open source and free of per-user licensing. The main trade-off is operational overhead, which a managed host like Phase Two removes.",
  },
  {
    q: "Is Keycloak cheaper than Auth0?",
    a: <p>For most growing applications, yes. Auth0 pricing scales with monthly active users and feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows. Teams moving from Auth0 to managed Keycloak frequently see substantial savings.</p>,
    text: "For most growing applications, yes. Auth0 pricing scales with monthly active users and feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows.",
  },
  {
    q: "Can I migrate from Auth0 to Keycloak?",
    a: <p>Yes. Keycloak can import your users and broker authentication to Auth0 during a phased cutover, so you can migrate incrementally without disrupting users. See <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>,
    text: "Yes. Keycloak can import your users and broker authentication to Auth0 during a phased cutover, so you can migrate incrementally without disrupting users.",
  },
  {
    q: "Does Keycloak support SAML, OIDC, and OAuth 2.0?",
    a: <p>Yes. Keycloak is built on these standards and interoperates with both modern applications and legacy systems, including LDAP and Active Directory.</p>,
    text: "Yes. Keycloak is built on these standards and interoperates with both modern applications and legacy systems, including LDAP and Active Directory.",
  },
  {
    q: "Can Keycloak be self-hosted or run on-premise?",
    a: <p>Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This flexibility is a key advantage over Auth0's cloud-only model, especially for data-residency and compliance requirements.</p>,
    text: "Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This flexibility is a key advantage over Auth0's cloud-only model, especially for data-residency and compliance requirements.",
  },
];

const migration = {
  heading: "Already using Auth0?",
  body: "Moving to Keycloak is more approachable than most teams expect. We import users, broker authentication during a phased cutover, and move you off Auth0 without disrupting access.",
};

const bigcta = {
  heading: "See how much you'd save.",
  body: "A 30-minute demo and a custom proposal — keyed to your current Auth0 contract — usually beats your renewal.",
};

export default function KeycloakVsAuth0() {
  return (
    <ComparisonLayout
      vendor="Auth0"
      slug="auth0"
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
