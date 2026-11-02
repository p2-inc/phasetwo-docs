/**
 * X.509 certificate parsing and inspection, built on the tiny DER reader in
 * `./der`. Framework-free. Parsing is synchronous and pure; fingerprints and
 * signature checks use the browser's WebCrypto (`crypto.subtle`) and are only
 * ever called from client-side effects.
 */
import {
  type Asn1,
  Asn1Error,
  TAG,
  bytesEqual,
  isContext,
  isUniversal,
  parseDer,
  parseInner,
  readBitString,
  readBoolean,
  readIntegerHex,
  readOid,
  readSmallInt,
  readString,
  readTime,
  toHex,
} from "./der";

/* ------------------------------------------------------------------ */
/* OID names                                                           */
/* ------------------------------------------------------------------ */

const NAME_ATTRS: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.4": "SN",
  "2.5.4.5": "serialNumber",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.9": "street",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "2.5.4.12": "title",
  "2.5.4.42": "GN",
  "2.5.4.97": "organizationIdentifier",
  "0.9.2342.19200300.100.1.25": "DC",
  "0.9.2342.19200300.100.1.1": "UID",
  "1.2.840.113549.1.9.1": "emailAddress",
};

const SIG_ALGS: Record<string, string> = {
  "1.2.840.113549.1.1.4": "md5WithRSAEncryption",
  "1.2.840.113549.1.1.5": "sha1WithRSAEncryption",
  "1.2.840.113549.1.1.11": "sha256WithRSAEncryption",
  "1.2.840.113549.1.1.12": "sha384WithRSAEncryption",
  "1.2.840.113549.1.1.13": "sha512WithRSAEncryption",
  "1.2.840.113549.1.1.10": "RSASSA-PSS",
  "1.2.840.10045.4.1": "ecdsa-with-SHA1",
  "1.2.840.10045.4.3.2": "ecdsa-with-SHA256",
  "1.2.840.10045.4.3.3": "ecdsa-with-SHA384",
  "1.2.840.10045.4.3.4": "ecdsa-with-SHA512",
  "1.3.101.112": "Ed25519",
  "1.3.101.113": "Ed448",
  "1.2.840.10040.4.3": "dsa-with-SHA1",
};

/** Hash used by each signature algorithm (for WebCrypto). */
const SIG_HASH: Record<string, string> = {
  "1.2.840.113549.1.1.5": "SHA-1",
  "1.2.840.113549.1.1.11": "SHA-256",
  "1.2.840.113549.1.1.12": "SHA-384",
  "1.2.840.113549.1.1.13": "SHA-512",
  "1.2.840.10045.4.1": "SHA-1",
  "1.2.840.10045.4.3.2": "SHA-256",
  "1.2.840.10045.4.3.3": "SHA-384",
  "1.2.840.10045.4.3.4": "SHA-512",
};

const HASH_OIDS: Record<string, string> = {
  "1.3.14.3.2.26": "SHA-1",
  "2.16.840.1.101.3.4.2.1": "SHA-256",
  "2.16.840.1.101.3.4.2.2": "SHA-384",
  "2.16.840.1.101.3.4.2.3": "SHA-512",
};

const CURVES: Record<string, { name: string; bits: number }> = {
  "1.2.840.10045.3.1.7": { name: "P-256", bits: 256 },
  "1.3.132.0.34": { name: "P-384", bits: 384 },
  "1.3.132.0.35": { name: "P-521", bits: 521 },
  "1.3.132.0.10": { name: "secp256k1", bits: 256 },
};

const EKU_NAMES: Record<string, string> = {
  "1.3.6.1.5.5.7.3.1": "TLS Web Server Authentication",
  "1.3.6.1.5.5.7.3.2": "TLS Web Client Authentication",
  "1.3.6.1.5.5.7.3.3": "Code Signing",
  "1.3.6.1.5.5.7.3.4": "Email Protection (S/MIME)",
  "1.3.6.1.5.5.7.3.8": "Time Stamping",
  "1.3.6.1.5.5.7.3.9": "OCSP Signing",
  "1.3.6.1.4.1.311.20.2.2": "Smart Card Logon",
  "1.3.6.1.5.2.3.5": "Kerberos PKINIT KDC",
  "2.5.29.37.0": "Any Extended Key Usage",
};

