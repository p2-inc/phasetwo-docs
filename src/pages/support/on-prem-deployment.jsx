import React from "react";
import Layout from "@theme/Layout";
import CardWithImage from "../../components/CardWithImage";
import SupportCta from "../../components/ctas/support-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const INTRO =
  "Phase Two supports Keycloak running in customer-managed environments across bare-metal, private cloud, public cloud (AWS, GCP, Azure), and hybrid setups.";

const IMG_DESIGN_AND_IMPLEMENTATION = "/img/design-and-implementation.svg";
const IMG_FULL_MANAGEMENT = "/img/full-management-available.svg";

const DEPLOYMENT_CARDS = [
  {
    title: "Design and Implementation",
    description: (
      <p className="mb-0">
        Design and implement new deployments, modernize legacy installations,
        introduce infrastructure-as-code practices, improve observability and
        alerting, and harden environments to meet security requirements.
      </p>
    ),
    imageSrc: IMG_DESIGN_AND_IMPLEMENTATION,
    imageAlt: "Illustration for design and implementation of on-prem Keycloak",
    reverseHorizontal: false,
    learnMore: {
      label: "Infrastructure Implementation",
      url: "/support/infrastructure-implementation",
    },
  },
  {
    title: "Full Management Available",
    description: (
      <p className="mb-0">
        For teams that no longer want to operate Keycloak themselves, we can
        assume day-to-day responsibility while aligning with your internal
        processes and compliance constraints.
      </p>
    ),
    imageSrc: IMG_FULL_MANAGEMENT,
    imageAlt: "Illustration for fully managed on-prem Keycloak",
    reverseHorizontal: true,
    learnMore: {
      label: "Dedicated Clusters",
      url: "/hosting/dedicated-clusters",
    },
  },
];

const PAGE_CTA = {
  primaryText: "Working With Your Team is Easy.",
  secondaryText: "Let Us Show You How.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};

export default function OnPremDeployment() {
  return (
    <Layout
      title="On-Prem Deployment"
      description="On-premise Keycloak deployments and infrastructure design from Phase Two—bare metal, private cloud, hybrid, and optional full management."
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
                  On-Premise Deployments and Infrastructure Design
                </h1>
                <p className="text--body-large mb-0 mt-6 text-balance font-normal text-gray-300">
                  {INTRO}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              {DEPLOYMENT_CARDS.map((card) => (
                <CardWithImage
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  imageSrc={card.imageSrc}
                  imageAlt={card.imageAlt}
                  layout="horizontal"
                  reverseHorizontal={card.reverseHorizontal}
                  learnMore={card.learnMore}
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
