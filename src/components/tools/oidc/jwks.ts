/**
 * Framework-free JWKS analysis: per-key summaries (type, size, thumbprint,
 * certificate details) and lint findings for the set as a whole. Everything
 * runs locally via WebCrypto and `jose`; nothing here performs network I/O.
 */
import { calculateJwkThumbprint, type JWK } from "jose";
import type { Finding } from "./findings";
import { parseX509, base64ToBytes, type CertSummary } from "./x509";
import { base64UrlToBytes } from "../jwt/decode";

export type JwksKey = JWK & Record<string, unknown>;
export type Jwks = { keys: JwksKey[] };

export type KeySummary = {
  index: number;
  kid?: string;
  kty?: string;
  alg?: string;
  use?: string;
  keyOps?: string[];
  crv?: string;
  /** Key size in bits (RSA modulus, EC/OKP curve size). */
  bits?: number;
  /** Human description, e.g. "RSA 2048-bit" or "EC P-256". */
  strength?: string;
  /** RFC 7638 SHA-256 thumbprint (base64url). */
  thumbprint?: string;
  certs: (CertSummary | { error: string })[];
  findings: Finding[];
  raw: JwksKey;
};

export type JwksSummary = {
  keys: KeySummary[];
  /** Findings that apply to the whole set (structure, duplicates). */
  findings: Finding[];
  /** True when the input was structurally a JWKS (`{ keys: [...] }`). */
  valid: boolean;
};

const PRIVATE_MEMBERS = ["d", "p", "q", "dp", "dq", "qi", "oth", "k"];

const CURVE_BITS: Record<string, number> = {
  "P-256": 256,
  "P-384": 384,
  "P-521": 521,
  secp256k1: 256,
  Ed25519: 256,
  Ed448: 448,
  X25519: 256,
  X448: 448,
};

/** Which key types each JWS/JWE `alg` prefix requires. */
function expectedKty(alg: string): string | undefined {
  if (/^(RS|PS)\d{3}$/.test(alg) || /^RSA(1_5|-OAEP)/.test(alg)) return "RSA";
  if (/^ES\d{3}K?$/.test(alg) || alg.startsWith("ECDH-ES")) return "EC";
  if (alg === "EdDSA" || alg === "Ed25519" || alg === "Ed448") return "OKP";
  if (/^HS\d{3}$/.test(alg) || /^A\d{3}(KW|GCMKW)$/.test(alg) || alg === "dir")
    return "oct";
  return undefined;
}

function rsaBits(n: unknown): number | undefined {
  if (typeof n !== "string" || !n) return undefined;
  try {
    const bytes = base64UrlToBytes(n);
    let i = 0;
    while (i < bytes.length && bytes[i] === 0) i++;
    if (i >= bytes.length) return 0;
    const lead = bytes[i] ?? 0;
    return (bytes.length - i - 1) * 8 + (32 - Math.clz32(lead));
  } catch {
    return undefined;
  }
}

async function sha256B64Url(bytes: Uint8Array): Promise<string | undefined> {
  if (typeof crypto === "undefined" || !crypto.subtle) return undefined;
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", bytes as BufferSource),
  );
  let bin = "";
  for (const b of digest) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Normalize input: accept a JWKS, a single JWK, or `{ jwks: {...} }`. */
export function coerceJwks(data: unknown): {
  jwks?: Jwks;
  note?: string;
  error?: string;
} {
  if (!isObject(data)) return { error: "Expected a JSON object." };
  if (Array.isArray(data.keys)) return { jwks: data as unknown as Jwks };
  if (isObject(data.jwks) && Array.isArray(data.jwks.keys))
    return {
      jwks: data.jwks as unknown as Jwks,
      note: "Read keys from the embedded `jwks` member.",
    };
  if (typeof data.kty === "string")
    return {
      jwks: { keys: [data as JwksKey] },
      note: "Input was a single JWK, not a JWK Set — analyzed it as a one-key set.",
    };
  if (typeof data.jwks_uri === "string")
    return {
      error:
        "This looks like an OIDC discovery document, not a JWKS. Fetch its jwks_uri instead, or use the OIDC Discovery Inspector.",
    };
  return { error: 'Not a JWKS — expected an object with a "keys" array.' };
}

