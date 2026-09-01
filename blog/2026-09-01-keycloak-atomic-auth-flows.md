---
title: "Atomic authentication flow updates for Keycloak, built with Gusto"
slug: keycloak-atomic-auth-flows
date: 2026-09-01
authors: [rtufisi]
tags:
  [
    phase_two,
    keycloak,
    authentication,
    authentication_flows,
    config_as_code,
    open_source,
  ]
description: A new open-source extension that imports Keycloak authentication flows, configs, and bindings in a single atomic transaction — built in partnership with Gusto and in production for almost a year.
draft: true
---

We're open-sourcing [`keycloak-atomic-auth-flows`](https://github.com/p2-inc/keycloak-atomic-auth-flows), a Keycloak extension that replaces an entire set of authentication flows, authenticator configs, and their bindings in **one atomic, transactional request**.

It was built in partnership with [Gusto](https://gusto.com/), who use Keycloak for user authentication and rely on Phase Two for enterprise Keycloak support. It has been running in their production environment for almost a year. The public repository is the extraction of that work into a standalone extension anyone can install.

<!-- truncate -->

## The problem: there is no transaction around a flow change

Authentication flows are the highest-stakes configuration in a Keycloak realm. If a flow is wrong, nobody logs in.

They are also the configuration that Keycloak gives you the least protection while changing. Both the admin console and the admin REST API mutate flows **incrementally**: adding an execution is one call, setting its requirement is another, reordering is another, creating a subflow and moving executions into it is several more. Each of those calls commits on its own, against a flow that is already bound as the realm's browser flow and already serving live login traffic.

That leaves a window — sometimes minutes long, if a human is clicking through the console — where the flow that real users are authenticating against is in a state nobody designed. A subflow that exists but is empty. A `REQUIRED` OTP execution added before its authenticator config. An `ALTERNATIVE` removed before its replacement was added. Every one of those intermediate states is a live flow, and some of them fail closed.

The usual workarounds don't close the window either:

- **Realm partial import** doesn't cover authentication flows in a way you can use for iterative updates.
- **Copy the built-in flow, edit the copy, re-bind** is the right instinct, and it's what careful operators do by hand. But it's a manual, multi-step, admin-console-driven process, and nothing about it is repeatable from a pipeline.
- **Full realm export/import** is far too blunt for a flow change and has its own consistency problems.

## What the extension does

The extension registers a realm admin REST resource that takes the whole flow tree as a single payload:

```
POST /admin/realms/{realm}/authentication-flow/import[?force=true]
Content-Type: application/json
```

The body carries everything needed for a complete change in one shot:

| Field                 | What it sets                                                                 |
| --------------------- | ---------------------------------------------------------------------------- |
| `authenticationFlows` | The flows to create, including all of their executions and subflows          |
| `authenticatorConfig` | The authenticator configs the executions reference                           |
| `browserFlowBinding`  | The flow to bind as the realm's browser flow                                 |
| `idpFlowBindings`     | Per-identity-provider first broker login and post broker login flow bindings |
| `clientFlowBinding`   | Per-client browser and direct grant flow overrides                           |

Three properties make this safe:

**It's one transaction.** Flows, configs, executions, and every binding are applied inside a single Keycloak transaction. Any failure — a dangling flow reference, a missing identity provider alias, an unknown client — rolls the entire import back. There is no half-applied flow, because there is no intermediate state visible to anyone outside the transaction. The caller needs `manage-realm`.

**Flows are versioned by content, not mutated.** The server hashes the flows and configs in the payload and prefixes every flow alias with that hash. An import never edits a flow that exists; it creates a new, independently-bindable set of flows and then moves the bindings onto them. The flow that was serving traffic a millisecond ago is untouched and still there.

**It's idempotent.** Because the aliases are derived from the payload's content hash, re-posting an identical tree is detected and rejected with `409 Conflict` rather than silently creating a duplicate set of flows. Pass `force=true` to re-apply the bindings over an already-imported tree. A pipeline can run the import on every deploy without accumulating garbage or needing to diff state first.

## Testing and rolling back

The content-hash model gives you two things that are genuinely hard with mutable flows.

**Canary a flow before it's the realm's flow.** An import can bind its new flow as a _per-client_ browser or direct grant override instead of the realm browser flow. The new flow is live and fully exercisable against one client — a staging app, an internal client, your own test harness — while every other client in the realm keeps authenticating against the current flow. Promote it by importing the same tree with the realm binding.

**Roll back by re-binding, not by re-editing.** A previous flow version is still present in the realm under its own hash prefix, with its executions and configs intact. Rolling back is re-posting that previous payload with `force=true`, which re-applies its bindings in one transaction. It's the same operation as rolling forward, it takes as long as one HTTP request, and it doesn't require reconstructing anything by hand in the admin console at 2am.

The tradeoff is deliberate and worth stating: imports are append-only in spirit, so old flow versions accumulate in the realm. That accumulation _is_ the rollback capability. Pruning old versions is a separate, deliberate act — not something an import does behind your back.

## Made for configuration as code

Once flow updates are a single idempotent request, flows become an ordinary config-as-code artifact. The repository ships a complete worked toolchain in [`examples/`](https://github.com/p2-inc/keycloak-atomic-auth-flows/tree/main/examples) that mirrors how this runs in a real deployment:

1. **Describe** the flows in a small Ruby DSL (`auth_flows_builder.rb`) — the hand-edited source of truth, held in git.
2. **Build** two generated artifacts from it: `auth_flows_tree.json`, the exact import payload, and `auth_flows_tree.txt`, a tree rendering that makes flow changes legible in a pull request diff:

   ```
   demo-browser/  ← browserFlow
   ├── [ALTERNATIVE] auth-cookie
   ├── [ALTERNATIVE] identity-provider-redirector
   └── [ALTERNATIVE] demo-browser-forms/  (subflow)
       ├── [REQUIRED] auth-username-password-form
       └── [CONDITIONAL] demo-browser-conditional-otp/  (subflow)
           ├── [REQUIRED] conditional-user-configured
           └── [REQUIRED] auth-otp-form
   ```

3. **Validate** the payload before it ships. The validator catches dangling subflow, config, and IdP references, orphaned flows, inconsistent executions, and authenticator ids that exceed Keycloak's column length — mistakes that would otherwise only surface at runtime.
4. **Apply** it with the update script, which posts the payload to the import endpoint. Safe to re-run.

Reviewing an auth flow change becomes reading a diff. Shipping it becomes one request that either fully lands or fully doesn't.

## Try it

You need Docker and Ruby — no JDK, no Maven, no Keycloak install:

```bash
git clone https://github.com/p2-inc/keycloak-atomic-auth-flows.git
cd keycloak-atomic-auth-flows

# Keycloak (dev mode) with the extension loaded and a minimal `demo` realm
docker compose up --build

# In another shell — import the demo flows via the new endpoint
ruby examples/scripts/update_auth_flows.rb
```

Then open the admin console at `http://localhost:8080` (admin / admin) → realm **demo** → _Authentication_, and you'll see the imported flows, alias-prefixed with their import hash, bound to the realm and to the demo identity provider. Run the script a second time to watch the `409`.

The extension targets **Keycloak 26.5.7**, builds with **JDK 21** and Maven, and is licensed **Apache 2.0**. Integration tests run against a real Keycloak via Testcontainers.

## Thanks to Gusto

This extension exists because Gusto needed to change authentication flows on a schedule their business required, with a risk profile their security posture demanded, and the stock tooling couldn't offer either. They funded and co-designed the work, ran it in production, and agreed to open-source it so the rest of the Keycloak community gets the same guarantees. We're grateful for the partnership.

---

Want to go deeper?

1. Read the code and docs: [github.com/p2-inc/keycloak-atomic-auth-flows](https://github.com/p2-inc/keycloak-atomic-auth-flows)
2. File issues and feature requests on the [issue tracker](https://github.com/p2-inc/keycloak-atomic-auth-flows/issues)
3. Reach out to our team: [support@phasetwo.io](mailto:support@phasetwo.io)
4. Talk to us about enterprise Keycloak support: [phasetwo.io/contact](https://phasetwo.io/contact)
