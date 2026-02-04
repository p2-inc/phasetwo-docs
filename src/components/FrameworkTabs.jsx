import React from "react";

/**
 * Shared tab UI used on the homepage "Migrate to Phase Two..." section.
 *
 * This component is intentionally "controlled" so parents can tie animations/effects
 * to tab state changes.
 */
export default function FrameworkTabs({
  tabs,
  activeIndex,
  onChange,
  panels,
  contentMinHeight,
  stableHeight = false,
}) {
  return (
    <div className="framework-tabs-container">
      <div className="framework-tabs-header">
        {tabs.map((tab, idx) => (
          <button
            // eslint-disable-next-line react/no-array-index-key
            key={tab?.key ?? tab?.label ?? idx}
            className={`framework-tab ${activeIndex === idx ? "active" : ""}`}
            onClick={() => onChange(idx)}
            type="button"
          >
            {tab?.label ?? tab}
          </button>
        ))}
      </div>

      <div
        className="framework-tabs-content"
        // The homepage uses a global min-height for tab content (to reduce layout shift).
        // Some pages prefer content to size naturally.
        style={{
          minHeight: contentMinHeight,
        }}
      >
        {stableHeight ? (
          <div className="grid">
            {panels?.map((panel, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={tabs?.[idx]?.key ?? tabs?.[idx]?.label ?? idx}
                  style={{
                    gridArea: "1 / 1",
                    visibility: isActive ? "visible" : "hidden",
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                    transition: "opacity 150ms ease-out",
                  }}
                  aria-hidden={!isActive}
                >
                  {panel}
                </div>
              );
            })}
          </div>
        ) : (
          (panels?.[activeIndex] ?? null)
        )}
      </div>
    </div>
  );
}

