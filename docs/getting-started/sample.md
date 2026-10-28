---
id: sample
title: Sample Application
---

The quickest way to see authentication working is to run one of our example applications against your own realm. Once you have a Phase Two cluster and a realm, pick the example that matches your stack from the [p2-inc/examples](https://github.com/p2-inc/examples) repository. Each example is a standalone project with its own README, sample environment file, and in most cases a live deployed version you can try first.

| Stack       | Example                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React       | [oidc-spa](https://github.com/p2-inc/examples/tree/main/frameworks/reactjs/oidc-spa) or [oidc-client-ts](https://github.com/p2-inc/examples/tree/main/frameworks/reactjs/oidc-client-ts) |
| Next.js     | [NextAuth.js](https://github.com/p2-inc/examples/tree/main/frameworks/nextjs)                                                                                                            |
| Vue         | [oidc-client-ts](https://github.com/p2-inc/examples/tree/main/frameworks/vue)                                                                                                            |
| Angular     | [angular-oauth2-oidc](https://github.com/p2-inc/examples/tree/main/frameworks/angular)                                                                                                   |
| SvelteKit   | [Auth.js](https://github.com/p2-inc/examples/tree/main/frameworks/sveltekit)                                                                                                             |
| Django      | [mozilla-django-oidc](https://github.com/p2-inc/examples/tree/main/frameworks/django)                                                                                                    |
| Spring Boot | [Spring Boot + Angular](https://github.com/p2-inc/examples/tree/main/frameworks/spring-boot-keycloak)                                                                                    |

### Client setup

Before you start an example, create a client for it in your realm. In Keycloak, a "client" is an application you are securing.

Open the admin console for your realm, select **Clients** in the left navigation, and click _Create client_.

1. Enter a **Client ID**, for example `frontend`, and click _Next_.
2. In the **Capability config** screen, leave _Client authentication_ off for a browser app, keep _Standard flow_ on, and click _Next_.
3. In the **Login settings** screen, enter:
   1. the example's local URL followed by `/*`, for example `http://localhost:3000/*`, for **Valid redirect URIs**
   2. `+` for **Valid post logout redirect URIs**
   3. `+` for **Web origins**
4. Click _Save_.

![Keycloak Client Details](/blog/2022-10-17-client-setup.png)

### Run the example

Clone the repository, change into the example's folder, and copy its sample environment file. Set the Keycloak URL to your realm, for example `https://<your-cluster-host>/auth/realms/<your-realm>`, and the client ID to the one you just created. The exact variable names are in each example's README.

```bash
git clone https://github.com/p2-inc/examples.git
cd examples/frameworks/reactjs/oidc-spa
```

Start the app as its README describes, open it in your browser, and log in. You'll see information about the logged-in user from their tokens.

For a walkthrough of the same steps on Keycloak itself, see [Create your first realm, client and user](/tutorials/getting-started/first-realm-client-user/) and [Get your first token](/tutorials/getting-started/your-first-token/). The next section, [Securing Applications](/docs/securing-applications/), covers each framework in more detail.
