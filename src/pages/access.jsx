import React from "react";
import classnames from "classnames";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";

function Access() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Request access to Phase Two B"
    >
      {/* Nothing here but an embedded form — no indexable content of its own. */}
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className={styles.access}>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScIwakLlJpd9OS3r1fCsPDX01Y9BTSvxf5Ceru_FrpAQE5hIA/viewform?embedded=true"
          width="640"
          height="925"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >
          Loading…
        </iframe>
      </div>
    </Layout>
  );
}

export default Access;
