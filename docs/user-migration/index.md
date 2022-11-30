---
id: index
title: User Migration
---

User migration is an optional feature that can be installed in your realm by request. Customers who have legacy user databases they wish to import can use this feature as part of initial or ongoing migration to Phase Two. We use a variant of this [Keycloak user migration extension](https://github.com/daniel-frak/keycloak-user-migration).

In order to migrate your users with this extension, you must implement a web service so that we can securely validate the users and receive their information. The API to be implemented is documented here.

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
