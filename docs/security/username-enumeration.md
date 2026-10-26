---
id: username-enumeration
title: Username Enumeration in Keycloak
description: Where Keycloak leaks whether a username or email exists, what it measurably does not leak, and how to close the enumeration paths that matter.
---

Username enumeration is an attacker learning which usernames or email addresses are real accounts, so they can aim [credential stuffing](./credential-stuffing.md), [password spraying](./password-spraying.md), and phishing only at addresses that exist. The good news is that Keycloak's login and password-reset flows are built not to leak: in our testing on 26.8.1, a known and an unknown user produced identical responses in status, body, and timing. The one flow that does reveal existence is registration, and it does so by design. This page shows what we measured, where the real leak is, and what you can and cannot do about it. Every Keycloak behavior described here was reproduced on Keycloak 26.8.1, over about 50 samples per case.

## What Keycloak does not leak

We compared a valid username with a bad password against an unknown username with a bad password, 50 samples each, with brute force protection off so lockout did not confound the timing.

| Flow | Known user | Unknown user | Enumerable? |
|---|---|---|---|
| Browser login (wrong password) | HTTP 200, "Invalid username or password." | HTTP 200, "Invalid username or password." | No |
| Direct grant (`grant_type=password`) | HTTP 400, `invalid_grant` / "Invalid user credentials" | HTTP 400, same body | No |
| Reset credentials confirmation | HTTP 200, "You should receive an email shortly…" | HTTP 200, same message (no email sent) | No |

In every case the status code and the response body were identical. Keycloak deliberately returns the same "Invalid username or password" message whether the username is wrong or the password is wrong, and the reset-password page shows the same confirmation for a real and a non-existent address.

### The timing is in the noise, honestly

A common enumeration trick is timing: if Keycloak hashes a password only for real users, a known user takes measurably longer than an unknown one, because hashing is expensive by design (see the password-hashing discussion in [Credential Stuffing](./credential-stuffing.md)). On 26.8.1 we did not see that gap, because Keycloak runs a dummy hash for non-existent users to equalize the work.

| Flow | Known-user median | Unknown-user median | Spread (p10–p90) |
|---|---|---|---|
| Browser login | 24.7 ms | 25.3 ms | ~24–30 ms both |
| Direct grant | 22.9 ms | 23.5 ms | ~21–34 ms both |

The median difference was under 1 ms, smaller than the run-to-run spread, and the slower median was not consistently the known user. This is a single-host, same-network measurement with no attacker tooling; across the public internet the variance is far larger still. We cannot distinguish these cases by timing, and neither can a remote attacker. If you have changed the password hashing provider or added a custom authenticator that short-circuits for unknown users, re-measure your own flows — the equalization is a property of the default credential path, not a guarantee.

### `login_hint` echoes, it does not confirm

Passing `login_hint=someone` on the authorization URL prefills the username field with whatever you sent, for both real and fake values. It reflects the input; it does not tell you whether the account exists.

## Where Keycloak does leak: registration

Registration is the real enumeration path, and it is unavoidable in principle: to stop two people registering the same username or email, Keycloak has to tell the second one that the value is taken. On 26.8.1 the registration form returned:

- An existing username: HTTP 200, "Username already exists."
- An existing email: HTTP 200, "This email is already associated with an existing account."
- A fully new username and email: HTTP 302, onward to verify-email.

So anyone who can reach the registration form can test an address and learn whether it is a user. Three realm settings change the surface, but none of them closes it completely:

| Setting | Effect on enumeration |
|---|---|
| `registrationEmailAsUsername` | Removes the separate username field, so a username no longer collides on its own — but the email is now the username, and a duplicate email still returns the "already associated" error. |
| `duplicateEmailsAllowed` (requires `loginWithEmailAllowed` off) | Email uniqueness is no longer enforced, so registering a duplicate email *succeeds* and the email stops leaking. The username collision still leaks. |
| `loginWithEmailAllowed` | Must be off to allow duplicate emails; leaving it on keeps email unique and therefore enumerable. |

We confirmed each of these on 26.8.1. The pattern is simple: whatever field you enforce as unique is the field registration will confirm. You cannot have both a uniqueness guarantee and non-enumerability on the same field.

## What to change, and the trade-off

- **Accept that registration reveals existence, and raise its cost instead of pretending to hide it.** Put a CAPTCHA that fails closed on the registration form — the built-in [reCAPTCHA](./recaptcha.md) or the Phase Two [Turnstile](./turnstile.md) registration action — so an attacker cannot script thousands of existence checks. Combine it with per-IP [rate limiting](./rate-limiting.md). This does not stop enumeration; it makes bulk enumeration slow and expensive, which is the achievable goal.
- **Keep the login and reset flows as they are.** They already do not leak. Do not add a custom authenticator or a "user not found" message that reintroduces a difference, and if you customize these flows, test a known and an unknown user and compare the status, body, and (if you changed hashing) timing.
- **Disable self-registration entirely** where you can (`registrationAllowed` off), which removes the enumeration path along with the [registration-abuse](./email-abuse.md) surface. The trade-off is that users must be provisioned another way.
- **Watch for other confirmation leaks in your own flows.** As noted in [Credential Stuffing](./credential-stuffing.md), a direct grant for a user mid-setup can return "Account is not fully set up," which only happens after the password matched — a leak that is about the account state, not the username, but worth testing for.

Enumeration is rarely the whole attack. Treat closing it as one input to [detecting attacks](./detecting-attacks.md): a spike in `REGISTER` attempts or `RESET_PASSWORD_ERROR` / `user_not_found` events is someone probing for valid accounts, usually just before a stuffing or spraying run.

## On a Phase Two hosted cluster

| We provide | You configure |
|---|---|
| A web application firewall with per-IP [rate limits](./rate-limiting.md) by tier, which slows bulk enumeration from one source | A CAPTCHA that fails closed on registration. The [Turnstile](./turnstile.md) and [reCAPTCHA](./recaptcha.md) options are included in every cluster and off until you configure them |
| Registration and reset events captured into the Phase Two [audit log](/docs/audit-logs), where probing shows up | Whether self-registration is on, and your `duplicateEmailsAllowed` / `registrationEmailAsUsername` / `loginWithEmailAllowed` choices |
| [IP restrictions](../self-service/restrictions.md) for public paths on Enterprise | Keeping your login and reset flows on the default, non-leaking behavior when you customize them |
| [Metrics](../self-service/metrics.md) and [logs](../self-service/logs.md) in the dashboard to spot probing | Monitoring registration-attempt volume |

## Related

- [Credential Stuffing and Account Takeover](./credential-stuffing.md)
- [Password Spraying](./password-spraying.md)
- [Email Bombing and Registration Abuse](./email-abuse.md)
- [Layer 7 floods](./layer-7-floods.md)
- [Securing Keycloak in production](./index.md)
