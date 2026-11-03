// Unit tests for the client checker rule engine. Node strips the TypeScript
// types itself (Node 22.18+ or 24), so no build step is needed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  analyze,
  checkClient,
  checkRealm,
  classifyUri,
  diffLines,
  parseInput,
  scoreFindings,
  toMarkdown,
  MASK,
} from "./engine.ts";
import { EXAMPLE_CLIENT } from "./example.ts";

const fixture = (name) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

// 2026-11-02, so secret ages are deterministic.
const NOW = Date.UTC(2026, 10, 2);

const ids = (result) => result.findings.map((f) => f.id);

const base = {
  clientId: "app",
  protocol: "openid-connect",
  publicClient: true,
  standardFlowEnabled: true,
  implicitFlowEnabled: false,
  directAccessGrantsEnabled: false,
  serviceAccountsEnabled: false,
  fullScopeAllowed: false,
  redirectUris: ["https://app.example.com/callback"],
  webOrigins: ["+"],
  defaultClientScopes: ["profile", "email"],
  attributes: {
    "pkce.code.challenge.method": "S256",
    "dpop.bound.access.tokens": "true",
  },
};

const client = (over = {}) => ({
  ...base,
  ...over,
  attributes: { ...base.attributes, ...(over.attributes ?? {}) },
});

test("classifyUri follows Keycloak's trailing-wildcard semantics", () => {
  assert.deepEqual(classifyUri("*"), ["full-wildcard"]);
  assert.deepEqual(classifyUri("https://*"), ["full-wildcard"]);
  assert.deepEqual(classifyUri("https://app.example.com/*"), ["root-wildcard"]);
  assert.deepEqual(classifyUri("https://app.example.com*"), ["root-wildcard"]);
  assert.deepEqual(classifyUri("https://app.example.com/app/*"), [
    "path-wildcard",
  ]);
  assert.deepEqual(classifyUri("https://*.example.com/cb"), ["wildcard-host"]);
  assert.deepEqual(classifyUri("http://app.example.com/cb"), ["http"]);
  assert.deepEqual(classifyUri("http://localhost:3000/cb"), ["loopback-http"]);
  assert.deepEqual(classifyUri("http://127.0.0.1/cb"), ["loopback-http"]);
  assert.deepEqual(classifyUri("https://app.example.com/cb"), []);
  assert.deepEqual(classifyUri("/realms/demo/account/*"), [
    "relative",
    "path-wildcard",
  ]);
  assert.deepEqual(classifyUri("/*"), ["relative", "root-wildcard"]);
  assert.deepEqual(classifyUri("com.example.app:/callback"), ["custom-scheme"]);
  // A * before a query is not a wildcard in Keycloak.
  assert.deepEqual(classifyUri("https://app.example.com/cb?x=*"), []);
});

test("a well-configured public client has no findings above info", () => {
  const r = checkClient(client(), { now: NOW });
  assert.deepEqual(
    r.findings.filter((f) => f.severity !== "info").map((f) => f.id),
    [],
  );
  assert.equal(r.score, 100);
  assert.equal(r.grade, "A");
  assert.equal(r.kind, "public");
});

test("redirect URI checks", () => {
  const r = checkClient(
    client({
      redirectUris: [
        "*",
        "https://app.example.com/*",
        "https://app.example.com/area/*",
        "https://*.example.com/cb",
        "http://app.example.com/cb",
        "http://localhost:8080/cb",
      ],
    }),
    { now: NOW },
  );
  const got = ids(r);
  for (const id of [
    "redirect-wildcard-all",
    "redirect-wildcard-root",
    "redirect-wildcard-path",
    "redirect-wildcard-host",
    "redirect-http",
    "redirect-loopback",
  ]) {
    assert.ok(got.includes(id), `expected ${id} in ${got}`);
  }
  assert.equal(r.findings[0].severity, "critical");
  assert.ok(r.score <= 39, "a critical finding caps the score");
});

test("standard flow without redirect URIs is flagged", () => {
  const r = checkClient(client({ redirectUris: [] }), { now: NOW });
  assert.ok(ids(r).includes("redirect-missing"));
});

test("post-logout redirect URIs use ## and + semantics", () => {
  const r = checkClient(
    client({
      redirectUris: ["https://app.example.com/*"],
      attributes: {
        "post.logout.redirect.uris": "+##http://app.example.com/bye",
      },
    }),
    { now: NOW },
  );
  const got = ids(r);
  assert.ok(got.includes("post-logout-http"));
  assert.ok(got.includes("post-logout-inherits-wildcards"));
  const star = checkClient(
    client({ attributes: { "post.logout.redirect.uris": "*" } }),
    { now: NOW },
  );
  assert.ok(ids(star).includes("post-logout-wildcard-all"));
});

