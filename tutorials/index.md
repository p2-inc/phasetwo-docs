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
4. [Use kcadm.sh: the Keycloak admin CLI](/tutorials/getting-started/admin-cli/)

**Securing an application** — get a token, then learn to trust it:

1. [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/)
2. [Validating Keycloak tokens in any backend](/tutorials/securing-applications/validating-tokens/)
3. [Spring Boot Keycloak authentication](/tutorials/securing-applications/spring-boot/)

More framework-by-framework guides are next. *(Coming soon.)*

**Registering an application** — which kind of client it needs, and what the server does
when you pick wrong:

1. [Your first realm, client, and user](/tutorials/getting-started/first-realm-client-user/)
2. [Keycloak client types: public, confidential, bearer-only](/tutorials/clients/oidc-client-types/)
3. [Validating Keycloak tokens in any backend](/tutorials/securing-applications/validating-tokens/)

Protocol mappers, client scopes and service accounts build on the second one.
*(Coming soon.)*

**Deciding who may do what** — the four ways Keycloak models permissions, and what each one
puts in the token:

1. [Keycloak roles, composite roles, and groups](/tutorials/authorization/roles-and-groups/)
2. [Keycloak protocol mappers: a complete field guide](/tutorials/clients/protocol-mappers/) —
   how any of that reaches the token
3. [Spring Boot Keycloak authentication](/tutorials/securing-applications/spring-boot/)
4. [Keycloak fine-grained admin permissions V2](/tutorials/admin/fine-grained-permissions-v2/)

Client scopes and fine-grained authorization build on the same objects. *(Coming soon.)*

**Adding a second factor, or dropping the password** — turn MFA on for everyone, not just
the people who opt in, then go passwordless:

1. [Set up TOTP multi-factor authentication](/tutorials/authentication/totp-mfa/)
2. [Passkeys and WebAuthn in Keycloak](/tutorials/authentication/passkeys-webauthn/)
3. [Build a custom Keycloak authentication flow](/tutorials/authentication/custom-flows/)

Step-up authentication and magic links are next. *(Coming soon.)*

**Working with tokens** — what a JWT is, how to read one, and how to handle them safely:

1. [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/)
2. [Decoding a JWT — header, payload, and signature](/tutorials/jwts/decoding-jwt-structure/)
3. [JWT security best practices](/tutorials/jwts/jwt-security-best-practices/)
4. [Benefits and drawbacks of JWTs](/tutorials/jwts/jwt-benefits-drawbacks/)
5. [Keycloak protocol mappers: a complete field guide](/tutorials/clients/protocol-mappers/) —
   how a claim gets into a token in the first place
6. [Keycloak session and token timeouts, explained](/tutorials/sessions/timeouts/)

Paste a token into our free [JWT decoder](/tools/jwt-decoder/) while you read.

**Storing data on a user** — what Keycloak will and will not keep on an account, and why a
custom attribute goes missing:

1. [Your first realm, client, and user](/tutorials/getting-started/first-realm-client-user/)
2. [Keycloak managed vs unmanaged attributes](/tutorials/users/user-profile/)
3. [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/)
4. [What personal data Keycloak stores, and how to erase it](/tutorials/users/personal-data-gdpr/)

Validators, progressive profiling and the registration form build on the second one.
*(Coming soon.)*

**Provisioning users from an identity provider** — SSO gets people in; provisioning keeps the
account list honest:

1. [SCIM explained: what it is and when you need it](/blog/scim-explained/)
2. [Keycloak SCIM API: enable it and connect a client](/tutorials/scim/getting-started/)
3. [Keycloak SCIM filtering, pagination, and search](/tutorials/scim/filtering/)

Mapping attributes to SCIM schemas and extensions is next. *(Coming soon.)*

**Automating the user lifecycle** — joiners, movers and leavers without a script on a cron:

1. [Keycloak Workflows: what they are and your first one](/tutorials/workflows/getting-started/)
2. [Automate user onboarding with a Keycloak workflow](/tutorials/workflows/user-onboarding/)
3. [Automate Keycloak offboarding and deprovisioning](/tutorials/workflows/user-offboarding/)

Inactivity policies build on the same engine. *(Coming soon.)*

**Designing for multiple tenants** — one customer per realm, per group, or per organization:

1. [Your first realm, client, and user](/tutorials/getting-started/first-realm-client-user/)
2. [Keycloak multi-tenancy: realms, groups, or organizations?](/tutorials/authorization/multi-tenancy/)
3. [Keycloak SCIM API: enable it and connect a client](/tutorials/scim/getting-started/)

What each tenant model puts in the token is
[protocol mappers](/tutorials/clients/protocol-mappers/). Client scopes and fine-grained
authorization build on the same track. *(Coming soon.)*

**Delegating realm administration** — give someone admin rights over part of a realm without
giving them the realm:

1. [Your first realm, client, and user](/tutorials/getting-started/first-realm-client-user/)
2. [Keycloak fine-grained admin permissions V2](/tutorials/admin/fine-grained-permissions-v2/)
3. [Use kcadm.sh: the Keycloak admin CLI](/tutorials/getting-started/admin-cli/) — how to
   grant that scoped role, and everything else, from a script

Realm keys and auditing build on the same track. *(Coming soon.)*

**Authorizing AI agents and MCP servers** — the tokens an agent presents, and what your
server has to check before trusting one:

1. [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/)
2. [Validating Keycloak tokens in any backend](/tutorials/securing-applications/validating-tokens/)
3. [Secure an MCP server with Keycloak](/tutorials/emerging/mcp-server-auth/)

Token exchange and agent delegation build on the same audience rules. *(Coming soon.)*

**Extending Keycloak with your own code** — when the configuration runs out, a provider jar
is the next step:

1. [Run Keycloak locally in 5 minutes](/tutorials/getting-started/run-keycloak-locally/)
2. [Build a custom Keycloak authentication flow](/tutorials/authentication/custom-flows/) —
   how far you get without writing any code
3. [Your first Keycloak SPI: build, package, deploy](/tutorials/extending/first-spi/)

Custom authenticators, event listeners, user storage and REST endpoints all build on that
last one. *(Coming soon.)*

**Getting your data back out** — what an export actually contains, and proving you could
leave:

1. [Export a Keycloak realm, users, and credentials](/tutorials/data-protection/exit-export/)
2. [What personal data Keycloak stores, and how to erase it](/tutorials/users/personal-data-gdpr/)
3. [Use kcadm.sh: the Keycloak admin CLI](/tutorials/getting-started/admin-cli/)

Event retention and realm key management build on the same track. *(Coming soon.)*

**Running Keycloak in production** — sizing, backups, upgrades, observability. *(Coming soon.)*

## A note on scope

These tutorials cover Keycloak itself. Where a capability is not in core Keycloak — magic
links, per-organization SCIM endpoints, multi-tenant organizations in older versions — we say
so plainly and point at the open-source extension, rather than pretending the gap isn't
there.

Something missing or wrong? The edit link on every page goes to the repository.
