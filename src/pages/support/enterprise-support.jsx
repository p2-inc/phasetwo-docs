import React from "react";
import Layout from "@theme/Layout";
import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const COMMUNITY_CARDS = [
  {
    title: "Extension Authors",
    description: (
      <p className="mb-0">
        We&apos;ve built some of the most widely used Keycloak extensions in
        existence—Organizations, CockroachDB support, Redis caching, and more.
        Our code is running in thousands of production deployments.
      </p>
    ),
    imageSrc: "/img/extension-authors.svg",
    imageAlt: "Illustration representing Keycloak extension authors",
    reverseHorizontal: false,
  },
  {
    title: "Direct Access to Maintainers",
    description: (
      <p className="mb-0">
        We work directly with the Keycloak core maintainers. When we find bugs
        or need features addressed, we have the relationships to move things
        forward. Our customers benefit from that access directly—from UI fixes
        to extended authentication capabilities.
      </p>
    ),
    imageSrc: "/img/direct-access-to-maintainers.svg",
    imageAlt: "Illustration representing direct access to Keycloak maintainers",
    reverseHorizontal: true,
  },
];

const ENGAGE_CARDS = [
  {
    title: "Incident Response",
    imageSrc: "/img/incident-response.svg",
    imageAlt: "",
    body: (
      <p className="mb-0">
        Full outages, high-latency auth calls, cascading failures—we&apos;ve
        seen it and know how to resolve it fast. Most engagements also surface
        configuration improvements that reduce cost and prevent recurrence.
      </p>
    ),
  },
  {
    title: "Adopting Keycloak as Your Identity Solution",
    imageSrc: "/img/adopting-keycloak.svg",
    imageAlt: "",
    body: (
      <p className="mb-0">
        Keycloak is powerful and complex, with many valid implementation paths.
        We help teams choose and execute the right one for their architecture and
        requirements.
      </p>
    ),
  },
  {
    title: "Consolidating Multiple Identity Systems",
    imageSrc: "/img/consolidating-identity-systems.svg",
    imageAlt: "",
    body: (
      <p className="mb-0">
        Grown into multiple identity solutions? Keycloak consolidates them well.
        We handle user migration, authentication flow mapping, theme development,
        and everything in between.
      </p>
    ),
  },
  {
    title: "Migrating Off a Home-Grown Solution",
    imageSrc: "/img/migrating-off-home-grown-solution.svg",
    imageAlt: "",
    body: (
      <p className="mb-0">
        Custom identity systems are tightly coupled to their original application.
        Adapting them to Keycloak often requires custom extensions—we know how to
        build those and where the edge cases hide.
      </p>
    ),
  },
  {
    title: "Migrating Off a Commercial Provider",
    imageSrc: "/img/migrating-off-commerical-solution.svg",
    imageAlt: "",
    body: (
      <p className="mb-0">
        Commercial IdPs price against you as you grow. Keycloak is a proven
        alternative. We&apos;ve completed hundreds of migrations and know how to
        de-risk yours.
      </p>
    ),
  },
  {
    title: "Extending an Existing Keycloak Deployment",
    imageSrc: "/img/extending-existing-deployment.svg",
    imageAlt: "",
    body: (
      <p className="mb-0">
        Keycloak functions as an Identity Operating System—it can do a lot.
        We&apos;ll tell you honestly what&apos;s possible and how to get there,
        from custom auth flows to replacing the user storage provider entirely.
      </p>
    ),
  },
  {
    title: "Custom Extensions and Themes",
    body: (
      <p className="mb-0">
        Custom authenticators, fully replaced login experiences, or anything in
        between—we know exactly what each path requires and how to build it.
      </p>
    ),
  },
  {
    title: "Version Upgrades",
    body: (
      <p className="mb-0">
        Most self-hosted installations run one to two major versions behind.
        Getting current means navigating schema changes, downtime risk, and
        rollback planning. This is work we do well and often.
      </p>
    ),
  },
  {
    title: "Fully Managed On-Premise Deployment",
    body: (
      <p className="mb-0">
        We can own your on-premise Keycloak operations entirely—cloud or bare
        metal, any major provider. Infrastructure modernization, monitoring, CVE
        remediation, and version upgrades included.
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

export default function EnterpriseSupport() {
  return (
    <Layout
      title="Enterprise Support"
      description="Expert Keycloak support from Phase Two—contributors, extension authors, and the team behind large-scale production deployments."
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
                  Expert Keycloak Support, Built by the People Who Know It Best
                </h1>
                <p className="mb-0 mt-6 text-balance font-normal text-gray-300 text--body-large">
                  Phase Two&apos;s engineers are among the world&apos;s leading
                  Keycloak experts—contributors, extension authors, and the team
                  behind some of the largest Keycloak deployments in production.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Deep in the Keycloak Community</h2>
            </div>
            <div className="mt-14 flex flex-col gap-6">
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

        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">When to Engage Our Team</h2>
            </div>
            <div className="hosting-bento-grid mt-14">
              {ENGAGE_CARDS.map((card) =>
                card.imageSrc ? (
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
                ) : (
                  <div key={card.title} className="hosting-bento-box">
                    <div className="hosting-bento-content">
                      <h4 className="mb-4 text-white">{card.title}</h4>
                      <div className="hosting-bento-text text-gray-300">
                        {card.body}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

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
