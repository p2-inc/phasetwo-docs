/**
 * Orchestration on top of the pure modules: fetch a discovery document or a
 * JWKS from a user-supplied URL, then lint and summarize it. Framework-free so
 * the same flow can back other UIs (e.g. a browser extension panel).
 */
import { fetchJson, parseUserUrl, type FetchJsonResult } from "./fetch.ts";
import type { Finding } from "./findings.ts";
import { summarizeJwks, type JwksSummary } from "./jwks.ts";
import {
  resolveDiscoveryTarget,
  lintDiscovery,
  detectKeycloak,
  keycloakNotes,
  type DiscoveryDoc,
  type DiscoveryTarget,
  type KeycloakInfo,
} from "./discovery.ts";
import { suggestJwksUrl } from "../jwt/verify.ts";

export type JwksLoad = {
  /** Where the keys came from. */
  source: "fetched" | "pasted" | "example";
  /** The URL that was actually fetched, when fetched. */
  url?: string;
  fetch?: FetchJsonResult;
  summary?: JwksSummary;
  /** Notes about how the input was interpreted (e.g. followed jwks_uri). */
  notes: string[];
};

/**
 * Load a JWKS from a URL. Accepts a JWKS URL, a Keycloak realm issuer (which
 * maps to its certs endpoint), or a discovery URL (whose jwks_uri is
 * followed).
 */
export async function loadJwksFromUrl(input: string): Promise<JwksLoad> {
  const notes: string[] = [];
  let url = input.trim();
  const kcCerts = suggestJwksUrl(url.replace(/\/+$/, ""));
  if (kcCerts) {
    notes.push(
      "That looks like a Keycloak realm issuer, so its certs endpoint was fetched.",
    );
    url = kcCerts;
  }
  const looksLikeKeys = (r: FetchJsonResult) =>
    r.ok &&
    typeof r.data === "object" &&
    r.data !== null &&
    ("keys" in r.data || "jwks_uri" in r.data || "kty" in r.data);
  // A bare origin (https://issuer.example.com) is an issuer, never a JWKS, so
  // go straight to its discovery document. Otherwise try the URL first and
  // fall back to discovery if it did not return keys.
  const bareOrigin = parseUserUrl(url)?.pathname === "/";
  let res: FetchJsonResult | undefined = bareOrigin
    ? undefined
    : await fetchJson(url);
  if ((!res || !looksLikeKeys(res)) && !url.includes("/.well-known/")) {
    const target = resolveDiscoveryTarget(url);
    if (target) {
      const disc = await fetchJson(target.discoveryUrl);
      if (!res || looksLikeKeys(disc)) {
        if (looksLikeKeys(disc))
          notes.push(
            bareOrigin
              ? "That is an issuer, so its discovery document was fetched."
              : "That URL did not return a JWKS, so it was treated as an issuer and its discovery document was fetched.",
          );
        res = disc;
      }
    }
  }
  if (!res) res = await fetchJson(url);
  if (
    res.ok &&
    typeof res.data === "object" &&
    res.data !== null &&
    typeof (res.data as DiscoveryDoc).jwks_uri === "string" &&
    !Array.isArray((res.data as { keys?: unknown }).keys)
  ) {
    const next = (res.data as DiscoveryDoc).jwks_uri as string;
    notes.push(`That was a discovery document; followed its jwks_uri.`);
    url = next;
    res = await fetchJson(next);
  }
  if (!res.ok) return { source: "fetched", url: res.url, fetch: res, notes };
  return {
    source: "fetched",
    url: res.url,
    fetch: res,
    summary: await summarizeJwks(res.data),
    notes,
  };
}

export type DiscoveryInspection = {
  target?: DiscoveryTarget;
  /** The discovery fetch, when the document was fetched (not pasted). */
  fetch?: FetchJsonResult;
  doc?: DiscoveryDoc;
  findings: Finding[];
  keycloak?: KeycloakInfo;
  keycloakNotes: { title: string; body: string }[];
  jwks?: JwksLoad;
};

