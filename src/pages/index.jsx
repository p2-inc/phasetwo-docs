import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { KeycloakSupportPackages } from "../components/keycloak-support-packages";
import { InlineIcon } from "@iconify/react";
import { useState } from "react";
import { Switch, Label, Field } from "@headlessui/react";
import cs from "classnames";
import StartYourJourney from "../components/ctas/start-your-journey";

function requestAccess() {
  window.open(`https://phasetwo.io/dashboard/`, "_blank");
}

function githubHome() {
  window.open(`https://github.com/p2-inc/`, "_blank");
}

function docsEntry() {
  window.location = `/docs/introduction`;
}

export const CheckMark = () => (
  <InlineIcon
    icon="fa-solid:check"
    className="absolute left-0 w-[10px] h-auto mt-2 text-green-500"
  />
);

const HostingItems = [
  {
    name: "Flat, Predictable Pricing",
    desc: (
      <p>
        A generous <span className="font-semibold">free tier</span> to get
        started and test out Keycloak. Simple, flat pricing for paid tiers.
        Migrate any initial test setups from test to production.
      </p>
    ),
    icon: "tabler:pig-money",
    cta: "Get started",
    href: "/pricing",
  },
  {
    name: "Multi-Region, High-Availability Clusters",
    desc: (
      <p>
        Hosted in multiple regions for high availability and low latency. Ensure{" "}
        <span className="font-semibold">uptime</span> and{" "}
        <span className="font-semibold">performance</span>. Choose to deploy in
        areas to comply with data residency requirements or specific
        applications needs.
      </p>
    ),
    icon: "gis:globe-alt",
    cta: "Explore architecture",
    href: "/hosting",
  },
  {
    name: "Unlimited Users & SSO Connections",
    desc: (
      <p>
        Unlimited users and SSO connections for a{" "}
        <span className="font-semibold">single, flat price</span>. Fees don't
        explode as your app grows and scales.
      </p>
    ),
    icon: "carbon:ibm-dynamic-route-server",
    cta: "Learn more",
    href: "/product/sso",
  },
  {
    name: "Extend and Customize",
    desc: (
      <p>
        Our included extensions make it{" "}
        <span className="font-semibold">easy to run Keycloak</span>. Customize
        your Keycloak instance further with your own extensions and themes.
      </p>
    ),
    icon: "grommet-icons:server-cluster",
    cta: "Learn more",
    href: "/hosting",
  },
  {
    name: "Version Upgrades",
    desc: (
      <p>
        We keep your instance(s) up to date with the latest Keycloak releases
        ensuring CVE's and other security issues are patched. Teams that{" "}
        <b>self-host</b> cite this as a <b>major pain point</b>.
      </p>
    ),
    icon: "ix:project-server",
    cta: "Why it matters",
    href: "/hosting",
  },

  {
    name: "24/7 Monitor, Alert, Backup",
    desc: (
      <p>
        <span className="font-semibold">24/7/365 support</span>. We aggressively{" "}
        <span className="font-semibold">monitor your clusters</span> and can
        connect to your existing systems to integrate with existing SRE
        practices. Routine DB backups are included.
      </p>
    ),
    icon: "mdi:graph-line",
    cta: "Learn more",
    href: "/hosting",
  },
];

