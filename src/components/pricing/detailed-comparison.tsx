import { Fragment } from "react";
// import { CheckIcon, MinusIcon } from '@heroicons/react/20/solid'
import { Icon } from "@iconify/react";
import cn from "classnames";
import { Tooltip } from "radix-ui";

const prices = {
  annual: {
    starter: 0,
    premium: 499,
    enterprise: 1999,
  },
  monthly: {
    starter: 0,
    premium: 749,
    enterprise: 2499,
  },
};

const tiers = [
  {
    name: "Starter",
    id: "tier-starter",
    href: "https://dash.phasetwo.io",
    priceMonthly: {
      annual: "$0",
      monthly: "$0",
    },
    mostPopular: false,
  },
  {
    name: "Premium",
    id: "tier-premium",
    href: "https://dash.phasetwo.io",
    priceMonthly: {
      annual: `$${prices.annual.premium}`,
      monthly: `$${prices.monthly.premium}`,
    },
    mostPopular: false,
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    href: "https://dash.phasetwo.io",
    priceMonthly: {
      annual: `$${prices.annual.enterprise}`,
      monthly: `$${prices.monthly.enterprise}`,
    },
    mostPopular: true,
  },
  {
    name: "Custom",
    id: "tier-custom",
    href: "https://phasetwo.io/contact",
    priceMonthly: {
      annual: "$--",
      monthly: "$--",
    },
    mostPopular: false,
  },
];

type TierValue = boolean | string | React.ReactNode;

type Feature = {
  name: string;
  description?: string;
  tiers: {
    Premium?: TierValue;
    Enterprise?: TierValue;
    Custom?: TierValue;
  };
};

