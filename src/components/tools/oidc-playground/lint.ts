/**
 * Parse and lint OAuth 2.0 / OpenID Connect authorization request URLs and
 * callback (authorization response) URLs. Framework-free and synchronous —
 * pass an optional discovery document to check against what the server
 * advertises.
 */
import { AUTHORIZE_PARAMS, CALLBACK_PARAMS, type ParamInfo } from "./params.ts";
import { explainError, type ErrorExplanation } from "./errors.ts";
import { looksLikeS256Challenge } from "./pkce.ts";
import type { DiscoveryDocument } from "./discovery.ts";

export type Severity = "error" | "warning" | "info" | "ok";

export type Finding = {
  severity: Severity;
  /** The parameter this finding is about, if any. */
  param?: string;
  message: string;
};

export type UrlParam = {
  name: string;
  value: string;
  /** Where it came from in the URL. */
  source: "query" | "fragment";
  info?: ParamInfo;
};

export type UrlKind = "authorize" | "callback" | "unknown";

export type ParsedOidcUrl = {
  input: string;
  /** The URL without query/fragment, when the input was a full URL. */
  base?: string;
  params: UrlParam[];
  kind: UrlKind;
  errors: string[];
};

function splitParams(
  s: string,
  source: "query" | "fragment",
): Omit<UrlParam, "info">[] {
  const out: Omit<UrlParam, "info">[] = [];
  if (!s) return out;
  for (const [name, value] of new URLSearchParams(s)) {
    out.push({ name, value, source });
  }
  return out;
}

const CALLBACK_SIGNALS = [
  "code",
  "error",
  "access_token",
  "id_token",
  "response",
];

/**
 * Parse a pasted authorize or callback URL. Accepts a full URL, or just a
 * query string / fragment ("?code=..." or "#access_token=..."). Never throws.
 */
export function parseOidcUrl(raw: string): ParsedOidcUrl {
  const input = raw.trim();
  const result: ParsedOidcUrl = {
    input,
    params: [],
    kind: "unknown",
    errors: [],
  };
  if (!input) {
    result.errors.push("Paste an authorize URL or a callback URL.");
    return result;
  }

  let query = "";
  let fragment = "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(input)) {
    try {
      const u = new URL(input);
      result.base = `${u.origin === "null" ? `${u.protocol}//${u.host}` : u.origin}${u.pathname}`;
      query = u.search.replace(/^\?/, "");
      fragment = u.hash.replace(/^#/, "");
    } catch {
      result.errors.push("That does not parse as a URL.");
      return result;
    }
  } else {
    const hashAt = input.indexOf("#");
    const before = hashAt >= 0 ? input.slice(0, hashAt) : input;
    fragment = hashAt >= 0 ? input.slice(hashAt + 1) : "";
    query = before.replace(/^[^?]*\?/, "").replace(/^\?/, "");
    if (!before.includes("?") && !before.includes("=")) query = "";
  }

  const all = [
    ...splitParams(query, "query"),
    ...splitParams(fragment, "fragment"),
  ];
  const names = new Set(all.map((p) => p.name));
  const isAuthorize = names.has("response_type") || names.has("client_id");
  const isCallback = CALLBACK_SIGNALS.some((n) => names.has(n));
  result.kind = isAuthorize ? "authorize" : isCallback ? "callback" : "unknown";
  const ref = result.kind === "callback" ? CALLBACK_PARAMS : AUTHORIZE_PARAMS;
  result.params = all.map((p) => ({ ...p, info: ref[p.name] }));

  if (all.length === 0) {
    result.errors.push("No query or fragment parameters found.");
  } else if (result.kind === "unknown") {
    result.errors.push(
      "Could not tell whether this is an authorize request or a callback — no response_type, client_id, code, or error parameter.",
    );
  }
  return result;
}

/** Get the first value of a param, or undefined. */
function get(params: UrlParam[], name: string): string | undefined {
  return params.find((p) => p.name === name)?.value;
}

export type FlowInfo = {
  /** Human name, e.g. "Authorization code". */
  name: string;
  /** Whether the flow is recommended for new apps. */
  recommended: boolean;
  /** Short explanation. */
  note: string;
};

