// Unit tests for the OIDC tools' framework-free core. Node strips the
// TypeScript types itself (Node 22.18+ or 24), so no build step is needed:
//   node --test src/components/tools/oidc-playground/test/
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  bytesToBase64Url,
  challengePlain,
  challengeS256,
  generateCodeVerifier,
  looksLikeS256Challenge,
  randomString,
  randomToken,
  validateCodeVerifier,
} from "../pkce.ts";
import {
  AUTHORIZE_PARAMS,
  buildAuthorizeUrl,
  buildLogoutUrl,
} from "../params.ts";
import {
  flowFor,
  lintAuthorize,
  lintCallback,
  lintRedirectUri,
  parseOidcUrl,
  type Finding,
} from "../lint.ts";
import { errorFromBody, explainError, OAUTH_ERRORS } from "../errors.ts";
import { checkIdTokenClaims, computeAtHash } from "../tokens.ts";
import {
  checkDiscovery,
  discoveryUrlFor,
  fetchDiscovery,
  FriendlyFetchError,
  guessKeycloakIssuer,
  issuerFromInput,
  type DiscoveryDocument,
} from "../discovery.ts";

const VERIFIER_RE = /^[A-Za-z0-9\-._~]+$/;
const sha256b64url = (s: string) =>
  createHash("sha256").update(s).digest("base64url");

/** Findings for a param, optionally filtered by severity. */
function about(findings: Finding[], param: string, severity?: string) {
  return findings.filter(
    (f) => f.param === param && (!severity || f.severity === severity),
  );
}
const severities = (findings: Finding[]) =>
  new Set(findings.map((f) => f.severity));

/* ------------------------------------------------------------------ */
/* pkce.ts                                                             */
/* ------------------------------------------------------------------ */

test("pkce: bytesToBase64Url is unpadded base64url", () => {
  assert.equal(bytesToBase64Url(new Uint8Array([251, 255, 191])), "-_-_");
  assert.equal(bytesToBase64Url(new Uint8Array([1])), "AQ");
  assert.equal(bytesToBase64Url(new Uint8Array([])), "");
});

test("pkce: generated verifiers are valid and clamped to 43..128", () => {
  for (const n of [1, 43, 64, 128, 500]) {
    const v = generateCodeVerifier(n);
    assert.equal(v.length, Math.min(128, Math.max(43, n)));
    assert.match(v, VERIFIER_RE);
    assert.equal(validateCodeVerifier(v).ok, true);
  }
  assert.notEqual(generateCodeVerifier(), generateCodeVerifier());
});

test("pkce: randomString uses only the given charset", () => {
  const s = randomString(2000, "ab");
  assert.match(s, /^[ab]{2000}$/);
  assert.ok(s.includes("a") && s.includes("b"));
});

test("pkce: randomToken encodes the requested entropy", () => {
  assert.equal(randomToken(32).length, 43);
  assert.match(randomToken(16), /^[A-Za-z0-9_-]{22}$/);
});

test("pkce: S256 challenge matches an independent SHA-256", async () => {
  for (const v of [
    "dBjftJeZ4CVP-mJ92K1lfklzS5ytu4dWNtDqaSsRwNs",
    generateCodeVerifier(43),
    generateCodeVerifier(128),
  ]) {
    const c = await challengeS256(v);
    assert.equal(c, sha256b64url(v));
    assert.equal(looksLikeS256Challenge(c), true);
  }
  assert.equal(challengePlain("abc"), "abc");
});

test("pkce: validateCodeVerifier reports length and charset problems", () => {
  const short = validateCodeVerifier("short!");
  assert.equal(short.ok, false);
  assert.equal(short.problems.length, 2);
  assert.match(short.problems[0], /Too short: 6/);
  assert.match(short.problems[1], /"!"/);
  assert.match(validateCodeVerifier("a".repeat(129)).problems[0], /Too long/);
  assert.equal(validateCodeVerifier("a".repeat(43)).ok, true);
  assert.equal(validateCodeVerifier(`${"a".repeat(42)}+`).ok, false);
});

test("pkce: looksLikeS256Challenge", () => {
  assert.equal(looksLikeS256Challenge("a".repeat(43)), true);
  assert.equal(looksLikeS256Challenge("a".repeat(44)), false);
  assert.equal(looksLikeS256Challenge(`${"a".repeat(42)}=`), false);
  assert.equal(looksLikeS256Challenge(`${"a".repeat(42)}+`), false);
});

