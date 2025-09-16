import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { useEffect } from "react";
import { KeycloakSupportPackages } from "../../components/keycloak-support-packages";
import styles from "../styles.module.css";
import { Icon } from "@iconify/react";

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  useEffect(() => {
    document.body.classList.add("page-bg");
  });

  return (
    <Layout description={`${siteConfig.tagline}`}>
      <main>
        <div className="container">
          <div className="contentBlock">
            <div className="contentBlockBody">
              <div>
                <h2
                  id="supportPackages"
                  style={{ textAlign: "center", marginTop: "3rem" }}
                >
                  Enterprise Keycloak Support Packages
                </h2>
                <div className="mb-2 mt-2 text-center">
                  <a
                    href="/support"
                    className="flex items-center justify-center gap-4"
                  >
                    Learn more about our Enterprise Support{" "}
                    <Icon icon="mdi:arrow-right" />
                  </a>
                </div>

                <div
                  className={styles.planBody}
                  style={{ maxWidth: "760px", margin: "0 auto" }}
                >
                  <p>
                    Configuring, integrating and operating an Identity and
                    Access Management system can be daunting. The Support
                    package provides customers with the expertise on how to
                    implement Keycloak. This is separate from our hosting, but
                    can be bundled together (many customers do).
                  </p>
                  <p>
                    For both hosted, on-prem customers, or those with their own
                    Keycloak deployment, our goal is to create an understanding
                    in your organization of what is possible with Keycloak. We
                    want to support your goals as you adopt and implement
                    Keycloak in your products. Let us lend our expertise to
                    every step of your journey.
                  </p>
                </div>
              </div>
              <KeycloakSupportPackages />
            </div>
          </div>
          <div className="contentBlock">
            <div className="contentBlockBody">
              <div className={`${styles.callout} card`}>
                <h4 className={styles.calloutHeader}>
                  Learn more about Phase Two's Enterprise Support
                </h4>
                <div className="margin-top--md">
                  <a
                    href="https://scheduler.zoom.us/phasetwo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="margin-right--md"
                  >
                    <button className="btnTertiary">
                      Let&apos;s Talk About It
                    </button>
                  </a>
                  <a href="/support" className="">
                    <button className="btnTertiary margin-right--md">
                      Details
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Pricing;
