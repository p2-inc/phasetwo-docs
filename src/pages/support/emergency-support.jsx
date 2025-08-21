import React from "react";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";
import { InlineIcon } from "@iconify/react/dist/iconify.js";

const features = [
  {
    name: "Immediate assistance",
    description:
      "A small group of hours can be purchased for emergency support. This is ideal for customers who need immediate assistance with Keycloak but do not have a support contract.",
    href: "#",
    icon: <InlineIcon icon="mdi:run-fast" className="size-6 text-white" />,
  },
  {
    name: "No commitment",
    description:
      "This package is designed for customers who need urgent help but do not want to commit to a full support contract. It provides a flexible way to get assistance when needed.",
    href: "#",
    icon: <InlineIcon icon="mdi:lighthouse-on" className="size-6 text-white" />,
  },
  {
    name: "Keycloak expertise",
    description:
      "Whether it is infrastucture, configuration, or troubleshooting, our team has the expertise to help you resolve issues quickly.",
    href: "#",
    icon: <InlineIcon icon="mdi:brain" className="size-6 text-white" />,
  },
];

const features2 = [
  {
    name: "Flat fee.",
    description:
      "The package starts with a 5 hour block of time, which can be used for any Keycloak-related issues. Additional hours are available if needed. Contact for pricing.",
    href: "#",
    icon: (
      <InlineIcon icon="mdi:attach-money" className="size-6 text-fuchsia-600" />
    ),
  },
  {
    name: "Determined resolution.",
    description:
      "We will work to find a solution. Most customers can be unblocked quickly, but if the issue is complex, we will provide a detailed plan to resolve it.",
    href: "#",
    icon: (
      <InlineIcon
        icon="mdi:progress-wrench"
        className="size-6 text-fuchsia-600"
      />
    ),
  },
];

export default function EmergencySupport() {
  return (
    <Layout title="Emergency Support">
      <main className="container">
        <div className="pageHero">
          <div className={styles.bgImg}>
            <img
              src="/img/gradient-bg.webp"
              alt="Color Gradient"
              loading="lazy"
            />
          </div>
          <div className={`pageHeroBgCircles`}>
            <img
              src="/img/circles.svg"
              alt="Concentric Circles"
              loading="lazy"
            />
          </div>
        </div>
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-pretty text-4xl font-semibold tracking-tight text-fuchsia-600 dark:text-white sm:text-5xl">
                Emergency Keycloak Assistance
              </h2>
              <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
                If you are looking for emergency assistance with Keycloak, we
                are here to help. We offer a package that provides a limited set
                of hours to quickly assist you with urgent issues.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="text-base/7 font-semibold text-gray-900 dark:text-white">
                      <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-fuchsia-600 dark:bg-fuchsia-500">
                        {feature.icon}
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-1 flex flex-auto flex-col text-base/7 text-gray-600 dark:text-gray-400">
                      <p className="flex-auto">{feature.description}</p>
                      {/* <p className="mt-6">
                        <a
                          href={feature.href}
                          className="text-sm/6 font-semibold text-p2blue-600 hover:text-p2blue-500 dark:text-p2blue-400 dark:hover:text-p2blue-300"
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
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <a href="/contact">
              <button className={`btnPrimary btnLarge btnSupport`}>
                Get help now!
              </button>
            </a>
          </div>
          <div className="overflow-hidden sm:py-32">
            <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:grid-cols-2 lg:items-start">
                <div className="px-6 lg:px-0 lg:pr-4 lg:pt-4">
                  <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg">
                    <h2 className="text-base/7 font-semibold text-fuchsia-600 dark:text-fuchsia-400">
                      Package Details
                    </h2>
                    <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                      Simple. Effective. Emergency Support.
                    </p>
                    <p className="mt-6 text-lg/8 text-gray-600 dark:text-gray-300">
                      For when you run out patience with searching online and AI
                      has failed you, our emergency support package is designed
                      to get you back on track quickly. We understand that time
                      is of the essence when it comes to critical issues.
                    </p>
                    <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 dark:text-gray-400 lg:max-w-none">
                      {features2.map((feature) => (
                        <div key={feature.name} className="relative">
                          <dt className="inline font-semibold text-gray-900 dark:text-white">
                            <span className="-mb-4 mr-2">{feature.icon}</span>
                            {feature.name}
                          </dt>{" "}
                          <dd className="inline">{feature.description}</dd>
                        </div>
                      ))}
                    </dl>
                    <figure className="mt-16 border-l border-gray-200 pl-8 text-gray-700 dark:border-gray-700 dark:text-gray-300">
                      <blockquote className="border-0 px-0 text-base/7">
                        <p>
                          When faced with integrating Keycloak and a US State
                          Government's system,{" "}
                          <a href="https://www.idemia.com/" target="_blank">
                            Idemia
                          </a>{" "}
                          engaged Phase Two to help resolve multiple system
                          integration hurdles to meet a tight deadline and keep
                          the customer satisfied.
                        </p>
                      </blockquote>
                      <figcaption className="mt-6 flex gap-x-4 text-sm/6">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            &lt;24 hours
                          </span>{" "}
                          –{" "}
                          <span className="text-gray-600 dark:text-gray-400">
                            from first contact to resolution
                          </span>
                        </div>
                      </figcaption>
                    </figure>
                    <a href="/contact" className="mt-10 block">
                      <button className={`btnPrimary btnLarge btnSupport`}>
                        Get in touch
                      </button>
                    </a>
                  </div>
                </div>
                <div className="sm:px-6 lg:px-0">
                  <div className="relative isolate overflow-hidden bg-fuchsia-500 px-6 pt-8 sm:mx-auto sm:max-w-2xl sm:rounded-3xl sm:pl-16 sm:pr-0 sm:pt-16 lg:mx-0 lg:max-w-none">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-y-px -left-3 -z-10 w-full origin-bottom-left skew-x-[-30deg] bg-fuchsia-200 opacity-20 ring-1 ring-inset ring-white"
                    />
                    <div className="mx-auto max-w-2xl sm:mx-0 sm:max-w-none">
                      <img
                        alt="Product screenshot"
                        src="/img/support/realms-view.png"
                        width={2432}
                        height={1442}
                        className="w-228 -mb-12 max-w-none rounded-tl-xl bg-gray-800 ring-1 ring-white/10 dark:hidden"
                      />
                    </div>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 sm:rounded-3xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
