---
id: magic-link
title: Magic Link Authentication
---

Magic Link Authentication allows your users to log in with a special token encoded in an email. Phase Two supports two different mechanisms of creating this link.

### Authentication Flow

An Authenticator that can run as a form in your login flow. This takes an email, and can optionally create a user if none exists. This implementation sends the email using a fixed template. Installation can be achieved by duplicating the Browser flow, and replacing the normal Username/Password/OTP forms with the Magic Link execution type.

### Resource

Endpoint:
```
POST https://app.phasetwo.io/auth/realms/<realm>/magic-link
```

Parameters:

| Name | Required | Default | Description |
| ----- | ----- | ----- | ----- |
| `email` | Y | | Email address associated with the User to create the magic link for. |
| `client_id` | Y | | Client ID the user will be logging in to. |
| `redirect_uri` | Y | | Redirect URI. Must be valid for the given client. |
| `expiration_seconds` | N | 86400 (1 day) | Amount of time the magic link is valid. |
| `force_create` | N | false | Create a user with this email address as username/email if none exists. |
| `send_email` | N | false | Send the magic link email using the built in template. |

Sample response:
```
{
  "user_id": "386edecf-3e43-41fd-886c-c674eea41034",
  "link": "https://app.phasetwo.io/auth/realms/test/login-actions/action-token?key=eyJhbG...KWuDyE&client_id=account-console",
  "sent": false
}
```
