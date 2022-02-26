module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Introduction',
      link: {type: 'doc', id: 'introduction/index'},
      items: [
        'introduction/keycloak',
        'introduction/open-source',
        'introduction/documentation'
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      link: {type: 'doc', id: 'getting-started/index'},
      items: [
        'getting-started/sample',
        'getting-started/customizing-ui'
      ],
    },
    {
      type: 'category',
      label: 'Securing Applications',
      link: {type: 'doc', id: 'securing-applications/index'},
      items: [
        'securing-applications/javascript',
        'securing-applications/react'
      ],
    },
    {
      type: 'category',
      label: 'Account Management',
      link: {type: 'doc', id: 'account-management/index'},
      items: [
        'account-management/hosted',
        'account-management/api'
      ],
    },
    {
      type: 'category',
      label: 'SSO',
      link: {type: 'doc', id: 'sso/index'},
      items: [
        'sso/sso-without-auth'
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
      label: 'Organizations',
      link: {type: 'doc', id: 'organizations/index'},
      items: [
        'organizations/attributes',
        'organizations/membership',
        'organizations/invitations',
        'organizations/roles',
        'organizations/portal',
      ],
    },
    {
      type: 'category',
      label: 'Connect',
      link: {type: 'doc', id: 'connect/index'},
      items: [
        'connect/setup'
      ],
    }
  ]
};
