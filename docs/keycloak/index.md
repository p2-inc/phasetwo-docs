---
id: index
title: Keycloak Introduction
description: What Keycloak is, the four concepts every other page assumes — realm, client, user and identity provider — and which Keycloak deployment model fits internal users, customers or partners.
keywords:
  - keycloak
  - what is keycloak
  - keycloak realm
  - keycloak client
  - open source iam
---

Keycloak is an open-source identity and access management server. It authenticates users,
issues tokens that applications trust, brokers to identity providers you do not own, and
centralises the user and permission model that would otherwise be duplicated in every service
you run. It is governed by the Apache License 2.0 and backed by Red Hat.

This section explains Keycloak itself — the product, its model and the jobs it does — rather
than how Phase Two runs it. If you are evaluating, start here; if you have already decided,
[Getting Started](../getting-started/index.md) is the faster path.

## Four concepts the rest of this section assumes

Almost every Keycloak question turns out to be a question about one of these four, and the
official documentation assumes you already have them.

| Concept | What it is | Why it matters |
|---|---|---|
| **Realm** | An isolated tenant: its own users, roles, clients, login pages and signing keys | Nothing crosses a realm boundary. Two realms share a server and nothing else |
| **Client** | An application that asks Keycloak to authenticate someone | Token lifetimes, redirect URIs, scopes and protocol are all per client |
| **User, group, role** | The account, the organisational unit it sits in, and the permission an application checks for | Groups carry roles; users join groups. Modelling it the other way round is the usual first mistake |
| **Identity provider** | An external system Keycloak delegates authentication to | How Google, an enterprise SAML IdP or another Keycloak becomes a login button |

A realm is not an abstraction — it is a URL prefix, and everything an application needs to
integrate hangs off it:

```bash
curl -s http://localhost:8080/realms/demo/.well-known/openid-configuration
```

```json
{
  "issuer": "http://localhost:8080/realms/demo",
  "authorization_endpoint": "http://localhost:8080/realms/demo/protocol/openid-connect/auth",
  "token_endpoint": "http://localhost:8080/realms/demo/protocol/openid-connect/token",
  "jwks_uri": "http://localhost:8080/realms/demo/protocol/openid-connect/certs",
  "end_session_endpoint": "http://localhost:8080/realms/demo/protocol/openid-connect/logout"
}
```

Every server ships with a `master` realm. It exists to administer the other realms — put your
applications and users in a realm of their own, not in `master`.

## Which job are you doing?

Keycloak covers three jobs that look similar and configure very differently. Picking the
wrong one is recoverable but expensive, because self-registration, password policy, session
length and login-page design all follow from it.

| Your users are | Read |
|---|---|
| Employees, contractors, internal staff | [Keycloak as an IAM system](./iam.md) — groups, roles, delegated administration, directory federation, joiner/mover/leaver |
| Customers of your product | [Keycloak for CIAM](./ciam.md) — self-registration, social login, consent, branded login at consumer volume |
| Partners or tenants bringing their own identity provider | [Keycloak as an IdP broker](./idp.md) — protocol translation, home-realm discovery, account linking |

Most deployments do more than one, usually in separate realms.

## The rest of this section

[Keycloak overview](./overview.md) is the full feature tour — SSO, identity brokering, MFA,
token-based authentication, federation, RBAC, the admin and account consoles, and theming.
[Keycloak account console](./account-console.md) covers the end-user self-service UI and, more
usefully, how to switch it off when your product should not expose it.

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```

## Then what?

The pages above are concepts. When you want to make something work, the
[Keycloak tutorials](/tutorials/) are task-level and vendor-neutral — they run on any
Keycloak, including one you installed yourself five minutes ago. Start with
[running Keycloak locally](/tutorials/getting-started/run-keycloak-locally/) and
[your first realm, client and user](/tutorials/getting-started/first-realm-client-user/).

When the question becomes who operates it, [managed Keycloak](/hosting/dedicated-clusters/) is
what we do, and [hosting](../hosting/index.md) covers running our images on your own
infrastructure instead.
