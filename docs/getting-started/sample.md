---
id: sample
title: Sample Application
---

Most users will want to get started quickly with a sample of how to secure an application. Once you have registered for a Phase Two account, you can clone this repository to see a demonstration of authentication in action.

https://github.com/p2-inc/debug-app

Once you have cloned the repo, edit the `keycloak.json` file with the details of your account. You must replace the `<corp-realm>` value with the account name.

```json
{
  "realm": "<corp-realm>",
  "auth-server-url": "https://app.phasetwo.io/auth/",
  "ssl-required": "external",
  "resource": "sample-app",
  "public-client": true,
  "confidential-port": 0
}
```

Then run the server using the included script:
```bash
./start.sh
```

And open [http://localhost:3000/](http://localhost:3000/) in your browser. Once you have logged in, you'll see some information about the user that is contained the "access token" (more about that later).

Curious how it works? Most of the functionality for quickly securing an app is contained in `app.js`. More detailed information is contained in the next section, dedicated to securing applications.
