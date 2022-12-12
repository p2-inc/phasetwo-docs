---
id: understanding-flows
title: Understanding Flows
---

An authentication flow defines the experience your user will go through in securely identifying themselves to your application. It is a container of challenges, screens, and actions, during log in, registration, and other workflows. When we refer to a named flow in the documentation, we are simply referring to such a container, some of which are built-in, and some can be created and configured by you.

The topic of flows is covered extensively in the [Keycloak documentation](https://www.keycloak.org/docs/latest/server_admin/index.html#_authentication-flows) on authentication flows. In order to facilitate getting setup quickly, we have defined a set of example flows that you can use or extend to build several common flows.

In each of the sections, we will show you how to use the example flows to setup your own unique authentication flow. 

### Authentication admin

Configuration of flows and how they map to different activities is done in the Admin UI under the **Authentication** section. The guides and examples in the next section will largely be executed in the **Flows** tab of that section.

#### Flow types

You will notice many different flow types in this section. Other than for advanced topics, your use will largely be constrained to the *browser* flow, by duplicating and customizing that flow.

![](/docs/auth-understanding-flows-browser.png)

#### Binding flows
The new flows you build can be saved in this UI, and will be selected by assignment called *Binding* the new flow to the *Browser flow*. The documentation will refer to this process, which can be achieved using the *Action* menu on the upper right of each flow.

![](/docs/auth-understanding-flows-binding.png)

### Required actions

In addition to authentication flows, required actions are common tasks that can be assigned to individual users or set as default for all users. These are assigned manually or based on rules. Required actions are actions a user must perform during the authentication process. A user will not be able to complete the authentication process until these actions are complete. For example, an admin may schedule users to reset their passwords every month. An update password required action would be set for all these users. The configuration of these actions is done in the **Required actions** tab.

![](/docs/auth-understanding-flows-required-actions.png)