/* ------------------------------------------------------------------ */
/* params.ts                                                           */
/* ------------------------------------------------------------------ */

const AUTH_REQ = {
  authorizationEndpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/auth",
  clientId: "my-spa",
  redirectUri: "https://app.example.com/callback/",
  scope: "  openid   profile email ",
  state: "s".repeat(43),
  nonce: "n".repeat(43),
  codeChallenge: "c".repeat(43),
};

test("params: buildAuthorizeUrl builds a code + PKCE S256 request", () => {
  const { url, params } = buildAuthorizeUrl(AUTH_REQ);
  const u = new URL(url);
  assert.equal(`${u.origin}${u.pathname}`, AUTH_REQ.authorizationEndpoint);
  assert.equal(u.searchParams.get("response_type"), "code");
  assert.equal(u.searchParams.get("client_id"), "my-spa");
  assert.equal(u.searchParams.get("redirect_uri"), AUTH_REQ.redirectUri);
  assert.equal(u.searchParams.get("scope"), "openid profile email");
  assert.equal(u.searchParams.get("code_challenge_method"), "S256");
  assert.deepEqual(
    params.map((p) => p.name),
    [
      "response_type",
      "client_id",
      "redirect_uri",
      "scope",
      "state",
      "nonce",
      "code_challenge",
      "code_challenge_method",
    ],
  );
  assert.ok(params.every((p) => p.info && p.info.desc.length > 0));
});

test("params: extra params are trimmed and empty ones omitted", () => {
  const { url, params } = buildAuthorizeUrl({
    ...AUTH_REQ,
    extra: {
      prompt: "login",
      login_hint: " alice@example.com ",
      kc_idp_hint: "",
      acr_values: "   ",
      ui_locales: "de en",
      max_age: undefined,
    },
  });
  const u = new URL(url);
  assert.equal(u.searchParams.get("prompt"), "login");
  assert.equal(u.searchParams.get("login_hint"), "alice@example.com");
  assert.equal(u.searchParams.get("ui_locales"), "de en");
  assert.equal(u.searchParams.has("kc_idp_hint"), false);
  assert.equal(u.searchParams.has("acr_values"), false);
  assert.equal(u.searchParams.has("max_age"), false);
  assert.equal(params.length, 11);
});

test("params: the built URL passes the linter cleanly", () => {
  const { url } = buildAuthorizeUrl({
    ...AUTH_REQ,
    extra: { kc_idp_hint: "corp", acr_values: "gold", ui_locales: "de" },
  });
  const { findings, flow } = lintAuthorize(parseOidcUrl(url));
  assert.equal(flow?.name, "Authorization code");
  assert.deepEqual(
    findings.filter((f) => f.severity === "error" || f.severity === "warning"),
    [],
  );
});

test("params: Keycloak extension params are flagged as such", () => {
  assert.equal(AUTHORIZE_PARAMS.kc_idp_hint.keycloak, true);
  assert.equal(AUTHORIZE_PARAMS.kc_action.keycloak, true);
  assert.equal(AUTHORIZE_PARAMS.login_hint.keycloak, undefined);
});

test("params: buildLogoutUrl", () => {
  const withHint = new URL(
    buildLogoutUrl({
      endSessionEndpoint:
        "https://auth.example.com/realms/demo/protocol/openid-connect/logout",
      idTokenHint: "eyJ.x.y",
      clientId: "my-spa",
      postLogoutRedirectUri: "https://app.example.com/",
      state: "st",
    }),
  );
  assert.equal(withHint.searchParams.get("id_token_hint"), "eyJ.x.y");
  assert.equal(withHint.searchParams.get("client_id"), "my-spa");
  assert.equal(
    withHint.searchParams.get("post_logout_redirect_uri"),
    "https://app.example.com/",
  );
  assert.equal(withHint.searchParams.get("state"), "st");
  const noHint = new URL(
    buildLogoutUrl({
      endSessionEndpoint: "https://auth.example.com/logout",
      clientId: "c",
      postLogoutRedirectUri: "https://app.example.com/",
      state: "st",
    }),
  );
  assert.equal(noHint.searchParams.has("id_token_hint"), false);
});

