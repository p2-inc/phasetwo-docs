/**
 * Client-side JWT signature verification, built on `jose`.
 *
 * We use `compactVerify` (signature-only) rather than `jwtVerify` so that a
 * structurally-expired token can still have its signature checked — expiry is
 * surfaced separately by the decoder. All crypto runs via the browser's
 * WebCrypto; nothing is sent anywhere except an optional fetch to a JWKS URL
 * the user explicitly provides.
 */
import {
  compactVerify,
  importSPKI,
  importX509,
  createRemoteJWKSet,
} from "jose";
import { base64UrlDecode } from "./decode";

export type VerifyStatus = "valid" | "invalid" | "error";

export type VerifyResult = {
  status: VerifyStatus;
  message: string;
};

/** Read the `alg` from a token's header without fully parsing it. */
export function algFromToken(token: string): string | undefined {
  try {
    const header = JSON.parse(base64UrlDecode(token.split(".")[0] ?? "")) as {
      alg?: unknown;
    };
    return typeof header.alg === "string" ? header.alg : undefined;
  } catch {
    return undefined;
  }
}

function describeError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

/** Verify an HS256/384/512 token against a shared secret. */
export async function verifyHmac(
  token: string,
  secret: string,
): Promise<VerifyResult> {
  if (!secret)
    return { status: "error", message: "Enter the shared secret to verify." };
  try {
    await compactVerify(token, new TextEncoder().encode(secret));
    return {
      status: "valid",
      message: "Signature is valid for the provided secret.",
    };
  } catch (e) {
    return {
      status: "invalid",
      message: `Signature does not match the provided secret (${describeError(e)}).`,
    };
  }
}

/**
 * Verify an RS/ES/PS token against a PEM public key or X.509 certificate.
 */
export async function verifyPublicKey(
  token: string,
  pem: string,
): Promise<VerifyResult> {
  const alg = algFromToken(token);
  if (!alg)
    return {
      status: "error",
      message: "Could not read the token's algorithm.",
    };
  const trimmed = pem.trim();
  if (!trimmed)
    return {
      status: "error",
      message: "Paste a public key or certificate (PEM).",
    };
  try {
    const key = trimmed.includes("CERTIFICATE")
      ? await importX509(trimmed, alg)
      : await importSPKI(trimmed, alg);
    await compactVerify(token, key);
    return {
      status: "valid",
      message: "Signature is valid for the provided key.",
    };
  } catch (e) {
    return {
      status: "invalid",
      message: `Could not verify against this key (${describeError(e)}). Check the key format and algorithm.`,
    };
  }
}

/**
 * Verify against a remote JWKS endpoint, matching the token's `kid`. The fetch
 * is subject to the JWKS host's CORS policy — if it blocks browser requests,
 * verification will fail with a network error (noted in the message).
 */
export async function verifyJwks(
  token: string,
  jwksUri: string,
): Promise<VerifyResult> {
  const uri = jwksUri.trim();
  if (!uri) return { status: "error", message: "Enter a JWKS URL to verify." };
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return { status: "error", message: "That is not a valid URL." };
  }
  try {
    const JWKS = createRemoteJWKSet(url);
    await compactVerify(token, JWKS);
    return {
      status: "valid",
      message: "Signature is valid against a key from the JWKS.",
    };
  } catch (e) {
    return {
      status: "error",
      message: `Could not verify against the JWKS (${describeError(e)}). If this is a network/CORS error, the JWKS host may block browser requests — verify from a server instead.`,
    };
  }
}

/**
 * Suggest the JWKS URL for a Keycloak-style issuer, e.g.
 * https://host/auth/realms/foo -> https://host/auth/realms/foo/protocol/openid-connect/certs
 */
export function suggestJwksUrl(iss: unknown): string | undefined {
  if (typeof iss !== "string" || !iss) return undefined;
  if (!/\/realms\/[^/]+\/?$/.test(iss)) return undefined;
  return `${iss.replace(/\/$/, "")}/protocol/openid-connect/certs`;
}
