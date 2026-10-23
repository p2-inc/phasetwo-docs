---
id: credential-stuffing
title: Credential Stuffing and Account Takeover
---

Credential stuffing is the most common attack against a public Keycloak realm. The attacker does not guess passwords. They replay email and password pairs leaked from other sites, betting that some of your users reused a password. Each account is usually tried once, from a pool of addresses that changes constantly, by a script that never renders your login page. That shape is what defeats the defenses most realms rely on: per-user lockout never trips, per-IP limits barely register, and a CAPTCHA that is only checked in the browser is never seen.

This page covers where these attacks enter Keycloak, how to close each path, how to tell whether accounts were taken over, and what to do when they were. It draws on incidents we have worked on with customers. Every Keycloak behavior described here was reproduced on Keycloak 26.8.1.

## How attacks reach Keycloak

An attacker can submit a username and password through any client that accepts them, not only the one your application uses. Every realm has the same built-in clients, so the attacker knows their IDs in advance.

| Entry point | Request | What it bypasses |
|---|---|---|
| Browser login on your application's client | `GET /realms/{realm}/protocol/openid-connect/auth?client_id=…`, then a form `POST` to `/login-actions/authenticate` | Runs whichever browser flow the client is bound to, the realm default or a per-client override. A CAPTCHA bound only to an override protects only that client. |
| `account-console` | The same browser login, with `client_id=account-console` | Uses the realm's default browser flow. Any user can sign in through it and receive tokens. |
| `security-admin-console` | The same browser login, with `client_id=security-admin-console`, starting from `/admin/{realm}/console/` | Any user can complete this login, including users with no admin roles. Keycloak checks the password first and the roles only when the Admin API is called afterwards, so a successful login here still confirms the password. |
| Direct grant on `admin-cli` | `POST /realms/{realm}/protocol/openid-connect/token` with `grant_type=password` | Skips the browser flow entirely: no CAPTCHA, no WebAuthn, no passkeys. `admin-cli` exists in every realm with Direct Access Grants on, and it issues tokens to ordinary users. |
| Direct grant on any other client | The same, with your client's ID | The same, for any client with Direct Access Grants enabled. |

Expect the attacker to move. When one path is closed, the same campaign shows up on the next one within hours. A realm is only as protected as its least protected client, so close all of them, not just the one under attack. For a client-by-client walkthrough of the built-in clients, see [Which Keycloak clients should be enabled when you go live?](/blog/keycloak-disable-admin-cli-account-clients). For how each sign-in method relates to grant types and flows, see [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md).

## Prevent

### Turn off the password grant

Direct grant is the one path that no browser-side control can protect, because it renders no page. Reject it for the whole realm with a [client policy](./client-policies.md) using the `reject-ropc-grant` executor. Every client then answers `resource owner password credentials grant is prohibited.`, whether the password is right or wrong, so the endpoint stops confirming credentials.

Backend services that log in with a username and password, often a shared admin account on `admin-cli`, need to move to a [service account](../api/service-accounts.md) using the client credentials grant first. A shared account also has a second problem: when an attacker targets it, brute force detection locks it out, and every service using it fails with it.

### Put a CAPTCHA in front of every browser login, and make sure it fails closed

Bind the CAPTCHA to the realm's default browser flow, not to per-client overrides. Built-in clients such as `account-console` and `security-admin-console` use the realm default, so a CAPTCHA added only to your application's override leaves them open.

