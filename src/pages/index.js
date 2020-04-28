import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import ReactTextRotator from 'react-text-rotator';

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

const rotatingFeatures = [
  {
    text: 'Authorization',
    className: styles.heroProjectKeywords
  },      
  {
    text: 'Authentication',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Role-based Access Control',
    className: styles.heroProjectKeywords
  },
  {
    text: 'SAML SSO',
    className: styles.heroProjectKeywords
  },
  {
    text: 'OpenID SSO',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Active Directory SSO',
    className: styles.heroProjectKeywords
  },
  {
    text: 'OAuth Connections',
    className: styles.heroProjectKeywords
  },
  {
    text: 'User Federation',
    className: styles.heroProjectKeywords
  },  
  {
    text: 'Permissions',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Organizations',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Teams',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Invitations',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Audit Logs',
    className: styles.heroProjectKeywords
  }
];

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
  const email = document.getElementById("email").value;
  //todo validate email
  if (email) {
    window.open(
      `https://docs.google.com/forms/d/e/1FAIpQLScIwakLlJpd9OS3r1fCsPDX01Y9BTSvxf5Ceru_FrpAQE5hIA/viewform?usp=pp_url&entry.2001081113=${email}`,
      '_blank'
    );
  } else {
    window.open(
      `https://docs.google.com/forms/d/e/1FAIpQLScIwakLlJpd9OS3r1fCsPDX01Y9BTSvxf5Ceru_FrpAQE5hIA/viewform?usp=sf_link`,
      '_blank'
    );
  }
}

function applyStartup() {
  window.open(
    `https://docs.google.com/forms/d/e/1FAIpQLSfMDlnhjbdvtJ9nByjqyfLuPAN73m3bggz8hQV8JHUrWkdKJw/viewform?usp=sf_link`,
    '_blank'
  );
}  
    
function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Tools for SaaS builders">

      {/* Main Content */}
      <main>

        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroProjectTagline}>
              <ReactTextRotator
                content={rotatingFeatures}
                time={1500}
                startDelay={0}
              /><br/>
              so you can focus on <span className={styles.heroProjectKeywords}>your app</span>.
            </h1>
            <p className={styles.heroIntro}>Accelerate SaaS time-to-market and enterprise adoption by rapidly integrating the features you need that are not core to your business.</p>

            <div className={styles.heroImage}>
              <picture>
                <source srcSet="img/hero-mobile.png"
                        media="(max-width: 767px)"/>
                <source srcSet="img/hero.png"
                        media="(min-width: 768px)"/>
                <img src="img/hero.png" alt="Illustration showing login box with callout explaining features"></img>
              </picture>
            </div>

            <div className={styles.heroCta}>
              <p>Phase Two is currently in private BETA. Please request access in order to receive an early access account.</p>
              <div className={styles.formGroup}>
                <input id="email" type="text" className={styles.formControl} placeholder="Enter your email"/>
                <button type="submit" className={styles.btnPrimary} onClick={requestAccess}>Request access</button>
              </div>
              <a href="#" className={styles.btnVideo}>
                <img src="img/play.svg" alt="Play"></img>
                How Phase Two Works
              </a>
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
                        <h5>Early Stage Startup <sup>✻</sup></h5>
                        <p className={styles.badgeSuccess}>Free for 6 months</p>
                        <p className={styles.planPrice}><span className={styles.large}>$499</span>/month<br/>
                        after that for 1 year</p>
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
                            Email support
                          </li>
                        </ul>
                      </div>
                      <div className={styles.planFoot}>
                        <button className={styles.btnPrimary} onClick={applyStartup}>Apply now</button>
                      </div>
                    </div>
                  </div>
  
                  {/* Plan */}
                  <div className={styles.plan}>
                    <img className={styles.planOutline} src="img/plan2.png" alt="Scribed outline"></img>
                    <div className={styles.planInner}>
                      <div className={styles.planHead}>
                        <img className={styles.planPicto} src="img/tree.svg" alt="Tree pictogram"></img>
                        <h5>Premium</h5>
                        <p className={styles.planPrice}><span className={styles.large}>$999</span>/month</p>
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
                            Chat  email support
                          </li>
                        </ul>
                      </div>
                      <div className={styles.planFoot}>
                        <button className={styles.btnPrimary} onClick={requestAccess}>Request access</button>
                      </div>
                    </div>
                  </div>
  
                </div>
  
                <p className={styles.plansNote}>✻ Available to startups with &lt;$5m in funding and &lt;25 employees</p>
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
