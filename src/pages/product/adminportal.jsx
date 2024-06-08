import React from "react";
import Layout from "@theme/Layout";
import styles from "./adminportal.module.css";
import CodeBlock from "@theme/CodeBlock";

function AdminPortal() {
  return (
    <Layout
      title="Admin Portal"
      description="SSO onboarding and self-management for your customer administrators and users"
    >
      <main>
        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroBgCircles`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
          <div className={`pageHeroMsg`}>
            <h1>Customizable User Management</h1>
            <h2 className={`pageHeroMsgIntro`}>
              User management is a core part of Identity and Access Management
              (IAM). Empower your users and customers to easily manage every
              aspect of identity, authentication, organization, and SSO to
              drastically reduce customer support.
            </h2>
            <div className={`pageHeroCta`}>
              <a
                href="https://phasetwo.io/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className={`btnPrimary`}>Get Started</button>
              </a>
            </div>
          </div>
        </div>

        {/* Automated SSO onboarding */}
        <div className={`contentBlock z-5`}>
          <div className={`contentBlockHead`}>
            <h2>Automated SSO Onboarding</h2>
            <p>
              Self-service onboarding wizards for your customers’ IT teams that
              guide them through step-by-step setup. This "live" documentation
              supports the vendors your customer uses, and is always up-to-date.
              Avoid the pain and complexity of supporting manual SSO
              integrations.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcset="/img/img-customer-portal-mobile.png"
                />
                <source
                  media="(min-width: 768px)"
                  srcset="/img/img-customer-portal.png"
                />
                <img
                  src="/img/img-customer-portal.png"
                  alt="Person interacting with touch screen with key button"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Organization Self-Management */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Organization Self-Management</h2>
            <p>
              Enable complete self-service of identity and organization. The
              move to SaaS is accelerating, and enterprises expect full,
              customizable control over their experience. Give it to them with a
              simple link.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcset="/img/img-admin-portal-new2-mobile.png"
                />
                <source
                  media="(min-width: 768px)"
                  srcset="/img/img-admin-portal-new2.png"
                />
                <img
                  src="/img/img-admin-portal-new1.png"
                  alt="Screenshots showing management of users, domains and SSO"
                />
              </picture>
            </div>
          </div>
        </div>

        {/* Add to Your App */}
        <div className={`contentBlock`}>
          <div className={`addToAppBgImg bgImg`}>
            <img src="/img/gradient-bg.png" alt="Color Gradient" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Add it to Your App with Minimal Code</h2>
            <p>
              A link to the portal can be easily generated and added to your
              application. When a logged-in user clicks on the link, we take
              care of the permissions to give them an optimized experience.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <CodeBlock language="typescript" title="Create a portal link">
              {`import { Configuration, EventsApi, OrganizationsApi } from "@p2-inc/js-sdk";

const configuration = new Configuration({
  basePath: 'https://{host}/auth/realms',
  accessToken: getAccessToken(),
});

const realm = 'my-realm';
const orgId = 'my-organization';

const portalLinkPromise = orgs.createPortalLink({realm: realm, orgId: orgId});
const portalLink = await portalLinkPromise.then((resp) => {
  return resp.link;
});
`}
            </CodeBlock>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default AdminPortal;
