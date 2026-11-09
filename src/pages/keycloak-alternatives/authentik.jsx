import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Authentik — Phase Two",
  description:
    "Authentik vs Keycloak, compared on what actually differs: an MIT core with a paid Enterprise directory against Apache 2.0 throughout, directory federation, and reach below OIDC.",
  keywords:
    "authentik vs keycloak, keycloak vs authentik, authentik alternative, authentik enterprise license, open source identity provider comparison, authentik self-hosted, keycloak alternative",
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
      Both are open source. <span className="grad">Only one of them is all of it.</span>
    </>
  ),
  lede: (
    <>
      Against authentik the usual Keycloak arguments do not work: both self-host, both are
      free to run, both speak OIDC, OAuth 2.0 and SAML. The real fork is that authentik's
      core is MIT while a directory inside the same repository — and the same container
      image — is proprietary and priced per seat, and that each server reaches in a
      different direction: authentik down the stack to apps that speak no auth protocol at
      all, Keycloak out to the directory you already have and into the later OAuth
      hardening work. Checked against <b>Keycloak 26.8.2</b> and <b>authentik 2026.8.5</b> on
      9 November 2026.
    </>
  ),
  secondaryCta: { label: "See what each one advertises →", href: "#defaults" },
  miniRows: [
    { feat: "Open source and self-hostable", vendor: "yes", keycloak: "yes" },
    { feat: "Every feature under the open-source licence", vendor: "no", keycloak: "yes" },
    { feat: "Protects apps that speak no auth protocol", vendor: "yes", keycloak: "no" },
    { feat: "LDAP / AD federation with write-back", vendor: "lim", keycloak: "yes" },
    { feat: "PAR, CIBA and mTLS-bound tokens at defaults", vendor: "no", keycloak: "yes" },
    { feat: "Idle memory, quickstart as published", vendor: { label: "~688 MB" }, keycloak: { label: "~512 MB" } },
  ],
};

