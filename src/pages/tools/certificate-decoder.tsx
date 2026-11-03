import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";

import CertDecoder from "../../components/tools/cert/CertDecoder";

const PAGE_META = {
  title: "X.509 Certificate Decoder — Decode PEM, CSR, SAML & TLS Certificates",
  description:
    "Free online X.509 certificate decoder. Paste a PEM certificate, a chain, a certificate signing request (CSR), or a bare base64 certificate from SAML metadata to see the subject, issuer, validity, SANs, key type, key usage, and SHA-1/SHA-256 fingerprints, and check chain order. Everything runs in your browser.",
  // Targets: certificate decoder, x509 decoder, pem decoder, saml certificate, cert fingerprint.
  keywords:
    "certificate decoder, x509 certificate decoder, x.509 decoder, pem decoder, decode pem certificate, ssl certificate decoder, saml certificate decoder, certificate fingerprint, sha1 fingerprint, sha256 fingerprint, certificate chain checker, csr decoder, decode csr, pkcs10 decoder, keycloak certificate, der to pem",
  url: "https://phasetwo.io/tools/certificate-decoder",
};

const FAQS = [
  {
    q: "Is it safe to paste a certificate here?",
    a: "Yes. Certificates are public by design, and this tool decodes them entirely in your browser — nothing is sent to Phase Two or any other server, logged, or stored. Never paste a private key; the tool recognizes PEM, base64, and DER private keys and refuses to process them.",
  },
  {
    q: "What formats can I paste or upload?",
    a: "PEM blocks (-----BEGIN CERTIFICATE-----), several PEM blocks in a row for a chain, a bare base64 body without the BEGIN/END lines (as in SAML metadata and Keycloak's Keys tab), whole SAML metadata XML with <X509Certificate> elements, PKCS#10 certificate signing requests (-----BEGIN CERTIFICATE REQUEST-----), and .crt, .cer, .pem, .csr, or binary .der files.",
  },
  {
    q: "What is a certificate fingerprint?",
    a: "A fingerprint is a hash of the certificate's DER encoding. It is a short, unique way to identify a certificate, and some SAML identity providers and service providers ask for the SHA-1 or SHA-256 fingerprint instead of the full certificate. Both are shown with a copy button.",
  },
  {
    q: "How does the chain order check work?",
    a: "When you paste more than one certificate, the tool checks that each one's issuer matches the next one's subject and verifies the signature with the next certificate's public key. Servers should send the leaf first, then each intermediate; the root is optional.",
  },
  {
    q: "Where are certificates used in Keycloak?",
    a: "Each realm has signing keys with a certificate under Realm settings → Keys. SAML clients can have their own signing and encryption certificates under the client's Keys tab. SAML identity providers store the IdP's certificate in Validating X509 certificates so Keycloak can verify signed assertions.",
  },
  {
    q: "Why does my self-signed certificate show as valid?",
    a: "Self-signed certificates — including Keycloak realm certificates — are fine for SAML and token signing, where trust comes from exchanging metadata rather than a CA. Valid here means the current time is inside the validity window; it does not mean a browser would trust it for TLS.",
  },
];

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-2.5 mt-10 text-xl font-semibold text-white">
      {children}
    </h2>
  );
}

