import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";

import CardWithImage from "../../components/CardWithImage";
import Cta from "../../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "Enterprise SSO",
  description:
    "Enterprise SSO without connection limits. Add SAML and OIDC, support customer-managed identity providers, and keep costs predictable with Keycloak + Phase Two.",
};

const HERO = {
  title: "Enterprise SSO Without the Limitations",
  description:
    "Connect unlimited identity providers, route users intelligently by domain, and let customers self-administer their SSO—without per-connection pricing or vendor restrictions.",
  imageSrc: "/img/hero-sso.svg",
  primaryCtaLabel: "Try for Free",
  primaryCtaHref: "https://dash.phasetwo.io/",
  secondaryCtaLabel: "Learn more",
  secondaryCtaHref: "#scale",
};

const INTRO = {
  headline:
    "Phase Two enables your application to connect with unlimited identity providers simultaneously. Keycloak supports any standards-compliant identity provider and can federate to hundreds at the same time, giving your customers the SSO flexibility they expect without artificial limits.",
};

const SCALE = {
  title: "SSO That Scales With Your Business",
  intro:
    "Support any number of customer identity providers, route users cleanly by domain, and keep a consistent login experience as you grow.",
  featured: {
    title: "Unlimited Identity Provider Connections",
    description:
      "Connect to as many identity providers as your customers need—no per-connection fees, no artificial caps, no vendor restrictions.",
    imageSrc: "/img/unlimited-idp-connections.svg",
    linkLabel: "SSO setup guides",
    linkUrl: "/docs/sso/",
  },
  cards: [
    {
      title: "Smart Domain-Based Routing",
      description:
        "Automatically route users to their organization's specific IdP based on email domain. Simplify account management and prevent users from creating duplicate accounts with mapped domains.",
      imageSrc: "/img/smart-domain-based-routing.svg",
    },
    {
      title: "Multiple IdPs per Customer",
      description:
        "Support organizations that use multiple identity providers simultaneously. Don't force customers into single-provider limitations.",
      imageSrc: "/img/multiple-idps-per-customer.svg",
    },
    {
      title: "Standards‑Compliant Federation",
      description:
        "Integrate with any OIDC, SAML, or OAuth 2.0 compliant identity provider—from enterprise solutions to social login providers.",
      imageSrc: "/img/standards-compliant-federation.svg",
    },
  ],
};

const SELF_SERVICE = {
  title: "Let Your Customers Manage Their Own SSO",
  intro:
    "Offload setup effort by giving customer admins the tools they need—reducing support burden while improving adoption.",
  cards: [
    {
      title: "Identity Setup Wizard",
      description:
        "Customer IT admins can self-administer their own identity provider connections with zero IT input from your team.",
      imageSrc: "/img/idp-setup-wizard.svg",
    },
    {
      title: "Organization-Specific Configuration",
      description:
        "Provide a way to implement organization-specific identity providers, giving each customer control over their authentication requirements.",
      imageSrc: "/img/org-specific-configuration.svg",
    },
    {
      title: "Reduced Support Overhead",
      description:
        "Empower customers to configure and maintain their own SSO integrations without creating tickets or waiting for your team.",
      imageSrc: "/img/reduced-support.svg",
    },
  ],
};

