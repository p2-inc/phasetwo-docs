import React from "react";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";
import { InlineIcon } from "@iconify/react";
import { KeycloakSupportPackages } from "../../components/keycloak-support-packages";

export default function Hosted() {
  return (
    <Layout
      title="Enterprise Support for Keycloak"
      description="Phase Two provides Enterprise Support for Keycloak and Keycloak as a Service. We can help with Keycloak installation, configuration, and maintenance."
    >
      <main>
        <div className="pageHero">
          <div className="pageHeroMsg">
            <h1>Enterprise Keycloak Support</h1>
          </div>
          <div className="pageHeroMsgIntro">
            <p>
              Configuring, integrating, and operating an Identity and Access
              Management system can be challenging. For{" "}
              <a href="https://phasetwo.io/hosting">hosted</a> and{" "}
              <a href="https://phasetwo.io/product/onprem/">on-prem</a>{" "}
              customers, or those with their own Keycloak deployment, we can
              provide expert help, custom Keycloak development, help with
              migration to Keycloak, and around the clock support.
            </p>
            <div className={`pageHeroCta`}>
              <a href="mailto:sales@phasetwo.io">
                <button className={`btnPrimary`}>Let's talk</button>
              </a>
              <a href="#experts" className="margin-left--md">
                <button className={`btnPrimary`}>Show me pricing</button>
              </a>
            </div>
          </div>
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
        <div className="contentBlock z-5 stats">
          <div className="contentBlockHead">
            <h2>Professional Keycloak Adoption, Migration, and Maintenance</h2>
          </div>
          <div className="contentBlockBody">
            <div className="row">
              <div className="col margin-bottom--md">
                <div
                  className={`card card--full-height text--center ${styles.statsCard}`}
                >
                  <div className="card__header">
                    <h2>
                      <InlineIcon
                        icon="tdesign:calendar-1"
                        style={{ fontSize: "1.8rem" }}
                      />
                      {" <"} 30 days{" "}
                    </h2>
                  </div>
                  <div className="card__body">
                    <p>average project time</p>
                  </div>
                </div>
              </div>
              <div className="col margin-bottom--md">
                <div
                  className={`card card--full-height text--center ${styles.statsCard}`}
                >
                  <div className="card__header">
                    <h2>
                      100's{" "}
                      <InlineIcon
                        icon="clarity:blocks-group-solid"
                        style={{ fontSize: "2rem" }}
                      />
                    </h2>
                  </div>
                  <div className="card__body">
                    <p>of successful projects</p>
                  </div>
                </div>
              </div>
              <div className="col margin-bottom--md">
                <div
                  className={`card card--full-height text--center ${styles.statsCard}`}
                >
                  <div className="card__header">
                    <h2>
                      <InlineIcon
                        icon="fluent-emoji:star-struck"
                        style={{ fontSize: "1.7rem" }}
                      />
                      <InlineIcon
                        icon="fluent-emoji:star-struck"
                        style={{ fontSize: "1.7rem" }}
                      />
                      <InlineIcon
                        icon="fluent-emoji:star-struck"
                        style={{ fontSize: "1.7rem" }}
                      />
                      <InlineIcon
                        icon="fluent-emoji:star-struck"
                        style={{ fontSize: "1.7rem" }}
                      />
                      <InlineIcon
                        icon="fluent-emoji:star-struck"
                        style={{ fontSize: "1.7rem" }}
                      />
                    </h2>
                  </div>
                  <div className="card__body">
                    <p>customer experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`contentBlock contentBlockRow ${styles.lightBlueBg} ${styles.contentBlockRow}`}
        >
          <div className="contentBlockHead">
            <h3>Structured Project Process and Workflow</h3>
            <p>
              After completing 100s of successful Keycloak support projects, we
              have a well-structured process for understanding the work required
              to execute. We provide an Onboarding Kit along with a Project Plan
              which clearly outlines the required work and owners. We will meet
              with your team on a regular cadence to cover current use-cases and
              how any existing implementation can be mapped into Keycloak APIs.
            </p>
          </div>
          <div className="contentBlockBody ta-center">
            <img
              src="/img/team-planning.svg"
              alt="Team Planning"
              style={{ maxHeight: "400px" }}
              loading="lazy"
            />
          </div>
        </div>
        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}`}
        >
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--offset-1 col--4 flex flex-align-center">
                  <img
                    src="/img/server-network-technology.svg"
                    alt="Architecture Review"
                    style={{ maxHeight: "300px" }}
                    loading="lazy"
                  />
                </div>
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Keycloak Architecture Review</h3>
                    <p>
                      Avoid outages, trim costs, and become more agile in the
                      face of infrastructure changes. We will help scale your
                      architecture to meet the demands of any large-scale
                      implementation. We've{" "}
                      <a href="https://phasetwo.io/blog/identity-brokering-on-prem/">
                        helped customers
                      </a>{" "}
                      configure their systems for handling up to 100K+ active
                      users on a global basis. We can help review and configure
                      Kubernetes Configurations, Deployment Strategies, and
                      other infrastructure needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow} ${styles.lightBlueBg}`}
        >
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Keycloak Installation and Configuration</h3>
                    <p>
                      While our{" "}
                      <a href="https://phasetwo.io/docs/getting-started/configuration/">
                        pre-configured defaults
                      </a>{" "}
                      are designed to meet the needs of most common use cases,
                      our team is here to help you tailor the functionality to
                      suit your specific needs and goals. For initial testing
                      and setup, we include a managed Keycloak cluster to make
                      initial setup and testing fast and easy. This comes with a
                      build that includes all of Phase Two's{" "}
                      <a href="https://phasetwo.io/docs/introduction/open-source/">
                        extensions
                      </a>{" "}
                      and a sample client application pointing to your instance
                      for the ability to quickly test authentication flows,
                      login flow styling, and more. This means while your team
                      converges on their final architecture, you can leverage a
                      Keycloak instance for App integration and setup.
                    </p>
                  </div>
                </div>
                <div className="col col--offset-1 col--5 flex flex-align-center">
                  <img
                    src="/img/software-engineer-developing.svg"
                    alt="Architecture Review"
                    style={{ maxHeight: "300px" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}`}
        >
          <div className="contentBlockHead"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--offset-2 col--4 flex flex-align-center">
                  <img
                    src="/img/health-checklist.svg"
                    alt="Health Assessment"
                    style={{ maxHeight: "300px" }}
                    loading="lazy"
                  />
                </div>
                <div className="col col--4  flex flex-align-center">
                  <div>
                    <h3>Infrastructure and Implementation Health Assessment</h3>
                    <p>
                      Many customers come to us in various states of Keycloak
                      adoption and implementation. Regardless of your current
                      state, we can do an assessment of your current
                      infrastructure and implementation. This could be a review
                      of how you are managing your cluster, your token usage,
                      your usage of the CLI tool for configuration, how to
                      upgrade to a newer version of Keycloak, just to name a
                      few. In addition, we can do a periodic review of your
                      infrastructure as time goes on to make sure that you
                      continue to follow best practices.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow} ${styles.pinkGradBg}`}
        >
          <div className="contentBlockHead"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Custom Keycloak Development and Extensions</h3>
                    <p>
                      Take control of your Keycloak implementation. A strong
                      argument for Keycloak adoption is the ability to customize
                      it to your application’s needs. This could be a login flow
                      experience for specific authenticators all the way to full
                      Keycloak extension development. We can help to{" "}
                      <a href="https://github.com/p2-inc/keycloak-themes">
                        customize login experiences
                      </a>{" "}
                      to create a seamless brand experience with styles, colors,
                      logos, and CSS to match your branding.
                    </p>
                  </div>
                </div>
                <div className="col col--offset-1 col--6 flex flex-align-center">
                  <img
                    src="/img/dev-team.svg"
                    alt="Custom Keycloak Development"
                    style={{ maxHeight: "400px" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}`}
        >
          <div className="contentBlockHead">
            <h3>Migration to Keycloak from Other Identity Provider Systems</h3>
            <p>
              Many customers come to Keycloak from other Identity Providers like
              Okta, Auth0, WorkOS, Cognito and more, and need a path to{" "}
              <a href="https://phasetwo.io/blog/open-source-iam/">adopting</a>{" "}
              and migrating their system usage to Keycloak. From initial testing
              of migration to the final cutover and production launch, we will
              have your back the entire way. To help make it easy to set up your
              application, we have multiple examples demonstrating how to secure
              your application with user management and single sign on (SSO)
              using Keycloak for Authentication and Authorization. Just clone an
              example to get a jump-start on more complex integrations and
              examples.
            </p>
          </div>
          <div className="contentBlockBody ta-center">
            <img
              src="/img/kc-migration.svg"
              alt="Migration to Keycloak from Other Identity Provider Systems"
              style={{ maxHeight: "400px" }}
              loading="lazy"
            />
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow} ${styles.lightBlueBg}`}
        >
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--4 col--offset-2 flex flex-align-center">
                  <div>
                    <h3>
                      SSO Connections and Identity Provider (IdP) Onboarding
                    </h3>
                    <p>
                      Even experienced dev and operations professionals can
                      struggle deciphering SSO configurations. We offer tailored
                      solutions to simplify IdP onboarding, including our
                      intuitive{" "}
                      <a href="https://phasetwo.io/docs/hosting/connect/">
                        Phase Two Connect
                      </a>{" "}
                      on-prem wizards and dashboards. Associating domains to
                      specific IDPs, set up organization structures with roles
                      to make sure that users are able to do what they need to
                      without additional security exposure.
                    </p>
                  </div>
                </div>
                <div className="col col--offset-1 col--4 flex flex-align-center">
                  <img
                    src="/img/sso-security.svg"
                    alt="SSO Connections and Identity Provider (IdP) Onboarding"
                    style={{ maxHeight: "300px" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div
              className="contentBlockBody margin-top--md"
              style={{ maxWidth: "960px" }}
            >
              <p>
                To help make it easy to set up your application, we have
                multiple examples demonstrating how to secure your application
                with user management and single sign on (SSO) using Keycloak for
                Authentication and Authorization. Just clone an example to get a
                jump-start on more complex integrations and examples.
              </p>
            </div>
            <div className="container" style={{ maxWidth: "960px" }}>
              <div className={`row frameworkGridTop`}>
                <div className={`col ${styles.frameworkGridCol}`}>
                  <a
                    href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nextjs/"
                    className="margin-right--sm"
                  >
                    <InlineIcon
                      icon="devicon:nextjs"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />{" "}
                    Next.js
                  </a>
                  +
                  <a
                    href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-reactjs/"
                    className="margin-left--sm"
                  >
                    <InlineIcon
                      icon="simple-icons:react"
                      color="black"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />
                    ReactJS
                  </a>
                </div>
                <div className={`col ${styles.frameworkGridCol}`}>
                  <a href="https://phasetwo.io/blog/secure-django/">
                    <InlineIcon
                      icon="devicon-plain:django"
                      color="black"
                      style={{ fontSize: "1.4rem", marginRight: ".3rem" }}
                    />
                    Django
                  </a>
                </div>
                <div className={`col ${styles.frameworkGridCol}`}>
                  <a href="https://phasetwo.io/blog/secure-spring-boot/">
                    <InlineIcon
                      icon="simple-icons:spring"
                      color="black"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />
                    Springboot +{" "}
                    <InlineIcon
                      icon="teenyicons:angular-solid"
                      color="black"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />
                    Angular
                  </a>
                </div>
              </div>
              <div className="row frameworkGridBottom">
                <div className={`col ${styles.frameworkGridCol}`}>
                  <a
                    href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nuxt/"
                    className="margin-right--sm"
                  >
                    <InlineIcon
                      icon="devicon-plain:nuxtjs"
                      color="black"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />
                    Nuxt
                  </a>
                  +{" "}
                  <a
                    href="https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-vue/"
                    className="margin-left--sm"
                  >
                    <InlineIcon
                      icon="ion:logo-vue"
                      color="black"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />
                    Vue
                  </a>
                </div>
                <div className={`col ${styles.frameworkGridCol}`}>
                  <a href="https://phasetwo.io/blog/instant-user-management-and-sso-for-sveltekit/">
                    <InlineIcon
                      icon="simple-icons:svelte"
                      color="black"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />
                    Svelte
                  </a>
                </div>
                <div className={`col ${styles.frameworkGridCol}`}>
                  <a href="https://phasetwo.io/blog/instant-user-management-and-sso-for-remix/">
                    <InlineIcon
                      icon="simple-icons:remix"
                      color="black"
                      style={{ fontSize: "1.5rem", marginRight: ".3rem" }}
                    />
                    Remix
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}`}
        >
          <div className="contentBlockHead"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--offset-1 col--4 flex flex-align-center">
                  <img
                    src="/img/kc-updates.svg"
                    alt="Keycloak Version Upgrades to Keep Up-to-Date with Latest Releases"
                    style={{ maxHeight: "300px" }}
                    loading="lazy"
                  />
                </div>
                <div className="col col--5  flex flex-align-center">
                  <div>
                    <h3>
                      Keycloak Version Upgrades to Keep Up-to-Date with Latest
                      Releases
                    </h3>
                    <p>
                      Keeping Keycloak up-to-date can be a difficult process to
                      support from a time and risk perspective. Some customers
                      come to us over 10 major versions behind and need help
                      with upgrading to the latest version. A major piece of
                      this can be understanding the variations between versions
                      and how to address those items. Once upgraded to a latest
                      version, we can be proactive in helping your team stay up
                      to date with{" "}
                      <a href="https://github.com/p2-inc/phasetwo-containers">
                        new releases
                      </a>{" "}
                      with fast-follow upgrades with major releases. Depending
                      on architecture needs, many customers opt to migrate to
                      the Phase Two hosted and managed Keycloak cluster model to
                      offload that work entirely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow} ${styles.pinkGradBg}`}
        >
          <div className="contentBlockHead"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Happy Customers</h3>
                    <p>
                      Phase Two has many happy customers across the globe that
                      include Tier 1 CDNs, global transport companies, digital
                      security providers, digital signage providers, and more.
                      Our customers have saved hundreds of thousands of dollars
                      migrating to Keycloak and delivered better experiences in
                      the process.
                    </p>
                  </div>
                </div>
                <div className="col col--offset-1 col--5 flex flex-align-center">
                  <img
                    src="/img/happy-customers.svg"
                    alt="Phase Two Happy Customers"
                    style={{ maxHeight: "400px" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contentBlock">
          <div className="contentBlockBody">
            <KeycloakSupportPackages />
          </div>
        </div>

        <div className="contentBlock">
          <div className="contentBlockBody">
            <div className={`${styles.callout} card`}>
              <h4 className={styles.calloutHeader}>
                Learn more about Phase Two's Enterprise Support
              </h4>
              <div className="margin-top--md">
                <a
                  href="https://app.simplymeet.me/phasetwo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="margin-right--md"
                >
                  <button className="btnTertiary">
                    Let&apos;s Talk About It
                  </button>
                </a>
                <a
                  href="https://phasetwo.io/dashboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btnTertiary margin-right--md">
                    Get Started For Free
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* <div class="contentBlock">
          <div className="contentBlockHead">
            <h2>Frequently Asked Questions?</h2>
          </div>
          <div class="contentBlockBody">
            <div className={faqStyles.questionsBox}>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  
                </div>
                <div className={faqStyles.questionAnswer}>
                  
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </main>
    </Layout>
  );
}
