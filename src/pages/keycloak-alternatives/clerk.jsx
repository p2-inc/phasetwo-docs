import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Clerk — Phase Two",
  description:
    "Clerk vs Keycloak compared: drop-in React components and one US region, against a self-hostable OIDC provider and SAML IdP with no per-connection meter.",
  keywords:
    "keycloak vs clerk, clerk vs keycloak, clerk alternative, clerk alternatives, clerk pricing, clerk self hosted, open source clerk alternative, clerk data residency, keycloak alternative",
};

const CODE_BLOCK = {
  background: "var(--bg-2)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "14px 16px",
  overflowX: "auto",
  fontSize: 12.5,
  lineHeight: 1.7,
  color: "var(--ink-2)",
  margin: "18px 0",
};

const hero = {
  variant: "B",
  headline: (
    <>
      Clerk ships the login screen.{" "}
      <span className="grad">Keycloak ships the identity provider.</span>
    </>
  ),
  lede: (
    <>
      These two are not really competing for the same job, and most comparisons blur that.
      Clerk gives a React or Next.js team the best drop-in authentication UI in the category
      and runs the whole thing for you, in the United States, as a closed-source service.
      Keycloak is Apache 2.0 software you run where you like that is a full OpenID Connect
      provider <i>and</i> a SAML identity provider, with no per-connection or per-organization
      meter attached. Checked against <b>Keycloak 26.8.2</b> on a running server and against
      Clerk's published documentation, pricing and security pages on 16 November 2026.
    </>
  ),
  secondaryCta: { label: "Where the bill comes from →", href: "#pricing" },
  miniRows: [
    { feat: "Drop-in UI components for your app", vendor: "yes", keycloak: "no" },
    { feat: "Issues SAML assertions to other apps", vendor: "no", keycloak: "yes" },
    { feat: "Choose the cloud and region you run in", vendor: "no", keycloak: "yes" },
    { feat: "Per-connection charge for enterprise SSO", vendor: { label: "$75/mo", red: true }, keycloak: { label: "none" } },
    { feat: "LDAP / Active Directory federation", vendor: "no", keycloak: "yes" },
    { feat: "PAR, CIBA, DPoP and mTLS-bound tokens", vendor: "no", keycloak: "yes" },
  ],
};

const atAGlance = [
  {
    dim: "What you get",
    vendor:
      "A hosted authentication service plus prebuilt UI components you render inside your own app",
    keycloak: "An identity server you deploy, with its own hosted login, account and admin consoles",
  },
  {
    dim: "Licence and source",
    vendor:
      "The service is proprietary and cloud-only. The client SDKs are MIT on GitHub; the server is not published",
    keycloak: "Apache 2.0, source and binaries, nothing gated behind a tier",
    check: true,
  },
  {
    dim: "Self-hosting",
    vendor: "Not offered",
    keycloak: "Any cloud, any region, on-premise, or a managed cluster at a fixed monthly price",
    check: true,
  },
  {
    dim: "Data residency",
    vendor:
      "\"Clerk does not offer regional data residency or region selection.\" Data is hosted on US infrastructure, with EU, UK and Swiss personal data transferred to the US under the Data Privacy Framework",
    keycloak: "You choose. Our EU clusters run in Frankfurt with Ireland as the standing backup",
    check: true,
  },
  {
    dim: "Pricing model",
    vendor:
      "Free to 50,000 monthly retained users; Pro $25/mo, Business $300/mo, then $0.02 per MRU above 50,000, plus per-connection, per-organization and per-domain add-ons",
    keycloak: "The software is free at any scale. Managed clusters are a fixed monthly price with unlimited users",
    check: true,
  },
  {
    dim: "Enterprise SSO for your customers",
    vendor:
      "SAML and OIDC as the service provider. One connection included per app; additional connections $75/mo each from the second to the fifteenth",
    keycloak: "Unlimited identity provider connections, per realm or per organization, at no incremental cost",
    check: true,
  },
  {
    dim: "Acting as an identity provider for third parties",
    vendor: "OAuth 2.0 and OIDC only, through OAuth Applications. No SAML assertion issuing",
    keycloak: "OIDC and SAML 2.0, with an IdP metadata descriptor published per realm",
    check: true,
  },
  {
    dim: "B2B organizations",
    vendor:
      "Mature, with prebuilt org switcher and profile components. 100 monthly retained organizations and 20 members per org included; beyond that a $100/mo add-on and per-organization pricing",
    keycloak: "Organizations is a default-on feature in 26.8, with per-organization identity providers and no member or organization cap",
  },
  {
    dim: "Existing LDAP or Active Directory",
    vendor: "Not supported",
    keycloak: "User storage federation with READ_ONLY, WRITABLE and UNSYNCED edit modes, plus a Kerberos bridge",
    check: true,
  },
  {
    dim: "Login UI customization",
    vendor:
      "CSS on the prebuilt components, or build the flow yourself against the low-level API. Clerk's docs: you may not change \"the HTML structure or the logic/ordering of how the authentication flow works\"",
    keycloak: "Themes override any login, account, admin, welcome or email template, and flows are composed from 42 authenticators",
    check: true,
  },
  {
    dim: "Framework coverage",
    vendor: "17 first-party SDKs, including Next.js, Expo, iOS, Android, Electron and Chrome extensions",
    keycloak: "Standards-based. Any OIDC library in any language, plus our own framework tutorials",
  },
  {
    dim: "Certifications",
    vendor: "SOC 2 Type 2 since 6 May 2022 and HIPAA. Clerk's security page states it is not ISO 27001 certified",
    keycloak: "Phase Two holds SOC 2 Type II and ISO/IEC 27001",
    check: true,
  },
];

