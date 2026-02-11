import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import { InlineIcon } from "@iconify/react";
import tsmcLogo from "./logos/tsmc@2x.png";
import toppanLogo from "./logos/toppan-merrill@2x.png";
// import pingLogo from "./logos/Ping-Logo-2.svg?url";

const features = [
  {
    name: "Escalating licensing and renewal costs",
    description:
      "Ping costs often rise faster than the value you get—especially as you add apps, users, and SSO connections. Teams also run into packaging limits (like connection counts or user pool constraints) that push upgrades without unlocking meaningful new capability.",
    href: "#",
    icon: "fa6-solid:chart-line",
  },
  {
    name: "Limited flexibility for customization and extensibility",
    description:
      "Custom login UX, extensions to complement your application, and deeper integrations can require workarounds or higher tiers. Many teams want more control over theming, authentication flows, and how the IdP connects to their application ecosystem via APIs and automation.",
    href: "#",
    icon: "fa6-solid:screwdriver-wrench",
  },
  {
    name: "App growth and scale challenges",
    description:
      "As your business evolves, IAM spend can scale with packaging and total directory size—not actual usage. If usage drops or your footprint changes, you may still be locked into the same cost structure, making it hard to align spend with real value.",
    href: "#",
    icon: "ph:crane-tower-bold",
  },
];

const savemartStats = [
  { label: "Active Users", value: ">5M" },
  { label: "Project Time", value: "60 days" },
  { label: "Annual Savings", value: ">$1M" },
  { label: "App Downtime", value: "Zero" },
];

const stats = [
  { label: "Active Users", value: "~1M" },
  { label: "Project Time", value: "90 days" },
  { label: "Annual Savings", value: ">$500K" },
  { label: "SSO Connections", value: "100+" },
];

