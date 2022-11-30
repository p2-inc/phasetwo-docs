---
id: understanding-flows
title: Understanding Flows
---

:::caution

This section is currently under construction. Check back soon for updates.

:::

An authentication flow defines the experience your user will go through in securely identifying themselves to your application. It is a container of authentications, screens, and actions, during log in, registration, and other workflows. When we refer to a named flow in the documentation, we are simply referring to such a container, some of which are built in, and some can be created and configured by you.

The topic of flows is covered extensively in the [Keycloak documentation](https://www.keycloak.org/docs/latest/server_admin/index.html#_authentication-flows). In order to facilitate getting setup quickly, we have defined a set of example flows that you can use to build several common flows.

In each of the sections, we will show you how to use the example flows to setup your own unique authentication flow. 

### Authentication admin

Configuration of flows and how they map to different activities is done in the Admin UI under the **Authentication** section. The guides and examples in the next section will largely be executed in the **Flows** of that section.

### Required actions

In addition to authentication flows, required actions are common tasks that can be assigned to individual users or set as default for all users. These are assigned manually or based on rules. Required actions are actions a user must perform during the authentication process. A user will not be able to complete the authentication process until these actions are complete. For example, an admin may schedule users to reset their passwords every month. An update password required action would be set for all these users.