/** Describe the flow a response_type value implies. */
export function flowFor(
  responseType: string | undefined,
): FlowInfo | undefined {
  if (!responseType) return undefined;
  const parts = responseType.trim().split(/\s+/).sort().join(" ");
  switch (parts) {
    case "code":
      return {
        name: "Authorization code",
        recommended: true,
        note: "The server returns a short-lived code that the client exchanges (with its PKCE verifier) at the token endpoint. Recommended for every client type.",
      };
    case "token":
      return {
        name: "Implicit (OAuth 2.0)",
        recommended: false,
        note: "The access token is returned in the URL fragment. Deprecated by the OAuth 2.0 Security Best Current Practice (RFC 9700) and removed in OAuth 2.1 — tokens leak via browser history, referrers, and logs. Use code + PKCE.",
      };
    case "id_token":
      return {
        name: "Implicit (OpenID Connect, ID token only)",
        recommended: false,
        note: "An ID token is returned in the URL fragment with no access token. Use code + PKCE instead.",
      };
    case "id_token token":
      return {
        name: "Implicit (OpenID Connect)",
        recommended: false,
        note: "ID and access tokens are returned in the URL fragment. Deprecated — use code + PKCE.",
      };
    case "code id_token":
    case "code token":
    case "code id_token token":
      return {
        name: "Hybrid",
        recommended: false,
        note: "Some tokens come back in the front channel together with a code. Rarely needed, and harder to secure than plain code + PKCE.",
      };
    case "none":
      return {
        name: "None",
        recommended: false,
        note: "No code or tokens are returned — only state. Rarely used.",
      };
    default:
      return undefined;
  }
}

const PROMPT_VALUES = ["none", "login", "consent", "select_account", "create"];
const RESPONSE_MODES = [
  "query",
  "fragment",
  "form_post",
  "jwt",
  "query.jwt",
  "fragment.jwt",
  "form_post.jwt",
];

function isLoopbackHost(host: string): boolean {
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "[::1]"
  );
}

/** Lint a redirect_uri value. Exported for reuse. */
export function lintRedirectUri(value: string): Finding[] {
  const out: Finding[] = [];
  const param = "redirect_uri";
  if (value.includes("*")) {
    out.push({
      severity: "error",
      param,
      message:
        "Contains a wildcard (*). Wildcards belong in the client's registered redirect URIs (and even there should be avoided), never in the request — the request must carry one concrete URI.",
    });
  }
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    out.push({
      severity: "error",
      param,
      message: "Not an absolute URI. redirect_uri must be absolute.",
    });
    return out;
  }
  if (u.hash) {
    out.push({
      severity: "error",
      param,
      message:
        "Contains a fragment (#…). Redirect URIs must not include one (RFC 6749 §3.1.2).",
    });
  }
  if (u.protocol === "http:") {
    if (isLoopbackHost(u.hostname)) {
      out.push({
        severity: "info",
        param,
        message: `Loopback http redirect (${u.host}) — fine for local development. Keycloak matches the port exactly, so register this exact URI (or use a wildcard only in a dev realm). localhost and 127.0.0.1 are different strings to the server.`,
      });
    } else {
      out.push({
        severity: "warning",
        param,
        message:
          "Uses plain http on a non-loopback host. The authorization code travels in this URL — use https.",
      });
    }
  } else if (u.protocol === "https:") {
    out.push({ severity: "ok", param, message: "Uses https." });
  } else {
    out.push({
      severity: "info",
      param,
      message: `Custom scheme (${u.protocol}) — typical for native apps (RFC 8252). Prefer a reverse-domain scheme like com.example.app:/callback, and always use PKCE.`,
    });
  }
  return out;
}

export type AuthorizeLint = {
  flow?: FlowInfo;
  findings: Finding[];
};