export default function CertificateDecoderPage() {
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
    name: "X.509 Certificate Decoder",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: PAGE_META.url,
    description: PAGE_META.description,
    featureList: [
      "Decode PEM, DER, and bare base64 X.509 certificates",
      "Extract certificates from SAML metadata",
      "Subject, issuer, validity, SANs, key usage, and basic constraints",
      "SHA-1 and SHA-256 fingerprints",
      "Self-signed detection and chain order check",
      "Decode PKCS#10 certificate signing requests and verify their signature",
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
            X.509 Certificate Decoder
          </h1>
          <p className="text-lg text-gray-400">
            Paste a PEM certificate, a full chain, a certificate signing
            request, or the bare base64 certificate from SAML metadata. See who
            it belongs to, when it expires, what it covers, and its fingerprints
            — all in your browser.
          </p>
        </header>

        <CertDecoder />

        <section className="mx-auto mt-16 max-w-3xl text-[0.95rem] leading-relaxed text-gray-300">
          <H2>What is an X.509 certificate?</H2>
          <p className="mb-4">
            An <strong className="text-white">X.509 certificate</strong> binds a
            public key to an identity — a hostname, an organization, or a
            service — and is signed by an issuer that vouches for that binding.
            TLS uses certificates to prove a server is who it says it is; SAML
            uses them to prove an assertion came from the right identity
            provider. A certificate is a DER-encoded ASN.1 structure, usually
            shipped base64-encoded between <code>BEGIN CERTIFICATE</code> and{" "}
            <code>END CERTIFICATE</code> lines (PEM).
          </p>

          <H2>Reading the fields</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Subject and issuer</strong> — who
              the certificate is for and who signed it. When they are the same,
              the certificate is self-signed.
            </li>
            <li>
              <strong className="text-white">Validity</strong> — the{" "}
              <em>not before</em> and <em>not after</em> window. Expired
              certificates are a common cause of sudden SAML login failures.
            </li>
            <li>
              <strong className="text-white">Subject Alternative Names</strong>{" "}
              — the hostnames and IPs a TLS certificate is valid for. Modern
              clients ignore the subject CN and only check SANs.
            </li>
            <li>
              <strong className="text-white">
                Key usage and extended key usage
              </strong>{" "}
              — what the key may be used for, such as digital signatures, TLS
              server authentication, or signing other certificates.
            </li>
            <li>
              <strong className="text-white">Basic constraints</strong> —
              whether the certificate is a CA that can issue other certificates.
            </li>
          </ul>

          <H2>Certificates in Keycloak</H2>
          <p className="mb-4">
            Keycloak uses certificates in a few places, and this decoder is a
            quick way to check any of them:
          </p>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <strong className="text-white">Realm keys</strong> — under{" "}
              <em>Realm settings → Keys</em>, each RSA signing key has a
              self-signed certificate whose CN is the realm name. Click{" "}
              <em>Certificate</em> to view its base64 body, then paste it here.
              This is the certificate that appears in the realm's SAML IdP
              metadata.
            </li>
            <li>
              <strong className="text-white">SAML client certificates</strong> —
              a SAML client's <em>Keys</em> tab holds the certificate the
              service provider uses to sign requests (and optionally the
              encryption certificate).
            </li>
            <li>
              <strong className="text-white">SAML identity providers</strong> —
              when brokering to an external SAML IdP, its signing certificate
              goes in <em>Validating X509 certificates</em>. Use{" "}
              <em>Copy base64 (one line)</em> to get the format that field
              expects, and check the expiry date before it bites.
            </li>
          </ul>
          <p className="mb-4">
            For setting up SAML and OIDC connections, see our{" "}
            <Link to="/docs/sso">SSO docs</Link> and{" "}
            <Link to="/tutorials/identity-providers/attribute-mapping">
              identity provider mappers
            </Link>
            .
          </p>

          <H2>Fingerprints for SAML setup</H2>
          <p className="mb-4">
            Some identity providers and service providers identify a trusted
            certificate by its SHA-1 or SHA-256 fingerprint rather than the full
            certificate. The fingerprint is a hash of the certificate's DER
            bytes, so it changes whenever the certificate is renewed — a useful
            check when a partner says "we rotated our certificate."
          </p>

          <H2>Decoding a certificate signing request (CSR)</H2>
          <p className="mb-4">
            A <strong className="text-white">CSR</strong> (PKCS#10) is what you
            send a certificate authority to request a certificate. Paste one to
            check the subject, the Subject Alternative Names and key usages it
            asks for, and the key type and size before you submit it. The
            decoder also verifies the CSR's signature with its own public key —
            the proof that whoever made the request holds the matching private
            key.
          </p>

          <H2>Related tools</H2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>
              <Link to="/tools/jwt-decoder">JWT Decoder</Link> — decode and
              verify JSON Web Tokens; it also accepts a PEM certificate as the
              verification key.
            </li>
            <li>
              <Link to="/tools/jwt-generator">JWT Generator</Link> — sign test
              tokens and generate keys with JWKS export.
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
