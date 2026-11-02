import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { formatEpoch } from "./decode";
import {
  ALGORITHMS,
  PRESETS,
  UNIT_SECONDS,
  algInfo,
  applyTimes,
  buildHeader,
  exportPems,
  generateTestKeyPair,
  importTestKey,
  jwksJson,
  minHmacBytes,
  parsePayload,
  presetPayload,
  publishableJwk,
  randomHmacSecret,
  signJwt,
  type PresetId,
  type TestKeyPair,
  type TimeUnit,
} from "./sign";

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

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      {children}
    </div>
  );
}

function SmallBtn({
  onClick,
  children,
  disabled,
  active,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md border px-2.5 py-1 text-xs disabled:opacity-40 ${
        active
          ? "border-p2blue-500 bg-p2blue-500 text-white"
          : "border-white/10 text-gray-300 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      disabled={!value}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
    >
      <Icon
        icon={copied ? "mdi:check" : "mdi:content-copy"}
        className="size-3.5"
      />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Save text as a file. Uses a local blob URL — nothing is uploaded. */
function DownloadBtn({ value, filename }: { value: string; filename: string }) {
  return (
    <button
      type="button"
      aria-label={`Download ${filename}`}
      disabled={!value}
      onClick={() => {
        const url = URL.createObjectURL(
          new Blob([value], { type: "text/plain" }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
    >
      <Icon icon="mdi:download" className="size-3.5" />
      Download
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500";

/* ------------------------------------------------------------------ */
/* Key material panel                                                  */
/* ------------------------------------------------------------------ */

type KeyView = "jwks" | "publicPem" | "privatePem" | "privateJwk";

const KEY_VIEWS: { id: KeyView; label: string; file: string }[] = [
  { id: "jwks", label: "JWKS", file: "jwks.json" },
  { id: "publicPem", label: "Public key (PEM)", file: "public.pem" },
  { id: "privatePem", label: "Private key (PEM)", file: "private.pem" },
  { id: "privateJwk", label: "Private JWK", file: "private.jwk.json" },
];

function KeyMaterial({
  keyPair,
  alg,
  kid,
}: {
  keyPair: TestKeyPair;
  alg: string;
  kid: string;
}) {
  const [view, setView] = useState<KeyView>("jwks");
  const [pems, setPems] = useState<{
    privatePem: string;
    publicPem: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPems(null);
    exportPems(keyPair).then((p) => !cancelled && setPems(p));
    return () => {
      cancelled = true;
    };
  }, [keyPair]);

  const value =
    view === "jwks"
      ? jwksJson(keyPair, alg, kid)
      : view === "privateJwk"
        ? JSON.stringify(
            { ...publishableJwk(keyPair, alg, kid), ...keyPair.privateJwk },
            null,
            2,
          )
        : view === "publicPem"
          ? (pems?.publicPem ?? "")
          : (pems?.privatePem ?? "");
  const file = KEY_VIEWS.find((v) => v.id === view)!.file;
  const isPrivate = view === "privatePem" || view === "privateJwk";

  return (
    <div className="mt-3">
      <div className="mb-2 flex flex-wrap gap-1">
        {KEY_VIEWS.map((v) => (
          <SmallBtn
            key={v.id}
            active={view === v.id}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </SmallBtn>
        ))}
      </div>
      {isPrivate && (
        <p className="mb-2 flex items-center gap-1.5 text-xs text-amber-400">
          <Icon icon="mdi:alert" className="size-4 shrink-0" />
          Private key — for test use only. Never use a browser-generated key in
          production.
        </p>
      )}
      {view === "jwks" && (
        <p className="mb-2 text-xs text-gray-500">
          Host this file (for example as <code>jwks.json</code>) to give a test
          resource server a JWKS URL, or paste it into the JWT Decoder's{" "}
          <em>Public key</em> tab to verify.
        </p>
      )}
      <pre className="m-0 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-black/30 p-3 font-mono text-xs text-gray-200">
        {value || "Exporting…"}
      </pre>
      <div className="mt-2 flex gap-2">
        <CopyBtn value={value} label={file} />
        <DownloadBtn value={value} filename={file} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function JwtGenerator() {
  const decoderUrl = useBaseUrl("/tools/jwt-decoder");

  const [alg, setAlg] = useState("RS256");
  const [typ, setTyp] = useState("JWT");
  const [kid, setKid] = useState("");
  const [kidAuto, setKidAuto] = useState(true);

  const [secret, setSecret] = useState("");
  const [keyPair, setKeyPair] = useState<TestKeyPair | null>(null);
  const [keyBusy, setKeyBusy] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const [preset, setPreset] = useState<PresetId>("keycloak-access");
  const [payloadText, setPayloadText] = useState("");
  const [expAmount, setExpAmount] = useState(5);
  const [expUnit, setExpUnit] = useState<TimeUnit>("minutes");
  const [withNbf, setWithNbf] = useState(false);

  const [token, setToken] = useState("");
  const [signError, setSignError] = useState("");

  const info = algInfo(alg);
  const isHmac = info.family === "HMAC";
  const parsed = useMemo(() => parsePayload(payloadText), [payloadText]);
  const header = useMemo(
    () => buildHeader({ alg, typ, kid: isHmac && kidAuto ? "" : kid }),
    [alg, typ, kid, isHmac, kidAuto],
  );

  const nowSec = () => Math.floor(Date.now() / 1000);
  const ttl = () => Math.max(0, expAmount) * UNIT_SECONDS[expUnit];

  function loadPreset(id: PresetId) {
    setPreset(id);
    setPayloadText(
      JSON.stringify(
        applyTimes(presetPayload(id, nowSec(), ttl()), nowSec(), {
          expiresIn: ttl(),
          nbf: withNbf,
        }),
        null,
        2,
      ),
    );
  }

  // Client-only initial payload (uses Date.now and crypto.randomUUID).
  useEffect(() => {
    loadPreset("keycloak-access");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function newKeyPair(family = info.family) {
    if (family === "HMAC") return;
    setKeyBusy(true);
    setKeyError("");
    try {
      setKeyPair(await generateTestKeyPair(family));
    } catch (e) {
      setKeyError(e instanceof Error ? e.message : String(e));
    } finally {
      setKeyBusy(false);
    }
  }

  // Make sure there is usable key material for the selected algorithm.
  useEffect(() => {
    if (isHmac) {
      if (!secret) setSecret(randomHmacSecret(alg));
    } else if (!keyPair || keyPair.family !== info.family) {
      void newKeyPair(info.family);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alg]);

  // Keep the kid in sync with the key thumbprint unless the user edited it.
  useEffect(() => {
    if (kidAuto) setKid(keyPair && !isHmac ? keyPair.thumbprint : "");
  }, [keyPair, kidAuto, isHmac]);

  async function doImport() {
    setKeyError("");
    try {
      const kp = await importTestKey(importText);
      const match = ALGORITHMS.find((a) => a.family === kp.family);
      if (info.family !== kp.family && match) setAlg(match.alg);
      setKeyPair(kp);
      setShowImport(false);
      setImportText("");
    } catch (e) {
      setKeyError(e instanceof Error ? e.message : String(e));
    }
  }

  // Re-sign whenever anything changes.
  useEffect(() => {
    if (!parsed.ok) {
      setToken("");
      setSignError("");
      return;
    }
    let cancelled = false;
    signJwt({
      header,
      payload: parsed.value,
      secret,
      keyPair: keyPair ?? undefined,
    })
      .then((t) => {
        if (cancelled) return;
        setToken(t);
        setSignError("");
      })
      .catch((e) => {
        if (cancelled) return;
        setToken("");
        setSignError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [header, parsed, secret, keyPair]);

  function updatePayload(
    fn: (p: Record<string, unknown>) => Record<string, unknown>,
  ) {
    if (!parsed.ok) return;
    setPayloadText(JSON.stringify(fn(parsed.value), null, 2));
  }

  const parts = token.split(".");
  const exp =
    parsed.ok && typeof parsed.value.exp === "number"
      ? parsed.value.exp
      : undefined;
  const iat =
    parsed.ok && typeof parsed.value.iat === "number"
      ? parsed.value.iat
      : undefined;
  const secretShort =
    isHmac &&
    secret &&
    new TextEncoder().encode(secret).length < minHmacBytes(alg);

  return (
    <div className="not-prose">
      {/* Trust + test-use banner */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-300">
          <Icon icon="mdi:shield-lock" className="size-5 shrink-0" />
          <span>
            Everything runs in your browser. Keys, secrets, and tokens are never
            sent to a server, logged, or stored.
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-sm text-amber-300">
          <Icon icon="mdi:flask-outline" className="size-5 shrink-0" />
          <span>
            For testing and development only. Do not sign production tokens with
            keys generated in a web page.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: inputs */}
        <div className="flex flex-col gap-5">
          {/* Algorithm + key */}
          <div>
            <SectionLabel>Algorithm &amp; key</SectionLabel>
            <Card>
              <label
                className="mb-1 block text-xs text-gray-500"
                htmlFor="jwtgen-alg"
              >
                Signing algorithm
              </label>
              <select
                id="jwtgen-alg"
                value={alg}
                onChange={(e) => setAlg(e.target.value)}
                className={inputCls}
              >
                {(
                  ["HMAC", "RSA", "EC-P256", "EC-P384", "Ed25519"] as const
                ).map((fam) => (
                  <optgroup
                    key={fam}
                    label={
                      fam === "HMAC"
                        ? "HMAC (shared secret)"
                        : fam === "RSA"
                          ? "RSA"
                          : fam === "Ed25519"
                            ? "EdDSA"
                            : `ECDSA ${fam.slice(3)}`
                    }
                  >
                    {ALGORITHMS.filter((a) => a.family === fam).map((a) => (
                      <option key={a.alg} value={a.alg}>
                        {a.alg} — {a.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {isHmac ? (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      className="text-xs text-gray-500"
                      htmlFor="jwtgen-secret"
                    >
                      Shared secret (UTF-8 text)
                    </label>
                    <SmallBtn onClick={() => setSecret(randomHmacSecret(alg))}>
                      Generate random
                    </SmallBtn>
                  </div>
                  <input
                    id="jwtgen-secret"
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    spellCheck={false}
                    className={inputCls}
                  />
                  {secretShort && (
                    <p className="mb-0 mt-1.5 text-xs text-amber-400">
                      Shorter than {minHmacBytes(alg)} bytes — {alg} secrets
                      should be at least as long as the hash output.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <SmallBtn
                      onClick={() => void newKeyPair()}
                      disabled={keyBusy}
                    >
                      {keyBusy ? "Generating…" : "Generate new key pair"}
                    </SmallBtn>
                    <SmallBtn
                      onClick={() => setShowImport((s) => !s)}
                      active={showImport}
                    >
                      Import my key
                    </SmallBtn>
                    {keyPair && (
                      <span className="text-xs text-gray-500">
                        {keyPair.origin === "generated"
                          ? "Generated"
                          : "Imported"}{" "}
                        {keyPair.family === "RSA"
                          ? "RSA 2048-bit"
                          : keyPair.family.replace("EC-", "EC ")}{" "}
                        key
                      </span>
                    )}
                  </div>
                  {showImport && (
                    <div className="mt-3">
                      <textarea
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        rows={5}
                        spellCheck={false}
                        aria-label="Private key to import"
                        placeholder={
                          '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n\nor a private JWK { "kty": ..., "d": ... }'
                        }
                        className={`${inputCls} resize-y text-xs`}
                      />
                      <div className="mt-2">
                        <SmallBtn
                          onClick={() => void doImport()}
                          disabled={!importText.trim()}
                        >
                          Use this key
                        </SmallBtn>
                      </div>
                    </div>
                  )}
                  {keyError && (
                    <p className="mb-0 mt-2 text-xs text-red-400">{keyError}</p>
                  )}
                  {keyPair && keyPair.family === info.family && (
                    <KeyMaterial keyPair={keyPair} alg={alg} kid={kid} />
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Header */}
          <div>
            <SectionLabel>Header</SectionLabel>
            <Card>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    alg
                  </label>
                  <input
                    value={alg}
                    readOnly
                    className={`${inputCls} opacity-70`}
                    aria-label="alg"
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-xs text-gray-500"
                    htmlFor="jwtgen-typ"
                  >
                    typ
                  </label>
                  <input
                    id="jwtgen-typ"
                    value={typ}
                    onChange={(e) => setTyp(e.target.value)}
                    spellCheck={false}
                    placeholder="(omit)"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-xs text-gray-500"
                    htmlFor="jwtgen-kid"
                  >
                    kid
                  </label>
                  <input
                    id="jwtgen-kid"
                    value={isHmac && kidAuto ? "" : kid}
                    onChange={(e) => {
                      setKidAuto(false);
                      setKid(e.target.value);
                    }}
                    spellCheck={false}
                    placeholder="(omit)"
                    className={inputCls}
                  />
                </div>
              </div>
              {!isHmac && (
                <label className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={kidAuto}
                    onChange={(e) => setKidAuto(e.target.checked)}
                  />
                  Use the key's RFC 7638 thumbprint as <code>kid</code>
                </label>
              )}
              <pre className="m-0 mt-3 overflow-x-auto rounded-lg bg-black/30 p-2.5 font-mono text-xs text-red-300">
                {JSON.stringify(header, null, 2)}
              </pre>
            </Card>
          </div>

          {/* Payload */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <SectionLabel>Payload</SectionLabel>
              <div className="-mt-2 flex flex-wrap gap-1">
                {PRESETS.map((p) => (
                  <SmallBtn
                    key={p.id}
                    active={preset === p.id}
                    onClick={() => loadPreset(p.id)}
                  >
                    {p.label}
                  </SmallBtn>
                ))}
              </div>
            </div>
            <Card>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span>Expires in</span>
                <input
                  type="number"
                  min={0}
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  aria-label="Expires in amount"
                  className="w-20 rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-xs text-white outline-none focus:border-p2blue-500"
                />
                <select
                  value={expUnit}
                  onChange={(e) => setExpUnit(e.target.value as TimeUnit)}
                  aria-label="Expires in unit"
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white outline-none"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={withNbf}
                    onChange={(e) => setWithNbf(e.target.checked)}
                  />
                  nbf = now
                </label>
                <SmallBtn
                  disabled={!parsed.ok}
                  onClick={() =>
                    updatePayload((p) =>
                      applyTimes(p, nowSec(), {
                        expiresIn: ttl(),
                        nbf: withNbf,
                      }),
                    )
                  }
                >
                  Set iat / exp
                </SmallBtn>
                <SmallBtn
                  disabled={!parsed.ok}
                  onClick={() =>
                    updatePayload((p) => ({
                      ...p,
                      iat: nowSec() - 7200,
                      exp: nowSec() - 3600,
                    }))
                  }
                >
                  Make expired
                </SmallBtn>
              </div>
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                rows={18}
                spellCheck={false}
                aria-label="JWT payload (JSON)"
                className={`${inputCls} resize-y text-xs text-white`}
              />
              {parsed.ok ? (
                <p className="mb-0 mt-1.5 flex items-center gap-1.5 text-xs text-green-400">
                  <Icon icon="mdi:check-circle" className="size-4" />
                  Valid JSON
                  {iat !== undefined && (
                    <span className="text-gray-500">
                      · iat {formatEpoch(iat)}
                    </span>
                  )}
                  {exp !== undefined && (
                    <span className="text-gray-500">
                      · exp {formatEpoch(exp)}
                    </span>
                  )}
                </p>
              ) : (
                payloadText && (
                  <p className="mb-0 mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                    <Icon icon="mdi:alert" className="size-4" />
                    {parsed.error}
                  </p>
                )
              )}
            </Card>
          </div>
        </div>

        {/* RIGHT: output */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <div>
            <SectionLabel>Signed token</SectionLabel>
            <div className="rounded-2xl border border-white/10 bg-black/20">
              <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-xs text-gray-400">
                <span className="font-mono">{">_ JSON Web Token (JWT)"}</span>
                <span className="font-mono">{alg}</span>
              </div>
              <p
                data-testid="jwt-output"
                className="m-0 min-h-32 break-all p-3 font-mono text-sm leading-relaxed"
              >
                {token ? (
                  <>
                    <span className="text-red-400">{parts[0]}</span>
                    <span className="text-gray-500">.</span>
                    <span className="text-secondary-400">{parts[1]}</span>
                    <span className="text-gray-500">.</span>
                    <span className="text-p2blue-400">{parts[2]}</span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    {signError ||
                      (!parsed.ok && payloadText
                        ? "Fix the payload JSON to sign."
                        : "Signing…")}
                  </span>
                )}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyBtn value={token} label="token" />
              <a
                href={token ? `${decoderUrl}#token=${token}` : undefined}
                target="_blank"
                rel="noopener"
                aria-disabled={!token}
                className={`inline-flex items-center gap-1.5 rounded-md bg-p2blue-500 px-3 py-1 text-xs font-medium text-white no-underline hover:bg-p2blue-600 hover:text-white hover:no-underline ${
                  token ? "" : "pointer-events-none opacity-50"
                }`}
              >
                <Icon icon="mdi:open-in-new" className="size-3.5" />
                Open in JWT Decoder
              </a>
            </div>
            <p className="mb-0 mt-3 text-xs text-gray-500">
              The decoder link carries the token in the URL fragment (
              <code>#token=</code>), which browsers never send to a server. To
              verify the signature there, choose{" "}
              {isHmac ? (
                <>
                  <em>Secret</em> and paste the secret above.
                </>
              ) : (
                <>
                  <em>Public key</em> and paste the JWKS or public key PEM from
                  the key panel.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
