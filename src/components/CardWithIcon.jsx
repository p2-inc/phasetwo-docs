import React from "react";

function shouldForceFillCurrent(className) {
  if (!className) return true;

  // If the consumer explicitly styles stroke icons, don't force fill.
  const strokeHints = [
    "stroke-",
    "strokeCurrent",
    "stroke-current",
    "fill-none",
    "icon-stroke",
    "[&_*]:stroke",
    "[&_*]:fill-none",
  ];

  return !strokeHints.some((hint) => className.includes(hint));
}

function shouldForceFillCurrentForElement(iconEl, className) {
  // Iconify's InlineIcon uses `icon="set:name"`. Lucide icons are stroke-based.
  const iconId = iconEl?.props?.icon;
  if (typeof iconId === "string" && iconId.startsWith("lucide:")) return false;
  return shouldForceFillCurrent(className);
}

function renderIcon(icon, { width, alt, className }) {
  if (!icon) return null;

  // Docusaurus SVGR imports yield a React component.
  if (typeof icon === "function") {
    const Icon = icon;
    const mergedClassName = [className]
      .filter(Boolean)
      .concat(shouldForceFillCurrent(className) ? ["[&_*]:fill-current"] : [])
      .join(" ");
    return (
      <Icon
        aria-hidden={alt ? undefined : true}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={mergedClassName}
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

  // If a React element is passed, size it consistently.
  if (React.isValidElement(icon)) {
    const baseClassName = [icon.props?.className, className].filter(Boolean).join(" ");
    const mergedClassName = [
      baseClassName,
      shouldForceFillCurrentForElement(icon, baseClassName) ? "[&_*]:fill-current" : null,
    ]
      .filter(Boolean)
      .join(" ");

    const mergedStyle = {
      ...(icon.props?.style || {}),
      width,
      height: "auto",
    };

    return React.cloneElement(icon, {
      "aria-hidden": alt ? undefined : icon.props?.["aria-hidden"] ?? true,
      role: alt ? "img" : icon.props?.role,
      "aria-label": alt || icon.props?.["aria-label"],
      className: mergedClassName,
      style: mergedStyle,
    });
  }

  // Otherwise, render as-is.
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
  iconWidth = 32,
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

