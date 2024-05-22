---
slug: customizing-login-pages
title: How To Customize Login Pages
author: Phase Two
tags: [phase_two, themes, login, keycloak]
---

Brand is important to modern SaaS companies, and nowhere is that more apparent than at the front door: the login experience. Unfortunately, the default design of the Keycloak login experience has a "face only a mother could love".

In order to allow customers to customize that experience, we've extended the default Keycloak theming functionality to allow you to easily customize the login pages from the admin console. This eliminates the need to package and deploy a custom theme, and allows fast iteration without restart.

<!--truncate-->

## Simple customization

If you're in a hurry, logo and color customization can be achieved by adding your logo's URL and three color choices. These are available in the _General_ and _Login_ tabs of the **Styles** section.

![Keycloak Phase Two Login Page Customization Logo URL](/blog/2023-04-21-styles-general.png)

![Keycloak Phase Two Login Page Customization Styles Configuration](/blog/2023-04-21-styles-login.png)

In order for these setting to take effect, your **Realm Settings** _Themes_ must also be set to `Attributes` for the _Login theme_ type

![Keycloak Phase Two Login Page Theme Setting](/blog/2023-04-21-theme-attributes.png)

## Full customization using CSS

Many of you will have more stringent branding requirements. For this, you can override the styles of the default Keycloak login theme. To discover the base styles that are available using this theme, we recommend

Note that using CSS overrides will cause the colors from simple customization not to work.

In order to load your CSS, paste it into the "CSS" field in the _Login_ tab of the **Styles** section.

![Keycloak Phase Two Login Page Custom CSS](/blog/2023-04-21-styles-css.png)

This CSS will be the last CSS loaded, overridding the styles in the default `keycloak` login theme.

References:

- [Keycloak login CSS](https://github.com/keycloak/keycloak/blob/main/themes/src/main/resources/theme/keycloak/login/resources/css/login.css) - The default CSS for the `keycloak` login theme.
- [Patternfly 4](https://www.patternfly.org/v4/) - The styling library used by the theme.

### CSS Examples

To get you started with some ideas, we've created 3 example login themes that were done by overridding the CSS. These are free of license restriction, so feel free to download, use and customize the CSS at the links with the example images.

- Consumer - [CSS](https://github.com/p2-inc/keycloak-themes/blob/main/examples/consumer/login.css)
  ![Keycloak Phase Two Login Page Consumer Theme](/blog/2023-04-21-consumer-theme.png)

- Enterprise - [CSS](https://github.com/p2-inc/keycloak-themes/blob/main/examples/enterprise/login.css)
  ![Keycloak Phase Two Login Page Enterprise Theme](/blog/2023-04-21-enterprise-theme.png)

- SaaS - [CSS](https://github.com/p2-inc/keycloak-themes/blob/main/examples/saas/login.css)
  ![Keycloak Phase Two Login Page SaaS Theme](/blog/2023-04-21-saas-theme.png)

#### Images and other assets

You'll notice that images, icons and fonts not found in the standard Keycloak themes are used. These are referenced by URL in the CSS. For example, if you are used to loading a custom font in the `<head>` of your HTML, it is possible to do it in CSS using `@import`:

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lexend+Deca:wght@300;400;500;600;700&family=Lexend:wght@300;400;500;600;700&family=Work+Sans:wght@300;400;500;600;700&display=swap");
```

And background and other images can be referenced by their full URL using `url(...)`:

```css
.login-pf body {
  background-image: url("https://raw.githubusercontent.com/p2-inc/keycloak-themes/main/examples/saas/assets/SaaS%20BG.webp");
}
```

## Success!

As always, our success is based on the success of our customers. We hope this extension and guide has helped you update the default Keycloak login branding to match that of your needs. If you have suggestions for further improvement of this feature, please reach out on GitHub!
