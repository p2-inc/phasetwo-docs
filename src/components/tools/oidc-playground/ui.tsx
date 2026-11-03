/**
 * Shared presentational pieces for the OIDC tools. Styling matches the JWT
 * decoder (Tailwind + p2blue tokens on the dark site theme).
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import { parseJwt, getExpiryInfo, type ExpiryState } from "../jwt/decode";
import { verifyJwks, type VerifyResult } from "../jwt/verify";
import type { Finding, Severity } from "./lint";
import type { ErrorExplanation } from "./errors";
import type { ParamInfo } from "./params";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function PrivacyBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/5 px-4 py-2.5 text-sm text-green-300">
      <Icon icon="mdi:shield-lock" className="size-5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function CopyButton({
  value,
  label,
  text,
}: {
  value: string;
  label: string;
  /** Show a text button instead of an icon. */
  text?: string;
}) {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };
  if (text) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
      >
        <Icon
          icon={copied ? "mdi:check" : "mdi:content-copy"}
          className="size-3.5"
        />
        {copied ? "Copied" : text}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Copy ${label}`}
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white"
    >
      <Icon
        icon={copied ? "mdi:check" : "mdi:content-copy"}
        className="size-4"
      />
    </button>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
}) {
  const cls =
    variant === "primary"
      ? "bg-p2blue-500 text-white hover:bg-p2blue-600 border-transparent"
      : variant === "danger"
        ? "border-red-400/30 text-red-300 hover:bg-red-400/10"
        : "border-white/10 text-gray-200 hover:bg-white/5";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  mono = true,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-gray-300"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className={`w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:border-p2blue-500/60 ${mono ? "font-mono" : ""}`}
      />
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

const SEVERITY_STYLES: Record<Severity, { icon: string; cls: string }> = {
  error: { icon: "mdi:close-circle", cls: "text-red-400" },
  warning: { icon: "mdi:alert", cls: "text-amber-400" },
  info: { icon: "mdi:information-outline", cls: "text-p2blue-300" },
  ok: { icon: "mdi:check-circle", cls: "text-green-400" },
};

export function StatusRow({
  severity,
  children,
}: {
  severity: Severity;
  children: ReactNode;
}) {
  const s = SEVERITY_STYLES[severity];
  return (
    <div className={`flex items-start gap-1.5 text-sm ${s.cls}`}>
      <Icon icon={s.icon} className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

const SEVERITY_ORDER: Severity[] = ["error", "warning", "info", "ok"];

export function FindingList({ findings }: { findings: Finding[] }) {
  const sorted = [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
  if (sorted.length === 0)
    return <div className="text-sm text-gray-500">No findings.</div>;
  return (
    <div className="flex flex-col gap-2">
      {sorted.map((f, i) => (
        <StatusRow key={i} severity={f.severity}>
          {f.param && (
            <code className="mr-1.5 text-xs text-white">{f.param}</code>
          )}
          <span className="text-gray-300">{f.message}</span>
        </StatusRow>
      ))}
    </div>
  );
}

export function ErrorExplanationCard({
  ex,
  description,
  uri,
}: {
  ex: ErrorExplanation;
  description?: string;
  uri?: string;
}) {
  return (
    <div className="rounded-xl border border-red-400/30 bg-red-400/[0.06] p-4">
      <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-red-300">
        <Icon icon="mdi:alert-octagon" className="size-4" />
        <code className="text-red-200">{ex.code}</code> — {ex.title}
      </div>
      {description && (
        <div className="mb-2 font-mono text-xs text-gray-300">
          error_description: {description}
        </div>
      )}
      <p className="mb-2 text-sm text-gray-300">{ex.meaning}</p>
      {ex.causes.length > 0 && (
        <>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Common causes
          </div>
          <ul className="mb-0 list-disc space-y-1 pl-5 text-sm text-gray-300">
            {ex.causes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      )}
      {(ex.spec || uri) && (
        <div className="mt-2 text-xs text-gray-500">
          {ex.spec && <>Defined in {ex.spec}. </>}
          {uri && (
            <>
              error_uri:{" "}
              <a href={uri} target="_blank" rel="noopener noreferrer">
                {uri}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function ParamTable({
  rows,
}: {
  rows: { name: string; value: string; info?: ParamInfo; source?: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.name}-${i}`}
              className="border-b border-white/5 align-top last:border-0"
            >
              <td className="w-1/3 py-2 pr-3 font-mono text-sm font-medium text-white">
                {r.name}
                {r.info?.keycloak && (
                  <span className="ml-1.5 rounded bg-p2blue-500/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase text-p2blue-300">
                    Keycloak
                  </span>
                )}
                {r.source === "fragment" && (
                  <span className="ml-1.5 rounded bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-semibold uppercase text-gray-300">
                    fragment
                  </span>
                )}
                <div className="mt-0.5 font-sans text-xs font-normal text-gray-500">
                  {r.info?.desc ?? "Not a standard parameter."}
                  {r.info?.spec && (
                    <span className="text-gray-600"> ({r.info.spec})</span>
                  )}
                </div>
              </td>
              <td className="break-all py-2 font-mono text-sm text-gray-200">
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JsonBlock({ value }: { value: unknown }) {
  const str =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <div className="relative">
      <div className="absolute right-1.5 top-1.5">
        <CopyButton value={str} label="JSON" />
      </div>
      <pre className="m-0 max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-black/30 p-3 pr-10 font-mono text-xs text-gray-200">
        {str}
      </pre>
    </div>
  );
}

