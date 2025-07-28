const path = require("path");

module.exports = {
  plugins: [require.resolve("./sitePlugin")],
  title: "Managed Keycloak Hosting and Enterprise Keycloak Support",
  tagline:
    "Fully managed, multi-region, high-availability, Keycloak deployments with top extensions to run for any enterprise. 99.99% uptime SLA. 24/7 support. Built by top Keycloak experts and contributors.",
  url: "https://phasetwo.io",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "p2-inc",
  projectName: "p2-inc.github.io",
  deploymentBranch: "main",
  trailingSlash: true,
  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://www.google-analytics.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://www.googletagmanager.com",
      },
    },
  ],
  scripts: [
    {
      src: "https://www.termsfeed.com/public/cookie-consent/4.1.0/cookie-consent.js",
      type: "text/javascript",
      charset: "UTF-8",
      defer: true,
    },
    {
      type: "text/javascript",
      src: "https://www.googletagmanager.com/gtag/js?id=UA-160183620-1",
      async: true,
      "data-cookie-consent": "tracking",
    },
  ],
  themeConfig: {
    announcementBar: {
      id: "dedicated_clusters",
      content:
        '<a href="/blog/dashboard-launch/">Announcing our new Dashboard!</a> New self-serve features for cluster/realm management (observability, configuration, and more).',
      backgroundColor: "#3fa1e3",
      textColor: "#fff",
      isCloseable: false,
    },
    metadata: [
      { name: "keywords", content: "keycloak, iam, sso" },
      { property: "og:logo", content: "/img/appstore.png", size: "1024x1024" },
      {
        property: "og:image",
        content: "/img/og_image_app.png",
        size: "1200x630",
      },
      { property: "og:logo", content: "/img/playstore.png", size: "512x512" },
    ],
    navbar: {
      title: "",
      logo: {
        alt: "Phase Two",
        src: "img/logo_phase_slash.svg",
      },
      items: [
        {
          to: "/hosting",
          label: "Hosting",
          position: "left",
          activeBasePath: "hosting",
        },
        // {
        //   type: "dropdown",
        //   label: "Hosting",
        //   position: "left",
        //   to: "hosting",
        //   items: [
        //     {
        //       label: "Self Host vs Managed",
        //       to: "hosting/self-host-vs-managed",
        //     },
        //     {
        //       label: "Deployments",
        //       to: "hosting/deployments",
        //     },
        //     {
        //       label: "Configure",
        //       to: "hosting/configure",
        //     },
        //     {
        //       label: "Monitoring",
        //       to: "hosting/monitoring",
        //     },
        //     {
        //       label: "Support",
        //       to: "hosting/support",
        //     },
        //     {
        //       label: "Version Upgrades",
        //       to: "hosting/version-upgrades",
        //     },
        //     {
        //       label: "Backups",
        //       to: "hosting/backups",
        //     },
        //     {
        //       label: "Customize",
        //       to: "hosting/customize",
        //     },
        //   ],
        // },
        {
          type: "dropdown",
          label: "Support",
          position: "left",
          to: "support",
          items: [
            {
              label: "Enterprise Support",
              to: "support",
              activeBaseRegex: "^/support/$",
            },
            {
              label: "Migration to Keycloak",
              to: "support/migrate-to-keycloak",
            },
            // {
            //   label: "Custom Extensions",
            //   to: "support/custom-extensions",
            // },
            // {
            //   label: "Version Upgrades",
            //   to: "support/keycloak-version-upgrades",
            // },
            // {
            //   label: "On-premise Deployment",
            //   to: "support/on-premise-deployment",
            // },
            // {
            //   label: "Infrastructure Implementation (IAC)",
            //   to: "support/infrastructure-implementation",
            // },
            // {
            //   label: "Theming",
            //   to: "support/theming",
            // },
            // {
            //   label: "Architecture Review",
            //   to: "support/architecture-review",
            // },
            // {
            //   label: "Scale and Growth",
            //   to: "support/scale-and-growth",
            // },
            // {
            //   label: "On-call 24/7",
            //   to: "support/24-7-on-call",
            // },
            // {
            //   label: "Community",
            //   to: "support/community",
            // },
          ],
        },
        {
          type: "dropdown",
          label: "Product",
          position: "left",
          items: [
            {
              to: "product/onprem",
              activeBasePath: "product/onprem",
              label: "On-Premise Deployment",
            },
            {
              to: "product/sso",
              activeBasePath: "product/sso",
              label: "SSO",
            },
            {
              to: "product/identity",
              activeBasePath: "product/identity",
              label: "Identity",
            },
            {
              to: "product/organizations",
              activeBasePath: "product/organizations",
              label: "Organizations",
            },
            // {
            //   to: "product/theming",
            //   activeBasePath: "product/theming",
            //   label: "Theming",
            // },
            {
              to: "product/adminportal",
              activeBasePath: "product/adminportal",
              label: "Admin Portal",
            },
            {
              to: "product/integrations",
              activeBasePath: "product/integrations",
              label: "Integrations",
            },
            // {
            //   to: "product/cockroachdb",
            //   activeBasePath: "product/cockroachdb",
            //   label: "CockroachDB",
            // },
            // {
            //   to: "product/events",
            //   activeBasePath: "product/events",
            //   label: "Events (Audit Logs)",
            // },
          ],
        },
        {
          type: "dropdown",
          label: "Developers",
          position: "left",
          items: [
            {
              to: "docs/introduction",
              activeBasePath: "docs",
              label: "Docs",
            },
            {
              to: "api/phase-two-admin-rest-api",
              activeBasePath: "api",
              label: "API",
            },
            {
              to: "https://github.com/p2-inc#our-extensions-",
              label: "Keycloak Extensions",
            },
            // {
            //   to: "guides",
            //   activeBasePath: "guides",
            //   label: "Guides",
            // },
            // {
            //   to: "articles",
            //   activeBasePath: "articles",
            //   label: "Articles",
            // },
            {
              to: "https://github.com/p2-inc/",
              label: "GitHub",
            },
          ],
        },
        {
          to: "/pricing",
          label: "Pricing",
          position: "left",
          activeBasePath: "pricing",
        },
        // {
        //   type: "dropdown",
        //   label: "Pricing",
        //   position: "left",
        //   to: "pricing",
        //   activeBasePath: "pricing",
        //   items: [
        //     {
        //       label: "Hosting",
        //       to: "pricing/hosting",
        //     },
        //     {
        //       label: "Support",
        //       to: "pricing/support",
        //     },
        //   ],
        // },
        {
          to: "blog",
          activeBasePath: "blog",
          label: "Blog",
          position: "left",
        },
        {
          to: "contact",
          activeBasePath: "contact",
          label: "Contact",
          position: "right",
          buttonType: "btnSecondary",
        },
        {
          href: "https://dash.phasetwo.io/",
          label: "Dashboard",
          position: "right",
          buttonType: "btnPrimary",
          title: "Login or Register",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Phase Two",
          items: [
            {
              label: "About",
              to: "company/about",
            },
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "Careers",
              to: "company/careers",
            },
          ],
        },
        {
          title: "Product",
          items: [
            {
              to: "hosting",
              activeBasePath: "hosting",
              label: "Hosting",
            },
            {
              to: "product/sso",
              activeBasePath: "product/sso",
              label: "SSO",
            },
            {
              to: "product/identity",
              activeBasePath: "product/identity",
              label: "Identity",
            },
            {
              to: "product/organizations",
              activeBasePath: "product/organizations",
              label: "Organizations",
            },
            {
              to: "product/adminportal",
              activeBasePath: "product/adminportal",
              label: "Admin Portal",
            },
            {
              to: "product/onprem",
              activeBasePath: "product/onprem",
              label: "On-Prem",
            },
          ],
        },
        {
          title: "Developers",
          items: [
            {
              label: "Documentation",
              to: "docs/introduction",
            },
            {
              label: "Getting Started",
              to: "docs/getting-started",
            },
            {
              label: "API",
              to: "api/phase-two-admin-rest-api",
            },
            {
              label: "GitHub",
              href: "https://github.com/p2-inc",
            },
            {
              label: "Migrate to Keycloak",
              to: "support/migrate-to-keycloak",
            },
          ],
        },
        {
          title: "Support",
          items: [
            {
              label: "Contact",
              to: "contact",
            },
            {
              label: "Enterprise Support",
              to: "support",
            },
            {
              label: "Bugs & Feature Requests",
              href: "https://github.com/p2-inc/phasetwo/issues",
            },
            {
              label: "support@phasetwo.io",
              href: "mailto:support@phasetwo.io",
            },
            {
              label: "DEV.to",
              href: "https://dev.to/phasetwo",
            },
            {
              label: "Youtube",
              href: "https://www.youtube.com/channel/UCUY2ZvxI0hxpTWO_8w7MjVw",
            },
          ],
        },
        {
          title: "Legal",
          items: [
            {
              label: "Trust Center",
              to: "https://trust.phasetwo.io",
            },
            {
              label: "Privacy Policy",
              to: "company/privacy",
            },
            {
              label: "Terms of Use",
              to: "company/terms",
            },
            {
              label: "Subprocessors",
              to: "company/subprocessors",
            },
            {
              label: "Service Agreement",
              to: "company/service-agreement",
            },
            {
              label: "SLA",
              to: "company/sla",
            },
            {
              label: "Cookies Policy",
              id: "open_preferences_center",
              to: "#open_preferences_center",
            },
          ],
        },
        {
          title: " ",
          items: [
            {
              html: `
                <img class="footer-logo" src="/img/logo_phase_slash.svg" alt="PhaseTwo" width="114" height="51" />
              `,
            },
            {
              html: `
                <img class="soc-2-footer" src="/img/soc2_type1/SOC 2 T1 Logo Rectangle Black.png" alt="SOC 2 Type 1" width="114" height="auto" />
              `,
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Phase Two, Inc.`,
    },
    colorMode: {
      // "light" | "dark"
      defaultMode: "light",
      disableSwitch: true,
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },
    algolia: {
      appId: "W4PN7W5A70",
      apiKey: "0a2a3edf5aedd6c4ec8388acc22b2a04",
      indexName: "phasetwo",
      // Optional: see doc section below
      contextualSearch: true,
    },
    prism: {
      additionalLanguages: ["java", "yaml"],
    },
    mermaid: {
      options: {
        themeVariables: {},
      },
    },
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/p2-inc/phasetwo-docs/tree/main",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        blog: {
          blogSidebarTitle: "News",
          blogSidebarCount: "ALL",
          blogDescription:
            "Learn more about how we make Keycloak Hosting and Authentication easy.",
        },
      }),
    ],
  ],
  plugins: [
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "openapi",
        docsPluginId: "api",
        config: {
          phasetwo: {
            specPath: "openapi.yaml", // Path to designated spec file
            outputDir: "api", // Output directory for generated .mdx docs
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
            },
          },
        },
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "api",
        path: "api",
        routeBasePath: "api",
        include: ["**/*.md", "**/*.mdx"],
        sidebarPath: require.resolve("./api-sidebar.js"),
        docItemComponent: "@theme/ApiItem",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "guides",
        path: "guides",
        routeBasePath: "guides",
        include: ["**/*.md", "**/*.mdx"],
        sidebarPath: require.resolve("./sidebars.guides.js"),
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "articles",
        path: "articles",
        routeBasePath: "articles",
        include: ["**/*.md", "**/*.mdx"],
        sidebarPath: require.resolve("./sidebars.articles.js"),
      },
    ],
    "docusaurus-tailwindcss-loader",
  ],
  themes: [
    "@docusaurus/theme-live-codeblock",
    "docusaurus-theme-openapi-docs",
    "@docusaurus/theme-mermaid",
  ],
  markdown: {
    mermaid: true,
  },
};
