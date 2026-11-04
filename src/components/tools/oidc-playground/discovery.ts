/**
 * OpenID Connect discovery + browser fetch helpers for the playground.
 * Framework-free.
 *
 * Discovery URLs and the discovery fetch come from the shared `../oidc/`
 * modules (also used by the JWKS Verifier and Discovery Inspector);
 * `callEndpoint` here covers the token and userinfo calls, which need POST
 * bodies and must surface OAuth error responses.
 *
 * The only network calls made are to the issuer the user typed and to the
 * endpoints that issuer's discovery document advertises.
 */
import { resolveDiscoveryTarget } from "../oidc/discovery.ts";
import { fetchJson } from "../oidc/fetch.ts";

/** The subset of discovery metadata the tools use. */
export type DiscoveryDocument = {
  issuer: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  jwks_uri?: string;
  end_session_endpoint?: string;
  revocation_endpoint?: string;
  introspection_endpoint?: string;
  response_types_supported?: string[];
  response_modes_supported?: string[];
  grant_types_supported?: string[];
  scopes_supported?: string[];
  code_challenge_methods_supported?: string[];
  prompt_values_supported?: string[];
  acr_values_supported?: string[];
  ui_locales_supported?: string[];
  claims_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  authorization_response_iss_parameter_supported?: boolean;
  [key: string]: unknown;
};

/** Trim whitespace and trailing slashes so issuers compare cleanly. */
export function normalizeIssuer(input: string): string {
  return input.trim().replace(/\/+$/, "");
}

/**
 * Turn whatever the user pasted (an issuer, or the full discovery URL) into
 * the discovery document URL.
 */
export function discoveryUrlFor(input: string): string {
  return (
    resolveDiscoveryTarget(input)?.discoveryUrl ??
    `${normalizeIssuer(input)}/.well-known/openid-configuration`
  );
}

/** Strip a pasted discovery URL back to the issuer. */
export function issuerFromInput(input: string): string {
  return normalizeIssuer(
    resolveDiscoveryTarget(input)?.expectedIssuer ?? input,
  );
}

/**
 * Guess the issuer from a Keycloak endpoint URL, e.g.
 * https://host/realms/foo/protocol/openid-connect/auth -> https://host/realms/foo
 */
export function guessKeycloakIssuer(endpoint: string): string | undefined {
  const m = endpoint.match(/^(https?:\/\/.+?\/realms\/[^/?#]+)\//);
  return m ? m[1] : undefined;
}

/** An error with a plain-English explanation suitable for the UI. */
export class FriendlyFetchError extends Error {
  hint: string;
  status?: number;
  body?: unknown;
  constructor(
    message: string,
    hint: string,
    opts?: { status?: number; body?: unknown },
  ) {
    super(message);
    this.name = "FriendlyFetchError";
    this.hint = hint;
    this.status = opts?.status;
    this.body = opts?.body;
  }
}

/** The origin this page runs on (used in CORS hints). */
function pageOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "this site";
}

/**
 * Explain a fetch() rejection. Browsers deliberately hide CORS failures behind
 * a generic TypeError, so we can only describe the likely causes.
 */
export function corsHint(url: string, what: string): string {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep raw */
  }
  return (
    `The browser could not read the response from ${host} for the ${what}. ` +
    `This is almost always CORS: the server did not return an Access-Control-Allow-Origin header for ${pageOrigin()}. ` +
    `In Keycloak, add ${pageOrigin()} (or "+", meaning "same as the valid redirect URIs") to the client's Web origins. ` +
    `Other causes: the host is unreachable from your machine, a TLS certificate your browser doesn't trust, ` +
    `or mixed content (an http:// endpoint called from an https:// page).`
  );
}

/** Read a response body as JSON when possible, falling back to text. */
async function readBody(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export type JsonResponse = {
  status: number;
  ok: boolean;
  body: unknown;
};

/**
 * fetch() wrapper that turns network/CORS failures into FriendlyFetchError
 * and always resolves HTTP errors (4xx/5xx) with their parsed body so the
 * caller can explain OAuth error responses.
 */
export async function callEndpoint(
  url: string,
  init: RequestInit | undefined,
  what: string,
): Promise<JsonResponse> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new FriendlyFetchError(
      `Network or CORS error calling the ${what}${e instanceof Error ? ` (${e.message})` : ""}.`,
      corsHint(url, what),
    );
  }
  const body = await readBody(res);
  return { status: res.status, ok: res.ok, body };
}

