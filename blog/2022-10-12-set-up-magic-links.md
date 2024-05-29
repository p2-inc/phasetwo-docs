---
slug: set-up-magic-links
title: Magic Links Guide, and 5 Minute Setup
authors: phasetwo
tags: [tutorial, keycloak, phase_two, magic_links]
---

Someone who is reading this article is probably very different that the average internet user when it comes to passwords. Developers and IT admins, either because of security savvy or compliance, use password managers, multi-factor authentication (MFA) mechanisms, or prefer sites that offer password-less authentication. Furthermore, they are keenly aware of the weaknesses in their personal "attack surface", and search for ways to balance convenience with risk.

But you are here because you want to find a way to implement magic links quickly. First, some background.

<!--truncate-->

### What are magic links?

Magic links are a type of password-less authentication that allow your users to log in to your application following a link that is emailed to them, rather than typing a username and password. Magic links can also be used as a part of a multi-factor authentication (MFA) strategy.

In a magic link flow, the application's authentication provider asks users for an email address rather than a password. The authentication provider generates a link with an embedded token, and sends to the user's email. There may be some other steps taken by the provider, such as verifying the provided email address matches an existing user. The user then opens the email, clicks the link, is verified by the authentication provider, and is granted access to the application

![Keycloak Phase Two Magic Link Extension Flow Diagram](/blog/2022-10-12-set-up-magic-links-flow.png)

### Pros and cons

Like any mechanism that tries to streamline a security process such as authentication, there are both pros and cons to the magic link approach. First in the plus column:

- Enhances user experience, which makes users more likely to use your application, and be satisfied with the experience. This drives user engagement.
- User onboarding is accelerated, as magic links can be sent to new users as well as existing ones. Registration for your application is as easy as entering your email address.
- You'll never have a password breach. When there are no passwords, there are no password breaches. A huge number of corporate data breaches are due to insufficient and compromised passwords.
- No more customer support requests related to lost passwords. Over half of customer support requests are due to authentication problems, many of those are users unable to remember their passwords. This eliminates a huge portion of those.

Nothing is perfect, and there are also several potential downsides to magic links:

- Account security and access are now tied to the security of the user's email account. If the user's computer or other device is compromised, and attacker could potentially obtain the link and impersonate the user.
- If the user or email provider does not enforce encrypted network access to email, it may be possible for an attacker to perform a man-in-the-middle attack where they can obtain the link by observing network traffic.
- Ability to access your application is now tied to email deliverability. If your email service or the user's email provider fails to deliver the email containing the link in a timely fashion, it could deteriorate the experience for the user.

### Limiting risk

Fortunately, there are things your application and the user can do in order to limit some of the possible downside risks of using magic links. Your application can:

- Make the magic links single use, or set a very short expiration time for the links.
- Enforce an additional factor when using magic links.

Your user can:

- Choose an email provider that enforces the use of encrypted connections.
- Use multi-factor authentication (MFA) mechanisms to further protect their email accounts.

### Setup guide

Sorry for the wait! We wanted to give you an overview of magic links before diving into how to set them up with Phase Two.

If you haven't already, get an account on [Phase Two](https://phasetwo.io/dashboard). You'll notice that we use magic links in addition to social login options. As we said above, we're trying to make it as frictionless as possible to get in and start using the product.

Once you log in and create your first deployment, open the Phase Two enhanced Keycloak console. In order to email links to your users, you'll need to set up email. If you haven't already done that, head over to our [email setup guide](/blog/2022-10-05-set-up-email.md).

After you've completed email setup, select the **Authentication** menu item, and then select the **Magic link** flow from the list.

![Keycloak Phase Two Magic Link Authentication Page Flow Name](/blog/2022-10-12-set-up-magic-links-magiclinkauth.png)

Open the configuration for the **Magic Link Authenticator** by clicking the gear icon on the last line with the **Magic Link** execution. You'll notice two options:

- **Force create user** creates a new user when an email is provided that does not match an existing user. This allows the use of magic links to register new users that have not been previously seen.
- **Update profile on create** adds an UPDATE_PROFILE required action if the user was created. This means that the user will need to fill out other required fields such as first/last name, etc.

For the purpose of our demonstration, let's set **Force create user** to ON and **Update profile on create** to OFF (remember, low friction). Save the configuration, and go back to the flow page.

In the **Action** menu of the flow page, select **Bind**, and select **Browser flow**.

![Keycloak Phase Two Magic Link Bind Flow](/blog/2022-10-12-set-up-magic-links-bind.png)

Now you're ready to test it out. If you don't have an application that is setup and protected by Keycloak, you can use the built-in account console to try it out. Navigate to the **Clients** menu, and open the link next to the **account** client in an incognito window (this will prevent conflict, as you are already logged in to the admin console as the administrator).

Click **Sign In** and you'll be redirected to the authentication page. Enter your email address, and you'll be sent a magic link. Click on the link in your email, and you'll see your details in the account console.

![Keycloak Phase Two Magic Link Login Page](/blog/2022-10-12-set-up-magic-links-login.png)
![Keycloak Phase Two Magic Link Confirm Page](/blog/2022-10-12-set-up-magic-links-confirm.png)

Go back to the admin console in the other browser window, and navigate to the **Users** section. You will be able to find the user that was just created.

![Keycloak Phase Two Magic Link Admin User View](/blog/2022-10-12-set-up-magic-links-admin-user.png)

Magic links are a great way to streamline your user onboarding and experience to help you easily drive engagement across your application. Phase Two makes it quick and easy to integrate magic links (and social login, and enterprise SSO, and much more). Stay tuned for more guides that will help you build the authentication experience that is right for your app.
