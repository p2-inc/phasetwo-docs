import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import React from "react";

const FAQS = [
  {
    q: "How does Single Sign-on (SSO) work?",
    a: (
      <p className="mb-0">
        Single Sign-On (SSO) allows a user to access multiple applications with one set of login credentials.
        When a user logs in to a primary system (Identity Provider or IdP), an authentication token is generated.
        This token is used to authenticate the user across other connected applications (Service Providers or SPs)
        without requiring additional logins. SSO improves security and user convenience by centralizing
        authentication and reducing the number of passwords users need to remember.
      </p>
    ),
  },
  {
    q: "What are the benefits of SSO?",
    a: (
      <ul className="list-disc pl-6 space-y-2 mb-0">
        <li>
          <b>User Convenience</b>: Fewer passwords to remember and manage.
        </li>
        <li>
          <b>Improved Security</b>: Centralized authentication with strong, complex passwords.
        </li>
        <li>
          <b>Administrative Efficiency</b>: Simplified user management and reduced help desk costs for password
          resets.
        </li>
        <li>
          <b>Consistent Experience</b>: Seamless access to multiple applications enhances productivity.
        </li>
      </ul>
    ),
  },
  {
    q: "What are some of the key components of SSO?",
    a: (
      <ul className="list-disc pl-6 space-y-2 mb-0">
        <li>
          <b>Identity Provider (IdP)</b>: The centralized system that handles authentication and issues tokens
          (e.g., Okta, Azure AD, Auth0).
        </li>
        <li>
          <b>Service Providers (SP)</b>: The applications or services that rely on the IdP for authentication
          (e.g., Gmail, Salesforce).
        </li>
        <li>
          <b>Authentication Protocols</b>: Standard protocols such as SAML (Security Assertion Markup Language),
          OAuth, and OpenID Connect facilitate secure token exchanges between the IdP and SPs.
        </li>
      </ul>
    ),
  },
  {
    q: "What is an SSO Authentication Token?",
    a: (
      <p className="mb-0">
        An SSO authentication token is a digital artifact issued by an Identity Provider (IdP) upon successful
        user authentication. This token serves as proof of the user’s identity and is used to grant access to
        multiple connected applications (Service Providers or SPs) without requiring the user to log in again.
        The token typically contains information about the user’s identity and permissions, and it is securely
        passed between the IdP and SPs to verify the user’s authentication status.
      </p>
    ),
  },
  {
    q: "What are the different types of Single Sign-On?",
    a: (
      <div className="space-y-4">
        <p className="mb-0">
          There are several types of Single Sign-On (SSO) solutions, each designed to meet different security
          and integration requirements. The main types include:
        </p>
        <ol className="list-decimal pl-6 space-y-2 mb-0">
          <li>Kerberos-Based SSO</li>
          <li>Security Assertion Markup Language (SAML)</li>
          <li>OAuth/OpenID Connect</li>
          <li>Lightweight Directory Access Protocol (LDAP)</li>
          <li>Central Authentication Service (CAS)</li>
        </ol>
      </div>
    ),
  },
  {
    q: "What is IDP initiated and SP initiated SSO?",
    a: (
      <div className="space-y-4">
        <p className="mb-0">
          <b>IDP-Initiated SSO</b> starts with the user logging in directly at the Identity Provider (IdP). After
          authentication, the IdP redirects the user to the Service Provider (SP) with an authentication token,
          granting access to the application.
        </p>
        <p className="mb-0">
          <b>SP-Initiated SSO</b> starts with the user attempting to access the Service Provider (SP) directly.
          The SP redirects the user to the Identity Provider (IdP) for authentication. After successful login,
          the IdP sends an authentication token back to the SP, which then grants access to the user.
        </p>
      </div>
    ),
  },
  {
    q: "How do I start using SSO with Phase Two?",
    a: (
      <p className="mb-0">
        Setting up SSO with Phase Two is simple and easy. Read our{" "}
        <Link to="/blog/sso-setup" className="link-primary">
          SSO article
        </Link>{" "}
        on how to set it up. With Phase Two you can create multiple SSO interactions, including a “landing
        page” filled with boxes of the various services a user can sign into.
      </p>
    ),
  },
  {
    q: "Does Keycloak support Single Logout (SLO)?",
    a: <p className="mb-0">Yes!</p>,
  },
];

export default function SsoFaq() {
  return (
    <Layout
      title="SSO FAQ"
      description="Frequently asked questions about Single Sign-On (SSO) and how it works with Keycloak."
    >
      <main className="hosting-page">
        <section className="subpage-section subpage-hero-section">
          <div
            className="relative isolate overflow-hidden"
            style={{
              backgroundImage:
                "radial-gradient(52.86% 64.72% at 50% 6.64%, color-mix(in srgb, var(--ifm-color-primary) 40%, transparent) 0%, transparent 100%)",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-white text-balance">SSO FAQ</h1>
                <p className="mt-6 text-gray-300 text--body-large mb-0">
                  Straightforward answers to common Single Sign‑On questions. Looking for the product overview?{" "}
                  <Link to="/product/sso" className="link-primary">
                    Go back to SSO
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="subpage-section">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-[var(--content-width-narrow)]">
              {FAQS.map((item) => (
                <div key={item.q} className="py-10 border-b border-white/10">
                  <h3 className="text-white mb-4">{item.q}</h3>
                  <div className="text-gray-300">{item.a}</div>
                </div>
              ))}

              <div className="pt-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://dash.phasetwo.io/" target="_blank" rel="noreferrer">
                    <button className="btnPrimary min-w-[160px]">Try for Free</button>
                  </a>
                  <Link to="/docs/sso/" className="link-primary">
                    Read the SSO setup guides <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

