import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Auth0: The Open-Source Alternative (2026 Guide)",
  description:
    "A 2026 comparison of Keycloak vs. Auth0 — cost, deployment, maintenance, and features — and why managed Keycloak is a strong open-source alternative to Auth0.",
  keywords:
    "keycloak vs auth0, auth0 alternative, open source auth0 alternative, auth0 pricing, managed keycloak",
};

const heroIntro = (
  <>
    Auth0 is a popular, fully managed cloud platform; Keycloak is the open-source alternative
    that competes strongly on cost, control, and flexibility. Here's how the two compare across
    cost of ownership, deployment, maintenance, and features — and why pairing Keycloak with a
    managed host like Phase Two often gives you the best of both.
  </>
);

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, subscription", keycloak: "Open source (Apache 2.0), no license fee" },
  { dim: "Pricing driver", vendor: "Per monthly active user (MAU) + features", keycloak: "Fixed infrastructure / hosting cost, not per-user" },
  { dim: "Cost predictability", vendor: "Scales with users and features", keycloak: "Predictable; decoupled from user growth" },
  { dim: "Deployment", vendor: "Cloud SaaS only", keycloak: "Self-hosted, your cloud, on-premise, or managed" },
  { dim: "Data residency / sovereignty", vendor: "Limited control", keycloak: "Full control over environment and data location" },
  { dim: "Standards", vendor: "OAuth 2.0, OIDC, SAML", keycloak: "OAuth 2.0, OIDC, SAML" },
  { dim: "Extensibility", vendor: "Actions framework (bounded)", keycloak: "Full source access + SPIs/extensions" },
  { dim: "Vendor lock-in", vendor: "High", keycloak: "Low — portable, standards-based" },
];

const sections = [
  {
    title: "Cost of Ownership",
    body: (
      <>
        <p>
          Auth0 operates on a subscription model that can be appealing for startups or small
          projects. Its free tier is generous on paper — up to 25,000 monthly active users (MAU) —
          but it's bounded on connections, organizations, and features, and most production
          workloads quickly outgrow it.
        </p>
        <p>
          Here's the catch: Auth0's list prices look modest until you map them to how a real
          application actually uses the platform. As of 2026, Auth0's published pricing (per month,
          billed monthly) scales like this:
        </p>
        <div className="overflow-x-auto">
          <table className="alternatives-matrix">
            <thead>
              <tr>
                <th scope="col">Monthly active users</th>
                <th scope="col">B2C Essentials</th>
                <th scope="col">B2C Professional</th>
                <th scope="col">B2B Essentials</th>
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">1,000</th><td>$70</td><td>$240</td><td>$300</td></tr>
              <tr><th scope="row">5,000</th><td>$350</td><td>$1,000</td><td>$1,300</td></tr>
              <tr><th scope="row">10,000</th><td>$700</td><td>$1,600</td><td>$2,100</td></tr>
              <tr><th scope="row">20,000</th><td>$1,400</td><td>$3,200</td><td>$3,800</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-400">
          Figures reflect Auth0's published list pricing as of 2026 (
          <a href="https://auth0.com/pricing" target="_blank" rel="noreferrer">auth0.com/pricing</a>
          ); Auth0 changes pricing periodically, so confirm current rates for your tier and region.
        </p>
        <p>Two things push the real bill well beyond the headline numbers:</p>
        <ul>
          <li>
            <strong>The features you actually need live in higher tiers and add-ons.</strong> SAML,
            LDAP/Active Directory federation, and log streaming move you up a band — and several
            common needs are billed as separate line items. Additional enterprise SSO connections
            run about $100/month <em>each</em> on B2B plans; MFA is a $100/month add-on on B2B
            Essentials; machine-to-machine (M2M) tokens are metered separately (up to roughly
            $1,200/month for 300,000 tokens); and the newer AI Agents add-on is priced at 50% of
            your base subscription.
          </li>
          <li>
            <strong>"Users" and "organizations" aren't cheap.</strong> If you sell to businesses,
            Auth0's B2B model is the one that fits — and it costs materially more than B2C at the
            same scale (for example, <strong>$3,800/month for B2B Essentials vs. $1,400/month for
            B2C Essentials at 20,000 MAU</strong>). Organizations, enterprise connections, and
            per-customer SSO all push the number up.
          </li>
        </ul>
        <p>
          For anything beyond mid-size, Auth0 routes you into a custom Enterprise contract. In
          practice those negotiations tend to land in the six figures annually — we routinely talk
          to teams whose Auth0 quotes target <strong>$100K+ per year</strong> once SSO, MFA,
          organizations, and log streaming are bundled in. The problem isn't that any single number
          is outrageous; it's that the total is hard to predict and climbs with every feature and
          every user you add.
        </p>
        <p>
          Keycloak, by contrast, is free to use regardless of users or scale. The primary cost is
          hosting and operating the software, which means your spend tends to be <strong>fixed</strong>,
          driven by infrastructure rather than user counts or feature gates.{" "}
          <strong>Winner: Keycloak.</strong> See a side-by-side{" "}
          <Link to="/pricing/hosting/">pricing estimate vs. Auth0</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Architecture and Deployment",
    body: (
      <>
        <p>
          Auth0 is a cloud-based service, so there's little infrastructure to set up. That enables
          quick deployment and removes much of the DevOps burden. The trade-off: enterprises with
          strict regulatory or data-residency requirements often need on-premise options that a
          SaaS-only model can't provide.
        </p>
        <p>
          Keycloak can be deployed on-premise, in your own cloud, or via a{" "}
          <Link to="/hosting/">managed cloud service</Link>. Because you control the deployment
          environment, it conforms to compliance and data-sovereignty needs.{" "}
          <strong>Winner: Depends.</strong> If you need on-premise or strict data control, Keycloak
          wins clearly — and it still gives you the flexibility to{" "}
          <Link to="/hosting/self-host-vs-managed/">self-host or use managed hosting</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Maintenance",
    body: (
      <>
        <p>
          As a managed service, Auth0 requires minimal maintenance from your side — it handles
          updates, security patches, and infrastructure.
        </p>
        <p>
          Self-hosted Keycloak requires more attention: installation, configuration, upgrades, and
          the underlying infrastructure. Phase Two removes this trade-off entirely: with{" "}
          <Link to="/hosting/">managed hosting</Link> and{" "}
          <Link to="/support/zero-downtime-upgrades/">zero-downtime upgrades</Link>, you get
          Keycloak's control without the operational load.{" "}
          <strong>Winner: Auth0 for self-hosted Keycloak; a tie when Keycloak is managed by Phase
          Two.</strong>
        </p>
      </>
    ),
  },
  {
    title: "Functionality and Flexibility",
    body: (
      <>
        <p>
          Auth0 offers a broad set of authentication features out of the box — social logins,
          enterprise federation, database connections — and supports OAuth 2.0, OpenID Connect, and
          SAML. Customization happens through its Actions framework, which can become difficult to
          manage as logic grows outside the main application.
        </p>
        <p>
          Keycloak matches Auth0 on core functionality and the same protocols, with customizable
          login, registration, and account-management UIs. Being open source, it lets developers
          extend the codebase far more freely — a higher ceiling for customization. A standout
          capability is Keycloak's <Link to="/product/onprem/">on-premise deployment</Link> options.{" "}
          <strong>Winner: Keycloak.</strong> The two are comparable on features, but Keycloak is far
          more extensible and configurable.
        </p>
      </>
    ),
  },
  {
    title: "Migrating from Auth0 to Keycloak",
    body: (
      <>
        <p>
          Moving off Auth0 is more approachable than many teams expect. Keycloak imports users,
          supports gradual cutover, and brokers identities so you can transition without disrupting
          access — see <Link to="/support/migrate-to-keycloak/">Migrate to Keycloak</Link>.
        </p>
        <p>
          You can also run Keycloak <em>alongside</em> Auth0 during a transition: Keycloak can act
          as a broker that delegates authentication to an external IdP such as Auth0. That lets you
          keep existing Auth0 connections while Keycloak handles internal permissions, roles, and a
          consistent login experience — a low-risk path to migrating one piece at a time.
        </p>
      </>
    ),
  },
];

