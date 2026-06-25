import React, { useState } from "react";
import cn from "classnames";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import DemoModal from "../DemoModal";

const CheckIcon = () => (
  <span
    className="mt-0.5 inline-flex size-5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-p2blue-400 bg-p2blue-500"
    aria-hidden="true"
  >
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.1791 1.10639C10.4179 0.94065 10.7419 0.968577 10.952 1.19004L11.8198 2.10514C12.0601 2.35857 12.0601 2.76937 11.8198 3.02277L4.43508 10.81C4.19476 11.0633 3.80519 11.0633 3.56488 10.81L0.18022 7.24085C-0.0600894 6.98744 -0.0600573 6.57664 0.18022 6.32321L1.04802 5.40811L1.14417 5.32446C1.38281 5.15833 1.70789 5.18687 1.91822 5.40811L3.99998 7.597L10.0818 1.19004L10.1791 1.10639Z"
        fill="black"
      />
    </svg>
  </span>
);

const TIERS = [
  {
    name: "Silver",
    icon: "/img/support-hosting-silver.svg",
    price: "from $3,500",
    per: "/mo",
    popular: false,
    desc: "Business-hours support for teams running Keycloak in production.",
    features: [
      "Up to 10 service hours / month",
      "Architecture review",
      "Installation & configuration support",
      "Email support",
      "9×5 support (US EST)",
      "24h response time",
      "Quarterly health assessment",
    ],
  },
  {
    name: "Gold",
    icon: "/img/support-hosting-gold.svg",
    price: "from $7,500",
    per: "/mo",
    popular: true,
    desc: "24×7×365 coverage with fast SLAs for revenue-critical deployments.",
    features: [
      "20 service hours / month",
      "Everything in Silver",
      "Slack support",
      "Phone support",
      "24×7×365 support",
      "4h response time",
      "Monthly health assessment",
      "Incident support",
      "Custom development",
    ],
  },
];

export function SupportTierCards() {
  const [modalOpen, setModalOpen] = useState(false);
  const { siteConfig: { customFields = {} } = {} } = useDocusaurusContext();
  const demoRequestEndpoint =
    typeof customFields.demoRequestEndpoint === "string"
      ? customFields.demoRequestEndpoint
      : undefined;
  const turnstileSiteKey =
    typeof customFields.turnstileSiteKey === "string"
      ? customFields.turnstileSiteKey
      : undefined;

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
      {TIERS.map((tier) => (
        <section
          key={tier.name}
          className={
            "relative flex flex-col rounded-[32px] border border-white/10 bg-[var(--ifm-background-surface-color)] p-7 " +
            (tier.popular
              ? "ring-2 ring-secondary-500"
              : "ring-1 ring-white/10")
          }
        >
          {tier.popular && (
            <span className="absolute -top-3 left-7 rounded-full bg-secondary-500 px-3 py-1 text-xs font-semibold text-white">
              Most popular
            </span>
          )}
          <div className="flex items-center gap-3">
            <img
              src={tier.icon}
              alt=""
              style={{ width: "44px" }}
              loading="lazy"
            />
            <h3 className="mb-0 text-2xl font-bold text-white">{tier.name}</h3>
          </div>
          <p className="mt-3 min-h-[40px] text-sm text-gray-400">{tier.desc}</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{tier.price}</span>
            <span className="text-sm text-gray-400">{tier.per}</span>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={
              tier.popular
                ? "btnPrimary btnSupport mt-5 w-full"
                : "btnPrimary mt-5 w-full"
            }
          >
            Contact sales
          </button>
          <ul
            role="list"
            className="ml-0 mt-6 list-none space-y-3 pl-0 text-sm text-gray-300"
          >
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-x-2.5">
                <CheckIcon />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <DemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        demoRequestEndpoint={demoRequestEndpoint}
        turnstileSiteKey={turnstileSiteKey}
      />
    </div>
  );
}

const SERVICES = [
  {
    t: "Migration to Keycloak",
    d: "Move off Auth0, Okta, or Cognito with zero password resets.",
  },
  {
    t: "Architecture & scaling review",
    d: "Plan for the next 10× before you hit it.",
  },
  {
    t: "Zero-downtime upgrades",
    d: "Stay current on Keycloak without maintenance windows.",
  },
  {
    t: "Emergency assistance",
    d: "One-off rescue engagements when production is on fire.",
  },
  {
    t: "On-prem deployment",
    d: "We deploy inside your perimeter; you operate.",
  },
  {
    t: "Custom development",
    d: "Bespoke extensions and integrations (Gold).",
  },
];

export function SupportServices() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => (
        <div
          key={s.t}
          className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-6"
        >
          <div className="mb-3 text-p2blue-400">
            <CheckIcon />
          </div>
          <h3 className="mb-2 text-base font-semibold text-white">{s.t}</h3>
          <p className="mb-0 text-sm text-gray-400">{s.d}</p>
        </div>
      ))}
    </div>
  );
}

