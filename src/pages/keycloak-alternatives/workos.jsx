import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. WorkOS: The Open-Source Alternative",
  description:
    "An in-depth comparison of Keycloak vs. WorkOS — cost of ownership, deployment, customization, scalability, and features — and why managed Keycloak is a strong open-source alternative to WorkOS.",
  keywords:
    "keycloak vs workos, workos alternative, open source workos alternative, workos pricing, managed keycloak, workos sso",
};

const heroIntro = (
  <>
    WorkOS is a closed-source, fully managed platform built to add SSO to an application quickly;
    Keycloak is the open-source alternative that competes strongly on cost, control, and
    extensibility. Here's how the two compare across cost of ownership, deployment, customization,
    scalability, and features — and why pairing Keycloak with a managed host like Phase Two often
    gives you the best of both.
  </>
);

const atAGlance = [
  { dim: "Licensing model", vendor: "Proprietary, subscription", keycloak: "Open source (Apache 2.0), no license fee" },
  { dim: "Pricing driver", vendor: "Per monthly active user + per-feature (SSO, SCIM, audit logs, custom domains)", keycloak: "Fixed infrastructure / hosting cost, not per-user or per-feature" },
  { dim: "Cost predictability", vendor: "Scales with users, connections, and features", keycloak: "Predictable; decoupled from user growth and feature gates" },
  { dim: "Deployment", vendor: "Cloud SaaS only, hosted by WorkOS", keycloak: "Self-hosted, your cloud, on-premise, or managed" },
  { dim: "Data residency / sovereignty", vendor: "Limited control", keycloak: "Full control over environment and data location" },
  { dim: "Standards", vendor: "OAuth 2.0, OIDC, SAML, SCIM", keycloak: "OAuth 2.0, OIDC, SAML, SCIM, LDAP" },
  { dim: "Extensibility", vendor: "Unified API, bounded customization", keycloak: "Full source access + SPIs/extensions" },
  { dim: "Vendor lock-in", vendor: "High", keycloak: "Low — portable, standards-based" },
];

