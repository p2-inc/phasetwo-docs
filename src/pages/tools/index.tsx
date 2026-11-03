import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { Icon } from "@iconify/react";

const PAGE_META = {
  title: "Developer Tools — Free Identity & Token Utilities",
  description:
    "Free, browser-based developer tools from Phase Two for working with identity, tokens, and Keycloak. Decode JWTs and more — nothing leaves your browser.",
  url: "https://phasetwo.io/tools",
};

type Tool = {
  to: string;
  icon: string;
  title: string;
  desc: string;
  available: boolean;
};

const TOOLS: Tool[] = [
  {
    to: "/tools/jwt-decoder",
    icon: "mdi:key-variant",
    title: "JWT Decoder",
    desc: "Decode and inspect any JSON Web Token, verify its signature, and read its claims in plain English. Keycloak-aware.",
    available: true,
  },
  {
    to: "/tools/saml-decoder",
    icon: "mdi:file-code-outline",
    title: "SAML Decoder",
    desc: "Decode SAMLResponse and SAMLRequest messages from base64, redirect URLs, or XML, check expiry, and verify the signature. Keycloak-aware.",
    available: true,
  },
  {
    to: "/tools/jwks-verifier",
    icon: "mdi:key-chain-variant",
    title: "JWKS Verifier",
    desc: "Fetch or paste a JSON Web Key Set, inspect every key and certificate, catch weak or expired keys, and verify a JWT against it.",
    available: true,
  },
  {
    to: "/tools/oidc-discovery",
    icon: "mdi:compass-outline",
    title: "OIDC Discovery Inspector",
    desc: "Inspect any issuer's .well-known/openid-configuration: endpoints, supported features, and lint checks for issuer, PKCE, and algorithms.",
    available: true,
  },
  {
    to: "/tools/jwt-generator",
    icon: "mdi:key-plus",
    title: "JWT Generator",
    desc: "Build and sign test JWTs with HMAC, RSA, ECDSA, or EdDSA. Keycloak-style presets, in-browser key pairs, and PEM/JWKS export.",
    available: true,
  },
  {
    to: "/tools/certificate-decoder",
    icon: "mdi:certificate-outline",
    title: "X.509 Certificate Decoder",
    desc: "Decode PEM, DER, and SAML metadata certificates and CSRs. Validity, SANs, key usage, SHA-1/SHA-256 fingerprints, and chain order checks.",
    available: true,
  },
  {
    to: "/tools/oidc-playground",
    icon: "mdi:play-network-outline",
    title: "OIDC Playground",
    desc: "Run the authorization code + PKCE flow against Keycloak or any OIDC provider step by step: authorize URL, token exchange, verified tokens, userinfo, refresh, and logout.",
    available: true,
  },
  {
    to: "/tools/oidc-url-inspector",
    icon: "mdi:link-variant",
    title: "Authorize URL Inspector",
    desc: "Paste an authorize or callback URL to lint PKCE, state, nonce, and redirect_uri, flag implicit flows, and explain OAuth and Keycloak errors in plain English.",
    available: true,
  },
  {
    to: "/tools/pkce-generator",
    icon: "mdi:dice-multiple-outline",
    title: "PKCE Generator",
    desc: "Generate a code_verifier and S256 code_challenge, or compute the challenge for a verifier you paste.",
    available: true,
  },
  {
    to: "/tools/keycloak-client-checker",
    icon: "mdi:shield-search",
    title: "Keycloak Client Security Checker",
    desc: "Paste a client or realm export to find wildcard redirect URIs, missing PKCE, password grants, broad scopes and weak SAML signing, with the fix for each.",
    available: true,
  },
];

export default function ToolsIndex() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_META.title,
    description: PAGE_META.description,
    url: PAGE_META.url,
  };

  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <Head>
        <link rel="canonical" href={PAGE_META.url} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>

      <main className="margin-vert--lg container">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 text-center">
            <h1 className="mb-3 text-4xl font-semibold text-white">
              Developer Tools
            </h1>
            <p className="text-lg text-gray-400">
              Free, browser-based utilities for working with identity and
              tokens. Everything runs client-side — nothing leaves your browser.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="group block rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-6 no-underline transition-colors hover:border-p2blue-500/50"
              >
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-p2blue-500/10 text-p2blue-400">
                  <Icon icon={t.icon} className="size-6" />
                </div>
                <h2 className="mb-1.5 text-lg font-semibold text-white group-hover:text-p2blue-400">
                  {t.title}
                </h2>
                <p className="mb-0 text-sm text-gray-400">{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
