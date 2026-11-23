import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. FusionAuth — Phase Two",
  description:
    "FusionAuth vs Keycloak, compared on a running server: a closed-source core with 30 licensed features, against Apache 2.0 with none and no licence key.",
  keywords:
    "fusionauth vs keycloak, keycloak vs fusionauth, fusionauth alternative, fusionauth alternatives, fusionauth pricing, fusionauth community edition, is fusionauth open source, fusionauth license, keycloak alternative",
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
      Both have a free tier.{" "}
      <span className="grad">Only one of them is open source.</span>
    </>
  ),
  lede: (
    <>
      FusionAuth is a good identity server with excellent documentation, and its Community
      edition really is free for unlimited users. It is also <b>not open source</b>: the core is
      closed source, its own licence FAQ answers "Not currently" to whether you may modify it,
      and the product ships an API that enumerates the 30 features held behind a licence key.
      Keycloak is Apache 2.0 with no tiers, no licence key and no feature flag that costs money.
      Everything on this page was checked on <b>Keycloak 26.8.2</b> and{" "}
      <b>FusionAuth 1.71.1 Community</b>, both running locally on 23 November 2026.
    </>
  ),
  secondaryCta: { label: "What the free tier is missing →", href: "#reactor" },
  miniRows: [
    { feat: "Open-source licence", vendor: "no", keycloak: "yes" },
    { feat: "You may modify the server", vendor: "no", keycloak: "yes" },
    { feat: "Client credentials grant, unlicensed", vendor: "no", keycloak: "yes" },
    { feat: "SCIM 2.0 provisioning, unlicensed", vendor: "no", keycloak: "yes" },
    { feat: "LDAP / AD federation, unlicensed", vendor: "no", keycloak: "yes" },
    {
      feat: "Features behind a licence key",
      vendor: { label: "30", red: true },
      keycloak: { label: "0" },
    },
  ],
};