const SupportItems = [
  {
    name: "On-premise Deployments + Infrastructure Design",
    desc: (
      <p>
        We can assist with <span className="font-semibold">designing</span> and{" "}
        <span className="font-semibold">deploying</span> Keycloak{" "}
        <span className="font-semibold">on-premise</span> or in the{" "}
        <span className="font-semibold">cloud</span>, leveraging the expertise
        we've built over the years to{" "}
        <span className="font-semibold">design and deploy robust systems</span>.
      </p>
    ),
    icon: "mdi:cloud-lock-outline",
    cta: "Learn more",
    href: "/hosting",
  },
  {
    name: "24/7 On-call Escalation",
    desc: (
      <p>
        We can provide <b>24/7 on-call escalation</b> for your Keycloak
        infrastructure, ensuring that in the event of an outage or other issue,
        your team has someone to call.
      </p>
    ),
    icon: "mdi:phone",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Keycloak Implementation, Scale, and Growth",
    desc: (
      <p>
        Whether just getting started or scaling up, we can assist with this. We
        have experience with Keycloak deployments of <b>all sizes</b> and{" "}
        <b>complexity</b>.
      </p>
    ),
    icon: "fluent:arrow-growth-20-filled",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Infrastructure and Code Review",
    desc: (
      <p>
        Reviewing your Keycloak infrastructure and code to ensure best practices
        are being followed. From IAC, SPI and Extension audits, to configuring
        metrics and alerts.
      </p>
    ),
    icon: "streamline:code-analysis",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Migration to Keycloak",
    desc: (
      <p>
        Adopting an open-source IAM involves starts with user migration but also
        includes knowing how to map functionality from your existing IAM to
        Keycloak. This can involve <b>custom user providers</b> or{" "}
        <b>extensions</b> to accommodate existing applications.
      </p>
    ),
    icon: "mdi:rotate-orbit",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "IAM Consolidation to Keycloak",
    desc: (
      <p>
        Many customers are looking to consolidate multiple IAMs into Keycloak to
        reduce <b>costs and complexity</b>. Keycloak can support this, but
        requires careful planning and execution.
      </p>
    ),
    icon: "mdi:consolidate",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Keycloak Upgrades",
    desc: (
      <p>
        Many Keycloak installations are <b>multiple major versions behind</b>{" "}
        and keeping up to date is a <b>major pain point</b> for many teams, but
        critical for <b>security</b> and <b>functionality</b>. Working through
        the upgrade process, including testing, practice, rollback planning, and
        finally executing the upgrade is something we excel at.
      </p>
    ),
    icon: "solar:server-square-update-broken",
    cta: "Learn more",
    href: "/support",
  },
  {
    name: "Custom Keycloak Development",
    desc: (
      <p>
        We specialize in <b>Keycloak development</b> and can assist with custom
        development, including extensions, themes, and custom providers to solve
        any number of use cases. We have extensive knowledge of the system.
      </p>
    ),
    icon: "hugeicons:code",
    cta: "Learn more",
    href: "/support",
  },
];

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

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  useEffect(() => {
    document.body.classList.add("page-bg");
  });

  const [term, setTerm] = useState(true);
  const billingTermValue = term ? "annual" : "monthly";
  const billingTerm = term ? prices["annual"] : prices["monthly"];

  return (
    <Layout description={`${siteConfig.tagline}`}>
      <picture>
        <source media="(max-width: 767px)" srcset="/img/home-bg-mobile.webp" />
        <source media="(min-width: 768px)" srcset="/img/home-bg.webp" />
        <img
          className="page-home"
          src="/img/home-bg-mobile.webp"
          alt="Gradient Background"
          loading="lazy"
        />
      </picture>

      {/* Main Content */}
      <main>
        {/* Top level offerings */}
        <div className={``}>
          <div>
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
                  className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                />
              </div>
              <div className="pt-32 sm:pt-40 lg:pt-48 pb-16">
                <div className="mx-auto max-w-4xl">
                  <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                    <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-p2blue-800/40 hover:ring-p2blue-800/50">
                      On-prem and Managed Infrastructure?{" "}
                      <Link
                        to="/product/onprem"
                        className="font-semibold text-p2blue-600"
                      >
                        <span aria-hidden="true" className="absolute inset-0" />
                        Read more <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center items-stretch">
                    <div className="border-p2blue-300 border-2 rounded-md bg-p2blue-200/30 flex flex-col items-center justify-between p-8">
                      <h1 className="text-balance text-5xl font-semibold tracking-tight text-p2blue-800 sm:text-5xl">
                        Managed Keycloak Hosting
                      </h1>
                      {/* <InlineIcon
                        icon="grommet-icons:server-cluster"
                        className="text-p2blue-800 h-12 w-12 my-3"
                      /> */}
                      <div className="py-4 text-pretty text-lg font-medium text-sky-900 sm:text-lg">
                        Simple, Cost-Conscious, Customizable, Enhanced Keycloak
                        Hosting for 99% of Use-Cases.
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <a href="/dashboard" target="_blank">
                          <button className={`btnPrimary`}>Try for Free</button>
                        </a>
                        <Link
                          href={"/hosting"}
                          className="text-sm font-semibold leading-6 text-p2blue-800"
                        >
                          Learn more <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                    <div className="border-fuchsia-400 border-2 rounded-md bg-fuchsia-300/30 flex flex-col items-center justify-between p-8">
                      <h1 className="text-balance text-5xl font-semibold tracking-tight text-fuchsia-600 sm:text-5xl">
                        Enterprise Keycloak Support
                      </h1>
                      {/* <InlineIcon
                        icon="fluent-mdl2:teamwork"
                        className="text-fuchsia-600 h-12 w-12 my-3"
                      /> */}
                      <div className="py-4 text-pretty text-lg font-medium text-fuchsia-900 sm:text-lg">
                        Expert Keycloak Support for Enterprises Coming to or
                        Using Keycloak at any Level of Complexity.
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <Link to="/contact">
                          <button className={`btnPrimary btnSupport`}>
                            Contact
                          </button>
                        </Link>
                        <Link
                          to="/support"
                          className="text-sm font-semibold leading-6 text-fuchsia-700"
                        >
                          Learn more <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
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
                  className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Top level explanation */}
        <div className="">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-balance text-4xl font-semibold tracking-tight  sm:text-5xl">
                Enterprise-Grade, Open-Source Identity and Access Management
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-600">
                Keycloak is a powerful open-source identity and access
                management system capable of replacing any IAM with capabilities
                for{" "}
                <Link to="/product/sso" className="font-semibold">
                  SSO
                </Link>{" "}
                and multi-tenant{" "}
                <Link to="/product/organizations" className="font-semibold">
                  User Management
                </Link>
                .
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a href="/dashboard" target="_blank" className="btnPrimary">
                  Get started
                </a>
                <Link
                  href="/product/sso"
                  className="text-sm/6 font-semibold text-p2blue-600"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="relative text-center">
              <div className={styles.heroIntegrations}>
                <h2 id="replaceIAMs">REPLACE/BROKER IAMs</h2>
                <picture>
                  <source
                    media="(max-width: 767px)"
                    srcset="/img/integration-lines-mobile.svg"
                  />
                  <source
                    media="(min-width: 768px)"
                    srcset="/img/integration-lines.svg"
                  />
                  <img
                    className={styles.heroIntegrationsLines}
                    src="/img/integration-lines.svg"
                    alt="Integration Lines"
                    loading="lazy"
                  />
                </picture>
                <div className={styles.heroIntegrationRow}>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-okta.svg"
                      alt="Okta Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-auth0.svg"
                      alt="Auth0 Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-azure.svg"
                      alt="Azure Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-google-workspace.svg"
                      alt="Google Workspace Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-active-directory.svg"
                      alt="Active Directory Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-jump-cloud.svg"
                      alt="JumpCloud Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-onelogin.svg"
                      alt="Onelogin Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-ping-identity.svg"
                      alt="Ping Identity Logo"
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.heroIntegration}>
                    <img
                      src="img/logo-duo-security.svg"
                      alt="Duo Security Logo"
                      loading="lazy"
                    />
                  </div>
                  <div
                    className={`${styles.heroIntegration} ${styles.heroIntegrationMore}`}
                  >
                    <p>+ many more</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hosting */}
        <div className="hosting-block bg-p2blue-500/20 px-6 py-24 sm:px-6 sm:py-18 lg:px-8 bg-[linear-gradient(30deg,_#EBF5FC_0%,_#BAE2FF_100%)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base/7 font-semibold text-p2blue-800">
                Extended with everything you need to run Keycloak.
              </h2>
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-p2blue-700 sm:text-5xl lg:text-balance">
                Managed Keycloak Hosting
              </p>
              <p className="mt-6 text-lg/8 text-gray-600">
                Every deployment is packed with our{" "}
                <a
                  href="https://github.com/p2-inc#our-extensions-"
                  target="_blank"
                  className="font-bold"
                >
                  popular extensions
                </a>{" "}
                to make Keycloak easier to use and more powerful. Provided at a{" "}
                <b>consistent, predictable price</b> that doesn't balloon based
                on users or IdP connections.
              </p>
              <div className="flex items-center justify-center gap-4">
                <a href="/dashboard" target="_blank">
                  <button className={`btnPrimary`}>Try for Free</button>
                </a>
                {/* <Link href="/hosting/self-host-vs-managed">
                  <button className={`btnSecondary`}>
                    Self-host vs Managed?
                  </button>
                </Link> */}
              </div>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {HostingItems.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-bold leading-7 text-gray-900">
                      <InlineIcon
                        icon={item.icon}
                        className="h-8 w-8 text-p2blue-700 self-start"
                      />
                      {item.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{item.desc}</p>
                      <p className="mt-6">
                        <Link
                          to={item.href}
                          className="text-sm font-semibold leading-6 text-p2blue-800"
                        >
                          {item.cta} <span aria-hidden="true">→</span>
                        </Link>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Logo section */}
          {/* <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="text-center text-lg/8 font-semibold text-gray-900">
                Trusted by the world's most innovative teams
              </h2>
              <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                <img
                  alt="Transistor"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                />
                <img
                  alt="Reform"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                />
                <img
                  alt="Tuple"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                />
                <img
                  alt="SavvyCal"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
                />
                <img
                  alt="Statamic"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
                />
              </div>
            </div>
          </div> */}
        </div>

        <div className="bg-p2blue-700 text-white">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Ready to try Keycloak? <br />
              Create your free deployment today.
            </h2>
            <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
              <a href="/dashboard" target="_blank">
                <button className={`btnPrimary btnLarge`}>Try now</button>
              </a>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="support-block px-6 py-24 sm:px-6 sm:py-18 lg:px-8 bg-[linear-gradient(270deg,_#EDA4F5_0%,_#EDCEF0_100%)]">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base/7 font-semibold text-fuchsia-800">
                Expertise to help adopt or extend Keycloak.
              </h2>
              <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-fuchsia-600 sm:text-5xl lg:text-balance">
                Enterprise Keycloak Support
              </p>
              <p className="mt-6 text-lg/8 text-gray-800">
                Wherever you find yourself in your Keycloak journey, we can
                assist. We are active <b>Keycloak community members</b>,
                contributing some of the most{" "}
                <a
                  href="https://github.com/p2-inc#our-extensions-"
                  target="_blank"
                  className="font-bold support"
                >
                  popular extensions
                </a>
                .
              </p>
              <Link to="/contact">
                <button className={`btnPrimary btnSupport`}>Contact</button>
              </Link>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {SupportItems.map((item) => (
                  <div key={item.name} className="relative pl-16">
                    <dt className="text-base font-bold leading-7 text-gray-900">
                      <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-fuchsia-600/80 text-white">
                        <InlineIcon icon={item.icon} className="h-8 w-8" />
                      </div>
                      {item.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-800">
                      <p>{item.desc}</p>
                      <p className="mt-6">
                        <Link
                          to={item.href}
                          className="text-sm font-semibold leading-6 support"
                        >
                          {item.cta} <span aria-hidden="true">→</span>
                        </Link>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          {/* Logo section */}
          {/* <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <h2 className="text-center text-lg/8 font-semibold text-gray-900">
                Trusted by the world’s most innovative teams
              </h2>
              <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
                <img
                  alt="Transistor"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                />
                <img
                  alt="Reform"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                />
                <img
                  alt="Tuple"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
                />
                <img
                  alt="SavvyCal"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
                />
                <img
                  alt="Statamic"
                  src="https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
                  width={158}
                  height={48}
                  className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
                />
              </div>
            </div>
          </div> */}
        </div>

        <div className="bg-fuchsia-700/90 text-white">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
            <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Working with our team is easy.
              <br />
              Let us show you how.
            </h2>
            <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
              <a href="/contact">
                <button className={`btnTertiary btnLarge text-fuchsia-800`}>
                  Get in touch
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Enterprise SSO */}
        <div className={`contentBlock`}>
          <div className={`enterpriseSsoBgImg bgImg`}>
            <img
              src="/img/enterprise-sso-bg.webp"
              alt="Color Gradient"
              loading="lazy"
            />
          </div>
          <div className={`contentBlockHead`}>
            <h2 id="openSourceSSO">Open Source Enterprise Single Sign-on</h2>
            <p>
              Leap up market into enterprise adoption with seamless, no-code SSO
              support.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.enterpriseSSO}>
              <div className={styles.enterpriseSSOL}>
                <img
                  className={styles.listFeatsImg}
                  src="img/hero-feature-sso.webp"
                  alt="SSO Login Examples"
                  loading="lazy"
                />
              </div>
              <div className={styles.enterpriseSSOR}>
                <ul className={styles.listFeats}>
                  <li>
                    <img
                      className={styles.listFeatsPicto}
                      src="img/picto-5-min-integration.svg"
                      alt="Pictogram showing 5 minutes on a hour"
                      loading="lazy"
                    />
                    <h5>5-minute integration</h5>
                    <p>
                      One integration adds all enterprise identity providers.
                      With or without adopting our identity feature, you can
                      support all popular identity providers.
                    </p>
                  </li>
                  <li>
                    <img
                      className={styles.listFeatsPicto}
                      src="img/picto-integrate-once.svg"
                      alt="Pictogram showing puzzle pieces"
                      loading="lazy"
                    />
                    <h5>Integrate Once</h5>
                    <p>
                      SAML, OIDC, OAuth2? Support all the standards without
                      years of development and debugging.
                    </p>
                  </li>
                  <li>
                    <img
                      className={styles.listFeatsPicto}
                      src="img/picto-no-variable-cost.svg"
                      alt="Pictogram showing US dollar sign"
                      loading="lazy"
                    />
                    <h5>No variable cost</h5>
                    <p>
                      We're not a parasite on your business model. Unlimited SSO
                      connections for a single price.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Admin Portal */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2 id="adminPortal">Admin Portal</h2>
            <p>
              Seamless onboarding and self-management for your customer
              administrators and users. Empower your users and customers to
              self-service Keycloak and easily manage every aspect of identity,
              organization and SSO. Drastically reduce customer support.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.aportal}>
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcset="/img/img-admin-portal-new1-mobile.webp"
                />
                <source
                  media="(min-width: 768px)"
                  srcset="/img/img-admin-portal-new1.webp"
                />
                <img
                  src="/img/img-admin-portal-new1.webp"
                  alt="Screenshots showing management of users, domains and SSO"
                  loading="lazy"
                />
              </picture>
            </div>
          </div>
        </div>
        {/* Developers */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2 id="devleopers">By Developers, For Developers</h2>
            <p>
              Create delightful, seamless experiences for your customers. In
              just a few minutes!
            </p>
            <div className={`pt-6`}>
              <button className={`btnPrimary`} onClick={docsEntry}>
                Go to Documentation
              </button>
            </div>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.devs}>
              <div className={styles.devsL}>
                <ul className={styles.listFeats}>
                  <li>
                    <img
                      className={styles.listFeatsPicto}
                      src="img/picto-simple-integration.svg"
                      alt="Pictogram showing a code"
                      loading="lazy"
                    />
                    <h5>Simple Integration</h5>
                    <p>
                      Our goal is to make it as easy as possible for developers
                      to integrate with our system so they can add SSO and other
                      features quickly and then move on to what's
                      important—their app!
                    </p>
                  </li>
                  <li>
                    <img
                      className={styles.listFeatsPicto}
                      src="img/picto-documentation.svg"
                      alt="Pictogram showing documents"
                      loading="lazy"
                    />
                    <h5>Full Documentation</h5>
                    <p>
                      We are building great documentation, tutorials and modern
                      SDKs, so implementation is easy regardless of skill level
                      or technology stack.
                    </p>
                  </li>
                  <li>
                    <img
                      className={styles.listFeatsPicto}
                      src="img/picto-secure.svg"
                      alt="Pictogram showing a key inside the shield"
                      loading="lazy"
                    />
                    <h5>Secure and Standardized</h5>
                    <p>
                      Standards compliance and security are our strengths so you
                      can focus on your your customers.
                    </p>
                  </li>
                </ul>
              </div>
              <div className={styles.devsR}>
                <CodeBlock language="javascript" title="Protect a page">
                  {`var auth = new Keycloak({
  url: 'https://{host}/auth',
  realm: '{realm}',
  clientId: '{clientId}'
});
auth.init({
  onLoad: 'login-required'
}).then(function(authenticated) {
  alert(authenticated ? 'authenticated' :
       'not authenticated');
}).catch(function() {
   alert('failed to initialize');
});
`}
                </CodeBlock>
              </div>
            </div>
          </div>
        </div>
        {/* PhaseTwo Loves Keycoak */}
        <div className={`contentBlock`}>
          <div className={`keycloakBgCircles bgImg`}>
            <img
              src="/img/circles.svg"
              alt="Concentric Circles"
              loading="lazy"
            />
          </div>
          <div className={`contentBlockHead`}>
            <h2 id="phaseTwoLovesKeycloak">
              Phase Two{" "}
              <img
                className={styles.heart}
                src="img/heart-filled.svg"
                alt="Heart symbols"
                loading="lazy"
              />{" "}
              Keycloak
            </h2>
            <p>
              Phase Two is based on the Keycloak Open Source Identity and Access
              Management system, built and maintained by Red Hat.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.keycloak}>
              <img
                className={styles.keycloakImg}
                src="img/diagram-keycloak.svg"
                alt="Diagram showing how Keycloak works with Phase Two"
                loading="lazy"
              />
            </div>

            <div className={styles.featCards}>
              <div className={styles.featCard}>
                <img
                  className={styles.featCardPicto}
                  src="img/picto-open-source-alt.svg"
                  alt="Pictogram showing Open Source logo"
                  loading="lazy"
                />
                <h5>Always Open Source</h5>
                <p>
                  Phase Two is built as a collection of open source Keycloak
                  extensions. While we endeavor to make Keycloak simple to use,
                  operate and scale, in the cloud or on prem.
                </p>
              </div>
              <div className={styles.featCard}>
                <img
                  className={styles.featCardPicto}
                  src="img/picto-hardened.svg"
                  alt="Pictogram showing a fortress"
                  loading="lazy"
                />
                <h5>Battle-tested and hardened</h5>
                <p>
                  Keycloak has been battle-tested and hardened for over 7 years.
                  Its security and reliability is depended on by organizations
                  from small startups to governments and Fortune 500 companies.
                </p>
              </div>
              <div className={styles.featCard}>
                <img
                  className={styles.featCardPicto}
                  src="img/picto-community.svg"
                  alt="Pictogram showing a group of people interconnected"
                  loading="lazy"
                />
                <h5>Community Superpower</h5>
                <p>
                  We believe that community participation in building our
                  software is a superpower, and can't wait to see what you will
                  help us build.
                </p>
              </div>
            </div>
          </div>
        </div>

        <StartYourJourney />
      </main>
    </Layout>
  );
}

export default Home;
