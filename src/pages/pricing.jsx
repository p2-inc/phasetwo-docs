import React from "react";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const TARGET = "/pricing/hosting/";

/**
 * /pricing/ forwards to the hosting pricing page.
 *
 * This was the same useEffect JS-redirect pattern as /hosting/: an empty <Layout> that
 * bounced only once JavaScript ran. Crawlers were served ~712 words of pure chrome with
 * *zero* unique content, and GSC confirms the result — /pricing/ is not indexed at all,
 * which for a pricing page is about as costly as an SEO defect gets.
 *
 * Meta refresh plus canonical is a redirect crawlers follow, and the visible link means
 * the page still works without JavaScript. 7 internal links point here, so the route stays.
 */
export default function Pricing() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="Keycloak Pricing"
      description="Phase Two pricing for managed Keycloak hosting and enterprise Keycloak support. Dedicated clusters from $149/month."
    >
      <Head>
        {/* Runs while the head is parsed, before the refresh fires, and keeps the query
            string and fragment. The meta refresh below goes to a fixed URL, so on its own
            it drops them: campaign parameters on a link to this page were lost on the
            hop. The refresh stays as the fallback without JavaScript, the same pair
            Docusaurus's own client-redirect pages use. */}
        <script>{`window.location.replace(${JSON.stringify(TARGET)} + window.location.search + window.location.hash);`}</script>
        <meta httpEquiv="refresh" content={`0; url=${TARGET}`} />
        <link rel="canonical" href={`${siteConfig.url}${TARGET}`} />
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main className="container margin-vert--xl text--center">
        <p>
          Redirecting to <Link to={TARGET}>Keycloak hosting pricing</Link>.
        </p>
      </main>
    </Layout>
  );
}
