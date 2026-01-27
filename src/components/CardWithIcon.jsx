import React from "react";

function renderIcon(icon, { width, alt, className }) {
  if (!icon) return null;

  // Docusaurus SVGR imports yield a React component.
  if (typeof icon === "function") {
    const Icon = icon;
    return (
      <Icon
        aria-hidden={alt ? undefined : true}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={[className, "[&_*]:fill-current"].filter(Boolean).join(" ")}
        style={{ width, height: "auto" }}
      />
    );
  }

  // Fallback for string/URL icons.
  if (typeof icon === "string") {
    return (
      <img
        src={icon}
        alt={alt}
        className={className}
        style={{ width, height: "auto" }}
        loading="lazy"
      />
    );
  }

  // If a React node is passed, render as-is.
  return icon;
}

/**
 * Simple icon + body text card.
 *
 * Designed to be placed in a grid/flex container where siblings should be equal height.
 */
export default function CardWithIcon({
  icon,
  iconAlt = "",
  iconWidth = 24,
  description,
  heading,
  layout = "stacked", // "stacked" | "horizontal"
  variant = "default", // "default" | "light"
  className = "",
  style,
}) {
  const isHorizontal = layout === "horizontal";
  const isLight = variant === "light";
  const rootStyle = { height: "100%", ...style };
  const rootPadLeft = isLight ? 16 : 32; // px-4 vs hosting-bento-box padding-left
  const textStartFromCardLeft = 90;
  const textPadLeft = Math.max(0, textStartFromCardLeft - rootPadLeft);
  const iconLeft = Math.max(0, 32 - rootPadLeft); // target: 32px from card left edge

  const rootClassName = (
    isLight
      ? [
          "h-full",
          "flex",
          "flex-col",
          "rounded-[24px]",
          "border-0",
          "bg-transparent",
          "px-4",
          "py-0",
          className,
        ]
      : ["hosting-bento-box", "h-full", className]
  )
    .filter(Boolean)
    .join(" ")
    .trim();

  const iconNode = icon ? (
    isLight ? (
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[#0f0f0f] text-p2blue-500">
        {renderIcon(icon, {
          width: iconWidth,
          alt: iconAlt,
          className: "block",
        })}
      </div>
    ) : (
      renderIcon(icon, { width: iconWidth, alt: iconAlt })
    )
  ) : null;

  return (
    <div
      className={rootClassName}
      style={rootStyle}
    >
      <div className="hosting-bento-content">
        {isHorizontal ? (
          <div className="relative text-left">
            {iconNode ? (
              <div
                className="absolute left-0"
                style={{
                  left: iconLeft,
                  top: heading
                    ? "calc(var(--ifm-heading-line-height) * 0.5em)"
                    : "calc(var(--ifm-line-height-base) * 0.5em)",
                  transform: "translateY(-50%)",
                  // Ensure the `em` used above matches the first-line font-size.
                  fontSize: heading
                    ? "var(--ifm-h4-font-size)"
                    : "var(--ifm-font-size-base)",
                }}
              >
                {iconNode}
              </div>
            ) : null}

            <div style={{ paddingLeft: textPadLeft }}>
              {heading ? (
                <h4 className={isLight ? "mb-3" : "text-white mb-3"}>{heading}</h4>
              ) : null}

              <div className="text-gray-300 hosting-bento-text">
                {typeof description === "string" ? <p>{description}</p> : description}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[280px] text-center flex flex-col items-center gap-3">
            {iconNode ? <div className="flex items-center justify-center">{iconNode}</div> : null}

            {heading ? (
              <h4 className={isLight ? "mb-0" : "text-white mb-0"}>{heading}</h4>
            ) : null}

            <div className="text-gray-300 hosting-bento-text text-center">
              {typeof description === "string" ? <p>{description}</p> : description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