const EXT_NAMES: Record<string, string> = {
  "2.5.29.14": "Subject Key Identifier",
  "2.5.29.15": "Key Usage",
  "2.5.29.17": "Subject Alternative Name",
  "2.5.29.18": "Issuer Alternative Name",
  "2.5.29.19": "Basic Constraints",
  "2.5.29.30": "Name Constraints",
  "2.5.29.31": "CRL Distribution Points",
  "2.5.29.32": "Certificate Policies",
  "2.5.29.35": "Authority Key Identifier",
  "2.5.29.37": "Extended Key Usage",
  "1.3.6.1.5.5.7.1.1": "Authority Information Access",
  "1.3.6.1.4.1.11129.2.4.2": "Certificate Transparency SCTs",
  "1.3.6.1.5.5.7.1.24": "TLS Feature (OCSP Must-Staple)",
};

const KEY_USAGE_BITS = [
  "Digital Signature",
  "Non-Repudiation",
  "Key Encipherment",
  "Data Encipherment",
  "Key Agreement",
  "Certificate Sign",
  "CRL Sign",
  "Encipher Only",
  "Decipher Only",
];

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type NameAttr = { oid: string; short: string; value: string };

export type DistinguishedName = {
  attrs: NameAttr[];
  /** RFC 4514-style string, most specific first (CN=..., O=..., C=...). */
  text: string;
  /** Raw DER of the Name, for exact issuer/subject comparison. */
  der: Uint8Array;
};

export type PublicKeyInfo = {
  type: "RSA" | "EC" | "Ed25519" | "Ed448" | "DSA" | "Unknown";
  algorithmOid: string;
  bits?: number;
  curve?: string;
  curveOid?: string;
  exponent?: number;
  /** Raw SubjectPublicKeyInfo DER — importable via WebCrypto "spki". */
  spki: Uint8Array;
};

export type SanEntry = {
  type: "DNS" | "IP" | "Email" | "URI" | "DirName" | "OtherName" | "Other";
  value: string;
};

export type Extension = {
  oid: string;
  name: string;
  critical: boolean;
};

export type Certificate = {
  der: Uint8Array;
  tbs: Uint8Array;
  version: number;
  serialHex: string;
  signatureAlgorithm: { oid: string; name: string; params?: Asn1 };
  signature: Uint8Array;
  issuer: DistinguishedName;
  subject: DistinguishedName;
  notBefore: Date;
  notAfter: Date;
  publicKey: PublicKeyInfo;
  extensions: Extension[];
  san: SanEntry[];
  keyUsage?: string[];
  extKeyUsage?: string[];
  basicConstraints?: { ca: boolean; pathLen?: number };
  subjectKeyId?: string;
  authorityKeyId?: string;
};

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

function need(n: Asn1 | undefined, what: string): Asn1 {
  if (!n) throw new Asn1Error(`Malformed certificate: missing ${what}.`);
  return n;
}

function parseName(n: Asn1): DistinguishedName {
  const attrs: NameAttr[] = [];
  for (const rdn of n.children) {
    for (const atv of rdn.children) {
      const oidNode = atv.children[0];
      const valNode = atv.children[1];
      if (!oidNode || !valNode) continue;
      const oid = readOid(oidNode);
      let value: string;
      try {
        value = readString(valNode);
      } catch {
        value = `#${toHex(valNode.der)}`;
      }
      attrs.push({ oid, short: NAME_ATTRS[oid] ?? oid, value });
    }
  }
  const text = attrs
    .slice()
    .reverse()
    .map((a) => `${a.short}=${a.value.replace(/([,+"\\<>;])/g, "\\$1")}`)
    .join(", ");
  return { attrs, text, der: n.der };
}

function parseSpki(n: Asn1): PublicKeyInfo {
  const algId = need(n.children[0], "public key algorithm");
  const algorithmOid = readOid(need(algId.children[0], "key algorithm OID"));
  const params = algId.children[1];
  const bitStr = need(n.children[1], "public key bits");
  const { bytes } = readBitString(bitStr);
  const base = { algorithmOid, spki: n.der };

  if (
    algorithmOid === "1.2.840.113549.1.1.1" ||
    algorithmOid === "1.2.840.113549.1.1.10"
  ) {
    try {
      const rsa = parseInner(bytes);
      const mod = need(rsa.children[0], "RSA modulus").value;
      let i = 0;
      while (i < mod.length && mod[i] === 0) i++;
      const top = mod[i] ?? 0;
      const bits =
        (mod.length - i - 1) * 8 + (top ? Math.floor(Math.log2(top)) + 1 : 0);
      const e = rsa.children[1];
      return {
        ...base,
        type: "RSA",
        bits,
        exponent: e ? readSmallInt(e) : undefined,
      };
    } catch {
      return { ...base, type: "RSA" };
    }
  }
  if (algorithmOid === "1.2.840.10045.2.1") {
    const curveOid =
      params && isUniversal(params, TAG.OID) ? readOid(params) : undefined;
    const c = curveOid ? CURVES[curveOid] : undefined;
    return {
      ...base,
      type: "EC",
      curve: c?.name ?? curveOid ?? "explicit parameters",
      curveOid,
      bits: c?.bits,
    };
  }
  if (algorithmOid === "1.3.101.112")
    return { ...base, type: "Ed25519", bits: 256 };
  if (algorithmOid === "1.3.101.113")
    return { ...base, type: "Ed448", bits: 456 };
  if (algorithmOid === "1.2.840.10040.4.1") return { ...base, type: "DSA" };
  return { ...base, type: "Unknown" };
}