/**
 * Why a discovery fetch could not be read. Keycloak's discovery endpoint
 * sends CORS headers for any origin, so unlike the token endpoint this is
 * rarely about the client's Web origins.
 */
function discoveryNetworkHint(url: string): string {
  const keycloak = /\/realms\/[^/]+/.test(url);
  return (
    "The browser could not read the discovery document. From a web page it does not say why, but the usual cause is CORS. " +
    "Keycloak's discovery endpoint allows every origin, so against Keycloak this usually means " +
    (keycloak
      ? "a realm that does not exist (its 404 carries no CORS headers, so it looks like a CORS block), a missing or extra /auth prefix, "
      : "a wrong path, ") +
    "or a proxy, WAF, or gateway that blocks the request or strips the headers. DNS failures, untrusted TLS certificates, and outages look the same."
  );
}

/** Fetch and minimally validate an issuer's discovery document. */
export async function fetchDiscovery(
  issuerInput: string,
): Promise<DiscoveryDocument> {
  const url = resolveDiscoveryTarget(issuerInput)?.discoveryUrl ?? issuerInput;
  const res = await fetchJson(url);
  if (!res.ok) {
    switch (res.kind) {
      case "invalid-url":
        throw new FriendlyFetchError(
          "That is not a valid URL.",
          "Enter the issuer URL, for example https://your-host/realms/your-realm.",
        );
      case "http":
        throw new FriendlyFetchError(
          `The discovery endpoint returned HTTP ${res.status}.`,
          res.status === 404
            ? "No discovery document at that address. For Keycloak the issuer is https://host/realms/<realm> (older versions and some setups add /auth before /realms). Check the realm name — it is case-sensitive."
            : "The server responded, but not with a discovery document.",
          { status: res.status },
        );
      case "not-json":
        throw new FriendlyFetchError(
          "The response is not an OpenID Connect discovery document.",
          "Expected JSON with at least an `issuer` field.",
          { status: res.status },
        );
      case "network":
        throw new FriendlyFetchError(
          `Network or CORS error fetching the discovery document (${res.message}).`,
          discoveryNetworkHint(res.url),
        );
      default:
        throw new FriendlyFetchError(
          res.message,
          discoveryNetworkHint(res.url),
        );
    }
  }
  const doc = res.data as DiscoveryDocument;
  if (!doc || typeof doc !== "object" || typeof doc.issuer !== "string") {
    throw new FriendlyFetchError(
      "The response is not an OpenID Connect discovery document.",
      "Expected JSON with at least an `issuer` field.",
      { body: res.data },
    );
  }
  return doc;
}

export type DiscoveryWarning = {
  severity: "error" | "warning";
  message: string;
};

/** Sanity-check a discovery document for what the playground needs. */
export function checkDiscovery(
  doc: DiscoveryDocument,
  requestedIssuer: string,
): DiscoveryWarning[] {
  const out: DiscoveryWarning[] = [];
  if (normalizeIssuer(doc.issuer) !== issuerFromInput(requestedIssuer)) {
    out.push({
      severity: "warning",
      message: `The document's issuer (${doc.issuer}) does not exactly match the URL you entered. Tokens will carry ${doc.issuer} as iss — if this is Keycloak behind a proxy, check the hostname configuration.`,
    });
  }
  if (!doc.authorization_endpoint)
    out.push({
      severity: "error",
      message: "No authorization_endpoint advertised.",
    });
  if (!doc.token_endpoint)
    out.push({ severity: "error", message: "No token_endpoint advertised." });
  const methods = doc.code_challenge_methods_supported;
  if (methods && !methods.includes("S256")) {
    out.push({
      severity: "warning",
      message:
        "code_challenge_methods_supported does not list S256. PKCE may not be supported.",
    });
  }
  return out;
}
