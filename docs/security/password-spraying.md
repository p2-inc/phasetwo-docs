---
id: password-spraying
title: Password Spraying and Brute Force in Keycloak
description: How password spraying differs from brute force in Keycloak, why lockout misses it, how lockout can be turned against users, and how to gate the password grant.
---

Password spraying is an attack in which one or a few common passwords, such as `Winter2026!`, are tried against many accounts, slowly, so that no single account sees more than a failure or two. Brute force is the opposite shape: many passwords against one account. Keycloak's brute force detection counts failures per user, so it stops brute force and barely registers a spray. Defending against spraying means taking away the endpoint that makes it cheap, the password grant, and watching for failures spread across many users rather than piled up on one.

This page covers what Keycloak's lockout does and how it can be used against your users, how to restrict the password grant while a backend still depends on it, and what to watch for. Every Keycloak behavior described here was reproduced on Keycloak 26.8.1.

## How is password spraying different from brute force and credential stuffing?

| | Brute force | Password spraying | Credential stuffing |
|---|---|---|---|
| What is tried | Many passwords against one account | One or a few common passwords against many accounts | Username and password pairs leaked from other sites |
| Attempts per account | Hundreds or more | One to a few, often spread over days | Usually one |
| What it needs to work | A weak password on a known account | Some users with a common password | Some users who reused a password |
| Stopped by per-user lockout? | Yes | Rarely | Rarely |
| Stopped by per-IP limits? | Yes, from one source | Not when spread across many addresses | Not when spread across many addresses |

[Credential Stuffing and Account Takeover](./credential-stuffing.md) covers the entry points into a realm and how to respond to a takeover, and most of its defenses apply here too. This page covers what is specific to guessing: lockout, and the password grant.

## Why lockout and per-IP limits miss password spraying

**Per-user lockout never trips.** Keycloak keeps a failure count for each user, and a spray adds one to each. In our test, one password sprayed across five accounts left four of them at one failure each, none locked, and gave the fifth, which used that password, a token. A successful login clears the count, and so does a gap longer than the _Failure reset time_ (12 hours by default), so a spray paced at one attempt per account per day never accumulates.

**Unknown usernames are not counted at all.** They are logged as `user_not_found` with no account to count against.

**Per-IP limits miss distributed sprays.** A spray spread over a pool of proxy addresses sends a handful of requests from each, well under any per-IP [rate limit](./rate-limiting.md).

**The password grant makes each guess cheap.** A direct grant (`grant_type=password` on the token endpoint) checks a password in one request, with no login page, no CAPTCHA, and no second factor in the default flow, and `admin-cli` accepts it in every new realm. See [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md).

## What Keycloak's brute force detection does

Brute force detection is off by default. It is configured in **Realm settings → Security defenses → Brute force detection**. The **Brute Force Mode** dropdown sets these fields in the realm representation:

| Brute Force Mode | `permanentLockout` | `maxTemporaryLockouts` | Effect |
|---|---|---|---|
| Disabled | Not used; `bruteForceProtected` is `false` | Not used | No counting. The other three modes set `bruteForceProtected` to `true` |
| Lockout temporarily | `false` | `0` | The account is blocked for a wait period, then accepts logins again |
| Lockout permanently | `true` | `0` | The account is disabled when the threshold is reached, until an administrator enables it |
| Lockout permanently after temporary lockout | `true` | greater than `0` | Temporary lockouts, then a permanent one after the set number of lockouts |

The other settings, with their defaults in a new 26.8.1 realm:

| Console label | Field | Default | What it does |
|---|---|---|---|
| Max login failures | `failureFactor` | `30` | Failures before the first lockout |
| Wait increment | `waitIncrementSeconds` | `60` | Length of a lockout, and how much it grows |
| Strategy to increase wait time | `bruteForceStrategy` | `MULTIPLE` | `MULTIPLE`: wait is the increment times the number of whole multiples of _Max login failures_. `LINEAR`: the wait grows by one increment with every failure past the threshold |
| Max wait | `maxFailureWaitSeconds` | `900` | Upper limit on a temporary lockout |
| Failure reset time | `maxDeltaTimeSeconds` | `43200` (12 hours) | A failure after this long since the last one starts the count again |
| Quick login check milliseconds | `quickLoginCheckMilliSeconds` | `1000` | Two failures closer together than this trigger a short lockout, even below the threshold |
| Minimum quick login wait | `minimumQuickLoginWaitSeconds` | `60` | Length of that short lockout |
| Maximum Secondary Authentication Failures | `maxSecondaryAuthFailures` | `0` (off) | Failed second-factor attempts, such as OTP, before a permanent lockout, in any mode |

### What a locked user sees

