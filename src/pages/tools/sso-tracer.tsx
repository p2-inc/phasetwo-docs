import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import { Icon } from "../../components/tools/Icon";

/**
 * Install target. Leave empty until the Chrome Web Store listing is live:
 * while it is empty the page shows "Coming soon to the Chrome Web Store"
 * instead of an install button. Set it to the listing URL to switch every
 * install call to action on this page to the store.
 */
const CHROME_STORE_URL = "";

/**
 * Source repository. The link is rendered only when GITHUB_REPO_PUBLIC is
 * true; keep it false while the repository is private.
 */
const GITHUB_REPO_URL = "https://github.com/p2-inc/sso-tracer";
const GITHUB_REPO_PUBLIC = false;

/**
 * Absolute on purpose: the policy page ships in a separate PR, and an absolute
 * URL keeps this page's build independent of the merge order.
 */
const PRIVACY_POLICY_URL = "https://phasetwo.io/company/sso-tracer-privacy";

const PAGE_META = {
  title: "SSO Tracer — Debug SAML and OIDC Logins in Chrome DevTools",
  description:
    "SSO Tracer by Phase Two is a free Chrome DevTools extension for debugging SAML and OpenID Connect / OAuth logins. It groups every SSO request into a login flow, decodes SAML messages and JWTs, verifies signatures offline, flags misconfigurations, and exports a redacted trace. No permissions, no network requests.",
  keywords:
    "sso tracer, saml tracer, saml tracer chrome, saml chrome extension, oidc debugger, oauth debugger, saml devtools, sso debugging, debug saml login, debug oidc login, jwt chrome extension, keycloak saml debugging, keycloak oidc debugging, har saml",
  url: "https://phasetwo.io/tools/sso-tracer",
};

const IMG = "/img/tools/sso-tracer";

const FEATURES: { icon: string; title: string; body: React.ReactNode }[] = [
  {
    icon: "mdi:sync",
    title: "Login flows, not request lists",
    body: (
      <>
        Requests are grouped into flows by <code>state</code>,{" "}
        <code>nonce</code>, authorization code, SAML request ID /{" "}
        <code>InResponseTo</code>, and <code>RelayState</code>, including
        brokered logins that hop from your app to Keycloak to an external
        identity provider and back.
      </>
    ),
  },
  {
    icon: "mdi:file-code-outline",
    title: "SAML, decoded",
    body: (
      <>
        AuthnRequest, Response, LogoutRequest, and LogoutResponse over the
        HTTP-Redirect and HTTP-POST bindings, plus WS-Federation sign-in.
        Pretty-printed XML and a plain-English summary of issuer, destination,
        audience, NameID, conditions, attributes, and status.
      </>
    ),
  },
  {
    icon: "mdi:key-variant",
    title: "OIDC and OAuth, decoded",
    body: (
      <>
        Authorize requests, callbacks (query, <code>form_post</code>, and
        fragments in redirects), token, discovery, JWKS, UserInfo, logout, PAR,
        introspection, and revocation. ID and access tokens are decoded with
        claim explanations and expiry times.
      </>
    ),
  },
  {
    icon: "mdi:shield-check",
    title: "Signatures verified offline",
    body: (
      <>
        SAML XML and redirect signatures are checked against a certificate or
        metadata you paste, or metadata captured in the trace once you trust it.
        JWTs (RS, PS, ES, EdDSA) are checked against the JWKS captured in the
        same flow. Keys are never fetched.
      </>
    ),
  },
  {
    icon: "mdi:alert",
    title: "Findings that name the setting",
    body: (
      <>
        Missing PKCE, state, or nonce; redirect_uri mismatches; SAML
        Destination, Audience, and ACS mismatches; expired assertions and clock
        skew; SHA-1 signatures; and OAuth and SAML error codes, with the
        Keycloak setting most likely behind each one.
      </>
    ),
  },
  {
    icon: "mdi:download",
    title: "Redacted export",
    body: (
      <>
        Save a JSON trace, optionally with a sanitized HAR, for a support
        ticket. Cookies, Authorization headers, passwords, client secrets, PKCE
        verifiers, refresh tokens, and signatures are always removed, and you
        preview the file before saving it.
      </>
    ),
  },
];

