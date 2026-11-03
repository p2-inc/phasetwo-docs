import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

import {
  analyzeExchange,
  EXAMPLE_EXCHANGE,
  type ComparisonStatus,
  type ExchangeAnalysis,
  type SamlAnalysis,
} from "./core/index.ts";
import { Card, SectionLabel, StatusRow } from "./ui";

const STATUS: Record<
  ComparisonStatus,
  { icon: string; cls: string; label: string }
> = {
  match: { icon: "mdi:check-circle", cls: "text-green-400", label: "Match" },
  mismatch: {
    icon: "mdi:close-circle",
    cls: "text-red-400",
    label: "Mismatch",
  },
  warning: { icon: "mdi:alert", cls: "text-amber-400", label: "Check" },
  info: {
    icon: "mdi:information-outline",
    cls: "text-p2blue-300",
    label: "Info",
  },
  skipped: {
    icon: "mdi:minus-circle-outline",
    cls: "text-gray-500",
    label: "Skipped",
  },
};

function MessageBox({
  label,
  value,
  onChange,
  placeholder,
  analysis,
  onOpen,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  analysis?: SamlAnalysis;
  onOpen: () => void;
}) {
  const d = analysis?.decoded;
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <SectionLabel>{label}</SectionLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        rows={6}
        placeholder={placeholder}
        aria-label={label}
        className="w-full resize-y break-all rounded-2xl border border-white/10 bg-black/20 p-3 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500"
      />
      {value.trim() && analysis && (
        <div className="flex flex-col gap-1 px-1">
          {d?.ok && analysis.summary ? (
            <StatusRow icon="mdi:check-circle" cls="text-green-400">
              {analysis.summary.messageType} · {d.detected}{" "}
              <button
                type="button"
                onClick={onOpen}
                className="ml-1 text-xs text-p2blue-400 hover:underline"
              >
                Open in decoder
              </button>
            </StatusRow>
          ) : (
            <StatusRow icon="mdi:alert" cls="text-amber-400">
              {analysis.error}
            </StatusRow>
          )}
        </div>
      )}
    </div>
  );
}

/** Paste an AuthnRequest (or LogoutRequest) and its response to cross-check them. */
export default function ComparePanel({
  clockSkewSeconds,
  onOpenInDecoder,
}: {
  clockSkewSeconds: number;
  onOpenInDecoder: (input: string) => void;
}) {
  const [request, setRequest] = useState("");
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<ExchangeAnalysis | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const id = ++seq.current;
    if (!request.trim() || !response.trim()) {
      setResult(null);
      return;
    }
    const t = setTimeout(() => {
      analyzeExchange(request, response, {
        now: Date.now(),
        clockSkewSeconds,
      }).then((r) => {
        if (id === seq.current) setResult(r);
      });
    }, 120);
    return () => clearTimeout(t);
  }, [request, response, clockSkewSeconds]);

  // Show each box's own analysis; when the inputs were swapped, map them back.
  const reqAnalysis = result
    ? result.swapped
      ? result.response
      : result.request
    : undefined;
  const resAnalysis = result
    ? result.swapped
      ? result.request
      : result.response
    : undefined;
  const counts = result?.checks.reduce<Record<string, number>>(
    (m, c) => ((m[c.status] = (m[c.status] ?? 0) + 1), m),
    {},
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="mb-0 text-sm text-gray-400">
          Paste a request and the response it produced to check they agree.
          Order does not matter.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRequest(EXAMPLE_EXCHANGE.request);
              setResponse(EXAMPLE_EXCHANGE.response);
            }}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            Load example pair
          </button>
          <button
            type="button"
            onClick={() => {
              setRequest("");
              setResponse("");
            }}
            disabled={!request && !response}
            className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MessageBox
          label="Request (AuthnRequest or LogoutRequest)"
          value={request}
          onChange={setRequest}
          placeholder="Redirect URL, base64 SAMLRequest, or XML"
          analysis={reqAnalysis}
          onOpen={() => onOpenInDecoder(request)}
        />
        <MessageBox
          label="Response (Response or LogoutResponse)"
          value={response}
          onChange={setResponse}
          placeholder="SAMLResponse value or form body, or XML"
          analysis={resAnalysis}
          onOpen={() => onOpenInDecoder(response)}
        />
      </div>

      {result && (
        <Card
          title="Request ↔ response checks"
          actions={
            counts && (
              <div className="flex gap-3 text-xs">
                {(["mismatch", "warning", "match"] as const).map((k) =>
                  counts[k] ? (
                    <span key={k} className={STATUS[k].cls}>
                      {counts[k]} {STATUS[k].label.toLowerCase()}
                    </span>
                  ) : null,
                )}
              </div>
            )
          }
        >
          {result.error ? (
            <StatusRow icon="mdi:alert" cls="text-amber-400">
              {result.error}
            </StatusRow>
          ) : (
            <>
              {result.swapped && (
                <p className="mb-3 text-xs text-gray-500">
                  The messages were pasted in reverse order; they are compared
                  as request → response.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="m-0 w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-gray-500">
                      <th className="py-1.5 pr-3 font-medium">Check</th>
                      <th className="py-1.5 pr-3 font-medium">
                        Request expects
                      </th>
                      <th className="py-1.5 font-medium">Response has</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.checks.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-white/5 align-top last:border-0"
                        data-check={c.id}
                        data-status={c.status}
                      >
                        <td className="w-56 py-2 pr-3">
                          <div
                            className={`flex items-start gap-1.5 text-sm font-medium ${STATUS[c.status].cls}`}
                          >
                            <Icon
                              icon={STATUS[c.status].icon}
                              className="mt-0.5 size-4 shrink-0"
                            />
                            <span>{c.label}</span>
                          </div>
                          <div className="mt-0.5 pl-[1.375rem] text-xs text-gray-500">
                            {STATUS[c.status].label}
                          </div>
                        </td>
                        <td className="py-2 pr-3">
                          <span className="break-all font-mono text-[0.8rem] text-white">
                            {c.expected ?? "—"}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className="break-all font-mono text-[0.8rem] text-white">
                            {c.actual ?? "—"}
                          </span>
                          <div className="mt-1 text-xs text-gray-400">
                            {c.detail}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
