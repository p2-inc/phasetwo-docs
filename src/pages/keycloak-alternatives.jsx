import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";
import Icon from "../components/comparison/Icon";

const SITE = "https://phasetwo.io";
const DASH = "https://dash.phasetwo.io/";

const PAGE_META = {
  title: "Keycloak Alternatives — Phase Two",
  description:
    "Compare Keycloak to the leading commercial IAM platforms — Auth0, Okta, WorkOS, Ping Identity, FrontEgg, and OneLogin. See why managed open-source Keycloak is a flexible, cost-predictable alternative.",
  keywords:
    "keycloak alternatives, auth0 alternatives, okta alternatives, open source iam, keycloak vs auth0, keycloak vs okta, managed keycloak",
  url: "https://phasetwo.io/keycloak-alternatives/",
};

const ROWS = [
  { vendor: "Auth0", to: "/keycloak-alternatives/auth0/", pricing: "Per-MAU + feature tiers; cost climbs with users and add-ons", deployment: "Cloud SaaS only", onPrem: false, knownFor: "Developer-friendly managed auth" },
  { vendor: "Okta", to: "/keycloak-alternatives/okta/", pricing: "Per-user, per-feature; enterprise bands add up", deployment: "Cloud SaaS only", onPrem: false, knownFor: "Enterprise workforce identity" },
  { vendor: "WorkOS", to: "/keycloak-alternatives/workos/", pricing: "Per-connection / per-org enterprise SSO", deployment: "Cloud SaaS only", onPrem: false, knownFor: "Enterprise-ready SSO/SCIM for SaaS" },
  { vendor: "Ping Identity", to: "/keycloak-alternatives/ping-identity/", pricing: "Enterprise contracts; quote-based", deployment: "Cloud + self-managed options", onPrem: true, knownFor: "Large-enterprise IAM suites" },
  { vendor: "FrontEgg", to: "/keycloak-alternatives/frontegg/", pricing: "Per-MAU tiers; B2B feature gating", deployment: "Cloud SaaS only", onPrem: false, knownFor: "Embedded B2B user management" },
  { vendor: "OneLogin", to: "/keycloak-alternatives/onelogin/", pricing: "Per-user, per-module", deployment: "Cloud SaaS only", onPrem: false, knownFor: "Workforce SSO & access management" },
];

const VENDOR_LOGOS = [
  { name: "Auth0", src: "/customer-logos/auth0.svg" },
  { name: "Okta", src: "/customer-logos/okta.svg" },
  { name: "WorkOS", src: "/customer-logos/workos.svg" },
  { name: "Ping Identity", src: "/customer-logos/ping-identity.svg" },
  { name: "FrontEgg", src: "/customer-logos/frontegg.svg" },
  { name: "OneLogin", src: "/customer-logos/onelogin.svg" },
];

const CARDS = [
  { to: "/keycloak-alternatives/auth0/", logo: "/customer-logos/auth0.svg", title: "vs Auth0", desc: "Open-source alternative to Auth0 — without per-MAU pricing.", cta: "Compare" },
  { to: "/keycloak-alternatives/okta/", logo: "/customer-logos/okta.svg", title: "vs Okta", desc: "Open-source alternative to Okta — for cost and deployment control.", cta: "Compare" },
  { to: "/keycloak-alternatives/workos/", logo: "/customer-logos/workos.svg", title: "vs WorkOS", desc: "Open-source alternative to WorkOS — no per-connection toll.", cta: "Compare" },
  { to: "/keycloak-alternatives/ping-identity/", logo: "/customer-logos/ping-identity.svg", title: "vs Ping Identity", desc: "Open-source alternative to Ping — without the suite contract.", cta: "Compare" },
  { to: "/keycloak-alternatives/frontegg/", logo: "/customer-logos/frontegg.svg", title: "vs FrontEgg", desc: "Open-source alternative to FrontEgg — B2B without per-MAU cost.", cta: "Compare" },
  { to: "/keycloak-alternatives/onelogin/", logo: "/customer-logos/onelogin.svg", title: "vs OneLogin", desc: "Open-source alternative to OneLogin — no per-module pricing.", cta: "Compare" },
  { to: "/blog/open-source-iam/", icon: "file-text", title: "Open-Source IAM", desc: "The roundup — why open standards beat vendor lock-in.", cta: "Read" },
  { to: "/hosting/", icon: "cloud", title: "Managed Hosting", desc: "Run Keycloak with Phase Two — fixed cost, zero ops burden.", cta: "Learn more" },
];

