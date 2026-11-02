import { useState } from "react";
import Link from "@docusaurus/Link";
import { Icon } from "@iconify/react";
import { parseJsonInput } from "../oidc/fetch";
import {
  extractCapabilities,
  extractEndpoints,
  extractFlags,
} from "../oidc/discovery";
import {
  inspectDiscoveryDoc,
  inspectIssuer,
  type DiscoveryInspection,
} from "../oidc/inspect";
import { countBySeverity } from "../oidc/findings";
import {
  EXAMPLE_DISCOVERY,
  EXAMPLE_ISSUER,
  EXAMPLE_JWKS,
} from "../oidc/examples";
import JwksKeyList from "../jwks/JwksKeyList";
import {
  Card,
  CopyBtn,
  FetchErrorHelp,
  FindingsList,
  ModeTabs,
  Pills,
  PrimaryButton,
  PrivacyBanner,
  SectionLabel,
  SmallButton,
} from "../jwks/shared";

type Mode = "url" | "paste";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/30 p-2.5 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500";

/** Values worth calling out in the capability pills. */
const GOOD = new Set(["S256", "authorization_code", "private_key_jwt"]);

function isRisky(key: string, v: string): boolean {
  if (v === "none")
    return (
      key === "id_token_signing_alg_values_supported" ||
      key === "authorization_signing_alg_values_supported"
    );
  if (key === "code_challenge_methods_supported") return v === "plain";
  if (key === "grant_types_supported")
    return v === "password" || v === "implicit";
  return false;
}

