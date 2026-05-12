import React from "react";
import Layout from "@theme/Layout";
import CardWithImage from "../../components/CardWithImage";
import SupportCta from "../../components/ctas/support-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

/** Illustrations in `static/img/` — use these filenames only */
const IMG_RAPID_RESPONSE = "/img/rapid-response.svg";
const IMG_ROOT_CAUSE_ANALYSIS = "/img/root-cause-analysis.svg";
const IMG_IMPROVING_OVER_TIME = "/img/improving-over-time.svg";
const IMG_CUSTOM_SLAS = "/img/custom-slas.svg";

const FEATURE_CARDS = [
  {
    title: "Root Cause Analysis",
    imageSrc: IMG_ROOT_CAUSE_ANALYSIS,
    imageAlt: "",
    body: (
      <p className="mb-0">
        Beyond fixing the immediate problem, we develop RCAs that identify what
        went wrong and how to prevent it. Every incident becomes an opportunity
        to improve overall system stability.
      </p>
    ),
  },
  {
    title: "Improving Over Time",
    imageSrc: IMG_IMPROVING_OVER_TIME,
    imageAlt: "",
    body: (
      <p className="mb-0">
        The more we work with your system, the better positioned we are to guide
        your team. Incidents decrease as we apply accumulated knowledge to
        configuration recommendations and long-term stability improvements.
      </p>
    ),
  },
  {
    title: "Custom SLAs",
    imageSrc: IMG_CUSTOM_SLAS,
    imageAlt: "",
    body: (
      <p className="mb-0">Available based on your business requirements.</p>
    ),
  },
];

const PAGE_CTA = {
  primaryText: "Working With Your Team is Easy.",
  secondaryText: "Let Us Show You How.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};

export default function IncidentSupport247() {
  return (
    <Layout
      title="24/7 Incident Support"
      description="Phase Two provides 24/7 on-call incident response for Keycloak—rapid triage, root cause analysis, and deep pattern recognition when production is on the line."
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
                  24/7 On-Call Incident Response
                </h1>
                <p className="mb-0 mt-6 max-w-[600px] mx-auto text-balance font-normal text-gray-300 text--body-large">
                  Production doesn&apos;t keep business hours, and neither do
                  we. Phase Two responds fast—typically within minutes—and brings
                  deep Keycloak pattern recognition to every incident.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <CardWithImage
                title="Rapid Response"
                description={
                  <p className="mb-0">
                    Bring our team in within minutes of a production outage.
                    We&apos;ve seen the failure modes, know where to look, and
                    move quickly to restore service.
                  </p>
                }
                imageSrc={IMG_RAPID_RESPONSE}
                imageAlt="Illustration for rapid incident response"
                layout="horizontal"
                reverseHorizontal={false}
              />

              <div className="hosting-bento-grid">
                {FEATURE_CARDS.map((card) => (
                  <div
                    key={card.title}
                    className="hosting-bento-box hosting-bento-box-image-bottom"
                  >
                    <div className="hosting-bento-content">
                      <h4 className="mb-4 text-white">{card.title}</h4>
                      <div className="hosting-bento-text text-gray-300">
                        {card.body}
                      </div>
                    </div>
                    <div className="hosting-bento-image hosting-bento-image-bottom">
                      <img
                        src={card.imageSrc}
                        alt={card.imageAlt || card.title}
                        className="h-auto w-full"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                ))}
              </div>
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
