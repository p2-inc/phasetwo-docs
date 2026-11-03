// Unit tests for the framework-free OIDC/JWKS modules.
// Run with: node --test src/components/tools/oidc/test/
// All data is synthetic (example.com); no test touches the network — fetch is
// stubbed where the orchestration layer is exercised.

import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";

import { countBySeverity, sortFindings, type Finding } from "../findings.ts";
import { parseX509 } from "../x509.ts";
import { coerceJwks, matchKeyForHeader, summarizeJwks } from "../jwks.ts";
import {
  detectKeycloak,
  extractCapabilities,
  extractEndpoints,
  extractFlags,
  keycloakNotes,
  lintDiscovery,
  resolveDiscoveryTarget,
  type DiscoveryDoc,
} from "../discovery.ts";
import { fetchJson, parseJsonInput, parseUserUrl } from "../fetch.ts";
import {
  inspectDiscoveryDoc,
  inspectIssuer,
  loadJwksFromUrl,
} from "../inspect.ts";
import { buildShareLink, readDeepLink } from "../deeplink.ts";
import {
  EXAMPLE_DISCOVERY,
  EXAMPLE_ISSUER,
  EXAMPLE_JWKS,
  EXAMPLE_JWT,
} from "../examples.ts";
import { verifyLocalJwks } from "../../jwt/verify.ts";
import { parseJwt } from "../../jwt/decode.ts";

/** A fixed clock inside the example certificates' validity window. */
const NOW = Date.UTC(2027, 0, 1);

const rules = (fs: Finding[]) => fs.map((f) => f.rule);
const find = (fs: Finding[], rule: string) => fs.find((f) => f.rule === rule);
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const keyById = (kid: string) => {
  const k = EXAMPLE_JWKS.keys.find((k) => k.kid === kid);
  assert.ok(k, `example key ${kid}`);
  return clone(k);
};

describe("findings", () => {
  test("sortFindings orders error, warning, info, pass without mutating", () => {
    const input: Finding[] = [
      { severity: "pass", rule: "a", title: "a" },
      { severity: "info", rule: "b", title: "b" },
      { severity: "error", rule: "c", title: "c" },
      { severity: "warning", rule: "d", title: "d" },
    ];
    assert.deepEqual(rules(sortFindings(input)), ["c", "d", "b", "a"]);
    assert.equal(input[0]?.rule, "a");
  });

  test("countBySeverity counts every severity", () => {
    assert.deepEqual(
      countBySeverity([
        { severity: "error", rule: "x", title: "" },
        { severity: "error", rule: "y", title: "" },
        { severity: "pass", rule: "z", title: "" },
      ]),
      { error: 2, warning: 0, info: 0, pass: 1 },
    );
  });
});

describe("x509", () => {
  test("summarizes a self-signed certificate", () => {
    const cert = parseX509(keyById("demo-rs256-2026").x5c![0]!);
    assert.equal(cert.subject, "CN=demo");
    assert.equal(cert.issuer, "CN=demo");
    assert.equal(cert.selfSigned, true);
    assert.equal(cert.signatureAlgorithm, "SHA256withRSA");
    assert.equal(cert.notBefore?.toISOString(), "2026-01-01T00:00:00.000Z");
    assert.equal(cert.notAfter?.toISOString(), "2036-01-01T00:00:00.000Z");
    assert.match(cert.serialHex, /^[0-9a-f]{2}(:[0-9a-f]{2})+$/);
  });

  test("reads multi-attribute subjects and UTCTime dates", () => {
    const cert = parseX509(keyById("demo-legacy-2019").x5c![0]!);
    assert.equal(cert.subject, "CN=demo, O=Example Corp");
    assert.equal(cert.notAfter?.toISOString(), "2021-01-01T00:00:00.000Z");
  });

  test("throws on input that is not a certificate", () => {
    assert.throws(() => parseX509(btoa("not a certificate")));
  });
});

describe("jwks: coerceJwks", () => {
  test("accepts a set, an embedded jwks, and a single JWK", () => {
    assert.ok(coerceJwks({ keys: [] }).jwks);
    assert.match(coerceJwks({ jwks: { keys: [] } }).note ?? "", /embedded/);
    assert.equal(
      coerceJwks({ kty: "EC", crv: "P-256", x: "a", y: "b" }).jwks?.keys.length,
      1,
    );
  });

  test("rejects a discovery document and non-objects", () => {
    assert.match(
      coerceJwks({ issuer: "https://x", jwks_uri: "https://x/certs" }).error ??
        "",
      /discovery document/,
    );
    assert.ok(coerceJwks([]).error);
    assert.ok(coerceJwks("keys").error);
  });
});

