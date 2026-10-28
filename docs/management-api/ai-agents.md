---
id: ai-agents
title: AI agents (Keycloak Skills and MCP server)
sidebar_label: AI agents
description: Let an AI agent like Claude configure Keycloak on your Phase Two cluster with the open-source Keycloak Skills plugin and the Phase Two MCP server. Install in two commands; every call is authorized as you.
keywords:
  - keycloak mcp server
  - keycloak claude
  - keycloak ai agent
  - keycloak skills
---

# AI agents

Phase Two has two pieces that let an AI agent like Claude set up and change Keycloak for you:

- **[Keycloak Skills](https://github.com/p2-inc/keycloak-skills)**, an open-source Agent Skills plugin that teaches the agent how to configure Keycloak correctly: login flows, passwordless and passkeys, social and enterprise SSO, organizations, and securing your own apps.
- **The Phase Two MCP server** (`https://mcp.phasetwo.io/mcp`), which lets the agent do that work against your cluster directly instead of telling you what to type.

Ask in plain language, for example "add passwordless login by magic link", "connect our customer's Okta by email domain" or "add login to this React app", and the agent picks the right steps, asks what it needs, and makes the change.

## Install

In Claude Code:

```bash
claude plugin marketplace add p2-inc/keycloak-skills
claude plugin install phasetwo@keycloak-skills
```

Or inside a session: `/plugin marketplace add p2-inc/keycloak-skills`, then `/plugin install phasetwo`. Restart Claude Code afterwards, since skills load at session start.

The plugin sets up the MCP server for you. The first tool call opens a browser so you can sign in to Phase Two; check the connection any time with `/mcp`.

To add the MCP server on its own, without the skills:

```bash
claude mcp add --transport http keycloak https://mcp.phasetwo.io/mcp
```

## No cluster yet? Ask the agent for one {#no-cluster-yet}

You don't need a cluster before you start. With the plugin installed, ask the agent to "spin up a Phase Two cluster". It identifies you from your sign-in, finds the organization that will own the cluster, lets you pick a region and name, and creates a **Starter** cluster with a 30-day free trial. It gives you the checkout link to open and complete yourself, then waits until the cluster is active and offers to create your first realm.

From there, keep going in the same session: "now add passwordless login by magic link".

## What it can do on your cluster

On a Phase Two hosted cluster the MCP server covers:

| Area | Examples |
| --- | --- |
| Authentication flows | Create, copy and edit flows, add and reorder authenticators, bind flows to realms, clients and identity providers |
| Identity providers | Okta, generic OIDC and SAML, social login, mappers, linking an IdP to an organization |
| Clients and scopes | Register OIDC and SAML clients, rotate secrets, protocol mappers, explain why a claim is in a token |
| Users, roles and groups | Search and manage users, roles, groups, sessions and LDAP federation |
| Realm settings | Login and registration, SMTP, passkey policy, password policy, brute-force protection, themes |
| Organizations | Organizations, domains, members, roles and invitations |
| Events and webhooks | Event settings, webhook subscriptions and delivery attempts |
| Clusters | List and create clusters, custom domains, environment variables, IP rules and deployments |

The skills also work against any Keycloak, including self-managed ones, using the Keycloak Admin REST API with your own admin token instead of the MCP server.

## Security

- **Every call is made as you.** The MCP server holds no admin credentials of its own. It uses the token from your Phase Two sign-in, so your existing roles and permissions apply and the audit trail shows your user.
- **It won't delete clusters, deployments or realms.** Those deletions are irreversible, so they are refused and you are pointed to the dashboard instead. Changing a client that already serves traffic asks for your confirmation first.
- **It never enters payment details.** If the agent creates a cluster for you, it hands you the checkout link to complete yourself.

## Learn more

The [launch post](/blog/keycloak-skills-mcp-launch) has a video walkthrough, the full list of capabilities and how the skills are tested. Source, issues and requests for new skills are in the [keycloak-skills repository](https://github.com/p2-inc/keycloak-skills).
