import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import ClientChecker from "../../components/tools/client-checker/ClientChecker";

const PAGE_META = {
  title: "Keycloak Client Security Checker — Audit Client Configuration",
  description:
    "Free Keycloak client security checker. Paste a client or realm export to find wildcard redirect URIs, missing PKCE, password grants, implicit flow, broad scopes, long token lifespans and weak SAML signing, with the exact admin console fix for each. Runs entirely in your browser.",
  // Targets: keycloak client security, keycloak client configuration audit,
  // keycloak redirect uri wildcard, keycloak pkce, keycloak security checklist.
  keywords:
    "keycloak client security, keycloak client checker, keycloak security audit, keycloak client configuration, keycloak redirect uri wildcard, keycloak pkce, keycloak implicit flow, keycloak direct access grants, keycloak full scope allowed, keycloak saml signature, keycloak hardening, oauth client security, rfc 9700",
  url: "https://phasetwo.io/tools/keycloak-client-checker",
};

const FAQS = [
  {
    q: "Is it safe to paste my client configuration here?",
    a: "Yes. The checker runs entirely in your browser. Your JSON is never sent to Phase Two or any other server, logged, or stored. If the export includes a client secret or a SAML private key, the page replaces it with asterisks as soon as you paste, and it never appears in the report or the suggested fixes. You can confirm there are no network requests in your browser's developer tools.",
  },
  {
    q: "How do I export a Keycloak client?",
    a: "In the admin console, open Clients, select the client, and choose Action → Export in the top right. That downloads the client as JSON, including its secret. To check every client at once, use Realm settings → Action → Partial export with clients included; Keycloak masks secrets in a partial export. A client from the Admin REST API (GET /admin/realms/{realm}/clients/{id}) or a full kc.sh export also works.",
  },
  {
    q: "Why are wildcard redirect URIs dangerous in Keycloak?",
    a: "A trailing * makes the redirect URI a prefix match, so Keycloak will deliver authorization codes to any URL that starts with it. If any page under that prefix is an open redirect or hosts user content, an attacker can capture codes. A bare * accepts any URL at all. RFC 9700 requires exact string matching. Note that Keycloak only supports * at the end of a URI: https://*.example.com never matches a real subdomain.",
  },
  {
    q: "Does my public client need PKCE?",
    a: "Yes. A public client, such as a single-page or mobile app, has no secret, so PKCE is the only thing that stops an intercepted authorization code from being redeemed by someone else. Turn on Require PKCE with the S256 method in the client's Capability config, and enforce it realm-wide with the pkce-enforcer client policy executor.",
  },
  {
    q: "Should I turn off Direct access grants?",
    a: "On almost every client, yes. Direct access grants (the OAuth password grant) let a client exchange a username and password for tokens without the browser login flow, so CAPTCHA, passkeys and most second factors don't apply. It is the first path credential-stuffing tools try, and admin-cli has it on by default. Move backend integrations to service accounts and reject the grant with a client policy.",
  },
  {
    q: "What does Full scope allowed do?",
    a: "With Full scope allowed on, a client's tokens carry every role the user has across the realm, not only the roles that application needs. Turning it off and adding only the needed roles to the client's dedicated scope limits what a leaked token can do. Test first, because an application that relies on a role you didn't add will lose access.",
  },
  {
    q: "Can I apply the suggested fixes automatically?",
    a: "The checker produces a fixed JSON and a diff for the changes it can make safely, such as turning off the implicit flow, requiring PKCE S256, or moving offline_access to an optional scope. It never invents redirect URIs, certificates or client authentication settings. Review the changes and try them in a test realm before applying them to production.",
  },
  {
    q: "Does it check SAML clients?",
    a: "Yes. For SAML clients it checks that documents and assertions are signed, that client signatures are required, that assertions are encrypted, the signature algorithm, the Name ID format setting, ECP and IdP-initiated SSO, and the redirect URIs Keycloak uses to validate the Assertion Consumer Service URL.",
  },
];

