import { useState } from "react";
import { Icon } from "@iconify/react";
import type { JwksSummary, KeySummary } from "../oidc/jwks";
import type { CertSummary } from "../oidc/x509";
import { countBySeverity } from "../oidc/findings";
import { CopyBtn, FindingsList } from "./shared";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function fmtDate(d?: Date): string {
  return d ? d.toISOString().replace("T", " ").slice(0, 16) + " UTC" : "—";
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "blue" | "green" | "amber";
}) {
  const cls = {
    default: "border-white/10 bg-white/5 text-gray-300",
    blue: "border-p2blue-500/30 bg-p2blue-500/10 text-p2blue-300",
    green: "border-green-400/30 bg-green-400/10 text-green-300",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  }[tone];
  return (
    <span
      className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${cls}`}
    >
      {children}
    </span>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 py-1 text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="min-w-0 break-all text-gray-200">{children}</div>
    </div>
  );
}

function CertDetails({ cert, index }: { cert: CertSummary; index: number }) {
  return (
    <div className="mt-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <Icon icon="mdi:certificate-outline" className="size-4" />
        {index === 0 ? "Certificate (x5c)" : `Chain certificate #${index + 1}`}
        {cert.selfSigned && <Badge>self-signed</Badge>}
      </div>
      <Row label="Subject">
        <span className="font-mono text-xs">{cert.subject || "—"}</span>
      </Row>
      {!cert.selfSigned && (
        <Row label="Issuer">
          <span className="font-mono text-xs">{cert.issuer || "—"}</span>
        </Row>
      )}
      <Row label="Valid">
        <span className="text-xs">
          {fmtDate(cert.notBefore)} → {fmtDate(cert.notAfter)}
        </span>
      </Row>
      <Row label="Signed with">
        <span className="font-mono text-xs">{cert.signatureAlgorithm}</span>
      </Row>
    </div>
  );
}

function KeyCard({ k, matched }: { k: KeySummary; matched: boolean }) {
  const [showJson, setShowJson] = useState(false);
  const counts = countBySeverity(k.findings);
  return (
    <div
      className={`rounded-2xl border bg-black/20 p-4 ${
        matched
          ? "border-green-400/50 ring-1 ring-green-400/30"
          : "border-white/10"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">#{k.index + 1}</span>
        <span className="break-all font-mono text-sm font-semibold text-white">
          {k.kid ?? <em className="font-sans text-amber-300">no kid</em>}
        </span>
        {k.kid && <CopyBtn value={k.kid} label="kid" />}
        <div className="ml-auto flex flex-wrap gap-1.5">
          {matched && <Badge tone="green">matches token</Badge>}
          {k.kty && <Badge tone="blue">{k.kty}</Badge>}
          {k.alg && <Badge>{k.alg}</Badge>}
          {k.use && (
            <Badge tone={k.use === "enc" ? "amber" : "default"}>
              use: {k.use}
            </Badge>
          )}
          {counts.error > 0 && (
            <Badge tone="amber">
              {counts.error} error{counts.error > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>
      <Row label="Strength">{k.strength ?? "—"}</Row>
      {k.keyOps && <Row label="key_ops">{k.keyOps.join(", ")}</Row>}
      <Row label="Thumbprint">
        {k.thumbprint ? (
          <span className="inline-flex items-center gap-1">
            <span className="font-mono text-xs">{k.thumbprint}</span>
            <CopyBtn value={k.thumbprint} label="thumbprint" />
          </span>
        ) : (
          "—"
        )}
        <div className="text-[11px] text-gray-500">RFC 7638, SHA-256</div>
      </Row>
      {k.certs.map((c, i) =>
        "error" in c ? (
          <Row key={i} label={`x5c[${i}]`}>
            <span className="text-amber-300">Unreadable: {c.error}</span>
          </Row>
        ) : (
          <CertDetails key={i} cert={c} index={i} />
        ),
      )}
      {k.findings.length > 0 && (
        <div className="mt-3">
          <FindingsList findings={k.findings} />
        </div>
      )}
      <button
        type="button"
        onClick={() => setShowJson((s) => !s)}
        className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
      >
        <Icon
          icon={showJson ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="size-4"
        />
        {showJson ? "Hide" : "Show"} JWK
      </button>
      {showJson && (
        <pre className="m-0 mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded bg-black/30 p-3 font-mono text-xs text-gray-200">
          {JSON.stringify(k.raw, null, 2)}
        </pre>
      )}
    </div>
  );
}

/** Renders a JWKS summary: set-level findings, then one card per key. */
export default function JwksKeyList({
  summary,
  matchedIndexes = [],
}: {
  summary: JwksSummary;
  matchedIndexes?: number[];
}) {
  const allFindings = [
    ...summary.findings,
    ...summary.keys.flatMap((k) => k.findings),
  ];
  const counts = countBySeverity(allFindings);
  return (
    <div className="flex flex-col gap-3">
      {summary.valid && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
          <span>
            <strong className="text-white">{summary.keys.length}</strong> key
            {summary.keys.length === 1 ? "" : "s"}
          </span>
          <span className="text-red-400">{plural(counts.error, "error")}</span>
          <span className="text-amber-400">
            {plural(counts.warning, "warning")}
          </span>
          <span className="text-p2blue-300">{plural(counts.info, "note")}</span>
        </div>
      )}
      {summary.findings.length > 0 && (
        <FindingsList findings={summary.findings} />
      )}
      {summary.keys.map((k) => (
        <KeyCard
          key={k.index}
          k={k}
          matched={matchedIndexes.includes(k.index)}
        />
      ))}
    </div>
  );
}
