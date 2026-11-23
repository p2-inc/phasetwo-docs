---
title: "Why Phase Two uses oidc-spa, and how we harden our own dashboard"
slug: why-phase-two-uses-oidc-spa
date: 2026-11-23
authors: [jpatzer]
tags: [phase_two, keycloak, oidc_spa, oidc, security, react, dpop, open_source]
description: Why Phase Two builds its single-page apps on oidc-spa, how we set up early init, token substitution and a strict ID-token schema in our dashboard, and what your APIs need before you turn on DPoP.
keywords:
  [
    oidc-spa,
    keycloak spa login,
    keycloak react,
    spa token security,
    token substitution,
    browser runtime freeze,
    dpop keycloak,
    keycloak-js alternative,
  ]
---

Our dashboard is a single-page app. It's served as static files, every page requires a login, and it calls our APIs straight from the browser with an access token. That makes the browser the place where a stolen token would come from, so the OIDC library we pick matters more than it would for a server-rendered app. We use [oidc-spa](https://www.oidc-spa.dev/) for the dashboard and our other single-page apps. This post explains why, and walks through the hardening we did on the dashboard with oidc-spa 10.2.18, including a change of router that we didn't expect to make.

<!-- truncate -->

## Why oidc-spa

oidc-spa is an OpenID Connect client for browser apps. Like any good SPA library it does the authorization code flow with PKCE, renews tokens, restores sessions on reload and syncs login and logout across tabs. It keeps tokens in memory, not in `localStorage` or `sessionStorage`. What sets it apart is that it also hardens the page it runs in:

- **Early init** runs oidc-spa before any of your app's modules are evaluated, so its defenses are in place before third-party code gets a chance to run.
- **`browserRuntimeFreeze`** locks down `fetch`, `XMLHttpRequest`, `WebSocket`, `String`, `Promise` and the other built-ins a malicious dependency would patch to intercept a token.
- **`tokenSubstitution`** means app code never holds a usable token at all (more on that below).
- **DPoP** support binds the access token to a key held in the browser.

