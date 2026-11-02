import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import PkceGenerator from "../../components/tools/oidc-playground/PkceGenerator";

const PAGE_META = {
  title: "PKCE Generator — Create code_verifier & code_challenge (S256)",
  description:
    "Free PKCE code verifier and code challenge generator. Create a random code_verifier and its S256 code_challenge, or compute the challenge for a verifier you paste — all in your browser with the Web Crypto API.",
  keywords:
    "pkce generator, code verifier generator, code challenge generator, pkce s256, code_challenge_method s256, rfc 7636, oauth pkce, keycloak pkce",
  url: "https://phasetwo.io/tools/pkce-generator",
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function PkceGeneratorPage() {
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PKCE Generator",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Generate a random code_verifier (43–128 characters)",
      "Compute the S256 code_challenge",
      "Validate a pasted code_verifier",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <Head>
        <meta name="keywords" content={PAGE_META.keywords} />
        <link rel="canonical" href={PAGE_META.url} />
        <script type="application/ld+json">{JSON.stringify(appJsonLd)}</script>
      </Head>

      <main className="margin-vert--lg container">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="mb-3 text-4xl font-semibold text-white">
            PKCE Generator
          </h1>
          <p className="text-lg text-gray-400">
            Generate a PKCE <code>code_verifier</code> and its S256{" "}
            <code>code_challenge</code>, or paste a verifier to compute and
            check its challenge.
          </p>
        </header>

        <PkceGenerator />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>What is PKCE?</H2>
          <p className="mb-4">
            <strong className="text-white">Proof Key for Code Exchange</strong>{" "}
            (RFC 7636, pronounced &quot;pixy&quot;) protects the OAuth
            authorization code flow. Before redirecting, the client creates a
            random <code>code_verifier</code> and sends only its hash — the{" "}
            <code>code_challenge</code> — in the authorize request. When it
            exchanges the code at the token endpoint it sends the verifier, and
            the server checks that it hashes to the challenge. Someone who
            steals the code cannot use it without the verifier.
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <code>code_verifier</code>: 43–128 characters from{" "}
              <code>A–Z a–z 0–9 - . _ ~</code>, with at least 256 bits of
              randomness.
            </li>
            <li>
              <code>code_challenge</code> (S256):{" "}
              <code>BASE64URL(SHA-256(code_verifier))</code> — always 43
              characters.
            </li>
            <li>
              <code>plain</code> sends the verifier itself as the challenge,
              which protects nothing if the request is observed. Always use
              S256.
            </li>
          </ul>
          <p className="mb-4">
            PKCE is required for public clients such as single-page and mobile
            apps, and OAuth 2.1 requires it for everyone. In Keycloak you can
            enforce it per client under{" "}
            <em>
              Advanced → Proof Key for Code Exchange Code Challenge Method
            </em>
            . See it in a real flow in the{" "}
            <Link to="/tools/oidc-playground">OIDC Playground</Link>, or check
            an existing request with the{" "}
            <Link to="/tools/oidc-url-inspector">Authorize URL Inspector</Link>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