test("web origin checks", () => {
  const r = checkClient(
    client({
      webOrigins: ["*", "http://app.example.com", "https://*.example.com"],
    }),
    { now: NOW },
  );
  const got = ids(r);
  assert.ok(got.includes("origins-wildcard"));
  assert.ok(got.includes("origins-http"));
  assert.ok(got.includes("origins-wildcard-host"));
  assert.equal(
    r.findings.find((f) => f.id === "origins-wildcard").severity,
    "high",
  );

  const plus = checkClient(
    client({ redirectUris: ["http://app.example.com/cb"], webOrigins: ["+"] }),
    { now: NOW },
  );
  assert.ok(ids(plus).includes("origins-plus-inherits"));
});

test("flow checks", () => {
  const r = checkClient(
    client({
      implicitFlowEnabled: true,
      directAccessGrantsEnabled: true,
      serviceAccountsEnabled: true,
      attributes: {
        "oauth2.device.authorization.grant.enabled": "true",
        "oidc.ciba.grant.enabled": "true",
      },
    }),
    { now: NOW },
  );
  const got = ids(r);
  for (const id of [
    "flow-implicit",
    "flow-direct-access",
    "flow-device",
    "flow-ciba",
    "flow-service-account-public",
  ]) {
    assert.ok(got.includes(id), `expected ${id}`);
  }
  const confidential = checkClient(
    client({ publicClient: false, serviceAccountsEnabled: true }),
    { now: NOW },
  );
  assert.ok(ids(confidential).includes("flow-service-account-mixed"));
});

test("PKCE: public clients must use S256", () => {
  const none = checkClient(
    client({ attributes: { "pkce.code.challenge.method": "" } }),
    { now: NOW },
  );
  const f = none.findings.find((x) => x.id === "auth-public-no-pkce");
  assert.equal(f.severity, "high");
  const plain = checkClient(
    client({ attributes: { "pkce.code.challenge.method": "plain" } }),
    { now: NOW },
  );
  assert.match(
    plain.findings.find((x) => x.id === "auth-public-no-pkce").title,
    /plain/,
  );
  const conf = checkClient(
    client({
      publicClient: false,
      attributes: { "pkce.code.challenge.method": "" },
    }),
    { now: NOW },
  );
  assert.equal(
    conf.findings.find((x) => x.id === "auth-confidential-no-pkce").severity,
    "low",
  );
});

test("a realm pkce-enforcer policy downgrades the PKCE finding", () => {
  const realm = {
    realm: "demo",
    clientProfiles: {
      profiles: [
        {
          name: "p",
          executors: [{ executor: "pkce-enforcer", configuration: {} }],
        },
      ],
    },
    clientPolicies: {
      policies: [
        {
          name: "all",
          enabled: true,
          conditions: [{ condition: "any-client", configuration: {} }],
          profiles: ["p"],
        },
      ],
    },
  };
  const r = checkClient(
    client({ attributes: { "pkce.code.challenge.method": "" } }),
    { now: NOW, realm },
  );
  assert.equal(
    r.findings.find((x) => x.id === "auth-public-no-pkce").severity,
    "info",
  );
  // Keycloak never applies a policy without conditions.
  const noConditions = {
    ...realm,
    clientPolicies: {
      policies: [{ name: "all", enabled: true, profiles: ["p"] }],
    },
  };
  const r2 = checkClient(
    client({ attributes: { "pkce.code.challenge.method": "" } }),
    { now: NOW, realm: noConditions },
  );
  assert.equal(
    r2.findings.find((x) => x.id === "auth-public-no-pkce").severity,
    "high",
  );
});

test("shared secrets: age without rotation, and asymmetric auth passes", () => {
  const old = checkClient(
    client({
      publicClient: false,
      clientAuthenticatorType: "client-secret",
      attributes: {
        "client.secret.creation.time": String(Date.UTC(2024, 0, 1) / 1000),
      },
    }),
    { now: NOW },
  );
  assert.ok(ids(old).includes("auth-secret-old"));
  assert.ok(ids(old).includes("auth-shared-secret"));
  const jwt = checkClient(
    client({ publicClient: false, clientAuthenticatorType: "client-jwt" }),
    { now: NOW },
  );
  assert.ok(
    !ids(jwt).some(
      (i) => i.startsWith("auth-secret") || i === "auth-shared-secret",
    ),
  );
});

test("bearer-only is reported as legacy and skips flow checks", () => {
  const r = checkClient(
    { clientId: "api", bearerOnly: true, directAccessGrantsEnabled: true },
    { now: NOW },
  );
  assert.equal(r.kind, "bearer-only");
  assert.deepEqual(ids(r), ["auth-bearer-only"]);
});