const SHOTS = [
  {
    src: `${IMG}/01-flows.webp`,
    alt: "SSO Tracer panel in Chrome DevTools listing three login flows (OIDC, brokered OIDC, and SAML) with a timeline of the selected flow and no findings",
    caption:
      "Every SSO request in the tab, grouped into login flows, with a per-host timeline and findings for each flow.",
  },
  {
    src: `${IMG}/02-saml-response.webp`,
    alt: "A decoded SAML Response in SSO Tracer with valid signatures on the Response and the Assertion and a field-by-field summary",
    caption:
      "A SAML Response decoded, with both the Response and Assertion signatures verified against captured IdP metadata.",
  },
  {
    src: `${IMG}/03-oidc-tokens.webp`,
    alt: "A decoded ID token in SSO Tracer with a valid RS256 signature from the captured JWKS and explained claims",
    caption:
      "An ID token from the token response, its signature checked against the JWKS captured in the same flow, every claim explained.",
  },
  {
    src: `${IMG}/04-keys.webp`,
    alt: "The Keys and certificates dialog in SSO Tracer showing captured SAML metadata awaiting trust and a captured JWKS",
    caption:
      "Keys come from what you paste or what the page already downloaded. Captured SAML metadata is used only after you trust it.",
  },
  {
    src: `${IMG}/05-export.webp`,
    alt: "The Export redacted trace dialog in SSO Tracer with redaction options, counts of removed values, and a JSON preview",
    caption:
      "The export dialog: choose flows and redaction, see what was removed, and preview the exact file before saving it.",
  },
];