function Results({
  r,
  onPasteInstead,
}: {
  r: DiscoveryInspection;
  onPasteInstead: () => void;
}) {
  const [showRaw, setShowRaw] = useState(false);
  if (r.fetch && !r.fetch.ok)
    return (
      <FetchErrorHelp
        result={r.fetch}
        what="discovery document"
        onPasteInstead={onPasteInstead}
      />
    );
  if (!r.doc)
    return (
      <Card>
        <FindingsList findings={r.findings} />
      </Card>
    );

  const doc = r.doc;
  const endpoints = extractEndpoints(doc);
  const caps = extractCapabilities(doc);
  const flags = extractFlags(doc);
  const counts = countBySeverity(r.findings);
  const issuer = typeof doc.issuer === "string" ? doc.issuer : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview */}
      <Card>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Icon
            icon="mdi:card-account-details-outline"
            className="size-5 text-p2blue-400"
          />
          <span className="break-all font-mono text-sm font-semibold text-white">
            {issuer ?? "(no issuer)"}
          </span>
          {issuer && <CopyBtn value={issuer} label="issuer" />}
          {r.keycloak && (
            <span className="rounded-full border border-p2blue-500/30 bg-p2blue-500/10 px-2 py-0.5 text-[11px] text-p2blue-300">
              Keycloak realm: {r.keycloak.realm}
            </span>
          )}
        </div>
        {r.fetch?.ok && (
          <p className="mb-2 break-all text-xs text-gray-500">
            Fetched <span className="font-mono">{r.fetch.finalUrl}</span> in{" "}
            {r.fetch.ms} ms.
          </p>
        )}
        {!r.fetch && (
          <p className="mb-2 text-xs text-gray-500">
            Analyzed pasted JSON — the issuer-matches-URL check was skipped.
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-red-400">{plural(counts.error, "error")}</span>
          <span className="text-amber-400">
            {plural(counts.warning, "warning")}
          </span>
          <span className="text-p2blue-300">{plural(counts.info, "note")}</span>
          <span className="text-green-400">{counts.pass} passed</span>
        </div>
      </Card>

      {/* Lint */}
      <div>
        <SectionLabel>Checks</SectionLabel>
        <Card>
          <FindingsList findings={r.findings} />
        </Card>
      </div>

      {/* Keycloak */}
      {r.keycloakNotes.length > 0 && (
        <div>
          <SectionLabel>Keycloak notes</SectionLabel>
          <div className="rounded-2xl border border-p2blue-500/20 bg-p2blue-500/[0.06] p-5">
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {r.keycloakNotes.map((n) => (
                <li key={n.title} className="flex items-start gap-2">
                  <Icon
                    icon="mdi:shield-key-outline"
                    className="mt-0.5 size-4 shrink-0 text-p2blue-300"
                  />
                  <div className="min-w-0">
                    <div className="text-sm text-white">{n.title}</div>
                    <div className="mt-0.5 break-words text-xs text-gray-400">
                      {n.body}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Endpoints */}
      {endpoints.length > 0 && (
        <div>
          <SectionLabel>Endpoints</SectionLabel>
          <Card className="overflow-x-auto p-0">
            <table className="m-0 w-full border-collapse text-left">
              <tbody>
                {endpoints.map((e) => (
                  <tr
                    key={e.key}
                    className="border-b border-white/5 align-top last:border-0"
                  >
                    <td className="w-48 px-4 py-2.5 text-sm font-medium text-white">
                      {e.label}
                      <div className="font-mono text-[11px] font-normal text-gray-500">
                        {e.key}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-start gap-1">
                        <span className="min-w-0 break-all font-mono text-xs text-gray-200">
                          {e.url}
                        </span>
                        <CopyBtn value={e.url} label={e.key} />
                      </div>
                      {e.description && (
                        <div className="mt-0.5 text-xs text-gray-500">
                          {e.description}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Capabilities */}
      {caps.length > 0 && (
        <div>
          <SectionLabel>Supported values</SectionLabel>
          <Card>
            <div className="flex flex-col gap-4">
              {caps.map((c) => (
                <div key={c.key}>
                  <div className="mb-1.5 text-xs text-gray-500">
                    {c.label}{" "}
                    {c.label !== c.key && (
                      <span className="font-mono text-gray-600">{c.key}</span>
                    )}
                  </div>
                  <Pills
                    values={c.values}
                    highlight={(v) => GOOD.has(v)}
                    danger={(v) => isRisky(c.key, v)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Flags */}
      {flags.length > 0 && (
        <div>
          <SectionLabel>Feature flags</SectionLabel>
          <Card className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {flags.map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-sm">
                <Icon
                  icon={v ? "mdi:check" : "mdi:close"}
                  className={`size-4 shrink-0 ${v ? "text-green-400" : "text-gray-500"}`}
                />
                <span className="break-all font-mono text-xs text-gray-300">
                  {k}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* JWKS */}
      {r.jwks && (
        <div>
          <SectionLabel>Signing keys (jwks_uri)</SectionLabel>
          {r.jwks.notes.map((n) => (
            <p key={n} className="mb-2 text-xs text-gray-500">
              {n}
            </p>
          ))}
          {r.jwks.fetch && !r.jwks.fetch.ok ? (
            <FetchErrorHelp result={r.jwks.fetch} what="JWKS" />
          ) : r.jwks.summary ? (
            <JwksKeyList summary={r.jwks.summary} />
          ) : null}
          <p className="mb-0 mt-2 text-xs text-gray-500">
            Need to check a token against these keys? Use the{" "}
            <Link to="/tools/jwks-verifier">JWKS Verifier</Link>.
          </p>
        </div>
      )}

      {/* Raw */}
      <div>
        <button
          type="button"
          onClick={() => setShowRaw((s) => !s)}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
        >
          <Icon
            icon={showRaw ? "mdi:chevron-up" : "mdi:chevron-down"}
            className="size-4"
          />
          {showRaw ? "Hide" : "Show"} raw discovery document
        </button>
        {showRaw && (
          <pre className="m-0 mt-2 max-h-[32rem] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-black/30 p-3 font-mono text-xs text-gray-200">
            {JSON.stringify(doc, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function DiscoveryInspector() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiscoveryInspection | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    setPasteError(null);
    try {
      if (mode === "url") {
        if (!url.trim()) return;
        setResult(await inspectIssuer(url));
      } else {
        const parsed = parseJsonInput(pasted);
        if (!parsed.ok) {
          setPasteError(parsed.message);
          return;
        }
        setResult(await inspectDiscoveryDoc(parsed.data));
      }
    } finally {
      setBusy(false);
    }
  }

  async function loadExample() {
    setMode("url");
    setUrl(EXAMPLE_ISSUER);
    setPasteError(null);
    setBusy(true);
    try {
      setResult(
        await inspectDiscoveryDoc(EXAMPLE_DISCOVERY, {
          expectedIssuer: EXAMPLE_ISSUER,
          jwks: EXAMPLE_JWKS,
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  function clearAll() {
    setUrl("");
    setPasted("");
    setResult(null);
    setPasteError(null);
  }

  return (
    <div className="not-prose">
      <PrivacyBanner>
        Runs entirely in your browser. Your browser fetches the discovery
        document and JWKS directly from the issuer — nothing goes through Phase
        Two.
      </PrivacyBanner>

      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Issuer</SectionLabel>
          <div className="-mt-2 flex items-center gap-2">
            <SmallButton onClick={loadExample}>Load example</SmallButton>
            <SmallButton
              onClick={clearAll}
              disabled={!url && !pasted && !result}
            >
              Clear
            </SmallButton>
          </div>
        </div>
        <Card className="mb-6 p-4">
          <div className="mb-3">
            <ModeTabs
              value={mode}
              onChange={(m) => {
                setMode(m);
                setResult(null);
              }}
              options={[
                ["url", "Issuer URL"],
                ["paste", "Paste JSON"],
              ]}
            />
          </div>
          {mode === "url" ? (
            <>
              <p className="mb-2 text-xs text-gray-500">
                An issuer (for Keycloak,{" "}
                <code>https://host/realms/your-realm</code>) or a full{" "}
                <code>.well-known/openid-configuration</code> URL.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && run()}
                  spellCheck={false}
                  aria-label="Issuer or discovery URL"
                  placeholder="https://accounts.google.com"
                  className={inputCls}
                />
                <PrimaryButton
                  onClick={run}
                  busy={busy}
                  disabled={!url.trim()}
                  icon="mdi:magnify"
                >
                  Inspect
                </PrimaryButton>
              </div>
            </>
          ) : (
            <>
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                spellCheck={false}
                rows={8}
                aria-label="Paste discovery document JSON"
                placeholder={
                  '{\n  "issuer": "https://...",\n  "authorization_endpoint": "...",\n  ...\n}'
                }
                className={`${inputCls} resize-y text-xs`}
              />
              {pasteError && (
                <p className="mb-0 mt-2 text-xs text-amber-400">{pasteError}</p>
              )}
              <div className="mt-2">
                <PrimaryButton
                  onClick={run}
                  busy={busy}
                  disabled={!pasted.trim()}
                  icon="mdi:magnify"
                >
                  Inspect
                </PrimaryButton>
              </div>
            </>
          )}
        </Card>

        {result ? (
          <Results
            r={result}
            onPasteInstead={() => {
              setMode("paste");
              setResult(null);
            }}
          />
        ) : (
          !busy && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
              Enter an issuer above, or{" "}
              <button
                type="button"
                onClick={loadExample}
                className="text-p2blue-400 hover:underline"
              >
                load the example
              </button>{" "}
              to see a Keycloak-style discovery document inspected.
            </div>
          )
        )}
      </div>
    </div>
  );
}