test("scope checks", () => {
  const r = checkClient(
    client({
      fullScopeAllowed: true,
      defaultClientScopes: ["profile", "offline_access", "microprofile-jwt"],
    }),
    { now: NOW },
  );
  const got = ids(r);
  assert.ok(got.includes("scopes-full-scope"));
  assert.ok(got.includes("scopes-offline-default"));
  assert.ok(got.includes("scopes-offline-no-consent"));
  assert.ok(got.includes("scopes-microprofile-default"));
});

test("token lifespan overrides", () => {
  const r = checkClient(
    client({
      attributes: {
        "access.token.lifespan": "7200",
        "client.offline.session.idle.timeout": String(90 * 86400),
      },
    }),
    { now: NOW, realm: { accessTokenLifespan: 300 } },
  );
  const at = r.findings.find((f) => f.id === "tokens-access-token-lifespan");
  assert.equal(at.severity, "high");
  assert.match(at.title, /2 hours/);
  assert.match(at.why, /5 minutes/);
  assert.ok(ids(r).includes("tokens-client-offline-session-idle-timeout"));
  // Longer than the realm, but still short: informational only.
  const mild = checkClient(
    client({ attributes: { "access.token.lifespan": "600" } }),
    {
      now: NOW,
      realm: { accessTokenLifespan: 300 },
    },
  );
  assert.equal(
    mild.findings.find((f) => f.id === "tokens-access-token-lifespan").severity,
    "info",
  );
});

test("logout checks for confidential clients", () => {
  const none = checkClient(
    client({ publicClient: false, clientAuthenticatorType: "client-jwt" }),
    { now: NOW },
  );
  assert.ok(ids(none).includes("logout-none"));
  const back = checkClient(
    client({
      publicClient: false,
      clientAuthenticatorType: "client-jwt",
      attributes: { "backchannel.logout.url": "http://app.example.com/logout" },
    }),
    { now: NOW },
  );
  assert.ok(!ids(back).includes("logout-none"));
  assert.ok(ids(back).includes("logout-http"));
});

test("SAML checks", () => {
  const saml = {
    clientId: "https://sp.example.com/saml",
    protocol: "saml",
    redirectUris: ["https://sp.example.com/*"],
    attributes: {
      "saml.server.signature": "false",
      "saml.assertion.signature": "false",
      "saml.client.signature": "false",
      "saml.signature.algorithm": "RSA_SHA1",
      saml_force_name_id_format: "false",
      saml_assertion_consumer_url_post: "http://sp.example.com/acs",
      "saml.allow.ecp.flow": "true",
    },
  };
  const r = checkClient(saml, { now: NOW });
  const got = ids(r);
  for (const id of [
    "saml-unsigned",
    "saml-client-signature-off",
    "saml-not-encrypted",
    "saml-sha1",
    "saml-name-id-not-forced",
    "saml-acs-http",
    "saml-ecp",
    "redirect-wildcard-root",
  ]) {
    assert.ok(got.includes(id), `expected ${id} in ${got}`);
  }
  assert.ok(!got.some((i) => i.startsWith("origins") || i.startsWith("auth-")));
  assert.equal(r.kind, "saml");
  assert.equal(r.fixed.attributes["saml.server.signature"], "true");
});

test("secrets are masked and never appear in output", () => {
  const secret = "super-secret-value-123";
  const text = JSON.stringify(client({ publicClient: false, secret }));
  const a = analyze(text, NOW);
  assert.ok(!("error" in a));
  assert.equal(a.parsed.hadPlaintextSecrets, true);
  const r = a.results[0];
  assert.equal(r.secret, "plaintext");
  assert.ok(ids(r).includes("secret-in-export"));
  assert.equal(r.redacted.secret, MASK);
  const everything = JSON.stringify([
    a.parsed.redactedInput,
    r.redacted,
    r.fixed,
    toMarkdown(a.results),
  ]);
  assert.ok(!everything.includes(secret), "secret leaked into output");
});

test("SAML private keys are masked too", () => {
  const p = parseInput(
    JSON.stringify({
      clientId: "sp",
      protocol: "saml",
      attributes: {
        "saml.signing.private.key": "MIIEvQIBADANBgkqhkiG9w0BAQEFAASC",
      },
    }),
  );
  assert.ok(p.ok);
  assert.equal(p.clients[0].attributes["saml.signing.private.key"], MASK);
  assert.equal(p.hadPlaintextSecrets, true);
});

test("parseInput rejects non-client JSON with a helpful error", () => {
  assert.equal(parseInput("").ok, false);
  assert.match(parseInput("{nope").error, /valid JSON/);
  assert.match(parseInput('{"foo": 1}').error, /clientId/);
});

