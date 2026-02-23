import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { KeycloakSupportPackages } from "../../components/keycloak-support-packages";

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title="Support Pricing"
      description={`${siteConfig.tagline}`}
    >
      <main className="hosting-page">
        <section className="subpage-section subpage-hero-section">
          <div
            className="relative isolate overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 id="supportPackages" className="text-white">
                  Enterprise Keycloak Support Packages
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)] text-center">
              <h4 className="mb-0 text-gray-300 font-normal text-balance">
                Implementing Identity and Access Management doesn&apos;t have to be overwhelming. Our Support package provides expert guidance on implementing Keycloak—whether you use our hosting, run on-premise, or manage your own deployment.
              </h4>
            </div>
          </div>
        </section>

        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-center text-gray-300 subpage-section-intro">
              Choose the support level that matches your needs:
            </p>

            <div className="mt-6">
              <KeycloakSupportPackages />
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-gray-300 font-normal" style={{ marginBottom: "20px" }}>
                Learn more about Phase Two&apos;s
                <br />
                Enterprise Support
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://scheduler.zoom.us/phasetwo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btnSecondary min-w-[200px]">
                    Let&apos;s Talk About It
                  </button>
                </a>
                <Link to="/support">
                  <button className="btnSecondary min-w-[200px]">Details</button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Pricing;
