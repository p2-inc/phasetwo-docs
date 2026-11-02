import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "@docusaurus/Link";
import { Icon } from "@iconify/react";
import {
  CATEGORY_LABELS,
  SEVERITIES,
  checkClient,
  checkRealm,
  diffLines,
  parseInput,
  toMarkdown,
  type Category,
  type ClientResult,
  type DiffLine,
  type Finding,
  type Severity,
} from "./engine.ts";
import { EXAMPLE_CLIENT } from "./example.ts";

const SEVERITY_STYLES: Record<
  Severity,
  { label: string; cls: string; dot: string }
> = {
  critical: {
    label: "Critical",
    cls: "border-red-500/40 bg-red-500/15 text-red-300",
    dot: "bg-red-500",
  },
  high: {
    label: "High",
    cls: "border-orange-400/40 bg-orange-400/10 text-orange-300",
    dot: "bg-orange-400",
  },
  medium: {
    label: "Medium",
    cls: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  low: {
    label: "Low",
    cls: "border-p2blue-500/40 bg-p2blue-500/10 text-p2blue-300",
    dot: "bg-p2blue-500",
  },
  info: {
    label: "Info",
    cls: "border-white/15 bg-white/5 text-gray-300",
    dot: "bg-gray-500",
  },
};

const GRADE_STYLES: Record<string, string> = {
  A: "text-green-400 border-green-400/40",
  B: "text-lime-300 border-lime-300/40",
  C: "text-amber-300 border-amber-300/40",
  D: "text-orange-300 border-orange-300/40",
  F: "text-red-400 border-red-400/40",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as Category[];

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

function SmallBtn({
  onClick,
  disabled,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
    >
      {icon && <Icon icon={icon} className="size-3.5" />}
      {children}
    </button>
  );
}

function CopyBtn({
  value,
  label,
  icon = "mdi:content-copy",
}: {
  value: () => string;
  label: string;
  icon?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <SmallBtn
      icon={copied ? "mdi:check" : icon}
      onClick={() => {
        navigator.clipboard?.writeText(value()).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    >
      {copied ? "Copied" : label}
    </SmallBtn>
  );
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function Counts({ counts }: { counts: Record<Severity, number> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {SEVERITIES.filter((s) => counts[s] > 0).map((s) => (
        <span
          key={s}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${SEVERITY_STYLES[s].cls}`}
        >
          {counts[s]} {SEVERITY_STYLES[s].label.toLowerCase()}
        </span>
      ))}
    </div>
  );
}

function Grade({
  grade,
  score,
  size = "lg",
}: {
  grade: string;
  score: number;
  size?: "lg" | "sm";
}) {
  const cls = GRADE_STYLES[grade] ?? GRADE_STYLES.F;
  if (size === "sm") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-sm ${cls.split(" ")[0]}`}
      >
        <span className="font-semibold">{grade}</span>
        <span className="text-gray-500">{score}</span>
      </span>
    );
  }
  return (
    <div
      className={`flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl border-2 ${cls}`}
      aria-label={`Score ${score} out of 100, grade ${grade}`}
    >
      <span className="text-3xl font-semibold leading-none">{grade}</span>
      <span className="mt-1 text-xs text-gray-400">{score}/100</span>
    </div>
  );
}

/** Renders `code` spans in finding text without dangerouslySetInnerHTML. */
function Prose({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") && p.length > 1 ? (
          <code key={i}>{p.slice(1, -1)}</code>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function FindingCard({ f }: { f: Finding }) {
  return (
    <div className="break-inside-avoid rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex flex-wrap items-start gap-2">
        <SeverityBadge severity={f.severity} />
        <h4 className="m-0 text-[0.95rem] font-semibold text-white">
          <Prose text={f.title} />
        </h4>
      </div>
      <p className="mb-3 text-sm text-gray-300">
        <Prose text={f.why} />
      </p>
      {f.values && f.values.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {f.values.map((v) => (
            <span
              key={v}
              className="break-all rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-xs text-gray-200"
            >
              {v}
            </span>
          ))}
        </div>
      )}
      <dl className="m-0 grid grid-cols-1 gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[5rem_1fr]">
        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pt-0.5">
          Where
        </dt>
        <dd className="m-0 text-gray-200">
          <Prose text={f.where} />
        </dd>
        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pt-0.5">
          Fix
        </dt>
        <dd className="m-0 text-gray-200">
          <Prose text={f.fix} />
        </dd>
        {f.docs && f.docs.length > 0 && (
          <>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pt-0.5">
              Read
            </dt>
            <dd className="m-0 flex flex-wrap gap-x-3 gap-y-1">
              {f.docs.map((d) => (
                <Link
                  key={d.href}
                  to={d.href}
                  className="text-p2blue-400 hover:underline"
                >
                  {d.label}
                </Link>
              ))}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}

function GroupedFindings({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 p-4 text-sm text-green-300">
        <Icon icon="mdi:check-circle" className="size-5 shrink-0" />
        No findings for this client.
      </div>
    );
  }
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: findings.filter((f) => f.category === cat),
  })).filter((g) => g.items.length > 0);
  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <section key={g.cat}>
          <SectionLabel>
            {CATEGORY_LABELS[g.cat]} ({g.items.length})
          </SectionLabel>
          <div className="flex flex-col gap-3">
            {g.items.map((f, i) => (
              <FindingCard key={`${f.id}-${i}`} f={f} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Shows changed lines with a little context, collapsing long unchanged runs. */
function DiffView({ lines }: { lines: DiffLine[] }) {
  const CONTEXT = 3;
  const keep = lines.map((_, i) =>
    lines
      .slice(Math.max(0, i - CONTEXT), i + CONTEXT + 1)
      .some((l) => l.type !== "same"),
  );
  const rows: ReactNode[] = [];
  let skipped = 0;
  lines.forEach((l, i) => {
    if (!keep[i]) {
      skipped++;
      return;
    }
    if (skipped) {
      rows.push(
        <div key={`s${i}`} className="select-none px-3 py-0.5 text-gray-600">
          ⋯ {skipped} unchanged line{skipped === 1 ? "" : "s"}
        </div>,
      );
      skipped = 0;
    }
    const cls =
      l.type === "add"
        ? "bg-green-500/10 text-green-300"
        : l.type === "del"
          ? "bg-red-500/10 text-red-300"
          : "text-gray-400";
    rows.push(
      <div key={i} className={`whitespace-pre-wrap break-all px-3 ${cls}`}>
        <span className="mr-2 select-none text-gray-600">
          {l.type === "add" ? "+" : l.type === "del" ? "-" : " "}
        </span>
        {l.text}
      </div>,
    );
  });
  if (skipped) {
    rows.push(
      <div key="s-end" className="select-none px-3 py-0.5 text-gray-600">
        ⋯ {skipped} unchanged line{skipped === 1 ? "" : "s"}
      </div>,
    );
  }
  return (
    <div
      className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 py-2 text-xs leading-relaxed"
      style={{ fontFamily: "var(--ifm-font-family-monospace)" }}
    >
      {rows}
    </div>
  );
}

function FixPanel({ result }: { result: ClientResult }) {
  const before = JSON.stringify(result.redacted, null, 2);
  const after = JSON.stringify(result.fixed, null, 2);
  const lines = useMemo(() => diffLines(before, after), [before, after]);
  const manual = result.findings.filter(
    (f) =>
      f.severity !== "info" &&
      !result.changes.some(
        (c) => c.path === f.field || c.path.startsWith(`${f.field}.`),
      ),
  );

  if (result.changes.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Nothing here can be fixed safely without knowing more about the
        application. Work through the findings by hand.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-sm text-gray-300">
        These changes need no information the export doesn't have. Review each
        one, then apply them in the admin console or import the JSON into a{" "}
        <strong className="text-white">test realm</strong> first. Redirect URIs,
        client authentication and certificates stay manual because the right
        value depends on your application. The client secret is left out of the
        fixed JSON.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-3 font-semibold">Field</th>
              <th className="py-2 pr-3 font-semibold">Change</th>
              <th className="py-2 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {result.changes.map((c) => (
              <tr
                key={c.path}
                className="border-b border-white/5 align-top last:border-0"
              >
                <td className="py-2 pr-3 font-mono text-xs text-white">
                  {c.path}
                </td>
                <td className="py-2 pr-3 font-mono text-xs">
                  <span className="text-red-300">{JSON.stringify(c.from)}</span>
                  <span className="text-gray-500"> → </span>
                  <span className="text-green-300">{JSON.stringify(c.to)}</span>
                </td>
                <td className="py-2 text-gray-400">
                  <Prose text={c.note} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>Diff</SectionLabel>
        <div className="-mt-2 flex gap-2">
          <CopyBtn value={() => after} label="Copy fixed JSON" />
          <SmallBtn
            icon="mdi:download"
            onClick={() =>
              download(
                `${result.clientId.replace(/[^\w.-]+/g, "_")}.fixed.json`,
                after,
                "application/json",
              )
            }
          >
            Download
          </SmallBtn>
        </div>
      </div>
      <DiffView lines={lines} />
      {manual.length > 0 && (
        <p className="m-0 text-sm text-gray-400">
          Still to fix by hand: {manual.length} finding
          {manual.length === 1 ? "" : "s"}, listed on the Findings tab.
        </p>
      )}
    </div>
  );
}

function ClientDetail({ result }: { result: ClientResult }) {
  const [tab, setTab] = useState<"findings" | "fix">("findings");
  const tabBtn = (key: "findings" | "fix", text: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        tab === key
          ? "bg-p2blue-500 text-white"
          : "text-gray-400 hover:bg-white/5"
      }`}
    >
      {text}
    </button>
  );
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-5">
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Grade grade={result.grade} score={result.score} />
        <div className="min-w-0 flex-1">
          <h3 className="m-0 break-all font-mono text-lg font-semibold text-white">
            {result.clientId}
          </h3>
          <div className="mb-2 mt-1 flex flex-wrap gap-x-3 text-xs text-gray-400">
            <span>
              {result.protocol === "saml" ? "SAML" : "OpenID Connect"}
            </span>
            <span>
              {result.kind === "saml"
                ? "service provider"
                : `${result.kind} client`}
            </span>
            {result.builtIn && (
              <span className="text-p2blue-300">built-in</span>
            )}
            {!result.enabled && (
              <span className="text-amber-300">disabled</span>
            )}
          </div>
          <Counts counts={result.counts} />
        </div>
      </div>
      <div className="mb-4 flex gap-1 print:hidden">
        {tabBtn("findings", `Findings (${result.findings.length})`)}
        {tabBtn("fix", `Suggested fixes (${result.changes.length})`)}
      </div>
      {tab === "findings" ? (
        <GroupedFindings findings={result.findings} />
      ) : (
        <FixPanel result={result} />
      )}
    </div>
  );
}

function SummaryTable({
  results,
  selected,
  onSelect,
}: {
  results: ClientResult[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
            <th className="px-3 py-2 font-semibold">Client</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            <th className="px-3 py-2 font-semibold">Score</th>
            <th className="px-3 py-2 font-semibold">Findings</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr
              key={r.clientId}
              onClick={() => onSelect(r.clientId)}
              className={`cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/5 ${
                selected === r.clientId ? "bg-p2blue-500/10" : ""
              }`}
            >
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(r.clientId);
                  }}
                  className="break-all text-left font-mono text-white hover:text-p2blue-400"
                >
                  {r.clientId}
                </button>
                {r.builtIn && (
                  <span className="ml-2 text-xs text-gray-500">built-in</span>
                )}
                {!r.enabled && (
                  <span className="ml-2 text-xs text-amber-300">disabled</span>
                )}
              </td>
              <td className="px-3 py-2 text-gray-400">{r.kind}</td>
              <td className="px-3 py-2">
                <Grade grade={r.grade} score={r.score} size="sm" />
              </td>
              <td className="px-3 py-2">
                <Counts counts={r.counts} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function ClientChecker() {
  const [text, setText] = useState("");
  // Client IDs whose pasted JSON held a plaintext secret. Only the IDs are
  // kept; the secret itself is masked out of `text` as soon as it's pasted.
  const [plaintextIds, setPlaintextIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [showBuiltIn, setShowBuiltIn] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const ingest = (value: string) => {
    const p = parseInput(value);
    if (p.ok && p.hadPlaintextSecrets) {
      const ids = new Set<string>();
      p.clients.forEach((c, i) => {
        if (p.secretStates[i] === "plaintext" && c.clientId)
          ids.add(c.clientId);
      });
      setPlaintextIds(ids);
      setText(JSON.stringify(p.redactedInput, null, 2));
    } else {
      // Keep the warning only for clients still present and still masked.
      const still = new Set<string>();
      if (p.ok) {
        p.clients.forEach((c, i) => {
          if (
            p.secretStates[i] === "masked" &&
            c.clientId &&
            plaintextIds.has(c.clientId)
          )
            still.add(c.clientId);
        });
      }
      setPlaintextIds(still);
      setText(value);
    }
    setSelected(null);
  };

  const analysis = useMemo(() => {
    if (!text.trim()) return null;
    const p = parseInput(text);
    if (!p.ok) return { error: p.error };
    const now = typeof window === "undefined" ? 0 : Date.now();
    const results = p.clients.map((c, i) =>
      checkClient(c, {
        realm: p.realm,
        now,
        secretState: plaintextIds.has(c.clientId ?? "")
          ? "plaintext"
          : p.secretStates[i],
      }),
    );
    return {
      source: p.source,
      realmName: typeof p.realm?.realm === "string" ? p.realm.realm : undefined,
      realmFindings: p.realm ? checkRealm(p.realm) : [],
      results,
    };
  }, [text, plaintextIds]);

  const hasInput = text.trim().length > 0;
  const ok = analysis && !("error" in analysis) ? analysis : null;
  const visible = ok ? ok.results.filter((r) => showBuiltIn || !r.builtIn) : [];
  const multi = !!ok && ok.results.length > 1;
  const current =
    ok &&
    (multi ? ok.results.find((r) => r.clientId === selected) : ok.results[0]);
  const hasBuiltIn = !!ok && ok.results.some((r) => r.builtIn);

  const markdown = (only?: ClientResult) =>
    ok
      ? toMarkdown(only ? [only] : visible, only ? [] : ok.realmFindings, {
          realmName: ok.realmName,
          date: new Date().toISOString().slice(0, 10),
        })
      : "";

  return (
    <div className="not-prose">
      {/* Privacy banner — the core trust promise. */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-300 print:hidden">
        <Icon icon="mdi:shield-lock" className="size-5 shrink-0" />
        <span>
          Everything runs in your browser. Your configuration is never sent to a
          server, logged, or stored, and client secrets are masked the moment
          you paste them.
        </span>
      </div>

      {/* Input */}
      <div className="mb-8 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionLabel>Client or realm export (JSON)</SectionLabel>
          <div className="-mt-2 flex flex-wrap items-center gap-2">
            <SmallBtn
              icon="mdi:flask-outline"
              onClick={() => ingest(JSON.stringify(EXAMPLE_CLIENT, null, 2))}
            >
              Load example
            </SmallBtn>
            <SmallBtn
              icon="mdi:file-upload-outline"
              onClick={() => fileRef.current?.click()}
            >
              Open file
            </SmallBtn>
            <SmallBtn
              icon="mdi:close"
              onClick={() => ingest("")}
              disabled={!hasInput}
            >
              Clear
            </SmallBtn>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Read locally with FileReader; nothing is uploaded.
                file.text().then(ingest);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20">
          <textarea
            id="client-json-input"
            value={text}
            onChange={(e) => ingest(e.target.value)}
            spellCheck={false}
            rows={hasInput ? 12 : 8}
            placeholder={
              '{\n  "clientId": "my-app",\n  "redirectUris": ["https://app.example.com/*"],\n  ...\n}'
            }
            aria-label="Paste a Keycloak client or realm export"
            className="w-full resize-y rounded-2xl bg-transparent p-3 font-mono text-sm text-white outline-none placeholder:text-gray-600"
          />
        </div>
        <p className="mb-0 mt-2 px-1 text-xs text-gray-500">
          In the admin console:{" "}
          <strong className="text-gray-400">
            Clients → your client → Action → Export
          </strong>
          , or{" "}
          <strong className="text-gray-400">
            Realm settings → Action → Partial export
          </strong>{" "}
          with clients included. A client from{" "}
          <code>
            GET /admin/realms/&#123;realm&#125;/clients/&#123;id&#125;
          </code>{" "}
          or a full <code>kc.sh export</code> works too.
        </p>
        {plaintextIds.size > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-2.5 text-sm text-amber-200">
            <Icon icon="mdi:key-alert" className="mt-0.5 size-5 shrink-0" />
            <span>
              The JSON you pasted contained{" "}
              {plaintextIds.size === 1
                ? "a client secret or private key"
                : "client secrets or private keys"}{" "}
              (for{" "}
              {Array.from(plaintextIds).map((id, i) => (
                <span key={id}>
                  {i > 0 && ", "}
                  <code>{id}</code>
                </span>
              ))}
              ). It has been replaced with <code>**********</code> above and is
              not kept anywhere on this page. If the original file was shared or
              committed, regenerate the secret.
            </span>
          </div>
        )}
        {analysis && "error" in analysis && (
          <div className="mt-3 flex items-center gap-1.5 px-1 text-sm text-amber-400">
            <Icon icon="mdi:alert" className="size-4 shrink-0" />
            <span>{analysis.error}</span>
          </div>
        )}
      </div>

      {!hasInput && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
          Paste a client export above, or{" "}
          <button
            type="button"
            onClick={() => ingest(JSON.stringify(EXAMPLE_CLIENT, null, 2))}
            className="text-p2blue-400 hover:underline"
          >
            load the example
          </button>{" "}
          to see a deliberately misconfigured client checked.
        </div>
      )}

      {ok && (
        <div className="flex flex-col gap-6">
          {/* Report actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="text-sm text-gray-400">
              {ok.source === "realm"
                ? `Realm export${ok.realmName ? ` "${ok.realmName}"` : ""}: ${ok.results.length} clients`
                : ok.results.length > 1
                  ? `${ok.results.length} clients`
                  : "One client"}
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyBtn
                value={() => markdown()}
                label="Copy report as Markdown"
                icon="mdi:language-markdown-outline"
              />
              <SmallBtn
                icon="mdi:download"
                onClick={() =>
                  download(
                    "keycloak-client-report.md",
                    markdown(),
                    "text/markdown",
                  )
                }
              >
                Download .md
              </SmallBtn>
              <SmallBtn
                icon="mdi:printer-outline"
                onClick={() => window.print()}
              >
                Print
              </SmallBtn>
            </div>
          </div>

          {ok.realmFindings.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[var(--ifm-background-surface-color)] p-5">
              <h3 className="mb-1 mt-0 text-lg font-semibold text-white">
                Realm settings
                {ok.realmName ? (
                  <span className="font-mono"> · {ok.realmName}</span>
                ) : null}
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                Realm-wide token, session and policy settings from the export.
                They apply to every client.
              </p>
              <div className="flex flex-col gap-3">
                {ok.realmFindings.map((f) => (
                  <FindingCard key={f.id} f={f} />
                ))}
              </div>
            </div>
          )}

          {multi && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SectionLabel>All clients</SectionLabel>
                {hasBuiltIn && (
                  <label className="-mt-2 flex cursor-pointer items-center gap-1.5 text-xs text-gray-400 print:hidden">
                    <input
                      type="checkbox"
                      checked={showBuiltIn}
                      onChange={(e) => setShowBuiltIn(e.target.checked)}
                    />
                    Show built-in clients
                  </label>
                )}
              </div>
              <SummaryTable
                results={visible}
                selected={selected}
                onSelect={setSelected}
              />
              {!current && (
                <p className="mb-0 mt-2 px-1 text-xs text-gray-500 print:hidden">
                  Select a client to see its findings and suggested fixes.
                </p>
              )}
            </div>
          )}

          {current && (
            <div>
              {multi && (
                <div className="mb-2 flex justify-end print:hidden">
                  <CopyBtn
                    value={() => markdown(current)}
                    label="Copy this client's report"
                  />
                </div>
              )}
              <ClientDetail key={current.clientId} result={current} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
