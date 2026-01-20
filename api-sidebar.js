module.exports = {
  api: [
    {
      type: "doc",
      id: "phase-two-admin-rest-api",
    },
    {
      type: "category",
      label: "Organizations",
      link: {
        type: "generated-index",
        title: "Organizations",
        slug: "/category/organizations",
      },
      items: [
        {
          type: "doc",
          id: "get-organizations",
          label: "Get organizations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-organization",
          label: "Create a new organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-organizations-count",
          label: "Get organizations count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-me",
          label: "Get orgs and roles for authenticated user (me)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-organization-by-id",
          label: "Get organization by id",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-organization",
          label: "Update this organization by id",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "delete-organization",
          label: "Delete the organization",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "create-portal-link",
          label: "Create a link for the organization's IdP Wizard",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-organization-config",
          label: "Get the global organization configuration for this realm",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-organization-config",
          label: "Update the global organization configuration for this realm",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "export-organizations",
          label:
            "Export organizations and their configurations into this realm",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "import-organizations",
          label:
            "Import organizations and their configurations into this realm",
          className: "api-method post",
        },
      ],
    },

    {
      type: "category",
      label: "Organization Attributes",
      link: {
        type: "generated-index",
        title: "Organization Attributes",
        slug: "/category/organization-attributes",
      },
      items: [
        {
          type: "doc",
          id: "get-organization-member-attributes",
          label: "Get attributes for a specific member of an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "add-organization-member-attributes",
          label:
            "Add or update attributes for a specific member of an organization",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "Organization Memberships",
      link: {
        type: "generated-index",
        title: "Organization Memberships",
        slug: "/category/organization-memberships",
      },
      items: [
        {
          type: "doc",
          id: "get-organization-memberships",
          label: "Get organization memberships",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-organization-memberships-count",
          label: "Get organization members count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "check-organization-membership",
          label: "Check if a user is a member of an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "add-organization-member",
          label: "Add an organization member",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "remove-organization-member",
          label: "Remove an organization member",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Organization Domains",
      link: {
        type: "generated-index",
        title: "Organization Domains",
        slug: "/category/organization-domains",
      },
      items: [
        {
          type: "doc",
          id: "get-organization-domains",
          label: "Get details for all domains owned by an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-organization-domain",
          label: "Get details for a domain owned by an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "verify-domain",
          label: "Start domain verification",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Organization Invitation",
      link: {
        type: "generated-index",
        title: "Organization Invitations",
        slug: "/category/organization-invitations",
      },
      items: [
        {
          type: "doc",
          id: "add-organization-invitation",
          label: "Create an invitation to an organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-organization-invitations",
          label: "Get organization invitations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-organization-invitation-count",
          label: "Get organization invitation count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-organization-invitation-by-id",
          label: "Get organization invitation by ID",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "remove-organization-invitation",
          label: "Remove a pending invitation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "resend-organization-invitation",
          label: "Resend an Organization Invitation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "invitations",
          label: "Get invitations for authenticated user (me)",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "accept-invitation",
          label: "Accept invitation for authenticated user (me)",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reject-invitation",
          label: "Reject invitation for authenticated user (me)",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Organization Roles",
      link: {
        type: "generated-index",
        title: "Organization Roles",
        slug: "/category/organization-roles",
      },
      items: [
        {
          type: "doc",
          id: "get-organization-roles",
          label: "Get roles for this organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-organization-role",
          label: "Create a new role for this organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "create-organization-roles",
          label: "Create new roles for this organization",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "delete-organization-roles",
          label: "Delete this organization roles",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "get-organization-role",
          label: "Get role for this organization by name",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-organization-role",
          label: "Update role for this organization",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "delete-organization-role",
          label: "Delete this organization role",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "get-user-organization-roles",
          label: "Get users with this organization role",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "check-user-organization-role",
          label: "Check if a user has an organization role",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "grant-user-organization-role",
          label: "Grant a user an organization role",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "revoke-user-organization-role",
          label: "Revoke an organization role from a user",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Active Organization",
      link: {
        type: "generated-index",
        title: "Active Organization",
        slug: "/category/active-organization",
      },
      items: [
        {
          type: "doc",
          id: "get-active-organization",
          label: "Get active organization for authenticated user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "switch-active-organization",
          label: "Switch active organization for authenticated user",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "Identity Providers",
      link: {
        type: "generated-index",
        title: "Identity Providers",
        slug: "/category/identity-providers",
      },
      items: [
        {
          type: "doc",
          id: "import-idp-json",
          label: "Import identity provider from uploaded JSON file",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-idps",
          label: "Get identity providers for this organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-idp",
          label: "Create a new identity provider for this organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "link-idp",
          label: "Link an existing identity provider to this organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "unlink-idp",
          label:
            "Unlink an existing and linked identity provider from this organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-idp",
          label: "Get identity provider for this organization by alias",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-idp",
          label: "Update identity provider for this organization by alias",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "delete-idp",
          label: "Delete the identity provider",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "get-idp-mappers",
          label: "Get mappers for identity provider",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "add-idp-mapper",
          label: "Add a mapper to identity provider",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-idp-mapper",
          label: "Get mapper by id for the identity provider",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-idp-mapper",
          label: "Update a mapper for the identity provider",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "delete-idp-mapper",
          label: "Delete a mapper for the identity provider",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Users",
      link: {
        type: "generated-index",
        title: "Users",
        slug: "/category/users",
      },
      items: [
        {
          type: "doc",
          id: "list-organizations-for-the-given-user",
          label: "List organizations for the given user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "list-organization-roles-for-the-given-user-and-org",
          label: "List organization roles for the given user and org",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "grant-a-user-organization-roles",
          label: "Grant a user organization roles",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "revoke-organization-roles-from-a-user",
          label: "Revoke organization roles from a user",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "create-magic-link",
          label: "Create a magic link to log in a user",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Events",
      link: {
        type: "generated-index",
        title: "Events",
        slug: "/category/events",
      },
      items: [
        {
          type: "doc",
          id: "create-event",
          label: "Create a new audit log event",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-webhooks",
          label: "Get webhooks",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-webhook",
          label: "Create a new webhook",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-webhooks-count",
          label: "Get webhooks count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-webhook-by-id",
          label: "Get webhook by id",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-webhook-secret-by-id",
          label: "Get webhook secret by id",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-webhook-send-by-id",
          label: "Get webhook send by id",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-webhook-sends",
          label: "Get webhook sends",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "get-payload-by-keycloak-type-and-id",
          label: "Get webhook payload",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-webhook",
          label: "Update this webhook by id",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "delete-webhook",
          label: "Delete the webhook",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "resend-webhook-by-id",
          label: "Resend the webhook",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-webhook-sends-by-keycloak-type-and-id",
          label: "Get all webhook sends triggered by a Keycloak event",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Attributes",
      link: {
        type: "generated-index",
        title: "Attributes",
        slug: "/category/attributes",
      },
      items: [
        {
          type: "doc",
          id: "get-realm-attributes",
          label: "Get realm attributes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-realm-attribute",
          label: "Create a new realm attribute",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "get-realm-attribute-by-key",
          label: "Get realm attribute by key",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-realm-attribute-by-key",
          label: "Update realm attribute by key",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "delete-realm-attribute",
          label: "Delete the realm attribute",
          className: "api-method delete",
        },
      ],
    },
  ],
};
