import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import {
  SupportTierCards,
  SupportServices,
  SupportFaq,
  SupportMatrix,
} from "../../components/keycloak-support-packages/support-pricing-sections";

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title="Support Pricing" description={`${siteConfig.tagline}`}>
      <main className="hosting-page">
        {/* Hero */}
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
                <p className="text-base/7 font-semibold text-p2blue-400">
                  Enterprise Keycloak Support
                </p>
                <h1 id="supportPackages" className="mt-2 text-white">
                  Keycloak experts, on call.
                </h1>
                <p className="text--body-large mt-6 text-gray-300">
                  Back your migration to Keycloak or your self-hosted deployment
                  with the team that contributes to it. Two tiers, real SLAs, no
                  guessing — whether you use our hosting, run on-premise, or
                  manage your own.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tier cards */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SupportTierCards />
          </div>
        </section>

        {/* Full matrix */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading mb-6">
              <h2 className="text-white">What&apos;s in Silver vs. Gold</h2>
              <p className="subpage-section-intro mt-3 text-gray-300">
                The full breakdown — what you get, response times, and included
                service hours.
              </p>
            </div>
            <SupportMatrix />
          </div>
        </section>

        {/* Services grid */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading mb-8">
              <h2 className="text-white">
                Engagements teams buy alongside support
              </h2>
            </div>
            <SupportServices />
          </div>
        </section>

        {/* FAQ */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading mb-8">
              <h2 className="text-white">
                Service hours, incidents &amp; SLAs
              </h2>
            </div>
            <SupportFaq />
          </div>
        </section>

        {/* CTA */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h3
                className="font-normal text-gray-300"
                style={{ marginBottom: "20px" }}
              >
                Not sure which tier fits?
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
                  <button className="btnSecondary min-w-[200px]">
                    Details
                  </button>
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