const EXPIRY_SEVERITY: Record<ExpiryState, Severity> = {
  valid: "ok",
  expired: "error",
  "not-yet-valid": "warning",
  "no-expiry": "info",
};

/**
 * Decode a token returned by the server and (for asymmetric signatures)
 * verify it against the issuer's JWKS. Reuses the JWT decoder's modules.
 */
export function TokenCard({
  label,
  token,
  jwksUri,
  note,
}: {
  label: string;
  token: string;
  jwksUri?: string;
  note?: ReactNode;
}) {
  const parsed = useMemo(() => parseJwt(token), [token]);
  const header = parsed.header.json;
  const payload = parsed.payload.json;
  const isJwt = !!header && !!payload && parsed.errors.length === 0;
  const alg = typeof header?.alg === "string" ? (header.alg as string) : "";
  const symmetric = alg.startsWith("HS");
  const [verify, setVerify] = useState<VerifyResult | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setVerify(null);
    if (!isJwt || !jwksUri || symmetric || alg === "none") return;
    verifyJwks(token, jwksUri).then((r) => {
      if (!cancelled) setVerify(r);
    });
    return () => {
      cancelled = true;
    };
  }, [token, jwksUri, isJwt, symmetric, alg]);

  const expiry = getExpiryInfo(payload, Date.now());

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="rounded-2xl border border-white/10 bg-black/20">
        <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
          <span className="truncate font-mono text-xs text-gray-400">
            {isJwt ? `JWT · ${alg}` : "Opaque token"}
          </span>
          <div className="flex items-center gap-0.5">
            <CopyButton value={token} label={label} />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Collapse" : "Expand"}
              className="inline-flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <Icon
                icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
                className="size-4"
              />
            </button>
          </div>
        </div>
        {open && (
          <div className="flex flex-col gap-3 p-3">
            <p className="m-0 line-clamp-3 break-all font-mono text-xs text-gray-500">
              {token}
            </p>
            {isJwt ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <StatusRow severity={EXPIRY_SEVERITY[expiry.state]}>
                    {expiry.label}
                  </StatusRow>
                  {symmetric ? (
                    <StatusRow severity="info">
                      Signed with {alg} (a server-side shared key), so it cannot
                      be verified with the public JWKS. That is normal for
                      Keycloak refresh tokens — treat them as opaque.
                    </StatusRow>
                  ) : !jwksUri ? (
                    <StatusRow severity="info">
                      No jwks_uri advertised — signature not checked.
                    </StatusRow>
                  ) : verify === null ? (
                    <StatusRow severity="info">
                      Verifying signature against the JWKS…
                    </StatusRow>
                  ) : (
                    <StatusRow
                      severity={verify.status === "valid" ? "ok" : "error"}
                    >
                      {verify.message}
                    </StatusRow>
                  )}
                </div>
                {note}
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Header</div>
                    <JsonBlock value={header} />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Payload</div>
                    <JsonBlock value={payload} />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400">
                This token is not a JWT. Opaque tokens can only be inspected by
                the server (for example via token introspection).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
