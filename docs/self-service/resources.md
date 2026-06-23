---
id: resources
title: Cluster Resources (Themes, Extensions, and Denylists)
---

Resources can be uploaded to your cluster for deployment to any Realm (deployment) in that cluster. A cluster resource is one of three types:

- **Theme** — a Keycloak theme for login, account, or email UI customization. Uploaded per Keycloak major version.
- **Extension** — a Keycloak server extension JAR (providers and SPI code). Uploaded per Keycloak major version.
- **Password Denylist** — a Password Denylist file that is not tied to a Keycloak major version. It uses a single direct file upload and shares the extension resource limit.

### Resource limits by tier

The resources available depend on your cluster tier:

| Tier       | Themes    | Extensions / Password Denylists |
| ---------- | --------- | ------------------------------- |
| Starter    | 1         | Not available — themes only     |
| Premium    | 1         | 1                               |
| Enterprise | Unlimited | Unlimited                       |

Your current usage is shown next to the **Resources** heading (for example, `0/1 themes`). On the Starter tier, only themes usage is shown, since custom extensions are not supported.

<img
src="/docs/resources/resources-overview.png"
alt="Resources Overview"
style={{ width: "100%", borderRadius: "8px" }}
/>

### Adding a resource

1.  Visit the `Cluster > Config > Resources` tab.
2.  Click **Add New Resource**. Give the resource a recognizable name (lowercase letters, numbers, hyphens, or underscores), for example `theme-customer-1-0-0`, and choose the resource type — Theme, Extension, or Password Denylist.

    On **Starter** clusters, Theme is the only available type; the Extension and Password Denylist options are shown but disabled, with a note that Starter clusters do not allow custom extensions.

    :::note Screenshot needed
    `resources-add-dialog.png` — the **Add a new cluster resource** dialog showing the Theme / Extension / Password Denylist type selection. Include a Starter-cluster variant showing the disabled Extension and Password Denylist options with the explanatory note.
    :::

3.  After the resource is created, upload the file.

    - **Themes and extensions** are uploaded per Keycloak major version. Activate a specific version (for example Keycloak 26 — only major versions are supported), click the upload icon, and select your file. The file must be a `.jar` file. Upload it for each Keycloak version you need it available on.
    - **Password Denylists** use a single, cluster-wide upload and are not tied to a Keycloak major version.

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

Once the refresh is complete, visit your Realm (deployment) and select the theme for use. For an extension, configure it in your Realm according to how the extension operates.

### Finding and filtering resources

The resources list supports searching by name and filtering by type (Themes, Extensions, Password Denylist), along with sorting and expand/collapse controls. Use these to quickly locate a resource on clusters with many entries.

### Managing resources

You can disable or enable a resource using the power icon on its card to activate or deactivate it on the cluster. Disabling is a good way to temporarily remove a resource without deleting it. Use the trash icon to remove the resource entirely.

<img
src="/docs/resources/resources-manage.png"
alt="Resources Manage"
style={{ width: "60%", borderRadius: "8px" }}
/>