const FAQS = [
  {
    q: "What is the best open-source alternative to Auth0?",
    a: <p>Keycloak is the most widely adopted open-source alternative to Auth0. It supports the same core standards (OAuth 2.0, OpenID Connect, SAML) and matches Auth0 on most authentication and authorization features, while being free of per-user licensing. The main trade-off is operational overhead, which a managed host like Phase Two removes. See our full <Link to="/keycloak-alternatives/auth0/" className="ilink">Keycloak vs. Auth0</Link> comparison.</p>,
    text: "Keycloak is the most widely adopted open-source alternative to Auth0. It supports OAuth 2.0, OpenID Connect, and SAML and matches Auth0 on most features, without per-user licensing. A managed host like Phase Two removes the operational overhead.",
  },
  {
    q: "What is the best alternative to Okta?",
    a: <p>For teams that want control over deployment and cost, Keycloak is a strong Okta alternative — especially where on-premise or data-residency requirements rule out a cloud-only vendor. Read <Link to="/keycloak-alternatives/okta/" className="ilink">Keycloak vs. Okta</Link> for a feature-by-feature look.</p>,
    text: "Keycloak is a strong Okta alternative for teams that want control over deployment and cost, especially where on-premise or data-residency requirements rule out a cloud-only vendor.",
  },
  {
    q: "Is Keycloak cheaper than Auth0?",
    a: <p>For most growing applications, yes. Commercial IAM pricing scales with monthly active users and feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows. Teams moving to managed Keycloak frequently see substantial savings. Estimate it on our <Link to="/pricing/hosting/" className="ilink">hosting pricing</Link> page.</p>,
    text: "For most growing applications, yes. Commercial IAM pricing scales with monthly active users and feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows.",
  },
  {
    q: "Can I migrate off Auth0, Okta, or Cognito to Keycloak?",
    a: <p>Yes. Keycloak can import your users and broker authentication to your existing provider during a phased cutover, so you can migrate incrementally without disrupting users. We've built tooling and a process for exactly this — see <Link to="/support/migrate-to-keycloak/" className="ilink">Migrate to Keycloak</Link>.</p>,
    text: "Yes. Keycloak can import your users and broker authentication to your existing provider during a phased cutover, so you can migrate incrementally without disrupting users.",
  },
  {
    q: "Is Keycloak a good alternative to commercial IAM?",
    a: <p>Keycloak offers feature parity with virtually every commercial IAM platform on the core standards, plus full source access and on-premise deployment options that SaaS-only vendors can't match. Paired with managed hosting, you get that openness without the operational burden. Read the <Link to="/blog/open-source-iam/" className="ilink">open-source IAM overview</Link>.</p>,
    text: "Keycloak offers feature parity with commercial IAM platforms on core standards, plus full source access and on-premise deployment options. Paired with managed hosting, you get that openness without the operational burden.",
  },
];

