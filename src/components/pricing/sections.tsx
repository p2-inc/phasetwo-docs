import { Feature } from "./detailed-comparison";

const Sections: {
  name: string;
  features: Feature[];
}[] = [
  {
    name: "Core Features",
    features: [
      {
        name: "Dedicated cluster (HA)",
        description:
          "An isolated, high-availability Keycloak environment running in a dedicated cloud instance.",
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Users",
        description:
          "No artificial limits on the number of users in your realms.",
        tiers: {
          starter: "100",
          premium: "Unlimited",
          enterprise: "Unlimited",
          custom: "Unlimited",
        },
      },
      {
        name: "Concurrent user sessions (max)",
        description: "Number of active user sessions supported.",
        tiers: {
          starter: false,
          premium: "10K",
          enterprise: "50K",
          custom: "Custom",
        },
      },
      {
        name: "SSO connections",
        description: "Number of supported identity provider (SSO) connections.",
        tiers: {
          starter: false,
          premium: "10",
          enterprise: "Unlimited",
          custom: true,
        },
      },
      {
        name: "Custom domain(s)",
        description: "Use your own domain(s) for login and account pages.",
        tiers: { starter: false, premium: "5", enterprise: "15", custom: true },
      },
      {
        name: "Default theme CSS customization",
        description:
          "Modify the default Keycloak login theme via CSS overrides.",
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Custom themes",
        description:
          "Support for fully custom Keycloak themes with HTML, CSS, and JS.",
        tiers: {
          starter: false,
          premium: "1",
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Custom extensions (1)",
        description: "Support for deploying custom Keycloak server extensions.",
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },

      {
        name: "Environment variables",
        description: "Add Keycloak configuration via environment variables.",
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Terraform IaC",
        description: "Add Keycloak configuration via environment variables.",
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Global deployment(s)",
        description:
          "Deploy in the geographic region of your choice for compliance and performance with global routing.",
        tiers: {
          starter: false,
          premium: false,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Multi-region deployment(s)",
        description:
          "Deploy across multiple regions for redundancy and disaster recovery.",
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
    name: "Support and Observability",
    features: [
      {
        name: "Keycloak version upgrades",
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
        tiers: {
          starter: false,
          premium: true,
          enterprise: true,
          custom: true,
        },
      },
      {
        name: "Keycloak events",
        description: "Keycloak events and audit logs",
        tiers: {
          starter: false,
          premium: true,
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
    ],
  },
  {
    name: "Availability",
    features: [
      {
        name: "Regions",
        tiers: {
          starter: "AMER, EU",
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
        tiers: {
          starter: false,
          premium: "99.9%",
          enterprise: "99.99%",
          custom: "99.99%",
        },
      },
      {
        name: "SLA",
        tiers: {
          starter: false,
          premium: true,
          enterprise: "Enhanced SLA",
          custom: "Custom SLA",
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
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Identity brokering",
        description: "Connect external identity providers via SAML or OIDC.",
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
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Keycloak events",
        description:
          "System and user activity events for auditing and integrations.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Keycloak admin API",
        description:
          "REST API to manage realms, users, groups, clients, and more.",
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
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Email OTP",
        description: "One-time code sent via email for login or MFA.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "SMS OTP",
        description: "One-time code sent via SMS. Requires extension.",
        tiers: {
          starter: "—",
          premium: "With SPI extension",
          enterprise: "With SPI extension",
          custom: "With SPI extension",
        },
      },
      {
        name: "Magic link",
        description: "Email-based login using single-use links.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Passwordless with WebAuthn",
        description: "Authenticate with biometrics or security key (WebAuthn).",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Social login",
        description:
          "Authenticate using social providers like GitHub, Google, etc.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "External IdP",
        description: "Login via SAML or OIDC identity providers.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
      {
        name: "Multi-factor authentication (MFA)",
        description: "Add a second authentication step using various methods.",
        tiers: { starter: true, premium: true, enterprise: true, custom: true },
      },
    ],
  },
];
export default Sections;
