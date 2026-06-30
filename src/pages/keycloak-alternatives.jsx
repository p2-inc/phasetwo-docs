import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";
import Cta from "../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "Keycloak Alternatives: Compare Keycloak to Auth0, Okta, WorkOS & More",
  description:
    "Compare Keycloak to the leading commercial IAM platforms — Auth0, Okta, WorkOS, Ping Identity, FrontEgg, and OneLogin. See why managed open-source Keycloak is a flexible, cost-predictable alternative.",
  keywords:
    "keycloak alternatives, auth0 alternatives, okta alternatives, open source iam, keycloak vs auth0, keycloak vs okta, managed keycloak",
  url: "https://phasetwo.io/keycloak-alternatives/",
};

const HERO_IMG = "/img/hero-opensource-vs-commercial.svg";

// Each spoke is an existing, full comparison post. Do not duplicate their content
// here — this hub frames the cluster and links down to each one.
const COMPARISONS = [
  {
    vendor: "Auth0",
    to: "/keycloak-alternatives/auth0/",
    pricing: "Per-MAU + feature tiers; cost climbs with users and add-ons",
    deployment: "Cloud SaaS only",
    onPrem: "No",
    knownFor: "Developer-friendly managed auth",
  },
  {
    vendor: "Okta",
    to: "/keycloak-alternatives/okta/",
    pricing: "Per-user, per-feature; enterprise bands add up",
    deployment: "Cloud SaaS only",
    onPrem: "No",
    knownFor: "Enterprise workforce identity",
  },
  {
    vendor: "WorkOS",
    to: "/keycloak-alternatives/workos/",
    pricing: "Per-connection / per-org enterprise SSO",
    deployment: "Cloud SaaS only",
    onPrem: "No",
    knownFor: "Enterprise-ready SSO/SCIM for SaaS",
  },
  {
    vendor: "Ping Identity",
    to: "/keycloak-alternatives/ping-identity/",
    pricing: "Enterprise contracts; quote-based",
    deployment: "Cloud + self-managed options",
    onPrem: "Yes",
    knownFor: "Large-enterprise IAM suites",
  },
  {
    vendor: "FrontEgg",
    to: "/keycloak-alternatives/frontegg/",
    pricing: "Per-MAU tiers; B2B feature gating",
    deployment: "Cloud SaaS only",
    onPrem: "No",
    knownFor: "Embedded B2B user management",
  },
  {
    vendor: "OneLogin",
    to: "/keycloak-alternatives/onelogin/",
    pricing: "Per-user, per-module",
    deployment: "Cloud SaaS only",
    onPrem: "No",
    knownFor: "Workforce SSO & access management",
  },
];

const FAQS = [
  {
    q: "What is the best open-source alternative to Auth0?",
    a: (
      <p className="mb-0">
        Keycloak is the most widely adopted open-source alternative to Auth0. It supports the same
        core standards (OAuth 2.0, OpenID Connect, SAML) and matches Auth0 on most authentication
        and authorization features, while being free of per-user licensing. The main trade-off is
        operational overhead, which a managed host like Phase Two removes. See our full{" "}
        <Link to="/keycloak-alternatives/auth0/">Keycloak vs. Auth0</Link>{" "}
        comparison.
      </p>
    ),
  },
  {
    q: "What is the best alternative to Okta?",
    a: (
      <p className="mb-0">
        For teams that want control over deployment and cost, Keycloak is a strong Okta alternative —
        especially where on-premise or data-residency requirements rule out a cloud-only vendor.
        Read{" "}
        <Link to="/keycloak-alternatives/okta/">Keycloak vs. Okta</Link> for a
        feature-by-feature look.
      </p>
    ),
  },
  {
    q: "Is Keycloak cheaper than Auth0?",
    a: (
      <p className="mb-0">
        For most growing applications, yes. Commercial IAM pricing scales with monthly active users
        and feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays
        largely fixed as your user base grows. Teams moving to managed Keycloak frequently see
        substantial savings. Estimate it on our{" "}
        <Link to="/pricing/hosting/">hosting pricing</Link> page.
      </p>
    ),
  },
  {
    q: "Can I migrate off Auth0, Okta, or Cognito to Keycloak?",
    a: (
      <p className="mb-0">
        Yes. Keycloak can import your users and broker authentication to your existing provider
        during a phased cutover, so you can migrate incrementally without disrupting users. We've
        built tooling and a process for exactly this — see{" "}
        <Link to="/support/migrate-to-keycloak/">Migrate to Keycloak</Link>.
      </p>
    ),
  },
  {
    q: "Is Keycloak a good alternative to commercial IAM?",
    a: (
      <p className="mb-0">
        Keycloak offers feature parity with virtually every commercial IAM platform on the core
        standards, plus full source access and on-premise deployment options that SaaS-only vendors
        can't match. Paired with managed hosting, you get that openness without the operational
        burden. Read the{" "}
        <Link to="/blog/open-source-iam/">open-source IAM overview</Link>.
      </p>
    ),
  },
];

