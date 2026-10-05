---
id: nuxt
title: Nuxt
---

This example uses [Nuxt](https://nuxt.com/) 4. There are a couple methods by which you can integrate Keycloak to your Nuxt application. We're going to explore two methods here, one uses [`keycloak-js`](https://www.keycloak.org/securing-apps/javascript-adapter) and the other leverages [`oidc-client-ts`](https://authts.github.io/oidc-client-ts/). The `keycloak-js` library provides a simple, client-only method, but lacks some of the sophistication provided by the `oidc-client-ts` library that is heavily supported and more widely used.

View a live deployed version for [keycloak-js](https://phasetwo-nuxt-keycloakjs-example.vercel.app/) and [oidc-client-ts](https://phasetwo-nuxt-oidc-example.vercel.app/).

Both examples render in the browser (`ssr: false`) and log users in with the authorization code flow and PKCE. You need [Node.js](https://nodejs.org/) 24 and [pnpm](https://pnpm.io/).

:::info
Both examples need a public OIDC client, without a client secret: client authentication off, the standard flow enabled, `http://localhost:3000/*` as valid redirect URI, and `+` as web origin and as valid post logout redirect URI. Both run on port 3000, so one client works for both.
:::

### Nuxt with `keycloak-js`

1. Clone the Phase Two [example repo](https://github.com/p2-inc/examples/).
1. Open the Nuxt [folder](https://github.com/p2-inc/examples/tree/main/frameworks/nuxt) within `/frameworks/nuxt` and open the `keycloak-js` folder within `/frameworks/nuxt/keycloak-js`.
1. Point the app at your Keycloak. The defaults in `nuxt.config.ts` point at the hosted Phase Two demo realm:

   ```ts
   runtimeConfig: {
     public: {
       keycloakUrl: "https://app.phasetwo.io/auth",
       keycloakRealm: "p2examples",
       keycloakClientId: "nuxt-example",
     },
   },
   ```

   Nuxt overrides them with the matching environment variables: `NUXT_PUBLIC_KEYCLOAK_URL`, `NUXT_PUBLIC_KEYCLOAK_REALM` and `NUXT_PUBLIC_KEYCLOAK_CLIENT_ID`. To use the [local Keycloak](https://github.com/p2-inc/examples/blob/main/keycloak/README.md) from the examples repo, copy the example file:

   ```bash
   cp .env.example .env
   ```

   `.env` points the app at the local Keycloak and its `nuxt-example` client:

   ```bash
   NUXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080/auth
   NUXT_PUBLIC_KEYCLOAK_REALM=p2examples
   NUXT_PUBLIC_KEYCLOAK_CLIENT_ID=nuxt-example
   ```

   For another Keycloak, create `.env` the same way. keycloak-js takes the Keycloak URL and the realm separately, so split your realm's issuer URL, `https://<your-keycloak-host>/auth/realms/<your-realm>`: set `NUXT_PUBLIC_KEYCLOAK_URL` to `https://<your-keycloak-host>/auth` and `NUXT_PUBLIC_KEYCLOAK_REALM` to `<your-realm>`. Set `NUXT_PUBLIC_KEYCLOAK_CLIENT_ID` to the ID of your client.

1. Run `pnpm install` and then `pnpm dev`, and open [localhost:3000](http://localhost:3000). [`keycloak-js`](https://www.keycloak.org/securing-apps/javascript-adapter) is a JavaScript library that provides a fast way to secure an application.
1. The project makes use of the following Nuxt items, all in the `app/` folder: components, composables, layouts, pages and plugins. We'll review the ones that handle the login.
1. The main component that shows the user's authenticated state is in `app/components/UserStatus.vue`. In this component we call the `useKeycloak` composable, which returns the login state and the `login` and `logout` functions that we've wrapped to make easily available.

   ```ts
   const { state, login, logout } = useKeycloak();
   ```

   Lower in the file the component leverages `v-if` checks on `state.authenticated` and `state.error`. Depending on the state, it shows the user's name and email with a Log out button, an error, or a Log in button. The `TokenPanels` component shows the decoded tokens.

1. Let's take a look at the setup for the composable next. Our composable is in `app/composables/useKeycloak.ts`. A composable is a function defined that can be called anywhere in the Nuxt application. It's a good way to abstract logic to be reused. In our case `useKeycloakState()` holds the authenticated state with `useState`, and `useKeycloak()` wraps the `keycloak-js` adapter that the plugin provides (more on that in the next step).

   ```ts
   import type { KeycloakTokenParsed } from "keycloak-js";

   type KeycloakState = {
     authenticated: boolean;
     tokenParsed?: KeycloakTokenParsed;
     idTokenParsed?: KeycloakTokenParsed;
     error?: string;
   };

   export const useKeycloakState = () =>
     useState<KeycloakState>("keycloak", () => ({ authenticated: false }));

   export function useKeycloak() {
     const { $keycloak } = useNuxtApp();

     return {
       state: useKeycloakState(),
       login: () => $keycloak.login(),
       logout: () =>
         $keycloak.logout({ redirectUri: `${window.location.origin}/` }),
     };
   }
   ```

   `logout` ends the Keycloak session and sends the user back to the app.

1. In the plugin, `app/plugins/keycloak.client.ts`, we instantiate the `keycloak-js` adapter with the values from the runtime config. We then provide that instance to the app as `$keycloak`.

   ```ts
   import Keycloak from "keycloak-js";

   export default defineNuxtPlugin(async () => {
     const { keycloakUrl, keycloakRealm, keycloakClientId } =
       useRuntimeConfig().public;
     const keycloak = new Keycloak({
       url: keycloakUrl,
       realm: keycloakRealm,
       clientId: keycloakClientId,
     });
     const state = useKeycloakState();

     const sync = () => {
       state.value = {
         ...state.value,
         authenticated: keycloak.authenticated === true,
         tokenParsed: keycloak.tokenParsed,
         idTokenParsed: keycloak.idTokenParsed,
       };
     };

     keycloak.onAuthSuccess = sync;
     keycloak.onAuthRefreshSuccess = sync;
     keycloak.onAuthLogout = sync;
     keycloak.onTokenExpired = () => {
       keycloak.updateToken(30).catch(() => {
         keycloak.clearToken();
         sync();
       });
     };

     try {
       await keycloak.init({
         onLoad: "check-sso",
         silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
         pkceMethod: "S256",
         checkLoginIframe: false,
       });
     } catch (error) {
       state.value = {
         ...state.value,
         error:
           error instanceof Error
             ? error.message
             : "Could not initialize keycloak-js",
       };
     }
     sync();

     return { provide: { keycloak } };
   });
   ```

   Nuxt waits for the plugin before it renders the app, so the logged-out UI doesn't flash while keycloak-js starts. With `check-sso`, keycloak-js logs the user in only if they already have a Keycloak session. It checks in a hidden iframe that loads `public/silent-check-sso.html`, so the page doesn't reload:

   ```html
   <!doctype html>
   <html>
     <body>
       <script>
         parent.postMessage(location.href, location.origin);
       </script>
     </body>
   </html>
   ```

   When the access token expires, the plugin refreshes it with `updateToken`. The event handlers copy the adapter's state into `useKeycloakState()`, so the components update.

1. The logic for checking the `authenticated` state can be used to expand in ways to secure your site in a number of ways.

### Nuxt with `oidc-client-ts`

The [`oidc-client-ts`](https://authts.github.io/oidc-client-ts/) package is a well-maintained and used library. It provides a lot of utilities for building out a fully production app.

1. Clone the Phase Two [example repo](https://github.com/p2-inc/examples/).
1. Open the Nuxt [folder](https://github.com/p2-inc/examples/tree/main/frameworks/nuxt) within `/frameworks/nuxt` and open the `oidc-client-ts` folder within `/frameworks/nuxt/oidc-client-ts`.
1. Point the app at your Keycloak. The defaults in `nuxt.config.ts` point at the hosted Phase Two demo realm:

   ```ts
   runtimeConfig: {
     public: {
       oidcIssuerUri: "https://app.phasetwo.io/auth/realms/p2examples",
       oidcClientId: "nuxt-oidc-client-ts-example",
     },
   },
   ```

   Nuxt overrides them with the matching environment variables: `NUXT_PUBLIC_OIDC_ISSUER_URI` and `NUXT_PUBLIC_OIDC_CLIENT_ID`. To use the [local Keycloak](https://github.com/p2-inc/examples/blob/main/keycloak/README.md) from the examples repo, copy the example file:

   ```bash
   cp .env.example .env
   ```

   `.env` points the app at the local Keycloak and its `nuxt-oidc-client-ts-example` client:

   ```bash
   NUXT_PUBLIC_OIDC_ISSUER_URI=http://localhost:8080/auth/realms/p2examples
   NUXT_PUBLIC_OIDC_CLIENT_ID=nuxt-oidc-client-ts-example
   ```

   For another Keycloak, create `.env` the same way, and set `NUXT_PUBLIC_OIDC_ISSUER_URI` to your realm's issuer URL and `NUXT_PUBLIC_OIDC_CLIENT_ID` to the ID of your client.

1. Run `pnpm install` and then `pnpm dev`, and open [localhost:3000](http://localhost:3000).
1. The structure of the project is similar to the `keycloak-js` version but with the use of a store and a middleware.
1. We'll review where we configure the OIDC client. Open the plugin `app/plugins/oidc.client.ts`. It creates a single `UserManager` from the runtime config and provides it to the app as `$userManager`. The `UserManager` is the `oidc-client-ts` object that logs users in and out.

   ```ts
   import { UserManager } from "oidc-client-ts";

   export default defineNuxtPlugin(() => {
     const { oidcIssuerUri, oidcClientId } = useRuntimeConfig().public;

     const userManager = new UserManager({
       authority: oidcIssuerUri,
       client_id: oidcClientId,
       redirect_uri: `${window.location.origin}/auth`,
       silent_redirect_uri: `${window.location.origin}/silent-refresh`,
       post_logout_redirect_uri: `${window.location.origin}/`,
       scope: "openid profile email",
     });

     return { provide: { userManager } };
   });
   ```

   `oidc-client-ts` logs users in with the authorization code flow and PKCE. It keeps the tokens in session storage and renews them before they expire.

1. We leverage the [`pinia`](https://pinia.vuejs.org/) library to store the user information and make it easily accessible. Open `app/stores/auth.ts`. From within this file, we wrap the `User` object exposed by the `oidc-client-ts` package, which the `UserManager` events keep up to date. The store also exposes `signIn`, `signOut` and the handlers for the login callbacks.

   ```ts
   import type { User } from "oidc-client-ts";

   export const useAuthStore = defineStore("auth", () => {
     const { $userManager } = useNuxtApp();
     const user = shallowRef<User | null>(null);
     const error = shallowRef<string | null>(null);
     let initialized = false;

     $userManager.events.addUserLoaded((loadedUser) => {
       user.value = loadedUser;
       error.value = null;
     });
     $userManager.events.addUserUnloaded(() => {
       user.value = null;
     });
     $userManager.events.addSilentRenewError((renewError) => {
       error.value = renewError.message;
     });

     async function init() {
       if (initialized) {
         return;
       }
       initialized = true;
       const storedUser = await $userManager.getUser();
       user.value = storedUser && !storedUser.expired ? storedUser : null;
     }

     function signIn() {
       return $userManager.signinRedirect({
         state: { returnTo: window.location.pathname },
       });
     }

     function signOut() {
       return $userManager.signoutRedirect();
     }

     async function handleCallback() {
       const signedInUser = await $userManager.signinCallback();
       const state = signedInUser?.state as { returnTo?: string } | undefined;
       return state?.returnTo ?? "/";
     }

     function handleSilentCallback() {
       return $userManager.signinSilentCallback();
     }

     function setError(authError: unknown) {
       error.value =
         authError instanceof Error ? authError.message : String(authError);
     }

     return {
       user,
       error,
       init,
       signIn,
       signOut,
       handleCallback,
       handleSilentCallback,
       setError,
     };
   });
   ```

   `signIn` sends the current path along with the login, and `handleCallback` returns it, so the user comes back to the page they started from. `signOut` also ends the Keycloak session.

1. There are a couple of pages in play here that the library leverages during the login. `app/pages/auth.vue` completes the login when Keycloak redirects back to `/auth`, and `app/pages/silent-refresh.vue` handles silent renewals on `/silent-refresh`. For instance in `app/pages/auth.vue`:

   ```vue
   <script setup lang="ts">
   const auth = useAuthStore();
   const router = useRouter();

   onMounted(async () => {
     try {
       await router.replace(await auth.handleCallback());
     } catch (callbackError) {
       auth.setError(callbackError);
       await router.replace("/");
     }
   });
   </script>
   ```

1. We have also created a middleware file in `app/middleware/auth.global.ts`. Nuxt runs it before every route, and it loads the stored user into the store before the first page renders.

   ```ts
   export default defineNuxtRouteMiddleware(async () => {
     await useAuthStore().init();
   });
   ```

1. Now that we have all the things set up, the component `app/components/UserStatus.vue` reads the user from the store. `storeToRefs` keeps `user` and `error` reactive.

   ```ts
   const auth = useAuthStore();
   const { user, error } = storeToRefs(auth);
   ```

   With this, the user object is now easily available. A simple `v-if="user"` allows the app to determine what UI to show, and the buttons call `auth.signIn()` and `auth.signOut()`.

1. A bit more complicated of a setup, but more elegant in the handling of the logged in flow. The `oidc-client-ts` library allows for much better fine-tuning of the experience.
