---
id: index
title: API
---

Phase Two extends the standard [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html) with APIs for its extensions, such as organizations, webhooks, and magic links. These APIs run on your cluster, alongside Keycloak's own.

To manage Phase Two itself, such as creating clusters, realms, and custom domains, use the [Management API](/docs/management-api/) instead.

### Base URI format

Paths in the [API reference](/api/phase-two-admin-rest-api) are relative to this base URI:

- Format: `https://<your-cluster-host>/auth/realms`
- Example with a custom domain: `https://auth.example.com/auth/realms`

`<your-cluster-host>` is the hostname shown for your cluster in the [Dashboard](https://dash.phasetwo.io/), or a [custom domain](/docs/self-service/custom-domains) you have attached to it. Both serve the same APIs.

### API sections

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