const atAGlance = [
  {
    dim: "Licence",
    vendor:
      "Proprietary. FusionAuth's licence FAQ says it has \"chosen a closed source model for the core product\" and that the fusionauth-app bundle \"cannot be decompiled or reverse engineered\". Client libraries, example apps and docs are Apache 2.0",
    keycloak: "Apache 2.0 throughout, server included",
    check: true,
  },
  {
    dim: "Can you modify it?",
    vendor: "The licence FAQ answers \"Not currently\"",
    keycloak: "Fork it, patch it, run the patch in production",
    check: true,
  },
  {
    dim: "Project governance",
    vendor: "Single vendor, FusionAuth Inc.",
    keycloak: "CNCF Incubating project, accepted 10 April 2023; multiple independent vendors",
    check: true,
  },
  {
    dim: "Free tier",
    vendor:
      "Community: free, self-hosted, unlimited users — with 30 features reported as licensed-only by the server's own /api/reactor/status",
    keycloak: "The whole server. No editions, no licence key, no phone home",
    check: true,
  },
  {
    dim: "Machine-to-machine",
    vendor: "Client credentials grant requires Entity Management, \"at least a Starter plan\"",
    keycloak: "Service account on any confidential client, out of the box",
    check: true,
  },
  {
    dim: "SCIM 2.0 provisioning",
    vendor: "scimServer is a licensed feature; listed under the Enterprise plan",
    keycloak: "SCIM 2.0 API in the 26.8.2 core, enabled per realm with one flag",
    check: true,
  },
  {
    dim: "Existing LDAP or Active Directory",
    vendor:
      "LDAP Connector, licensed. Authenticates at login and optionally migrates the user; no scheduled sync, and \"FusionAuth does not support pushing user profile data into LDAP\"",
    keycloak:
      "User storage provider with READ_ONLY / WRITABLE / UNSYNCED edit modes, periodic sync, group and role mappers, Kerberos bridge",
    check: true,
  },
  {
    dim: "Custom logic in a login flow",
    vendor: "Lambdas in JavaScript on GraalJS, plus webhooks. Advanced lambdas are licensed",
    keycloak: "Authenticator SPI; your Java runs in-process. The running server reports 139 provider interfaces",
  },
  {
    dim: "Multi-tenancy",
    vendor: "Tenants and applications, free in Community",
    keycloak: "Realms, plus Organizations in the 26.8.2 core and our open-source extension on top",
  },
  {
    dim: "Datastores to operate",
    vendor:
      "PostgreSQL 14+ (MySQL 8 works but \"FusionAuth only tests with PostgreSQL\"), plus optional Elasticsearch 7.6.1–7.17.x or OpenSearch 2.x for user search",
    keycloak: "One database. Postgres, MySQL, MariaDB, Oracle, MS SQL or TiDB",
    check: true,
  },
  {
    dim: "Managed option",
    vendor: "FusionAuth Cloud, priced by monthly active users; hosting is bundled into each paid tier",
    keycloak: "Any cloud or region you like, or a dedicated cluster at a fixed monthly price",
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
          FusionAuth is a real identity server and deserves to be treated as one. It is a single
          Java process against a database, it installs from a ZIP, DEB, RPM, Docker image or Helm
          chart, and it comes up fast. Its documentation is among the best in the category, its
          client libraries are Apache 2.0, and Kickstart — a JSON file the server reads on first
          boot to create tenants, applications, API keys and users — is a genuinely good idea that
          Keycloak's realm import only half matches.
        </p>
        <p>Verified on the versions above, both servers:</p>
        <ul>
          <li>Implement OpenID Connect, OAuth 2.0 and SAML 2.0, and serve SAML IdP metadata.</li>
          <li>Publish a discovery document, sign with RSA and ECDSA, and support PKCE.</li>
          <li>Federate to external OIDC and SAML providers plus the usual social logins.</li>
          <li>Run from a container with a database and nothing else required.</li>
          <li>Expose a complete administrative REST API, not a subset of the console.</li>
        </ul>
        <p>
          Two things genuinely favour FusionAuth, and we will not bury them. Its{" "}
          <b>multi-tenancy is in the free tier</b> — we created a second tenant on an unlicensed
          1.71.1 and it returned HTTP 200 — and its{" "}
          <b>extension model does not require Java</b>: lambdas are JavaScript evaluated on GraalJS,
          and a basic one installs through the API with no build step. If nobody on your team writes
          Java and you need custom logic in the login, that is a real advantage. Both points come
          back in the{" "}
          <a href="#verdict" className="ilink">
            last section
          </a>
          .
        </p>
        <p>
          What follows is the set of differences that change an architecture or a budget, and
          the first one is the word "open source".
        </p>
      </>
    ),
  },
  {
    id: "licence",
    kicker: "02 — Licence",
    title: "FusionAuth is free. It is not open source.",
    body: (
      <>
        <p>
          These get conflated constantly, including in comparison articles that put both products
          in an "open-source IAM" list. Free and open source are different claims, and FusionAuth
          itself is clear about which one it makes. Its{" "}
          <a
            href="https://fusionauth.io/license-faq"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            licence FAQ
          </a>{" "}
          says the company "has chosen a closed source model for the core product but open source
          many components as well", and that the source for the <code>fusionauth-app</code> bundle
          "cannot be decompiled or reverse engineered".
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>What</th>
              <th>Licence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">FusionAuth server (fusionauth-app)</td>
              <td>Proprietary, closed source</td>
            </tr>
            <tr>
              <td className="plan">Client libraries, example apps, documentation</td>
              <td>Apache 2.0</td>
            </tr>
            <tr>
              <td className="plan">Modifying the server</td>
              <td>FAQ answers "Not currently"</td>
            </tr>
            <tr>
              <td className="plan">Redistributing or hosting it for customers</td>
              <td>Paid; reselling needs a reseller licence</td>
            </tr>
            <tr>
              <td className="plan">All of Keycloak, server included</td>
              <td>Apache 2.0</td>
            </tr>
          </tbody>
        </table>
        <p>
          <b>For a lot of teams this changes nothing.</b> If you are logging users into your own
          product and you were never going to patch your IdP, a closed-source core is an
          abstraction you will never poke at. The question is whether you are one of the teams who
          will, and the honest answer is that most people cannot tell in advance. The cases we see
          are a security review that wants to read the authentication path, an auditor who asks for
          the code behind a control, a bug you need fixed this week rather than next release, and a
          regulator who requires a change to session handling nobody else wants. Each of those is an
          email to a vendor on one product and an afternoon on the other.
        </p>
        <p>
          There is a second-order effect worth naming. A closed core means the vendor is the only
          party who can support it. Keycloak's Apache 2.0 licence and{" "}
          <a
            href="https://www.cncf.io/projects/keycloak/"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            CNCF Incubating
          </a>{" "}
          status are why several independent companies — us included — can offer support,
          extensions and hosting for the same server. That is a different kind of bet about the next
          ten years than a single-vendor product, and it is also why it is easier to hire people who
          have already run it.
        </p>
      </>
    ),
  },
  {
    id: "reactor",
    kicker: "03 — The free tier",
    title: "The server will tell you what the free tier is missing",
    body: (
      <>
        <p>
          This is the part most comparisons guess at, and you do not have to. FusionAuth's licensed
          functionality is gated by a component called the Reactor, and the server exposes its
          state at <code>/api/reactor/status</code>. On a stock, unlicensed Community install the
          answer is a complete inventory of what you are not getting.
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`# FusionAuth 1.71.1 Community, kickstarted, no licence key
curl -s -H "Authorization: $API_KEY" http://localhost:9011/api/reactor/status

{"status":{
  "advancedIdentityProviders":"UNKNOWN",
  "advancedLambdas":"UNKNOWN",
  "advancedMultiFactorAuthentication":"UNKNOWN",
  "advancedOAuthScopes":"UNKNOWN",
  "advancedRegistration":"UNKNOWN",
  "applicationMultiFactorAuthentication":"UNKNOWN",
  "applicationThemes":"UNKNOWN",
  "breachedPasswordDetection":"UNKNOWN",
  "connectors":"UNKNOWN",
  "dPoP":"UNKNOWN",
  "entityManagement":"UNKNOWN",
  "intelligentMFA":"UNKNOWN",
  "scimServer":"UNKNOWN",
  "threatDetection":"UNKNOWN",
  "tokenExchange":"UNKNOWN",
  "webAuthn":"UNKNOWN",
  ... 14 more ...
  "licensed":false
}}`}</code>
        </pre>
        <p>
          Thirty entries, all <code>UNKNOWN</code>, <code>licensed: false</code>. Read the list
          rather than the count, because the interesting thing is <i>which</i> capabilities are on
          it. <code>dPoP</code> and <code>tokenExchange</code> are OAuth standards. <code>webAuthn</code>{" "}
          is passkeys. <code>connectors</code> is how you reach an existing directory.{" "}
          <code>scimServer</code> is how an enterprise customer provisions users into you.{" "}
          <code>entityManagement</code> is, as the next section shows, the client credentials grant.
        </p>
        <p>
          Two fairness notes. <code>webAuthn</code> is covered by the free{" "}
          <b>Licensed Community</b> plan, so passkeys cost nothing — but they do require registering
          for a key, pasting it into the admin UI, and an instance that can reach FusionAuth's
          servers, because "after you activate the license, FusionAuth connects to FusionAuth's
          servers to confirm the license." An air-gapped licence exists for installs that cannot.
          And several entries are things Keycloak genuinely does not have either, like IP reputation
          and user-agent reputation; FusionAuth's threat detection is a real product and we are not
          pretending otherwise.
        </p>
        <p>
          The equivalent list on Keycloak 26.8.2 is empty, because there is no such mechanism. Its
          feature flags exist to separate supported from preview, not paid from free. PAR, DPoP,
          CIBA, token exchange, passkeys, Kerberos, Organizations and the SCIM API are all{" "}
          <code>DEFAULT</code> — on, supported, free — in the server's own{" "}
          <code>serverinfo</code> output.
        </p>
      </>
    ),
  },
  {
    id: "m2m",
    kicker: "04 — Machine-to-machine",
    title: "The client credentials grant is a paid feature",
    body: (
      <>
        <p>
          Of everything on the Reactor list, this is the one that surprises people, so it is worth
          showing rather than describing. The OAuth 2.0 client credentials grant — a service getting
          a token for itself, the most ordinary request in a backend — is implemented in FusionAuth
          through Entities, and{" "}
          <a
            href="https://fusionauth.io/docs/get-started/core-concepts/entity-management"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            Entity Management
          </a>{" "}
          "requires at least a Starter plan". Here is what that looks like from the token endpoint
          of an unlicensed server:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`# FusionAuth 1.71.1 Community
curl -X POST http://localhost:9011/oauth2/token \\
  -d 'grant_type=client_credentials&client_id=...&client_secret=...'

HTTP 400
{"error":"not_licensed",
 "error_description":"The Entity Management feature of FusionAuth, which include
   the Client Credentials Grant, is only supported with a valid license",
 "error_reason":"not_licensed"}`}</code>
        </pre>
        <p>The same thing on a stock Keycloak container, start to finish:</p>
        <pre style={CODE_BLOCK}>
          <code>{`# Keycloak 26.8.2, stock container
kcadm.sh create clients -r master -s clientId=m2m \\
  -s serviceAccountsEnabled=true -s publicClient=false -s secret=s3cr3t

curl -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \\
  -d 'grant_type=client_credentials&client_id=m2m&client_secret=s3cr3t'

HTTP 200
{"access_token":"eyJ...", "expires_in":60, "token_type":"Bearer"}

# decoded
{"typ":"Bearer","azp":"m2m","preferred_username":"service-account-m2m",
 "scope":"email profile","aud":"account"}`}</code>
        </pre>
        <p>
          Two commands, no licence, no tier. The same pattern repeats across the Reactor list, and
          two more are worth pricing out because they are the ones enterprise customers ask for by
          name.
        </p>
        <p>
          <b>SCIM.</b> FusionAuth's SCIM server is a licensed feature and sits on the Enterprise
          plan. Keycloak 26.8.2 ships a SCIM 2.0 API in core — <code>SCIM_API</code> is a{" "}
          <code>DEFAULT</code> feature — and turning it on is one realm flag. We ran it:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`kcadm.sh update realms/master -s scimApiEnabled=true

curl -X POST -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/scim+json" \\
  -d '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],
       "userName":"ada","emails":[{"value":"ada@example.com","primary":true}]}' \\
  http://localhost:8080/realms/master/scim/v2/Users

{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],
 "id":"0fc1acda-ae4e-437a-a6e7-af4f0ec4026d",
 "meta":{"resourceType":"User",
   "location":".../scim/v2/Users/0fc1acda-ae4e-437a-a6e7-af4f0ec4026d"},
 "userName":"ada","active":true}`}</code>
        </pre>
        <p>
          One wrinkle the documentation does not lead with, and which cost us ten minutes: the
          bearer token must carry the SCIM base URL as an audience, so the calling client needs an
          audience mapper for{" "}
          <code>{`{base}/realms/{realm}/scim/v2`}</code> or every request answers{" "}
          <code>401 Invalid token audience</code>. Our{" "}
          <Link to="/blog/scim-explained/" className="ilink">
            SCIM explainer
          </Link>{" "}
          covers the protocol and the{" "}
          <Link to="/tutorials/scim/getting-started/" className="ilink">
            SCIM tutorial
          </Link>{" "}
          covers the setup; our{" "}
          <Link to="/extensions/organizations/" className="ilink">
            Keycloak organizations
          </Link>{" "}
          extension adds per-organization SCIM on top for B2B tenancy.
        </p>
        <p>
          <b>Token exchange.</b> <code>tokenExchange</code> is on FusionAuth's licensed list.
          Keycloak 26.8.2 advertises{" "}
          <code>urn:ietf:params:oauth:grant-type:token-exchange</code> in{" "}
          <code>grant_types_supported</code> at its default configuration, which you can confirm
          against any server with our{" "}
          <Link to="/tools/oidc-discovery/" className="ilink">
            OIDC discovery tool
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "directory",
    kicker: "05 — Directories",
    title: "If there is an LDAP or Active Directory, read this part twice",
    body: (
      <>
        <p>
          This is the difference most likely to turn into project weeks, and it is two differences
          stacked: whether you can use the feature at all, and what the feature does.
        </p>
        <p>
          <b>Availability.</b> Connectors are licensed. The shape of the gate is specific, and we
          tripped over it in a way that is worth repeating: on an unlicensed 1.71.1 you{" "}
          <i>can</i> create an LDAP connector object — it returns HTTP 200 — and you cannot attach
          it to a tenant.
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`PATCH /api/tenant/{tenantId}
{"tenant":{"connectorPolicies":[{"connectorId":"...","domains":["*"]}]}}

HTTP 400
{"fieldErrors":{"tenant.connectorPolicies[1].connectorId":[{
  "code":"[notLicensed]tenant.connectorPolicies.connectorId",
  "message":"You must activate the Reactor using a valid license
             before using this connector."}]}}`}</code>
        </pre>
        <p>
          So a proof of concept that stops at "the connector saved" has not proved anything. Wire it
          to a tenant before you believe it.
        </p>
        <p>
          <b>Behaviour.</b> Even licensed, an LDAP connector and a user storage provider are
          different designs for different problems:
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>Question</th>
              <th>FusionAuth LDAP Connector</th>
              <th>Keycloak user federation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">When does it talk to the directory?</td>
              <td>At login</td>
              <td>At login, and on a schedule</td>
            </tr>
            <tr>
              <td className="plan">Scheduled full / changed-user sync</td>
              <td>No</td>
              <td>Yes, both, with configurable periods</td>
            </tr>
            <tr>
              <td className="plan">Write changes back to the directory</td>
              <td>No — "FusionAuth does not support pushing user profile data into LDAP"</td>
              <td>Yes, in WRITABLE edit mode</td>
            </tr>
            <tr>
              <td className="plan">Groups and roles</td>
              <td>Reconcile lambda, re-applied at every login in authenticate-only mode</td>
              <td>Group and role mappers, persisted</td>
            </tr>
            <tr>
              <td className="plan">Users who have never logged in</td>
              <td>Invisible until first login</td>
              <td>Visible after sync; searchable in the admin console</td>
            </tr>
          </tbody>
        </table>
        <p>
          Neither is wrong. The connector is a clean just-in-time migration tool, and if your goal
          is to <i>leave</i> LDAP it may be exactly the right shape. But "the directory stays the
          system of record and the IdP keeps a synchronized, writable view of it" is a requirement a
          lot of enterprises have, and it is a Keycloak answer, not a FusionAuth one. Our{" "}
          <Link to="/tutorials/identity-providers/ldap/" className="ilink">
            LDAP federation tutorial
          </Link>{" "}
          walks the edit modes, and the{" "}
          <Link to="/docs/keycloak/idp/" className="ilink">
            Keycloak identity provider
          </Link>{" "}
          docs cover brokering to one instead.
        </p>
      </>
    ),
  },
  {
    id: "money",
    kicker: "06 — Cost",
    title: "Where the bill comes from, on each side",
    body: (
      <>
        <p>
          FusionAuth's pricing page, read on 23 November 2026 with its own slider at 1,000 monthly
          active users, lists Community free and self-hosted, <b>Starter from $162/month</b> billed
          annually, and <b>Essentials and Enterprise both from $2,970/month</b> billed annually.
          The paid tiers bundle hosting — basic, business and high-availability respectively — and
          the price moves with monthly active users.
        </p>
        <p>
          The number to plan against is not the entry price. It is the jump, and where your
          requirements land relative to it:
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>If you need…</th>
              <th>Cheapest FusionAuth tier</th>
              <th>Keycloak</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">Passkeys / WebAuthn</td>
              <td>Licensed Community (free, key required)</td>
              <td>Core</td>
            </tr>
            <tr>
              <td className="plan">Client credentials grant</td>
              <td>Starter</td>
              <td>Core</td>
            </tr>
            <tr>
              <td className="plan">LDAP or AD</td>
              <td>Starter</td>
              <td>Core</td>
            </tr>
            <tr>
              <td className="plan">Breached password detection</td>
              <td>Starter</td>
              <td>Not equivalent — a blacklist file you supply, not a hosted breach lookup</td>
            </tr>
            <tr>
              <td className="plan">Per-application themes</td>
              <td>Starter</td>
              <td>Core</td>
            </tr>
            <tr>
              <td className="plan">SCIM 2.0 server</td>
              <td>Enterprise</td>
              <td>Core on 26.8.2</td>
            </tr>
            <tr>
              <td className="plan">OAuth token exchange</td>
              <td>Enterprise</td>
              <td>Core</td>
            </tr>
            <tr>
              <td className="plan">DPoP sender-constrained tokens</td>
              <td>Licensed</td>
              <td>Core</td>
            </tr>
          </tbody>
        </table>
        <p>
          Read the right-hand column honestly too: "core" means the software costs nothing, not
          that the system costs nothing. Keycloak is a JVM application with a database, a cache, a
          release every few weeks and an upgrade path you have to walk. Running it well is a job,
          and the cost of that job is the real comparison against a bundled-hosting tier. Our view
          of where the line sits is in{" "}
          <Link to="/hosting/self-host-vs-managed/" className="ilink">
            self-hosting versus managed
          </Link>
          .
        </p>
        <p>
          What a fixed price buys that a per-MAU one does not is a forecast. A{" "}
          <Link to="/hosting/dedicated-clusters/" className="ilink">
            managed Keycloak
          </Link>{" "}
          cluster from $149/month does not re-price when a marketing campaign triples your signups,
          and adding SCIM for one enterprise customer does not move you onto a different plan. If
          residency is part of the decision, our{" "}
          <Link to="/hosting/eu-data-residency/" className="ilink">
            EU data residency
          </Link>{" "}
          page states where identity data sits and where it does not, including the parts that are
          not flattering.
        </p>
      </>
    ),
  },
  {
    id: "verdict",
    kicker: "07 — The verdict",
    title: "When you should not pick Keycloak",
    body: (
      <>
        <p>Pick FusionAuth when:</p>
        <ul>
          <li>
            <b>Nobody on the team writes Java</b> and you need real logic in the login. Lambdas on
            GraalJS are a lower wall than the authenticator SPI, and you can install one through the
            API with no build.
          </li>
          <li>
            <b>Multi-tenancy is the product and you are starting from nothing.</b> Tenants and
            applications are in the free tier and they are a cleaner model than realms.
          </li>
          <li>
            <b>You want the whole configuration in one file from day one.</b> Kickstart is a better
            answer than realm import, and it shows in how fast a FusionAuth environment is
            reproducible.
          </li>
          <li>
            <b>Your requirements sit inside Community and you expect them to stay there.</b> Free
            for unlimited users is a genuinely good offer if the Reactor list has nothing on it you
            want.
          </li>
          <li>
            <b>You want threat detection, IP and user-agent reputation as product features</b> rather
            than something you assemble from logs. Keycloak does not have an equivalent.
          </li>
        </ul>
        <p>Keycloak earns it when:</p>
        <ul>
          <li>
            <b>Open source is a requirement, not a preference</b> — because of procurement, an
            auditor, an air-gapped deployment, or because you intend to read and patch the code.
          </li>
          <li>
            <b>There is a directory.</b> Federation with writable edit modes, scheduled sync, group
            mapping and Kerberos is a large amount of work to not have to do.
          </li>
          <li>
            <b>Your roadmap has enterprise customers on it.</b> SAML, SCIM and token exchange all
            arrive as configuration rather than as a tier change.
          </li>
          <li>
            <b>Machine-to-machine traffic is most of your traffic.</b> Service accounts are free and
            unlimited, and there is no entity to model first.
          </li>
          <li>
            <b>You need to reach into the model.</b> 139 provider interfaces, and a custom
            authenticator that runs in-process rather than over a network hop — start at our{" "}
            <Link to="/tutorials/extending/first-spi/" className="ilink">
              first SPI tutorial
            </Link>
            .
          </li>
        </ul>
        <p>
          And the closing note that applies either way: the operations bill is real, and it is the
          one line item neither pricing page shows you. That is the argument for{" "}
          <Link to="/hosting/dedicated-clusters/" className="ilink">
            managed Keycloak
          </Link>{" "}
          at a fixed monthly price rather than a per-user meter — or, if you would rather run it
          yourself, for{" "}
          <Link to="/support/" className="ilink">
            support for teams who do
          </Link>
          . If you are still deciding, the rest of the{" "}
          <Link to="/keycloak-alternatives/" className="ilink">
            Keycloak alternatives
          </Link>{" "}
          comparisons are written the same way, and the{" "}
          <Link to="/tutorials/" className="ilink">
            Keycloak tutorials
          </Link>{" "}
          will tell you in an afternoon whether the server fits.
        </p>
      </>
    ),
  },
];

