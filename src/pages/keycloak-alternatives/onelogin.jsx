import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. OneLogin — Phase Two",
  description:
    "A 2026 comparison of Keycloak vs. OneLogin — cost, deployment, maintenance, and features — and why managed Keycloak is a strong open-source alternative for workforce SSO and access management.",
  keywords:
    "keycloak vs onelogin, onelogin alternative, open source onelogin alternative, onelogin pricing, workforce sso, managed keycloak",
};

const hero = {
  variant: "B",
  headline: (
    <>Workforce SSO without <span className="strike">per-module</span> pricing.</>
  ),
  lede: (
    <>
      OneLogin is a workforce SSO and access-management platform billed per user, with capabilities
      split across add-on modules. Keycloak delivers the same workforce SSO, MFA, and directory
      integration — without per-user, per-module pricing — backed by Phase Two hosting and support.
    </>
  ),
  secondaryCta: { label: "See the comparison →", href: "#glance" },
  miniRows: [
    { feat: "Per-user, per-module pricing", vendor: "$$$", keycloak: "lim" },
    { feat: "Open-source core", vendor: "no", keycloak: "yes" },
    { feat: "Self-host / on-premise", vendor: "no", keycloak: "yes" },
    { feat: "SAML / OIDC / OAuth 2.0", vendor: "yes", keycloak: "yes" },
    { feat: "Vendor lock-in", vendor: { label: "High", red: true }, keycloak: "yes" },
  ],
};

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, subscription", keycloak: "Open-source (Apache 2.0), no license fee", check: true },
  { dim: "Pricing driver", vendor: "Per-user, per-module", keycloak: "Fixed infrastructure / hosting cost, not per-user", check: true },
  { dim: "Cost predictability", vendor: "Add-on modules stack up", keycloak: "Predictable, decoupled from user growth", check: true },
  { dim: "Deployment", vendor: "Cloud / SaaS only", keycloak: "Self-hosted, your cloud, on-premise, or managed", check: true },
  { dim: "Data residency / sovereignty", vendor: "Limited control", keycloak: "Full control over environment and data location", check: true },
  { dim: "Standards", vendor: "SAML, OIDC, OAuth 2.0", keycloak: "SAML, OpenID Connect, OAuth 2.0" },
  { dim: "Extensibility", vendor: "App catalog + API, bounded", keycloak: "Full source access — SPI extensions, themes, custom code", check: true },
  { dim: "Vendor lock-in", vendor: "High", keycloak: "Low — portable, standards-based", check: true },
];

