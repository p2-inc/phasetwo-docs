---
id: access
title: Access
---

Phase Two records access event types that pertain to end users use of the Phase Two and customer systems. These are primarily registration, login and account management actions. 

## Example

The following is an example of the detail contained in an `access.LOGIN` event:

```json
{
  "uid": "8d76de08-1c12-4d9a-bb86-fd1c602b2486",
  "time": 1588363619462,
  "realmId": "customer.app",
  "type": "access.LOGIN",
  "authDetails": {
    "realmId": "customer.app",
    "clientId": "web-app",
    "userId": "f7cd3491-7c6c-480c-bc5c-b2b3b0fb048c",
    "ipAddress": "78.195.109.209",
    "username": "johndoe",
    "sessionId": "70c446c9-ed9a-4c9e-9a72-d26363bb4000"
  },
  "details": {
    "auth_method": "openid-connect",
    "redirect_uri": "https://customer.com/dashboard",
    "consent": "no_consent_required",
    "code_id": "70c446c9-ed9a-4c9e-9a72-d26363bb4000",
    "username": "johndoe"
  }
}
```

Field definitions can be viewed in the [API documentation](api).

## Event types

All access event types are indicated in the `type` field of the json event with the `access.` prefix. 

### Login events

- LOGIN - A user has logged in.
- REGISTER - A user has registered.
- LOGOUT - A user has logged out.
- CODE_TO_TOKEN - An application/client has exchanged a code for a token.
- REFRESH_TOKEN - An application/client has refreshed a token.

### Account events

- SOCIAL_LINK - An account has been linked to a social provider.
- REMOVE_SOCIAL_LINK - A social provider has been removed from an account.
- UPDATE_EMAIL - The email address for an account has changed.
- UPDATE_PROFILE - The profile for an account has changed.
- SEND_RESET_PASSWORD - A password reset email has been sent.
- UPDATE_PASSWORD - The password for an account has changed.
- UPDATE_TOTP - The TOTP settings for an account have changed.
- REMOVE_TOTP - TOTP has been removed from an account.
- SEND_VERIFY_EMAIL - An email verification email has been sent.
- VERIFY_EMAIL - The email address for an account has been verified.

For all events, there is a corresponding error event, suffixed with `_ERROR`, which indicates a problem when performing the indicated action.

