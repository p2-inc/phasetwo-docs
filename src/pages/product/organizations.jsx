import React from "react";
import Layout from "@theme/Layout";
import styles from "./organizations.module.css";

function Organizations() {
  return (
    <Layout
      title="Organizations"
      description="Enterprise SSO, Invitations, Authorization and self-managment for customer organizations"
    >
      <main>
        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroMsg`}>
            <h1>
              Customize Authentication and Authorization for Business Customer
              Identity
            </h1>
            <h2 className={`pageHeroMsgIntro`}>
              Organizations is a SaaS identity solution that delivers
              self-management for your customers and APIs for your developers,
              so that you can start to build workflows for your customers at
              scale.
            </h2>
            <p className={`pageHeroMsgIntro`}>
              Programmatic toolset of APIs and SDKs for app development teams to
              manage and customize workflows for their end customers at scale.
            </p>
            <div className={`pageHeroCta`}>
              <a
                href="http://phasetwo.io/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className={`btnPrimary`}>Get Started</button>
              </a>
            </div>
          </div>
        </div>

        {/* Enterprise SSO Login */}
        <div className={`contentBlock`}>
          <div className={`entSocialLoginBgCircles bgImg`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
          <div className={`entSocialLoginBgImg bgImg`}>
            <img src="/img/social-login-bg.svg" alt="Social Login Symbols" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Enterprise Single Sign-on (SSO) Login for Each Customer</h2>
            <p>
              Eliminate the barriers to onboarding and engagement by adopting a
              corporate identity provider for each customer organization to
              leverage SSO with existing identity provider systems. Extend with
              common enterprise social login providers like Google or Microsoft.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-social-login.svg"
                alt="Illustration showing Google and Microsoft social login buttons"
              />
            </div>
          </div>
        </div>

        {/* Invitations */}
        <div className={`contentBlock`}>
          <div className={`mfaBgImg bgImg`}>
            <img src="/img/gradient-bg.png" alt="Color Gradient" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Streamlined Invitations for User Management</h2>
            <p>
              Empower users and organization administrators to invite users.
              Delegate the responsibility of onboarding to the organization
              admin and save precious customer support time.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-invitations.svg"
                alt="Illustration showing inviting users"
              />
            </div>
          </div>
        </div>

        {/* Roles & Permissions */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Roles, Permissions and Authorization per Customer</h2>
            <p>
              Build your own custom roles and permissions for each organization.
              Build authorization logic that includes the organization as a
              first-class entity.{" "}
              <a href="/blog/organgizations-multi-tenant-update">Learn more</a>{" "}
              why roles at the organization level are important.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-roles-permissions.svg"
                alt="Illustration showing three users with different roles and permissions"
              />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Organizations;
