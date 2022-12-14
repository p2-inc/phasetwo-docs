---
id: customizing-ui
title: Customizing UI
---

It is possible to customize styles for login screens to match your branding. This can be achieved by simple colors and logo override of the default them, or by full CSS replacement.

### Simple

The simple override of colors and logo can be access in the admin UI in the **Styles** section. The available override values are
- **General** tab
  - Logo: URL of your logo image. This will be constrained to 150x150. You should use an SVG or PNG with alpha channel to make sure this renders properly on your background color and in the Admin Portal, if you are using it.
  - Favicon: URL of your favicon.

![](/docs/getting-started-customizing-ui-logos.png)

- **Login** tab
  - Background color: Hex color for background.
  - Primary color: Hex color for primary.
  - Secondary color: Hex color for secondary.

![](/docs/getting-started-customizing-ui-colors.png)


### Full CSS

Full CSS can be added on the same page in the Admin UI. This stylesheet will be loaded last. Note that the use of a full CSS file will override the values from above. For more information on the styles used in the login pages, see [Patternfly v4](https://www.patternfly.org/v4/), and the Keycloak [base](https://github.com/keycloak/keycloak/tree/main/themes/src/main/resources/theme/base/login) and [keycloak](https://github.com/keycloak/keycloak/blob/main/themes/src/main/resources/theme/keycloak/login/resources/css/login.css) themes.

### Maually by Realm attributes

The above methods for updating the style store the values as Realm attributes. If you prefer to programmatically set these, use the following Realm attribute keys:
- `_providerConfig.assets.login.css`
- `_providerConfig.assets.login.primaryColor`
- `_providerConfig.assets.login.secondaryColor`
- `_providerConfig.assets.login.backgroundColor`
- `_providerConfig.assets.logo.url`
- `_providerConfig.assets.favicon.url`