const atAGlance = [
  {
    dim: "Licence",
    vendor:
      "MIT, except the authentik/enterprise/ directory, which is proprietary and needs a paid subscription to run in production",
    keycloak: "Apache 2.0 throughout, with no directory carved out",
    check: true,
  },
  {
    dim: "Paid tier from the project",
    vendor: "Enterprise at $5/user/month for workforce accounts, $0.02 for customer accounts; Enterprise Plus from $20k a year",
    keycloak: "None. The project sells nothing, and no feature is gated",
    check: true,
  },
  {
    dim: "Project governance",
    vendor: "Single-vendor project. Authentik Security, Inc., a public benefit company founded November 2022; the project's creator is its CTO",
    keycloak: "CNCF Incubating project, accepted 10 April 2023",
    check: true,
  },
  {
    dim: "Implementation",
    vendor: "Python on Django, with Go and Rust components; PostgreSQL",
    keycloak: "Java on Quarkus; postgres, mysql, mariadb, oracle, mssql or tidb",
  },
  {
    dim: "Deployment shape",
    vendor: "Published compose runs three containers: server, worker, PostgreSQL. The worker mounts the Docker socket",
    keycloak: "One server process and one database",
    check: true,
  },
  {
    dim: "Apps that speak no auth protocol",
    vendor: "Proxy provider in forward-auth or full-proxy mode, plus LDAP, RADIUS and browser RDP/SSH providers",
    keycloak: "Not in the project. You run a separate authenticating proxy in front",
  },
  {
    dim: "Existing LDAP or Active Directory",
    vendor: "LDAP source: scheduled inbound sync of users and groups, with password change written back through the Active Directory extended operation",
    keycloak: "User storage provider with READ_ONLY / WRITABLE / UNSYNCED edit modes, registration sync back to LDAP, periodic sync and a Kerberos bridge",
    check: true,
  },
  {
    dim: "SCIM 2.0",
    vendor: "Both directions in the open-source tier — inbound source and outbound provider. OAuth 2.0 auth to SCIM endpoints is Enterprise",
    keycloak: "Inbound SCIM API, supported since 26.8, off per realm by default. Outbound provisioning comes from the open-source Organizations extension",
  },
  {
    dim: "Custom logic in a login flow",
    vendor: "Python expressions written in the admin console and executed in the server process",
    keycloak: "Authenticator SPI — your Java runs in-process; the running server reports 139 provider interfaces",
  },
  {
    dim: "Login UI customization",
    vendor: "Per-domain brands: title, logo, favicon and custom CSS, plus overridable email templates",
    keycloak: "Themes override any login, account, admin, welcome or email template, deployed into the server",
    check: true,
  },
  {
    dim: "OpenID certification",
    vendor: "Certified on a current build — authentik 2026.8.0, eight OP profiles",
    keycloak: "Certified as Keycloak 18.0.0 (2022) for four logout profiles, and 15.0.2 for FAPI-CIBA",
  },
  {
    dim: "Managed option",
    vendor: "Self-host only. The vendor sells a licence and support, not hosting",
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
          per-user licence, no cloud-only deployment, source you can read — mostly apply to
          authentik too. It is a real open-source identity server, it self-hosts, and it is
          developed at pace: 31 releases published so far in 2026 against Keycloak's 22.
        </p>
        <p>Both of them, verified on the versions above:</p>
        <ul>
          <li>Implement OpenID Connect, OAuth 2.0 and SAML 2.0 as an identity provider, and federate out to external OIDC and SAML providers plus the usual social logins.</li>
          <li>Support the device authorization grant, token introspection and revocation, and both front-channel and back-channel logout.</li>
          <li>Advertise DPoP in their discovery documents.</li>
          <li>Federate users from LDAP and Active Directory, and support Kerberos.</li>
          <li>Do SCIM 2.0 — in different directions, which is the subject of its own section below.</li>
          <li>Hold an OpenID Foundation certification, though not on comparable versions.</li>
        </ul>
        <p>
          So the honest version of this page is not "authentik is the hobby option." On
          several axes authentik is simply better, and we say which in the{" "}
          <a href="#verdict" className="ilink">last section</a>. What follows is the set of
          differences that actually change an architecture or a budget.
        </p>
      </>
    ),
  },
  {
    id: "licence",
    kicker: "02 — Licence",
    title: "MIT, Apache 2.0, and the directory in between",
    body: (
      <>
        <p>
          Read only the badge and authentik wins this: MIT is about as permissive as a
          licence gets, and Apache 2.0 asks slightly more of you — a NOTICE file, a patent
          grant, attribution on modified files. But the badge is not the offer. The
          repository's own{" "}
          <a
            href="https://github.com/goauthentik/authentik/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            LICENSE
          </a>{" "}
          carves out directories, and one of them is not open source at all.
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
              <td className="plan">Most of authentik</td>
              <td>MIT</td>
            </tr>
            <tr>
              <td className="plan">Client-side JavaScript</td>
              <td>MIT Expat</td>
            </tr>
            <tr>
              <td className="plan">website/</td>
              <td>CC BY-SA 4.0</td>
            </tr>
            <tr>
              <td className="plan">authentik/enterprise/</td>
              <td>The authentik Enterprise Edition licence</td>
            </tr>
            <tr>
              <td className="plan">All of Keycloak</td>
              <td>Apache 2.0</td>
            </tr>
          </tbody>
        </table>
        <p>
          The Enterprise licence says the code in that directory "may only be used in
          production" with a valid subscription for the correct number of seats, that it is
          "forbidden to copy, merge, publish, distribute, sublicense, and/or sell" it, and
          that any patch you write to it belongs to Authentik Security, Inc. You may read it
          and you may modify it for development and testing. That is source-available, and
          it is a normal open-core arrangement — but it is the opposite of what MIT
          implies, and it sits in the same tree.
        </p>
        <h3>How much of the product is behind it</h3>
        <p>
          You do not have to guess, because a running server will tell you. Each component
          endpoint reports a <code>requires_enterprise</code> flag per type. On a freshly
          started, entirely unlicensed 2026.8.5:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`for t in providers sources stages propertymappings policies; do
  curl -s -H "Authorization: Bearer $AK_TOKEN" \\
    "http://localhost:9000/api/v3/$t/all/types/" \\
  | python3 -c 'import sys,json; d=json.load(sys.stdin); \\
      print(len(d), sum(1 for r in d if r["requires_enterprise"]))'
done`}</code>
        </pre>
        <table className="ptable">
          <thead>
            <tr>
              <th>Component</th>
              <th>Types</th>
              <th>Enterprise only</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="plan">Providers</td><td>12</td><td>4 — Google Workspace, Microsoft Entra, Shared Signals Framework, WS-Federation</td></tr>
            <tr><td className="plan">Stages</td><td>25</td><td>4 — Account Lockdown, Mutual TLS, Source, Google device trust connector</td></tr>
            <tr><td className="plan">Property mappings</td><td>15</td><td>2 — the Google Workspace and Entra mappings</td></tr>
            <tr><td className="plan">Policies</td><td>7</td><td>1 — Password Uniqueness</td></tr>
            <tr><td className="plan">Sources</td><td>22</td><td>0</td></tr>
            <tr><td className="plan"><b>Total</b></td><td><b>81</b></td><td><b>11</b></td></tr>
          </tbody>
        </table>
        <p>
          <b>Eleven of eighty-one is not a crippled product.</b> The open-source tier covers
          OIDC, SAML, LDAP, RADIUS, SCIM, Kerberos, the proxy and browser-based remote
          access, and most teams will never touch the other eleven. The vendor's pricing
          page adds a few more items that are not component types — privileged access
          management, exportable reports, enhanced audit logging, RADIUS EAP-TLS, OAuth 2.0
          authentication on SCIM endpoints — and lists the price: <b>$5 per workforce user
          per month</b>, $0.02 per customer account, billed annually, with Enterprise Plus
          starting at $20,000 a year.
        </p>
        <p>
          The point is not that the price is high. Against a commercial IAM vendor it is
          low. The point is that it is a <i>per-seat meter on software you are hosting
          yourself</i>, and that is the exact thing most people are leaving when they go
          looking for a Keycloak alternative. Keycloak has no such tier: the project sells
          nothing, gates nothing, and counts nobody. Everything in it is Apache 2.0.
        </p>
        <h3>The part worth reading before you buy</h3>
        <p>
          The Enterprise code ships inside the ordinary container image and is enabled by a
          licence key, which is convenient and has one consequence worth planning for. If a
          licence expires, or your user count goes past what you bought, authentik records
          the state and escalates: a warning to admins after two weeks, to users after four,
          and after <b>six weeks it puts the API into read-only mode</b>. The middleware
          then refuses every unsafe API request with HTTP 400 and{" "}
          <code>denied_license</code>.
        </p>
        <p>
          Read the exclusions before you panic, because they are generous: GET, HEAD,
          OPTIONS and TRACE always pass, the flow executor is explicitly exempt so{" "}
          <b>logins keep working</b>, user create and update keep working, and the licence
          endpoints keep working so you can fix it. It is a configuration freeze, not an
          outage. It also never applies to an unlicensed install — a pure open-source
          deployment has no licence to expire. But it is a failure mode that exists only
          because there is something to buy, and it is worth knowing about before the
          renewal rather than six weeks after it.
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
          We started both at their published quickstarts and read the discovery documents.
          No tuning, no feature flags, defaults only — in authentik's case an OAuth2 provider
          created with the signing certificate and the three scope mappings the admin wizard
          assigns. Keycloak's document carries 56 keys, authentik's 26, and every key
          authentik publishes, Keycloak publishes too. Reproduce it in two commands:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`# Keycloak 26.8.2
curl -s http://localhost:8080/realms/master/.well-known/openid-configuration

# authentik 2026.8.5 — discovery is per application, not per server
curl -s http://localhost:9000/application/o/<app-slug>/.well-known/openid-configuration`}</code>
        </pre>
        <table className="ptable">
          <thead>
            <tr>
              <th>Advertised at defaults</th>
              <th>authentik 2026.8.5</th>
              <th>Keycloak 26.8.2</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="plan">Authorization code + PKCE</td><td>S256 and plain</td><td>S256 and plain</td></tr>
            <tr><td className="plan">DPoP</td><td>9 algorithms</td><td>10 algorithms</td></tr>
            <tr><td className="plan">Device authorization grant</td><td>yes</td><td>yes</td></tr>
            <tr><td className="plan">Front- and back-channel logout</td><td>yes</td><td>yes</td></tr>
            <tr><td className="plan">Resource owner password grant</td><td>yes</td><td>yes</td></tr>
            <tr><td className="plan">Pushed authorization requests</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">CIBA</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">mTLS client auth and bound tokens</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">private_key_jwt client auth</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Token exchange (RFC 8693)</td><td>no</td><td>advertised</td></tr>
            <tr><td className="plan">iss in the authorization response (RFC 9207)</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Dynamic client registration</td><td>not advertised</td><td>advertised</td></tr>
            <tr><td className="plan">Request objects / request_uri</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">Pairwise subject identifiers</td><td>no</td><td>yes</td></tr>
            <tr><td className="plan">ID token signing algorithms</td><td>RS256</td><td>13 algorithms</td></tr>
            <tr><td className="plan">Token, userinfo and authz response encryption</td><td>no</td><td>yes</td></tr>
          </tbody>
        </table>
        <p>
          <b>Read that table carefully, because a discovery document is not a feature
          list.</b> Two rows prove it in opposite directions. authentik does implement
          dynamic client registration — it ships a managed{" "}
          <code>goauthentik.io/oidc/dcr</code> scope mapping for exactly that — and simply
          does not advertise the endpoint. Going the other way, Keycloak advertises the token
          exchange grant, but on a default profile the <code>token-exchange</code> feature is
          disabled and the broader flavour is still preview. Both servers do more than they
          say, and one of them says more than it does.
        </p>
        <p>
          What the table is good for is the shape of each project. Keycloak's defaults carry
          the later OAuth hardening work — PAR, CIBA, mTLS-bound tokens, RFC 9207, encrypted
          tokens, request objects — because large regulated deployments ask for it, and the
          cost is a much bigger surface to configure and review. authentik's surface is the
          part almost everyone uses, and that is a defensible choice. If your security review
          arrives with a list of RFC numbers on it, read that list against this table before
          you go any further.
        </p>
        <p>
          One asymmetry in authentik's favour, since it belongs here: its OpenID Foundation
          certification is current. The{" "}
          <a
            href="https://openid.net/certification/certified-openid-connect-implementations/"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            certified implementations list
          </a>{" "}
          carries authentik 2026.8.0 across eight OP profiles. Keycloak's entries on the same
          list are Keycloak 18.0.0, certified in 2022, and 15.0.2 for FAPI-CIBA. Keycloak
          implements more of that surface today than it has ever certified — but a
          certification nobody has refreshed in four years is a fair thing for a reviewer to
          raise, and we would rather say so here than be asked.
        </p>
      </>
    ),
  },
  {
    id: "reach",
    kicker: "04 — Reach",
    title: "The applications that speak no protocol at all",
    body: (
      <>
        <p>
          This is authentik's strongest argument and it has nothing to do with OIDC. Most
          estates contain software that cannot be made to speak OIDC or SAML: an internal
          dashboard with no auth, a NAS, a wiki from 2014, a network appliance that only
          knows RADIUS, a Windows box somebody still has to reach. authentik has an answer
          for each of those in the product.
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>Thing you need to put a login in front of</th>
              <th>authentik</th>
              <th>Keycloak</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">An HTTP app with no authentication of its own</td>
              <td>Proxy provider, in <code>proxy</code>, <code>forward_single</code> or <code>forward_domain</code> mode behind nginx, Traefik or Envoy</td>
              <td>Not in the project — run a separate authenticating proxy</td>
            </tr>
            <tr>
              <td className="plan">An app that can only bind to LDAP</td>
              <td>LDAP provider: authentik serves LDAP</td>
              <td>No. Keycloak consumes LDAP, it does not serve it</td>
            </tr>
            <tr>
              <td className="plan">A VPN concentrator or switch that speaks RADIUS</td>
              <td>RADIUS provider (EAP-TLS is Enterprise)</td>
              <td>Not in the project</td>
            </tr>
            <tr>
              <td className="plan">A desktop or server over RDP, VNC or SSH</td>
              <td>RAC provider, in the browser, in the open-source tier</td>
              <td>Not in the project</td>
            </tr>
          </tbody>
        </table>
        <p>
          Those providers run as <b>outposts</b> — separate processes that authentik can
          deploy for you, which is why the published compose file mounts the Docker socket
          into the worker container and runs it as root. That is a deliberate design and it
          is documented, but it means the worker holds host-level control of the Docker
          daemon. If that is not acceptable where you are deploying, run the outposts
          yourself and drop the mount.
        </p>
        <p>
          Keycloak's position here is simple and worth stating plainly: <b>it is an identity
          provider and nothing else.</b> There is no proxy, no LDAP server, no RADIUS, no
          remote desktop. We wrote the{" "}
          <Link to="/tutorials/identity-providers/ldap/" className="ilink">
            LDAP federation tutorial
          </Link>{" "}
          partly to answer "can Keycloak act as an LDAP server", and the answer there is the
          same as here: no, the traffic goes one way. The usual Keycloak estate puts
          oauth2-proxy or an ingress-level authenticator in front of the protocol-less apps
          and keeps the identity server doing identity.
        </p>
        <p>
          Which model is better is a real question rather than a rhetorical one. One box that
          does all of it is fewer things to run and fewer places for a session to get lost.
          It is also a much larger blast radius: the thing issuing your tokens is now also
          terminating your RDP sessions and proxying your intranet. Decide that on your own
          risk appetite, not on a feature count.
        </p>
      </>
    ),
  },
  {
    id: "users",
    kicker: "05 — Users",
    title: "The directory you already have, and the systems downstream",
    body: (
      <>
        <p>
          If every user will be created in the new system, skip this section. If they live in
          Active Directory today, or if an HR system needs to push them in, it is probably
          the deciding one.
        </p>
        <h3>Reading from a directory</h3>
        <p>
          authentik treats LDAP as a <b>source</b>: a scheduled inbound synchronization of
          users and groups, with group hierarchy, optional password synchronization, and the
          option to delete objects that have disappeared upstream. Password <i>changes</i>{" "}
          made in authentik are written back, through the Active Directory extended
          operation. Other attribute changes are not: the sync is inbound.
        </p>
        <p>
          Keycloak treats LDAP as <b>user storage</b>, which is a different thing, and the
          26.8 server administration guide defines the three edit modes:
        </p>
        <ul>
          <li><b>READ_ONLY</b> — "You cannot change the username, email, first name, last name, and other mapped attributes… Password updates are not supported."</li>
          <li><b>WRITABLE</b> — "You can change the username, email, first name, last name, and other mapped attributes and passwords and synchronize them automatically with the LDAP store."</li>
          <li><b>UNSYNCED</b> — "Keycloak stores changes… in Keycloak local storage, so the administrator must synchronize this data back to LDAP," which is how you add attributes to users held in a directory you are not allowed to write to.</li>
        </ul>
        <p>
          On top of that sit twelve LDAP mapper types on a stock 26.8.2 server, a{" "}
          <i>Sync Registrations</i> switch that creates new Keycloak users in LDAP, periodic
          full and changed-user synchronization, and a Kerberos bridge for desktop single
          sign-on.
        </p>
        <h3>Writing to everything else</h3>
        <p>
          SCIM is where this comparison has recently moved, and most pages on the subject are
          out of date. Both servers do SCIM 2.0; they point opposite ways.
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th></th>
              <th>authentik 2026.8.5</th>
              <th>Keycloak 26.8.2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">Inbound — something provisions users <i>into</i> the server</td>
              <td>SCIM source, open-source tier</td>
              <td>SCIM API, promoted from preview to supported in 26.8</td>
            </tr>
            <tr>
              <td className="plan">Outbound — the server provisions users <i>into</i> downstream apps</td>
              <td>SCIM provider, open-source tier. OAuth 2.0 auth to the endpoint is Enterprise</td>
              <td>Not in core. The open-source Organizations extension does it</td>
            </tr>
          </tbody>
        </table>
        <p>
          Keycloak's SCIM API is off until you turn it on per realm, needs a confidential
          client, and validates that the access token's <code>aud</code> claim is the SCIM
          base URL — a detail that costs an hour if you miss it, because the failure is a
          401 that looks like a permissions problem. Once it is on, its own
          ServiceProviderConfig reports PATCH and filtering supported, with bulk, sort and
          ETag not supported:
        </p>
        <pre style={CODE_BLOCK}>
          <code>{`# Keycloak 26.8.2, after enabling SCIM on the realm and adding an
# audience mapper for http://localhost:8080/realms/master/scim/v2
curl -s -H "Authorization: Bearer $TOKEN" \\
  http://localhost:8080/realms/master/scim/v2/ServiceProviderConfig

{"patch": {"supported": true},
 "filter": {"supported": true, "maxResults": 100},
 "bulk":   {"supported": false},
 "sort":   {"supported": false},
 "etag":   {"supported": false}}`}</code>
        </pre>
        <p>
          The practical read: an organization with an existing directory, group-derived
          authorization and desktop SSO gets all of that from Keycloak as configuration,
          while authentik gives you the login and leaves the rest to its provisioning APIs.
          Going the other way, if what you need is to <i>push</i> users out to a dozen SaaS
          applications, authentik has that in the box and Keycloak needs our{" "}
          <Link to="/extensions/organizations/" className="ilink">
            organizations extension
          </Link>
          . Our{" "}
          <Link to="/blog/scim-explained/" className="ilink">
            SCIM explainer
          </Link>{" "}
          covers the protocol itself, and{" "}
          <Link to="/docs/keycloak/idp/" className="ilink">
            Keycloak identity provider
          </Link>{" "}
          documentation covers the brokering side.
        </p>
      </>
    ),
  },
  {
    id: "extending",
    kicker: "06 — Extensibility",
    title: "Python in the admin console, or Java in a JAR",
    body: (
      <>
        <p>
          Every identity project eventually needs logic that is specific to you: a check
          against an internal system before a user is created, a claim computed from
          somewhere else, a step in the login that nobody else has. The two answers are
          different enough to decide the whole choice.
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th></th>
              <th>authentik — expressions</th>
              <th>Keycloak — SPI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">Where you write it</td>
              <td>A text box in the admin console</td>
              <td>A Java project on your machine</td>
            </tr>
            <tr>
              <td className="plan">Language</td>
              <td>Python</td>
              <td>Java, packaged as a JAR</td>
            </tr>
            <tr>
              <td className="plan">Where it runs</td>
              <td>In the server process, via <code>exec()</code></td>
              <td>In the server process</td>
            </tr>
            <tr>
              <td className="plan">To deploy a change</td>
              <td>Press save</td>
              <td>Rebuild and restart the server</td>
            </tr>
            <tr>
              <td className="plan">Composing a login journey</td>
              <td>25 stage types arranged into flows in the UI</td>
              <td>42 authenticators arranged into flows in the UI</td>
            </tr>
            <tr>
              <td className="plan">Adding a new kind of step</td>
              <td>Not without forking</td>
              <td>139 provider interfaces on the running server</td>
            </tr>
            <tr>
              <td className="plan">What breaks on upgrade</td>
              <td>Your expression, against a documented object model</td>
              <td>Your JAR, against internal interfaces that are not a stable API</td>
            </tr>
          </tbody>
        </table>
        <p>
          If your team does not write Java, authentik's model is better and it is not close.
          A rule you can write, save and test in the same minute is a different experience
          from a Maven build and a rolling restart, and for the large class of problems that
          are really "branch this flow on an attribute", it is the right tool.
        </p>
        <p>
          Two things to price in. The first is that an expression is arbitrary Python
          executed inside the server process — authentik's own documentation says so, and
          calls the ability to create or edit one "a highly privileged permission". Your
          admin console is a code-execution surface, and your delegation model has to treat
          it as one. Keycloak's nearest equivalent, script authenticators and mappers, is a
          preview feature that is disabled by default and still requires a deployed JAR
          carrying <code>META-INF/keycloak-scripts.json</code>, which is inconvenient on
          purpose.
        </p>
        <p>
          The second is depth. Keycloak's SPIs let you replace parts of the server that
          authentik does not expose at all — a user storage backend, a credential type, a new
          kind of authentication step, a protocol mapper over the token. We build and maintain{" "}
          <Link to="/extensions/organizations/" className="ilink">
            open-source extensions
          </Link>{" "}
          on exactly those interfaces, which is also how we know the trade: they are internal
          interfaces, they move between releases, and a provider written against them is
          something you own and have to carry.
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
        <p>authentik is the better answer when:</p>
        <ul>
          <li>
            <b>Half your estate does not speak OIDC.</b> The proxy, LDAP, RADIUS and remote
            access providers are the whole reason authentik is popular in homelabs and small
            infrastructure teams, and they are genuinely good. Keycloak will not do this, and
            assembling the equivalent out of oauth2-proxy and friends is a real project.
          </li>
          <li>
            <b>Nobody on the team writes Java</b>, and the custom logic is more than a
            mapper. Saving a Python expression beats building a JAR.
          </li>
          <li>
            <b>You need to push users out to SaaS applications</b> and would rather that came
            with the server than with an extension.
          </li>
          <li>
            <b>A reviewer is going to ask about current OpenID certification.</b> authentik's
            is on a 2026 build. Keycloak's is on 18.0.0, from 2022.
          </li>
          <li>
            <b>You want one box.</b> If a single admin console covering SSO, the reverse
            proxy and remote access is the shape of system you want to operate, that is a
            coherent position and Keycloak does not offer it.
          </li>
        </ul>
        <p>Keycloak earns it when:</p>
        <ul>
          <li>
            <b>You do not want a per-seat meter on software you host.</b> Apache 2.0
            throughout, nothing gated, no licence to expire, no user count to reconcile, and
            no vendor who can change the terms of the half you depend on.
          </li>
          <li>
            <b>There is a directory.</b> Writable LDAP edit modes, registration sync back to
            LDAP, twelve mapper types, scheduled synchronization and Kerberos is a large
            amount of work to not have to do.
          </li>
          <li>
            <b>Your security review has a list.</b> PAR, CIBA, mTLS-bound tokens,
            private_key_jwt, RFC 9207, encrypted tokens — present and advertised at the
            defaults.
          </li>
          <li>
            <b>You need to reach into the model.</b> 139 provider interfaces, and a custom
            authenticator or user storage backend that is a first-class part of the server
            rather than a fork.
          </li>
          <li>
            <b>The ecosystem is the point.</b> A CNCF Incubating project with many
            independent vendors behind it is a different kind of bet from a single-vendor
            project, both for support and for hiring people who have already run it.
          </li>
        </ul>
        <p>
          And the honest closing note, which applies to either choice: the operations bill is
          real, and neither of these is light. Keycloak is a JVM application with a database,
          a cache and an upgrade cadence; authentik is three containers, a Docker socket and
          two supported release trains at a time. Idle on a 2-CPU, 8 GB machine immediately
          after start, authentik's published compose stack came to about 688 MB across its
          three containers and Keycloak's quickstart to about 512 MB — with the caveat that
          Keycloak sizes its heap at 70% of the memory limit it is given, so that figure
          moves with the limit, and that the Keycloak number is development mode with an
          embedded database while authentik's includes a real PostgreSQL. Neither is a
          production sizing. The reflex that Keycloak is the heavy one does not survive
          measurement.
        </p>
        <p>
          Running either well is a job. That is the argument for{" "}
          <Link to="/hosting/dedicated-clusters/" className="ilink">
            managed Keycloak
          </Link>{" "}
          at a fixed monthly price rather than a per-user meter. If you would rather run it
          yourself, we{" "}
          <Link to="/support/" className="ilink">
            support teams who do
          </Link>
          , and we publish{" "}
          <Link to="/blog/keycloak-lts-backport-images/" className="ilink">
            backport images for older Keycloak branches
          </Link>{" "}
          because upstream tags them without announcing them. If residency is driving the
          decision, our{" "}
          <Link to="/hosting/eu-data-residency/" className="ilink">
            EU data residency
          </Link>{" "}
          page states where identity data sits and where it does not, including the parts
          that are not flattering.
        </p>
      </>
    ),
  },
];

