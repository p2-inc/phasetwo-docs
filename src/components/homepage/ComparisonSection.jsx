import { InlineIcon } from "@iconify/react";

const COLS = [
  { key: "auth0", name: "Okta / Auth0" },
  { key: "ping", name: "Ping Identity" },
  { key: "workos", name: "WorkOS" },
  { key: "fe", name: "FrontEgg" },
  { key: "p2", name: "Phase Two", highlight: true },
];

const ROWS = [
  { label: "Per-MAU pricing penalty", vals: ["$$$", "$$$", "—", "$$$", "—"] },
  {
    label: "SSO connections pricing penalty",
    vals: ["$$$", "—", "$$$", "$$$", "—"],
  },
  { label: "SCIM / directory sync", vals: ["$$$", "✓", "$$$", "$$$", "✓"] },
  { label: "Event & audit logging", vals: ["$$$", "✓", "$$$", "$$$", "✓"] },
  { label: "Open-source core", vals: ["✗", "✗", "✗", "✗", "✓"] },
  { label: "Self-hostable / on-prem", vals: ["✗", "✗", "✗", "✗", "✓"] },
  { label: "You own the identity layer", vals: ["✗", "✗", "✗", "✗", "✓"] },
  {
    label: "Built-in multi-tenant orgs",
    vals: ["$$$", "$$$", "$$$", "✓", "✓"],
  },
  { label: "Custom themes & extensions", vals: ["○", "○", "○", "○", "✓"] },
  { label: "Migration support", vals: ["✗", "✗", "✗", "✗", "✓"] },
];

function Cell({ value }) {
  if (value === "✓") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(16,185,129,0.15)] text-[#10B981]">
        <InlineIcon icon="lucide:check" className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === "✗") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(239,68,68,0.12)] text-[#ef4444]">
        <InlineIcon icon="lucide:x" className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === "○") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-[#7E8AA3]">
        <InlineIcon icon="lucide:minus" className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (value === "$$$") {
    return (
      <span className="inline-flex h-6 items-center justify-center rounded-md bg-[rgba(225,76,194,0.12)] px-2 text-[11px] font-bold text-[#E14CC2]">
        $$$
      </span>
    );
  }
  return <span className="text-gray-600">—</span>;
}

export default function ComparisonSection({ onDemoClick }) {
  return (
    <section className="hosting-block border-t border-white/[0.08] py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mb-12 text-center" data-scroll-slide-group>
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(63,161,227,0.28)] bg-[rgba(63,161,227,0.10)] px-3 py-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#9DCBED]"
            data-scroll-slide-in
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3FA1E3] shadow-[0_0_8px_#3FA1E3]" />
            Competitive Landscape
          </div>
          <h2
            className="text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-tight text-white"
            data-scroll-slide-in
          >
            Complete parity. More customizable.
          </h2>
          <p
            className="mx-auto mt-4 max-w-[640px] text-[16px] text-gray-400"
            data-scroll-slide-in
          >
            No financial punishment for growth or scale.
          </p>
        </div>

        <div className="mx-auto max-w-[1080px]" data-scroll-slide-in>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1a1a]">
            {/* card header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(225,76,194,0.18)] text-[#E14CC2]">
                  <InlineIcon
                    icon="lucide:git-compare"
                    className="h-3.5 w-3.5"
                  />
                </div>
                <div className="text-[13px] font-semibold text-white">
                  Feature &amp; cost comparison
                </div>
              </div>
            </div>

            {/* column headers */}
            <div className="grid grid-cols-12 items-end gap-2 border-b border-white/[0.08] px-6 pb-3 pt-5">
              <div className="col-span-4" />
              {COLS.map((c) => (
                <div
                  key={c.key}
                  className={`text-center ${c.highlight ? "col-span-2" : "col-span-1"}`}
                >
                  {c.highlight && (
                    <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[rgba(63,161,227,0.18)] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#3FA1E3]">
                      You
                    </div>
                  )}
                  <div
                    className={`text-[12px] font-semibold ${c.highlight ? "text-white" : "text-gray-500"}`}
                  >
                    {c.name}
                  </div>
                </div>
              ))}
            </div>

            {/* data rows */}
            {ROWS.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 items-center gap-2 px-6 py-3 ${i > 0 ? "border-t border-white/[0.06]" : ""}`}
              >
                <div className="col-span-4 text-[13px] text-gray-400">
                  {row.label}
                </div>
                {row.vals.map((v, j) => (
                  <div
                    key={j}
                    className={`flex justify-center ${COLS[j].highlight ? "col-span-2" : "col-span-1"}`}
                  >
                    <Cell value={v} />
                  </div>
                ))}
              </div>
            ))}

            {/* footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] bg-[rgba(63,161,227,0.06)] px-6 py-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="text-[12px] text-gray-400">
                  <span className="text-[14px] font-bold tabular-nums text-white">
                    ~80%
                  </span>{" "}
                  avg. cost reduction on switch
                </div>
                <a
                  href="/resources/case-studies/"
                  className="flex items-center gap-1 text-[12px] font-semibold text-[#3FA1E3] hover:underline"
                >
                  Read customer case studies
                  <InlineIcon icon="lucide:arrow-right" className="h-3 w-3" />
                </a>
              </div>
              <button
                className="btnPrimary px-[14px] py-2 text-[13px]"
                onClick={onDemoClick}
              >
                Book a savings review
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
