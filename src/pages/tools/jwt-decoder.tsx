import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import JwtDecoder from "../../components/tools/jwt/JwtDecoder";

const PAGE_META = {
  title: "JWT Decoder — Decode & Verify JWT, Keycloak & OAuth Tokens",
  description:
    "Free online JWT decoder for any JSON Web Token — including Keycloak, Phase Two, OAuth 2.0, and OpenID Connect tokens. Decode the header and payload, read claims and roles in plain English, check expiry, and verify the signature. Everything runs in your browser.",
  // Targets: jwt decoder, decode jwt, keycloak jwt decoder, oauth/oidc token decoder, jwks.
  keywords:
    "jwt decoder, decode jwt, jwt-decode, jwt token decode, jwks, keycloak jwt decoder, decode keycloak token, keycloak access token, oauth token decoder, oidc token decoder, access token decoder, bearer token decoder, realm_access, json web token decoder",
  url: "https://phasetwo.io/tools/jwt-decoder",
};

const FAQS = [
  {
    q: "Is it safe to paste my JWT here?",
    a: "Yes. Decoding and verification happen entirely in your browser using client-side JavaScript. Your token, secrets, and keys are never transmitted to Phase Two or any other server, logged, or stored. You can confirm this by opening your browser's network tab while you decode.",
  },
  {
    q: "What does a JWT contain?",
    a: "A signed JWT has three base64url-encoded segments separated by dots: a header (algorithm and key metadata), a payload (the claims — data about the subject and token), and a signature (cryptographic proof the token wasn't tampered with). Decoding reveals the header and payload.",
  },
  {
    q: "Does decoding a JWT verify it?",
    a: "No. Anyone can read the contents of a JWT — the header and payload are only base64-encoded, not encrypted. Verifying a token means checking its signature against the issuer's key and validating claims like exp, nbf, iss, and aud. This tool can do both: decoding shows what's inside, and the signature verification panel proves it is authentic.",
  },
  {
    q: "How do I decode a Keycloak access token?",
    a: "Paste the access token into the decoder. It automatically recognizes Keycloak and Phase Two tokens and renders realm roles (realm_access), client/resource roles (resource_access), scopes, the authorized party (azp), and session info as readable lists — ideal for debugging role mappings and authorization issues.",
  },
  {
    q: "What is the difference between realm_access and resource_access?",
    a: "In a Keycloak token, realm_access.roles holds realm-level roles that apply across the whole realm, while resource_access maps each client (resource) to the roles the subject holds on that specific client. The decoder separates and labels both so you can see exactly which roles a token carries and where.",
  },
  {
    q: "Can I decode an OAuth 2.0 access token or an OpenID Connect ID token?",
    a: "Yes. OAuth 2.0 access tokens and OIDC ID tokens issued as JWTs decode the same way. The decoder highlights standard OAuth/OIDC claims such as scope, aud, azp, nonce, and email_verified, and converts time claims (exp, iat, nbf, auth_time) into human-readable dates.",
  },
  {
    q: "How do I verify a Keycloak JWT signature?",
    a: "Use the signature verification panel and choose JWKS URL. For a Keycloak realm the decoder prefills the certs endpoint from the token's issuer (for example https://host/realms/your-realm/protocol/openid-connect/certs). It fetches the public keys, matches by key id (kid), and checks the signature. HMAC secrets and PEM public keys are also supported.",
  },
  {
    q: "Why does my token show as expired?",
    a: "The decoder compares the exp (and nbf) claims against your current time and shows the result. An expired badge means the token's lifetime has passed — the signature may still be valid, which is why verification and expiry are reported separately.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function JwtDecoderPage() {
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
    name: "JWT Decoder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Decode JWT header and payload",
      "Decode Keycloak and Phase Two access tokens",
      "Decode OAuth 2.0 and OpenID Connect tokens",
      "Verify signatures with a secret, public key, or JWKS URL",
      "Human-readable claims and expiry",
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
        {/* Hero — readable width */}
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="mb-3 text-4xl font-semibold text-white">
            JWT Decoder
          </h1>
          <p className="text-lg text-gray-400">
            Decode and inspect any JSON Web Token — including Keycloak, Phase
            Two, OAuth 2.0, and OpenID Connect tokens. See the header, payload,
            claims, and roles in plain English, then verify the signature — all
            in your browser.
          </p>
        </header>

        {/* Tool — wide, fills the container */}
        <JwtDecoder />

        {/* Supporting content — readable width, smaller headings. */}
        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>What is a JWT?</H2>
          <p className="mb-4">
            A <strong className="text-white">JSON Web Token (JWT)</strong> is a
            compact, URL-safe way to represent claims between two parties. It is
            the backbone of modern authentication and authorization — OAuth 2.0
            and OpenID Connect use JWTs for access tokens, ID tokens, and
            refresh tokens. A signed JWT (a JWS) is made of three parts —{" "}
            <code>header.payload.signature</code> — each base64url-encoded and
            joined with dots.
          </p>
          <p className="mb-4">
            The header and payload are{" "}
            <em className="text-white">encoded, not encrypted</em>, so anyone
            holding the token can read them. This tool splits the token,
            base64url-decodes the header and payload, and shows you the JSON
            inside along with friendly explanations of each claim.
          </p>

          <H2>How to get a JWT from your browser</H2>
          <p className="mb-4">
            If you need the token your app is actually using, you can grab it
            from your browser's developer tools (open them with <code>F12</code>
            , or <code>Cmd</code>+<code>Option</code>+<code>I</code> on macOS):
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Network tab</strong> — reload the
              page, click an API request, and look at the request headers for{" "}
              <code>Authorization: Bearer &lt;token&gt;</code>. Copy everything
              after <code>Bearer </code>. You can also inspect the response of
              the token endpoint (for Keycloak,{" "}
              <code>/protocol/openid-connect/token</code>) to find{" "}
              <code>access_token</code> and <code>id_token</code>.
            </li>
          </ul>
          <p className="mb-4">
            A JWT is three base64url chunks joined by dots (
            <code>xxxxx.yyyyy.zzzzz</code>). Copy the whole string — including
            both dots — and paste it above. Because everything is decoded
            locally, it is safe to do this even with a real production token.
          </p>

          <H2>Decode Keycloak &amp; Phase Two access tokens</H2>
          <p className="mb-4">
            Keycloak and <Link to="/docs/keycloak/overview">Phase Two</Link>{" "}
            issue access tokens packed with authorization data. This decoder
            recognizes them automatically and breaks out the parts that matter
            for debugging:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <code>realm_access.roles</code> — realm-level roles that apply
              across the whole realm.
            </li>
            <li>
              <code>resource_access</code> — client (resource) roles, grouped by
              the client they apply to.
            </li>
            <li>
              <code>scope</code>, <code>azp</code>, <code>typ</code>, and{" "}
              <code>session_state</code> — the OAuth scopes, authorized party,
              token type, and session it belongs to.
            </li>
          </ul>
          <p className="mb-4">
            That makes it fast to answer questions like “why doesn’t this user
            have the role my app expects?” without spelunking through raw JSON.
            For setup and configuration, see the{" "}
            <Link to="/docs/keycloak/overview">Keycloak overview</Link> and our{" "}
            <Link to="/product/sso">SSO</Link> docs.
          </p>

          <H2>Decode OAuth 2.0 &amp; OpenID Connect tokens</H2>
          <p className="mb-4">
            Access tokens and ID tokens issued as JWTs decode the same way. The
            decoder highlights standard OAuth/OIDC claims — <code>scope</code>,{" "}
            <code>aud</code>, <code>azp</code>, <code>nonce</code>,{" "}
            <code>email_verified</code> — and converts the time claims (
            <code>exp</code>, <code>iat</code>, <code>nbf</code>,{" "}
            <code>auth_time</code>) into readable dates with a live expiry
            badge.
          </p>

          <H2>Decode vs. verify</H2>
          <p className="mb-4">
            Reading a token's contents (decoding) is not the same as proving it
            is genuine (verifying). Verification checks the cryptographic
            signature against the issuer's key and validates time-based and
            audience claims. Use the verification panel with a shared secret
            (HMAC), a PEM public key, or a JWKS URL — for Keycloak realms the
            JWKS endpoint is prefilled from the token's issuer. For the security
            model and common pitfalls, see our guide on{" "}
            <Link to="/articles/jwts/jwt-security-best-practices">
              JWT security best practices
            </Link>
            .
          </p>

          <H2>Learn more about JWTs</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <Link to="/articles/jwts/decoding-jwt-structure">
                Decoding JWT structure
              </Link>{" "}
              — a deep dive into each segment.
            </li>
            <li>
              <Link to="/articles/jwts/jwt-benefits-drawbacks">
                JWT benefits and drawbacks
              </Link>{" "}
              — when to use them, and when not to.
            </li>
            <li>
              <Link to="/articles/jwts/jwt-security-best-practices">
                JWT security best practices
              </Link>{" "}
              — algorithms, expiry, revocation, and storage.
            </li>
            <li>
              <Link to="/docs/keycloak/overview">Keycloak overview</Link> — how
              Phase Two and Keycloak issue and use tokens.
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
