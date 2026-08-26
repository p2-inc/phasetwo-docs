---
id: resources
title: Cluster Resources (Themes, Extensions, and Denylists)
---

Resources can be uploaded to your cluster for deployment to any Realm in that cluster. A cluster resource is one of three types:

- **Theme** — a Keycloak theme for login, account, or email UI customization. Uploaded per Keycloak major version.
- **Extension** — a Keycloak server extension JAR (providers and SPI code). Uploaded per Keycloak major version.
- **Password Denylist** — a list of passwords your users are not allowed to choose. It is not tied to a Keycloak major version and uses a single direct file upload. See [Password Blacklist](/docs/security/password-blacklist) for how denylists work in Keycloak.

### Resource limits by tier

The resources available depend on your cluster tier:

| Tier       | Themes    | Extensions                  | Password Denylists |
| ---------- | --------- | --------------------------- | ------------------ |
| Starter    | 1         | Not available — themes only | Unlimited          |
| Premium    | 1         | 1                           | Unlimited          |
| Enterprise | Unlimited | Unlimited                   | Unlimited          |

Password Denylists are not limited by tier. They are part of core Keycloak security rather than custom code, so you can upload as many as you need on any tier — including Starter, where custom extensions are not available.

Your current usage is shown next to the **Resources** heading (for example, `0/1 themes`). Denylists are shown as a plain count, since they are uncapped.

<img
src="/docs/resources/resources-overview.png"
alt="Resources Overview"
style={{ width: "100%", borderRadius: "8px" }}
/>

### Adding a resource

1.  Visit the `Cluster > Config > Resources` tab.
2.  Click **Add New Resource**. Give the resource a recognizable name (lowercase letters, numbers, and hyphens), for example `theme-customer-1-0-0`, and choose the resource type — Theme, Extension, or Password Denylist.

    Any type you have run out of is shown but disabled, so you can always see what a higher tier offers. On **Starter** clusters the Extension option is disabled, with a note that Starter clusters do not allow custom extensions; Theme and Password Denylist remain available.

    :::note Screenshot needed
    `resources-add-dialog.png` — the **Add a new cluster resource** dialog showing the Theme / Extension / Password Denylist type selection with their icons. Include a Premium-cluster variant where the extension limit is used, showing the disabled Extension option alongside an available Password Denylist.
    :::

3.  After the resource is created, upload the file.

    - **Themes and extensions** are uploaded per Keycloak major version. Activate a specific version (for example Keycloak 26 — only major versions are supported), click the upload icon, and select your file. The file must be a `.jar` file. Upload it for each Keycloak version you need it available on.
    - **Password Denylists** use a single, cluster-wide upload and are not tied to a Keycloak major version. The file must be a `.txt` file with one password per line.

    A denylist is deployed to your cluster using the name of the resource plus a `.txt` extension. A resource named `common-passwords` becomes `common-passwords.txt`, and that is the exact file name a realm's password policy must reference. The optional label on an upload is for display only and does not change the deployed file name.

    <img
    src="/docs/resources/resources-upload.png"
    alt="Resources Upload"
    style={{ width: "60%", borderRadius: "8px" }}
    />

### Deploying resources to the cluster

After your uploads are in place, click **Refresh Cluster Resources** to submit the deployment request. The latest valid resources are then copied to the cluster.

Because of the way Keycloak manages themes and extensions, this requires a restart of your cluster (usually a zero-downtime operation). Phase Two staff review all resources before they are applied to a cluster to help ensure uptime and functionality.

<img
src="/docs/resources/resources-update-cluster.png"
alt="Resources Update Cluster"
style={{ width: "60%", borderRadius: "8px" }}
/>

Once the refresh is complete, visit your Realm and select the theme for use. For an extension, configure it in your Realm according to how the extension operates. For a Password Denylist, use **Apply to Realm** as described below.

### Applying a Password Denylist to a realm

Uploading a denylist makes the file available on the cluster; a realm only uses it once its password policy references it. You can do this from the dashboard rather than the Keycloak Admin Console.

1.  Expand the denylist resource in the resources list and click **Apply to Realm**.
2.  The dialog lists the realms on your cluster and shows which denylist each one currently uses, if any.
3.  Click **Apply** on a realm to set this denylist as its password denylist, or **Remove** to clear it.

Applying a denylist adds `passwordBlacklist(<resource-name>.txt)` to that realm's password policy and leaves every other policy item untouched. If the realm already used a different denylist, it is replaced.

:::note
Apply the denylist only after **Refresh Cluster Resources** and the resulting restart have completed. Keycloak validates that the file exists on the server when the policy is set, so applying it earlier fails.
:::

A denylist that is in use cannot be deleted or disabled — remove it from the realm first. This prevents a realm being left with a password policy pointing at a file that is no longer on the cluster.

### Finding and filtering resources

The resources list supports searching by name and filtering by type (Themes, Extensions, Password Denylist), along with sorting and expand/collapse controls. Use these to quickly locate a resource on clusters with many entries.

### Managing resources

You can disable or enable a resource using the power icon on its card to activate or deactivate it on the cluster. Disabling is a good way to temporarily remove a resource without deleting it. Use the trash icon to remove the resource entirely.

<img
src="/docs/resources/resources-manage.png"
alt="Resources Manage"
style={{ width: "60%", borderRadius: "8px" }}
/>
