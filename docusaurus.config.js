module.exports = {
  plugins: [require.resolve('./sitePlugin')],
  title: "Phase Two",
  tagline: "Tools for SaaS builders",
  url: "https://p2-inc.github.io",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "p2-inc",
  projectName: "p2-inc.github.io",
  deploymentBranch: "master",
  themeConfig: {
    metadata: [{property: 'og:logo', content: '/img/appstore.png', size: '1024x1024'},{property: 'og:logo', content: '/img/playstore.png', size: '512x512'}],
    announcementBar: {
      id: 'self-serve',
      content:
        'Introducing <a href="/blog/self-service">Phase Two Self-service</a> for free Keycloak deployments.',
      backgroundColor: 'var(--ifm-color-primary)',
      textColor: '#fff',
      isCloseable: true,
    },
    navbar: {
      title: "",
      logo: {
        alt: "Phase Two",
        src: "img/logo_phase_slash.svg",
      },
      items: [
        {
          to: "/#features",
          label: "Features",
          position: "left",
        },
        {
          to: "/#opensource",
          label: "Open Source",
          position: "left",
        },
        {
          to: "/#pricing",
          label: "Pricing",
          position: "left",
        },
        {
          to: "blog",
          activeBasePath: "blog",
          label: "Blog",
          position: "left",
        },
        {
          to: "docs/introduction",
          activeBasePath: "docs",
          label: "Docs",
          position: "left",
        },
        {
          to: "api/",
          label: "API",
          position: "left",
        },
        {
          href: "https://phasetwo.io/dashboard/",
          label: "Dashboard",
          position: "right",
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
            {
              label: "Github",
              href: "https://github.com/p2-inc",
            },
          ],
        },
        {
          title: "Documentation",
          items: [
            {
              label: "Introduction",
              to: "docs/introduction",
            },
            {
              label: "Getting Started",
              to: "docs/getting-started",
            },
            {
              label: "API",
              to: "api/",
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
              label: "Service Agreement",
              to: "docs/service-agreement",
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
  },
  presets: [
    [
      "docusaurus-preset-openapi",
      /** @type {import('docusaurus-preset-openapi').Options} */
      {
        api: {
          path: "openapi.yaml",
        },
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/p2-inc/phasetwo-docs/tree/master",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        googleAnalytics: {
          trackingID: "UA-160183620-1",
        },
        blog: {
          blogSidebarTitle: 'News',
          blogSidebarCount: 'ALL',
        },
      },
    ],
  ],
  themes: ["@docusaurus/theme-live-codeblock"],
};
