---
id: your-organization
title: Teams (Organizations)
---

Teams, or Organizations, allow you to create a team to manage your Phase Two Deployments and Clusters. You can use the Teams link in the navigation to view and manage your organization for teams you are a member. Every realm and cluster also displays information about the associated team.

Visit the [Teams overview](https://dash.phasetwo.io/teams)

<figure>
  <img src="/docs/dashboard/teams.png" className="max-w-2xl"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Teams overview</figcaption>
</figure>

Click on a specific team to manage that team. This will allow you to view members, change details (names, etc), send invites, and setup SSO.

<figure>
  <img src="/docs/dashboard/teams.png" className="max-w-2xl"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Teams overview</figcaption>
</figure>

## Members

Select the **Members** tab to view members of an organization. You can search for a specific member (name, email).

<figure>
  <img src="/docs/dashboard/teams-details-members.png" className="max-w-2xl"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Team details members</figcaption>
</figure>

In the members list you can perform a couple of actions:

- Click the far right "\*\*\*" menu
  - **Edit roles**: change the roles a user has within a realm or cluster.
  - **Remove member**: removes their membership, does not delete their account. They will not longer be able to access any associated realms or clusters.
- Click the "realm" badges
  - **[Edit roles](#roles)**: change the roles a user has within a realm or cluster.

<figure>
  <img src="/docs/dashboard/team-members-actions.png" className="max-w-2xl"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Team member action</figcaption>
</figure>

## Roles

Roles can be assigned at a high-level:

- **View**. Can see all details but cannot edit. Can use realms owned by this organization.
- **Manage**. Can see and edit all details. Can use realms owned by this organization.

Or fine-grained, where the names of the roles explain their functionality.

<figure>
  <img src="/docs/dashboard/team-member-edit-roles.png" className="max-w-lg"  alt="Phase Two Dash Overview Add Realm" />
  <figcaption>Team member edit roles</figcaption>
</figure>

### View Roles

- `view-organization`: able to view the team
- `view-members`: able to view the members within a team
- `view-roles`: able to view roles within a team
- `view-invitations`: able to view invites within a team
- `view-identity-providers`: able to view IdPs within a team
- `view-clusters`: able to view the cluster(s) that a team owns

### Manage Roles

- `manage-organization`: able to manage the team
- `manage-members`: able to manage the members within a team
- `manage-roles`: able to manage roles within a team
- `manage-invitations`: able to issue and manage invites within a team
- `manage-identity-providers`: able to setup and managed IdPs within a team
- `manage-clusters`: able to manage the cluster(s) that a team owns

## SSO

If your organization wants to use its own identity provider to log into Phase Two self-service, you can set it up using our SSO wizards. Select the **SSO Setup** tab to take two paths to adding an IdP that can be used.

<figure>
  <img src="/docs/dashboard/team-sso.png" className="max-w-xl"  alt="Phase Two Team SSO" />
  <figcaption>Team SSO</figcaption>
</figure>

1. Use the **[IdP Wizard](../sso/wizards.md)**

<figure>
  <img src="/docs/dashboard/team-setup-sso.png" className="max-w-xl"  alt="Phase Two Team Setup SSO" />
  <figcaption>Team SSO setup</figcaption>
</figure>

2. Generate a link for an IT admin to use the IdP wizard

<figure>
  <img src="/docs/dashboard/teams-generate-sso-link.png" className="max-w-xl"  alt="Phase Two Team Generate SSO LInk" />
  <figcaption>Team SSO generate setup link</figcaption>
</figure>

Once setup, you can view the full representation of the IdP.

<figure>
  <img src="/docs/dashboard/team-sso-full-representation.png" className="max-w-xl"  alt="Phase Two Team SSO Full Representation" />
  <figcaption>Team SSO Full Representation</figcaption>
</figure>

## Invitations / Add Members

Invites are first class citizens, allowing you to add and manage the team.

<figure>
  <img src="/docs/dashboard/team-details-invites-no-invites.png" className="max-w-xl"  alt="Phase Two Team Invites" />
  <figcaption>Team invite list</figcaption>
</figure>

New members may be invited by their email address by selecting the **Invite new member** button on the members list page.

<figure>
  <img src="/docs/dashboard/teams-invite-member.png" className="max-w-xl"  alt="Phase Two Team Invites" />
  <figcaption>Team invite member button</figcaption>
</figure>

Invites can be pre-setup with specific roles.

<figure>
  <img src="/docs/dashboard/teams-invite-member-popup.png" className="max-w-xl"  alt="Phase Two Team Invites" />
  <figcaption>Team invite member email and roles</figcaption>
</figure>

After an invite has been sent, it will appear in the invite list. You can resent or remove an outstanding invite.

## Details + Domains

Phase Two teams can change their display name and associated domains. SSO requires validated email domains in order to redirect authentication requests for your users. Add domains using the form under the information group.

<figure>
  <img src="/docs/dashboard/team-details-view.png" className="max-w-xl"  alt="Phase Two Team Details View" />
  <figcaption>Team details view</figcaption>
</figure>

Once you have added a domain, you will be prompted to set up a DNS TXT record for the domain you have entered. The details for setting up that record can be found by within the "Domains" section.

Follow the instructions to add a `TXT` for validation. Once you have added that record, return and select **Verify Domain**. Because DNS records often take some time to propagate, please be patient, as verification may take up to 24 hours.

<figure>
  <img src="/docs/dashboard/team-domains-view.png" className="max-w-xl"  alt="Phase Two Team Domain View" />
  <figcaption>Team domains view</figcaption>
</figure>

## Automatic Team Membership

Once you have configured SSO and verified an email domain, all users that authenticate using your identity provider will automatically be added to your organization. They will be granted no roles by default.
