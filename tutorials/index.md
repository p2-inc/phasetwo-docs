---
id: index
title: Keycloak Tutorials
description: Practical, tested Keycloak tutorials — every one runs on plain open-source Keycloak, with the admin console and CLI steps side by side.
keywords: [keycloak tutorials, keycloak guide, how to use keycloak, keycloak how to]
---

# Keycloak Tutorials

Task-oriented guides for open-source Keycloak. Every tutorial here runs on a plain
`quay.io/keycloak/keycloak` container — nothing on this page requires a Phase Two account.

The official [Keycloak documentation](https://www.keycloak.org/documentation) is thorough and
we link to it constantly. What it is not is task-oriented: it is organized around the
software's features and it tells you what each option *does*, rarely what to set it to, in
what order, or what breaks when you get it wrong. These tutorials are the other half.

## What each tutorial gives you

- **A copy-pasteable start.** A `docker run` that gets you a working Keycloak in 30 seconds.
- **Both ways to do it.** The admin console clicks *and* the equivalent `kcadm.sh`, because
  one is how you learn it and the other is how you ship it.
- **A way to check it worked.** A concrete verification step, not "you should now see…".
- **The failure modes.** The three or four ways it actually goes wrong, and how to tell which
  one you hit.
- **A version.** Every tutorial states the Keycloak version it was tested against.

## Learning paths

**New to Keycloak** — start here, in order:

1. [Run Keycloak locally in 5 minutes](/tutorials/getting-started/run-keycloak-locally/)
2. [Your first realm, client, and user](/tutorials/getting-started/first-realm-client-user/)
3. [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/)

**Securing an application** — get a token, then learn to trust it:

1. [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/)
2. [Validating Keycloak tokens in any backend](/tutorials/securing-applications/validating-tokens/)
3. [Spring Boot Keycloak authentication](/tutorials/securing-applications/spring-boot/)

More framework-by-framework guides are next. *(Coming soon.)*

**Adding a second factor** — turn MFA on for everyone, not just the people who opt in:

1. [Set up TOTP multi-factor authentication](/tutorials/authentication/totp-mfa/)
2. [Build a custom Keycloak authentication flow](/tutorials/authentication/custom-flows/)
3. [Passkeys and WebAuthn with Keycloak](/blog/webauthn-keycloak/)

Step-up authentication and passwordless login are next. *(Coming soon.)*

**Working with tokens** — what a JWT is, how to read one, and how to handle them safely:

1. [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/)
2. [Decoding a JWT — header, payload, and signature](/tutorials/jwts/decoding-jwt-structure/)
3. [JWT security best practices](/tutorials/jwts/jwt-security-best-practices/)
4. [Benefits and drawbacks of JWTs](/tutorials/jwts/jwt-benefits-drawbacks/)
5. [Keycloak session and token timeouts, explained](/tutorials/sessions/timeouts/)

Paste a token into our free [JWT decoder](/tools/jwt-decoder/) while you read.

**Provisioning users from an identity provider** — SSO gets people in; provisioning keeps the
account list honest:

1. [SCIM explained: what it is and when you need it](/blog/scim-explained/)
2. [Keycloak SCIM API: enable it and connect a client](/tutorials/scim/getting-started/)

Filtering, pagination and schema mapping are next. *(Coming soon.)*

**Automating the user lifecycle** — joiners, movers and leavers without a script on a cron:

1. [Keycloak Workflows: what they are and your first one](/tutorials/workflows/getting-started/)

Onboarding, offboarding and inactivity policies build on that one. *(Coming soon.)*

**Running Keycloak in production** — sizing, backups, upgrades, observability. *(Coming soon.)*

## A note on scope

These tutorials cover Keycloak itself. Where a capability is not in core Keycloak — magic
links, per-organization SCIM endpoints, multi-tenant organizations in older versions — we say
so plainly and point at the open-source extension, rather than pretending the gap isn't
there.

Something missing or wrong? The edit link on every page goes to the repository.
