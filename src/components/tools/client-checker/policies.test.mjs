// Client policy condition evaluation. The fixture is a partial export (with
// roles) from a Keycloak 26.8.1 realm whose policies were checked against the
// running server: see the "matches what Keycloak did" test for the observed
// behavior.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  combineVotes,
  configuredExecutors,
  coverage,
  evaluateCondition,
  evaluatePolicies,
} from "./policies.ts";
import { analyze } from "./engine.ts";

const realm = JSON.parse(
  readFileSync(
    new URL("./fixtures/realm-client-policies-26.8.1.json", import.meta.url),
    "utf8",
  ),
);
const byId = (id) => realm.clients.find((c) => c.clientId === id);

const cond = (condition, configuration = {}) => ({ condition, configuration });

test("any-client matches every client and event", () => {
  for (const ev of ["authorization-code", "implicit", "password", "save"]) {
    assert.equal(evaluateCondition(cond("any-client"), {}, {}, ev).vote, "yes");
  }
});

test("client-access-type follows Keycloak: public wins over bearer-only", () => {
  const c = cond("client-access-type", { type: ["public"] });
  assert.equal(
    evaluateCondition(c, { publicClient: true }, {}, "password").vote,
    "yes",
  );
  assert.equal(
    evaluateCondition(c, { publicClient: false }, {}, "password").vote,
    "no",
  );
  assert.equal(
    evaluateCondition(
      c,
      { publicClient: true, bearerOnly: true },
      {},
      "password",
    ).vote,
    "yes",
  );
  const bo = cond("client-access-type", { type: ["bearer-only"] });
  assert.equal(
    evaluateCondition(bo, { bearerOnly: true }, {}, "save").vote,
    "yes",
  );
  assert.equal(
    evaluateCondition(
      cond("client-access-type", { type: ["confidential"] }),
      {},
      {},
      "save",
    ).vote,
    "yes",
    "a client with neither flag is confidential",
  );
});

test("client-type compares the protocol, defaulting to openid-connect", () => {
  const saml = cond("client-type", { protocol: "saml" });
  assert.equal(
    evaluateCondition(saml, { protocol: "saml" }, {}, "save").vote,
    "yes",
  );
  assert.equal(evaluateCondition(saml, {}, {}, "save").vote, "no");
});

test("client-roles needs the realm's client roles, otherwise can't determine", () => {
  const c = cond("client-roles", { roles: ["partner-app"] });
  assert.equal(
    evaluateCondition(c, byId("partner"), realm, "implicit").vote,
    "yes",
  );
  assert.equal(
    evaluateCondition(c, byId("backend"), realm, "implicit").vote,
    "no",
  );
  const noRoles = { ...realm, roles: undefined };
  const r = evaluateCondition(c, byId("partner"), noRoles, "implicit");
  assert.equal(r.vote, "unknown");
  assert.match(r.reason, /export with roles/);
  assert.equal(
    evaluateCondition(
      cond("client-roles", {}),
      byId("partner"),
      realm,
      "implicit",
    ).vote,
    "no",
  );
});

test("client-attributes parses Keycloak's serialized key/value list", () => {
  const c = cond("client-attributes", {
    attributes: '[{"key":"policy.tier","value":"strict"}]',
  });
  assert.equal(
    evaluateCondition(c, byId("backend"), realm, "password").vote,
    "yes",
  );
  assert.equal(
    evaluateCondition(c, byId("spa-public"), realm, "password").vote,
    "no",
  );
  // Every pair must match, and a key with two values never matches.
  const two = cond("client-attributes", {
    attributes:
      '[{"key":"policy.tier","value":"strict"},{"key":"policy.tier","value":"lax"}]',
  });
  assert.equal(
    evaluateCondition(two, byId("backend"), realm, "password").vote,
    "no",
  );
  assert.equal(
    evaluateCondition(
      cond("client-attributes", {}),
      byId("backend"),
      realm,
      "password",
    ).vote,
    "no",
  );
});

