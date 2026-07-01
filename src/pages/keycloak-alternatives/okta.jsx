import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Okta — Phase Two",
  description:
    "A 2026 comparison of Keycloak vs. Okta — cost, deployment, maintenance, and features — and why managed Keycloak is a strong open-source alternative to Okta.",
  keywords:
    "keycloak vs okta, okta alternative, open source okta alternative, okta pricing, managed keycloak",
};

const hero = {
  variant: "A",
  headline: (
    <>
      You don't need <span className="strike">Okta</span>.<br />You need <span className="grad">managed Keycloak</span>.
    </>
  ),
  lede: (
    <>
      Okta is a leading cloud IAM provider that promises quick deployment and comprehensive SSO through a
      subscription. Keycloak is the open-source alternative that competes hard on <b>cost, control, and flexibility</b>{" "}
      — and pairing it with a managed host like Phase Two often gives you the best of both.
    </>
  ),
  secondaryCta: { label: "See the comparison →", href: "#glance" },
  savingsPill: (
    <>
      Teams switching off per-user pricing recover up to <span className="num">~80%</span> of identity spend
    </>
  ),
};

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, subscription", keycloak: "Open-source (Apache 2.0), no license fee", check: true },
  { dim: "Pricing driver", vendor: "Per-user, per-feature — advanced tiers quote-only", keycloak: "Fixed infrastructure / hosting cost, not per-user", check: true },
  { dim: "Cost predictability", vendor: "Bundles & feature tiers can balloon at scale", keycloak: "Predictable, decoupled from user growth", check: true },
  { dim: "Deployment", vendor: "Cloud / SaaS only", keycloak: "Self-hosted, your cloud, on-premise, or managed", check: true },
  { dim: "Data residency / sovereignty", vendor: "Limited control", keycloak: "Full control over environment and data location", check: true },
  { dim: "Standards", vendor: "SAML, OpenID Connect, OAuth 2.0", keycloak: "SAML, OpenID Connect, OAuth 2.0" },
  { dim: "Extensibility", vendor: "Limited customization", keycloak: "Full source access — SPI extensions, themes, custom code", check: true },
  { dim: "Vendor lock-in", vendor: "High", keycloak: "Low — portable, standards-based", check: true },
];