const sections = [
  {
    id: "same",
    kicker: "01 — Common ground",
    title: "Start with what is not different",
    body: (
      <>
        <p>
          Plenty of the things a comparison page would normally make a fuss about are true of
          both. Neither choice is wrong because of any of these.
        </p>
        <ul>
          <li>
            <b>OpenID Connect and OAuth 2.0.</b> Both are OIDC providers your application can
            sign users into, and both can act as an OAuth 2.0 authorization server for
            third-party clients — Clerk through OAuth Applications, which support dynamic
            client registration, a consent screen and the device authorization grant, and
            Keycloak through its own client registration endpoint and device flow.
          </li>
          <li>
            <b>Social login.</b> Clerk documents more than two dozen named providers plus a custom
            OIDC option. A stock Keycloak 26.8.2 reports 11 built-in social providers and 17
            identity provider types in total, including generic <code>oidc</code>,{" "}
            <code>oauth2</code> and <code>saml</code> brokers for everything else. Clerk's
            catalogue is longer; Keycloak's generic brokers cover the gap with configuration.
          </li>
          <li>
            <b>MFA and passkeys.</b> Both support TOTP, SMS and WebAuthn. On Keycloak 26.8.2,{" "}
            <code>PASSKEYS</code> and <code>WEB_AUTHN</code> are default-on features. On Clerk,
            MFA is included on Pro and Business and absent from the free Hobby plan.
          </li>
          <li>
            <b>B2B organizations.</b> Both model tenants as first-class objects with roles,
            memberships and invitations, and both can attach an enterprise connection to one.
          </li>
          <li>
            <b>Getting your data back out.</b> Clerk is better at this than most of its peers
            and it deserves saying: the dashboard exports a CSV of your users{" "}
            <i>including their hashed passwords</i>, and <code>GET /v1/users</code> paginates
            the same data programmatically. That is not a given in this category.
          </li>
        </ul>
        <p>
          So the decision is not about feature counts. It is about who writes the login UI, who
          holds the data, what protocols you need to <i>speak</i> rather than consume, and what
          the bill does as you sell to larger customers.
        </p>
      </>
    ),
  },
  {
    id: "components",
    kicker: "02 — Developer experience",
    title: "The part where Clerk is simply better",
    body: (
      <>
        <p>
          If you are building a Next.js application and you want a working sign-in, sign-up,
          user profile and organization switcher this afternoon, Clerk wins and it is not
          close. Nothing in the Keycloak ecosystem is an equivalent.
        </p>
        <p>
          The difference is architectural, not cosmetic. Clerk's components render{" "}
          <i>inside your application</i> — <code>{"<SignIn />"}</code>,{" "}
          <code>{"<UserProfile />"}</code>, <code>{"<OrganizationSwitcher />"}</code> — against a
          per-application Frontend API, so the user never leaves your domain and you never
          build a settings page. Keycloak redirects the browser to the identity server, which
          hosts its own login pages and a separate account console at its own URL. Our{" "}
          <Link to="/docs/keycloak/account-console/" className="ilink">
            account console documentation
          </Link>{" "}
          describes what that console does; what it does not do is live inside your React tree.
        </p>
        <p>
          Clerk also has far more first-party platform coverage: 17 SDKs,
          including Expo, iOS, Android, Electron and Chrome extensions. Keycloak's answer is
          that it is a standards server and you bring your own OIDC library, which is true and
          is genuinely less work <i>per platform you have never used before</i> and more work
          on day one. We write that work down — see the{" "}
          <Link to="/tutorials/" className="ilink">
            Keycloak tutorials
          </Link>{" "}
          and the{" "}
          <Link to="/blog/native-login-keycloak-ios-android/" className="ilink">
            native login guide for iOS and Android
          </Link>{" "}
          — but writing it down is not the same as shipping a component.
        </p>
        <p>
          The ceiling is where it gets interesting. Clerk's own documentation is explicit about
          the trade: you can "modify the CSS for any part of the prebuilt components, but not
          the HTML structure or the logic/ordering of how the authentication flow works." To
          change the flow, you drop to custom flows built directly on the low-level API, and
          Clerk's docs say plainly that this "requires significant development effort to
          implement and maintain."
        </p>
        <p>
          Keycloak's equivalent ceiling is much higher and its floor is much lower. A{" "}
          <Link to="/extensions/themes/" className="ilink">
            Keycloak theme
          </Link>{" "}
          can override any template, message bundle or asset across the login, account, admin,
          welcome and email flows, and the flow itself is composed in the admin console from
          the 42 authenticators a stock 26.8.2 server reports — with 139 provider interfaces
          underneath if none of them do what you need. You will spend a day on FreeMarker that
          you would not have spent on a Clerk component. You will also never be told that the
          ordering of your login steps is not yours to change.
        </p>
      </>
    ),
  },
  {
    id: "protocols",
    kicker: "03 — Protocol surface",
    title: "Clerk is a SAML service provider, not a SAML identity provider",
    body: (
      <>
        <p>
          This is the single most common misreading of what Clerk does, and it decides the
          choice outright for some teams. Clerk's SAML support is{" "}
          <b>enterprise connections</b>: your customer's Okta, Entra ID or Google Workspace
          issues an assertion and Clerk consumes it so their employees can sign into{" "}
          <i>your</i> app. Every SAML page in Clerk's documentation sits under that heading,
          and its provider role for third parties — OAuth Applications — is OAuth 2.0 and OIDC
          only.
        </p>
        <p>
          Keycloak does both directions. The same realm that brokers an inbound connection also
          publishes an IdP metadata descriptor that any SAML service provider can consume:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`# Keycloak 26.8.2, stock container, no configuration
curl -s http://localhost:8080/realms/master/protocol/saml/descriptor

<md:EntityDescriptor entityID="http://localhost:8080/realms/master">
  <md:IDPSSODescriptor WantAuthnRequestsSigned="true" ...>
    <md:SingleSignOnService Binding="...bindings:HTTP-POST" .../>
    <md:SingleSignOnService Binding="...bindings:HTTP-Redirect" .../>
    <md:SingleSignOnService Binding="...bindings:SOAP" .../>
    <md:SingleSignOnService Binding="...bindings:HTTP-Artifact" .../>`}</code>
        </pre>
        <p>
          If anything in your estate needs to be signed into <i>by</i> your identity provider
          over SAML — an internal tool, a SaaS seat you administer, a vendor portal — Clerk
          cannot be that identity provider and Keycloak can, out of the box.
        </p>
        <p>
          The same gap shows up across the later OAuth work. The Keycloak column below is the
          discovery document of a stock 26.8.2 realm; "not documented" means the term returns
          no hits anywhere in Clerk's published documentation index.
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th></th>
              <th>Clerk</th>
              <th>Keycloak 26.8.2 at defaults</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">SAML identity provider</td>
              <td>No</td>
              <td>Yes — POST, Redirect, SOAP and Artifact bindings for SSO and SLO</td>
            </tr>
            <tr>
              <td className="plan">Pushed Authorization Requests (PAR)</td>
              <td>Not documented</td>
              <td>Advertised in the discovery document</td>
            </tr>
            <tr>
              <td className="plan">CIBA (decoupled authentication)</td>
              <td>Not documented</td>
              <td>Advertised in the discovery document</td>
            </tr>
            <tr>
              <td className="plan">DPoP and mTLS-bound access tokens</td>
              <td>Not documented</td>
              <td>
                <code>dpop_signing_alg_values_supported</code> and{" "}
                <code>tls_client_certificate_bound_access_tokens: true</code>
              </td>
            </tr>
            <tr>
              <td className="plan">Token exchange, JWT bearer, UMA ticket grants</td>
              <td>No</td>
              <td>All three in <code>grant_types_supported</code></td>
            </tr>
            <tr>
              <td className="plan">Device authorization grant</td>
              <td>Yes</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td className="plan">Dynamic client registration</td>
              <td>Yes, opt-in per instance</td>
              <td>Yes, per realm</td>
            </tr>
            <tr>
              <td className="plan">LDAP / Active Directory federation, Kerberos</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
          </tbody>
        </table>
        <p>
          Be fair about what that list means. Most applications never need PAR, CIBA or a UMA
          ticket, and a team that does not have a security reviewer asking for them is not
          worse off for their absence. The list matters at exactly one moment: when a customer
          sends you a questionnaire. Our{" "}
          <Link to="/docs/keycloak/idp/" className="ilink">
            Keycloak identity provider
          </Link>{" "}
          documentation covers the brokering side, and the{" "}
          <Link to="/tools/oidc-discovery/" className="ilink">
            OIDC discovery explorer
          </Link>{" "}
          will print the same document for any issuer, including your own.
        </p>
      </>
    ),
  },
  {
    id: "pricing",
    kicker: "04 — Cost",
    title: "The meter is not really users",
    body: (
      <>
        <p>
          Clerk's headline is generous and it is real: 50,000 monthly retained users free, on
          every plan including the free one, and an MRU only counts if the user comes back at
          least 24 hours after signing up. A consumer application with a large but quiet user
          table can run on Clerk for $25 a month for a long time. Say that plainly, because a
          comparison that pretends otherwise is not worth reading.
        </p>
        <p>
          The cost arrives somewhere else. It arrives when you start selling to companies.
          Clerk's published rate card, as of 16 November 2026:
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>Line</th>
              <th>Included</th>
              <th>Then</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">Plan</td>
              <td>Hobby free; Pro $25/mo; Business $300/mo</td>
              <td>Enterprise is custom and annual only</td>
            </tr>
            <tr>
              <td className="plan">Monthly retained users</td>
              <td>50,000 per app</td>
              <td>$0.02 each to 100,000, then $0.018, $0.015, $0.012</td>
            </tr>
            <tr>
              <td className="plan">Enterprise SSO connections</td>
              <td>1 per app on Pro and Business</td>
              <td>$75/mo each for 2–15, $60 for 16–100, $48 for 101–250</td>
            </tr>
            <tr>
              <td className="plan">Directory Sync (SCIM) connections</td>
              <td>1 per app on Pro and Business</td>
              <td>$75/mo each, billed from 1 January 2027</td>
            </tr>
            <tr>
              <td className="plan">B2B organizations</td>
              <td>100 monthly retained orgs, 20 members each</td>
              <td>$100/mo for unlimited members, plus $1 per org above 100</td>
            </tr>
            <tr>
              <td className="plan">Satellite domains</td>
              <td>—</td>
              <td>$10/mo each</td>
            </tr>
          </tbody>
        </table>
        <p>
          Work one example. A B2B SaaS with 20,000 monthly retained users — comfortably inside
          the free user allowance — 400 organizations, customers whose teams run past twenty
          seats, and ten enterprise customers who each want their own SAML connection:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`Pro plan                                      $   25
20,000 MRUs (50,000 included)                 $    0
10 SSO connections (1 included, 9 x $75)      $  675
B2B Authentication, unlimited members         $  100
400 orgs (100 included, 300 x $1)             $  300
                                              -------
                                              $1,100 / month`}</code>
        </pre>
        <p>
          Not one dollar of that is users. It is ten SAML connections and a few hundred tenants
          — which is to say, it is the thing that happens when the product succeeds. The same
          ten connections and the same four hundred organizations cost nothing incremental on
          Keycloak, because an identity provider instance and an organization are rows in a
          database you own rather than billable objects.
        </p>
        <p>
          Keycloak's own cost is honesty about operations: a JVM, a database, a cache, an
          upgrade cadence, and someone whose job it is to care. That is the trade, and it is why{" "}
          <Link to="/hosting/dedicated-clusters/" className="ilink">
            managed Keycloak
          </Link>{" "}
          exists at a fixed monthly price with unlimited users on every tier. If you would
          rather run it yourself, we{" "}
          <Link to="/support/" className="ilink">
            support teams who do
          </Link>
          , and the{" "}
          <Link to="/hosting/self-host-vs-managed/" className="ilink">
            self-host versus managed
          </Link>{" "}
          page argues both sides.
        </p>
      </>
    ),
  },
  {
    id: "residency",
    kicker: "05 — Where the data lives",
    title: "One region, and it is in the United States",
    body: (
      <>
        <p>
          Clerk's security page is unambiguous, and we would rather quote it than characterise
          it: <b>"Clerk does not offer regional data residency or region selection."</b> Data is
          hosted on US infrastructure — Google Cloud and Cloudflare, with all subprocessors in
          the USA — and "EU, UK, and Swiss personal data is transferred to the US under the
          Data Privacy Framework," under which Clerk has been self-certified since 22 February
          2024.
        </p>
        <p>
          For a great many applications that is a non-issue. For a European procurement team,
          or any buyer with a sectoral residency requirement, it is the end of the evaluation —
          not because the arrangement is unlawful, but because "we cannot choose a region" is an
          answer a questionnaire has no box for.
        </p>
        <p>
          Keycloak has no opinion about where it runs, which is the point: it runs where you
          put it. On our side of that, stated with the unflattering parts included —{" "}
          <Link to="/hosting/eu-data-residency/" className="ilink">
            EU data residency
          </Link>{" "}
          clusters run in Frankfurt with Ireland as the standing backup, identity data is never
          replicated outside the EU, realm signing keys for EU clusters are held in our KMS in
          the Frankfurt region, and we are not certified under the EU–US Data Privacy Framework
          and do not rely on it. The contracting party for EU and UK customers is Phase Two UK,
          Ltd, registered in England and Wales, company number 16815578. Phase Two, Inc. of
          Seattle is the parent company. Our control plane runs in the United States and our
          engineers are distributed globally, so administrative access to an EU cluster can
          come from outside the EU; that is a restricted transfer and we disclose it rather
          than hide it. The{" "}
          <Link to="/company/data-processing/" className="ilink">
            data processing agreement
          </Link>{" "}
          and our record of{" "}
          <Link to="/company/government-requests/" className="ilink">
            government requests
          </Link>{" "}
          are both published.
        </p>
        <p>
          On certifications the comparison is narrow and checkable. Clerk's security page
          reports SOC 2 Type 2 since 6 May 2022 and HIPAA, and states that Clerk "is not ISO
          27001 certified," noting that its infrastructure providers hold the certification
          and it does not. Phase Two holds both SOC 2 Type II and ISO/IEC 27001. If you want
          the longer argument about what residency does and does not buy you, we wrote{" "}
          <Link to="/blog/data-residency-vs-data-sovereignty-identity-provider/" className="ilink">
            data residency versus data sovereignty
          </Link>{" "}
          and{" "}
          <Link to="/blog/where-your-keycloak-data-lives/" className="ilink">
            where your Keycloak data lives
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "b2b",
    kicker: "06 — Multi-tenancy",
    title: "Organizations on both sides, priced differently",
    body: (
      <>
        <p>
          Both products model a tenant as a first-class object. Clerk's version is the more
          finished product: organization profiles, invitations, verified domains,
          just-in-time provisioning from an enterprise connection, roles and permissions
          defined once at application level, and prebuilt components for all of it. If your
          application is a B2B SaaS and you have not built any of that yet, Clerk hands you
          months of work.
        </p>
        <p>
          Keycloak's Organizations feature is younger and has no UI for your users at all —
          but it is a default-on feature in 26.8, and it is uncapped. Creating a tenant and
          binding its own SAML identity provider to it is three calls:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`# Keycloak 26.8.2. ORGANIZATION is enabled by default; the realm opts in.
kcadm.sh create realms -s realm=b2b -s enabled=true -s organizationsEnabled=true
kcadm.sh create organizations -r b2b -s name=acme -s alias=acme \\
  -s 'domains=[{"name":"acme.example","verified":false}]'
# -> Created new organization with id '686b2f25-...'

kcadm.sh create identity-provider/instances -r b2b -s alias=acme-okta \\
  -s providerId=saml -s enabled=true \\
  -s 'config.singleSignOnServiceUrl=https://acme.okta.example/sso/saml'

curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \\
  -d '"acme-okta"' \\
  "$KC/admin/realms/b2b/organizations/$ORG_ID/identity-providers"   # 204

# The connection now belongs to the organization:
{"alias": "acme-okta", "providerId": "saml", "enabled": true,
 "organizationLinks": [{"organizationId": "686b2f25-...",
                        "autoMembership": true,
                        "membershipType": "UNMANAGED"}]}`}</code>
        </pre>
        <p>
          Run that loop four hundred times and the bill does not move. The honest counterweight
          is that you have just inherited the tenant-management UI that Clerk would have given
          you. Our open-source{" "}
          <Link to="/extensions/organizations/" className="ilink">
            organizations extension
          </Link>{" "}
          exists because core Keycloak's version is deliberately minimal — it adds the
          administrative surface, outbound SCIM provisioning to downstream applications, and an{" "}
          <Link to="/product/adminportal/" className="ilink">
            admin portal
          </Link>{" "}
          your customers' own administrators can use. It is still not a React component you
          drop into your dashboard, and we are not going to pretend it is.
        </p>
        <p>
          One more asymmetry worth naming, because it catches B2B teams late: Clerk's free B2B
          allowance caps an organization at <b>20 members</b>. The first customer who buys
          thirty seats moves you onto the $100/mo add-on. Keycloak has no member cap, and no
          notion of a billable organization.
        </p>
      </>
    ),
  },
  {
    id: "verdict",
    kicker: "07 — Verdict",
    title: "When you should not pick Keycloak",
    body: (
      <>
        <p>Clerk is the better answer when:</p>
        <ul>
          <li>
            <b>You are building a React or Next.js product and your auth budget is a
            week.</b> Prebuilt components that render in your own app, 17 first-party SDKs,
            and no server to operate. Nothing in the Keycloak world competes with this on
            time-to-first-login.
          </li>
          <li>
            <b>Nobody on the team wants to run a JVM service with a database.</b> That is a
            real job, and choosing not to have it is a legitimate architectural decision.
          </li>
          <li>
            <b>You are consumer-facing with a modest number of returning users.</b> 50,000
            monthly retained users free, and MFA on a $25 plan, is hard to argue with.
          </li>
          <li>
            <b>You want user management, billing, bot protection and machine tokens from one
            vendor.</b> Clerk sells all of it as one product; assembling the equivalent around
            Keycloak is integration work.
          </li>
          <li>
            <b>Your residency answer is "the United States is fine."</b> If it genuinely is,
            then Clerk's single region is simplicity rather than a limitation.
          </li>
        </ul>
        <p>Keycloak earns it when:</p>
        <ul>
          <li>
            <b>Something needs SAML assertions issued, not just consumed.</b> Clerk cannot be
            your SAML identity provider. Keycloak publishes an IdP descriptor per realm with
            four bindings, at defaults.
          </li>
          <li>
            <b>Your enterprise customers each want their own connection.</b> Nine extra SAML
            connections is $675 a month on Clerk's published rate card and nothing on Keycloak.
            The same arithmetic applies to organizations and to Directory Sync connections from
            January 2027.
          </li>
          <li>
            <b>A buyer asks where the data sits.</b> Clerk's own page says it does not offer
            region selection. If you need Frankfurt, or a specific cloud, or your own
            datacentre, that is a requirement Clerk does not have a configuration for.
          </li>
          <li>
            <b>There is a directory.</b> LDAP and Active Directory federation with writable
            edit modes, plus Kerberos desktop SSO, is not something Clerk attempts.
          </li>
          <li>
            <b>The security questionnaire has a list.</b> PAR, CIBA, DPoP, mTLS-bound tokens,
            token exchange, <code>private_key_jwt</code> — all advertised in the discovery
            document on a stock server.
          </li>
          <li>
            <b>You want the option of leaving to be cheap.</b> Apache 2.0, your own database,
            no vendor who can reprice a meter you now depend on.
          </li>
        </ul>
        <p>
          The closing note that applies either way: moving off Clerk is unusually civilised —
          the CSV export carries hashed passwords, so a migration can preserve logins instead
          of emailing everybody a reset link. We have written that pattern up for other
          sources in{" "}
          <Link to="/blog/keycloak-slow-user-migration/" className="ilink">
            lazy user migration
          </Link>{" "}
          and{" "}
          <Link to="/blog/migrate-auth0-to-keycloak/" className="ilink">
            migrating from Auth0
          </Link>
          . Whether it is worth doing is a different question from whether it is possible, and
          for a happy Next.js team on 50,000 free users the answer is usually no. Compare the
          rest of the field on our{" "}
          <Link to="/keycloak-alternatives/" className="ilink">
            Keycloak alternatives
          </Link>{" "}
          index before deciding.
        </p>
      </>
    ),
  },
];