const FAQ = [
  {
    q: "What is a service hour?",
    a: "A service hour is time our engineers spend on proactive work for you — configuration, architecture guidance, reviews, upgrades, and how-to help. Each plan includes a monthly allotment (Silver up to 10, Gold 20).",
  },
  {
    q: "What is an incident hour?",
    a: "An incident hour is time spent responding to a production issue you've raised — triage, diagnosis, and resolution under your plan's response-time SLA. Incident hours are tracked separately from service hours.",
  },
  {
    q: "Which plan has incident support?",
    a: "Gold. It includes 24×7×365 incident response with a 4-hour SLA. Silver covers proactive service hours during 9×5 business hours.",
  },
  {
    q: "What if I only need incident support?",
    a: "Reach out — we can scope a standalone incident-support arrangement that fits how you run Keycloak. Talk to sales and we'll size it with you.",
  },
];

export function SupportFaq() {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
      {FAQ.map((item) => (
        <div
          key={item.q}
          className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-6"
        >
          <h3 className="mb-2 text-base font-semibold text-white">{item.q}</h3>
          <p className="mb-0 text-sm text-gray-400">{item.a}</p>
        </div>
      ))}
    </div>
  );
}

const GreenCheck = () => (
  <svg
    className="mx-auto text-emerald-400"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Medal = ({ kind }) => (
  <img
    src={`/img/support-hosting-${kind}.svg`}
    alt=""
    style={{ width: "28px" }}
    loading="lazy"
  />
);

// [silver, gold]; `emph` and `price` rows render bold white.
const MATRIX = [
  {
    label: "Included service hours / month",
    v: ["10 (max)", "20"],
    emph: true,
  },
  { label: "Architecture review", v: [true, true] },
  { label: "Installation and configuration support", v: [true, true] },
  { label: "Email support", v: [true, true] },
  { label: "Slack support", v: [false, true] },
  { label: "Phone support", v: [false, true] },
  { label: "Support hours (US EST)", v: ["9×5", "24×7×365"] },
  { label: "Response time", v: ["24 hours", "4 hours"] },
  { label: "Health assessment", v: ["Quarterly", "Monthly"] },
  { label: "Incident support", v: [false, true] },
  { label: "Custom development", v: [false, true] },
  { label: "Pricing / month", v: ["from $3,500", "from $7,500"], price: true },
];

function MatrixCell({ value, strong }) {
  if (value === true) return <GreenCheck />;
  if (value === false)
    return (
      <span className="text-lg leading-none text-gray-600" aria-hidden="true">
        &mdash;
      </span>
    );
  return (
    <span className={strong ? "font-semibold text-white" : "text-gray-300"}>
      {value}
    </span>
  );
}

export function SupportMatrix() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[var(--ifm-background-surface-color)]">
      <table className="p2-cmp table w-full table-fixed text-[13.5px]">
        <thead>
          <tr>
            <th className="w-[44%] px-4 py-5" />
            <th className="px-4 py-5 text-center align-bottom">
              <div className="flex flex-col items-center gap-1.5">
                <Medal kind="silver" />
                <span className="text-[15px] font-bold text-white">Silver</span>
              </div>
            </th>
            <th className="bg-secondary-500/[0.08] px-4 py-5 text-center align-bottom">
              <div className="flex flex-col items-center gap-1.5">
                <Medal kind="gold" />
                <span className="text-[15px] font-bold text-white">Gold</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {MATRIX.map((row) => {
            const strong = !!(row.emph || row.price);
            return (
              <tr key={row.label}>
                <td
                  className={cn(
                    "px-4 py-3.5 text-left",
                    strong ? "font-semibold text-white" : "text-gray-300",
                  )}
                >
                  {row.label}
                </td>
                <td className="px-4 py-3.5 text-center">
                  <MatrixCell value={row.v[0]} strong={strong} />
                </td>
                <td className="bg-secondary-500/[0.08] px-4 py-3.5 text-center">
                  <MatrixCell value={row.v[1]} strong={strong} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
