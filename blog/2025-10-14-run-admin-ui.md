---
title: Run the Keycloak Admin UI Locally (with Phase Two Extensions)
slug: run-admin-ui
date: 2025-10-14
authors: phasetwo
tags:
  [
    phase_two,
    hosting,
    open_source,
    keycloak,
    admin-ui,
    docker,
    extensions,
    dev-environment,
    pnpm,
  ]
description: Set up a fast local development environment for the Keycloak Admin UI and point it at a custom Keycloak image—perfect for iterating on extensions like Keycloak Organizations.
---

Developing custom additions to the Keycloak Admin UI can be fiddly and slow. At Phase Two we maintain several [popular community extensions](https://github.com/p2-inc#our-extensions-) that must track frequent Keycloak releases. Below is the approach we use to develop and verify Admin UI changes quickly against a running Keycloak image that includes our extensions.

<!-- truncate -->

## TL;DR

1. Clone our Keycloak fork and check out the matching Admin UI branch (e.g., `26.3.0_orgs_adminui`).
2. Replace the default server script with our custom one (details below).
3. Start a Phase Two Keycloak container with the Admin UI in dev mode:

```bash
pnpm start --admin-dev --phasetwo --tag=latest
```

4. In a second terminal, run the Admin UI dev server:

```bash
pnpm i && pnpm dev
```

Open <http://localhost:8080>. You’ll get auto-refresh and modern DX while the backend runs in Docker.

---

## Why this matters

The Admin UI is the control center for Keycloak. Customizing it is powerful, but it’s tightly coupled to the core codebase and evolves quickly. Running the UI in dev mode against **the exact server image** you ship (e.g., Phase Two’s extended image) lets you:

- Catch breaking changes early when Keycloak releases.
- Iterate on UI changes instantly (no re-building JARs between edits).
- Validate that your extensions render and behave correctly with real data.

Our [Keycloak Organizations](https://github.com/p2-inc/keycloak-orgs) extension, for example, adds new sections to the Admin Console. Each release we re-verify and adjust UI components; this workflow makes that practical.

## How the stock setup works (and why we tweak it)

Keycloak’s Admin UI is now a library inside the main repo. You can run it locally against a server, but the stock start script pulls the **nightly** image—great for core dev, not ideal when you need to test against a specific custom image.

To fix that, we use a small custom start script that runs a **Phase Two Keycloak container** (or any image—see below) and wires the Admin UI dev server to it.

## Prerequisites

- Node 20+
- `pnpm` 9+
- Docker Desktop / Docker 24+
- Ports **8080** (Keycloak) and **5174** (Admin UI) free

## Step-by-step

### 1) Get the right code

- Clone our fork and check out the branch that matches your Keycloak target (we don’t publish a branch for every upstream release):

```bash
# example
git clone https://github.com/p2-inc/keycloak.git
cd keycloak
git checkout 26.3.0_orgs_adminui
```

- Admin UI lives under `js/apps/admin-ui/`. The embedded server project lives under `js/apps/keycloak-server/`.

### 2) Swap in the custom start script

Copy the contents of `js/apps/admin-ui/src/phaseII/start-server-custom.js` into `js/apps/keycloak-server/scripts/start-server.js` **replacing its contents**.

> The custom script adds flags like `--phasetwo` and `--tag` and starts `quay.io/phasetwo/phasetwo-keycloak:<tag>` via Docker with the right dev env vars.

### 3) (If needed) Align the theme output name

Our Admin UI build emits a theme named `phasetwo.v2`. If your environment expects `keycloak.v2`, either:

- Duplicate the folder `theme/phasetwo.v2` and name it `keycloak.v2`, **or**
- Update `vite.config.ts` to output to `phasetwo.v2` and keep the server pointed at that name.

### 4) Start the server and the UI

- Start the server container + wire the UI dev endpoints:

```bash
cd js/apps/keycloak-server
pnpm start --admin-dev --phasetwo --tag=latest
```

- In another terminal, start the Admin UI dev server:

```bash
cd ../admin-ui
pnpm i
pnpm dev
```

Now open <http://localhost:8080>.

## Script flags

| Flag            | Type    | What it does                                                                     |
| --------------- | ------- | -------------------------------------------------------------------------------- |
| `--local`       | boolean | Use a local Quarkus dist (`keycloak-999.0.0-SNAPSHOT.tar.gz`) instead of Docker. |
| `--account-dev` | boolean | Points Account app to `http://localhost:5173` for dev.                           |
| `--admin-dev`   | boolean | Points Admin app to `http://localhost:5174` for dev (use this tutorial).         |
| `--phasetwo`    | boolean | Run `quay.io/phasetwo/phasetwo-keycloak` in Docker with dev-friendly flags.      |
| `--tag=<tag>`   | string  | Image tag to run (defaults to `latest`).                                         |

> Under the hood we enable features required by our extensions: `login:v2, account:v3, admin-fine-grained-authz:v2, transient-users, organization, oid4vc-vci, declarative-ui, quick-theme`.

## Troubleshooting

- **Port 8080 already in use** – Stop other Keycloak/containers or change the published port.
- **White screen / 404s in the Admin UI** – Make sure `--admin-dev` is set and the dev server is running on `5174`.
- **Missing strings/components** – Verify you’re on the matching Admin UI branch for your Keycloak version.
- **Theme not loading** – Ensure the output theme name (`phasetwo.v2` vs `keycloak.v2`) matches what the server expects.
- **Cannot pull image** – Confirm Docker can access `quay.io` and that the tag exists.

## Conclusion

This workflow keeps the Admin UI dev loop fast while staying faithful to the image you deploy. Although we demonstrate with Phase Two’s image, the same pattern works with any Keycloak distribution. If this saved you time, drop us a star ⭐️ on [GitHub](https://github.com/p2-inc).

---

Want to learn more? Log in to the [Phase Two Dash](https://dash.phasetwo.io) and try uploading your first resource today. This feature is included with all **dedicated cluster plans**. For questions, reach out to [support@phasetwo.io](mailto:support@phasetwo.io).
