import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Ping Identity — Phase Two",
  description:
    "A 2026 comparison of Keycloak vs. Ping Identity — cost, deployment, maintenance, and features — and why managed Keycloak is a strong open-source alternative to Ping's quote-based enterprise suite.",
  keywords:
    "keycloak vs ping identity, ping identity alternative, open source ping alternative, pingone pricing, managed keycloak",
};

const hero = {
  variant: "A",
  headline: (
    <>
      You don't need a <span className="strike">Ping contract</span>.<br />You need <span className="grad">managed Keycloak</span>.
    </>
  ),
  lede: (
    <>
      Ping Identity is a large-enterprise IAM suite sold through quote-based annual contracts. Keycloak delivers the same enterprise standards and federation depth — without the suite lock-in or the opaque pricing — and Phase Two backs it with <b>enterprise-grade hosting and support</b>.
    </>
  ),
  secondaryCta: { label: "See the comparison →", href: "#glance" },
  savingsPill: (
    <>Teams leaving quote-based enterprise contracts recover up to <span className="num">~80%</span> of identity spend</>
  ),
};

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, enterprise contract", keycloak: "Open-source (Apache 2.0), no license fee", check: true },
  { dim: "Pricing driver", vendor: "Quote-based; negotiated annually", keycloak: "Fixed infrastructure / hosting cost", check: true },
  { dim: "Cost predictability", vendor: "Opaque; renegotiated each renewal", keycloak: "Predictable, decoupled from user growth", check: true },
  { dim: "Deployment", vendor: "Cloud + self-managed options", keycloak: "Self-hosted, your cloud, on-premise, or managed", check: true },
  { dim: "Data residency / sovereignty", vendor: "Good (self-managed available)", keycloak: "Full control over environment and data location", check: true },
  { dim: "Standards", vendor: "SAML, OIDC, OAuth 2.0, FIDO2", keycloak: "SAML, OpenID Connect, OAuth 2.0, FIDO2", check: true },
  { dim: "Extensibility", vendor: "Configurable, suite-bound", keycloak: "Full source access — SPI extensions, themes, custom code", check: true },
  { dim: "Vendor lock-in", vendor: "High (suite lock-in)", keycloak: "Low — portable, standards-based", check: true },
];

