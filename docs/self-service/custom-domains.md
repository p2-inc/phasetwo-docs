---
id: custom-domains
title: Custom Domains
---

Custom domains are available for Premium and Enterprise plans. This allows you to use your own domain name for accessing your Keycloak instance instead of the default `*.phasetwo.io` domain.

To add a new custom domain, you must visit the Clusters > Cluster > Config > Domains section of the Dashboard. This url will be unique based on your cluster.

Once on the page, you can add a new domain by entering the domain the "Add a custom domain" section and hitting "Submit". Enter the custom domain you wish to use. We recommend using a subdomain such as `auth.yourdomain.com` or `login.yourdomain.com`.

<figure>
  <img src="/docs/dashboard/cluster-config-custom-domain.png" className="max-w-xl"  alt="Add a custom domain" />
  <figcaption>Add a custom domain</figcaption>
</figure>

After entering the domain, you will be provided with a DNS record that you must add to your DNS provider. This is typically done through the management console of your domain registrar or DNS hosting provider.

1. **Validation records**: needed to prove ownership of the domain.
2. **Vanity records**: needed to route traffic to Phase Two. For all cloud providers use the following format for the vanity:

   CNAME `yourdomain.com` TO `{cluster_name}.global.auth.ac`

After you create the records, it may take some time for DNS propagation to complete. You can use tools like [DNS Checker](https://dnschecker.org/) to verify that the records have been propagated successfully. Once the records are verified, you can return to the Phase Two Dashboard to check that the records are present. Once the DNS records are verified, we will issue your cert. The verification and certificate issuance process are automatic, but are dependent on DNS entries.

<figure>
  <img src="/docs/dashboard/cluster-config-custom-domain-success.png" className="max-w-xl"  alt="Custom domain success" />
  <figcaption>Add records and have SSL setup.</figcaption>
</figure>

If you fail to setup your DNS records within 48 hours, the request will expire and you will need to remove and re-add the domain. The record values will not change, but the request will be reset. Use the "trash" icon next to the domain to remove it.

<figure>
  <img src="/docs/dashboard/cluster-config-custom-domain-request-timeout.png" className="max-w-xl"  alt="Custom domain success" />
  <figcaption>Record timeout.</figcaption>
</figure>
