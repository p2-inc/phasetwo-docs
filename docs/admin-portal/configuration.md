---
id: configuration
title: Configuration
---

In the **Styles**->_Portal_ section of the admin UI, it is possible to configure user access to portions of the portal. This has the effect of limiting the self-management functionality that is available to your users. Two of the sections below — _Passwordless_ and _Attributes_ — do not have a checkbox in that panel yet; set their [realm attributes](./access-control.md#setting-realm-attributes-for-manual-control) directly to toggle them. The sections are:

- _Profile_ View and edit profile information such as first name, last name and email. View and edit credentials, linked account, and manage authenticated sessions.
  - _Password update_ Update password.
  - _2FA create/update_ Add and remove 2FA mechanisms like OTP and WebAuthn.
  - _Passwordless_ Add and remove passwordless WebAuthn credentials.
  - _Device activity_ View and terminate active authentication sessions.
  - _Linked accounts_ View, create and remove links with social and other identity providers.
- _Organizations_ View and (conditionally) edit details of organizations for which a user is a member.
  - _Details_ View and edit organization profile information.
  - _Members_ View and manage organization members and their roles. Invite new members.
  - _Invitations_ Invite new members.
  - _Domains_ Add and verify email domains for SSO login.
  - _SSO_ Create and update SSO connections to organization identity provider.
  - _Events_ View events related to organization member activity.
  - _Attributes_ View and manage custom organization attributes. Members with the `view-organization` role see the attribute list; members with `manage-organization` can add, edit and remove entries.

![Keycloak Phase Two Portal Style and Visibility Configuration](/docs/admin-portal-config.png)

### Styles

Currently, the logo and favicon set in the general styles section will be used when rendering the portal in order to preserve your branding.

![Keycloak Phase Two General Logo Configurations](/docs/admin-portal-general-styles.png)

The portal is built on [shadcn/ui](https://ui.shadcn.com/) components that read their colors from CSS variables. Your branding is applied at runtime: a small set of theme tokens is resolved from realm attributes and injected as a `<style>` element that overwrites those variables, so changes take effect immediately without rebuilding or redeploying anything.

#### Theme tokens

Each token is a realm attribute prefixed with `_providerConfig.assets.portal.v2.` — for example, the `primary` token is set with `_providerConfig.assets.portal.v2.primary`. `#rgb` and `#rrggbb` hex values are the recommended format for colors. Bare CSS color keywords such as `red` or `transparent`, and the `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()` and `oklch()` functions, are also accepted — but contrast is only measured from hex, so a keyword or color function leaves `foreground` and `darkForeground` at their built-in defaults and resolves `primaryForeground`, `ctaForeground` and `darkCtaForeground` to white. Set the matching foreground token explicitly whenever you use one. The **Styles**->_Portal_ tab of the admin UI does not expose these fields yet, so set them with the [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html#_realms_admin_resource) or in a realm export JSON.

| Token               | CSS variable                                                             | Default                                                         | Notes                                                                                                              |
| ------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `primary`           | `--primary`, `--ring`                                                    | `#1570c2`                                                       | Brand color: primary buttons, links, focus rings, active sidebar item. Legacy fallback: `primaryColor700`.         |
| `primaryForeground` | `--primary-foreground`                                                   | auto-contrast of `primary`                                      | Text and icons drawn on top of `primary`.                                                                          |
| `cta`               | `--cta`                                                                  | `#252627`                                                       | Neutral emphasized action button, distinct from the brand-colored `primary`. Legacy fallback: `secondaryColor900`. |
| `ctaForeground`     | `--cta-foreground`                                                       | auto-contrast of `cta`                                          | Text drawn on top of `cta`.                                                                                        |
| `background`        | `--background`, `--card`, `--popover` (light mode)                       | `#ffffff`                                                       | Page, card and popover surface.                                                                                    |
| `foreground`        | `--foreground`, `--card-foreground`, `--popover-foreground` (light mode) | `#09090b`, or auto-contrast of `background` when you set it     | Body text. `--muted-foreground` is a mix of it and `background`.                                                   |
| `muted`             | `--muted`, `--secondary`, `--accent` (light mode)                        | `#f4f4f5`                                                       | Recessed surfaces: sidebar, secondary buttons, hover states. No effect in dark mode.                               |
| `border`            | `--border`, `--input` (light mode)                                       | `#e4e4e7`                                                       | Borders and input outlines. No effect in dark mode.                                                                |
| `radius`            | `--radius`                                                               | `0.5rem`                                                        | Corner radius. Accepts a CSS length such as `0`, `4px`, `0.5rem` or `1em`.                                         |
| `darkBackground`    | `--background`, `--card`, `--popover` (dark mode)                        | `#09090b`                                                       | Dark mode base surface. The other dark surfaces are mixed from it.                                                 |
| `darkForeground`    | `--foreground` (dark mode)                                               | `#fafafa`, or auto-contrast of `darkBackground` when you set it | Body text in dark mode.                                                                                            |
| `darkCta`           | `--cta` (dark mode)                                                      | `#ffffff`                                                       | CTA button in dark mode.                                                                                           |
| `darkCtaForeground` | `--cta-foreground` (dark mode)                                           | auto-contrast of `darkCta`                                      | Text drawn on top of `darkCta`.                                                                                    |

Every foreground token is optional, but they fall back in two different ways. `primaryForeground`, `ctaForeground` and `darkCtaForeground` have no built-in default: when one is unset, a readable near-black or white is always computed from the relative luminance of `primary`, `cta` or `darkCta`. `foreground` and `darkForeground` do have built-in defaults, and keep them unless you set `background` or `darkBackground` — set one of those and the matching text color is auto-contrasted from it instead, so a lone dark `background` never leaves near-black text on top of it.

The `--sidebar-*` variables have no tokens of their own — the sidebar is a recessed surface, so it reuses `muted`, `border` and `primary` for its surfaces, and `foreground` and `primaryForeground` for the text on them.

#### Precedence

Every token resolves independently: the `v2` attribute if it is set, then — for `primary` and `cta` only — the matching legacy attribute, then the built-in default. `primary` and `cta` are the only tokens with a legacy fallback. A value that is not a valid color, or not a valid CSS length in the case of `radius`, is treated as unset and falls through to the next step.

`primaryForeground`, `ctaForeground` and `darkCtaForeground` have no built-in default at all: their second step _is_ the contrast derivation described above, so they always resolve to a readable color for whatever `primary`, `cta` or `darkCta` ended up being.

#### Legacy colors

The older `_providerConfig.assets.portal.primaryColor*` and `_providerConfig.assets.portal.secondaryColor*` attributes are still read, but only two of them still affect rendering: `primaryColor700` is the fallback for the `primary` token, and `secondaryColor900` is the fallback for `cta`. The rest — `primaryColor100`, `primaryColor200`, `primaryColor400`, `primaryColor500`, `primaryColor600` and `primaryColor900` — are accepted and ignored. They used to style incidental details rather than surfaces, so use the `v2` tokens above to customize surfaces. `secondaryColor800` is ignored for a different reason: it was the CTA button's hover shade, which is now derived from `cta` itself (the button renders as `bg-cta/90` on hover).

These legacy fields are what the **Styles**->_Portal_ tab of the admin UI shows today:

![Keycloak Phase Two Portal legacy color fields in the admin UI](/docs/admin-portal-portal-styles.png)

#### Custom CSS

You can also append arbitrary CSS with `_providerConfig.assets.portal.css`. It is appended last, into the same `<style>` element as the generated variables, so it overrides both the tokens and the built-in defaults. Target the CSS variables or standard selectors:

```css
:root {
  --primary: #7c3aed;
  --radius: 0.25rem;
}
.dark {
  --background: #0b1923;
}
```

:::caution Breaking change
Custom CSS that targeted the old generated utility classes — `.bg-primary-700`, `.text-primary-500`, `.bg-primary-gradient` and friends — no longer has any effect, because the portal's components now use semantic shadcn/ui classes such as `bg-primary` and `text-muted-foreground`. Migrate that CSS to the variables above. Realms that customized `primaryColor100` or `primaryColor900` will see neutral surfaces after upgrading — the brand color is preserved through `primaryColor700` and the CTA button color through `secondaryColor900` — so set the matching `v2` tokens to restore custom surfaces.
:::

See the [Admin Portal source code](https://github.com/p2-inc/phasetwo-admin-portal) for further detail.
