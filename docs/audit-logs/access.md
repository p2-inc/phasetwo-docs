---
id: access
title: Access
---

Phase Two records access events about end users' use of your realms. These are primarily registration, login and account management actions.

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

Field definitions are in the [Audit Log API](./api.md#field-definitions) documentation.

## Event types

All access event types are indicated in the `type` field of the json event with the `access.` prefix.

### Login events

- LOGIN - A user has logged in.
- REGISTER - A user has registered.
- LOGOUT - A user has logged out.
- CODE_TO_TOKEN - An application has exchanged an authorization code for tokens.
- CLIENT_LOGIN - A client has obtained a token for its service account (client credentials grant).
- REFRESH_TOKEN - An application has refreshed a token.
- TOKEN_EXCHANGE - A token has been exchanged for another token.
- IDENTITY_PROVIDER_LOGIN - A user has logged in through an identity provider.
- IDENTITY_PROVIDER_FIRST_LOGIN - A user has logged in through an identity provider for the first time.
- USER_DISABLED_BY_TEMPORARY_LOCKOUT / USER_DISABLED_BY_PERMANENT_LOCKOUT - Brute force detection has locked a user.

### Account events

- FEDERATED_IDENTITY_LINK - An account has been linked to an identity provider, such as a social login.
- REMOVE_FEDERATED_IDENTITY - An identity provider link has been removed from an account.
- UPDATE_EMAIL - The email address for an account has changed.
- UPDATE_PROFILE - The profile for an account has changed.
- SEND_RESET_PASSWORD - A password reset email has been sent.
- RESET_PASSWORD - A password has been reset.
- UPDATE_PASSWORD - The password for an account has changed.
- UPDATE_CREDENTIAL - A credential, such as an OTP device or passkey, has been added or updated.
- REMOVE_CREDENTIAL - A credential has been removed from an account.
- SEND_VERIFY_EMAIL - An email verification email has been sent.
- VERIFY_EMAIL - The email address for an account has been verified.
- EXECUTE_ACTIONS - An admin has emailed a user a set of required actions.
- EXECUTE_ACTION_TOKEN - A user has followed an emailed action link.
- CUSTOM_REQUIRED_ACTION - A user has completed a custom required action.
- GRANT_CONSENT / REVOKE_GRANT - A user has granted or revoked consent for a client.
- DELETE_ACCOUNT - A user has deleted their own account.
- INVITE_ORG - A user has been invited to an organization.

This is not a complete list. Keycloak adds event types between versions; see the Keycloak [EventType](https://www.keycloak.org/docs-api/latest/javadocs/org/keycloak/events/EventType.html) reference for all of them.

For all events, there is a corresponding error event, suffixed with `_ERROR`, which indicates a problem when performing the indicated action.
