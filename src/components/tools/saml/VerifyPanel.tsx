import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import {
  parseTrustInput,
  verifyRedirectSignature,
  verifyXmlSignatures,
  type DecodedInput,
  type SignatureCheck,
  type TrustedKey,
  type VerifyStatus,
  type XmlDocument,
} from "./core/index.ts";
import { Card } from "./ui";

const STATUS_STYLES: Record<VerifyStatus, { icon: string; cls: string }> = {
  valid: {
    icon: "mdi:shield-check",
    cls: "text-green-400 border-green-400/30 bg-green-400/10",
  },
  invalid: {
    icon: "mdi:shield-off",
    cls: "text-red-400 border-red-400/30 bg-red-400/10",
  },
  error: {
    icon: "mdi:alert",
    cls: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  },
};

function fmtDate(ms?: number) {
  return ms === undefined ? "?" : new Date(ms).toISOString().slice(0, 10);
}

export default function VerifyPanel({
  document,
  decoded,
  exampleCertificate,
  onResults,
}: {
  document: XmlDocument;
  decoded: DecodedInput;
  /** When an example is loaded, the certificate that verifies it. */
  exampleCertificate?: string;
  onResults?: (results: SignatureCheck[] | null) => void;
}) {
  const [trust, setTrust] = useState("");
  const [keys, setKeys] = useState<TrustedKey[]>([]);
  const [keyErrors, setKeyErrors] = useState<string[]>([]);
  const [results, setResults] = useState<SignatureCheck[] | null>(null);
  const [busy, setBusy] = useState(false);

  // A new message invalidates old results.
  useEffect(() => {
    setResults(null);
    onResults?.(null);
  }, [document, decoded]);

  const hasQuerySig = !!decoded.signature && !!decoded.sigAlg;

  async function run() {
    setBusy(true);
    try {
      const t = await parseTrustInput(trust);
      setKeys(t.keys);
      setKeyErrors(t.errors);
      if (!t.keys.length) {
        setResults(null);
        onResults?.(null);
        return;
      }
      const out: SignatureCheck[] = [];
      if (hasQuerySig) out.push(await verifyRedirectSignature(decoded, t.keys));
      out.push(...(await verifyXmlSignatures(document, t.keys)));
      setResults(out);
      onResults?.(out);
    } finally {
      setBusy(false);
    }
  }

  const now = typeof window === "undefined" ? 0 : Date.now();

  return (
    <Card title="Verify signature">
      <p className="mb-2 text-xs text-gray-500">
        Paste the signer's X.509 certificate (PEM or the bare base64 shown in
        metadata and the Keycloak admin console) or its full SAML metadata XML.
        Only public certificates are needed — never paste a private key.
        Verification uses WebCrypto in your browser.
      </p>
      <textarea
        value={trust}
        onChange={(e) => setTrust(e.target.value)}
        spellCheck={false}
        rows={4}
        placeholder={
          "-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----\n\nor <md:EntityDescriptor ...>"
        }
        aria-label="Signer certificate or metadata"
        className="w-full resize-y rounded-lg border border-white/10 bg-black/30 p-2.5 font-mono text-xs text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500"
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={busy || !trust.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-p2blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-p2blue-600 disabled:opacity-50"
        >
          <Icon
            icon={busy ? "mdi:loading" : "mdi:shield-search"}
            className={`size-4 ${busy ? "animate-spin" : ""}`}
          />
          Verify
        </button>
        {exampleCertificate && (
          <button
            type="button"
            onClick={() => setTrust(exampleCertificate)}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            Use the example's certificate
          </button>
        )}
      </div>

      {keyErrors.map((e, i) => (
        <div
          key={i}
          className="mt-2 flex items-start gap-1.5 text-xs text-amber-300"
        >
          <Icon icon="mdi:alert" className="mt-0.5 size-3.5 shrink-0" />
          <span>{e}</span>
        </div>
      ))}

      {keys.length > 0 && (
        <div className="mt-3 flex flex-col gap-1 text-xs text-gray-400">
          {keys.map((k, i) => (
            <div key={i}>
              <span className="text-gray-300">{k.label}</span>
              {k.certificate ? (
                <>
                  {" "}
                  — {k.certificate.subject}, valid{" "}
                  {fmtDate(k.certificate.notBefore)} to{" "}
                  {fmtDate(k.certificate.notAfter)}
                  {k.certificate.notAfter !== undefined &&
                    k.certificate.notAfter < now && (
                      <span className="text-amber-300"> (expired)</span>
                    )}
                  <div className="break-all font-mono text-[0.7rem] text-gray-500">
                    SHA-256 {k.certificate.sha256Fingerprint}
                  </div>
                </>
              ) : (
                ` — ${k.keyType} public key`
              )}
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl border px-4 py-2.5 text-sm ${STATUS_STYLES.error.cls}`}
        >
          <Icon icon="mdi:alert" className="mt-0.5 size-5 shrink-0" />
          <span>
            This message carries no signature, so there is nothing to verify.
          </span>
        </div>
      )}
      {results?.map((r, i) => (
        <div
          key={i}
          className={`mt-3 rounded-xl border px-4 py-2.5 text-sm ${STATUS_STYLES[r.status].cls}`}
        >
          <div className="flex items-start gap-2">
            <Icon
              icon={STATUS_STYLES[r.status].icon}
              className="mt-0.5 size-5 shrink-0"
            />
            <span>
              <strong className="font-semibold">
                {r.signedElement === "query string"
                  ? "Query-string signature"
                  : `<${r.signedElement}> signature`}
                :
              </strong>{" "}
              {r.message}
            </span>
          </div>
          {r.notes.map((n, j) => (
            <div key={j} className="ml-7 mt-1 text-xs text-gray-300">
              {n}
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
}
