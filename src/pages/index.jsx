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

function requestAccess() {
  window.open(`https://phasetwo.io/dashboard/`, "_blank");
}

function githubHome() {
  window.open(`https://github.com/p2-inc/`, "_blank");
}

function docsEntry() {
  window.location = `/docs/introduction`;
}

const CheckMark = () => (
  <img
    className={styles.checklistIcon}
    src="img/checkmark.svg"
    alt="Checkmark"
    loading="lazy"
  ></img>
);

const HostingItems = [
  {
    name: "Starter Tier, Predictable Pricing",
    desc: "A generous free tier to get started. Test out Keycloak. See if you think it will work for your use case (we think it will). When ready to move to a paid tier, you can do so with ease and transparency.",
    icon: "mdi:cloud-outline",
    cta: "Get started",
    href: "https://phasetwo.io/dashboard/",
  },
  {
    name: "Multi-region, High Availability, Dedicated Clusters",
    desc: "Hosted in multiple regions for high availability and low latency. Deploy in areas to comply with data residency requirements. Ensure uptime and performance.",
    icon: "gis:globe-alt",
    cta: "Learn more",
    href: "https://phasetwo.io/hosting/",
  },
  {
    name: "Customized, Automatically Updated",
    desc: "Customize your Keycloak instance with extensions and themes. We will keep your instance up to date with the latest Keycloak releases. Spend time on your app, not on maintenance.",
    icon: "grommet-icons:server-cluster",
    cta: "Learn more",
    href: "https://phasetwo.io/hosting/",
  },
];

