import React from "react";
import Layout from "@theme/Layout";
import { InlineIcon } from "@iconify/react";
import Link from "@docusaurus/Link";
import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";
import pageStyles from "../styles.module.css";
import supportStyles from "./styles.module.css";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-secondary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const MIGRATION_SUPPORT_CARDS = [
  {
    title: "User Migration",
    description:
      "Migrate your existing user base efficiently and without downtime using Phase Two's User Migration API. We automate user import by mapping values from your existing IAM's user endpoints to Keycloak.",
    imageSrc: "/img/user-migration.svg",
    imageAlt: "User migration diagram",
  },
  {
    title: "Identity Provider Connections",
    description:
      "Keycloak supports any IDP over SAML or OIDC—commercial, custom, or mixed environments. Phase Two's wizard workflow simplifies setup, and our Organizations extension automatically routes users to their correct IDP based on credentials.",
    imageSrc: "/img/identity-provider-connections.svg",
    imageAlt: "Identity provider connections diagram",
  },
  {
    title: "Authentication Flow Recreation",
    description:
      "Recreate any login flow with Keycloak's built-in support for MFA, OTP, Magic Link, WebAuthn, username/password, and custom authenticators. Phase Two's popular authentication extensions are included by default.",
    imageSrc: "/img/auth-flow-recreation.svg",
    imageAlt: "Authentication flow diagram",
  },
  {
    title: "API Integration",
    description:
      "Replace existing IAM APIs with analogous Keycloak endpoints. Your application's users won't notice the change—they'll just benefit from improved functionality.",
    imageSrc: "/img/api-integration.svg",
    imageAlt: "API integration diagram",
  },
  {
    title: "Organizations, Roles, and Permissions",
    description:
      "Maintain your existing role hierarchy with Phase Two's Organizations extension. Map users to IDPs and organization-specific roles without service disruption. Organization admins can self-manage through the bundled Admin Portal.",
    imageSrc: "/img/org-roles-permissions.svg",
    imageAlt: "Organizations and roles diagram",
  },
];

const IDP_LOGOS = [
  {
    href: "https://phasetwo.io/blog/keycloak-vs-auth0-open-source-alternative/",
    icon: "logos:auth0",
    src: "/customer-logos/auth0.svg",
    alt: "Auth0",
  },
  {
    href: "https://phasetwo.io/blog/keycloak-vs-okta-open-source-alternative/",
    icon: "logos:okta",
    src: "/customer-logos/okta.svg",
    alt: "Okta",
  },
  {
    href: "https://phasetwo.io/blog/keycloak-vs-PingIdentity-open-source-alternative/",
    icon: null,
    src: "/customer-logos/ping-identity.svg",
    alt: "Ping Identity",
  },
  {
    href: "https://phasetwo.io/blog/keycloak-vs-workos-open-source-alternative/",
    icon: "logos:workos",
    src: "/customer-logos/workos.svg",
    alt: "WorkOS",
  },
  {
    href: "https://phasetwo.io/blog/keycloak-vs-frontegg-open-source-alternative/",
    icon: null,
    src: "/customer-logos/frontegg.svg",
    alt: "Frontegg",
  },
  {
    href: "https://phasetwo.io/blog/keycloak-vs-onelogin-open-source-alternative/",
    icon: null,
    src: "/customer-logos/onelogin.svg",
    alt: "OneLogin",
  },
];

export default function MigrateToKeycloak() {
  return (
    <Layout
      title="Migrate to Phase Two + Keycloak"
      description="Phase Two provides Enterprise Support for system migrations to Phase Two + Keycloak."
    >
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-white text-balance">
                  Migrate to Keycloak Without the Downtime
                </h1>
                <p className="mt-6 text-gray-300 text--body-large text-balance mb-0">
                  Expert migration support from Auth0, Okta, Ping, WorkOS, FrontEgg, OneLogin, and any IAM system—with zero disruption to your users.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a href="mailto:sales@phasetwo.io">
                    <button className="btnPrimary btnSupport min-w-[160px]">
                      Get in Touch
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

        {/* Intro */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h4 className="mb-0 text-gray-300 font-normal text-balance">
                Phase Two can help migrate from any existing IAM system to Keycloak. Whether you need to migrate users, recreate authentication flows, reestablish endpoints, or customize functionality, we handle migrations of varying complexity while maintaining service continuity.
              </h4>
            </div>
          </div>
        </section>

        {/* Migrate to Keycloak from Other Identity Provider Systems - grid with logos */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">
                Migrate to Keycloak from Other Identity Provider Systems
              </h2>
            </div>
            <div className="mt-10 flex justify-center">
              <div className={`${pageStyles.engLogoGrid} ${supportStyles.idpLogoGrid}`} role="list">
                {IDP_LOGOS.map((logo) => (
                  <a
                    key={logo.alt}
                    href={logo.href}
                    target="_blank"
                    rel="noreferrer"
                    className={pageStyles.engLogoTile}
                    role="listitem"
                    title={logo.alt}
                  >
                    {logo.src ? (
                      <img
                        src={logo.src}
                        alt={logo.alt}
                        className={pageStyles.engLogoImg}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <InlineIcon
                        icon={logo.icon}
                        style={{ fontSize: "2.25rem" }}
                        aria-hidden="true"
                      />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Complete Support */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading">
              <h2 className="text-white">Complete Migration Support</h2>
            </div>
            <div className="mt-12 hosting-bento-grid">
              {MIGRATION_SUPPORT_CARDS.map((card) => (
                <CardWithImage
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  imageSrc={card.imageSrc}
                  imageAlt={card.imageAlt}
                  layout="imageBottom"
                />
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

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient-secondary"
          background="secondary"
          primaryText="Working With Your Team is Easy."
          secondaryText="Let Us Show You How."
          showCta
          ctaLabel="Get in Touch"
          ctaHref="mailto:support@phasetwo.io"
        />
      </main>
    </Layout>
  );
}
