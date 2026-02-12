import { Fragment, useState } from "react";
import { Icon } from "@iconify/react";
import cn from "classnames";
import { Tooltip } from "radix-ui";
import { CurrencyNumberFormat } from "./utils";
import sections from "./sections";
import { Switch, Label, Field } from "@headlessui/react";
import cs from "classnames";

const prices = {
  annual: {
    starter: 0,
    premium: 749,
    enterprise: 2499,
  },
  monthly: {
    starter: 0,
    premium: 999,
    enterprise: 2999,
  },
};

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10.1791 1.10639C10.4179 0.94065 10.7419 0.968577 10.952 1.19004L11.8198 2.10514C12.0601 2.35857 12.0601 2.76937 11.8198 3.02277L4.43508 10.81C4.19476 11.0633 3.80519 11.0633 3.56488 10.81L0.18022 7.24085C-0.0600894 6.98744 -0.0600573 6.57664 0.18022 6.32321L1.04802 5.40811L1.14417 5.32446C1.38281 5.15833 1.70789 5.18687 1.91822 5.40811L3.99998 7.597L10.0818 1.19004L10.1791 1.10639Z" fill="black" />
  </svg>
);

const tiers = [
  {
    name: "Starter",
    id: "starter",
    href: "https://dash.phasetwo.io",
    priceMonthly: {
      annual: 0,
      monthly: 0,
    },
    mostPopular: false,
  },
  {
    name: "Premium",
    id: "premium",
    href: "https://dash.phasetwo.io",
    priceMonthly: {
      annual: prices.annual.premium,
      monthly: prices.monthly.premium,
    },
    mostPopular: false,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    href: "https://dash.phasetwo.io",
    priceMonthly: {
      annual: prices.annual.enterprise,
      monthly: prices.monthly.enterprise,
    },
    mostPopular: true,
  },
  {
    name: "Custom/On-Premise",
    id: "custom",
    href: "https://phasetwo.io/contact",
    priceMonthly: {
      annual: "Custom",
      monthly: "Custom",
    },
    mostPopular: false,
  },
];

type TierValue = boolean | string | React.ReactNode;

export type Feature = {
  name: string;
  description?: string;
  externalLink?: {
    href: string;
    icon: string;
  };
  tiers: {
    starter: TierValue;
    premium: TierValue;
    enterprise: TierValue;
    custom: TierValue;
  };
};