function formatIp(b: Uint8Array): string {
  if (b.length === 4) return Array.from(b).join(".");
  if (b.length === 16) {
    const groups: string[] = [];
    for (let i = 0; i < 16; i += 2)
      groups.push(((b[i] << 8) | b[i + 1]).toString(16));
    return groups.join(":").replace(/(^|:)0(:0)+(:|$)/, "::");
  }
  return toHex(b, ":");
}

function parseSan(extValue: Asn1): SanEntry[] {
  const out: SanEntry[] = [];
  for (const gn of extValue.children) {
    if (gn.cls !== 2) continue;
    const latin1 = () => {
      let s = "";
      for (const b of gn.value) s += String.fromCharCode(b);
      return s;
    };
    switch (gn.tagNum) {
      case 1:
        out.push({ type: "Email", value: latin1() });
        break;
      case 2:
        out.push({ type: "DNS", value: latin1() });
        break;
      case 6:
        out.push({ type: "URI", value: latin1() });
        break;
      case 7:
        out.push({ type: "IP", value: formatIp(gn.value) });
        break;
      case 4:
        out.push({
          type: "DirName",
          value: gn.children[0] ? parseName(gn.children[0]).text : "",
        });
        break;
      case 0: {
        const oid = gn.children[0] ? readOid(gn.children[0]) : "";
        let val = "";
        const wrapped = gn.children[1]?.children[0];
        if (wrapped) {
          try {
            val = readString(wrapped);
          } catch {
            /* ignore */
          }
        }
        const label = oid === "1.3.6.1.4.1.311.20.2.3" ? "UPN" : oid;
        out.push({ type: "OtherName", value: `${label}: ${val}` });
        break;
      }
      default:
        out.push({ type: "Other", value: toHex(gn.value) });
    }
  }
  return out;
}

/** Parse a DER-encoded X.509 certificate. Throws on malformed input. */
export function parseCertificate(der: Uint8Array): Certificate {
  const root = parseDer(der);
  if (!isUniversal(root, TAG.SEQUENCE) || root.children.length < 3)
    throw new Asn1Error(
      "This is not an X.509 certificate (expected a SEQUENCE of three elements).",
    );
  const [tbsNode, sigAlgNode, sigNode] = root.children;
  const t = tbsNode.children;
  let i = 0;
  let version = 1;
  if (isContext(t[0], 0)) {
    version = readSmallInt(need(t[0].children[0], "version")) + 1;
    i++;
  }
  const serial = need(t[i++], "serial number");
  if (!isUniversal(serial, TAG.INTEGER))
    throw new Asn1Error("This is not an X.509 certificate (no serial number).");
  i++; // inner signature algorithm (duplicates the outer one)
  const issuer = parseName(need(t[i++], "issuer"));
  const validity = need(t[i++], "validity");
  const subject = parseName(need(t[i++], "subject"));
  const publicKey = parseSpki(need(t[i++], "subject public key info"));

  const cert: Certificate = {
    der,
    tbs: tbsNode.der,
    version,
    serialHex: readIntegerHex(serial),
    signatureAlgorithm: (() => {
      const oid = readOid(need(sigAlgNode.children[0], "signature algorithm"));
      return {
        oid,
        name: SIG_ALGS[oid] ?? oid,
        params: sigAlgNode.children[1],
      };
    })(),
    signature: readBitString(sigNode).bytes,
    issuer,
    subject,
    notBefore: readTime(need(validity.children[0], "notBefore")),
    notAfter: readTime(need(validity.children[1], "notAfter")),
    publicKey,
    extensions: [],
    san: [],
  };

  const extsWrapper = t.slice(i).find((n) => isContext(n, 3));
  const exts = extsWrapper?.children[0]?.children ?? [];
  for (const ext of exts) {
    const oid = readOid(need(ext.children[0], "extension OID"));
    let critical = false;
    let valueNode = ext.children[1];
    if (valueNode && isUniversal(valueNode, TAG.BOOLEAN)) {
      critical = readBoolean(valueNode);
      valueNode = ext.children[2];
    }
    cert.extensions.push({ oid, name: EXT_NAMES[oid] ?? oid, critical });
    if (!valueNode) continue;
    let inner: Asn1;
    try {
      inner = parseInner(valueNode.value);
    } catch {
      continue;
    }
    try {
      switch (oid) {
        case "2.5.29.17":
          cert.san = parseSan(inner);
          break;
        case "2.5.29.15": {
          const { bytes } = readBitString(inner);
          const names: string[] = [];
          KEY_USAGE_BITS.forEach((name, bit) => {
            const byte = bytes[bit >> 3] ?? 0;
            if (byte & (0x80 >> (bit & 7))) names.push(name);
          });
          cert.keyUsage = names;
          break;
        }
        case "2.5.29.37":
          cert.extKeyUsage = inner.children.map((c) => {
            const o = readOid(c);
            return EKU_NAMES[o] ?? o;
          });
          break;
        case "2.5.29.19": {
          let ca = false;
          let pathLen: number | undefined;
          for (const c of inner.children) {
            if (isUniversal(c, TAG.BOOLEAN)) ca = readBoolean(c);
            else if (isUniversal(c, TAG.INTEGER)) pathLen = readSmallInt(c);
          }
          cert.basicConstraints = { ca, pathLen };
          break;
        }
        case "2.5.29.14":
          cert.subjectKeyId = toHex(inner.value, ":");
          break;
        case "2.5.29.35": {
          const kid = inner.children.find((c) => isContext(c, 0));
          if (kid) cert.authorityKeyId = toHex(kid.value, ":");
          break;
        }
      }
    } catch {
      /* A malformed optional extension should not sink the whole decode. */
    }
  }
  return cert;
}

