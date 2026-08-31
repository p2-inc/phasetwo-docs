import React from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const TARGET = "/hosting/dedicated-clusters/";

/**
 * /hosting/ forwards to the dedicated clusters page.
 *
 * This used to redirect from a `useEffect`, which meant crawlers were served an empty
 * <Layout> with no redirect signal at all — it read as a soft 404, and it put another
 * competing URL into the "keycloak hosting" / "managed keycloak" result set without ever
 * being able to rank.
 *
 * A meta refresh plus a self-referencing canonical to the target is a redirect crawlers
 * actually follow, and the visible link means the page works without JavaScript.
 *
 * NOTE: ~8 pages link here (homepage, /keycloak-alternatives/*, docs), so the route has
 * to stay. The better end state is for this to become a real hosting hub page and the
 * canonical target for the cluster — see the SEO notes in the content-marketing repo.
 */
function Hosting() {
  const { siteConfig } = useDocusaurusContext();
  const canonical = `${siteConfig.url}${TARGET}`;

  return (
    <Layout
      title="Managed Keycloak Hosting"
      description="Managed Keycloak hosting on dedicated clusters, operated by the authors of the most widely used Keycloak extensions."
    >
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main className="container margin-vert--xl text--center">
        <p>
          Redirecting to <Link to={TARGET}>managed Keycloak hosting</Link>.
        </p>
      </main>
    </Layout>
  );
}

export default Hosting;