export default function KeycloakAlternatives() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        // Plain-text answers for the FAQ rich result.
        text:
          {
            "What is the best open-source alternative to Auth0?":
              "Keycloak is the most widely adopted open-source alternative to Auth0. It supports OAuth 2.0, OpenID Connect, and SAML and matches Auth0 on most features, without per-user licensing. A managed host like Phase Two removes the operational overhead.",
            "What is the best alternative to Okta?":
              "Keycloak is a strong Okta alternative for teams that want control over deployment and cost, especially where on-premise or data-residency requirements rule out a cloud-only vendor.",
            "Is Keycloak cheaper than Auth0?":
              "For most growing applications, yes. Commercial IAM pricing scales with monthly active users and feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows.",
            "Can I migrate off Auth0, Okta, or Cognito to Keycloak?":
              "Yes. Keycloak can import your users and broker authentication to your existing provider during a phased cutover, so you can migrate incrementally without disrupting users.",
            "Is Keycloak a good alternative to commercial IAM?":
              "Keycloak offers feature parity with commercial IAM platforms on core standards, plus full source access and on-premise deployment options. Paired with managed hosting, you get that openness without the operational burden.",
          }[f.q] || "",
      },
    })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Keycloak vs. commercial IAM comparisons",
    itemListElement: COMPARISONS.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Keycloak vs. ${c.vendor}`,
      url: `https://phasetwo.io${c.to}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://phasetwo.io/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Keycloak Alternatives",
        item: PAGE_META.url,
      },
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

      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div
            className="relative isolate overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO_IMG}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <h1 className="text-white">Keycloak Alternatives</h1>
                <p className="mt-6 text-gray-300 text--body-large">
                  Evaluating Auth0, Okta, WorkOS, or another commercial IAM? Keycloak is the
                  open-source alternative that matches them on standards and features — without
                  per-user licensing or vendor lock-in. Paired with Phase Two managed hosting, you
                  get that control with fixed, predictable costs and none of the operational burden.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">Try for Free</button>
                  </a>
                  <Link href="#comparisons" className="link-primary">
                    Compare the platforms <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h3 className="mb-0 text-gray-300 font-normal text-balance">
                On the core standards — OIDC, OAuth 2.0, and SAML — Keycloak offers parity with
                virtually every commercial IAM platform. The real differences are cost model,
                deployment flexibility, and how far you can extend the system. Here's how Keycloak
                compares to the vendors teams ask us about most.
              </h3>
            </div>
          </div>
        </section>

        {/* Comparison matrix */}
        <section id="comparisons" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Keycloak vs. commercial IAM at a glance</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                A high-level view of how each platform is licensed and deployed. Follow any row for
                the full, feature-by-feature comparison.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-[var(--content-width-wide)] overflow-x-auto">
              <table className="alternatives-matrix">
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Pricing model</th>
                    <th scope="col">Deployment</th>
                    <th scope="col">On-premise</th>
                    <th scope="col">Best known for</th>
                    <th scope="col">Compare</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="alternatives-matrix-keycloak">
                    <th scope="row">Keycloak (with Phase Two)</th>
                    <td>Fixed hosting cost, not per-user</td>
                    <td>Self-hosted, your cloud, on-prem, or managed</td>
                    <td>Yes</td>
                    <td>Open-source, extensible IAM</td>
                    <td>
                      <Link to="/hosting/">Managed hosting →</Link>
                    </td>
                  </tr>
                  {COMPARISONS.map((c) => (
                    <tr key={c.vendor}>
                      <th scope="row">{c.vendor}</th>
                      <td>{c.pricing}</td>
                      <td>{c.deployment}</td>
                      <td>{c.onPrem}</td>
                      <td>{c.knownFor}</td>
                      <td>
                        <Link to={c.to}>Keycloak vs. {c.vendor} →</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mx-auto mt-6 max-w-[var(--content-width-wide)] text-sm text-gray-400">
              Pricing models are summarized for orientation and reflect each vendor's general
              approach, not a quote. Commercial pricing changes frequently — confirm current rates
              with each vendor.{" "}
              {/* TODO: verify — keep cells qualitative; do not insert specific competitor prices without a source. */}
            </p>

            <div className="mt-10 text-center">
              <Link to="/blog/open-source-iam/" className="link-primary">
                Read the open-source IAM overview <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Migration band */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-wide)] text-center">
              <h2 className="text-white">Already on Auth0, Okta, or Cognito?</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Moving to Keycloak is more approachable than most teams expect. We import users,
                broker authentication during a phased cutover, and move you off your current vendor
                without disrupting access.
              </p>
              <div className="mt-8">
                <Link to="/support/migrate-to-keycloak/" className="link-primary">
                  See how we migrate teams to Keycloak <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Frequently asked questions</h2>
            </div>
            <div className="mx-auto mt-10 max-w-[var(--content-width-narrow)] space-y-8">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="text-white text-lg">{f.q}</h3>
                  <div className="mt-3 text-gray-300">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText="Ready to Try Keycloak?"
          secondaryText="Create Your Free Deployment Today."
          showCta
          ctaLabel="Try for Free"
          ctaHref="https://dash.phasetwo.io/"
        />
      </main>
    </Layout>
  );
}
