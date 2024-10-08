---
id: next
title: Next.js
---

For a working example, Phase Two has a [Next.js project](https://github.com/p2-inc/examples) with sample code or view a [live deployed version](https://phasetwo-nextjs-example.vercel.app/).

This example uses [Next.js](https://nextjs.org/) 13 and splits `server` and `client` components accordingly. [Learn more](https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nextjs/) at our Next.js blog post.

1. Clone the Phase Two [example repo](https://github.com/p2-inc/examples/).
1. Open the Next.js [folder](https://github.com/p2-inc/examples/tree/main/frameworks/nextjs) within `/frameworks/nextjs`.
1. Run `npm install` and then `npm run dev`. This example leverages [NextAuth.js](https://next-auth.js.org/) to provide hook and HOC support.
1. NextAuth.js configures an API route that is uses for the Authentication of the Client. It generates the routes automatically for you. These are added to Next.js in the `api/auth/[...nextauth]/route.ts` file.
1. Open the `src/lib/auth.ts` file. This is a server only file. We will be updating a few values from the prior section where we set up our OIDC client. Taking the values from the OIDC Client Config section, set those values in the code. While it is recommended to use Environment variables for the secret, for the purpose of this tutorial, paste in the **Client secret** from the OIDC client creation section for the value of `clientSecret`

   ```js
   const authServerUrl = "https://euc1.auth.ac/auth/";
   const realm = "shared-deployment-001";
   const clientId = "reg-example-1";
   const clientSecret = "CLIENT_SECRET"; // Paste "Client secret" here. Use Environment variables in prod
   ```

   Those are used to popluate the `AuthOptions` config for the `KeycloakProvider`:

   ```js
   export const AuthOptions: NextAuthOptions = {
     providers: [
       KeycloakProvider({
         clientId,
         clientSecret,
         issuer: `${authServerUrl}realms/${realm}`,
       }),
     ],
   };
   ```

   The config is then provided to the `AuthProvider` in the `/src/app/layout.tsx` file. Next.js uses this file to generate an HTML view for this page.

   ```js
   import { NextAuthProvider as AuthProvider } from "./providers";
   ...
   <AuthProvider {...oidcConfig}>
     <App />
   </AuthProvider>
   ```

   At this point our entire application will be able to access all information and methods needed to perform authentication. View the `providers.tsx` file for additional information about how the `SessionProvider` is used. The `SessionProvider` enables use of Hooks to derive the authenticated state. View `user.component.tsx` for exactly how the code is authenticating your user. The sections rendering the "Log in" and "Log out" buttons are conditional areas based on the authenticated context. The buttons invoke functions provided by NextAuth.

   The logic using the hook to conditionally determine the Authenticated state, can be used to secure routes, components, and more.

1. Open [localhost:3000](http://localhost:3000). You will see the Phase Two example landing page. You current state should be "Not authenticated". Click **Log In**. This will redirect you to your login page.

   :::info
   Use the non-admin user created in the previous section to sign in.
   :::

1. Enter the credentials of the non-admin user you created. Click **Submit**. You will then be redirected to the application. The Phase Two example landing page now loads your "Authenticated" state, displaying your user's email and their Token.
1. After your first log in, click **Log out**. Then click **Log in** again. Notice how this time you will not be redirected to sign in as your state is already in the browser. Neat! If you clear the browser state for that tab, then you will have to be redirected away to sign-in again.
