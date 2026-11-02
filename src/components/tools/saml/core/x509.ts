/**
 * Just enough DER / X.509 parsing to pull the public key, subject, issuer,
 * and validity out of a certificate, plus loading trusted keys from PEM,
 * bare base64, or SAML metadata.
 */

import { base64ToBytes } from "./decode.ts";
import { NS } from "./explain.ts";
import {
  attr,
  descendants,
  parseXml,
  textContent,
  type XmlElement,
} from "./xml.ts";

type Tlv = { tag: number; start: number; contentStart: number; end: number };

function readTlv(buf: Uint8Array, offset: number): Tlv {
  if (offset + 2 > buf.length) throw new Error("Truncated DER.");
  const tag = buf[offset];
  let len = buf[offset + 1];
  let p = offset + 2;
  if (len & 0x80) {
    const n = len & 0x7f;
    if (n === 0 || n > 4) throw new Error("Unsupported DER length.");
    len = 0;
    for (let i = 0; i < n; i++) len = len * 256 + buf[p++];
  }
  const end = p + len;
  if (end > buf.length) throw new Error("Truncated DER.");
  return { tag, start: offset, contentStart: p, end };
}

function children(buf: Uint8Array, parent: Tlv): Tlv[] {
  const out: Tlv[] = [];
  for (let p = parent.contentStart; p < parent.end;) {
    const t = readTlv(buf, p);
    out.push(t);
    p = t.end;
  }
  return out;
}

function oid(buf: Uint8Array, t: Tlv): string {
  const b = buf.subarray(t.contentStart, t.end);
  const parts: number[] = [Math.floor(b[0] / 40), b[0] % 40];
  let v = 0;
  for (let i = 1; i < b.length; i++) {
    v = v * 128 + (b[i] & 0x7f);
    if (!(b[i] & 0x80)) {
      parts.push(v);
      v = 0;
    }
  }
  return parts.join(".");
}

function str(buf: Uint8Array, t: Tlv): string {
  const b = buf.subarray(t.contentStart, t.end);
  if (t.tag === 0x1e) {
    let s = "";
    for (let i = 0; i + 1 < b.length; i += 2)
      s += String.fromCharCode((b[i] << 8) | b[i + 1]);
    return s;
  }
  if (t.tag === 0x14)
    return Array.from(b, (c) => String.fromCharCode(c)).join("");
  return new TextDecoder().decode(b);
}

function time(buf: Uint8Array, t: Tlv): number | undefined {
  const s = new TextDecoder().decode(buf.subarray(t.contentStart, t.end));
  const m =
    t.tag === 0x17
      ? /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/.exec(s)
      : /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:\.\d+)?Z$/.exec(s);
  if (!m) return undefined;
  let year = parseInt(m[1], 10);
  if (t.tag === 0x17) year += year < 50 ? 2000 : 1900;
  return Date.UTC(
    year,
    parseInt(m[2], 10) - 1,
    parseInt(m[3], 10),
    parseInt(m[4], 10),
    parseInt(m[5], 10),
    parseInt(m[6] ?? "0", 10),
  );
}

const NAME_OIDS: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "1.2.840.113549.1.9.1": "emailAddress",
  "0.9.2342.19200300.100.1.25": "DC",
};

function name(buf: Uint8Array, t: Tlv): string {
  const parts: string[] = [];
  for (const set of children(buf, t)) {
    for (const atv of children(buf, set)) {
      const [o, v] = children(buf, atv);
      if (!o || !v) continue;
      const k = oid(buf, o);
      parts.push(`${NAME_OIDS[k] ?? k}=${str(buf, v)}`);
    }
  }
  return parts.join(", ");
}

const CURVES: Record<string, "P-256" | "P-384" | "P-521"> = {
  "1.2.840.10045.3.1.7": "P-256",
  "1.3.132.0.34": "P-384",
  "1.3.132.0.35": "P-521",
};

export type PublicKeyInfo = {
  /** DER SubjectPublicKeyInfo, importable with WebCrypto `importKey("spki", …)`. */
  spki: Uint8Array;
  keyType: "RSA" | "EC" | "unsupported";
  namedCurve?: "P-256" | "P-384" | "P-521";
};

export type CertificateInfo = PublicKeyInfo & {
  der: Uint8Array;
  subject: string;
  issuer: string;
  /** Epoch milliseconds. */
  notBefore?: number;
  notAfter?: number;
  /** Uppercase hex, colon separated. */
  sha256Fingerprint: string;
  sha1Fingerprint: string;
};

function parseSpki(buf: Uint8Array, t: Tlv): PublicKeyInfo {
  const [algId] = children(buf, t);
  const [algOid, params] = children(buf, algId);
  const a = oid(buf, algOid);
  const spki = buf.slice(t.start, t.end);
  if (a === "1.2.840.113549.1.1.1") return { spki, keyType: "RSA" };
  if (a === "1.2.840.10045.2.1" && params && params.tag === 0x06) {
    const curve = CURVES[oid(buf, params)];
    if (curve) return { spki, keyType: "EC", namedCurve: curve };
  }
  return { spki, keyType: "unsupported" };
}

