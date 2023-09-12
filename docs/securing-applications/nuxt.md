---
id: nuxt
title: Nuxt
---

This example uses [Nuxt3](https://nuxt.com/). There are a couple methods by which you can integrate Keycloak to your Nuxt application. We're going to explore two methods here, one uses [`keycloak-js`](https://www.npmjs.com/package/keycloak-js) and the other leverages [`oidc-client-ts`](https://www.npmjs.com/package/oidc-client-ts). The `keycloak-js` library provides a simple, client-only method, but lacks some of the sophistication provided by the `oidc-client` library that is heavily supported and more widely used.

### Nuxt with `keycloak-js`

:::info
For this example, we need to disable "Client Authentication" in the OIDC client. This is available under Client > Settings > Capability config > Client authentication to OFF.
:::

1. Clone the Phase Two [example repo](https://github.com/p2-inc/examples/).
1. Open the Nuxt [folder](https://github.com/p2-inc/examples/tree/main/frameworks/nuxt) within `/frameworks/nuxt` and open the `keycloak-js` folder within `/frameworks/nuxt/keycloak-js`.
1. Run `npm install` and then `npm run dev`. [`keycloak-js`](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter) is a Javascript library that provides a fast way to secure an application.
1. The project makes use of the following Nuxt items: components, composables, layouts, and plugins. We'll review each in kind.
1. The main component that shows the User's authenticated state is in `/components/User`. In this component we call the `useKeycloak` composable, which let's us key into the `keycloak-js` functions that we've wrapped to make easily availble.

   ```javascript
   const { keycloak, authState } = useKeycloak();

   function login() {
     keycloak.login();
   }

   function logout() {
     keycloak.logout();
   }
   ```

   Lower in the file the component leverages `v-if` checks to determine if the `authState` is `authenticated` or not. Depending on the state, a Log in or Log out button is available.

1. Let's take a look at the setup for the composable next. Our composable is in `/composables/keycloak-c`. A composable is a function defined that can be called anywhere in the Nuxt application. It's a good way to abstract logic to be reused. In our case we use it to wrap a `keycloak-js` plugin (more on that in the next step) and help provided a state value for the authenticated state.

   ```javascript
   export const useKeycloak = () => {
     const nuxtApp = useNuxtApp();
     const keycloak = nuxtApp.$keycloak as Keycloak;
     const authState = useState("authState", () => "unAuthenticated");

     keycloak.onAuthSuccess = () => (authState.value = "authenticated");
     keycloak.onAuthError = () => (authState.value = "error");

     return {
       keycloak,
       authState,
     };
   };
   ```

1. In the plugin, `/plugins/keycloak.client.ts` we instantiate the `keycloak-js` library. We can then attach that instance to the `NuxtApp` instance. Substitute the correct values for your Keycloak instance that we created earlier in the tutorial.

   ```javascript
   export default defineNuxtPlugin((nuxtApp) => {
     const initOptions: KeycloakConfig = {
       url: "https://euc1.auth.ac/auth/",
       realm: "shared-deployment-001",
       clientId: "reg-example-1",
     };

     const keycloak = new Keycloak(initOptions);

     nuxtApp.$keycloak = keycloak;

     keycloak.init({
       onLoad: "check-sso",
     });
   });
   ```

1. The logic for checking the `authenticated` state can be used to expand in ways to secure your site in a number of ways.

### Nuxt with `oidc-client`

The [`oidc-client-ts`](https://www.npmjs.com/package/oidc-client-ts) package is a well-maintained and used library. It provides a lot of utilities for building out a fully production app.

1. Clone the Phase Two [example repo](https://github.com/p2-inc/examples/).
1. Open the Nuxt [folder](https://github.com/p2-inc/examples/tree/main/frameworks/nuxt) within `/frameworks/nuxt` and open the `/nuxt/oidc-client-ts` folder.
1. Run `npm install` and then `npm run dev`.
1. The structure of the project is similar to the `keycloak-js` version but with a the use of services, stores, and middleware.
1. We'll review where we configure out Keycloak instance. First open `/services/keycloak-config.ts`. In this file you will want to update it with the values for the Keycloak instance we set-up earlier in the tutorial. Make sure you are using the one with Client Authentication enabled. Update the `clientSecret` with the value. Use and environment variable here if you wish.

   ```json
   export const keycloakConfig = {
     authorityUrl: "https://euc1.auth.ac",
     applicationUrl: "http://localhost:3000",
     realm: "shared-deployment-001",
     clientId: "reg-example-1",
     clientSecret: "CLIENT_SECRET",
   };
   ```

1. Switch over to the `/services/auth-service` now to see how the Oidc instance is started. The class pulls in values from the `keycloakConfig` to use in the constructor. The other functions are wrappers around methods provided by the `oidc-client` library. This allows us to key into things like `signInRedirect` and `signoutRedirect`.

   How the settings are integrated:

   ```javascript
   const settings = {
     authority: `${keycloakConfig.authorityUrl}/auth/realms/${keycloakConfig.realm}`,
     client_id: keycloakConfig.clientId,
     client_secret: keycloakConfig.clientSecret,
     redirect_uri: `${window.location.origin}/auth`,
     silent_redirect_uri: `${window.location.origin}/silent-refresh`,
     post_logout_redirect_uri: `${window.location.origin}`,
     response_type: "code",
     userStore: new WebStorageStateStore(),
     loadUserInfo: true,
   };
   this.userManager = new UserManager(settings);
   ```

   Example function wrapper:

   ```javascript
   public signInRedirect() {
     return this.userManager.signinRedirect();
   }
   ```

1. With the `AuthService` defined, we can now expose that through a composable. Switch to the `/composables/useServices` file. The file is simple but provides a way for any component to hook into the service instance.

   ```javascript
   import AuthService from "@/services/auth-service";
   import ApplicationService from "@/services/application-service";
   import { useAuth } from "@/stores/auth";

   export const useServices = () => {
     const authStore = useAuth();

     return {
       $auth: new AuthService(),
       $application: new ApplicationService(authStore.access_token),
     };
   };
   ```

   We pull in the `AuthService` then expose it through the `$auth` variable. The `$application` variable exposes the `ApplicationService` which is provided as an example of how you could secure API calls.

1. We leverage the [`pinia`](https://pinia.vuejs.org/) library to make store User information to make it easily accessible. Open `/stores/auth/index`. From within this file, we can wrap the `User` object exposed by the `oidc-client` package. This can then be leveraged in the middleware function we want to define or to pull information quickly about the user.
1. There are a few main pages in play here that we define to create paths the library can leverage. The `/pages/auth`, `/pages/logout`, `/pages/silent-refresh` create paths at the same name. These are used to do the redirection during authentication or log out. From within these we use the `AuthService` to direct the user around within the app. For instance in `/auth`:

   ```javascript
   const authenticateOidc = async () => {
     try {
       await services.$auth.signInCallback();
       router.push("/");
     } catch (error) {
       console.error(error);
     }
   };

   await authenticateOidc();
   ```

   The `router.push` naively sends someone to the home page. This could be updated to go to any number of places, including the page one started the login flow from if you were to store that information to be retrieved.

1. We have also created a middleware file in `/middleware/auth.global` to be used in a couple of ways. It checks if the user is authenticated and based on that knowledge, stores the user information in the store (if not there) or could be used to send someone to login. For our example, we created buttons to initiate that but there is a comment which shows how you could force a set of paths to require login.

   ```javascript
   const authFlowRoutes = ["/auth", "/silent-refresh", "/logout"];

   export default defineNuxtRouteMiddleware(async (to, from) => {
     const authStore = useAuth();
     const services = useServices();
     const user = (await services.$auth.getUser()) as User;

     if (!user && !authFlowRoutes.includes(to.path)) {
       // use this to automatically force a sign in and redirect
       // services.$auth.signInRedirect();
     } else {
       authStore.setUpUserCredentials(user);
     }
   });
   ```

1. Now that we have all the things setup, we can define the user component `/components/User` to easily pull information about the user's state and display the appropriate UI.

   ```javascript
   const authStore = useAuth();
   const user = authStore.user;

   const signIn = () => services.$auth.signInRedirect();
   const signOut = () => services.$auth.logout();
   ```

   With this, the user object is now easily available. A simple `v-if="user"` allows the app to determine what UI to show.
