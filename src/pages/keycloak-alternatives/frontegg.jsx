import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. FrontEgg — Phase Two",
  description:
    "A 2026 comparison of Keycloak vs. FrontEgg — cost, deployment, maintenance, and B2B features — and why managed Keycloak is a strong open-source alternative to FrontEgg.",
  keywords:
    "keycloak vs frontegg, frontegg alternative, open source frontegg alternative, frontegg pricing, managed keycloak, b2b authentication",
};

const hero = {
  variant: "C",
  headline: <>FrontEgg charges per MAU. <span className="grad">Keycloak charges per server.</span></>,
  lede: (
    <>
      FrontEgg is an embedded B2B user-management platform billed on monthly active users with B2B
      features gated by tier. Keycloak gives you the same B2B building blocks — organizations, roles,
      SSO, self-service — priced on <b>infrastructure, not per active user</b>.
    </>
  ),
  secondaryCta: { label: "See the cost breakdown →", href: "#cost" },
  chart: {
    title: "Annual identity spend vs. monthly active users",
    xLabels: ["1k", "25k", "100k MAU"],
    legendVendor: "FrontEgg (per-MAU)",
    ariaLabel: "Cost growth: FrontEgg climbs, Keycloak stays flat",
  },
};

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, subscription", keycloak: "Open-source (Apache 2.0), no license fee", check: true },
  { dim: "Pricing driver", vendor: "Per-MAU tiers + B2B feature gating", keycloak: "Fixed infrastructure / hosting cost, not per-user", check: true },
  { dim: "Cost predictability", vendor: "Scales with MAU & feature tiers", keycloak: "Predictable, decoupled from user growth", check: true },
  { dim: "Deployment", vendor: "Cloud / SaaS only", keycloak: "Self-hosted, your cloud, on-premise, or managed", check: true },
  { dim: "Data residency / sovereignty", vendor: "Limited control", keycloak: "Full control over environment and data location", check: true },
  { dim: "Standards", vendor: "OAuth 2.0, OIDC, SAML, SCIM", keycloak: "SAML, OpenID Connect, OAuth 2.0, SCIM", check: true },
  { dim: "Extensibility", vendor: "Embeddable widgets, bounded", keycloak: "Full source access — SPI extensions, themes, custom code", check: true },
  { dim: "Vendor lock-in", vendor: "High", keycloak: "Low — portable, standards-based", check: true },
];

