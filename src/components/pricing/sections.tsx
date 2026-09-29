import { Feature } from "./detailed-comparison";

const Sections: {
  name: string;
  description?: string;
  features: Feature[];
}[] = [
  {
    name: "Core Features",
    features: [
      {
        name: "Dedicated cluster (HA)",
        description:
          "An isolated, high-availability Keycloak environment running in a dedicated cloud instance. Every tier — including Starter — runs in its own independently provisioned cluster.",
        links: [
          {
            href: "/docs/self-service/dedicated-clusters",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Users",
        description:
          "There is no limit on how many users you register, and no limit on how many of them use the cluster. We never meter, block, or surcharge on user count.",
        links: [
          {
            href: "/docs/self-service/dedicated-clusters#users-and-cluster-sizing",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "Unlimited",
          premium: "Unlimited",
          enterprise: "Unlimited",
          custom: "Unlimited",
        },
      },
      {
        name: "Sized for active users",
        description:
          "The active-user load each tier's cluster is provisioned for, assuming an active user logs in 30 times and refreshes their token 1,000 times per month. This is a sizing guide, not a cap — nothing is blocked or surcharged above it, but performance may degrade. If it does, we work with you to tune the use case or resize the cluster.",
        links: [
          {
            href: "/docs/self-service/create-a-cluster#what-active-users-means-here",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "5K",
          premium: "100K",
          enterprise: "500K",
          custom: "500K+ · sized with you",
        },
      },
      {
        name: "Realms per cluster",
        description:
          "The number of Keycloak realms you can create on a single cluster.",
        links: [
          {
            href: "/docs/self-service/realms",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "5",
          premium: "20",
          enterprise: "100",
          custom: "Custom",
        },
      },
      {
        name: "Additional clusters (discounted)",
        description:
          "Additional dedicated Keycloak clusters for redundancy or global presence, either at the same tier or different tiers. Different tiers can be mixed and are offered at a discount.",
        links: [
          {
            href: "/docs/self-service/dedicated-clusters",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Migration assistance",
        description:
          "Assistance with migrating existing Keycloak or other identity provider user bases to Phase Two.",
        links: [
          {
            href: "/docs/user-migration/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },

      {
        name: "SSO connections",
        description: "Number of supported identity provider (SSO) connections.",
        links: [
          {
            href: "/docs/sso/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "Unlimited",
          premium: "Unlimited",
          enterprise: "Unlimited",
          custom: "Unlimited",
        },
      },
      {
        name: "Custom domain(s)",
        description: "Use your own domain(s) for login and account pages.",
        links: [
          {
            href: "/docs/self-service/custom-domains",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: "2", premium: "5", enterprise: "15", custom: true },
      },
      {
        name: "Wildcard custom domains",
        description:
          "Serve every subdomain beneath a domain from a single entry, counting as one custom domain however many subdomains you use.",
        links: [
          {
            href: "/docs/self-service/custom-domains#wildcard-domains",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "App association files",
        description:
          "Publish the Apple and Android app association files on your custom domain, so a password manager can autofill inside your mobile app and a passkey created on your login page can be used from it.",
        links: [
          {
            href: "/docs/self-service/custom-domains#app-association-files",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Default theme CSS customization",
        description:
          "Modify the default Keycloak login theme via CSS overrides.",
        links: [
          {
            href: "/docs/getting-started/customizing-ui",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Custom themes",
        description:
          "Fully custom Keycloak themes with HTML, CSS, and JS, uploaded per Keycloak major version. Allowed on Starter, but not covered by the uptime guarantee.",
        links: [
          {
            href: "/docs/self-service/resources",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "1",
          premium: "1",
          enterprise: "Unlimited",
          custom: "Unlimited",
        },
      },
      {
        name: "Custom extensions (1)",
        description:
          "Deploy your own Keycloak server extension JARs, uploaded per Keycloak major version.",
        links: [
          {
            href: "/docs/self-service/resources",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: "1",
          enterprise: "Unlimited",
          custom: "Unlimited",
        },
      },
      {
        name: "Password denylists",
        description:
          "Upload lists of passwords your users may not choose, and apply them to a realm's password policy. Not limited by tier.",
        links: [
          {
            href: "/docs/security/password-blacklist",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "Unlimited",
          premium: "Unlimited",
          enterprise: "Unlimited",
          custom: "Unlimited",
        },
      },
      {
        name: "IP allow/disallow list",
        description:
          "Restrict access to Keycloak admin and user endpoints by IP address. Number of allowed entries.",
        links: [
          {
            href: "/docs/self-service/restrictions",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: "2",
          enterprise: "Unlimited",
          custom: "Unlimited",
        },
      },
      {
        name: "Private network connectivity (2)",
        description:
          "Connect your backend infrastructure to your Keycloak cluster over a private network link, keeping authentication traffic off the public internet entirely. A custom add-on: not self-service, scoped with our team, and available for an additional fee.",
        links: [
          {
            href: "/docs/self-service/restrictions#private-network-connectivity",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: false,
          enterprise: "Add-on",
          custom: "Add-on",
        },
      },
      {
        name: "Environment variables",
        description: "Add Keycloak configuration via environment variables.",
        links: [
          {
            href: "/docs/self-service/environment-variables",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Global deployment(s)",
        description:
          "Deploy in the geographic region of your choice for compliance and performance with global routing.",
        links: [
          {
            href: "/docs/self-service/regions",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Multi-region deployment(s)",
        description:
          "Deploy across multiple regions for redundancy and disaster recovery.",
        links: [
          {
            href: "/docs/self-service/regions",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: false,
          enterprise: false,
          custom: true,
        },
      },
      {
        name: "On-premise deployment(s)",
        description:
          "Deploy into your own cloud or on-premises infrastructure.",
        tiers: {
          starter: false,
          premium: false,
          enterprise: false,
          custom: true,
        },
      },
    ],
  },
  {
    name: "Extensions",
    features: [
      {
        name: "Organizations",
        description:
          "Simple multi-tenancy and role delegation via API using the Phase Two Organizations extension.",
        links: [
          {
            href: "https://github.com/p2-inc/keycloak-orgs",
            icon: "mdi:github",
            label: "Source on GitHub",
          },
          {
            href: "/docs/organizations/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Events",
        description:
          "Audit logging for compliance and webhooks for user and system activity notifications.",
        links: [
          {
            href: "https://github.com/p2-inc/keycloak-events",
            icon: "mdi:github",
            label: "Source on GitHub",
          },
          {
            href: "/docs/audit-logs/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Magic Link",
        description: "Passwordless authentication using links sent to email.",
        links: [
          {
            href: "https://github.com/p2-inc/keycloak-magic-link",
            icon: "mdi:github",
            label: "Source on GitHub",
          },
          {
            href: "/docs/authentication/magic-links",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Themes",
        description: "Easy login UI and email content customizations.",
        links: [
          {
            href: "https://github.com/p2-inc/keycloak-themes",
            icon: "mdi:github",
            label: "Source on GitHub",
          },
          {
            href: "/docs/getting-started/customizing-ui",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Admin UI",
        description:
          "Keycloak Admin UI additions to administer Phase Two extensions directly from Keycloak.",
        links: [
          {
            href: "https://github.com/p2-inc/keycloak/tree/23.0.1_orgs_admin_ui",
            icon: "mdi:github",
            label: "Source on GitHub",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Admin Portal",
        description:
          "User self-management for their account and organizations.",
        links: [
          {
            href: "https://github.com/p2-inc/phasetwo-admin-portal",
            icon: "mdi:github",
            label: "Source on GitHub",
          },
          {
            href: "/docs/admin-portal/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "IdP Wizards",
        description:
          "Identity Provider setup wizards for self-management of SSO admins and organizations.",
        links: [
          {
            href: "https://github.com/p2-inc/idp-wizard",
            icon: "mdi:github",
            label: "Source on GitHub",
          },
          {
            href: "/docs/sso/wizards",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "SCIM user provisioning",
        description:
          "Inbound SCIM 2.0 so a customer's IdP can provision and deprovision users and groups into their organization.",
        links: [
          {
            href: "/docs/organizations/scim",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
    ],
  },
  {
    name: "Automation",
    description:
      "Provision and manage clusters, realms, domains, extensions and IP rules from code instead of the console.",
    features: [
      {
        name: "Management API",
        description:
          "The control-plane REST API behind the console: create clusters and realms, attach custom domains, upload extensions, restrict access by IP, pull logs. Authenticated with an organization API secret and the client credentials grant. Experimental.",
        links: [
          {
            href: "/docs/management-api/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Terraform provider",
        description:
          "Manage the same resources declaratively with the p2-inc/phasetwo Terraform provider. Experimental — point it at test or staging environments while it is at 0.x.",
        links: [
          {
            href: "https://registry.terraform.io/providers/p2-inc/phasetwo",
            icon: "mdi:terraform",
            label: "Terraform Registry",
          },
          {
            href: "/docs/management-api/terraform",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "API secrets per organization",
        description:
          "Client-credential secrets your automation uses to call the Management API.",
        links: [
          {
            href: "/docs/management-api/api-keys",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "10",
          premium: "10",
          enterprise: "10",
          custom: "Custom",
        },
      },
    ],
  },
  {
    name: "Support and Observability",
    features: [
      {
        name: "Keycloak version upgrades",
        links: [
          {
            href: "/docs/self-service/upgrades",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "Automatic",
          premium: "Automatic",
          enterprise: "Automatic/Coordinated",
          custom: "Custom schedule",
        },
      },
      {
        name: "Insights",
        description: "Users, connections, realms, and more.",
        links: [
          {
            href: "/docs/self-service/observability",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Infrastructure logs",
        description: "Keycloak logs",
        links: [
          {
            href: "/docs/self-service/logs",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Event metrics",
        description:
          "User activity metrics from Keycloak events, surfaced as graphs and counts.",
        links: [
          {
            href: "/docs/self-service/metrics",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Request observability",
        description:
          "Request rate, latency, and error metrics for your cluster, surfaced as graphs and counts.",
        links: [
          {
            href: "/docs/self-service/metrics",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },

      {
        name: "Telemetry Export",
        description:
          "Stream your cluster's Keycloak logs and authentication events to your own observability system over OTLP, self-serve from Logs → Export. Experimental.",
        links: [
          {
            href: "/docs/self-service/telemetry-export",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Alerting",
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Comms",
        tiers: {
          starter: "Email",
          premium: "Email",
          enterprise: "Slack/Email",
          custom: true,
        },
      },
      {
        name: "Dedicated support",
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Phone support",
        description:
          "Direct phone access to our support team for urgent issues.",
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },
    ],
  },
  {
    name: "Availability",
    features: [
      {
        name: "Regions",
        links: [
          {
            href: "/docs/self-service/regions",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "AMER, EU, APAC",
          premium: "AMER, EU, APAC",
          enterprise: "AMER, EU, APAC",
          custom: "Custom",
        },
      },
      {
        name: "Providers",
        description:
          "Don't see your preferred cloud provider? We are adding more all the time.",
        tiers: {
          starter: "AWS",
          premium: "AWS",
          enterprise: "AWS",
          custom: "AWS, Azure, GCP, or your choice",
        },
      },
      {
        name: "Uptime Guarantee",
        description:
          "Availability commitment per calendar month. Enterprise is 99.95% as standard and can be extended to 99.99% for an additional fee; that extended commitment is also the ceiling on a Custom plan.",
        links: [
          {
            href: "/company/sla",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "95% target",
          premium: "99.5%",
          enterprise: "99.95% · 99.99% add-on",
          custom: "Up to 99.99%",
        },
      },
      {
        name: "SLA",
        description:
          "Starter clusters are best effort with no commitment. Premium and Enterprise carry the service credits set out in the Service Level Agreement; the 99.99% Enterprise extension is available for an additional fee.",
        links: [
          {
            href: "/company/sla",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: "Best effort",
          premium: "Standard",
          enterprise: "Enhanced · 99.99% add-on",
          custom: "Custom · up to 99.99%",
        },
      },
      {
        name: "Automated backups",
        description:
          "Hourly database snapshots written to encrypted, cross-region object storage and retained for 30 days. Restores are tested periodically.",
        links: [
          {
            href: "/docs/self-service/backups-and-data-retention",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "EU data residency",
        description:
          "Run your cluster, and the data in it, entirely within the EU.",
        links: [
          {
            href: "/docs/self-service/regions",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "SOC 2",
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "ISO 27001",
        tiers: {
          starter: true,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
    ],
  },
  {
    name: "Keycloak Features",
    description:
      "Core identity, federation, and policy features available in Keycloak and supported across all tiers.",
    features: [
      {
        name: "User management",
        description: "Manage users, groups, roles, and custom attributes.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Access control policies",
        description: "Authorization patterns such as ABAC, RBAC, PBAC, GBAC.",
        tiers: {
          starter: "ABAC, RBAC, PBAC, GBAC",
          premium: "ABAC, RBAC, PBAC, GBAC",
          enterprise: "ABAC, RBAC, PBAC, GBAC",
          custom: "ABAC, RBAC, PBAC, GBAC",
        },
      },
      {
        name: "Password policy",
        description:
          "Enforce complexity, expiration, and other password rules.",
        links: [
          {
            href: "/docs/security/password-policy",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Identity brokering",
        description: "Connect external identity providers via SAML or OIDC.",
        links: [
          {
            href: "/docs/keycloak/idp",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "User federation",
        description:
          "Integrate with LDAP, Active Directory, Kerberos, or custom databases.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Social identity providers",
        description:
          "Login via pre-integrated social platforms like Google, GitHub, etc.",
        links: [
          {
            href: "/docs/authentication/social-login",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Supported protocols",
        description: "Native support for OIDC, OAuth 2.0, and SAML protocols.",
        tiers: {
          starter: "OIDC, OAuth 2.0, SAML",
          premium: "OIDC, OAuth 2.0, SAML",
          enterprise: "OIDC, OAuth 2.0, SAML",
          custom: "OIDC, OAuth 2.0, SAML",
        },
      },
      {
        name: "SSO (Single Sign-On)",
        description:
          "Authenticate once to access multiple applications and services.",
        links: [
          {
            href: "/docs/sso/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Keycloak events",
        description:
          "System and user activity events for auditing and integrations.",
        links: [
          {
            href: "/docs/audit-logs/",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Keycloak admin API",
        description:
          "REST API to manage realms, users, groups, clients, and more.",
        links: [
          {
            href: "https://www.keycloak.org/docs-api/latest/rest-api/index.html",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
    ],
  },
  {
    name: "Authentication Methods",
    description:
      "A range of user authentication options supported natively or via extensions.",
    features: [
      {
        name: "Login password",
        description: "Traditional username and password-based login.",
        links: [
          {
            href: "/docs/authentication/username-password",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Reset password",
        description: "Password recovery via email link.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Passkeys",
        description:
          "FIDO2/WebAuthn-based passwordless login with biometrics or device PIN.",
        links: [
          {
            href: "/docs/authentication/passkeys",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Email OTP",
        description: "One-time code sent via email for login or MFA.",
        links: [
          {
            href: "/docs/authentication/otps",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "SMS OTP",
        description:
          "One-time code sent via SMS for login or MFA. Requires an extension, and you are responsible for any SMS charges.",
        links: [
          {
            href: "/docs/authentication/otps",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Magic link",
        description: "Email-based login using single-use links.",
        links: [
          {
            href: "/docs/authentication/magic-links",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Passwordless with WebAuthn",
        description: "Authenticate with biometrics or security key (WebAuthn).",
        links: [
          {
            href: "/docs/authentication/webauthn",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Social login",
        description:
          "Authenticate using social providers like GitHub, Google, etc.",
        links: [
          {
            href: "/docs/authentication/social-login",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "External IdP",
        description: "Login via SAML or OIDC identity providers.",
        links: [
          {
            href: "/docs/sso/setup",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Multi-factor authentication (MFA)",
        description: "Add a second authentication step using various methods.",
        links: [
          {
            href: "/docs/authentication/otps",
            icon: "mdi:book-open-variant",
            label: "Documentation",
          },
        ],
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
    ],
  },
];
export default Sections;
