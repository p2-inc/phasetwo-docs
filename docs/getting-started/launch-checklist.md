---
id: launch-checklist
title: Go-Live Checklist
---

This page covers what to confirm before you move a Phase Two hosted cluster into production. Much of the underlying configuration is beyond the scope of a checklist, so each item links to the page that explains it. The goal is to make sure you have thought about each area, not to explain each one here.

As with any integration, we suggest keeping a separate realm — or a separate cluster — for development and testing, so there are no accidental changes affecting your users in production.

## Managed by Phase Two

Generic Keycloak hardening checklists include a number of items that are our responsibility on a hosted cluster, not yours. You do not need to do any of the following, and you can point a security reviewer at this list:

- TLS termination and enforcement at the edge, including protocol and cipher selection
- Certificate issuance and renewal for your [custom domains](../self-service/custom-domains.md)
- Keycloak hostname and proxy configuration
- Keycloak version patching and upgrades
- Clustering, node scaling, and session replication
- Distributed cache configuration and tuning
- Database provisioning, connection pooling, and tuning
- Database backups — see [Backups and Data Retention](../self-service/backups-and-data-retention.md)
- The master realm, which is not customer-accessible

Our compliance posture, including completed penetration tests, is published at [trust.phasetwo.io](https://trust.phasetwo.io/).

## Cluster and network

- **Region confirmed.** A cluster's [region](../self-service/regions.md) is set at creation and cannot be changed later. Check it against any data residency requirement before you launch.
- **Custom domain live.** Add your domain, complete the DNS validation and vanity records, and confirm the certificate has been issued. See [Custom Domains](../self-service/custom-domains.md).
- **Applications point at the final hostname.** Moving to a custom domain changes your token issuer, so applications validating the `iss` claim will reject tokens issued under the old hostname. Cut over before go-live rather than after.
- **Admin access restricted.** IP restrictions are the mechanism for limiting Admin Console access on a hosted cluster; there is no VPN option. Available on Premium and Enterprise — see [Cluster Restrictions](../self-service/restrictions.md).
- **Security headers reviewed.** Check the realm's Security Defenses settings — Content-Security-Policy, X-Frame-Options, and referrer policy — against how your applications embed or link to login pages.

## Realms and clients

- **Realms separated by purpose**, whether that is production versus testing, or one per tenant. Realm counts are capped by tier; see [Dedicated Clusters](../self-service/dedicated-clusters.md#realm-limits-by-tier).
- **Realm names finalized.** Realm names cannot be changed after creation. See [Realms](../self-service/realms.md).
- **Non-production isolated.** Deploying a theme or extension restarts the whole cluster, so a shared production and development cluster couples their restart windows. Consider a separate cluster if that matters to you.
- **Clients typed correctly** — confidential or public, with service accounts for machine-to-machine access. See [Securing Applications](/docs/securing-applications) and [Service Accounts](../api/service-accounts.md).
- **PKCE enforced on public clients.** Use public clients only where unavoidable, such as native and single-page applications.
- **Redirect URIs strictly defined.** Avoid wildcards.
- **Web Origins limited** to domains you control.
- **Protocol mappers reviewed** so tokens carry only the claims your applications need. Oversized tokens produce oversized headers, which can be rejected in transit. If you use [Organizations](/docs/organizations), check the size of the organization claims specifically.
- **Client secrets stored securely** and on a rotation schedule.

## Authentication

- **Password policy set** — see [Password Policy](../security/password-policy.md), and [Password Blacklist](../security/password-blacklist.md) if you want to reject common or breached passwords.
- **Multi-factor authentication enabled** where appropriate: [OTP](../authentication/otps.md), [WebAuthn](../authentication/webauthn.md), or [passkeys](../authentication/passkeys.md).
- **MFA enabled on administrator accounts**, not only end-user accounts.
- **Brute force detection enabled** and tuned to your traffic. See [Brute Force Detection](../security/brute-force-detection.md).
- **Bot protection on registration and login.** See [reCAPTCHA](../security/recaptcha.md).
- **Custom flows reviewed.** Confirm every alternative execution in a custom flow is deliberate and no path bypasses a step you rely on. See [Understanding Flows](../authentication/understanding-flows.md).
- **Default roles and permissions minimized.**
- **Break-glass admin account created.** Do not rename or remove the realm's `admin` user, which the dashboard's Console link depends on — setting _Email as username_ can rename it inadvertently. Create a second account with the `realm-management` client roles as a backup. See [Realms](../self-service/realms.md#issues-with-access-to-the-admin-console).

## Tokens and sessions

- **Access token lifespan** set deliberately, typically in the range of a few minutes to a quarter hour.
- **Session lifetimes set** — SSO Session Idle and Max, and the client session equivalents — and aligned with how long your applications expect a user to stay signed in.
- **Refresh token reuse disabled.** In Realm Settings, under Tokens, enable _Revoke Refresh Token_ and set _Refresh Token Max Reuse_ to `0` so a refresh token cannot be replayed.
- **Offline access limited** to clients that genuinely need it.
- **Logout implemented end to end**, including back-channel logout for clients, so a logout in one application takes effect in the others.

## Customization and extensions

- **Branding applied.** At minimum set your colors and logo so login screens reflect your brand. See [Customizing UI](./customizing-ui.md).
- **Email templates customized** with your messaging and branding. See [Email templates](./email.md).
- **Themes reviewed** for inline JavaScript, unsafe HTML, and anything that bypasses a login or validation step.
- **Extensions tested on a non-production cluster.** Extension checks on upload are advisory and do not block deployment, and an extension that fails on startup can stop your cluster from starting. See [Cluster Resources](../self-service/resources.md#automated-extension-checks).
- **Tier limits understood** for themes and extensions — custom extensions are not available on Starter. See [Cluster Resources](../self-service/resources.md#resource-limits-by-tier).

## Integrations

- **Email server configured and tested.** Without a working mail server, password reset and email verification fail. Confirm SPF and DKIM alignment for your sending domain. See [Email server configuration](./email.md).
- **Identity provider trust configured** — signature validation enabled, signing certificates current, and a plan for rotating them. See [SSO](/docs/sso) and [Identity Providers](/docs/organizations/identity-providers).
- **Directory reachable, if you use LDAP or Active Directory.** Your directory must be reachable from the public internet, and you must allowlist Phase Two's outbound addresses for your region. This is the most common cause of a failed directory integration. See [Egress IP Addresses](../self-service/egress-ip-addresses.md).
- **Directory connections encrypted** with LDAPS or StartTLS, using a least-privilege bind account.
- **Applications integrated and tested.** See [Securing Applications](/docs/securing-applications) and, if you are exposing user management to your customers, the [Admin Portal](/docs/admin-portal).

## Operations

- **Metrics reviewed.** Know where to find login volume, failure rates, error rates, and latency. See [Metrics](../self-service/metrics.md).
- **Logs accessible** to whoever will be on call. See [Logs](../self-service/logs.md).
- **Audit events understood.** Events are captured automatically on hosted clusters; you only need to configure something if you want them pushed to your own systems. See [Audit Logs](/docs/audit-logs) and [Webhooks](../audit-logs/webhooks.md).
- **External uptime check running** against your realm, alerting your team rather than relying on ours.
- **Realm configuration exported and kept in version control**, as a record of intended configuration.
- **Change windows understood.** Resource refreshes and environment variable changes both restart the cluster and run one at a time. See [Cluster Resources](../self-service/resources.md#deploying-resources-to-the-cluster) and [Environment Variables](../self-service/environment-variables.md#applying-changes).

## Commercial and support

- **Payment method and billing contacts current.** A failed payment puts a cluster on a path to deletion, so keep both up to date. See [Your Organization](../self-service/your-organization.md).
- **Cluster tier sized for production load**, with headroom for a launch spike.
- **Load testing coordinated with us in advance**, so we can confirm your cluster is sized for it and distinguish the test from an attack. Email [support@phasetwo.io](mailto:support@phasetwo.io).
- **Penetration testing scheduled with support**, if you plan to run one. It is not available on Starter clusters. See [Penetration Tests](../security/penetration-tests.md).
- **Support path documented internally** — who on your team contacts us, and how.

## Before you announce

Run the full user journey against a non-production realm, then repeat the critical paths against production:

- Registration, if you have it enabled
- Login, including every social and enterprise identity provider you configured
- Forgot password, through to the email arriving
- Email address verification
- MFA enrollment, then MFA login
- Token refresh across an access token expiry
- Logout, across more than one application if you have several
- Admin Console access using your break-glass account, not only the dashboard link
- Login and email rendering on mobile as well as desktop