const sections = [
  {
    id: "cost",
    kicker: "01 — TCO",
    title: "Cost of Ownership",
    body: (
      <>
        <p>When evaluating IAM solutions, both upfront cost and total cost of ownership (TCO) matter. Okta operates on a subscription-based pricing model, with costs varying based on the number of users and the features you select. As a SaaS solution, it bundles infrastructure, maintenance, and support into its subscription fees — which reduces internal IT burden, since Okta handles upgrades, patches, and system maintenance.</p>
        <p>As of 2026, Okta's published Workforce Identity (Okta Platform) plans are billed per user, per month:</p>
        <table className="ptable">
          <thead><tr><th>Plan</th><th>Price (per user / mo)</th><th>Highlights</th></tr></thead>
          <tbody>
            <tr><td className="plan">Starter</td><td className="price">$6</td><td>SSO, MFA, Universal Directory, 5 Workflows</td></tr>
            <tr><td className="plan">Core Essentials</td><td className="price">$14</td><td>Adds automation &amp; security</td></tr>
            <tr><td className="plan">Essentials</td><td className="price">$17</td><td>Adaptive MFA, Lifecycle Mgmt, Access Governance, 50 Workflows</td></tr>
            <tr><td className="plan">Professional</td><td className="price">Quote only</td><td>Device Access, ITP, Sandbox</td></tr>
            <tr><td className="plan">Enterprise</td><td className="price">Quote only</td><td>API Access Management, Access Gateway, M2M tokens</td></tr>
          </tbody>
        </table>
        <p className="footnote">Figures reflect Okta's published Workforce Identity list pricing as of 2026 (link to <a href="https://www.okta.com/pricing/" target="_blank" rel="noreferrer" className="ilink">okta.com/pricing</a>); typically billed annually with minimums. Many enterprise features (Device Access, API Access Management, Access Gateway, ITP) are add-ons even on Essentials, and customer-identity (CIAM) is priced separately on the Auth0 platform.</p>
        <p>The catch is what those headline per-user numbers leave out. Many of the capabilities teams actually need — Device Access, API Access Management, Secure Partner Access, Access Gateway, Identity Threat Protection, and Identity Security Posture Management — are add-ons even on the Essentials plan, and the most advanced tiers are quote-only. Workflows are capped, and privileged access is limited by plan. With every feature and every user added, the per-user cost grows significantly, and a bill can balloon far beyond the original projections to become a large slice of overall IT spend.</p>
        <p>Keycloak, by contrast, is an open-source solution developed by Red Hat and is free to use regardless of the number of users or the scale of the project. There are no licensing fees. It does, however, require infrastructure to <Link to="/hosting/" className="ilink">host</Link> and run the application — cloud services or on-premise hardware — plus resources to maintain, update, and customize it. The primary cost comes from self-hosting and managing the software, which means your spend tends to be fixed: it's driven by infrastructure rather than by features or user counts.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>Leveraging Phase Two's <Link to="/hosting/" className="ilink">managed hosting</Link> provides a more capable, cost-conscious way to run, test, and integrate authentication and authorization into your applications. As an application's needs grow for users and integrations, Keycloak quickly becomes a far more cost-effective choice. See a side-by-side <Link to="/pricing/hosting/" className="ilink">pricing estimate</Link>.</p>
      </>
    ),
  },
  {
    id: "architecture",
    kicker: "02 — Deployment",
    title: "Architecture & Deployment",
    body: (
      <>
        <p>Okta is a cloud-based service, so there is little infrastructure to set up. That enables quick deployment and removes much of the DevOps burden. The trade-off is that enterprises with strict regulatory or data-residency requirements often need on-premise options that a SaaS-only model can't provide.</p>
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
        <p>A strong advantage of Okta is that it's a managed service. From a DevOps perspective, it requires minimal maintenance — the Okta team handles updates, security patches, and infrastructure, keeping the system up to date. This comes at a cost, though, since customization of Okta is limited.</p>
        <p>Self-hosted Keycloak requires more attention: organizations must allocate resources for installing, configuring, and updating the software, as well as managing the underlying infrastructure. This can be a drawback for teams without the necessary technical expertise. Phase Two removes this trade-off entirely: with <Link to="/hosting/" className="ilink">managed hosting</Link> and <Link to="/support/zero-downtime-upgrades/" className="ilink">zero-downtime upgrades</Link>, you get Keycloak's control without the operational load.</p>
        <p className="verdict"><span className="verdict-tag tie">Winner: Okta for self-hosted Keycloak — a tie when Keycloak is managed by Phase Two</span></p>
      </>
    ),
  },
  {
    id: "functionality",
    kicker: "04 — Capability",
    title: "Functionality & Flexibility",
    body: (
      <>
        <p>Okta's authentication mechanisms support multiple methods for enhanced security and user convenience. Its authorization capabilities include role-based access control (RBAC) and policy management, and it supports identity federation through SAML, OpenID Connect, and other standards. Single sign-on (SSO) ensures a seamless experience across sign-on options, and Okta's user-management features include self-service registration, account recovery, and a comprehensive directory. Okta also offers extensive APIs, pre-built integrations, detailed analytics and logging, and automated lifecycle management for provisioning and deprovisioning.</p>
        <p>Keycloak offers a comprehensive suite of features that is at parity with — or better than — Okta in many ways. It provides multiple authentication methods, including username/password, social logins, and multi-factor authentication (MFA). It supports fine-grained authorization through RBAC and attribute-based access control (ABAC), excels at identity federation via <Link to="/support/migrate-to-keycloak/" className="ilink">SAML and OpenID Connect</Link>, and delivers SSO across multiple applications. Its user management covers registration, password policies, and account linking, and the platform is highly customizable through themes, custom code, and extensive configuration options — backed by strong community support and a wide range of extensions.</p>
        <p>A key point: the features that Okta and Auth0 cover somewhat separately are all covered by a single Keycloak deployment.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>The two offer much of the same authentication and authorization functionality, but Keycloak is extremely flexible to extend and configure — a system that can adjust and grow with an application — and it centralizes more use cases without distinctions between separate products.</p>
      </>
    ),
  },
  {
    id: "integrating",
    kicker: "05 — Interop",
    title: "Integrating Keycloak with external systems like Okta",
    body: (
      <>
        <p>For organizations looking to transition from Okta to Keycloak — or to integrate Keycloak with systems already using Okta — Keycloak's flexibility offers a significant advantage. Keycloak can be configured to act as a broker that sits between Okta and your applications, letting you leverage the strengths of both platforms. For example, an organization can use Okta for external user management due to its robust third-party integrations, while using Keycloak to handle more sensitive internal authentication needs.</p>
        <p>Keycloak's identity-brokering capability lets it delegate authentication to external identity providers (IdPs) such as Okta. Keycloak can manage internal permissions and roles, provide additional security checks, and maintain a consistent, user-friendly login experience across systems. This makes <Link to="/support/migrate-to-keycloak/" className="ilink">migrating off Okta</Link> a low-risk, phased process — you can move one piece at a time without disrupting user access or security.</p>
      </>
    ),
  },
  {
    id: "best",
    kicker: "06 — Verdict",
    title: "Which IAM solution is best for me?",
    body: (
      <>
        <p>Choosing between Okta and Keycloak largely depends on your organization's specific needs and capabilities. Okta is an excellent choice for those who need a fully managed solution and are comfortable with per-user, per-feature costs. For organizations that prioritize cost savings and predictability, have the capability to manage their infrastructure, or require extensive customization, Keycloak emerges as a powerful, budget-friendly alternative — backed by extensive documentation and community support.</p>
        <p>Ultimately, we at Phase Two believe marrying the two together is the strongest match. We offer robust Keycloak <Link to="/hosting/" className="ilink">hosting</Link>, <Link to="/support/migrate-to-keycloak/" className="ilink">migration</Link>, and <Link to="/support/" className="ilink">support</Link> options that fit businesses of multiple sizes. Coupling the capabilities of Keycloak with the advantages of a managed service translates directly to implementation and cost control across SSO, authentication, authorization, user management, and more. Leveraging Keycloak means that ongoing costs are relatively fixed, so concerns about user growth or feature needs don't have to factor into every decision.</p>
      </>
    ),
  },
];

