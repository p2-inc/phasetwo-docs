---
id: index
title: SSO
---

SSO enables authentication via an organization’s Identity Provider (IdP), such as Google Workspace or Okta instead of managing usernames and passwords. Phase Two implementations of IdP connections support [SAML](https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language) and [OpenID Connect](https://openid.net/connect/) standard protocols.

You can add and manage IdP connections through the Admin UI under the "Identity Providers" section. Documentation for the administration of IdPs can be found in the [Keycloak server administration](https://www.keycloak.org/docs/latest/server_admin/#_identity_broker) docs.

With the [Admin Portal](/docs/admin-portal/) or the [IdP wizards](./wizards.md), your customers can set up and manage their own IdP connections.

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
