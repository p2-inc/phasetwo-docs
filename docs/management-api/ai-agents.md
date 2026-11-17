---
id: ai-agents
title: AI agents (Keycloak Skills and MCP server)
sidebar_label: AI agents
description: Let your coding agent (Claude Code, Cursor or Codex) configure Keycloak on your Phase Two cluster with the open-source Keycloak Skills plugin and the Phase Two MCP server. Install in two commands; every call is authorized as you.
keywords:
  - keycloak mcp server
  - keycloak claude
  - keycloak ai agent
  - keycloak skills
---

# AI agents

The **Phase Two plugin** lets your coding agent set up and change Keycloak for you. It works in Claude Code, Cursor and Codex, and installing it gives the agent two things:

- **[Keycloak Skills](https://github.com/p2-inc/keycloak-skills)**, open-source Agent Skills that teach the agent how to configure Keycloak correctly: login flows, passwordless and passkeys, social and enterprise SSO, organizations, and securing your own apps.
- **The Phase Two MCP server** (`https://mcp.phasetwo.io/mcp`), which lets the agent do that work against your cluster directly instead of telling you what to type. The plugin connects it for you; the only prompt you see is the Phase Two sign-in.

Ask in plain language, for example "add passwordless login by magic link", "connect our customer's Okta by email domain" or "add login to this React app", and the agent picks the right steps, asks what it needs, and makes the change.

## Let your agent set it up {#connect-your-agent}

Paste this into your coding agent and it installs the plugin for whichever client you are using, then signs you in:

```text
Install the Phase Two Keycloak plugin so you can set up and manage Keycloak on Phase Two for me.
The plugin is in the p2-inc/keycloak-skills marketplace on GitHub. It bundles the Keycloak skills and connects the Phase Two MCP server at https://mcp.phasetwo.io/mcp.
Install it for the coding agent I am using, then sign me in to the MCP server.
Setup guide: https://phasetwo.io/docs/management-api/ai-agents/
```

Or install it yourself with the steps below.

## Install

### Claude Code

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

### Codex

```bash
codex plugin marketplace add p2-inc/keycloak-skills
codex plugin add phasetwo@keycloak-skills
```

Codex runs the Phase Two sign-in as part of the install. Start a new Codex task afterwards so it picks up the skills and the MCP server.

### Cursor

Cursor 3.19 or later imports the plugin from GitHub: in the Cursor dashboard go to **Plugins → Team Marketplaces → Add Marketplace → Import from Repo**, enter `p2-inc/keycloak-skills` and add **Phase Two Keycloak**. Then open **Customize** in the Cursor sidebar, find **Phase Two Keycloak** and click **Install**. The first tool call opens a browser so you can sign in to Phase Two. The [Cursor install guide](https://github.com/p2-inc/keycloak-skills/blob/main/docs/install-cursor.md) has the details.

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
