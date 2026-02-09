import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "CockroachDB",
  description:
    "Run Keycloak on CockroachDB for multi-region replication, high availability, and resilient identity infrastructure—built and supported by Phase Two.",
};

const HERO = {
  title: "Keycloak on CockroachDB: Built for Scale and Resilience",
  description:
    "Phase Two is the official maintainer of the CockroachDB integration for Keycloak—delivering high availability, multi-region replication, and enterprise-grade performance.",
  imageSrc: "/img/hero-cockroachdb.svg",
  primaryCtaLabel: "Try for Free",
  primaryCtaHref: "https://dash.phasetwo.io/",
  secondaryCtaLabel: "Learn more",
  secondaryCtaHref: "#enterprise-database",
};

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const INTRO = {
  headline:
    "CockroachDB provides highly scalable, HA-focused database infrastructure capable of multi-region replication.",
};

const ENTERPRISE_DATABASE = {
  title: "Enterprise Database for Enterprise Identity",
  intro:
    "Identity is mission-critical. Pair Keycloak with CockroachDB to support global deployments, reduce operational risk, and keep performance consistent as you scale.",
  featured: {
    title: "Official CockroachDB Partner",
    description:
      "Phase Two is part of the official CockroachDB Partner Network, ensuring continued support and optimization of the integration.",
    imageSrc: "/img/official-cockroachdb-partner.svg",
    linkLabel: "Read the partnership announcement",
    linkUrl: "/blog/phasetwo-cockroachdb-partnership",
  },
  cards: [
    {
      title: "Purpose-Built Image",
      description:
        "Phase Two distributes a Keycloak image built specifically for CockroachDB.",
      imageSrc: "/img/purpose-built-image.svg",
    },
    {
      title: "Multi-Region Replication",
      description:
        "Maintain highly scalable database infrastructure capable of multi-region replication for global deployments.",
      imageSrc: "/img/multi-region-replication.svg",
    },
    {
      title: "Production Proven",
      description:
        "Powers all Phase Two dedicated hosting with consistent sub-10ms P99 latency in production environments.",
      imageSrc: "/img/production-proven.svg",
    },
  ],
};

const PAGE_CTA = {
  primaryText: "Ready to Try Keycloak?",
  secondaryText: "Create Your Free Deployment Today.",
  ctaLabel: "Try for Free",
  ctaHref: "https://dash.phasetwo.io/",
};

function SectionHeading({ title, intro, align = "center" }) {
  return (
    <div className={align === "center" ? "text-center" : "subpage-section-heading"}>
      <h2 className="text-white">{title}</h2>
      {intro ? <p className="mt-6 text-gray-300 subpage-section-intro">{intro}</p> : null}
    </div>
  );
}

export default function CockroachDb() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO.imageSrc}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h1 className="text-white text-balance">{HERO.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large whitespace-pre-line mb-0">
                  {HERO.description}
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href={HERO.primaryCtaHref} target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">{HERO.primaryCtaLabel}</button>
                  </a>
                  <Link href={HERO.secondaryCtaHref} className="link-primary">
                    {HERO.secondaryCtaLabel} <span aria-hidden="true">→</span>
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
              <h3 className="mb-0 text-gray-300 font-normal text-balance whitespace-pre-line">
                {INTRO.headline}
              </h3>
            </div>
          </div>
        </section>

        {/* Enterprise database */}
        <section id="enterprise-database" className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={ENTERPRISE_DATABASE.title} intro={ENTERPRISE_DATABASE.intro} />

            <div className="mx-auto mt-14 max-w-[var(--content-width-wide)]">
              <CardWithImage
                layout="horizontal"
                imagePosition="left"
                titleAs="h3"
                title={ENTERPRISE_DATABASE.featured.title}
                description={<p className="mb-0">{ENTERPRISE_DATABASE.featured.description}</p>}
                imageSrc={ENTERPRISE_DATABASE.featured.imageSrc}
                imageAlt=""
                linkLabel={ENTERPRISE_DATABASE.featured.linkLabel}
                linkUrl={ENTERPRISE_DATABASE.featured.linkUrl}
              />

              <div className="mx-auto mt-6 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 md:grid-cols-3">
                {ENTERPRISE_DATABASE.cards.map((card) => (
                  <CardWithImage
                    key={card.title}
                    title={card.title}
                    description={<p className="mb-0">{card.description}</p>}
                    imageSrc={card.imageSrc}
                    imageAlt=""
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Body large note */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="mb-0 text-gray-300 text--body-large text-center text-balance">
              If you use our CockroachDB image, we'd love to hear from you. Drop us a line.
            </p>
          </div>
        </section>

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText={PAGE_CTA.primaryText}
          secondaryText={PAGE_CTA.secondaryText}
          showCta
          ctaLabel={PAGE_CTA.ctaLabel}
          ctaHref={PAGE_CTA.ctaHref}
        />
      </main>
    </Layout>
  );
}

