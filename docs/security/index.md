---
id: index
title: Security
---

Keycloak provides a strong set of security tools, but many of them are not enabled by default because use cases vary. Once a realm is reachable from the internet, automated scanners will find it and start replaying passwords leaked from other sites against every way in. These pages cover how to close those paths, in roughly the order to tackle them before go-live:

- **Know your entry points.** Every client and grant type is a way to sign in. [Sign-in Methods, Grant Types and Clients](/docs/authentication/sign-in-methods) maps which protections apply to which path, and [Client Policies](./client-policies.md) enforce the rules across the whole realm.
- **Stop automated logins.** [Credential Stuffing and Account Takeover](./credential-stuffing.md) explains how these attacks reach Keycloak and how to prevent, detect, and respond to them. [Cloudflare Turnstile](./turnstile.md) adds a CAPTCHA to login and registration, [Rate Limiting](./rate-limiting.md) describes the per-IP limits Phase Two enforces at the edge, and [Brute Force Detection](./brute-force-detection.md) protects individual accounts.
- **Limit the damage of a stolen session.** [Tokens and Sessions](./tokens-and-sessions.md) covers lifespans, refresh token rotation, and offline sessions.
- **Strengthen credentials.** [Password Policy](./password-policy.md) and [Password Blacklist](./password-blacklist.md).

For the full pre-launch list, see the [Go-Live Checklist](/docs/getting-started/launch-checklist).

### Guides

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
