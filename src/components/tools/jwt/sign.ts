/**
 * Client-side JWT signing and test-key management, built on `jose`.
 *
 * Framework-free. Everything uses the browser's WebCrypto — keys are generated
 * and held in memory only, and nothing is sent anywhere. Functions that touch
 * `crypto` or `Date.now()` must only be called from client-side code (effects
 * and event handlers), never during server-side rendering.
 */
import {
  CompactSign,
  calculateJwkThumbprint,
  exportJWK,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  importJWK,
  importPKCS8,
  type JWK,
} from "jose";

/* ------------------------------------------------------------------ */
/* Algorithms                                                          */
/* ------------------------------------------------------------------ */

export type KeyFamily = "HMAC" | "RSA" | "EC-P256" | "EC-P384" | "Ed25519";

export type AlgInfo = {
  alg: string;
  family: KeyFamily;
  label: string;
};

export const ALGORITHMS: AlgInfo[] = [
  { alg: "HS256", family: "HMAC", label: "HMAC + SHA-256" },
  { alg: "HS384", family: "HMAC", label: "HMAC + SHA-384" },
  { alg: "HS512", family: "HMAC", label: "HMAC + SHA-512" },
  { alg: "RS256", family: "RSA", label: "RSA PKCS#1 v1.5 + SHA-256" },
  { alg: "RS384", family: "RSA", label: "RSA PKCS#1 v1.5 + SHA-384" },
  { alg: "RS512", family: "RSA", label: "RSA PKCS#1 v1.5 + SHA-512" },
  { alg: "PS256", family: "RSA", label: "RSA-PSS + SHA-256" },
  { alg: "PS384", family: "RSA", label: "RSA-PSS + SHA-384" },
  { alg: "PS512", family: "RSA", label: "RSA-PSS + SHA-512" },
  { alg: "ES256", family: "EC-P256", label: "ECDSA P-256 + SHA-256" },
  { alg: "ES384", family: "EC-P384", label: "ECDSA P-384 + SHA-384" },
  { alg: "EdDSA", family: "Ed25519", label: "EdDSA (Ed25519)" },
];

export function algInfo(alg: string): AlgInfo {
  return ALGORITHMS.find((a) => a.alg === alg) ?? ALGORITHMS[0];
}

/** Minimum recommended HMAC secret length in bytes (RFC 7518 §3.2). */
export function minHmacBytes(alg: string): number {
  return alg === "HS512" ? 64 : alg === "HS384" ? 48 : 32;
}

/** Algorithm to generate a key with, per family. */
const FAMILY_GEN_ALG: Record<Exclude<KeyFamily, "HMAC">, string> = {
  RSA: "RS256",
  "EC-P256": "ES256",
  "EC-P384": "ES384",
  Ed25519: "EdDSA",
};

/* ------------------------------------------------------------------ */
/* Keys                                                                */
/* ------------------------------------------------------------------ */

/** An asymmetric test key pair held as JWKs (re-imported per algorithm). */
export type TestKeyPair = {
  family: Exclude<KeyFamily, "HMAC">;
  privateJwk: JWK;
  publicJwk: JWK;
  /** RFC 7638 SHA-256 thumbprint of the public key — a good default `kid`. */
  thumbprint: string;
  /** Whether the key was generated here or imported by the user. */
  origin: "generated" | "imported";
};

const PRIVATE_JWK_FIELDS = ["d", "p", "q", "dp", "dq", "qi", "oth", "k"];
const METADATA_JWK_FIELDS = [
  "alg",
  "use",
  "key_ops",
  "kid",
  "ext",
  "x5c",
  "x5t",
  "x5t#S256",
  "x5u",
];

function stripFields(jwk: JWK, fields: string[]): JWK {
  const out: Record<string, unknown> = { ...jwk };
  for (const f of fields) delete out[f];
  return out as JWK;
}

function familyOfJwk(jwk: JWK): Exclude<KeyFamily, "HMAC"> {
  if (jwk.kty === "RSA") return "RSA";
  if (jwk.kty === "EC" && jwk.crv === "P-256") return "EC-P256";
  if (jwk.kty === "EC" && jwk.crv === "P-384") return "EC-P384";
  if (jwk.kty === "OKP" && jwk.crv === "Ed25519") return "Ed25519";
  throw new Error(
    `Unsupported key type (kty ${jwk.kty ?? "?"}${jwk.crv ? `, crv ${jwk.crv}` : ""}). Use RSA, EC P-256/P-384, or Ed25519.`,
  );
}