describe("jwks: summarizeJwks", () => {
  test("summarizes the example set", async () => {
    const s = await summarizeJwks(EXAMPLE_JWKS, NOW);
    assert.equal(s.valid, true);
    assert.equal(s.keys.length, 4);

    const rs = s.keys[0]!;
    assert.equal(rs.kid, "demo-rs256-2026");
    assert.equal(rs.strength, "RSA 2048-bit");
    assert.equal(rs.bits, 2048);
    assert.match(rs.thumbprint ?? "", /^[A-Za-z0-9_-]{43}$/);
    assert.equal(rs.certs.length, 1);
    assert.deepEqual(rs.findings, []);

    const ec = s.keys.find((k) => k.kty === "EC")!;
    assert.equal(ec.strength, "EC P-256");
    assert.equal(ec.bits, 256);
  });

  test("flags the weak legacy key", async () => {
    const s = await summarizeJwks(EXAMPLE_JWKS, NOW);
    const legacy = s.keys.find((k) => k.kid === "demo-legacy-2019")!;
    assert.equal(legacy.bits, 1024);
    assert.equal(find(legacy.findings, "rsa-weak")?.severity, "error");
    assert.equal(find(legacy.findings, "x5c-expired")?.severity, "error");
    assert.equal(find(legacy.findings, "use-missing")?.severity, "warning");
    assert.equal(find(legacy.findings, "alg-missing")?.severity, "info");
  });

  test("warns when a certificate is close to expiry or not yet valid", async () => {
    const key = keyById("demo-rs256-2026");
    const soon = await summarizeJwks({ keys: [key] }, Date.UTC(2035, 11, 15));
    assert.ok(find(soon.keys[0]!.findings, "x5c-expiring"));
    const early = await summarizeJwks({ keys: [key] }, Date.UTC(2025, 0, 1));
    assert.ok(find(early.keys[0]!.findings, "x5c-not-yet-valid"));
  });

  test("passes a clean set", async () => {
    const s = await summarizeJwks(
      { keys: [keyById("demo-rs256-2026"), keyById("demo-es256-2026")] },
      NOW,
    );
    assert.deepEqual(rules(s.findings), ["ok"]);
  });

  test("flags duplicate kids, with severity depending on distinguishability", async () => {
    const a = keyById("demo-rs256-2026");
    const same = await summarizeJwks({ keys: [a, clone(a)] }, NOW);
    assert.equal(find(same.findings, "kid-duplicate")?.severity, "error");

    const enc = { ...keyById("demo-rsa-oaep-2026"), kid: a.kid };
    const differ = await summarizeJwks({ keys: [a, enc] }, NOW);
    assert.equal(find(differ.findings, "kid-duplicate")?.severity, "warning");
  });

  test("flags missing kids when there are several keys", async () => {
    const a = keyById("demo-rs256-2026");
    delete a.kid;
    const s = await summarizeJwks(
      { keys: [a, keyById("demo-es256-2026")] },
      NOW,
    );
    assert.ok(find(s.keys[0]!.findings, "kid-missing"));
    assert.equal(find(s.findings, "kid-missing-multi")?.severity, "error");
  });

  test("flags private key material and symmetric keys", async () => {
    const leaked = { ...keyById("demo-es256-2026"), d: "secret" };
    const s = await summarizeJwks({ keys: [leaked] }, NOW);
    assert.match(find(s.keys[0]!.findings, "private-material")!.title, /\(d\)/);

    const oct = await summarizeJwks(
      { keys: [{ kty: "oct", k: "c2VjcmV0" }] },
      NOW,
    );
    assert.match(
      find(oct.keys[0]!.findings, "private-material")!.detail ?? "",
      /Symmetric/,
    );
  });

  test("flags alg/kty mismatch, alg none, missing params, and unknown kty", async () => {
    const s = await summarizeJwks(
      {
        keys: [
          { ...keyById("demo-es256-2026"), alg: "RS256" },
          { ...keyById("demo-rs256-2026"), kid: "n", alg: "none" },
          { kid: "bad-rsa", kty: "RSA", use: "sig" },
          { kid: "no-crv", kty: "EC", use: "sig" },
          { kid: "weird", kty: "XYZ", use: "sig" },
        ],
      },
      NOW,
    );
    const r = s.keys.map((k) => rules(k.findings));
    assert.ok(r[0]!.includes("alg-kty-mismatch"));
    assert.ok(r[1]!.includes("alg-none"));
    assert.ok(r[2]!.includes("rsa-params"));
    assert.ok(r[3]!.includes("crv-missing"));
    assert.ok(r[4]!.includes("kty-unknown"));
  });

  test("checks x5t#S256 against the certificate", async () => {
    const good = await summarizeJwks(
      { keys: [keyById("demo-rs256-2026")] },
      NOW,
    );
    assert.equal(find(good.keys[0]!.findings, "x5t-mismatch"), undefined);
    const bad = {
      ...keyById("demo-rs256-2026"),
      "x5t#S256": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    };
    const s = await summarizeJwks({ keys: [bad] }, NOW);
    assert.equal(find(s.keys[0]!.findings, "x5t-mismatch")?.severity, "error");
  });

  test("reports unparseable certificates and empty or encryption-only sets", async () => {
    const s = await summarizeJwks(
      { keys: [{ ...keyById("demo-rsa-oaep-2026"), x5c: ["bm9wZQ=="] }] },
      NOW,
    );
    assert.ok(find(s.keys[0]!.findings, "x5c-parse"));
    assert.ok(find(s.findings, "no-sig-keys"));

    const empty = await summarizeJwks({ keys: [] }, NOW);
    assert.equal(find(empty.findings, "empty")?.severity, "error");

    const notJwks = await summarizeJwks({ hello: "world" }, NOW);
    assert.equal(notJwks.valid, false);
    assert.deepEqual(rules(notJwks.findings), ["not-jwks"]);
  });
});