const CHECKS = [
  [
    "Redirect URIs",
    "`*`, whole-host and path wildcards, subdomain wildcards that never match, plain `http://`, localhost leftovers, and missing URIs. The same for post-logout redirect URIs, including what `+` inherits.",
  ],
  [
    "Web origins",
    "`*`, plain `http://` origins, wildcard origins that don't work, and what `+` carries over from the redirect URIs.",
  ],
  [
    "Grant types",
    "Implicit flow, direct access grants (password grant), device authorization, CIBA, token exchange, and service accounts on public or mixed-use clients.",
  ],
  [
    "Client authentication",
    "Public clients without PKCE S256, shared client secrets and their age, sender-constrained tokens, and legacy bearer-only clients.",
  ],
  [
    "Scopes and consent",
    "Full scope allowed, `offline_access` as a default scope, offline access without consent, and `microprofile-jwt` defaults.",
  ],
  [
    "Lifespans",
    "Client overrides for access tokens and client and offline sessions; with a realm export, realm token lifespans, refresh token rotation and offline session limits.",
  ],
  [
    "Logout",
    "Missing back-channel or front-channel logout and logout URLs over plain HTTP.",
  ],
  [
    "SAML",
    "Unsigned documents or assertions, client signatures not required, unencrypted assertions, SHA-1, Name ID format, ECP, IdP-initiated SSO and HTTP ACS URLs.",
  ],
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

function Ticks({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/g)
        .map((p, i) =>
          p.startsWith("`") && p.endsWith("`") ? (
            <code key={i}>{p.slice(1, -1)}</code>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
    </>
  );
}

export default function KeycloakClientCheckerPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Keycloak Client Security Checker",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Check Keycloak OIDC and SAML client exports",
      "Check every client in a realm export",
      "Wildcard and insecure redirect URI detection",
      "PKCE, implicit flow and password grant checks",
      "Token lifespan and refresh token checks",
      "Suggested fixed JSON with a diff",
      "Markdown report, entirely client-side",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <Head>
        <meta name="keywords" content={PAGE_META.keywords} />
        <link rel="canonical" href={PAGE_META.url} />
        <script type="application/ld+json">{JSON.stringify(appJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Head>

      <main className="margin-vert--lg container">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="mb-3 text-4xl font-semibold text-white">
            Keycloak Client Security Checker
          </h1>
          <p className="text-lg text-gray-400">
            Paste a Keycloak client or realm export and get a graded list of the
            settings that put your users at risk, from wildcard redirect URIs
            and missing PKCE to the password grant and unsigned SAML, each with
            the exact place in the admin console to fix it. All in your browser.
          </p>
        </header>

        <div className="mx-auto max-w-5xl">
          <ClientChecker />
        </div>

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300 print:hidden">
          <H2>What the checker looks at</H2>
          <p className="mb-4">
            Each finding comes with a severity, a plain-English reason, where to
            change it in the admin console and what to change it to. The rules
            follow{" "}
            <Link to="/docs/security/oauth-security-bcp">
              RFC 9700, the OAuth 2.0 Security Best Current Practice
            </Link>
            , and the Keycloak field names in a{" "}
            <code>ClientRepresentation</code>.
          </p>
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {CHECKS.map(([name, desc]) => (
                  <tr
                    key={name}
                    className="border-b border-white/5 align-top last:border-0"
                  >
                    <td className="whitespace-nowrap py-2 pr-4 font-medium text-white">
                      {name}
                    </td>
                    <td className="py-2 text-gray-400">
                      <Ticks text={desc} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            The score starts at 100 and drops with each finding by severity; any
            critical finding caps it at an F. It is a quick read of the exported
            configuration, not a penetration test: it can't see your
            authentication flows, your applications' token handling, or client
            policies whose conditions it can't evaluate.
          </p>

          <H2>Fix it once, for every client</H2>
          <p className="mb-4">
            Fixing clients one by one doesn't stop the next one from being
            created with the same defaults. Most of the client-level findings
            can be enforced realm-wide with{" "}
            <Link to="/docs/security/client-policies">client policies</Link>:{" "}
            <code>reject-ropc-grant</code>, <code>reject-implicit-grant</code>,{" "}
            <code>pkce-enforcer</code> and{" "}
            <code>secure-redirect-uris-enforcer</code>. The{" "}
            <Link to="/docs/security/oauth-security-bcp">
              RFC 9700 for Keycloak
            </Link>{" "}
            guide has a tested realm-wide profile. Token lifespans and refresh
            token rotation are covered in{" "}
            <Link to="/docs/security/tokens-and-sessions">
              Tokens and Sessions
            </Link>
            .
          </p>
          <p className="mb-4">
            Don&rsquo;t forget the clients Keycloak creates for you.{" "}
            <code>admin-cli</code> ships with the password grant on, and its
            client ID is known to every attacker. See{" "}
            <Link to="/docs/authentication/sign-in-methods#built-in-clients">
              built-in clients
            </Link>{" "}
            and{" "}
            <Link to="/blog/keycloak-disable-admin-cli-account-clients">
              which Keycloak clients should be enabled when you go live
            </Link>
            .
          </p>

          <H2>Learn more</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <Link to="/docs/security">Securing Keycloak in production</Link> —
              every common attack on a realm and the setting that addresses it.
            </li>
            <li>
              <Link to="/blog/keycloak-invalid-redirect-uri">
                Keycloak &ldquo;Invalid parameter: redirect_uri&rdquo;
              </Link>{" "}
              — how redirect URI matching really works.
            </li>
            <li>
              <Link to="/docs/getting-started/launch-checklist">
                Go-live checklist
              </Link>{" "}
              — everything to check before launch.
            </li>
            <li>
              <Link to="/tools/jwt-decoder">JWT Decoder</Link> — inspect the
              tokens these clients issue.
            </li>
          </ul>

          <H2>Frequently asked questions</H2>
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {FAQS.map((f) => (
              <div key={f.q} className="mb-5">
                <h3 className="mb-1 text-base font-semibold text-white">
                  {f.q}
                </h3>
                <p className="mb-0 text-sm text-gray-400">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