const FAQS = [
  {
    q: "What is SSO Tracer?",
    a: "A free Chrome DevTools extension from Phase Two for debugging single sign-on. It adds an SSO Tracer panel to DevTools that decodes the SAML and OpenID Connect / OAuth requests in the inspected tab, groups them into login flows, verifies signatures, and flags common misconfigurations.",
  },
  {
    q: "Does SSO Tracer send my tokens or SAML assertions anywhere?",
    a: "No. The extension makes no network requests of its own: its Content Security Policy sets connect-src 'none', so it could not upload anything even if it tried. There is no telemetry, analytics, or account. Captured data stays in memory and is discarded when you close DevTools.",
  },
  {
    q: "What permissions does it need?",
    a: "None. The manifest declares no permissions, no host permissions, no content scripts, and no background worker, so Chrome shows no permission warning when you install it. It reads the network log through the DevTools extension API, which is only available while DevTools is open on the tab.",
  },
  {
    q: "Why don't I see my login?",
    a: "SSO Tracer sees what the DevTools network log sees. Open DevTools on the tab before you start the login and turn on Preserve log in the Network panel so redirects across page loads are kept. Logins in popups need DevTools open in the popup, and server-to-server calls, such as a confidential client's back-end token exchange, never pass through the browser.",
  },
  {
    q: "Can it verify signatures without fetching keys?",
    a: "Yes. For SAML, paste the IdP or SP certificate or metadata, or trust SAML metadata the page already loaded. For OIDC, tokens are checked against JWKS responses captured in the same login flow, or a JWKS you paste. SSO Tracer never fetches keys itself. HMAC-signed tokens (HS256 and similar) cannot be verified without the shared secret.",
  },
  {
    q: "Can it decrypt encrypted SAML assertions?",
    a: "No. Decrypting an EncryptedAssertion takes the service provider's private key, and SSO Tracer does not ask for one. It detects encrypted assertions and decodes the rest of the message.",
  },
  {
    q: "Is it safe to attach an export to a support ticket?",
    a: "The export always removes cookies, Authorization headers, passwords, client secrets, PKCE verifiers, refresh tokens, and token and SAML signatures, and can also mask user identifiers or drop token and SAML contents entirely. You see a full preview before saving, so check it for anything your organization considers sensitive.",
  },
  {
    q: "Does it only work with Keycloak?",
    a: "No. It decodes standard SAML 2.0, WS-Federation, OAuth 2.0, and OpenID Connect traffic from any provider. With Keycloak it goes further: it recognizes realm, identity-brokering, and login-action endpoints and explains the Keycloak setting most likely behind an error.",
  },
  {
    q: "How is it different from the SAML Decoder and JWT Decoder?",
    a: "The web tools decode one message or token you paste. SSO Tracer captures the whole login as it happens, so it can correlate requests, compare a response with the request it answers, and verify tokens against keys from the same flow. Use the web tools when you already have a value in hand.",
  },
  {
    q: "Which browsers are supported?",
    a: "SSO Tracer is built and tested for Google Chrome, version 110 or later.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-12 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

function InstallCta() {
  if (CHROME_STORE_URL) {
    return (
      <a
        href={CHROME_STORE_URL}
        className="inline-flex items-center gap-2 rounded-xl bg-p2blue-500 px-5 py-3 text-base font-semibold text-white no-underline transition-colors hover:bg-p2blue-400 hover:text-white hover:no-underline"
      >
        <Icon icon="mdi:puzzle-outline" className="size-5" />
        Add to Chrome — it's free
      </a>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-p2blue-500/40 bg-p2blue-500/10 px-5 py-3 text-base font-semibold text-p2blue-400">
      <Icon icon="mdi:puzzle-outline" className="size-5" />
      Coming soon to the Chrome Web Store
    </span>
  );
}

function Shot({
  src,
  alt,
  caption,
  eager,
}: {
  src: string;
  alt: string;
  caption: string;
  eager?: boolean;
}) {
  return (
    <figure className="m-0">
      <a href={src} target="_blank" rel="noopener" className="block">
        <img
          src={src}
          alt={alt}
          width={1280}
          height={800}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="block h-auto w-full rounded-xl border border-white/10 shadow-2xl"
        />
      </a>
      <figcaption className="mt-2 text-center text-sm text-gray-400">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function SsoTracerPage() {
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
    "@type": "SoftwareApplication",
    name: "SSO Tracer by Phase Two",
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "Browser extension",
    operatingSystem: "Windows, macOS, Linux, ChromeOS",
    browserRequirements: "Requires Google Chrome 110 or later",
    url: PAGE_META.url,
    description: PAGE_META.description,
    screenshot: SHOTS.map((s) => `https://phasetwo.io${s.src}`),
    ...(CHROME_STORE_URL ? { installUrl: CHROME_STORE_URL } : {}),
    featureList: [
      "Groups SAML and OIDC/OAuth requests into login flows, including brokered logins",
      "Decodes SAML AuthnRequest, Response, and Logout messages (HTTP-Redirect and HTTP-POST bindings) and WS-Federation sign-in",
      "Decodes OIDC authorize, callback, token, discovery, JWKS, UserInfo, and logout requests and JWTs",
      "Verifies SAML XML and redirect signatures against pasted or captured metadata",
      "Verifies JWT signatures against the JWKS captured in the same flow",
      "Flags PKCE, state, nonce, redirect_uri, audience, destination, clock-skew, and signature-algorithm problems",
      "Keycloak-aware explanations",
      "Redacted JSON and HAR export",
      "No permissions and no network requests",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: {
      "@type": "Organization",
      name: "Phase Two",
      url: "https://phasetwo.io",
    },
  };

  return (
    <Layout title={PAGE_META.title} description={PAGE_META.description}>
      <Head>
        <meta name="keywords" content={PAGE_META.keywords} />
        <meta
          property="og:image"
          content={`https://phasetwo.io${IMG}/sso-tracer-og.png`}
        />
        <meta
          name="twitter:image"
          content={`https://phasetwo.io${IMG}/sso-tracer-og.png`}
        />
        <link rel="canonical" href={PAGE_META.url} />
        <script type="application/ld+json">{JSON.stringify(appJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Head>

      <main className="margin-vert--lg container">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-p2blue-400">
            Free Chrome DevTools extension
          </p>
          <h1 className="mb-3 text-4xl font-semibold text-white">
            SSO Tracer by Phase Two
          </h1>
          <p className="text-lg text-gray-400">
            Debug SAML and OpenID Connect / OAuth logins in a DevTools panel.
            Every SSO request is decoded, grouped into a login flow, and checked
            for misconfigurations. Nothing leaves your browser.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <InstallCta />
            {GITHUB_REPO_PUBLIC && (
              <a
                href={GITHUB_REPO_URL}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-base font-semibold text-white no-underline transition-colors hover:border-p2blue-500/50 hover:text-white hover:no-underline"
              >
                View source on GitHub
              </a>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-400">
            No permissions · No network requests · No account
          </p>
        </header>

        <div className="mx-auto max-w-5xl">
          <Shot {...SHOTS[0]} eager />
        </div>

        <section className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            What it does
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-6"
              >
                <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-p2blue-500/10 text-p2blue-400">
                  <Icon icon={f.icon} className="size-6" />
                </div>
                <h3 className="mb-1.5 text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mb-0 text-sm text-gray-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl space-y-10">
          {SHOTS.slice(1).map((s) => (
            <Shot key={s.src} {...s} />
          ))}
        </section>

        <section className="mx-auto mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2 id="install">Install and use it</H2>
          <ol className="mb-4 list-decimal space-y-2 pl-5">
            <li>
              {CHROME_STORE_URL ? (
                <>
                  Add SSO Tracer to Chrome from the{" "}
                  <a href={CHROME_STORE_URL}>Chrome Web Store</a>.
                </>
              ) : (
                <>
                  Add SSO Tracer to Chrome from the Chrome Web Store (the
                  listing is coming soon).
                </>
              )}
            </li>
            <li>
              Open DevTools on the tab where the login will happen (
              <code>F12</code>, or <code>Cmd</code>+<code>Option</code>+
              <code>I</code> on macOS) <strong>before</strong> you start the
              login.
            </li>
            <li>
              In the <strong className="text-white">Network</strong> panel, turn
              on <em>Preserve log</em> so redirects across page loads are kept.
            </li>
            <li>
              Select the <strong className="text-white">SSO Tracer</strong>{" "}
              panel (it may be under the <code>»</code> overflow menu) and log
              in. Select a flow for its timeline and findings, or a request for
              its decoded parameters, SAML, tokens, headers, and response body.
            </li>
            <li>
              Use <strong className="text-white">Export…</strong> to save a
              redacted trace to your machine.
            </li>
          </ol>
          <p className="mb-4">
            SSO Tracer sees what the DevTools network log sees: browser
            navigations, redirects, form posts, and requests the page makes
            itself. It cannot see requests made before DevTools was opened,
            logins in another tab or popup, or server-to-server calls such as a
            confidential client's back-end token exchange.
          </p>

          <H2 id="privacy">Private by design</H2>
          <p className="mb-4">
            Tokens and SAML assertions are credentials. Debugging a login should
            not mean pasting them into a third-party website, and it should not
            mean installing an extension that can read every page you visit. SSO
            Tracer is built so that it cannot leak what it sees:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">No permissions.</strong> The
              manifest declares no permissions, no host permissions, no content
              scripts, and no background worker. Chrome shows no permission
              warning on install.
            </li>
            <li>
              <strong className="text-white">
                Only while DevTools is open.
              </strong>{" "}
              It reads the network log of the tab you are inspecting, through
              the DevTools extension API, and only while DevTools is open on
              that tab. It has no access to other tabs or your browsing history.
            </li>
            <li>
              <strong className="text-white">No network requests.</strong> The
              extension's Content Security Policy sets{" "}
              <code>connect-src 'none'</code>, so it cannot make outgoing
              connections. There is no telemetry, no analytics, and no account.
              Signature keys come from what you paste or what the page already
              downloaded.
            </li>
            <li>
              <strong className="text-white">Nothing kept.</strong> Captured
              traces live in memory and are discarded when you close DevTools.
            </li>
            <li>
              <strong className="text-white">Redacted export.</strong> When you
              do need to share a trace, credentials are removed before the file
              is created, and you see a preview of exactly what it contains.
            </li>
          </ul>
          <p className="mb-4">
            Read the full{" "}
            <a href={PRIVACY_POLICY_URL}>SSO Tracer privacy policy</a>.
          </p>

          <H2 id="web-tools">SSO Tracer and our in-browser decoders</H2>
          <p className="mb-4">
            The <Link to="/tools/saml-decoder">SAML Decoder</Link> and{" "}
            <Link to="/tools/jwt-decoder">JWT Decoder</Link> are web pages:
            paste one SAML message or token and they decode and verify it,
            entirely in your browser. They are the right tool when you already
            have a value in hand, for example from a log or a colleague.
          </p>
          <p className="mb-4">
            SSO Tracer captures the whole login while it happens, so you do not
            have to copy anything out of the Network panel. Because it sees
            every step, it can group requests into flows, check that a callback
            matches its authorize request or a SAML Response matches its
            AuthnRequest, and verify tokens against the JWKS fetched in the same
            flow. Both use the same SAML and JWT decoding logic. For the rest of
            our free utilities, such as the{" "}
            <Link to="/tools/oidc-url-inspector">Authorize URL Inspector</Link>{" "}
            and the <Link to="/tools/jwks-verifier">JWKS Verifier</Link>, see
            all <Link to="/tools">developer tools</Link>.
          </p>

          <H2 id="faq">Frequently asked questions</H2>
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

          <div className="mt-10 rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-6 text-center">
            <p className="mb-4 text-base text-gray-300">
              SSO Tracer is built by Phase Two, the team behind hosted Keycloak
              and the Phase Two Keycloak extensions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <InstallCta />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