/* ------------------------------------------------------------------ */
/* Derived facts                                                       */
/* ------------------------------------------------------------------ */

export type ValidityState = "valid" | "expired" | "not-yet-valid";

export function validityState(c: Certificate, nowMs: number): ValidityState {
  if (nowMs < c.notBefore.getTime()) return "not-yet-valid";
  if (nowMs > c.notAfter.getTime()) return "expired";
  return "valid";
}

/** Human relative time, e.g. "in 3 months" or "2 days ago". */
export function relativeTime(target: Date, nowMs: number): string {
  const diff = target.getTime() - nowMs;
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365.25 * 864e5],
    ["month", 30.44 * 864e5],
    ["day", 864e5],
    ["hour", 36e5],
    ["minute", 6e4],
    ["second", 1e3],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second")
      return rtf.format(Math.round(diff / ms), unit);
  }
  return "";
}

/** Subject and issuer DNs are byte-identical. */
export function namesMatch(
  a: DistinguishedName,
  b: DistinguishedName,
): boolean {
  return bytesEqual(a.der, b.der);
}

export function isSelfIssued(c: Certificate): boolean {
  return namesMatch(c.subject, c.issuer);
}

export function keySummary(k: PublicKeyInfo): string {
  if (k.type === "RSA") return `RSA ${k.bits ?? "?"}-bit`;
  if (k.type === "EC") return `EC ${k.curve ?? ""}`.trim();
  return k.type;
}

