import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { InlineIcon } from "@iconify/react";

import styles from "./styles.module.css";
import IconCheckMarkCircle from "@site/static/img/icon-check-mark-circle.svg";

import CardWithIcon from "../../components/CardWithIcon";
import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PLACEHOLDER_IMG = "/img/placeholder-keycloak.svg";

const HERO = {
  title: "Dedicated Clusters",
  description:
    "System capable of delivering exceptional performance for your authentication needs. Ease of use saves teams time and money for managing a complex system.",
  imageSrc: "/img/hero-dedicated-clusters.svg",
  primaryCtaLabel: "Try for Free",
  primaryCtaHref: "https://dash.phasetwo.io/",
  secondaryCtaLabel: "Learn more",
  secondaryCtaHref: "#built-by-experts",
};

const BUILT_BY_EXPERTS = {
  title: "Built by Keycloak Experts",
  intro:
    "Authors of the most popular keycloak extensions",
  cards: [
    {
      title: "",
      description:
        "Active community contributors",
    },
    {
      title: "",
      description:
        "Involved in some of the largest Keycloak distributions and installations",
    },
    {
      title: "",
      description:
        "This knowledge flows into how we run our hosting.",
    },
  ],
};

const ENHANCED_FEATURES = {
  title: "Enhanced Features that Focus on Application Use Cases",
  intro:
    "Our deployed image extends core (vanilla) Keycloak with common enterprise application use-cases. These are available to the community as well: link to image and extensions.",
  cards: [
    {
      title: "Multi-SSO Linking",
      description:
        "Enable users to to authenticate using multiple, distinct Identity Providers (IdPs), providing flexibility and easy of use.",
      imageSrc: "/img/multi-sso-linking.svg",
    },
    {
      title: "Self-Management",
      description:
        "Manage your identity across multiple apps without the limitations of connection counts. Self-serve using intuitive dashboards saves time.",
      imageSrc: "/img/self-manage.svg",
    },
    {
      title: "Something Else",
      description:
        "Put a description here",
      imageSrc: PLACEHOLDER_IMG,
    },
  ],
  learnMoreLabel: "Learn More",
  learnMoreHref: "/docs/self-service/dedicated-clusters",
};

const DRIVEN_BY_USAGE = {
  title: "Driven by Usage, Not User Counts",
  intro: "Focus on what's important, not on billing.",
  leftLead:
    "Many enterprise authentication solutions (including other managed Keycloak providers) focus on user counts. We focus on usage—active or concurrent user sessions—so pricing scales with real load, not total users.",
  cards: [
    {
      title: "",
      description:
        "Scale with confidence: your authentication infrastructure keeps pace as usage grows.",
      icon: "lucide:gauge",
    },
    {
      title: "",
      description:
        "Concurrent sessions are based on active tokens—driven by refresh lifespans, login behavior, and traffic patterns.",
      icon: "lucide:receipt",
    },
    {
      title: "",
      description:
        "Want help sizing? Talk to us about your use case and we’ll recommend the right fit.",
      icon: "lucide:trending-up",
    },
  ],
};

const DASH_MANAGEMENT = {
  title: "Dash-Based Cluster Management",
  intro:
    "Manage clusters, deployments, access, and operations from one place.",
  cards: [
    {
      title: "Access & roles",
      description: "Invite teammates and control permissions with organization roles.",
      icon: "lucide:users",
    },
    {
      title: "Custom domains",
      description: "Add a custom domain for a consistent, production-ready login experience.",
      icon: "lucide:globe",
    },
    {
      title: "Themes & extensions",
      description: "Upload and roll out themes and extensions with safe, repeatable workflows.",
      icon: "lucide:palette",
    },
    {
      title: "Configuration",
      description: "Apply environment variables and deployment settings without manual drift.",
      icon: "lucide:settings-2",
    },
    {
      title: "Billing & invoices",
      description: "View invoices and manage payment methods in the billing portal.",
      icon: "lucide:credit-card",
    },
  ],
};

const NO_LIMITS = {
  title: "No Limits as You Scale",
  intro:
    "Bring your whole team, support every customer identity provider, and grow without per-seat surprises.",
  cards: [
    {
      title: "Unlimited Team Members",
      description:
        "Get your whole team involved without managing individual licenses. Connect your SSO provider for easy login, and control access securely by assigning roles to team members.",
      imageSrc: "/img/unlimited-team-members.svg",
    },
    {
      title: "Unlimited SSO and Federated Logins",
      description:
        "Scale without surprise costs as you onboard new customers. Support thousands of SSO connections for the price of one, handle setup and save time.",
      imageSrc: "/img/unlimited-sso-logins.svg",
    },
  ],
};

const GLOBAL_DEPLOYMENT = {
  title: "Global Deployments",
  intro:
    "Deploy to any major region around the world.",
  headline:
    "Our clusters are set up to withstand failure and outage with multi-zone and multi-region configurations. Our approach with IaC means that even if something goes horribly wrong, we can get your system back within minutes.",
  imageSrc: "/img/global-deployments.svg",
};

