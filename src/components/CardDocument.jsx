import Link from "@docusaurus/Link";
import React from "react";

const DEFAULT_PICTOGRAM = "/img/case-studies-cover.svg";

function isExternalUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

/**
 * Document-style card with pictogram, eyebrow, title, description, and optional CTA.
 *
 * Props:
 * - pictogram: string (URL) | ReactNode — when provided, replaces the default image
 * - eyebrow: string — uppercase label above the title
 * - title: string
 * - description: string | ReactNode
 * - showButton: boolean — whether to show the CTA
 * - buttonLabel: string
 * - onAction: () => void — when provided, renders a button with onClick
 * - href: string — when provided (and no onAction), renders a Link
 */
export default function CardDocument({
  pictogram,
  eyebrow,
  title,
  description,
  showButton = true,
  buttonLabel = "Get Case Study",
  onAction,
  href,
}) {
  const pictogramNode = pictogram ?? DEFAULT_PICTOGRAM;
  const pictogramEl =
    typeof pictogramNode === "string" ? (
      <img
        src={pictogramNode}
        alt=""
        className="h-auto w-32"
        loading="lazy"
        decoding="async"
      />
    ) : (
      <div className="h-auto w-32">{pictogramNode}</div>
    );

  const buttonEl =
    showButton && (onAction || href) ? (
      onAction ? (
        <button type="button" onClick={onAction} className="btnPrimary w-fit">
          {buttonLabel}
        </button>
      ) : isExternalUrl(href) ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="btnPrimary w-fit no-underline"
        >
          {buttonLabel}
        </a>
      ) : (
        <Link to={href} className="btnPrimary w-fit no-underline">
          {buttonLabel}
        </Link>
      )
    ) : null;

  return (
    <div className="card-document flex min-h-full flex-col rounded-[32px] border border-white/10 bg-[#111111] p-8 shadow-lg transition-all duration-1000 ease-in-out hover:border-[var(--ifm-color-primary)] hover:shadow-[0_12px_24px_color-mix(in_srgb,var(--ifm-color-primary)_30%,transparent)]">
      <div className="mb-4">{pictogramEl}</div>
      <p
        className="mb-3 text-base uppercase tracking-wider text-gray-400 sm:mb-5"
        style={{ fontWeight: "var(--ifm-font-weight-semibold)" }}
      >
        {eyebrow}
      </p>
      <h2
        className="mb-5 text-white sm:mb-8"
        style={{
          fontWeight: "var(--ifm-font-weight-base)",
          fontSize: "1.8rem",
        }}
      >
        {title}
      </h2>
      <div className="mb-6 flex-1 leading-relaxed text-gray-300">
        {typeof description === "string" ? <p>{description}</p> : description}
      </div>
      {buttonEl}
    </div>
  );
}
