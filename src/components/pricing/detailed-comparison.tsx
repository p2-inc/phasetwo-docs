import { Fragment, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import cn from "classnames";
import { Tooltip } from "radix-ui";
import sections from "./sections";

type TierId = "starter" | "premium" | "enterprise" | "custom";
type TierValue = boolean | string | ReactNode;

export type Feature = {
  name: string;
  description?: string;
  externalLink?: {
    href: string;
    icon: string;
  };
  tiers: Record<TierId, TierValue>;
};

type Tier = {
  id: TierId;
  name: string;
  popular: boolean;
};

const TIERS: Tier[] = [
  { id: "starter", name: "Starter", popular: false },
  { id: "premium", name: "Premium", popular: true },
  { id: "enterprise", name: "Enterprise", popular: false },
  { id: "custom", name: "Custom", popular: false },
];

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

function Cell({ value }: { value: TierValue }) {
  if (value === true) return <GreenCheck />;
  if (value === false)
    return (
      <span className="text-lg leading-none text-gray-600" aria-hidden="true">
        &mdash;
      </span>
    );
  return <span className="text-gray-300">{value}</span>;
}

function FeatureLabel({ feature }: { feature: Feature }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{feature.name}</span>
      {feature.externalLink && (
        <a
          href={feature.externalLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-gray-400 hover:text-p2blue-400"
        >
          <Icon
            icon={feature.externalLink.icon}
            className="size-4"
            aria-hidden="true"
          />
        </a>
      )}
      {feature.description && (
        <Tooltip.Provider delayDuration={300}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className="inline-flex">
                <Icon
                  icon="mdi:information-circle-outline"
                  className="size-4 cursor-help text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="z-[2000] max-w-xs rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm/6 text-gray-200 shadow-lg">
                {feature.description}
                <Tooltip.Arrow className="fill-[#1a1a1a]" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </span>
  );
}

export default function DetailedPriceComparison() {
  const [expanded, setExpanded] = useState<Set<TierId>>(new Set());

  const toggleMobile = (id: TierId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-10">
      {/* lg+ : full comparison grid */}
      <div className="hidden overflow-hidden rounded-[18px] border border-white/10 bg-[var(--ifm-background-surface-color)] lg:block">
        <table className="p2-cmp table w-full table-fixed text-[13.5px]">
          <caption className="sr-only">Pricing plan comparison</caption>
          <thead>
            <tr>
              <th className="w-[34%] px-4 py-5 text-left align-bottom" />
              {TIERS.map((tier) => (
                <th
                  key={tier.id}
                  className={cn(
                    "px-4 py-5 text-center align-bottom",
                    tier.popular && "bg-p2blue-500/[0.07]",
                  )}
                >
                  <div className="text-[15px] font-bold text-white">
                    {tier.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <Fragment key={section.name}>
                <tr>
                  <td
                    colSpan={TIERS.length + 1}
                    className="bg-black/30 px-4 py-2 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400"
                  >
                    {section.name}
                  </td>
                </tr>
                {section.features.map((feature) => (
                  <tr key={feature.name}>
                    <td className="px-4 py-3.5 text-left text-gray-300">
                      <FeatureLabel feature={feature} />
                    </td>
                    {TIERS.map((tier) => (
                      <td
                        key={tier.id}
                        className={cn(
                          "px-4 py-3.5 text-center",
                          tier.popular && "bg-p2blue-500/[0.07]",
                        )}
                      >
                        <Cell value={feature.tiers[tier.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* xs–lg : collapsible per-tier cards */}
      <div className="space-y-4 lg:hidden">
        {TIERS.map((tier) => {
          const isExpanded = expanded.has(tier.id);
          return (
            <section
              key={tier.id}
              className={cn(
                "overflow-hidden rounded-[18px] border border-white/10 bg-[var(--ifm-background-surface-color)]",
                tier.popular
                  ? "ring-2 ring-p2blue-500"
                  : "ring-1 ring-white/10",
              )}
            >
              <button
                type="button"
                onClick={() => toggleMobile(tier.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
                aria-expanded={isExpanded}
              >
                <div>
                  <h3 className="mb-0 text-lg font-semibold text-white">
                    {tier.name}
                  </h3>
                </div>
                <Icon
                  icon="mdi:chevron-down"
                  className={cn(
                    "size-6 flex-shrink-0 text-gray-400",
                    isExpanded && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 p-4">
                  {sections.map((section) => (
                    <div key={section.name} className="mb-5 last:mb-0">
                      <h4 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-gray-400">
                        {section.name}
                      </h4>
                      <ul className="ml-0 list-none space-y-2.5 pl-0 text-sm text-gray-300">
                        {section.features.map((feature) => {
                          const value = feature.tiers[tier.id];
                          if (value === false) return null;
                          return (
                            <li
                              key={feature.name}
                              className="flex items-start gap-x-2"
                            >
                              <span className="mt-0.5">
                                <GreenCheck />
                              </span>
                              <span>
                                {feature.name}
                                {typeof value === "string" && (
                                  <span className="text-gray-400">
                                    {" "}
                                    ({value})
                                  </span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
