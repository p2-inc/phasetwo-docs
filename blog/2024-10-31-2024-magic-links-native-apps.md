---
slug: magic-links-native-applications
title: Using Magic Links Within a Native iOS, Android, or Other Application for Fast and Secure Login
description: Leverage the Keycloak Magic Link extension to easily and securely log users into native applications.
authors: phasetwo
tags: [keycloak, phase_two, keycloak_magic_link, keycloak_extensions]
---

### Keycloak and Native Applications

Native applications for iOS, Android, and other platforms can integrate with Keycloak to provide secure, centralized authentication and authorization services. By utilizing Keycloak, these applications can streamline the user login experience through various protocols such as OAuth 2.0 and OpenID Connect, which Keycloak natively supports. With Keycloak, mobile applications can handle user sign-in, token management, and session handling securely, ensuring user identities are managed consistently across devices and platforms. This setup enables native applications to offload the complexities of authentication to Keycloak, allowing seamless integrations with features like Single Sign-On (SSO), social logins, and multi-factor authentication, while developers can focus on app functionality rather than handling sensitive user data directly. Additionally, Keycloak’s support for fine-grained access control and roles ensures that native apps can manage user permissions efficiently, creating a robust foundation for secure, scalable mobile applications.

### Keycloak Magic Link

The keycloak-magic-link [repository](https://github.com/p2-inc/keycloak-magic-link) by Phase Two offers a plugin that enables passwordless authentication for Keycloak through the use of magic links. This plugin allows users to log in without needing to remember a password by simply clicking a secure link sent to their email. The keycloak-magic-link works by generating a one-time-use link, which, when clicked, authenticates the user directly, improving both security and user experience. This approach is particularly useful for applications where ease of access and reducing password fatigue are priorities. The repository provides a robust, configurable setup compatible with Keycloak’s authentication workflows, making it straightforward to implement in various types of applications that require seamless, passwordless login functionality.

### Leveraging Magic Link for Easy SSO

Applications can use the Magic Link [resource](https://github.com/p2-inc/keycloak-magic-link) to issue a request to get a link or generate an email. For example:

```bash
curl --request POST https://keycloak.host/auth/realms/test/magic-link \
 --header "Accept: application/json" \
 --header "Content-Type: application/json" \
 --header "Authorization: Bearer <access_token>" \
 --data '{"email":"foo@foo.com","client_id":"account-console","redirect_uri":"https://keycloak.host/auth/realms/test/account/","expiration_seconds":3600,"force_create":true,"update_profile":true,"update_password":true,"send_email":false}'
```

would result in a sample response of

```json
{
  "user_id": "386edecf-3e43-41fd-886c-c674eea41034",
  "link": "https://keycloak.host/auth/realms/test/login-actions/action-token?key=eyJhbG...KWuDyE&client_id=account-console",
  "sent": false
}
```

Simply change the `redirect_uri` to be a registered URI scheme for the application.

Once a user clicks that link in the email, extract the `code` param of the url, and use that to then issue requests to the `token` endpoint. For example:

```bash
curl -X "POST" "https://keycloak.host/auth/realms/test/openid-connect/token" \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     --data-urlencode "grant_type=authorization_code" \
     --data-urlencode "code=b5c7a811-0e61-42b9-9fc5-934fd614b57e.ff2148c2-a20d-4efc-ba8e-e7825f5ae204.edd26036-7f7e-4a91-be47-84603e57e3aa" \
     --data-urlencode "client_id=account-console" \
     --data-urlencode "redirect_uri=myapp://redirect"
```

### Conclusion

Using magic links with Keycloak for a native application offers a streamlined, user-friendly authentication experience, especially beneficial for mobile users. With magic links, users can log in effortlessly without needing to remember or type passwords—often a challenging task on mobile devices. Instead, a secure, one-time-use link is sent to their email, allowing them to authenticate with a simple tap. This approach not only simplifies the login process but also enhances security by reducing password-related vulnerabilities, such as weak or reused passwords. For the end user, this means a smoother, faster, and more secure login experience, allowing them to access the application with minimal effort and without the risk of password fatigue. Magic link authentication via Keycloak aligns well with modern security standards and significantly improves user engagement by lowering login barriers in native applications.

Use Phase Two's free [hosting](/hosting) to try it out or send us a message at [sales@phasetwo.io](mailto:sales@phasetwo.io) to discuss your use case or learn more.
