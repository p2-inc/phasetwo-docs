---
id: understanding-flows
title: Understanding Flows
---

An authentication flow defines the experience your user will go through in securely identifying themselves to your application. It is a container of challenges, screens, and actions, during log in, registration, and other workflows. When we refer to a named flow in the documentation, we are simply referring to such a container, some of which are built-in, and some can be created and configured by you.

The topic of flows is covered extensively in the [Keycloak documentation](https://www.keycloak.org/docs/latest/server_admin/index.html#_authentication-flows) on authentication flows. The pages in this section show how to build common flows, usually by duplicating the built-in `browser` flow and changing its steps. For a deeper, tested walkthrough, see [Build a Custom Keycloak Authentication Flow](/tutorials/authentication/custom-flows/).

### Authentication admin

Configuration of flows and how they map to different activities is done in the Admin UI under the **Authentication** section. The guides and examples in the next section will largely be executed in the **Flows** tab of that section.

#### Flow types

You will notice many different flow types in this section. Other than for advanced topics, your use will largely be constrained to the _browser_ flow, by duplicating and customizing that flow.

![Keycloak Authentication Browser Flow](/docs/auth-understanding-flows-browser.png)

#### Binding flows

A new flow does nothing until it is _bound_. Binding a flow to the _Browser flow_ makes it the flow used for browser logins in the realm. Bind a flow with _Bind flow_ in the _Action_ menu in the upper right of the flow, or see all bindings at once in the **Flows** tab's _Used by_ column. A single client can also use a different flow through its **Advanced** tab, under _Authentication flow overrides_; see [Sign-in Methods and Grant Types](./sign-in-methods.md#which-flow-runs) for when that is safe.

![Keycloak Authentication Bind Flow](/docs/auth-understanding-flows-binding.png)

### Required actions

In addition to authentication flows, required actions are common tasks that can be assigned to individual users or set as default for all users. These are assigned manually or based on rules. Required actions are actions a user must perform during the authentication process. A user will not be able to complete the authentication process until these actions are complete. For example, a user may be required to verify their email address, update their password, or set up an authenticator app before they can continue. The configuration of these actions is done in the **Required actions** tab.

![Keycloak Authentication Flow Required Actions](/docs/auth-understanding-flows-required-actions.png)