const matrix = {
  savings: "~80%",
  rows: [
    { feat: "Per-user pricing penalty", vendor: "$$$", keycloak: "lim" },
    { feat: "Open-source core", vendor: "no", keycloak: "yes" },
    { feat: "Self-hostable (no lock-in)", vendor: "no", keycloak: "yes" },
    { feat: "On-premise / data residency", vendor: "no", keycloak: "yes" },
    { feat: "Advanced features without add-on tiers", vendor: "$$$", keycloak: "yes" },
    { feat: "Custom SAML / OIDC IdPs", vendor: "yes", keycloak: "yes" },
    { feat: "Full source access & SPI extensions", vendor: "lim", keycloak: "yes" },
    { feat: "Federate / broker existing IdP (de-risk migration)", vendor: "lim", keycloak: "yes" },
    { feat: "24/7 escalation with Keycloak experts", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Keycloak a good alternative to Okta?",
    a: <p>Yes. Keycloak supports the same core standards as Okta (SAML, OpenID Connect, OAuth 2.0) and matches it on most authentication and authorization features — SSO, MFA, federation, RBAC, and user management — while being open source and free of per-user licensing. The main trade-off is operational overhead, which a managed host like Phase Two removes.</p>,
    text: "Yes. Keycloak supports the same core standards as Okta (SAML, OpenID Connect, OAuth 2.0) and matches it on most authentication and authorization features — SSO, MFA, federation, RBAC, and user management — while being open source and free of per-user licensing. The main trade-off is operational overhead, which a managed host like Phase Two removes.",
  },
  {
    q: "Is Keycloak cheaper than Okta?",
    a: <p>For most growing organizations, yes. Okta pricing scales with the number of users and the features you enable, and costs can balloon at enterprise scale. Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows, so teams moving from Okta to managed Keycloak frequently see substantial savings.</p>,
    text: "For most growing organizations, yes. Okta pricing scales with the number of users and the features you enable, and costs can balloon at enterprise scale. Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows, so teams moving from Okta to managed Keycloak frequently see substantial savings.",
  },
  {
    q: "Can I migrate from Okta to Keycloak?",
    a: <p>Yes. Keycloak can act as a broker that delegates authentication to Okta during a phased cutover, so you can migrate incrementally — using Okta for some flows while Keycloak handles internal permissions and roles — without disrupting users. See <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>,
    text: "Yes. Keycloak can act as a broker that delegates authentication to Okta during a phased cutover, so you can migrate incrementally — using Okta for some flows while Keycloak handles internal permissions and roles — without disrupting users.",
  },
  {
    q: "Does Keycloak support SAML, OIDC, and OAuth 2.0?",
    a: <p>Yes. Keycloak is built on these standards and excels at identity federation, interoperating with both modern applications and external identity providers — including Okta itself through identity brokering.</p>,
    text: "Yes. Keycloak is built on these standards and excels at identity federation, interoperating with both modern applications and external identity providers — including Okta itself through identity brokering.",
  },
  {
    q: "Can Keycloak be self-hosted or run on-premise?",
    a: <p>Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This flexibility is a key advantage over Okta's cloud-only model, especially for data-residency, sovereignty, and compliance requirements.</p>,
    text: "Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This flexibility is a key advantage over Okta's cloud-only model, especially for data-residency, sovereignty, and compliance requirements.",
  },
];

const migration = {
  heading: "Already using Okta?",
  body: "Moving to Keycloak is more approachable than most teams expect. We import users, broker authentication during a phased cutover, and move you off Okta without disrupting access.",
};

const bigcta = {
  heading: "See how much you'd save.",
  body: "A 30-minute demo and a custom proposal — keyed to your current Okta contract — usually beats your renewal.",
};

export default function KeycloakVsOkta() {
  return (
    <ComparisonLayout
      vendor="Okta"
      slug="okta"
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
