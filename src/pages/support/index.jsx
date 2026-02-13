import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { InlineIcon } from "@iconify/react";
import CardWithIcon from "../../components/CardWithIcon";
import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";
import { KeycloakSupportPackages } from "../../components/keycloak-support-packages";
import supportStyles from "./styles.module.css";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const TOP_METRICS = [
  { value: "< 30 days", label: "average implementation time" },
  { value: "100+", label: "successful deployments" },
  { value: "Awesome", label: "customer satisfaction" },
];

const TOP_BENEFIT_IMAGES = [
  "/img/structured-project-process.svg",
  "/img/architecture-review-and-scaling.svg",
  "/img/migration-from-any-provider.svg",
];

const TOP_BENEFITS = [
  {
    title: "Structured Project Process",
    description: (
      <p>
        After hundreds of successful projects, we have a proven process for executing Keycloak implementations. You'll receive an Onboarding Kit and Project Plan with clear deliverables, ownership, and regular cadence meetings.
      </p>
    ),
    reverseHorizontal: false,
  },
  {
    title: "Architecture Review and Scaling",
    description: (
      <p>
        Avoid outages, trim costs, and scale your infrastructure to meet demand. We've configured systems handling 100K+ active users globally, including Kubernetes configurations and deployment strategies.
      </p>
    ),
    reverseHorizontal: true,
  },
  {
    title: "Migration from Any Provider",
    description: (
      <p>
        Migrate from Okta, Auth0, WorkOS, Cognito, or other providers with confidence. We support any Keycloak version, including RHBK, from initial testing through production launch.
      </p>
    ),
    reverseHorizontal: false,
  },
];

const SUPPORT_SERVICES = [
  {
    title: "Installation & Configuration",
    description:
      "Tailored setup to meet your specific needs, including managed testing clusters with Phase Two extensions and sample applications for rapid integration testing.",
    icon: "lucide:settings",
  },
  {
    title: "Health Assessment",
    description:
      "Assessment of your current infrastructure and implementation—cluster management, token usage, CLI configuration, upgrade paths, and ongoing periodic reviews.",
    icon: "lucide:git-branch",
  },
  {
    title: "Custom Development",
    description:
      "Custom login flows, authenticators, and full Keycloak extension development. Brand customization including styles, colors, logos, and CSS.",
    icon: "lucide:code-2",
  },
  {
    title: "SSO & IdP Onboarding",
    description:
      "Simplified identity provider configuration with our Connect wizards and dashboards. Domain associations, organization structures, and role management.",
    icon: "lucide:headphones",
  },
  {
    title: "Version Upgrades",
    description:
      "Upgrade support from legacy versions (even 10+ versions behind) to the latest release. Fast-follow upgrades with new major releases to keep you current.",
    icon: "lucide:graduation-cap",
  },
];

const FRAMEWORK_LINKS = [
  {
    label: "Next.js",
    href: "https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nextjs/",
    icon: "devicon:nextjs",
  },
  {
    label: "React",
    href: "https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-reactjs/",
    icon: "simple-icons:react",
  },
  { label: "Django", href: "https://phasetwo.io/blog/secure-django/", icon: "devicon-plain:django" },
  {
    label: "Spring Boot + Angular",
    href: "https://phasetwo.io/blog/secure-spring-boot/",
    icon: "simple-icons:spring",
  },
  {
    label: "Nuxt",
    href: "https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nuxt/",
    icon: "devicon-plain:nuxtjs",
  },
  { label: "Vue", href: "https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-vue/", icon: "ion:logo-vue" },
  {
    label: "Svelte",
    href: "https://phasetwo.io/blog/instant-user-management-and-sso-for-sveltekit/",
    icon: "simple-icons:svelte",
  },
  {
    label: "Remix",
    href: "https://phasetwo.io/blog/instant-user-management-and-sso-for-remix/",
    icon: "simple-icons:remix",
  },
];

export default function Support() {
  return (
    <Layout
      title="Enterprise Support for Keycloak"
      description="Phase Two provides Expert Keycloak Support without the enterprise price tag. We help with migration, configuration, and maintenance for hosted and on-prem deployments."
    >
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-white text-balance">
                  Enterprise Keycloak Support Without the Enterprise Price Tag
                </h1>
                <h4 className="mt-6 mb-0 text-gray-300 font-normal text-balance">
                  Migration, scaling, custom development, and 24/7 support for any Keycloak deployment—including RHBK. Get teams productive faster with experts who've completed hundreds of successful projects.
                </h4>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="mailto:sales@phasetwo.io">
                    <button className="btnPrimary btnSupport min-w-[160px]">
                      Let&apos;s talk
                    </button>
                  </a>
                  <Link to="/support/#experts" className="link-primary">
                    Show me pricing <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Metrics */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              {TOP_METRICS.map((metric) => (
                <div key={metric.label} className="px-6 py-8 text-center">
                  <div className="text-2xl font-semibold text-white md:text-3xl">
                    {metric.value}
                  </div>
                  <p className="mt-2 mb-0 text-gray-300 text-sm">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Benefits: Why Organizations Choose Phase Two Support */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">
                Why Organizations Choose Phase Two Support
              </h2>
            </div>
            <div className="mt-14 flex flex-col gap-12">
              {TOP_BENEFITS.map((benefit, idx) => (
                <CardWithImage
                  key={benefit.title}
                  title={benefit.title}
                  description={benefit.description}
                  imageSrc={TOP_BENEFIT_IMAGES[idx]}
                  imageAlt=""
                  layout="horizontal"
                  reverseHorizontal={benefit.reverseHorizontal}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Other Benefits: Complete Keycloak Support Services */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">
                Complete Keycloak Support Services
              </h2>
            </div>
            <div className="mt-14 hosting-bento-grid">
              {SUPPORT_SERVICES.map((service) => (
                <CardWithIcon
                  key={service.title}
                  heading={service.title}
                  description={service.description}
                  icon={<InlineIcon icon={service.icon} className="size-8" style={{ color: "var(--ifm-color-secondary)" }} aria-hidden="true" />}
                  layout="stacked"
                />
              ))}
            </div>

            {/* SSO Connections and Identity Provider (IdP) Onboarding */}
            <p className="mt-14 mb-6 text-center text-gray-300 text--body-large">
              SSO Connections and Identity Provider (IdP) Onboarding
            </p>
            <div className={supportStyles.frameworkGrid} role="list">
              {FRAMEWORK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={supportStyles.frameworkGridCol}
                  role="listitem"
                  title={link.label}
                >
                  <InlineIcon
                    icon={link.icon}
                    style={{ fontSize: "1.68rem", marginRight: "0.4rem" }}
                    aria-hidden="true"
                  />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Happy Customers */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h3 className="mb-0 text-gray-300 font-normal text-balance">
                Phase Two supports customers globally including Tier 1 CDNs, global transport companies, digital security providers, and digital signage platforms. Our customers have saved hundreds of thousands of dollars migrating to Keycloak while delivering better user experiences.
              </h3>
            </div>
          </div>
        </section>

        {/* Plans / Pricing Table */}
        <section id="experts" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Support Plans</h2>
            </div>
            <div className={`mt-10 ${supportStyles.supportPagePlansTable}`}>
              <KeycloakSupportPackages />
            </div>
          </div>
        </section>

        {/* CTA - secondary color */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient-secondary"
          background="secondary"
          primaryText="Working With Your Team is Easy."
          secondaryText="Let Us Show You How."
          showCta
          ctaLabel="See How"
          ctaHref="https://scheduler.zoom.us/phasetwo"
        />
      </main>
    </Layout>
  );
}
