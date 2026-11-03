import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import SamlDecoder from "../../components/tools/saml/SamlDecoder";

const PAGE_META = {
  title: "SAML Decoder — Decode & Verify SAMLResponse and SAMLRequest",
  description:
    "Free online SAML decoder for SAMLResponse and SAMLRequest messages — base64, DEFLATE-encoded redirect URLs, or raw XML. Read the assertion, NameID, audience, attributes, and status codes in plain English, check expiry and clock skew, and verify the XML signature. Keycloak-aware. Everything runs in your browser.",
  // Targets: saml decoder, decode samlresponse, saml response decoder, saml tracer, keycloak saml debugging.
  keywords:
    "saml decoder, saml response decoder, decode saml response, samlresponse decoder, samlrequest decoder, saml assertion decoder, saml base64 decode, saml inflate, saml redirect binding decode, saml signature validation, verify saml signature, saml debugger, keycloak saml, keycloak saml debugging, saml status codes",
  url: "https://phasetwo.io/tools/saml-decoder",
};

const FAQS = [
  {
    q: "Is it safe to paste a SAML response here?",
    a: "Yes. Decoding, inflating, parsing, and signature verification all happen in your browser with client-side JavaScript and WebCrypto. The tool makes no network requests: your SAML messages and certificates are never sent to Phase Two or anyone else, logged, or stored. Open your browser's network tab while you decode to confirm.",
  },
  {
    q: "How do I decode a SAMLResponse?",
    a: "Paste the value of the SAMLResponse form field (base64), the whole POST body, or the raw XML. The decoder base64-decodes it, pretty-prints the XML, and summarizes the issuer, destination, NameID, audience, conditions, attributes, and status.",
  },
  {
    q: "How do I decode a SAMLRequest from a redirect URL?",
    a: "Paste the entire URL. With the HTTP-Redirect binding the SAMLRequest parameter is DEFLATE-compressed, base64-encoded, then URL-encoded. The decoder undoes all three steps, shows the RelayState, and, if the URL carries SigAlg and Signature parameters, can verify the query-string signature.",
  },
  {
    q: "Can it verify a SAML signature?",
    a: "Yes. Paste the IdP's X.509 signing certificate (PEM or bare base64) or its metadata XML. The tool canonicalizes the signed element (Exclusive C14N or C14N 1.0), checks the digest, and verifies the RSA or ECDSA signature with WebCrypto. It tells you whether the Response, the Assertion, or both are signed, and why a check failed.",
  },
  {
    q: "Can it decrypt an encrypted assertion?",
    a: "No. An EncryptedAssertion can only be decrypted with the service provider's private key, and you should never paste a private key into a web page. The tool detects encrypted assertions and tells you what it can about the message around them.",
  },
  {
    q: "Why does my SAML response say it is expired?",
    a: "SAML assertions are valid for a short window, set by Conditions NotBefore / NotOnOrAfter and SubjectConfirmationData NotOnOrAfter. The decoder compares them with your current time. A message captured a while ago will show as expired; a boundary missed by only seconds usually means the IdP's and SP's clocks disagree.",
  },
  {
    q: "What does a Responder or InvalidNameIDPolicy status mean?",
    a: "The top-level status says which side failed (Requester means the SP's request was the problem, Responder means the IdP). The second-level code says why — for example InvalidNameIDPolicy means the IdP cannot produce the NameID format the SP requested. The decoder explains every standard SAML 2.0 status code.",
  },
  {
    q: "How do I check that a SAML response matches its request?",
    a: "Switch to Compare request & response and paste both messages, in either order. The tool checks that InResponseTo equals the request ID, that the Destination and Recipient equal the requested ACS URL, that the Audience is the requesting SP's Issuer, that the NameID format and authentication context are what the SP asked for, and that the response came back over the requested binding.",
  },
  {
    q: "Does it account for clock skew?",
    a: "Yes. Set the clock-skew tolerance (in seconds) to mirror your SP's setting, such as Keycloak's Allowed clock skew on a SAML identity provider. Validity checks then accept timestamps that are off by up to that much, and say so.",
  },
  {
    q: "Does it understand Keycloak?",
    a: "Yes. It recognizes Keycloak realm SAML endpoints (/realms/{realm}/protocol/saml) and identity-broker endpoints (/realms/{realm}/broker/{alias}/endpoint), and points to the Keycloak setting behind common failures: client ID vs. issuer, audience vs. SP entity ID, NameID format, signature requirements, and allowed clock skew.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function SamlDecoderPage() {
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
    name: "SAML Decoder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Decode base64 SAMLResponse and SAMLRequest messages",
      "Inflate HTTP-Redirect binding (DEFLATE) messages from a full URL",
      "Plain-English summary of assertions, NameID, audience, attributes, and status codes",
      "Expiry and clock-skew checks",
      "Verify XML signatures and redirect query-string signatures with a certificate or IdP metadata",
      "Compare an AuthnRequest with its Response: InResponseTo, ACS URL, audience, NameID format, authentication context, and binding",
      "Configurable clock-skew tolerance",
      "Keycloak-aware troubleshooting hints",
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
            SAML Decoder
          </h1>
          <p className="text-lg text-gray-400">
            Decode and inspect any SAMLResponse or SAMLRequest — base64,
            DEFLATE-encoded redirect URLs, or raw XML. Read the assertion in
            plain English, catch expiry and clock-skew problems, and verify the
            signature — all in your browser.
          </p>
        </header>

        <SamlDecoder />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>What is a SAML message?</H2>
          <p className="mb-4">
            <strong className="text-white">SAML 2.0</strong> (Security Assertion
            Markup Language) is the XML-based standard behind most enterprise
            single sign-on. A service provider (SP) — your application — sends
            an <code>AuthnRequest</code> to an identity provider (IdP) such as
            Okta, Entra ID, or Keycloak. The IdP authenticates the user and
            sends back a <code>Response</code> containing a signed{" "}
            <code>Assertion</code>: who the user is (the <code>NameID</code>),
            which SP it is for (the <code>Audience</code>), how long it is
            valid, and the user's attributes.
          </p>
          <p className="mb-4">
            Messages travel through the browser, so they are encoded to fit in a
            form field or URL. That encoding is not encryption — anyone holding
            the message can read it, which is exactly what this decoder does.
            For a gentle introduction, read{" "}
            <Link to="/blog/introduction-to-simple-saml">SAML, simplified</Link>
            .
          </p>

          <H2>What you can paste</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">HTTP-POST binding</strong> — the
              base64 value of the <code>SAMLResponse</code> or{" "}
              <code>SAMLRequest</code> form field, or the whole form body
              including <code>RelayState</code>.
            </li>
            <li>
              <strong className="text-white">HTTP-Redirect binding</strong> — a
              full URL such as{" "}
              <code>
                https://idp.example.com/sso?SAMLRequest=…&amp;RelayState=…&amp;SigAlg=…&amp;Signature=…
              </code>
              , or just the URL-encoded <code>SAMLRequest</code> value. The
              message is DEFLATE-compressed; the decoder inflates it.
            </li>
            <li>
              <strong className="text-white">Raw XML</strong> — a Response,
              AuthnRequest, LogoutRequest, LogoutResponse, a bare Assertion, or
              SAML metadata.
            </li>
          </ul>
          <p className="mb-4">
            The format is detected automatically, and the decoder tells you
            which binding and encoding it found.
          </p>

          <H2>How to capture a SAML message from your browser</H2>
          <p className="mb-4">
            Open your browser's developer tools (<code>F12</code>, or{" "}
            <code>Cmd</code>+<code>Option</code>+<code>I</code> on macOS),
            switch to the <strong className="text-white">Network</strong> tab,
            enable <em>Preserve log</em>, and sign in:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              For a <code>SAMLResponse</code>, find the POST to the SP's
              Assertion Consumer Service URL (for a Keycloak broker,{" "}
              <code>
                /realms/&#123;realm&#125;/broker/&#123;alias&#125;/endpoint
              </code>
              ) and copy the <code>SAMLResponse</code> value from the request
              payload.
            </li>
            <li>
              For a <code>SAMLRequest</code>, find the redirect to the IdP (for
              Keycloak as the IdP,{" "}
              <code>/realms/&#123;realm&#125;/protocol/saml</code>) and copy the
              full request URL.
            </li>
          </ul>

          <H2>Verify a SAML signature</H2>
          <p className="mb-4">
            Decoding shows what a message says; verification proves who sent it.
            Paste the IdP's signing certificate or its metadata into the
            verification panel. The decoder checks every enveloped XML signature
            — on the Response, the Assertion, or both — by canonicalizing the
            signed element, comparing its digest, and verifying the RSA or ECDSA
            signature with WebCrypto. For redirect URLs it also checks the{" "}
            <code>SigAlg</code>/<code>Signature</code> query-string signature.
            It flags duplicate IDs and misplaced signatures, the patterns behind
            signature-wrapping attacks.
          </p>
          <p className="mb-4">
            Verify the message exactly as it was received: reformatting the XML,
            even just whitespace, invalidates the signature.
          </p>

          <H2>Debug SAML with Keycloak and Phase Two</H2>
          <p className="mb-4">
            When the message comes from or goes to Keycloak, the decoder
            recognizes the endpoint and translates common failures into the
            Keycloak setting that fixes them:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Issuer vs. client ID</strong> —
              Keycloak looks up a SAML client by the AuthnRequest's Issuer, so
              the two must match exactly.
            </li>
            <li>
              <strong className="text-white">Destination vs. ACS URL</strong> —
              the response Destination and SubjectConfirmationData Recipient
              must equal the SP's Assertion Consumer Service URL.
            </li>
            <li>
              <strong className="text-white">Audience vs. entity ID</strong> —
              when Keycloak brokers an external IdP, the audience must be
              Keycloak's SP entity ID (the realm URL unless overridden).
            </li>
            <li>
              <strong className="text-white">
                NameID format and clock skew
              </strong>{" "}
              — the identity provider's NameID policy format, principal type,
              and "Allowed clock skew" settings.
            </li>
          </ul>
          <p className="mb-4">
            For setup details see{" "}
            <Link to="/docs/keycloak/idp">
              Keycloak as an identity provider broker
            </Link>
            , <Link to="/docs/sso/setup">configuring identity providers</Link>,{" "}
            <Link to="/tutorials/identity-providers/attribute-mapping">
              identity provider mappers
            </Link>
            , and{" "}
            <Link to="/blog/keycloak-saml-identity-provider-idp-initiated-flow-with-okta">
              IdP-initiated SAML with Keycloak
            </Link>
            .
          </p>

          <H2>Compare a request with its response</H2>
          <p className="mb-4">
            Many SAML failures are mismatches between what the SP asked for and
            what the IdP sent back. Use{" "}
            <strong className="text-white">
              Compare request &amp; response
            </strong>{" "}
            with the AuthnRequest (or LogoutRequest) and the Response it
            produced. The tool checks InResponseTo against the request ID, the
            Destination and Recipient against the requested ACS URL, the
            Audience against the requesting SP's Issuer, the NameID format
            against the NameIDPolicy, the AuthnContextClassRef against the
            RequestedAuthnContext, and the ProtocolBinding against how the
            response actually arrived. A clock-skew tolerance setting mirrors
            your SP's allowed skew when checking validity windows.
          </p>

          <H2>More free tools</H2>
          <p className="mb-4">
            Working with OIDC too? The{" "}
            <Link to="/tools/jwt-decoder">JWT Decoder</Link> decodes and
            verifies access and ID tokens. See all{" "}
            <Link to="/tools">developer tools</Link>.
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