/** Lint an authorization request's parameters. */
export function lintAuthorize(
  parsed: ParsedOidcUrl,
  discovery?: DiscoveryDocument,
): AuthorizeLint {
  const params = parsed.params;
  const findings: Finding[] = [];
  const push = (severity: Severity, message: string, param?: string) =>
    findings.push({ severity, message, param });

  if (params.some((p) => p.source === "fragment")) {
    push(
      "warning",
      "Some parameters are in the URL fragment (#…). Authorization request parameters belong in the query string — servers never see the fragment.",
    );
  }

  // Duplicates
  const counts = new Map<string, number>();
  for (const p of params) counts.set(p.name, (counts.get(p.name) ?? 0) + 1);
  for (const [name, n] of counts) {
    if (n > 1)
      push(
        "error",
        `Appears ${n} times. Parameters must not be repeated (RFC 6749 §3.1) — servers reject this with invalid_request.`,
        name,
      );
  }

  // response_type
  const responseType = get(params, "response_type");
  const flow = flowFor(responseType);
  const rtParts = (responseType ?? "").split(/\s+/).filter(Boolean);
  const implicitTokens =
    rtParts.includes("token") || rtParts.includes("id_token");
  if (!responseType) {
    push("error", "Missing. Use response_type=code.", "response_type");
  } else if (!flow) {
    push(
      "error",
      `Unrecognized value "${responseType}". Valid values are code, token, id_token, and their space-separated combinations.`,
      "response_type",
    );
  } else if (flow.recommended) {
    push("ok", `${flow.name} flow.`, "response_type");
  } else {
    push("warning", `${flow.name} flow. ${flow.note}`, "response_type");
  }

  // client_id
  if (!get(params, "client_id")) push("error", "Missing.", "client_id");

  // scope
  const scope = get(params, "scope");
  const scopes = (scope ?? "").split(/\s+/).filter(Boolean);
  if (!scope) {
    push(
      "warning",
      "No scope. Without openid this is plain OAuth 2.0 — you will not get an ID token.",
      "scope",
    );
  } else {
    if (scope.includes(",") && !scope.includes(" "))
      push(
        "warning",
        "Scopes look comma-separated. The separator is a space (encoded as + or %20).",
        "scope",
      );
    if (!scopes.includes("openid"))
      push(
        "warning",
        "openid is missing, so this is plain OAuth 2.0 — no ID token and no userinfo.",
        "scope",
      );
    else push("ok", "Includes openid.", "scope");
    if (scopes.includes("offline_access"))
      push(
        "info",
        "offline_access requests an offline refresh token that outlives the browser session. Make sure the app really needs it.",
        "scope",
      );
  }

  // PKCE
  const challenge = get(params, "code_challenge");
  const method = get(params, "code_challenge_method");
  const usesCode = rtParts.includes("code");
  if (usesCode) {
    if (!challenge) {
      push(
        "warning",
        "No PKCE. A code_challenge is required for public clients (SPAs, mobile apps) and recommended for all clients (RFC 9700, OAuth 2.1).",
        "code_challenge",
      );
    } else if (!method) {
      push(
        "warning",
        "code_challenge_method is missing, so the server assumes plain. Send code_challenge_method=S256.",
        "code_challenge_method",
      );
    } else if (method === "plain") {
      push(
        "warning",
        "plain offers no protection if the authorize request is intercepted. Use S256.",
        "code_challenge_method",
      );
    } else if (method === "S256") {
      if (looksLikeS256Challenge(challenge))
        push("ok", "PKCE with S256.", "code_challenge");
      else
        push(
          "error",
          `An S256 challenge is exactly 43 base64url characters; this one is ${challenge.length}. Check it is base64url (not hex or standard base64) without padding.`,
          "code_challenge",
        );
    } else {
      push(
        "error",
        `Unknown method "${method}". Use S256.`,
        "code_challenge_method",
      );
    }
  } else if (challenge) {
    push(
      "info",
      "PKCE parameters are present but no code is requested, so they have no effect.",
      "code_challenge",
    );
  }

  // state
  const state = get(params, "state");
  if (!state) {
    push(
      "warning",
      "Missing. Without state (or PKCE) the callback is open to CSRF / login-fixation. Send an unguessable value and check it on return.",
      "state",
    );
  } else if (state.length < 16) {
    push(
      "warning",
      `Only ${state.length} characters. Use at least ~128 bits of randomness (for example 32 random bytes, base64url-encoded).`,
      "state",
    );
  } else {
    push("ok", `Present (${state.length} characters).`, "state");
  }

  // nonce
  const nonce = get(params, "nonce");
  if (rtParts.includes("id_token") && !nonce) {
    push(
      "error",
      "Required when an ID token is returned from the authorization endpoint (implicit/hybrid flow) — OIDC Core §3.2.2.1.",
      "nonce",
    );
  } else if (!nonce && scopes.includes("openid")) {
    push(
      "info",
      "No nonce. Optional for the code flow, but recommended: it binds the ID token to this request.",
      "nonce",
    );
  } else if (nonce && nonce.length < 16) {
    push(
      "warning",
      `Only ${nonce.length} characters. Use a long random value.`,
      "nonce",
    );
  } else if (nonce) {
    push("ok", `Present (${nonce.length} characters).`, "nonce");
  }

  // redirect_uri
  const redirectUri = get(params, "redirect_uri");
  if (!redirectUri) {
    push(
      "warning",
      "Missing. OpenID Connect requires redirect_uri, and Keycloak only lets you omit it when the client has exactly one non-wildcard redirect URI. Send it explicitly.",
      "redirect_uri",
    );
  } else {
    findings.push(...lintRedirectUri(redirectUri));
  }

  // response_mode
  const responseMode = get(params, "response_mode");
  if (responseMode) {
    if (!RESPONSE_MODES.includes(responseMode)) {
      push(
        "error",
        `Unknown response_mode "${responseMode}".`,
        "response_mode",
      );
    } else if (responseMode === "query" && implicitTokens) {
      push(
        "error",
        "Tokens must never be returned in the query string. Implicit/hybrid responses use fragment or form_post.",
        "response_mode",
      );
    } else if (responseMode.startsWith("form_post")) {
      push(
        "info",
        "form_post: the server POSTs the response to redirect_uri, so it needs a server-side handler (a static SPA page cannot read a POST body).",
        "response_mode",
      );
    } else {
      push("ok", `${responseMode}.`, "response_mode");
    }
  }

  // prompt
  const prompt = get(params, "prompt");
  if (prompt) {
    const values = prompt.split(/\s+/).filter(Boolean);
    const unknown = values.filter((v) => !PROMPT_VALUES.includes(v));
    if (unknown.length)
      push(
        "warning",
        `Unknown prompt value(s): ${unknown.join(", ")}.`,
        "prompt",
      );
    if (values.includes("none") && values.length > 1)
      push(
        "error",
        "prompt=none cannot be combined with other values.",
        "prompt",
      );
    else if (values.includes("none"))
      push(
        "info",
        "Silent request: if the user has no session (or must consent / complete an action), the server returns login_required, consent_required, or interaction_required instead of showing a page.",
        "prompt",
      );
  }

  // max_age
  const maxAge = get(params, "max_age");
  if (maxAge !== undefined) {
    if (!/^\d+$/.test(maxAge))
      push("error", "Must be a non-negative integer (seconds).", "max_age");
    else if (maxAge === "0")
      push(
        "info",
        "max_age=0 forces re-authentication, like prompt=login. The ID token will carry auth_time.",
        "max_age",
      );
    else
      push(
        "info",
        `Re-authenticate if the last login was more than ${maxAge} seconds ago. Check auth_time in the ID token.`,
        "max_age",
      );
  }

  // Unknown params
  for (const p of params) {
    if (!AUTHORIZE_PARAMS[p.name] && !(counts.get(p.name)! > 1)) {
      push(
        "info",
        "Not a standard OAuth/OIDC or Keycloak parameter. Servers usually ignore unknown parameters — check for a typo.",
        p.name,
      );
    }
  }

  // Discovery-based checks
  if (discovery) findings.push(...lintAgainstDiscovery(parsed, discovery));

  return { flow, findings };
}

