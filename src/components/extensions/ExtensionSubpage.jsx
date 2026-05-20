import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Cta from "../ctas/homepage-dual-line-cta";
import IconTile from "./icons/IconTile";

import OrgIcon from "./icons/OrgIcon";
import IdpWizardIcon from "./icons/IdpWizardIcon";
import AdminPortalIcon from "./icons/AdminPortalIcon";
import MagicLinkIcon from "./icons/MagicLinkIcon";
import EventsIcon from "./icons/EventsIcon";
import ThemesIcon from "./icons/ThemesIcon";
import UserMigrationIcon from "./icons/UserMigrationIcon";
import ContainersIcon from "./icons/ContainersIcon";

import OrganizationsDiagram from "./diagrams/OrganizationsDiagram";
import IdpWizardDiagram from "./diagrams/IdpWizardDiagram";
import AdminPortalDiagram from "./diagrams/AdminPortalDiagram";
import MagicLinkDiagram from "./diagrams/MagicLinkDiagram";
import EventsDiagram from "./diagrams/EventsDiagram";
import ThemesDiagram from "./diagrams/ThemesDiagram";
import UserMigrationDiagram from "./diagrams/UserMigrationDiagram";
import ContainersDiagram from "./diagrams/ContainersDiagram";

const ICONS = {
  organizations: OrgIcon,
  "idp-wizard": IdpWizardIcon,
  "admin-portal": AdminPortalIcon,
  "magic-link": MagicLinkIcon,
  events: EventsIcon,
  themes: ThemesIcon,
  "user-migration": UserMigrationIcon,
  containers: ContainersIcon,
};

