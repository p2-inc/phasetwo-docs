import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import { render } from "react-dom";
import Carousel from "./carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const features = [
  {
    title: <>Easy to Use</>,
    description: (
      <>
        Phase Two was designed to be easily integrated into an existing application or
      used as the structure for your new application, so you can get up and running quickly.
      </>
    ),
  },
  {
    title: <>Focus on What Matters</>,
    description: (
      <>
        Phase Two lets you focus on your competitive advantage, not the functionality common
      to all SaaS services. Let us take care of the chores so you can work on realizing your dream.
      </>
    ),
  },
  {
    title: <>Pricing Transparency</>,
    description: (
      <>
        Unlike the labyrinth of different rate cards out there that nickel and dime for each feature
      and user, Phase Two is one price per project. No hidden fees, no unpredictable costs.
      </>
    ),
  },
];

var ReactRotatingText = require('react-rotating-text');

const rotatingFeats = ['Authentication', 'Authorization', 'SSO', 'Organizations', 'Invitations', 'Audit Logs']

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
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
  window.open(
    `https://docs.google.com/forms/d/e/1FAIpQLScIwakLlJpd9OS3r1fCsPDX01Y9BTSvxf5Ceru_FrpAQE5hIA/viewform?usp=sf_link`,
    '_blank'
  );
}

function contactSales() {
  window.open(
    `mailto:support@phasetwo.io`,
  );
}  
    
