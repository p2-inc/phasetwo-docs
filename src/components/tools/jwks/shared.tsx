/**
 * Presentational building blocks shared by the JWKS Verifier and the OIDC
 * Discovery Inspector. Logic lives in ../oidc/*; this file is UI only.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@iconify/react";
import type { Finding, Severity } from "../oidc/findings";
import { sortFindings } from "../oidc/findings";
import type { FetchJsonResult } from "../oidc/fetch";
import { buildShareLink, readDeepLink } from "../oidc/deeplink";

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
      className={`rounded-2xl border border-white/10 bg-black/20 p-5 ${className}`}
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

export function SmallButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  disabled,
  busy,
  icon,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  icon: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-p2blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-p2blue-600 disabled:opacity-50"
    >
      <Icon
        icon={busy ? "mdi:loading" : icon}
        className={`size-4 ${busy ? "animate-spin" : ""}`}
      />
      {children}
    </button>
  );
}

export function ModeTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-white/10 p-1">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            value === key
              ? "bg-p2blue-500 text-white"
              : "text-gray-400 hover:bg-white/5"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function CopyBtn({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white"
    >
      <Icon
        icon={copied ? "mdi:check" : "mdi:content-copy"}
        className="size-3.5"
      />
    </button>
  );
}

export function Pills({
  values,
  highlight,
  danger,
}: {
  values: string[];
  highlight?: (v: string) => boolean;
  danger?: (v: string) => boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span
          key={v}
          className={`rounded-full border px-2.5 py-0.5 font-mono text-xs ${
            danger?.(v)
              ? "border-red-400/30 bg-red-400/10 text-red-300"
              : highlight?.(v)
                ? "border-green-400/30 bg-green-400/10 text-green-300"
                : "border-white/10 bg-white/5 text-gray-300"
          }`}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

export const SEVERITY_STYLES: Record<
  Severity,
  { icon: string; cls: string; label: string }
> = {
  error: { icon: "mdi:close-octagon", cls: "text-red-400", label: "Error" },
  warning: { icon: "mdi:alert", cls: "text-amber-400", label: "Warning" },
  info: {
    icon: "mdi:information-outline",
    cls: "text-p2blue-300",
    label: "Note",
  },
  pass: { icon: "mdi:check-circle", cls: "text-green-400", label: "Pass" },
};

export function FindingsList({
  findings,
  compact = false,
}: {
  findings: Finding[];
  compact?: boolean;
}) {
  if (!findings.length) return null;
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {sortFindings(findings).map((f, i) => {
        const s = SEVERITY_STYLES[f.severity];
        return (
          <li key={`${f.rule}-${i}`} className="flex items-start gap-2">
            <Icon
              icon={s.icon}
              className={`mt-0.5 size-4 shrink-0 ${s.cls}`}
              aria-label={s.label}
            />
            <div className="min-w-0">
              <div
                className={`break-words text-sm ${f.severity === "pass" ? "text-gray-300" : "text-white"}`}
              >
                {f.title}
              </div>
              {f.detail && !compact && (
                <div className="mt-0.5 text-xs text-gray-400">{f.detail}</div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Explain a failed fetch. Browsers deliberately hide why a cross-origin
 * request failed, so "network" covers CORS blocks, DNS, TLS, and outages.
 */
