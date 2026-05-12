import React from "react";
import Layout from "@theme/Layout";
import CardWithImage from "../../components/CardWithImage";
import SupportCta from "../../components/ctas/support-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const IMG_OUR_CONTRIBUTORS = "/img/our-contributors.svg";
const IMG_STAY_AT_FOREFRONT = "/img/stay-at-forefront.svg";

const COMMUNITY_CARDS = [
  {
    title: "Our Contributions",
    description: (
      <p className="mb-0">
        Merged pull requests in Keycloak core, moderation and active participation
        in Keycloak Discourse, widely used open-source extensions, conference
        presentations, and collaboration with related projects like Keycloakify.
      </p>
    ),
    imageSrc: IMG_OUR_CONTRIBUTORS,
    imageAlt: "Illustration representing Phase Two contributions to the Keycloak community",
    reverseHorizontal: false,
  },
  {
    title: "Stay at Keycloak Forefront with Us",
    description: (
      <p className="mb-0">
        Early awareness of changes and regressions, direct insight into roadmap
        direction, and faster resolution of upstream issues.
      </p>
    ),
    imageSrc: IMG_STAY_AT_FOREFRONT,
    imageAlt: "Illustration representing staying at the forefront of Keycloak",
    reverseHorizontal: true,
  },
];

const PAGE_CTA = {
  primaryText: "Working With Your Team is Easy.",
  secondaryText: "Let Us Show You How.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};

export default function Community() {
  return (
    <Layout
      title="Community"
      description="Phase Two contributes to the Keycloak community—core code, extensions, discourse, events, and governance—so customers benefit from upstream leadership."
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
                  Built by Keycloak Community Leaders
                </h1>
                <p className="mb-0 mt-6 text-balance font-normal text-gray-300 text--body-large">
                  Phase Two actively contributes code, documentation, extensions,
                  and support across the Keycloak ecosystem—and participates in its
                  governance and events.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              {COMMUNITY_CARDS.map((card) => (
                <CardWithImage
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  imageSrc={card.imageSrc}
                  imageAlt={card.imageAlt}
                  layout="horizontal"
                  reverseHorizontal={card.reverseHorizontal}
                />
              ))}
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