async function summarizeKey(
  raw: JwksKey,
  index: number,
  now: number,
): Promise<KeySummary> {
  const findings: Finding[] = [];
  const kid = typeof raw.kid === "string" ? raw.kid : undefined;
  const kty = typeof raw.kty === "string" ? raw.kty : undefined;
  const alg = typeof raw.alg === "string" ? raw.alg : undefined;
  const use = typeof raw.use === "string" ? raw.use : undefined;
  const crv = typeof raw.crv === "string" ? raw.crv : undefined;
  const keyOps = Array.isArray(raw.key_ops)
    ? raw.key_ops.filter((o): o is string => typeof o === "string")
    : undefined;

  if (!kty)
    findings.push({
      severity: "error",
      rule: "kty-missing",
      title: "Missing kty",
      detail: "Every JWK must declare its key type (RSA, EC, OKP, or oct).",
    });
  if (!kid)
    findings.push({
      severity: "warning",
      rule: "kid-missing",
      title: "Missing kid",
      detail:
        "Without a key ID, verifiers cannot pick the right key from the set and key rotation becomes fragile.",
    });
  if (!use && !keyOps)
    findings.push({
      severity: "warning",
      rule: "use-missing",
      title: "Missing use",
      detail:
        'Set "use": "sig" for signing keys or "enc" for encryption keys so clients do not try the wrong key.',
    });
  if (use && use !== "sig" && use !== "enc")
    findings.push({
      severity: "warning",
      rule: "use-unknown",
      title: `Unknown use "${use}"`,
      detail: 'The registered values are "sig" and "enc".',
    });
  if (!alg)
    findings.push({
      severity: "info",
      rule: "alg-missing",
      title: "Missing alg",
      detail:
        "alg is optional, but declaring it pins the key to one algorithm and blocks algorithm-confusion attacks.",
    });

  const priv = PRIVATE_MEMBERS.filter((m) => m in raw);
  if (priv.length)
    findings.push({
      severity: "error",
      rule: "private-material",
      title: `Contains private key material (${priv.join(", ")})`,
      detail:
        kty === "oct"
          ? "Symmetric (oct) keys are secrets and must never appear in a published JWKS."
          : "A public JWKS must only contain public parameters. Rotate this key immediately — treat it as compromised.",
    });

  if (alg && kty) {
    const want = expectedKty(alg);
    if (want && want !== kty)
      findings.push({
        severity: "error",
        rule: "alg-kty-mismatch",
        title: `alg ${alg} does not match kty ${kty}`,
        detail: `${alg} requires a ${want} key.`,
      });
  }
  if (alg?.toLowerCase() === "none")
    findings.push({
      severity: "error",
      rule: "alg-none",
      title: 'alg "none" on a key',
      detail: "Unsigned tokens are trivially forgeable.",
    });

  let bits: number | undefined;
  let strength: string | undefined;
  if (kty === "RSA") {
    bits = rsaBits(raw.n);
    if (bits === undefined || typeof raw.e !== "string")
      findings.push({
        severity: "error",
        rule: "rsa-params",
        title: "RSA key is missing n or e",
      });
    else {
      strength = `RSA ${bits}-bit`;
      if (bits < 2048)
        findings.push({
          severity: "error",
          rule: "rsa-weak",
          title: `Weak RSA key (${bits} bits)`,
          detail:
            "RSA keys shorter than 2048 bits are considered breakable. Generate a 2048-bit (or larger) key and rotate.",
        });
    }
  } else if (kty === "EC" || kty === "OKP") {
    if (!crv)
      findings.push({
        severity: "error",
        rule: "crv-missing",
        title: `${kty} key is missing crv`,
      });
    else {
      bits = CURVE_BITS[crv];
      strength = `${kty} ${crv}`;
    }
  } else if (kty === "oct") {
    strength = "Symmetric (oct)";
  } else if (kty) {
    findings.push({
      severity: "warning",
      rule: "kty-unknown",
      title: `Unrecognized kty "${kty}"`,
    });
  }

  let thumbprint: string | undefined;
  try {
    if (kty) thumbprint = await calculateJwkThumbprint(raw as JWK, "sha256");
  } catch {
    // Missing required members; already reported above.
  }

  const certs: KeySummary["certs"] = [];
  if (raw.x5c !== undefined) {
    if (!Array.isArray(raw.x5c) || raw.x5c.length === 0) {
      findings.push({
        severity: "warning",
        rule: "x5c-shape",
        title: "x5c is not a non-empty array",
      });
    } else {
      raw.x5c.forEach((c, i) => {
        if (typeof c !== "string") {
          certs.push({ error: "Not a string" });
          return;
        }
        try {
          const cert = parseX509(c);
          certs.push(cert);
          const which = i === 0 ? "Certificate" : `Chain certificate #${i + 1}`;
          if (cert.notAfter && cert.notAfter.getTime() < now)
            findings.push({
              severity: i === 0 ? "error" : "warning",
              rule: "x5c-expired",
              title: `${which} expired ${cert.notAfter.toISOString().slice(0, 10)}`,
              detail:
                "Many libraries ignore x5c validity, but some reject expired certificates outright. Rotate the key or reissue the certificate.",
            });
          else if (cert.notBefore && cert.notBefore.getTime() > now)
            findings.push({
              severity: "warning",
              rule: "x5c-not-yet-valid",
              title: `${which} is not valid until ${cert.notBefore.toISOString().slice(0, 10)}`,
            });
          else if (
            cert.notAfter &&
            cert.notAfter.getTime() - now < 30 * 86_400_000
          )
            findings.push({
              severity: "warning",
              rule: "x5c-expiring",
              title: `${which} expires soon (${cert.notAfter.toISOString().slice(0, 10)})`,
            });
          if (/SHA1/i.test(cert.signatureAlgorithm))
            findings.push({
              severity: "warning",
              rule: "x5c-sha1",
              title: `${which} is signed with SHA-1`,
            });
        } catch (e) {
          certs.push({ error: e instanceof Error ? e.message : String(e) });
          findings.push({
            severity: "warning",
            rule: "x5c-parse",
            title: `Could not parse x5c[${i}] as an X.509 certificate`,
          });
        }
      });

      const leaf = raw.x5c[0];
      const declared = raw["x5t#S256"];
      if (typeof leaf === "string" && typeof declared === "string") {
        try {
          const actual = await sha256B64Url(base64ToBytes(leaf));
          if (actual && actual !== declared)
            findings.push({
              severity: "error",
              rule: "x5t-mismatch",
              title: "x5t#S256 does not match the x5c certificate",
            });
        } catch {
          // parse errors already reported
        }
      }
    }
  }

  return {
    index,
    kid,
    kty,
    alg,
    use,
    keyOps,
    crv,
    bits,
    strength,
    thumbprint,
    certs,
    findings,
    raw,
  };
}