const COMPLIANCE_HEADLINE = "SOC 2 Type 2 and ISO 27001 certified. GDPR compliant.";

const PAGE_CTA = {
  primaryText: "Ready to Try Dedicated Clusters?",
  secondaryText: "Create Your Dedicated Cluster Today.",
  ctaLabel: "Try for Free",
  ctaHref: "https://dash.phasetwo.io/",
};

function SectionHeading({ title, intro, align = "left", introClassName }) {
  return (
    <div className={align === "center" ? "text-center" : "subpage-section-heading"}>
      <h2 className="text-white">{title}</h2>
      {intro ? (
        <p
          className={[
            "mt-6",
            "text-gray-300",
            introClassName,
            align === "center" ? "subpage-section-intro mx-auto" : "subpage-section-intro",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  iconNode,
  variant = "default",
  layout = "horizontal",
}) {
  return (
    <CardWithIcon
      variant={variant}
      layout={layout}
      icon={
        iconNode ??
        (icon ? <InlineIcon icon={icon} className="size-8 text-sky-300" aria-hidden="true" /> : null)
      }
      iconAlt=""
      heading={title}
      description={description}
    />
  );
}

export default function DedicatedClusters() {
  return (
    <Layout
      title={HERO.title}
      description="Dedicated clusters provide isolated compute, network, and storage for high-performance Keycloak workloads—managed by Phase Two."
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
                    src={HERO.imageSrc}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h1 className="text-white">{HERO.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large">{HERO.description}</p>

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

        {/* Built by experts */}
        <section id="built-by-experts" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={BUILT_BY_EXPERTS.title} intro={BUILT_BY_EXPERTS.intro} />

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-6 md:grid-cols-3">
              {BUILT_BY_EXPERTS.cards.map((card, idx) => (
                <FeatureCard
                  key={card.title || idx}
                  title={card.title}
                  description={card.description}
                  iconNode={
                    <IconCheckMarkCircle
                      aria-hidden="true"
                      className="size-8 text-sky-300 [&_*]:stroke-current [&_*]:fill-none"
                    />
                  }
                  layout="stacked"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced features */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={ENHANCED_FEATURES.title} intro={ENHANCED_FEATURES.intro} />

            <div
              className={[
                "mx-auto mt-14 grid grid-cols-1 gap-6 md:grid-cols-3",
                styles.bentoWide,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {ENHANCED_FEATURES.cards.map((card) => (
                <CardWithImage
                  key={card.title}
                  title={card.title}
                  description={<p className="mb-0">{card.description}</p>}
                  imageSrc={card.imageSrc}
                  imageAlt=""
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link to={ENHANCED_FEATURES.learnMoreHref}>
                <button className="btnSecondary min-w-[160px]">{ENHANCED_FEATURES.learnMoreLabel}</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Driven by usage */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={DRIVEN_BY_USAGE.title} intro={DRIVEN_BY_USAGE.intro} />

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-10 lg:grid-cols-10 lg:gap-14">
              <div className="text-gray-300 lg:col-span-4">
                <p className="mb-6 text--body-large">{DRIVEN_BY_USAGE.leftLead}</p>
                <p className="mb-0">{DRIVEN_BY_USAGE.leftBody}</p>
              </div>

              <div className="flex flex-col gap-4 lg:col-span-6">
                {DRIVEN_BY_USAGE.cards.map((card, idx) => (
                  <FeatureCard
                    key={card.title || idx}
                    title={card.title}
                    description={card.description}
                    icon={card.icon}
                    layout="horizontal"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Dash-based management */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={DASH_MANAGEMENT.title} intro={DASH_MANAGEMENT.intro} />

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DASH_MANAGEMENT.cards.map((card, idx) => (
                <FeatureCard
                  key={card.title || idx}
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  layout="stacked"
                />
              ))}
            </div>
          </div>
        </section>

        {/* No limits */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={NO_LIMITS.title} intro={NO_LIMITS.intro} introClassName="text--body-large" />

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-narrow)] grid-cols-1 gap-6 lg:grid-cols-2">
              {NO_LIMITS.cards.map((card) => (
                <CardWithImage
                  key={card.title}
                  titleAs="h3"
                  title={card.title}
                  description={<p className="mb-0">{card.description}</p>}
                  imageSrc={card.imageSrc}
                  imageAlt=""
                />
              ))}
            </div>
          </div>
        </section>

        {/* Global deployment */}
        <section className={`subpage-section texture-plus ${styles.noBottomPadding}`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={GLOBAL_DEPLOYMENT.title} intro={GLOBAL_DEPLOYMENT.intro} />

            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              <h2 className="mt-16 mb-16 text-white text-center text-balance">
                {GLOBAL_DEPLOYMENT.headline}
              </h2>

              <div className="flex justify-center">
                <img
                  src={GLOBAL_DEPLOYMENT.imageSrc}
                  alt=""
                  className="w-full max-w-[920px] h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="mx-auto max-w-[640px] text-white text-center text-balance">
              {COMPLIANCE_HEADLINE}
            </h2>
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

