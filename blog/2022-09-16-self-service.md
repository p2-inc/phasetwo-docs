---
slug: self-service
title: Self-service (beta) Launch
authors: phasetwo
tags: [release, keycloak, phase_two, cockroach]
---

We've been pretty quiet over the summer. Since we released the [Organizations](https://github.com/p2-inc/keycloak-orgs) and [Magic Link](https://github.com/p2-inc/keycloak-magic-link) extensions and open sourced them, there has been a lot of interest in using Phase Two.

We were flattered by the inbound interest, but our small team wasn't able to keep up with demand for trial accounts. Rather than scramble against that demand, we opted to pause new accounts, and instead build a self-service tool to allow anyone to quickly provision a new deployment a try it out.

Today we're announcing the beta launch of the Phase Two Self-service deployment tool. This tool allows you to easily create new deployments of the Phase Two enhanced version of Keycloak in our secure, highly-available clusters. In the future, it will also allow you to deploy dedicated instances that use your own database.

Take a look at how easy it is to get started:

<iframe width="560" height="315" src="https://www.youtube.com/embed/zzJPmwrEHmU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The clusters that run our deployments are available in two regions (AWS, us-west-2 and eu-central-1), and are backed by [CockroachDB](https://www.cockroachlabs.com/), giving you scale, resilience and low-latency performance. In the future, clusters and dedicated instances will be available in other regions based on demand.

We hope you find this new tool valuable, and we look forward to feedback and participation from both our customers and the wider Keycloak community.

[TRY IT NOW!](https://phasetwo.io/dashboard/)
