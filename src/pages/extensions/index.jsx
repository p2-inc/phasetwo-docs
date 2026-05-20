import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import IconTile from "../../components/extensions/icons/IconTile";
import OrgIcon from "../../components/extensions/icons/OrgIcon";
import IdpWizardIcon from "../../components/extensions/icons/IdpWizardIcon";
import AdminPortalIcon from "../../components/extensions/icons/AdminPortalIcon";
import MagicLinkIcon from "../../components/extensions/icons/MagicLinkIcon";
import EventsIcon from "../../components/extensions/icons/EventsIcon";
import ThemesIcon from "../../components/extensions/icons/ThemesIcon";
import UserMigrationIcon from "../../components/extensions/icons/UserMigrationIcon";
import ContainersIcon from "../../components/extensions/icons/ContainersIcon";

import OrganizationsDiagram from "../../components/extensions/diagrams/OrganizationsDiagram";
import IdpWizardDiagram from "../../components/extensions/diagrams/IdpWizardDiagram";
import AdminPortalDiagram from "../../components/extensions/diagrams/AdminPortalDiagram";
import MagicLinkDiagram from "../../components/extensions/diagrams/MagicLinkDiagram";
import EventsDiagram from "../../components/extensions/diagrams/EventsDiagram";
import ThemesDiagram from "../../components/extensions/diagrams/ThemesDiagram";
import UserMigrationDiagram from "../../components/extensions/diagrams/UserMigrationDiagram";
import ContainersDiagram from "../../components/extensions/diagrams/ContainersDiagram";

import Cta from "../../components/ctas/homepage-dual-line-cta";

const PAGE_META = {
  title: "Keycloak Extensions by Phase Two",
  description:
    "Open source Keycloak extensions from Phase Two — organizations, IdP wizard, magic link, events & webhooks, themes, user migration, admin portal, and production containers.",
};

const EXTENSIONS = {
  organizations: {
    slug: "organizations",
    name: "Organizations",
    category: "B2B & Multi-tenant",
    summary:
      "Per-Organization SSO, invitations, roles, and APIs. The foundation for B2B identity on Keycloak.",
    Icon: OrgIcon,
    Diagram: OrganizationsDiagram,
  },
  "idp-wizard": {
    slug: "idp-wizard",
    name: "IdP Wizard",
    category: "B2B & Multi-tenant",
    summary:
      "A guided flow that lets your customers configure their own SAML or OIDC identity provider without filing a ticket.",
    Icon: IdpWizardIcon,
    Diagram: IdpWizardDiagram,
  },
  "admin-portal": {
    slug: "admin-portal",
    name: "Admin Portal",
    category: "B2B & Multi-tenant",
    summary:
      "An embeddable, scoped admin UI safe to expose to customer admins — they manage their users and SSO without the Keycloak console.",
    Icon: AdminPortalIcon,
    Diagram: AdminPortalDiagram,
  },
  "magic-link": {
    slug: "magic-link",
    name: "Magic Link",
    category: "Authentication",
    summary:
      "Email-link passwordless login plus API-triggered magic links for invitation and onboarding flows.",
    Icon: MagicLinkIcon,
    Diagram: MagicLinkDiagram,
  },
  themes: {
    slug: "themes",
    name: "Themes",
    category: "Authentication",
    summary:
      "Modern, accessible, brandable login and account themes for Keycloak — production-ready out of the box.",
    Icon: ThemesIcon,
    Diagram: ThemesDiagram,
  },
  events: {
    slug: "events",
    name: "Events & Webhooks",
    category: "Operations",
    summary:
      "Webhooks and scriptable event handlers. Export audit events to your stack and trigger workflows on identity events.",
    Icon: EventsIcon,
    Diagram: EventsDiagram,
  },
  "user-migration": {
    slug: "user-migration",
    name: "User Migration",
    category: "Operations",
    summary:
      "Move users from a legacy IdP without forcing a password reset. Authenticate against the old system on first login, then migrate transparently.",
    Icon: UserMigrationIcon,
    Diagram: UserMigrationDiagram,
  },
  containers: {
    slug: "containers",
    name: "Containers",
    category: "Operations",
    summary:
      "Production-ready container images with Phase Two extensions, opinionated defaults, and the build wiring you'd otherwise assemble yourself.",
    Icon: ContainersIcon,
    Diagram: ContainersDiagram,
  },
};

