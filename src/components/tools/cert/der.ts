/**
 * A minimal, read-only ASN.1 DER reader — just enough to walk X.509
 * certificates. Framework-free and DOM-free so it is safe to import during
 * Docusaurus server-side rendering.
 */

export type Asn1 = {
  /** Tag class: 0 universal, 1 application, 2 context-specific, 3 private. */
  cls: number;
  constructed: boolean;
  /** Tag number within its class. */
  tagNum: number;
  /** The complete TLV encoding (header + value). */
  der: Uint8Array;
  /** The value (content octets) only. */
  value: Uint8Array;
  /** Child elements when `constructed`. */
  children: Asn1[];
};

export const TAG = {
  BOOLEAN: 1,
  INTEGER: 2,
  BIT_STRING: 3,
  OCTET_STRING: 4,
  NULL: 5,
  OID: 6,
  UTF8_STRING: 12,
  SEQUENCE: 16,
  SET: 17,
  PRINTABLE_STRING: 19,
  T61_STRING: 20,
  IA5_STRING: 22,
  UTC_TIME: 23,
  GENERALIZED_TIME: 24,
  UNIVERSAL_STRING: 28,
  BMP_STRING: 30,
} as const;

export class Asn1Error extends Error {}

/** Parse one DER element starting at `offset`. */
function parseAt(
  buf: Uint8Array,
  offset: number,
  depth: number,
): { node: Asn1; next: number } {
  if (depth > 64) throw new Asn1Error("ASN.1 nesting is too deep.");
  if (offset + 2 > buf.length) throw new Asn1Error("Unexpected end of data.");
  const first = buf[offset];
  const cls = first >> 6;
  const constructed = (first & 0x20) !== 0;
  let tagNum = first & 0x1f;
  let pos = offset + 1;
  if (tagNum === 0x1f) {
    // High-tag-number form.
    tagNum = 0;
    let b: number;
    do {
      if (pos >= buf.length) throw new Asn1Error("Truncated tag.");
      b = buf[pos++];
      tagNum = tagNum * 128 + (b & 0x7f);
    } while (b & 0x80);
  }
  if (pos >= buf.length) throw new Asn1Error("Truncated length.");
  let len = buf[pos++];
  if (len & 0x80) {
    const n = len & 0x7f;
    if (n === 0) throw new Asn1Error("Indefinite length is not valid DER.");
    if (n > 4) throw new Asn1Error("Length is too large.");
    len = 0;
    for (let i = 0; i < n; i++) {
      if (pos >= buf.length) throw new Asn1Error("Truncated length.");
      len = len * 256 + buf[pos++];
    }
  }
  const end = pos + len;
  if (end > buf.length)
    throw new Asn1Error("Element length runs past the end of the data.");
  const value = buf.subarray(pos, end);
  const children: Asn1[] = [];
  if (constructed) {
    let p = pos;
    while (p < end) {
      const r = parseAt(buf, p, depth + 1);
      children.push(r.node);
      p = r.next;
    }
  }
  return {
    node: {
      cls,
      constructed,
      tagNum,
      der: buf.subarray(offset, end),
      value,
      children,
    },
    next: end,
  };
}

/** Parse a complete DER buffer that holds exactly one top-level element. */
export function parseDer(buf: Uint8Array): Asn1 {
  const { node, next } = parseAt(buf, 0, 0);
  if (next !== buf.length)
    throw new Asn1Error("Unexpected trailing data after the DER element.");
  return node;
}

/** Parse the content octets of a primitive (e.g. OCTET STRING) as DER. */
export function parseInner(bytes: Uint8Array): Asn1 {
  return parseDer(bytes);
}

export function isUniversal(n: Asn1 | undefined, tag: number): boolean {
  return !!n && n.cls === 0 && n.tagNum === tag;
}

export function isContext(n: Asn1 | undefined, tag: number): boolean {
  return !!n && n.cls === 2 && n.tagNum === tag;
}

/** Decode an OBJECT IDENTIFIER to dotted form. */
export function readOid(n: Asn1): string {
  const v = n.value;
  if (v.length === 0) return "";
  const parts: number[] = [];
  let acc = 0;
  for (let i = 0; i < v.length; i++) {
    acc = acc * 128 + (v[i] & 0x7f);
    if (!(v[i] & 0x80)) {
      parts.push(acc);
      acc = 0;
    }
  }
  const firstVal = parts.shift() ?? 0;
  const a = firstVal < 80 ? Math.floor(firstVal / 40) : 2;
  const b = firstVal - a * 40;
  return [a, b, ...parts].join(".");
}

export function toHex(bytes: Uint8Array, sep = ""): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(sep);
}

/** INTEGER content as hex, without redundant leading zero bytes. */
export function readIntegerHex(n: Asn1): string {
  let v = n.value;
  while (v.length > 1 && v[0] === 0) v = v.subarray(1);
  return toHex(v);
}

export function readSmallInt(n: Asn1): number {
  let x = 0;
  for (const b of n.value) x = x * 256 + b;
  return x;
}

export function readBoolean(n: Asn1): boolean {
  return n.value.length > 0 && n.value[0] !== 0;
}

/** BIT STRING content minus the leading "unused bits" octet. */
export function readBitString(n: Asn1): {
  bytes: Uint8Array;
  unused: number;
} {
  return { bytes: n.value.subarray(1), unused: n.value[0] ?? 0 };
}

/** Decode the common ASN.1 string types to a JS string. */
export function readString(n: Asn1): string {
  const v = n.value;
  if (n.tagNum === TAG.BMP_STRING) {
    let s = "";
    for (let i = 0; i + 1 < v.length; i += 2)
      s += String.fromCharCode((v[i] << 8) | v[i + 1]);
    return s;
  }
  if (n.tagNum === TAG.UNIVERSAL_STRING) {
    let s = "";
    for (let i = 0; i + 3 < v.length; i += 4)
      s += String.fromCodePoint(
        ((v[i] << 24) | (v[i + 1] << 16) | (v[i + 2] << 8) | v[i + 3]) >>> 0,
      );
    return s;
  }
  if (n.tagNum === TAG.UTF8_STRING)
    return new TextDecoder("utf-8", { fatal: false }).decode(v);
  // Printable, IA5, T61, Visible, Numeric: treat as Latin-1.
  let s = "";
  for (const b of v) s += String.fromCharCode(b);
  return s;
}

/** Decode UTCTime / GeneralizedTime to a Date. */
export function readTime(n: Asn1): Date {
  const s = readString(n);
  let m: RegExpMatchArray | null;
  if (n.tagNum === TAG.UTC_TIME) {
    m = s.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/);
    if (!m) throw new Asn1Error(`Unrecognized UTCTime "${s}".`);
    const yy = parseInt(m[1], 10);
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    return new Date(
      Date.UTC(year, +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0)),
    );
  }
  m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?(?:\.\d+)?Z$/);
  if (!m) throw new Asn1Error(`Unrecognized GeneralizedTime "${s}".`);
  return new Date(
    Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0)),
  );
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Standard (not URL-safe) base64 → bytes. Tolerates whitespace. */
export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[\s\r\n]+/g, "");
  if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(clean))
    throw new Asn1Error("Input is not valid base64.");
  const std = clean.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(std + "=".repeat((4 - (std.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
