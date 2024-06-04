import React from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./sso.module.css";

function SSO() {
  return (
    <Layout
      title="Open Source SSO"
      description="Enterprise Open Source Single Sign-On for SAML, OIDC, and most Identity vendors."
    >
      <main>
        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroBgCircles`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
          <div className={`ssoBgImb bgImg`}>
            <img
              src="/img/sso-bg.svg"
              alt="Authentication symbols in different colors"
            />
          </div>
          <div className={`pageHeroMsg`}>
            <h1>One Simple Integration to Support Many Identity Providers</h1>
            <h2 className={`pageHeroMsgIntro`}>
              In just 5 minutes, integrate Keycloak SSO with most popular
              identity and access management providers. SSO enables a universal
              login flow for a secure and consistent experience.
            </h2>
            <h2 className={`pageHeroMsgIntro`}>
              By choosing Phase Two and Keycloak, you are choosing a
              cost-effective SSO solution that will scale with your application.
              As your customers expand, you have a solution that will not
              balloon in cost.
            </h2>
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

        {/* Connect Your Customer's Users */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Connect and Authenticate Your Customer’s Users to Your App</h2>
            <p>
              Streamlined onboarding of your customer’s users leads to increased
              engagement, lower friction, and better retention. Customer can
              configure their own SSO provider for a consistent experience.
            </p>
            <p className="margin-top--sm">
              Leverage the <a href="/product/organizations/">Organization</a>{" "}
              extension to setup clean separation of users based on domain. With
              SSO and Organizations you will be able to Authenticate and
              Authorize users.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.connectappsImg}>
              <img
                src="/img/diagram-connect-users-apps.svg"
                alt="Diagram showing connecting user's apps"
              />
            </div>
          </div>
        </div>

        {/* Integrations Galore */}
        <div className={`contentBlock`}>
          <div className={`integrationsBgImg bgImg`}>
            <img src="/img/gradient-bg.png" alt="Color Gradient" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Identity Provider Integrations Galore</h2>
            <p>
              Our SSO supports dozens of popular identity providers, and provide
              complete SAML and OpenID Connect implementations for most of the
              rest. Offload setup effort by leveraging the{" "}
              <a href="/product/adminportal/">Admin Portal</a> to allow your
              customer Admins to setup and configure their own SSO.
            </p>
          </div>
        </div>

        <div className={styles.integrationRows}>
          <div className={styles.integrationRow}>
            <div className={styles.integration}>
              <img src="/img/logo-okta.svg" alt="Okta Logo" />
            </div>
            <div className={styles.integration}>
              <img src="/img/logo-auth0.svg" alt="Auth0 Logo" />
            </div>
            <div className={styles.integration}>
              <img src="/img/logo-azure.svg" alt="Azure Logo" />
            </div>
            <div className={styles.integration}>
              <img
                src="/img/logo-google-workspace.svg"
                alt="Google Workspace Logo"
              />
            </div>
            <div className={styles.integration}>
              <img
                src="/img/logo-active-directory.svg"
                alt="Active Directory Logo"
              />
            </div>
          </div>
          <div className={styles.integrationRow}>
            <div className={styles.integration}>
              <img src="/img/logo-jump-cloud.svg" alt="JumpCloud Logo" />
            </div>
            <div className={styles.integration}>
              <img src="/img/logo-onelogin.svg" alt="Onelogin Logo" />
            </div>
            <div className={styles.integration}>
              <img src="/img/logo-ping-identity.svg" alt="Ping Identity Logo" />
            </div>
            <div className={styles.integration}>
              <img src="/img/logo-duo-security.svg" alt="Duo Security Logo" />
            </div>
          </div>
          <div className={styles.integrationMore}>
            <p>+ many more</p>
          </div>
        </div>

        {/* Read More */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Dive Deeper into our SSO Integrations</h2>
            <p>
              See our <a href="/blog/tags/sso">articles</a>,{" "}
              <a href="/docs/sso/">SSO setup guides</a>, and{" "}
              <a href="/docs/sso/wizards/">SSO Wizards</a> for customer self
              setup for a more in-depth look at our SSO features.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <a href="#" className={`readMore`}>
              <div className={`readMoreL`}>
                <img
                  className={`readMoreImg`}
                  src="/img/read-more-sso.jpg"
                  alt="Person interacting with touch screen with key button"
                />
              </div>
              <div className={`readMoreR`}>
                <h3>SSO Guide</h3>
                <p>
                  Enterprise customers demand SSO from modern SaaS vendors.
                  Quickly deliver a cost-effective solution to the enterprise
                  fragmentation problem, and immediately provide increased
                  security, productivity and adoption that will scale with your
                  app as it grows. Read more about why you should begin now.
                </p>
                <a href="/blog/sso-setup" className={`btnReadMore`}>
                  Read More
                  <img src="/img/arrow-long-right.svg" alt="Arrow" />
                </a>
              </div>
            </a>
          </div>
        </div>

        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Cost-Effective Single Sign-On</h2>
            <p>
              Phase Two makes it easy to quickly add SSO to any number or
              customers. As your application grows in users, your cost will not.
              This allows for a predictable cost model for you, but the ability
              to deliver a fantastic customer experience.
            </p>
          </div>
        </div>

        <div class="contentBlock">
          <div className="contentBlockHead">
            <h2>Frequently Asked Questions?</h2>
          </div>
          <div class="contentBlockBody">
            <div className={styles.questionsBox}>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  How does Single Sign-on (SSO) work?
                </div>
                <div className={styles.questionAnswer}>
                  Single Sign-On (SSO) allows a user to access multiple
                  applications with one set of login credentials. When a user
                  logs in to a primary system (Identity Provider or IdP), an
                  authentication token is generated. This token is used to
                  authenticate the user across other connected applications
                  (Service Providers or SPs) without requiring additional
                  logins. SSO improves security and user convenience by
                  centralizing authentication and reducing the number of
                  passwords users need to remember.
                </div>
              </div>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  What are the benefits of SSO?
                </div>
                <div className={styles.questionAnswer}>
                  <ul>
                    <li>
                      <b>User Convenience</b>: Fewer passwords to remember and
                      manage.
                    </li>
                    <li>
                      <b>Improved Security</b>: Centralized authentication with
                      strong, complex passwords.
                    </li>
                    <li>
                      <b>Administrative Efficiency</b>: Simplified user
                      management and reduced help desk costs for password
                      resets.
                    </li>
                    <li>
                      <b>Consistent Experience</b>: Seamless access to multiple
                      applications enhances productivity.
                    </li>
                  </ul>
                </div>
              </div>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  What are some of the key components of SSO?
                </div>
                <div className={styles.questionAnswer}>
                  <ul>
                    <li>
                      <b>Identity Provider (IdP)</b>: The centralized system
                      that handles authentication and issues tokens (e.g., Okta,
                      Azure AD, Auth0).
                    </li>
                    <li>
                      <b>Service Providers (SP)</b>: The applications or
                      services that rely on the IdP for authentication (e.g.,
                      Gmail, Salesforce).
                    </li>
                    <li>
                      <b>Authentication Protocols</b>: Standard protocols such
                      as SAML (Security Assertion Markup Language), OAuth, and
                      OpenID Connect facilitate secure token exchanges between
                      the IdP and SPs.
                    </li>
                  </ul>
                </div>
              </div>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  What is an SSO Authentication Token?
                </div>
                <div className={styles.questionAnswer}>
                  An SSO authentication token is a digital artifact issued by an
                  Identity Provider (IdP) upon successful user authentication.
                  This token serves as proof of the user’s identity and is used
                  to grant access to multiple connected applications (Service
                  Providers or SPs) without requiring the user to log in again.
                  The token typically contains information about the user’s
                  identity and permissions, and it is securely passed between
                  the IdP and SPs to verify the user’s authentication status.
                </div>
              </div>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  What are the different types of Single Sign-On?
                </div>
                <div className={styles.questionAnswer}>
                  There are several types of Single Sign-On (SSO) solutions,
                  each designed to meet different security and integration
                  requirements. The main types include:
                  <ol>
                    <li>Kerberos-Based SSO</li>
                    <li>Security Assertion Markup Language (SAML)</li>
                    <li>OAuth/OpenID Connect</li>
                    <li>Lightweight Directory Access Protocol (LDAP)</li>
                    <li>Central Authentication Service (CAS)</li>
                  </ol>
                </div>
              </div>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  What is IDP initiated and SP initiated SSO?
                </div>
                <div className={styles.questionAnswer}>
                  <b>IDP-Initiated SSO</b> starts with the user logging in
                  directly at the Identity Provider (IdP). After authentication,
                  the IdP redirects the user to the Service Provider (SP) with
                  an authentication token, granting access to the application.
                  <b>SP-Initiated SSO</b> starts with the user attempting to
                  access the Service Provider (SP) directly. The SP redirects
                  the user to the Identity Provider (IdP) for authentication.
                  After successful login, the IdP sends an authentication token
                  back to the SP, which then grants access to the user.
                </div>
              </div>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  How do I start using SSO with Phase Two?
                </div>
                <div className={styles.questionAnswer}>
                  Setting up SSO with Phase Two is simple and easy. Read our{" "}
                  <a href="/blog/sso-setup">SSO article</a> on how to set it up.
                  With Phase Two you can create multiple SSO interactions,
                  including a "landing page" filled with boxes of the various
                  services a user can sign into.
                </div>
              </div>
              <div className={styles.questionBox}>
                <div className={styles.question}>
                  Does Keycloak support Single Logout (SLO)?
                </div>
                <div className={styles.questionAnswer}>Yes!</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default SSO;