/* ------------------------------------------------------------------ */
/* lint.ts — parsing                                                   */
/* ------------------------------------------------------------------ */

test("lint: parseOidcUrl classifies authorize and callback URLs", () => {
  const a = parseOidcUrl(
    "https://h/realms/r/protocol/openid-connect/auth?response_type=code&client_id=x",
  );
  assert.equal(a.kind, "authorize");
  assert.equal(a.base, "https://h/realms/r/protocol/openid-connect/auth");

  const c = parseOidcUrl("https://app/cb?code=abc&state=s");
  assert.equal(c.kind, "callback");
  assert.equal(c.params.find((p) => p.name === "code")?.source, "query");
  assert.ok(c.params.find((p) => p.name === "code")?.info);

  const f = parseOidcUrl("https://app/cb#access_token=t&state=s");
  assert.equal(f.kind, "callback");
  assert.equal(f.params[0].source, "fragment");
});

test("lint: parseOidcUrl accepts bare query strings and fragments", () => {
  assert.equal(parseOidcUrl("?code=abc&state=x").kind, "callback");
  assert.equal(parseOidcUrl("code=abc&state=x").params.length, 2);
  assert.equal(parseOidcUrl("#id_token=t").params[0].source, "fragment");
  assert.equal(parseOidcUrl("com.example.app:/cb?code=1").kind, "callback");
});

test("lint: parseOidcUrl reports empty, unparseable, and unknown input", () => {
  assert.equal(parseOidcUrl("  ").errors.length, 1);
  assert.equal(
    parseOidcUrl("Invalid parameter: redirect_uri").params.length,
    0,
  );
  const unknown = parseOidcUrl("https://example.com/?foo=bar");
  assert.equal(unknown.kind, "unknown");
  assert.match(unknown.errors[0], /Could not tell/);
});

test("lint: flowFor", () => {
  assert.equal(flowFor("code")?.recommended, true);
  assert.equal(flowFor("token")?.name, "Implicit (OAuth 2.0)");
  assert.equal(flowFor("token id_token")?.name, "Implicit (OpenID Connect)");
  assert.equal(flowFor("id_token code")?.name, "Hybrid");
  assert.equal(flowFor("none")?.recommended, false);
  assert.equal(flowFor("bogus"), undefined);
  assert.equal(flowFor(undefined), undefined);
});

/* ------------------------------------------------------------------ */
/* lint.ts — authorize requests                                        */
/* ------------------------------------------------------------------ */

const BASE =
  "https://auth.example.com/realms/demo/protocol/openid-connect/auth";
const GOOD = {
  response_type: "code",
  client_id: "my-spa",
  redirect_uri: "https://app.example.com/callback",
  scope: "openid profile",
  state: "Zr1qJm3x9KcV8pL2nT6wQy4sB7dF0hGa",
  nonce: "Xc8vN2mK5pQ9rT3wY6zA1bD4fG7hJ0kL",
  code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  code_challenge_method: "S256",
};
function authUrl(
  overrides: Record<string, string | null> = {},
  extra = "",
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...GOOD, ...overrides })) {
    if (v !== null) params.set(k, v);
  }
  return `${BASE}?${params.toString()}${extra}`;
}
const lint = (url: string, d?: DiscoveryDocument) =>
  lintAuthorize(parseOidcUrl(url), d).findings;

test("lint: a good code + PKCE request has only ok findings", () => {
  const findings = lint(authUrl());
  assert.deepEqual([...severities(findings)], ["ok"]);
});

test("lint: missing response_type, client_id, scope", () => {
  const f = lint(
    authUrl({ response_type: null, client_id: null, scope: null }),
  );
  assert.equal(about(f, "response_type", "error").length, 1);
  assert.equal(about(f, "client_id", "error").length, 1);
  assert.match(about(f, "scope", "warning")[0].message, /plain OAuth 2.0/);
});

test("lint: unknown response_type is an error", () => {
  assert.equal(
    about(lint(authUrl({ response_type: "cod" })), "response_type", "error")
      .length,
    1,
  );
});

