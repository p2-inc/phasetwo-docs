import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";
import CardWithIcon from "../../components/CardWithIcon";
import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";
import IconQuestionMarkCircle from "@site/static/img/icon-question-mark-circle.svg";

const HERO_IMG = "/img/hero-opensource-vs-commercial.svg";

export default function OpenSourceVsCommercialOffering() {
  return (
    <Layout
      title="Open Source vs Commercial Offering"
      description="Learn how open-source and commercial IAM offerings compare for Keycloak-based identity management."
    >
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
              <div className="mx-auto max-w-2xl text-center">
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO_IMG}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <h1 className="text-white">Open Source Power Without the Commercial Pricing Pain</h1>
                <p className="mt-6 text-gray-300 text--body-large">
                Keycloak delivers feature parity with commercial IAM solutions while giving you control over costs, deployment, and your data. Here's what that actually means for your organization.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">Try for Free</button>
                  </a>
                  <Link href="#tradeoffs" className="link-primary">
                    Learn more <span aria-hidden="true">→</span>
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
              <h3 className="mb-0 text-gray-300 font-normal text-balance">
                From a pure feature standpoint, Keycloak offers parity with virtually every commercial IAM offering on the market. Standards like OIDC, OAuth 2.0, and SAML aren't suggestions—they're specifications. Everyone should be implementing them the same way.
              </h3>
            </div>
          </div>
        </section>

        {/* Tradeoffs (no texture) */}
        <section id="tradeoffs" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">The Trade-offs: What Open Source Doesn't Hand You</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Keycloak is powerful, but power comes with complexity. Here's what you're signing up for if you go it alone.
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-[var(--content-width-narrow)]">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr items-stretch">
                {[
                  {
                    title: "Complexity & Learning Curve",
                    description:
                      "Extensive functionality means more configuration decisions and a steeper initial learning curve.",
                  },
                  {
                    title: "Admin Interface Polish",
                    description:
                      "The UI is functional but not elegant. Complex authentication workflows are genuinely difficult to design and navigate.",
                  },
                  {
                    title: "Documentation Gaps",
                    description:
                      "Finding specific APIs or configurations isn't always straightforward. Expect occasional source code diving.",
                  },
                ].map((card) => (
                  <CardWithIcon
                    key={card.title}
                    layout="stacked"
                    className="h-full"
                    icon={<IconQuestionMarkCircle aria-hidden="true" className="size-8 icon-stroke" />}
                    iconAlt=""
                    heading={card.title}
                    description={card.description}
                  />
                ))}
              </div>

              {/* Center last two cards */}
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:justify-center">
                {[
                  {
                    title: "Operational Overhead",
                    description:
                      "Upgrades, performance tuning, and configuration management require dedicated expertise and time.",
                  },
                  {
                    title: "Advanced Security Features",
                    description:
                      "Enhanced checks like geolocation-based restrictions require custom development or third-party extensions.",
                  },
                ].map((card) => (
                  <CardWithIcon
                    key={card.title}
                    layout="stacked"
                    className="w-full sm:max-w-[360px] h-full"
                    icon={<IconQuestionMarkCircle aria-hidden="true" className="size-8 icon-stroke" />}
                    iconAlt=""
                    heading={card.title}
                    description={card.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Keycloak anyway (with texture) */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-wide)] text-center">
              <h2 className="text-white">Why Organizations Choose Keycloak Anyway</h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Despite the challenges, Keycloak offers advantages that commercial solutions simply can't match—especially when long-term costs and control matter most.
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-[var(--content-width-wide)]">
              <CardWithImage
                layout="horizontal"
                imagePosition="left"
                titleAs="h3"
                title="Standards Compliance"
                description={
                  <div className="space-y-4">
                    <p className="mb-0">
                      Keycloak implements OIDC, OAuth 2.0, and SAML properly, enabling federation with any standards-compliant identity provider without vendor lock-in.
                    </p>
                    <div>
                      <Link to="/product/sso" className="hosting-bento-link">
                        Learn more{" "}
                        <span className="hosting-bento-link-arrow" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                }
                imageSrc="/img/standards-compliance.svg"
                imageAlt=""
              />
            </div>

            <div className="mx-auto mt-10 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Cost Control",
                  description:
                    "No per-user licensing. No surprise renewal increases. You control infrastructure costs directly, and scaling doesn't trigger budget panic.",
                  imageSrc: "/img/cost-control.svg",
                },
                {
                  title: "On-Premise Ownership",
                  description:
                    "Deploy wherever you need—on-premise, private cloud, air-gapped environments. Many commercial offerings price on-premise installations to punish you for not using their cloud.",
                  imageSrc: "/img/on-premise-ownership.svg",
                },
                {
                  title: "Performance at Scale",
                  description:
                    "Keycloak handles heavy application loads efficiently. Your performance is limited by your infrastructure, not artificial licensing tiers.",
                  imageSrc: "/img/performance-at-scale.svg",
                },
              ].map((card) => (
                <CardWithImage
                  key={card.title}
                  title={card.title}
                  description={<p className="mb-0">{card.description}</p>}
                  imageSrc={card.imageSrc}
                  imageAlt=""
                />
              ))}
            </div>

            <div className="mx-auto mt-16 max-w-[840px]">
              <h3 className="text-white text-center text-balance">
                A great open-source IAM shouldn&apos;t require commercial licensing to operate
                reliably—just the right approach.
              </h3>
            </div>
          </div>
        </section>

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText="Ready to Try Keycloak?"
          secondaryText="Create Your Free Deployment Today."
          showCta
          ctaLabel="Try for Free"
          ctaHref="https://dash.phasetwo.io/"
        />
      </main>
    </Layout>
  );
}
