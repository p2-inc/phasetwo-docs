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
  imagePosition = "right", // "right" | "left" (only applies to "horizontal")
  className = "",
  style,
}) {
  const external = isExternalUrl(linkUrl);
  const rootStyle = { height: "100%", ...style };
  const isHorizontal = layout === "horizontal";
  const TitleTag = titleAs === "h3" ? "h3" : "h4";
  const isImageLeft = imagePosition === "left";

  const contentEl = (
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
  );

  const imageEl = imageSrc ? (
    <div
      className={[
        "hosting-bento-image",
        "flex",
        "justify-center",
        isImageLeft ? "lg:justify-start" : "lg:justify-end",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="w-full max-w-[420px] h-auto"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
          {isImageLeft ? (
            <>
              {imageEl}
              {contentEl}
            </>
          ) : (
            <>
              {contentEl}
              {imageEl}
            </>
          )}
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