export function FetchErrorHelp({
  result,
  onPasteInstead,
  what,
}: {
  result: Extract<FetchJsonResult, { ok: false }>;
  onPasteInstead?: () => void;
  /** e.g. "discovery document" or "JWKS" */
  what: string;
}) {
  const isKeycloakPath = /\/realms\/[^/]+/.test(result.url);
  const curl = `curl -s '${result.url.replace(/'/g, "%27")}'`;
  return (
    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] p-5 text-sm text-gray-300">
      <div className="mb-2 flex items-center gap-2 font-semibold text-amber-300">
        <Icon icon="mdi:cloud-alert" className="size-5 shrink-0" />
        {result.kind === "network"
          ? `Your browser could not read the ${what}`
          : result.kind === "http"
            ? `The ${what} request failed (HTTP ${result.status})`
            : result.kind === "timeout"
              ? `The ${what} request timed out`
              : result.kind === "not-json"
                ? `The ${what} URL did not return JSON`
                : result.kind === "mixed-content"
                  ? "Blocked: plain http from an https page"
                  : "Invalid URL"}
      </div>
      <p className="mb-2 break-all font-mono text-xs text-gray-400">
        {result.url}
      </p>

      {result.kind === "network" && (
        <>
          <p className="mb-2">
            The request was blocked or never completed. From a web page the
            browser does not reveal which, but the usual cause is{" "}
            <strong className="text-white">CORS</strong>: a site can only read a
            response from another origin if that server sends an{" "}
            <code>Access-Control-Allow-Origin</code> header. Without it, the
            browser discards the response — even when the server returned it
            successfully. DNS failures, TLS certificate errors, private network
            addresses, and outages look the same.
          </p>
          <p className="mb-2">
            Keycloak's discovery (<code>/.well-known/openid-configuration</code>
            ) and certs (<code>/protocol/openid-connect/certs</code>) endpoints
            send CORS headers for any origin, so a block against Keycloak
            usually points to something else:{" "}
            {isKeycloakPath ? (
              <>
                a realm name that does not exist (Keycloak's 404 for an unknown
                realm carries no CORS headers, so the browser reports it as a
                CORS failure), a missing or extra <code>/auth</code>{" "}
                prefix,{" "}
              </>
            ) : (
              <>a wrong path, </>
            )}
            or a reverse proxy, WAF, or gateway in front of Keycloak that blocks
            the request or strips the headers.
          </p>
        </>
      )}
      {result.kind === "http" && (
        <p className="mb-2">
          {result.message}{" "}
          {result.status === 404 && isKeycloakPath
            ? "For Keycloak, check the realm name (it is case-sensitive) and whether your server uses the legacy /auth prefix."
            : "Check that the URL is correct and publicly reachable."}
        </p>
      )}
      {(result.kind === "timeout" ||
        result.kind === "not-json" ||
        result.kind === "mixed-content" ||
        result.kind === "invalid-url") && (
        <p className="mb-2">{result.message}</p>
      )}

      {result.kind !== "invalid-url" && (
        <>
          <p className="mb-2">
            <strong className="text-white">Fallback:</strong> open the URL in a
            new tab (or run the command below), copy the JSON, and{" "}
            {onPasteInstead ? (
              <button
                type="button"
                onClick={onPasteInstead}
                className="text-p2blue-400 hover:underline"
              >
                paste it here instead
              </button>
            ) : (
              "paste it here instead"
            )}
            . Everything is still analyzed locally.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-200 no-underline hover:bg-white/5"
            >
              <Icon icon="mdi:open-in-new" className="size-3.5" />
              Open URL
            </a>
            <code className="flex items-center gap-1 rounded-md bg-black/30 px-2 py-1 text-xs">
              <span className="break-all">{curl}</span>
              <CopyBtn value={curl} label="curl command" />
            </code>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Run `onUrl` with the URL from a `#url=` (or `?url=`) deep link, on first
 * load and whenever the fragment changes. Browser-only; a no-op during SSR.
 */
export function useDeepLink(onUrl: (url: string) => void) {
  const cb = useRef(onUrl);
  cb.current = onUrl;
  useEffect(() => {
    const check = () => {
      const target = readDeepLink(window.location);
      if (target) cb.current(target);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);
}

/** Point the address bar at the share link for `target`, without reloading. */
export function syncDeepLink(target: string) {
  if (typeof window === "undefined") return;
  try {
    window.history.replaceState(
      window.history.state,
      "",
      buildShareLink(window.location.href, target),
    );
  } catch {
    // Some embedded browsers disallow history changes; links still work.
  }
}

/** Drop any deep link from the address bar (e.g. after Clear). */
export function clearDeepLink() {
  if (typeof window === "undefined" || !readDeepLink(window.location)) return;
  try {
    const u = new URL(window.location.href);
    u.hash = "";
    u.searchParams.delete("url");
    window.history.replaceState(window.history.state, "", u.toString());
  } catch {
    // ignore
  }
}

export function ShareLinkButton({ target }: { target: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        const link = buildShareLink(window.location.href, target);
        navigator.clipboard?.writeText(link).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      title="Copy a link that opens this tool and runs it on this URL. Only the URL is included."
      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/5"
    >
      <Icon
        icon={copied ? "mdi:check" : "mdi:link-variant"}
        className="size-3.5"
      />
      {copied ? "Link copied" : "Copy share link"}
    </button>
  );
}
