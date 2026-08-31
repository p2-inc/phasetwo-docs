import React from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

/**
 * Placeholder for a page that exists as a route but has no content yet.
 *
 * These were shipping as indexable pages: ~720 words of navigation and footer chrome
 * and nothing else. Measured against a chrome baseline, /pricing/ and /hosting/security/
 * had *zero* unique tokens, and pages like /hosting/backups/ and /support/theming/ were
 * 98-100% token-identical to each other. Google crawled them, saw a set of near-duplicate
 * empty pages, and declined to index them — along with, we think, some of the goodwill
 * it extends to the rest of the site.
 *
 * `noindex, follow` keeps them out of the index while still passing link equity. They are
 * also excluded from the sitemap (see docusaurus.config.js).
 *
 * When a page gets real content, replace this component — nothing else needs changing.
 */
export default function UnderConstruction({ title, description, backTo, backLabel }) {
  return (
    <Layout title={title} description={description ?? `${title} — coming soon.`}>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main className="container margin-vert--xl">
        <h1>{title}</h1>
        <p>
          We're still writing this page.{" "}
          {backTo && (
            <>
              In the meantime, see <Link to={backTo}>{backLabel}</Link>.
            </>
          )}
        </p>
        <p>
          Need this now? <Link to="/contact/">Get in touch</Link> — we'd rather answer
          directly than leave you reading a placeholder.
        </p>
      </main>
    </Layout>
  );
}
