import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Zitadel — Phase Two",
  description:
    "Zitadel vs Keycloak, compared on the things that actually differ: Apache 2.0 against AGPL-3.0, LDAP federation, the extension model, and what each server advertises at its defaults.",
  keywords:
    "zitadel vs keycloak, keycloak vs zitadel, zitadel alternative, open source identity provider comparison, zitadel self-hosted, keycloak alternative, agpl identity server",
};

const hero = {
  variant: "B",
  headline: (
    <>
      Both are open source. <span className="grad">The license and the extension model decide it.</span>
    </>
  ),
  lede: (
    <>
      Most Keycloak comparisons turn on price and lock-in. Against Zitadel neither argument
      works: both are open source, both self-host, both speak OIDC, OAuth 2.0 and SAML. What
      actually separates them is the licence you inherit, how you federate users that already
      exist, and whether your custom login logic runs <b>inside</b> the server or on an endpoint
      you have to host. Checked against <b>Keycloak 26.8.1</b> and <b>Zitadel v4.20.0</b> on
      2 November 2026.
    </>
  ),
  secondaryCta: { label: "See what each one advertises →", href: "#defaults" },
  miniRows: [
    { feat: "Open source and self-hostable", vendor: "yes", keycloak: "yes" },
    { feat: "Permissive licence (Apache 2.0)", vendor: "no", keycloak: "yes" },
    { feat: "LDAP / AD federation with sync", vendor: "lim", keycloak: "yes" },
    { feat: "Extend it without writing Java", vendor: "yes", keycloak: "lim" },
    { feat: "Runs as one service plus a database", vendor: "lim", keycloak: "yes" },
    { feat: "Idle memory, quickstart as published", vendor: { label: "~249 MB" }, keycloak: { label: "~611 MB" } },
  ],
};

