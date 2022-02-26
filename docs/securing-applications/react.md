---
id: react
title: React
---

### React

Many SPAs use a framework such as [React](https://reactjs.org/) to simplify the creation of interactive experiences. We suggest the use of the open source [react-keycloak](https://github.com/react-keycloak/react-keycloak) library to make securing React applications easier

#### Example

Follow the setup instructions in the  library documentation https://www.npmjs.com/package/@react-keycloak/web

Once you have set up the `Keycloak` instance there, you can easily wrap components in the `ReactKeycloakProvider`.

```jsx
import { ReactKeycloakProvider } from '@react-keycloak/web'

import keycloak from './keycloak'

// Wrap everything inside KeycloakProvider
const App = () => {
  return <ReactKeycloakProvider authClient={keycloak}>...</ReactKeycloakProvider>
}
```