test("real Keycloak 26.8.1 console export of one client", () => {
  const a = analyze(fixture("client-console-export-26.8.1.json"), NOW);
  assert.ok(!("error" in a));
  assert.equal(a.parsed.source, "client");
  const r = a.results[0];
  assert.equal(r.clientId, "web-app");
  assert.equal(r.kind, "confidential");
  const got = ids(r);
  for (const id of [
    "secret-in-export",
    "redirect-wildcard-root",
    "redirect-http",
    "post-logout-wildcard-root",
    "origins-wildcard",
    "flow-implicit",
    "flow-direct-access",
    "flow-device",
    "flow-service-account-mixed",
    "tokens-access-token-lifespan",
    "scopes-full-scope",
  ]) {
    assert.ok(got.includes(id), `expected ${id} in ${got}`);
  }
  // Secret was created at export time, so no age finding.
  assert.ok(!got.includes("auth-secret-old"));
});

test("real Keycloak 26.8.1 realm partial export", () => {
  const a = analyze(fixture("realm-partial-export-26.8.1.json"), NOW);
  assert.ok(!("error" in a));
  assert.equal(a.parsed.source, "realm");
  assert.equal(a.results.length, 9);
  // Partial exports mask secrets themselves.
  assert.equal(a.parsed.hadPlaintextSecrets, false);
  const byId = Object.fromEntries(a.results.map((r) => [r.clientId, r]));
  assert.equal(byId["web-app"].secret, "masked");
  assert.ok(!ids(byId["web-app"]).includes("secret-in-export"));

  // admin-cli ships with the password grant on.
  assert.ok(ids(byId["admin-cli"]).includes("flow-direct-access"));
  // Built-in console wildcards are informational, not high.
  const console = byId["security-admin-console"].findings.find(
    (f) => f.id === "redirect-wildcard-path",
  );
  assert.equal(console.severity, "info");
  // A bare client created with defaults: public SPA without PKCE.
  assert.ok(ids(byId["spa"]).includes("auth-public-no-pkce"));
  // SAML client created with console defaults signs documents and requests.
  const saml = ids(byId["https://sp.example.com/saml"]);
  assert.ok(!saml.includes("saml-unsigned"));
  assert.ok(!saml.includes("saml-client-signature-off"));
  assert.ok(saml.includes("saml-assertion-unsigned"));
  assert.ok(saml.includes("saml-not-encrypted"));

  const realmIds = a.realmFindings.map((f) => f.id);
  assert.ok(realmIds.includes("realm-no-refresh-rotation"));
  assert.ok(realmIds.includes("realm-offline-unlimited"));
  assert.ok(realmIds.includes("realm-no-ropc-policy"));
  assert.ok(!realmIds.includes("realm-access-token-lifespan"));
});

test("checkRealm flags long realm access tokens", () => {
  const f = checkRealm({ realm: "r", accessTokenLifespan: 7200 });
  assert.equal(
    f.find((x) => x.id === "realm-access-token-lifespan").severity,
    "high",
  );
});

test("the example client trips most rules and is fixable", () => {
  const r = checkClient(EXAMPLE_CLIENT, { now: NOW });
  assert.equal(r.secret, "plaintext");
  assert.ok(r.findings.length >= 15, `only ${r.findings.length} findings`);
  assert.equal(r.grade, "F");
  assert.equal(r.fixed.implicitFlowEnabled, false);
  assert.equal(r.fixed.directAccessGrantsEnabled, false);
  assert.deepEqual(r.fixed.webOrigins, ["+"]);
  assert.equal(r.fixed.attributes["access.token.lifespan"], undefined);
  assert.equal(r.fixed.attributes["pkce.code.challenge.method"], "S256");
  assert.ok(!r.fixed.defaultClientScopes.includes("offline_access"));
  assert.equal(r.fixed.secret, undefined);
  // The fix must not invent redirect URIs.
  assert.deepEqual(r.fixed.redirectUris, EXAMPLE_CLIENT.redirectUris);
  // Re-checking the fixed client removes the fixed findings.
  const again = checkClient(r.fixed, { now: NOW });
  assert.ok(!ids(again).includes("flow-implicit"));
  assert.ok(again.score > r.score);
});

test("markdown report has a summary for several clients and no secrets", () => {
  const a = analyze(fixture("realm-partial-export-26.8.1.json"), NOW);
  const md = toMarkdown(a.results, a.realmFindings, { realmName: "demo" });
  assert.match(md, /^# Keycloak client security report/);
  assert.match(md, /\| Client \| Type \| Score/);
  assert.match(md, /## Realm settings/);
  assert.match(md, /## `web-app`/);
  assert.ok(!md.includes("**********"));
});

test("scoring and diff helpers", () => {
  assert.equal(scoreFindings([]).score, 100);
  const s = scoreFindings([{ severity: "high" }, { severity: "medium" }]);
  assert.equal(s.score, 72);
  assert.equal(s.grade, "C");
  const d = diffLines("a\nb\nc", "a\nB\nc");
  assert.deepEqual(
    d.map((l) => l.type),
    ["same", "del", "add", "same"],
  );
});
