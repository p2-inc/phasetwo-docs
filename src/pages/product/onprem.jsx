import React from "react";
import Layout from "@theme/Layout";
import styles from "./onprem.module.css";

function OnPrem() {
  return (
    <Layout
      title="On Prem Deployment"
      description="Bundle Identity and SSO when installing on-prem for IdP onboarding. Works with Kubernetes and Replicated.com"
    >
      <main>
        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroBgCircles`}>
            <img
              src="/img/circles.svg"
              alt="Concentric Circles"
              loading="lazy"
            />
          </div>
          <div className={`pageHeroMsg`}>
            <h1>Bundle Identity and SSO When You Deploy On-Prem</h1>
            <h2 className={`pageHeroMsgIntro`}>
              Sophisticated SaaS providers are realizing the value in bundling
              and deploying their solutions to customers in governments and
              regulated industries that can’t use cloud offerings for regulatory
              or compliance reasons.
            </h2>
            <div className={`pageHeroCta`}>
              <a href="mailto:support@phasetwo.io">
                <button className={`btnPrimary`}>Contact Sales</button>
              </a>
            </div>
          </div>
        </div>

        {/* Data Residency */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Data Residency? Wherever You Are</h2>
            <p>
              With increasingly complex global data laws and regulations, having
              complete control over where and how your Users’ data is stored is
              necessary. For such use cases, the complete Phase Two product
              suite can be installed and supported on the customer cloud.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-data-residency.svg"
                alt="Illustration showing a world map in dots with some dots highlighted in different color"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* On-Prem IdP onboarding */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>On-Prem IdP Onboarding</h2>
            <p>
              Onboarding an enterprise customer installing your software on site
              can be daunting. Phase Two Connect enables self onboarding by the
              customer’s IT Administrator.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-idp.svg"
                alt="Diagram showing accessing customer app via IdP and PhaseTwo Connect"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Kubernetes & Replicated.com */}
        <div className={`contentBlock`}>
          <div className={`kubernetesBgImg bgImg`}>
            <img
              src="/img/gradient-bg.webp"
              alt="Color Gradient"
              loading="lazy"
            />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Kubernetes and Replicated.com Compatible</h2>
            <p>
              We provide Docker images and Helm charts to quickly integrate SSO
              and identity management into your application bundle. It will work
              on-prem, in private cloud, and even air gap environments.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-kubernetes-replicated.svg"
                alt="Illustration showing Kubernetes and Replicated.com logos"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default OnPrem;