const sections = [
  {
    title: "Cost of Ownership",
    body: (
      <>
        <p>
          WorkOS operates on a subscription-based model, where pricing is tied to the number of
          monthly active users. While a large block of users is included at the base tier, WorkOS
          charges separately for capabilities like custom domains, SSO connections, SCIM
          provisioning, and audit logs. The more enterprise customers you onboard, the more your
          costs grow — and with every feature enabled, the per-user cost climbs, so bills can rise
          quickly and become a significant piece of overall IT spend.
        </p>
        <p>
          Keycloak, by contrast, is open source and free to use regardless of users or scale. The
          primary cost is the infrastructure to host and operate the software. Because cost isn't
          driven by features, connections, or user counts, your spend tends to be{" "}
          <strong>fixed</strong> — a far more predictable model when you're bringing multiple
          applications together, since adding connections doesn't increase your bill. The biggest
          cost factor becomes the scale of the infrastructure you need.
        </p>
        <p>
          <strong>Winner: Keycloak.</strong> With the right hosting solution, Keycloak is a far
          more cost-effective choice, freeing organizations to allocate funds elsewhere. Compare a{" "}
          <Link to="/pricing/hosting/">side-by-side pricing estimate</Link>, or start on{" "}
          <Link to="/hosting/">Phase Two's hosting</Link> to test and integrate authentication and
          authorization into your applications.
        </p>
      </>
    ),
  },
  {
    title: "Deployment and Maintenance",
    body: (
      <>
        <p>
          WorkOS is a cloud-based identity platform that is hosted and managed by WorkOS. It offers
          a simpler deployment process because there's no infrastructure to set up or maintain, and
          organizations benefit from reduced internal IT burden since WorkOS handles updates,
          security patches, and system maintenance.
        </p>
        <p>
          Keycloak can be deployed on-premise or in a private cloud, giving you complete control
          over the infrastructure and the ability to customize and integrate with existing systems.
          With support for Docker, Kubernetes, and other containerization technologies, it slots
          into existing environments and workflows. The trade-off with self-hosting is that
          organizations must allocate resources to install, configure, update, and operate the
          underlying infrastructure. Phase Two removes that trade-off with{" "}
          <Link to="/hosting/">managed hosting</Link> and{" "}
          <Link to="/support/zero-downtime-upgrades/">zero-downtime upgrades</Link>, so you keep
          Keycloak's control without the operational load.
        </p>
        <p>
          <strong>Winner: WorkOS for a fully hands-off managed service; a tie when Keycloak is
          managed by Phase Two.</strong> If you need on-premise or strict data control, Keycloak
          wins clearly — and it still lets you{" "}
          <Link to="/hosting/self-host-vs-managed/">self-host or use managed hosting</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Customization and Branding",
    body: (
      <>
        <p>
          Keycloak offers unparalleled customization and extensibility — from authentication flows
          and user federation to role-based access control (RBAC) and fine-grained permissions —
          letting organizations tailor the user experience, login screens, and authentication
          process to their specific needs. That level of control does require learning the
          capabilities of Keycloak.
        </p>
        <p>
          WorkOS offers more limited customization options and focuses on providing a unified user
          experience across different identity providers. We tip our hats to WorkOS for the
          excellent job they've done on design and user experience.
        </p>
        <p>
          <strong>Winner: Keycloak, by a nose.</strong> Keycloak offers complete control over the
          look and feel of the authentication and authorization process, while WorkOS does a strong
          job of simplifying and constraining the problem for quick implementation.
        </p>
      </>
    ),
  },
  {
    title: "Scalability and Performance",
    body: (
      <>
        <p>
          With its robust architecture, Keycloak is designed to handle large-scale user bases,
          making it an ideal choice for enterprises. It can be scaled horizontally by adding more
          instances or running in clustered mode, ensuring high performance and reliability.
          Keycloak is a great platform to unify on for companies with a growing number of
          applications that have each taken their own approach to IAM.
        </p>
        <p>
          WorkOS offers scalable infrastructure, but it's better suited to small- and medium-sized
          applications with moderate-to-high traffic. Its architecture is optimized for efficient
          performance but may be less well-equipped for extremely high user-traffic volumes or a
          rapidly growing number of connected enterprises. It tends to be stronger when working with
          a specific application rather than connecting many applications together.
        </p>
        <p>
          <strong>Winner: Depends.</strong> Keycloak is a strong contender for large-scale
          applications looking to scale, while WorkOS may deliver strong performance for small- and
          medium-sized apps.
        </p>
      </>
    ),
  },
  {
    title: "Functionality and Flexibility",
    body: (
      <>
        <p>
          Keycloak offers a comprehensive suite of features for modern applications. It provides
          secure authentication methods — including username/password, social logins, and MFA — as
          well as fine-grained authorization through RBAC and ABAC. Keycloak excels at identity
          federation with support for SAML and OpenID Connect, and its SSO feature offers a seamless
          experience across applications. It also provides robust user management, customization,
          self-registration, and active community support. For any missing functionality,{" "}
          <em>extensions can be written and deployed</em>, allowing Keycloak to bend and mold to the
          needs of its developers.
        </p>
        <p>
          WorkOS offers robust authentication and authorization capabilities, including role-based
          access control, policy management, and support for multiple identity standards. Its single
          sign-on feature provides a seamless experience across apps and services, and it includes
          self-service registration, account recovery, and a comprehensive user directory.
          Integration with third-party apps is simplified through APIs and pre-built integrations,
          while analytics and logging tools help with monitoring and compliance.
        </p>
        <p>
          <strong>Winner: Keycloak.</strong> Both platforms offer robust functionality, but
          Keycloak's advanced identity federation, fine-grained authorization controls, and ability
          to customize and extend give it an edge.
        </p>
      </>
    ),
  },
  {
    title: "Integration Capabilities",
    body: (
      <>
        <p>
          Keycloak's identity brokering capability lets you delegate authentication to external
          identity providers, applications, and protocols such as LDAP, SAML, OAuth, and OpenID
          Connect. Managing internal permissions and roles, security checks, and login experiences
          across different systems can be done seamlessly.
        </p>
        <p>
          WorkOS has a narrower focus on authentication, but it provides a uniform API for
          integrating with popular identity providers like Google, Microsoft, and Okta. That unified
          interface reduces complexity and development time.
        </p>
        <p>
          If you're switching from WorkOS, Keycloak can be configured to act as a broker that sits
          between WorkOS and your applications, letting you leverage the strengths of both. For
          example, WorkOS can handle external user management while Keycloak handles more sensitive,
          internal authentication needs.{" "}
          <strong>Winner: Keycloak</strong> is the most versatile choice for organizations with
          complex requirements.
        </p>
      </>
    ),
  },
  {
    title: "Community and Support",
    body: (
      <>
        <p>
          Keycloak has a large and active community of developers and contributors, ensuring
          continuous development, bug fixes, and updates. It has extensive documentation, forums,
          and{" "}
          <a
            href="https://keycloak.discourse.group/"
            target="_blank"
            rel="noreferrer"
          >
            community support channels
          </a>{" "}
          where users can seek help and share knowledge. WorkOS also provides support but may have
          limitations in terms of community contributions and public resources; it offers dedicated
          support channels and resources for assistance and issue resolution.
        </p>
        <p>
          Working with Phase Two gives you some of the best of both worlds: easy integration with
          the ability to scale without incurring additional costs. If you have questions about Phase
          Two's <Link to="/support/">enterprise support</Link>, we're happy to help.
        </p>
      </>
    ),
  },
  {
    title: "Migrating from WorkOS to Keycloak",
    body: (
      <>
        <p>
          Moving off WorkOS is more approachable than many teams expect. Keycloak imports users,
          supports gradual cutover, and brokers identities so you can transition without disrupting
          access — see <Link to="/support/migrate-to-keycloak/">Migrate to Keycloak</Link>.
        </p>
        <p>
          You can also run Keycloak <em>alongside</em> WorkOS during a transition: Keycloak can act
          as a broker that sits between WorkOS and your applications. That lets you keep existing
          WorkOS connections — for example, for external user management — while Keycloak handles
          internal permissions, roles, and a consistent login experience. It's a low-risk path to
          migrating one piece at a time. For teams with strict requirements, Keycloak's{" "}
          <Link to="/product/onprem/">on-premise deployment</Link> options are a standout advantage
          over a cloud-only platform.
        </p>
      </>
    ),
  },
];

const faqs = [
  {
    q: "Is Keycloak a good alternative to WorkOS?",
    a: (
      <p className="mb-0">
        Yes. Keycloak supports the same core standards as WorkOS (OAuth 2.0, OpenID Connect, SAML,
        and SCIM) and matches it on most authentication and authorization features, while being open
        source and free of per-user, per-connection licensing. It also offers far greater
        customization and extensibility. The main trade-off is operational overhead, which a managed
        host like Phase Two removes.
      </p>
    ),
    text:
      "Yes. Keycloak supports the same core standards as WorkOS (OAuth 2.0, OpenID Connect, SAML, and SCIM) and matches it on most features, while being open source and free of per-user, per-connection licensing. It also offers far greater customization and extensibility. The main trade-off is operational overhead, which a managed host like Phase Two removes.",
  },
  {
    q: "Is Keycloak cheaper than WorkOS?",
    a: (
      <p className="mb-0">
        For most growing applications, yes. WorkOS pricing scales with monthly active users and
        adds per-feature charges for things like SSO connections, SCIM, custom domains, and audit
        logs, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as
        your user base and connections grow. Because cost isn't tied to features or users, the
        ongoing spend is predictable.
      </p>
    ),
    text:
      "For most growing applications, yes. WorkOS pricing scales with monthly active users and adds per-feature charges for SSO connections, SCIM, custom domains, and audit logs, while Keycloak's cost is driven by hosting infrastructure and stays largely fixed as your user base and connections grow.",
  },
  {
    q: "Can I migrate from WorkOS to Keycloak?",
    a: (
      <p className="mb-0">
        Yes. Keycloak can import your users and broker authentication to WorkOS during a phased
        cutover, so you can migrate incrementally without disrupting users. You can even run
        Keycloak as a broker in front of WorkOS to leverage both platforms during the transition.
        See <Link to="/support/migrate-to-keycloak/">Migrate to Keycloak</Link>.
      </p>
    ),
    text:
      "Yes. Keycloak can import your users and broker authentication to WorkOS during a phased cutover, so you can migrate incrementally without disrupting users. You can even run Keycloak as a broker in front of WorkOS during the transition.",
  },
  {
    q: "Does Keycloak support SAML, OIDC, OAuth 2.0, and SCIM?",
    a: (
      <p className="mb-0">
        Yes. Keycloak is built on these standards and interoperates with both modern applications
        and legacy systems, including LDAP and Active Directory. Its identity brokering lets you
        delegate authentication to external identity providers like Google, Microsoft, and Okta.
      </p>
    ),
    text:
      "Yes. Keycloak is built on these standards and interoperates with both modern applications and legacy systems, including LDAP and Active Directory. Its identity brokering lets you delegate authentication to external identity providers like Google, Microsoft, and Okta.",
  },
  {
    q: "Can Keycloak be self-hosted or run on-premise?",
    a: (
      <p className="mb-0">
        Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This
        flexibility is a key advantage over WorkOS's cloud-only model, especially for data-residency
        and compliance requirements.
      </p>
    ),
    text:
      "Yes. Keycloak can run on-premise, in your own cloud, or as a managed service. This flexibility is a key advantage over WorkOS's cloud-only model, especially for data-residency and compliance requirements.",
  },
];

export default function KeycloakVsWorkOS() {
  return (
    <ComparisonLayout
      vendor="WorkOS"
      slug="workos"
      meta={meta}
      heroIntro={heroIntro}
      atAGlance={atAGlance}
      sections={sections}
      faqs={faqs}
    />
  );
}
