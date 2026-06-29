/**
 * Pure, dependency-free JWT decoding helpers used by the JWT Decoder tool.
 *
 * Everything here runs in the browser — tokens are never sent anywhere. The
 * functions are intentionally side-effect free so they can be unit tested and
 * reused (e.g. inside an admin-console token inspector) without pulling in the
 * React layer.
 */

export type Segment = {
  /** The raw base64url segment as it appeared in the token. */
  raw: string;
  /** Parsed JSON, when the segment decoded to valid JSON. */
  json?: Record<string, unknown>;
  /** Decoded UTF-8 text, when present but not valid JSON. */
  text?: string;
  /** Human-readable problem with this segment, if any. */
  error?: string;
};

export type ParsedJwt = {
  /** The trimmed input the parse was run against. */
  input: string;
  /** The dot-separated parts (2 for unsecured, 3 for JWS, 5 for JWE). */
  parts: string[];
  header: Segment;
  payload: Segment;
  /** The signature segment is left encoded — it is bytes, not JSON. */
  signature: { raw: string };
  /** True when the token looks structurally like a JWE (5 parts). */
  isEncrypted: boolean;
  /** Fatal, whole-token problems (wrong shape, empty, etc.). */
  errors: string[];
};

/** Decode a base64url string to raw bytes. */
export function base64UrlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Decode a base64url string to a UTF-8 string. */
export function base64UrlDecode(b64url: string): string {
  return new TextDecoder().decode(base64UrlToBytes(b64url));
}

function decodeSegment(raw: string): Segment {
  if (!raw) return { raw, error: "Segment is empty." };
  let text: string;
  try {
    text = base64UrlDecode(raw);
  } catch {
    return { raw, error: "Not valid base64url." };
  }
  try {
    return { raw, json: JSON.parse(text) as Record<string, unknown> };
  } catch {
    // Header/payload should be JSON; if it isn't, surface the raw text.
    return { raw, text, error: "Decoded, but not valid JSON." };
  }
}

/**
 * Parse a JWT/JWS/JWE string into its segments. Never throws — structural
 * problems are reported via `errors` so the UI can render partial results.
 */
export function parseJwt(input: string): ParsedJwt {
  const trimmed = input.trim();
  const parts = trimmed.split(".");
  const base: ParsedJwt = {
    input: trimmed,
    parts,
    header: { raw: parts[0] ?? "" },
    payload: { raw: parts[1] ?? "" },
    signature: { raw: parts[2] ?? "" },
    isEncrypted: parts.length === 5,
    errors: [],
  };

  if (!trimmed) {
    base.errors.push("Paste a token to decode it.");
    return base;
  }
  if (parts.length === 5) {
    base.errors.push(
      "This looks like an encrypted JWT (JWE, 5 segments). Only the header can be decoded — the payload is encrypted.",
    );
    base.header = decodeSegment(parts[0]);
    return base;
  }
  if (parts.length !== 3 && parts.length !== 2) {
    base.errors.push(
      `A JWT has 3 segments separated by "." — this input has ${parts.length}. Check for stray spaces or a truncated copy.`,
    );
  }

  base.header = decodeSegment(parts[0]);
  base.payload = decodeSegment(parts[1] ?? "");
  return base;
}

/* ------------------------------------------------------------------ */
/* Claim humanization                                                  */
/* ------------------------------------------------------------------ */

/** Short, friendly descriptions for registered + common provider claims. */
export const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer — who created and signed this token.",
  sub: "Subject — the principal (usually the user) the token is about.",
  aud: "Audience — the recipient(s) the token is intended for.",
  exp: "Expiration time — the token is invalid on/after this instant.",
  nbf: "Not before — the token is invalid before this instant.",
  iat: "Issued at — when the token was created.",
  jti: "JWT ID — a unique identifier for this token.",
  azp: "Authorized party — the client the token was issued to.",
  scope: "OAuth scopes granted to this token.",
  typ: "Token type (e.g. Bearer, Refresh, ID).",
  email: "The subject's email address.",
  email_verified: "Whether the email address has been verified.",
  preferred_username: "The subject's preferred username.",
  name: "The subject's full display name.",
  sid: "Session ID this token belongs to.",
  session_state: "Keycloak session identifier.",
  acr: "Authentication Context Class Reference (assurance level).",
  realm_access: "Keycloak realm-level roles granted to the subject.",
  resource_access: "Keycloak client-level (resource) roles granted.",
  client_id: "The OAuth client this token was issued to.",
  nonce:
    "Value binding the token to a specific auth request (replay protection).",
};