function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
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
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Tools for SaaS builders">

      {/* Main Content */}
      <main>

        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroInner}>

            {/* Hero Image */}
            <div className={styles.heroImg}>
              <Carousel />
            </div>

            {/* Hero Message */}
            <div className={styles.heroMsg}>
              <h1 className={styles.heroProjectTagline}>
                {' '}
                <ReactRotatingText
                  items={rotatingFeats}
                  emptyPause={100}
                  pause={1500}
                  typingInterval={25}
                  deletingInterval={20}
                />
                {' '}<br/>
                so you can focus on <br/>your app.
              </h1>
              <p className={styles.heroIntro}>Accelerate SaaS time-to-market and enterprise adoption by rapidly integrating the features you need.</p>
              <div className={styles.heroCta}>
                <button className={styles.btnPrimary} onClick={requestAccess}>Get started</button>
              </div>
            </div>

            {/*<div className={styles.indexCtas}>
              <Link
                className={styles.indexCtasGetStartedButton}
                to={'https://docs.google.com/forms/d/e/1FAIpQLScIwakLlJpd9OS3r1fCsPDX01Y9BTSvxf5Ceru_FrpAQE5hIA/viewform?usp=sf_link'}>
                Request Access
              </Link>
            </div> */}
           
          </div>
        </div>

        
          <div className="container">

            <div className={styles.sect} id="features">

              <div className={styles.sectHead}>
                <p className={styles.sectPreHeadline}>Features</p>
                <h2 className={styles.sectHeadline}>From login to federation, it’s all in</h2>
              </div>
  
              <div className={styles.featblocks}>
                
                {/* Feature */}
                <div className={styles.feature}>
                  <div className={styles.featureImg}>
                    <img src="img/feat-identity.png" alt="Illustration showing login box with social logins and code callout"></img>
                  </div>
                  <div className={styles.featureCopy}>
                    <div>
                      <h3>Identity</h3>
                      <p>One simple integration to add authentication, authorization, account management, social logins and identity brokering.</p>
                    </div>
                  </div>
                </div>
  
                {/* Feature */}
                <div className={styles.feature}>
                  <div className={styles.featureImg}>
                    <img src="img/feat-sso.png" alt="Illustration showing enterprise SSO services (Okta, Azure, Onelogin...) with code callout"></img>
                  </div>
                  <div className={styles.featureCopy}>
                    <div>
                      <h3>SSO</h3>
                      <p>With or without adopting our identity feature, integrate once to add all enterprise identity providers.</p>
                    </div>
                  </div>
                </div>
  
                {/* Feature */}
                <div className={styles.feature}>
                  <div className={styles.featureImg}>
                    <img src="img/feat-user-federation.png" alt="Illustration showing groups of users connected to Phase Two"></img>
                  </div>
                  <div className={styles.featureCopy}>
                    <div>
                      <h3>User Federation</h3>
                      <p>Synchronize and authorize against customer and internal legacy user stores. Easily onboard enterprise customers and port your existing users.</p>
                    </div>
                  </div>
                </div>
  
  
                {/* Feature */}
                <div className={styles.feature}>
                  <div className={styles.featureImg}>
                    <img src="img/feat-organizations.png" alt="Illustration showing groups of users connected to Phase Two interface"></img>
                  </div>
                  <div className={styles.featureCopy}>
                    <div>
                      <h3>Organizations</h3>
                      <p>Empower your customers to manage their users with organizations, teams, and invitations.</p>
                    </div>
                  </div>
                </div>
  
  
                {/* Feature */}
                <div className={styles.feature}>
                  <div className={styles.featureImg}>
                    <img src="img/feat-auditing.png" alt="Illustration showing history of events with call out of one of the events (Login Failed)"></img>
                  </div>
                  <div className={styles.featureCopy}>
                    <div>
                      <h3>Auditing</h3>
                      <p>Access and administrative audit trail out of the box. One method to extend audit logging to your application’s actions.</p>
                    </div>
                  </div>
                </div>
  
              </div>

              <p className={"text-center"}>
                and much more...
              </p>

            </div>

            {/* Open Source */}

            <div className={styles.sect + ' ' + styles.sectOpenSource} id="opensource">

              <img className={styles.sectOsArrow} src="img/open-source-arrow.svg" alt="Arrow"></img>
            
              <div className={styles.sectHead}>
                <p className={styles.sectPreHeadline}>Open Source</p>
                <h2 className={styles.sectHeadline}>
                  Phase Two 
                  <img className={styles.heart} src="img/heart.svg" alt="Loves"></img>
                  Keycloak
                </h2>
                <p className={styles.sectHeadIntro}>Phase Two is based on the <a href="https://www.keycloak.org/" target="_blank">Keycloak</a> Open Source Identity and Access Management system, built and maintained by Red Hat.</p>
              </div>

              <div className={styles.feats}>
                <div className={styles.feat}>
                  <div className={styles.featInner}>
                    <img className={styles.featPicto} src="img/feat-keycloak.svg" alt="Defending companies big and small"></img>
                    <h3>Battle-tested and hardened</h3>
                    <p>Keycloak has been battle-tested and hardened for over 6 years. It's security and reliability is depended on by organizations from small startups to Fortune 500 companies and governments.</p>
                  </div>
                </div>
                <div className={styles.feat}>
                  <div className={styles.featInner}>
                    <img className={styles.featPicto} src="img/feat-extensions.svg" alt="Phase Two are Open Source extensions"></img>
                    <h3>A collection of extensions</h3>
                    <p>Phase Two is built as a collection of essential Keycloak extensions. While we endeavor to make Keycloak simple to use, operate and scale, we will maintain compatibility so that customers can always choose to migrate to their own Keycloak deployment. Our core extensions will always be <a href="docs/introduction/open-source">open source</a>.</p>
                  </div>
                </div>
              </div>
              
            </div>


            {/* Pricing */}
            <div className={styles.sect + ' ' + styles.pt0} id="pricing">

              <div className={styles.pricing}>

                <div className={styles.sectHead}>
                  <p className={styles.sectPreHeadline}>Pricing</p>
                  <h2 className={styles.sectHeadline}>Phase Two is one price per project</h2>
                  <p className={styles.sectHeadIntro}>No hidden fees, no unpredictable costs.</p>
                </div>
  
                <div className={styles.plans}>
  
                  {/* Plan */}
                  <div className={styles.plan}>
                    <img className={styles.planOutline} src="img/plan1.png" alt="Scribed outline"></img>
                    <div className={styles.planInner}>
                      <div className={styles.planHead}>
                        <img className={styles.planPicto} src="img/sprout.svg" alt="Sprout pictogram"></img>
                        <h5>Starter</h5>
                        <p className={styles.planPrice}>always <span className={styles.large}>FREE</span><sup>*</sup><br/></p>
                      </div>
                      <div className={styles.planBody}>
                        <ul className={styles.checklist}>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            All features
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            &#60;1,000 users
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            &#60;5 SSO connections
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            Community support
                          </li>
                        </ul>
                      </div>
                      <div className={styles.planFoot}>
                        <button className={styles.btnPrimary} onClick={requestAccess}>Get started</button>
                      </div>
                    </div>
                  </div>
  
                  {/* Plan */}
                  <div className={`${styles.plan} ${styles.planPop}`}>
                    <img className={styles.planOutline} src="img/plan2.png" alt="Scribed outline"></img>
                    <div className={styles.planInner}>
                      <div className={styles.planHead}>
                        <img className={styles.planPicto} src="img/tree.svg" alt="Tree pictogram"></img>
                        <h5>Premium</h5>
                        <p className={styles.planPrice}>from <span className={styles.large}>$499</span>/month</p>
                      </div>
                      <div className={styles.planBody}>
                        <ul className={styles.checklist}>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            All features
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            Unlimited users
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            Unlimited SSO connections
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            Custom theme & domain
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            Chat & email support
                          </li>
                        </ul>
                      </div>
                      <div className={styles.planFoot}>
                        <button className={styles.btnPrimary} onClick={requestAccess}>Get started</button>
                      </div>
                    </div>
                  </div>


                  {/* Plan */}
                  <div className={styles.plan}>
                    <img className={styles.planOutline} src="img/plan1.png" alt="Scribed outline"></img>
                    <div className={styles.planInner}>
                      <div className={styles.planHead}>
                        <img className={styles.planPicto} src="img/custom.svg" alt="Tree in pickup pictogram"></img>
                        <h5>On-prem license</h5>
                        <p className={styles.planPrice}><span className={styles.large}><span className={styles.small}></span>$999</span>/year/customer</p>
                      </div>
                      <div className={styles.planBody}>
                        <ul className={styles.checklist}>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            All Premium features
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            On-premise deployment
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            Replicated.com compatible
                          </li>
                          <li>
                            <img className={styles.checklistIcon} src="img/checkmark.svg" alt="Checkmark"></img>
                            Dedicated support
                          </li>
                        </ul>
                      </div>
                      <div className={styles.planFoot}>
                        <button className={styles.btnPrimary} onClick={contactSales}>Contact Sales</button>
                      </div>
                    </div>
                  </div>
                </div>
  
                <p className={styles.plansNote}>✻ Subject to terms of use and product availability</p>

              </div>

            </div>

          </div>
          

      </main>

      {/*
      <div
        className={classnames(styles.announcement, styles.announcementDark)}>
        <div className={styles.announcementInner}>
          Phase Two is currently in private BETA. Please {' '}
          <Link to={'https://docs.google.com/forms/d/e/1FAIpQLScIwakLlJpd9OS3r1fCsPDX01Y9BTSvxf5Ceru_FrpAQE5hIA/viewform?usp=sf_link'}>
          request access
          </Link>
      {' '}in order to receive an early access account.  
        </div>
      </div>
      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main> */}
    </Layout>
  );
}

export default Home;
