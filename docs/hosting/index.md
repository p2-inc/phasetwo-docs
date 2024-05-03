---
id: index
title: Hosting
---

Phase Two is currently available for two primary hosted use cases:

1. **Self-hosted for public cloud applications**. Organizations that have compliance, data residency, or other requirements not met by the hosted versions of Phase Two can install on their own cloud. Both for community supported and paid versions, we distribute [Docker images](https://quay.io/repository/phasetwo/phasetwo-keycloak?tab=tags&tag=latest) and [Kubernetes Helm charts](./kubernetes.md) to expedite successful setup.

2. **Bundled and distributed with your software to your customer's site**. Many traditional software and SaaS companies are being asked, by customers in government and regulated industry, to deploy on-prem, and have requirements to connect to the customer identity provider. The complexity of potential identity providers and the customer service burden required to onboard has caused us to create a specific offering for this use case. Phase Two Connect allows you to implement a simple, standard interface, giving your customers access to an extensive catalog of identity provider support, with guided onboarding wizards.

```mdx-code-block
import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

<DocCardList items={useCurrentSidebarCategory().items}/>
```