test("client-scopes: Default is decidable, Optional depends on the request", () => {
  const client = {
    defaultClientScopes: ["profile"],
    optionalClientScopes: ["offline_access"],
  };
  const d = cond("client-scopes", { type: "Default", scopes: ["profile"] });
  assert.equal(
    evaluateCondition(d, client, {}, "authorization-code").vote,
    "yes",
  );
  const o = cond("client-scopes", {
    type: "Optional",
    scopes: ["offline_access"],
  });
  assert.equal(
    evaluateCondition(o, client, {}, "authorization-code").vote,
    "unknown",
  );
  const none = cond("client-scopes", { type: "Optional", scopes: ["phone"] });
  assert.equal(
    evaluateCondition(none, client, {}, "authorization-code").vote,
    "no",
  );
  const any = cond("client-scopes", { type: "Any", scopes: ["profile"] });
  assert.equal(evaluateCondition(any, client, {}, "password").vote, "yes");
  // Not evaluated when a client is saved.
  assert.equal(evaluateCondition(d, client, {}, "save").vote, "abstain");
});

test("grant-type matches the request's grant and abstains on save", () => {
  const c = cond("grant-type", { grant_types: ["password"] });
  assert.equal(evaluateCondition(c, {}, {}, "password").vote, "yes");
  assert.equal(evaluateCondition(c, {}, {}, "authorization-code").vote, "no");
  assert.equal(evaluateCondition(c, {}, {}, "save").vote, "abstain");
  const ac = cond("grant-type", { grant_types: ["authorization_code"] });
  assert.equal(evaluateCondition(ac, {}, {}, "authorization-code").vote, "yes");
});

test("client-updater conditions abstain on requests and can't be determined on save", () => {
  for (const name of [
    "client-updater-source-host",
    "client-updater-source-roles",
    "client-updater-source-groups",
    "client-updater-context",
  ]) {
    assert.equal(
      evaluateCondition(cond(name), {}, {}, "password").vote,
      "abstain",
    );
    assert.equal(evaluateCondition(cond(name), {}, {}, "save").vote, "unknown");
  }
});

test("runtime-only and unrecognized conditions are reported as can't determine", () => {
  assert.equal(
    evaluateCondition(cond("acr-condition"), {}, {}, "authorization-code").vote,
    "unknown",
  );
  assert.equal(
    evaluateCondition(cond("identity-provider-alias"), {}, {}, "password").vote,
    "unknown",
  );
  assert.equal(
    evaluateCondition(cond("custom-thing"), {}, {}, "password").vote,
    "unknown",
  );
});

test("combineVotes: negation, abstain, STRICT and empty policies", () => {
  const v = (vote, negative = false) => ({
    condition: "c",
    negative,
    vote,
    reason: "r",
  });
  assert.equal(combineVotes([], false).applies, "no");
  assert.equal(combineVotes([v("yes")], false).applies, "yes");
  assert.equal(combineVotes([v("yes", true)], false).applies, "no");
  assert.equal(combineVotes([v("no", true)], false).applies, "yes");
  assert.equal(combineVotes([v("yes"), v("abstain")], false).applies, "yes");
  assert.equal(combineVotes([v("yes"), v("abstain")], true).applies, "no");
  assert.equal(combineVotes([v("abstain")], false).applies, "no");
  assert.equal(
    combineVotes([v("yes"), v("unknown")], false).applies,
    "unknown",
  );
  // A definite NO wins over unknowns.
  assert.equal(combineVotes([v("unknown"), v("no")], false).applies, "no");
  // Negation leaves unknown and abstain alone.
  assert.equal(combineVotes([v("unknown", true)], false).applies, "unknown");
});

test("disabled policies and enabled: null never apply", () => {
  const r = evaluatePolicies(byId("spa-public"), realm, "authorization-code");
  const disabled = r.find((p) => p.policy === "disabled-any");
  assert.equal(disabled.enabled, false);
  assert.equal(disabled.applies, "no");
  // Global profile executors are known even though the export omits them.
  assert.ok(disabled.executors.includes("pkce-enforcer"));
  const nullEnabled = {
    clientPolicies: {
      policies: [
        {
          name: "x",
          conditions: [cond("any-client")],
          profiles: ["oauth-2-1-for-public-client"],
        },
      ],
    },
  };
  assert.equal(coverage({}, nullEnabled, "pkce-enforcer").verdict, "no");
  assert.ok(!configuredExecutors(realm).has("dpop-bind-enforcer"));
});