const sections = [
  {
    id: "cost",
    kicker: "01 — TCO",
    title: "Cost of Ownership",
    body: (
      <>
        <p>FrontEgg sells speed: drop-in login boxes, an admin portal, and B2B primitives like organizations and roles. The pricing follows the same B2B SaaS pattern as the platforms it serves — a free tier to start, then usage-based pricing that climbs on multiple axes at once: monthly active users, SSO/SCIM connections, and machine-to-machine (M2M) tokens.</p>
        <p>As of 2026, FrontEgg's published pricing estimator scales roughly like this:</p>
        <table className="ptable">
          <thead><tr><th>Plan</th><th>Price</th><th>What's included</th></tr></thead>
          <tbody>
            <tr><td className="plan">Free</td><td className="price">$0</td><td>Up to 7,500 MAU to evaluate the platform</td></tr>
            <tr><td className="plan">Pay as you go</td><td className="price">Usage-based (≈$2,490/mo at 18,000 MAU, 15 SSO/SCIM connections, 190 M2M tokens)</td><td>Hosted login, 5 enterprise connections, unlimited orgs, custom domain</td></tr>
            <tr><td className="plan">Enterprise</td><td className="price">Custom</td><td>Add-ons, multiple environments, advanced fraud protection, 99.99% SLA</td></tr>
          </tbody>
        </table>
        <p className="footnote">Figures reflect FrontEgg's published pricing estimator as of 2026 (<a href="https://frontegg.com/pricing" target="_blank" rel="noreferrer" className="ilink">frontegg.com/pricing</a>); the pay-as-you-go figure is an example at one slider configuration, not a flat rate — your cost moves with MAU, connections, and M2M tokens. Enterprise is quote-based.</p>
        <p>The catch is the same one every per-MAU platform shares, multiplied across three axes. The pay-as-you-go bill rises with your monthly active users, with each additional SSO/SCIM connection, and with the volume of M2M tokens you issue — so success makes it more expensive on three fronts at once. And the most advanced capabilities — multiple environments, advanced fraud protection, and a 99.99% SLA — sit behind a custom Enterprise contract rather than a published price.</p>
        <p>Keycloak provides the same B2B building blocks — multi-tenant organizations, fine-grained roles, SSO, and self-service flows (Phase Two maintains the widely used Organizations extension) — with no per-MAU charge, no per-connection metering, and no M2M token billing. Your cost tracks infrastructure, not signups.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>With Phase Two <Link to="/hosting/" className="ilink">managed hosting</Link>, growth in active users doesn't change your bill. See a side-by-side <Link to="/pricing/hosting/" className="ilink">pricing estimate vs. FrontEgg</Link>.</p>
      </>
    ),
  },
  {
    id: "architecture",
    kicker: "02 — Deployment",
    title: "Architecture & Deployment",
    body: (
      <>
        <p>FrontEgg is a cloud-based service, so there is little infrastructure to set up. That enables quick deployment and removes much of the DevOps burden. The trade-off is that enterprises with strict regulatory or data-residency requirements often need on-premise options that a SaaS-only model can't fully provide.</p>
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
        <p>A strong advantage of FrontEgg is that it's a managed service. From a DevOps perspective, it requires minimal maintenance — the FrontEgg team handles updates, security patches, and infrastructure, keeping the system up to date. This comes at a cost, though, since customization is comparatively limited.</p>
        <p>Self-hosted Keycloak requires more attention: organizations must allocate resources for installing, configuring, and updating the software, as well as managing the underlying infrastructure. This can be a drawback for teams without the necessary expertise. Phase Two removes this trade-off entirely: with <Link to="/hosting/" className="ilink">managed hosting</Link> and <Link to="/support/zero-downtime-upgrades/" className="ilink">zero-downtime upgrades</Link>, you get Keycloak's control without the operational load.</p>
        <p className="verdict"><span className="verdict-tag tie">Winner: FrontEgg for self-hosted Keycloak — a tie when Keycloak is managed by Phase Two</span></p>
      </>
    ),
  },
  {
    id: "functionality",
    kicker: "04 — Capability",
    title: "Functionality & Flexibility",
    body: (
      <>
        <p>FrontEgg is strong at embedded B2B UX: prebuilt login and admin components, organizations, role-based access, and self-service that teams can ship quickly. Its model is to own the user-management layer of your app through its widgets and APIs.</p>
        <p>Keycloak covers the same B2B primitives — multi-tenant organizations, RBAC and ABAC, SSO, MFA, and self-service registration and account management — with fully themeable, embeddable login flows. Because it's open source, you can extend any of it, and you own the user data outright.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>FrontEgg gets you live fast; Keycloak gives you the same capabilities without per-user cost and with a far higher customization ceiling.</p>
      </>
    ),
  },
  {
    id: "integrating",
    kicker: "05 — Interop",
    title: "Integrating Keycloak with external systems like FrontEgg",
    body: (
      <>
        <p>For organizations looking to transition from FrontEgg to Keycloak — or to integrate Keycloak with systems already using FrontEgg — Keycloak's flexibility offers a significant advantage. Keycloak can act as a broker that sits between FrontEgg and your applications, letting you leverage the strengths of both platforms during a transition.</p>
        <p>Keycloak's identity-brokering capability lets it delegate authentication to external identity providers (IdPs) such as FrontEgg. Keycloak can manage internal permissions and roles, provide additional security checks, and maintain a consistent, user-friendly login experience across systems. This makes <Link to="/support/migrate-to-keycloak/" className="ilink">migrating off FrontEgg</Link> a low-risk, phased process — you can move one piece at a time without disrupting user access or security.</p>
      </>
    ),
  },
  {
    id: "best",
    kicker: "06 — Verdict",
    title: "Which IAM solution is best for me?",
    body: (
      <>
        <p>FrontEgg is a good fit for early B2B teams that want embedded user management shipped in days and don't yet feel the per-MAU cost. As active users and B2B feature needs grow, Keycloak becomes the more economical and flexible choice — and it removes the ceiling on customization and data ownership.</p>
        <p>Phase Two runs Keycloak for you, pairing the B2B building blocks FrontEgg is known for with open standards, full data ownership, and a fixed, predictable cost.</p>
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
    { feat: "B2B orgs & roles without tier gating", vendor: "$$$", keycloak: "yes" },
    { feat: "Custom SAML / OIDC IdPs & SCIM", vendor: "yes", keycloak: "yes" },
    { feat: "Full source access & SPI extensions", vendor: "lim", keycloak: "yes" },
    { feat: "Federate / broker existing IdP", vendor: "lim", keycloak: "yes" },
    { feat: "24/7 escalation with Keycloak experts", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Keycloak a good alternative to FrontEgg?",
    a: <p>Yes. Keycloak provides the same B2B building blocks — organizations, roles, SSO, MFA, and self-service — on open standards, while being open source and free of per-MAU licensing. Phase Two maintains the popular Organizations extension used for multi-tenant B2B.</p>,
    text: "Yes. Keycloak provides the same B2B building blocks — organizations, roles, SSO, MFA, and self-service — on open standards, while being open source and free of per-MAU licensing. Phase Two maintains the popular Organizations extension used for multi-tenant B2B.",
  },
  {
    q: "Is Keycloak cheaper than FrontEgg?",
    a: <p>For growing B2B products, usually. FrontEgg bills per monthly active user with features gated by tier, so cost rises with success. Keycloak is priced on infrastructure and stays largely fixed as your user base grows.</p>,
    text: "For growing B2B products, usually. FrontEgg bills per monthly active user with features gated by tier, so cost rises with success. Keycloak is priced on infrastructure and stays largely fixed as your user base grows.",
  },
  {
    q: "Can I migrate from FrontEgg to Keycloak?",
    a: <p>Yes. Keycloak can import users and broker authentication during a phased cutover, so you can move tenants across incrementally without disrupting access. See <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>,
    text: "Yes. Keycloak can import users and broker authentication during a phased cutover, so you can move tenants across incrementally without disrupting access.",
  },
  {
    q: "Does Keycloak support multi-tenant organizations?",
    a: <p>Yes. Keycloak supports organizations and multi-tenancy, and Phase Two maintains a widely used Organizations extension plus fine-grained roles and permissions for B2B use cases.</p>,
    text: "Yes. Keycloak supports organizations and multi-tenancy, and Phase Two maintains a widely used Organizations extension plus fine-grained roles and permissions for B2B use cases.",
  },
  {
    q: "Can Keycloak be self-hosted or run on-premise?",
    a: <p>Yes. Keycloak runs on-premise, in your own cloud, or as a managed service — a key advantage over FrontEgg's cloud-only model for data-residency and compliance.</p>,
    text: "Yes. Keycloak runs on-premise, in your own cloud, or as a managed service — a key advantage over FrontEgg's cloud-only model for data-residency and compliance.",
  },
];

const migration = {
  heading: "Already using FrontEgg?",
  body: "Moving to Keycloak is more approachable than most teams expect. We import users, broker authentication during a phased cutover, and move you off FrontEgg without disrupting access.",
};

const bigcta = {
  heading: "See how much you'd save.",
  body: "A 30-minute demo and a custom proposal — keyed to your current FrontEgg contract — usually beats your renewal.",
};

export default function KeycloakVsFrontEgg() {
  return (
    <ComparisonLayout
      vendor="FrontEgg"
      slug="frontegg"
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
