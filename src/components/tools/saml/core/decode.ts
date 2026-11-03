/**
 * Turn whatever the user pasted — raw XML, base64, base64+DEFLATE, a
 * URL-encoded value, a query string / form body, or a full redirect URL —
 * into SAML XML, recording how it was detected.
 */

export type SamlParameter = "SAMLRequest" | "SAMLResponse";

export type DecodedInput = {
  ok: boolean;
  /** The decoded XML, when `ok`. */
  xml?: string;
  /** Why decoding failed, when not `ok`. */
  error?: string;
  /** One-line human description of what was detected. */
  detected: string;
  /** Each decoding step that was applied, in order. */
  steps: string[];
  /** Best guess at the binding the message travelled over. */
  binding?: "HTTP-Redirect" | "HTTP-POST";
  /** Which parameter carried the message, when one was found. */
  parameter?: SamlParameter;
  /** True when the payload was DEFLATE-compressed. */
  compressed: boolean;
  /** Decoded RelayState, if present. */
  relayState?: string;
  /** Decoded SigAlg URI (HTTP-Redirect signatures). */
  sigAlg?: string;
  /** Decoded base64 Signature (HTTP-Redirect signatures). */
  signature?: string;
  /**
   * The exact octets an HTTP-Redirect signature covers:
   * `SAMLRequest=…&RelayState=…&SigAlg=…` using the values as they were
   * URL-encoded on the wire.
   */
  signedQuery?: string;
  /** The URL the message was sent to (scheme, host, path), when a URL was pasted. */
  endpoint?: string;
};

/** Hard cap on inflated size, to stop decompression bombs. */
const MAX_INFLATED_BYTES = 5 * 1024 * 1024;

function formDecode(v: string): string {
  return decodeURIComponent(v.replace(/\+/g, " "));
}

function looksLikeXml(s: string): boolean {
  return /^\s*</.test(s.replace(/^﻿/, ""));
}

/** Decode standard or URL-safe base64, tolerating whitespace and missing padding. */
export function base64ToBytes(input: string): Uint8Array {
  // A "+" that went through form decoding comes back as a space.
  let s = input
    .replace(/[\r\n\t]/g, "")
    .replace(/ /g, "+")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  s = s.replace(/=+$/, "");
  if (!/^[A-Za-z0-9+/]*$/.test(s) || s.length % 4 === 1)
    throw new Error("Not valid base64.");
  s += "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s);
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

/** Inflate raw DEFLATE (or zlib) bytes using the platform DecompressionStream. */
export async function inflate(
  bytes: Uint8Array,
  format: "deflate-raw" | "deflate" = "deflate-raw",
): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined")
    throw new Error("This environment cannot decompress DEFLATE data.");
  const ds = new DecompressionStream(format);
  const writer = ds.writable.getWriter();
  writer.write(bytes as unknown as BufferSource).catch(() => {});
  writer.close().catch(() => {});
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_INFLATED_BYTES) {
      reader.cancel().catch(() => {});
      throw new Error("Decompressed message is unreasonably large.");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

const utf8 = (b: Uint8Array) => new TextDecoder("utf-8").decode(b);

type Payload = { xml: string; steps: string[]; compressed: boolean };

async function decodePayload(value: string): Promise<Payload> {
  const steps: string[] = [];
  let v = value.trim();
  if (looksLikeXml(v)) return { xml: v, steps: ["Raw XML"], compressed: false };
  if (/%[0-9A-Fa-f]{2}/.test(v)) {
    try {
      v = formDecode(v).trim();
      steps.push("URL-decoded");
    } catch {
      throw new Error("The value contains malformed URL encoding.");
    }
    if (looksLikeXml(v))
      return { xml: v, steps: [...steps, "Raw XML"], compressed: false };
  }
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(v);
  } catch {
    throw new Error(
      "Input is not XML, base64, or a URL containing SAMLRequest / SAMLResponse.",
    );
  }
  if (!bytes.length) throw new Error("Input decoded to nothing.");
  steps.push("Base64-decoded");
  const text = utf8(bytes);
  if (looksLikeXml(text)) return { xml: text, steps, compressed: false };
  for (const fmt of ["deflate-raw", "deflate"] as const) {
    try {
      const inflated = utf8(await inflate(bytes, fmt));
      if (looksLikeXml(inflated)) {
        steps.push(
          fmt === "deflate-raw"
            ? "Inflated (raw DEFLATE)"
            : "Inflated (zlib-wrapped DEFLATE — non-standard for SAML)",
        );
        return { xml: inflated, steps, compressed: true };
      }
    } catch (e) {
      if (e instanceof Error && /unreasonably large/.test(e.message)) throw e;
    }
  }
  throw new Error(
    "Decoded the base64, but the result is neither XML nor DEFLATE-compressed XML.",
  );
}

