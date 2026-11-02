/**
 * Browser fetch helper for public OIDC metadata (discovery documents and
 * JWKS). Requests go straight from the browser to the URL the user entered —
 * there is no proxy — so the target's CORS policy decides whether we can read
 * the response. Failures are classified so the UI can explain them.
 *
 * Only a CORS-safelisted `Accept` header is sent and credentials are omitted,
 * so these are "simple" requests that never trigger a preflight.
 */

export type FetchErrorKind =
  | "invalid-url"
  | "mixed-content"
  | "network" // CORS block, DNS failure, TLS error, offline — the browser can't tell us which
  | "timeout"
  | "http"
  | "not-json";

export type FetchJsonResult =
  | {
      ok: true;
      url: string;
      /** The URL after redirects, when the browser exposes it. */
      finalUrl: string;
      status: number;
      contentType: string;
      data: unknown;
      ms: number;
    }
  | {
      ok: false;
      url: string;
      kind: FetchErrorKind;
      status?: number;
      message: string;
    };

const DEFAULT_TIMEOUT_MS = 10_000;

function isLoopback(host: string): boolean {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "[::1]"
  );
}

/** Parse and sanity-check a URL the user typed. */
export function parseUserUrl(input: string): URL | undefined {
  const s = input.trim();
  if (!s) return undefined;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
    return u;
  } catch {
    return undefined;
  }
}

export async function fetchJson(
  input: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<FetchJsonResult> {
  const url = parseUserUrl(input);
  if (!url)
    return {
      ok: false,
      url: input,
      kind: "invalid-url",
      message: "That is not a valid http(s) URL.",
    };
  const href = url.toString();

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    url.protocol === "http:" &&
    !isLoopback(url.hostname)
  ) {
    return {
      ok: false,
      url: href,
      kind: "mixed-content",
      message:
        "Browsers block plain-http requests from an https page (mixed content). Use the https URL, or paste the JSON instead.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );
  opts.signal?.addEventListener("abort", () => controller.abort());
  const started = performance.now();

  let res: Response;
  try {
    res = await fetch(href, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    if (controller.signal.aborted)
      return {
        ok: false,
        url: href,
        kind: "timeout",
        message: "The request timed out.",
      };
    return {
      ok: false,
      url: href,
      kind: "network",
      message: e instanceof Error ? e.message : String(e),
    };
  }
  clearTimeout(timer);

  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text().catch(() => "");
  if (!res.ok)
    return {
      ok: false,
      url: href,
      kind: "http",
      status: res.status,
      message: `The server responded with HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ""}.`,
    };
  try {
    return {
      ok: true,
      url: href,
      finalUrl: res.url || href,
      status: res.status,
      contentType,
      data: JSON.parse(body),
      ms: Math.round(performance.now() - started),
    };
  } catch {
    return {
      ok: false,
      url: href,
      kind: "not-json",
      status: res.status,
      message: `The response was not JSON${contentType ? ` (content-type: ${contentType})` : ""}.`,
    };
  }
}

/** Parse pasted JSON, returning a friendly error instead of throwing. */
export function parseJsonInput(
  text: string,
): { ok: true; data: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (e) {
    return {
      ok: false,
      message: `Not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
