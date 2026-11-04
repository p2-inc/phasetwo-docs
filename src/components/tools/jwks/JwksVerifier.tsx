import { useEffect, useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import { Icon } from "../Icon";
import type { JSONWebKeySet } from "jose";
import { parseJsonInput } from "../oidc/fetch";
import {
  summarizeJwks,
  matchKeyForHeader,
  type JwksSummary,
} from "../oidc/jwks";
import { loadJwksFromUrl, type JwksLoad } from "../oidc/inspect";
import { EXAMPLE_JWKS, EXAMPLE_JWT } from "../oidc/examples";
import { parseJwt } from "../jwt/decode";
import { verifyLocalJwks, type VerifyResult } from "../jwt/verify";
import JwksKeyList from "./JwksKeyList";
import {
  Card,
  FetchErrorHelp,
  ModeTabs,
  PrimaryButton,
  PrivacyBanner,
  SectionLabel,
  ShareLinkButton,
  clearDeepLink,
  SmallButton,
  syncDeepLink,
  useDeepLink,
} from "./shared";

type Mode = "url" | "paste";

const VERIFY_STYLES: Record<
  VerifyResult["status"],
  { icon: string; cls: string }
> = {
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

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/30 p-2.5 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500";

export default function JwksVerifier() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [pasted, setPasted] = useState("");
  const [jwt, setJwt] = useState("");
  const [busy, setBusy] = useState(false);
  const [load, setLoad] = useState<JwksLoad | null>(null);
  const [pasteSummary, setPasteSummary] = useState<JwksSummary | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [verify, setVerify] = useState<VerifyResult | null>(null);
  const [fetchedTarget, setFetchedTarget] = useState<string | null>(null);

  // Analyze pasted JSON as the user types.
  useEffect(() => {
    let cancelled = false;
    if (!pasted.trim()) {
      setPasteSummary(null);
      setPasteError(null);
      return;
    }
    const parsed = parseJsonInput(pasted);
    if (!parsed.ok) {
      setPasteSummary(null);
      setPasteError(parsed.message);
      return;
    }
    setPasteError(null);
    summarizeJwks(parsed.data).then((s) => {
      if (!cancelled) setPasteSummary(s);
    });
    return () => {
      cancelled = true;
    };
  }, [pasted]);

  const summary = mode === "paste" ? pasteSummary : (load?.summary ?? null);

  const token = jwt.trim();
  const header = useMemo(
    () => (token ? parseJwt(token).header.json : undefined),
    [token],
  );
  const match = useMemo(
    () => (summary?.valid && token ? matchKeyForHeader(summary, header) : null),
    [summary, header, token],
  );

  // Verify the token signature locally whenever the keys or token change.
  useEffect(() => {
    let cancelled = false;
    setVerify(null);
    if (!summary?.valid || !token || !header) return;
    const jwks = { keys: summary.keys.map((k) => k.raw) } as JSONWebKeySet;
    verifyLocalJwks(token, jwks).then((r) => {
      if (!cancelled) setVerify(r);
    });
    return () => {
      cancelled = true;
    };
  }, [summary, token, header]);

  async function fetchKeys(target: string = url) {
    const t = target.trim();
    if (!t) return;
    setBusy(true);
    setLoad(null);
    setFetchedTarget(null);
    syncDeepLink(t);
    try {
      setLoad(await loadJwksFromUrl(t));
      setFetchedTarget(t);
    } finally {
      setBusy(false);
    }
  }

  // #url=… deep links prefill the URL and fetch it immediately.
  useDeepLink((t) => {
    setMode("url");
    setUrl(t);
    fetchKeys(t);
  });

  function loadExample() {
    setMode("paste");
    setPasted(JSON.stringify(EXAMPLE_JWKS, null, 2));
    setJwt(EXAMPLE_JWT);
  }

  function clearAll() {
    clearDeepLink();
    setUrl("");
    setPasted("");
    setJwt("");
    setLoad(null);
  }

  const failed =
    mode === "url" && load?.fetch && !load.fetch.ok ? load.fetch : null;

  return (
    <div className="not-prose">
      <PrivacyBanner>
        Everything runs in your browser. Keys and tokens are never sent to Phase
        Two. A JWKS URL is fetched directly by your browser, only when you click
        Fetch.
      </PrivacyBanner>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* LEFT: inputs */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <SectionLabel>Key set</SectionLabel>
              <div className="-mt-2 flex items-center gap-2">
                <SmallButton onClick={loadExample}>Load example</SmallButton>
                <SmallButton
                  onClick={clearAll}
                  disabled={!url && !pasted && !jwt}
                >
                  Clear
                </SmallButton>
              </div>
            </div>
            <Card className="p-4">
              <div className="mb-3">
                <ModeTabs
                  value={mode}
                  onChange={setMode}
                  options={[
                    ["url", "JWKS URL"],
                    ["paste", "Paste JSON"],
                  ]}
                />
              </div>
              {mode === "url" ? (
                <>
                  <p className="mb-2 text-xs text-gray-500">
                    A JWKS URL, a Keycloak realm URL, or an OIDC discovery URL
                    (its <code>jwks_uri</code> is followed).
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchKeys()}
                      spellCheck={false}
                      aria-label="JWKS URL"
                      placeholder="https://host/realms/my-realm/protocol/openid-connect/certs"
                      className={inputCls}
                    />
                    <PrimaryButton
                      onClick={() => fetchKeys()}
                      busy={busy}
                      disabled={!url.trim()}
                      icon="mdi:download"
                    >
                      Fetch
                    </PrimaryButton>
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    value={pasted}
                    onChange={(e) => setPasted(e.target.value)}
                    spellCheck={false}
                    rows={10}
                    aria-label="Paste JWKS JSON"
                    placeholder={
                      '{\n  "keys": [ { "kid": "...", "kty": "RSA", ... } ]\n}'
                    }
                    className={`${inputCls} resize-y text-xs`}
                  />
                  {pasteError && (
                    <p className="mb-0 mt-2 text-xs text-amber-400">
                      {pasteError}
                    </p>
                  )}
                </>
              )}
            </Card>
          </div>

          <div>
            <SectionLabel>Token to verify (optional)</SectionLabel>
            <Card className="p-4">
              <p className="mb-2 text-xs text-gray-500">
                Paste a JWT to find the key its <code>kid</code> points to and
                check the signature against the key set.
              </p>
              <textarea
                value={jwt}
                onChange={(e) => setJwt(e.target.value)}
                spellCheck={false}
                rows={4}
                aria-label="Paste a JWT"
                placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ii4uLiJ9..."
                className={`${inputCls} resize-y break-all text-xs`}
              />
              {token && !header && (
                <p className="mb-0 mt-2 text-xs text-amber-400">
                  Could not read a JWT header from this value.
                </p>
              )}
              {match && (
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <div className="flex items-start gap-2 text-gray-300">
                    <Icon
                      icon={
                        match.matches.length
                          ? "mdi:key-chain-variant"
                          : "mdi:key-remove"
                      }
                      className={`mt-0.5 size-4 shrink-0 ${match.matches.length ? "text-green-400" : "text-red-400"}`}
                    />
                    <span>
                      {match.reason}
                      {match.alg ? (
                        <>
                          {" "}
                          Token alg: <code>{match.alg}</code>.
                        </>
                      ) : null}
                    </span>
                  </div>
                  {verify && (
                    <div
                      className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${VERIFY_STYLES[verify.status].cls}`}
                    >
                      <Icon
                        icon={VERIFY_STYLES[verify.status].icon}
                        className="mt-0.5 size-5 shrink-0"
                      />
                      <span>{verify.message}</span>
                    </div>
                  )}
                  <p className="mb-0 text-xs text-gray-500">
                    Signature only — to inspect claims and expiry, use the{" "}
                    <Link to="/tools/jwt-decoder">JWT Decoder</Link>.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* RIGHT: results */}
        <div className="flex min-w-0 flex-col gap-4">
          {failed && !failed.ok && (
            <FetchErrorHelp
              result={failed}
              what="JWKS"
              onPasteInstead={() => setMode("paste")}
            />
          )}
          {mode === "url" &&
            load?.notes.map((n) => (
              <p key={n} className="mb-0 text-xs text-gray-400">
                <Icon
                  icon="mdi:information-outline"
                  className="mr-1 inline size-4"
                />
                {n}
              </p>
            ))}
          {mode === "url" && fetchedTarget && (
            <div>
              <ShareLinkButton target={fetchedTarget} />
            </div>
          )}
          {mode === "url" && load?.fetch?.ok && (
            <p className="mb-0 break-all text-xs text-gray-500">
              Fetched <span className="font-mono">{load.fetch.finalUrl}</span>{" "}
              in {load.fetch.ms} ms.
            </p>
          )}
          {summary ? (
            <div>
              <SectionLabel>Keys</SectionLabel>
              <JwksKeyList
                summary={summary}
                matchedIndexes={
                  match?.kid ? match.matches.map((m) => m.index) : []
                }
              />
            </div>
          ) : (
            !failed && (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
                Fetch a JWKS URL or paste a key set on the left, or{" "}
                <button
                  type="button"
                  onClick={loadExample}
                  className="text-p2blue-400 hover:underline"
                >
                  load the example
                </button>{" "}
                to see each key analyzed here.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
