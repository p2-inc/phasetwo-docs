import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import CardWithImage from "../../components/CardWithImage";
import CardWithIcon from "../../components/CardWithIcon";
import Cta from "../../components/ctas/homepage-dual-line-cta";
import { InlineIcon } from "@iconify/react/dist/iconify.js";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const VALUE_PROPS = [
  {
    title: "Immediate Assistance",
    description:
      "Purchase a small block of hours for emergency support. Ideal for urgent issues when you don't have a support contract.",
    imageSrc: "/img/immediate-assistance.svg",
  },
  {
    title: "No Long-Term Commitment",
    description:
      "Flexible support when you need it, without committing to a full contract. Get help resolving critical issues and move on.",
    imageSrc: "/img/no-long-term-commitment.svg",
  },
  {
    title: "Deep Keycloak Expertise",
    description:
      "Infrastructure, configuration, or troubleshooting—our team has the expertise to resolve issues quickly across any Keycloak challenge.",
    imageSrc: "/img/deep-keycloak-expertise.svg",
  },
];

const EFFECTIVE_SUPPORT = [
  {
    title: "Flat Fee Structure",
    description:
      "Package starts with a 5-hour block for any Keycloak-related issue. Additional hours available if needed. Contact for pricing.",
    icon: "lucide:circle-dollar-sign",
  },
  {
    title: "Determined Resolution",
    description:
      "We work to find a solution. Most customers are unblocked quickly, but for complex issues, we provide a detailed resolution plan.",
    icon: "lucide:circle-check",
  },
];

const PAGE_CTA = {
  primaryText: "Working With Your Team is Easy.",
  secondaryText: "Let Us Show You How.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};

export default function EmergencySupport() {
  return (
    <Layout
      title="Emergency Support"
      description="Emergency Keycloak support when every minute counts. Get expert help without a long-term contract."
    >
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div
            className="relative isolate overflow-hidden"
            style={HERO_BG_STYLE}
          >
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-white text-balance">
                  Emergency Keycloak Support When Every Minute Counts
                </h1>
                <p className="mt-6 text-gray-300 text--body-large text-balance">
                Urgent Keycloak issues resolved fast. Get expert help without a long-term contract—ideal when online searches and AI have failed you and you need immediate assistance.
                </p>

                <div className="mt-10">
                  <Link to="/contact">
                    <button className="btnPrimary btnSupport min-w-[160px]">
                      Get help now
                    </button>
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
              <h4 className="mb-0 text-gray-300 font-normal text-balance">
                If you need emergency assistance with Keycloak, we're here to help. Our emergency support package provides immediate expert assistance for urgent issues—no long-term commitment required.
              </h4>
            </div>
          </div>
        </section>

        {/* Top Three Value Props */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-white text-center mb-12">
              Fast, Flexible, Expert Support
            </h2>

            <div className="hosting-bento-grid">
              {VALUE_PROPS.map((prop) => (
                <CardWithImage
                  key={prop.title}
                  title={prop.title}
                  description={<p className="mb-0">{prop.description}</p>}
                  imageSrc={prop.imageSrc}
                  imageAlt=""
                />
              ))}
            </div>
          </div>
        </section>

        {/* Effective Support */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-white text-center mb-12">
              Simple. Effective. Emergency Support.
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {EFFECTIVE_SUPPORT.map((item) => (
                <CardWithIcon
                  key={item.title}
                  icon={
                    <InlineIcon
                      icon={item.icon}
                      className="size-8"
                      style={{ color: "var(--ifm-color-secondary)" }}
                      aria-hidden="true"
                    />
                  }
                  heading={item.title}
                  description={item.description}
                  layout="stacked"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Customer Success */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-white text-center mb-12">
              Customer Success: Idemia
            </h2>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center max-w-[var(--content-width-narrow)] mx-auto">
              <div className="flex flex-col justify-center">
                <p className="text-gray-300 text--body-large">
                  When faced with integrating Keycloak with a US State Government system, Idemia engaged Phase Two to resolve multiple system integration hurdles, meet a tight deadline, and keep their customers satisfied.
                </p>
                <p className="mt-6 text-gray-400 text--body-large">
                  &lt;24 hours — from first contact to resolution
                </p>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/img/us-gov-idemia.svg"
                  alt="Idemia US Government integration"
                  className="w-full max-w-md h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient-secondary"
          background="secondary"
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
