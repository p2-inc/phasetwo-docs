const path = require("path");

module.exports = {
  plugins: [require.resolve("./sitePlugin")],
  title: "Phase Two enhanced Keycloak as a Service",
  tagline:
    "Tools for SaaS builders - Enhanced Keycloak as a Service - Fully secured, managed and hosted Keycloak with custom extensions for SSO, organizations and more specifically tailored to your SaaS application",
  url: "https://phasetwo.io",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "p2-inc",
  projectName: "p2-inc.github.io",
  deploymentBranch: "main",
  themeConfig: {
    announcementBar: {
      id: "dedicated_clusters",
      content:
        '<a href="/blog/dedicated-launch">Announcing Dedicated Clusters!</a> Isolated compute, network and storage for your Phase Two Keycloak cluster.',
      backgroundColor: "#3fa1e3",
      textColor: "#fff",
      isCloseable: false,
    },
    metadata: [
      { name: "keywords", content: "keycloak, iam, sso" },
      {
        name: "description",
        content: "Tools for SaaS builders - Enhanced Keycloak as a Service",
      },
      { property: "og:logo", content: "/img/appstore.png", size: "1024x1024" },
      { property: "og:image", content: "/img/appstore.png", size: "1024x1024" },
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
          label: "Hosting",
          position: "left",
          activeBasePath: "hosting",
          to: "hosted",
        },
        {
          type: "dropdown",
          label: "Product",
          position: "left",
          items: [
            {
              to: "product/onprem",
              activeBasePath: "product/onprem",
              label: "On-Prem Deployment",
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
              to: "https://github.com/p2-inc/",
              label: "GitHub",
            },
          ],
        },
        {
          to: "/#pricing",
          label: "Pricing",
          position: "left",
          activeBasePath: "random",
        },
        {
          to: "blog",
          activeBasePath: "blog",
          label: "Blog",
          position: "left",
        },
        {
          href: "https://phasetwo.io/dashboard/",
          label: "Dashboard",
          position: "right",
          buttonType: "btnSecondary",
        },
        {
          href: "https://phasetwo.io/dashboard/",
          label: "Get Started",
          position: "right",
          buttonType: "btnPrimary",
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
              to: "docs/about",
            },
            {
              label: "Blog",
              to: "blog",
            },
            {
              label: "Careers",
              to: "docs/careers",
            },
          ],
        },
        {
          title: "Product",
          items: [
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
          ],
        },
        {
          title: "Support",
          items: [
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
              label: "Privacy Policy",
              to: "docs/privacy",
            },
            {
              label: "Terms of Use",
              to: "docs/terms",
            },
            {
              label: "Subprocessors",
              to: "docs/subprocessors",
            },
            {
              label: "Service Agreement",
              to: "docs/service-agreement",
            },
            {
              label: "SLA",
              to: "docs/sla",
            },
          ],
        },
        {
          title: " ",
          items: [
            {
              html: `
                <img class="footer-logo" src="https://phasetwo.io/img/logo_phase_slash.svg" alt="PhaseTwo" width="114" height="51" />
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
        gtag: {
          trackingID: "UA-160183620-1",
        },
        blog: {
          blogSidebarTitle: "News",
          blogSidebarCount: "ALL",
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
            // Note: petstore key is treated as the <id> and can be used to specify an API doc instance when using CLI commands
            specPath: "openapi.yaml", // Path to designated spec file
            outputDir: "api", // Output directory for generated .mdx docs
            sidebarOptions: {
              groupPathsBy: "tag",
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
        breadcrumbs: true,
        routeBasePath: "api",
        include: ["**/*.md", "**/*.mdx"],
        sidebarPath: require.resolve("./api/sidebar.js"),
        docLayoutComponent: "@theme/DocPage",
        docItemComponent: "@theme/ApiItem", // add @theme/ApiItem here
      },
    ],
  ],
  themes: ["@docusaurus/theme-live-codeblock", "docusaurus-theme-openapi-docs"],
};
