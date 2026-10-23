---
id: client-policies
title: Client Policies
---

Client policies let you enforce rules on every client in a realm, rather than relying on each client being configured correctly by hand. Use them to turn off grants you never want available, such as the password grant, and to make sure clients created later follow the same rules. Behavior on this page was verified on Keycloak 26.8.1.

## How client policies work

A client policy has three parts:

- **Executors** do the enforcing. Each executor checks or changes one thing. For example, `reject-ropc-grant` rejects the password grant, and `pkce-enforcer` requires PKCE on authorization requests.
- **Profiles** group executors. A profile is a named set of executors with their settings.
- **Policies** connect profiles to clients. A policy has one or more **conditions** that decide which clients it applies to, such as `any-client` or `client-access-type`, and one or more profiles to apply to them.

Executors act at two moments. On requests, such as a token or authorization request, they reject anything that breaks the rule. On client changes, when a client is created or saved, executors with **Auto-configure** turned on change the client's settings to comply. Existing clients are not changed until they are next saved, but the request-time checks apply to them immediately.

Policies apply per realm. A policy in your application realm does not affect the master realm or other realms.

## Recommended baseline

For most realms, start with two policies:

1. **Reject the password grant for every client**, so no client can be used to test passwords directly against the token endpoint.
2. **Require PKCE for public clients**, so browser and mobile applications can't run the authorization code flow without it.

### In the Admin Console

1. Go to **Realm Settings → Client Policies → Profiles** and create a profile named `no-password-grant`.
1. Add the executor **reject-ropc-grant** and turn **Auto-configure** on.
1. Create a second profile named `public-pkce`, add **pkce-enforcer**, and turn **Auto-configure** on.
1. Go to **Policies** and create a policy named `all-clients`. Add the condition **any-client** and the profile `no-password-grant`.
1. Create a policy named `public-clients`. Add the condition **client-access-type** with the type `public`, and the profile `public-pkce`.

**Always set Auto-configure explicitly on `reject-ropc-grant`, either on or off.** If the setting is left unset, creating or saving a client fails with a server error: in our testing, a `500` and a `NullPointerException` in the log on Keycloak 26.8.1. Because client creation is what breaks, the problem may not show up until someone tries to add a client.

### As JSON

The same baseline, for the profiles and policies JSON editors, or for the Admin API (`PUT /admin/realms/{realm}/client-policies/profiles` and `PUT /admin/realms/{realm}/client-policies/policies`):

```json title="Profiles"
{
  "profiles": [
    {
      "name": "no-password-grant",
      "description": "Reject the resource owner password credentials grant",
      "executors": [
        { "executor": "reject-ropc-grant", "configuration": { "auto-configure": "true" } }
      ]
    },
    {
      "name": "public-pkce",
      "description": "Require PKCE with S256 for public clients",
      "executors": [
        { "executor": "pkce-enforcer", "configuration": { "auto-configure": "true" } }
      ]
    }
  ]
}
```

```json title="Policies"
{
  "policies": [
    {
      "name": "all-clients",
      "enabled": true,
      "conditions": [{ "condition": "any-client", "configuration": {} }],
      "profiles": ["no-password-grant"]
    },
    {
      "name": "public-clients",
      "enabled": true,
      "conditions": [{ "condition": "client-access-type", "configuration": { "type": ["public"] } }],
      "profiles": ["public-pkce"]
    }
  ]
}
```

Keep both in version control with the rest of your realm configuration.

## What clients see

| Request | Response with the baseline in place |
|---|---|
| `grant_type=password` on any client, with a correct or incorrect password | `400 {"error":"invalid_grant","error_description":"resource owner password credentials grant is prohibited."}` |
| Authorization request from a public client without `code_challenge` | A redirect back to the application with `error=invalid_request` and `error_description=Missing parameter: code_challenge_method` |
| Authorization request from a confidential client without PKCE | Allowed, because the PKCE policy applies only to public clients |
| `grant_type=client_credentials` on a service account client | Allowed |

The password grant is rejected before the password is checked, so the token endpoint no longer tells an attacker whether a password is right.

## Before you turn it on

- **Find everything that uses the password grant.** Backend jobs, scripts, and integrations that call the token endpoint with a username and password will stop working. In a non-master realm that includes `kcadm.sh` and other tools that log in through `admin-cli`. Move them to [service accounts](../api/service-accounts.md) using the client credentials grant first. To find them, look for `LOGIN` events whose details include `grant_type` `password` in your realm's events.
- **Test in a non-production realm.** Apply the policies there, run your applications through login, token refresh, and logout, then apply the same JSON in production.

## Other executors worth knowing

- **`full-scope-disabled`** turns off _Full scope allowed_, so tokens carry only the roles you map to the client. Turn this off on each of your application clients. **Do not apply it to every client with `any-client`.** With Auto-configure on, saving `security-admin-console` turns its full scope off, and realm administrators then get `403` from the Admin API through the realm's Admin Console. On a Phase Two hosted cluster that also breaks the dashboard's Console link.
- **`reject-implicit-grant`** rejects the implicit flow, which modern applications should not use.
- **`secure-redirect-uris-enforcer`** validates redirect URIs when clients are saved and on each authorization request. With its default settings it rejects wildcard paths, `http` URIs, and loopback addresses.

Keycloak also ships ready-made global profiles, including `oauth-2-1-for-public-client` and `oauth-2-1-for-confidential-client`. Both include `reject-ropc-grant` and `pkce-enforcer`. They also include stricter executors: redirect URI rules, DPoP binding for public clients, and holder-of-key and confidential-client requirements for confidential clients. Those can break existing applications. Apply them to a test realm first and check every client, including the built-in ones.

See [Credential Stuffing and Account Takeover](./credential-stuffing.md) for how client policies fit with the other defenses, and the Keycloak [Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/#_client_policies) for the full list of executors and conditions.