/** Analyze a JWKS. `now` is injectable for deterministic tests. */
export async function summarizeJwks(
  data: unknown,
  now: number = Date.now(),
): Promise<JwksSummary> {
  const coerced = coerceJwks(data);
  if (!coerced.jwks)
    return {
      keys: [],
      valid: false,
      findings: [
        {
          severity: "error",
          rule: "not-jwks",
          title: coerced.error ?? "Not a JWKS.",
        },
      ],
    };

  const findings: Finding[] = [];
  if (coerced.note)
    findings.push({ severity: "info", rule: "coerced", title: coerced.note });

  const rawKeys = coerced.jwks.keys.filter(isObject) as JwksKey[];
  if (rawKeys.length !== coerced.jwks.keys.length)
    findings.push({
      severity: "error",
      rule: "key-not-object",
      title: "Some entries in keys are not JSON objects",
    });
  if (rawKeys.length === 0)
    findings.push({
      severity: "error",
      rule: "empty",
      title: "The key set is empty",
      detail: "Clients will be unable to verify any token.",
    });

  const keys = await Promise.all(
    rawKeys.map((k, i) => summarizeKey(k, i, now)),
  );

  // Duplicate kids. Same kid on keys that differ by use/kty is allowed by RFC
  // 7517 but still confuses many libraries, so it's a warning, not an error.
  const byKid = new Map<string, KeySummary[]>();
  for (const k of keys) {
    if (!k.kid) continue;
    byKid.set(k.kid, [...(byKid.get(k.kid) ?? []), k]);
  }
  for (const [kid, group] of byKid) {
    if (group.length < 2) continue;
    const distinguishable =
      new Set(group.map((k) => `${k.kty}|${k.use ?? ""}`)).size ===
      group.length;
    findings.push({
      severity: distinguishable ? "warning" : "error",
      rule: "kid-duplicate",
      title: `Duplicate kid "${kid}" (${group.length} keys)`,
      detail: distinguishable
        ? "The keys differ by type or use, which RFC 7517 permits, but many libraries pick the first match and fail."
        : "Verifiers cannot tell these keys apart. Each key needs a unique kid.",
    });
  }
  if (keys.length > 1 && keys.some((k) => !k.kid))
    findings.push({
      severity: "error",
      rule: "kid-missing-multi",
      title: "Multiple keys but not all have a kid",
      detail:
        "With more than one key, tokens must reference a kid so verifiers can select the right key.",
    });

  const sigKeys = keys.filter(
    (k) => k.use === "sig" || (!k.use && k.kty !== "oct"),
  );
  if (keys.length > 0 && sigKeys.length === 0)
    findings.push({
      severity: "warning",
      rule: "no-sig-keys",
      title: "No signing keys",
      detail:
        'All keys are marked "use": "enc". ID and access tokens cannot be verified with this set.',
    });

  if (
    keys.length > 0 &&
    findings.every((f) => f.severity === "info") &&
    keys.every((k) => k.findings.every((f) => f.severity === "info"))
  )
    findings.push({
      severity: "pass",
      rule: "ok",
      title: `${keys.length} key${keys.length === 1 ? "" : "s"}, no problems found`,
    });

  return { keys, findings, valid: true };
}

/** Choose the key(s) a token header points to. */
export function matchKeyForHeader(
  summary: JwksSummary,
  header: Record<string, unknown> | undefined,
): { kid?: string; alg?: string; matches: KeySummary[]; reason: string } {
  const kid = typeof header?.kid === "string" ? header.kid : undefined;
  const alg = typeof header?.alg === "string" ? header.alg : undefined;
  if (!header)
    return { matches: [], reason: "Could not read the token header." };
  if (kid) {
    const matches = summary.keys.filter((k) => k.kid === kid);
    return {
      kid,
      alg,
      matches,
      reason: matches.length
        ? `Token kid "${kid}" matches key #${matches.map((m) => m.index + 1).join(", #")}.`
        : `No key in this set has kid "${kid}". The key may have been rotated out, or the token was issued by a different realm or issuer.`,
    };
  }
  const want = alg ? expectedKty(alg) : undefined;
  const matches = summary.keys.filter(
    (k) => k.use !== "enc" && (!want || k.kty === want),
  );
  return {
    alg,
    matches,
    reason: `The token has no kid; ${matches.length} candidate key${matches.length === 1 ? "" : "s"} could verify a ${alg ?? "signed"} token.`,
  };
}
