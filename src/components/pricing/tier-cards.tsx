import { useState } from "react";
import { Switch, Label, Field } from "@headlessui/react";
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

const DASH_URL = "https://dash.phasetwo.io/";

type Tier = {
  name: string;
  href: string;
  cta: string;
  monthly: number | null; // null → "Contact us"
  annual: number | null; // null → monthly-only (Starter) or contact (Custom)
  monthlyOnly?: boolean;
  popular?: boolean;
  badge?: string;
  badgeTone?: "success" | "primary" | "warning";
  trial?: boolean;
  desc: string;
  features: string[];
};

// Tinted chips matching the design tokens: 20% color over solid #0a0a0a (so
// they read richer than a low-alpha overlay), with a 35% color border.
const BADGE_TONE: Record<NonNullable<Tier["badgeTone"]>, string> = {
  success:
    "border border-[color-mix(in_srgb,#34D399_35%,transparent)] bg-[color-mix(in_srgb,#34D399_20%,#0a0a0a)] text-[#34D399]",
  primary: "bg-p2blue-500 text-[#1a1a1a]",
  warning:
    "border border-[color-mix(in_srgb,#E0A66E_35%,transparent)] bg-[color-mix(in_srgb,#E0A66E_20%,#0a0a0a)] text-[#E0A66E]",
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    href: DASH_URL,
    cta: "Start for free",
    monthly: 149,
    annual: null,
    monthlyOnly: true,
    badge: "30-day free trial",
    badgeTone: "success",
    trial: true,
    desc: "For new projects and small teams getting auth into production.",
    features: [
      "Up to 15K monthly active users",
      "Dedicated, independently provisioned cluster",
      "95% uptime guarantee",
      "Unlimited SSO connections · 1 custom domain",
      "Email support",
    ],
  },
  {
    name: "Premium",
    href: DASH_URL,
    cta: "Get started",
    monthly: 999,
    annual: 749,
    popular: true,
    badge: "Most popular",
    badgeTone: "primary",
    desc: "For growing products with real traffic and uptime requirements.",
    features: [
      "Up to 100K monthly active users",
      "99.5% uptime guarantee · Standard SLA",
      "Unlimited SSO connections · 5 custom domains",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    href: DASH_URL,
    cta: "Get started",
    monthly: 2999,
    annual: 2499,
    badge: "Built for scale",
    badgeTone: "warning",
    desc: "For high-scale products that need an uptime SLA and priority support.",
    features: [
      "Up to 250K monthly active users",
      "99.95% uptime guarantee · Enhanced SLA",
      "Unlimited SSO connections · 15 custom domains",
      "Dedicated support engineer + Slack",
      "Alerting & coordinated upgrades",
    ],
  },
];

function priceFor(tier: Tier, annual: boolean) {
  if (tier.monthly == null) return { amount: "Contact us", per: "" };
  const value = annual && tier.annual != null ? tier.annual : tier.monthly;
  return { amount: `$${value.toLocaleString()}`, per: "/month" };
}

function subline(tier: Tier, annual: boolean) {
  if (tier.trial) return "Free for 30 days, then $149/mo. Cancel anytime.";
  if (tier.monthlyOnly) return "Billed monthly.";
  if (annual && tier.annual != null)
    return `Billed annually. $${tier.monthly?.toLocaleString()}/mo billed monthly.`;
  if (tier.annual != null)
    return `or $${tier.annual.toLocaleString()}/mo billed annually.`;
  return " ";
}

export default function TierCards() {
  const [annual, setAnnual] = useState(true);
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
    <div>
      <Field className="flex items-center justify-center gap-2">
        <Label
          className={cn("text-gray-300", { "font-bold text-white": !annual })}
        >
          Monthly
        </Label>
        <Switch
          checked={annual}
          onChange={setAnnual}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-p2blue-600 transition"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
        <Label
          className={cn("text-gray-300", { "font-bold text-white": annual })}
        >
          Annual <span className="text-p2blue-400">· Save up to 25%</span>
        </Label>
      </Field>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const { amount, per } = priceFor(tier, annual);
          return (
            <section
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-[32px] border border-white/10 bg-[var(--ifm-background-surface-color)] p-7",
                tier.popular
                  ? "ring-2 ring-p2blue-500"
                  : "ring-1 ring-white/10",
              )}
            >
              {tier.badge && (
                <span
                  className={cn(
                    "absolute -top-3 left-7 rounded-full px-3 py-1 text-xs font-semibold",
                    BADGE_TONE[tier.badgeTone ?? "primary"],
                  )}
                >
                  {tier.badge}
                </span>
              )}
              <h3 className="mb-0 text-xl font-bold text-white">{tier.name}</h3>
              <p className="mt-2 min-h-[40px] text-sm text-gray-400">
                {tier.desc}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{amount}</span>
                {per && <span className="text-sm text-gray-400">{per}</span>}
              </div>
              <p className="mt-1 min-h-[32px] text-xs text-gray-400">
                {subline(tier, annual)}
              </p>

              <a
                href={tier.href}
                className="mt-5 block"
                target="_blank"
                rel="noreferrer"
              >
                <button className="btnPrimary w-full">{tier.cta}</button>
              </a>

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
          );
        })}
      </div>

      {/* Custom / on-premise callout */}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[24px] border border-p2blue-500/30 bg-gradient-to-br from-p2blue-500/10 to-transparent p-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="mb-1 text-lg font-bold text-white">
            Need something custom?
          </h3>
          <p className="mb-0 text-sm text-gray-400">
            Multi-region, on-premise, custom DPA, or unlimited scale? We&apos;ll
            size it with you.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-3">
          <a href={DASH_URL} target="_blank" rel="noreferrer">
            <button className="btnPrimary min-w-[140px]">Try it out</button>
          </a>
          <button
            type="button"
            className="btnPrimary btnSupport min-w-[140px]"
            onClick={() => setModalOpen(true)}
          >
            Talk to sales
          </button>
        </div>
      </div>

      <DemoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        demoRequestEndpoint={demoRequestEndpoint}
        turnstileSiteKey={turnstileSiteKey}
      />
    </div>
  );
}
