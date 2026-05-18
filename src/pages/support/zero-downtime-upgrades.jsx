import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import CardLinks from "../../components/CardLinks";
import SupportCta from "../../components/ctas/support-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const IMG_PLAN_AND_EXECUTE = "/img/plan-and-execute.svg";
const IMG_MAINTAIN_SLA = "/img/maintain-sla.svg";
const IMG_CVE_REMEDIATION = "/img/cve-remediation-included.svg";

const FEATURE_CARDS = [
  {
    title: "Plan and Execute with Confidence",
    imageSrc: IMG_PLAN_AND_EXECUTE,
    imageAlt: "",
    body: (
      <p className="mb-0">
        We review your current installation, map a path through major versions,
        and handle testing, rollback preparation, and execution with minimal to
        no downtime—including for customers running heavy production loads who
        are multiple major versions behind.
      </p>
    ),
    learnMore: {
      label: "Architecture Review and Scaling",
      url: "/support/architecture-review-and-scaling",
    },
  },
  {
    title: "Maintain Your SLAs Throughout",
    imageSrc: IMG_MAINTAIN_SLA,
    imageAlt: "",
    body: (
      <p className="mb-0">
        Our upgrade process is designed to protect your SLAs and SLOs, keeping
        authentication available and performant throughout.
      </p>
    ),
  },
  {
    title: "CVE Remediation Included",
    imageSrc: IMG_CVE_REMEDIATION,
    imageAlt: "",
    body: (
      <p className="mb-0">
        Staying current with Keycloak releases and closing security
        vulnerabilities as they appear is included as standard for{" "}
        <Link to="/pricing/support" className="link-accent">
          managed customers
        </Link>
        .
      </p>
    ),
  },
];

const PAGE_CTA = {
  primaryText: "Working With Your Team is Easy.",
  secondaryText: "Let Us Show You How.",
  ctaLabel: "Get in Touch",
  ctaHref: "/contact",
};

export default function ZeroDowntimeUpgrades() {
  return (
    <Layout
      title="Zero-Downtime Upgrades"
      description="Zero-downtime Keycloak version upgrades from Phase Two—planning, SLA-safe execution, and CVE remediation for self-hosted and managed deployments."
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
                  Zero-Downtime Version Upgrades
                </h1>
                <p className="text--body-large mb-0 mt-6 text-balance font-normal text-gray-300">
                  Keeping Keycloak current is one of the most cited pain points
                  for self-hosting teams. Schema changes, downtime risk, and
                  rollback complexity make upgrades easy to defer—until they
                  become a{" "}
                  <Link to="/support/emergency-support" className="link-accent">
                    security or compliance problem
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
                    <CardLinks
                      learnMore={card.learnMore}
                      badges={card.badges}
                    />
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