test("lint: implicit and hybrid flows warn; id_token without nonce is an error", () => {
  const implicit = lint(
    authUrl({ response_type: "id_token token", nonce: null }),
  );
  assert.match(
    about(implicit, "response_type", "warning")[0].message,
    /Implicit/,
  );
  assert.equal(about(implicit, "nonce", "error").length, 1);
  const hybrid = lint(authUrl({ response_type: "code id_token" }));
  assert.match(about(hybrid, "response_type", "warning")[0].message, /Hybrid/);
});

test("lint: scope checks", () => {
  assert.match(
    about(lint(authUrl({ scope: "profile" })), "scope", "warning")[0].message,
    /openid is missing/,
  );
  assert.match(
    about(lint(authUrl({ scope: "openid,profile" })), "scope", "warning")
      .map((f) => f.message)
      .join(" "),
    /comma-separated/,
  );
  assert.equal(
    about(lint(authUrl({ scope: "openid offline_access" })), "scope", "info")
      .length,
    1,
  );
});

test("lint: PKCE checks", () => {
  assert.match(
    about(
      lint(authUrl({ code_challenge: null, code_challenge_method: null })),
      "code_challenge",
      "warning",
    )[0].message,
    /No PKCE/,
  );
  assert.match(
    about(
      lint(authUrl({ code_challenge_method: null })),
      "code_challenge_method",
      "warning",
    )[0].message,
    /assumes plain/,
  );
  assert.match(
    about(
      lint(authUrl({ code_challenge_method: "plain" })),
      "code_challenge_method",
      "warning",
    )[0].message,
    /Use S256/,
  );
  assert.match(
    about(
      lint(authUrl({ code_challenge: "abc" })),
      "code_challenge",
      "error",
    )[0].message,
    /43 base64url/,
  );
  assert.equal(
    about(
      lint(authUrl({ code_challenge_method: "S512" })),
      "code_challenge_method",
      "error",
    ).length,
    1,
  );
  assert.equal(
    about(lint(authUrl({ response_type: "token" })), "code_challenge", "info")
      .length,
    1,
  );
});

test("lint: state and nonce presence and length", () => {
  assert.match(
    about(lint(authUrl({ state: null })), "state", "warning")[0].message,
    /CSRF/,
  );
  assert.match(
    about(lint(authUrl({ state: "abc" })), "state", "warning")[0].message,
    /Only 3/,
  );
  assert.equal(
    about(lint(authUrl({ nonce: null })), "nonce", "info").length,
    1,
  );
  assert.match(
    about(lint(authUrl({ nonce: "short" })), "nonce", "warning")[0].message,
    /Only 5/,
  );
});

test("lint: redirect_uri checks", () => {
  assert.equal(
    about(lint(authUrl({ redirect_uri: null })), "redirect_uri", "warning")
      .length,
    1,
  );
  assert.equal(
    about(lintRedirectUri("https://app.example.com/*"), "redirect_uri", "error")
      .length,
    1,
  );
  assert.equal(
    about(lintRedirectUri("/callback"), "redirect_uri", "error").length,
    1,
  );
  assert.match(
    about(
      lintRedirectUri("https://app.example.com/cb#x"),
      "redirect_uri",
      "error",
    )[0].message,
    /fragment/,
  );
  assert.match(
    about(
      lintRedirectUri("http://app.example.com/cb"),
      "redirect_uri",
      "warning",
    )[0].message,
    /plain http/,
  );
  for (const loopback of [
    "http://localhost:3000/",
    "http://127.0.0.1:8080/cb",
    "http://[::1]/cb",
    "http://app.localhost/",
  ]) {
    assert.equal(
      about(lintRedirectUri(loopback), "redirect_uri", "info").length,
      1,
      loopback,
    );
  }
  assert.match(
    about(lintRedirectUri("com.example.app:/oauth"), "redirect_uri", "info")[0]
      .message,
    /native/,
  );
  assert.equal(
    about(lintRedirectUri("https://app.example.com/cb"), "redirect_uri", "ok")
      .length,
    1,
  );
});

test("lint: response_mode checks", () => {
  assert.equal(
    about(lint(authUrl({ response_mode: "query" })), "response_mode", "ok")
      .length,
    1,
  );
  assert.equal(
    about(
      lint(
        authUrl({ response_type: "id_token token", response_mode: "query" }),
      ),
      "response_mode",
      "error",
    ).length,
    1,
  );
  assert.match(
    about(
      lint(authUrl({ response_mode: "form_post" })),
      "response_mode",
      "info",
    )[0].message,
    /server-side/,
  );
  assert.equal(
    about(lint(authUrl({ response_mode: "post" })), "response_mode", "error")
      .length,
    1,
  );
});

