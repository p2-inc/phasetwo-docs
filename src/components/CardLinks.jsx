import Link from "@docusaurus/Link";
import React from "react";

function isExternalUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

function LinkOrAnchor({ url, className, children }) {
  if (isExternalUrl(url)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={url} className={className}>
      {children}
    </Link>
  );
}

/**
 * Renders supplemental links for a card: a row of pill badges and/or a
 * "Learn more →" link, both styled in the secondary (pink/purple) accent color.
 */
export default function CardLinks({ learnMore, badges }) {
  if (!learnMore && (!badges || badges.length === 0)) return null;
  return (
    <>
      {badges && badges.length > 0 && (
        <div className="card-badges">
          {badges.map((badge) => (
            <LinkOrAnchor
              key={badge.label}
              url={badge.url}
              className="card-badge"
            >
              {badge.label}
            </LinkOrAnchor>
          ))}
        </div>
      )}
      {learnMore && (
        <LinkOrAnchor url={learnMore.url} className="card-learn-more">
          {learnMore.label}{" "}
          <span className="card-learn-more-arrow" aria-hidden="true">
            →
          </span>
        </LinkOrAnchor>
      )}
    </>
  );
}
