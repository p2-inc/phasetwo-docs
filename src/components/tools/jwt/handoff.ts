/**
 * The URL-fragment format the JWT Generator uses to hand a token (and its
 * public JWKS) to the JWT Decoder: `#token=<jwt>&jwks=<url-encoded JSON>`.
 *
 * Fragments are never sent to a server, so neither value reaches request
 * logs; the decoder also strips the fragment from the address bar once read.
 * Only public keys ever travel this way — never secrets or private keys.
 */

export type Handoff = { token: string; jwks?: string };

/** Build the fragment (including the leading "#"). */
export function buildHandoffHash(token: string, jwks?: unknown): string {
  let hash = `#token=${encodeURIComponent(token)}`;
  if (jwks !== undefined)
    hash += `&jwks=${encodeURIComponent(JSON.stringify(jwks))}`;
  return hash;
}

/** Parse a fragment produced by `buildHandoffHash`. Returns null if absent. */
export function parseHandoffHash(hash: string): Handoff | null {
  if (!hash.startsWith("#token=")) return null;
  const out: Handoff = { token: "" };
  for (const part of hash.slice(1).split("&")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq);
    let value = part.slice(eq + 1);
    try {
      value = decodeURIComponent(value);
    } catch {
      /* keep the raw value */
    }
    if (key === "token") out.token = value;
    else if (key === "jwks") out.jwks = value;
  }
  if (!out.token) return null;
  if (out.jwks) {
    // Only accept something that is at least a JWKS-shaped JSON object.
    try {
      const parsed = JSON.parse(out.jwks) as { keys?: unknown };
      if (!Array.isArray(parsed.keys)) delete out.jwks;
      else out.jwks = JSON.stringify(parsed, null, 2);
    } catch {
      delete out.jwks;
    }
  }
  return out;
}
