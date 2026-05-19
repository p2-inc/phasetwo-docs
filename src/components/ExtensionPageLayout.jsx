import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import CardWithIcon from "./CardWithIcon";
import CardWithImage from "./CardWithImage";
import Cta from "./ctas/homepage-dual-line-cta";

const HERO_BG_STYLE = {
  backgroundImage:
    "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
  backgroundRepeat: "no-repeat",
};

const DEFAULT_CTA = {
  primaryText: "Ready to Try Keycloak?",
  secondaryText: "Create Your Free Deployment Today.",
  ctaLabel: "Try for Free",
  ctaHref: "https://dash.phasetwo.io/",
};

function CapabilityHorizontalCard({ card, imagePosition }) {
  return (
    <CardWithImage
      layout="horizontal"
      imagePosition={imagePosition}
      titleAs="h3"
      title={card.title}
      description={
        typeof card.description === "string" ? (
          <p className="mb-0">{card.description}</p>
        ) : (
          card.description
        )
      }
      imageSrc={card.imageSrc}
      imageAlt={card.imageAlt}
      linkLabel={card.linkLabel}
      linkUrl={card.linkUrl}
    />
  );
}

function CapabilityStackedCard({ card }) {
  return (
    <CardWithImage
      titleAs="h3"
      title={card.title}
      description={
        typeof card.description === "string" ? (
          <p className="mb-0">{card.description}</p>
        ) : (
          card.description
        )
      }
      imageSrc={card.imageSrc}
      imageAlt={card.imageAlt}
      linkLabel={card.linkLabel}
      linkUrl={card.linkUrl}
    />
  );
}

