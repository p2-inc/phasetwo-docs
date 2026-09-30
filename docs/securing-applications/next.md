---
id: next
title: Next.js
---

For a working example, Phase Two has a [Next.js project](https://github.com/p2-inc/examples/tree/main/frameworks/nextjs) with sample code or view a [live deployed version](https://phasetwo-nextjs-example.vercel.app/).

This example uses [Next.js](https://nextjs.org/docs) 16 with the App Router. It logs users in with [NextAuth.js](https://next-auth.js.org/) 4.24 and its [Keycloak provider](https://next-auth.js.org/providers/keycloak). The login runs on the server: the tokens stay in an encrypted, HTTP-only session cookie, and the browser only sees their decoded claims. [Learn more](https://phasetwo.io/blog/instant-user-managemenet-and-sso-for-nextjs/) at our Next.js blog post.

You need [Node.js](https://nodejs.org/) 24, [pnpm](https://pnpm.io/), and [Docker](https://docs.docker.com/get-started/get-docker/) with the Compose plugin for the local Keycloak.

1. Clone the Phase Two [example repo](https://github.com/p2-inc/examples/) and start its [local Keycloak](https://github.com/p2-inc/examples/blob/main/keycloak/README.md). Its `p2examples` realm already has the example's `nextjs` client and a non-admin user, `demo` / `demo`.

   ```bash
   git clone https://github.com/p2-inc/examples.git
   cd examples
   docker compose -f keycloak/docker-compose.yml up -d --wait
   ```

1. Open the Next.js [folder](https://github.com/p2-inc/examples/tree/main/frameworks/nextjs) and copy `.env.example` to `.env`:

   ```bash
   cd frameworks/nextjs
   cp .env.example .env
   ```

   The app reads these variables. `.env.example` already holds the values for the local Keycloak:

   | Variable          | Description                                    | Local Keycloak                                 |
   | ----------------- | ---------------------------------------------- | ---------------------------------------------- |
   | `NEXTAUTH_URL`    | Public URL of the app                          | `http://localhost:3000`                        |
   | `NEXTAUTH_SECRET` | Random secret that encrypts the session cookie | Generate your own                              |
   | `KEYCLOAK_ID`     | Client ID                                      | `nextjs`                                       |
   | `KEYCLOAK_SECRET` | Client secret                                  | `nextjs-local-dev-secret`                      |
   | `KEYCLOAK_ISSUER` | Issuer URL of the realm                        | `http://localhost:8080/auth/realms/p2examples` |

   Set `NEXTAUTH_SECRET` in `.env` to a random value, such as the output of `openssl rand -base64 32`. It is not the Keycloak client secret.

   To use another Keycloak, create a confidential OpenID Connect client in your realm: turn **Client authentication** on, keep **Standard flow** checked, and set **Valid redirect URIs** to `http://localhost:3000/*` and **Valid post logout redirect URIs** to `+`. Then set `KEYCLOAK_ISSUER` to your realm's issuer URL, such as `https://<your-keycloak-host>/auth/realms/<your-realm>`, `KEYCLOAK_ID` to your client's ID, and `KEYCLOAK_SECRET` to the secret from its **Credentials** tab. `.env` is ignored by git, so your secrets stay out of version control.

1. Install the dependencies and start the app:

   ```bash
   pnpm install
   pnpm dev
   ```

1. Open `src/auth.ts`. This server-only file reads the Keycloak settings from the environment. Its `refreshAccessToken` function trades the refresh token for new tokens at Keycloak's token endpoint:

   ```ts
   import type { NextAuthOptions } from "next-auth";
   import type { JWT } from "next-auth/jwt";
   import KeycloakProvider from "next-auth/providers/keycloak";
   import { decodeJwtPayload } from "@/lib/jwt";

   const issuer = process.env.KEYCLOAK_ISSUER ?? "";
   const clientId = process.env.KEYCLOAK_ID ?? "";
   const clientSecret = process.env.KEYCLOAK_SECRET ?? "";

   async function refreshAccessToken(token: JWT): Promise<JWT> {
     if (!token.refreshToken) {
       return { ...token, error: "RefreshAccessTokenError" };
     }

     const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
       method: "POST",
       body: new URLSearchParams({
         grant_type: "refresh_token",
         client_id: clientId,
         client_secret: clientSecret,
         refresh_token: token.refreshToken,
       }),
     });

     if (!response.ok) {
       return { ...token, error: "RefreshAccessTokenError" };
     }

     const tokens = await response.json();
     return {
       ...token,
       accessToken: tokens.access_token,
       idToken: tokens.id_token ?? token.idToken,
       refreshToken: tokens.refresh_token ?? token.refreshToken,
       expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
       error: undefined,
     };
   }
   ```

   Further down in `src/auth.ts`, `authOptions` configures NextAuth.js with the Keycloak provider. The route handler and the page both use it:

   ```ts
   export const authOptions: NextAuthOptions = {
     providers: [KeycloakProvider({ clientId, clientSecret, issuer })],
     session: { strategy: "jwt" },
     callbacks: {
       async jwt({ token, account }) {
         if (account) {
           return {
             ...token,
             accessToken: account.access_token,
             idToken: account.id_token,
             refreshToken: account.refresh_token,
             expiresAt: account.expires_at,
           };
         }

         if (token.expiresAt && Date.now() < (token.expiresAt - 30) * 1000) {
           return token;
         }

         return refreshAccessToken(token);
       },
       async session({ session, token }) {
         return {
           ...session,
           error: token.error,
           accessTokenClaims: decodeJwtPayload(token.accessToken),
           idTokenClaims: decodeJwtPayload(token.idToken),
         };
       },
     },
     events: {
       async signOut({ token }) {
         if (!token.refreshToken) {
           return;
         }

         await fetch(`${issuer}/protocol/openid-connect/logout`, {
           method: "POST",
           body: new URLSearchParams({
             client_id: clientId,
             client_secret: clientSecret,
             refresh_token: token.refreshToken,
           }),
         });
       },
     },
   };
   ```

   - `session: { strategy: "jwt" }` keeps the session in the encrypted cookie, so the app needs no database.
   - The `jwt` [callback](https://next-auth.js.org/configuration/callbacks) stores Keycloak's access, ID and refresh tokens in that cookie when the user logs in. When the access token has less than 30 seconds left, it calls `refreshAccessToken`.
   - The `session` callback decides what the app gets from the session: the decoded claims of the access and ID tokens, and an `error` if the refresh failed. The tokens themselves never leave the server.
   - The `signOut` [event](https://next-auth.js.org/configuration/events) posts the refresh token to Keycloak's logout endpoint, so logging out of the app also ends the Keycloak session.

   `decodeJwtPayload` is in `src/lib/jwt.ts`, and `src/types/next-auth.d.ts` adds these fields to the `JWT` and `Session` types.

1. NextAuth.js serves its own routes under `/api/auth`, such as the callback that Keycloak redirects to after the login. `src/app/api/auth/[...nextauth]/route.ts` mounts them with `authOptions`:

   ```ts
   import NextAuth from "next-auth";
   import { authOptions } from "@/auth";

   const handler = NextAuth(authOptions);

   export { handler as GET, handler as POST };
   ```

1. `src/app/page.tsx` is a Server Component. It reads the session on the server with [`getServerSession(authOptions)`](https://next-auth.js.org/configuration/nextjs#getserversession) and passes it to the `User` component from `src/components/user.component.tsx`. `User` shows "Not authenticated." and a **Log in** button, or your name and email, the decoded tokens and a **Log out** button. If the token refresh failed, it asks you to log in again.

   The buttons call `signIn` and `signOut` from `next-auth/react`. They are in `src/components/buttons.components.tsx`, the app's only Client Component:

   ```tsx
   "use client";

   import { signIn, signOut } from "next-auth/react";

   const buttonClasses =
     "cursor-pointer rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

   export function LoginButton() {
     return (
       <button className={buttonClasses} onClick={() => signIn("keycloak")}>
         Log in
       </button>
     );
   }

   export function LogoutButton() {
     return (
       <button
         className={buttonClasses}
         onClick={() => signOut({ callbackUrl: "/" })}
       >
         Log out
       </button>
     );
   }
   ```

   Protect other Server Components, route handlers and server actions the same way: call `getServerSession(authOptions)` and check that it returns a session.

1. Open [localhost:3000](http://localhost:3000). You will see the Phase Two example landing page. Your current status should be "Not authenticated." Click **Log in**. This will redirect you to the Keycloak login page.

   :::info
   Sign in with a non-admin user, such as `demo` / `demo` on the local Keycloak.
   :::

1. Enter the user's credentials and sign in. You will then be redirected to the application. The Phase Two example landing page now shows your "Authenticated" state, your user's name and email, and the decoded access token and ID token.
1. Click **Log out**. The app also ends your Keycloak session, so the next time you click **Log in**, Keycloak asks for your credentials again.