test("lint: prompt and max_age checks", () => {
  assert.equal(
    about(lint(authUrl({ prompt: "none login" })), "prompt", "error").length,
    1,
  );
  assert.match(
    about(lint(authUrl({ prompt: "none" })), "prompt", "info")[0].message,
    /login_required/,
  );
  assert.equal(
    about(lint(authUrl({ prompt: "always" })), "prompt", "warning").length,
    1,
  );
  assert.equal(
    about(lint(authUrl({ prompt: "login consent" })), "prompt").length,
    0,
  );
  assert.equal(
    about(lint(authUrl({ max_age: "-1" })), "max_age", "error").length,
    1,
  );
  assert.match(
    about(lint(authUrl({ max_age: "0" })), "max_age", "info")[0].message,
    /prompt=login/,
  );
  assert.equal(
    about(lint(authUrl({ max_age: "300" })), "max_age", "info").length,
    1,
  );
});

test("lint: duplicate, unknown, and fragment parameters", () => {
  const dup = lint(authUrl({}, "&scope=email"));
  assert.match(about(dup, "scope", "error")[0].message, /Appears 2 times/);
  assert.equal(about(lint(authUrl({ foo: "1" })), "foo", "info").length, 1);
  assert.equal(
    about(lint(authUrl({ kc_idp_hint: "corp" })), "kc_idp_hint").length,
    0,
  );
  const frag = lint(authUrl({}, "#state=x"));
  assert.ok(
    frag.some(
      (f) => !f.param && f.severity === "warning" && /fragment/.test(f.message),
    ),
  );
});

test("lint: checks against a discovery document", () => {
  const d: DiscoveryDocument = {
    issuer: "https://auth.example.com/realms/demo",
    authorization_endpoint: BASE,
    response_types_supported: ["code", "id_token token"],
    code_challenge_methods_supported: ["S256"],
    response_modes_supported: ["query", "fragment"],
    scopes_supported: ["openid", "profile"],
    prompt_values_supported: ["none", "login"],
  };
  assert.ok(
    lint(authUrl(), d).some(
      (f) =>
        f.severity === "ok" &&
        /advertised authorization_endpoint/.test(f.message),
    ),
  );
  assert.ok(
    lint(authUrl().replace("/auth?", "/authz?"), d).some(
      (f) => f.severity === "warning" && /not the advertised/.test(f.message),
    ),
  );
  assert.equal(
    about(
      lint(authUrl({ response_type: "token id_token", nonce: GOOD.nonce }), d),
      "response_type",
      "error",
    ).length,
    0,
  );
  assert.equal(
    about(
      lint(authUrl({ response_type: "code token" }), d),
      "response_type",
      "error",
    ).length,
    1,
  );
  assert.equal(
    about(
      lint(authUrl({ code_challenge_method: "plain" }), d),
      "code_challenge_method",
      "error",
    ).length,
    1,
  );
  assert.equal(
    about(
      lint(authUrl({ response_mode: "form_post" }), d),
      "response_mode",
      "error",
    ).length,
    1,
  );
  assert.match(
    about(lint(authUrl({ scope: "openid email" }), d), "scope", "info")[0]
      .message,
    /email/,
  );
  assert.equal(
    about(lint(authUrl({ prompt: "consent" }), d), "prompt", "warning").length,
    1,
  );
});

/* ------------------------------------------------------------------ */
/* lint.ts — callbacks                                                 */
/* ------------------------------------------------------------------ */

test("lint: callback with code and matching state/iss", () => {
  const p = parseOidcUrl(
    "https://app/cb?code=abc&state=s1&iss=https%3A%2F%2Fauth.example.com%2Frealms%2Fdemo",
  );
  const { findings, error } = lintCallback(p, {
    expectedState: "s1",
    expectedIssuer: "https://auth.example.com/realms/demo/",
  });
  assert.equal(error, undefined);
  assert.deepEqual([...severities(findings)], ["ok"]);
});