const sections: {
  name: string;
  features: Feature[];
}[] = [
  {
    name: "Core Features",
    features: [
      {
        name: "Dedicated cluster (HA)",
        description:
          "An isolated, high-availability Keycloak environment running in a dedicated cloud instance.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Unlimited users",
        description:
          "No artificial limits on the number of users in your realms.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Concurrent user sessions (max)",
        description: "Number of active user sessions supported.",
        tiers: {
          Premium: "10K",
          Enterprise: "50K",
          Custom: "Custom",
        },
      },
      {
        name: "SSO connections",
        description: "Number of supported identity provider (SSO) connections.",
        tiers: { Premium: "10", Enterprise: "Unlimited", Custom: true },
      },
      {
        name: "Custom domain(s)",
        description: "Use your own domain(s) for login and account pages.",
        tiers: { Premium: "5", Enterprise: "15", Custom: true },
      },
      {
        name: "Default theme CSS customization",
        description:
          "Modify the default Keycloak login theme via CSS overrides.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Custom themes",
        description:
          "Support for fully custom Keycloak themes with HTML, CSS, and JS.",
        tiers: { Premium: false, Enterprise: true, Custom: true },
      },
      {
        name: "Custom extensions",
        description: "Support for deploying custom Keycloak server extensions.",
        tiers: { Premium: false, Enterprise: true, Custom: true },
      },
      {
        name: "Global deployment(s)",
        description:
          "Deploy in the geographic region of your choice for compliance and performance with global routing.",
        tiers: { Premium: false, Enterprise: true, Custom: true },
      },
      {
        name: "Multi-region deployment(s)",
        description:
          "Deploy across multiple regions for redundancy and disaster recovery.",
        tiers: { Premium: false, Enterprise: false, Custom: true },
      },
      {
        name: "On-premise deployment(s)",
        description:
          "Deploy into your own cloud or on-premises infrastructure.",
        tiers: { Premium: false, Enterprise: false, Custom: true },
      },
    ],
  },
  {
    name: "Extensions",
    features: [
      {
        name: "Organizations (Phase Two)",
        description: "Simple multi-tenancy and role delegation via API.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Events",
        description:
          "Audit logging for compliance and webhooks for user and system activity notifications.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Magic Link",
        description: "Passwordless authentication using links sent to email.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Themes",
        description: "Easy login UI and email content customizations.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Admin UI",
        description:
          "Keycloak Admin UI additions to administer Phase Two extensions directly from Keycloak.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Admin Portal",
        description:
          "User self-management for their account and organizations.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "IdP Wizards",
        description:
          "Identity Provider setup wizards for self-management of SSO admins and organizations.",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
    ],
  },
  {
    name: "Support and Observability",
    features: [
      {
        name: "Keycloak version upgrades (planned)",
        tiers: {
          Premium: "Automatic",
          Enterprise: "Automatic/Coordinated",
          Custom: "Custom schedule",
        },
      },
      {
        name: "Audit logs",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
      {
        name: "Alerting",
        tiers: { Premium: false, Enterprise: true, Custom: true },
      },
      {
        name: "Comms",
        tiers: { Premium: "Email", Enterprise: "Slack/Email", Custom: true },
      },
      {
        name: "Dedicated support",
        tiers: { Premium: false, Enterprise: true, Custom: true },
      },
    ],
  },
  {
    name: "Availability",
    features: [
      {
        name: "Regions",
        tiers: {
          Premium: "AMER, EU, APAC",
          Enterprise: "AMER, EU, APAC",
          Custom: "Custom",
        },
      },
      {
        name: "Providers",
        description:
          "Don't see your preferred cloud provider? We are adding more all the time.",
        tiers: {
          Premium: "AWS",
          Enterprise: "AWS",
          Custom: "AWS, Azure, GCP, or your choice",
        },
      },
      {
        name: "Uptime Guarantee",
        tiers: { Premium: "99.9%", Enterprise: "99.99%", Custom: "99.99%" },
      },
      {
        name: "SLA",
        tiers: {
          Premium: true,
          Enterprise: "Enhanced SLA",
          Custom: "Custom SLA",
        },
      },
      {
        name: "SOC 2",
        tiers: { Premium: true, Enterprise: true, Custom: true },
      },
    ],
  },
];

export default function DetailedPriceComparison({ term }) {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base/7 font-semibold text-p2blue-500">Pricing</h2>
          <p className="mt-2 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Simple. Predictable. Scalable.
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-center text-lg font-medium text-gray-600 sm:text-xl/8">
          Phase Two is priced per cluster. No hidden fees, no unpredictable
          costs, generous limits to get your team started.
        </p>

        {/* xs to lg */}
        {/* <div className="mx-auto mt-12 max-w-md space-y-8 sm:mt-16 lg:hidden">
          {tiers.map((tier) => (
            <section
              key={tier.id}
              className={cn(
                tier.mostPopular ? 'rounded-xl bg-gray-400/5 ring-1 ring-gray-200 ring-inset' : '',
                'p-8',
              )}
            >
              <h3 id={tier.id} className="text-sm/6 font-semibold text-gray-900">
                {tier.name}
              </h3>
              <p className="mt-2 flex items-baseline gap-x-1 text-gray-900">
                <span className="text-4xl font-semibold">{tier.priceMonthly}</span>
                <span className="text-sm font-semibold">/month</span>
              </p>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={cn(
                  tier.mostPopular
                    ? 'bg-p2blue-600 text-white hover:bg-p2blue-500'
                    : 'text-p2blue-500 ring-1 ring-p2blue-200 ring-inset hover:ring-p2blue-300',
                  'mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-p2blue-600 hover:text-white',
                )}
              >
                Buy plan
              </a>
              <ul role="list" className="mt-10 space-y-4 text-sm/6 text-gray-900">
                {sections.map((section) => (
                  <li key={section.name}>
                    <ul role="list" className="space-y-4">
                      {section.features.map((feature) =>
                        feature.tiers[tier.name] ? (
                          <li key={feature.name} className="flex gap-x-3">
                            <Icon icon="mdi:check" aria-hidden="true" className="h-6 w-5 flex-none text-p2blue-500 block" />
                            <span>
                              {feature.name}{' '}
                              {typeof feature.tiers[tier.name] === 'string' ? (
                                <span className="text-sm/6 text-gray-500">({feature.tiers[tier.name]})</span>
                              ) : null}
                            </span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div> */}

        {/* lg+ */}
        <div className="isolate mt-20 hidden rounded-md bg-stone-50 p-2 pb-0 lg:block">
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
                    tier.id === "tier-custom" ? (
                      <td
                        key={tier.id}
                        className="content-end px-6 pt-2 xl:px-8"
                      >
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
                      <td key={tier.id} className="px-6 pt-2 xl:px-8">
                        <div className="flex items-baseline gap-x-1 text-gray-900">
                          <span className="text-4xl font-semibold">
                            {tier.priceMonthly[term]}
                          </span>
                          <span className="text-sm/6 font-semibold">
                            {tier.id === "tier-custom" ? "" : "/month"}
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
                          <div className="flex items-center gap-2">
                            {feature.name}
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
                          <div className="absolute inset-x-8 mt-4 h-px bg-gray-900/5" />
                        </th>
                        {tiers.map((tier) => (
                          <td key={tier.id} className="px-6 py-4 xl:px-8">
                            {typeof feature.tiers[tier.name] === "string" ? (
                              <div className="text-center text-sm/6 text-gray-500">
                                {feature.tiers[tier.name]}
                              </div>
                            ) : (
                              <>
                                {feature.tiers[tier.name] === true ? (
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
