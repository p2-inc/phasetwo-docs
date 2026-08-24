---
id: customizing-ui
title: Customizing UI / Theming
---

Phase Two ships a unified theme called **phasetwo-ui** that covers all four Keycloak theme types — login, account, admin, and email — in a single package. It is built with [Keycloakify](https://www.keycloakify.dev/) and [shadcn/ui](https://ui.shadcn.com/) and is the default theme on Phase Two hosted instances.

Branding is applied at runtime through realm attributes, so changes take effect immediately without rebuilding or redeploying the theme JAR. The **Styles** panel in the admin console (under **Extensions**) provides a UI for most of these settings — the Admin Portal `v2` theme tokens described below are not exposed there yet. To access it, ensure the `phasetwo-ui` theme is selected for the **Admin** theme in **Realm Settings > Themes**.

:::tip Email theme
For email branding (logo, footer), set your realm's email theme to `phasetwo-ui`. This unlocks the **Email Branding** settings described in the [Emails](/docs/getting-started/email#email-branding) guide.
:::

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
| `_providerConfig.assets.login.primaryForegroundColor` | `#ffffff` | Text on the primary color. Only takes effect through the brand-token path above, as the legacy fallback for `theme.v2.primaryForeground` — the legacy stylesheet never emitted a variable for it. |
| `_providerConfig.assets.login.css`                    | —         | Arbitrary CSS appended after theme styles |

**Login (dark mode overrides)**

Omit one and the fallback depends on the kind of color. `primaryColor` and `secondaryColor` are brand colors and fall back to their light-mode values, so a custom brand color stays consistent across modes. `backgroundColor` does **not** — it falls back to the dark default, because carrying a light background into dark mode would stop dark mode being dark.

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

**Email**

- `_providerConfig.assets.logo.base64` — base64-encoded data URI of your email logo (e.g. `data:image/png;base64,...`). Embedded directly in email bodies; requires the `phasetwo-ui` email theme.
- `_providerConfig.assets.email.footer.line1` — first footer line; defaults to realm display name when absent
- `_providerConfig.assets.email.footer.line2` — optional second footer line

**Brand tokens (login, Admin Portal, and email)**

The login theme and the [Admin Portal](https://github.com/p2-inc/phasetwo-admin-portal) are built on [shadcn/ui](https://ui.shadcn.com/) components that read their colors from CSS variables, and the email templates use the same values inline. All three resolve one **shared** set of brand tokens, so branding a realm once brands every surface.

Each token is a realm attribute prefixed with `_providerConfig.assets.theme.v2.` — for example `_providerConfig.assets.theme.v2.primary`. Every color token takes an optional dark-mode override named `dark<Token>`, such as `_providerConfig.assets.theme.v2.darkBackground`.

Color tokens accept a `#rgb` or `#rrggbb` hex value — the recommended format — and also bare CSS color keywords such as `red`, and the `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()` and `oklch()` functions. Contrast is only measured from hex, so if you use a keyword or a color function, set the matching foreground token explicitly rather than relying on auto-contrast. `radius` accepts a CSS length such as `0`, `4px` or `0.5rem`. A value matching none of these is ignored as if unset.

_Base tokens_ — each has a built-in default:

| Token                 | Light default | Dark default | Description                                                    |
| --------------------- | ------------- | ------------ | -------------------------------------------------------------- |
| `background`          | `#ffffff`     | `#09090b`    | Page surface                                                   |
| `foreground`          | `#09090b`     | `#fafafa`    | Body text                                                      |
| `primary`             | `#3b82f6`     | `#3b82f6`    | Brand color: primary buttons, links, active items              |
| `primaryForeground`   | `#ffffff`     | `#ffffff`    | Text and icons on `primary`; auto-contrasts when unset         |
| `secondary`           | `#60a5fa`     | `#1e3a5f`    | Secondary buttons and accents                                  |
| `secondaryForeground` | `#0a0a0a`     | `#fafafa`    | Text on `secondary`; auto-contrasts when unset                 |
| `muted`               | `#f4f4f5`     | `#27272a`    | Recessed surfaces: sidebar, hover states                       |
| `mutedForeground`     | `#71717a`     | `#a1a1aa`    | De-emphasized text, such as helper text                        |
| `border`              | `#e4e4e7`     | `#3f3f46`    | Borders                                                        |

_Derived tokens_ — no default of their own; set one to override it, or leave it unset and it follows its base token. This is what lets a lone custom `primary` also move the focus ring:

| Token              | Follows when unset |
| ------------------ | ------------------ |
| `card`             | `background`       |
| `cardForeground`   | `foreground`       |
| `accent`           | `muted`            |
| `accentForeground` | `foreground`       |
| `input`            | `border`           |
| `ring`             | `primary`          |

_Other tokens_ — `radius` (a CSS length) and `fontFamily` (a CSS font stack).

Three behaviors are worth knowing:

- **Brand color is mode-independent.** Set `primary` or `secondary` and leave the dark override unset, and dark mode inherits your light value rather than reverting to the default. Surface and neutral tokens never inherit, so a light `background` will not light up dark mode.
- **Foregrounds auto-contrast.** `primaryForeground` and `secondaryForeground`, when unset, are computed as a readable near-black or white from their background's relative luminance. `foreground` does the same from `background`, but only when that value is measurable hex.
- **Per-surface defaults differ slightly.** The Admin Portal's own `primary` default is `#1570c2` and its `radius` default is `0.5rem`, against `0.625rem` on the login pages. Those only apply when you leave the token unset.

Each token resolves independently: the `theme.v2` attribute if set, otherwise the surface's legacy fallback where one exists, otherwise a derivation, otherwise the built-in default.

Email is the one surface that does **not** fall back to resolved defaults — only tokens you have explicitly set reach the email templates, because their built-in defaults deliberately differ from the login palette. An unbranded realm's email is unchanged.

See [Admin Portal configuration](../admin-portal/configuration.md#theme-tokens) for how the portal applies these at runtime, including how the sidebar derives from them.

_Legacy (deprecated)_

These Admin Portal keys follow the [Tailwind color](https://tailwindcss.com/docs/customizing-colors) scale, with the lowest number lightest. They are still read, but only `primaryColor700` still affects rendering, as the legacy fallback for `primary`. `secondaryColor900` used to feed a separate `cta` token for the neutral emphasized button; that token has folded into `primary`, so a realm which only customized `secondaryColor900` should set `_providerConfig.assets.theme.v2.primary` instead. Set the `theme.v2` tokens to customize anything else.

| Attribute                                         | Default | Description                                                                       |
| ------------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `_providerConfig.assets.portal.primaryColor100`   | —       | Read, but no longer affects rendering                                             |
| `_providerConfig.assets.portal.primaryColor200`   | —       | Read, but no longer affects rendering                                             |
| `_providerConfig.assets.portal.primaryColor400`   | —       | Read, but no longer affects rendering                                             |
| `_providerConfig.assets.portal.primaryColor500`   | —       | Read, but no longer affects rendering                                             |
| `_providerConfig.assets.portal.primaryColor600`   | —       | Read, but no longer affects rendering                                             |
| `_providerConfig.assets.portal.primaryColor700`   | —       | Fallback for the `primary` token when `v2.primary` is unset                       |
| `_providerConfig.assets.portal.primaryColor900`   | —       | Read, but no longer affects rendering                                             |
| `_providerConfig.assets.portal.secondaryColor800` | —       | Read, but no longer affects rendering; the CTA hover shade now derives from `cta` |
| `_providerConfig.assets.portal.secondaryColor900` | —       | Fallback for the `cta` token when `v2.cta` is unset                               |

_Custom CSS_

| Attribute                           | Default | Description                        |
| ----------------------------------- | ------- | ---------------------------------- |
| `_providerConfig.assets.portal.css` | —       | Arbitrary CSS for the Admin Portal |

Custom CSS is appended last, after the generated variables, so it overrides both the tokens and the built-in defaults. Target the CSS variables (`--primary`, `--background`, `--radius`, and the `.dark` block) or standard selectors.

:::caution Breaking change
Custom CSS that targeted the old generated utility classes — `.bg-primary-700`, `.text-primary-500`, `.bg-primary-gradient`, and friends — no longer has any effect, because the portal's components now use semantic shadcn/ui classes such as `bg-primary` and `text-muted-foreground`. Migrate that CSS to the variables above. Realms that customized `primaryColor100` or `primaryColor900` will see neutral surfaces after upgrading — their brand color is preserved through `primaryColor700` and their CTA button color through `secondaryColor900` — so set the matching `v2` tokens to restore custom surfaces.
:::

Full customization details can be viewed in the Phase Two [Admin Portal Repo](https://github.com/p2-inc/phasetwo-admin-portal).

## Custom Themes

If you decide to use a custom theme, you can upload it yourself from the Phase Two Dashboard under `Cluster > Config > Resources`. See [Cluster Resources](/docs/self-service/resources) for the full walkthrough. Custom themes are available to subscribers of dedicated clusters.

### Keycloakify

[Keycloakify](https://www.keycloakify.dev) offers two methods for building custom themes:

1. **CSS Customization**: Basic, but ok for simple changes. Learn more in the [Keycloakify documentation](https://docs.keycloakify.dev/css-customization).
2. **Custom (React/Angular) Components**: Full customization using React or Angular components, allowing for a more robust and custom theme. If you have a theme library or set of components, you would take this route. Learn more in the [Keycloakify documentation](https://docs.keycloakify.dev/common-use-case-examples/using-a-component-library).

Ultimately what you choose depends on your needs. We have found that CSS customization of Patternfly is very difficult to get right and cover all cases. In many situations, the built in Patternfly components leave much to be desired from a UX perspective. Our friends at Keycloakify are working on a solution to this, but until that's ready we've started out providing a Shadcn starter component theme which can be used.

[<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg> **Shadcn Starter Theme**](https://github.com/p2-inc/keycloakify-starter-shadcn)

[Shadcn](https://ui.shadcn.com/) is a component library that provides a set of varied and robust components that can be used to build a custom theme. It leverages [Tailwind CSS](https://tailwindcss.com) for styling and [Radix UI](https://www.radix-ui.com/) for components. The starter only handles a couple of pages, but gives a template to start from. Feel free to use it and PR additions to the templates, we would love to see them!