const sections = [
  {
    id: "cost",
    kicker: "01 — TCO",
    title: "Cost of Ownership",
    body: (
      <>
        <p>Ping Identity sells to large enterprises, and its pricing reflects that. Deals are assembled from a suite of products — PingOne for SSO and MFA, PingFederate, PingAccess, PingDirectory, PingOne for identity verification and risk — and negotiated as an annual contract.</p>
        <p>Ping publishes some entry pricing for its PingOne cloud products, but most engagements are quote-based. As of 2026, published figures look like this:</p>
        <table className="ptable">
          <thead><tr><th>Product</th><th>Plan</th><th>Price</th></tr></thead>
          <tbody>
            <tr><td className="plan">PingOne for Workforce</td><td>Essential</td><td className="price">$3 per user/mo*</td></tr>
            <tr><td className="plan">PingOne for Workforce</td><td>Plus</td><td className="price">$6 per user/mo*</td></tr>
            <tr><td className="plan">PingOne for Customers</td><td>Essential</td><td className="price">Starting at $35k/year</td></tr>
            <tr><td className="plan">PingOne for Customers</td><td>Plus</td><td className="price">Starting at $50k/year</td></tr>
            <tr><td className="plan">PingOne for Customers</td><td>Passwordless</td><td className="price">Quote only</td></tr>
          </tbody>
        </table>
        <p className="footnote">Figures reflect Ping Identity's published pricing as of 2026 (<a href="https://www.pingidentity.com/en/platform/pricing.html" target="_blank" rel="noreferrer" className="ilink">pingidentity.com/platform/pricing</a>). *Workforce pricing is based on an annual contract with a 5,000-user minimum — so the practical floor is roughly $180k/year (Essential) to $360k/year (Plus) before add-ons.</p>
        <p>The practical issue with Ping isn't a single high number — it's the floor and the predictability. Even the entry Workforce tier assumes a 5,000-seat annual commitment, and CIAM (PingOne for Customers) starts in the tens of thousands of dollars per year — large-enterprise budget territory before you add a single module. Because everything is quote-based and bundled, costs are hard to forecast, hard to compare, and tend to climb at each renewal as modules and user counts grow.</p>
        <p>Keycloak covers the standards and federation depth Ping is known for — SAML, OIDC, OAuth 2.0, FIDO2/WebAuthn, brokering, and fine-grained authorization — with no license fee. Your cost is the infrastructure it runs on, which makes spend transparent and stable.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak</span></p>
        <p>Phase Two delivers Keycloak with the enterprise hosting and support large organizations expect — without the contract lock-in. See a side-by-side <Link to="/pricing/hosting/" className="ilink">pricing estimate vs. Ping</Link>.</p>
      </>
    ),
  },
  {
    id: "architecture",
    kicker: "02 — Deployment",
    title: "Architecture & Deployment",
    body: (
      <>
        <p>Ping is unusual among commercial vendors in offering both cloud (PingOne) and self-managed/on-premise deployment of its server products. That flexibility is genuine — and a reason large, regulated enterprises choose it — but it comes bundled with suite licensing and the operational weight of running Ping's stack.</p>
        <p>Keycloak offers the same deployment freedom — on-premise, your own cloud, or a <Link to="/hosting/" className="ilink">managed cloud service</Link> — on an open-source base, so you control the environment without per-product licensing.</p>
        <p className="verdict"><span className="verdict-tag tie">Winner: Tie</span></p>
        <p>Both can run self-managed; Keycloak does it without contract lock-in, and Phase Two can <Link to="/product/onprem/" className="ilink">manage it for you</Link>.</p>
      </>
    ),
  },
  {
    id: "maintenance",
    kicker: "03 — Operations",
    title: "Maintenance",
    body: (
      <>
        <p>Ping's managed PingOne services reduce operational burden, while its self-managed products (PingFederate, PingDirectory, PingAccess) require dedicated expertise to run and upgrade — often a specialized team.</p>
        <p>Self-hosted Keycloak likewise needs attention for installation, configuration, and upgrades. Phase Two removes that trade-off: with <Link to="/hosting/" className="ilink">managed hosting</Link> and <Link to="/support/zero-downtime-upgrades/" className="ilink">zero-downtime upgrades</Link>, you get the control of self-managed identity without the operational load — and at a fraction of an enterprise suite's run cost.</p>
        <p className="verdict"><span className="verdict-tag tie">Winner: a tie when Keycloak is managed by Phase Two</span></p>
      </>
    ),
  },
  {
    id: "functionality",
    kicker: "04 — Capability",
    title: "Functionality & Flexibility",
    body: (
      <>
        <p>Ping is a deep, mature identity suite: strong federation (PingFederate), directory (PingDirectory), access management (PingAccess), adaptive MFA, risk, and identity verification. For the largest, most complex enterprises, that breadth is real — and Ping has decades of hardening behind it.</p>
        <p>Keycloak matches Ping on the core standards and federation patterns most organizations need, with brokering, fine-grained authorization, MFA, and WebAuthn/FIDO2. Where Ping extends through a licensed suite, Keycloak extends through open source — themes, SPIs, and the full codebase — backed by a large community and Phase Two's contributed extensions.</p>
        <p className="verdict"><span className="verdict-tag">Winner: Keycloak (for most)</span></p>
        <p>The very largest identity programs may still value Ping's specialized modules; most teams get what they need from Keycloak with far more flexibility and lower cost.</p>
      </>
    ),
  },
  {
    id: "integrating",
    kicker: "05 — Interop",
    title: "Integrating Keycloak with external systems like Ping",
    body: (
      <>
        <p>For organizations looking to transition from Ping to Keycloak — or to integrate Keycloak with systems already using Ping — Keycloak's flexibility offers a significant advantage. Keycloak can act as a broker that sits between Ping and your applications, letting you leverage the strengths of both platforms during a transition.</p>
        <p>Keycloak's identity-brokering capability lets it delegate authentication to external identity providers (IdPs) such as Ping. Keycloak can manage internal permissions and roles, provide additional security checks, and maintain a consistent, user-friendly login experience across systems. This makes <Link to="/support/migrate-to-keycloak/" className="ilink">migrating off Ping</Link> a low-risk, phased process — you can move one piece at a time without disrupting user access or security.</p>
      </>
    ),
  },
  {
    id: "best",
    kicker: "06 — Verdict",
    title: "Which IAM solution is best for me?",
    body: (
      <>
        <p>Ping Identity makes sense for very large enterprises with complex, governance-heavy identity programs and the budget for a negotiated suite. For organizations that want the same standards and self-managed deployment without opaque, escalating contracts — or that simply want predictable cost — Keycloak is the stronger, more flexible foundation.</p>
        <p>Phase Two pairs Keycloak with enterprise hosting, migration, and 24/7 support, giving large organizations the assurance of a vendor relationship without the lock-in of a proprietary suite.</p>
      </>
    ),
  },
];

