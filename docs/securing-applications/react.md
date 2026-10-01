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

Phase Two also has an [oidc-spa example](https://github.com/p2-inc/examples/tree/main/frameworks/reactjs/oidc-spa), with a [live deployed version](https://phasetwo-react-oidcspa-example.vercel.app/). [oidc-spa](https://www.oidc-spa.dev/) is the library Phase Two uses in its own dashboards. Its Vite plugin starts it before the app loads and hardens the page against token theft. The [oidc-spa tutorial](/blog/keycloak-oidc-spa-phasetwo) builds the example step by step.
