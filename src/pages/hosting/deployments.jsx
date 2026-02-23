import React from "react";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";
import StartYourJourney from "../../components/ctas/start-your-journey";
import { InlineIcon } from "@iconify/react";

const features = [
  {
    name: "Up in minutes.",
    description:
      "Deployments are created in a matter of minutes. No need to worry about the underlying infrastructure.",
    icon: (
      <InlineIcon
        icon="heroicons:cloud-arrow-up-solid"
        className="absolute left-1 top-1 size-8 text-sky-600"
      />
    ),
  },
  {
    name: "Fully secure.",
    description:
      "Protected out of the box with a strong SLA for security and uptime.",
    icon: (
      <InlineIcon
        icon="heroicons:lock-closed-solid"
        className="absolute left-1 top-1 size-8 text-sky-600"
      />
    ),
  },
  {
    name: "Self-service.",
    description: "Create deployments in multiple regions with a few clicks.",
    icon: (
      <InlineIcon
        icon="heroicons:server-solid"
        className="absolute left-1 top-1 size-8 text-sky-600"
      />
    ),
  },
  {
    name: "Fit to your needs.",
    description:
      "Our deployments can be customized to fit your needs. Configure regions, availability zones, and more to handle traffic and needs.",
    icon: (
      <InlineIcon
        icon="heroicons:lifebuoy-solid"
        className="absolute left-1 top-1 size-8 text-sky-600"
      />
    ),
  },
];

const stats = [
  { id: 1, name: "Sessions per instance", value: "50,000" },
  { id: 2, name: "SLA and Uptime", value: "99.95%" },
  { id: 3, name: "Deployment ready time", value: "<5 mins" },
];

