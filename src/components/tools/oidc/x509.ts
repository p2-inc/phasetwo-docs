/**
 * Minimal, dependency-free X.509 certificate reader for `x5c` entries in a
 * JWKS. It walks just enough DER to pull out the subject, issuer, validity
 * window, serial, and signature algorithm — enough for a human summary and
 * an expiry check. It does not validate the certificate chain.
 */

export type CertSummary = {
  subject: string;
  issuer: string;
  serialHex: string;
  notBefore?: Date;
  notAfter?: Date;
  signatureAlgorithm: string;
  selfSigned: boolean;
};

type Tlv = {
  tag: number;
  /** Offset of the first content byte. */
  start: number;
  /** Offset one past the last content byte. */
  end: number;
};

function readTlv(buf: Uint8Array, pos: number): Tlv {
  const tag = buf[pos];
  let len = buf[pos + 1];
  let start = pos + 2;
  if (tag === undefined || len === undefined) throw new Error("Truncated DER");
  if (len & 0x80) {
    const n = len & 0x7f;
    if (n === 0 || n > 4) throw new Error("Unsupported DER length");
    len = 0;
    for (let i = 0; i < n; i++) len = (len << 8) | (buf[start + i] ?? 0);
    start += n;
  }
  const end = start + len;
  if (end > buf.length) throw new Error("Truncated DER");
  return { tag, start, end };
}

/** Return the direct children of a constructed TLV. */
function children(buf: Uint8Array, parent: Tlv): Tlv[] {
  const out: Tlv[] = [];
  let pos = parent.start;
  while (pos < parent.end) {
    const t = readTlv(buf, pos);
    out.push(t);
    pos = t.end;
  }
  return out;
}

function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const first = bytes[0] ?? 0;
  const parts = [Math.floor(first / 40), first % 40];
  let value = 0;
  for (let i = 1; i < bytes.length; i++) {
    const b = bytes[i] ?? 0;
    value = value * 128 + (b & 0x7f);
    if (!(b & 0x80)) {
      parts.push(value);
      value = 0;
    }
  }
  return parts.join(".");
}

const NAME_OIDS: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "2.5.4.5": "serialNumber",
  "0.9.2342.19200300.100.1.25": "DC",
  "1.2.840.113549.1.9.1": "emailAddress",
};

const SIG_OIDS: Record<string, string> = {
  "1.2.840.113549.1.1.5": "SHA1withRSA",
  "1.2.840.113549.1.1.11": "SHA256withRSA",
  "1.2.840.113549.1.1.12": "SHA384withRSA",
  "1.2.840.113549.1.1.13": "SHA512withRSA",
  "1.2.840.113549.1.1.10": "RSASSA-PSS",
  "1.2.840.10045.4.3.2": "SHA256withECDSA",
  "1.2.840.10045.4.3.3": "SHA384withECDSA",
  "1.2.840.10045.4.3.4": "SHA512withECDSA",
  "1.3.101.112": "Ed25519",
  "1.3.101.113": "Ed448",
};

function decodeString(buf: Uint8Array, t: Tlv): string {
  const bytes = buf.subarray(t.start, t.end);
  // BMPString (UTF-16BE)
  if (t.tag === 0x1e) {
    let s = "";
    for (let i = 0; i + 1 < bytes.length; i += 2)
      s += String.fromCharCode(((bytes[i] ?? 0) << 8) | (bytes[i + 1] ?? 0));
    return s;
  }
  return new TextDecoder().decode(bytes);
}

function decodeName(buf: Uint8Array, name: Tlv): string {
  const parts: string[] = [];
  for (const set of children(buf, name)) {
    for (const atv of children(buf, set)) {
      const [oidTlv, valTlv] = children(buf, atv);
      if (!oidTlv || !valTlv) continue;
      const oid = decodeOid(buf.subarray(oidTlv.start, oidTlv.end));
      parts.push(`${NAME_OIDS[oid] ?? oid}=${decodeString(buf, valTlv)}`);
    }
  }
  return parts.join(", ");
}

function decodeTime(buf: Uint8Array, t: Tlv): Date | undefined {
  const s = new TextDecoder().decode(buf.subarray(t.start, t.end));
  let m: RegExpMatchArray | null;
  if (t.tag === 0x17) {
    // UTCTime: YYMMDDHHMM[SS]Z
    m = s.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/);
    if (!m) return undefined;
    const yy = Number(m[1]);
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    return new Date(
      Date.UTC(
        year,
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4]),
        Number(m[5]),
        Number(m[6] ?? 0),
      ),
    );
  }
  if (t.tag === 0x18) {
    // GeneralizedTime: YYYYMMDDHHMMSS[.fff]Z
    m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/);
    if (!m) return undefined;
    return new Date(
      Date.UTC(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4]),
        Number(m[5]),
        Number(m[6]),
      ),
    );
  }
  return undefined;
}

/** Decode standard (not url-safe) base64, as used by `x5c`. */
export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/\s+/g, ""));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Parse one base64 DER certificate from an `x5c` array. Throws on bad input. */
export function parseX509(b64Der: string): CertSummary {
  const buf = base64ToBytes(b64Der);
  const cert = readTlv(buf, 0);
  const [tbs, sigAlg] = children(buf, cert);
  if (!tbs || !sigAlg) throw new Error("Not an X.509 certificate");
  const fields = children(buf, tbs);
  let i = 0;
  // Optional [0] EXPLICIT version
  if (fields[0]?.tag === 0xa0) i++;
  const serial = fields[i++];
  i++; // inner signature AlgorithmIdentifier
  const issuer = fields[i++];
  const validity = fields[i++];
  const subject = fields[i++];
  if (!serial || !issuer || !validity || !subject)
    throw new Error("Not an X.509 certificate");
  const [nb, na] = children(buf, validity);
  const sigOidTlv = children(buf, sigAlg)[0];
  const sigOid = sigOidTlv
    ? decodeOid(buf.subarray(sigOidTlv.start, sigOidTlv.end))
    : "";
  const subjectStr = decodeName(buf, subject);
  const issuerStr = decodeName(buf, issuer);
  return {
    subject: subjectStr,
    issuer: issuerStr,
    serialHex: Array.from(buf.subarray(serial.start, serial.end))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(":"),
    notBefore: nb ? decodeTime(buf, nb) : undefined,
    notAfter: na ? decodeTime(buf, na) : undefined,
    signatureAlgorithm: SIG_OIDS[sigOid] ?? sigOid,
    selfSigned: subjectStr === issuerStr,
  };
}
