import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './customerportal.module.css';
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
      description="Customer Portal">

      <main>

        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroBgCircles`}>
            <img src="/img/circles.svg" alt="Concentric Circles"/>
          </div>
          <div className={`pageHeroMsg`}>
            <h1>Customer Portal</h1>
            <p className={`pageHeroMsgIntro`}>Seamless onboarding and self-management for your customer administrators and users. Empower your users and customers to easily manage every aspect of identity, organization and SSO. Drastically reduce customer support.</p>
            <div className={`pageHeroCta`}>
              <button className={`btnPrimary`}>Get Started</button>
            </div>
          </div>
        </div>

        <div className={styles.heroImg}>
          <img src="/img/img-customer-portal.png" alt="Person interacting with touch screen with key button"/>
        </div>


        {/* Add to Your App */}
        <div className={`contentBlock`}>
          <div className={`addToAppBgImg bgImg`}>
            <img src="/img/gradient-bg.png" alt="Color Gradient"/>
          </div>
          <div className={`contentBlockHead`}>
            <h2>Add it to Your App with Minimal Code</h2>
            <p>A link to the portal can be easily generated and added to your application. When a logged-in user clicks on the link, we take care of the permissions to give them an optimized experience.</p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={`codeBox ` + styles.codeBox}>
              Put some code here
            </div>
          </div>
        </div>


      </main>

    </Layout>
  );
}

export default Sso;