/* add back dashboard to navbar links later
        {
          href: 'https://app.phasetwo.io/auth/admin/master/console/',
          label: 'Dashboard',
          position: 'right',
        },
*/

module.exports = {
  title: 'Phase Two',
  tagline: 'Tools for SaaS builders',
  url: 'https://p2-inc.github.io',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'p2-inc', // Usually your GitHub org/user name.
  projectName: 'p2-inc.github.io', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: '',
      logo: {
        alt: 'Phase Two',
        src: 'img/logo_phase_slash.svg',
      },
      items: [
        {
          to: '#features',
          label: 'Features',
          position: 'right',
        },
	      {
          to: '#pricing',
          label: 'Pricing',
          position: 'right',
        },
        {
          to: 'docs/introduction',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Phase Two',
          items: [
            {
              label: 'Privacy policy',
              to: 'docs/privacy',
            },
            {
              label: 'Terms of use',
              to: 'docs/terms',
            },
	    {
	      label: 'support@phasetwo.io',
	      href: 'mailto:support@phasetwo.io'
	    }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Phase Two, Inc.`,
    },
    defaultMode: 'light',
    disableSwitch: true,
    googleAnalytics: {
      trackingID: 'UA-160183620-1',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/p2-inc/phasetwo-docs/tree/master',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
};
