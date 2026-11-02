/**
 * SAML decoder core — framework-free, dependency-free, browser-only APIs
 * (WebCrypto, DecompressionStream, TextDecoder). No network access.
 *
 * See README.md in this directory for the API overview.
 */

import { decodeSamlInput, type DecodedInput } from "./decode.ts";
import { samlHints, type Hint } from "./hints.ts";
import { prettyPrintTokens, type XmlToken } from "./pretty.ts";
import { summarizeSaml, type SamlSummary } from "./saml.ts";
import { checkTimes, type TimeCheck } from "./times.ts";
import { parseXml, type XmlDocument } from "./xml.ts";

export * from "./c14n.ts";
export * from "./decode.ts";
export * from "./dsig.ts";
export * from "./examples.ts";
export * from "./explain.ts";
export * from "./hints.ts";
export * from "./pretty.ts";
export * from "./saml.ts";
export * from "./times.ts";
export * from "./x509.ts";
export * from "./xml.ts";

export type SamlAnalysis = {
  decoded: DecodedInput;
  /** Parsed document — pass to `verifyXmlSignatures`. Absent if decoding or parsing failed. */
  document?: XmlDocument;
  summary?: SamlSummary;
  times: TimeCheck[];
  hints: Hint[];
  /** Pretty-printed XML tokens for display. */
  pretty: XmlToken[];
  /** Fatal problem (decode or XML parse), if any. */
  error?: string;
};

export type AnalyzeOptions = {
  /** Epoch ms used for time checks. Defaults to `Date.now()`. */
  now?: number;
  /** Tolerance for time checks, in seconds. Default 0. */
  clockSkewSeconds?: number;
};

/** Decode, parse, summarize, time-check, and explain a pasted SAML message in one call. */
export async function analyzeSaml(
  input: string,
  opts: AnalyzeOptions = {},
): Promise<SamlAnalysis> {
  const now = opts.now ?? Date.now();
  const decoded = await decodeSamlInput(input);
  const empty = { decoded, times: [], hints: [], pretty: [] };
  if (!decoded.ok || !decoded.xml) return { ...empty, error: decoded.error };
  let document: XmlDocument;
  try {
    document = parseXml(decoded.xml);
  } catch (e) {
    return {
      ...empty,
      error: `The decoded data is not well-formed XML: ${(e as Error).message}`,
    };
  }
  const summary = summarizeSaml(document);
  const times = checkTimes(summary, {
    now,
    clockSkewSeconds: opts.clockSkewSeconds,
  });
  return {
    decoded,
    document,
    summary,
    times,
    hints: samlHints(summary, { decoded, times, now }),
    pretty: prettyPrintTokens(document),
  };
}
