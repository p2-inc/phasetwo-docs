import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import {
  parseJwt,
  getExpiryInfo,
  formatEpoch,
  looksLikeKeycloak,
  extractKeycloakRoles,
  CLAIM_DESCRIPTIONS,
  TIME_CLAIMS,
  type ExpiryState,
} from "./decode";
import VerifyPanel from "./VerifyPanel";
import type { VerifyResult } from "./verify";

/** A realistic (but fake-signed) Keycloak / Phase Two access token for demos. */
const SAMPLE_TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InAyLWV4YW1wbGUta2V5LWlkIn0.eyJleHAiOjE3NTAwMDAzMDAsImlhdCI6MTc1MDAwMDAwMCwianRpIjoiYTFiMmMzZDQtMDAwMC0wMDAwLTAwMDAtYWJjZGVmMTIzNDU2IiwiaXNzIjoiaHR0cHM6Ly9hcHAucGhhc2V0d28uaW8vYXV0aC9yZWFsbXMvZXhhbXBsZSIsImF1ZCI6WyJhY2NvdW50IiwibXktYXBwIl0sInN1YiI6ImY6N2U4YTpjMGZmZWUtMTIzNC01Njc4LTlhYmMtZGVmMDEyMzQ1Njc4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibXktYXBwIiwic2Vzc2lvbl9zdGF0ZSI6IjlmMGEtc2Vzcy0xMjM0Iiwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSBvcmdhbml6YXRpb25zIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6ImFsaWNlQGV4YW1wbGUuY29tIiwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJBbGljZSBFeGFtcGxlIiwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbImRlZmF1bHQtcm9sZXMtZXhhbXBsZSIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iXX0sInJlc291cmNlX2FjY2VzcyI6eyJteS1hcHAiOnsicm9sZXMiOlsiYXBwLWFkbWluIiwiYmlsbGluZyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfX19.ZmFrZS1zaWduYXR1cmUtZm9yLWRlbW8tcHVycG9zZXMtb25seQ";

const EXPIRY_STYLES: Record<ExpiryState, { icon: string; cls: string }> = {
  valid: { icon: "mdi:check-circle", cls: "text-green-400" },
  expired: { icon: "mdi:close-circle", cls: "text-red-400" },
  "not-yet-valid": { icon: "mdi:clock-alert", cls: "text-amber-400" },
  "no-expiry": { icon: "mdi:information-outline", cls: "text-gray-400" },
};

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

function IconBtn({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white"
    >
      <Icon icon={icon} className="size-4" />
    </button>
  );
}

function CopyIconBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <IconBtn
      icon={copied ? "mdi:check" : "mdi:content-copy"}
      label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
    />
  );
}

