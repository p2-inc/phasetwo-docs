import Link from "@docusaurus/Link";
import React from "react";

function isExternalUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

/**
 * Card matching the homepage "hosting bento" image-bottom layout.
 *
 * - Title: ReactNode
 * - TitleAs: "h4" | "h3" (optional; defaults to "h4")
 * - ReverseHorizontal: boolean (horizontal layout only; when true, image renders on the right)
 * - ImagePosition: "left" | "right" (horizontal layout only; overrides ReverseHorizontal)
 * - Description: ReactNode (rich formatting supported)
 * - Optional link: label + URL
 * - Optional image: src + alt
 *
 * Designed to be placed in a grid/flex container where siblings should be equal height.
 */
export default function CardWithImage({
  title,
  titleAs = "h4",
  description,
  linkLabel,
  linkUrl,
  imageSrc,
  imageAlt = "",
  layout = "imageBottom", // "imageBottom" | "horizontal"
  reverseHorizontal = false,
  imagePosition, // "right" | "left" (only applies to "horizontal")
  className = "",
  style,
}) {
  const external = isExternalUrl(linkUrl);
  const isHorizontal = layout === "horizontal";
  const rootStyle = {
    height: "100%",
    // 400px content + existing top/bottom padding (24px + 24px)
    ...(isHorizontal ? { minHeight: 448 } : {}),
    ...style,
  };
  const TitleTag = titleAs === "h3" ? "h3" : "h4";
  const isReversed =
    imagePosition === "right"
      ? true
      : imagePosition === "left"
        ? false
        : reverseHorizontal;
  const horizontalColsClass = isReversed
    ? "lg:grid-cols-[45%_55%]"
    : "lg:grid-cols-[55%_45%]";

  const contentEl = (
    <div
      className={[
        "hosting-bento-content",
        // Keep text first on mobile; swap on desktop when not reversed
        isReversed ? "lg:order-1" : "lg:order-2",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-full max-w-[460px] mx-auto">
        <TitleTag className="text-white mb-4">{title}</TitleTag>
        <div className="text-gray-300 hosting-bento-text">{description}</div>

        {linkLabel && linkUrl ? (
          external ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="hosting-bento-link"
            >
              {linkLabel}{" "}
              <span className="hosting-bento-link-arrow" aria-hidden="true">
                →
              </span>
            </a>
          ) : (
            <Link to={linkUrl} className="hosting-bento-link">
              {linkLabel}{" "}
              <span className="hosting-bento-link-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          )
        ) : null}
      </div>
    </div>
  );

  const imageEl = imageSrc ? (
    <div
      className={[
        "hosting-bento-image",
        "flex",
        "justify-center",
        isHorizontal ? "h-[400px] items-center" : "",
        // Keep image second on mobile; swap on desktop when not reversed
        // Center image horizontally within its column on desktop.
        isReversed
          ? "lg:order-2 lg:justify-center lg:pr-8"
          : "lg:order-1 lg:justify-center lg:pl-8",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className={[
          isHorizontal ? "h-full w-auto max-w-full object-contain" : "w-full h-auto",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  ) : null;

  return (
    <div
      className={[
        "hosting-bento-box",
        isHorizontal ? "" : "hosting-bento-box-image-bottom",
        className,
      ]
        .filter(Boolean)
        .join(" ")
        .trim()}
      style={rootStyle}
    >
      {isHorizontal ? (
        <div
          className={[
            "grid",
            "grid-cols-1",
            horizontalColsClass,
            "gap-8",
            "items-center",
            "h-full",
          ].join(" ")}
        >
          {contentEl}
          {imageEl}
        </div>
      ) : (
        <>
          <div className="hosting-bento-content">
            <TitleTag className="text-white mb-4">{title}</TitleTag>
            <div className="text-gray-300 hosting-bento-text">
              {description}
            </div>

            {linkLabel && linkUrl ? (
              external ? (
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hosting-bento-link"
                >
                  {linkLabel}{" "}
                  <span className="hosting-bento-link-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              ) : (
                <Link to={linkUrl} className="hosting-bento-link">
                  {linkLabel}{" "}
                  <span className="hosting-bento-link-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              )
            ) : null}
          </div>

          {imageSrc ? (
            <div className="hosting-bento-image hosting-bento-image-bottom">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="w-full h-auto mt-6"
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

