import React from "react";
import Layout from "@theme/Layout";
import { InlineIcon } from "@iconify/react";

import CardWithIcon from "../../components/CardWithIcon";
import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";
import FrameworkTabs from "../../components/FrameworkTabs";

const PAGE_META = {
  title: "What are Keycloak and Phase Two",
  description:
    "Learn what Keycloak is, why enterprises choose it, and how Phase Two helps you run Keycloak in production.",
};

const HERO = {
  title: "Enterprise Identity Management Without the Enterprise Price Tag",
  description:
    "Keycloak delivers commercial-grade identity and access management with the flexibility of open source. Phase Two makes it production-ready.",
  imageSrc: "/img/hero-keycloak-and-phasetwo.svg",
};

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 30%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const WHAT_IS = {
  keycloak: {
    eyebrow: "What is KeyCloak",
    body:
      "Keycloak is an open-source identity and access management platform that rivals commercial offerings in functionality while providing unmatched extensibility. Built on industry standards including OIDC, OAuth 2.0, and SAML, Keycloak gives you enterprise-grade security without vendor lock-in.",
  },
  phasetwo: {
    eyebrow: "What is PhaseTwo",
    body:
      "Phase Two is a Keycloak specialist that handles the complexity of running production IAM infrastructure. Whether you need fully managed hosting or expert implementation support, we ensure your Keycloak deployment is secure, scalable, and tailored to your needs.",
  },
};

const WHAT_IS_BG_STYLE = {
  backgroundImage:
    "radial-gradient(55% 95% at 50% 100%, color-mix(in srgb, var(--ifm-color-primary) 28%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const WHY_KEYCLOAK = {
  title: "Why Leading Organizations Choose Keycloak",
  intro:
    "Keycloak delivers the security, flexibility, and control that modern enterprises demand—without the complexity or cost of proprietary solutions.",
  featured: {
    title: "Standards Based Security",
    description:
      "Built on OIDC, OAuth 2.0, and SAML protocols for seamless integration with modern applications and legacy systems.",
    imageSrc: "/img/standards-based-security.svg",
  },
  cards: [
    {
      title: "Unlimited Scalability",
      description:
        "Configure unlimited SSO connections, user federations, and authentication flows without licensing restrictions.",
      imageSrc: "/img/unlimited-scalability.svg",
    },
    {
      title: "Complete Customization",
      description:
        "Extend and customize every aspect—from authentication flows to UI themes—to match your exact requirements.",
      imageSrc: "/img/complete-customization.svg",
    },
    {
      title: "Deployment Flexibility",
      description:
        "Run on-premise, in your cloud, or let Phase Two manage it. Your infrastructure, your choice.",
      imageSrc: "/img/deployment-flexibility.svg",
    },
  ],
};

const ENTERPRISE_NEEDS = {
  title: "Everything You Need for Enterprise Identity Management",
  intro:
    "From authentication to user federation, Keycloak provides a comprehensive IAM platform that adapts to your infrastructure—not the other way around.",
  tabs: ["Auth & Access", "User & Federation", "Developers", "Enterprise"],
  panels: {
    auth: [
      {
        icon: "lucide:key",
        description: "Single Sign-On (SSO) with unlimited application configurations",
      },
      {
        icon: "lucide:users",
        description: "Multi-factor authentication (MFA) and passwordless login with passkeys",
      },
      {
        icon: "lucide:git-branch",
        description: "Custom authentication flows with visual flow builder",
      },
      {
        icon: "lucide:shield-check",
        description: "Fine-grained authorization policies",
      },
    ],
    federation: [
      {
        icon: "lucide:building-2",
        description: "LDAP and Active Directory integration",
      },
      {
        icon: "lucide:database",
        description: "Custom user database federation",
      },
      {
        icon: "lucide:log-in",
        description: "Organization-specific identity provider login",
      },
      {
        icon: "lucide:layout-dashboard",
        description: "Centralized user administration console",
      },
    ],
    developers: [
      {
        icon: "lucide:server",
        description: "Comprehensive REST API for application integration",
      },
      {
        icon: "lucide:badge-check",
        description: "Standards-based protocols (OIDC, OAuth 2.0, SAML)",
      },
      {
        icon: "lucide:code",
        description: "Extensive SDK support across languages",
      },
      {
        icon: "lucide:webhook",
        description: "Webhook and event system for custom integrations",
      },
    ],
    enterprise: [
      {
        icon: "lucide:gauge",
        description: "High-performance architecture for demanding workloads",
      },
      {
        icon: "lucide:cloud",
        description: "On-premise and cloud deployment options",
      },
      {
        icon: "lucide:monitor",
        description: "Professional admin console",
      },
      {
        icon: "lucide:plug",
        description: "Extensible plugin architecture for custom requirements",
      },
    ],
  },
};