/** Colon-separated uppercase hex digest, e.g. "AB:CD:...". */
export async function fingerprint(
  der: Uint8Array,
  hash: "SHA-1" | "SHA-256",
): Promise<string> {
  const d = await crypto.subtle.digest(hash, der as BufferSource);
  return toHex(new Uint8Array(d), ":").toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Signature verification (WebCrypto)                                  */
/* ------------------------------------------------------------------ */

export type SigCheck = "valid" | "invalid" | "unsupported";

/** Convert a DER ECDSA signature to the raw r||s form WebCrypto expects. */
function ecdsaDerToRaw(sig: Uint8Array, size: number): Uint8Array {
  const seq = parseDer(sig);
  const out = new Uint8Array(size * 2);
  [0, 1].forEach((idx) => {
    let v = need(seq.children[idx], "ECDSA r/s").value;
    while (v.length > size && v[0] === 0) v = v.subarray(1);
    out.set(v, size * (idx + 1) - v.length);
  });
  return out;
}

function pssParams(params: Asn1 | undefined): {
  hash: string;
  saltLength: number;
} {
  let hash = "SHA-1";
  let saltLength = 20;
  for (const c of params?.children ?? []) {
    if (isContext(c, 0)) {
      const oid = c.children[0]?.children[0];
      if (oid) hash = HASH_OIDS[readOid(oid)] ?? hash;
    } else if (isContext(c, 2) && c.children[0]) {
      saltLength = readSmallInt(c.children[0]);
    }
  }
  return { hash, saltLength };
}

/**
 * Check whether `cert` was signed by the key in `issuer`. Returns
 * "unsupported" for algorithms the browser's WebCrypto cannot verify.
 */
export async function verifySignedBy(
  cert: Certificate,
  issuer: Certificate,
): Promise<SigCheck> {
  if (typeof crypto === "undefined" || !crypto.subtle) return "unsupported";
  const sigOid = cert.signatureAlgorithm.oid;
  const key = issuer.publicKey;
  const spki = key.spki as BufferSource;
  try {
    if (key.type === "RSA" && SIG_HASH[sigOid]) {
      const alg = { name: "RSASSA-PKCS1-v1_5", hash: SIG_HASH[sigOid] };
      const k = await crypto.subtle.importKey("spki", spki, alg, false, [
        "verify",
      ]);
      return (await crypto.subtle.verify(
        alg,
        k,
        cert.signature as BufferSource,
        cert.tbs as BufferSource,
      ))
        ? "valid"
        : "invalid";
    }
    if (key.type === "RSA" && sigOid === "1.2.840.113549.1.1.10") {
      const { hash, saltLength } = pssParams(cert.signatureAlgorithm.params);
      const k = await crypto.subtle.importKey(
        "spki",
        spki,
        { name: "RSA-PSS", hash },
        false,
        ["verify"],
      );
      return (await crypto.subtle.verify(
        { name: "RSA-PSS", saltLength },
        k,
        cert.signature as BufferSource,
        cert.tbs as BufferSource,
      ))
        ? "valid"
        : "invalid";
    }
    if (
      key.type === "EC" &&
      SIG_HASH[sigOid] &&
      key.curve &&
      /^P-/.test(key.curve)
    ) {
      const size = Math.ceil((key.bits ?? 256) / 8);
      const k = await crypto.subtle.importKey(
        "spki",
        spki,
        { name: "ECDSA", namedCurve: key.curve },
        false,
        ["verify"],
      );
      const raw = ecdsaDerToRaw(cert.signature, size);
      return (await crypto.subtle.verify(
        { name: "ECDSA", hash: SIG_HASH[sigOid] },
        k,
        raw as BufferSource,
        cert.tbs as BufferSource,
      ))
        ? "valid"
        : "invalid";
    }
    if (key.type === "Ed25519" && sigOid === "1.3.101.112") {
      const k = await crypto.subtle.importKey(
        "spki",
        spki,
        { name: "Ed25519" },
        false,
        ["verify"],
      );
      return (await crypto.subtle.verify(
        { name: "Ed25519" },
        k,
        cert.signature as BufferSource,
        cert.tbs as BufferSource,
      ))
        ? "valid"
        : "invalid";
    }
  } catch {
    return "unsupported";
  }
  return "unsupported";
}

/* ------------------------------------------------------------------ */
/* Chain order                                                         */
/* ------------------------------------------------------------------ */

export type ChainLink = {
  /** Index of the certificate being checked. */
  index: number;
  /** issuer DN of cert[index] equals subject DN of cert[index + 1]. */
  nameMatch: boolean;
  signature: SigCheck;
};

export type ChainReport = {
  links: ChainLink[];
  inOrder: boolean;
  /** Human-readable summary. */
  summary: string;
};

/** Check that each certificate is issued by the one after it (leaf first). */
export async function checkChain(certs: Certificate[]): Promise<ChainReport> {
  const links: ChainLink[] = [];
  for (let i = 0; i < certs.length - 1; i++) {
    const nameMatch = namesMatch(certs[i].issuer, certs[i + 1].subject);
    const signature = nameMatch
      ? await verifySignedBy(certs[i], certs[i + 1])
      : "invalid";
    links.push({ index: i, nameMatch, signature });
  }
  const inOrder = links.every((l) => l.nameMatch && l.signature !== "invalid");
  let summary: string;
  if (inOrder) {
    summary =
      "Chain is in the expected order: each certificate is issued by the next one.";
  } else {
    const reversed = certs.slice().reverse();
    const revOk = reversed
      .slice(0, -1)
      .every((c, i) => namesMatch(c.issuer, reversed[i + 1].subject));
    summary = revOk
      ? "Chain is in reverse order. Most servers and clients expect the leaf first, followed by each issuing CA."
      : "Chain is out of order or incomplete: at least one certificate is not issued by the certificate that follows it.";
  }
  return { links, inOrder, summary };
}