const matrix = {
  savings: "Fixed",
  savingsLabel: "monthly cost — no per-connection or per-organization meter",
  rows: [
    { feat: "Prebuilt UI components inside your app", vendor: "yes", keycloak: "no" },
    { feat: "First-party mobile and desktop SDKs", vendor: "yes", keycloak: "lim" },
    { feat: "Zero servers to operate", vendor: "yes", keycloak: "lim" },
    { feat: "Open source", vendor: "no", keycloak: "yes" },
    { feat: "Self-host or choose your cloud and region", vendor: "no", keycloak: "yes" },
    { feat: "Regional data residency", vendor: "no", keycloak: "yes" },
    { feat: "OpenID Connect provider", vendor: "yes", keycloak: "yes" },
    { feat: "SAML 2.0 identity provider", vendor: "no", keycloak: "yes" },
    { feat: "Consumes enterprise SAML / OIDC connections", vendor: "yes", keycloak: "yes" },
    { feat: "Unlimited enterprise connections at no extra cost", vendor: "no", keycloak: "yes" },
    { feat: "PAR, CIBA, DPoP and mTLS-bound tokens", vendor: "no", keycloak: "yes" },
    { feat: "Token exchange and JWT bearer grants", vendor: "no", keycloak: "yes" },
    { feat: "LDAP / Active Directory federation and Kerberos", vendor: "no", keycloak: "yes" },
    { feat: "B2B organizations with no member or tenant cap", vendor: "no", keycloak: "yes" },
    { feat: "Full template-level login customization", vendor: "no", keycloak: "yes" },
    { feat: "Reorder the authentication flow itself", vendor: "lim", keycloak: "yes" },
    { feat: "SOC 2 Type II and ISO 27001", vendor: "lim", keycloak: "yes" },
    { feat: "Export users with password hashes", vendor: "yes", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Keycloak a good alternative to Clerk?",
    a: (
      <p>
        It depends entirely on which half of Clerk you are buying. If you are buying the
        prebuilt React components and the absence of a server to run, Keycloak is not a
        like-for-like replacement and switching will cost you a login UI you did not have to
        write. If you are buying an identity provider — enterprise SSO for your customers,
        organizations, a token your backend can verify — then Keycloak does all of that, adds
        SAML assertion issuing, LDAP and Active Directory federation and the later OAuth
        profiles that Clerk does not document, runs in whatever region you choose, and has no
        per-connection or per-organization meter. The honest split: Clerk wins on time to first
        login, Keycloak wins on what the bill and the questionnaire look like two years in.
      </p>
    ),
    text: "It depends which half of Clerk you are buying. If it is the prebuilt React components and the absence of a server to run, Keycloak is not a like-for-like replacement. If it is an identity provider — enterprise SSO, organizations, a verifiable token — then Keycloak does all of that, adds SAML assertion issuing, LDAP and Active Directory federation and the later OAuth profiles Clerk does not document, runs in whatever region you choose, and has no per-connection or per-organization meter. Clerk wins on time to first login; Keycloak wins on what the bill and the security questionnaire look like two years in.",
  },
  {
    q: "Can you self-host Clerk?",
    a: (
      <p>
        No. Clerk is a hosted service and the server is not published; there is no self-hosted
        edition and no on-premise option. Clerk's client SDKs are MIT-licensed on GitHub, which
        is a different thing from the product being open source — the SDKs talk to Clerk's
        Frontend and Backend APIs and do nothing without them. Clerk's security page also
        states that it "does not offer regional data residency or region selection," so the
        hosting question and the residency question have the same answer. Keycloak is Apache
        2.0 end to end: run it on your laptop, in your own datacentre, in any cloud region, or
        hand it to a managed host.
      </p>
    ),
    text: "No. Clerk is a hosted service and the server is not published; there is no self-hosted edition and no on-premise option. Clerk's client SDKs are MIT-licensed on GitHub, which is different from the product being open source — they talk to Clerk's Frontend and Backend APIs and do nothing without them. Clerk's security page also states that it does not offer regional data residency or region selection. Keycloak is Apache 2.0 end to end and runs wherever you put it.",
  },
  {
    q: "Can Clerk act as a SAML identity provider?",
    a: (
      <p>
        No. Clerk's SAML support is enterprise connections, where Clerk is the{" "}
        <i>service provider</i>: your customer's Okta, Entra ID or Google Workspace issues the
        assertion and Clerk consumes it. Clerk can act as an OAuth 2.0 authorization server and
        OIDC provider for third-party clients through OAuth Applications, including dynamic
        client registration and the device authorization grant, but it does not issue SAML
        assertions to downstream applications. Keycloak does both: every realm publishes a SAML
        IdP metadata descriptor at{" "}
        <code>/realms/&#123;realm&#125;/protocol/saml/descriptor</code> with HTTP-POST,
        HTTP-Redirect, SOAP and HTTP-Artifact bindings for sign-on and single logout, on a
        stock server with no configuration.
      </p>
    ),
    text: "No. Clerk's SAML support is enterprise connections, where Clerk is the service provider: the customer's Okta, Entra ID or Google Workspace issues the assertion and Clerk consumes it. Clerk can act as an OAuth 2.0 authorization server and OIDC provider for third-party clients through OAuth Applications, including dynamic client registration and the device authorization grant, but it does not issue SAML assertions to downstream applications. Keycloak publishes a SAML IdP metadata descriptor at /realms/{realm}/protocol/saml/descriptor with HTTP-POST, HTTP-Redirect, SOAP and HTTP-Artifact bindings on a stock server.",
  },
  {
    q: "How much does Clerk cost compared to Keycloak?",
    a: (
      <p>
        Clerk is free to 50,000 monthly retained users, then $25/mo on Pro or $300/mo on
        Business plus $0.02 per additional user, which is cheap for a consumer application. The
        cost that surprises B2B teams is elsewhere: one enterprise SSO connection is included
        per app and additional connections are $75/mo each from the second to the fifteenth,
        Directory Sync connections are priced the same from 1 January 2027, and B2B
        organizations are free to 100 with a 20-member cap, after which there is a $100/mo
        add-on and $1 per organization. Ten SAML customers and four hundred tenants is
        roughly $1,100 a month before you have billed a single user. Keycloak charges nothing
        for connections, organizations or users at any scale; what it costs is operations,
        which is why managed clusters exist at a fixed monthly price.
      </p>
    ),
    text: "Clerk is free to 50,000 monthly retained users, then $25/mo on Pro or $300/mo on Business plus $0.02 per additional user. The cost that surprises B2B teams is elsewhere: one enterprise SSO connection is included per app and additional ones are $75/mo each from the second to the fifteenth, Directory Sync connections are priced the same from 1 January 2027, and B2B organizations are free to 100 with a 20-member cap, after which there is a $100/mo add-on and $1 per organization. Ten SAML customers and four hundred tenants is roughly $1,100 a month before billing a single user. Keycloak charges nothing for connections, organizations or users; what it costs is operations.",
  },
  {
    q: "Does Clerk offer EU data residency?",
    a: (
      <p>
        No. Clerk's security page states that "Clerk does not offer regional data residency or
        region selection", that data is hosted on US infrastructure with all subprocessors in
        the USA, and that "EU, UK, and Swiss personal data is transferred to the US under the
        Data Privacy Framework", under which Clerk self-certified effective 22 February 2024.
        The same page states Clerk holds SOC 2 Type 2 and HIPAA but "is not ISO 27001
        certified". Keycloak runs wherever you deploy it; our EU clusters run in Frankfurt with
        Ireland as the standing backup, identity data is never replicated outside the EU, and
        we publish the parts that are less flattering too — the control plane runs in the US
        and our engineers are distributed globally, so administrative access can come from
        outside the EU.
      </p>
    ),
    text: "No. Clerk's security page states that Clerk does not offer regional data residency or region selection, that data is hosted on US infrastructure with all subprocessors in the USA, and that EU, UK and Swiss personal data is transferred to the US under the Data Privacy Framework, self-certified effective 22 February 2024. The same page states Clerk holds SOC 2 Type 2 and HIPAA but is not ISO 27001 certified. Keycloak runs wherever you deploy it; Phase Two EU clusters run in Frankfurt with Ireland as the standing backup and identity data is never replicated outside the EU, while the control plane runs in the US and engineers are distributed globally.",
  },
  {
    q: "Can I migrate users from Clerk to Keycloak without password resets?",
    a: (
      <p>
        Usually yes, and Clerk makes this easier than most. The Clerk dashboard exports a CSV
        of your users that includes their hashed passwords, and{" "}
        <code>GET /v1/users</code> paginates the same records programmatically. Keycloak will
        verify those hashes once you give it a password hash provider that understands the
        algorithm Clerk stored them under — the same pattern we use for other sources. What
        does not come across is the session: Clerk manages sessions itself, so everyone signed
        in at cutover will be signed out, and anything you built on Clerk's prebuilt components
        has to be rebuilt against Keycloak's hosted pages or your own UI. Plan for that work
        rather than discovering it.
      </p>
    ),
    text: "Usually yes. The Clerk dashboard exports a CSV of users that includes their hashed passwords, and GET /v1/users paginates the same records programmatically. Keycloak will verify those hashes once you supply a password hash provider for the algorithm Clerk stored them under. What does not transfer is the session — Clerk manages sessions itself, so everyone signed in at cutover is signed out — and anything built on Clerk's prebuilt components must be rebuilt against Keycloak's hosted pages or your own UI.",
  },
];

const migration = {
  heading: "Evaluating both, or already on Clerk?",
  body: "Clerk exports your users with their password hashes, so the credential half of a move is tractable. The expensive half is the UI you no longer get for free, plus sessions, organizations and anything wired to Clerk's components. We will tell you plainly which of the two fits — including when the answer is to stay where you are.",
};

const bigcta = {
  heading: "Components, or control.",
  body: "A 30-minute architecture review covering your enterprise SSO roadmap, your tenancy model, where the data has to sit, and how much login UI you are willing to own — and a straight recommendation.",
};

export default function KeycloakVsClerk() {
  return (
    <ComparisonLayout
      vendor="Clerk"
      slug="clerk"
      accent="magenta"
      meta={meta}
      hero={hero}
      atAGlance={atAGlance}
      sections={sections}
      matrix={matrix}
      faqs={faqs}
      migration={migration}
      bigcta={bigcta}
    />
  );
}