const matrix = {
  savings: "Fixed",
  savingsLabel: "monthly cost — no per-MAU meter, no licensed features",
  rows: [
    { feat: "Open-source licence (OSI)", vendor: "no", keycloak: "yes" },
    { feat: "You may modify the server", vendor: "no", keycloak: "yes" },
    { feat: "Vendor-neutral foundation governance", vendor: "no", keycloak: "yes" },
    { feat: "Self-hostable at no cost", vendor: "yes", keycloak: "yes" },
    { feat: "OIDC, OAuth 2.0 and SAML 2.0", vendor: "yes", keycloak: "yes" },
    { feat: "Client credentials grant, unlicensed", vendor: "no", keycloak: "yes" },
    { feat: "SCIM 2.0 server, unlicensed", vendor: "no", keycloak: "yes" },
    { feat: "OAuth token exchange, unlicensed", vendor: "no", keycloak: "yes" },
    { feat: "DPoP sender-constrained tokens, unlicensed", vendor: "no", keycloak: "yes" },
    { feat: "Passkeys without a licence key", vendor: "no", keycloak: "yes" },
    { feat: "LDAP / AD federation with sync and write-back", vendor: "no", keycloak: "yes" },
    { feat: "Extend without writing Java", vendor: "yes", keycloak: "lim" },
    { feat: "Multi-tenancy in the free tier", vendor: "yes", keycloak: "yes" },
    { feat: "Threat / reputation detection as a product feature", vendor: "yes", keycloak: "no" },
    { feat: "Managed, in any cloud or region you choose", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is FusionAuth open source?",
    a: (
      <p>
        No. FusionAuth's own licence FAQ says the company "has chosen a closed source model for the
        core product but open source many components as well". The <code>fusionauth-app</code>{" "}
        bundle is closed source and, per the same FAQ, "cannot be decompiled or reverse engineered";
        the FAQ also answers "Not currently" to whether you may modify the software. The client
        libraries, example applications and documentation are Apache 2.0. The Community edition is
        free and self-hostable for unlimited users, which is a different claim from being open
        source. Keycloak is Apache 2.0 throughout, server included.
      </p>
    ),
    text: "No. FusionAuth's licence FAQ says the company has chosen a closed source model for the core product but open sources many components. The fusionauth-app bundle is closed source and cannot be decompiled or reverse engineered, and the FAQ answers 'Not currently' to whether you may modify the software. Its client libraries, example applications and documentation are Apache 2.0. The Community edition is free and self-hostable for unlimited users, which is a different claim from being open source. Keycloak is Apache 2.0 throughout, server included.",
  },
  {
    q: "What is missing from the free FusionAuth Community edition?",
    a: (
      <p>
        The server will tell you. <code>GET /api/reactor/status</code> on an unlicensed FusionAuth
        1.71.1 returns 30 licensed capabilities, all <code>UNKNOWN</code>, with{" "}
        <code>licensed: false</code>. The list includes the client credentials grant (via Entity
        Management), the SCIM server, OAuth token exchange, DPoP, WebAuthn, connectors for LDAP,
        breached password detection, advanced MFA, per-application themes, advanced registration
        forms and threat detection. WebAuthn is covered by the free Licensed Community plan, so
        passkeys cost nothing but still require a licence key. Keycloak has no equivalent
        mechanism — its feature flags separate supported from preview, not paid from free.
      </p>
    ),
    text: "The server will tell you: GET /api/reactor/status on an unlicensed FusionAuth 1.71.1 returns 30 licensed capabilities, all UNKNOWN, with licensed false. The list includes the client credentials grant via Entity Management, the SCIM server, OAuth token exchange, DPoP, WebAuthn, LDAP connectors, breached password detection, advanced MFA, per-application themes, advanced registration forms and threat detection. WebAuthn is covered by the free Licensed Community plan, so passkeys cost nothing but still require a licence key. Keycloak has no equivalent mechanism.",
  },
  {
    q: "Does FusionAuth support the OAuth client credentials grant for free?",
    a: (
      <p>
        No. FusionAuth implements machine-to-machine access through Entities, and its documentation
        says Entity Management "requires at least a Starter plan". On an unlicensed 1.71.1 the token
        endpoint answers HTTP 400 with <code>error: not_licensed</code> and the message that the
        client credentials grant "is only supported with a valid license". In Keycloak you enable
        service accounts on a confidential client and request a token; it works on a stock container
        with no licence and no tier.
      </p>
    ),
    text: "No. FusionAuth implements machine-to-machine access through Entities, and its documentation says Entity Management requires at least a Starter plan. On an unlicensed 1.71.1 the token endpoint answers HTTP 400 with error not_licensed and a message that the client credentials grant is only supported with a valid license. In Keycloak you enable service accounts on a confidential client and request a token; it works on a stock container with no licence and no tier.",
  },
  {
    q: "Does Keycloak support SCIM, or does that need an extension?",
    a: (
      <p>
        Keycloak 26.8.2 ships a SCIM 2.0 API in the core. <code>SCIM_API</code> is a{" "}
        <code>DEFAULT</code> feature, you enable it per realm with <code>scimApiEnabled=true</code>,
        and the endpoints live at <code>/realms/&lt;realm&gt;/scim/v2/</code>. One detail that is
        easy to miss: the bearer token must carry the SCIM base URL as an audience, or requests
        answer <code>401 Invalid token audience</code>. On top of that, our open-source organizations
        extension adds per-organization SCIM provisioning for B2B tenancy. FusionAuth's SCIM server
        is a licensed feature on its Enterprise plan.
      </p>
    ),
    text: "Keycloak 26.8.2 ships a SCIM 2.0 API in the core. SCIM_API is a DEFAULT feature, you enable it per realm with scimApiEnabled=true, and the endpoints live at /realms/<realm>/scim/v2/. The bearer token must carry the SCIM base URL as an audience or requests answer 401 Invalid token audience. Phase Two's open-source organizations extension adds per-organization SCIM provisioning on top. FusionAuth's SCIM server is a licensed feature on its Enterprise plan.",
  },
  {
    q: "Can FusionAuth federate with LDAP or Active Directory like Keycloak does?",
    a: (
      <p>
        Not in the same way, and not on the free tier. FusionAuth's LDAP Connector is licensed — on
        an unlicensed instance you can create the connector but attaching it to a tenant fails with
        "You must activate the Reactor using a valid license before using this connector." Once
        licensed it authenticates at login and can migrate the user into FusionAuth, with a reconcile
        lambda mapping attributes; there is no scheduled synchronization, and FusionAuth's
        documentation states it "does not support pushing user profile data into LDAP". Keycloak
        federates the directory as user storage with READ_ONLY, WRITABLE and UNSYNCED edit modes,
        group and role mappers, periodic full and changed-user sync, and a Kerberos bridge.
      </p>
    ),
    text: "Not in the same way, and not on the free tier. FusionAuth's LDAP Connector is licensed; on an unlicensed instance you can create the connector but attaching it to a tenant fails with a message that you must activate the Reactor using a valid license. Once licensed it authenticates at login and can migrate the user into FusionAuth, with a reconcile lambda mapping attributes. There is no scheduled synchronization, and FusionAuth's documentation states it does not support pushing user profile data into LDAP. Keycloak federates the directory as user storage with READ_ONLY, WRITABLE and UNSYNCED edit modes, group and role mappers, periodic sync, and a Kerberos bridge.",
  },
  {
    q: "How much does FusionAuth cost compared to managed Keycloak?",
    a: (
      <p>
        Read on 23 November 2026 with FusionAuth's own pricing slider at 1,000 monthly active users,
        Community is free and self-hosted, Starter starts at $162/month billed annually, and
        Essentials and Enterprise both start at $2,970/month billed annually; paid tiers bundle
        hosting and the price moves with monthly active users. Phase Two's dedicated Keycloak
        clusters start at $149/month with unlimited users and no per-feature tiers, so the variable
        that moves your bill is cluster size rather than signups or which standards you turned on.
        Check both current pages before budgeting — these numbers change.
      </p>
    ),
    text: "Read on 23 November 2026 with FusionAuth's own pricing slider at 1,000 monthly active users, Community is free and self-hosted, Starter starts at $162/month billed annually, and Essentials and Enterprise both start at $2,970/month billed annually; paid tiers bundle hosting and the price moves with monthly active users. Phase Two's dedicated Keycloak clusters start at $149/month with unlimited users and no per-feature tiers, so the variable that moves your bill is cluster size rather than signups. Check both current pages before budgeting.",
  },
  {
    q: "Is FusionAuth a good alternative to Keycloak?",
    a: (
      <p>
        For some teams, yes. FusionAuth has excellent documentation, free multi-tenancy, a
        JavaScript extension model that does not require Java, and Kickstart for reproducible
        configuration. It is the better choice when nobody writes Java, when tenancy is the product,
        or when your requirements fit inside Community. It is the worse choice when open source is a
        requirement rather than a preference, when there is an existing LDAP or Active Directory, or
        when your roadmap has enterprise customers who will ask for SCIM — each of those is either
        a licence conversation or a tier change on FusionAuth and configuration on Keycloak.
      </p>
    ),
    text: "For some teams, yes. FusionAuth has excellent documentation, free multi-tenancy, a JavaScript extension model that does not require Java, and Kickstart for reproducible configuration. It is the better choice when nobody writes Java, when tenancy is the product, or when your requirements fit inside Community. It is the worse choice when open source is a requirement rather than a preference, when there is an existing LDAP or Active Directory, or when your roadmap has enterprise customers who will ask for SCIM.",
  },
];

const migration = {
  heading: "Evaluating both, or already on one?",
  body: "Moving between two standards-based identity servers is mostly client configuration and a user import. The expensive parts are the custom logic, whatever your directory is doing, and the password hashes. We will tell you plainly which of the two fits, including when the answer is not us.",
};

const bigcta = {
  heading: "One is free. One is open. Work out which you need.",
  body: "A 30-minute architecture review covering your directory, your tenancy model, your machine-to-machine traffic and the standards your customers will ask for — and a straight recommendation.",
};

export default function KeycloakVsFusionAuth() {
  return (
    <ComparisonLayout
      vendor="FusionAuth"
      slug="fusionauth"
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
