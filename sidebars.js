module.exports = {
  docs: {
    'Getting Started': ['introduction'],
    'Authentication':
    [
      'auth-overview',
      'auth-clients',
      'auth-social-logins'
    ],
    'Account Management':
    [
      'account-overview',
      'account-embed-phasetwo-js'
    ],
    'Single Sign-on':
    [
      'sso-overview',
      'sso-open-id',
      'sso-saml',
      'sso-sso-without-auth',
      {
	'Provider Examples':
	[
	  'sso-provider-auth0',
	  'sso-provider-azure-ad',
	  'sso-provider-g-suite',
	  'sso-provider-okta'
	]
      }
    ],
    'User Federation and Sync':
    [
      'sync-overview',
      'sync-ldap',
      'sync-legacy',
      {
	'Provider Examples':
	[
	  'sync-provider-azure-ad',
	]
      }
    ],
  },
};
