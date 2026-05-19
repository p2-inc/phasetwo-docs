---
id: customizing-ui
title: Customizing UI / Theming
---

Phase Two ships a unified theme called **phasetwo-ui** that covers all four Keycloak theme types — login, account, admin, and email — in a single package. It is built with [Keycloakify](https://www.keycloakify.dev/) and [shadcn/ui](https://ui.shadcn.com/) and is the default theme on Phase Two hosted instances.

Branding is applied at runtime through realm attributes, so changes take effect immediately without rebuilding or redeploying the theme JAR. The **Styles** panel in the admin console (under **Extensions**) provides a UI for all of these settings. To access it, ensure the `phasetwo-ui` theme is selected for the **Admin** theme in **Realm Settings > Themes**.

If you are looking to build a fully custom theme, we recommend using [Keycloakify](https://www.keycloakify.dev/). Phase Two are [sponsors](/blog/phasetwo-keycloakify-partnership/) of the project.

:::info Theme selection prerequisite
The **Styles** panel and all branding features described on this page require the `phasetwo-ui` theme to be active. Go to **Realm Settings > Themes** and set:

- **Login theme**: `phasetwo-ui`
- **Admin theme**: `phasetwo-ui`
- **Account theme**: `phasetwo-ui`
- **Email theme**: `phasetwo-ui`
  :::

## Simple

The simple override of colors and logo can be accessed in the admin UI under **Extensions > Styles**. The available override values are organized across four tabs.

### General tab

- **Logo URL**: URL of your logo image. This logo appears on login and account pages. It will be constrained to 150×150px. Use an SVG or PNG with an alpha channel so it renders correctly on any background and inside the Admin Portal. To set a separate logo for emails, use the **Email** tab.
- **Favicon URL**: URL of your browser tab favicon.
- **App Icon URL**: URL of the app icon used within the [Admin Portal](https://github.com/p2-inc/phasetwo-admin-portal).

The form includes a live image preview so you can confirm your URLs are resolving correctly before saving.

![Keycloak Phase Two General Style Customization](/docs/getting-started/general-logos.png)

### Login tab

Colors control the look of the login, registration, and related authentication pages. All values are hex color codes (e.g. `#3b82f6`).

**Light mode**

- **Primary color**: Used for buttons, links, and the sidebar panel. Default: `#3b82f6`.
- **Secondary color**: Used for secondary accents. Default: `#60a5fa`.
- **Background color**: Page background color. Default: `#ffffff`.

**Dark mode**

The theme automatically follows the user's operating system dark mode preference. You can supply separate overrides for dark mode; if omitted, the light-mode values are used as fallbacks.

- **Primary color (dark)**
- **Secondary color (dark)**
- **Background color (dark)**

A **CSS** field is also available on this tab for arbitrary stylesheet overrides, loaded after the theme styles.

![Keycloak Phase Two Login Style Customization](/docs/getting-started/login-css.png)

## Full CSS

The **CSS** field in the **Login** tab accepts arbitrary CSS that is loaded after the theme styles. You can use it for targeted overrides without replacing the entire theme.

The `phasetwo-ui` login theme is built with [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS v4](https://tailwindcss.com/). The color system uses a set of `--p2-login-*` CSS variables that the theme bridges to shadcn's semantic tokens. Overriding these variables in your custom CSS is the lightest-weight way to change colors without touching the color picker fields:

```css
:root {
  --p2-login-primary-color: #5b9fdd;
  --p2-login-secondary-color: #edf5fb;
  --p2-login-background-color: #ffffff;
  /* Text color rendered on top of the primary color (e.g. button labels) */
  --p2-login-primary-foreground-color: #ffffff;
}

/* Optional: separate dark mode overrides */
.dark {
  --p2-login-primary-color-dark: #3b82f6;
  --p2-login-secondary-color-dark: #1e3a5f;
  --p2-login-background-color-dark: #0f0f0f;
}
```

Phase Two has assembled a few complete custom themes. View them in our [Keycloak Themes Repository](https://github.com/p2-inc/keycloak-theme-template).

## Manually by Realm attributes

All values set through the Styles panel are stored as Realm attributes. You can set them programmatically via the [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html#_realms_admin_resource) or in a realm export JSON. Use the following attribute keys:

**General**

| Attribute                            | Description                          |
| ------------------------------------ | ------------------------------------ |
| `_providerConfig.assets.logo.url`    | Logo URL for login and account pages |
| `_providerConfig.assets.favicon.url` | Browser tab favicon URL              |
| `_providerConfig.assets.appicon.url` | App icon URL for the Admin Portal    |

**Login (light mode)**

| Attribute                                             | Default   | Description                               |
| ----------------------------------------------------- | --------- | ----------------------------------------- |
| `_providerConfig.assets.login.primaryColor`           | `#3b82f6` | Buttons, links, sidebar                   |
| `_providerConfig.assets.login.secondaryColor`         | `#60a5fa` | Secondary accents                         |
| `_providerConfig.assets.login.backgroundColor`        | `#ffffff` | Page background                           |
| `_providerConfig.assets.login.primaryForegroundColor` | `#ffffff` | Text on primary color                     |
| `_providerConfig.assets.login.css`                    | —         | Arbitrary CSS appended after theme styles |

**Login (dark mode overrides)**

If omitted, the light-mode values are used as fallbacks.

| Attribute                                                  | Description                   |
| ---------------------------------------------------------- | ----------------------------- |
| `_providerConfig.assets.login.primaryColor-dark`           | Primary color in dark mode    |
| `_providerConfig.assets.login.secondaryColor-dark`         | Secondary color in dark mode  |
| `_providerConfig.assets.login.backgroundColor-dark`        | Background color in dark mode |
| `_providerConfig.assets.login.primaryForegroundColor-dark` | Foreground text in dark mode  |

**Email branding**

See the [Emails](./email.md) page for details on email template customization.

| Attribute                                   | Description                                                       |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `_providerConfig.assets.logo.base64`        | Email logo as a base64 data URI (max 1MB, PNG or SVG recommended) |
| `_providerConfig.assets.email.footer.line1` | First footer line (defaults to realm display name)                |
| `_providerConfig.assets.email.footer.line2` | Second footer line (optional tagline or contact info)             |

**Admin Portal**

Full customization details can be viewed in the Phase Two [Admin Portal Repo](https://github.com/p2-inc/phasetwo-admin-portal).

| Attribute                                    | Description                        |
| -------------------------------------------- | ---------------------------------- |
| `_providerConfig.assets.portal.primary100`   |                                    |
| `_providerConfig.assets.portal.primary200`   |                                    |
| `_providerConfig.assets.portal.primary400`   |                                    |
| `_providerConfig.assets.portal.primary500`   |                                    |
| `_providerConfig.assets.portal.primary600`   |                                    |
| `_providerConfig.assets.portal.primary700`   |                                    |
| `_providerConfig.assets.portal.primary900`   |                                    |
| `_providerConfig.assets.portal.secondary800` |                                    |
| `_providerConfig.assets.portal.secondary900` |                                    |
| `_providerConfig.assets.portal.css`          | Arbitrary CSS for the Admin Portal |

## Custom Themes

If you decide to use a custom theme, you must contact Phase Two support to have it added to your Realm. It is only available to subscribes of dedicated clusters.

Coming soon will be the ability to upload custom themes via the Phase Two dashboard.

### Keycloakify

[Keycloakify](https://www.keycloakify.dev) offers two methods for building custom themes:

1. **CSS Customization**: Basic, but ok for simple changes. Learn more in the [Keycloakify documentation](https://docs.keycloakify.dev/css-customization).
2. **Custom (React/Angular) Components**: Full customization using React or Angular components, allowing for a more robust and custom theme. If you have a theme library or set of components, you would take this route. Learn more in the [Keycloakify documentation](https://docs.keycloakify.dev/common-use-case-examples/using-a-component-library).

Ultimately what you choose depends on your needs. We have found that CSS customization of Patternfly is very difficult to get right and cover all cases. In many situations, the built in Patternfly components leave much to be desired from a UX perspective. Our friends at Keycloakify are working on a solution to this, but until that's ready we've started out providing a Shadcn starter component theme which can be used.

[<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg> **Shadcn Starter Theme**](https://github.com/p2-inc/keycloakify-starter-shadcn)

[Shadcn](https://ui.shadcn.com/) is a component library that provides a set of varied and robust components that can be used to build a custom theme. It leverages [Tailwind CSS](https://tailwindcss.com) for styling and [Radix UI](https://www.radix-ui.com/) for components. The starter only handles a couple of pages, but gives a template to start from. Feel free to use it and PR additions to the templates, we would love to see them!
