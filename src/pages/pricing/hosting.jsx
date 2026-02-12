import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import DetailedPriceComparison from "../../components/pricing/detailed-comparison";

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title="Pricing"
      description={`${siteConfig.tagline}`}
    >
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
                  Pricing for Hosting
                </p>
                <h1 className="mt-2 text-white">Simple. Predictable. Scalable.</h1>
                <p className="mt-6 text-gray-300 text--body-large">
                  Phase Two hosting is priced per cluster. No hidden fees, no
                  unpredictable costs, and generous limits to get your team
                  started. All tiers can be purchased directly in the dashboard.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4">
                  <a
                    href="https://dash.phasetwo.io/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button className="btnPrimary min-w-[160px]">
                      Get started
                    </button>
                  </a>
                  <Link href="#pricing-table" className="link-primary">
                    Compare plans <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing-table" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <DetailedPriceComparison />
            <p className="mt-8 text-center text-gray-300 text--body-large">
              Starter tier subject to availability. (1) Additional fees based on
              extension complexity.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Pricing;
