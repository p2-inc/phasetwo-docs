---
slug: identity-brokering-on-prem
title: "User Management and Identity Brokering for On-Prem Apps"
authors: phasetwo
tags: [keycloak, phase_two, open_source, idp_wizard, on_prem, private_cloud]
---

# User Management and Identity Brokering for On-Prem Apps

With many companies racing into the cloud, very little is written about the huge opportunity, and potential pitfalls of building software for on-prem and private cloud deployments. With the growing Kubernetes and CNCF ecosystems, the balance point to justify self-hosting is constantly shifting. This is great news for companies that must host data and applications inside the enterprise. For software vendors looking to serve this exploding market, authentication can be a blind spot.

### A story, inspired by customer use cases:

> You’ve built a successful enterprise SaaS product, and your cloud offering has taken off. Recently, you’ve been getting inquiries from government agencies, large companies in regulated industries, and foreign companies – all of which have legal, compliance or regulatory requirements that prohibit them from using your product in the cloud.
>
> Given the size of the opportunity, you’ve decided to go for it. Your team has packaged your application up as a set of Kubernetes manifests, making changes, replacing cloud services with open source alternatives, and even built out a runbook to help your devops peers at the customer operate it themselves.
>
> The big day comes, and you’re installing at your first customer. You expect that there will be some minor bumps along the way, but their first question just flattens you: “How do we connect this to our in-house identity provider?” It was a question that was never on your radar, but now it’s the most important thing for the customer.
>
> Like most SaaS companies, you’re probably either hand-rolling your authentication and user management using something like Passport.js, Devise, Django, etc., using some social login options, or using a cloud-only service like Auth0 or WorkOS. If you had implemented SAML, the most common protocol for just-in-time user provisioning with enterprise identity providers, you probably went for a basic approach. You wrongly assumed that user management and identity brokering would be easier for on-prem.
>
> You throw some engineering and customer success resources at the problem, but quickly realize it’s not a scalable solution. The customer wants to map their groups, and manage access and authorization through _their_ IdP. Just the overhead of connecting to every possible type of IdP, and supporting that for every customer, will eat up your margin before they start using your application.

<!--truncate-->

The **good news** is that you’re not alone in missing this key enterprise need. Many companies who are new to on-prem and private cloud deployments learn this the hard way, many without losing customers.

However, the reality is that for an application that is used by an entire enterprise, who can use it (authentication) and how (authorization) is equally as important for on-prem applications as cloud. And, being hosted and operated by your customer, simplicity of management and transparency is more important than cloud.

### An open source solution to the rescue

Fortunately, there is feature complete identity and access management system that is equally at home both on-premise and in the cloud. It can easily facilitate identity brokering with the customer identity provider, as well as give their IT staff access to critical access and operational information.

At Phase Two, we’ve had a front row seat in solving this problem. Our customers have deployed [Keycloak](https://www.keycloak.org/), bundled with their application to over 300 of their customer sites. In these deployments, Keycloak is used for identity brokering to the customer identity provider, SSO authentication for all of their deployed applications, and role and access management to broker and manage authorization within their applications.

### Tools to empower the customer

In addition to solving these core challenges, Phase Two has built [tools](https://github.com/p2-inc) to extend enterprise [use-cases](https://phasetwo.io/product/organizations) and facilitate [customer onboarding](https://phasetwo.io/product/adminportal), one of the biggest drags on Customer Success hours, and ultimately a huge margin drain.

To this end, the most valuable tool, from our customers’ perspectives is our [Identity Provider Setup Wizard](https://github.com/p2-inc/idp-wizard). This tool is meant as a guide for customers’ initial IdP connection, turning an esoteric form into a clear step-by-step process for specific IDPs (what keys to get, where to store them, and so on). This had previously been the long pole in the onboarding tent. By giving the customers a tool to self-configure and manage their own IdP connection, Phase Two has gifted back valuable Customer Success hours and margin dollars.

![idp-wizard-video-gif](https://github.com/p2-inc/idp-wizard/assets/244253/e9b421c0-b487-4c07-9eed-87ea89fc574b)

We conveniently bundle all of these tools in [Docker images](https://github.com/p2-inc/phasetwo-containers) for easy deployment.

Does the above story sound familiar, or something you might be stumbling into? [Contact sales](mailto:sales@phasetwo.io) to find out how we can help your journey to on-prem be as painless as possible and supercharge your customer identity onboarding process.
