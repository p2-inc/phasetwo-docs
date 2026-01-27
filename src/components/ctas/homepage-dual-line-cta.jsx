import React from "react";

function isExternalHref(href) {
  return typeof href === "string" && /^https?:\/\//i.test(href);
}

/**
 * Homepage CTA section with two text weights (medium + light) and optional button.
 */
export default function Cta({
  background = "primary", // "primary" | "secondary"
  primaryText,
  secondaryText,
  showCta = true,
  ctaLabel,
  ctaHref,
  animateHeading = false,
  sectionClassName,
}) {
  const computedSectionClassName =
    background === "secondary"
      ? "homepage-section cta-section-gradient-secondary"
      : "homepage-section cta-section-gradient";
  const finalSectionClassName = sectionClassName || computedSectionClassName;

  const external = isExternalHref(ctaHref);
  const headingProps = animateHeading ? { "data-scroll-slide-in": true } : {};

  return (
    <section className={finalSectionClassName}>
      <div className="mx-auto max-w-7xl px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
        <h2
          className="cta-section-heading flex-1"
          {...headingProps}
        >
          <span className="font-medium">{primaryText}</span>{" "}
          <br />
          <span className="font-light">{secondaryText}</span>
        </h2>

        {showCta && (
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
            <a
              href={ctaHref}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
            >
              <button className="btnPrimary btnUltraLarge btnInverted">
                {ctaLabel}
              </button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

