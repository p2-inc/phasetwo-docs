---
id: index
title: Account Management
---

Giving your users a facility to easily manage their account details is an important component of a comprehensive authentication service. Phase Two has two options for providing this functionality.

1. There is a hosted experience that can be easily linked to from your application. It provides all of the functionality available, and may be branded using the same variables for customizing the login UI. Once the user has made changes to their details, they seamlessly return to your application, and you can be informed of changes by using audit webhooks.
2. There is an an Account Management API that can be used to build the experience more natively into your application.

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```

