---
slug: free-realm
title: Free as in Beer, Free Keycloak Realm in Phase Two's Hosted Keycloak
description: Phase Two offers a free Keycloak realm for experimentation or small companies to use at their discretion to implement Authentication or Authorization.
authors: phasetwo
tags: [phase_two]
---

Since our release about basing Phase Two on the [Keycloak](https://www.keycloak.org/) Open Source Identity and Access Management system, and our commitment to keeping our core extensions [open source](/docs/introduction/open-source), we've received positive feedback from customers and interest from the the Keycloak community.

We've noticed that support forums for Keycloak have many questions and requests around just getting started. Even though the software is mature, open source, and has a helpful user community, just spinning up an environment and trying it out can be puzzling for first-time users. It's pretty clear that a lot of people just give up, because they can't get a server running, let alone configure their first realm[^1].

<!--truncate-->

Because of that, we've decided to offer developers a _FREE_ realm in Phase Two, so those that are interested in trying it out can get successful quickly. Free realms are limited to fewer than 1000 users and 5 SSO connections. Otherwise, there are no restrictions beyond abiding by our [terms of use](/docs/terms). Sound good? Please fill out the [contact form](https://docs.google.com/forms/d/e/1FAIpQLScIwakLlJpd9OS3r1fCsPDX01Y9BTSvxf5Ceru_FrpAQE5hIA/viewform?usp=sf_link) with your company information, and we'll respond with access information for your realm.

[^1]: In Keycloak, a "realm" manages a set of users, credentials, roles, and groups. A user belongs to and logs into a realm. Realms are isolated from one another and can only manage and authenticate the users that they control.