test("lint: callback state and iss mismatches are errors", () => {
  const p = parseOidcUrl(
    "https://app/cb?code=abc&state=s1&iss=https%3A%2F%2Fevil.example",
  );
  const { findings } = lintCallback(p, {
    expectedState: "s2",
    expectedIssuer: "https://auth.example.com",
  });
  assert.equal(about(findings, "state", "error").length, 1);
  assert.equal(about(findings, "iss", "error").length, 1);
});

test("lint: callback without expectations gives guidance", () => {
  const { findings } = lintCallback(
    parseOidcUrl("https://app/cb?code=abc&state=s&iss=x"),
  );
  assert.equal(about(findings, "state", "info").length, 1);
  assert.equal(about(findings, "iss", "info").length, 1);
  assert.equal(
    about(
      lintCallback(parseOidcUrl("https://app/cb?code=abc")).findings,
      "state",
      "warning",
    ).length,
    1,
  );
});

test("lint: callback errors are explained", () => {
  const { findings, error } = lintCallback(
    parseOidcUrl(
      "https://app/cb?error=login_required&error_description=Login+required&error_uri=https%3A%2F%2Fdocs&state=s",
    ),
  );
  assert.equal(about(findings, "error", "error").length, 1);
  assert.equal(error?.code, "login_required");
  assert.equal(error?.description, "Login required");
  assert.equal(error?.uri, "https://docs");
  assert.ok((error?.causes.length ?? 0) > 0);
});

test("lint: tokens in the callback URL", () => {
  const q = lintCallback(
    parseOidcUrl("https://app/cb?access_token=t&state=s"),
  ).findings;
  assert.ok(
    q.some((f) => f.severity === "error" && /query string/.test(f.message)),
  );
  const frag = lintCallback(
    parseOidcUrl("https://app/cb#id_token=t&state=s"),
  ).findings;
  assert.ok(!frag.some((f) => f.severity === "error"));
  assert.ok(
    frag.some(
      (f) => f.severity === "warning" && /implicit or hybrid/.test(f.message),
    ),
  );
});

/* ------------------------------------------------------------------ */
/* errors.ts                                                           */
/* ------------------------------------------------------------------ */

test("errors: every standard code has an explanation", () => {
  for (const code of [
    "invalid_request",
    "unauthorized_client",
    "access_denied",
    "unsupported_response_type",
    "invalid_scope",
    "server_error",
    "temporarily_unavailable",
    "interaction_required",
    "login_required",
    "account_selection_required",
    "consent_required",
    "invalid_grant",
    "invalid_client",
    "unsupported_grant_type",
    "invalid_token",
    "insufficient_scope",
  ]) {
    const ex = explainError(code);
    assert.equal(ex?.code, code);
    assert.ok(ex?.title && ex.meaning, code);
    assert.ok(OAUTH_ERRORS[code].causes.length > 0, code);
  }
});

test("errors: Keycloak error-page descriptions are recognized", () => {
  assert.equal(
    explainError(undefined, "Invalid parameter: redirect_uri")?.code,
    "invalid_redirect_uri",
  );
  assert.equal(
    explainError(undefined, "Invalid redirect uri")?.code,
    "invalid_redirect_uri",
  );
  assert.equal(
    explainError(undefined, "Client not found.")?.code,
    "client_not_found",
  );
  assert.equal(
    explainError(undefined, "Code not valid")?.code,
    "invalid_grant",
  );
  assert.equal(
    explainError(undefined, "PKCE verification failed: Invalid code verifier")
      ?.code,
    "invalid_grant",
  );
  assert.equal(explainError(undefined, "nothing relevant"), undefined);
  assert.equal(explainError(undefined), undefined);
});

test("errors: a known code wins over the description", () => {
  assert.equal(
    explainError("invalid_request", "Invalid parameter: redirect_uri")?.code,
    "invalid_request",
  );
});

test("errors: unknown codes still get a response", () => {
  const ex = explainError("custom_failure");
  assert.equal(ex?.code, "custom_failure");
  assert.equal(ex?.title, "Unrecognized error code");
  assert.deepEqual(ex?.causes, []);
});

