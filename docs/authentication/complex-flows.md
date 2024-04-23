---
id: complex-flows
title: Complex Flows
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

It is possible to create complex authentication flows with many options and conditionals. Each application use case is unique, and it may be necessary to combine some of the examples from the other sections in order to meet your specific needs. While no one guide can be comprehensive in this regard, we present a real-world example to facilitate understand of how different authentication methods can work together in a single flow.

## Example scenario

In our example scenario, we will have some users authenticating using social providers, some using external, enterprise SSO providers, and some using username-password with a requirement of at least one second factor. This is a common setup for many enterprise SaaS applications.

### Required actions

As detailed in the previous sections, you may need to enable OTP and WebAuthn required actions in order to provide these options for 2FA for your users in this flow. If you want to force a method, you can also enable _Set as default action_.

![](/docs/auth-complex-flows-ra.png)

### Social providers

For information on setting up social identity providers, we covered setup in the [configuring social providers](../social-login#configuring-social-providers) section.

### Flow

Let's start by showing the completed flow, and then describing what changes have been made and why.

![](/docs/placeholder.png)

### Login UI

![](/docs/auth-complex-flows-ui-try.png)
![](/docs/auth-complex-flows-ui-2fa-options.png)
