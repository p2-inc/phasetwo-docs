import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import DetailedPriceComparison from "../../components/pricing/detailed-comparison";
import TierCards from "../../components/pricing/tier-cards";
import PlanEstimator from "../../components/pricing/plan-estimator";

const FAQ = [
  {
    q: "What counts as a monthly active user?",
    a: "A monthly active user (MAU) is a user making up to ~1,000 token requests a month — logins, token refreshes, OIDC grant types, client-credential grants, and similar. Registered users are always unlimited; each cluster is sized to perform well up to its MAU range.",
  },
  {
    q: "What happens if I go over my plan's MAU?",
    a: "Nothing punitive. We don't block or surcharge you for going over — but a cluster is sized for its range, so beyond it you may see higher latency on your token endpoints. We monitor CPU and memory and proactively reach out as limits are approached so you can move up a tier in time.",
  },
  {
    q: "Is there really a free trial?",
    a: "Yes. Every Starter cluster starts with a 30-day free trial. Cancel anytime before it ends and you won't be charged; otherwise it continues at $149/mo.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes, up or down at any time. Annual plans prorate the difference, and you can move up a tier as you grow.",
  },
  {
    q: "What about on-premise or multi-region?",
    a: "On-premise, air-gapped, and multi-region deployments are available on a Custom plan. Talk to sales for a scoped quote.",
  },
];

function Pricing() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title="Pricing" description={`${siteConfig.tagline}`}>
      <main className="hosting-page">
        {/* Hero — calculator-led */}
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
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div>
                  <p className="text-base/7 font-semibold text-p2blue-400">
                    Pricing for Hosting
                  </p>
                  <h1 className="mt-2 text-white">
                    See your price{" "}
                    <span className="text-p2blue-400">before</span> you sign up.
                  </h1>
                  <p className="text--body-large mt-6 text-gray-300">
                    Phase Two hosting is priced per cluster and sized for your
                    monthly active users — total registered users are unlimited
                    (millions of users in the system is not an issue). Estimate
                    your plan, start free, and scale as you grow. No hidden fees
                    and no sales call required (but happy to talk if you want
                    to).
                  </p>
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <a
                      href="https://dash.phasetwo.io/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button className="btnPrimary min-w-[160px]">
                        Start for free
                      </button>
                    </a>
                    <Link href="#pricing-table" className="link-primary">
                      Compare plans <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
                <div>
                  <PlanEstimator />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tier cards + billing toggle */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <TierCards />
          </div>
        </section>

        {/* Full comparison table */}
        <section id="pricing-table" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading mb-8">
              <h2 className="text-white">Every plan, side by side</h2>
              <p className="subpage-section-intro mt-3 text-gray-300">
                All paid plans run on dedicated, independently provisioned
                infrastructure and include the full Phase Two extension suite.
              </p>
            </div>
            <DetailedPriceComparison />
            <p className="text--body-large mt-8 text-center text-gray-300">
              (1) Additional fees based on extension complexity. (2) Available
              as an add-on; contact sales for pricing.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading mb-8">
              <h2 className="text-white">Frequently asked</h2>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-6"
                >
                  <h3 className="mb-2 text-base font-semibold text-white">
                    {item.q}
                  </h3>
                  <p className="mb-0 text-sm text-gray-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Pricing;
