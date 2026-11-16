# Phase Two Website and Documentation

<!-- phasetwo:banner:start - managed by p2-inc/shared-github-actions, edit there -->
[![docs](https://img.shields.io/badge/docs-phasetwo.io-blue)](https://phasetwo.io/docs/introduction/)

📚 [Documentation](https://phasetwo.io/docs/introduction/) • 🚀 [Hosted Keycloak](https://dash.phasetwo.io/?utm_source=github&utm_medium=readme&utm_campaign=phasetwo-docs) • 🤖 [Keycloak Skills](https://github.com/p2-inc/keycloak-skills) • 💬 [Support](mailto:support@phasetwo.io)

> [!TIP]
> **Run this in our cloud, no setup needed.** Phase Two hosts Keycloak with all of our extensions built in. [Try it free with your own cluster →](https://dash.phasetwo.io/?utm_source=github&utm_medium=readme&utm_campaign=phasetwo-docs)
>
> **Using a coding agent?** Add the Phase Two Keycloak skills ([launch post](https://phasetwo.io/blog/keycloak-skills-mcp-launch)) to Claude Code, Cursor or Codex so your agent can set up passwordless login, SSO, organizations and clusters for you:
>
> ```sh
> # Install the skills (connects to our hosted MCP server)
> claude plugin marketplace add p2-inc/keycloak-skills
> claude plugin install phasetwo@keycloak-skills
> # Or connect to the MCP server directly
> claude mcp add --transport http keycloak https://mcp.phasetwo.io/mcp
> ```
<!-- phasetwo:banner:end -->

![Build Status](https://github.com/p2-inc/phasetwo-docs/actions/workflows/deploy.yml/badge.svg)
[![pages-build-deployment](https://github.com/p2-inc/p2-inc.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/p2-inc/p2-inc.github.io/actions/workflows/pages/pages-build-deployment)

Content for the https://phasetwo.io/ public website, documentation and API specs.

All content is Copyright 2023 Phase Two, Inc.

[![License: CC BY-NC-ND 4.0](https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-nd.png)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

Contributions and corrections are welcome as pull requests.

## Website

This website is built using [Docusaurus 3](https://docusaurus.io/), a modern static website generator.

## Deploying

The site is served by a Cloudflare Worker with static assets (`wrangler.jsonc`), built and deployed by Workers Builds, Cloudflare's git integration. A push to `main` deploys to production; every other branch gets a preview URL, linked from the pull request.

The build settings live in the Cloudflare dashboard (Workers & Pages → `phasetwo-docs` → Settings → Build), not in this repo:

- **Build command:** `git fetch --unshallow || true; pnpm install --frozen-lockfile && pnpm regen-api-docs && pnpm build`. Workers Builds clones shallowly, and Docusaurus takes each page's last-modified date from git history for the sitemap, so the build fetches the full history first.
- **Build variable:** `GTM_CONTAINER_ID`, the Google Tag Manager container read by `docusaurus.config.js`. Unset, the site builds without the tag.

The `deploy.yml` GitHub Actions workflow still builds and tests every pull request, and publishes to GitHub Pages while the Worker is being verified.