function lintAgainstDiscovery(
  parsed: ParsedOidcUrl,
  d: DiscoveryDocument,
): Finding[] {
  const out: Finding[] = [];
  const params = parsed.params;
  if (parsed.base && d.authorization_endpoint) {
    if (parsed.base === d.authorization_endpoint)
      out.push({
        severity: "ok",
        message: "The URL matches the advertised authorization_endpoint.",
      });
    else
      out.push({
        severity: "warning",
        message: `The URL (${parsed.base}) is not the advertised authorization_endpoint (${d.authorization_endpoint}).`,
      });
  }
  const rt = get(params, "response_type");
  if (rt && d.response_types_supported) {
    const norm = (s: string) => s.split(/\s+/).sort().join(" ");
    if (!d.response_types_supported.map(norm).includes(norm(rt)))
      out.push({
        severity: "error",
        param: "response_type",
        message: `The server does not list "${rt}" in response_types_supported.`,
      });
  }
  const method = get(params, "code_challenge_method");
  if (
    method &&
    d.code_challenge_methods_supported &&
    !d.code_challenge_methods_supported.includes(method)
  )
    out.push({
      severity: "error",
      param: "code_challenge_method",
      message: `The server does not list "${method}" in code_challenge_methods_supported.`,
    });
  const rm = get(params, "response_mode");
  if (
    rm &&
    d.response_modes_supported &&
    !d.response_modes_supported.includes(rm)
  )
    out.push({
      severity: "error",
      param: "response_mode",
      message: `The server does not list "${rm}" in response_modes_supported.`,
    });
  const scope = get(params, "scope");
  if (scope && d.scopes_supported) {
    const missing = scope
      .split(/\s+/)
      .filter(Boolean)
      .filter((s) => !d.scopes_supported!.includes(s));
    if (missing.length)
      out.push({
        severity: "info",
        param: "scope",
        message: `Not in scopes_supported: ${missing.join(", ")}. Servers do not have to list every scope (Keycloak lists realm client scopes), so this may still work — but check for typos.`,
      });
  }
  const prompt = get(params, "prompt");
  if (prompt && d.prompt_values_supported) {
    const missing = prompt
      .split(/\s+/)
      .filter((p) => !d.prompt_values_supported!.includes(p));
    if (missing.length)
      out.push({
        severity: "warning",
        param: "prompt",
        message: `Not in prompt_values_supported: ${missing.join(", ")}.`,
      });
  }
  return out;
}

