import useBrokenLinks from "@docusaurus/useBrokenLinks";
import React from "react";

/**
 * A <section> whose `id` the build's broken-anchor check can actually see.
 *
 * Docusaurus only knows about anchors a component registers through
 * `useBrokenLinks().collectAnchor()`. Markdown headings get that for free from
 * the theme's Heading component, but a plain `<section id="scale">` in a React
 * page registers nothing -- so every `#fragment` link into one of these pages
 * was reported as a broken anchor even though it scrolls correctly in the
 * browser. The nav's link to /product/sso/#idp-wizard alone accounted for 514
 * of those warnings, one per page, because it renders in the navbar.
 *
 * Registering the id here rather than in a per-page list keeps the two from
 * drifting: the anchor the checker is told about is the one that ships.
 */
export default function Section({ id, children, ...props }) {
  // collectAnchor ignores undefined, so an id-less <Section> is fine.
  useBrokenLinks().collectAnchor(id);

  return (
    <section id={id} {...props}>
      {children}
    </section>
  );
}