const atAGlance = [
  {
    dim: "Licence",
    vendor: "AGPL-3.0-only, with proto/ and the docs under Apache 2.0 and the login app and client SDKs under MIT; a commercial licence is sold alongside",
    keycloak: "Apache 2.0 throughout",
    check: true,
  },
  {
    dim: "Project governance",
    vendor: "Single-vendor project; contributions accepted only under Apache 2.0 while the distribution is AGPL",
    keycloak: "CNCF Incubating project, accepted 10 April 2023",
    check: true,
  },
  {
    dim: "Implementation",
    vendor: "Go, event-sourced on PostgreSQL 14-18",
    keycloak: "Java on Quarkus; postgres, mysql, mariadb, oracle, mssql or tidb",
  },
  {
    dim: "Deployment shape",
    vendor: "Published quickstart runs four containers: proxy, Go API, Next.js login app, PostgreSQL",
    keycloak: "One server process and one database",
    check: true,
  },
  {
    dim: "Login UI customization",
    vendor: "Console branding — logo, colours, font, watermark toggle. Past that you fork the MIT login app and run it yourself",
    keycloak: "Themes override any login, account or email template, deployed into the server",
    check: true,
  },
  {
    dim: "Existing LDAP or Active Directory",
    vendor: "LDAP configured as an identity provider: bind at login, attributes mapped at login",
    keycloak: "User storage provider with READ_ONLY / WRITABLE / UNSYNCED edit modes, periodic sync, and a Kerberos bridge",
    check: true,
  },
  {
    dim: "Custom logic in a login flow",
    vendor: "Actions v2 — Zitadel calls an HTTP endpoint you host, in any language",
    keycloak: "Authenticator SPI — your Java runs in-process; the running server reports 139 provider interfaces",
  },
  {
    dim: "Multi-tenancy",
    vendor: "Instances and organizations, in the core product",
    keycloak: "Realms, or one realm with the open-source Organizations extension",
  },
  {
    dim: "Audit trail",
    vendor: "Event-sourced: every state change is an event, and the event store is the system of record",
    keycloak: "Admin and user events in the database; retention and external sinks are configuration",
  },
  {
    dim: "Managed option",
    vendor: "Zitadel Cloud, billed by daily active users; EU, US, Switzerland and Australia",
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
          The arguments that carry a Keycloak comparison against a commercial platform — no
          per-user licence, no cloud-only deployment, source you can read — all apply to Zitadel
          too. It is a real open-source identity server, it self-hosts, and it is actively
          developed: 45 releases published so far in 2026 against Keycloak's 21.
        </p>
        <p>Both of them, verified on the versions above:</p>
        <ul>
          <li>Implement OpenID Connect, OAuth 2.0 and SAML 2.0, and serve SAML IdP metadata.</li>
          <li>Support the device authorization grant, JWT bearer, token introspection and revocation, and back-channel logout.</li>
          <li>Sign with EdDSA, RSA and ECDSA, and publish a discovery document at a well-known URL.</li>
          <li>Federate to external OIDC and SAML providers, plus the usual social logins.</li>
          <li>Do SCIM 2.0 — Zitadel in the core product, Keycloak through the open-source Organizations extension we maintain.</li>
        </ul>
        <p>
          So the honest version of this page is not "Zitadel is the cheap option and Keycloak is
          the real one." Zitadel is genuinely better at several things, and we say which in the{" "}
          <a href="#verdict" className="ilink">last section</a>. What follows is the set of
          differences that actually change an architecture.
        </p>
      </>
    ),
  },
  {
    id: "licence",
    kicker: "02 — Licence",
    title: "Apache 2.0 and AGPL-3.0 are not the same offer",
    body: (
      <>
        <p>
          This is the first real fork and the one most comparisons skip. Keycloak is Apache 2.0.
          Zitadel's server is <b>AGPL-3.0-only</b>, and the repository's own{" "}
          <a
            href="https://github.com/zitadel/zitadel/blob/main/LICENSING.md"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            LICENSING.md
          </a>{" "}
          is the authority on the carve-outs.
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
              <td className="plan">Zitadel server</td>
              <td>AGPL-3.0-only</td>
            </tr>
            <tr>
              <td className="plan">proto/ and the documentation</td>
              <td>Apache 2.0</td>
            </tr>
            <tr>
              <td className="plan">The login app and the client/proto packages</td>
              <td>MIT</td>
            </tr>
            <tr>
              <td className="plan">Inbound contributions</td>
              <td>Apache 2.0 only — the project will not accept them under the AGPL it ships</td>
            </tr>
            <tr>
              <td className="plan">All of Keycloak</td>
              <td>Apache 2.0</td>
            </tr>
          </tbody>
        </table>
        <p>
          <b>For most teams this changes nothing.</b> Running an unmodified Zitadel to log users
          into your product is use, not distribution. The AGPL's network clause bites when you{" "}
          <i>modify</i> the server and let third parties interact
          with your modified version over a network. At that point you owe those users the
          corresponding source, and the licence reaches the "work based on the Program", a
          boundary that is argued rather than settled. Zitadel's own licensing policy says
          plainly that determining compliance is your responsibility and recommends legal
          counsel, and its self-hosting page sells a commercial agreement that replaces the AGPL
          so that you can, in its words, "keep your modifications private".
        </p>
        <p>
          That is a reasonable position, and it is also the thing to notice: under AGPL the
          upstream vendor is the only party who can relieve you of the obligation, and the
          Apache-2.0-inbound rule is what keeps them able to. Apache 2.0 has no equivalent
          conversation, and that matters most to exactly the teams who are likeliest to need it:
          anyone shipping identity inside an appliance, embedding it in a product, or patching
          the server to fit a regulator.
        </p>
      </>
    ),
  },
  {
    id: "defaults",
    kicker: "03 — Defaults",
    title: "What each server advertises out of the box",
    body: (
      <>
        <p>
          We started both at their published quickstarts and read the discovery documents. No
          tuning, no feature flags, defaults only. Keycloak's document carries 56 keys, Zitadel's
          29. Reproduce it in two commands:
        </p>
        <pre
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--line)",
            borderRadius: 10,
            padding: "14px 16px",
            overflowX: "auto",
            fontSize: 12.5,
            lineHeight: 1.7,
            color: "var(--ink-2)",
            margin: "18px 0",
          }}
        >
          <code>{`# Keycloak 26.8.1
curl -s http://localhost:8080/realms/master/.well-known/openid-configuration

# Zitadel v4.20.0
curl -s http://localhost:8080/.well-known/openid-configuration`}</code>
        </pre>
        <table className="ptable">
          <thead>
            <tr>
              <th>Advertised at defaults</th>
              <th>Zitadel v4.20.0</th>
              <th>Keycloak 26.8.1</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="plan">Authorization code + PKCE</td><td>S256 only</td><td>S256 and plain</td></tr>
            <tr><td className="plan">Hybrid flow (code id_token)</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Resource owner password grant</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Token exchange (RFC 8693)</td><td>not advertised</td><td>advertised</td></tr>
            <tr><td className="plan">CIBA</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Pushed authorization requests</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">DPoP</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">mTLS client auth and bound tokens</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Dynamic client registration</td><td>off by default</td><td>on</td></tr>
            <tr><td className="plan">iss in the authorization response (RFC 9207)</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Front-channel logout</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">ui_locales advertised</td><td>22 locales</td><td>not advertised</td></tr>
          </tbody>
        </table>
        <p>
          <b>Read that table carefully, because a discovery document is not a feature list.</b>{" "}
          Two of those rows prove it in opposite directions. Zitadel <i>does</i> implement RFC
          8693 token exchange and RFC 7591 dynamic client registration — the registration
          endpoint only appears in discovery once it is turned on in the instance's security
          settings, which is visible in the server source, and token exchange is enabled per
          application rather than globally. Going the other way, Keycloak advertises the token
          exchange grant, but the legacy flavour that covers brokering and impersonation is still
          a preview feature and is disabled unless you ask for it. Both servers can do more than
          they say, and one of them says more than it does.
        </p>
        <p>
          What the table is good for is the shape of each project. Keycloak's defaults carry the
          later OAuth hardening work — PAR, DPoP, mTLS-bound tokens, RFC 9207 — because large
          regulated deployments ask for it, and it also still ships the password grant, which
          Zitadel does not and which you should not be using either. Zitadel's defaults are
          narrower and in two places safer: S256-only PKCE and no ROPC are the choices you would
          make yourself.
        </p>
      </>
    ),
  },
  {
    id: "extending",
    kicker: "04 — Extensibility",
    title: "In-process Java, or an endpoint you host",
    body: (
      <>
        <p>
          Every identity project eventually needs logic that is specific to you: a check against
          an internal system before a user is created, a claim computed from somewhere else, a
          step in the login that nobody else has. The two answers are different enough to decide
          the whole choice.
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th></th>
              <th>Zitadel — Actions v2</th>
              <th>Keycloak — SPI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">Where your code runs</td>
              <td>On an HTTP endpoint you host and operate</td>
              <td>Inside the server process</td>
            </tr>
            <tr>
              <td className="plan">Language</td>
              <td>Anything that serves a POST</td>
              <td>Java, packaged as a JAR</td>
            </tr>
            <tr>
              <td className="plan">To deploy a change</td>
              <td>Deploy your endpoint. Zitadel is untouched</td>
              <td>Rebuild and restart the server</td>
            </tr>
            <tr>
              <td className="plan">Cost on the login path</td>
              <td>A network round trip, plus the failure modes of one</td>
              <td>A method call</td>
            </tr>
            <tr>
              <td className="plan">Reach</td>
              <td>The request, the response, defined functions and events</td>
              <td>139 provider interfaces on the running server — storage, authenticators, mappers, policies</td>
            </tr>
            <tr>
              <td className="plan">What breaks on upgrade</td>
              <td>Your contract with a documented API</td>
              <td>Your JAR, against internal interfaces that are not a stable API</td>
            </tr>
          </tbody>
        </table>
        <p>
          If your team does not write Java, Zitadel's model is the better one and it is not close.
          Nothing in the server has to be rebuilt, the blast radius of a bad action is an endpoint
          you can roll back, and a Go or TypeScript shop stays in its own language.
        </p>
        <p>
          The price is that the extension point is now a service: it needs to be deployed, kept
          up, authenticated, and kept fast enough to sit in a login. If it is down, the thing it
          was guarding is down with it. Keycloak's answer has the opposite shape: nothing extra
          to operate, no round trip, and far deeper access to the model, in exchange for writing
          Java and for a provider that can break on an upgrade because the SPIs it binds to are
          internal. One is an integration problem, the other is a maintenance problem. Pick the
          one your team already knows how to carry.
        </p>
      </>
    ),
  },
  {
    id: "users",
    kicker: "05 — Users",
    title: "The users you already have, somewhere else",
    body: (
      <>
        <p>
          If every user will be created in the new system, skip this section. If they live in
          Active Directory or an LDAP server today, it is probably the deciding one.
        </p>
        <p>
          Zitadel treats LDAP as an <b>identity provider</b>. Its own documentation describes the
          login sequence: connect, bind with the service account, search for the user DN, bind
          again as that user with the submitted password, map attributes. It is authentication at
          login time. It is correct, simple, and tied to the LDAP server being reachable at the
          moment someone signs in.
        </p>
        <p>
          Keycloak treats LDAP as <b>user storage</b>, which is a different thing. Users are
          imported or read through, and the provider's edit mode decides which way writes flow:
        </p>
        <ul>
          <li><b>READ_ONLY</b> — the directory is authoritative; attributes and passwords cannot be changed through Keycloak.</li>
          <li><b>WRITABLE</b> — changes to mapped attributes and to passwords are written back to LDAP.</li>
          <li><b>UNSYNCED</b> — changes are kept in Keycloak's database for an administrator to reconcile, which is how you add attributes to users held in a directory you are not allowed to write to.</li>
        </ul>
        <p>
          On top of that sit LDAP mappers for groups and roles, a periodic full sync and a
          changed-users sync, and a Kerberos bridge for desktop single sign-on. Verified against
          the Keycloak 26.8.1 server administration guide.
        </p>
        <p>
          The practical difference: an organization with an existing directory, group-derived
          authorization and desktop SSO gets all of that from Keycloak as configuration. With
          Zitadel the login works and the rest is yours to build, through the provisioning APIs,
          SCIM, or an action. Our{" "}
          <Link to="/docs/keycloak/idp/" className="ilink">
            Keycloak identity provider
          </Link>{" "}
          documentation covers the brokering side, and{" "}
          <Link to="/blog/scim-explained/" className="ilink">
            SCIM explained
          </Link>{" "}
          covers the provisioning side.
        </p>
      </>
    ),
  },
  {
    id: "verdict",
    kicker: "06 — Verdict",
    title: "When you should not pick Keycloak",
    body: (
      <>
        <p>Zitadel is the better answer when:</p>
        <ul>
          <li>
            <b>Footprint matters.</b> Idle, immediately after start, on a 2-CPU 8 GB machine: the
            four containers of Zitadel's published compose stack came to about 249 MB, Keycloak's
            quickstart to about 611 MB. There are caveats in both directions. Keycloak sizes its heap from
            the memory limit it is given, and that figure is development mode with an embedded
            database while Zitadel's includes a real PostgreSQL. But a Go binary against a JVM
            is a real difference, and in a homelab or a small edge deployment it is the one you
            feel first.
          </li>
          <li>
            <b>You are building multi-tenant SaaS and do not want to think about it.</b>{" "}
            Instances and organizations are in the core product. Keycloak's realm model does not
            stretch to a realm per customer, which is why we maintain an{" "}
            <Link to="/extensions/organizations/" className="ilink">
              organizations extension
            </Link>{" "}
            and wrote up the{" "}
            <Link to="/blog/multi-tenancy-options-keycloak/" className="ilink">
              multi-tenancy options
            </Link>{" "}
            in full.
          </li>
          <li>
            <b>Audit is a requirement rather than a feature.</b> Event sourcing means the history
            is the storage model, not a log you enabled. Keycloak can get you there, but{" "}
            <Link to="/blog/scaling-keycloak-event-storage/" className="ilink">
              event storage is something you have to plan for
            </Link>
            .
          </li>
          <li>
            <b>Nobody on the team writes Java</b>, and the custom logic is more than a mapper.
          </li>
          <li>
            <b>You want a maintained login UI you can fork.</b> Zitadel's login app is a separate
            MIT-licensed Next.js service, and the seam is designed in rather than worked around.
          </li>
        </ul>
        <p>Keycloak earns it when:</p>
        <ul>
          <li>
            <b>Apache 2.0 is worth something to you</b> — you embed, redistribute, or patch the
            server, and you would rather not be in a licensing conversation with its vendor.
          </li>
          <li>
            <b>There is a directory.</b> LDAP and Active Directory federation with writable edit
            modes, group mapping, scheduled sync and Kerberos is a large amount of work to not
            have to do.
          </li>
          <li>
            <b>Your security review has a list.</b> PAR, DPoP, mTLS-bound tokens, CIBA — present
            and advertised at the defaults.
          </li>
          <li>
            <b>You need to reach into the model.</b> 139 provider interfaces, and a custom
            authenticator that runs in-process rather than over a network hop.
          </li>
          <li>
            <b>The ecosystem is the point.</b> A CNCF Incubating project with many independent
            vendors behind it is a different kind of bet from a single-vendor project, both for
            support and for hiring people who have already run it.
          </li>
        </ul>
        <p>
          And the honest closing note, which applies to either choice: the operations bill is
          real. Keycloak is a JVM application with a database, a cache and an upgrade cadence,
          and running it well is a job. That is the argument for{" "}
          <Link to="/hosting/dedicated-clusters/" className="ilink">
            managed Keycloak
          </Link>{" "}
          at a fixed monthly price rather than a per-user meter. If you would rather run it
          yourself, we also{" "}
          <Link to="/support/" className="ilink">
            support teams who do
          </Link>
          . If residency is driving the decision, our{" "}
          <Link to="/hosting/eu-data-residency/" className="ilink">
            EU data residency
          </Link>{" "}
          page states where identity data sits and where it does not, including the parts that
          are not flattering.
        </p>
      </>
    ),
  },
];