/** Lint an already-obtained discovery document and load its JWKS. */
export async function inspectDiscoveryDoc(
  data: unknown,
  opts: {
    expectedIssuer?: string;
    target?: DiscoveryTarget;
    fetch?: FetchJsonResult;
    /** Supply keys directly (example data) instead of fetching jwks_uri. */
    jwks?: unknown;
  } = {},
): Promise<DiscoveryInspection> {
  if (typeof data !== "object" || data === null || Array.isArray(data))
    return {
      target: opts.target,
      fetch: opts.fetch,
      findings: [
        {
          severity: "error",
          rule: "not-object",
          title: "The discovery document is not a JSON object.",
        },
      ],
      keycloakNotes: [],
    };
  const doc = data as DiscoveryDoc;
  if (Array.isArray((doc as { keys?: unknown }).keys) && !doc.issuer)
    return {
      target: opts.target,
      fetch: opts.fetch,
      doc,
      findings: [
        {
          severity: "error",
          rule: "is-jwks",
          title:
            "This is a JWKS, not a discovery document. Use the JWKS Verifier for key sets.",
        },
      ],
      keycloakNotes: [],
    };

  const findings = lintDiscovery(doc, opts.expectedIssuer);
  const keycloak = detectKeycloak(
    typeof doc.issuer === "string" ? doc.issuer : opts.expectedIssuer,
  );

  let jwks: JwksLoad | undefined;
  if (opts.jwks !== undefined) {
    jwks = {
      source: "example",
      summary: await summarizeJwks(opts.jwks),
      notes: ["Example data — the jwks_uri was not fetched."],
    };
  } else if (typeof doc.jwks_uri === "string") {
    const res = await fetchJson(doc.jwks_uri);
    jwks = {
      source: "fetched",
      url: res.url,
      fetch: res,
      summary: res.ok ? await summarizeJwks(res.data) : undefined,
      notes: [],
    };
    if (res.ok && jwks.summary?.valid)
      findings.push({
        severity: "pass",
        rule: "jwks-reachable",
        title: `jwks_uri is reachable (${jwks.summary.keys.length} key${jwks.summary.keys.length === 1 ? "" : "s"})`,
      });
    else if (res.ok)
      findings.push({
        severity: "error",
        rule: "jwks-invalid",
        title: "jwks_uri did not return a valid JWKS",
      });
    else
      findings.push({
        severity: res.kind === "http" ? "error" : "warning",
        rule: "jwks-unreachable",
        title:
          res.kind === "http"
            ? `jwks_uri returned HTTP ${res.status}`
            : "jwks_uri could not be read from this browser",
        detail:
          res.kind === "http"
            ? "Clients will be unable to verify token signatures."
            : "This is often CORS or a network restriction rather than a broken endpoint — see the JWKS section below.",
      });
  }

  return {
    target: opts.target,
    fetch: opts.fetch,
    doc,
    findings,
    keycloak,
    keycloakNotes: keycloak ? keycloakNotes(keycloak, doc) : [],
    jwks,
  };
}

/** Fetch, lint, and summarize the discovery document for an issuer URL. */
export async function inspectIssuer(
  input: string,
): Promise<DiscoveryInspection> {
  const target = resolveDiscoveryTarget(input);
  if (!target)
    return {
      findings: [
        {
          severity: "error",
          rule: "invalid-url",
          title: "Enter a valid issuer or discovery URL.",
        },
      ],
      keycloakNotes: [],
    };
  const res = await fetchJson(target.discoveryUrl);
  if (!res.ok) return { target, fetch: res, findings: [], keycloakNotes: [] };
  return inspectDiscoveryDoc(res.data, {
    expectedIssuer: target.expectedIssuer,
    target,
    fetch: res,
  });
}
