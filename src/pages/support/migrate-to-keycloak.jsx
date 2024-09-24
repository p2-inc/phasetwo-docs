import React from "react";
import Layout from "@theme/Layout";
import styles from "./styles.module.css";
import { InlineIcon } from "@iconify/react";
import { KeycloakSupportPackages } from "../../components/keycloak-support-packages";

export default function MigrateToKeycloak() {
  return (
    <Layout
      title="Migrate to Phase Two + Keycloak"
      description="Phase Two provides Enterprise Support for system migrations to Phase Two + Keycloak."
    >
      <main>
        <div className="pageHero">
          <div className="pageHeroMsg">
            <h1>Migrate to Keycloak</h1>
          </div>
          <div className="pageHeroMsgIntro">
            <p>
              Phase Two can help migrate from any existing IAM system like{" "}
              <a href="https://auth0.com/" target="_blank" rel="noreferrer">
                Auth0
              </a>
              ,{" "}
              <a href="https://www.okta.com/" target="_blank" rel="noreferrer">
                Okta
              </a>
              ,{" "}
              <a
                href="https://www.pingidentity.com/"
                target="_blank"
                rel="noreferrer"
              >
                Ping
              </a>{" "}
              and more to Keycloak. We’ve written extensively about why Keycloak
              is a strong choice for an{" "}
              <a href="https://phasetwo.io/blog/open-source-iam/">
                Open-Source IAM
              </a>
              . Initial setup and migration can involve varying levels of
              complexity, whether you need to migrate users, recreate logic or
              flows, reestablish authentication endpoints, duplicate existing
              functionality or customize that further, Phase Two can assist.
            </p>
            <div className={`pageHeroCta`}>
              <a href="mailto:sales@phasetwo.io">
                <button className={`btnPrimary`}>Let's talk</button>
              </a>
              <a
                href="https://phasetwo.io/support/#experts"
                className="margin-left--md"
              >
                <button className={`btnPrimary`}>Show me pricing</button>
              </a>
            </div>
          </div>
          <div className={styles.bgImg}>
            <img
              src="/img/gradient-bg.webp"
              alt="Color Gradient"
              loading="lazy"
            />
          </div>
          <div className={`pageHeroBgCircles`}>
            <img
              src="/img/circles.svg"
              alt="Concentric Circles"
              loading="lazy"
            />
          </div>
        </div>
        <div className="contentBlock z-5 stats">
          <div className="contentBlockHead">
            <h2>Migrate to Keycloak from Other Identity Provider Systems</h2>
          </div>
          <div className="contentBlockBody">
            <div className="row">
              <div className="col margin-bottom--md">
                <div className="container" style={{ maxWidth: "960px" }}>
                  <div className={`row frameworkGridTop frameworkMigrate`}>
                    <div className={`col ${styles.frameworkGridColMigrate}`}>
                      <a
                        href="https://phasetwo.io/blog/keycloak-vs-auth0-open-source-alternative/"
                        className="margin-right--sm"
                      >
                        <InlineIcon
                          icon="logos:auth0"
                          style={{ fontSize: "1.5rem" }}
                        />{" "}
                      </a>
                    </div>
                    <div className={`col ${styles.frameworkGridColMigrate}`}>
                      <a
                        href="https://phasetwo.io/blog/keycloak-vs-okta-open-source-alternative/"
                        className="margin-right--sm"
                      >
                        <InlineIcon
                          icon="logos:okta"
                          style={{ fontSize: "1.6rem" }}
                        />{" "}
                      </a>
                    </div>
                    <div className={`col ${styles.frameworkGridColMigrate}`}>
                      <a
                        href="https://phasetwo.io/blog/keycloak-vs-PingIdentity-open-source-alternative/"
                        className="margin-right--sm"
                      >
                        <img
                          src="/img/logo-ping-identity.svg"
                          alt="Ping Identity"
                          style={{ height: "1.6rem" }}
                          loading="lazy"
                        />
                      </a>
                    </div>
                  </div>
                  <div className="row frameworkGridBottom">
                    <div className={`col ${styles.frameworkGridColMigrate}`}>
                      <a
                        href="https://phasetwo.io/blog/keycloak-vs-workos-open-source-alternative/"
                        className="margin-right--sm"
                      >
                        <InlineIcon
                          icon="logos:workos"
                          style={{ fontSize: "1.5rem" }}
                        />
                      </a>
                    </div>
                    <div className={`col ${styles.frameworkGridColMigrate}`}>
                      <a
                        href="https://phasetwo.io/blog/keycloak-vs-frontegg-open-source-alternative/"
                        className="margin-right--sm"
                      >
                        <img
                          src="/img/logo-frontegg.svg"
                          alt="FrontEgg"
                          style={{ height: "1.6rem" }}
                          loading="lazy"
                        />
                      </a>
                    </div>
                    <div className={`col ${styles.frameworkGridColMigrate}`}>
                      <a
                        href="https://phasetwo.io/blog/keycloak-vs-onelogin-open-source-alternative/"
                        className="margin-right--sm"
                      >
                        <img
                          src="/img/logo-onelogin.svg"
                          alt="OneLogin"
                          style={{ height: "1.6rem" }}
                          loading="lazy"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`contentBlock contentBlockRow ${styles.lightBlueBg} ${styles.contentBlockRow}`}
        >
          <div className="contentBlockBody ta-center"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--offset-1 col--4 flex flex-align-center">
                  <img
                    src="/img/migrate-to-keycloak/customer-support.svg"
                    alt="Migrate Users"
                    style={{ maxHeight: "400px" }}
                    loading="lazy"
                  />
                </div>
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Migrating Existing Users</h3>
                    <p>
                      Migrating an existing user base to Phase Two and Keycloak
                      can be accomplished via Phase Two’s{" "}
                      <a href="https://phasetwo.io/docs/user-migration/">
                        User Migration API
                      </a>
                      . We leverage an API to automate the import of users
                      allowing it to be done efficiently and without downtime.
                      Using the existing IAM’s user endpoints to export the
                      existing user set, a mapping between user values is done
                      and then the user is sent to Phase Two.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}`}
        >
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Connect Identity Providers</h3>
                    <p>
                      One of the main reasons to adopt a system like Keycloak is
                      to handle the mix of users from different companies and
                      allow them to leverage the IDP their company uses.
                      Keycloak has first class treatment for many IDPs and also
                      can be setup with any generic IDP over SAML or OIDC. That
                      means that organizations using any number or mix IDPs
                      (custom, commercial, etc) will be able to coalesce on
                      Keycloak. To facilitate the ease of setup, Phase Two has
                      built a full{" "}
                      <a href="https://phasetwo.io/docs/sso/wizards/">wizard</a>{" "}
                      workflow. Combined with the Phase Two Organization
                      extension, IDPs can be mapped to an Organization and
                      user’s login will automatically be sent to the correct IDP
                      based on their credentials.
                    </p>
                  </div>
                </div>
                <div className="col col--offset-1 col--4 flex flex-align-center">
                  <img
                    src="/img/migrate-to-keycloak/cloud-connections.svg"
                    alt="Architecture Review"
                    style={{ maxHeight: "300px" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}  ${styles.lightBlueBg}`}
        >
          <div className="contentBlockHead">
            <h3>Create Login Flows</h3>
            <p>
              Keycloak is capable of recreating almost any desired login flow.
              In addition, due to its open source nature, customization as
              needed can also be done. Keycloak has the functionality to
              implement MFA, OTP, Magic Link, WebAuthn, username/password, and
              custom authenticators. Keycloak can support any business need
              surrounding a login flow. Phase Two has created many of the most
              popular authentication flow extensions, and they are included by
              default in our hosted product and{" "}
              <a href="https://quay.io/repository/phasetwo/phasetwo-keycloak">
                Docker image
              </a>
              .
            </p>
          </div>
          <div className="contentBlockBody ta-center">
            <img
              src="/img/migrate-to-keycloak/user-register.svg"
              alt="User Register"
              style={{ maxHeight: "400px" }}
              loading="lazy"
            />
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}`}
        >
          <div className="contentBlockHead"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--offset-2 col--4 flex flex-align-center">
                  <img
                    src="/img/server-network-technology.svg"
                    alt="Health Assessment"
                    style={{ maxHeight: "300px" }}
                    loading="lazy"
                  />
                </div>
                <div className="col col--4  flex flex-align-center">
                  <div>
                    <h3>API Integration</h3>
                    <p>
                      Keycloak has a plethora of APIs that allow moving from one
                      system to another, much easier. This means that existing
                      APIs an application already leverages with another system,
                      can be changed to analogous ones within Keycloak. An
                      application’s users do not need to know that this change
                      has even occurred.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow} ${styles.pinkGradBg}`}
        >
          <div className="contentBlockHead"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Organizations, Roles, and Permissions</h3>
                    <p>
                      Establishing hierarchy within a user base is key to making
                      sure user’s have correct permissions and are properly
                      gated within an application. Phase Two’s Organization
                      extension allows companies to introduce a logical separate
                      of users that maps users to an IDP and a set of roles
                      within that organization. This allows companies to move
                      from any existing IAM and role hierarchy to Keycloak
                      without a disruption of service. Organizations can also be
                      self-administered in Phase Two through the bundled Admin
                      Portal. This allows organization admins to self-manage
                      their own user base and organization settings.
                    </p>
                  </div>
                </div>
                <div className="col col--offset-1 col--6 flex flex-align-center">
                  <img
                    src="/img/migrate-to-keycloak/team-solving-puzzle.svg"
                    alt="Organizations, Roles, and Permissions"
                    style={{ maxHeight: "400px" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`contentBlock contentBlockRow ${styles.contentBlockRow}`}
        >
          <div className="contentBlockHead"></div>
          <div className="contentBlockBody">
            <div className="container">
              <div className="row">
                <div className="col col--offset-1 col--5 flex flex-align-center">
                  <img
                    src="/img/happy-customers.svg"
                    alt="Phase Two Happy Customers"
                    style={{ maxHeight: "400px" }}
                    loading="lazy"
                  />
                </div>
                <div className="col col--4 col--offset-1 flex flex-align-center">
                  <div>
                    <h3>Happy Customers</h3>
                    <p>
                      Phase Two has many happy customers across the globe that
                      include Tier 1 CDNs, global transport companies, digital
                      security providers, digital signage providers, and more.
                      Our customers have saved hundreds of thousands of dollars
                      migrating to Keycloak and delivered better experiences in
                      the process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="contentBlock">
          <div className="contentBlockBody">
            <div className={`${styles.callout} card`}>
              <h4 className={styles.calloutHeader}>
                Learn more about Phase Two's Enterprise Support
              </h4>
              <div className="margin-top--md">
                <a
                  href="https://scheduler.zoom.us/phasetwo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="margin-right--md"
                >
                  <button className="btnTertiary">
                    Let&apos;s Talk About It
                  </button>
                </a>

                <a href="https://phasetwo.io/support/#experts">
                  <button className="btnTertiary margin-right--md">
                    Show me Pricing
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
