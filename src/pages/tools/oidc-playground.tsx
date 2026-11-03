import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import OidcPlayground from "../../components/tools/oidc-playground/OidcPlayground";

const PAGE_META = {
  title: "OIDC Playground — Test Authorization Code + PKCE with Keycloak",
  description:
    "Free OpenID Connect playground. Run the authorization code flow with PKCE against Keycloak or any OIDC provider, step by step in your browser: see the authorize URL explained, exchange the code, decode and verify tokens, call userinfo, refresh, and log out.",
  keywords:
    "oidc playground, openid connect playground, oauth playground, oidc debugger, pkce flow, authorization code flow pkce, keycloak oidc test, test keycloak client, oidc client test, token exchange, userinfo, rp-initiated logout",
  url: "https://phasetwo.io/tools/oidc-playground",
};

const FAQS = [
  {
    q: "Is it safe to use this playground with a real identity provider?",
    a: "The playground runs entirely in your browser. It talks only to the issuer you enter and the endpoints that issuer's discovery document advertises — never to Phase Two. Tokens are kept in memory and disappear when you leave the page; only the in-flight state, nonce, and PKCE verifier are stored in this tab's session storage so the flow survives the redirect. Use a dedicated test client, and remove this site's redirect URI when you are done.",
  },
  {
    q: "Why can't I enter a client secret?",
    a: "Because secrets don't belong in a browser. Anything delivered to a browser — including a value you paste into a form — can be read by whoever controls that browser, so single-page apps are public clients. Public clients prove they started the flow with PKCE instead of a secret. To test a confidential client, run the token exchange from a backend.",
  },
  {
    q: "What do I need to configure in Keycloak?",
    a: "Create an OpenID Connect client with Client authentication off (public), Standard flow on, this page's URL as a Valid redirect URI and Valid post logout redirect URI, and this site's origin (or +) in Web origins. Turn on Require PKCE with PKCE Method S256 (under Capability config in Keycloak 26) to make PKCE mandatory.",
  },
  {
    q: "Why does the token exchange fail with a network or CORS error?",
    a: "The browser calls the token endpoint directly, so the server must allow this site's origin. In Keycloak, add the origin (or +, meaning the same origins as the valid redirect URIs) to the client's Web origins. Other causes are an unreachable host, a TLS certificate your browser doesn't trust, or an http endpoint called from an https page.",
  },
  {
    q: "What does the playground check in the ID token?",
    a: "It verifies the signature against the issuer's JWKS, checks that the nonce matches the one sent in the authorize request, that iss is the discovery issuer, that aud contains your client_id (and azp when there are several audiences), that the token is not expired, and that at_hash matches the access token.",
  },
  {
    q: "What is PKCE and why is it required?",
    a: "Proof Key for Code Exchange (RFC 7636) binds the authorization code to the client that requested it. The client sends a hash of a random secret (the code_challenge) with the authorize request and the secret itself (the code_verifier) with the token request. An attacker who intercepts the code cannot redeem it without the verifier. OAuth 2.1 requires PKCE for every client using the code flow.",
  },
];

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function OidcPlaygroundPage() {
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
    name: "OIDC Playground",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "OpenID Connect discovery",
      "Authorization code flow with PKCE (S256)",
      "Authorize URL with every parameter explained",
      "Token exchange as a public client",
      "ID token nonce, issuer, audience, and at_hash checks",
      "Signature verification against the JWKS",
      "Userinfo, refresh, and RP-initiated logout",
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
            OIDC Playground
          </h1>
          <p className="text-lg text-gray-400">
            Walk through the OpenID Connect authorization code flow with PKCE
            against Keycloak or any OIDC provider — one step at a time, entirely
            in your browser. See exactly what is sent, what comes back, and
            whether it checks out.
          </p>
        </header>

        <OidcPlayground />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>How the authorization code flow with PKCE works</H2>
          <ol className="mb-4 list-decimal space-y-1 pl-5">
            <li>
              The client fetches the issuer&apos;s{" "}
              <strong className="text-white">discovery document</strong> (
              <code>/.well-known/openid-configuration</code>) to learn its
              endpoints and keys.
            </li>
            <li>
              It generates a random <code>state</code>, <code>nonce</code>, and
              PKCE <code>code_verifier</code>, and sends the user to the{" "}
              <strong className="text-white">authorization endpoint</strong>{" "}
              with the SHA-256 <code>code_challenge</code>.
            </li>
            <li>
              The user logs in. The server redirects back to the{" "}
              <code>redirect_uri</code> with a one-time <code>code</code> and
              the same <code>state</code>.
            </li>
            <li>
              The client checks <code>state</code>, then POSTs the code and the{" "}
              <code>code_verifier</code> to the{" "}
              <strong className="text-white">token endpoint</strong>. The server
              hashes the verifier and compares it with the challenge before
              issuing tokens.
            </li>
            <li>
              The client validates the ID token — signature, <code>iss</code>,{" "}
              <code>aud</code>, <code>exp</code>, and <code>nonce</code> —
              before trusting who the user is.
            </li>
          </ol>
          <p className="mb-4">
            This is the flow every browser app, mobile app, and server app
            should use. The implicit flow is deprecated; inspect an existing
            app&apos;s URLs with the{" "}
            <Link to="/tools/oidc-url-inspector">Authorize URL Inspector</Link>{" "}
            or generate PKCE values with the{" "}
            <Link to="/tools/pkce-generator">PKCE Generator</Link>.
          </p>

          <H2>Testing a Keycloak client</H2>
          <p className="mb-4">
            The playground is a quick way to confirm a Keycloak client is set up
            correctly before you wire it into an app: redirect URIs, web
            origins, client scopes, protocol mappers, and the claims that end up
            in each token. Decode the tokens to check roles and mappers, then
            call userinfo to see what the server releases there. For deeper
            token analysis, paste any token into the{" "}
            <Link to="/tools/jwt-decoder">JWT Decoder</Link>. For client setup,
            see the <Link to="/docs/keycloak/overview">Keycloak overview</Link>.
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