const matrix = {
  savings: "Fixed",
  savingsLabel: "monthly cost — no per-seat licence to reconcile",
  rows: [
    { feat: "Open source", vendor: "yes", keycloak: "yes" },
    { feat: "Every feature under the open-source licence", vendor: "no", keycloak: "yes" },
    { feat: "No per-seat licence from the project", vendor: "no", keycloak: "yes" },
    { feat: "Vendor-neutral foundation governance", vendor: "no", keycloak: "yes" },
    { feat: "OIDC, OAuth 2.0 and SAML 2.0", vendor: "yes", keycloak: "yes" },
    { feat: "DPoP at defaults", vendor: "yes", keycloak: "yes" },
    { feat: "PAR, CIBA and mTLS-bound tokens at defaults", vendor: "no", keycloak: "yes" },
    { feat: "Current OpenID Provider certification", vendor: "yes", keycloak: "no" },
    { feat: "LDAP / AD federation with write-back and registration sync", vendor: "lim", keycloak: "yes" },
    { feat: "Kerberos desktop SSO", vendor: "yes", keycloak: "yes" },
    { feat: "Outbound SCIM provisioning", vendor: "yes", keycloak: "lim" },
    { feat: "Reverse proxy / forward auth for protocol-less apps", vendor: "yes", keycloak: "no" },
    { feat: "Serves LDAP and RADIUS to legacy clients", vendor: "yes", keycloak: "no" },
    { feat: "Full template-level login customization", vendor: "lim", keycloak: "yes" },
    { feat: "Extend without writing Java", vendor: "yes", keycloak: "lim" },
    { feat: "Runs as one service plus a database", vendor: "no", keycloak: "yes" },
    { feat: "Managed, in any cloud or region you choose", vendor: "no", keycloak: "yes" },
  ],
};