type QueryParam = { key: string; raw: string; value: string };

function parseQuery(qs: string): QueryParam[] {
  const out: QueryParam[] = [];
  for (const part of qs.split("&")) {
    if (!part) continue;
    const i = part.indexOf("=");
    const key = i === -1 ? part : part.slice(0, i);
    const raw = i === -1 ? "" : part.slice(i + 1);
    let value = raw;
    try {
      value = formDecode(raw);
    } catch {
      /* keep raw */
    }
    out.push({ key, raw, value });
  }
  return out;
}

/** Detect the input format and decode it to SAML XML. Never throws. */
export async function decodeSamlInput(input: string): Promise<DecodedInput> {
  const s = (input ?? "").trim();
  const fail = (
    error: string,
    detected = "Unrecognized input",
  ): DecodedInput => ({
    ok: false,
    error,
    detected,
    steps: [],
    compressed: false,
  });
  if (!s) return fail("Paste a SAML message to decode.", "Nothing to decode");

  const isUrl = /^https?:\/\//i.test(s);
  const hasParam = /(^|[?&#])(SAMLRequest|SAMLResponse)=/.test(s);

  if (isUrl || hasParam) {
    let endpoint: string | undefined;
    let qs = s;
    if (isUrl) {
      const q = s.indexOf("?");
      endpoint = q === -1 ? s : s.slice(0, q);
      qs = q === -1 ? "" : s.slice(q + 1);
      const hash = qs.indexOf("#");
      if (hash !== -1) qs = qs.slice(0, hash);
    } else {
      qs = s.replace(/^[?#]/, "");
    }
    // Pasted query strings sometimes carry newlines from copying.
    qs = qs.replace(/\s+/g, "");
    const params = parseQuery(qs);
    const msg = params.find(
      (p) => p.key === "SAMLRequest" || p.key === "SAMLResponse",
    );
    if (!msg)
      return fail(
        "The URL has no SAMLRequest or SAMLResponse parameter.",
        isUrl ? "URL" : "Query string",
      );
    const relay = params.find((p) => p.key === "RelayState");
    const sigAlg = params.find((p) => p.key === "SigAlg");
    const sig = params.find((p) => p.key === "Signature");
    try {
      const payload = await decodePayload(msg.value);
      const binding = payload.compressed ? "HTTP-Redirect" : "HTTP-POST";
      let signedQuery: string | undefined;
      if (sigAlg && sig) {
        signedQuery = `${msg.key}=${msg.raw}`;
        if (relay) signedQuery += `&RelayState=${relay.raw}`;
        signedQuery += `&SigAlg=${sigAlg.raw}`;
      }
      const where = isUrl
        ? "URL"
        : payload.compressed
          ? "query string"
          : "form body";
      return {
        ok: true,
        xml: payload.xml,
        detected: `${binding} ${where} with ${msg.key} (${payload.compressed ? "base64 + DEFLATE" : "base64"})${sig ? ", signed in the query string" : ""}`,
        steps: [
          isUrl ? "Parsed URL query parameters" : "Parsed query parameters",
          ...payload.steps.filter((x) => x !== "URL-decoded"),
        ],
        binding,
        parameter: msg.key as SamlParameter,
        compressed: payload.compressed,
        relayState: relay?.value,
        sigAlg: sigAlg?.value,
        signature: sig?.value,
        signedQuery,
        endpoint,
      };
    } catch (e) {
      return fail(
        `${msg.key}: ${(e as Error).message}`,
        `${isUrl ? "URL" : "Query string"} with ${msg.key}`,
      );
    }
  }

  try {
    const payload = await decodePayload(s);
    const isRaw = payload.steps[payload.steps.length - 1] === "Raw XML";
    const detected = isRaw
      ? payload.steps.includes("URL-decoded")
        ? "URL-encoded XML"
        : "Raw XML"
      : `${payload.steps.includes("URL-decoded") ? "URL-encoded " : ""}${payload.compressed ? "base64 + DEFLATE (HTTP-Redirect encoding)" : "base64 (HTTP-POST encoding)"}`;
    return {
      ok: true,
      xml: payload.xml,
      detected,
      steps: payload.steps,
      binding: isRaw
        ? undefined
        : payload.compressed
          ? "HTTP-Redirect"
          : "HTTP-POST",
      compressed: payload.compressed,
    };
  } catch (e) {
    return fail((e as Error).message);
  }
}