The same answer as a wrong password. With the account locked, we sent the correct password through both paths:

| Path | Response to the correct password while locked |
|---|---|
| Direct grant | `400 {"error":"invalid_grant","error_description":"Invalid user credentials"}` |
| Browser login | The login page with `Invalid username or password.` |

A lockout confirms nothing to an attacker, but the real user is told their password is wrong when it isn't, with no hint to wait. The events record the difference: the lockout itself is `USER_DISABLED_BY_TEMPORARY_LOCKOUT` or `USER_DISABLED_BY_PERMANENT_LOCKOUT`, and later attempts are `LOGIN_ERROR` with `user_temporarily_disabled` or `user_disabled`.

### The browser and the direct grant share one count

Failures through the password grant count toward the same lockout as browser failures. Two wrong passwords in the browser and one through the token endpoint locked an account with _Max login failures_ set to 3, and the browser then refused the correct password. Attempts sent while the account is already locked are not counted.

## Can an attacker lock out your users on purpose?

Yes. Anyone who knows a username can lock it, from a script, through the password grant. This is the main cost of lockout, and it should decide which mode you pick.

**Temporary lockout re-arms on every failure after the threshold.** With _Max login failures_ at 3 and the default _Wait increment_ of 60 seconds, each failure sent after the previous lockout ended gave:

| Failure number | Result |
|---|---|
| 1 to 2 | No lockout |
| 3 | Locked for 60 seconds |
| 4 | Locked again for 60 seconds |
| 5 | Locked again for 60 seconds |
| 6 | Locked for 120 seconds |

Past the threshold, one wrong password per wait period keeps an account locked indefinitely, and the count only resets after 12 quiet hours or a successful login, which the locked user can't perform. That is roughly one request a minute per account, far under any per-IP limit.

**Quick login check locks early.** Two failures less than a second apart locked an account for 60 seconds, regardless of _Max login failures_. It slows a script hammering one account, and it lets an attacker lock an account with two fast requests.

**Permanent lockout is an outage that needs an administrator.** Reaching the threshold sets the user's `enabled` to `false`. In our test, clearing the brute force record (`DELETE /admin/realms/{realm}/attack-detection/brute-force/users/{id}`) left the user disabled; the correct password worked only after `PUT /admin/realms/{realm}/users/{id}` with `"enabled": true`. An attacker with your username list can disable every account. Don't use permanent lockout on an internet-facing login unless you are ready to re-enable accounts in bulk.

**Shared service accounts are the worst case.** When the account a backend logs in with is locked, the backend fails for everyone. Move it to client credentials, below.

For most realms, choose **Lockout temporarily**, set **Max login failures** low enough to stop guessing against one account (single digits to low teens) and **Max wait** short enough that a deliberate lockout is an annoyance, not an outage (minutes, not hours). Lockout protects individual accounts; it is not your defense against spraying.

## Prevent

### Turn off the password grant

The end state is a realm where no client accepts `grant_type=password`. A [client policy](./client-policies.md) with the `reject-ropc-grant` executor does this for every client, rejects the request before the password is checked, so it confirms nothing, and does not count toward lockout: in our test, wrong passwords sent to a client covered by the policy left the user's failure count at zero. It also covers clients created later.

The obstacle is usually a backend, script or integration that still logs in with a username and password. Move each one to a [service account](../api/service-accounts.md) using the client credentials grant, which needs no user password and is not subject to brute force lockout.

### If a backend still needs the password grant, restrict it now

Migrations take time. Until the last dependent backend has moved, you can close the password grant for everything else and narrow what remains. The configuration below has two parts:

1. A client policy that rejects the password grant on every client **except** the backend's own client, marked with an attribute.
2. On that one client, a direct grant flow override that refuses any user without a specific role, before the password is checked.

Result, measured on 26.8.1:

| Request | Response |
|---|---|
| Password grant on any other client, including `admin-cli` and clients created later | `400 {"error":"invalid_grant","error_description":"resource owner password credentials grant is prohibited."}` |
| Backend client, user with the role, correct password | `200` with tokens |
| Backend client, user with the role, wrong password | `400 Invalid user credentials` |
| Backend client, user without the role, correct or wrong password | `401` with an HTML `Access denied` error page |
| Backend client, unknown username | `400 Invalid user credentials` |
| Backend client, no client secret | `401 {"error":"unauthorized_client","error_description":"Invalid client or Invalid client credentials"}` |

Make the backend's client confidential, so reaching the gated flow at all needs its client secret.

#### Step 1: create the gated flow

In the Admin Console:

1. Go to **Realm roles** and create a role, for example `password-grant-allowed`. Assign it only to the account the backend uses.
2. Go to **Authentication**, open the ⋮ menu on the `direct grant` flow, and choose **Duplicate**. Name the copy `direct-grant-restricted`.
3. In the copy, choose **Add sub-flow**, name it `password-grant-allowlist`, and set it to **Conditional**.
4. In the sub-flow, **Add condition** → **Condition - user role**, set it to **Required**, and configure it with the role `password-grant-allowed` and **Negate output** on.
5. In the sub-flow, **Add step** → **Deny access**, set to **Required**.
6. Drag the sub-flow so it sits **directly after Username Validation and before Password**. The order matters, as shown below.

With `kcadm.sh`, against a realm in `$REALM`:

```bash
kcadm.sh create roles -r $REALM -s name=password-grant-allowed
kcadm.sh add-roles -r $REALM --uusername backend-user --rolename password-grant-allowed

kcadm.sh create "authentication/flows/direct%20grant/copy" -r $REALM -s newName=direct-grant-restricted
kcadm.sh create authentication/flows/direct-grant-restricted/executions/flow -r $REALM \
  -s alias=password-grant-allowlist -s type=basic-flow -s provider=registration-page-form
kcadm.sh create authentication/flows/password-grant-allowlist/executions/execution -r $REALM -s provider=conditional-user-role
kcadm.sh create authentication/flows/password-grant-allowlist/executions/execution -r $REALM -s provider=deny-access-authenticator

ids() { kcadm.sh get authentication/flows/direct-grant-restricted/executions -r $REALM \
  --fields id,displayName --format csv --noquotes | grep ",$1\$" | cut -d, -f1; }
SUBFLOW=$(ids password-grant-allowlist); COND=$(ids "Condition - user role"); DENY=$(ids "Deny access")

# Priority 15 places the sub-flow between Username Validation (10) and Password (20)
kcadm.sh update authentication/flows/direct-grant-restricted/executions -r $REALM \
  -b "{\"id\":\"$SUBFLOW\",\"requirement\":\"CONDITIONAL\",\"priority\":15}"
kcadm.sh update authentication/flows/direct-grant-restricted/executions -r $REALM -b "{\"id\":\"$COND\",\"requirement\":\"REQUIRED\"}"
kcadm.sh update authentication/flows/direct-grant-restricted/executions -r $REALM -b "{\"id\":\"$DENY\",\"requirement\":\"REQUIRED\"}"
kcadm.sh create authentication/executions/$COND/config -r $REALM \
  -b '{"alias":"lacks-password-grant-allowed","config":{"condUserRole":"password-grant-allowed","negate":"true"}}'

# Check the order
kcadm.sh get authentication/flows/direct-grant-restricted/executions -r $REALM \
  --fields displayName,requirement,level --format csv --noquotes
```

The check should print Username Validation, then `password-grant-allowlist` with its condition and Deny access, then Password and the conditional OTP sub-flow.

#### Step 2: bind it to the backend's client and close every other client

In the Admin Console, open the backend's client, go to the **Advanced** tab, and under **Authentication flow overrides** set **Direct Grant Flow** to `direct-grant-restricted`. Then mark the client with an attribute and create the client policy. Client attributes are set through the Admin API:

```bash
FLOW_ID=$(kcadm.sh get authentication/flows -r $REALM --fields id,alias --format csv --noquotes \
  | grep ',direct-grant-restricted$' | cut -d, -f1)
CLIENT_ID=$(kcadm.sh get clients -r $REALM -q clientId=legacy-backend --fields id --format csv --noquotes)
kcadm.sh update clients/$CLIENT_ID -r $REALM \
  -s "authenticationFlowBindingOverrides={\"direct_grant\":\"$FLOW_ID\"}" \
  -s 'attributes."password-grant-exempt"=true'

kcadm.sh update client-policies/profiles -r $REALM -b '{"profiles":[{"name":"no-password-grant",
  "executors":[{"executor":"reject-ropc-grant","configuration":{"auto-configure":"false"}}]}]}'
kcadm.sh update client-policies/policies -r $REALM -b '{"policies":[{"name":"password-grant-only-exempt",
  "enabled":true,"conditions":[{"condition":"client-attributes","configuration":{"is-negative-logic":true,
  "attributes":"[{\"key\":\"password-grant-exempt\",\"value\":\"true\"}]"}}],"profiles":["no-password-grant"]}]}'
```

These calls replace the realm's existing client profiles and policies, so merge them with any you already have. Set `auto-configure` explicitly; `false` makes the policy reject requests without changing client settings, and leaving it unset breaks client creation, as described in [Client Policies](./client-policies.md).

#### What we found when building it