const matrix = {
  savings: "~80%",
  rows: [
    { feat: "Quote-based / opaque pricing", vendor: "$$$", keycloak: "lim" },
    { feat: "Open-source core", vendor: "no", keycloak: "yes" },
    { feat: "Self-hostable (no lock-in)", vendor: "lim", keycloak: "yes" },
    { feat: "On-premise / data residency", vendor: "yes", keycloak: "yes" },
    { feat: "No suite license lock-in", vendor: "no", keycloak: "yes" },
    { feat: "Custom SAML / OIDC / FIDO2", vendor: "yes", keycloak: "yes" },
    { feat: "Full source access & SPI extensions", vendor: "lim", keycloak: "yes" },
    { feat: "Federate / broker existing IdP", vendor: "yes", keycloak: "yes" },
    { feat: "24/7 escalation with Keycloak experts", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Keycloak a good alternative to Ping Identity?",
    a: <p>Yes. Keycloak supports the same core standards as Ping (SAML, OIDC, OAuth 2.0, FIDO2/WebAuthn) and covers federation, brokering, and fine-grained authorization, while being open source and free of suite licensing. The trade-off is operational overhead, which Phase Two removes.</p>,
    text: "Yes. Keycloak supports the same core standards as Ping (SAML, OIDC, OAuth 2.0, FIDO2/WebAuthn) and covers federation, brokering, and fine-grained authorization, while being open source and free of suite licensing. The trade-off is operational overhead, which Phase Two removes.",
  },
  {
    q: "Is Keycloak cheaper than Ping?",
    a: <p>Almost always. Ping is sold via quote-based enterprise contracts that bundle multiple products and renegotiate at renewal. Keycloak has no license fee and is priced on infrastructure, making spend transparent and stable.</p>,
    text: "Almost always. Ping is sold via quote-based enterprise contracts that bundle multiple products and renegotiate at renewal. Keycloak has no license fee and is priced on infrastructure, making spend transparent and stable.",
  },
  {
    q: "Can I migrate from Ping to Keycloak?",
    a: <p>Yes. Keycloak can broker authentication to Ping during a phased cutover and import users and configuration incrementally, so you can retire Ping components one at a time. See <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>,
    text: "Yes. Keycloak can broker authentication to Ping during a phased cutover and import users and configuration incrementally, so you can retire Ping components one at a time.",
  },
  {
    q: "Does Keycloak support on-premise like Ping?",
    a: <p>Yes. Keycloak runs on-premise, in your own cloud, or as a managed service — the same deployment freedom Ping offers, without the suite licensing.</p>,
    text: "Yes. Keycloak runs on-premise, in your own cloud, or as a managed service — the same deployment freedom Ping offers, without the suite licensing.",
  },
  {
    q: "Can Phase Two support Keycloak at enterprise scale?",
    a: <p>Yes. Phase Two provides multi-region high-availability hosting, 24/7 escalation with named engineers, security backports, and architecture reviews — built for enterprise requirements.</p>,
    text: "Yes. Phase Two provides multi-region high-availability hosting, 24/7 escalation with named engineers, security backports, and architecture reviews — built for enterprise requirements.",
  },
];

const migration = {
  heading: "Already using Ping Identity?",
  body: "Moving to Keycloak is more approachable than most teams expect. We import users, broker authentication during a phased cutover, and move you off Ping Identity without disrupting access.",
};

const bigcta = {
  heading: "See how much you'd save.",
  body: "A 30-minute demo and a custom proposal — keyed to your current Ping Identity contract — usually beats your renewal.",
};

export default function KeycloakVsPingIdentity() {
  return (
    <ComparisonLayout
      vendor="Ping Identity"
      slug="ping-identity"
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
