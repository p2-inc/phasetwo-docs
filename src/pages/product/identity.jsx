import React, { useEffect } from "react";
import Layout from "@theme/Layout";
import styles from "./identity.module.css";

function Identity() {
  useEffect(() => {
    document.body.classList.add("page-identity", "page-bg");
    return () => {
      document.body.classList.remove("page-identity", "page-bg");
    };
  }, []);

  return (
    <Layout
      title="Identity Provider"
      description="Identity - Authentication with Social Login, Multi-factor, Passwordless, Magic links and more. User self-management with a user account portal"
    >
      <main>
        {/* Hero */}
        <div className={`pageHero`}>
          <div className={`pageHeroMsg`}>
            <h1>Frictionless, Customized, Cost-Effective Authentication</h1>
            <h2 className={`pageHeroMsgIntro`}>
              Authenticate your users securely across every application, from
              the first click to the last. Phase Two provides highly
              customizable Authentication flows that can be tailored to your
              application's needs. Login pages can be customized with branding
              to match your application's look and feel to create a seamless
              experience. In addition, all possible login use cases are covered,
              meaning no building out the multivariate login flows that
              inevitably come with a custom solution.
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

        {/* Social Login */}
        <div className={`contentBlock`}>
          <div className={`socialLoginBgCircles bgImg`}>
            <img src="/img/circles.svg" alt="Concentric Circles" />
          </div>
          <div className={`socialLoginBgImg bgImg`}>
            <img src="/img/social-login-bg.svg" alt="Social Login Symbols" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Social Login or Corporate IDPs</h2>
            <p>
              Add social login with popular providers like Google, Github and
              Facebook to remove barriers to engagement, and allow your users to
              maintain one identity. Or connect the corporate identity provider
              to link directly to an existing provider.
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

        {/* MFA */}
        <div className={`contentBlock`}>
          <div className={`mfaBgImg bgImg`}>
            <img src="/img/gradient-bg.webp" alt="Color Gradient" />
          </div>
          <div className={`contentBlockHead`}>
            <h2>Multi-Factor Authentication</h2>
            <p>
              Add an additional layer of security by allowing users to add
              second factors using advanced methods such as TOTP authenticator
              apps or WebAuthn devices like Yubikey or Passkeys.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-mfa.svg"
                alt="Illustration showing various Multi-Factor Authentiation Means"
              />
            </div>
          </div>
        </div>

        {/* Magic Link */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Magic Links, Passwordless Login</h2>
            <p>
              Removes friction to sign up and identity using your user’s email,
              all without compromising account security. Passwordless login
              immediately avoids password breaches, and removes the need for
              forgotten password problems.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-magic-links.svg"
                alt="Illustration showing logging in with magic link"
              />
            </div>
          </div>
        </div>

        {/* Magic Link */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>User Account Management</h2>
            <p>
              Empower your users with a user account portal that allows them to
              self-manage their account details and identity. Massively reduces
              the most common customer service issues.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={styles.bodyImg}>
              <img
                src="/img/img-user-management.svg"
                alt="Illustration showing managing users"
              />
            </div>
          </div>
        </div>

        {/* Read More */}
        <div className={`contentBlock`}>
          <div className={`contentBlockHead`}>
            <h2>Cost Effective Authentication</h2>
            <p>
              With all the various features for customizing the login
              experience, this can save immense time in development cycles
              trying to handle all the authentication use-cases. In addition,
              Phase Two does not charge based on user count or login methods,
              meaning that as app grows, you are future-proofed against
              spiraling costs.
            </p>
          </div>
          <div className={`contentBlockBody`}>
            <div className={`readMore`}>
              <div className={`readMoreL`}>
                <img
                  className={`readMoreImg`}
                  src="/img/icon-lock-access.svg"
                  alt="A magician with a hat and magic wand"
                />
              </div>
              <div className={`readMoreR`}>
                <h3>Magic Link Guide</h3>
                <p>
                  Magic links are a type of passwordless authentication that
                  allow your users to log in to your application following a
                  link that is emailed to them, rather than typing a username
                  and password. Read our guide to understand if they're right
                  for you and how to implement it in 5-minutes.
                </p>
                <a href="/blog/set-up-magic-links" className={`btnReadMore`}>
                  Read More
                  <img src="/img/arrow-long-right.svg" alt="Arrow" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Identity;
