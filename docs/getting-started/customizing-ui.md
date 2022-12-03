---
id: customizing-ui
title: Customizing UI
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

It is possible to customize styles for login screens to match your branding. This can be achieved by simple colors and logo override of the default them, or by full CSS replacement.

### Simple

The simple override of colors and logo can be access in the Admin UI under the **Styles** tab. The available override values are 
- Background color: Hex color for background.
- Primary color: Hex color for primary.
- Secondary color: Hex color for secondary.
- Logo: URL of your logo image. This will be constrained to 300x300. You should use an SVG or PNG with alpha channel to make sure this renders properly on your background color and in the Admin Portal, if you are using it.
- Favicon: URL of your favicon.

### Full CSS

Full CSS can be added on the same page in the Admin UI. This stylesheet will be loaded last. Note that the use of a full CSS file may override the values from above.

### Maually by Realm attributes

The above methods for updating the style store the values as Realm attributes. If you prefer to programmatically set these, use the following Realm attribute keys:
- `_providerConfig.assets.login.css`
- `_providerConfig.assets.login.primaryColor`
- `_providerConfig.assets.login.secondaryColor`
- `_providerConfig.assets.login.backgroundColor`
- `_providerConfig.assets.logo.url`
- `_providerConfig.assets.favicon.url`
