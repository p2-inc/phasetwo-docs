import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

import {
  analyzeSaml,
  EXAMPLES,
  type SamlAnalysis,
  type SignatureCheck,
} from "./core/index.ts";
import ComparePanel from "./ComparePanel";
import { HintsPanel, SummaryPanel } from "./SummaryPanel";
import VerifyPanel from "./VerifyPanel";
import XmlView from "./XmlView";
import { CopyIconBtn, SectionLabel, StatusRow } from "./ui";

export default function SamlDecoder() {
  const [input, setInput] = useState("");
  const [exampleId, setExampleId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SamlAnalysis | null>(null);
  const [sigResults, setSigResults] = useState<SignatureCheck[] | null>(null);
  const [mode, setMode] = useState<"decode" | "compare">("decode");
  const [skew, setSkew] = useState(0);
  const seq = useRef(0);

  // Decoding is async (DEFLATE uses DecompressionStream) and only runs in the
  // browser, after mount, so static rendering sees the empty state.
  useEffect(() => {
    const id = ++seq.current;
    if (!input.trim()) {
      setAnalysis(null);
      return;
    }
    const t = setTimeout(() => {
      analyzeSaml(input, { now: Date.now(), clockSkewSeconds: skew }).then(
        (a) => {
          if (id === seq.current) setAnalysis(a);
        },
      );
    }, 120);
    return () => clearTimeout(t);
  }, [input, skew]);

  const hasInput = input.trim().length > 0;
  const example = EXAMPLES.find((e) => e.id === exampleId);
  const loadExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setExampleId(id);
    setInput(ex.input);
  };
  const d = analysis?.decoded;
  const summary = analysis?.summary;

  return (
    <div className="not-prose">
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-300">
        <Icon icon="mdi:shield-lock" className="size-5 shrink-0" />
        <span>
          Everything runs in your browser. Your SAML messages and certificates
          are never sent to a server, logged, or stored.
        </span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex gap-1 rounded-lg border border-white/10 p-1"
          role="tablist"
        >
          {(
            [
              ["decode", "Decode a message"],
              ["compare", "Compare request & response"],
            ] as const
          ).map(([key, text]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                mode === key
                  ? "bg-p2blue-500 text-white"
                  : "text-gray-400 hover:bg-white/5"
              }`}
            >
              {text}
            </button>
          ))}
        </div>
        <label
          className="flex items-center gap-2 text-xs text-gray-400"
          title="Tolerance applied to NotBefore / NotOnOrAfter checks, like an SP's allowed clock skew (Keycloak: 'Allowed clock skew' on a SAML identity provider)."
        >
          Clock-skew tolerance
          <input
            id="saml-skew"
            type="number"
            min={0}
            max={3600}
            step={5}
            value={skew}
            onChange={(e) => {
              const n = Number(e.target.value);
              setSkew(
                Number.isFinite(n)
                  ? Math.min(3600, Math.max(0, Math.round(n)))
                  : 0,
              );
            }}
            className="w-20 rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-xs text-white outline-none focus:border-p2blue-500"
          />
          seconds
        </label>
      </div>

      {mode === "compare" ? (
        <ComparePanel
          clockSkewSeconds={skew}
          onOpenInDecoder={(v) => {
            setInput(v);
            setExampleId(null);
            setMode("decode");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT: input, detection, XML */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionLabel>SAML message</SectionLabel>
              <div className="-mt-2 flex flex-wrap items-center gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => loadExample(ex.id)}
                    title={ex.description}
                    className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
                  >
                    Load example: {ex.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setInput("");
                    setExampleId(null);
                  }}
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
                  {">_ SAMLRequest / SAMLResponse / URL / XML"}
                </span>
                {hasInput && <CopyIconBtn value={input} label="input" />}
              </div>
              <textarea
                id="saml-input"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setExampleId(null);
                }}
                spellCheck={false}
                rows={7}
                placeholder={
                  "Paste a base64 SAMLResponse, a DEFLATE-encoded SAMLRequest, a full redirect URL\n(https://idp.example.com/sso?SAMLRequest=...), a POST body, or raw XML."
                }
                aria-label="Paste a SAML message"
                className="w-full resize-y break-all rounded-b-2xl bg-transparent p-3 font-mono text-sm text-white outline-none placeholder:text-gray-600"
              />
            </div>

            {hasInput && analysis && (
              <div className="flex flex-col gap-1.5 px-1">
                {d?.ok ? (
                  <StatusRow icon="mdi:check-circle" cls="text-green-400">
                    Detected: {d.detected}
                  </StatusRow>
                ) : null}
                {analysis.error && (
                  <StatusRow icon="mdi:alert" cls="text-amber-400">
                    {analysis.error}
                  </StatusRow>
                )}
                {d?.ok && d.steps.length > 0 && (
                  <StatusRow icon="mdi:arrow-right-thin" cls="text-gray-400">
                    {d.steps.join(" → ")}
                  </StatusRow>
                )}
                {d?.endpoint && (
                  <StatusRow icon="mdi:web" cls="text-gray-400">
                    Endpoint:{" "}
                    <span className="break-all font-mono text-xs text-gray-300">
                      {d.endpoint}
                    </span>
                  </StatusRow>
                )}
                {d?.relayState !== undefined && (
                  <StatusRow icon="mdi:tag-outline" cls="text-gray-400">
                    RelayState:{" "}
                    <span className="break-all font-mono text-xs text-gray-300">
                      {d.relayState || "(empty)"}
                    </span>
                  </StatusRow>
                )}
                {d?.sigAlg && (
                  <StatusRow icon="mdi:draw-pen" cls="text-gray-400">
                    Query-string signature:{" "}
                    <span className="break-all font-mono text-xs text-gray-300">
                      {d.sigAlg}
                    </span>
                  </StatusRow>
                )}
                {sigResults?.map((r, i) => (
                  <StatusRow
                    key={i}
                    icon={
                      r.status === "valid"
                        ? "mdi:shield-check"
                        : r.status === "invalid"
                          ? "mdi:shield-off"
                          : "mdi:shield-alert"
                    }
                    cls={
                      r.status === "valid"
                        ? "text-green-400"
                        : r.status === "invalid"
                          ? "text-red-400"
                          : "text-amber-400"
                    }
                  >
                    {r.signedElement === "query string"
                      ? "Query-string"
                      : `<${r.signedElement}>`}{" "}
                    signature{" "}
                    {r.status === "valid"
                      ? "verified"
                      : r.status === "invalid"
                        ? "invalid"
                        : "not verified"}
                  </StatusRow>
                ))}
              </div>
            )}

            {analysis?.document && d?.xml && (
              <XmlView tokens={analysis.pretty} rawXml={d.xml} />
            )}
          </div>

          {/* RIGHT: summary, hints, verification */}
          <div className="flex min-w-0 flex-col gap-4">
            {!hasInput && (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
                Paste a SAML message on the left, or{" "}
                <button
                  type="button"
                  onClick={() => loadExample(EXAMPLES[0].id)}
                  className="text-p2blue-400 hover:underline"
                >
                  load the example
                </button>{" "}
                to see it decoded and explained here.
              </div>
            )}
            {summary && (
              <SummaryPanel summary={summary} times={analysis!.times} />
            )}
            {analysis && analysis.hints.length > 0 && (
              <HintsPanel hints={analysis.hints} />
            )}
            {analysis?.document && d && (
              <VerifyPanel
                document={analysis.document}
                decoded={d}
                exampleCertificate={example?.certificate}
                onResults={setSigResults}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
