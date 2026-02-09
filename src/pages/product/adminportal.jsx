import Layout from "@theme/Layout";
import React from "react";

import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";

import styles from "./adminportal.module.css";

const PAGE_META = {
  title: "Admin Portal",
  description:
    "Give customers a self-service portal to manage users, organizations, and authentication with minimal code.",
};

const HERO = {
  title: "Self-Service Portal for Your Customers",
  description:
    "Give users control over their profile, authentication methods, and organization management without writing custom UI or fielding support tickets.",
  imageSrc: "/img/hero-service-portal.svg",
};

const INTRO = {
  headline:
    "The Phase Two Admin Portal lets customers automatically manage their teams’ access from within your application with minimal code.",
};

const SELF_MANAGE = {
  title: "Everything Your Customers Need to Self-Manage",
  featured: {
    title: "API-First Integration",
    description:
      "Built for easy application integration with comprehensive APIs for user and organization management.",
    imageSrc: "/img/api-first-integration.svg",
  },
  cards: [
    {
      title: "Customizable Branding",
      description:
        "Customize your customer portal via the Admin UI to match your application and create a seamless branded experience.",
      imageSrc: "/img/customizable-branding.svg",
    },
    {
      title: "Portal Link Generation",
      description:
        "Generate a portal link to let users launch into the portal and update information, manage login methods, and more.",
      imageSrc: "/img/portal-link-generation.svg",
    },
    {
      title: "Change Notifications",
      description:
        "Listen for user changes using audit webhooks so your application stays synchronized when users update their information.",
      imageSrc: "/img/change-notifications.svg",
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

export default function AdminPortal() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
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
                    src={HERO.imageSrc}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h1 className="text-white text-balance">{HERO.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large text-balance mb-0">{HERO.description}</p>
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

        {/* Self-manage */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={SELF_MANAGE.title} intro="" />

            <div className={["mx-auto mt-14", styles.bentoWide].filter(Boolean).join(" ")}>
              <CardWithImage
                className={styles.featuredCard}
                layout="horizontal"
                titleAs="h3"
                title={SELF_MANAGE.featured.title}
                description={<p className="mb-0">{SELF_MANAGE.featured.description}</p>}
                imageSrc={SELF_MANAGE.featured.imageSrc}
                imageAlt=""
              />

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {SELF_MANAGE.cards.map((card) => (
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