export type CallbackLint = {
  findings: Finding[];
  error?: ErrorExplanation & { description?: string; uri?: string };
};

/**
 * Lint a callback URL. Pass `expectedState` / `expectedIssuer` when you have
 * them (the playground does); the inspector checks what it can without.
 */
export function lintCallback(
  parsed: ParsedOidcUrl,
  opts?: { expectedState?: string; expectedIssuer?: string },
): CallbackLint {
  const params = parsed.params;
  const findings: Finding[] = [];
  const push = (severity: Severity, message: string, param?: string) =>
    findings.push({ severity, message, param });

  const tokenInQuery = params.some(
    (p) =>
      p.source === "query" &&
      (p.name === "access_token" || p.name === "id_token"),
  );
  if (tokenInQuery)
    push(
      "error",
      "Tokens are in the query string. They will end up in server logs, browser history, and Referer headers.",
    );
  if (params.some((p) => p.name === "access_token" || p.name === "id_token"))
    push(
      "warning",
      "Tokens were returned in the URL (implicit or hybrid flow). Prefer the authorization code flow with PKCE.",
    );

  const code = get(params, "code");
  const error = get(params, "error");
  const state = get(params, "state");
  const iss = get(params, "iss");

  let explained: CallbackLint["error"];
  if (error) {
    const description = get(params, "error_description");
    const ex = explainError(error, description);
    if (ex) explained = { ...ex, description, uri: get(params, "error_uri") };
    push(
      "error",
      `The server returned error=${error}${description ? `: ${description}` : ""}.`,
      "error",
    );
  } else if (code) {
    push(
      "ok",
      `Authorization code received (${code.length} characters). It is single-use and short-lived — exchange it immediately.`,
      "code",
    );
  }

  if (!state) {
    push(
      "warning",
      "No state. If the request sent one, the server should echo it — if the request did not, the client has no CSRF protection beyond PKCE.",
      "state",
    );
  } else if (opts?.expectedState !== undefined) {
    if (state === opts.expectedState)
      push("ok", "Matches the stored state.", "state");
    else
      push(
        "error",
        "Does not match the stored state. Do not exchange this code — it may be a CSRF attempt, a stale tab, or a different flow's callback.",
        "state",
      );
  } else {
    push(
      "info",
      "Present. The client must compare it with the value it stored before redirecting.",
      "state",
    );
  }

  if (iss) {
    if (opts?.expectedIssuer !== undefined) {
      if (iss.replace(/\/+$/, "") === opts.expectedIssuer.replace(/\/+$/, ""))
        push(
          "ok",
          "Matches the expected issuer (RFC 9207 mix-up protection).",
          "iss",
        );
      else
        push(
          "error",
          `Expected ${opts.expectedIssuer} but got ${iss}. Do not use this response.`,
          "iss",
        );
    } else {
      push(
        "info",
        "The client should check iss equals the issuer it started the flow with (RFC 9207).",
        "iss",
      );
    }
  }

  return { findings, error: explained };
}