describe("jwks: matching and verifying a token", () => {
  test("matches the example token by kid and verifies it", async () => {
    const s = await summarizeJwks(EXAMPLE_JWKS, NOW);
    const header = parseJwt(EXAMPLE_JWT).header.json;
    const m = matchKeyForHeader(s, header);
    assert.equal(m.kid, "demo-rs256-2026");
    assert.deepEqual(
      m.matches.map((k) => k.index),
      [0],
    );
    const r = await verifyLocalJwks(EXAMPLE_JWT, EXAMPLE_JWKS as never);
    assert.equal(r.status, "valid");
  });

  test("reports a tampered signature as invalid", async () => {
    const [h, p, sig] = EXAMPLE_JWT.split(".");
    const flipped = (sig![0] === "A" ? "B" : "A") + sig!.slice(1);
    const r = await verifyLocalJwks(
      `${h}.${p}.${flipped}`,
      EXAMPLE_JWKS as never,
    );
    assert.equal(r.status, "invalid");
  });

  test("explains an unknown kid", async () => {
    const s = await summarizeJwks(EXAMPLE_JWKS, NOW);
    const m = matchKeyForHeader(s, { alg: "RS256", kid: "rotated-away" });
    assert.equal(m.matches.length, 0);
    assert.match(m.reason, /rotated out/);
  });

  test("falls back to compatible signing keys when there is no kid", async () => {
    const s = await summarizeJwks(EXAMPLE_JWKS, NOW);
    const m = matchKeyForHeader(s, { alg: "ES256" });
    assert.deepEqual(
      m.matches.map((k) => k.kid),
      ["demo-es256-2026"],
    );
    // RSA candidates exclude the "enc" key.
    const rsa = matchKeyForHeader(s, { alg: "RS256" });
    assert.deepEqual(
      rsa.matches.map((k) => k.kid),
      ["demo-rs256-2026", "demo-legacy-2019"],
    );
  });
});