test("errors: errorFromBody", () => {
  assert.deepEqual(
    errorFromBody({
      error: "invalid_grant",
      error_description: "Code not valid",
    }),
    {
      error: "invalid_grant",
      description: "Code not valid",
    },
  );
  assert.deepEqual(errorFromBody({ error: "x" }), {
    error: "x",
    description: undefined,
  });
  assert.equal(errorFromBody({ access_token: "t" }), undefined);
  assert.equal(errorFromBody("Bad Request"), undefined);
  assert.equal(errorFromBody(null), undefined);
});

/* ------------------------------------------------------------------ */
/* tokens.ts — ID token checks                                         */
/* ------------------------------------------------------------------ */

const ISSUER = "https://auth.example.com/realms/demo";
const NOW = 1_750_000_000_000;
const ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxIn0.c2ln";
const leftHalf = (alg: "sha256" | "sha384" | "sha512", s: string) => {
  const d = createHash(alg).update(s).digest();
  return d.subarray(0, d.length / 2).toString("base64url");
};

async function claims(
  payload: Record<string, unknown>,
  opts: { nonce?: string; alg?: string; accessToken?: string } = {},
) {
  const checks = await checkIdTokenClaims({
    header: { alg: opts.alg ?? "RS256" },
    payload: {
      iss: ISSUER,
      aud: "my-spa",
      exp: NOW / 1000 + 300,
      nonce: "n-1",
      ...payload,
    },
    expectedIssuer: ISSUER,
    clientId: "my-spa",
    expectedNonce: "nonce" in opts ? opts.nonce : "n-1",
    accessToken: opts.accessToken,
    now: NOW,
  });
  return Object.fromEntries(checks.map((c) => [c.name, c]));
}

test("tokens: computeAtHash uses the hash matching alg", async () => {
  assert.equal(
    await computeAtHash(ACCESS_TOKEN, "RS256"),
    leftHalf("sha256", ACCESS_TOKEN),
  );
  assert.equal(
    await computeAtHash(ACCESS_TOKEN, "ES384"),
    leftHalf("sha384", ACCESS_TOKEN),
  );
  assert.equal(
    await computeAtHash(ACCESS_TOKEN, "PS512"),
    leftHalf("sha512", ACCESS_TOKEN),
  );
  assert.equal(
    await computeAtHash(ACCESS_TOKEN, "EdDSA"),
    leftHalf("sha512", ACCESS_TOKEN),
  );
  assert.equal(await computeAtHash(ACCESS_TOKEN, "none"), undefined);
  assert.equal(await computeAtHash(ACCESS_TOKEN, undefined), undefined);
});

test("tokens: a valid ID token passes every check", async () => {
  const c = await claims(
    { at_hash: leftHalf("sha256", ACCESS_TOKEN), azp: "my-spa" },
    { accessToken: ACCESS_TOKEN },
  );
  for (const name of ["nonce", "iss", "aud", "azp", "exp", "at_hash"]) {
    assert.equal(c[name]?.status, "pass", name);
  }
});

test("tokens: nonce mismatch, missing, and skipped", async () => {
  assert.equal((await claims({ nonce: "other" })).nonce.status, "fail");
  const missing = await claims({ nonce: undefined });
  assert.equal(missing.nonce.status, "fail");
  assert.match(missing.nonce.message, /no nonce claim/);
  assert.equal((await claims({}, { nonce: undefined })).nonce.status, "skip");
});

test("tokens: iss must match (ignoring a trailing slash)", async () => {
  assert.equal((await claims({ iss: `${ISSUER}/` })).iss.status, "pass");
  assert.equal(
    (await claims({ iss: "https://auth.example.com/realms/other" })).iss.status,
    "fail",
  );
  assert.equal((await claims({ iss: undefined })).iss.status, "fail");
});

test("tokens: aud and azp", async () => {
  assert.equal(
    (await claims({ aud: ["other", "my-spa"], azp: "my-spa" })).aud.status,
    "pass",
  );
  assert.equal(
    (await claims({ aud: ["other", "my-spa"], azp: "my-spa" })).azp.status,
    "pass",
  );
  assert.equal((await claims({ aud: "other" })).aud.status, "fail");
  assert.equal((await claims({ aud: undefined })).aud.status, "fail");
  assert.equal((await claims({ aud: ["other", "my-spa"] })).azp.status, "fail");
  assert.equal((await claims({ azp: "someone-else" })).azp.status, "fail");
  assert.equal((await claims({})).azp, undefined);
});