const sections = [
  {
    id: "cost",
    kicker: "01 — TCO",
    title: "Cost of Ownership",
    body: (
      <>
        <p>OneLogin (now part of One Identity) prices per user, per month, with the workforce-identity capabilities most organizations want spread across plan tiers and add-on modules. The base plan looks affordable; the number that matters is what it costs once you add the modules you actually need.</p>
        <p>As of 2026, OneLogin's published workforce pricing scales roughly like this:</p>
        <table className="ptable">
          <thead><tr><th>Plan</th><th>Price (per user / mo)</th><th>Highlights</th></tr></thead>
          <tbody>
            <tr><td className="plan">Basic</td><td className="price">$3</td><td>SSO, MFA, Desktop Basic, lifecycle mgmt (5 apps)</td></tr>
            <tr><td className="plan">Essentials</td><td className="price">$6</td><td>Unlimited lifecycle management, Advanced Directory</td></tr>
            <tr><td className="plan">Business</td><td className="price">$10</td><td>SmartFactor, Desktop MFA, HR directories, RADIUS, Smart Hooks</td></tr>
            <tr><td className="plan">Enterprise</td><td className="price">Quote only</td><td>LDAP sync, delegated admin, multiple brands, API Access Management</td></tr>
          </tbody>
        </table>
        <p className="footnote">Figures reflect OneLogin's published list pricing as of 2026 (<a href="https://www.onelogin.com/product/pricing" target="_blank" rel="noreferrer" className="ilink">onelogin.com/product/pricing</a>); typically billed annually. Customer Identity (CIAM) plans and the Enterprise tier are quote-only, and OneLogin Workflows is a separate $2/user/month add-on.</p>
        <p>The per-user, per-module structure is what drives the real cost. Each employee is a recurring charge, and the advanced capabilities — adaptive MFA, lifecycle automation, HR-driven provisioning — push you into higher plans or paid add-ons. As headcount and requirements grow, so does the bill, on two axes at once.</p>
        <p>Worse, several of the capabilities larger organizations depend on — API Access Management, LDAP sync, delegated administration, and Customer Identity (CIAM) — sit in the quote-only Enterprise tier, so the headline per-user numbers rarely reflect what an enterprise rollout actually costs.</p>
        <p>Keycloak provides workforce SSO, MFA, LDAP/Active Directory integration, and brokering with no per-user fee and no module gating — every capability is part of the same open-source platform. Cost is driven by the infrastructure it runs on, not your employee count.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>Phase Two <Link to="/hosting/" className="ilink">managed hosting</Link> keeps that spend fixed as your workforce grows. See a side-by-side <Link to="/pricing/hosting/" className="ilink">pricing estimate vs. OneLogin</Link>.</p>
      </>
    ),
  },
  {
    id: "architecture",
    kicker: "02 — Deployment",
    title: "Architecture & Deployment",
    body: (
      <>
        <p>OneLogin is a cloud-based service, so there is little infrastructure to set up. That enables quick deployment and removes much of the DevOps burden. The trade-off is that enterprises with strict regulatory or data-residency requirements often need on-premise options that a SaaS-only model can't fully provide.</p>
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
        <p>A strong advantage of OneLogin is that it's a managed service. From a DevOps perspective, it requires minimal maintenance — the OneLogin team handles updates, security patches, and infrastructure, keeping the system up to date. This comes at a cost, though, since customization is comparatively limited.</p>
        <p>Self-hosted Keycloak requires more attention: organizations must allocate resources for installing, configuring, and updating the software, as well as managing the underlying infrastructure. This can be a drawback for teams without the necessary expertise. Phase Two removes this trade-off entirely: with <Link to="/hosting/" className="ilink">managed hosting</Link> and <Link to="/support/zero-downtime-upgrades/" className="ilink">zero-downtime upgrades</Link>, you get Keycloak's control without the operational load.</p>
        <p className="verdict"><span className="verdict-tag tie">Winner: OneLogin for self-hosted Keycloak — a tie when Keycloak is managed by Phase Two</span></p>
      </>
    ),
  },
  {
    id: "functionality",
    kicker: "04 — Capability",
    title: "Functionality & Flexibility",
    body: (
      <>
        <p>OneLogin covers the workforce-identity essentials: SSO with a large app catalog, MFA (including its SmartFactor adaptive auth), a cloud directory, and lifecycle/provisioning — with deeper capabilities available as add-on modules. It's a capable, established access-management product.</p>
        <p>Keycloak matches the core — SSO, MFA, directory federation via LDAP and Active Directory, and brokering — and adds fine-grained authorization (RBAC/ABAC) and fully themeable login. Being open source, every capability is included and extensible rather than gated behind modules.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>The two are comparable on workforce SSO; Keycloak delivers it without per-module pricing and with a far higher customization ceiling.</p>
      </>
    ),
  },
  {
    id: "integrating",
    kicker: "05 — Interop",
    title: "Integrating Keycloak with external systems like OneLogin",
    body: (
      <>
        <p>For organizations looking to transition from OneLogin to Keycloak — or to integrate Keycloak with systems already using OneLogin — Keycloak's flexibility offers a significant advantage. Keycloak can act as a broker that sits between OneLogin and your applications, letting you leverage the strengths of both platforms during a transition.</p>
        <p>Keycloak's identity-brokering capability lets it delegate authentication to external identity providers (IdPs) such as OneLogin. Keycloak can manage internal permissions and roles, provide additional security checks, and maintain a consistent, user-friendly login experience across systems. This makes <Link to="/support/migrate-to-keycloak/" className="ilink">migrating off OneLogin</Link> a low-risk, phased process — you can move one piece at a time without disrupting user access or security.</p>
      </>
    ),
  },
  {
    id: "best",
    kicker: "06 — Verdict",
    title: "Which IAM solution is best for me?",
    body: (
      <>
        <p>OneLogin is a reasonable fit for organizations that want a turnkey workforce SSO product and accept per-user, per-module pricing. For teams that want to avoid module gating, need on-premise or data-residency control, or want predictable cost as headcount grows, Keycloak is the more flexible and economical choice.</p>
        <p>Phase Two runs Keycloak with enterprise <Link to="/hosting/" className="ilink">hosting</Link> and 24/7 <Link to="/support/" className="ilink">support</Link>, giving you workforce identity on open standards — without per-user licensing or vendor lock-in.</p>
      </>
    ),
  },
];

