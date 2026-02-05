import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "On-Premise Keycloak Deployment",
  description:
    "Deploy Keycloak in your environment with control over data residency, infrastructure, and operations—backed by Phase Two expertise.",
};

const HERO = {
  title: "On-Premise Keycloak Deployment",
  description:
    "Deploy Keycloak in your own infrastructure when security requirements or regulatory compliance demand it—with optional expert management from Phase Two.",
  imageSrc: "/img/hero-on-prem-keycloak.svg",
  primaryCtaLabel: "Contact Sales",
  primaryCtaHref: "/contact",
  secondaryCtaLabel: "Learn more",
  secondaryCtaHref: "#deploy-where-needed",
};

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const INTRO = {
  headline:
    "Without specific security requirements, we recommend investigating Phase Two's hosted offering as an alternative. However, when your business demands on-premise deployment, Keycloak provides the flexibility to meet those needs.",
};

const DEPLOY_WHERE_NEEDED = {
  title: "Deploy Where Your Requirements Demand",
  intro:
    "Keycloak is powerful, but power comes with complexity. Here's what you're signing up for if you go it alone.",
  cards: [
    {
      title: "Data Residency Control",
      description:
        "Deploy Keycloak where you need to meet geographic or regulatory data residency requirements.",
      imageSrc: "/img/data-residency-control.svg",
    },
    {
      title: "Cloud Provider Agnostic",
      description:
        "Run on any cloud provider or private infrastructure without vendor lock-in.",
      imageSrc: "/img/cloud-provider-agnostic.svg",
    },
    {
      title: "Database Choice",
      description:
        "Use your preferred relational database: MySQL, PostgreSQL, or CockroachDB.",
      imageSrc: "/img/database-choice.svg",
    },
  ],
};

const EXPERT_MANAGEMENT = {
  title: "Expert Management for Your Infrastructure",
  intro:
    "Phase Two can run and support your Keycloak deployment while you stay focused on your product.",
  featured: {
    title: "Phase Two Managed Services",
    description:
      "Leverage Phase Two to manage your on-premise Keycloak deployment, handling configuration, maintenance, and optimization.",
    imageSrc: "/img/phasetwo-managed.svg",
    linkLabel: "Talk to us",
    linkUrl: "/contact",
  },
};

const IDP_INTEGRATION = {
  title: "IdP onboarding that doesn’t require tickets",
  description:
    "Seamlessly onboard and integrate with your existing on-premise identity providers.",
  imageSrc: "/img/onprem-idp.svg",
};

const IDP_ROUTING_NOTE =
  "Users click 'Sign in with SSO' or enter their email address (user@company.com), and they're automatically routed to their organization's configured identity provider for authentication. No manual provider selection, no confusion.";

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

export default function OnPrem() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO.imageSrc}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <h1 className="text-white">{HERO.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large whitespace-pre-line mb-0">
                  {HERO.description}
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <Link to={HERO.primaryCtaHref}>
                    <button className="btnPrimary min-w-[160px]">{HERO.primaryCtaLabel}</button>
                  </Link>
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

        {/* Deploy where needed */}
        <section id="deploy-where-needed" className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={DEPLOY_WHERE_NEEDED.title} intro={DEPLOY_WHERE_NEEDED.intro} />

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 md:grid-cols-3">
              {DEPLOY_WHERE_NEEDED.cards.map((card) => (
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
        </section>

        {/* Expert management */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={EXPERT_MANAGEMENT.title} intro={EXPERT_MANAGEMENT.intro} />

            <div className="mx-auto mt-14 max-w-[var(--content-width-wide)] space-y-6">
              <CardWithImage
                layout="horizontal"
                imagePosition="left"
                titleAs="h3"
                title={EXPERT_MANAGEMENT.featured.title}
                description={<p className="mb-0">{EXPERT_MANAGEMENT.featured.description}</p>}
                linkLabel={EXPERT_MANAGEMENT.featured.linkLabel}
                linkUrl={EXPERT_MANAGEMENT.featured.linkUrl}
                imageSrc={EXPERT_MANAGEMENT.featured.imageSrc}
                imageAlt=""
              />

              <CardWithImage
                layout="horizontal"
                imagePosition="right"
                titleAs="h3"
                title={IDP_INTEGRATION.title}
                description={<p className="mb-0">{IDP_INTEGRATION.description}</p>}
                imageSrc={IDP_INTEGRATION.imageSrc}
                imageAlt=""
              />

              <p className="mb-0 text-gray-300 text--body-large text-center text-balance">
                {IDP_ROUTING_NOTE}
              </p>
            </div>
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
