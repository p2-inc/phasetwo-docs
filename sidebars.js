module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Introduction',
      link: {type: 'doc', id: 'introduction/index'},
      items: [
        'introduction/keycloak',
        'introduction/open-source',
        'introduction/documentation',
      ],
    },
    {
      type: 'category',
      label: 'Self-service',
      link: {type: 'doc', id: 'self-service/index'},
      items: [
        'self-service/deployments',
        'self-service/your-organization'
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      link: {type: 'doc', id: 'getting-started/index'},
      items: [
        'getting-started/configuration',
        'getting-started/sample',
        'getting-started/customizing-ui',
        'getting-started/email',
        'getting-started/launch-checklist',
      ],
    },
    {
      type: 'category',
      label: 'Securing Applications',
      link: {type: 'doc', id: 'securing-applications/index'},
      items: [
        'securing-applications/javascript',
        'securing-applications/react',
        'securing-applications/backend',
      ],
    },
    {
      type: 'category',
      label: 'API',
      link: {type: 'doc', id: 'api/index'},
      items: [
        'api/authentication',
        'api/service-accounts',
        'api/sdks',
      ],
    },
    {
      type: 'category',
      label: 'Authentication',
      link: {type: 'doc', id: 'authentication/index'},
      items: [
        'authentication/understanding-flows',
        'authentication/username-password',
        'authentication/magic-links',
        'authentication/social-login',
        'authentication/otps',
        'authentication/webauthn',
        'authentication/sso',
      ],
    },
    {
      type: 'category',
      label: 'SSO',
      link: {type: 'doc', id: 'sso/index'},
      items: [
        'sso/setup',
        'sso/wizards',
        'sso/sso-without-auth',
      ],
    },
    {
      type: 'category',
      label: 'Organizations',
      link: {type: 'doc', id: 'organizations/index'},
      items: [
        'organizations/attributes',
        'organizations/membership',
        'organizations/invitations',
        'organizations/roles',
      ],
    },
    {
      type: 'category',
      label: 'Admin Portal',
      link: {type: 'doc', id: 'admin-portal/index'},
      items: [
        'admin-portal/portal-link',
	{
	  type: 'category',
	  label: 'Profile',
	  link: {type: 'doc', id: 'admin-portal/profile/index'},
	  items: [
            'admin-portal/profile/details',
            'admin-portal/profile/security'
	  ],
	},
	{
	  type: 'category',
	  label: 'Organization',
	  link: {type: 'doc', id: 'admin-portal/organization/index'},
	  items: [
            'admin-portal/organization/details',
            'admin-portal/organization/members',
            'admin-portal/organization/domains',
            'admin-portal/organization/sso',
	  ],
	},
      ],
    },
    {
      type: 'category',
      label: 'Audit Logs',
      link: {type: 'doc', id: 'audit-logs/index'},
      items: [
        'audit-logs/access',
        'audit-logs/admin',
        'audit-logs/system',
        'audit-logs/api',
        'audit-logs/webhooks',
      ],
    },
    {
      type: 'category',
      label: 'Connect',
      link: {type: 'doc', id: 'connect/index'},
      items: [
        'connect/setup',
        'connect/kubernetes',
      ],
    },
    {
      type: 'category',
      label: 'User Migration',
      link: {type: 'doc', id: 'user-migration/index'},
      items: [
        'user-migration/api'
      ],
    },
  ]
};