const matrix = {
  savings: "Fixed",
  savingsLabel: "monthly cost — no per-user or per-day meter",
  rows: [
    { feat: "Open source", vendor: "yes", keycloak: "yes" },
    { feat: "Permissive licence (Apache 2.0)", vendor: "no", keycloak: "yes" },
    { feat: "Vendor-neutral foundation governance", vendor: "no", keycloak: "yes" },
    { feat: "OIDC, OAuth 2.0 and SAML 2.0", vendor: "yes", keycloak: "yes" },
    { feat: "PAR, DPoP and mTLS-bound tokens at defaults", vendor: "no", keycloak: "yes" },
    { feat: "LDAP / AD federation with sync and write-back", vendor: "no", keycloak: "yes" },
    { feat: "Kerberos desktop SSO", vendor: "no", keycloak: "yes" },
    { feat: "Full template-level login customization", vendor: "lim", keycloak: "yes" },
    { feat: "Extend without writing Java", vendor: "yes", keycloak: "lim" },
    { feat: "Multi-tenancy in the core product", vendor: "yes", keycloak: "lim" },
    { feat: "Event-sourced audit trail by default", vendor: "yes", keycloak: "no" },
    { feat: "Runs as one service plus a database", vendor: "lim", keycloak: "yes" },
    { feat: "Managed, in any cloud or region you choose", vendor: "lim", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is Zitadel a good alternative to Keycloak?",
    a: (
      <p>
        Yes, and unusually for this page the comparison is close. Zitadel is a genuine
        open-source identity server with OIDC, OAuth 2.0, SAML and SCIM, a much smaller runtime
        footprint, multi-tenancy in the core product, and an extension model that does not
        require Java. Keycloak answers back with Apache 2.0 licensing, LDAP and Active Directory
        federation with write-back and scheduled sync, Kerberos, a broader OAuth surface at its
        defaults, and CNCF governance with many independent vendors behind it. Teams with an
        existing directory, or who embed or modify the server, usually land on Keycloak.
      </p>
    ),
    text: "Yes, and the comparison is close. Zitadel is a genuine open-source identity server with OIDC, OAuth 2.0, SAML and SCIM, a smaller runtime footprint, multi-tenancy in the core product, and an extension model that does not require Java. Keycloak answers with Apache 2.0 licensing, LDAP and Active Directory federation with write-back and scheduled sync, Kerberos, a broader OAuth surface at its defaults, and CNCF governance. Teams with an existing directory, or who embed or modify the server, usually land on Keycloak.",
  },
  {
    q: "Is Zitadel open source, and does the AGPL licence matter?",
    a: (
      <p>
        Zitadel's server is licensed AGPL-3.0-only, with its proto definitions and documentation
        under Apache 2.0 and its login app and client packages under MIT. For a team running an
        unmodified Zitadel as its identity provider, the licence changes nothing. It matters when
        you modify the server and let third parties use the modified version over a network, or
        when you redistribute or embed it: then AGPL obligations attach, and Zitadel sells a
        commercial licence as the alternative. Keycloak is Apache 2.0 throughout, which has no
        equivalent condition.
      </p>
    ),
    text: "Zitadel's server is AGPL-3.0-only, with its proto definitions and documentation under Apache 2.0 and its login app and client packages under MIT. For a team running an unmodified Zitadel as its identity provider, the licence changes nothing. It matters when you modify the server and let third parties use the modified version over a network, or when you redistribute or embed it, and Zitadel sells a commercial licence as the alternative. Keycloak is Apache 2.0 throughout.",
  },
  {
    q: "Does Zitadel support LDAP and Active Directory like Keycloak does?",
    a: (
      <p>
        Not in the same way. Zitadel configures LDAP as an identity provider: at login it binds
        with a service account, searches for the user, binds again with the submitted password,
        and maps attributes. Keycloak configures LDAP and Active Directory as user storage, with
        READ_ONLY, WRITABLE and UNSYNCED edit modes, mappers for groups and roles, periodic full
        and changed-user synchronization, and a Kerberos bridge for desktop single sign-on. If
        your authorization is derived from directory groups, that difference is most of the
        project.
      </p>
    ),
    text: "Not in the same way. Zitadel configures LDAP as an identity provider: at login it binds with a service account, searches for the user, binds again with the submitted password, and maps attributes. Keycloak configures LDAP and Active Directory as user storage, with READ_ONLY, WRITABLE and UNSYNCED edit modes, mappers for groups and roles, periodic synchronization, and a Kerberos bridge for desktop single sign-on.",
  },
  {
    q: "Which is lighter to run, Keycloak or Zitadel?",
    a: (
      <p>
        Zitadel, measurably. Idle and immediately after start on a 2-CPU, 8 GB machine, the four
        containers of Zitadel v4.20.0's published compose stack used about 249 MB in total, and
        Keycloak 26.8.1's quickstart container about 611 MB. Two caveats: Keycloak sizes its JVM
        heap from the memory limit it is given, so that number moves with the limit, and the
        Keycloak figure is development mode with an embedded database while the Zitadel figure
        includes a real PostgreSQL. Neither is a production sizing, but a Go binary is lighter
        than a JVM and will stay that way.
      </p>
    ),
    text: "Zitadel, measurably. Idle and immediately after start on a 2-CPU, 8 GB machine, the four containers of Zitadel v4.20.0's published compose stack used about 249 MB in total, and Keycloak 26.8.1's quickstart container about 611 MB. Keycloak sizes its JVM heap from the memory limit it is given, and the Keycloak figure is development mode with an embedded database while the Zitadel figure includes a real PostgreSQL, so neither is a production sizing.",
  },
  {
    q: "Can I customize the login page in Zitadel the way Keycloak themes let me?",
    a: (
      <p>
        Up to a point. Zitadel's console covers logo, colours, font and a watermark toggle, per
        instance or per organization. Beyond that the route is to fork its login application, a
        separate Next.js service under the MIT licence, and run your own. Keycloak themes override any
        template, message bundle or asset in the login, account and email flows, and deploy into
        the server with no extra service to operate. Which is better depends on whether a second
        deployable is a cost or a feature for you.
      </p>
    ),
    text: "Up to a point. Zitadel's console covers logo, colours, font and a watermark toggle, per instance or per organization; beyond that you fork its login application, a separate MIT-licensed Next.js service, and run your own. Keycloak themes override any template, message bundle or asset in the login, account and email flows and deploy into the server with no extra service to operate.",
  },
  {
    q: "Does Keycloak support multi-tenancy as well as Zitadel?",
    a: (
      <p>
        Not in the core product. Zitadel has instances and organizations built in. Keycloak gives
        you realms, which are isolated but heavy, and a realm per customer stops scaling long
        before a SaaS tenant list does. The workable Keycloak pattern is one realm with
        organizations inside it, which is why we build and maintain an open-source organizations
        extension with SCIM 2.0 provisioning. If multi-tenancy is the whole product and you are
        starting from nothing, this is the strongest argument on Zitadel's side.
      </p>
    ),
    text: "Not in the core product. Zitadel has instances and organizations built in. Keycloak gives you realms, which are isolated but heavy, and a realm per customer stops scaling long before a SaaS tenant list does. The workable Keycloak pattern is one realm with organizations inside it, which is why Phase Two builds and maintains an open-source organizations extension with SCIM 2.0 provisioning.",
  },
];

const migration = {
  heading: "Evaluating both, or already on one?",
  body: "Moving between two standards-based identity servers is mostly client configuration and a user import. The expensive parts are the custom logic and whatever your directory is doing. We will tell you plainly which of the two fits, including when the answer is not us.",
};

const bigcta = {
  heading: "Two open-source servers. One decision.",
  body: "A 30-minute architecture review covering your directory, your tenancy model and the custom logic you need, and a straight recommendation.",
};

export default function KeycloakVsZitadel() {
  return (
    <ComparisonLayout
      vendor="Zitadel"
      slug="zitadel"
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
