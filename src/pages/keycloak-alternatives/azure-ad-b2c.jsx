import Link from "@docusaurus/Link";
import React from "react";
import ComparisonLayout from "../../components/comparison/ComparisonLayout";

const meta = {
  title: "Keycloak vs. Azure AD B2C — Phase Two",
  description:
    "Azure AD B2C is end of sale, not end of life: supported to at least May 2030, with a frozen roadmap. Compare staying, Entra External ID, and Keycloak — and what a B2C migration actually costs.",
  keywords:
    "azure ad b2c alternative, azure b2c migration, azure ad b2c end of life, azure ad b2c replacement, keycloak vs azure ad b2c, azure ad b2c end of sale",
};

const hero = {
  variant: "B",
  headline: (
    <>
      Azure AD B2C is end of sale. <span className="grad">You have until 2030 to choose well.</span>
    </>
  ),
  lede: (
    <>
      B2C stopped being sold to new customers on 1 May 2025 and Microsoft supports it{" "}
      <b>until at least May 2030</b>. It is not being shut down — it is frozen. The question is
      not how fast you leave, it is where you land: stay, move to Entra External ID, or move to
      Keycloak. If your logic lives in <b>custom policies</b>, every one of those three means a
      rebuild.
    </>
  ),
  secondaryCta: { label: "See the three options →", href: "#options" },
  miniRows: [
    { feat: "Still sold to new customers", vendor: "no", keycloak: "yes" },
    { feat: "Roadmap and new investment", vendor: "no", keycloak: "yes" },
    { feat: "Custom policies / IEF carry over", vendor: { label: "n/a" }, keycloak: "lim" },
    { feat: "Full HTML/CSS login customization", vendor: "yes", keycloak: "yes" },
    { feat: "Export your password hashes", vendor: "no", keycloak: "yes" },
    { feat: "Run it somewhere other than Azure", vendor: "no", keycloak: "yes" },
  ],
};

const atAGlance = [
  {
    dim: "Commercial status",
    vendor: "End of sale 1 May 2025; supported to at least May 2030",
    keycloak: "Apache 2.0, CNCF project, quarterly releases",
    check: true,
  },
  {
    dim: "Licensing",
    vendor: "Per monthly active user; first 50,000 MAU free",
    keycloak: "No licence fee; you pay for hosting",
  },
  {
    dim: "Premium tier",
    vendor: "P2 discontinued 15 March 2026 for all customers; tenants run on P1",
    keycloak: "One edition, no feature gates",
    check: true,
  },
  {
    dim: "Custom authentication logic",
    vendor: "Custom policies (Identity Experience Framework XML)",
    keycloak: "Configurable authentication flows, plus the Java Authenticator SPI",
    check: true,
  },
  {
    dim: "Login UI",
    vendor: "Custom HTML/CSS page templates, hosted by you",
    keycloak: "Theme system: login, account, email and admin",
    check: true,
  },
  {
    dim: "Credential portability",
    vendor: "No password-hash export, by any API",
    keycloak: "Your database, your hashes",
    check: true,
  },
  {
    dim: "Hosting and residency",
    vendor: "Azure only",
    keycloak: "Anywhere — your cloud, on-premise, Kubernetes, or managed in Frankfurt",
    check: true,
  },
  {
    dim: "Operational burden",
    vendor: "None. Microsoft runs it, with an SLA",
    keycloak: "Real — a JVM, a database and an upgrade cycle, unless someone runs it for you",
  },
];

