---
id: resources
title: Cluster Resources (Themes and Extensions)
---

Resources, like a theme or extension, can be uploaded to your cluster for deployment to any Realm (deployment) in that cluster.

Note: Premium clusters are limited to a single theme resource and no extensions. Enterprise clusters can have multiple themes and extensions.

<img
src="/docs/resources/resources-overview.png"
alt="Resources Overview"
style={{ width: "100%", borderRadius: "8px" }}
/>

### Uploading a Theme or Extension

1.  Start by visiting the `Cluster > Config > Resources tab`.
2.  If you have not already done so, create a `Resource`. A resource is a named entity that allows your upload the theme or extension for a specific Keycloak version. Give the name of the resource something recognizable, like `theme-customer-1-0-0`.

    <img
    src="/docs/resources/resources-add-new.png"
    alt="Resources Add New"
    style={{ width: "60%", borderRadius: "8px" }}
    />

3.  After the resource is created, you can upload the theme or extension. Activate a specific version, say Keycloak 26 (only major versions are supported) and then click the upload icon. Select your file and upload it. The file must be a .jar file.

    <img
    src="/docs/resources/resources-upload.png"
    alt="Resources Upload"
    style={{ width: "60%", borderRadius: "8px" }}
    />

4.  After the upload is complete, your resource is ready to be deployed to your cluster. Click the `Update Resources on Cluster` button to alert Phase Two staff to trigger loading this resource. Due to the way Keycloak manages themes and extensions, this requires are restart of your cluster (usually a zero-downtime operation). Keycloak staff review all resources before applying them to a cluster to ensure uptime and functionality.

    <img
    src="/docs/resources/resources-update-cluster.png"
    alt="Resources Update Cluster"
    style={{ width: "60%", borderRadius: "8px" }}
    />

5.  After the cluster has been restarted, you can visit your Realm (deployment) and select the theme for use. If using an extension, then you will need to configure the extension in your Realm based on the operation of the extension.

### Managing Resources

You can disable or enable resources using the power icon in the card. This will activate or deactivate the resource on the cluster. You can remove the resource entirely from your cluster using the trash icon. Disabling is a good way to temporarily remove a resource without deleting it.

<img
src="/docs/resources/resources-manage.png"
alt="Resources Manage"
style={{ width: "60%", borderRadius: "8px" }}
/>