It works well with Keycloak, which is what we run, and it handles Keycloak specifics such as the account console and logout. Our dashboard, our internal tools and the [React example](https://github.com/p2-inc/examples/tree/main/frameworks/reactjs/oidc-spa) in our examples repo all use it.

The usual alternatives are good libraries, and we still document both. [keycloak-js](https://www.keycloak.org/securing-apps/javascript-adapter) is the Keycloak project's own adapter: Keycloak-specific, small, and familiar to anyone who has used Keycloak for a while. oidc-spa even ships a keycloak-js compatible API for teams that want to switch without rewriting. [oidc-client-ts](https://github.com/authts/oidc-client-ts) is a general, provider-neutral OIDC client with a lot of configuration, and with [react-oidc-context](https://github.com/authts/react-oidc-context) it's what our [React guide](/docs/securing-applications/react) shows first. Both handle the protocol well. Neither tries to protect the token from other code running in the same page, and that's the part we wanted a library to own.

## Why not Auth.js

We get asked about [Auth.js](https://authjs.dev) (formerly NextAuth.js) often enough that it deserves an answer. Auth.js is a server-side authentication library for frameworks like Next.js and SvelteKit. The server is the OIDC client: it handles the redirect, keeps the tokens, and gives the browser an `HttpOnly` session cookie, either an encrypted JWT or a pointer to a session in a database. The browser never holds an access token. That's the backend-for-frontend (BFF) pattern, and it's a sound choice when you already run a server framework.

Our dashboard doesn't. It's a logged-in-only SPA deployed as static assets, and it calls several APIs directly with access tokens. Adopting Auth.js would mean adding and operating a server just for authentication, then proxying every API call through it. A client-side library that hardens the browser fits that architecture better. If your app is server-rendered, the trade-off flips, and the oidc-spa docs say so themselves.

## About the maintainer

oidc-spa is written by [Joseph Garrone](https://www.linkedin.com/in/joseph-garrone-0b583490/), who also maintains [Keycloakify](https://www.keycloakify.dev/), the tool we and many others use to build Keycloak login themes in React. What stands out about his work is the care that goes into it: hard cases are handled rather than documented away, and the library is built to be solid enough for open-source platforms that real institutions depend on. One of those is [Onyxia](https://github.com/InseeFrLab/onyxia), an open-source, cloud-native web platform that gives data scientists a streamlined working environment on Kubernetes. It's developed by France's National Institute of Statistics and Economic Studies (INSEE) and supported by the Interministerial Digital Directorate (DINUM), and it removes the need for data professionals to manage complex cloud infrastructure by hand. Onyxia uses both oidc-spa and Keycloakify.

## Early init, and why the entry point matters

Every oidc-spa defense depends on one thing: it has to install before any other code runs. If a compromised dependency evaluates first, it can wrap `fetch` and read every token that passes through, and freezing the runtime afterward doesn't help.

With Vite, the oidc-spa plugin takes care of this. It wraps the module script in `index.html` so the browser runs oidc-spa's early init first, and only then imports your entry and the app with it:

```ts title="vite.config.ts"
import { oidcSpa } from "oidc-spa/vite-plugin";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    oidcSpa({
      browserRuntimeFreeze: { enabled: true },
      tokenSubstitution: {
        enabled: true,
        trustedExternalResourceServers: [/* see below */],
      },
    }),
  ],
});
```

Our dashboard used to run on React Router in framework mode with `ssr: false`. Framework mode doesn't give you a real client entry point: React Router generates the entry and loads your root module before oidc-spa's early init can run, so app code is already evaluated when the defenses go in. The [oidc-spa React Router guide](https://docs.oidc-spa.dev/v/v10/integration-guides/react-router) is direct about this: the security features "are not fully effective with React Router Framework", and there is no workaround.

So we moved the dashboard to [TanStack Router](https://tanstack.com/router) with a plain `index.html` that has a single module script, `src/main.tsx`. The diff touched most route files, but it was mechanical. The proof that it mattered was one line. We put `window.fetch = () => Promise.reject("patched")` at the top of the first module the app imports. Under framework mode the assignment succeeded. After the move it throws `oidc-spa: Blocked alteration of window.fetch`, because the runtime is already frozen by the time any of our code runs.

If you're starting a new SPA, use a plain Vite entry (TanStack Router, or React Router in declarative or data mode) and the oidc-spa Vite plugin. If you're on React Router framework mode, oidc-spa still works, but treat its defenses as partial.

## Token substitution

With `tokenSubstitution` on, the access and ID tokens your app code sees are placeholders. They carry the real header and claims, so you can still decode them to read `sub` or an expiry, but the signature is fake. A placeholder is useless to anyone who steals it.

The real token is attached at the network layer. When a request leaves the page through `fetch`, `XMLHttpRequest`, `WebSocket` or `sendBeacon`, oidc-spa swaps the real token in, but only if the destination is the app's own origin or a host on the allowlist. A request carrying the token to any other host is blocked with an error that names the host.

We decide the allowlist at build time and derive it from the same environment variables the app uses for its API base URLs, so a new environment can't drift from it:

```ts title="vite.config.ts"
import { loadEnv } from "vite";

// Hosts that may receive the user's tokens. Same-origin is always allowed.
function trustedResourceServers(env: Record<string, string>): string[] {
  const hosts = new Set<string>();
  for (const url of [env.VITE_OIDC_AUTH_URL, env.VITE_API_BASE_URL]) {
    if (url) hosts.add(new URL(url).hostname);
  }
  return [...hosts];
}

// in defineConfig(({ mode }) => ...):
oidcSpa({
  browserRuntimeFreeze: { enabled: true },
  tokenSubstitution: {
    enabled: true,
    trustedExternalResourceServers: trustedResourceServers(
      loadEnv(mode, process.cwd(), "VITE_"),
    ),
  },
}),
```

Entries are hostnames, either exact (`api.example.com`) or a subdomain wildcard (`*.example.com`). Keep them to hosts you control end to end. A wildcard like `*.amazonaws.com` or `*.workers.dev` would hand your users' tokens to anyone's bucket or worker. Two practical notes: host filtering is off on `localhost`, so test the allowlist on a deployed preview build, and anything that needs the raw token string (displaying it, or putting it in a request body for a token exchange) will break, so find those call sites before you turn it on.

## A strict ID-token schema

oidc-spa's React adapter lets you declare the shape of the ID token with a [zod](https://zod.dev/) schema. It parses every ID token against the schema, and a failure stops initialization. That sounds like a hazard. We think it's a feature: a token that doesn't match what the app expects fails loudly at login, in one place, instead of surfacing later as an empty name, a missing organization or a permission check that quietly denies.

So the schema should describe exactly the claims the app relies on, as precisely as the realm guarantees them. Claims the app needs are required, with exact types and nested shapes. A claim is optional only when the identity provider genuinely omits it for some users, and then the code handles its absence on purpose:

```ts title="src/oidc.ts"
import { oidcSpa } from "oidc-spa/react-spa";
import { z } from "zod";

const decodedIdTokenSchema = z.object({
  sub: z.string(),
  preferred_username: z.string(),
  name: z.string(),
  email: z.string().optional(), // some brokered users have no email
  // Phase Two organizations mapper: { [orgId]: { name, roles } }
  organizations: z.record(
    z.string(),
    z.object({ name: z.string(), roles: z.array(z.string()) }),
  ),
});

export const { bootstrapOidc, useOidc, getOidc, OidcInitializationGate } =
  oidcSpa
    .withExpectedDecodedIdTokenShape({
      decodedIdTokenSchema /* , decodedIdToken_mock */,
    })
    .withAutoLogin()
    .createUtils();
```

Use `z.object`, not `z.strictObject`. Keycloak adds claims you didn't ask for, such as `sid`, `acr` and `at_hash`, and `z.object` drops undeclared claims without rejecting the token. Avoid the lenient shortcuts too: `.catch()` fallbacks and loose objects let a broken mapper ship unnoticed.

Don't write the schema from memory. Turn on `debugLogs` and oidc-spa logs the decoded ID token before and after the parse on first init, which shows exactly which claim is missing or shaped differently. Check it with each kind of user you have: local accounts, each brokered identity provider, and a user with no organizations. Then keep the schema in sync with your Keycloak client scopes and mappers: a mapper change and the schema change belong in the same release.

## DPoP

Token substitution keeps the token away from app code. DPoP (Demonstrating Proof of Possession, [RFC 9449](https://www.rfc-editor.org/rfc/rfc9449.html)) makes a token that leaks anyway useless on its own. The client holds a private key in the browser, the authorization server binds the access token to that key, and every request carries a fresh signed proof. Without the key, a stolen token is rejected.

In oidc-spa it's one option:

```ts
oidcSpa({
  browserRuntimeFreeze: { enabled: true },
  DPoP: { enabled: true, mode: "auto" },
});
```

With `mode: "auto"`, oidc-spa uses DPoP when the authorization server advertises it and falls back to Bearer tokens when it doesn't. Keycloak has [supported DPoP officially since 26.4](https://www.keycloak.org/2025/10/dpop-support-26-4). Your app code keeps writing `Authorization: Bearer <token>`; oidc-spa rewrites the request to `Authorization: DPoP <token>` and adds a `DPoP` proof header.

The client side is easy. The work is in every API that receives the token, and it has to be done first. Each one must:

- Accept the `DPoP` authorization scheme, and accept access tokens whose `typ` claim is `DPoP` (Keycloak sets it on bound tokens), not only `Bearer`.
- Allow the `DPoP` request header in CORS preflight responses.
- Verify the proof as RFC 9449 describes: signature, `htm` and `htu` matching the request, `ath` matching the token, a fresh `iat`, a `jti` not seen before, and the key thumbprint matching the token's `cnf.jkt`. Verify it once per request. A framework that authenticates the same request twice will see its own `jti` as a replay.
- Reject a DPoP-bound token sent with the `Bearer` scheme or without a proof. Otherwise the binding protects nothing.

There's no per-host opt-out in the client. Once DPoP is on, every request oidc-spa decorates uses the DPoP scheme, whatever the host. The only escape hatch is a second oidc-spa client instance with `disableDPoP: true`, which means a second token lifecycle. In practice, every resource server on your allowlist has to be ready at the same time.

Two more things to measure before turning it on. The proof adds roughly half a kilobyte to a kilobyte to every request, so check your largest tokens against gateway header limits. Proofs are also time-stamped, so a user whose clock is minutes off will fail every API call even though login worked. Our [RFC 9700 guide](/docs/security/oauth-security-bcp#how-do-you-sender-constrain-tokens-with-dpop-or-mtls) covers the Keycloak side, and the same API checklist is [in our docs](/docs/security/oauth-security-bcp#what-must-apis-do-before-clients-use-dpop). A follow-up post will cover rolling DPoP out across a set of APIs.

## Smaller things that helped

**Match the login page to the app.** Pass UI hints to the Keycloak login page through an `extraQueryParams` getter. Our dashboard sends `?dark=true` or `?dark=false` when the user has picked a theme, which our Keycloakify login theme reads before first paint, so a dark-mode user doesn't get a white flash on the way to log in. The same getter is the place for `ui_locales`. Return nothing for silent requests, since the background session check renders no UI:

```ts
bootstrapOidc({
  implementation: "real",
  issuerUri: import.meta.env.VITE_OIDC_ISSUER_URI,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
  debugLogs: import.meta.env.VITE_OIDC_SPA_DEBUG === "true",
  extraQueryParams: ({ isSilent }): Record<string, string> => {
    if (isSilent) return {};
    let theme: string | null = null;
    try {
      theme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // storage blocked: let the login page use its default
    }
    return theme === "dark" || theme === "light"
      ? { dark: String(theme === "dark") }
      : {};
  },
});
```

**Watch analytics in `index.html`.** oidc-spa restores sessions in a hidden iframe that loads your `index.html`. A tag manager snippet inline in the HTML runs there too and can record page views that no user saw. Load analytics from app code, which never runs in the iframe, or guard the snippet with `window.self === window.top`.

**Use the debug logs while you set up.** Wire `debugLogs` to an environment variable like `VITE_OIDC_SPA_DEBUG`, as above. It logs initialization, token renewal and the ID-token parse. Keep it out of production builds, and redact the output before you paste it anywhere.

## Where to go next

- Our [React guide](/docs/securing-applications/react) has the current oidc-spa setup alongside oidc-client-ts.
- The [oidc-spa documentation](https://docs.oidc-spa.dev/) covers the security features, every framework adapter and backend token validation.
- The [React + oidc-spa example](https://github.com/p2-inc/examples/tree/main/frameworks/reactjs/oidc-spa) runs against a local Keycloak in a few minutes.

If you'd rather not run Keycloak yourself, [Phase Two hosts it](https://dash.phasetwo.io/) with our extensions built in.