const SupportItems = [
  {
    name: "On-premise Deployments",
    desc: "You have an on-premise installation for data residency requirements.",
    icon: "mdi:cloud-lock-outline",
  },
  {
    name: "Keycloak Scale and Growth",
    desc: "Keycloak is working on a test app, staging, or only part of your application portfolio and are expecting large scale with your installation.",
    icon: "fluent:arrow-growth-20-filled",
  },
  {
    name: "IAM Consolidation to Keycloak",
    desc: "You are consolidating from many Identity Providers down into Keycloak.",
    icon: "mdi:consolidate",
  },
  {
    name: "Infrastructure and Code Review",
    desc: "You need someone to look at what you have already and make sure that it is secure and scalable",
    icon: "streamline:code-analysis",
  },
  {
    name: "Keycloak Upgrades",
    desc: "You need help upgrading your Keycloak installation to the newest version.",
    icon: "solar:server-square-update-broken",
  },
  {
    name: "Custom Keycloak Development",
    desc: "You need custom development for Keycloak to meet your specific needs in terms of functionality (extensions) or brand experience (theming).",
    icon: "solar:server-square-update-broken",
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
        {/* Hero Section */}
        <div className={`pageHero`}>
          <div className={styles.heroInner}>
            {/* Hero Message */}
            <div className={`pageHeroMsg`}>
              <h1>
                Identity and Access Management (IAM) Solution to Future Proof
                Your App
              </h1>
              <h2 className={`pageHeroMsgIntro`}>
                Accelerate SaaS time-to-market and enterprise adoption by
                rapidly integrating the features needed to support almost any{" "}
                <b>authentication</b> and <b>authorization</b> use-cases with
                Phase Two's Keycloak as a Service offering.
              </h2>
              <div className={`pageHeroCta`}>
                <button className={`btnCta`} onClick={requestAccess}>
                  Try Phase Two for Free
                </button>
              </div>
            </div>
          </div>
          <div className={styles.heroSections}>
            <Link to={"hosting"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-hosting.svg"
                alt="Pictogram showing key"
                loading="lazy"
              />
              <p>Hosting</p>
            </Link>
            <Link to={"#experts"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-support.svg"
                alt="Pictogram showing key"
                loading="lazy"
              />
              <p>Support</p>
            </Link>
            <Link to={"#experts"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-customization.svg"
                alt="Pictogram showing key"
                loading="lazy"
              />
              <p>Customization</p>
            </Link>
            <Link to={"product/sso/"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-sso.svg"
                alt="Pictogram showing key"
                loading="lazy"
              />
              <p>SSO</p>
            </Link>
            <Link to={"product/identity"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-identity.svg"
                alt="Pictogram showing a person"
                loading="lazy"
              />
              <p>Identity</p>
            </Link>
            <Link to={"product/organizations"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-organizations.svg"
                alt="Pictogram showing multiple persons interacting"
                loading="lazy"
              />
              <p>Organizations</p>
            </Link>
            <Link to={"product/adminportal"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-admin-portal.svg"
                alt="Pictogram showing a browser"
                loading="lazy"
              />
              <p>Admin Portal</p>
            </Link>
            <Link to={"product/onprem"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-on-prem.svg"
                alt="Pictogram showing on prem servers"
                loading="lazy"
              />
              <p>On-Prem Deployment</p>
            </Link>
          </div>

          <div className={styles.heroFeats}>
            <div className={styles.heroFeat}>
              <img
                src="img/picto-open-source.svg"
                alt="Open Source Logo"
                loading="lazy"
              />
              <p>We are open source</p>
            </div>
            <div className={styles.heroFeat}>
              <img
                src="img/picto-fixed-pricing.svg"
                alt="Pictogram showing fixed US dollar sign"
                loading="lazy"
              />
              <p>Fixed pricing for peace of mind</p>
            </div>
            <div className={styles.heroFeat}>
              <img
                src="img/picto-cloud-or-on-prem.svg"
                alt="Pictogran showing cloud and on-prem servers"
                loading="lazy"
              />
              <p>Cloud or on-prem deployment</p>
            </div>
          </div>

          <div className={styles.heroIntegrations}>
            <h2 id="replaceIAMs">REPLACE IAMs</h2>
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
                <img src="img/logo-okta.svg" alt="Okta Logo" loading="lazy" />
              </div>
              <div className={styles.heroIntegration}>
                <img src="img/logo-auth0.svg" alt="Auth0 Logo" loading="lazy" />
              </div>
              <div className={styles.heroIntegration}>
                <img src="img/logo-azure.svg" alt="Azure Logo" loading="lazy" />
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

        <div className="contentBlock">
          <div className="contentBlockHead">
            <h1 className="margin-top--xl">Managed Keycloak Hosting</h1>
            <p className={styles.heroIntegrationsCopy}>
              Phase Two provides a modern, open source alternative to fully
              replace or integrate with any IAMs available.
            </p>
          </div>
          <div className="contentBlockBody">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {HostingItems.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <InlineIcon
                        icon={item.icon}
                        className="h-8 w-8 text-p2blue-700 self-start"
                      />
                      {item.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{item.desc}</p>
                      <p className="mt-6">
                        <a
                          href={item.href}
                          className="text-sm font-semibold leading-6 text-p2blue-800"
                        >
                          {item.cta} <span aria-hidden="true">→</span>
                        </a>
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Enterprise SSO */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2 id="openSourceSSO">Enterprise Keycloak Support</h2>
            <p>
              Phase Two's{" "}
              <a href="https://phasetwo.io/support">Enterprise Support</a> is
              ideal for many customers already using Keycloak that need to take
              their implementation to the next level.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className="mx-auto max-w-2xl lg:max-w-4xl">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {SupportItems.map((item) => (
                  <div key={item.name} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-p2blue-600 text-white">
                        <InlineIcon icon={item.icon} className="h-8 w-8" />
                      </div>
                      {item.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">
                      {item.desc}
                    </dd>
                  </div>
                ))}
              </dl>
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
            <div className={`contentBlockCta`}>
              <button className={`btnPrimary`} onClick={docsEntry}>
                Go to Documentation
              </button>
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
                  alt="Pictogram showing a group of poeple interconnected"
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

        {/* Plan */}
        <div id="pricing" className={`contentBlock`}>
          <div className={`plansBgImg bgImg`}>
            <img
              src="/img/gradient-bg.webp"
              alt="Color Gradient"
              loading="lazy"
            />
          </div>
          <div className={`contentBlockHead`}>
            <h2 id="phaseTwoPricing">Premium Keycloak Hosting</h2>
            <p>
              Phase Two is one price per project. No hidden fees, no
              unpredictable costs.
            </p>
            <p className="mt-1r">
              We offer a premium hosted Keycloak product to make getting started
              fast and secure. Set up a free instance with our starter package
              to get a sense of the simplicity that comes with Phase Two
              Keycloak hosting.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.plansBlocks}>
              <div className={styles.plansBlock}>
                <div className={styles.plans}>
                  {/* Plan */}
                  <div className={styles.plan}>
                    <div className={styles.planHead}>
                      <img
                        className={styles.featCardPicto}
                        src="img/plan-starter.svg"
                        alt="Starter plan"
                        loading="lazy"
                      />
                      <h3>Starter</h3>
                      <p>
                        Always FREE <sup>1</sup>
                      </p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <CheckMark />
                          Shared cluster
                        </li>
                        <li>
                          <CheckMark />
                          &#60;1,000 users
                        </li>
                        <li>
                          <CheckMark />
                          &#60;10 SSO connections
                        </li>
                        <li>
                          <CheckMark />
                          Community support
                        </li>
                        <li>No SLA</li>
                      </ul>
                    </div>
                    <div className={styles.planFoot}>
                      <button
                        className={`btnPrimary ${styles.btnPlan}`}
                        onClick={requestAccess}
                      >
                        Get started
                      </button>
                      <button
                        className={`btnSecondary ${styles.btnPlan}`}
                        onClick={githubHome}
                      >
                        Self Host
                      </button>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className={styles.plan}>
                    <div className={styles.planBadge}>Most Popular</div>
                    <div className={styles.planHead}>
                      <img
                        className={styles.featCardPicto}
                        src="img/plan-supported.svg"
                        alt="Premium plan"
                        loading="lazy"
                      />
                      <h3>Premium</h3>
                      <p>
                        <span className={styles.planFrom}>from</span>{" "}
                        <strong className={styles.planPrice}>
                          ${billingTerm.premium}
                        </strong>
                        /mo{" "}
                      </p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <CheckMark />
                          Dedicated cluster
                        </li>
                        <li>
                          <CheckMark />
                          Unlimited users
                        </li>
                        <li>
                          <CheckMark />
                          Unlimited SSO connections
                        </li>
                        <li>
                          <CheckMark />
                          Custom domain
                        </li>
                        <li>
                          <CheckMark />
                          Email support
                        </li>
                        <li>
                          <CheckMark />
                          99.9% uptime guarantee
                        </li>
                      </ul>
                    </div>
                    <div className={styles.planFoot}>
                      <button
                        className={`btnPrimary ${styles.btnPlan}`}
                        onClick={requestAccess}
                      >
                        Get started
                      </button>
                    </div>
                  </div>

                  {/* Plan */}
                  <div className={styles.plan}>
                    <div className={styles.planHead}>
                      <img
                        className={styles.featCardPicto}
                        src="img/plan-premium.svg"
                        alt="Enterprise plan"
                        loading="lazy"
                      />
                      <h3>Enterprise</h3>
                      <p>
                        <span className={styles.planFrom}>from</span>{" "}
                        <strong className={styles.planPrice}>
                          ${billingTerm.enterprise}
                        </strong>
                        /mo{" "}
                      </p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <CheckMark />
                          All Premium features
                        </li>
                        <li>
                          <CheckMark />
                          Global deployment
                        </li>
                        <li>
                          <CheckMark />
                          Custom themes & extensions <sup>2</sup>
                        </li>
                        <li>
                          <CheckMark />
                          Dedicated support
                        </li>
                        <li>
                          <CheckMark />
                          99.99% uptime guarantee
                        </li>
                        <li>
                          <CheckMark /> 4 hour urgent{" "}
                          <a href="/docs/sla/#response-and-resolution-times">
                            SLA
                          </a>{" "}
                          <sup>3</sup>
                        </li>
                      </ul>
                    </div>
                    <div className={styles.planFoot}>
                      <button
                        className={`btnPrimary ${styles.btnPlan}`}
                        onClick={requestAccess}
                      >
                        Get started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`contentBlockCta flex items-baseline justify-center gap-3`}
          >
            <div className=" text-lg ">Billing period: </div>
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
                className="group inline-flex h-6 w-11 items-center rounded-full transition data-[checked]:bg-p2blue-600 bg-p2blue-600"
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
          </div>
          <div className={`contentBlockCta`}>
            <p>
              (1) Subject to availabilty (2) Additional fees based on extension
              complexity (3) Custom SLA available
            </p>
            <p>
              For on-prem support and bundling options, please{" "}
              <a href="mailto:sales@phasetwo.io">contact sales</a>.
            </p>
          </div>
          <div className="contentBlock">
            <div className="contentBlockBody">
              <div>
                <h2
                  id="supportPackages"
                  style={{ textAlign: "center", marginTop: "3rem" }}
                >
                  Enterprise Keycloak Support Packages
                </h2>
                <a href="#experts"></a>

                <div
                  className={styles.planBody}
                  style={{ maxWidth: "760px", margin: "0 auto" }}
                >
                  <p>
                    Configuring, integrating and operating an Identity and
                    Access Management system can be daunting.
                  </p>
                  <p>
                    For both hosted, on-prem customers, or those with their own
                    Keycloak deployment, our goal is to create an understanding
                    in your organization of what is possible with Keycloak. We
                    want to support your goals as you adopt and implement
                    Keycloak in your products. Let us lend our expertise to
                    every step of your journey.
                  </p>
                </div>
              </div>
              <KeycloakSupportPackages />
            </div>
          </div>
          <div className="contentBlock">
            <div className="contentBlockHead">
              <h2 id="faqs">Frequently Asked Questions?</h2>
            </div>
            <div className="contentBlockBody">
              <div className={styles.questionsBox}>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    What is the difference between Phase Two and Keycloak?
                  </div>
                  <div className={styles.answer}>
                    <div>
                      Phase Two is a company that specializes in Enterprise
                      level Keycloak Hosting and Support.{" "}
                      <i>
                        We are active contributors to the Keycloak project and
                        community
                      </i>
                      . We issue pull requests for issues and take active part
                      in community discussions whether on at{" "}
                      <a href="https://phasetwo.io/blog/keycloak-orgs-presentation/">
                        Keycloak Dev Day
                      </a>{" "}
                      Github, Forums, or mailing lists. We've been working with
                      Keycloak for a long time and have a deep understanding of
                      the project and because of this have built some of the
                      most successful{" "}
                      <a
                        href="https://github.com/p2-inc#our-extensions-"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        extensions
                      </a>
                      .
                    </div>
                    <div>
                      Keycloak is an open source Identity and Access Management
                      server software developed and maintained by Red Hat. It is
                      widely used across the world for a multitude of
                      Authentication and Authorization use cases.
                    </div>
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    What are the advantages to Keycloak Open Source Identity and
                    Access Management System?
                  </div>
                  <div className={styles.answer}>
                    <div>
                      Keycloak offers SSO, identity brokering, user federation,
                      fine-grained authorization, and customizable themes. It
                      supports various protocols (OAuth2, OpenID Connect, SAML)
                      and integrates with many platforms.
                    </div>
                    <div>
                      It's been under development for over 7 years and is an
                      accepted{" "}
                      <a
                        href="https://www.cncf.io/projects/keycloak/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        project
                      </a>{" "}
                      at the <b>Incubating</b> level of the Cloud Native
                      Computing Foundation (CNCF).
                    </div>
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    Why does Phase Two offer hosting?
                  </div>
                  <div className={styles.answer}>
                    We've seen a lot of Keycloak deployments at scale and know
                    what it takes to be successful. We've put that expertise to
                    use by building and offering a{" "}
                    <a href="https://phasetwo.io/hosting/">hosted</a> solution
                    to make it easier to adopt{" "}
                    <a href="https://phasetwo.io/blog/identity-brokering-on-prem/">
                      Authentication and Authorization
                    </a>{" "}
                    to any application at any size. This offloads the burden of
                    DevOps, maintenance, and upgrades to us, allowing teams to
                    focus on shipping product.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    What support is provided and included in Enterprise Support
                    packages?
                  </div>
                  <div className={styles.answer}>
                    Many customers use Keycloak precisely because its Open
                    Source and can be hosted themselves. However, getting that
                    right, how to migrate from another solution, knowing where
                    the pitfalls are, how to scale it, how to troubleshoot, are
                    all things that will be encountered during that process. To
                    that end, we offer Enterprise Support to enable companies to
                    adopt Keycloak.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    What support is provided and included in hosting?
                  </div>
                  <div className={styles.answer}>
                    Hosting support is provided for infrastructure management,
                    upgrades, and maintenance. We also provide support for the
                    Keycloak software itself, including configuration,
                    troubleshooting, and best practices. That would need to be
                    purchased separate or in addition to the hosting fee.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    Why should I migrate to Keycloak?
                  </div>
                  <div className={styles.answer}>
                    Migrate to Keycloak and gain full control over your
                    authentication and authorization processes. User migration
                    support is provide so that migration can occur quickly and
                    seamlessly.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    How quickly can I migrate to Keycloak?
                  </div>
                  <div className={styles.answer}>
                    The answer is, it depends. Migrating to Keycloak can take
                    from a few days to several weeks, depending on the
                    complexity of your current authentication system, data
                    migration needs, and integration requirements. A
                    straightforward setup might be quick, but extensive
                    customization or large user bases will require more time. We
                    spent some time writing up what it takes to{" "}
                    <a href="https://phasetwo.io/blog/open-source-iam/#migrating-from-your-current-identity-provider">
                      migrate to Keycloak
                    </a>{" "}
                    from an existing identity provider.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    How much does it cost to run Keycloak on my own and is Phase
                    Two a cost effective solution?
                  </div>
                  <div className={styles.answer}>
                    The answer is less about the cost to run the server and more
                    about the time it takes to manage a system that runs a
                    scaled, resilient Keycloak solution. Depending on the needs
                    of your Applications, it will determine the resources
                    required to support such a deployment. Our{" "}
                    <a href="https://phasetwo.io/hosting/">hosted</a> solution
                    allows for fast, globally distributed, resilient systems
                    immediately.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    What servers and frameworks does Keycloak support?
                  </div>
                  <div className={styles.answer}>
                    Keycloak combines a strong API with a powerful Admin portal
                    to make integration with any server or frontend framework
                    possible. Use it for apps running{" "}
                    <a href="https://phasetwo.io/blog/secure-spring-boot/">
                      Spring Boot
                    </a>
                    ,{" "}
                    <a href="https://phasetwo.io/blog/secure-django/">Django</a>
                    ,{" "}
                    <a href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nextjs/">
                      Next.js
                    </a>
                    ,{" "}
                    <a href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nuxt/">
                      Nuxt
                    </a>
                    ,{" "}
                    <a href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-reactjs/">
                      React
                    </a>
                    ,{" "}
                    <a href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-vue/">
                      Vue
                    </a>
                    ,{" "}
                    <a href="https://phasetwo.io/blog/instant-user-management-and-sso-for-remix/">
                      Remix
                    </a>
                    ,{" "}
                    <a href="https://phasetwo.io/blog/instant-user-management-and-sso-for-sveltekit/">
                      Sveltekit
                    </a>
                    , or any other server or frontend framework.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    How is Keycloak a an alternative to Auth0, WorkOS, Okta, and
                    Cognito?
                  </div>
                  <div className={styles.answer}>
                    We put some thoughts together about this specific topic in a
                    blog post about Keycloak being a{" "}
                    <a href="https://phasetwo.io/blog/open-source-iam/#migrating-from-your-current-identity-provider">
                      open source alternative
                    </a>{" "}
                    to these offerings.
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    What is the difference between Keycloak and{" "}
                    <a href="https://authjs.dev/">Auth.js</a>?
                  </div>
                  <div className={styles.answer}>
                    <div>
                      AuthJs is a flexible, client-side <b>authentication</b>{" "}
                      library for JavaScript apps, offering simple integration
                      and customization to various providers. Keycloak is a
                      full-featured, server-side identity and access management
                      solution, providing SSO, identity brokering, user
                      federation, and advanced security features.
                    </div>
                    <div>
                      The biggest difference is that Keycloak does{" "}
                      <b>authentication</b> AND <b>authorization</b>. That means
                      Keycloak provides a way to federate login to any SAML or
                      OIDC provider and then manage the permissions of the users
                      in your application. When trying to do this with multiple
                      providers, it quickly becomes a very complex problem. In
                      addition, when you start to layer in things like
                      authentication flows with MFA,{" "}
                      <a href="https://phasetwo.io/blog/set-up-magic-links/">
                        Magin Links
                      </a>
                      , or other advanced use cases, managing that quickly
                      becomes a full-time job.
                    </div>
                  </div>
                </div>
                <div className={styles.questionBox}>
                  <div className={styles.question}>
                    Why can't I just integrate SAML into my own app and be done?
                  </div>
                  <div className={styles.answer}>
                    Its not just people logging into your app, which Keycloak
                    can easily do, but it's about handling the use case for your
                    customers and letting them tie their own identity providers
                    into your application.
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

export default Home;
