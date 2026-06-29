import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import {
  verifyHmac,
  verifyPublicKey,
  verifyJwks,
  suggestJwksUrl,
  type VerifyResult,
  type VerifyStatus,
} from "./verify";

type Mode = "secret" | "publicKey" | "jwks";

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

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
        active ? "bg-p2blue-500 text-white" : "text-gray-400 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

export default function VerifyPanel({
  token,
  alg,
  issuer,
  onResult,
}: {
  token: string;
  alg: string | undefined;
  issuer: unknown;
  /** Bubble the latest verification result up so callers can show status. */
  onResult?: (result: VerifyResult | null) => void;
}) {
  const isHmac = !!alg && alg.toUpperCase().startsWith("HS");
  const [mode, setMode] = useState<Mode>(isHmac ? "secret" : "jwks");
  const [secret, setSecret] = useState("");
  const [pem, setPem] = useState("");
  const suggestedJwks = useMemo(() => suggestJwksUrl(issuer), [issuer]);
  const [jwks, setJwks] = useState(suggestedJwks ?? "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);

  // Follow the token's algorithm and prefill the Keycloak JWKS URL as tokens change.
  useEffect(() => {
    setMode(isHmac ? "secret" : "jwks");
    setResult(null);
    onResult?.(null);
  }, [isHmac, token]);
  useEffect(() => {
    if (suggestedJwks) setJwks(suggestedJwks);
  }, [suggestedJwks]);

  async function run() {
    setBusy(true);
    try {
      let r: VerifyResult;
      if (mode === "secret") r = await verifyHmac(token, secret);
      else if (mode === "publicKey") r = await verifyPublicKey(token, pem);
      else r = await verifyJwks(token, jwks);
      setResult(r);
      onResult?.(r);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="mb-0 text-sm font-semibold uppercase tracking-wide text-p2blue-400">
          Verify signature
        </h3>
        <div className="flex gap-1 rounded-lg border border-white/10 p-1">
          <ModeTab active={mode === "secret"} onClick={() => setMode("secret")}>
            Secret
          </ModeTab>
          <ModeTab
            active={mode === "publicKey"}
            onClick={() => setMode("publicKey")}
          >
            Public key
          </ModeTab>
          <ModeTab active={mode === "jwks"} onClick={() => setMode("jwks")}>
            JWKS URL
          </ModeTab>
        </div>
      </div>

      {mode === "secret" && (
        <div>
          <p className="mb-2 text-xs text-gray-500">
            For HMAC algorithms (HS256/384/512).{" "}
            {alg ? `Token alg: ${alg}.` : ""}
          </p>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            spellCheck={false}
            placeholder="your-256-bit-secret"
            className="w-full rounded-lg border border-white/10 bg-black/30 p-2.5 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500"
          />
        </div>
      )}

      {mode === "publicKey" && (
        <div>
          <p className="mb-2 text-xs text-gray-500">
            For asymmetric algorithms (RS/ES/PS). Paste a PEM public key or
            X.509 certificate. {alg ? `Token alg: ${alg}.` : ""}
          </p>
          <textarea
            value={pem}
            onChange={(e) => setPem(e.target.value)}
            spellCheck={false}
            rows={4}
            placeholder={
              "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
            }
            className="w-full resize-y rounded-lg border border-white/10 bg-black/30 p-2.5 font-mono text-xs text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500"
          />
        </div>
      )}

      {mode === "jwks" && (
        <div>
          <p className="mb-2 text-xs text-gray-500">
            Fetches the issuer's public keys and matches by <code>kid</code>.
            {suggestedJwks ? " Prefilled from the token's issuer." : ""}
          </p>
          <input
            type="url"
            value={jwks}
            onChange={(e) => setJwks(e.target.value)}
            spellCheck={false}
            placeholder="https://issuer/realms/your-realm/protocol/openid-connect/certs"
            className="w-full rounded-lg border border-white/10 bg-black/30 p-2.5 font-mono text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500"
          />
        </div>
      )}

      <button
        type="button"
        onClick={run}
        disabled={busy || !token}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-p2blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-p2blue-600 disabled:opacity-50"
      >
        {busy ? (
          <Icon icon="mdi:loading" className="size-4 animate-spin" />
        ) : (
          <Icon icon="mdi:shield-search" className="size-4" />
        )}
        Verify
      </button>

      {result && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl border px-4 py-2.5 text-sm ${STATUS_STYLES[result.status].cls}`}
        >
          <Icon
            icon={STATUS_STYLES[result.status].icon}
            className="mt-0.5 size-5 shrink-0"
          />
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
