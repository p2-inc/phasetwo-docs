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

**Securing an application** — get a token, then learn to trust it. *(Coming soon.)*

**Running Keycloak in production** — sizing, backups, upgrades, observability. *(Coming soon.)*

## A note on scope

These tutorials cover Keycloak itself. Where a capability is not in core Keycloak — SCIM
server endpoints, magic links, multi-tenant organizations in older versions — we say so
plainly and point at the open-source extension, rather than pretending the gap isn't there.

Something missing or wrong? The edit link on every page goes to the repository.
