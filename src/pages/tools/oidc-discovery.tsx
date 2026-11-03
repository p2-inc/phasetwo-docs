import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import DiscoveryInspector from "../../components/tools/oidc-discovery/DiscoveryInspector";

const PAGE_META = {
  title: "OIDC Discovery Inspector — Check .well-known/openid-configuration",
  description:
    "Free online OpenID Connect discovery inspector. Enter an issuer URL to fetch its .well-known/openid-configuration, see every endpoint, grant type, scope, and algorithm, lint it for issuer mismatches, missing PKCE S256, and unsafe algorithms, and summarize its JWKS. Keycloak-aware, and runs in your browser.",
  // Targets: openid-configuration, oidc discovery, well-known openid configuration, keycloak well-known.
  keywords:
    "oidc discovery, openid-configuration, .well-known/openid-configuration, well-known openid configuration, openid connect discovery, oidc metadata, issuer, jwks_uri, pkce s256, code_challenge_methods_supported, keycloak well-known, keycloak openid configuration, keycloak issuer mismatch",
  url: "https://phasetwo.io/tools/oidc-discovery",
};

const FAQS = [
  {
    q: "What is the OpenID Connect discovery document?",
    a: "OpenID Connect Discovery 1.0 defines a JSON document, served at {issuer}/.well-known/openid-configuration, that describes a provider: its issuer, endpoints (authorization, token, userinfo, logout, and more), the location of its signing keys (jwks_uri), and the response types, grant types, scopes, claims, and algorithms it supports. Client libraries read it so you only need to configure the issuer URL.",
  },
  {
    q: "Where is the Keycloak well-known URL?",
    a: "For a Keycloak realm it is https://your-host/realms/{realm}/.well-known/openid-configuration. Deployments on Keycloak 16 or earlier, or configured with http-relative-path=/auth, use https://your-host/auth/realms/{realm}/.well-known/openid-configuration. Enter the realm URL here and the tool builds the discovery URL for you.",
  },
  {
    q: "Why must the issuer match exactly?",
    a: "The issuer in the discovery document must be identical to the URL used to fetch it, and to the iss claim in every ID token. Clients compare them as exact strings — a trailing slash, a different host, or http vs. https is enough for a library to reject the provider or its tokens. This guards against one provider impersonating another.",
  },
  {
    q: "Why does Keycloak report the wrong issuer?",
    a: "Keycloak builds the issuer from its hostname configuration. If the hostname option is not set, it uses the host of the incoming request, which behind a reverse proxy may be an internal name unless proxy headers are enabled (proxy-headers=xforwarded or forwarded). A realm Frontend URL overrides the hostname for that realm. When tokens show an unexpected iss, fix those settings rather than the clients.",
  },
  {
    q: "What is PKCE and why check for S256?",
    a: "Proof Key for Code Exchange (PKCE, RFC 7636) binds an authorization code to the client that requested it, so a stolen code is useless. Providers advertise support in code_challenge_methods_supported. S256 hashes the verifier and is the method to use; plain sends it as-is and offers little protection. RFC 9700 recommends PKCE for all clients.",
  },
  {
    q: "Why does fetching the discovery document fail in the browser?",
    a: "A web page can only read a cross-origin response if the server sends CORS headers. Keycloak sends them for any origin on its discovery and certs endpoints, so a block usually means the realm does not exist (its 404 has no CORS headers), the /auth prefix is wrong, or a proxy or WAF in front of Keycloak interferes. You can always open the URL in a tab and paste the JSON instead.",
  },
  {
    q: "Is anything sent to Phase Two?",
    a: "No. Your browser fetches the discovery document and JWKS directly from the issuer you enter, and all linting runs locally in JavaScript. There is no proxy, and nothing is logged or stored.",
  },
  {
    q: "Does this work with providers other than Keycloak?",
    a: "Yes. Any OpenID Connect provider that publishes a discovery document works — for example Google, Microsoft Entra ID, Okta, or Auth0, provided the provider allows browser requests. Keycloak issuers get extra notes on realms, hostname configuration, and key management.",
  },
  {
    q: "Can I share a link to a result?",
    a: "Yes. After a fetch, use Copy share link. The link looks like /tools/oidc-discovery#url=https%3A%2F%2Fissuer.example.com%2Frealms%2Fdemo and re-runs the check when opened. Only the issuer is included — never a token or pasted JSON — and it sits in the URL fragment (after #), which browsers do not send to the server, so it does not end up in server logs.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function OidcDiscoveryPage() {
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
    name: "OIDC Discovery Inspector",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Fetch .well-known/openid-configuration from an issuer URL",
      "Readable table of every endpoint",
      "Supported response types, grant types, scopes, claims, algorithms, and PKCE methods",
      "Lint for issuer mismatch, https, PKCE S256, and alg none",
      "Fetch and summarize the provider's JWKS",
      "Keycloak realm detection and configuration notes",
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
            OIDC Discovery Inspector
          </h1>
          <p className="text-lg text-gray-400">
            Enter an issuer to fetch its{" "}
            <code>.well-known/openid-configuration</code>. See every endpoint
            and supported feature at a glance, catch configuration problems like
            issuer mismatches and missing PKCE, and check its signing keys — all
            from your browser.
          </p>
        </header>

        <DiscoveryInspector />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>What is OpenID Connect discovery?</H2>
          <p className="mb-4">
            Instead of configuring every endpoint by hand, OpenID Connect
            clients are given one URL — the{" "}
            <strong className="text-white">issuer</strong> — and fetch{" "}
            <code>&#123;issuer&#125;/.well-known/openid-configuration</code> to
            learn the rest. The discovery document lists the authorization,
            token, UserInfo, and logout endpoints, the <code>jwks_uri</code>{" "}
            holding the provider's signing keys, and what the provider supports:
            response types, grant types, scopes, claims, client authentication
            methods, signing algorithms, and PKCE methods.
          </p>
          <p className="mb-4">
            Because so much depends on it, a small mistake in the discovery
            document — the wrong host in the issuer, a missing PKCE method — can
            break every client at once. This inspector reads it the same way a
            client library would and points out what to fix.
          </p>

          <H2>What this tool checks</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Issuer match</strong> — the{" "}
              <code>issuer</code> must equal the URL you fetched it from,
              character for character.
            </li>
            <li>
              <strong className="text-white">Required metadata</strong> —
              authorization and token endpoints, <code>jwks_uri</code>, and the
              supported response types, subject types, and ID token algorithms.
            </li>
            <li>
              <strong className="text-white">https everywhere</strong> — every
              endpoint must use TLS outside local development.
            </li>
            <li>
              <strong className="text-white">PKCE</strong> — <code>S256</code>{" "}
              in <code>code_challenge_methods_supported</code>.
            </li>
            <li>
              <strong className="text-white">Unsafe algorithms</strong> —{" "}
              <code>none</code> for ID tokens, or HMAC-only signing.
            </li>
            <li>
              <strong className="text-white">Lifecycle endpoints</strong> — end
              session (logout), revocation, and introspection.
            </li>
            <li>
              <strong className="text-white">Signing keys</strong> — the{" "}
              <code>jwks_uri</code> is fetched and every key is checked, the
              same as in the{" "}
              <Link to="/tools/jwks-verifier">JWKS Verifier</Link>.
            </li>
          </ul>
          <p className="mb-4">
            Implicit-flow response types and the password grant are noted rather
            than failed: advertising them is normal for general-purpose
            providers, but RFC 9700 recommends authorization code with PKCE. See{" "}
            <Link to="/docs/security/oauth-security-bcp">
              OAuth security best practice for Keycloak
            </Link>{" "}
            for how to enforce that per client.
          </p>

          <H2>Keycloak discovery and the issuer</H2>
          <p className="mb-4">
            Each Keycloak realm is its own issuer:{" "}
            <code>https://your-host/realms/&#123;realm&#125;</code>. The
            discovery document is at{" "}
            <code>
              /realms/&#123;realm&#125;/.well-known/openid-configuration
            </code>{" "}
            and the keys at{" "}
            <code>/realms/&#123;realm&#125;/protocol/openid-connect/certs</code>
            . The tool recognizes Keycloak issuers automatically and adds notes
            specific to them.
          </p>
          <p className="mb-4">
            The most common Keycloak discovery problem is an{" "}
            <strong className="text-white">issuer mismatch</strong>. Keycloak
            does not store the issuer; it computes it from its{" "}
            <code>hostname</code> configuration, or, when that is not set, from
            the request. Behind a load balancer or reverse proxy that means the
            issuer can come out as an internal hostname or as <code>http</code>{" "}
            unless proxy headers are enabled (<code>proxy-headers</code>). A
            realm's <em>Frontend URL</em> setting overrides the hostname for
            that realm only. If the issuer here differs from what your clients
            are configured with, align the hostname setup first — tokens will
            carry the same value in their <code>iss</code> claim.
          </p>
          <p className="mb-4">
            Also check the <code>/auth</code> prefix. Keycloak 17 and later
            serve from the root by default; older versions, and newer ones
            configured with <code>http-relative-path=/auth</code>, include it.
            The prefix is part of the issuer, so moving between the two changes
            the issuer for every client.
          </p>

          <H2>Learn more</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <Link to="/tutorials/clients/oidc-client-types">
                Keycloak client types
              </Link>{" "}
              — public vs. confidential clients and when PKCE applies.
            </li>
            <li>
              <Link to="/docs/security/oauth-security-bcp">
                OAuth security best practice (RFC 9700) for Keycloak
              </Link>{" "}
              — enforce PKCE and disable legacy flows.
            </li>
            <li>
              <Link to="/tools/jwt-decoder">JWT Decoder</Link> — decode a token
              and compare its <code>iss</code> to the issuer here.
            </li>
            <li>
              <Link to="/docs/keycloak/overview">Keycloak overview</Link> — how
              Phase Two hosts and runs Keycloak.
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
