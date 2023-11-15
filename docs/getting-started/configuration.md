---
id: configuration
title: Configuration
---

There is a sensible set of configuration defaults that have been chosen for common use cases. However, this section will contain a few of the basic changes you may wish to make to tailor the functionality to your specific use case.

### Basic settings

There are a couple of default configuration choices you should be aware of before opening up your application to the world.

#### Login and registration

In the **Realm settings** section, in the **Login** tab, you will find several important settings.

- *User registration* controls if users can register for your application, and enables the default registration screens.
- *Email as username* controls if the users email address will be used as their username.
- *Login with email* allows users to log in with their email address, regardless if their email is their username.
- *Verify email* requires the user to verify their email address. An email server must be set up in your account in order to send a verification email to your users. See the [email server configuration guide](/docs/getting-started/email#server-configuration) for more information.

![](/docs/getting-started-configuration-settings.png)

#### User profile

By default, only username, email, first name and last name are collected. It is possible to add more requirements for your users. 

In the **Realm settings** section, in the **General** tab, you must turn on *User Profile Enabled* in order to allow additional fields. Once you save the configuration, another tab called **User profile** will appear. You can add additional fields, control who can view and manage those fields, set requirements, and add validation.

![](/docs/getting-started-configuration-user-profile.png)

### Realm setup

Depending on how you are using Phase Two (i.e. self-service, dedicated deployments, Docker image, etc.), your initial configuration might differ slightly. These options may already have been set by default, but they are documented here in case not. It is also useful to understand the purpose for each selection.

#### Themes

In the **Realm settings** section, select the **Themes** tab.

##### Login

The `Attributes` login theme is the Phase Two default that allows customizing the login UI without deploying a custom theme. This must be selected in order to use the options detailed in the [customizing UI](customizing-ui) section.

##### Admin console

If you are not seeing an **Extensions** section at the bottom of the left nav, you need to set the *Admin console theme* to `phasetwo.v2`. This theme contains all of the admin UI for managing the Phase Two extensions. You must log out and log back into the Admin UI in order for this change to take effect. 

##### Email

The `Attributes` email theme is the Phase Two default that allows the use of the email template UI detailed in the [emails](email#content-templates) section.

![](/docs/getting-started-configuration-themes.png)
