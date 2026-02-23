import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "Enterprise Organizations",
  description:
    "Cost effective SSO, Invitations, Authorization and self-management to easily customize workflows at scale.",
};

const HERO = {
  title: "Customize Authentication and Authorization for Business Customer Identity",
  description:
    "Organizations is a SaaS identity solution that delivers self-management for your customers and APIs for your developers.",
  imageSrc: "/img/hero-organizations.svg",
  primaryCtaLabel: "Get Started",
  primaryCtaHref: "https://dash.phasetwo.io/",
  secondaryCtaLabel: "Learn more",
  secondaryCtaHref: "#top-features",
};

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const INTRO = {
  headline:
    "Programmatic toolset of APIs and SDKs for app development teams to manage and customize workflows for their end customers at scale.",
};

const TOP_FEATURES = {
  title: "Everything You Need to Support Customer Organizations",
  intro:
    "Organizations brings enterprise SSO, invitations, and per-organization authorization together so you can ship business customer identity without building a custom admin surface area.",
  cards: [
    {
      title: "Enterprise Single Sign-on (SSO) Login for Each Customer",
      description: (
        <>
          <p className="mb-0">
            Eliminate the barriers to onboarding and engagement by adopting a corporate identity provider for each customer organization to leverage SSO with existing identity provider systems. Extend with common enterprise social login providers like Google or Microsoft. Logically separate users for your app to allow personalized SSO login.
          </p>
        </>
      ),
      imageSrc: "/img/enterprise-sso.svg",
      imageAlt: "Illustration showing Google and Microsoft social login buttons",
      imagePosition: "right",
    },
    {
      title: "Streamlined Invitations for User Management",
      description: (
        <>
          <p className="mb-0">
            Empower users and organization administrators to invite users. Delegate the responsibility of onboarding to the organization admin and save precious customer support time. Let customers automatically manage organizations via the Admin portal.
          </p>
        </>
      ),
      imageSrc: "/img/streamlined-invitations.svg",
      imageAlt: "Illustration showing inviting users",
      imagePosition: "left",
    },
    {
      title: "Roles, Permissions and Authorization per Customer",
      description: (
        <>
          <p className="mb-0">
            Build your own custom roles and permissions for each organization. Build authorization logic that includes
            the organization as a first-class entity. Invitations allow one to on-board team members quickly.{" "}
            <Link to="/blog/organgizations-multi-tenant-update" className="link-primary">
              Learn more
            </Link>{" "}
            why roles at the organization level are important.
          </p>
        </>
      ),
      imageSrc: "/img/roles-permissions.svg",
      imageAlt: "Illustration showing three users with different roles and permissions",
      imagePosition: "right",
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
      {intro ? <p className="mt-6 text-gray-300 subpage-section-intro mb-0">{intro}</p> : null}
    </div>
  );
}

function Organizations() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="p2-content py-24 sm:py-28">
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
          <div className="p2-content">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h3 className="mb-0 text-gray-300 font-normal text-balance whitespace-pre-line">
                {INTRO.headline}
              </h3>
            </div>
          </div>
        </section>

        {/* Top Features */}
        <section id="top-features" className="subpage-section texture-plus">
          <div className="p2-content">
            <SectionHeading title={TOP_FEATURES.title} intro={TOP_FEATURES.intro} />

            <div className="mx-auto mt-14 max-w-[var(--content-width-wide)] space-y-6">
              {TOP_FEATURES.cards.map((card) => (
                <CardWithImage
                  key={card.title}
                  layout="horizontal"
                  imagePosition={card.imagePosition}
                  titleAs="h3"
                  title={card.title}
                  description={card.description}
                  imageSrc={card.imageSrc}
                  imageAlt={card.imageAlt}
                />
              ))}
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

export default Organizations;
