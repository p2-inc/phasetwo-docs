---
id: index
title: Securing Applications
---

Phase Two is an implementation of the [OpenID Connect](https://openid.net/connect/) specification. That means, no custom libraries or code are required Your applications and services can be secured using any compliant OpenID Connect Relying Party library. There are lists maintained by the OpenID Foundation of client libraries.

- [Certified OpenID Connect Implementations](http://openid.net/developers/certified/)
- [Uncertified OpenID Connect Implementations](http://openid.net/developers/uncertified/)

Confused? We will also use this category as a place to provide language and framework specific guides to make securing your applications easier.

### Guides

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```

### Libraries

Also, here is an unofficial list of OpenID Connect libraries we've heard good things about. Please [email us](mailto:support@phasetwo.io) if you're a library author, and you'd like to see your library linked here, or if you've had success with a library not listed here.

- JavaScript (client-side)
  - [OIDC Client](https://github.com/authts/oidc-client-ts)
  - [React OIDC Context](https://github.com/authts/react-oidc-context)
  - [NextAuth.js](https://next-auth.js.org/) (will become Auth.js)
  - [Auth.js](https://authjs.dev/)
  - [Keycloak JavaScript Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter) (the `keycloak-js` adapter is deprecated by Keycloak)
- Node.js (server-side)
  - [Node.js](https://www.keycloak.org/docs/latest/securing_apps/#_nodejs_adapter)
- Python
  - [oidc](https://pypi.org/project/oic/)
- Go
  - [gocloak](https://github.com/Nerzal/gocloak)
- Android
  - [AppAuth](https://github.com/openid/AppAuth-Android)
- iOS
  - [AppAuth](https://github.com/openid/AppAuth-iOS)
- PHP
  - [oauth2-keycloak](https://github.com/stevenmaguire/oauth2-keycloak)
- C#
  - [OWIN](https://github.com/dylanplecki/KeycloakOwinAuthentication)