describe("discovery: issuer normalization", () => {
  const cases: [string, string, string][] = [
    [
      "https://accounts.example.com",
      "https://accounts.example.com/.well-known/openid-configuration",
      "https://accounts.example.com",
    ],
    [
      "accounts.example.com",
      "https://accounts.example.com/.well-known/openid-configuration",
      "https://accounts.example.com",
    ],
    [
      "https://tenant.example.com/",
      "https://tenant.example.com/.well-known/openid-configuration",
      "https://tenant.example.com/",
    ],
    [
      "https://auth.example.com/realms/demo/",
      "https://auth.example.com/realms/demo/.well-known/openid-configuration",
      "https://auth.example.com/realms/demo/",
    ],
    [
      "  https://auth.example.com/realms/demo?x=1#frag ",
      "https://auth.example.com/realms/demo/.well-known/openid-configuration",
      "https://auth.example.com/realms/demo",
    ],
    [
      "https://auth.example.com/realms/demo/.well-known/openid-configuration",
      "https://auth.example.com/realms/demo/.well-known/openid-configuration",
      "https://auth.example.com/realms/demo",
    ],
    [
      "https://AUTH.example.com/realms/Demo",
      "https://auth.example.com/realms/Demo/.well-known/openid-configuration",
      "https://auth.example.com/realms/Demo",
    ],
  ];
  for (const [input, discoveryUrl, expectedIssuer] of cases) {
    test(`resolves ${JSON.stringify(input)}`, () => {
      assert.deepEqual(resolveDiscoveryTarget(input), {
        discoveryUrl,
        expectedIssuer,
      });
    });
  }

  test("rejects empty and unparseable input", () => {
    assert.equal(resolveDiscoveryTarget(""), undefined);
    assert.equal(resolveDiscoveryTarget("https://"), undefined);
  });
});

describe("discovery: Keycloak detection", () => {
  test("detects modern and legacy realm issuers", () => {
    assert.deepEqual(detectKeycloak("https://auth.example.com/realms/demo"), {
      realm: "demo",
      baseUrl: "https://auth.example.com",
      legacyAuthPrefix: false,
      adminConsoleUrl: "https://auth.example.com/admin/master/console/#/demo",
    });
    const legacy = detectKeycloak(
      "https://auth.example.com/auth/realms/my%20realm",
    );
    assert.equal(legacy?.realm, "my realm");
    assert.equal(legacy?.legacyAuthPrefix, true);
  });

  test("ignores non-Keycloak issuers", () => {
    assert.equal(detectKeycloak("https://accounts.example.com"), undefined);
    assert.equal(detectKeycloak("https://x.example.com/realms"), undefined);
    assert.equal(detectKeycloak(undefined), undefined);
  });

  test("adds a legacy /auth note only when relevant", () => {
    const modern = keycloakNotes(
      detectKeycloak(EXAMPLE_ISSUER)!,
      EXAMPLE_DISCOVERY,
    );
    assert.ok(!modern.some((n) => /\/auth/.test(n.title)));
    const legacy = keycloakNotes(
      detectKeycloak("https://auth.example.com/auth/realms/demo")!,
      {},
    );
    assert.ok(legacy.some((n) => /Legacy \/auth/.test(n.title)));
  });
});