- **Before the password, not after.** With the gate after Password, a user without the role got `400 Invalid user credentials` for a wrong password and `401 Access denied` for the right one, which confirms the password. Before Password, both get the same `401`.
- **Not first.** Above Username Validation there is no user yet for the role condition to check, and the gate did nothing: a user without the role received tokens. Confirm the order after every edit.
- **It still reveals that an account exists.** An existing user without the role gets a `401` HTML page; an unknown username gets the `400` JSON error. That is why the gate belongs only on a confidential client, behind its secret, not in the realm's default direct grant flow.
- **Denied attempts count toward lockout.** Three `Access denied` responses locked the account. Requests rejected by the client policy did not count.
- **Overrides work too, but the policy is better.** A flow containing only **Deny access** refused every client when bound as the realm's direct grant flow, and only `admin-cli` when set as its per-client override. The client policy also covers clients created later and answers with a consistent JSON error.

**Keycloak 26.8.1 has no IP or network condition.** None of the flow conditions or client policy conditions can match the caller's address. To limit the password grant to the backend's addresses, use a proxy or firewall rule on the token endpoint, or a custom authenticator extension. A direct grant carries `client_id` in the request body, which many edge rules can't read, so such a rule usually matches on path and source address.

#### Then finish the migration

The gate is a stopgap. When the backend runs on a [service account](../api/service-accounts.md), set its `password-grant-exempt` attribute to `false`, or change the policy's condition to **any-client** as in [Client Policies](./client-policies.md). From then on every client, including the backend's, answers `resource owner password credentials grant is prohibited.`, and you can delete the gated flow and the role.

### Make the remaining login paths expensive

With the password grant closed, a spray has to go through the browser login:

- **A CAPTCHA on every browser login** that rejects submissions without a valid token. See [Cloudflare Turnstile](./turnstile.md).
- **A [password blacklist](./password-blacklist.md)** with the passwords sprays use: seasons plus years, company names, `Password1!`. It applies when a password is set, not to existing ones.
- **Passkeys or a second factor**, so a guessed password is not enough. See [Phishing-Resistant Login](./phishing-resistant-login.md).

### If users come from LDAP or Active Directory

Keycloak's lockout and the directory's lockout policy are separate, and failed password checks that Keycloak passes to the directory may count there too, locking the user out of everything that uses the directory. We have not tested this interaction. Test it in a non-production setup before relying on either lockout.

## Detect

Events never contain the password tried, so you can't search for one password across many accounts. You can see the shape: many users failing once each. Each failure is a `LOGIN_ERROR` event with the client, IP address and, in the details, the username and `grant_type`. Save events as described in [Credential Stuffing and Account Takeover](./credential-stuffing.md), and alert on:

- **Many distinct usernames with `invalid_user_credentials` in a short window**, one or two failures each. Brute force is the reverse: one username, many failures.
- **A rising share of `user_not_found`**, which means someone is working from a list of guessed or scraped addresses.
- **A pool of addresses each producing a few failures for different users.** Group by address and username together, not by address alone.
- **Attempts on a closed password grant.** These are `LOGIN_ERROR` with `invalid_grant` and `client_policy_error` in the details, and no username: a spray is being tried, but you can't see against whom.
- **A burst of `USER_DISABLED_BY_TEMPORARY_LOCKOUT` across many accounts**, which usually means deliberate lockout rather than guessing.
- **A successful `LOGIN` from an address that also failed for other users.** That is a spray that worked. Respond as in [Credential Stuffing and Account Takeover](./credential-stuffing.md).

[Detecting Attacks on Keycloak](./detecting-attacks.md) covers collecting and querying these events.

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| A web application firewall with per-IP [rate limits](./rate-limiting.md) by tier, which slows a spray from a single source | Rejecting the password grant with a [client policy](./client-policies.md), and the interim gate above while backends migrate to [service accounts](../api/service-accounts.md) |
| [IP restrictions](../self-service/restrictions.md) for `/admin` paths on Premium and Enterprise, and for public paths on Enterprise | [Brute force detection](./brute-force-detection.md): the mode, thresholds and wait times |
| Event capture into the Phase Two [audit log](/docs/audit-logs), independent of your realm's event settings, plus [metrics](../self-service/metrics.md) and [logs](../self-service/logs.md) in the dashboard | Alerts on the signals above |
| The [Cloudflare Turnstile](./turnstile.md) authenticators in every cluster image, off until you configure them | A CAPTCHA in your realm's browser flow, a [password blacklist](./password-blacklist.md) and a [password policy](./password-policy.md) |
| Help during an incident: email [support@phasetwo.io](mailto:support@phasetwo.io) | Unlocking or re-enabling affected accounts, and notifying users |

## Related

- [Brute Force Detection](./brute-force-detection.md) for the settings screen
- [Username Enumeration](./username-enumeration.md) for other responses that reveal whether an account exists