const FAQS = [
  {
    q: "How does Single Sign-on (SSO) work?",
    a: (
      <p className="mb-0">
        Single Sign-On (SSO) allows a user to access multiple applications with one set of login credentials.
        When a user logs in to a primary system (Identity Provider or IdP), an authentication token is generated.
        This token is used to authenticate the user across other connected applications (Service Providers or SPs)
        without requiring additional logins. SSO improves security and user convenience by centralizing
        authentication and reducing the number of passwords users need to remember.
      </p>
    ),
  },
  {
    q: "What are the benefits of SSO?",
    a: (
      <ul className="list-disc pl-6 space-y-2 mb-0">
        <li>
          <b>User Convenience</b>: Fewer passwords to remember and manage.
        </li>
        <li>
          <b>Improved Security</b>: Centralized authentication with strong, complex passwords.
        </li>
        <li>
          <b>Administrative Efficiency</b>: Simplified user management and reduced help desk costs for password
          resets.
        </li>
        <li>
          <b>Consistent Experience</b>: Seamless access to multiple applications enhances productivity.
        </li>
      </ul>
    ),
  },
  {
    q: "What are some of the key components of SSO?",
    a: (
      <ul className="list-disc pl-6 space-y-2 mb-0">
        <li>
          <b>Identity Provider (IdP)</b>: The centralized system that handles authentication and issues tokens
          (e.g., Okta, Azure AD, Auth0).
        </li>
        <li>
          <b>Service Providers (SP)</b>: The applications or services that rely on the IdP for authentication
          (e.g., Gmail, Salesforce).
        </li>
        <li>
          <b>Authentication Protocols</b>: Standard protocols such as SAML (Security Assertion Markup Language),
          OAuth, and OpenID Connect facilitate secure token exchanges between the IdP and SPs.
        </li>
      </ul>
    ),
  },
  {
    q: "What is an SSO Authentication Token?",
    a: (
      <p className="mb-0">
        An SSO authentication token is a digital artifact issued by an Identity Provider (IdP) upon successful
        user authentication. This token serves as proof of the user’s identity and is used to grant access to
        multiple connected applications (Service Providers or SPs) without requiring the user to log in again.
        The token typically contains information about the user’s identity and permissions, and it is securely
        passed between the IdP and SPs to verify the user’s authentication status.
      </p>
    ),
  },
  {
    q: "What are the different types of Single Sign-On?",
    a: (
      <div className="space-y-4">
        <p className="mb-0">
          There are several types of Single Sign-On (SSO) solutions, each designed to meet different security
          and integration requirements. The main types include:
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-0">
          <li>Kerberos-Based SSO</li>
          <li>Security Assertion Markup Language (SAML)</li>
          <li>OAuth/OpenID Connect</li>
          <li>Lightweight Directory Access Protocol (LDAP)</li>
          <li>Central Authentication Service (CAS)</li>
        </ol>
      </div>
    ),
  },
  {
    q: "What is IDP initiated and SP initiated SSO?",
    a: (
      <div className="space-y-4">
        <p className="mb-0">
          <b>IDP-Initiated SSO</b> starts with the user logging in directly at the Identity Provider (IdP). After
          authentication, the IdP redirects the user to the Service Provider (SP) with an authentication token,
          granting access to the application.
        </p>
        <p className="mb-0">
          <b>SP-Initiated SSO</b> starts with the user attempting to access the Service Provider (SP) directly.
          The SP redirects the user to the Identity Provider (IdP) for authentication. After successful login,
          the IdP sends an authentication token back to the SP, which then grants access to the user.
        </p>
      </div>
    ),
  },
  {
    q: "How do I start using SSO with Phase Two?",
    a: (
      <p className="mb-0">
        Setting up SSO with Phase Two is simple and easy. Read our{" "}
        <Link to="/blog/sso-setup" className="link-primary">
          SSO article
        </Link>{" "}
        on how to set it up. With Phase Two you can create multiple SSO interactions, including a “landing
        page” filled with boxes of the various services a user can sign into.
      </p>
    ),
  },
  {
    q: "Does Keycloak support Single Logout (SLO)?",
    a: <p className="mb-0">Yes!</p>,
  },
];

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

export default function Sso() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
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

        {/* Intro */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h3 className="mb-0 text-gray-300 font-normal text-balance whitespace-pre-line">
                {INTRO.headline}
              </h3>
            </div>
          </div>
        </section>

        {/* Scale */}
        <section id="scale" className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={SCALE.title} intro={SCALE.intro} />

            <div className="mx-auto mt-14 max-w-[var(--content-width-wide)]">
              <CardWithImage
                layout="horizontal"
                imagePosition="left"
                titleAs="h3"
                title={SCALE.featured.title}
                description={<p className="mb-0">{SCALE.featured.description}</p>}
                imageSrc={SCALE.featured.imageSrc}
                imageAlt=""
                linkLabel={SCALE.featured.linkLabel}
                linkUrl={SCALE.featured.linkUrl}
              />

              <div className="mx-auto mt-6 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 md:grid-cols-3">
                {SCALE.cards.map((card) => (
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

        {/* Self service */}
        <section className="subpage-section texture-plus">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title={SELF_SERVICE.title} intro={SELF_SERVICE.intro} />

            <div className="mx-auto mt-14 grid max-w-[var(--content-width-wide)] grid-cols-1 gap-6 lg:grid-cols-3">
              {SELF_SERVICE.cards.map((card) => (
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
        </section>

        {/* FAQ */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading title="Frequently Asked Questions" intro="" />

            <div className="mx-auto mt-14 max-w-[var(--content-width-narrow)]">
              {FAQS.map((item) => (
                <div key={item.q} className="py-10 border-b border-white/10">
                  <h4 className="text-white mb-4">{item.q}</h4>
                  <div className="text-gray-300">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Predictable pricing note */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[840px]">
              <h3 className="text-white text-center text-balance">
                Predictable Pricing, Unlimited Connections: Unlike commercial vendors that charge per identity provider connection, Phase Two delivers a cost-effective solution that doesn't penalize you for customer growth or SSO adoption.
              </h3>
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