const matrix = {
  savings: "~80%",
  rows: [
    { feat: "Per-user / per-module pricing penalty", vendor: "$$$", keycloak: "lim" },
    { feat: "Open-source core", vendor: "no", keycloak: "yes" },
    { feat: "Self-hostable (no lock-in)", vendor: "no", keycloak: "yes" },
    { feat: "On-premise / data residency", vendor: "no", keycloak: "yes" },
    { feat: "All capabilities without add-on modules", vendor: "$$$", keycloak: "yes" },
    { feat: "Custom SAML / OIDC IdPs", vendor: "yes", keycloak: "yes" },
    { feat: "Full source access & SPI extensions", vendor: "lim", keycloak: "yes" },
    { feat: "Federate / broker existing IdP (LDAP/AD)", vendor: "lim", keycloak: "yes" },
    { feat: "24/7 escalation with Keycloak experts", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Keycloak a good alternative to OneLogin?",
    a: <p>Yes. Keycloak supports the same standards as OneLogin (SAML, OIDC, OAuth 2.0) and covers workforce SSO, MFA, and LDAP/Active Directory integration, while being open source and free of per-user, per-module licensing.</p>,
    text: "Yes. Keycloak supports the same standards as OneLogin (SAML, OIDC, OAuth 2.0) and covers workforce SSO, MFA, and LDAP/Active Directory integration, while being open source and free of per-user, per-module licensing.",
  },
  {
    q: "Is Keycloak cheaper than OneLogin?",
    a: <p>For most organizations, yes. OneLogin bills per user with advanced capabilities in higher plans or paid modules. Keycloak is priced on infrastructure and stays largely fixed as headcount grows, so teams frequently see substantial savings.</p>,
    text: "For most organizations, yes. OneLogin bills per user with advanced capabilities in higher plans or paid modules. Keycloak is priced on infrastructure and stays largely fixed as headcount grows, so teams frequently see substantial savings.",
  },
  {
    q: "Can I migrate from OneLogin to Keycloak?",
    a: <p>Yes. Keycloak can broker authentication to OneLogin and import users during a phased cutover, so you can migrate incrementally without disrupting employee access. See <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>,
    text: "Yes. Keycloak can broker authentication to OneLogin and import users during a phased cutover, so you can migrate incrementally without disrupting employee access.",
  },
  {
    q: "Does Keycloak integrate with LDAP and Active Directory?",
    a: <p>Yes. Keycloak federates LDAP and Active Directory natively and can broker other identity providers, making it well suited to workforce identity scenarios.</p>,
    text: "Yes. Keycloak federates LDAP and Active Directory natively and can broker other identity providers, making it well suited to workforce identity scenarios.",
  },
  {
    q: "Can Keycloak be self-hosted or run on-premise?",
    a: <p>Yes. Keycloak runs on-premise, in your own cloud, or as a managed service — a key advantage over OneLogin's cloud-only model for data-residency and compliance.</p>,
    text: "Yes. Keycloak runs on-premise, in your own cloud, or as a managed service — a key advantage over OneLogin's cloud-only model for data-residency and compliance.",
  },
];

const migration = {
  heading: "Already using OneLogin?",
  body: "Moving to Keycloak is more approachable than most teams expect. We import users, broker authentication during a phased cutover, and move you off OneLogin without disrupting access.",
};

const bigcta = {
  heading: "See how much you'd save.",
  body: "A 30-minute demo and a custom proposal — keyed to your current OneLogin contract — usually beats your renewal.",
};

export default function KeycloakVsOneLogin() {
  return (
    <ComparisonLayout
      vendor="OneLogin"
      slug="onelogin"
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