async function fromPrivateJwk(
  jwk: JWK,
  origin: TestKeyPair["origin"],
): Promise<TestKeyPair> {
  const family = familyOfJwk(jwk);
  const privateJwk = stripFields(jwk, METADATA_JWK_FIELDS);
  const publicJwk = stripFields(privateJwk, PRIVATE_JWK_FIELDS);
  const thumbprint = await calculateJwkThumbprint(publicJwk, "sha256");
  return { family, privateJwk, publicJwk, thumbprint, origin };
}

/** Generate a fresh, extractable key pair for an asymmetric family. */
export async function generateTestKeyPair(
  family: Exclude<KeyFamily, "HMAC">,
): Promise<TestKeyPair> {
  const { privateKey } = await generateKeyPair(FAMILY_GEN_ALG[family], {
    extractable: true,
    modulusLength: 2048,
  });
  return fromPrivateJwk(await exportJWK(privateKey), "generated");
}

/**
 * Import a user-supplied private key: a PKCS#8 PEM ("BEGIN PRIVATE KEY") or a
 * private JWK (JSON with a "d" member).
 */
export async function importTestKey(text: string): Promise<TestKeyPair> {
  const input = text.trim();
  if (!input) throw new Error("Paste a private key first.");
  if (input.startsWith("{")) {
    let jwk: JWK;
    try {
      jwk = JSON.parse(input) as JWK;
    } catch {
      throw new Error("That is not valid JSON.");
    }
    if ((jwk as { keys?: unknown }).keys)
      throw new Error("That is a JWKS. Paste a single private JWK instead.");
    if (!jwk.d)
      throw new Error(
        'This JWK has no private part ("d"). A private key is needed to sign.',
      );
    // Validate that WebCrypto accepts it before we keep it.
    const family = familyOfJwk(jwk);
    await importJWK(
      stripFields(jwk, METADATA_JWK_FIELDS),
      FAMILY_GEN_ALG[family],
    );
    return fromPrivateJwk(jwk, "imported");
  }
  if (/BEGIN (RSA|EC) PRIVATE KEY/.test(input))
    throw new Error(
      "This is a PKCS#1/SEC1 key. Convert it to PKCS#8 first: openssl pkcs8 -topk8 -nocrypt -in key.pem",
    );
  if (/BEGIN ENCRYPTED PRIVATE KEY/.test(input))
    throw new Error(
      "Encrypted keys are not supported. Decrypt it first: openssl pkcs8 -in key.pem",
    );
  if (!/BEGIN PRIVATE KEY/.test(input))
    throw new Error(
      "Paste a PKCS#8 PEM private key (-----BEGIN PRIVATE KEY-----) or a private JWK.",
    );
  // PKCS#8 does not say which JOSE alg it is for, so try each family.
  for (const alg of Object.values(FAMILY_GEN_ALG)) {
    try {
      const key = await importPKCS8(input, alg, { extractable: true });
      return fromPrivateJwk(await exportJWK(key), "imported");
    } catch {
      /* try the next family */
    }
  }
  throw new Error(
    "Could not read this private key. Supported: RSA, EC P-256/P-384, Ed25519.",
  );
}

/** Public JWK decorated for publishing in a JWKS. */
export function publishableJwk(kp: TestKeyPair, alg: string, kid: string): JWK {
  const jwk: JWK = { ...kp.publicJwk, use: "sig", alg };
  if (kid) jwk.kid = kid;
  return jwk;
}

export function jwksJson(kp: TestKeyPair, alg: string, kid: string): string {
  return JSON.stringify({ keys: [publishableJwk(kp, alg, kid)] }, null, 2);
}

export async function exportPems(
  kp: TestKeyPair,
): Promise<{ privatePem: string; publicPem: string }> {
  const alg = FAMILY_GEN_ALG[kp.family];
  const priv = await importJWK(kp.privateJwk, alg, { extractable: true });
  const pub = await importJWK(kp.publicJwk, alg, { extractable: true });
  return {
    privatePem: await exportPKCS8(priv as CryptoKey),
    publicPem: await exportSPKI(pub as CryptoKey),
  };
}

/** A random base64url secret sized for the given HMAC algorithm. */
export function randomHmacSecret(alg: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(minHmacBytes(alg)));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/* ------------------------------------------------------------------ */
/* Signing                                                             */
/* ------------------------------------------------------------------ */

export type JwtHeaderFields = { alg: string; typ: string; kid: string };

export function buildHeader(h: JwtHeaderFields): Record<string, string> {
  const header: Record<string, string> = { alg: h.alg };
  if (h.typ.trim()) header.typ = h.typ.trim();
  if (h.kid.trim()) header.kid = h.kid.trim();
  return header;
}

