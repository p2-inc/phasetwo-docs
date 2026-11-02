import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import JwksVerifier from "../../components/tools/jwks/JwksVerifier";

const PAGE_META = {
  title: "JWKS Verifier — Inspect JSON Web Key Sets & Verify JWT Signatures",
  description:
    "Free online JWKS viewer and verifier. Fetch or paste a JSON Web Key Set, inspect every key (kid, kty, alg, use, key size, thumbprint, x5c certificate), catch weak or expired keys, and verify a JWT signature against it. Keycloak-aware, and everything runs in your browser.",
  // Targets: jwks, jwks verifier, jwks viewer, jwks validator, keycloak jwks, keycloak certs endpoint.
  keywords:
    "jwks, jwks verifier, jwks viewer, jwks validator, json web key set, jwk, jwks_uri, kid, jwk thumbprint, x5c, keycloak jwks, keycloak certs endpoint, openid-connect/certs, verify jwt signature, key rotation",
  url: "https://phasetwo.io/tools/jwks-verifier",
};

const FAQS = [
  {
    q: "What is a JWKS?",
    a: "A JSON Web Key Set (JWKS, RFC 7517) is a JSON document with a keys array, where each entry is a JSON Web Key (JWK) describing one public key. Identity providers publish their JWKS at a jwks_uri so applications can verify the signatures on ID tokens and access tokens without sharing any secret.",
  },
  {
    q: "Where is the Keycloak JWKS endpoint?",
    a: "Every Keycloak realm publishes its public keys at https://your-host/realms/{realm}/protocol/openid-connect/certs (older deployments add an /auth prefix). The same URL is advertised as jwks_uri in the realm's /.well-known/openid-configuration document. You can paste the realm URL into this tool and it will find the certs endpoint for you.",
  },
  {
    q: "What does kid mean?",
    a: "kid is the key ID. A signed JWT carries the kid of the key that signed it in its header, and verifiers look up the key with the same kid in the JWKS. Without unique kids, a verifier cannot reliably pick the right key when more than one is published — which is exactly what happens during key rotation.",
  },
  {
    q: 'Why does my JWKS contain a key with use "enc"?',
    a: "Keys marked use: enc are for encryption, not signing. Keycloak publishes an RSA-OAEP encryption key alongside its signing keys so clients can encrypt data (for example, encrypted ID tokens) to the realm. Signature verification should only use keys with use: sig, or keys without a use.",
  },
  {
    q: "Is it safe to paste my keys and tokens here?",
    a: "Yes. A JWKS only contains public keys, and all analysis and signature verification happens in your browser with WebCrypto. Nothing is sent to Phase Two. If you enter a URL, your browser fetches it directly from that server. If the tool finds private key material in the set, it flags it as an error — a published JWKS must never contain it.",
  },
  {
    q: "What is a JWK thumbprint?",
    a: "A JWK thumbprint (RFC 7638) is a SHA-256 hash of a key's required public members in a canonical order. It is a stable fingerprint of the key itself, independent of kid or other metadata, which makes it useful for pinning and for comparing keys across environments.",
  },
  {
    q: "Why does fetching a JWKS URL fail in the browser?",
    a: "Browsers only let a page read a cross-origin response when the server sends CORS headers. Keycloak's certs endpoint sends them for any origin, so a failure there usually means a wrong realm name (Keycloak's 404 has no CORS headers), a proxy or WAF stripping headers, or a network problem. Other providers may not allow browser requests at all. Either way, you can open the URL in a tab and paste the JSON instead.",
  },
  {
    q: "How do I rotate keys in Keycloak?",
    a: "Add a new key provider under Realm settings → Keys → Providers with a higher priority than the current one. Keycloak signs new tokens with the active key of the highest priority, while older keys stay published so existing tokens still verify. Once those tokens have expired, set the old key to passive (still verifies, never signs) and later disable or delete it.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function JwksVerifierPage() {
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
    name: "JWKS Verifier",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Fetch a JWKS from a URL or paste it as JSON",
      "Inspect kid, kty, alg, use, key size, and RFC 7638 thumbprint",
      "Read x5c certificate subject and validity",
      "Flag weak RSA keys, duplicate or missing kids, expired certificates, and leaked private keys",
      "Match a JWT to its key by kid and verify the signature",
      "Find the Keycloak certs endpoint from a realm URL",
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
            JWKS Verifier
          </h1>
          <p className="text-lg text-gray-400">
            Inspect any JSON Web Key Set — from Keycloak, Phase Two, or any
            OpenID Connect provider. See every key's ID, type, size, thumbprint,
            and certificate, catch weak or expired keys, and verify a JWT
            signature against the set — all in your browser.
          </p>
        </header>

        <JwksVerifier />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>What is a JWKS?</H2>
          <p className="mb-4">
            A <strong className="text-white">JSON Web Key Set (JWKS)</strong> is
            how an identity provider publishes the public keys that verify its
            tokens. It is a JSON object with a <code>keys</code> array; each
            entry is a JSON Web Key (JWK) with a key type (<code>kty</code>), a
            key ID (<code>kid</code>), usually an intended use (<code>use</code>
            ) and algorithm (<code>alg</code>), the public key parameters (
            <code>n</code> and <code>e</code> for RSA, <code>crv</code>,{" "}
            <code>x</code>, and <code>y</code> for elliptic curves), and
            sometimes an X.509 certificate chain (<code>x5c</code>).
          </p>
          <p className="mb-4">
            When your application receives a token, it reads the{" "}
            <code>kid</code> from the token header, finds the key with the same{" "}
            <code>kid</code> in the issuer's JWKS, and checks the signature.
            Because only public keys are published, anyone can verify tokens but
            only the issuer can sign them.
          </p>

          <H2>The Keycloak JWKS endpoint</H2>
          <p className="mb-4">
            Every Keycloak realm serves its keys at{" "}
            <code>/realms/&#123;realm&#125;/protocol/openid-connect/certs</code>{" "}
            and advertises that URL as <code>jwks_uri</code> in its{" "}
            <Link to="/tools/oidc-discovery">discovery document</Link>. A
            default realm publishes an RS256 signing key and an RSA-OAEP
            encryption key, each with a self-signed certificate whose subject is
            the realm name. You can see and manage the same keys in the admin
            console under{" "}
            <strong className="text-white">Realm settings → Keys</strong>: the{" "}
            <em>Keys list</em> tab shows each key's kid, algorithm, and status,
            and the <em>Providers</em> tab is where keys are generated,
            imported, and prioritized.
          </p>

          <H2>Key rotation without breaking tokens</H2>
          <p className="mb-4">
            Rotation works because a JWKS can hold several keys at once. Clients
            cache the set and refetch it when they see an unknown{" "}
            <code>kid</code>, so a safe rotation looks like this:
          </p>
          <ol className="mb-4 list-decimal space-y-1 pl-5">
            <li>
              <strong className="text-white">Publish the new key.</strong> In
              Keycloak, add a key provider (for example <em>rsa-generated</em>)
              with a higher priority than the current one. New tokens are signed
              with the active key of the highest priority.
            </li>
            <li>
              <strong className="text-white">
                Keep the old key published.
              </strong>{" "}
              Tokens signed with it keep verifying until they expire — leave it
              enabled for at least the longest token or session lifetime.
            </li>
            <li>
              <strong className="text-white">Retire it.</strong> Mark the old
              provider passive (it verifies but never signs), then disable or
              delete it once nothing signed with it is still in use.
            </li>
          </ol>
          <p className="mb-4">
            Paste a token into the verifier above to see which key it was signed
            with — a token whose <code>kid</code> is no longer in the set is the
            classic symptom of a key removed too early.
          </p>

          <H2>What this tool checks</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              Missing or duplicate <code>kid</code> values, which make key
              selection ambiguous.
            </li>
            <li>
              RSA keys shorter than 2048 bits, mismatched <code>alg</code> and{" "}
              <code>kty</code>, and keys without <code>use</code> or{" "}
              <code>alg</code>.
            </li>
            <li>
              Expired, not-yet-valid, or soon-to-expire <code>x5c</code>{" "}
              certificates, and <code>x5t#S256</code> values that do not match
              the certificate.
            </li>
            <li>
              Private key material (<code>d</code>, <code>p</code>,{" "}
              <code>q</code>, or symmetric <code>k</code>) that must never be
              published.
            </li>
          </ul>
          <p className="mb-4">
            To check the rest of a provider's configuration — issuer, endpoints,
            PKCE support, and algorithms — use the{" "}
            <Link to="/tools/oidc-discovery">OIDC Discovery Inspector</Link>. To
            read a token's claims, use the{" "}
            <Link to="/tools/jwt-decoder">JWT Decoder</Link>.
          </p>

          <H2>Learn more</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <Link to="/tutorials/jwts/jwt-security-best-practices">
                JWT security best practices
              </Link>{" "}
              — algorithms, expiry, revocation, and key handling.
            </li>
            <li>
              <Link to="/tutorials/jwts/decoding-jwt-structure">
                Decoding JWT structure
              </Link>{" "}
              — what the header's <code>alg</code> and <code>kid</code> mean.
            </li>
            <li>
              <Link to="/docs/keycloak/overview">Keycloak overview</Link> — how
              Phase Two and Keycloak issue and sign tokens.
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
