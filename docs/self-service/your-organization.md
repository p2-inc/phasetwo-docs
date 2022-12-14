---
id: your-organization
title: Organization
---

You can view and manage your organization for teams you are a member.

### Members

Select the **Members** link in the row next to your organization in order to manage and invite members. Members may be removed and edited in the list of members.

#### Invitations

New members may be invited by their email address by selecting the **Invite new member** button on the members list page.

#### Roles

Roles can be assigned at a high-level:
- Developer. Can see all details but cannot edit. Can use Deployments owned by this organization.
- Admin. Can see and edit all details. Can use Deployments owned by this organization.

Or fine-grained, where the names of the roles explain their functionality.

### SSO

If your organization wants to use its own identity provider to log into Phase Two self-service, you can set it up using our SSO wizards. Select the **SSO Setup** link in the row next to your organization and follow the steps for your Identity Provider vendor.

#### Domains

Phase Two self-service requires validated email domains in order to redirect authentication requests for your users. Create a domain using the **Domains** link in the row next to your organization. Once you have added a domain, you will be prompted to set up a DNS TXT record for the domain you have entered. The details for setting up that record can be found by selecting the **Setup** link in the row of the domain you added. Once you have added that record, return and select **Verify**. Because DNS records often take some time to propogate, please be patient, as verifiction may take up to 24 hours.

#### Automatic membership

Once you have configured SSO and verified an email domain, all users that authenticate using your identity provider will automatically be added to your organization.