import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './sso.module.css';
import { render } from "react-dom";

var ReactRotatingText = require('react-rotating-text');

function getStarted() {
  window.open(
    `https://phasetwo.io/dashboard/`,
    '_blank'
  );
}
   
function Sso() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="SSO">

      <main>

        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroBgCircles`}>
            <img src="/img/circles.svg" alt="Concentric Circles"/>
          </div>
          <div className={`ssoBgImb bgImg`}>
            <img src="/img/sso-bg.svg" alt="Authentication symbols in different colors"/>
          </div>
          <div className={`pageHeroMsg`}>
            <h1>One Simple Integration to Support Many Identity Providers</h1>
            <p className={`pageHeroMsgIntro`}>Support SSO with the most popular identity providers with just a few lines of code. 5 minutes to enable a universal login flow for a secure and consistent experience.</p>
            <div className={`pageHeroCta`}>
              <button className={`btnPrimary`} onClick={getStarted}>Get Started</button>
            </div>
          </div>
        </div>


        {/* Connect Your Customer's Users */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Connect Your Customer’s Users to Your App</h2>
            <p>Streamlined onboarding of your customer’s users leads to increased engagement, lower friction, and better retention.</p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.connectappsImg}>
              <img src="/img/diagram-connect-users-apps.svg" alt="Diagram showing connecting user's apps"/>
            </div>
          </div>
        </div>


        {/* Integrations Galore */}
        <div className={`contentBlock`}>
          <div className={`integrationsBgImg bgImg`}>
            <img src="/img/gradient-bg.png" alt="Color Gradient"/>
          </div>
          <div className={`contentBlockHead`}>
            <h2>Integrations Galore</h2>
            <p>We support dozens of popular identity providers, and provide complete SAML and OpenID Connect implementations for most of the rest.</p>
          </div>
        </div>

        <div className={styles.integrationRow}>
          <div className={styles.integration}>
            <img src="/img/logo-okta.svg" alt="Okta Logo"/>
          </div>
          <div className={styles.integration}>
            <img src="/img/logo-auth0.svg" alt="Auth0 Logo"/>
          </div>
          <div className={styles.integration}>
            <img src="/img/logo-azure.svg" alt="Azure Logo"/>
          </div>
          <div className={styles.integration}>
            <img src="/img/logo-google-workspace.svg" alt="Google Workspace Logo"/>
          </div>
          <div className={styles.integration}>
            <img src="/img/logo-active-directory.svg" alt="Active Directory Logo"/>
          </div>
        </div>
        <div className={styles.integrationRow}>
          <div className={styles.integration}>
            <img src="/img/logo-jump-cloud.svg" alt="JumpCloud Logo"/>
          </div>
          <div className={styles.integration}>
            <img src="/img/logo-onelogin.svg" alt="Onelogin Logo"/>
          </div>
          <div className={styles.integration}>
            <img src="/img/logo-ping-identity.svg" alt="Ping Identity Logo"/>
          </div>
          <div className={styles.integration}>
            <img src="/img/logo-duo-security.svg" alt="Duo Security Logo"/>
          </div>
        </div>
        <div className={styles.integrationMore}>
          <p>+ many more</p>
        </div>


        {/* Read More */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Learn More</h2>
            <p>See our articles and setup guides for a more in-depth look at our SSO features.</p>
          </div>
          <div className={`contentBlockBody`}>
            <a href="#" className={`readMore`}>
              <div className={`readMoreL`}>
                <img className={`readMoreImg`} src="/img/read-more-sso.jpg" alt="Person interacting with touch screen with key button"/>
              </div>
              <div className={`readMoreR`}>
                <h3>SSO Guide</h3>
                <p>Enterprise customers demand SSO from modern SaaS vendors. Quickly deliver a solution to the enterprise fragmentation problem, and immediately provide increased security, productivity and adoption. Read more about why you should begin now.</p>
                <a href="/blog/sso-setup" className={`btnReadMore`}>
                  Read More
                  <img src="/img/arrow-long-right.svg" alt="Arrow"/>
                </a>
              </div>
            </a>
          </div>
        </div>

      </main>

    </Layout>
  );
}

export default Sso;
