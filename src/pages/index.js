import React, { useEffect } from "react";
import classnames from "classnames";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";
import { render } from "react-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import CodeBlock from "@theme/CodeBlock";

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function requestAccess() {
  window.open(`https://phasetwo.io/dashboard/`, "_blank");
}

function contactSales() {
  window.open(`mailto:support@phasetwo.io`);
}

function githubHome() {
  window.open(`https://github.com/p2-inc/`, "_blank");
}

function docsEntry() {
  window.location = `/docs/introduction`;
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  /*
  constructor () {
    super()
    this.state = {
      isOpen: false
    }
    this.openModal = this.openModal.bind(this)
  }
  openModal () {
    this.setState({isOpen: true})
  }
*/

  useEffect(() => {
    document.body.classList.add("page-bg");
  });

  return (
    <Layout title={`${siteConfig.title}`} description="Tools for SaaS builders">
      <picture>
        <source media="(max-width: 767px)" srcset="/img/home-bg-mobile.jpg" />
        <source media="(min-width: 768px)" srcset="/img/home-bg.jpg" />
        <img
          className="page-home"
          src="/img/home-bg-mobile.jpg"
          alt="Gradient Background"
        />
      </picture>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className={`pageHero`}>
          <div className={styles.heroInner}>
            {/* Hero Message */}
            <div className={`pageHeroMsg`}>
              {/* <picture>
                <source media="(max-width: 767px)" srcset="/img/home-hero-mobile.png" />
                <source media="(min-width: 768px)" srcset="/img/home-hero.png" />
                <img className="pageHeroImg" src="/img/home-hero-mobile.png" alt="Illustration showing PhaseTwo solutions: SSO, Identity and User Management" />
		</picture> */}
              <h1>Future-Proof Your App</h1>
              <p className={`pageHeroMsgIntro`}>
                Accelerate SaaS time-to-market and enterprise adoption by
                rapidly integrating the features you need.
              </p>
              <div className={`pageHeroCta`}>
                <button className={`btnCta`} onClick={requestAccess}>
                  Try Phase Two for Free
                </button>
              </div>
            </div>
          </div>
          <div className={styles.heroSections}>
            <Link to={"product/sso"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-sso.svg"
                alt="Pictogram showing key"
              />
              <p>SSO</p>
              <div className={styles.heroSectionPlus}>
                <img src="img/plus.svg" alt="Plus" />
              </div>
            </Link>
            <Link to={"product/identity"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-identity.svg"
                alt="Pictogram showing a person"
              />
              <p>Identity</p>
              <div className={styles.heroSectionPlus}>
                <img src="img/plus.svg" alt="Plus" />
              </div>
            </Link>
            <Link to={"product/organizations"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-organizations.svg"
                alt="Pictogram showing multiple persons interacting"
              />
              <p>Organizations</p>
              <div className={styles.heroSectionPlus}>
                <img src="img/plus.svg" alt="Plus" />
              </div>
            </Link>
            <Link to={"product/adminportal"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-admin-portal.svg"
                alt="Pictogram showing a browser"
              />
              <p>Admin Portal</p>
              <div className={styles.heroSectionPlus}>
                <img src="img/plus.svg" alt="Plus" />
              </div>
            </Link>
            <Link to={"product/onprem"} className={styles.heroSection}>
              <img
                className={styles.heroSectionPicto}
                src="img/picto-on-prem.svg"
                alt="Pictogram showing on prem servers"
              />
              <p>On-Prem Deployment</p>
            </Link>
          </div>

          <div className={styles.heroFeats}>
            <div className={styles.heroFeat}>
              <img src="img/picto-open-source.svg" alt="Open Source Logo" />
              <p>We are open source</p>
            </div>
            <div className={styles.heroFeat}>
              <img
                src="img/picto-fixed-pricing.svg"
                alt="Pictogram showing fixed US dollar sign"
              />
              <p>Fixed pricing for peace of mind</p>
            </div>
            <div className={styles.heroFeat}>
              <img
                src="img/picto-cloud-or-on-prem.svg"
                alt="Pictogran showing cloud and on-prem servers"
              />
              <p>Cloud or on-prem deployment</p>
            </div>
          </div>

          <div className={styles.heroIntegrations}>
            <p>Integrates with</p>
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
              />
            </picture>
            <div className={styles.heroIntegrationRow}>
              <div className={styles.heroIntegration}>
                <img src="img/logo-okta.svg" alt="Okta Logo" />
              </div>
              <div className={styles.heroIntegration}>
                <img src="img/logo-auth0.svg" alt="Auth0 Logo" />
              </div>
              <div className={styles.heroIntegration}>
                <img src="img/logo-azure.svg" alt="Azure Logo" />
              </div>
              <div className={styles.heroIntegration}>
                <img
                  src="img/logo-google-workspace.svg"
                  alt="Google Workspace Logo"
                />
              </div>
              <div className={styles.heroIntegration}>
                <img
                  src="img/logo-active-directory.svg"
                  alt="Active Directory Logo"
                />
              </div>
              <div className={styles.heroIntegration}>
                <img src="img/logo-jump-cloud.svg" alt="JumpCloud Logo" />
              </div>
              <div className={styles.heroIntegration}>
                <img src="img/logo-onelogin.svg" alt="Onelogin Logo" />
              </div>
              <div className={styles.heroIntegration}>
                <img
                  src="img/logo-ping-identity.svg"
                  alt="Ping Identity Logo"
                />
              </div>
              <div className={styles.heroIntegration}>
                <img src="img/logo-duo-security.svg" alt="Duo Security Logo" />
              </div>
              <div
                className={`${styles.heroIntegration} ${styles.heroIntegrationMore}`}
              >
                <p>+ many more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise SSO */}
        <div className={`contentBlock`}>
          <div className={`enterpriseSsoBgImg bgImg`}>
            <img src="/img/enterprise-sso-bg.png" alt="Color Gradient" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>No-code Enterprise SSO</h2>
            <p>
              Leap up market into enterprise adoption with seamless SSO support.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.enterpriseSSO}>
              <div className={styles.enterpriseSSOL}>
                <img
                  className={styles.listFeatsImg}
                  src="img/hero-feature-sso.png"
                  alt="SSO Login Examples"
                />
              </div>
              <div className={styles.enterpriseSSOR}>
                <ul className={styles.listFeats}>
                  <li>
                    <img
                      className={styles.listFeatsPicto}
                      src="img/picto-5-min-integration.svg"
                      alt="Pictogram showing 5 minutes on a hour"
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
            <h2>Admin Portal</h2>
            <p>
              Seamless onboarding and self-management for your customer
              administrators and users. Empower your users and customers to
              easily manage every aspect of identity, organization and SSO.
              Drastically reduce customer support.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.aportal}>
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcset="/img/img-admin-portal-new1-mobile.png"
                />
                <source
                  media="(min-width: 768px)"
                  srcset="/img/img-admin-portal-new1.png"
                />
                <img
                  src="/img/img-admin-portal-new1.png"
                  alt="Screenshots showing management of users, domains and SSO"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Developers */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>By Developers, For Developers</h2>
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
            <div class={`contentBlockCta`}>
              <button className={`btnPrimary`} onClick={docsEntry}>
                Go to Documentation
              </button>
            </div>
          </div>
        </div>

        {/* PhaseTwo Loves Keycoak */}
        <div className={`contentBlock`}>
          <div className={`keycloakBgCircles bgImg`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>
              Phase Two{" "}
              <img
                className={styles.heart}
                src="img/heart-filled.svg"
                alt="Heart symbols"
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
              />
            </div>

            <div className={styles.featCards}>
              <div class={styles.featCard}>
                <img
                  className={styles.featCardPicto}
                  src="img/picto-open-source-alt.svg"
                  alt="Pictogram showing Open Source logo"
                />
                <h5>Always Open Source</h5>
                <p>
                  Phase Two is built as a collection of open source Keycloak
                  extensions. While we endeavor to make Keycloak simple to use,
                  operate and scale, in the cloud or on prem.
                </p>
              </div>
              <div class={styles.featCard}>
                <img
                  className={styles.featCardPicto}
                  src="img/picto-hardened.svg"
                  alt="Pictogram showing a fortress"
                />
                <h5>Battle-tested and hardened</h5>
                <p>
                  Keycloak has been battle-tested and hardened for over 7 years.
                  Its security and reliability is depended on by organizations
                  from small startups to governments and Fortune 500 companies.
                </p>
              </div>
              <div class={styles.featCard}>
                <img
                  className={styles.featCardPicto}
                  src="img/picto-community.svg"
                  alt="Pictogram showing a group of poeple interconnected"
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
            <img src="/img/gradient-bg.png" alt="Color Gradient" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Phase Two is One Price Per Project</h2>
            <p>No hidden fees, no unpredictable costs.</p>
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
                        alt="Pictogram showing a sprout"
                      />
                      <h3>Starter</h3>
                      <p>Always FREE *</p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          All features
                        </li>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          &#60;1,000 users
                        </li>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          &#60;10 SSO connections
                        </li>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          Community support
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
                        src="img/plan-premium.svg"
                        alt="Pictogram showing a plant in a van"
                      />
                      <h3>Premium</h3>
                      <p>
                        <span className={styles.planFrom}>from</span>{" "}
                        <strong className={styles.planPrice}>$499</strong>/mo
                      </p>
                    </div>
                    <div className={styles.planBody}>
                      <ul className={styles.checklist}>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          All features
                        </li>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          Unlimited users
                        </li>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          Unlimited SSO connections
                        </li>
                        <li>
                          <img
                            className={styles.checklistIcon}
                            src="img/checkmark.svg"
                            alt="Checkmark"
                          ></img>
                          Chat & email support
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
          <div className={`contentBlockCta`}>
            <p>
              For on-prem support and bundling options, please{" "}
              <a href="mailto:sales@phasetwo.io">contact sales</a>.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Home;
