---
id: brute-force-detection
title: Brute Force Detection
---

Keycloak provides a brute force detection feature that can help protect your realm from malicious login attempts. This feature is not enabled by default, so you will need to configure it according to your security requirements.

Brute force attacks are attempts to guess a user's password by trying many different combinations. Keycloak can detect these attempts and take actions such as temporarily disabling the user account when the threshold of failed login attempts is reached.

1. Log in to the Keycloak Admin Console via the Phase Two Dashboard.
2. Visit the realm you want to configure. Open the console link for the specific realm.
3. Navigate to the **Realm settings** section in the left sidebar.
4. Click on the **Security defenses** tab and then select the **Brute Force Detection** sub-tab.
5. In the **Brute Force Mode** dropdown, select your desired mode:
   - **Disabled**: No brute force detection is applied.
   - **Lockout permanently**: User accounts will be permanently locked after the threshold of failed login attempts is reached.
   - **Lockout temporarily**: User accounts will be temporarily locked for a specified duration after the threshold of failed login attempts is reached.
   - **Lockout permanently after temporary lockout**: User accounts will be permanently locked after a temporary lockout period if the threshold is reached again.

<figure>
  <img src="/docs/security/brute-force-detection-mode-select.png" className="max-w-xl"  alt="Brute force detection mode selection" />
  <figcaption>Brute force detection mode selection</figcaption>
</figure>

6. Set your desired thresholds to be reached.

<figure>
<img src="/docs/security/brute-force-detection-mode-configuration.png" className="max-w-xl"  alt="Brute force detection mode configuration" />
<figcaption>Brute force detection mode configuration</figcaption>
</figure>

## Considerations

**Brute force detection is per user.** It counts failed logins against one account at a time. It will not detect an attack spread across many accounts, and that is what credential stuffing is: an attacker replays username and password pairs leaked from other sites, usually trying one password per account, so most accounts never reach the threshold. Pair it with a CAPTCHA such as [Cloudflare Turnstile](./turnstile.md) on your login flows, Phase Two's [rate limits](./rate-limiting.md) at the edge, and the other measures in [Credential Stuffing and Account Takeover](./credential-stuffing.md).

**It covers the token endpoint too.** Failed logins through the direct access grant (`grant_type=password`) count toward the same per-user threshold as browser logins. That does not make the direct grant safe to leave on; see [Sign-in Methods, Grant Types and Clients](../authentication/sign-in-methods.md).

**A lockout can be used against you.** Anyone who knows a username can lock that account by sending wrong passwords. For an end user this is an inconvenience. For a shared account that a backend service logs in with using a password, it is an outage: the attacker locks the account and the service stops getting tokens. Give services their own [service account](../api/service-accounts.md) with the client credentials grant instead, which brute force detection does not apply to.

**Quick login check.** Failures that arrive faster than the _Quick Login Check Milliseconds_ setting trigger a short lockout for the _Minimum Quick Login Wait_, even before the main threshold is reached. This slows scripted attempts against a single account without affecting a person typing.

**Record lockouts.** If you save login events, add `USER_DISABLED_BY_TEMPORARY_LOCKOUT` and `USER_DISABLED_BY_PERMANENT_LOCKOUT` to the saved event types. Without them you can see that an account was locked but not when, or what triggered it. See [Audit Logs](/docs/audit-logs).

If you need help with your edge protection or have specific security requirements, please [contact support](/contact).
