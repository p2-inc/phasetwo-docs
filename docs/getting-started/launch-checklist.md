---
id: launch-checklist
title: Launch Checklist
---

This section contains a set of bare minimum requirements to make sure you're ready to move your application into production. Much of the options and configuration are beyond the scope of this section, but this is intended to give you a place to check that you've thought about the major areas before going live.

As with any integrations, we suggest you create a separate Realm for development and testing, so that there are no accidental changes that will affect your users in production.

### Configuration

- **Basic setup**. Make decisions about registration, usernames, emails, user profile elements, password policies, and more. See [Configuration](configuration).
- **Email server**. Configure your email server details so that your users can receive messages related to authentication (e.g., forgot password, email address verification, etc.). See [Email server configuration](email#server-configuration).

### Customization

- **Branding**. At a minimum, update your colors and logo to make the login screens reflect your brand. See [Customizing UI](customizing-ui).
- **Emails**. Customize email templates with your messaging and branding. See [Email templates](email#content-templates).

### Authentication

- **Client setup**. Add your app's details for secure redirect after authentication. See [Client setup](/docs/securing-applications).
- **Flows**. Set up any social login providers and other non-standard elements in your login flows, such as magic links, 2FA, and SSO. See [Authentication](/docs/authentication).

### Integration

- **Secure your app**. Set up your application to trigger login and protect elements requiring authentication. Receive user identity and profile information after successful authentication. See [Securing applications](/docs/securing-applications).
- **User management**. Add user-managed elements to your application using the admin portal functionality. See [Admin portal](/docs/admin-portal).
