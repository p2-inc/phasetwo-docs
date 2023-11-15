---
id: email
title: Emails
---

This section details setting up email delivery with your email service and customizing the content templates to match your brand and messaging.

### Server configuration

One of the first things you will need to do when getting a Keycloak Realm ready for use is to set up your email server configuration. There are many system emails that are sent to users in the course of verifying and updating user accounts: Email address verification, magic links, password reset, account update, login failure notifications, identity provider linking, etc.

In order to provide your users with a positive experience, these messages need a way to get to them. Keycloak supports any internet reachable SMTP server. If you are currently testing, and don't have an email server or service that you currently use, [SendGrid](https://sendgrid.com/?utm_source=phasetwo-io) provides free accounts that allow you to send up to 100 emails per day forever. For debugging, you can also use a service like [MailTrap](https://mailtrap.io/?utm_source=phasetwo-io) to give you a catch-all for emails coming from Keycloak.

In the Admin UI, select **Realm settings** in the left menu, and then click the **Email** tab.

![](/blog/2022-10-05-set-up-email-template.png)

In the first section, labeled **Template**, you will set options that will be used in the templates for the emails that are sent to your users. The only required field is the **From** field, which must contain the email address the user will see the email originating from. This should be an email address that your email server is expecting, and it will not block for authorization reasons.

The other fields in the **Template** section are not required, but will enhance how your emails look:

- **From** address used to send emails (required)
- **From display name** a user-friendly name displayed along **From**
- **Reply to** an email address that will be used by email clients when your user replies to an email
- **Reply to display name** a user-friendly name displayed along **Reply to**
- **Envelope from** Bounce Address used for the mails that are rejected

![](/blog/2022-10-05-set-up-email-connection.png)

In the **Connection & Authentication** section, you will provide details of your SMTP server:

- **Host** indicates the SMTP server hostname used for sending emails
- **Port** indicates the SMTP server port (usually 25, 465, 587, or 2525)
- **Encryption** support encryption for communication with your SMTP server
- **Authentication** if your SMTP server requires authentication, and supply the **Username** and **Password**

![](/blog/2022-10-05-set-up-email-buttons.png)

Finally, before you click **Save**, click the **Test connection** button to send a test email to the email address of the currently logged in user. If you don't have that set, you might have click **Save** and edit your user before you come back. You'll receive a success message, or information that will help you resolve problems.

### Content templates

Email content can be modified in the **Styles** part of the **Extensions** section, in the *Emails* tab. There are several default email types that you can modify.

- Execute Required Actions
- Link to Identity Provider
- Login error
- Magic Link
- Organization Invitation
- Password Reset
- Remove OTP
- Update OTP
- Update Password
- Update confirmation
- Verification
- Verification with code

The templates are made in both text and HTML, as emails are assembled as multi-part messages that can display either type depending on the User's email client and accessibility settings. You must edit content for both types if you are making changes.

#### Templating syntax

The syntax of the templates roughly follows that of [mustache.js](https://mustache.github.io/) which allows the replacement of values using tags enclosed by double braces, like this `{{name}}`. Each email template type exposes a set of named values and objects that can be used in your templates. At minimum, they are:

- `user.username`
- `user.firstName`
- `user.lastName`
- `user.email`
- `user.attributes.<name>`
- `realmName`
- `url.loginUrl`
- `url.registrationUrl`

Use the default templates to see the available variables for each template type.