const sections = [
  {
    id: "status",
    kicker: "01 — Status",
    title: "What actually happened to Azure AD B2C",
    body: (
      <>
        <p>
          Three separate announcements got compressed into one rumour, so start with the dates.
          All of them come from{" "}
          <a
            href="https://learn.microsoft.com/azure/active-directory-b2c/faq"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            Microsoft's own B2C FAQ
          </a>
          .
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>Date</th>
              <th>What changed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">1 May 2025</td>
              <td>
                B2C is no longer available to purchase for new customers. Existing customers keep
                using it and can still create tenants — on P1.
              </td>
            </tr>
            <tr>
              <td className="plan">15 March 2026</td>
              <td>
                Premium P2 is discontinued for all customers. Tenants moved to P1, and the
                P2-only capabilities — ID Protection among them — went with it.
              </td>
            </tr>
            <tr>
              <td className="plan">May 2030</td>
              <td>
                The earliest date Microsoft's support commitment runs to. SLAs, security updates
                and compliance are unchanged until then.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          So: <b>end of sale, not end of life.</b> Your tenant is not being retired in 2026, and
          anyone telling you otherwise has read the P2 date as a tenant-retirement date. What you
          have lost is the roadmap. B2C gets security updates and operational continuity; it does
          not get new capability, and the product Microsoft is investing in is{" "}
          <a
            href="https://learn.microsoft.com/entra/external-id/customers/overview-customers-ciam"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            Microsoft Entra External ID
          </a>
          .
        </p>
        <p>
          That is a real cost, just a slow one. Four years is long enough to plan properly and
          short enough that a platform decision made today is the one you live with.
        </p>
      </>
    ),
  },
  {
    id: "options",
    kicker: "02 — Options",
    title: "Your three realistic options",
    body: (
      <>
        <p>
          There are exactly three, and the honest answer is that the first one is right for a lot
          of teams.
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>Option</th>
              <th>Fits when</th>
              <th>The cost of it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">Stay on B2C</td>
              <td>
                Built on user flows, all-Azure, under the free MAU tier, nobody asking about
                residency or source access
              </td>
              <td>A dated platform and a decision deferred, not avoided</td>
            </tr>
            <tr>
              <td className="plan">Entra External ID</td>
              <td>
                Simple B2C setup, deep Microsoft commitment, little or no custom-policy logic
              </td>
              <td>Rebuild of your authentication logic; several B2C features do not exist there</td>
            </tr>
            <tr>
              <td className="plan">Keycloak</td>
              <td>
                Custom policies, third-party federation, residency requirements, or you want the
                platform decision to be yours next time
              </td>
              <td>Rebuild, plus an operational story you own or buy</td>
            </tr>
          </tbody>
        </table>
        <p>
          The question that separates them is not price and it is not features. It is{" "}
          <b>how much of your authentication logic lives in custom policies.</b> A tenant running
          two built-in user flows has three cheap options. A tenant running a custom policy with
          orchestration steps, REST calls and claims transformations has one expensive decision,
          and it is the same expense whichever destination it picks.
        </p>
        <p>
          We wrote the long version of this as{" "}
          <Link to="/blog/azure-ad-b2c-end-of-sale/" className="ilink">
            what Azure AD B2C's end of sale actually means
          </Link>{" "}
          — including the questions that decide it.
        </p>
      </>
    ),
  },
  {
    id: "gaps",
    kicker: "03 — Parity",
    title: "What Entra External ID does not carry over",
    body: (
      <>
        <p>
          This is the part that surprises people, and it is in Microsoft's own{" "}
          <a
            href="https://learn.microsoft.com/entra/external-id/customers/migrate-from-b2c-to-external-id"
            target="_blank"
            rel="noreferrer"
            className="ilink"
          >
            B2C-to-External-ID migration guide
          </a>
          , not in anyone's marketing.
        </p>
        <ul>
          <li>
            <b>Custom policies do not move.</b> The guide maps "Custom policies (XML/IEF)" to
            "Custom authentication extensions" — a different model, not a converter. There is no
            tooling that takes your <code>TrustFrameworkExtensions.xml</code> and produces the
            equivalent.
          </li>
          <li>
            <b>Third-party identity providers configured through custom policies are not
            supported.</b> The guide says so in those words. Social federation has to be
            reconfigured on External ID's built-in providers, and anything outside that list is a
            gap you have to design around.
          </li>
          <li>
            <b>UI customization narrows.</b> B2C's hosted HTML/CSS page templates map to "user
            flows with branding" — a company-branding menu rather than pages you author.
          </li>
          <li>
            <b>Native authentication is local-accounts only</b>, per the same feature-mapping
            table. If your mobile apps authenticate against social providers without a browser
            redirect, check this one first.
          </li>
        </ul>
        <p>
          None of that makes External ID a bad product. It makes it a <i>new</i> product, aimed
          mostly at new deployments. The conclusion a B2C customer should draw is narrower and
          more useful: <b>you are rebuilding your authentication logic whichever destination you
          choose.</b> Given that, the destination worth picking is the one where the next
          platform decision is yours.
        </p>
      </>
    ),
  },
  {
    id: "mapping",
    kicker: "04 — Mapping",
    title: "Where each B2C concept lands in Keycloak",
    body: (
      <>
        <p>
          Keycloak has a direct equivalent for most of what a custom policy expresses, and the
          equivalents are configuration rather than XML.
        </p>
        <table className="ptable">
          <thead>
            <tr>
              <th>Azure AD B2C</th>
              <th>Keycloak</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="plan">User journey</td>
              <td>Authentication flow</td>
            </tr>
            <tr>
              <td className="plan">Orchestration step</td>
              <td>Execution, or a subflow with a condition</td>
            </tr>
            <tr>
              <td className="plan">Technical profile (validation)</td>
              <td>Authenticator, built-in or your own via the Authenticator SPI</td>
            </tr>
            <tr>
              <td className="plan">Technical profile (federation)</td>
              <td>
                <Link to="/docs/keycloak/idp/" className="ilink">
                  Identity provider
                </Link>{" "}
                — any OIDC or SAML endpoint
              </td>
            </tr>
            <tr>
              <td className="plan">Claims transformation</td>
              <td>Protocol mapper, or a script mapper for the awkward ones</td>
            </tr>
            <tr>
              <td className="plan">REST API technical profile</td>
              <td>Custom Authenticator SPI in-flow; Workflows for out-of-band steps</td>
            </tr>
            <tr>
              <td className="plan">Page layout (HTML/CSS)</td>
              <td>
                <Link to="/extensions/themes/" className="ilink">
                  Keycloak themes
                </Link>
              </td>
            </tr>
            <tr>
              <td className="plan">User flow attributes</td>
              <td>Declarative user profile</td>
            </tr>
          </tbody>
        </table>
        <p>
          What has no clean equivalent: the parts of the Identity Experience Framework that are a
          programming language rather than a configuration — long claims-transformation chains,
          and orchestration that branches on computed values. Those become Java.
        </p>
      </>
    ),
  },
  {
    id: "migration",
    kicker: "05 — Migration",
    title: "Moving your users, and the password problem",
    body: (
      <>
        <p>
          <b>B2C will not give you your password hashes.</b> Microsoft Graph writes a password and
          never reads one back, and Microsoft's own migration guidance for preserving passwords is
          not an export — it is validating each credential against B2C at the moment the user next
          signs in. That constraint shapes the whole project, and it applies no matter where you
          are going.
        </p>
        <p>So you pick from three patterns, usually more than one of them:</p>
        <ul>
          <li>
            <b>Just-in-time migration.</b> Profiles are bulk-imported with no credential; a user
            storage provider validates the first login against B2C, then stores the password in
            Keycloak. Nobody resets anything.
          </li>
          <li>
            <b>Broker B2C temporarily.</b> Keycloak federates to B2C as an OIDC identity provider,
            you move applications to Keycloak immediately, and credentials follow later.
          </li>
          <li>
            <b>Forced reset for the stragglers.</b> Whatever JIT has not picked up by your cutover
            date gets a reset mail. There is always a tail.
          </li>
        </ul>
        <p>
          Effort, honestly, as ranges rather than promises: a <b>simple tenant</b> with one or two
          built-in user flows and a couple of social providers is <b>a few weeks</b>. A tenant with
          custom policies, several enterprise federations and custom claims is{" "}
          <b>two to four months</b>. The custom-policy rewrite is most of that, and it is work you
          owe whichever platform you pick.
        </p>
        <p>
          We do this as a service — see{" "}
          <Link to="/support/migrate-to-keycloak/" className="ilink">
            migrate to Keycloak
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "best",
    kicker: "06 — Verdict",
    title: "When you should not pick Keycloak",
    body: (
      <>
        <p>
          B2C genuinely wins on things Keycloak cannot match, and they are not small. Zero
          operational burden. A Microsoft SLA. Deep Azure-native integration — Front Door custom
          domains, Application Insights, federation to your Entra workforce tenant. And 50,000 free
          monthly active users, which is more than most applications ever need.
        </p>
        <p>
          If you are an all-Azure shop running built-in user flows under the free tier, with nobody
          asking about data residency or source access, <b>sitting tight until 2030 is a defensible
          engineering decision</b> and anyone selling you urgency is selling you something. Revisit
          it in 2028.
        </p>
        <p>
          Keycloak earns the move when at least one of these is true: your logic lives in custom
          policies and you are rebuilding anyway; you need to run identity somewhere other than
          Azure, for{" "}
          <Link to="/hosting/eu-data-residency/" className="ilink">
            EU data residency
          </Link>{" "}
          or for a customer's contract; you need federation or protocol support beyond what a
          successor product supports; or you want the next end-of-sale announcement to be somebody
          else's problem.
        </p>
        <p>
          And if you are moving to escape an operations bill, price the operations bill first.
          Keycloak is a JVM application with a database, a cache and an upgrade cadence; running it
          well is a real job. That is the argument for{" "}
          <Link to="/hosting/dedicated-clusters/" className="ilink">
            managed Keycloak
          </Link>{" "}
          rather than a VM you own — and if you would rather own it, we also{" "}
          <Link to="/support/" className="ilink">
            support teams who run their own
          </Link>
          .
        </p>
      </>
    ),
  },
];

const matrix = {
  savings: "Fixed",
  savingsLabel: "cost, whatever your MAU count",
  rows: [
    { feat: "Sold to new customers", vendor: "no", keycloak: "yes" },
    { feat: "Active roadmap and new features", vendor: "no", keycloak: "yes" },
    { feat: "Premium tier intact", vendor: "no", keycloak: "yes" },
    { feat: "Full HTML/CSS login customization", vendor: "yes", keycloak: "yes" },
    { feat: "Any OIDC / SAML identity provider", vendor: "lim", keycloak: "yes" },
    { feat: "LDAP / Active Directory federation", vendor: "no", keycloak: "yes" },
    { feat: "Password hashes you can export", vendor: "no", keycloak: "yes" },
    { feat: "Deploy outside one cloud", vendor: "no", keycloak: "yes" },
    { feat: "Source access and custom extensions", vendor: "no", keycloak: "yes" },
    { feat: "Zero operational burden", vendor: "yes", keycloak: "lim" },
    { feat: "Free tier", vendor: "yes", keycloak: { label: "n/a" } },
  ],
};

const faqs = [
  {
    q: "Is Azure AD B2C being discontinued?",
    a: (
      <p>
        No. Azure AD B2C reached <b>end of sale</b>, not end of life. It stopped being available to
        new customers on 1 May 2025, and Microsoft's FAQ says it will be supported "until at least
        May 2030" with SLAs, security updates and compliance unchanged. Existing customers can keep
        using it and can still create tenants. What ended is new investment in the product.
      </p>
    ),
    text: "No. Azure AD B2C reached end of sale, not end of life. It stopped being available to new customers on 1 May 2025, and Microsoft says it will be supported until at least May 2030 with SLAs, security updates and compliance unchanged. Existing customers can keep using it and can still create tenants. What ended is new investment in the product.",
  },
  {
    q: "When does Azure AD B2C end?",
    a: (
      <p>
        The only firm dates Microsoft has published are 1 May 2025 (no longer sold to new
        customers), 15 March 2026 (Premium P2 discontinued for all customers, tenants moved to P1)
        and May 2030 (the earliest end of the support commitment). Blogs claiming tenants retire on
        15 March 2026 have mistaken the P2 date for a tenant-retirement date — that is not what
        Microsoft says.
      </p>
    ),
    text: "The only firm dates Microsoft has published are 1 May 2025 (no longer sold to new customers), 15 March 2026 (Premium P2 discontinued for all customers, tenants moved to P1) and May 2030 (the earliest end of the support commitment). Claims that tenants retire on 15 March 2026 mistake the P2 date for a tenant-retirement date.",
  },
  {
    q: "Can I export passwords from Azure AD B2C?",
    a: (
      <p>
        No. Microsoft Graph lets you write a password onto an account and never read one back, and
        there is no API that returns password hashes. Microsoft's own guidance for preserving
        passwords is just-in-time migration — validating each credential against B2C when the user
        next signs in — rather than an export. The same constraint applies whether you move to
        Entra External ID or to Keycloak.
      </p>
    ),
    text: "No. Microsoft Graph lets you write a password onto an account and never read one back, and there is no API that returns password hashes. Microsoft's own guidance for preserving passwords is just-in-time migration, validating each credential against B2C when the user next signs in, rather than an export.",
  },
  {
    q: "Is Keycloak a good alternative to Azure AD B2C?",
    a: (
      <p>
        For a B2C tenant built on custom policies, yes — because that logic has to be rebuilt on any
        destination, and Keycloak's authentication flows plus the Authenticator SPI are a closer
        match to what the Identity Experience Framework actually does than a managed successor's
        extension points are. Keycloak also keeps full HTML/CSS login customization and runs
        anywhere. For a simple tenant inside the free MAU tier with no residency requirement, B2C's
        zero operational burden is a genuine advantage and staying is reasonable.
      </p>
    ),
    text: "For a B2C tenant built on custom policies, yes — that logic has to be rebuilt on any destination, and Keycloak's authentication flows plus the Authenticator SPI are a closer match to what the Identity Experience Framework does. Keycloak also keeps full HTML/CSS login customization and runs anywhere. For a simple tenant inside the free MAU tier with no residency requirement, B2C's zero operational burden is a genuine advantage.",
  },
  {
    q: "How long does a B2C to Keycloak migration take?",
    a: (
      <p>
        As ranges rather than promises: a simple tenant with one or two built-in user flows and a
        couple of social identity providers is a few weeks. A tenant with custom policies, several
        enterprise federations and custom claims is two to four months. The custom-policy rewrite
        dominates the estimate, and user migration is usually the predictable part.
      </p>
    ),
    text: "As ranges rather than promises: a simple tenant with one or two built-in user flows and a couple of social identity providers is a few weeks. A tenant with custom policies, several enterprise federations and custom claims is two to four months. The custom-policy rewrite dominates the estimate.",
  },
  {
    q: "What happens to my custom policies (IEF) if I move?",
    a: (
      <p>
        They are rewritten, not converted, on every destination. Microsoft's migration guide maps
        custom policies to Entra External ID's custom authentication extensions — a different model
        with no converter — and explicitly says third-party identity providers configured through
        custom policies are not supported there. On Keycloak, user journeys become authentication
        flows and most technical profiles become configuration; the parts of the Identity Experience
        Framework that behave like a programming language become Java.
      </p>
    ),
    text: "They are rewritten, not converted, on every destination. Microsoft's migration guide maps custom policies to Entra External ID's custom authentication extensions, a different model with no converter, and says third-party identity providers configured through custom policies are not supported there. On Keycloak, user journeys become authentication flows and most technical profiles become configuration; the rest becomes Java.",
  },
];

const migration = {
  heading: "Already on Azure AD B2C?",
  body: "You have until 2030, so there is no reason to rush and every reason to plan. We map your user flows and custom policies onto Keycloak, migrate users without resetting passwords, and run the cutover.",
};

const bigcta = {
  heading: "Rebuild once, on your own terms.",
  body: "A 30-minute review of your B2C tenant — user flows, custom policies, federation — and an honest estimate of what moving it costs.",
};

export default function KeycloakVsAzureAdB2C() {
  return (
    <ComparisonLayout
      vendor="Azure AD B2C"
      slug="azure-ad-b2c"
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