test("tokens: exp", async () => {
  assert.equal((await claims({ exp: NOW / 1000 - 1 })).exp.status, "fail");
  assert.equal((await claims({ exp: undefined })).exp.status, "fail");
});

test("tokens: at_hash mismatch and unsupported alg", async () => {
  const bad = await claims(
    { at_hash: leftHalf("sha256", "different") },
    { accessToken: ACCESS_TOKEN },
  );
  assert.equal(bad.at_hash.status, "fail");
  const skip = await claims(
    { at_hash: "x" },
    { accessToken: ACCESS_TOKEN, alg: "none" },
  );
  assert.equal(skip.at_hash.status, "skip");
  assert.equal((await claims({ at_hash: "x" })).at_hash, undefined);
});

test("tokens: an undecodable ID token fails", async () => {
  const checks = await checkIdTokenClaims({
    header: undefined,
    payload: undefined,
    expectedIssuer: ISSUER,
    clientId: "my-spa",
    now: NOW,
  });
  assert.equal(checks.length, 1);
  assert.equal(checks[0].status, "fail");
});

/* ------------------------------------------------------------------ */
/* discovery.ts                                                        */
/* ------------------------------------------------------------------ */

test("discovery: URL helpers", () => {
  assert.equal(
    discoveryUrlFor(" https://h/realms/r/ "),
    "https://h/realms/r/.well-known/openid-configuration",
  );
  assert.equal(
    discoveryUrlFor("https://h/realms/r/.well-known/openid-configuration"),
    "https://h/realms/r/.well-known/openid-configuration",
  );
  assert.equal(
    issuerFromInput("https://h/realms/r/.well-known/openid-configuration"),
    "https://h/realms/r",
  );
  assert.equal(
    guessKeycloakIssuer("https://h/auth/realms/r/protocol/openid-connect/auth"),
    "https://h/auth/realms/r",
  );
  assert.equal(guessKeycloakIssuer("https://h/oauth2/authorize"), undefined);
});

test("discovery: checkDiscovery", () => {
  const ok = checkDiscovery(
    {
      issuer: "https://h/realms/r",
      authorization_endpoint: "a",
      token_endpoint: "t",
      code_challenge_methods_supported: ["plain", "S256"],
    },
    "https://h/realms/r/",
  );
  assert.deepEqual(ok, []);
  const bad = checkDiscovery(
    {
      issuer: "https://other/realms/r",
      code_challenge_methods_supported: ["plain"],
    },
    "https://h/realms/r",
  );
  assert.equal(bad.filter((w) => w.severity === "error").length, 2);
  assert.equal(bad.filter((w) => w.severity === "warning").length, 2);
});

test("discovery: fetchDiscovery handles success, 404, non-documents, and network errors", async (t) => {
  const realFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = realFetch;
  });
  const respond = (status: number, body: string) => async () =>
    new Response(body, { status });

  globalThis.fetch = (async (url: string) => {
    assert.equal(url, "https://h/realms/r/.well-known/openid-configuration");
    return new Response(JSON.stringify({ issuer: "https://h/realms/r" }), {
      status: 200,
    });
  }) as typeof fetch;
  assert.equal(
    (await fetchDiscovery("https://h/realms/r")).issuer,
    "https://h/realms/r",
  );

  globalThis.fetch = respond(404, "Not Found") as typeof fetch;
  await assert.rejects(
    fetchDiscovery("https://h/realms/nope"),
    (e: unknown) => {
      assert.ok(e instanceof FriendlyFetchError);
      assert.equal(e.status, 404);
      assert.match(e.hint, /case-sensitive/);
      return true;
    },
  );

  globalThis.fetch = respond(200, "<html></html>") as typeof fetch;
  await assert.rejects(
    fetchDiscovery("https://h/realms/r"),
    /not an OpenID Connect discovery document/,
  );

  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;
  await assert.rejects(fetchDiscovery("https://h/realms/r"), (e: unknown) => {
    assert.ok(e instanceof FriendlyFetchError);
    assert.match(e.hint, /CORS/);
    assert.match(e.hint, /Web origins/);
    return true;
  });

  await assert.rejects(fetchDiscovery("not a url"), /not a valid URL/);
});