export default function KeycloakAlternatives() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.text } })),
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Keycloak vs. commercial IAM comparisons",
    itemListElement: ROWS.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `Keycloak vs. ${c.vendor}`, url: `${SITE}${c.to}` })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Keycloak Alternatives", item: PAGE_META.url },
    ],
  };

  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <Head>
        <meta name="keywords" content={PAGE_META.keywords} />
        <link rel="canonical" href={PAGE_META.url} />
        <meta property="og:title" content={PAGE_META.title} />
        <meta property="og:description" content={PAGE_META.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_META.url} />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Head>

      <div className="kcvs accent-blue">
        {/* Hero */}
        <header className="hero">
          <div className="glow"></div>
          <section className="hubHero">
            <div className="wrap">
              <div className="hub-mark">
                <span className="ring r3"></span><span className="ring r2"></span><span className="ring"></span>
                <span className="spark" style={{ top: 8, left: 18 }}></span>
                <span className="spark" style={{ top: 30, right: 6, background: "var(--primary-2)" }}></span>
                <span className="spark" style={{ bottom: 14, left: 0 }}></span>
                <span className="spark" style={{ bottom: 2, right: 26 }}></span>
                <div className="glyph"><img src="/img/comparison/phasetwo_logo_icon.svg" alt="" /></div>
              </div>
              <h1>Keycloak Alternatives</h1>
              <p className="lede">Evaluating Auth0, Okta, WorkOS, or another commercial IAM? Keycloak is the open-source alternative that matches them on standards and features — without per-user licensing or vendor lock-in. Paired with Phase Two managed hosting, you get that control with fixed, predictable costs and none of the operational burden.</p>
              <div className="hero-cta">
                <a href={DASH} target="_blank" rel="noreferrer"><button className="btn btn-primary btn-lg"><Icon name="zap" /> Try for Free</button></a>
                <a href="#compare" className="btn btn-ghost btn-lg">Compare the platforms <Icon name="arrow-down" /></a>
              </div>
              <div className="hero-logostrip">
                <span className="lbl">Compare Keycloak against</span>
                <div className="logos">
                  {VENDOR_LOGOS.map((v) => (
                    <img key={v.name} src={v.src} alt={v.name} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </header>

        {/* Thesis */}
        <section className="thesis section">
          <div className="wrap">
            <h2>On the core standards — OIDC, OAuth 2.0, and SAML — Keycloak offers parity with virtually <span className="grad">every commercial IAM platform</span>. The real differences are cost model, deployment flexibility, and how far you can extend the system.</h2>
          </div>
        </section>

        {/* Hub table */}
        <section className="section" id="compare" style={{ background: "var(--bg)" }}>
          <div className="wrap">
            <div className="head" style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}><span className="dot"></span>Compare Keycloak</div>
              <h2 className="h-sec">Keycloak vs. commercial IAM at a glance</h2>
              <p className="lede" style={{ maxWidth: 600, margin: "14px auto 0" }}>A high-level view of how each platform is licensed and deployed. Follow any row for the full, feature-by-feature comparison.</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="hubtable">
                <thead>
                  <tr><th>Platform</th><th>Pricing model</th><th>Deployment</th><th>On-premise</th><th>Best known for</th><th>Compare</th></tr>
                </thead>
                <tbody>
                  <tr className="p2row">
                    <td className="plat">Keycloak (with Phase Two)</td>
                    <td>Fixed hosting cost, not per-user</td>
                    <td>Self-hosted, your cloud, on-prem, or managed</td>
                    <td><span className="yes">Yes</span></td>
                    <td>Open-source, extensible IAM</td>
                    <td><Link to="/hosting/">Managed hosting →</Link></td>
                  </tr>
                  {ROWS.map((r) => (
                    <tr key={r.vendor}>
                      <td className="plat">{r.vendor}</td>
                      <td>{r.pricing}</td>
                      <td>{r.deployment}</td>
                      <td>{r.onPrem ? <span className="yes">Yes</span> : <span className="no">No</span>}</td>
                      <td>{r.knownFor}</td>
                      <td><Link to={r.to}>Keycloak vs. {r.vendor} →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="footnote" style={{ textAlign: "center", maxWidth: 720, margin: "18px auto 0" }}>Pricing models are summarized for orientation and reflect each vendor's general approach, not a quote. Commercial pricing changes frequently — confirm current rates with each vendor.</p>
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <Link to="/blog/open-source-iam/" className="link-arrow" style={{ justifyContent: "center" }}>Read the open-source IAM overview <Icon name="arrow-right" size={15} /></Link>
            </div>
          </div>
        </section>

        {/* Vendor card grid */}
        <section className="section-sm" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
          <div className="wrap">
            <div className="head" style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 className="h-sec" style={{ fontSize: 26 }}>Pick a head-to-head comparison</h2>
            </div>
            <div className="cardgrid">
              {CARDS.map((c) => (
                <Link key={c.title} className="vcard" to={c.to}>
                  {c.logo ? (
                    <div className="vcard-logo"><img src={c.logo} alt="" /></div>
                  ) : (
                    <div className="vtile"><Icon name={c.icon} size={20} /></div>
                  )}
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <span className="go">{c.cta} <Icon name="arrow-right" size={14} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Already using */}
        <section className="using section">
          <div className="wrap inner">
            <div className="eyebrow" style={{ marginBottom: 18 }}><span className="dot"></span>Migration</div>
            <h2 className="h-sec">Already on Auth0, Okta, or Cognito?</h2>
            <p className="lede" style={{ margin: "16px auto 26px", maxWidth: 580 }}>Moving to Keycloak is more approachable than most teams expect. We import users, broker authentication during a phased cutover, and move you off your current vendor without disrupting access.</p>
            <Link to="/support/migrate-to-keycloak/" className="btn btn-primary btn-lg"><Icon name="arrow-right-left" /> See how we migrate teams to Keycloak</Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow" style={{ marginBottom: 16 }}><span className="dot"></span>FAQ</div>
              <h2 className="h-sec">Frequently asked questions</h2>
            </div>
            <div className="faq-list">
              {FAQS.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>{f.q} <span className="pm"><Icon name="plus" /></span></summary>
                  <div className="ans">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bigcta section">
          <div className="wrap">
            <h2>Ready to Try Keycloak?<br />Create your free deployment today.</h2>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
              <a href={DASH} target="_blank" rel="noreferrer"><button className="btn btn-primary btn-lg"><Icon name="zap" /> Try for Free</button></a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