A CAPTCHA only helps if a request without a valid token is rejected. Scripts post the login form directly and never produce a token. Test this before you rely on it, as described in [Test that the CAPTCHA fails closed](./recaptcha.md#test-that-the-captcha-fails-closed). A CAPTCHA can fail open by design, not only by bug: the Turnstile username and password form, for example, records a failed check but still completes the login unless you configure what happens next. See [Cloudflare Turnstile](./turnstile.md) for configurations that block.

### Decide which built-in clients stay on

- **`account-console`**: if your users don't use Keycloak's self-service account pages, disable it. Don't disable `account`, which holds the roles behind the Account REST API. See [Account Console](../keycloak/account-console.md).
- **`security-admin-console`**: on a Phase Two hosted cluster, keep it enabled and leave its Root URL unchanged. The dashboard's Console link and our console health check sign in through it. Restrict `/admin` paths with [IP restrictions](../self-service/restrictions.md) instead. If you run Keycloak yourself and no administrators sign in to this realm's console, you can disable it, or block `/admin/{realm}/console/` at your proxy.

### Turn on brute force detection, and know its limits

[Brute force detection](./brute-force-detection.md) is off by default. Turn it on, but understand what it does. It counts failures per user, so an attacker who tries one password per account never reaches the threshold. It counts direct grant failures as well as browser failures, which means an attacker can deliberately lock out an account they know exists. While an account is locked, the correct password gets the same `Invalid user credentials` response as a wrong one, so the real user is locked out too.

### Use edge rate limits for floods, not for stuffing

Per-IP rate limits stop a single source from overwhelming your cluster. They do little against a campaign spread across thousands of residential proxy addresses, each sending a handful of requests. See [Rate Limiting](./rate-limiting.md) for the limits on hosted clusters.

Edge rules also see less than you might expect. A browser login carries `client_id` in the query string, so a WAF or proxy rule can match it. A direct grant carries `client_id` in the `POST` body, which most edge rules cannot read. Blocking direct grant at the edge by client ID doesn't work. Use the client policy.

### Reduce what a stolen password gets

- **Offer MFA or passkeys** to users. They protect only browser sign-in, which is another reason to turn off direct grant, whose flow has no WebAuthn step.
- **Limit offline access.** In a default realm, a direct grant on `admin-cli` with `scope=offline_access` returns an offline token valid for 30 days. Remove the `offline_access` scope from clients that don't need it. See [Tokens and Sessions](./tokens-and-sessions.md).
- **Reject known-breached passwords** at registration and password change with a [password blacklist](./password-blacklist.md).

### Watch for confirmation leaks

Keycloak returns the same `Invalid user credentials` message for an unknown user and a wrong password. Other responses can still confirm that a password is right. A direct grant for a user with a pending `UPDATE_PASSWORD` required action returns `Account is not fully set up`, which only happens after the password matched. Custom authenticators and flow ordering can add similar differences. Test your flows with a correct and an incorrect password and compare the responses.

## Detect

**Keycloak's log does not show successful logins.** The default `jboss-logging` event listener writes `LOGIN_ERROR` events at `WARN` and `LOGIN` events at `DEBUG`, so a production log shows the failures and none of the takeovers. A log search tells you an attack is happening but not which accounts it got into.

**The event store does.** Saved events include `LOGIN` with the client, user, and IP address. On a self-hosted realm, saving events is off by default. Turn it on under **Realm Settings → Events → User events settings**, and check three settings:

- **Expiration.** Unset means events are kept until you delete them. If you set an expiration, make it longer than the time it might take you to notice an attack. A few days is not enough.
- **Saved event types.** The default list includes `LOGIN`, `LOGIN_ERROR`, `CODE_TO_TOKEN`, `USER_DISABLED_BY_TEMPORARY_LOCKOUT` and `USER_DISABLED_BY_PERMANENT_LOCKOUT`. If you trimmed the list, put these back. Without the lockout types, you can't tell later why an account was locked.
- **Database growth.** A stuffing campaign can write millions of `LOGIN_ERROR` rows. Plan for it.

On a Phase Two hosted cluster, events are captured automatically and kept by the platform regardless of the realm's expiration setting. See [Audit Logs](/docs/audit-logs).

**Signals worth alerting on:**

- `LOGIN` events for ordinary users on `admin-cli`, `security-admin-console`, or `account-console`, if those clients have no legitimate user logins in your realm. In our experience this is the clearest single indicator of a takeover.
- A jump in `LOGIN_ERROR` with `user_not_found`. Most stuffing attempts are for addresses that aren't your users.
- `LOGIN` events from IP addresses that also produced many `LOGIN_ERROR` events in the same window.
- Many distinct usernames from one IP address, or one username from many addresses.

## Respond

When an attack got through, work in this order.

1. **Close the path the attacker used** with the controls above. Remediating accounts while the path is open just lets the attacker take them again.
2. **Identify the compromised accounts.** These are users with a successful `LOGIN` from the attack: on a client real users don't use, or from addresses tied to the campaign. Query the event store, or the Admin API (`GET /admin/realms/{realm}/events?type=LOGIN&client={clientId}&dateFrom=…`).
3. **Set a new random password on each account** with `PUT /admin/realms/{realm}/users/{id}/reset-password` and `"temporary": false`. Don't rely on the Update Password required action alone. With it, the leaked password still works: a browser sign-in with the old password goes straight to the change-password screen, so the attacker can set a password of their choosing. A random password the user never sees closes the account until they use **Forgot password**.
4. **End the account's sessions** with `POST /admin/realms/{realm}/users/{id}/logout`. Setting a new password does not do this. In our testing, an offline token kept refreshing after a password reset.
5. **Revoke offline sessions separately.** The admin logout ends regular sessions and leaves offline sessions in place. List them with `GET /admin/realms/{realm}/users/{id}/offline-sessions/{clientUuid}` for each client, then delete each with `DELETE /admin/realms/{realm}/sessions/{sessionId}?isOffline=true`. Check the count afterwards. A refresh with a revoked offline token returns `Offline user session not found`.
6. **Export the evidence before retention removes it.** Save the events for the attack window, and the admin events for your remediation, outside Keycloak.
7. **Tell the affected users.** Explain that their password was taken from another site, that they need to use **Forgot password** to get back in, and that they should change the password anywhere else they used it.

Steps 3 to 5 are fast through the Admin API. Script them, run the script against a non-production realm first, log the HTTP status of every call, and verify the end state rather than assuming it.

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| A web application firewall in front of your cluster with per-IP [rate limits](./rate-limiting.md) by tier | Turning off the password grant with a [client policy](./client-policies.md), after moving backend services to [service accounts](../api/service-accounts.md) |
| [IP restrictions](../self-service/restrictions.md) for `/admin` paths on Premium and Enterprise, and for public paths on Enterprise | A CAPTCHA in your browser flows. The [Cloudflare Turnstile](./turnstile.md) extension is included in every cluster and is off until you configure it |
| Event capture into the Phase Two [audit log](/docs/audit-logs), independent of your realm's event settings | [Brute force detection](./brute-force-detection.md) and your [password policy](./password-policy.md) |
| A master realm that is not exposed to customers | Which built-in clients stay on. Keep `security-admin-console` enabled on a hosted cluster |
| Help during an incident: email [support@phasetwo.io](mailto:support@phasetwo.io) | Remediating affected accounts and notifying users |

Use the [go-live checklist](../getting-started/launch-checklist.md) to confirm all of this before launch.
