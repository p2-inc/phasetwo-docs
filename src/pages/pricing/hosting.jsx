import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import Section from "../../components/Section";
import DetailedPriceComparison from "../../components/pricing/detailed-comparison";
import TierCards from "../../components/pricing/tier-cards";
import PlanEstimator from "../../components/pricing/plan-estimator";

const FAQ = [
  {
    q: "How many users can I have?",
    a: "As many as you like, on every tier. There is no cap on registered users and no cap on how many of them use the cluster. We do not meter, bill, or gate on user count — what differs between tiers is the amount of authentication load the cluster is sized for.",
  },
  {
    q: "What does “sized for 5K / 100K / 500K active users” mean?",
    a: "It is the load we provision each tier's cluster to handle comfortably. The sizing assumes an active user logs in 30 times per month and refreshes their token 1,000 times per month — roughly 1,030 token requests per active user, per month. If your traffic pattern is lighter, a tier will carry more users than its headline number; if it is heavier, it will carry fewer.",
  },
  {
    q: "What happens if I exceed the sizing for my tier?",
    a: "Nothing is blocked and nothing is surcharged — these are soft limits, not enforced quotas. Past the sizing you may see performance degrade, typically as higher latency on the token endpoints. We monitor CPU and memory, reach out proactively, and work with you to tune the use case or resize the cluster.",
  },
  {
    q: "Can the Enterprise SLA go above 99.95%?",
    a: "Yes. Enterprise clusters carry a 99.95% uptime guarantee as standard, and that commitment can be extended to 99.99% for an additional fee. Talk to sales to scope it.",
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

const SIZING = [
  { name: "Starter", sized: "5K" },
  { name: "Premium", sized: "100K" },
  { name: "Enterprise", sized: "500K" },
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
                    Phase Two hosting is priced per cluster, not per user.{" "}
                    <strong className="text-white">
                      Users are unlimited on every tier
                    </strong>{" "}
                    — millions of users in the system is not an issue. Tiers
                    differ in the authentication load the cluster is sized for.
                    Estimate your plan, start free, and scale as you grow. No
                    hidden fees and no sales call required (but happy to talk if
                    you want to).
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

        {/* How the tiers are sized */}
        <Section id="sizing" className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="subpage-section-heading mb-8">
              <h2 className="text-white">
                Unlimited users. Tiers sized for the load.
              </h2>
              <p className="subpage-section-intro mt-3 text-gray-300">
                We do not charge per user and we do not cap how many users can
                be on a cluster. What we do is size each tier for a given amount
                of authentication traffic, so you can pick the one that matches
                how your product actually behaves.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {SIZING.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-[24px] border border-white/10 bg-[var(--ifm-background-surface-color)] p-6"
                >
                  <h3 className="mb-1 text-base font-semibold text-white">
                    {tier.name}
                  </h3>
                  <p className="mb-0 text-3xl font-bold text-p2blue-400">
                    {tier.sized}
                  </p>
                  <p className="mb-0 mt-1 text-sm text-gray-400">
                    active users
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-[var(--ifm-background-surface-color)] p-6 sm:p-8">
              <h3 className="mb-3 text-lg font-semibold text-white">
                What an &ldquo;active user&rdquo; assumes
              </h3>
              <p className="text-gray-300">
                These sizings assume an active user, in a given month:
              </p>
              <ul className="ml-0 list-none space-y-2 pl-0 text-gray-300">
                <li className="flex items-baseline gap-2">
                  <span className="font-mono font-semibold text-p2blue-400">
                    30
                  </span>
                  <span>logins</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="font-mono font-semibold text-p2blue-400">
                    1,000
                  </span>
                  <span>token refreshes</span>
                </li>
              </ul>
              <p className="mt-4 text-gray-300">
                If your traffic is lighter than that, a tier will comfortably
                carry more users than its headline number. If it is heavier —
                short refresh lifespans, chatty machine-to-machine clients, a
                burst of logins at the top of every hour — it will carry fewer.
              </p>

              <h3 className="mb-3 mt-8 text-lg font-semibold text-white">
                These are soft limits
              </h3>
              <p className="mb-0 text-gray-300">
                There is{" "}
                <strong className="text-white">
                  no restriction on how many users can be on a cluster
                </strong>
                . Nothing is blocked, throttled, or surcharged when you go past
                the sizing for your tier — but performance may degrade, usually
                as higher latency on the token endpoints. We monitor CPU and
                memory on every cluster and reach out proactively. If you do hit
                degradation, we will work with you to adjust the use case, size
                the cluster correctly, or both.
              </p>
            </div>
          </div>
        </Section>

        {/* Full comparison table */}
        <Section id="pricing-table" className="subpage-section">
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
        </Section>

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