/**
 * Sign `payloadJson` (a JSON object string) as a compact JWS. For HMAC
 * algorithms `secret` is used as UTF-8 text — the same convention the JWT
 * decoder uses to verify.
 */
export async function signJwt(opts: {
  header: Record<string, string>;
  payload: Record<string, unknown>;
  secret?: string;
  keyPair?: TestKeyPair;
}): Promise<string> {
  const { header, payload } = opts;
  const info = algInfo(header.alg);
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const signer = new CompactSign(bytes).setProtectedHeader(header);
  if (info.family === "HMAC") {
    if (!opts.secret) throw new Error("Enter a secret to sign with.");
    return signer.sign(new TextEncoder().encode(opts.secret));
  }
  const kp = opts.keyPair;
  if (!kp) throw new Error("Generate or import a key pair to sign with.");
  if (kp.family !== info.family)
    throw new Error(
      `${header.alg} needs a ${info.family} key, but the current key is ${kp.family}.`,
    );
  const key = await importJWK(kp.privateJwk, header.alg);
  return signer.sign(key);
}

/* ------------------------------------------------------------------ */
/* Payload helpers                                                     */
/* ------------------------------------------------------------------ */

export type PresetId = "keycloak-access" | "keycloak-id" | "simple";

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: "keycloak-access", label: "Keycloak access token" },
  { id: "keycloak-id", label: "ID token" },
  { id: "simple", label: "Simple" },
];

const EXAMPLE_ISSUER = "https://auth.example.com/realms/example";

function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "00000000-0000-4000-8000-000000000000";
}

/** Build a preset payload with fresh ids and iat/exp relative to `nowSec`. */
export function presetPayload(
  id: PresetId,
  nowSec: number,
  ttlSec = 300,
): Record<string, unknown> {
  const sub = uuid();
  const sid = uuid();
  if (id === "simple") {
    return {
      sub: "1234567890",
      name: "Alice Example",
      iat: nowSec,
      exp: nowSec + ttlSec,
    };
  }
  if (id === "keycloak-id") {
    return {
      exp: nowSec + ttlSec,
      iat: nowSec,
      auth_time: nowSec,
      jti: uuid(),
      iss: EXAMPLE_ISSUER,
      aud: "my-app",
      sub,
      typ: "ID",
      azp: "my-app",
      nonce: "n-0S6_WzA2Mj",
      sid,
      at_hash: "77QmUPtjPfzWtF2AnpK9RQ",
      acr: "1",
      email_verified: true,
      name: "Alice Example",
      preferred_username: "alice",
      given_name: "Alice",
      family_name: "Example",
      email: "alice@example.com",
    };
  }
  return {
    exp: nowSec + ttlSec,
    iat: nowSec,
    auth_time: nowSec,
    jti: uuid(),
    iss: EXAMPLE_ISSUER,
    aud: "account",
    sub,
    typ: "Bearer",
    azp: "my-app",
    sid,
    acr: "1",
    "allowed-origins": ["https://app.example.com"],
    realm_access: {
      roles: ["default-roles-example", "offline_access", "uma_authorization"],
    },
    resource_access: {
      "my-app": { roles: ["app-admin", "billing"] },
      account: { roles: ["manage-account", "view-profile"] },
    },
    scope: "openid email profile",
    email_verified: true,
    name: "Alice Example",
    preferred_username: "alice",
    given_name: "Alice",
    family_name: "Example",
    email: "alice@example.com",
  };
}

export type ParsedPayload =
  { ok: true; value: Record<string, unknown> } | { ok: false; error: string };

export function parsePayload(text: string): ParsedPayload {
  if (!text.trim()) return { ok: false, error: "The payload is empty." };
  try {
    const v = JSON.parse(text) as unknown;
    if (v === null || typeof v !== "object" || Array.isArray(v))
      return {
        ok: false,
        error: "The payload must be a JSON object ({ ... }).",
      };
    return { ok: true, value: v as Record<string, unknown> };
  } catch (e) {
    return {
      ok: false,
      error: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export type TimeUnit = "minutes" | "hours" | "days";

export const UNIT_SECONDS: Record<TimeUnit, number> = {
  minutes: 60,
  hours: 3600,
  days: 86400,
};

/** Set iat = now and exp = now + amount·unit (and nbf = now if requested). */
export function applyTimes(
  payload: Record<string, unknown>,
  nowSec: number,
  opts: { expiresIn?: number; nbf?: boolean },
): Record<string, unknown> {
  const out = { ...payload, iat: nowSec };
  if (opts.expiresIn !== undefined) out.exp = nowSec + opts.expiresIn;
  if (opts.nbf) out.nbf = nowSec;
  else delete (out as Record<string, unknown>).nbf;
  return out;
}
