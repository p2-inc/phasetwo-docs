import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import JwtGenerator from "../../components/tools/jwt/JwtGenerator";

const PAGE_META = {
  title: "JWT Generator — Create & Sign Test JWTs, Keys & JWKS",
  description:
    "Free online JWT generator. Build and sign test JSON Web Tokens with HS256, RS256, PS256, ES256, ES384, or EdDSA, start from Keycloak-style access and ID token presets, and generate a key pair with PEM and JWKS export. Everything runs in your browser.",
  // Targets: jwt generator, create jwt, sign jwt, jwks generator, test jwt.
  keywords:
    "jwt generator, create jwt, sign jwt online, jwt encoder, generate jwt token, test jwt, jwks generator, generate jwks, rs256 key pair, es256 jwt, eddsa jwt, hs256 jwt, keycloak test token, mock access token",
  url: "https://phasetwo.io/tools/jwt-generator",
};

const FAQS = [
  {
    q: "Is it safe to generate keys and tokens here?",
    a: "Keys, secrets, and tokens are created with your browser's built-in WebCrypto API and never leave the page — nothing is sent to Phase Two or any other server, logged, or stored. That said, this is a testing tool: use it for local development, fixtures, and debugging, and keep production signing keys in your identity provider or a key management service.",
  },
  {
    q: "Which signing algorithms are supported?",
    a: "HMAC with a shared secret (HS256, HS384, HS512), RSA (RS256, RS384, RS512 and the RSA-PSS variants PS256, PS384, PS512), ECDSA (ES256 on P-256 and ES384 on P-384), and EdDSA with Ed25519.",
  },
  {
    q: "How do I verify a token I generated?",
    a: "Click Open in JWT Decoder. The token is handed over in the URL fragment, which browsers never send to a server. In the decoder's signature panel, choose Secret for HMAC tokens, or Public key and paste the JWKS or public key PEM from the key panel here.",
  },
  {
    q: "Can I use the generated JWKS with my API?",
    a: "Yes, for testing. Download jwks.json and serve it from any static host or local server, then point your resource server's JWKS URL at it. Tokens signed here carry a kid that matches the key in that JWKS, so standard JWT libraries will pick the right key.",
  },
  {
    q: "Can I sign with my own key?",
    a: "Yes. Choose Import my key and paste a PKCS#8 private key (-----BEGIN PRIVATE KEY-----) or a private JWK. RSA, EC P-256/P-384, and Ed25519 keys are supported. Older PKCS#1 (BEGIN RSA PRIVATE KEY) files can be converted with openssl pkcs8 -topk8 -nocrypt.",
  },
  {
    q: "What is the kid header for?",
    a: "The key ID tells a verifier which key in a JWKS signed the token, which is what makes key rotation possible. By default this tool sets kid to the key's RFC 7638 thumbprint — a stable hash of the public key — but you can type any value.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function JwtGeneratorPage() {
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
    name: "JWT Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Sign JWTs with HS256/384/512, RS256/384/512, PS256/384/512, ES256, ES384, and EdDSA",
      "Keycloak-style access token and ID token presets",
      "Generate key pairs in the browser",
      "Export keys as PEM, JWK, and JWKS",
      "Import your own PKCS#8 or JWK private key",
      "Relative expiry helpers for iat, exp, and nbf",
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
            JWT Generator
          </h1>
          <p className="text-lg text-gray-400">
            Build and sign test JSON Web Tokens — start from a Keycloak-style
            access or ID token, pick an algorithm, and generate a key pair with
            PEM and JWKS export. All in your browser.
          </p>
        </header>

        <JwtGenerator />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>When you need a test JWT</H2>
          <p className="mb-4">
            Real tokens come from your identity provider, but plenty of work
            happens before one is available — or needs a token your IdP won't
            easily produce. A signed test token is handy for:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              Unit and integration tests for an API that validates bearer
              tokens.
            </li>
            <li>
              Checking how your backend handles an expired token, a missing
              role, the wrong <code>aud</code>, or a not-yet-valid{" "}
              <code>nbf</code>.
            </li>
            <li>
              Exercising role-based authorization without creating users and
              role mappings first.
            </li>
            <li>
              Testing key rotation by signing with a new key and a new{" "}
              <code>kid</code>.
            </li>
          </ul>

          <H2>Keycloak-style presets</H2>
          <p className="mb-4">
            The <strong className="text-white">Keycloak access token</strong>{" "}
            preset mirrors what a Keycloak realm issues: <code>iss</code> as a
            realm URL, <code>azp</code> for the client that requested the token,{" "}
            <code>sid</code> for the session, <code>scope</code>, and roles in{" "}
            <code>realm_access.roles</code> and{" "}
            <code>resource_access.&lt;client&gt;.roles</code>. The{" "}
            <strong className="text-white">ID token</strong> preset adds{" "}
            <code>nonce</code>, <code>auth_time</code>, and profile claims, with{" "}
            <code>aud</code> set to the client. Edit anything — the token is
            re-signed as you type. To see what each claim means, read{" "}
            <Link to="/tutorials/getting-started/your-first-token">
              Get a Keycloak token and read every claim
            </Link>
            .
          </p>

          <H2>Keys, PEM, and JWKS</H2>
          <p className="mb-4">
            For asymmetric algorithms the generator creates a key pair in your
            browser and shows it in four formats: a{" "}
            <strong className="text-white">JWKS</strong> document (what an
            issuer publishes at its certs endpoint — Keycloak serves one at{" "}
            <code>/realms/&lt;realm&gt;/protocol/openid-connect/certs</code>),
            the public key as PEM, and the private key as PKCS#8 PEM and as a
            JWK. Host the JWKS file to give a test API a JWKS URL, or load the
            private key into your own test fixtures. For how a backend should
            fetch, cache, and rotate those keys, see{" "}
            <Link to="/tutorials/securing-applications/validating-tokens">
              Validating Keycloak tokens in any backend
            </Link>
            .
          </p>

          <H2>Choosing an algorithm</H2>
          <p className="mb-4">
            <code>RS256</code> is the default in Keycloak and the most widely
            supported. <code>ES256</code> and <code>EdDSA</code> produce much
            smaller signatures for the same security. <code>HS256</code> uses a
            shared secret, so every verifier can also mint tokens — fine for a
            single service, risky across many. For the trade-offs and common
            pitfalls, see{" "}
            <Link to="/tutorials/jwts/jwt-security-best-practices">
              JWT security best practices
            </Link>
            .
          </p>

          <H2>Related tools</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <Link to="/tools/jwt-decoder">JWT Decoder</Link> — decode and
              verify the token you just made.
            </li>
            <li>
              <Link to="/tools/certificate-decoder">
                X.509 Certificate Decoder
              </Link>{" "}
              — inspect the certificates behind SAML and TLS.
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
