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