export default function DetailedPriceComparison() {
  const [term, setTerm] = useState(true);
  const [expandedMobile, setExpandedMobile] = useState<Set<string>>(new Set());
  const billingTermValue = term ? "annual" : "monthly";

  const toggleMobile = (id: string) => {
    setExpandedMobile((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="pb-10">
      <div className="max-w-8xl mx-auto px-6 lg:px-8">
        <Field className="flex items-center justify-center gap-2">
          <Label
            className={cs("text-gray-300", {
              "font-bold text-white": billingTermValue === "monthly",
            })}
          >
            Monthly
          </Label>
          <Switch
            checked={term}
            onChange={setTerm}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-p2blue-600 transition data-[checked]:bg-p2blue-600"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
          <Label
            className={cs("text-gray-300", {
              "font-bold text-white": billingTermValue === "annual",
            })}
          >
            Annual
          </Label>
        </Field>

        {/* xs to lg - collapsible mobile cards */}
        <div className="mx-auto mt-8 max-w-md space-y-8 sm:mt-8 lg:hidden">
          {tiers.map((tier) => {
            const isExpanded = expandedMobile.has(tier.id);
            return (
              <section
                key={tier.id}
                className={cn(
                  tier.mostPopular
                    ? "ring-2 ring-p2blue-500"
                    : "ring-1 ring-white/10",
                  "rounded-[32px] border border-white/10 bg-[var(--ifm-background-surface-color)] overflow-hidden",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleMobile(tier.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {tier.name}
                    </h3>
                    <p className="mt-1 flex items-baseline gap-x-1 text-white">
                      <span className="text-2xl font-semibold">
                        {tier.id === "custom"
                          ? tier.priceMonthly[billingTermValue]
                          : CurrencyNumberFormat(
                              tier.priceMonthly[billingTermValue] as number,
                            )}
                      </span>
                      {tier.id !== "custom" && (
                        <span className="text-sm font-medium text-gray-400">
                          /month
                        </span>
                      )}
                    </p>
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
                  <div className="border-t border-white/10 p-4 pt-4">
                    <a href={tier.href} className="mb-4 block">
                      <button className="btnPrimary w-full" type="button">
                        {tier.id === "custom" ? "Contact sales" : "Get started"}
                      </button>
                    </a>

                    <div>
                      {sections.map((section) => (
                        <div key={section.name} className="mb-6">
                          <h4 className="mb-2 text-sm font-semibold text-gray-300">
                            {section.name}
                          </h4>
                          <ul
                            role="list"
                            className="ml-0 list-inside list-none space-y-4 pl-0 text-sm text-gray-300"
                          >
                            {section.features.map((feature) =>
                              feature.tiers[tier.id] ? (
                                <li
                                  key={feature.name}
                                  className="flex items-start gap-x-2"
                                >
                                  <span
                                    className="mt-0.5 inline-flex size-5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-p2blue-400 bg-p2blue-500"
                                    aria-hidden="true"
                                  >
                                    <CheckIcon />
                                  </span>
                                  <span>
                                    {feature.name}
                                    {typeof feature.tiers[tier.id] ===
                                      "string" && (
                                      <span className="ml-1 text-gray-400">
                                        ({feature.tiers[tier.id]})
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ) : null,
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* lg+ */}
        <div className="isolate mt-8 hidden rounded-[32px] border border-white/10 bg-[var(--ifm-background-surface-color)] p-2 pb-0 lg:block">
          <div className="relative -mx-8">
            {tiers.some((tier) => tier.mostPopular) ? (
              <div className="absolute inset-x-4 inset-y-0 -z-10 flex">
                <div
                  style={{
                    marginLeft: `${(tiers.findIndex((tier) => tier.mostPopular) + 1) * (100 / (tiers.length + 1))}%`,
                  }}
                  aria-hidden="true"
                  className="flex w-1/5 px-4"
                >
                  <div className="w-full rounded-t-xl border-x border-t border-white/10 bg-white/5" />
                </div>
              </div>
            ) : null}
            <table className="tw-table-pricing mb-0 table w-full table-fixed border-separate border-spacing-x-8 text-left">
              <caption className="sr-only">Pricing plan comparison</caption>
              <colgroup>
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-1/5" />
              </colgroup>
              <thead>
                <tr>
                  <td />
                  {tiers.map((tier) => (
                    <th
                      key={tier.id}
                      scope="col"
                      className="px-6 pt-6 xl:px-8 xl:pt-8"
                    >
                      <div className="text-sm/7 font-semibold text-white">
                        {tier.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t-0">
                  <th scope="row">
                    <span className="sr-only">Price</span>
                  </th>
                  {tiers.map((tier) =>
                    tier.id === "custom" ? (
                      <td
                        key={tier.id}
                        className="content-end px-6 pt-2 xl:px-8"
                      >
                        <div className="flex items-baseline gap-x-1 text-white">
                          <span className="text-4xl font-semibold">
                            {tier.priceMonthly[billingTermValue]}
                          </span>
                        </div>
                        <a href={tier.href} className="mt-8 block">
                          <button className="btnPrimary w-full">
                            Contact sales
                          </button>
                        </a>
                      </td>
                    ) : (
                      <td
                        key={tier.id}
                        className="content-end px-6 pt-2 xl:px-8"
                      >
                        {billingTermValue === "annual" && (
                          <div className="text-4xl font-semibold text-gray-500 line-through">
                            {tier.id !== "custom" &&
                              tier.id !== "starter" &&
                              CurrencyNumberFormat(
                                tier.priceMonthly["monthly"] as number,
                              )}
                          </div>
                        )}
                        <div className="flex items-baseline gap-x-1 text-white">
                          <span className="text-4xl font-semibold">
                            {CurrencyNumberFormat(
                              tier.priceMonthly[billingTermValue],
                            )}
                          </span>
                          <span className="text-sm/6 font-semibold text-gray-400">
                            {tier.id === "custom" ? "" : "/month"}
                          </span>
                        </div>

                        <a href={tier.href} className="mt-8 block">
                          <button className="btnPrimary w-full">
                            Get started
                          </button>
                        </a>
                      </td>
                    ),
                  )}
                </tr>
                {sections.map((section, sectionIdx) => (
                  <Fragment key={section.name}>
                    <tr>
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className={cn(
                        sectionIdx === 0 ? "pt-8" : "pt-16",
                        "pb-4 text-sm/6 font-semibold text-gray-300",
                      )}
                    >
                      {section.name}
                      <div className="absolute inset-x-8 mt-4 h-px bg-white/10" />
                      </th>
                    </tr>
                    {section.features.map((feature) => (
                      <tr key={feature.name}>
                        <th
                          scope="row"
                          className="py-4 text-sm/6 font-normal text-gray-300"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {feature.name}
                            <div className="flex items-center gap-2">
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
                                    <Tooltip.Trigger>
                                      <Icon
                                        icon="mdi:information-circle-outline"
                                        className="-mb-1 size-4 text-gray-400"
                                      />
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content className="rounded-md border border-white/10 bg-[#1a1a1a] px-3 py-2 text-sm/6 text-gray-200 shadow-lg">
                                        {feature.description}
                                        <Tooltip.Arrow className="fill-[#1a1a1a]" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                </Tooltip.Provider>
                              )}
                            </div>
                          </div>
                          <div className="absolute inset-x-8 mt-4 h-px bg-white/5" />
                        </th>
                        {tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-4 xl:px-8">
                            {typeof feature.tiers[tier.id] === "string" ? (
                              <div className="text-center text-sm/6 text-gray-300">
                                {feature.tiers[tier.id]}
                              </div>
                            ) : (
                              <>
                                {feature.tiers[tier.id] === true ? (
                                  <span
                                    className="mx-auto flex size-6 flex-none items-center justify-center rounded-full border-[1.5px] border-p2blue-400 bg-p2blue-500"
                                    aria-hidden="true"
                                  >
                                    <CheckIcon />
                                  </span>
                                ) : (
                                  <span
                                    className="mx-auto flex size-6 flex-none items-center justify-center rounded-full border-[1.5px] border-p2blue-400 bg-p2blue-500"
                                    aria-hidden="true"
                                  >
                                    <Icon
                                      icon="mdi:minus"
                                      aria-hidden="true"
                                      className="size-3.5 text-[#131313]"
                                    />
                                  </span>
                                )}

                                <span className="sr-only">
                                  {feature.tiers[tier.name] === true
                                    ? "Included"
                                    : "Not included"}{" "}
                                  in {tier.name}
                                </span>
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
