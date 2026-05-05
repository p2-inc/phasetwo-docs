import { InlineIcon } from "@iconify/react";
import AnnualSpendChart from "./AnnualSpendChart";

export default function ValueHero({ onDemoClick }) {
  return (
    <section className="relative overflow-hidden bg-[#131313] bg-[url('/img/pattern-plus.svg')] bg-repeat">
      <div className="mx-auto max-w-[1280px] px-6 pb-20 pt-16 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* LEFT: copy */}
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(63,161,227,0.28)] bg-[rgba(63,161,227,0.10)] px-3 py-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#9DCBED]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3FA1E3] shadow-[0_0_8px_#3FA1E3]" />
              Identity Without The Tax
            </div>

            <h1
              className="mb-6 font-semibold leading-none tracking-tight text-white"
              style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
            >
              Cut your identity bill by
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span
                  className="font-bold tabular-nums leading-none"
                  style={{
                    fontSize: "clamp(80px, 12vw, 130px)",
                    letterSpacing: "-0.06em",
                    background:
                      "linear-gradient(180deg, #7FC4F0 0%, #3FA1E3 50%, #1D5C8E 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  80%
                </span>
                <span className="text-2xl text-white">— and own it.</span>
              </div>
            </h1>

            <p className="mb-8 max-w-[560px] text-[18px] leading-relaxed text-gray-300">
              Teams replacing Auth0, Okta, Ping, WorkOS &amp; FrontEgg with
              Phase Two are recovering, on average, four out of every five
              dollars they were paying in identity tax — on a platform that's
              more capable, more customizable, and yours to keep.
            </p>

            <div className="mb-10 flex flex-wrap items-center gap-3">
              <button className="btnPrimary btnSupport gap-2" onClick={onDemoClick}>
                <InlineIcon icon="lucide:calendar" className="h-4 w-4" />
                Get a Demo
              </button>
              <a
                href="https://dash.phasetwo.io/"
                target="_blank"
                rel="noreferrer"
              >
                <button className="btnPrimary gap-2">
                  <InlineIcon icon="lucide:play" className="h-4 w-4" />
                  Try for Free
                </button>
              </a>
            </div>

            {/* trust strip */}
            <div className="flex flex-wrap items-center gap-5 text-[12px] text-gray-400">
              <div className="flex items-center gap-1.5">
                <InlineIcon
                  icon="lucide:shield-check"
                  className="h-4 w-4 text-green-400"
                />
                SOC 2 Type II, ISO 27001, GDPR
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <InlineIcon
                  icon="lucide:globe"
                  className="h-4 w-4 text-[#3FA1E3]"
                />
                Multi-region HA
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <InlineIcon icon="mdi:github" className="h-4 w-4 text-white" />
                100% open source core
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <InlineIcon
                  icon="lucide:activity"
                  className="h-4 w-4 text-[#E14CC2]"
                />
                Billed by{" "}
                <span className="group relative cursor-help underline decoration-gray-600 decoration-dotted underline-offset-2">
                  concurrent sessions
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-52 -translate-x-1/2 rounded-lg border border-white/[0.12] bg-[#1a1a1a] px-3 py-2 text-center text-[11px] leading-relaxed text-gray-300 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Users actively logged in with a valid session — not every
                    user registered in your system
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: cost comparison chart */}
          <div className="lg:col-span-5">
            <AnnualSpendChart
              methodologyHref="/product/open-source-vs-commercial-offering/"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
