import { Fragment, useState } from "react";
// import { CheckIcon, MinusIcon } from '@heroicons/react/20/solid'
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
    enterprise: 999,
  },
  monthly: {
    starter: 0,
    premium: 2449,
    enterprise: 2999,
  },
};

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
  const billingTermValue = term ? "annual" : "monthly";
  const billingTerm = term ? prices["annual"] : prices["monthly"];
  return (
    <div className="bg-white pb-10 pt-24 sm:pb-10 sm:pt-16">
      <div className="max-w-8xl mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-p2blue-500">
            Pricing for Hosting
          </h2>
          <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Simple. Predictable. Scalable.
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
          Phase Two hosting is priced per cluster. No hidden fees, no
          unpredictable costs, and generous limits to get your team started. All
          tiers can be purchased directly in the dashboard.
        </p>

        <Field className="flex items-center justify-center gap-2">
          <Label
            className={cs({
              "font-bold": billingTermValue === "monthly",
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
            className={cs({
              "font-bold": billingTermValue === "annual",
            })}
          >
            Annual
          </Label>
        </Field>

        {/* xs to lg */}
        <div className="mx-auto mt-12 max-w-md space-y-8 sm:mt-16 lg:hidden">
          {tiers.map((tier) => (
            <section
              key={tier.id}
              className={cn(
                tier.mostPopular
                  ? "ring-2 ring-p2blue-500"
                  : "ring-1 ring-gray-200",
                "rounded-lg bg-white p-6 shadow-sm",
              )}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {tier.name}
              </h3>
              <p className="mt-2 flex items-baseline gap-x-1 text-gray-900">
                <span className="text-3xl font-semibold">
                  {tier.id === "custom"
                    ? tier.priceMonthly[billingTermValue]
                    : CurrencyNumberFormat(
                        tier.priceMonthly[billingTermValue] as number,
                      )}
                </span>
                {tier.id !== "custom" && (
                  <span className="text-sm font-medium text-gray-500">
                    /month
                  </span>
                )}
              </p>
              <a
                href={tier.href}
                className={cn(
                  tier.mostPopular
                    ? "bg-p2blue-600 text-white hover:bg-p2blue-500"
                    : "text-p2blue-600 ring-1 ring-inset ring-p2blue-300 hover:ring-p2blue-500",
                  "mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold transition",
                )}
              >
                {tier.id === "custom" ? "Contact sales" : "Get started"}
              </a>

              <div className="mt-6 border-t border-gray-200 pt-4">
                {sections.map((section) => (
                  <div key={section.name} className="mb-6">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      {section.name}
                    </h4>
                    <ul
                      role="list"
                      className="ml-0 list-inside list-none space-y-4 pl-0 text-sm text-gray-800"
                    >
                      {section.features.map((feature) =>
                        feature.tiers[tier.id] ? (
                          <li
                            key={feature.name}
                            className="flex items-start gap-x-2"
                          >
                            <Icon
                              icon="mdi:check"
                              className="mt-0.5 h-5 w-5 text-p2blue-500"
                              aria-hidden="true"
                            />
                            <span>
                              {feature.name}
                              {typeof feature.tiers[tier.id] === "string" && (
                                <span className="ml-1 text-gray-500">
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
            </section>
          ))}
        </div>

        {/* lg+ */}
        <div className="isolate mt-20 hidden rounded-md bg-stone-100 p-2 pb-0 lg:block">
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
                  <div className="w-full rounded-t-xl border-x border-t border-gray-900/10 bg-gray-500/5" />
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
                      <div className="text-sm/7 font-semibold text-gray-900">
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
                        <div className="flex items-baseline gap-x-1 text-gray-900">
                          <span className="text-4xl font-semibold">
                            {tier.priceMonthly[billingTermValue]}
                          </span>
                        </div>
                        <a
                          href={tier.href}
                          className={cn(
                            tier.mostPopular
                              ? "bg-p2blue-600 text-white hover:bg-p2blue-500 hover:text-white"
                              : "text-p2blue-500 ring-1 ring-inset ring-p2blue-400 hover:ring-p2blue-600",
                            "mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-p2blue-600",
                          )}
                        >
                          Contact sales
                        </a>
                      </td>
                    ) : (
                      <td
                        key={tier.id}
                        className="content-end px-6 pt-2 xl:px-8"
                      >
                        {billingTermValue === "annual" && (
                          <div className="text-3xl font-semibold text-red-500 line-through">
                            {tier.id !== "custom" &&
                              tier.id !== "starter" &&
                              CurrencyNumberFormat(
                                tier.priceMonthly["monthly"] as number,
                              )}
                          </div>
                        )}
                        <div className="flex items-baseline gap-x-1 text-gray-900">
                          <span className="text-4xl font-semibold">
                            {CurrencyNumberFormat(
                              tier.priceMonthly[billingTermValue],
                            )}
                          </span>
                          <span className="text-sm/6 font-semibold">
                            {tier.id === "custom" ? "" : "/month"}
                          </span>
                        </div>

                        <a
                          href={tier.href}
                          className={cn(
                            tier.mostPopular
                              ? "bg-p2blue-600 text-white hover:bg-p2blue-500 hover:text-white"
                              : "text-p2blue-500 ring-1 ring-inset ring-p2blue-400 hover:ring-p2blue-600",
                            "mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-p2blue-600",
                          )}
                        >
                          Get started
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
                          "pb-4 text-sm/6 font-semibold text-gray-900",
                        )}
                      >
                        {section.name}
                        <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/10" />
                      </th>
                    </tr>
                    {section.features.map((feature) => (
                      <tr key={feature.name}>
                        <th
                          scope="row"
                          className="py-4 text-sm/6 font-normal text-gray-900"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {feature.name}
                            <div className="flex items-center gap-2">
                              {feature.externalLink && (
                                <a
                                  href={feature.externalLink.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-gray-900/60 hover:text-p2blue-500"
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
                                        className="-mb-1 size-4 text-gray-900/50"
                                      />
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content className="rounded-md bg-white px-3 py-2 text-sm/6 text-gray-900 shadow-md">
                                        {feature.description}
                                        <Tooltip.Arrow className="fill-white" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                </Tooltip.Provider>
                              )}
                            </div>
                          </div>
                          <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/5" />
                        </th>
                        {tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-4 xl:px-8">
                            {typeof feature.tiers[tier.id] === "string" ? (
                              <div className="text-center text-sm/6 text-gray-800">
                                {feature.tiers[tier.id]}
                              </div>
                            ) : (
                              <>
                                {feature.tiers[tier.id] === true ? (
                                  <Icon
                                    icon="mdi:check"
                                    aria-hidden="true"
                                    className="mx-auto block h-6 w-5 flex-none text-p2blue-500"
                                  />
                                ) : (
                                  <Icon
                                    icon="mdi:minus"
                                    aria-hidden="true"
                                    className="mx-auto block size-5 text-gray-400"
                                  />
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