describe("discovery: lintDiscovery", () => {
  const doc = (): DiscoveryDoc => clone(EXAMPLE_DISCOVERY);

  test("the example document has no errors or warnings", () => {
    const f = lintDiscovery(doc(), EXAMPLE_ISSUER);
    const c = countBySeverity(f);
    assert.equal(c.error, 0);
    assert.equal(c.warning, 0);
    for (const r of [
      "issuer-match",
      "https",
      "pkce-s256",
      "optional-endpoints",
    ])
      assert.equal(find(f, r)?.severity, "pass", r);
    // Keycloak advertises the implicit and password grants; these are notes.
    assert.equal(find(f, "implicit")?.severity, "info");
    assert.equal(find(f, "ropc")?.severity, "info");
    assert.equal(find(f, "request-object-none")?.severity, "info");
  });

  test("issuer mismatch is an error with Keycloak-specific advice", () => {
    const f = lintDiscovery(doc(), "https://other.example.com/realms/demo");
    const m = find(f, "issuer-mismatch");
    assert.equal(m?.severity, "error");
    assert.match(m?.detail ?? "", /hostname/);
  });

  test("case-only issuer differences are called out", () => {
    const f = lintDiscovery(doc(), "https://auth.example.com/realms/DEMO");
    assert.match(find(f, "issuer-mismatch")?.detail ?? "", /letter case/);
  });

  test("trailing-slash differences are a warning", () => {
    const f = lintDiscovery(doc(), `${EXAMPLE_ISSUER}/`);
    assert.equal(find(f, "issuer-trailing-slash")?.severity, "warning");
    assert.equal(find(f, "issuer-mismatch"), undefined);
  });

  test("templated multi-tenant issuers are a warning, not a mismatch", () => {
    const d = { ...doc(), issuer: "https://login.example.com/{tenantid}/v2.0" };
    const f = lintDiscovery(d, "https://login.example.com/common/v2.0");
    assert.equal(find(f, "issuer-template")?.severity, "warning");
    assert.equal(find(f, "issuer-mismatch"), undefined);
  });

  test("pasted documents skip the issuer comparison", () => {
    const f = lintDiscovery(doc());
    assert.equal(find(f, "issuer-match"), undefined);
    assert.equal(find(f, "issuer-mismatch"), undefined);
  });

  test("missing issuer and required metadata are errors", () => {
    const d = doc();
    delete d.issuer;
    delete d.jwks_uri;
    delete d.token_endpoint;
    const f = lintDiscovery(d, EXAMPLE_ISSUER);
    assert.equal(find(f, "issuer-missing")?.severity, "error");
    assert.match(
      find(f, "required-missing")?.title ?? "",
      /jwks_uri, token_endpoint/,
    );
  });

  test("token_endpoint is optional for implicit-only providers", () => {
    const d = doc();
    delete d.token_endpoint;
    d.response_types_supported = ["id_token", "id_token token"];
    assert.equal(
      find(lintDiscovery(d, EXAMPLE_ISSUER), "required-missing"),
      undefined,
    );
  });

  test("issuer with a query string is an error", () => {
    const d = { ...doc(), issuer: `${EXAMPLE_ISSUER}?tenant=1` };
    assert.ok(find(lintDiscovery(d), "issuer-query"));
  });

  test("plain http is an error, but only a warning for localhost", () => {
    const remote = {
      ...doc(),
      token_endpoint: "http://auth.example.com/token",
    };
    assert.equal(find(lintDiscovery(remote), "https")?.severity, "error");
    const local = {
      issuer: "http://localhost:8080/realms/demo",
      jwks_uri:
        "http://localhost:8080/realms/demo/protocol/openid-connect/certs",
    };
    assert.equal(find(lintDiscovery(local), "https")?.severity, "warning");
  });

  test("PKCE: unadvertised is a warning, missing S256 is an error", () => {
    const none = doc();
    delete none.code_challenge_methods_supported;
    assert.equal(
      find(lintDiscovery(none), "pkce-unadvertised")?.severity,
      "warning",
    );
    const plain = { ...doc(), code_challenge_methods_supported: ["plain"] };
    assert.equal(find(lintDiscovery(plain), "pkce-s256")?.severity, "error");
  });

  test('"none" for ID tokens is an error; for UserInfo it is accepted', () => {
    const d = {
      ...doc(),
      id_token_signing_alg_values_supported: ["RS256", "none"],
    };
    assert.equal(find(lintDiscovery(d), "alg-none")?.severity, "error");
    // The example already lists "none" for userinfo, which is plain JSON over TLS.
    assert.equal(find(lintDiscovery(doc()), "alg-none"), undefined);
  });

  test("HMAC-only ID token signing is a warning", () => {
    const d = { ...doc(), id_token_signing_alg_values_supported: ["HS256"] };
    assert.equal(find(lintDiscovery(d), "hmac-only")?.severity, "warning");
  });

  test("missing lifecycle endpoints are notes", () => {
    const d = doc();
    delete d.end_session_endpoint;
    delete d.revocation_endpoint;
    const f = lintDiscovery(d);
    assert.equal(find(f, "missing-end_session_endpoint")?.severity, "info");
    assert.equal(find(f, "missing-revocation_endpoint")?.severity, "info");
    assert.equal(find(f, "optional-endpoints"), undefined);
  });

  test("browser-facing endpoints on another host are flagged for Keycloak", () => {
    const d = {
      ...doc(),
      authorization_endpoint:
        "https://internal.example.com/realms/demo/protocol/openid-connect/auth",
    };
    assert.equal(find(lintDiscovery(d), "host-mismatch")?.severity, "warning");
  });
});

