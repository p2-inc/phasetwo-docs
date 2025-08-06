---
id: sso
title: Enterprise SSO
---

The goal of enterprise SSO is to allow corporate or other organization users to securely access all of the applications and resources available to them with a single authentication. Support for SSO in this context is allowing organizations to use their own identity providers to authenticate with your application.

## Configuring SSO

This section isn't a full treatment of SSO, but is intended to provide an example setup for using organizations' SSO providers as part of your authentication flow.

### Identity provider setup

There is a section dedicated to [identity provider setup](/docs/sso/setup) that will be helpful to review here. We will assume you can use one of the methods documented there to set up a connection. This will be either working with an admin at your customer's organization, or allowing them to create the connection using our SSO wizards.

Once the identity provider setup is complete, note the alias in the **Identity providers** section.

### Organization setup

In the **Organizations** section, create a new organization or navigate to an existing one. In the **Identity Provider** tab of that organization, select the alias of the identity provider you create that you wish to associate with the organization.

<figure>
  <img src="/docs/orgs-list-assigned-idp.png" className="max-w-2xl"  alt="Organization Assigned IdP" />
  <figcaption>Assigned IdP</figcaption>
</figure>
<figure>
  <img src="/docs/orgs-find-and-assign-idp.png" className="max-w-2xl"  alt="Organization find and assign IdP" />
  <figcaption>Organization find and assign IdP</figcaption>
</figure>

In order to restrict the use of the identity provider to specific email domains associated with this organization, go to the **Settings** tab for the organization and add email domains owned by the organization.

<figure>
  <img src="/docs/organization-domain.png" className="max-w-2xl"  alt="Organization add domain" />
  <figcaption>Organization add domain</figcaption>
</figure>

### Flow

### Login UI

After binding the SSO flow to the _Browser flow_, go back and reload your login screen. You will see that there is only a field for the email address. This is so that the user must first provide an email address, if that email is associated with an organization's domain, then the user will be redirected to the organization's identity provider for authentication.
