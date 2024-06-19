import React from "react";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";
import faqStyles from "../../css/faq.module.css";

const { trustUsReasonsCol, trustUsReasonsColNumber, callout, calloutHeader } =
  styles;

export default function Hosted() {
  return (
    <Layout
      title="Managed Hosting for Keycloak"
      description="Phase Two provides Keycloak as a Service. This includes managed hosting for Keycloak to help you with your Identity and Access Management needs."
    >
      <main>
        <div className="pageHero">
          <div className="pageHeroMsg">
            <h1>Premium Hosting for Keycloak</h1>
          </div>
          <div className="pageHeroMsgIntro">
            <p>
              Identity and Access Management are mission critical to any
              application. <br />
              Self-Hosting Keycloak and keeping up to date with version releases
              is not a simple task. As users of open source software ourselves,
              we wanted to remove the startup friction that inevitably comes
              with setting up a new software stack or migrating to Keycloak from
              another Identity provider. Our <b>Hosted Keycloak</b> offering
              allows teams to focus on rapidly implementing Identity and Access
              Management.
            </p>
            <div className={`pageHeroCta`}>
              <a href="mailto:sales@phasetwo.io">
                <button className={`btnPrimary`}>Contact Sales</button>
              </a>
            </div>
            <p className="margin-top--md">
              Looking to Self-Host Keycloak? Learn more about our
              <a href="mailto:sales@phasetwo.io" className="margin-left--sm">
                On-Prem Deployments
              </a>
              .
            </p>
          </div>
          <div className={styles.bgImg}>
            <img src="/img/gradient-bg.png" alt="Color Gradient" />
          </div>
          <div className={`pageHeroBgCircles`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
        </div>

        <div className="contentBlock z-5">
          <div className="contentBlockHead">
            <h2>Keycloak as a Service</h2>
            <h3 className="margin-top--md">
              Managed Keycloak for the Rest of Us
            </h3>
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
                      Integrating Identity and Access Management (IAM) to your
                      application should be the number one priority.
                      Moonlighting as DevOps distracts from the core competency
                      of the business.
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
            <h2>What Hosted Keycloak Option is Right for Me?</h2>
            <p>
              Understanding your app&apos;s use case is critical to determining
              what tier you will need. The main factors to consider are
            </p>
          </div>
          <div className="contentBlockBody">
            <div className="main-pillars text--center">
              <picture>
                <img
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
                  <h4>Keycloak and branding customization</h4>
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
                  className={`${faqStyles.questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>Just starting out. Testing out Keycloak or IAM.</h4>
                  </div>
                  <div className={`${faqStyles.answer} card__body`}>
                    <b>Free (forever) tier</b> will make it possible to figure
                    out how to start leveraging Phase Two and Keycloak.
                  </div>
                </div>
              </div>
              <div className="col">
                <div
                  className={`${faqStyles.questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>
                      You already have an existing Saas application and already
                      use or are transitioning to Keycloak.
                    </h4>
                  </div>
                  <div className={`${faqStyles.answer} card__body`}>
                    You will want a <b>Dedicated Cluster</b> available in one of
                    our paid plans: Premium or Enterprise.
                  </div>
                </div>
              </div>
              <div className="col">
                <div
                  className={`${faqStyles.questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>You have a global user base.</h4>
                  </div>
                  <div className={`${faqStyles.answer} card__body`}>
                    You need a <b>Dedicated Cluster</b> to support a global
                    deployment that keeps your clusters and sessions
                    synchronized, available in our <b>Enterprise</b> plan.
                  </div>
                </div>
              </div>
              <div className="col">
                <div
                  className={`${faqStyles.questionBlock} card card--full-height text--center`}
                >
                  <div className="card__header">
                    <h4>
                      You need additional customization to handle complex use
                      cases.
                    </h4>
                  </div>
                  <div className={`${faqStyles.answer} card__body`}>
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

        <div class="contentBlock">
          <div className="contentBlockHead">
            <h2>Frequently Asked Questions?</h2>
          </div>
          <div class="contentBlockBody">
            <div className={faqStyles.questionsBox}>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  What is the difference between Phase Two and Keycloak?
                </div>
                <div className={faqStyles.questionAnswer}>
                  <div>
                    Phase Two is a company that specializes in Enterprise level
                    Keycloak Hosting and Support.{" "}
                    <i>
                      We are active contributors to the Keycloak project and
                      community
                    </i>
                    . We issue pull requests for issues and take active part in
                    community discussions whether on at{" "}
                    <a href="https://phasetwo.io/blog/keycloak-orgs-presentation/">
                      Keycloak Dev Day
                    </a>{" "}
                    Github, Forums, or mailing lists. We've been working with
                    Keycloak for a long time and have a deep understanding of
                    the project and because of this have built some of the most
                    successful{" "}
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

              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  How does Phase Two charge me?
                </div>
                <div className={faqStyles.questionAnswer}>
                  We offer subscriptions that can be paid via Credit Card or
                  Bank Account. This can all be setup online and automated. Our
                  subscriptions are project based and not user based. This means
                  that as your applications grows, you won't find you Identity
                  Provider predatorily encroaching on your margins.
                </div>
              </div>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  What type of Support does Phase Two offer?
                </div>
                <div className={faqStyles.questionAnswer}>
                  Phase Two has a few options for Keycloak Support. Read more
                  about our <a href="/#experts">support options</a>.
                </div>
              </div>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  Which cloud providers does Phase Two use?
                </div>
                <div className={faqStyles.questionAnswer}>
                  We leverage many cloud native solutions and best practices to
                  deploy our systems in AWS in various regions. This allows us
                  to best match your use-cases and region needs.
                </div>
              </div>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  Where can I deploy Phase Two?
                </div>
                <div className={faqStyles.questionAnswer}>
                  We offer Global deployments depending on your needs.
                </div>
              </div>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  Can I deploy Phase Two on-premise or to my existing cloud
                  infrastructure?
                </div>
                <div className={faqStyles.questionAnswer}>
                  Yes! <a href="/product/onprem/">Read more</a> about our
                  on-premise options.
                </div>
              </div>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  When does Phase Two upgrade Keycloak distributions? How does
                  that affect me?
                </div>
                <div className={faqStyles.questionAnswer}>
                  <div>
                    Phase Two fast-follows Keycloak releases and upgrades our
                    instances as soon as we can. We test and harden the releases
                    before they are rolled out to our clusters. This ensures
                    that you are always on the latest and most secure version of
                    Keycloak.
                  </div>
                  <div>
                    We alert and notify all existing installs before an upgrade.
                    This includes alerting customers to any breaking changes in
                    major releases and how to address them.
                  </div>
                </div>
              </div>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  How many Keycloak realms are available through Phase Two's
                  Hosted Keycloak?
                </div>
                <div className={faqStyles.questionAnswer}>
                  The free-forever tier provides a single realm. Our paid plans,
                  Premium or Enterprise, provide multiple realms.
                </div>
              </div>
              <div className={faqStyles.questionBox}>
                <div className={faqStyles.question}>
                  Can Phase Two help me migrate from another Identity Provider
                  to Keycloak?
                </div>
                <div className={faqStyles.questionAnswer}>
                  Yes! Phase Two does this all the time. We can assist with
                  consolidating multiple identity providers to Keycloak, moving
                  single apps to using Keycloak, setting up complex use cases,
                  and general Keycloak navigation (it's a large and capable
                  system, knowing where to start and what is "right" is hard)
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