const DIAGRAMS = {
  organizations: OrganizationsDiagram,
  "idp-wizard": IdpWizardDiagram,
  "admin-portal": AdminPortalDiagram,
  "magic-link": MagicLinkDiagram,
  events: EventsDiagram,
  themes: ThemesDiagram,
  "user-migration": UserMigrationDiagram,
  containers: ContainersDiagram,
};

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function ExtensionSubpage({ content }) {
  const Icon = ICONS[content.iconKey];
  const Diagram = DIAGRAMS[content.diagramKey];
  const repoUrl = `https://github.com/${content.repo}`;
  const docsHref = content.docsHref || `${repoUrl}#readme`;
  const docsExternal = /^https?:\/\//.test(docsHref);

  return (
    <Layout title={content.meta.title} description={content.meta.description}>
      <main className="hosting-page">
        {/* HERO */}
        <section className="subpage-section subpage-hero-section ext-hero">
          <div className="p2-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-10">
              <div>
                <div className="ext-eyebrow mb-5">
                  <span className="ext-eyebrow-dot" />
                  {content.category}
                </div>
                <h1 className="text-white text-balance ext-hero-h1">{content.hero.h1}</h1>
                <p className="mt-5 text-gray-300 text--body-large mb-0">{content.hero.lead}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                    <button className="btnPrimary">Try the hosted version</button>
                  </a>
                  <a href={repoUrl} target="_blank" rel="noreferrer">
                    <button className="btnPrimary ext-btn-ghost">View on GitHub</button>
                  </a>
                </div>
                {content.hero.badges?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {content.hero.badges.map((b, i) => (
                      <span key={i} className="ext-tag">{b}</span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="ext-diagram-card">
                <div className="ext-diagram-card-header">
                  {Icon ? (
                    <IconTile size={36}>
                      <Icon size={24} />
                    </IconTile>
                  ) : null}
                  <div className="ext-mono-eyebrow">{content.name} · architecture</div>
                </div>
                {Diagram ? <Diagram /> : null}
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="subpage-section">
          <div className="p2-content">
            <div className="subpage-section-heading text-center">
              <div className="ext-mono-eyebrow ext-mono-eyebrow--danger">The problem</div>
              <h2 className="text-white text-balance mt-3">{content.problem.heading}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
              {content.problem.cards.map((c, i) => (
                <div key={i} className="hosting-bento-box ext-card">
                  <div className="ext-mono-eyebrow ext-mono-eyebrow--danger">Pain {i + 1}</div>
                  <h4 className="text-white mt-3 mb-2">{c.title}</h4>
                  <p className="text-gray-300 mb-0">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* APPROACH */}
        <section className="subpage-section texture-plus">
          <div className="p2-content">
            <div className="subpage-section-heading text-center">
              <div className="ext-mono-eyebrow ext-mono-eyebrow--brand">Our approach</div>
              <h2 className="text-white text-balance mt-3">{content.approach.heading}</h2>
              {content.approach.intro ? (
                <p className="mt-4 text-gray-300 subpage-section-intro mb-0">{content.approach.intro}</p>
              ) : null}
            </div>
            <div
              className="grid grid-cols-1 gap-5 mt-10"
              style={{
                gridTemplateColumns: `repeat(${Math.min(content.approach.cards.length, 4)}, minmax(0, 1fr))`,
              }}
            >
              {content.approach.cards.map((c, i) => (
                <div key={i} className="hosting-bento-box ext-card">
                  <div className="ext-step-num">{String(i + 1).padStart(2, "0")}</div>
                  <h4 className="text-white mt-3 mb-2">{c.title}</h4>
                  <p className="text-gray-300 mb-0 text-sm">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="subpage-section">
          <div className="p2-content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-1">
                <div className="ext-mono-eyebrow ext-mono-eyebrow--brand">What teams use it for</div>
                <h2 className="text-white mt-3 mb-4">{content.useCases.heading}</h2>
                {content.useCases.intro ? (
                  <p className="text-gray-300 mb-0">{content.useCases.intro}</p>
                ) : null}
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {content.useCases.items.map((u, i) => (
                  <div key={i} className="ext-usecase">
                    <div className="ext-usecase-num">{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <div className="text-white font-semibold mb-1">{u.title}</div>
                      <div className="ext-text-dim text-sm">{u.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="subpage-section">
          <div className="p2-content">
            <div className="subpage-section-heading text-center">
              <div className="ext-mono-eyebrow ext-mono-eyebrow--brand">Key capabilities</div>
              <h2 className="text-white text-balance mt-3">{content.capabilities.heading}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-10">
              {content.capabilities.items.map((c, i) => (
                <div key={i} className="hosting-bento-box ext-card ext-card--tight">
                  <div className="ext-check-tile">
                    <CheckIcon />
                  </div>
                  <h4 className="text-white text-base mt-3 mb-1.5">{c.title}</h4>
                  <p className="text-gray-300 mb-0 text-sm">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GET STARTED */}
        <section className="subpage-section texture-plus">
          <div className="p2-content">
            <div className="subpage-section-heading text-center">
              <div className="ext-eyebrow mb-3 justify-center">
                <span className="ext-eyebrow-dot" />
                Get started
              </div>
              <h2 className="text-white text-balance">Three ways to ship {content.name}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
              {[
                {
                  tag: "Self-host",
                  title: "Run it yourself",
                  body: "Pull the JAR or pre-built container into your Keycloak deployment.",
                  cta: "View on GitHub",
                  href: repoUrl,
                  external: true,
                },
                {
                  tag: "Docs",
                  title: "Read the guides",
                  body: "Install steps, configuration, API reference, and migration notes.",
                  cta: "Open docs",
                  href: docsHref,
                  external: docsExternal,
                },
                {
                  tag: "Hosted",
                  title: "Let us run it",
                  body: "Try the hosted Phase Two — all extensions installed and configured.",
                  cta: "Start free trial",
                  href: "https://dash.phasetwo.io/",
                  external: true,
                  primary: true,
                },
              ].map((p, i) => (
                <div key={i} className="hosting-bento-box ext-card">
                  <div className="ext-mono-eyebrow ext-mono-eyebrow--brand">{p.tag}</div>
                  <h3 className="text-white mt-3 mb-2">{p.title}</h3>
                  <p className="text-gray-300 mb-5">{p.body}</p>
                  {p.external ? (
                    <a href={p.href} target="_blank" rel="noreferrer" className="self-start no-underline">
                      <button className={p.primary ? "btnPrimary" : "btnPrimary ext-btn-ghost"}>{p.cta}</button>
                    </a>
                  ) : (
                    <Link to={p.href} className="self-start no-underline">
                      <button className={p.primary ? "btnPrimary" : "btnPrimary ext-btn-ghost"}>{p.cta}</button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

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
