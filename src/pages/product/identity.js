import React, { useEffect } from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './identity.module.css';
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

  useEffect(() => {
    document.body.classList.add('page-identity', 'page-bg');
  });


  return (
    <Layout
      title="Identity"
      description="Identity - Authentication with Social Login, Multi-factor, Passwordless, Magic links and more - User self-management with a user account portal">

      <main>

        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroMsg`}>
            <h1>Frictionless Authentication</h1>
            <p className={`pageHeroMsgIntro`}>Authenticate your users securely across every application, from the first click to the last.</p>
            <div className={`pageHeroCta`}>
              <button className={`btnPrimary`} onClick={getStarted}>Get Started</button>
            </div>
          </div>
        </div>


        {/* Social Login */}
        <div className={`contentBlock`}>
          <div className={`socialLoginBgCircles bgImg`}>
            <img src="/img/circles.svg" alt="Concentric Circles"/>
          </div>
          <div className={`socialLoginBgImg bgImg`}>
            <img src="/img/social-login-bg.svg" alt="Social Login Symbols"/>
          </div>
          <div className={`contentBlockHead`}>
            <h2>Social Login</h2>
            <p>Add social login with popular providers like Google, Github and Facebook to remove barriers to engagement, and allow your users to maintain one identity.</p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img src="/img/img-social-login.svg" alt="Illustration showing Google and Microsoft social login buttons"/>
            </div>
          </div>
        </div>


        {/* MFA */}
        <div className={`contentBlock`}>
          <div className={`mfaBgImg bgImg`}>
            <img src="/img/gradient-bg.png" alt="Color Gradient"/>
          </div>
          <div className={`contentBlockHead`}>
            <h2>Multi-Factor Authentication</h2>
            <p>Add an additional layer of security by allowing users to add second factors using advanced methods such as TOTP authenticator apps or WebAuthn devices like Yubikey or Passkeys.</p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img src="/img/img-mfa.svg" alt="Illustration showing various Multi-Factor Authentiation Means"/>
            </div>
          </div>
        </div>


        {/* Magic Link */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Magic Links</h2>
            <p>Removes friction to signup and identity using your user’s email, all without compromising account security. Immediately avoid password breaches, and remove the need for forgotten password problems.</p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img src="/img/img-magic-links.svg" alt="Illustration showing logging with magic link"/>
            </div>
          </div>
        </div>


        {/* Magic Link */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>User Account Management</h2>
            <p>Empower your users with a user account portal that allows them to self-manage their account details and identity. Massively reduces the most common customer service issues.</p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img src="/img/img-user-management.svg" alt="Illustration showing managing users"/>
            </div>
          </div>
        </div>


        {/* Read More */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Learn More</h2>
            <p>See our articles and setup guides for a more in-depth look at our identity features.</p>
          </div>
          <div className={`contentBlockBody`}>
            <a href="#" className={`readMore`}>
              <div className={`readMoreL`}>
                <img className={`readMoreImg`} src="/img/read-more-magic-link.jpg" alt="A magician with a hat and magic wand"/>
              </div>
              <div className={`readMoreR`}>
                <h3>Magic Link Guide</h3>
                <p>Magic links are a type of password-less authentication that allow your users to log in to your application following a link that is emailed to them, rather than typing a username and password. Read our guide to understand if they're right for you, and for 5-minute setup.</p>
                <a href="/blog/set-up-magic-links" className={`btnReadMore`}>
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
