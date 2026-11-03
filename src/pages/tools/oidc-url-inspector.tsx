import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import UrlInspector from "../../components/tools/oidc-playground/UrlInspector";

const PAGE_META = {
  title:
    "OAuth & OIDC Authorize URL Inspector — Lint Requests & Explain Errors",
  description:
    "Free OAuth 2.0 and OpenID Connect URL inspector. Paste an authorize URL or callback URL to see every parameter explained, catch missing PKCE, state, or nonce, spot implicit-flow and redirect_uri problems, and get plain-English explanations of OAuth errors and common Keycloak causes.",
  keywords:
    "oauth url decoder, authorize url inspector, oidc debugger, oauth error codes, invalid_redirect_uri, invalid parameter redirect_uri keycloak, unauthorized_client, login_required, invalid_grant, pkce check, oauth callback parser, keycloak error",
  url: "https://phasetwo.io/tools/oidc-url-inspector",
};

const FAQS = [
  {
    q: 'What does "Invalid parameter: redirect_uri" mean in Keycloak?',
    a: "Keycloak refused the request because the redirect_uri is not registered for the client. Since it cannot trust that address, it shows an error page instead of redirecting. Add the exact URI to the client's Valid redirect URIs — scheme, host, port, path, and trailing slash all have to match.",
  },
  {
    q: "What does unauthorized_client mean?",
    a: "The client is not allowed to use the requested grant or response type. In Keycloak this usually means Standard flow is turned off for the client (for the code flow), or Implicit flow is off when response_type includes token or id_token.",
  },
  {
    q: "Why do I get login_required?",
    a: "The request used prompt=none (a silent check) and the user has no active session at the server — or the browser blocked the server's cookie in a third-party iframe. It is expected behavior for silent authentication: send the user through an interactive login.",
  },
  {
    q: "Why does the inspector warn about the implicit flow?",
    a: "Implicit and hybrid flows return tokens in the URL, where they leak through browser history, logs, and referrers. The OAuth 2.0 Security Best Current Practice (RFC 9700) deprecates the implicit flow and OAuth 2.1 removes it. Use the authorization code flow with PKCE instead.",
  },
  {
    q: "Is my URL sent anywhere?",
    a: "No. Parsing and linting happen in your browser. The only optional network request is to the issuer's own discovery document, when you ask the inspector to check the request against what the server advertises.",
  },
];

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function OidcUrlInspectorPage() {
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
    name: "Authorize URL Inspector",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Parse OAuth 2.0 / OIDC authorize and callback URLs",
      "Detect implicit and hybrid flows",
      "Check PKCE, state, nonce, and redirect_uri",
      "Explain OAuth error codes and common Keycloak causes",
      "Compare a request with the issuer's discovery document",
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
            Authorize URL Inspector
          </h1>
          <p className="text-lg text-gray-400">
            Paste an OAuth 2.0 or OpenID Connect authorize URL — or the callback
            URL your app received — to see every parameter explained, catch
            security problems, and decode error responses in plain English.
          </p>
        </header>

        <UrlInspector />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>What the inspector checks</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <code>response_type</code> and the flow it implies — code,
              implicit, or hybrid.
            </li>
            <li>
              <code>openid</code> in <code>scope</code>, so you actually get an
              ID token.
            </li>
            <li>
              PKCE: a <code>code_challenge</code> with{" "}
              <code>code_challenge_method=S256</code>, of the right length.
            </li>
            <li>
              <code>state</code> and <code>nonce</code> present and long enough
              to be unguessable.
            </li>
            <li>
              <code>redirect_uri</code> sanity: absolute, https, no wildcard, no
              fragment, loopback notes.
            </li>
            <li>
              <code>response_mode</code>, <code>prompt</code>,{" "}
              <code>max_age</code>, duplicate and unknown parameters.
            </li>
            <li>
              For callbacks: the code, <code>state</code>, <code>iss</code>, and
              any <code>error</code> with its likely causes.
            </li>
          </ul>
          <p className="mb-4">
            To run a full flow and see the tokens, use the{" "}
            <Link to="/tools/oidc-playground">OIDC Playground</Link>. To build
            PKCE values by hand, use the{" "}
            <Link to="/tools/pkce-generator">PKCE Generator</Link>.
          </p>

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