function BigTile({ ext }) {
  const { Icon, Diagram } = ext;
  return (
    <Link
      to={`/extensions/${ext.slug}`}
      className="hosting-bento-box ext-bento ext-bento--big no-underline hover:no-underline"
    >
      <div className="ext-bento-header">
        <IconTile size={56}>
          <Icon size={44} />
        </IconTile>
        <div>
          <div className="ext-mono-eyebrow">{ext.category}</div>
          <h3 className="text-white mt-1 mb-0">{ext.name}</h3>
        </div>
      </div>
      <p className="text-gray-300 mb-4">{ext.summary}</p>
      <div className="ext-bento-diagram">
        <Diagram />
      </div>
      <div className="ext-bento-cta">Learn more →</div>
    </Link>
  );
}

function MedTile({ ext }) {
  const { Icon, Diagram } = ext;
  return (
    <Link
      to={`/extensions/${ext.slug}`}
      className="hosting-bento-box ext-bento ext-bento--med no-underline hover:no-underline"
    >
      <div className="ext-bento-med-body">
        <div className="ext-bento-header">
          <IconTile size={44}>
            <Icon size={32} />
          </IconTile>
          <div>
            <div className="ext-mono-eyebrow">{ext.category.split(" ")[0]}</div>
            <h4 className="text-white mt-1 mb-0">{ext.name}</h4>
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-2 mt-3">{ext.summary}</p>
        <div className="ext-bento-cta ext-bento-cta--sm">Learn more →</div>
      </div>
      <div className="ext-bento-diagram ext-bento-diagram--sm">
        <Diagram />
      </div>
    </Link>
  );
}

export default function ExtensionsHub() {
  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <main className="hosting-page">
        {/* HERO */}
        <section className="subpage-section subpage-hero-section ext-hero">
          <div className="p2-content">
            <div className="mx-auto max-w-3xl text-center py-12">
              <div className="ext-eyebrow justify-center mb-5">
                <span className="ext-eyebrow-dot" /> The Extension Suite
              </div>
              <h1 className="text-white text-balance ext-hero-h1">
                Turn Keycloak into a complete{" "}
                <span style={{ color: "var(--ifm-color-primary)" }}>multi-tenant identity platform</span>.
              </h1>
              <p className="mt-6 text-gray-300 text--body-large text-balance mb-0">
                The extensions teams reach for when they ship Keycloak to real customers — per-tenant SSO,
                customer-managed identity, passwordless, webhooks, theming, and migration. All open source.
                All production-tested.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                  <button className="btnPrimary">Try the hosted version</button>
                </a>
                <a href="https://github.com/p2-inc" target="_blank" rel="noreferrer">
                  <button className="btnPrimary ext-btn-ghost">View on GitHub</button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO */}
        <section className="subpage-section">
          <div className="p2-content">
            <div className="ext-bento-grid">
              <BigTile ext={EXTENSIONS["organizations"]} />
              <MedTile ext={EXTENSIONS["idp-wizard"]} />
              <MedTile ext={EXTENSIONS["magic-link"]} />

              <MedTile ext={EXTENSIONS["admin-portal"]} />
              <BigTile ext={EXTENSIONS["events"]} />
              <MedTile ext={EXTENSIONS["themes"]} />

              <MedTile ext={EXTENSIONS["user-migration"]} />
              <MedTile ext={EXTENSIONS["containers"]} />
            </div>
          </div>
        </section>

        {/* WHY OPEN SOURCE */}
        <section className="subpage-section texture-plus">
          <div className="p2-content">
            <div className="mx-auto max-w-3xl text-center">
              <div className="ext-eyebrow justify-center mb-3">
                <span className="ext-eyebrow-dot" /> Open source by default
              </div>
              <h2 className="text-white text-balance">Built in public, run anywhere</h2>
              <p className="mt-5 text-gray-300 text--body-large mb-0">
                Every extension on this page lives on GitHub under the{" "}
                <a
                  href="https://www.elastic.co/licensing/elastic-license"
                  target="_blank"
                  rel="noreferrer"
                  className="link-primary"
                >
                  Elastic License v2
                </a>
                . Run them on your own Keycloak, fork them, or let us host the whole thing.
              </p>
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