async function fingerprint(
  alg: "SHA-256" | "SHA-1",
  der: Uint8Array,
): Promise<string> {
  const d = new Uint8Array(
    await crypto.subtle.digest(alg, der as unknown as BufferSource),
  );
  return Array.from(d, (b) =>
    b.toString(16).padStart(2, "0").toUpperCase(),
  ).join(":");
}

/** Parse a DER-encoded X.509 certificate. */
export async function parseCertificate(
  der: Uint8Array,
): Promise<CertificateInfo> {
  const cert = readTlv(der, 0);
  if (cert.tag !== 0x30) throw new Error("Not a DER certificate.");
  const [tbs] = children(der, cert);
  if (!tbs || tbs.tag !== 0x30) throw new Error("Not a DER certificate.");
  const f = children(der, tbs);
  let i = f[0]?.tag === 0xa0 ? 1 : 0; // optional [0] version
  i++; // serialNumber
  i++; // signature AlgorithmIdentifier
  const issuer = f[i++];
  const validity = f[i++];
  const subject = f[i++];
  const spki = f[i++];
  if (!issuer || !validity || !subject || !spki || spki.tag !== 0x30)
    throw new Error("Malformed certificate.");
  const [nb, na] = children(der, validity);
  return {
    ...parseSpki(der, spki),
    der,
    subject: name(der, subject),
    issuer: name(der, issuer),
    notBefore: nb ? time(der, nb) : undefined,
    notAfter: na ? time(der, na) : undefined,
    sha256Fingerprint: await fingerprint("SHA-256", der),
    sha1Fingerprint: await fingerprint("SHA-1", der),
  };
}

export type TrustedKey = PublicKeyInfo & {
  /** Where the key came from, e.g. "Certificate 1" or "IdP metadata signing certificate". */
  label: string;
  certificate?: CertificateInfo;
};

export type TrustInputResult = {
  keys: TrustedKey[];
  errors: string[];
  source: "pem" | "base64" | "metadata" | "none";
};

async function keyFromDer(der: Uint8Array, label: string): Promise<TrustedKey> {
  try {
    const certificate = await parseCertificate(der);
    return {
      label,
      certificate,
      spki: certificate.spki,
      keyType: certificate.keyType,
      namedCurve: certificate.namedCurve,
    };
  } catch {
    const t = readTlv(der, 0);
    return { label, ...parseSpki(der, t) };
  }
}

/**
 * Load the keys to verify against from a PEM certificate / public key, a bare
 * base64 certificate (as shown in Keycloak's admin console and in metadata),
 * or SAML metadata XML (every signing `KeyDescriptor` is used).
 */
export async function parseTrustInput(text: string): Promise<TrustInputResult> {
  const s = (text ?? "").trim();
  const errors: string[] = [];
  const keys: TrustedKey[] = [];
  if (!s)
    return {
      keys,
      errors: ["Paste a certificate or metadata."],
      source: "none",
    };

  if (s.startsWith("<")) {
    let root: XmlElement;
    try {
      root = parseXml(s).root;
    } catch (e) {
      return {
        keys,
        errors: [`Metadata is not valid XML: ${(e as Error).message}`],
        source: "metadata",
      };
    }
    const kds = descendants(root, NS.METADATA, "KeyDescriptor").filter((kd) => {
      const use = attr(kd, "use");
      return !use || use === "signing";
    });
    const certEls = kds.length
      ? kds.flatMap((kd) => descendants(kd, NS.DSIG, "X509Certificate"))
      : descendants(root, NS.DSIG, "X509Certificate");
    let n = 0;
    for (const el of certEls) {
      n++;
      const role = roleOf(el);
      try {
        keys.push(
          await keyFromDer(
            base64ToBytes(textContent(el)),
            `${role} signing certificate ${n}`,
          ),
        );
      } catch (e) {
        errors.push(`Certificate ${n}: ${(e as Error).message}`);
      }
    }
    if (!certEls.length)
      errors.push("No signing certificates found in the metadata.");
    return { keys, errors, source: "metadata" };
  }

  const pem = [
    ...s.matchAll(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/g),
  ];
  if (pem.length) {
    let n = 0;
    for (const m of pem) {
      n++;
      const kind = m[1];
      if (kind !== "CERTIFICATE" && kind !== "PUBLIC KEY") {
        errors.push(
          `Ignored a "${kind}" block — paste the IdP's certificate or public key, never a private key.`,
        );
        continue;
      }
      try {
        keys.push(
          await keyFromDer(
            base64ToBytes(m[2]),
            kind === "CERTIFICATE" ? `Certificate ${n}` : `Public key ${n}`,
          ),
        );
      } catch (e) {
        errors.push(`Block ${n}: ${(e as Error).message}`);
      }
    }
    return { keys, errors, source: "pem" };
  }

  try {
    keys.push(await keyFromDer(base64ToBytes(s), "Certificate"));
  } catch {
    errors.push(
      "Could not read a certificate. Paste a PEM certificate, a bare base64 certificate, or IdP metadata XML.",
    );
  }
  return { keys, errors, source: "base64" };
}

function roleOf(el: XmlElement): string {
  for (let p = el.parent; p; p = p.parent) {
    if (p.namespaceURI !== NS.METADATA) continue;
    if (p.localName === "IDPSSODescriptor") return "IdP";
    if (p.localName === "SPSSODescriptor") return "SP";
  }
  return "Metadata";
}
