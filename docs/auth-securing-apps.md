---
id: auth-securing-apps
title: Securing Apps
---

Your applications and services can be secured using any compliant OpenID Connect Relying Party library. Phase Two's supplies client libraries that can be used to secure your applications.

## Single-page apps

```html
<head>
    <script src="https://app.phasetwo.io/auth/js/phasetwo.js"></script>
    <script>
	    var auth = new Phasetwo({
            url: 'https://app.phasetwo.io/auth',
		    realm: 'myrealm.com',
		    clientId: 'myapp'
        });
        auth.init().then(function(authenticated) {
            alert(authenticated ? 'authenticated' : 'not authenticated');
        }).catch(function() {
            alert('failed to initialize');
        });
    </script>
</head>

```

## Server apps

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  groupId="languages"
  defaultValue="node"
  values={[
    { label: 'Node.js', value: 'node', },
    { label: 'Python', value: 'py', },
    { label: 'Java', value: 'java', },
  ]
}>
<TabItem value="node">

```js
console.log('Coming soon!');
```

</TabItem>
<TabItem value="py">

```py
print 'Coming soon!'
```

</TabItem>
<TabItem value="java">

```java
System.out.println("Coming soon!");
```

</TabItem>
</Tabs>
