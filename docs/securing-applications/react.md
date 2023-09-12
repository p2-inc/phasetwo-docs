---
id: react
title: React
---

Many SPAs use a framework such as [React](https://reactjs.org/) to simplify the creation of interactive experiences. We suggest the use of the open source [react-keycloak](https://github.com/react-keycloak/react-keycloak) library to make securing React applications easier.

### Example

Follow the setup instructions in the library documentation https://www.npmjs.com/package/@react-keycloak/web

#### Setup Keycloak instance

Create a `keycloak.js` file in the `src` folder of your project (e.g. where `App.js` is located) with the following content:

```js
import Keycloak from "keycloak-js";

// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = new Keycloak();

export default keycloak;
```

Further documentation on setup of the Keycloak instance is in the official documentation https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter

#### Setup ReactKeycloakProvider

Once you have set up the `Keycloak` instance there, you can easily wrap components you wish to protect using the `ReactKeycloakProvider`.

```jsx
import { ReactKeycloakProvider } from "@react-keycloak/web";

import keycloak from "./keycloak";

// Wrap everything inside KeycloakProvider
const App = () => {
  return (
    <ReactKeycloakProvider authClient={keycloak}>...</ReactKeycloakProvider>
  );
};
```

#### Using hooks

When a component requires access to Keycloak, you can use the `useKeycloak` Hook.

```jsx
import { useKeycloak } from "@react-keycloak/web";

export default () => {
  // Using Object destructuring
  const { keycloak, initialized } = useKeycloak();

  // Here you can access all of keycloak methods and variables.
  // See https://www.keycloak.org/docs/latest/securing_apps/index.html#javascript-adapter-reference

  return (
    <div>
      <div>{`User is ${
        !keycloak.authenticated ? "NOT " : ""
      }authenticated`}</div>

      {!!keycloak.authenticated && (
        <button type="button" onClick={() => keycloak.logout()}>
          Logout
        </button>
      )}
    </div>
  );
};
```