/** Timestamp-valued claims, rendered as dates instead of raw epoch seconds. */
export const TIME_CLAIMS = new Set([
  "exp",
  "iat",
  "nbf",
  "auth_time",
  "updated_at",
]);

export type ExpiryState = "valid" | "expired" | "not-yet-valid" | "no-expiry";

export type ExpiryInfo = {
  state: ExpiryState;
  /** Human relative phrase, e.g. "expires in 4 minutes" / "expired 2 hours ago". */
  label: string;
};

function relative(deltaMs: number): string {
  const abs = Math.abs(deltaMs);
  const units: [number, string][] = [
    [86_400_000, "day"],
    [3_600_000, "hour"],
    [60_000, "minute"],
    [1_000, "second"],
  ];
  for (const [ms, name] of units) {
    if (abs >= ms) {
      const n = Math.round(abs / ms);
      return `${n} ${name}${n === 1 ? "" : "s"}`;
    }
  }
  return "less than a second";
}

/**
 * Evaluate exp/nbf against the current time. `now` is injectable so this stays
 * pure and testable; callers pass `Date.now()`.
 */
export function getExpiryInfo(
  payload: Record<string, unknown> | undefined,
  now: number,
): ExpiryInfo {
  if (!payload) return { state: "no-expiry", label: "No claims to evaluate." };
  const exp = typeof payload.exp === "number" ? payload.exp * 1000 : undefined;
  const nbf = typeof payload.nbf === "number" ? payload.nbf * 1000 : undefined;

  if (nbf !== undefined && now < nbf) {
    return {
      state: "not-yet-valid",
      label: `Not valid yet — becomes active in ${relative(nbf - now)}.`,
    };
  }
  if (exp === undefined) {
    return { state: "no-expiry", label: "No expiration (exp) claim." };
  }
  if (now >= exp) {
    return { state: "expired", label: `Expired ${relative(now - exp)} ago.` };
  }
  return {
    state: "valid",
    label: `Valid — expires in ${relative(exp - now)}.`,
  };
}

/** Format an epoch-seconds value as an absolute UTC string. */
export function formatEpoch(seconds: number): string {
  const d = new Date(seconds * 1000);
  if (Number.isNaN(d.getTime())) return String(seconds);
  return `${d.toUTCString()} (${seconds})`;
}

/* ------------------------------------------------------------------ */
/* Keycloak / Phase Two awareness                                      */
/* ------------------------------------------------------------------ */

export type KeycloakRoles = {
  realmRoles: string[];
  /** Map of client/resource id -> roles granted on it. */
  clientRoles: Record<string, string[]>;
  scopes: string[];
  authorizedParty?: string;
};

/**
 * Heuristic: does this payload look like a Keycloak access token? We key off
 * the shape of realm_access / resource_access since those are Keycloak-specific.
 */
export function looksLikeKeycloak(
  payload: Record<string, unknown> | undefined,
): boolean {
  if (!payload) return false;
  return (
    "realm_access" in payload ||
    "resource_access" in payload ||
    typeof payload.azp === "string" ||
    typeof payload.session_state === "string"
  );
}

/** Pull Keycloak realm/client roles + scopes out of a payload for friendly display. */
export function extractKeycloakRoles(
  payload: Record<string, unknown> | undefined,
): KeycloakRoles {
  const out: KeycloakRoles = { realmRoles: [], clientRoles: {}, scopes: [] };
  if (!payload) return out;

  const realm = payload.realm_access as { roles?: unknown } | undefined;
  if (realm && Array.isArray(realm.roles)) {
    out.realmRoles = realm.roles.filter(
      (r): r is string => typeof r === "string",
    );
  }

  const res = payload.resource_access as
    | Record<string, { roles?: unknown }>
    | undefined;
  if (res && typeof res === "object") {
    for (const [client, val] of Object.entries(res)) {
      if (val && Array.isArray(val.roles)) {
        out.clientRoles[client] = val.roles.filter(
          (r): r is string => typeof r === "string",
        );
      }
    }
  }

  if (typeof payload.scope === "string") {
    out.scopes = payload.scope.split(/\s+/).filter(Boolean);
  }
  if (typeof payload.azp === "string") out.authorizedParty = payload.azp;

  return out;
}