export default function PingMigrations() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {/* page content */}
      <Layout
        title="Ping Identity Migrations"
        description="Customer migration examples from Ping Identity to Keycloak using Phase Two'"
      >
        <main>
          {/* Hero Section */}
          <div className="">
            <div className="relative isolate px-6 pt-14 lg:px-8">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              >
                <div
                  style={{
                    clipPath:
                      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  }}
                  className="aspect-1155/678 w-144.5 rotate-30 bg-linear-to-tr sm:w-288.75 relative left-[calc(50%-11rem)] -translate-x-1/2 from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)]"
                />
              </div>
              <div className="py-18 mx-auto max-w-2xl lg:py-32">
                <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                  <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-400 dark:ring-white/10 dark:hover:ring-white/20">
                    Keycloak is used by regulated enterprises, on-premise, or
                    hosted with Phase Two.
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
                    Migrate from Ping Identity to Keycloak
                  </h1>
                  <p className="mt-8 text-pretty text-lg font-medium text-gray-500 dark:text-gray-400 sm:text-xl/8">
                    Phase Two help teams replace Ping Identity with open-source
                    Keycloak, reducing cost ,operational overhead, and general
                    capability.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a href="mailto:sales@phasetwo.io" className="btnPrimary">
                      Get in touch
                    </a>
                    <a href="#why-teams-leave-ping" className="btnSecondary">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
              >
                <div
                  style={{
                    clipPath:
                      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  }}
                  className="aspect-1155/678 w-144.5 bg-linear-to-tr sm:w-288.75 relative left-[calc(50%+3rem)] -translate-x-1/2 from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)]"
                />
              </div>
            </div>
          </div>

          {/* Why teams leave Ping */}
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:mx-0">
                <h2 id="why-teams-leave-ping">Why teams leave Ping Identity</h2>
                <img
                  src="/img/logo-ping-identity.svg"
                  alt="Ping Identity Logo"
                  className="mt-4 h-8"
                />
                <p className="mt-6 text-lg/8 text-p2blue-800">
                  While Ping Identity has provided robust identity and access,
                  license costs have steadily risen, without any corresponding
                  increase in value. Customers want more control over identity
                  spend along with great capability.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  {features.map((feature) => (
                    <div key={feature.name} className="flex flex-col">
                      <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">
                        <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-sky-600 dark:bg-sky-500">
                          <InlineIcon
                            icon={feature.icon}
                            className="size-6 text-white"
                          />
                          <feature.icon
                            aria-hidden="true"
                            className="size-6 text-white"
                          />
                        </div>
                        {feature.name}
                      </dt>
                      <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600 dark:text-gray-400">
                        <p className="flex-auto">{feature.description}</p>
                        {/* <p className="mt-6">
                          <a
                            href={feature.href}
                            className="text-sm/6 font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                          >
                            Learn more <span aria-hidden="true">→</span>
                          </a>
                        </p> */}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          {/* Transition */}
          <div className="bg-p2blue-200 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:max-w-none">
                <div className="text-center">
                  <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                    Real customer stories
                  </h2>
                  <p className="mt-4 text-lg/8 text-gray-600 dark:text-gray-300">
                    Phase Two has helped numerous enterprises successfully move
                    from Ping Identity to Keycloak.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Savemart */}
          <div className="bg-white py-24 dark:bg-gray-900 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                <div className="lg:pr-4">
                  <div className="dark:after:inset-ring dark:after:inset-ring-white/10 relative overflow-hidden rounded-3xl bg-gray-900 px-6 pb-9 pt-64 shadow-2xl dark:bg-gray-800 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:rounded-3xl sm:px-12 lg:max-w-lg lg:px-8 lg:pb-8 xl:px-10 xl:pb-10">
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2669&q=80"
                      className="absolute inset-0 size-full rounded-3xl object-cover brightness-125 saturate-0"
                    />
                    <div className="absolute inset-0 bg-gray-900 mix-blend-multiply" />
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 -ml-16 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
                    >
                      <div
                        style={{
                          clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                        }}
                        className="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-40"
                      />
                    </div>
                    <figure className="relative isolate">
                      {/* <svg
                        fill="none"
                        viewBox="0 0 162 128"
                        aria-hidden="true"
                        className="absolute -left-2 -top-4 -z-10 h-32 stroke-white/20"
                      >
                        <path
                          d="M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                          id="0ef284b8-28c2-426e-9442-8655d393522e"
                        />
                        <use
                          x={86}
                          href="#0ef284b8-28c2-426e-9442-8655d393522e"
                        />
                      </svg> */}
                      <img alt="" src={tsmcLogo} className="h-12 w-auto" />
                      <blockquote className="mt-6 text-xl/8 font-semibold text-white">
                        <p>
                          Faced with an extremely costly contract renewal and
                          missing functionality, Phase Two helped migrate TSMC
                          off of Ping in record time.
                        </p>
                      </blockquote>
                      {/* <figcaption className="mt-6 text-sm/6 text-gray-300">
                        <strong className="font-semibold text-white">
                          Judith Rogers,
                        </strong>{" "}
                        CEO at Workcation
                      </figcaption> */}
                    </figure>
                  </div>
                </div>
                <div>
                  <div className="text-base/7 text-gray-700 dark:text-gray-400 lg:max-w-lg">
                    <a
                      href="https://www.thesavemartcompanies.com/"
                      target="_blank"
                    >
                      <p className="text-base/7 font-semibold text-p2blue-600 dark:text-p2blue-400">
                        The Save Mart Companies
                      </p>
                    </a>
                    <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                      On-premise Keycloak installation serving millions of
                      customers
                    </h1>
                    <div className="max-w-xl">
                      <p className="mt-6">
                        The Save Mart Companies is a family of food and grocery
                        stores, growing and expanding their stores and
                        offerings. Their existing PingIdentity solution was
                        costly and limiting their ability to customize and
                        extend their identity platform. Phase Two helped them
                        migrate to an <b>on-premise Keycloak</b> installation,
                        reducing costs and enabling greater flexibility.
                      </p>
                      <p className="mt-8">
                        The migration involved careful planning and execution to
                        ensure zero downtime and data integrity. Phase Two's
                        team worked closely with Save Mart's IT department to
                        tailor the Keycloak setup to their specific needs,
                        including custom authentication flows and integrations
                        with existing systems. Phase Two continues to maintain
                        and manage the on-premise installation, which has proved
                        to be more reliable than the previous commercial
                        offering from Ping Identity.
                      </p>
                      <p className="mt-8">
                        Movement to Keycloak managed by Phase Two has helped to
                        <b>recover millions of dollars annually</b> in licensing
                        fees, while also providing a more flexible and
                        extensible platform to support their growth.
                      </p>
                    </div>
                  </div>
                  <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-10 dark:border-gray-800 sm:grid-cols-4">
                    {savemartStats.map((stat, statIdx) => (
                      <div key={statIdx}>
                        <dt className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </dt>
                        <dd className="mt-2 text-3xl/10 font-bold tracking-tight text-gray-900 dark:text-white">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Toppan Merrill */}
          <div className="bg-white py-24 dark:bg-gray-900 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                <div className="lg:pr-4">
                  <div className="dark:after:inset-ring dark:after:inset-ring-white/10 relative overflow-hidden rounded-3xl bg-gray-900 px-6 pb-9 pt-64 shadow-2xl dark:bg-gray-800 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:rounded-3xl sm:px-12 lg:max-w-lg lg:px-8 lg:pb-8 xl:px-10 xl:pb-10">
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1623524580059-21e1d2bc7f59?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2669&q=80"
                      className="absolute inset-0 size-full rounded-3xl object-cover brightness-125 saturate-0"
                    />
                    <div className="absolute inset-0 bg-gray-900 mix-blend-multiply" />
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 -ml-16 -translate-x-1/2 -translate-y-1/2 transform-gpu blur-3xl"
                    >
                      <div
                        style={{
                          clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                        }}
                        className="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-40"
                      />
                    </div>
                    <figure className="relative isolate">
                      {/* <svg
                        fill="none"
                        viewBox="0 0 162 128"
                        aria-hidden="true"
                        className="absolute -left-2 -top-4 -z-10 h-32 stroke-white/20"
                      >
                        <path
                          d="M65.5697 118.507L65.8918 118.89C68.9503 116.314 71.367 113.253 73.1386 109.71C74.9162 106.155 75.8027 102.28 75.8027 98.0919C75.8027 94.237 75.16 90.6155 73.8708 87.2314C72.5851 83.8565 70.8137 80.9533 68.553 78.5292C66.4529 76.1079 63.9476 74.2482 61.0407 72.9536C58.2795 71.4949 55.276 70.767 52.0386 70.767C48.9935 70.767 46.4686 71.1668 44.4872 71.9924L44.4799 71.9955L44.4726 71.9988C42.7101 72.7999 41.1035 73.6831 39.6544 74.6492C38.2407 75.5916 36.8279 76.455 35.4159 77.2394L35.4047 77.2457L35.3938 77.2525C34.2318 77.9787 32.6713 78.3634 30.6736 78.3634C29.0405 78.3634 27.5131 77.2868 26.1274 74.8257C24.7483 72.2185 24.0519 69.2166 24.0519 65.8071C24.0519 60.0311 25.3782 54.4081 28.0373 48.9335C30.703 43.4454 34.3114 38.345 38.8667 33.6325C43.5812 28.761 49.0045 24.5159 55.1389 20.8979C60.1667 18.0071 65.4966 15.6179 71.1291 13.7305C73.8626 12.8145 75.8027 10.2968 75.8027 7.38572C75.8027 3.6497 72.6341 0.62247 68.8814 1.1527C61.1635 2.2432 53.7398 4.41426 46.6119 7.66522C37.5369 11.6459 29.5729 17.0612 22.7236 23.9105C16.0322 30.6019 10.618 38.4859 6.47981 47.558L6.47976 47.558L6.47682 47.5647C2.4901 56.6544 0.5 66.6148 0.5 77.4391C0.5 84.2996 1.61702 90.7679 3.85425 96.8404L3.8558 96.8445C6.08991 102.749 9.12394 108.02 12.959 112.654L12.959 112.654L12.9646 112.661C16.8027 117.138 21.2829 120.739 26.4034 123.459L26.4033 123.459L26.4144 123.465C31.5505 126.033 37.0873 127.316 43.0178 127.316C47.5035 127.316 51.6783 126.595 55.5376 125.148L55.5376 125.148L55.5477 125.144C59.5516 123.542 63.0052 121.456 65.9019 118.881L65.5697 118.507Z"
                          id="0ef284b8-28c2-426e-9442-8655d393522e"
                        />
                        <use
                          x={86}
                          href="#0ef284b8-28c2-426e-9442-8655d393522e"
                        />
                      </svg> */}
                      <img alt="" src={toppanLogo} className="h-12 w-auto" />
                      <blockquote className="mt-6 text-xl/8 font-semibold text-white">
                        <p>
                          Toppan Merrill needed to move off Ping Identity to
                          reduce costs but also wanted to improve their identity
                          platform's flexibility to support new application
                          growth.
                        </p>
                      </blockquote>
                      {/* <figcaption className="mt-6 text-sm/6 text-gray-300">
                        <strong className="font-semibold text-white">
                          Judith Rogers,
                        </strong>{" "}
                        CEO at Workcation
                      </figcaption> */}
                    </figure>
                  </div>
                </div>
                <div>
                  <div className="text-base/7 text-gray-700 dark:text-gray-400 lg:max-w-lg">
                    <a href="https://www.toppanmerrill.com/" target="_blank">
                      <p className="text-base/7 font-semibold text-p2blue-600 dark:text-p2blue-400">
                        Toppan Merrill
                      </p>
                    </a>
                    <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                      Identity provider consolidation to support growth
                    </h1>
                    <div className="max-w-xl">
                      <p className="mt-6">
                        Toppan Merrill was approaching a Ping contract renewal
                        that would significantly increase cost without adding
                        meaningful new capability. At the same time, their
                        identity landscape had grown into a mix of
                        systems—including a homegrown provider—making it harder
                        to operate consistently and move quickly.
                      </p>
                      <p className="mt-8">
                        Phase Two helped Toppan Merrill consolidate onto
                        Keycloak as a single, extensible foundation. Using the{" "}
                        <a href="/product/organizations">
                          Phase Two Organizations extension
                        </a>
                        , they expanded the number of customer SSO connections
                        they could support while keeping tenant boundaries,
                        administration, and policy management straightforward.
                      </p>
                      <p className="mt-8">
                        With Keycloak in place, Toppan Merrill was able to
                        migrate their production system off of Ping Identity
                        with zero downtime and ultimately set up their futures
                        for further consolidation off of Auth0. The result is an
                        identity platform that supports new application
                        development without negotiating new identity contracts
                        for every new initiative.
                      </p>
                    </div>
                  </div>
                  <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-10 dark:border-gray-800 sm:grid-cols-4">
                    {stats.map((stat, statIdx) => (
                      <div key={statIdx}>
                        <dt className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </dt>
                        <dd className="mt-2 text-3xl/10 font-bold tracking-tight text-gray-900 dark:text-white">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-p2blue-300">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Discuss replacing Ping with Keycloak
              </h2>
              <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
                <a href="mailto:sales@phasetwo.io" className="btnPrimary">
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}
