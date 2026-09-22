import React from "react";
import Head from "@docusaurus/Head";

/**
 * Emits `<meta name="robots" content="noindex, follow">`.
 *
 * Used on generated taxonomy and utility routes (tag pages, paginated blog
 * pages, the archive, author archives, search) that have no content of their
 * own. `noindex` keeps them out of the index; `follow` still lets the links on
 * them pass equity through to the posts they point at.
 *
 * This only works if the route stays crawlable -- a `Disallow` in robots.txt
 * would stop Google fetching the page and so stop it ever seeing this tag. See
 * the comment in static/robots.txt.
 */
export default function NoIndexMeta() {
  return (
    <Head>
      <meta name="robots" content="noindex, follow" />
    </Head>
  );
}