const PAGE_CTA = {
  primaryText: "Ready to Try Keycloak?",
  secondaryText: "Create Your Free Deployment Today.",
  ctaLabel: "Try for Free",
  ctaHref: "https://dash.phasetwo.io/",
};

function SectionHeading({ title, intro, align = "center" }) {
  return (
    <div className={align === "center" ? "text-center" : "subpage-section-heading"}>
      <h2 className="text-white">{title}</h2>
      {intro ? <p className="mt-6 text-gray-300 subpage-section-intro">{intro}</p> : null}
    </div>
  );
}

function MiniFeatureCard({ icon, description }) {
  return (
    <CardWithIcon
      variant="default"
      layout="stacked"
      icon={<InlineIcon icon={icon} className="size-6 text-sky-300" aria-hidden="true" />}
      iconAlt=""
      heading=""
      description={<p className="mb-0 text-sm leading-snug">{description}</p>}
      className="text-center"
    />
  );
}

export default function KeycloakAndPhaseTwo() {
  const [enterpriseNeedsTab, setEnterpriseNeedsTab] = React.useState(0);

  return (
    <Layout
      title={PAGE_META.title}
      description={PAGE_META.description}
    >
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="hero-box-image mb-6">
                  <img
                    src={HERO.imageSrc}
                    alt=""
                    className="hero-box-image-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h1 className="text-white text-balance">{HERO.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large whitespace-pre-line mb-0">
                  {HERO.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What is Keycloak / Phase Two */}
        <section
          className="subpage-section relative isolate overflow-hidden"
          style={WHAT_IS_BG_STYLE}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-wide)]">
              <div className="grid grid-cols-1 gap-y-14 lg:grid-cols-[220px_1fr] lg:gap-x-16 lg:gap-y-20">
                <p className="text-gray-300 mb-0">{WHAT_IS.keycloak.eyebrow}</p>
                <h3 className="text-white m-0 text-balance">{WHAT_IS.keycloak.body}</h3>

                <p className="text-gray-300 mb-0">{WHAT_IS.phasetwo.eyebrow}</p>
                <h3 className="text-white m-0 text-balance">{WHAT_IS.phasetwo.body}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Why Keycloak */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={WHY_KEYCLOAK.title} intro={WHY_KEYCLOAK.intro} />

            <div className="mx-auto mt-14 max-w-[var(--content-width-wide)]">
              <CardWithImage
                layout="horizontal"
                imagePosition="left"
                titleAs="h3"
                title={WHY_KEYCLOAK.featured.title}
                description={<p className="mb-0">{WHY_KEYCLOAK.featured.description}</p>}
                imageSrc={WHY_KEYCLOAK.featured.imageSrc}
                imageAlt=""
              />

              <div className="mx-auto mt-6 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 md:grid-cols-3">
                {WHY_KEYCLOAK.cards.map((card) => (
                  <CardWithImage
                    key={card.title}
                    title={card.title}
                    description={<p className="mb-0">{card.description}</p>}
                    imageSrc={card.imageSrc}
                    imageAlt=""
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Everything you need */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={ENTERPRISE_NEEDS.title} intro={ENTERPRISE_NEEDS.intro} />

            <div className="mt-10">
              <FrameworkTabs
                tabs={ENTERPRISE_NEEDS.tabs.map((label) => ({ key: label, label }))}
                activeIndex={enterpriseNeedsTab}
                onChange={setEnterpriseNeedsTab}
                contentMinHeight={0}
                stableHeight
                panels={[
                  <div key="auth" className="framework-tab-panel">
                    <div className="mx-auto mt-10 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {ENTERPRISE_NEEDS.panels.auth.map((card, idx) => (
                        <MiniFeatureCard key={idx} icon={card.icon} description={card.description} />
                      ))}
                    </div>
                  </div>,
                  <div key="federation" className="framework-tab-panel">
                    <div className="mx-auto mt-10 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {ENTERPRISE_NEEDS.panels.federation.map((card, idx) => (
                        <MiniFeatureCard key={idx} icon={card.icon} description={card.description} />
                      ))}
                    </div>
                  </div>,
                  <div key="developers" className="framework-tab-panel">
                    <div className="mx-auto mt-10 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {ENTERPRISE_NEEDS.panels.developers.map((card, idx) => (
                        <MiniFeatureCard key={idx} icon={card.icon} description={card.description} />
                      ))}
                    </div>
                  </div>,
                  <div key="enterprise" className="framework-tab-panel">
                    <div className="mx-auto mt-10 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      {ENTERPRISE_NEEDS.panels.enterprise.map((card, idx) => (
                        <MiniFeatureCard key={idx} icon={card.icon} description={card.description} />
                      ))}
                    </div>
                  </div>,
                ]}
              />
            </div>
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