const Deployments = () => {
  return (
    <Layout
      title="Keycloak Deployments"
      description="Multi-region High-availability Keycloak deployments that are extended with additional features, 99.95% uptime SLA, and 24/7 support."
    >
      <main className="hosting-page">
        <div className="pageHero mt-20">
          <div className="pageHeroMsg">
            <h1>Enterprise-Level Keycloak Deployments</h1>
            <h3 className="margin-top--md text-p2blue-700">
              Everything you need to run Keycloak in production at a fraction of
              the cost and headache.
            </h3>
          </div>

          <div className={styles.bgImg}>
            <img src="/img/gradient-bg.webp" alt="Color Gradient" />
          </div>
          <div className={`pageHeroBgCircles`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
        </div>

        <div className="overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pr-8 lg:pt-4">
                <div className="lg:max-w-lg">
                  <h2 className="text-base/7 font-semibold text-sky-600">
                    Launch faster
                  </h2>
                  <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    Enhanced Keycloak
                  </p>
                  <p className="mt-6 text-lg/8 text-gray-600">
                    Deployments are a fully managed service with all the
                    necessary extensions you'll need to run Keycloak in
                    production. We take care of the infrastructure, so you can
                    focus on building your application.
                  </p>
                  <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                    {features.map((feature) => (
                      <div key={feature.name} className="relative pl-12">
                        <dt className="inline font-semibold text-gray-900">
                          {feature.icon}
                          {feature.name}
                        </dt>{" "}
                        <dd className="inline">{feature.description}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <img
                alt="Product screenshot"
                src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
                width={2432}
                height={1442}
                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
              />
            </div>
          </div>
        </div>

        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="mx-auto flex max-w-xs flex-col gap-y-4"
                >
                  <dt className="text-base/7 text-gray-600">{stat.name}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="relative isolate py-24 sm:py-32">
          <div
            aria-hidden="true"
            className="absolute -top-80 left-[max(6rem,33%)] -z-10 transform-gpu blur-3xl sm:left-1/2 md:top-20 lg:ml-20 xl:top-3 xl:ml-56"
          >
            <div
              style={{
                clipPath:
                  "polygon(63.1% 29.6%, 100% 17.2%, 76.7% 3.1%, 48.4% 0.1%, 44.6% 4.8%, 54.5% 25.4%, 59.8% 49.1%, 55.3% 57.9%, 44.5% 57.3%, 27.8% 48%, 35.1% 81.6%, 0% 97.8%, 39.3% 100%, 35.3% 81.5%, 97.2% 52.8%, 63.1% 29.6%)",
              }}
              className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            />
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <p className="text-base/7 font-semibold text-sky-600">
                Less headache
              </p>
              <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Don't sweat the small stuff
              </h1>
              <p className="mt-6 text-xl/8 text-gray-700">
                By offloading the infrastructure management to us, you no longer
                have to care about version upgrades, uptime, and other items
                which are not core to your application.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-12">
              <div className="relative lg:order-last lg:col-span-5">
                <svg
                  aria-hidden="true"
                  className="absolute -top-[20rem] left-1 -z-10 h-[64rem] w-[175.5rem] -translate-x-1/2 stroke-gray-900/10 [mask-image:radial-gradient(64rem_64rem_at_111.5rem_0%,white,transparent)]"
                >
                  <defs>
                    <pattern
                      id="e87443c8-56e4-4c20-9111-55b82fa704e3"
                      width={200}
                      height={200}
                      patternUnits="userSpaceOnUse"
                    >
                      <path d="M0.5 0V200M200 0.5L0 0.499983" />
                    </pattern>
                  </defs>
                  <rect
                    fill="url(#e87443c8-56e4-4c20-9111-55b82fa704e3)"
                    width="100%"
                    height="100%"
                    strokeWidth={0}
                  />
                </svg>
                <figure className="border-l border-sky-600 pl-8">
                  <div className="text-xl/8 font-semibold tracking-tight text-gray-900">
                    <p>
                      “Vel ultricies morbi odio facilisi ultrices accumsan donec
                      lacus purus. Lectus nibh ullamcorper ac dictum justo in
                      euismod. Risus aenean ut elit massa. In amet aliquet eget
                      cras. Sem volutpat enim tristique.”
                    </p>
                  </div>
                  <figcaption className="mt-8 flex gap-x-4">
                    <img
                      alt=""
                      src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      className="mt-1 size-10 flex-none rounded-full bg-gray-50"
                    />
                    <div className="text-sm/6">
                      <div className="font-semibold text-gray-900">
                        Brenna Goyette
                      </div>
                      <div className="text-gray-600">@brenna</div>
                    </div>
                  </figcaption>
                </figure>
              </div>
              <div className="max-w-xl text-base/7 text-gray-700 lg:col-span-7">
                <p>
                  Running Keycloak, while getting easier every day, is still
                  hard to get right. We have spent years figuring out what works
                  and know what type of infrastructure works.
                </p>
                <ul
                  role="list"
                  className="mt-8 max-w-xl space-y-8 text-gray-600"
                >
                  <li className="flex gap-x-3">
                    <InlineIcon
                      aria-hidden="true"
                      icon="heroicons:arrow-path-solid"
                      className="mt-1 size-8 flex-none text-sky-600"
                    />
                    <span>
                      <strong className="font-semibold text-gray-900">
                        Automatic updates.
                      </strong>{" "}
                      Keycloak is updated frequently and keeping up-to-date with
                      those changes is hard. Our team takes care of that and
                      make sure that you're deployment is always on the latest
                      version.
                    </span>
                  </li>
                  <li className="flex gap-x-3">
                    <InlineIcon
                      aria-hidden="true"
                      icon="heroicons:wrench-screwdriver-solid"
                      className="mt-1 size-8 flex-none text-sky-600"
                    />
                    <span>
                      <strong className="font-semibold text-gray-900">
                        Necessary extensions included.
                      </strong>{" "}
                      Keycloak requires a lot of configuration to be "production
                      ready". Leveraging our years of experience, we have built
                      out a set of some of the most popular community extensions
                      that we automatically bundle with our deployment images.
                    </span>
                  </li>
                  <li className="flex gap-x-3">
                    <InlineIcon
                      aria-hidden="true"
                      icon="heroicons:server-solid"
                      className="mt-1 size-8 flex-none text-sky-600"
                    />
                    <span>
                      <strong className="font-semibold text-gray-900">
                        Unlimited team members and users.
                      </strong>{" "}
                      Invite your whole team without additional costs. Connect
                      your SSO provider to automatically add users to your
                      management account and grant them access via roles.
                    </span>
                  </li>
                </ul>
                <p className="mt-8">
                  Our managed deployments are designed to provide incredible
                  value at a great price. We have done the leg work to make it
                  possible to configure and deploy a Keycloak system in minutes,
                  not weeks or days.
                </p>
                <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">
                  Want to test it out? No problem.
                </h2>
                <p className="mt-6">
                  Our free tier is configured the same way that our dedicated
                  clusters are. You can test and play with the system without
                  any commitment. When ready, we can easily convert your test
                  deployment into a dedicated cluster.
                </p>
              </div>
            </div>
          </div>
        </div>

        <StartYourJourney />
      </main>
    </Layout>
  );
};

export default Deployments;
