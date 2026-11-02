/**
 * PKCE (RFC 7636) helpers. Framework-free: no React or Docusaurus imports, so
 * the logic can be reused elsewhere (tests, a browser extension, etc.).
 *
 * All randomness comes from the WebCrypto CSPRNG and hashing from
 * `crypto.subtle`, so this only runs in a browser (or a runtime with WebCrypto).
 */

/** The unreserved character set RFC 7636 allows in a code_verifier. */
const VERIFIER_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export const VERIFIER_MIN_LENGTH = 43;
export const VERIFIER_MAX_LENGTH = 128;

/** Encode bytes as base64url without padding. */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * A random string drawn uniformly from the PKCE unreserved charset. Uses
 * rejection sampling so every character is equally likely (66 symbols do not
 * divide 256 evenly).
 */
export function randomString(
  length: number,
  charset: string = VERIFIER_CHARSET,
): string {
  const out: string[] = [];
  const max = 256 - (256 % charset.length);
  while (out.length < length) {
    const buf = new Uint8Array(length * 2);
    crypto.getRandomValues(buf);
    for (const b of buf) {
      if (b < max) out.push(charset[b % charset.length]);
      if (out.length === length) break;
    }
  }
  return out.join("");
}

/** A random base64url token with `bytes` bytes of entropy (for state/nonce). */
export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return bytesToBase64Url(buf);
}

/** Generate a code_verifier of the given length (43–128, default 64). */
export function generateCodeVerifier(length = 64): string {
  const n = Math.min(
    VERIFIER_MAX_LENGTH,
    Math.max(VERIFIER_MIN_LENGTH, Math.floor(length)),
  );
  return randomString(n);
}

/** The S256 code_challenge: BASE64URL(SHA-256(ASCII(code_verifier))). */
export async function challengeS256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return bytesToBase64Url(new Uint8Array(digest));
}

/** The plain code_challenge is the verifier itself (not recommended). */
export function challengePlain(verifier: string): string {
  return verifier;
}

export type VerifierCheck = {
  ok: boolean;
  problems: string[];
};

/** Validate a code_verifier against RFC 7636 section 4.1. */
export function validateCodeVerifier(verifier: string): VerifierCheck {
  const problems: string[] = [];
  if (verifier.length < VERIFIER_MIN_LENGTH) {
    problems.push(
      `Too short: ${verifier.length} characters. A code_verifier must be at least ${VERIFIER_MIN_LENGTH}.`,
    );
  }
  if (verifier.length > VERIFIER_MAX_LENGTH) {
    problems.push(
      `Too long: ${verifier.length} characters. A code_verifier may be at most ${VERIFIER_MAX_LENGTH}.`,
    );
  }
  const bad = Array.from(
    new Set(verifier.split("").filter((c) => !VERIFIER_CHARSET.includes(c))),
  );
  if (bad.length > 0) {
    problems.push(
      `Contains characters outside A–Z, a–z, 0–9, "-", ".", "_", "~": ${bad
        .map((c) => JSON.stringify(c))
        .join(", ")}.`,
    );
  }
  return { ok: problems.length === 0, problems };
}

/** True when a value looks like an S256 challenge (43 base64url characters). */
export function looksLikeS256Challenge(challenge: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(challenge);
}
