---
id: magic-links
title: Magic Links
---

Magic links are a type of password-less authentication that allow your users to log in to your application following a link that is emailed to them, rather than typing a username and password. We wrote a blog post with more details and advantages/disadvantages in the [Magic Links Guide](/blog/set-up-magic-links).

Note that email must be configured before setting up magic links. See the [email setup guide](/getting-started/email#server-configuration) if you haven't already done that.

### Configuring magic links

In the **Flows** tab of the **Authentication** section, you will find a flow named `magic link`. Depending on your setup, it is possible this flow was not installed by default. If it's missing, proceed first to the [Create magic link flow](#create-magic-link-flow) section first.

Open the configuration for the *Magic Link Authenticator* by clicking the gear icon on the last line with the *Magic Link execution*. You will see three options:

- *Alias* is a useful name to remember this configuration.
- *Force create user* creates a new user when an email is provided that does not match an existing user. This allows the use of magic links to register new users that have not been previously seen.
- *Update profile on create* adds an UPDATE_PROFILE required action if the user was created. This means that the user will need to fill out other required fields such as first/last name, etc.

![](/docs/auth-magic-links-authenticator-config.png)

Save the configuration, and go back to the flow page.

In the *Action* menu in the upper right of the flow page, select *Bind*, and select *Browser flow*.

### Login UI

After binding the magic link flow to the *Browser flow*, go back and reload your login screen. You will see that there is only a field for the email address, and the password field is now gone.

![](/docs/auth-magic-links-login.png)

After entering a valid email address, a magic link is sent to that email, and the login screen prompts the user to click on the link to complete the login process

![](/docs/auth-magic-links-email-sent.png)


### Create magic link flow

:::caution

This section is currently under construction. Check back soon for updates.

:::