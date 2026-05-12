import React from "react";
import Layout from "@theme/Layout";
import CardWithImage from "../../components/CardWithImage";
import SupportCta from "../../components/ctas/support-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const IMG_CLEAR_ACTIONABLE = "/img/clear-actionable-recommendations.svg";

const PAGE_CTA = {
  primaryText: "Working With Your Team is Easy.",
  secondaryText: "Let Us Show You How.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};

export default function ArchitectureReviewAndScaling() {
  return (
    <Layout
      title="Architecture Review and Scaling"
      description="Structured Keycloak architecture reviews and scaling guidance from Phase Two—topology, caching, auth flows, extensions, and upgrade strategy."
    >
      <main className="hosting-page">
        <section className="subpage-section subpage-hero-section">
          <div
            className="relative isolate overflow-hidden"
            style={HERO_BG_STYLE}
          >
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-balance text-white">
                  Architecture Review and Scaling
                </h1>
                <p className="mb-0 mt-6 text-balance font-normal text-gray-300 text--body-large">
                  For teams designing or operating Keycloak at scale, we offer
                  structured reviews covering cluster topology, database
                  configuration, caching and session management, authentication
                  flow design, extension usage, and upgrade and rollback
                  strategies.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <CardWithImage
                title="Clear, Actionable Recommendations"
                description={
                  <p className="mb-0">
                    The output is a prioritized set of recommendations focused on
                    reliability, performance, cost efficiency, and operational
                    simplicity.
                  </p>
                }
                imageSrc={IMG_CLEAR_ACTIONABLE}
                imageAlt="Illustration for clear, actionable architecture recommendations"
                layout="horizontal"
                reverseHorizontal={false}
              />
            </div>
          </div>
        </section>

        <SupportCta
          sectionClassName="subpage-section cta-section-gradient-secondary"
          primaryText={PAGE_CTA.primaryText}
          secondaryText={PAGE_CTA.secondaryText}
        />
      </main>
    </Layout>
  );
}
