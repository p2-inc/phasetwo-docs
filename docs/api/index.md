---
id: index
title: API
---

Phase Two has built an API for managing custom functionality as extension to the standard [Keycloak Admin REST API](https://www.keycloak.org/docs-api/20.0/rest-api/index.html).

### Base URI format
Paths specified in the documentation are relative to the the base URI.
- Format: `https://<host>:<port>/auth/realms`
- Examples: `https://usw2.auth.ac/auth/realms`, `https://euc1.auth.ac/auth/realms`

### API sections
```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
