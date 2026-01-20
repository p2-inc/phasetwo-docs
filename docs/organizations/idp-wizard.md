---
id: idp-wizard
title: IdP Wizard
---

The Organization IdP Wizard allows members of an organization with appropriate permissions to self-manage their organization's identity providers. It allows users to set up and configure SAML and OIDC identity providers for their organization without requiring intervention from IT support or administrators.

### Create an IdP Wizard link

There are two mechanisms of creating an IdP Wizard link. Choosing one depends on how you wish to expose this to your users.

#### Admin UI

In the Admin UI, in the Organizations tab, when you select an organization, the upper right context menu allows you to select "Create IdP Wizard link". This will create an IdP Wizard link for the **default** organization user. This is a user that is created by default when the organization is created for the purpose of executing administrative tasks for the organization. It is not associated with a real member of the organization. It has full privileges within the organization, so be careful who and how this link is distributed. It will be active for 1 day following creation.

<figure>
<img src="/docs/organizations/wizard/idp-wizard-link.png" alt="IdP Wizard link creation in Keycloak Admin UI" className="max-w-3xl" />
  <figcaption>Create an IdP Wizard Link</figcaption>
</figure>

#### API

You can programmatically create IdP Wizard links for your users with the API. This allows you to create a link for a specific user. The portal itself will take care of restricting access based on that user's organization permissions. Please refer to the API documentation to [create a link for the organization's admin portal](/api/create-portal-link). Because this is an expiring link, it is recommended that you do not create the link until it has been selected in your application.

[API Link](/api/create-portal-link)
