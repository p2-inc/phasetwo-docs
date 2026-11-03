/**
 * Turn whatever the user pasted or uploaded into parsed certificates and
 * certificate signing requests. Accepts PEM (one or many blocks), a bare
 * base64 body (as found in SAML metadata or Keycloak's realm Keys tab), SAML
 * metadata XML containing <X509Certificate> elements, or raw DER bytes from a
 * file. Private keys are detected and refused in every form.
 */
import {
  type Asn1,
  TAG,
  base64ToBytes,
  bytesToBase64,
  isContext,
  isUniversal,
  parseDer,
} from "./der.ts";
import {
  looksLikeCsr,
  parseCertificate,
  parseCsr,
  type Certificate,
  type CertificateRequest,
} from "./x509.ts";

export type ParsedInput = {
  certs: Certificate[];
  csrs: CertificateRequest[];
  errors: string[];
  /** Where the input was found, for a friendly status line. */
  source?: "pem" | "base64" | "saml-xml" | "der";
};

const PEM_RE = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g;

const PRIVATE_KEY_MSG =
  "is a private key. This tool only decodes certificates and certificate signing requests — never share private keys, and rotate this one if it is real.";

/**
 * Recognize unencrypted private-key structures: PKCS#8 PrivateKeyInfo,
 * PKCS#1 RSAPrivateKey, and SEC1 ECPrivateKey.
 */
export function looksLikePrivateKey(root: Asn1): boolean {
  if (!isUniversal(root, TAG.SEQUENCE)) return false;
  const c = root.children;
  if (!isUniversal(c[0], TAG.INTEGER)) return false;
  const v = c[0].value;
  // PKCS#8: version, AlgorithmIdentifier, OCTET STRING privateKey
  if (
    isUniversal(c[1], TAG.SEQUENCE) &&
    isUniversal(c[1].children[0], TAG.OID) &&
    isUniversal(c[2], TAG.OCTET_STRING)
  )
    return true;
  // PKCS#1: version 0 followed by eight INTEGERs (n, e, d, p, q, dp, dq, qi)
  if (c.length >= 9 && c.every((n) => isUniversal(n, TAG.INTEGER))) return true;
  // SEC1: version 1, OCTET STRING, optional [0] params / [1] public key
  if (
    v.length === 1 &&
    v[0] === 1 &&
    isUniversal(c[1], TAG.OCTET_STRING) &&
    (c.length === 2 || isContext(c[2], 0) || isContext(c[2], 1))
  )
    return true;
  return false;
}

function errText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Parse DER as whichever of certificate / CSR it is (or refuse a key). */
function parseAnyDer(der: Uint8Array, label: string, out: ParsedInput) {
  let root: Asn1;
  try {
    root = parseDer(der);
  } catch (e) {
    out.errors.push(`${label}: ${errText(e)}`);
    return;
  }
  if (looksLikePrivateKey(root)) {
    out.errors.push(`${label} ${PRIVATE_KEY_MSG}`);
    return;
  }
  try {
    if (looksLikeCsr(root)) out.csrs.push(parseCsr(der));
    else out.certs.push(parseCertificate(der));
  } catch (e) {
    out.errors.push(`${label}: ${errText(e)}`);
  }
}

function decodeB64(b64: string, label: string, out: ParsedInput) {
  let der: Uint8Array;
  try {
    der = base64ToBytes(b64);
  } catch (e) {
    out.errors.push(`${label}: ${errText(e)}`);
    return;
  }
  parseAnyDer(der, label, out);
}

export function parseText(text: string): ParsedInput {
  const out: ParsedInput = { certs: [], csrs: [], errors: [] };
  const input = text.trim();
  if (!input) return out;

  const blocks = Array.from(input.matchAll(PEM_RE));
  if (blocks.length > 0) {
    out.source = "pem";
    blocks.forEach((m, idx) => {
      const type = m[1];
      const label = `Block ${idx + 1}`;
      if (/PRIVATE KEY/.test(type)) {
        out.errors.push(`${label} ${PRIVATE_KEY_MSG}`);
        return;
      }
      if (!/CERTIFICATE( REQUEST)?$/.test(type)) {
        out.errors.push(
          `${label} is a "${type}", not a certificate or certificate request — skipped.`,
        );
        return;
      }
      decodeB64(m[2], label, out);
    });
    return out;
  }

  // SAML metadata or an XML signature: pull out every <X509Certificate>.
  const xmlCerts = Array.from(
    input.matchAll(
      /<(?:[\w-]+:)?X509Certificate[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?X509Certificate>/g,
    ),
  );
  if (xmlCerts.length > 0) {
    out.source = "saml-xml";
    xmlCerts.forEach((m, idx) =>
      decodeB64(m[1], `Certificate ${idx + 1}`, out),
    );
    return out;
  }

  // A bare base64 body (no BEGIN/END lines).
  if (/^[A-Za-z0-9+/=\s_-]+$/.test(input)) {
    out.source = "base64";
    const before = out.errors.length;
    decodeB64(input, "Input", out);
    if (
      out.errors.length > before &&
      !out.errors[out.errors.length - 1].includes("private key")
    )
      out.errors[out.errors.length - 1] =
        `That doesn't look like a base64-encoded certificate or CSR (${out.errors[out.errors.length - 1].replace(/^Input: /, "")}).`;
    return out;
  }

  out.errors.push(
    "Could not find a certificate. Paste a PEM block (-----BEGIN CERTIFICATE----- or CERTIFICATE REQUEST), a bare base64 certificate, or SAML metadata XML.",
  );
  return out;
}

/** True for binary DER: a single SEQUENCE spanning the whole buffer. */
export function isBinaryDer(bytes: Uint8Array): boolean {
  if (bytes[0] !== 0x30) return false;
  try {
    parseDer(bytes);
    return true;
  } catch {
    return false;
  }
}

/** Handle an uploaded file: binary DER, or text in any of the forms above. */
export function parseFileBytes(bytes: Uint8Array): ParsedInput {
  if (isBinaryDer(bytes)) {
    const out: ParsedInput = { certs: [], csrs: [], errors: [], source: "der" };
    parseAnyDer(bytes, "File", out);
    return out;
  }
  return parseText(new TextDecoder().decode(bytes));
}

/** Wrap DER bytes as PEM with the given label (default CERTIFICATE). */
export function toPem(der: Uint8Array, label = "CERTIFICATE"): string {
  const b64 = bytesToBase64(der);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

/**
 * Convert an uploaded binary DER file to PEM text with the right label.
 * Returns null for private keys so they are never echoed into the page.
 */
export function derFileToPem(bytes: Uint8Array): string | null {
  try {
    const root = parseDer(bytes);
    if (looksLikePrivateKey(root)) return null;
    return toPem(
      bytes,
      looksLikeCsr(root) ? "CERTIFICATE REQUEST" : "CERTIFICATE",
    );
  } catch {
    return toPem(bytes);
  }
}

/** Single-line base64 body, as Keycloak and SAML metadata expect. */
export function toBase64Body(der: Uint8Array): string {
  return bytesToBase64(der);
}
