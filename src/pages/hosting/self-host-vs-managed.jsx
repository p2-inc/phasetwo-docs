import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";
import IconExpense from "@site/static/img/icon-expense.svg";
import CardWithImage from "../../components/CardWithImage";
import CardWithIcon from "../../components/CardWithIcon";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PLACEHOLDER_IMG = "/img/placeholder.svg";
const BENEFIT_IMAGES = [
  "/img/keycloak-configuration.svg",
  "/img/supercharged.svg",
  "/img/pro-active-customer-assistance.svg",
];

const costs = [
  {
    title: "",
    description:
      "Infrastructure to deploy, operate, and scale clusters reliably.",
  },
  {
    title: "",
    description:
      "Ongoing team effort to manage infrastructure and deployments.",
  },
  {
    title: "",
    description:
      "DevOps work to configure clustering, backups, and resilience.",
  },
  {
    title: "",
    description:
      "Engineering time to build, ship, and maintain custom images/CI.",
  },
  {
    title: "",
    description:
      "Security services, hardening, and audits to protect Keycloak.",
  },
  {
    title: "",
    description:
      "Processes for upgrades: Keycloak versions, themes, extensions.",
  },
];

const benefits = [
  {
    title: "Keycloak Configuration Knowledge",
    description: (
      <p>
        Lean on a team that lives and breathes Keycloak. We’ve seen the sharp
        edges—and we know the safe paths.
      </p>
    ),
  },
  {
    title: "Supercharged Non-Vanilla Keycloak",
    description: (
      <p>
        Managed Keycloak that ships with the extensions and best-practices you
        actually need in production—without the long “build it yourself” tail.
      </p>
    ),
  },
  {
    title: "Pro-active Customer Assistance",
    description: (
      <p>
        We help you avoid problems before they become incidents, and we’re here
        when you need support for changes, upgrades, or complex flows.
      </p>
    ),
  },
];

export default function SelfHostVsManaged() {
  return (
    <Layout
      title="Managed vs Self-Hosted"
      description="Compare self-hosting Keycloak vs managed hosting, and understand the costs and benefits."
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
                    src="/img/hero-managed-vs-self-hosted.svg"
                    alt="Managed vs Self-Hosted"
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h1 className="text-white">Managed vs Self-Hosted</h1>
                <p className="mt-6 text-gray-300 text--body-large">
                  Open-source does not mean you should run it yourself. Learn
                  the hidden costs of self-hosting Keycloak and why teams choose
                  Phase Two to operate it reliably at scale.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">
                      Try for Free
                    </button>
                  </a>
                  <Link href="#costs" className="link-primary">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Costs */}
        <section id="costs" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">
                Self-Hosting Costs More Than You Think
              </h2>
              <p className="mt-6 text-gray-300 subpage-section-intro">
                Various costs associated with running your own deployment include:
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-6 md:grid-cols-3">
              {costs.map((item, idx) => (
                <CardWithIcon
                  key={idx}
                  icon={<IconExpense aria-hidden="true" className="size-8 text-red-400" />}
                  iconAlt=""
                  description={item.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Phase Two Benefits */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="text-white text-balance text-center">
                Phase Two is a trusted partner when it comes to running Keycloak. What began as a Keycloak support business focused on keeping the largest Keycloak installations running is now a rock-solid hosting system for our customers.
              </h2>

              <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {benefits.map((b, idx) => (
                  <CardWithImage
                    key={b.title}
                    title={b.title}
                    titleAs="h3"
                    description={b.description}
                    imageSrc={BENEFIT_IMAGES[idx] ?? PLACEHOLDER_IMG}
                    imageAlt={b.title}
                    layout={idx === 0 ? "horizontal" : "imageBottom"}
                    className={idx === 0 ? "lg:col-span-2" : ""}
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
          primaryText="Ready to Try Keycloak?"
          secondaryText="Create Your Free Deployment Today."
          showCta={true}
          ctaLabel="Try for Free"
          ctaHref="https://dash.phasetwo.io/"
        />
      </main>
    </Layout>
  );
}
