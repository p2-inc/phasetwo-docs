/**
 * Turn whatever the user pasted or uploaded into DER certificate bytes.
 * Accepts PEM (one or many blocks), a bare base64 body (as found in SAML
 * metadata or Keycloak's realm Keys tab), SAML metadata XML containing
 * <X509Certificate> elements, or raw DER bytes from a file.
 */
import { base64ToBytes, bytesToBase64 } from "./der";
import { parseCertificate, type Certificate } from "./x509";

export type ParsedInput = {
  certs: Certificate[];
  errors: string[];
  /** Where the certificates were found, for a friendly status line. */
  source?: "pem" | "base64" | "saml-xml" | "der";
};

const PEM_RE = /-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g;

function tryParse(der: Uint8Array, label: string, out: ParsedInput) {
  try {
    out.certs.push(parseCertificate(der));
  } catch (e) {
    out.errors.push(`${label}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function parseText(text: string): ParsedInput {
  const out: ParsedInput = { certs: [], errors: [] };
  const input = text.trim();
  if (!input) return out;

  const blocks = Array.from(input.matchAll(PEM_RE));
  if (blocks.length > 0) {
    out.source = "pem";
    blocks.forEach((m, idx) => {
      const type = m[1];
      const label = `Block ${idx + 1}`;
      if (/PRIVATE KEY/.test(type)) {
        out.errors.push(
          `${label} is a private key. This tool only decodes certificates — never share private keys, and rotate this one if it is real.`,
        );
        return;
      }
      if (!/CERTIFICATE$/.test(type) || /REQUEST/.test(type)) {
        out.errors.push(
          `${label} is a "${type}", not a certificate — skipped.`,
        );
        return;
      }
      try {
        tryParse(base64ToBytes(m[2]), label, out);
      } catch (e) {
        out.errors.push(
          `${label}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
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
    xmlCerts.forEach((m, idx) => {
      try {
        tryParse(base64ToBytes(m[1]), `Certificate ${idx + 1}`, out);
      } catch (e) {
        out.errors.push(
          `Certificate ${idx + 1}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    });
    return out;
  }

  // A bare base64 body (no BEGIN/END lines).
  if (/^[A-Za-z0-9+/=\s_-]+$/.test(input)) {
    out.source = "base64";
    try {
      out.certs.push(parseCertificate(base64ToBytes(input)));
    } catch (e) {
      out.errors.push(
        `That doesn't look like a base64-encoded certificate (${e instanceof Error ? e.message : String(e)}).`,
      );
    }
    return out;
  }

  out.errors.push(
    "Could not find a certificate. Paste a PEM block (-----BEGIN CERTIFICATE-----), a bare base64 certificate, or SAML metadata XML.",
  );
  return out;
}

/** Handle an uploaded file: binary DER, or text in any of the forms above. */
export function parseFileBytes(bytes: Uint8Array): ParsedInput {
  // DER certificates start with a SEQUENCE tag (0x30) and a long-form length.
  if (bytes[0] === 0x30 && (bytes[1] & 0x80) !== 0) {
    const out: ParsedInput = { certs: [], errors: [], source: "der" };
    tryParse(bytes, "File", out);
    return out;
  }
  return parseText(new TextDecoder().decode(bytes));
}

/** Wrap DER bytes as a PEM certificate. */
export function toPem(der: Uint8Array): string {
  const b64 = bytesToBase64(der);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN CERTIFICATE-----\n${lines.join("\n")}\n-----END CERTIFICATE-----`;
}

/** Single-line base64 body, as Keycloak and SAML metadata expect. */
export function toBase64Body(der: Uint8Array): string {
  return bytesToBase64(der);
}
