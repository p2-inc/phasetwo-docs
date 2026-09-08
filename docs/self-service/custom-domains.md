---
id: custom-domains
title: Custom Domains
---

Custom domains let you use your own domain name to access your Keycloak instance instead of the default `*.phasetwo.io` domain. They are available on every plan, with the number you can add depending on your tier.

Serving [app association files](#app-association-files) on those domains requires Premium or Enterprise.

:::tip Don't have a cluster yet?
Every new cluster starts with a **30-day free trial** — no charge until it ends, cancel any time. [Start for free](https://dash.phasetwo.io/clusters/create), or see the [pricing page](/pricing) for what each plan includes.
:::

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

## App association files

If you have a mobile app, your custom domain can publish the files iOS and Android use to link the domain to that app. This is what lets a password manager autofill a saved password inside your app — and, later, lets a passkey created on your login page be used from it.

Available on Premium and Enterprise plans, managed under **Clusters > Cluster > Config > Resources**.

Three things can be served:

| Path | Purpose |
| --- | --- |
| `/.well-known/apple-app-site-association` | Links the domain to your iOS app |
| `/.well-known/assetlinks.json` | Links the domain to your Android app |
| `/.well-known/change-password` | Where password managers send someone to change their password |

### Why they must live on this domain

The operating system fetches these files itself, out of band, from a fixed path at the root of the domain — not as part of any request your app makes.

It matches on the **exact hostname**. A file on `example.com` does not cover `auth.example.com`. The credential is saved under the domain of the login page, so if your users sign in at `auth.example.com`, that is the origin that has to publish the file.

There are two partial exceptions, both current as of this writing — platform behaviour does change, so check the vendor documentation before relying on either. On iOS, a wildcard entitlement (`webcredentials:*.example.com`) makes the file be fetched from your apex domain instead, covering subdomains. Android has no wildcard, though a statement file on the subdomain can `include` a central one elsewhere.

### Writing the files

Building the files themselves — Team IDs, bundle identifiers, package names, signing fingerprints, and the declaration your app has to make in return — is covered in [Write the App Association Files That Let Mobile Apps Autofill Your Login](/tutorials/mobile-apps/app-association-files). That tutorial is not Phase Two specific and applies to any Keycloak deployment.

### Uploading a file

1. Add and verify the custom domain, as described above.
2. Go to **Config > Resources** and find **App Association Files**.
3. Choose the domain, then upload the file for the platform you need.

The file is validated when you upload it. Uploads are rejected if they are not valid JSON, or if they are missing the fields the operating system requires — `webcredentials.apps` for Apple, `package_name` and `sha256_cert_fingerprints` for Android.

Changes reach the edge within about five minutes. **No deploy or cluster restart is needed**, unlike themes and extensions.

### Setting the change-password redirect

Password managers look for `/.well-known/change-password` to offer a "Change password" action on a saved entry, and when they flag a credential as compromised.

Enter the URL you want people sent to. It must be an `https` URL on the same domain — for example your account console, or an app-initiated password update. Leaving it empty means the path returns a `404`, which is valid: password managers simply treat the site as not advertising the convention.

### Verifying

Both platforms publish validators, so you can check what they actually see without shipping an app build:

```sh
curl https://app-site-association.cdn-apple.com/a/v1/auth.example.com
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://auth.example.com&relation=delegate_permission/common.get_login_creds"
```

Note that Apple serves association files through its own CDN and can take up to around 24 hours to pick up a change, so a fresh upload may verify against Google immediately while Apple still shows the previous version. The [tutorial](/tutorials/mobile-apps/app-association-files#step-5-verify-before-shipping-a-build) covers reading these responses, including how to bypass Apple's cache during development.

### Passkeys

The same files govern passkeys, not only saved passwords. A passkey is bound to a relying party ID — a domain — and that binding is fixed when the credential is created. Changing it later invalidates existing passkeys rather than migrating them, so if passkeys are on your roadmap, settle which domain hosts your login page before enrolling anyone.

:::tip On the Starter plan?
App association files need Premium or Enterprise. Your custom domains keep working exactly as they are — upgrading adds the ability to serve these files on them, and takes effect immediately with no downtime. [Compare plans](/pricing) or change your plan from **Clusters > Cluster > Config > Subscription**.
:::
