import Link from "@docusaurus/Link";
import React from "react";

const DEFAULT_PICTOGRAM = "/img/case-studies-cover.svg";

function isExternalUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

/**
 * Document-style card with default pictogram, optional customer logo, eyebrow,
 * title, description, and optional CTA.
 *
 * Props:
 * - pictogram: string (URL) | ReactNode — optional secondary logo next to the default icon
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
  const logoEl =
    typeof pictogram === "string" ? (
      <img
        src={pictogram}
        alt=""
        className="h-auto max-h-12 w-auto max-w-[180px] object-contain"
        loading="lazy"
        decoding="async"
      />
    ) : pictogram ? (
      <div className="h-auto w-auto max-w-[180px]">{pictogram}</div>
    ) : null;

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
      <div className="mb-4 flex min-h-[56px] items-center gap-4">
        <img
          src={DEFAULT_PICTOGRAM}
          alt=""
          className="h-auto w-32 shrink-0"
          loading="lazy"
          decoding="async"
        />
        {logoEl ? <div className="flex items-center">{logoEl}</div> : null}
      </div>
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