function CapabilitiesBento({ cards }) {
  const wrapperClass =
    "mx-auto mt-14 max-w-[var(--content-width-wide)]";

  if (cards.length === 1) {
    return (
      <div className={wrapperClass}>
        <CapabilityHorizontalCard card={cards[0]} imagePosition="right" />
      </div>
    );
  }

  if (cards.length === 2) {
    return (
      <div className={`${wrapperClass} space-y-6`}>
        {cards.map((card, idx) => (
          <CapabilityHorizontalCard
            key={card.title}
            card={card}
            imagePosition={
              card.imagePosition || (idx % 2 === 0 ? "right" : "left")
            }
          />
        ))}
      </div>
    );
  }

  // 3+ cards → featured horizontal + remaining in a stacked grid below
  const [featured, ...rest] = cards;
  const restGridCols =
    rest.length === 2
      ? "md:grid-cols-2"
      : rest.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={wrapperClass}>
      <CapabilityHorizontalCard
        card={featured}
        imagePosition={featured.imagePosition || "right"}
      />
      <div className={`mt-6 grid grid-cols-1 gap-6 ${restGridCols}`}>
        {rest.map((card) => (
          <CapabilityStackedCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}

function getStartedGridClass(count) {
  if (count === 2) return "md:grid-cols-2 max-w-[var(--content-width-narrow)]";
  if (count === 1) return "md:grid-cols-1 max-w-[var(--content-width-narrow)]";
  return "md:grid-cols-3 max-w-[var(--content-width-wide)]";
}

function capabilitiesGridClass(count) {
  if (count === 2) return "md:grid-cols-2 max-w-[var(--content-width-narrow)]";
  if (count === 1) return "md:grid-cols-1 max-w-[var(--content-width-narrow)]";
  return "md:grid-cols-3 max-w-[var(--content-width-wide)]";
}

export function TwoColumnPoints({
  eyebrow,
  title,
  intro,
  points,
  sectionClassName,
  accent = "primary",
}) {
  const accentColorVar =
    accent === "secondary"
      ? "var(--ifm-color-secondary)"
      : "var(--ifm-color-primary)";
  const accentTextColorVar =
    accent === "secondary"
      ? "var(--ifm-color-secondary-light)"
      : "var(--ifm-color-primary-light)";
  return (
    <section className={sectionClassName}>
      <div className="p2-content">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          <div>
            {eyebrow ? (
              <p
                className="mb-0 text-sm font-semibold uppercase tracking-wider"
                style={{ color: accentTextColorVar }}
              >
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-white text-balance mt-3">{title}</h2>
            ) : null}
            {intro ? (
              <p className="mt-6 text-gray-300 text--body-large mb-0">{intro}</p>
            ) : null}
          </div>
          {points && points.length ? (
            <ol className="list-none p-0 m-0 space-y-8">
              {points.map((point, idx) => (
                <li key={point.title || idx} className="flex gap-5">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accentColorVar} 20%, transparent)`,
                      color: accentTextColorVar,
                    }}
                    aria-hidden="true"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    {point.title ? (
                      <h3 className="text-white mb-2 text-xl">{point.title}</h3>
                    ) : null}
                    {point.description ? (
                      <p className="text-gray-300 mb-0">{point.description}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ title, intro }) {
  return (
    <div className="text-center">
      <h2 className="text-white">{title}</h2>
      {intro ? (
        <p className="mt-6 text-gray-300 subpage-section-intro mb-0">{intro}</p>
      ) : null}
    </div>
  );
}

/**
 * Shared layout for /extensions/<name> marketing pages.
 *
 * Sections in order:
 *  - hero (h1 + lede + primary/secondary CTA)
 *  - problem (keyword-rich paragraph naming the Keycloak gap)
 *  - whyBuilt (origin / differentiator narrative)
 *  - useCases (3-4 CardWithIcon cards)
 *  - capabilities (CardWithImage cards, optional images)
 *  - getStarted (3-link footer: GitHub / Docs / Hosted)
 *  - CTA
 */
export default function ExtensionPageLayout({
  meta,
  hero,
  problem,
  whyBuilt,
  useCases,
  capabilities,
  getStarted,
  pageCta = DEFAULT_CTA,
}) {
  return (
    <Layout title={meta.title} description={meta.description}>
      <main className="hosting-page">
        {/* Hero */}
        <section className="subpage-section subpage-hero-section">
          <div className="relative isolate overflow-hidden" style={HERO_BG_STYLE}>
            <div className="p2-content py-24 sm:py-28">
              <div className="mx-auto max-w-3xl text-center">
                {hero.imageSrc ? (
                  <div className="hero-box-image mb-6">
                    <img
                      src={hero.imageSrc}
                      alt=""
                      className="hero-box-image-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : null}
                <h1 className="text-white text-balance">{hero.title}</h1>
                <p className="mt-6 text-gray-300 text--body-large text-balance mb-0">
                  {hero.description}
                </p>
                {(hero.primaryCtaLabel || hero.secondaryCtaLabel) && (
                  <div className="mt-10 flex flex-col items-center justify-center gap-4">
                    {hero.primaryCtaLabel && hero.primaryCtaHref ? (
                      <a
                        href={hero.primaryCtaHref}
                        target={hero.primaryCtaHref.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        <button className="btnPrimary min-w-[160px]">
                          {hero.primaryCtaLabel}
                        </button>
                      </a>
                    ) : null}
                    {hero.secondaryCtaLabel && hero.secondaryCtaHref ? (
                      <Link href={hero.secondaryCtaHref} className="link-primary">
                        {hero.secondaryCtaLabel} <span aria-hidden="true">→</span>
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        {problem ? (
          <TwoColumnPoints
            eyebrow={problem.eyebrow || "The problem"}
            title={problem.title}
            intro={problem.intro}
            points={problem.points}
            sectionClassName="subpage-section"
            accent="secondary"
          />
        ) : null}

        {/* Why we built it */}
        {whyBuilt ? (
          <TwoColumnPoints
            eyebrow={whyBuilt.eyebrow || "Why we built it"}
            title={whyBuilt.title}
            intro={whyBuilt.intro}
            points={whyBuilt.points}
            sectionClassName="subpage-section texture-plus"
          />
        ) : null}

        {/* Use cases */}
        {useCases && useCases.cards?.length ? (
          <section className="subpage-section">
            <div className="p2-content">
              <SectionHeading
                title={useCases.title || "Use cases"}
                intro={useCases.intro}
              />
              <div className="mx-auto mt-14 max-w-[var(--content-width-wide)] grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {useCases.cards.map((card) => (
                  <CardWithIcon
                    key={card.heading}
                    heading={card.heading}
                    description={card.description}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Capabilities */}
        {capabilities && capabilities.cards?.length ? (
          <section className="subpage-section texture-plus">
            <div className="p2-content">
              <SectionHeading
                title={capabilities.title || "Key capabilities"}
                intro={capabilities.intro}
              />
              {capabilities.cards.some((c) => c.imageSrc) ? (
                <CapabilitiesBento cards={capabilities.cards} />
              ) : (
                <div
                  className={`mx-auto mt-14 grid grid-cols-1 gap-6 ${capabilitiesGridClass(capabilities.cards.length)}`}
                >
                  {capabilities.cards.map((card) => (
                    <CardWithIcon
                      key={card.title}
                      heading={card.title}
                      description={
                        typeof card.description === "string" ? (
                          <p className="mb-0">{card.description}</p>
                        ) : (
                          card.description
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {/* Get started */}
        {getStarted && getStarted.cards?.length ? (
          <section className="subpage-section">
            <div className="p2-content">
              <SectionHeading
                title={getStarted.title || "Get started"}
                intro={getStarted.intro}
              />
              <div
                className={`mx-auto mt-14 grid grid-cols-1 gap-6 ${getStartedGridClass(getStarted.cards.length)}`}
              >
                {getStarted.cards.map((card) => (
                  <CardWithIcon
                    key={card.heading}
                    heading={card.heading}
                    description={
                      <div className="flex flex-col items-center gap-4">
                        <p className="mb-0">{card.description}</p>
                        {card.linkLabel && card.linkUrl ? (
                          card.linkUrl.startsWith("http") ? (
                            <a
                              href={card.linkUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btnPrimary no-underline hover:no-underline mt-auto"
                            >
                              {card.linkLabel}
                            </a>
                          ) : (
                            <Link
                              to={card.linkUrl}
                              className="btnPrimary no-underline hover:no-underline mt-auto"
                            >
                              {card.linkLabel}
                            </Link>
                          )
                        ) : null}
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* CTA */}
        <Cta
          sectionClassName="subpage-section cta-section-gradient"
          background="primary"
          primaryText={pageCta.primaryText}
          secondaryText={pageCta.secondaryText}
          showCta
          ctaLabel={pageCta.ctaLabel}
          ctaHref={pageCta.ctaHref}
        />
      </main>
    </Layout>
  );
}
