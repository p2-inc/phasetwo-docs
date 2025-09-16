---
title: Shadcn Keycloak Theme Starter with Tailwind CSS
slug: shadcn-keycloak-theme
date: 2025-08-11
authors: phasetwo
tags: [phase_two, keycloak, theme, shadcn, tailwind]
---

Get the theme: [Shadcn Keycloak Theme Starter](https://github.com/p2-inc/keycloakify-starter-shadcn)

A [shadcn](https://ui.shadcn.com/) theme starter for Keycloak using [Tailwind CSS](https://www.tailwindcss.com) and [Radix UI](https://www.radix-ui.com/) components. This starter provides a foundation for building a custom, component-based Keycloak theme.

<!-- truncate -->

Phase Two are [sponsors](/blog/phasetwo-keycloakify-partnership/) of [Keycloakify](https://www.keycloakify.dev) as we are deeply convinced by this project's value.

## The Shadcn Keycloak Theme Starter

We chose to use [shadcn](https://ui.shadcn.com/) as the component library for this starter because it provides a set of modern, accessible, and customizable components that can be easily integrated into Keycloakify themes. shadcn is built on top of [Tailwind CSS](https://tailwindcss.com) and [Radix UI](https://www.radix-ui.com/), which makes it a great fit for building custom Keycloak themes.

The starter provides a basic structure for building Keycloak themes using shadcn components, including:

- **Initial Setup**: A basic Keycloakify project setup with shadcn and Tailwind CSS configured.
- **Login Page**: A customized login page using shadcn components.
- **Baseline Components**: A set of reusable shadcn components that can be used throughout the theme.
- **Baseline Ejections**: Minimum set of pages ejected to get you started with customizing the login.

Since shadcn ejects components into the project, you can customize them (or replace) as needed. This makes it quick and easy to introduce styles or components.

## Options for Customizing Keycloak UI

1. **FTL Templates**: Keycloak's default theming system using FreeMarker templates. This is the traditional way to customize Keycloak's UI, but it can be cumbersome and lacks modern component-based design. Phase Two provides a [simple CSS customization guide](/docs/getting-started/customizing-ui) for basic styling changes to avoid having to go into FTL templates.
2. **CSS Customization**: You can override the default CSS styles to change the appearance of Keycloak's UI. This is a simple way to apply custom styles, but it doesn't provide the flexibility of a component-based approach. Phase Two provides a [simple CSS customization guide](/docs/getting-started/customizing-ui) for basic styling changes to base themes.
3. **Keycloakify**: A modern theming solution that allows you to build Keycloak themes using React components. It provides a more flexible and maintainable way to customize Keycloak's UI, leveraging the power of React and modern web development practices.

## Built-in Keycloak Themes

The built-in Keycloak themes are built using not just FTL templates, but use [PatternFly](https://www.patternfly.org/) as a design library. PatternFly provides a set of components and styles that are used to build the Keycloak UI. However, it can be difficult to customize these components to fit your specific design needs. The semantics and structure is not always clear, and the CSS can be difficult to override. Components use variables without consistency and getting that right can be a challenge, leaving you wondering if you covered all your use cases.

In addition, there is no easy way to "preview" all variations of the pages. Keycloakify provides a built-in Storybook preview for all page variations.

If you follow the official [Guides for theme ui-customization](https://www.keycloak.org/ui-customization/themes) you will quickly find that the dev experience is an after-thought. There is only one sentence about development: "During development you can copy the theme to the themes directory,...". Knowing how the theme inherits from the base, how to override styles, add components, what data is available, or preview a page, is not documented or easy.

As Keycloak releases new versions, the themes are not guaranteed to be compatible. This means that you will have to review and possibly update your custom theme with each Keycloak release, which can be a significant effort.

Lastly, adjusting the Account UI or the Emails, is documented to the extent of changing message templates. As something almost every Keycloak user needs, this leaves a major hole in the theming experience.

## Where Keycloakify Fits In

[Keycloakify](https://www.keycloakify.dev) is a theming solution that allows you a couple methods, CSS or custom components, of configuration to customize the three main areas of Keycloak:

1. **Login Pages**
2. **Account UI**
3. **Emails**

It is backwards compatible so that as new Keycloak versions are released, you can continue to use your custom theme without having to worry about breaking changes. It also provides a built-in Storybook preview for all page variations, making it easy to see how your customizations will look in different scenarios.

Of the two methods that Keycloakify provides, we see that almost in all cases, the custom components method ends up being used. Dealing with PatternFly's CSS is difficult and error prone. That being said, Keycloakify requires some initial configuration to do custom component development: adding libraries, ejecting pages, etc. For this reason, we are taking a baseline starter and sharing it with the community in the hopes that it will help save people time in getting started with Keycloakify.

Also, we know that eventually there will be development to remove the need for this starter, but until then, we hope this will help you get started with Keycloakify and building custom themes for Keycloak.

## Summary

We look forward to seeing how the community uses this starter to build custom themes for Keycloak. If you have any questions or feedback, please feel free to file an issue on the [GitHub repository](https://github.com/p2-inc/keycloakify-starter-shadcn) or [reach out](/contact).