describe("discovery: extraction", () => {
  test("endpoints come in a stable order with labels", () => {
    const e = extractEndpoints(EXAMPLE_DISCOVERY);
    assert.deepEqual(
      e.slice(0, 4).map((r) => r.key),
      [
        "authorization_endpoint",
        "token_endpoint",
        "userinfo_endpoint",
        "jwks_uri",
      ],
    );
    assert.ok(e.every((r) => r.url.startsWith("https://auth.example.com/")));
    assert.ok(e.some((r) => r.key === "registration_endpoint"));
  });

  test("capabilities and flags", () => {
    const caps = extractCapabilities(EXAMPLE_DISCOVERY);
    const pkce = caps.find((c) => c.key === "code_challenge_methods_supported");
    assert.equal(pkce?.label, "PKCE methods");
    assert.deepEqual(pkce?.values, ["plain", "S256"]);
    // Unknown *_supported arrays are included with their raw key as label.
    assert.ok(caps.some((c) => c.key === "prompt_values_supported"));
    const flags = new Map(extractFlags(EXAMPLE_DISCOVERY));
    assert.equal(flags.get("backchannel_logout_supported"), true);
    assert.equal(flags.get("require_pushed_authorization_requests"), false);
  });
});

describe("fetch helpers", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  const stub = (handler: (url: string) => Response | Promise<Response>) => {
    globalThis.fetch = (async (input: RequestInfo | URL) =>
      handler(String(input))) as typeof fetch;
  };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });

  test("parseUserUrl adds https and rejects other schemes", () => {
    assert.equal(parseUserUrl("example.com/x")?.href, "https://example.com/x");
    assert.equal(parseUserUrl("ftp://example.com"), undefined);
    assert.equal(parseUserUrl("   "), undefined);
  });

  test("parseJsonInput reports bad JSON", () => {
    assert.deepEqual(parseJsonInput('{"a":1}'), { ok: true, data: { a: 1 } });
    assert.equal(parseJsonInput("{nope").ok, false);
  });

  test("fetchJson classifies results", async () => {
    stub((u) => {
      if (u.includes("ok")) return json({ keys: [] });
      if (u.includes("missing")) return json({ error: "x" }, 404);
      if (u.includes("html")) return new Response("<html>", { status: 200 });
      throw new TypeError("Failed to fetch");
    });
    const ok = await fetchJson("https://ok.example.com");
    assert.equal(ok.ok, true);
    const missing = await fetchJson("https://missing.example.com");
    assert.equal(!missing.ok && missing.kind, "http");
    assert.equal(!missing.ok && missing.status, 404);
    const html = await fetchJson("https://html.example.com");
    assert.equal(!html.ok && html.kind, "not-json");
    const blocked = await fetchJson("https://blocked.example.com");
    assert.equal(!blocked.ok && blocked.kind, "network");
    const bad = await fetchJson("not a url at all ::");
    assert.equal(!bad.ok && bad.kind, "invalid-url");
  });

  test("loadJwksFromUrl maps a Keycloak realm URL to its certs endpoint", async () => {
    const seen: string[] = [];
    stub((u) => {
      seen.push(u);
      return json(EXAMPLE_JWKS);
    });
    const r = await loadJwksFromUrl(`${EXAMPLE_ISSUER}/`);
    assert.deepEqual(seen, [`${EXAMPLE_ISSUER}/protocol/openid-connect/certs`]);
    assert.equal(r.summary?.keys.length, 4);
    assert.match(r.notes[0] ?? "", /Keycloak realm/);
  });

  test("loadJwksFromUrl treats a bare issuer as discovery and follows jwks_uri", async () => {
    const seen: string[] = [];
    stub((u) => {
      seen.push(u);
      if (u.endsWith("/.well-known/openid-configuration"))
        return json({
          issuer: "https://id.example.com",
          jwks_uri: "https://id.example.com/keys",
        });
      if (u.endsWith("/keys")) return json(EXAMPLE_JWKS);
      return new Response("<html>", { status: 200 });
    });
    const r = await loadJwksFromUrl("https://id.example.com");
    // A bare origin skips the pointless direct fetch.
    assert.deepEqual(seen, [
      "https://id.example.com/.well-known/openid-configuration",
      "https://id.example.com/keys",
    ]);
    assert.equal(r.summary?.valid, true);
    assert.equal(r.notes.length, 2);
  });

  test("loadJwksFromUrl falls back to discovery when a path is not a JWKS", async () => {
    const seen: string[] = [];
    stub((u) => {
      seen.push(u);
      if (
        u === "https://id.example.com/tenant/.well-known/openid-configuration"
      )
        return json({
          issuer: "https://id.example.com/tenant",
          jwks_uri: "https://id.example.com/tenant/keys",
        });
      if (u.endsWith("/keys")) return json(EXAMPLE_JWKS);
      return new Response("<html>", { status: 200 });
    });
    const r = await loadJwksFromUrl("https://id.example.com/tenant");
    assert.equal(seen[0], "https://id.example.com/tenant");
    assert.equal(r.summary?.keys.length, 4);
    assert.match(r.notes[0] ?? "", /did not return a JWKS/);
  });

  test("loadJwksFromUrl reports the original failure when discovery also fails", async () => {
    stub((u) => {
      if (u.endsWith("/jwks.json")) return json({}, 403);
      return json({}, 404);
    });
    const r = await loadJwksFromUrl("https://id.example.com/jwks.json");
    assert.equal(r.fetch?.ok, false);
    assert.equal(!r.fetch?.ok && r.fetch?.status, 403);
  });

  test("inspectIssuer lints the document and records jwks reachability", async () => {
    stub((u) => {
      if (u.endsWith("/.well-known/openid-configuration"))
        return json(EXAMPLE_DISCOVERY);
      if (u.endsWith("/certs")) return json(EXAMPLE_JWKS);
      return json({}, 500);
    });
    const r = await inspectIssuer(EXAMPLE_ISSUER);
    assert.equal(r.keycloak?.realm, "demo");
    assert.equal(find(r.findings, "issuer-match")?.severity, "pass");
    assert.equal(find(r.findings, "jwks-reachable")?.severity, "pass");
    assert.equal(r.jwks?.summary?.keys.length, 4);
  });

  test("inspectIssuer surfaces a failed discovery fetch and an unreachable jwks_uri", async () => {
    stub(() => {
      throw new TypeError("Failed to fetch");
    });
    const failed = await inspectIssuer(EXAMPLE_ISSUER);
    assert.equal(failed.fetch?.ok, false);
    assert.equal(failed.doc, undefined);

    stub((u) => {
      if (u.endsWith("/.well-known/openid-configuration"))
        return json(EXAMPLE_DISCOVERY);
      return json({}, 404);
    });
    const r = await inspectIssuer(EXAMPLE_ISSUER);
    assert.equal(find(r.findings, "jwks-unreachable")?.severity, "error");
  });

  test("inspectDiscoveryDoc uses supplied keys without fetching", async () => {
    stub(() => {
      throw new Error("must not fetch");
    });
    const r = await inspectDiscoveryDoc(EXAMPLE_DISCOVERY, {
      expectedIssuer: EXAMPLE_ISSUER,
      jwks: EXAMPLE_JWKS,
    });
    assert.equal(r.jwks?.source, "example");
    assert.ok(r.keycloakNotes.length >= 2);
    const jwks = await inspectDiscoveryDoc(EXAMPLE_JWKS);
    assert.equal(find(jwks.findings, "is-jwks")?.severity, "error");
  });
});

describe("deep links", () => {
  test("reads #url= first, then ?url=, and only http(s)", () => {
    assert.equal(
      readDeepLink({
        hash: "#url=https%3A%2F%2Fa.example.com",
        search: "?url=https://b.example.com",
      }),
      "https://a.example.com",
    );
    assert.equal(
      readDeepLink({ hash: "", search: "?url=https://b.example.com/realms/x" }),
      "https://b.example.com/realms/x",
    );
    assert.equal(
      readDeepLink({ hash: "#url=javascript:alert(1)", search: "" }),
      undefined,
    );
    assert.equal(readDeepLink({ hash: "#section", search: "" }), undefined);
  });

  test("buildShareLink puts the target in the fragment and round-trips", () => {
    const target = "https://auth.example.com/realms/demo?x=1&y=2";
    const link = buildShareLink(
      "https://phasetwo.io/tools/oidc-discovery?utm_source=x#url=old",
      target,
    );
    const u = new URL(link);
    assert.equal(u.search, "");
    assert.equal(u.pathname, "/tools/oidc-discovery");
    assert.equal(readDeepLink(u), target);
  });
});
