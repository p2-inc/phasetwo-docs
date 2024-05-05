import React from "react";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";

const {
  questionBlock,
  answer,
  trustUsReasonsCol,
  trustUsReasonsColNumber,
  callout,
  calloutHeader,
} = styles;

export default function Hosted() {
  return (
    <Layout title="Hosted Keycloak" description="Premium Hosted Keycloak">
      <main>
        <div className="pageHero">
          <div className={`pageHeroBgCircles`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
          <div className="pageHeroMsg">
            <h1>Premium Hosting for Keycloak</h1>
          </div>
          <div className="pageHeroMsgIntro">
            <p>
              Identity and Access Management are mission critical to any
              application. <br />
              Hosting Keycloak and keeping up to date with version releases is
              not a simple task. As users of software ourselves, we wanted to
              remove the startup friction that inevitably comes with setting up
              a new software stack.
            </p>
            <div className={`pageHeroCta`}>
              <a href="mailto:sales@phasetwo.io">
                <button className={`btnPrimary`}>Contact Sales</button>
              </a>
            </div>
          </div>
        </div>
        <div className={`bgImg`}>
          <img src="/img/gradient-bg.png" alt="Color Gradient" />
        </div>
        <div className="contentBlock z-5">
          <div className="contentBlockHead">
            <h2>Our Focus</h2>
          </div>
          <div className="contentBlockBody">
            <div className="row">
              <div className="col margin-bottom--md">
                <div className="card card--full-height text--center">
                  <div className="card__header">
                    <img
                      src="/img/picto-simple.svg"
                      alt="Icon depicting simplicity"
                    />
                  </div>
                  <div className="card__body">
                    <h3>Simple</h3>
                    <p>
                      Integrating IAM to your application should be the number
                      one priority. Moonlighting as DevOps distracts from the
                      core competency of the business.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col margin-bottom--md">
                <div className="card card--full-height text--center">
                  <div className="card__header">
                    <img
                      src="/img/picto-secure-2.svg"
                      alt="Icon depicting simplicity"
                    />
                  </div>
                  <div className="card__body">
                    <h3>Secure</h3>
                    <p>
                      Keycloak releases major upgrades on a steady cadence and
                      upgrading is fraught with many challenges. We make sure
                      that we test and harden any release before it is rolled
                      out to our clusters.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col margin-bottom--md">
                <div className="card card--full-height text--center">
                  <div className="card__header">
                    <img
                      src="/img/picto-resilient.svg"
                      alt="Icon depicting simplicity"
                    />
                  </div>
                  <div className="card__body">
                    <h3>Resilient</h3>
                    <p>
                      Our globally deployed clusters are set-up to handle
                      service interruptions. Our focus is ensuring your App can
                      rely on a key foundational service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="contentBlock">
          <div className="contentBlockHead">
            <h2>What&apos;s right for me?</h2>
            <p>
              Understanding your app&apos;s use case is critical to determining
              what tier you will need. The main factors to consider are
            </p>
          </div>
          <div className="contentBlockBody">
            <div className="main-pillars text--center">
              <picture>
                <img
                  className={styles.heroIntegrationsLines}
                  src="/img/integration-lines-mobile.svg"
                  alt="Integration Lines"
                />
              </picture>
              <div className="row pillars">
                <div className="col"></div>
                <div className="col col--2">
                  <h4>Number of users</h4>
                </div>
                <div className="col col--2">
                  <h4>Branding customization</h4>
                </div>
                <div className="col col--2">
                  <h4>Support for complex use cases</h4>
                </div>
                <div className="col"></div>
              </div>
              <ul></ul>
            </div>

            <div className="row margin-top--xl">
              <div className="col">
                <div
                  className={`${questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>Just starting out. Testing out Keycloak or IAM.</h4>
                  </div>
                  <div className={`${answer} card__body`}>
                    <b>Free (forever) tier</b> will make it possible to figure
                    out how to start leveraging Phase Two and Keycloak.
                  </div>
                </div>
              </div>
              <div className="col">
                <div
                  className={`${questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>
                      You already have an existing Saas application and already
                      use or are transitioning to Keycloak.
                    </h4>
                  </div>
                  <div className={`${answer} card__body`}>
                    You will want a <b>dedicated cluster</b> available in one of
                    our paid plans.
                  </div>
                </div>
              </div>
              <div className="col">
                <div
                  className={`${questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>You have a global user base.</h4>
                  </div>
                  <div className={`${answer} card__body`}>
                    You need a <b>dedicated cluster</b> to support a global
                    deployment that keeps your clusters and sessions
                    synchronized, available in our <b>Enterprise</b> plan.
                  </div>
                </div>
              </div>
              <div className="col">
                <div
                  className={`${questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>
                      You need additional customization to handle complex use
                      cases.
                    </h4>
                  </div>
                  <div className={`${answer} card__body`}>
                    Our <b>Enterprise</b> offering ensures that no matter how
                    you plan to use Phase Two and Keycloak it will be handled
                    through dedicated support and consultation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="contentBlock">
          <div className="contentBlockHead">
            <h2>Why you should trust us?</h2>
          </div>
          <div className="contentBlockBody">
            <div className={`row`}>
              <div className={`${trustUsReasonsCol} col margin-bottom--lg`}>
                <div className={trustUsReasonsColNumber}>1</div>
                <div className="content">
                  <p>
                    <b>
                      We&apos;ve been working with Keycloak for approaching 8
                      years.
                    </b>{" "}
                    Since some of its earliest releases, we&apos;ve been
                    involved with the <b>community and development</b>.
                  </p>
                </div>
              </div>
              <div className={`${trustUsReasonsCol} col margin-bottom--lg`}>
                <div className={trustUsReasonsColNumber}>2</div>
                <div className="content">
                  <p>
                    We know how <b>powerful Keycloak is</b> and can be. IAM is a
                    complex subject and rather than rolling your own solution,
                    we know that Keycloak can provide the jumpstart needed to
                    get your app up and running fast. We built a product with
                    the <b>goal of making Keycloak easier and more powerful</b>.
                  </p>
                </div>
              </div>
              <div className={`${trustUsReasonsCol} col margin-bottom--lg`}>
                <div className={trustUsReasonsColNumber}>3</div>
                <div className="content">
                  <p>
                    We&apos;re <b>passionate about the community</b> (750+ stars
                    on{" "}
                    <a
                      href="https://github.com/p2-inc"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Github
                    </a>
                    ). When we see a need for additional functionality, like our
                    popular Organizations extension, we build and release it to
                    benefit all in the Keycloak community. We derive huge
                    benefit from the community and believe strongly in giving
                    that right back (
                    <a
                      href="https://youtu.be/DNq51wWw3F4"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Keycloak Demo Day
                    </a>
                    ).
                  </p>
                </div>
              </div>
              <div className={`${trustUsReasonsCol} col margin-bottom--lg`}>
                <div className={trustUsReasonsColNumber}>4</div>
                <div className="content">
                  <p>
                    Our team <b>knows how to ship</b>. We&apos;re startup
                    veterans that know shipping product matters. We{" "}
                    <b>fix bugs</b> fast. We&apos;re not afraid of a challenge.
                    We're <b>not just a Keycloak hosting company</b>, we're a
                    team of developers that are steeped in Keycloak and it's
                    community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contentBlock">
          <div className="contentBlockBody">
            <div className={`${callout} card`}>
              <h4 className={calloutHeader}>Try Phase Two</h4>
              <div className="margin-top--md">
                <a
                  href="https://phasetwo.io/dashboard/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btnTertiary margin-right--md">
                    Get Started For Free
                  </button>
                </a>
                <a
                  href="https://app.simplymeet.me/phasetwo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="btnTertiary">
                    Let&apos;s Talk About It
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
