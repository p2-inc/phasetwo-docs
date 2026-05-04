import { InlineIcon } from "@iconify/react";

const ITEMS = [
  {
    icon: "lucide:wallet",
    title: "Recover your identity budget",
    body: "Most IdPs charge per user in your system — whether they log in or not. Phase Two charges by concurrent active sessions, so your bill doesn't balloon with sign-ups. Predictable infrastructure pricing, not a seat tax.",
    stat: "80%",
    statLabel: "avg. cost reduction",
    tone: "primary",
  },
  {
    icon: "lucide:unlock",
    title: "No vendor lock-in",
    body: "Standards-based and 100% Keycloak under the hood. Take your realms with you whenever you want.",
    stat: "OSS",
    statLabel: "open source core",
    tone: "primary",
  },
  {
    icon: "lucide:shield-check",
    title: "Deep in the Keycloak community",
    body: (
      <>
        We file bugs, contribute fixes, moderate the{" "}
        <a href="https://forum.keycloak.org/" target="_blank" rel="noreferrer" className="text-[#3FA1E3] hover:underline">Keycloak forums</a>, and steward the{" "}
        <a href="https://github.com/p2-inc#our-extensions-" target="_blank" rel="noreferrer" className="text-[#3FA1E3] hover:underline">extensions</a> teams actually depend on —{" "}
        <a href="https://github.com/p2-inc/keycloak-orgs" target="_blank" rel="noreferrer" className="text-[#3FA1E3] hover:underline">Organizations</a>,{" "}
        <a href="https://quay.io/repository/phasetwo/keycloak-crdb" target="_blank" rel="noreferrer" className="text-[#3FA1E3] hover:underline">CockroachDB support</a>,{" "}
        <a href="https://github.com/p2-inc/keycloak-redis-cache" target="_blank" rel="noreferrer" className="text-[#3FA1E3] hover:underline">Redis caching</a>, and more.
      </>
    ),
    stat: "100+",
    statLabel: "extensions shipped",
    tone: "primary",
  },
  {
    icon: "lucide:arrow-right-left",
    title: "Migrate without downtime",
    body: "Lazy-import users on first sign-in, dual-run with your existing IdP, then cut over when you're ready. End users never see a thing.",
    stat: "0s",
    statLabel: "cutover downtime",
    tone: "magenta",
  },
  {
    icon: "lucide:workflow",
    title: "Federate what you already have",
    body: "Keep Auth0, Okta, Azure AD, LDAP, or any SAML/OIDC provider in front. De-risk migration by routing only what you choose to Phase Two.",
    stat: "30+",
    statLabel: "IdPs supported out of the box",
    tone: "magenta",
  },
];

function Card({ item }) {
  const isPrimary = item.tone === "primary";
  const iconClasses = isPrimary
    ? "bg-[rgba(63,161,227,0.12)] text-[#3FA1E3]"
    : "bg-[rgba(225,76,194,0.12)] text-[#E14CC2]";

  return (
    <div
      className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#1a1a1a] p-8"
      data-scroll-slide-in
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}
        >
          <InlineIcon icon={item.icon} className="h-5 w-5" />
        </div>
        <div className="text-right">
          <div className="text-[28px] font-bold tabular-nums leading-none text-white">
            {item.stat}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-gray-500">
            {item.statLabel}
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-[20px] font-semibold leading-snug text-white">
          {item.title}
        </h3>
        <p className="text-[14px] leading-relaxed text-gray-400">{item.body}</p>
      </div>
    </div>
  );
}

export default function WhyTeamsSwitch() {
  return (
    <section className="hosting-block py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mb-12" data-scroll-slide-group>
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(63,161,227,0.28)] bg-[rgba(63,161,227,0.10)] px-3 py-1.5 text-[12px] font-semibold uppercase tracking-widest text-[#9DCBED]"
            data-scroll-slide-in
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3FA1E3] shadow-[0_0_8px_#3FA1E3]" />
            Why teams switch
          </div>
          <h2
            className="max-w-[760px] text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-tight text-white"
            data-scroll-slide-in
          >
            Costs less, breaks less, locks you in{" "}
            <span className="text-[#3FA1E3]">never</span> — and migration with
            zero downtime.
          </h2>
        </div>

        {/* Row 1: 3 cards */}
        <div
          className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3"
          data-scroll-slide-group
        >
          {ITEMS.slice(0, 3).map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </div>

        {/* Row 2: 2 cards */}
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          data-scroll-slide-group
        >
          {ITEMS.slice(3).map((item) => (
            <Card key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
