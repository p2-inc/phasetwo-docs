---
id: api
title: User Migration API
---

## Prerequisites

You must provide two REST endpoints (GET and POST) in your legacy authentication system under the URI `${restClientUri}/{$username}`, where `${restClientUri}` is a configurable base URL for the endpoints and `{$username}` is the
username of the user that is attempting to sign in.

It is possible to configure the plugin to use the legacy `userId` instead of the username when making the credential verification request. This option is useful if your legacy system allows users to change their usernames and should only be used when the legacy user ids are migrated.

Customers can use the existing audit logging mechanism to include their own application's events. There is a single API method that will consume events in the representation below and make them available for searching, filtering and exporting.

### GET
The GET request will have to return user data as a JSON response in the form:
```json
{
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "enabled": "boolean",
    "emailVerified": "boolean",
    "attributes": {
      "key": ["value"]
    },
    "roles": ["string"],
    "groups": ["string"],
    "requiredActions": ["requiredActions"]
}
```


Any HTTP status other than `200` will be interpreted as the user not having been found. 

The `id` attribute in the above response is optional. If it's not set, a new user id will be generated automatically.

### POST
The POST request is for password validation. It will have to accept the following body:
```json
{
    "password": "string"
}
```

...And return HTTP status 200 if the password is correct. Any other response will be treated as invalid credentials.

### Example REST client behavior

Let's assume we have configured the legacy REST service under the URL `http://www.old-legacy-system.com/auth`.

If a user with the username `bob` and the password `password123` tries to log in for the first time (giving correct credentials), a GET request will be performed to `http://www.old-legacy-system.com/auth/bob`.
The response might look like this:
```json
{
    "id": "12345678",
    "username": "bob",
    "email": "bob@company.com",
    "firstName": "Bob",
    "lastName": "Smith",
    "enabled": "true",
    "emailVerified": "true",
    "attributes": {
      "position": ["rockstar-developer"],
      "likes": ["cats", "dogs", "cookies"]
    },
    "roles": ["admin"],
    "groups": ["migrated_users"],
    "requiredActions": ["CONFIGURE_TOTP", "UPDATE_PASSWORD", "UPDATE_PROFILE", "update_user_locale"]
}
```

As the user has been found, a POST request will be performed to `http://www.old-legacy-system.com/auth/bob`, with
the body:
```json
{
    "password": "password123"
}
```

If the plugin is configured to use the user id as the path parameter for the credential verification request, the `POST` request will be performed to `http://www.old-legacy-system.com/auth/12345678`, instead.

As this is the correct password, the user will be logged in. In the background, his information will be migrated.

### Configuration

1. In the admin, navigate to "User federation".
1. Choose "User migration using a REST client" from the "Add provider..." dropdown.
1. Provide the legacy system endpoint URI in the "Rest client URI" field.
1. Click "save".

Phase two will now recognize all users from your legacy authentication system and migrate them automatically.

## Optional - additional configuration

Additional configuration options are available for fine-tuning the migration. 

### Bearer Token Auth

The migration endpoint can be secured with an API token. The configured value will be sent as a bearer token in the authorization header.

If bearer auth is enabled, the configured token value is set to `SECRET_API_TOKEN` when making the request to the migration endpoints, the rest client will send the following authorization header:
```
Authorization: Bearer SECRET_API_TOKEN
```

### Basic Auth for migration endpoint

The migration endpoint can be secured with HTTP basic auth. 
The configured value will be sent as a Basic auth string in the authorization header.
Keep in mind that this approach is only secure over an encrypted connection (i.e. HTTPS)

If basic auth is enabled, the username and password will be sent in the authorization header:

```
Authorization: Basic base64encode(username:password)
```

### Legacy role conversion

If role names in do not perfectly match those in the legacy system, you can configure the provider to automatically map legacy roles to new roles, by specifying the mapping in the format `legacyRole:newRole`.

### Migrate unmapped roles

This switch can be toggled to decide whether roles which are not defined in the legacy role conversion map should be
 migrated anyway or simply ignored.

### Group role conversion

If group names do not perfectly match those in the legacy system, you can configure the provider to automatically map legacy groups to new groups, by specifying the mapping in the format `legacyGroup:newGroup`.

### Migrate unmapped groups

This switch can be toggled to decide whether groups which are not defined in the legacy group conversion map should be migrated anyway or simply ignored.
