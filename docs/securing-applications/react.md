---
id: react
title: React
---

Many SPAs use a framework such as [React](https://react.dev/) to simplify the creation of interactive experiences. We suggest the open source [react-oidc-context](https://github.com/authts/react-oidc-context) library, built on [oidc-client-ts](https://github.com/authts/oidc-client-ts), to make securing React applications easier. It logs users in with the authorization code flow and PKCE, keeps the tokens in session storage and refreshes them before they expire.

### Example

Phase Two has a [React project](https://github.com/p2-inc/examples/tree/main/frameworks/reactjs/oidc-client-ts) with sample code or view a [live deployed version](https://phasetwo-react-example.vercel.app/). The [React tutorial](/blog/instant-user-managemenet-and-sso-for-reactjs) walks through it step by step.

The app needs a public OpenID Connect client in Keycloak: client authentication off, the standard flow enabled with PKCE (S256), `http://localhost:3000/*` as valid redirect URI, and `+` as web origin and as valid post logout redirect URI. The [local Keycloak](https://github.com/p2-inc/examples/blob/main/keycloak/README.md) of the examples repo already has one, `reactjs-example`.

#### Configure the app

The example reads the issuer URL and the client ID from environment variables. For the local Keycloak, start it from the root of the examples repo with `docker compose -f keycloak/docker-compose.yml up -d --wait`, and run `cp .env.local.sample .env.local` in the example folder. The file holds:

```bash
VITE_OIDC_ISSUER_URI=http://localhost:8080/auth/realms/p2examples
VITE_OIDC_CLIENT_ID=reactjs-example
```

For another Keycloak, set `VITE_OIDC_ISSUER_URI` to your realm's issuer URL, `https://<your-keycloak-host>/auth/realms/<your-realm>`, and `VITE_OIDC_CLIENT_ID` to the ID of your client.

Then run `pnpm install` and `pnpm dev`, and open [localhost:3000](http://localhost:3000). On the local Keycloak, log in as `demo` / `demo`.

#### Set up the AuthProvider

Install the libraries:

```bash
pnpm add react-oidc-context oidc-client-ts
```

Then wrap the app in an `AuthProvider`. In `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import App from "./App.tsx";
import "./index.css";

const oidcConfig: AuthProviderProps = {
  authority: import.meta.env.VITE_OIDC_ISSUER_URI,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: `${window.location.origin}/`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  scope: "openid profile email",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
);
```

#### Use the hook

When a component requires access to the login state, use the `useAuth` hook. The example's `src/Auth.tsx` calls it and renders the page from what it returns:

- `auth.isLoading` is `true` while the library loads the user, and `auth.error` holds an authentication error;
- `auth.isAuthenticated` tells whether the user is logged in, and `auth.user?.profile` holds the claims of the ID token, such as `name` and `email`;
- `auth.signinRedirect()` sends the user to the Keycloak login page, and `auth.signoutRedirect()` logs them out of the app and of Keycloak.

The [react-oidc-context documentation](https://github.com/authts/react-oidc-context) describes the hook and how to protect routes.

### oidc-spa

[oidc-spa](https://www.oidc-spa.dev/) is the library Phase Two uses in its own single-page apps. Besides the authorization code flow with PKCE, token renewal and session restore, it hardens the page against code that tries to steal tokens. This section describes oidc-spa 10.x. Phase Two has an [oidc-spa example](https://github.com/p2-inc/examples/tree/main/frameworks/reactjs/oidc-spa), with a [live deployed version](https://phasetwo-react-oidcspa-example.vercel.app/), and the post [Why Phase Two uses oidc-spa](/blog/why-phase-two-uses-oidc-spa) explains how we set up our dashboard.

#### Start oidc-spa before the app with the Vite plugin

oidc-spa's defenses only work if they install before any other module runs. The Vite plugin does that: it wraps the module script in `index.html`, so the browser runs oidc-spa's early init first and only then imports your entry file and the app. Turn on the runtime freeze and token substitution in the same place:

```ts title="vite.config.ts"
import react from "@vitejs/plugin-react";
import { oidcSpa } from "oidc-spa/vite-plugin";
import { defineConfig, loadEnv } from "vite";

// Hosts that may receive the user's tokens. Same-origin is always allowed.
function trustedResourceServers(env: Record<string, string>): string[] {
  const hosts = new Set<string>();
  for (const url of [env.VITE_OIDC_AUTH_URL, env.VITE_API_BASE_URL]) {
    if (url) hosts.add(new URL(url).hostname);
  }
  return [...hosts];
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    oidcSpa({
      browserRuntimeFreeze: { enabled: true },
      tokenSubstitution: {
        enabled: true,
        trustedExternalResourceServers: trustedResourceServers(
          loadEnv(mode, process.cwd(), "VITE_"),
        ),
      },
    }),
  ],
}));
```

- **`browserRuntimeFreeze`** stops later code from replacing `fetch`, `XMLHttpRequest` and the other built-ins that could be patched to read a token. A library that patches these globals throws once they are frozen; `excludes` lists APIs to leave alone, as a last resort.
- **`tokenSubstitution`** gives app code placeholder tokens with the real claims and a fake signature. oidc-spa attaches the real token at the network layer, and only for requests to the app's own origin or to a host in `trustedExternalResourceServers`. Requests that carry the token to any other host are blocked.
- **Derive the allowlist at build time** from the same environment variables the app uses for its API URLs, as above. Entries are hostnames, exact (`api.example.com`) or a subdomain wildcard (`*.example.com`). Don't add broad wildcards such as `*.amazonaws.com`. Host filtering is off on `localhost`, so test the allowlist on a deployed build. Code that needs the raw token string, such as a token exchange that sends it in a request body, won't work with substitution on.

#### Choose a router with a real entry point

Keep `index.html` down to one module script, your `src/main.tsx`, so the plugin can wrap it. A plain Vite entry works with TanStack Router or with React Router in declarative or data mode. React Router in framework mode, even with `ssr: false`, has no real client entry point: app code loads before oidc-spa's early init, so the [oidc-spa React Router guide](https://docs.oidc-spa.dev/v/v10/integration-guides/react-router) warns that its security features are not fully effective there. Prefer a plain Vite entry for new apps.

#### Declare the ID token you expect

`withExpectedDecodedIdTokenShape` parses every ID token against a [zod](https://zod.dev/) schema, and a token that doesn't match stops initialization. Make the schema describe exactly the claims the app reads: required where the app needs the claim, with exact types, and optional only where your users really lack it. Use `z.object`, not `z.strictObject`, because Keycloak adds claims such as `sid` and `acr`.

```ts title="src/oidc.ts"
import { oidcSpa } from "oidc-spa/react-spa";
import { z } from "zod";

const decodedIdTokenSchema = z.object({
  sub: z.string(),
  preferred_username: z.string(),
  name: z.string(),
  email: z.string().optional(),
});

export const { bootstrapOidc, useOidc, getOidc, OidcInitializationGate } =
  oidcSpa
    .withExpectedDecodedIdTokenShape({
      decodedIdTokenSchema,
      decodedIdToken_mock: {
        sub: "mock-user",
        preferred_username: "john.doe",
        name: "John Doe",
        email: "john.doe@example.com",
      },
    })
    .createUtils();

bootstrapOidc({
  implementation: "real",
  issuerUri: import.meta.env.VITE_OIDC_ISSUER_URI,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
  debugLogs: import.meta.env.VITE_OIDC_SPA_DEBUG === "true",
});
```

With `debugLogs` on, oidc-spa logs the decoded ID token before and after the parse, which is the quickest way to check the schema against a real token. Keep the schema in step with the client scopes and mappers of your Keycloak client, and keep debug logs out of production builds.

#### Enable DPoP once your APIs support it

oidc-spa can bind access tokens to a key held in the browser with DPoP: add `DPoP: { enabled: true, mode: "auto" }` to the plugin options. Keycloak supports DPoP from 26.4. We recommend it, but only after every API that receives the token accepts DPoP, because the client has no per-host opt-out. [What API owners must do for DPoP](/docs/security/oauth-security-bcp#what-must-apis-do-before-clients-use-dpop) lists the requirements, and the [oidc-spa post](/blog/why-phase-two-uses-oidc-spa#dpop) explains the trade-offs.

The [oidc-spa tutorial](/blog/keycloak-oidc-spa-phasetwo) builds the example step by step with an earlier version of the library; the [oidc-spa documentation](https://docs.oidc-spa.dev/) is the reference for the current one.