function StatusRow({
  icon,
  cls,
  children,
}: {
  icon: string;
  cls: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex items-center gap-1.5 text-sm ${cls}`}>
      <Icon icon={icon} className="size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** Renders a single claim value, expanding objects/arrays as formatted JSON. */
function ClaimValue({ name, value }: { name: string; value: unknown }) {
  if (typeof value === "number" && TIME_CLAIMS.has(name)) {
    return (
      <span className="font-mono text-sm text-white">{formatEpoch(value)}</span>
    );
  }
  if (value !== null && typeof value === "object") {
    return (
      <pre className="m-0 overflow-x-auto rounded bg-black/30 p-2 font-mono text-xs text-gray-200">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return (
    <span className="font-mono text-sm text-white">
      {JSON.stringify(value)}
    </span>
  );
}

function ClaimsTable({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <tbody>
          {Object.entries(data).map(([name, value]) => (
            <tr
              key={name}
              className="border-b border-white/5 align-top last:border-0"
            >
              <td className="py-2 pr-3 font-mono text-sm font-medium text-white">
                {name}
                {CLAIM_DESCRIPTIONS[name] && (
                  <div className="mt-0.5 font-sans text-xs font-normal text-gray-500">
                    {CLAIM_DESCRIPTIONS[name]}
                  </div>
                )}
              </td>
              <td className="py-2">
                <ClaimValue name={name} value={value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RolePills({
  roles,
  variant,
}: {
  roles: string[];
  variant: "realm" | "client" | "scope";
}) {
  const cls =
    variant === "realm"
      ? "border-p2blue-500/30 bg-p2blue-500/10 text-p2blue-300"
      : variant === "client"
        ? "border-secondary-500/30 bg-secondary-500/10 text-secondary-400"
        : "border-white/10 bg-white/5 text-gray-300";
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r) => (
        <span
          key={r}
          className={`rounded-full border px-2.5 py-0.5 font-mono text-xs ${cls}`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function KeycloakSummary({ payload }: { payload: Record<string, unknown> }) {
  const kc = extractKeycloakRoles(payload);
  const hasAny =
    kc.realmRoles.length > 0 ||
    Object.keys(kc.clientRoles).length > 0 ||
    kc.scopes.length > 0;
  if (!hasAny) return null;
  return (
    <div className="mb-4 rounded-xl border border-p2blue-500/20 bg-p2blue-500/[0.06] p-4">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-p2blue-300">
        <Icon icon="mdi:shield-key-outline" className="size-4" />
        Keycloak / Phase Two roles
      </div>
      {kc.realmRoles.length > 0 && (
        <div className="mb-3">
          <div className="mb-1.5 text-xs text-gray-500">Realm roles</div>
          <RolePills roles={kc.realmRoles} variant="realm" />
        </div>
      )}
      {Object.keys(kc.clientRoles).length > 0 && (
        <div className="mb-3">
          <div className="mb-1.5 text-xs text-gray-500">
            Client (resource) roles
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(kc.clientRoles).map(([client, roles]) => (
              <div key={client} className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs text-gray-400">
                  {client}:
                </span>
                <RolePills roles={roles} variant="client" />
              </div>
            ))}
          </div>
        </div>
      )}
      {kc.scopes.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs text-gray-500">Scopes</div>
          <RolePills roles={kc.scopes} variant="scope" />
        </div>
      )}
    </div>
  );
}

/** A collapsible card with JSON / Claims Breakdown tabs. */
function DecodedPanel({
  label,
  data,
  defaultTab = "claims",
  keycloak = false,
}: {
  label: string;
  data: Record<string, unknown>;
  defaultTab?: "json" | "claims";
  keycloak?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"json" | "claims">(defaultTab);
  const jsonStr = JSON.stringify(data, null, 2);

  const tabBtn = (key: "json" | "claims", text: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
        tab === key
          ? "bg-white/10 text-white"
          : "text-gray-400 hover:text-white"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="rounded-2xl border border-white/10 bg-black/20">
        <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
          <div className="flex items-center gap-1">
            {tabBtn("json", "JSON")}
            {tabBtn("claims", "Claims Breakdown")}
          </div>
          <div className="flex items-center gap-0.5">
            <CopyIconBtn value={jsonStr} label={label} />
            <IconBtn
              icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
              label={open ? "Collapse" : "Expand"}
              onClick={() => setOpen((o) => !o)}
            />
          </div>
        </div>
        {open && (
          <div className="p-3">
            {tab === "json" ? (
              <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-all rounded bg-black/30 p-3 font-mono text-sm text-gray-200">
                {jsonStr}
              </pre>
            ) : (
              <>
                {keycloak && <KeycloakSummary payload={data} />}
                <ClaimsTable data={data} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  const parsed = useMemo(() => parseJwt(token), [token]);
  // Date.now() is only read on the client (post-mount interactions), so this
  // does not affect Docusaurus static rendering of the empty initial state.
  const expiry = useMemo(
    () =>
      getExpiryInfo(
        parsed.payload.json,
        typeof window === "undefined" ? 0 : Date.now(),
      ),
    [parsed],
  );

  const payload = parsed.payload.json;
  const header = parsed.header.json;
  const showKeycloak = looksLikeKeycloak(payload);
  const hasInput = token.trim().length > 0;
  const fatal = parsed.errors.filter((e) => !e.startsWith("Paste"));
  const validJwt = hasInput && !!(header || payload) && fatal.length === 0;
  const alg =
    typeof header?.alg === "string" ? (header.alg as string) : undefined;
  const isNoneAlg = alg?.toLowerCase() === "none";

  return (
    <div className="not-prose">
      {/* Privacy banner — the core trust promise. */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-300">
        <Icon icon="mdi:shield-lock" className="size-5 shrink-0" />
        <span>
          Everything runs in your browser. Your token is never sent to a server,
          logged, or stored.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: encoded token + status */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <SectionLabel>Encoded Token</SectionLabel>
            <div className="-mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setToken(SAMPLE_TOKEN)}
                className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={() => setToken("")}
                disabled={!hasInput}
                className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-xs text-gray-400">
              <span className="font-mono">{">_ JSON Web Token (JWT)"}</span>
              {hasInput && <CopyIconBtn value={parsed.input} label="token" />}
            </div>
            <textarea
              id="jwt-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              spellCheck={false}
              rows={6}
              placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0..."
              aria-label="Paste a JSON Web Token"
              className="w-full resize-y break-all rounded-b-2xl bg-transparent p-3 font-mono text-sm text-white outline-none placeholder:text-gray-600"
            />
            {hasInput && parsed.parts.length >= 2 && (
              <p className="m-0 break-all border-t border-white/5 p-3 font-mono text-xs leading-relaxed">
                <span className="text-red-400">{parsed.parts[0]}</span>
                <span className="text-gray-500">.</span>
                <span className="text-secondary-400">
                  {parsed.parts[1] ?? ""}
                </span>
                {parsed.parts[2] !== undefined && (
                  <>
                    <span className="text-gray-500">.</span>
                    <span className="text-p2blue-400">{parsed.parts[2]}</span>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Status indicators */}
          {hasInput && (
            <div className="flex flex-col gap-1.5 px-1">
              {validJwt ? (
                <StatusRow icon="mdi:check-circle" cls="text-green-400">
                  Valid JWT
                </StatusRow>
              ) : (
                fatal.map((e, i) => (
                  <StatusRow key={i} icon="mdi:alert" cls="text-amber-400">
                    {e}
                  </StatusRow>
                ))
              )}
              {payload && (
                <StatusRow
                  icon={EXPIRY_STYLES[expiry.state].icon}
                  cls={EXPIRY_STYLES[expiry.state].cls}
                >
                  {expiry.label}
                </StatusRow>
              )}
              {verifyResult && (
                <StatusRow
                  icon={
                    verifyResult.status === "valid"
                      ? "mdi:shield-check"
                      : verifyResult.status === "invalid"
                        ? "mdi:shield-off"
                        : "mdi:shield-alert"
                  }
                  cls={
                    verifyResult.status === "valid"
                      ? "text-green-400"
                      : verifyResult.status === "invalid"
                        ? "text-red-400"
                        : "text-amber-400"
                  }
                >
                  {verifyResult.status === "valid"
                    ? "Signature verified"
                    : verifyResult.status === "invalid"
                      ? "Signature invalid"
                      : "Signature not verified"}
                </StatusRow>
              )}
              {isNoneAlg && (
                <StatusRow icon="mdi:alert-octagon" cls="text-red-400">
                  Uses <code>alg: none</code> — unsigned and trivially
                  forgeable.
                </StatusRow>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: decoded panels + verification */}
        <div className="flex flex-col gap-4">
          {!hasInput && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
              Paste a token on the left, or{" "}
              <button
                type="button"
                onClick={() => setToken(SAMPLE_TOKEN)}
                className="text-p2blue-400 hover:underline"
              >
                load the sample
              </button>{" "}
              to see it decoded here.
            </div>
          )}
          {header && (
            <DecodedPanel
              label="Decoded Header"
              data={header}
              defaultTab="json"
            />
          )}
          {payload && (
            <DecodedPanel
              label="Decoded Payload"
              data={payload}
              defaultTab="json"
              keycloak={showKeycloak}
            />
          )}
          {payload && !parsed.isEncrypted && (
            <VerifyPanel
              token={parsed.input}
              alg={alg}
              issuer={payload.iss}
              onResult={setVerifyResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}