test("matches what Keycloak 26.8.1 did with the same policies", () => {
  // Observed on the server this fixture was exported from:
  // - spa-public: auth request without PKCE -> "Missing parameter: code_challenge_method"
  //   (pkce-public, client-access-type public); password grant -> tokens issued.
  // - backend: password grant -> "resource owner password credentials grant is prohibited."
  //   (client-attributes policy.tier=strict, and ropc-not-public); auth request without
  //   PKCE succeeds unless scope=offline_access is requested (pkce-by-scope, Optional).
  // - partner: response_type=token -> "Implicit/Hybrid flow is prohibited."
  //   (client-roles partner-app).
  const spa = byId("spa-public");
  const backend = byId("backend");
  const partner = byId("partner");

  assert.equal(coverage(spa, realm, "pkce-enforcer").verdict, "yes");
  assert.deepEqual(coverage(spa, realm, "pkce-enforcer").policies, [
    "pkce-public",
  ]);
  assert.equal(coverage(spa, realm, "reject-ropc-grant").verdict, "no");

  assert.equal(coverage(backend, realm, "reject-ropc-grant").verdict, "yes");
  assert.deepEqual(
    coverage(backend, realm, "reject-ropc-grant").policies.sort(),
    ["no-ropc-by-attribute", "ropc-not-public"],
  );
  const backendPkce = coverage(backend, realm, "pkce-enforcer");
  assert.equal(backendPkce.verdict, "unknown");
  assert.deepEqual(backendPkce.policies, ["pkce-by-scope"]);
  assert.match(backendPkce.reasons[0], /offline_access/);

  assert.equal(
    coverage(partner, realm, "reject-implicit-grant").verdict,
    "yes",
  );
  assert.equal(coverage(backend, realm, "reject-implicit-grant").verdict, "no");
});

test("findings use the evaluated coverage", () => {
  const a = analyze(JSON.stringify(realm), Date.UTC(2026, 10, 2));
  const r = Object.fromEntries(a.results.map((x) => [x.clientId, x]));
  const f = (id, fid) => r[id].findings.find((x) => x.id === fid);

  // Covered: severity drops and the policy is named.
  assert.equal(f("backend", "flow-direct-access").severity, "low");
  assert.match(
    f("backend", "flow-direct-access").why,
    /"no-ropc-by-attribute"/,
  );
  assert.equal(f("partner", "flow-implicit").severity, "low");
  assert.equal(f("spa-public", "auth-public-no-pkce").severity, "info");
  // Not covered: full severity, no policy claim.
  assert.equal(f("spa-public", "flow-direct-access").severity, "high");
  assert.doesNotMatch(
    f("spa-public", "flow-direct-access").why,
    /Realm client policy/,
  );
  // Can't determine: severity kept, explained.
  const bp = f("backend", "auth-confidential-no-pkce");
  assert.equal(bp.severity, "low");
  assert.match(bp.why, /can't be determined/);

  // Per-client coverage is reported for the UI and the Markdown report.
  const cov = Object.fromEntries(
    r["backend"].policies.map((p) => [p.executor, p.verdict]),
  );
  assert.deepEqual(cov, {
    "pkce-enforcer": "unknown",
    "reject-implicit-grant": "no",
    "reject-ropc-grant": "yes",
    "secure-redirect-uris-enforcer": "no",
  });
  // The realm uses reject-ropc-grant, so there's no "no policy" finding.
  assert.ok(!a.realmFindings.some((x) => x.id === "realm-no-ropc-policy"));
});

test("on-save policies with updater conditions are can't determine for redirect URIs", () => {
  const savePolicy = {
    clientProfiles: {
      profiles: [
        {
          name: "uris",
          executors: [{ executor: "secure-redirect-uris-enforcer" }],
        },
      ],
    },
    clientPolicies: {
      policies: [
        {
          name: "from-ci",
          enabled: true,
          conditions: [
            cond("client-updater-source-host", {
              "trusted-hosts": ["ci.example.com"],
            }),
          ],
          profiles: ["uris"],
        },
      ],
    },
  };
  const client = { clientId: "c", redirectUris: ["https://app.example.com/*"] };
  assert.equal(
    coverage(client, savePolicy, "secure-redirect-uris-enforcer").verdict,
    "unknown",
  );
});