const faqs = [
  {
    q: "Is Keycloak a good alternative to Auth0?",
    a: (
      <p className="mb-0">
        Yes. Keycloak supports the same core standards as Auth0 (OAuth 2.0, OpenID Connect, SAML)
        and matches it on most authentication and authorization features, while being open source
        and free of per-user licensing. The main trade-off is operational overhead, which a managed
        host like Phase Two removes.
      </p>
    ),
    text:
      "Yes. Keycloak supports the same core standards as Auth0 (OAuth 2.0, OpenID Connect, SAML) and matches it on most features, while being open source and free of per-user licensing. The main trade-off is operational overhead, which a managed host like Phase Two removes.",
  },
  {
    q: "Is Keycloak cheaper than Auth0?",
    a: (
      <p className="mb-0">
        For most growing applications, yes. Auth0 pricing scales with monthly active users and
        feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays largely
        fixed as your user base grows. Teams moving from Auth0 to managed Keycloak frequently see
        substantial savings.
      </p>
    ),
    text:
      "For most growing applications, yes. Auth0 pricing scales with monthly active users and feature tiers, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base grows.",
  },
  {
    q: "Can I migrate from Auth0 to Keycloak?",
    a: (
      <p className="mb-0">
        Yes. Keycloak can import your users and broker authentication to Auth0 during a phased
        cutover, so you can migrate incrementally without disrupting users. See{" "}
        <Link to="/support/migrate-to-keycloak/">Migrate to Keycloak</Link>.
      </p>
    ),
    text:
      "Yes. Keycloak can import your users and broker authentication to Auth0 during a phased cutover, so you can migrate incrementally without disrupting users.",
  },
  {
    q: "Does Keycloak support SAML, OIDC, and OAuth 2.0?",
    a: (
      <p className="mb-0">
        Yes. Keycloak is built on these standards and interoperates with both modern applications
        and legacy systems, including LDAP and Active Directory.
      </p>
    ),
    text:
      "Yes. Keycloak is built on these standards and interoperates with both modern applications and legacy systems, including LDAP and Active Directory.",
  },
  {
    q: "Can Keycloak be self-hosted or run on-premise?",
    a: (
      <p className="mb-0">
        Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This
        flexibility is a key advantage over Auth0's cloud-only model, especially for data-residency
        and compliance requirements.
      </p>
    ),
    text:
      "Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This flexibility is a key advantage over Auth0's cloud-only model, especially for data-residency and compliance requirements.",
  },
];

export default function KeycloakVsAuth0() {
  return (
    <ComparisonLayout
      vendor="Auth0"
      slug="auth0"
      meta={meta}
      heroIntro={heroIntro}
      atAGlance={atAGlance}
      sections={sections}
      faqs={faqs}
    />
  );
}
