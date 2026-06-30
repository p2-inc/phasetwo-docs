import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";
import Cta from "../ctas/homepage-dual-line-cta";
import CompareKeycloakBlock from "../CompareKeycloakBlock";

const HERO_IMG = "/img/hero-opensource-vs-commercial.svg";
const SITE = "https://phasetwo.io";

/**
 * Shared layout for the per-vendor "Keycloak vs. X" comparison pages under
 * /keycloak-alternatives/<slug>/. Content-driven so every page stays consistent.
 *
 * Props:
 *  - vendor: display name, e.g. "Auth0"
 *  - slug: url + cross-link key, e.g. "auth0"
 *  - meta: { title, description, keywords }
 *  - heroIntro: JSX paragraph under the H1
 *  - atAGlance: [{ dim, vendor, keycloak }] rows for the at-a-glance table
 *  - sections: [{ title, body }] prose sections (body is JSX)
 *  - faqs: [{ q, a, text }] (a = JSX answer, text = plain-text for JSON-LD)
 */
export default function ComparisonLayout({
  vendor,
  slug,
  meta,
  heroIntro,
  atAGlance = [],
  sections = [],
  faqs = [],
}) {
  const url = `${SITE}/keycloak-alternatives/${slug}/`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.text },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Keycloak Alternatives",
        item: `${SITE}/keycloak-alternatives/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Keycloak vs. ${vendor}`,
        item: url,
      },
    ],
  };

  return (
    <Layout title={meta.title} description={meta.description}>
      <Head>
        {meta.keywords ? <meta name="keywords" content={meta.keywords} /> : null}
        <link rel="canonical" href={url} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        {faqs.length ? (
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        ) : null}
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

                <p className="mb-3">
                  <Link to="/keycloak-alternatives/" className="link-primary">
                    ← All Keycloak alternatives
                  </Link>
                </p>
                <h1 className="text-white">Keycloak vs. {vendor}</h1>
                <p className="mt-6 text-gray-300 text--body-large">{heroIntro}</p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">Try for Free</button>
                  </a>
                  <Link href="#at-a-glance" className="link-primary">
                    See the comparison <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* At a glance */}
        {atAGlance.length ? (
          <section id="at-a-glance" className="subpage-section">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="subpage-section-heading">
                <h2 className="text-white">
                  Keycloak vs. {vendor} at a glance
                </h2>
              </div>
              <div className="mx-auto mt-12 max-w-[var(--content-width-wide)] overflow-x-auto">
                <table className="alternatives-matrix">
                  <thead>
                    <tr>
                      <th scope="col">Dimension</th>
                      <th scope="col">{vendor}</th>
                      <th scope="col">Keycloak (with Phase Two)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atAGlance.map((row) => (
                      <tr key={row.dim}>
                        <th scope="row">{row.dim}</th>
                        <td>{row.vendor}</td>
                        <td>{row.keycloak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {/* Prose sections */}
        {sections.map((s, i) => (
          <section
            key={s.title}
            className={`subpage-section${i % 2 === 1 ? " texture-plus" : ""}`}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-[var(--content-width-narrow)]">
                <h2 className="text-white">{s.title}</h2>
                <div className="mt-6 space-y-4 text-gray-300 comparison-prose">
                  {s.body}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Migration band */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-wide)] text-center">
              <h2 className="text-white">Already using {vendor}?</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Moving to Keycloak is more approachable than most teams expect. We import
                users, broker authentication during a phased cutover, and move you off
                {" "}
                {vendor} without disrupting access.
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
        {faqs.length ? (
          <section className="subpage-section">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="subpage-section-heading">
                <h2 className="text-white">Frequently asked questions</h2>
              </div>
              <div className="mx-auto mt-10 max-w-[var(--content-width-narrow)] space-y-8">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="text-white text-lg">{f.q}</h3>
                    <div className="mt-3 text-gray-300">{f.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Cross-links */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <CompareKeycloakBlock exclude={slug} />
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
