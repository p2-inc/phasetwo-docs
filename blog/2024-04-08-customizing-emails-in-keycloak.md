---
slug: customizing-email-templates
title: "How to Customize Email Templates in Keycloak"
author: Phase Two
tags:
  [
    keycloak,
    phase_two,
    open_source,
    idp_wizard,
    on_prem,
    private_cloud,
    email,
    customization,
  ]
---

Keeping your brand consistent across user touch-points is important to modern Saas companies. Just like customizing [Login Pages](https://phasetwo.io/blog/customizing-login-pages), customizing your email templates is just as important. Keycloak has a number of [templates](https://phasetwo.io/docs/getting-started/email#content-templates) which can be customized.

Keycloak starts out with simple text templates, but unless you like spending your days looking at Unix terminals, you probably prefer some color and images in your emails.

## Template Customization

Phase Two exposes an interface in the Admin UI to adjust the HTML and Text template. In the Styles > _Emails_ tab, select a template to edit.

![Customizing Email Template Example](/blog/2024-04-08-email-templates.png)

Enter the new HTML for the HTML template along with a matching Text template.

Using a test user, visit the flow of the templates you changed to have those emails sent to you and confirm you're happy with your changes.

## Example Template

We've made a [sample template](https://github.com/p2-inc/keycloak-theme-template/examples) to get you going. All you have to do is adjust the CSS colors and inject a link to your hosted logo file somewhere. There is a content section which you can copy/paste the default content from Keycloak into and customize. A simple HTML preview of the template lets you get an idea of how it will look.

![Email example template](/blog/2024-04-08-email-example-phaseII.png)

# Success

Kaboom! Done. We challenge you to tell us the last time a change in Keycloak was that easy 💪

As always, our success is based on the success of our customers. We hope this extension and guide has helped you update the default Keycloak email branding to match that of your needs. If you have suggestions for further improvement of this feature, please reach out on [GitHub](https://github.com/p2-inc)!
