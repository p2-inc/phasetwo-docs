import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import Cta from "../../components/ctas/homepage-dual-line-cta";
import { TwoColumnPoints } from "../../components/ExtensionPageLayout";

const PAGE_META = {
  title: "Keycloak Extensions",
  description:
    "Open source Keycloak extensions from Phase Two. Organizations, SSO setup wizards, magic links, webhooks, themes, user migration, and more.",
};

const HERO = {
  title: "Keycloak Extensions by Phase Two",
  description:
    "We build and maintain a suite of open source extensions that fill the most common gaps teams hit when shipping Keycloak in production — multi-tenancy, B2B SSO, webhooks, passwordless, theming, and migration.",
};

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const GROUPS = [
  {
    title: "B2B & Multi-tenant",
    intro:
      "Make Keycloak fit the way SaaS companies actually sell — per-customer organizations, customer-managed SSO, and a safe admin surface for end users.",
    extensions: [
      {
        heading: "Organizations",
        description:
          "First-class multi-tenant orgs with per-organization SSO, invitations, roles, and APIs. The foundation for B2B identity on Keycloak.",
        href: "/extensions/organizations",
      },
      {
        heading: "IdP Wizard",
        description:
          "A guided, self-serve flow that lets your customers configure their own SAML or OIDC identity provider without filing a ticket.",
        href: "/extensions/idp-wizard",
      },
      {
        heading: "Admin Portal",
        description:
          "An embeddable, scoped admin UI safe to expose to customer admins — so they manage their users and SSO without touching the Keycloak console.",
        href: "/extensions/admin-portal",
      },
    ],
  },
  {
    title: "Authentication",
    intro:
      "Login flows that customers expect in 2026 and that Keycloak doesn't ship out of the box.",
    extensions: [
      {
        heading: "Magic Link",
        description:
          "Email-link passwordless login plus API-triggered magic links for invitation and onboarding flows.",
        href: "/extensions/magic-link",
      },
      {
        heading: "Themes",
        description:
          "Modern, accessible, brandable login and account themes for Keycloak — production-ready out of the box.",
        href: "/extensions/themes",
      },
    ],
  },
  {
    title: "Operations",
    intro:
      "Run Keycloak the way you run the rest of your platform — observable, scriptable, deployable.",
    extensions: [
      {
        heading: "Events",
        description:
          "Webhooks and scriptable event handlers for Keycloak. Export audit events to your stack and trigger workflows on identity events.",
        href: "/extensions/events",
      },
      {
        heading: "User Migration",
        description:
          "Move users from a legacy IdP to Keycloak without forcing a password reset. Authenticate against the old system on first login, then migrate transparently.",
        href: "/extensions/user-migration",
      },
      {
        heading: "Containers",
        description:
          "Production-ready Keycloak container images with Phase Two extensions, opinionated defaults, and the build wiring you'd otherwise have to assemble yourself.",
        href: "/extensions/containers",
      },
    ],
  },
];

const WHY_OPEN_SOURCE = {
  eyebrow: "Why we open source these",
  title: "Paying it forward",
  intro:
    "Keycloak is the open source identity standard for a reason. The gaps that keep teams from running it in production are the same gaps, over and over — and we maintain the fixes in the open so the whole community benefits.",
  points: [
    {
      title: "The community benefits",
      description:
        "Rather than keep these fixes proprietary, we maintain them on GitHub so the entire Keycloak ecosystem can use, fork, and contribute to them.",
    },
    {
      title: "Self-hosted parity",
      description:
        "Teams running their own Keycloak can ship the same features we offer in our managed product — no second-class open source tier.",
    },
    {
      title: "Elastic License v2, developed in public",
      description: (
        <>
          Every extension on this page is licensed under the{" "}
          <a
            href="https://www.elastic.co/licensing/elastic-license"
            target="_blank"
            rel="noreferrer"
            className="link-primary"
          >
            Elastic License v2
          </a>{" "}
          and developed in public on GitHub. Issues, PRs, and roadmap are all out in the open — read the{" "}
          <a
            href="https://phasetwo.io/blog/licensing-change/"
            className="link-primary"
          >
            licensing change post
          </a>{" "}
          for context.
        </>
      ),
    },
  ],
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
      {intro ? <p className="mt-6 text-gray-300 subpage-section-intro mb-0">{intro}</p> : null}
    </div>
  );
}

function ExtensionCard({ heading, description, href }) {
  return (
    <Link
      to={href}
      className="hosting-bento-box h-full flex flex-col text-center no-underline hover:no-underline"
    >
      <h4 className="text-white mb-3">{heading}</h4>
      <p className="text-gray-300 hosting-bento-text mb-0 flex-grow">
        {description}
      </p>
      <span className="link-primary mt-6 inline-block">
        Learn more <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default function ExtensionsHub() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="p2-content py-24 sm:py-28">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-white text-balance">{HERO.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large text-balance mb-0">
                  {HERO.description}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a
                    href="https://github.com/p2-inc"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button className="btnPrimary min-w-[160px]">View on GitHub</button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Groups */}
        {GROUPS.map((group, idx) => {
          const count = group.extensions.length;
          const gridColsClass =
            count === 2
              ? "md:grid-cols-2 max-w-[var(--content-width-narrow)]"
              : count === 1
                ? "md:grid-cols-1 max-w-[var(--content-width-narrow)]"
                : "md:grid-cols-3 max-w-[var(--content-width-wide)]";
          return (
            <section
              key={group.title}
              className={`subpage-section ${idx % 2 === 1 ? "texture-plus" : ""}`}
            >
              <div className="p2-content">
                <SectionHeading title={group.title} intro={group.intro} />
                <div
                  className={`mx-auto mt-14 grid grid-cols-1 gap-6 ${gridColsClass}`}
                >
                  {group.extensions.map((ext) => (
                    <ExtensionCard key={ext.heading} {...ext} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Why open source */}
        <TwoColumnPoints
          eyebrow={WHY_OPEN_SOURCE.eyebrow}
          title={WHY_OPEN_SOURCE.title}
          intro={WHY_OPEN_SOURCE.intro}
          points={WHY_OPEN_SOURCE.points}
          sectionClassName="subpage-section"
        />

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
