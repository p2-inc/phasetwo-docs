import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { EXAMPLE_CHAIN, EXAMPLE_SAML_BASE64 } from "./examples";
import { parseText, toBase64Body, toPem } from "./input";
import {
  checkChain,
  fingerprint,
  isSelfIssued,
  keySummary,
  relativeTime,
  validityState,
  verifySignedBy,
  type Certificate,
  type ChainReport,
  type SigCheck,
  type ValidityState,
} from "./x509";

/* ------------------------------------------------------------------ */
/* Small building blocks (match the JWT decoder's look)                */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

function CopyIconBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white"
    >
      <Icon
        icon={copied ? "mdi:check" : "mdi:content-copy"}
        className="size-3.5"
      />
    </button>
  );
}

function CopyTextBtn({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
    >
      <Icon
        icon={copied ? "mdi:check" : "mdi:content-copy"}
        className="size-3.5"
      />
      {copied ? "Copied" : children}
    </button>
  );
}

function Badge({
  tone,
  icon,
  children,
}: {
  tone: "green" | "red" | "amber" | "blue" | "gray";
  icon?: string;
  children: ReactNode;
}) {
  const cls = {
    green: "border-green-400/30 bg-green-400/10 text-green-300",
    red: "border-red-400/30 bg-red-400/10 text-red-300",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    blue: "border-p2blue-500/30 bg-p2blue-500/10 text-p2blue-300",
    gray: "border-white/10 bg-white/5 text-gray-300",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${cls}`}
    >
      {icon && <Icon icon={icon} className="size-3.5" />}
      {children}
    </span>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s, i) => (
        <span
          key={`${s}-${i}`}
          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-xs text-gray-200"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <tr className="border-b border-white/5 align-top last:border-0">
      <td className="w-40 py-2 pr-3 text-sm font-medium text-white">
        {label}
        {hint && (
          <div className="mt-0.5 text-xs font-normal text-gray-500">{hint}</div>
        )}
      </td>
      <td className="break-all py-2 text-sm text-gray-200">{children}</td>
    </tr>
  );
}

const VALIDITY: Record<
  ValidityState,
  { tone: "green" | "red" | "amber"; icon: string; label: string }
> = {
  valid: { tone: "green", icon: "mdi:check-circle", label: "Valid now" },
  expired: { tone: "red", icon: "mdi:close-circle", label: "Expired" },
  "not-yet-valid": {
    tone: "amber",
    icon: "mdi:clock-alert",
    label: "Not yet valid",
  },
};

function formatDate(d: Date): string {
  return d.toUTCString().replace("GMT", "UTC");
}

/* ------------------------------------------------------------------ */
/* One certificate                                                     */
/* ------------------------------------------------------------------ */

type Extra = { sha1: string; sha256: string; selfSig: SigCheck | null };

function roleOf(c: Certificate, index: number, total: number): string {
  const ca = c.basicConstraints?.ca;
  if (isSelfIssued(c)) return ca ? "Root CA" : "Self-signed";
  if (ca) return "Intermediate CA";
  return total > 1 && index === 0 ? "Leaf" : "End-entity";
}

function CertCard({
  cert,
  index,
  total,
  nowMs,
  extra,
}: {
  cert: Certificate;
  index: number;
  total: number;
  nowMs: number;
  extra?: Extra;
}) {
  const state = validityState(cert, nowMs);
  const v = VALIDITY[state];
  const cn =
    cert.subject.attrs.find((a) => a.short === "CN")?.value ??
    cert.subject.text;
  const selfIssued = isSelfIssued(cert);
  const role = roleOf(cert, index, total);
  const sigName = cert.signatureAlgorithm.name;
  const weakSig = /md5|sha1/i.test(sigName);
  const weakKey =
    cert.publicKey.type === "RSA" && (cert.publicKey.bits ?? 0) < 2048;
  const looksLikeRealmKey =
    selfIssued &&
    cert.san.length === 0 &&
    cert.subject.attrs.length === 1 &&
    cert.subject.attrs[0].short === "CN";
  const pem = toPem(cert.der);
  const b64 = toBase64Body(cert.der);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 px-4 py-3">
        <div className="min-w-0">
          <div className="text-xs text-gray-500">
            {total > 1 ? `Certificate ${index + 1} of ${total} · ` : ""}
            {role}
          </div>
          <div className="truncate font-mono text-base font-semibold text-white">
            {cn}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={v.tone} icon={v.icon}>
            {v.label}
          </Badge>
          {selfIssued && (
            <Badge
              tone={extra?.selfSig === "invalid" ? "red" : "blue"}
              icon="mdi:sync"
            >
              {extra?.selfSig === "valid"
                ? "Self-signed (verified)"
                : extra?.selfSig === "invalid"
                  ? "Self-issued, bad signature"
                  : "Self-signed"}
            </Badge>
          )}
          {cert.basicConstraints?.ca && <Badge tone="gray">CA</Badge>}
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-2">
        <table className="w-full border-collapse text-left">
          <tbody>
            <Row label="Subject">
              <span className="font-mono">
                {cert.subject.text || "(empty)"}
              </span>
            </Row>
            <Row label="Issuer">
              <span className="font-mono">{cert.issuer.text || "(empty)"}</span>
            </Row>
            <Row label="Validity">
              <div>
                <span className="text-gray-500">Not before </span>
                <span className="font-mono">
                  {formatDate(cert.notBefore)}
                </span>{" "}
                <span className="text-gray-500">
                  ({relativeTime(cert.notBefore, nowMs)})
                </span>
              </div>
              <div>
                <span className="text-gray-500">Not after </span>
                <span className="font-mono">
                  {formatDate(cert.notAfter)}
                </span>{" "}
                <span
                  className={
                    state === "expired" ? "text-red-400" : "text-gray-500"
                  }
                >
                  ({state === "expired" ? "expired " : "expires "}
                  {relativeTime(cert.notAfter, nowMs)})
                </span>
              </div>
            </Row>
            {cert.san.length > 0 && (
              <Row
                label="Subject Alt Names"
                hint="Hostnames and identities this certificate covers"
              >
                <Pills items={cert.san.map((s) => `${s.type}: ${s.value}`)} />
              </Row>
            )}
            <Row label="Public key">
              <span className="font-mono">{keySummary(cert.publicKey)}</span>
              {cert.publicKey.exponent && (
                <span className="text-gray-500">
                  {" "}
                  · e = {cert.publicKey.exponent}
                </span>
              )}
              {weakKey && (
                <div className="mt-1 text-xs text-amber-400">
                  RSA keys under 2048 bits are considered weak.
                </div>
              )}
            </Row>
            <Row label="Signature algorithm">
              <span className="font-mono">{sigName}</span>
              {weakSig && (
                <div className="mt-1 text-xs text-amber-400">
                  {sigName.toUpperCase().includes("MD5") ? "MD5" : "SHA-1"}{" "}
                  signatures are deprecated and rejected by most modern clients.
                </div>
              )}
            </Row>
            <Row label="Serial number">
              <div className="flex items-start gap-1">
                <span className="font-mono">
                  {cert.serialHex
                    .toUpperCase()
                    .match(/.{1,2}/g)
                    ?.join(":")}
                </span>
                <CopyIconBtn value={cert.serialHex} label="serial number" />
              </div>
            </Row>
            {cert.keyUsage && (
              <Row label="Key usage">
                <Pills items={cert.keyUsage} />
              </Row>
            )}
            {cert.extKeyUsage && (
              <Row label="Extended key usage">
                <Pills items={cert.extKeyUsage} />
              </Row>
            )}
            {cert.basicConstraints && (
              <Row label="Basic constraints">
                <span className="font-mono">
                  CA: {cert.basicConstraints.ca ? "true" : "false"}
                  {cert.basicConstraints.pathLen !== undefined &&
                    `, path length: ${cert.basicConstraints.pathLen}`}
                </span>
              </Row>
            )}
            {cert.subjectKeyId && (
              <Row label="Subject key ID">
                <span className="font-mono text-xs">{cert.subjectKeyId}</span>
              </Row>
            )}
            {cert.authorityKeyId && (
              <Row label="Authority key ID">
                <span className="font-mono text-xs">{cert.authorityKeyId}</span>
              </Row>
            )}
            <Row
              label="SHA-1 fingerprint"
              hint="Some SAML IdPs and SPs ask for this"
            >
              <div className="flex items-start gap-1">
                <span className="font-mono text-xs">{extra?.sha1 ?? "…"}</span>
                {extra && (
                  <CopyIconBtn value={extra.sha1} label="SHA-1 fingerprint" />
                )}
              </div>
            </Row>
            <Row label="SHA-256 fingerprint">
              <div className="flex items-start gap-1">
                <span className="font-mono text-xs">
                  {extra?.sha256 ?? "…"}
                </span>
                {extra && (
                  <CopyIconBtn
                    value={extra.sha256}
                    label="SHA-256 fingerprint"
                  />
                )}
              </div>
            </Row>
            <Row label="Version / extensions">
              <span className="text-gray-400">v{cert.version}</span>
              {cert.extensions.length > 0 && (
                <div className="mt-1.5">
                  <Pills
                    items={cert.extensions.map((e) =>
                      e.critical ? `${e.name} (critical)` : e.name,
                    )}
                  />
                </div>
              )}
            </Row>
          </tbody>
        </table>
      </div>

      {looksLikeRealmKey && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-p2blue-500/20 bg-p2blue-500/[0.06] px-3 py-2 text-xs text-p2blue-200">
          <Icon
            icon="mdi:shield-key-outline"
            className="mt-0.5 size-4 shrink-0 text-p2blue-300"
          />
          <span>
            Self-signed with a CN-only subject — the shape of a Keycloak realm
            signing certificate, where the CN is the realm name. These are
            trusted by pinning the certificate itself (for example in a SAML
            IdP's metadata), not through a CA chain.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-white/5 px-4 py-3">
        <CopyTextBtn value={pem}>Copy PEM</CopyTextBtn>
        <CopyTextBtn value={b64}>Copy base64 (one line)</CopyTextBtn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function CertDecoder() {
  const [text, setText] = useState("");
  const [fileNote, setFileNote] = useState("");
  const [extras, setExtras] = useState<Extra[]>([]);
  const [chain, setChain] = useState<ChainReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseText(text), [text]);
  const certs = parsed.certs;
  const hasInput = text.trim().length > 0;
  // Only read the clock on the client; the initial (empty) render is static.
  const nowMs = typeof window === "undefined" ? 0 : Date.now();

  // Fingerprints, self-signature and chain checks use WebCrypto (async, client only).
  useEffect(() => {
    let cancelled = false;
    setExtras([]);
    setChain(null);
    if (certs.length === 0) return;
    (async () => {
      const ex = await Promise.all(
        certs.map(async (c) => ({
          sha1: await fingerprint(c.der, "SHA-1"),
          sha256: await fingerprint(c.der, "SHA-256"),
          selfSig: isSelfIssued(c) ? await verifySignedBy(c, c) : null,
        })),
      );
      const ch = certs.length > 1 ? await checkChain(certs) : null;
      if (!cancelled) {
        setExtras(ex);
        setChain(ch);
      }
    })().catch(() => {
      /* WebCrypto unavailable — leave fingerprints pending */
    });
    return () => {
      cancelled = true;
    };
  }, [certs]);

  async function onFile(f: File | undefined) {
    if (!f) return;
    const bytes = new Uint8Array(await f.arrayBuffer());
    const isDer = bytes[0] === 0x30 && (bytes[1] & 0x80) !== 0;
    setText(isDer ? toPem(bytes) : new TextDecoder().decode(bytes));
    setFileNote(
      `Loaded ${f.name}${isDer ? " (binary DER, shown as PEM)" : ""}.`,
    );
    if (fileRef.current) fileRef.current.value = "";
  }

  function load(v: string) {
    setFileNote("");
    setText(v);
  }

  const sourceLabel =
    parsed.source === "saml-xml"
      ? " from SAML metadata"
      : parsed.source === "base64"
        ? " from a bare base64 body"
        : "";

  return (
    <div className="not-prose">
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-300">
        <Icon icon="mdi:shield-lock" className="size-5 shrink-0" />
        <span>
          Everything runs in your browser. Your certificates are never sent to a
          server, logged, or stored.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT: input */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionLabel>Certificate input</SectionLabel>
            <div className="-mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => load(EXAMPLE_CHAIN)}
                className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
              >
                Example chain
              </button>
              <button
                type="button"
                onClick={() => load(EXAMPLE_SAML_BASE64)}
                className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
              >
                Example SAML cert
              </button>
              <button
                type="button"
                onClick={() => load("")}
                disabled={!hasInput}
                className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-xs text-gray-400">
              <span className="font-mono">
                {">_ PEM, base64, or SAML metadata"}
              </span>
              <label className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-white/10 hover:text-white">
                <Icon icon="mdi:upload" className="size-4" />
                Upload file
                <input
                  ref={fileRef}
                  type="file"
                  accept=".crt,.cer,.pem,.der,.cert,.xml,application/x-x509-ca-cert,application/pkix-cert"
                  className="hidden"
                  aria-label="Upload a certificate file"
                  onChange={(e) => void onFile(e.target.files?.[0])}
                />
              </label>
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                setFileNote("");
                setText(e.target.value);
              }}
              spellCheck={false}
              rows={16}
              placeholder={
                "-----BEGIN CERTIFICATE-----\nMIIDdzCCAl+gAwIBAgIE...\n-----END CERTIFICATE-----"
              }
              aria-label="Paste a certificate"
              className="w-full resize-y break-all rounded-b-2xl bg-transparent p-3 font-mono text-xs text-white outline-none placeholder:text-gray-600"
            />
          </div>

          {hasInput && (
            <div className="flex flex-col gap-1.5 px-1 text-sm">
              {fileNote && <div className="text-gray-400">{fileNote}</div>}
              {certs.length > 0 && (
                <div className="flex items-center gap-1.5 text-green-400">
                  <Icon icon="mdi:check-circle" className="size-4" />
                  Decoded {certs.length} certificate
                  {certs.length > 1 ? "s" : ""}
                  {sourceLabel}
                </div>
              )}
              {parsed.errors.map((e, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-amber-400"
                >
                  <Icon icon="mdi:alert" className="mt-0.5 size-4 shrink-0" />
                  <span>{e}</span>
                </div>
              ))}
            </div>
          )}

          {chain && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                chain.inOrder
                  ? "border-green-400/30 bg-green-400/10 text-green-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-300"
              }`}
            >
              <div className="mb-1 flex items-center gap-1.5 font-semibold">
                <Icon
                  icon={
                    chain.inOrder ? "mdi:link-variant" : "mdi:link-variant-off"
                  }
                  className="size-4"
                />
                Chain order
              </div>
              <p className="mb-2">{chain.summary}</p>
              <ul className="m-0 list-none space-y-1 p-0 text-xs">
                {chain.links.map((l) => (
                  <li key={l.index}>
                    #{l.index + 1} → #{l.index + 2}:{" "}
                    {!l.nameMatch
                      ? "issuer does not match the next subject"
                      : l.signature === "valid"
                        ? "issuer matches, signature verified"
                        : l.signature === "unsupported"
                          ? "issuer matches (signature algorithm not checkable in this browser)"
                          : "issuer matches, but the signature does not verify"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT: decoded certificates */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {certs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
              Paste a certificate on the left, upload a <code>.crt</code>,{" "}
              <code>.cer</code>, <code>.pem</code>, or <code>.der</code> file,
              or{" "}
              <button
                type="button"
                onClick={() => load(EXAMPLE_CHAIN)}
                className="text-p2blue-400 hover:underline"
              >
                load the example chain
              </button>
              .
            </div>
          )}
          {certs.map((c, i) => (
            <CertCard
              key={i}
              cert={c}
              index={i}
              total={certs.length}
              nowMs={nowMs}
              extra={extras[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