const faqs = [
  {
    q: "Is authentik a good alternative to Keycloak?",
    a: (
      <p>
        For a lot of teams, yes. authentik is a genuine open-source identity server with
        OIDC, OAuth 2.0, SAML, SCIM, LDAP and Kerberos, a flow builder you drive from the
        admin console, Python expressions instead of Java, and — uniquely among the usual
        Keycloak alternatives — providers that put a login in front of applications that
        speak no authentication protocol at all, including a reverse proxy, an LDAP server,
        RADIUS and browser-based RDP and SSH. Keycloak answers with Apache 2.0 across the
        whole project and no paid tier, LDAP and Active Directory federation with writable
        edit modes and registration sync, a much broader OAuth surface at its defaults, 139
        extension interfaces, and CNCF governance with many independent vendors behind it.
      </p>
    ),
    text: "For a lot of teams, yes. authentik is a genuine open-source identity server with OIDC, OAuth 2.0, SAML, SCIM, LDAP and Kerberos, a flow builder driven from the admin console, Python expressions instead of Java, and providers that put a login in front of applications that speak no authentication protocol at all, including a reverse proxy, an LDAP server, RADIUS and browser-based RDP and SSH. Keycloak answers with Apache 2.0 across the whole project and no paid tier, LDAP and Active Directory federation with writable edit modes and registration sync, a much broader OAuth surface at its defaults, 139 extension interfaces, and CNCF governance.",
  },
  {
    q: "Is authentik fully open source, and what does the Enterprise licence cover?",
    a: (
      <p>
        Most of authentik is MIT, but the <code>authentik/enterprise/</code> directory of the
        same repository is under a proprietary Enterprise Edition licence that permits
        production use only with a paid subscription for the correct number of seats and
        forbids redistribution. On a running 2026.8.5 server, 11 of the 81 provider, source,
        stage, property-mapping and policy types report that they require Enterprise —
        including the Google Workspace and Microsoft Entra providers, Shared Signals
        Framework, WS-Federation, a mutual-TLS stage and the password-uniqueness policy.
        Enterprise is priced at $5 per workforce user per month and $0.02 per customer
        account, billed annually. Keycloak is Apache 2.0 throughout and the project has no
        paid tier at all.
      </p>
    ),
    text: "Most of authentik is MIT, but the authentik/enterprise/ directory of the same repository is under a proprietary Enterprise Edition licence that permits production use only with a paid subscription for the correct number of seats and forbids redistribution. On a running 2026.8.5 server, 11 of the 81 provider, source, stage, property-mapping and policy types report that they require Enterprise, including the Google Workspace and Microsoft Entra providers, Shared Signals Framework, WS-Federation, a mutual-TLS stage and the password-uniqueness policy. Enterprise is $5 per workforce user per month and $0.02 per customer account, billed annually. Keycloak is Apache 2.0 throughout and has no paid tier.",
  },
  {
    q: "Can Keycloak do forward auth like authentik's proxy provider?",
    a: (
      <p>
        No. Keycloak is an identity provider and nothing else — there is no proxy provider,
        no LDAP server, no RADIUS and no remote desktop access in the project. authentik has
        all four, and its proxy provider runs in full-proxy, single-application forward-auth
        or domain-level forward-auth mode behind nginx, Traefik or Envoy. The usual Keycloak
        equivalent is to put a separate authenticating proxy such as oauth2-proxy in front of
        the applications that cannot speak OIDC, which works well but is another component to
        run.
      </p>
    ),
    text: "No. Keycloak is an identity provider and nothing else — there is no proxy provider, no LDAP server, no RADIUS and no remote desktop access in the project. authentik has all four, and its proxy provider runs in full-proxy, single-application forward-auth or domain-level forward-auth mode behind nginx, Traefik or Envoy. The usual Keycloak equivalent is a separate authenticating proxy such as oauth2-proxy in front of the applications that cannot speak OIDC.",
  },
  {
    q: "Does Keycloak support SCIM?",
    a: (
      <p>
        Yes, as of Keycloak 26.8, and this is the fact most comparisons still get wrong. The
        SCIM API was a preview feature in 26.7 and is supported in 26.8. It is inbound: other
        systems provision users and groups <i>into</i> a Keycloak realm. You enable it per
        realm, call it with a confidential client, and the access token's <code>aud</code>{" "}
        claim has to be the realm's SCIM base URL. Its ServiceProviderConfig reports PATCH and
        filtering supported, and bulk, sort and ETag not supported. Outbound provisioning —
        Keycloak pushing users to downstream applications — is not in core and comes from our
        open-source Organizations extension. authentik has both directions in its open-source
        tier.
      </p>
    ),
    text: "Yes, as of Keycloak 26.8. The SCIM API was a preview feature in 26.7 and is supported in 26.8. It is inbound: other systems provision users and groups into a Keycloak realm. You enable it per realm, call it with a confidential client, and the access token's aud claim has to be the realm's SCIM base URL. Its ServiceProviderConfig reports PATCH and filtering supported, and bulk, sort and ETag not supported. Outbound provisioning is not in core and comes from the open-source Organizations extension. authentik has both directions in its open-source tier.",
  },
  {
    q: "Which is lighter to run, Keycloak or authentik?",
    a: (
      <p>
        Keycloak, which surprises people. Idle and immediately after start on a 2-CPU, 8 GB
        machine, the three containers of authentik 2026.8.5's published compose stack used
        about 688 MB in total — 371 MB for the server, 266 MB for the worker, 51 MB for
        PostgreSQL — while Keycloak 26.8.2's quickstart container used about 512 MB under a
        1.5 GB limit. Two caveats in Keycloak's disfavour and one in its favour: Keycloak
        sizes its JVM heap at 70% of the memory limit it is given, so that number rises if you
        give it more; the Keycloak figure is development mode with an embedded database while
        authentik's includes a real PostgreSQL; and Keycloak is one container against three.
        Neither is a production sizing, but "the Java one is the heavy one" is not what the
        measurement says.
      </p>
    ),
    text: "Keycloak, which surprises people. Idle and immediately after start on a 2-CPU, 8 GB machine, the three containers of authentik 2026.8.5's published compose stack used about 688 MB in total — 371 MB server, 266 MB worker, 51 MB PostgreSQL — while Keycloak 26.8.2's quickstart container used about 512 MB under a 1.5 GB limit. Keycloak sizes its JVM heap at 70% of the memory limit it is given, and the Keycloak figure is development mode with an embedded database while authentik's includes a real PostgreSQL. Neither is a production sizing.",
  },
  {
    q: "Can I customize the login page in authentik the way Keycloak themes let me?",
    a: (
      <p>
        Not to the same depth, though the trade is more interesting than it sounds. authentik
        gives you per-domain brands with a title, logo, favicon and arbitrary custom CSS, plus
        overridable email templates — and, more importantly, a flow builder that lets you
        rearrange the login journey itself from 25 stage types without writing anything.
        Keycloak themes override any template, message bundle or asset across the login,
        account, admin, welcome and email flows, so the markup is yours, but the flow is
        composed from the authenticators that exist. If you want to change what the login
        <i>looks</i> like, Keycloak goes further; if you want to change what it <i>does</i>,
        authentik gets you there faster.
      </p>
    ),
    text: "Not to the same depth. authentik gives you per-domain brands with a title, logo, favicon and custom CSS, plus overridable email templates, and a flow builder that lets you rearrange the login journey itself from 25 stage types without writing code. Keycloak themes override any template, message bundle or asset across the login, account, admin, welcome and email flows. If you want to change what the login looks like, Keycloak goes further; if you want to change what it does, authentik gets you there faster.",
  },
];

const migration = {
  heading: "Evaluating both, or already on one?",
  body: "Moving between two standards-based identity servers is mostly client configuration and a user import. The expensive parts are the custom logic, whatever your directory is doing, and anything sitting behind a forward-auth proxy. We will tell you plainly which of the two fits, including when the answer is not us.",
};

const bigcta = {
  heading: "Two open-source servers. One decision.",
  body: "A 30-minute architecture review covering your directory, the applications that cannot speak OIDC, and the custom logic you need — and a straight recommendation.",
};

export default function KeycloakVsAuthentik() {
  return (
    <ComparisonLayout
      vendor="authentik"
      slug="authentik"
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
