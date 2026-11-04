import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { Icon } from "../../components/tools/Icon";

const PAGE_META = {
  title: "Developer Tools — Free SAML, JWT, OIDC & Keycloak Utilities",
  description:
    "Free, browser-based identity tools from Phase Two: decode SAML and JWTs, verify JWKS, run an OIDC login flow, inspect certificates, and check Keycloak client configurations. Everything runs in your browser.",
  url: "https://phasetwo.io/tools",
};

type Tool = {
  to: string;
  icon: string;
  title: string;
  desc: string;
};

type ToolGroup = {
  title: string;
  blurb: string;
  tools: Tool[];
};

const GROUPS: ToolGroup[] = [
  {
    title: "Tokens and JWTs",
    blurb:
      "Decode, sign, and verify JSON Web Tokens and the key sets that sign them.",
    tools: [
      {
        to: "/tools/jwt-decoder",
        icon: "mdi:key-variant",
        title: "JWT Decoder",
        desc: "Decode and inspect any JSON Web Token, verify its signature, and read its claims in plain English. Keycloak-aware.",
      },
      {
        to: "/tools/jwt-generator",
        icon: "mdi:key-plus",
        title: "JWT Generator",
        desc: "Build and sign test JWTs with HMAC, RSA, ECDSA, or EdDSA. Keycloak-style presets, in-browser key pairs, and PEM/JWKS export.",
      },
      {
        to: "/tools/jwks-verifier",
        icon: "mdi:key-chain-variant",
        title: "JWKS Verifier",
        desc: "Fetch or paste a JSON Web Key Set, inspect every key and certificate, catch weak or expired keys, and verify a JWT against it.",
      },
    ],
  },
  {
    title: "OpenID Connect and OAuth",
    blurb:
      "Run real login flows, inspect issuers, and lint the URLs your apps send.",
    tools: [
      {
        to: "/tools/oidc-playground",
        icon: "mdi:play-network-outline",
        title: "OIDC Playground",
        desc: "Run the authorization code + PKCE flow against Keycloak or any OIDC provider step by step: authorize URL, token exchange, verified tokens, userinfo, refresh, and logout.",
      },
      {
        to: "/tools/oidc-discovery",
        icon: "mdi:compass-outline",
        title: "OIDC Discovery Inspector",
        desc: "Inspect any issuer's .well-known/openid-configuration: endpoints, supported features, and lint checks for issuer, PKCE, and algorithms.",
      },
      {
        to: "/tools/oidc-url-inspector",
        icon: "mdi:link-variant",
        title: "Authorize URL Inspector",
        desc: "Paste an authorize or callback URL to lint PKCE, state, nonce, and redirect_uri, flag implicit flows, and explain OAuth and Keycloak errors in plain English.",
      },
      {
        to: "/tools/pkce-generator",
        icon: "mdi:dice-multiple-outline",
        title: "PKCE Generator",
        desc: "Generate a code_verifier and S256 code_challenge, or compute the challenge for a verifier you paste.",
      },
    ],
  },
  {
    title: "SAML and certificates",
    blurb: "Read SAML messages and the X.509 certificates behind them.",
    tools: [
      {
        to: "/tools/saml-decoder",
        icon: "mdi:file-code-outline",
        title: "SAML Decoder",
        desc: "Decode SAMLResponse and SAMLRequest messages from base64, redirect URLs, or XML, check expiry, and verify the signature. Keycloak-aware.",
      },
      {
        to: "/tools/certificate-decoder",
        icon: "mdi:certificate-outline",
        title: "X.509 Certificate Decoder",
        desc: "Decode PEM, DER, and SAML metadata certificates and CSRs. Validity, SANs, key usage, SHA-1/SHA-256 fingerprints, and chain order checks.",
      },
    ],
  },
  {
    title: "Keycloak",
    blurb: "Check client configurations and stand up Keycloak locally.",
    tools: [
      {
        to: "/tools/keycloak-client-checker",
        icon: "mdi:shield-search",
        title: "Keycloak Client Security Checker",
        desc: "Paste a client or realm export to find wildcard redirect URIs, missing PKCE, password grants, broad scopes and weak SAML signing, with the fix for each.",
      },
      {
        to: "/tools/keycloak-docker-compose-generator",
        icon: "mdi:docker",
        title: "Keycloak Docker Compose Generator",
        desc: "Generate a docker-compose.yml and .env for Keycloak with your database, reverse proxy, TLS, and healthchecks. Passwords generated locally.",
      },
    ],
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
              Free, browser-based utilities for SAML, OpenID Connect, tokens,
              and Keycloak. Everything runs client-side: nothing you paste
              leaves your browser, and the only requests go to URLs you enter.
            </p>
          </header>

          {GROUPS.map((g) => (
            <section key={g.title} className="mb-10">
              <h2 className="mb-1 text-xl font-semibold text-white">
                {g.title}
              </h2>
              <p className="mb-4 text-sm text-gray-400">{g.blurb}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {g.tools.map((t) => (
                  <Link
                    key={t.to}
                    to={t.to}
                    className="group block rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-6 no-underline transition-colors hover:border-p2blue-500/50"
                  >
                    <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-p2blue-500/10 text-p2blue-400">
                      <Icon icon={t.icon} className="size-6" />
                    </div>
                    <h3 className="mb-1.5 text-lg font-semibold text-white group-hover:text-p2blue-400">
                      {t.title}
                    </h3>
                    <p className="mb-0 text-sm text-gray-400">{t.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
