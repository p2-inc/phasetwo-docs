// Unit tests for the SAML decoder core. Run with: node --test src/components/tools/saml/core/test/
// Signed fixtures were produced by xml-crypto (an independent XML-DSig
// implementation) with throwaway keys; the c14n reference outputs come from
// xml-crypto's canonicalizers.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  analyzeSaml,
  canonicalize,
  childElements,
  checkTimes,
  decodeSamlInput,
  descendants,
  EXAMPLES,
  explainStatusCode,
  listSignatures,
  NS,
  parseKeycloakUrl,
  parseTrustInput,
  parseXml,
  prettyPrintXml,
  samlHints,
  summarizeSaml,
  verifyRedirectSignature,
  verifyXmlSignatures,
  XmlParseError,
} from "../index.ts";

const F = JSON.parse(
  readFileSync(new URL("./fixtures.json", import.meta.url), "utf8"),
);
const T0 = Date.parse("2026-01-15T17:04:20Z");

const keys = async (pem: string) => (await parseTrustInput(pem)).keys;
const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");

/* ---------------- XML parser ---------------- */

test("parser resolves namespaces and decodes entities", () => {
  const d = parseXml(
    `<?xml version="1.0"?><a:r xmlns:a="urn:a" x="1&amp;2&#x41;" y="a\tb"><a:c>&lt;t&gt;<![CDATA[<raw>]]></a:c></a:r>`,
  );
  assert.equal(d.root.namespaceURI, "urn:a");
  assert.equal(d.root.localName, "r");
  assert.equal(d.root.attributes.find((a) => a.name === "x")!.value, "1&2A");
  assert.equal(d.root.attributes.find((a) => a.name === "y")!.value, "a b");
  const c = childElements(d.root)[0];
  assert.deepEqual(
    c.children.map((n) => (n.type === "text" ? n.value : "")),
    ["<t>", "<raw>"],
  );
});

test("parser rejects DOCTYPE, unbound prefixes, and mismatched tags", () => {
  assert.throws(
    () => parseXml(`<!DOCTYPE x [<!ENTITY a "b">]><x>&a;</x>`),
    XmlParseError,
  );
  assert.throws(() => parseXml(`<p:x/>`), /Unbound namespace prefix/);
  assert.throws(() => parseXml(`<a><b></a></b>`), /Mismatched end tag/);
  assert.throws(() => parseXml(`<a/><b/>`), XmlParseError);
  assert.throws(() => parseXml(`<a>&nope;</a>`), /Unknown entity/);
});

/* ---------------- Canonicalization ---------------- */

test("canonicalization matches xml-crypto reference output", () => {
  for (const ref of F.c14nRefs.slice(0, 3)) {
    const d = parseXml(ref.xml);
    const inner = childElements(d.root)[0];
    assert.equal(canonicalize(d.root, { exclusive: true }), ref.excRoot);
    assert.equal(canonicalize(inner, { exclusive: true }), ref.excChild);
    assert.equal(canonicalize(d.root, { exclusive: false }), ref.incRoot);
  }
  const p = F.c14nRefs[3];
  const assertion = descendants(
    parseXml(p.xml).root,
    NS.ASSERTION,
    "Assertion",
  )[0];
  assert.equal(
    canonicalize(assertion, {
      exclusive: true,
      inclusivePrefixes: ["xs", "xsi"],
    }),
    p.prefixAssertion,
  );
});

/* ---------------- Input detection ---------------- */

test("detects raw XML", async () => {
  const d = await decodeSamlInput(F.authnRequest);
  assert.ok(d.ok);
  assert.equal(d.detected, "Raw XML");
});

test("detects base64 (HTTP-POST encoding)", async () => {
  const d = await decodeSamlInput(b64(F.bothSigned));
  assert.ok(d.ok);
  assert.equal(d.binding, "HTTP-POST");
  assert.equal(d.compressed, false);
  assert.equal(d.xml, F.bothSigned);
});

test("detects a form body with SAMLResponse and RelayState", async () => {
  const d = await decodeSamlInput(F.postBody);
  assert.ok(d.ok);
  assert.equal(d.parameter, "SAMLResponse");
  assert.equal(d.relayState, "c2F0ZS1leGFtcGxlLTEyMzQ.Zm9vYmFy");
});

test("detects an HTTP-Redirect URL with DEFLATE and a query signature", async () => {
  const d = await decodeSamlInput(F.redirectUrl);
  assert.ok(d.ok, d.error);
  assert.equal(d.binding, "HTTP-Redirect");
  assert.equal(d.compressed, true);
  assert.equal(d.endpoint, "https://idp.example.com/saml/sso");
  assert.equal(d.xml, F.authnRequest);
  assert.match(d.signedQuery!, /^SAMLRequest=.+&RelayState=.+&SigAlg=.+$/);
});

test("detects a bare URL-encoded DEFLATE value", async () => {
  const raw = new URL(F.redirectUrl).search.match(/SAMLRequest=([^&]+)/)![1];
  const d = await decodeSamlInput(raw);
  assert.ok(d.ok, d.error);
  assert.equal(d.compressed, true);
  assert.match(d.detected, /URL-encoded base64 \+ DEFLATE/);
});

test("reports junk input without throwing", async () => {
  const d = await decodeSamlInput("definitely not saml !!!");
  assert.equal(d.ok, false);
  assert.ok(d.error);
  const u = await decodeSamlInput("https://example.com/?foo=bar");
  assert.equal(u.ok, false);
});

/* ---------------- Signatures ---------------- */

test("verifies signatures produced by xml-crypto", async () => {
  const idp = await keys(F.idpCert);
  const cases: [string, string[], string?][] = [
    ["assertionSigned", ["Assertion"]],
    ["bothSigned", ["Response", "Assertion"]],
    ["inclusive", ["Assertion"]],
    ["prefixList", ["Assertion"]],
    ["sha1", ["Response"]],
    ["ecdsa", ["Assertion"], F.ecCert],
  ];
  for (const [name, signed, cert] of cases) {
    const results = await verifyXmlSignatures(
      parseXml(F[name]),
      cert ? await keys(cert) : idp,
    );
    assert.deepEqual(
      results.map((r) => `${r.status}:${r.signedElement}`),
      signed.map((s) => `valid:${s}`),
      `${name}: ${results.map((r) => r.message).join(" | ")}`,
    );
  }
});

test("accepts a bare base64 certificate and IdP metadata", async () => {
  const bare = await parseTrustInput(F.idpCertBare);
  assert.equal(bare.keys.length, 1);
  assert.equal(
    bare.keys[0].certificate?.subject,
    "CN=idp.example.com, O=Example IdP",
  );
  const md = `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" entityID="https://idp.example.com/saml/metadata"><md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:KeyDescriptor use="encryption"><ds:KeyInfo><ds:X509Data><ds:X509Certificate>${F.idpCertBare}</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor><md:KeyDescriptor use="signing"><ds:KeyInfo><ds:X509Data><ds:X509Certificate>${F.idpCertBare}</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor></md:IDPSSODescriptor></md:EntityDescriptor>`;
  const m = await parseTrustInput(md);
  assert.equal(m.keys.length, 1);
  assert.match(m.keys[0].label, /^IdP signing/);
  const r = await verifyXmlSignatures(parseXml(F.bothSigned), m.keys);
  assert.ok(r.every((x) => x.status === "valid"));
});

test("ignores private keys pasted as trust input", async () => {
  const r = await parseTrustInput(
    "-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----",
  );
  assert.equal(r.keys.length, 0);
  assert.match(r.errors[0], /never a private key/);
});

test("rejects the wrong key, tampering, and reformatting", async () => {
  const idp = await keys(F.idpCert);
  const wrong = await verifyXmlSignatures(
    parseXml(F.bothSigned),
    await keys(F.spCert),
  );
  assert.ok(wrong.every((r) => r.status === "invalid"));
  assert.ok(wrong.every((r) => /not made by/.test(r.message)));

  const tampered = F.bothSigned.replace(
    ">jane.doe@example.com</saml:NameID>",
    ">admin@example.com</saml:NameID>",
  );
  const t = await verifyXmlSignatures(parseXml(tampered), idp);
  assert.ok(
    t.every((r) => r.status === "invalid" && /Digest mismatch/.test(r.message)),
  );

  const pretty = prettyPrintXml(parseXml(F.bothSigned));
  const p = await verifyXmlSignatures(parseXml(pretty), idp);
  assert.ok(p.some((r) => r.status === "invalid"));
});

test("flags duplicate IDs (signature wrapping)", async () => {
  const idp = await keys(F.idpCert);
  const id = "_asrt-2a9d6c4b-8e1f-4b73-b5d0-6c3e9f1a7d42";
  const evil = F.assertionSigned.replace(
    "</samlp:Response>",
    `<saml:Assertion ID="${id}" Version="2.0" IssueInstant="2026-01-15T17:04:12Z"><saml:Issuer>https://idp.example.com/saml/metadata</saml:Issuer></saml:Assertion></samlp:Response>`,
  );
  const doc = parseXml(evil);
  const r = await verifyXmlSignatures(doc, idp);
  assert.equal(r[0].status, "invalid");
  assert.match(r[0].message, /signature-wrapping/);
  assert.ok(summarizeSaml(doc).warnings.some((w) => /appears 2 times/.test(w)));
});

test("verifies HTTP-Redirect query signatures and detects re-encoding", async () => {
  const d = await decodeSamlInput(F.redirectUrl);
  const ok = await verifyRedirectSignature(d, await keys(F.spCert));
  assert.equal(ok.status, "valid", ok.message);
  const bad = await verifyRedirectSignature(
    {
      ...d,
      signedQuery: d.signedQuery!.replace("RelayState=c2F0", "RelayState=X2F0"),
    },
    await keys(F.spCert),
  );
  assert.equal(bad.status, "invalid");
  const wrongKey = await verifyRedirectSignature(d, await keys(F.idpCert));
  assert.equal(wrongKey.status, "invalid");
});

/* ---------------- Summary, times, hints ---------------- */

test("summarizes a Response", () => {
  const s = summarizeSaml(parseXml(F.bothSigned));
  assert.equal(s.messageType, "Response");
  assert.equal(s.issuer, "https://idp.example.com/saml/metadata");
  assert.equal(s.inResponseTo, "ID_4c1f8e2a-93b7-4d05-a6e2-7b9d0c3f5a81");
  assert.equal(s.status?.code, "urn:oasis:names:tc:SAML:2.0:status:Success");
  assert.ok(s.messageSigned && s.assertionSigned);
  const a = s.assertions[0];
  assert.equal(a.nameId?.value, "jane.doe@example.com");
  assert.deepEqual(a.conditions?.audiences, [
    "https://sso.example.com/realms/acme",
  ]);
  assert.equal(
    a.authnStatements[0].classRef,
    "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport",
  );
  assert.deepEqual(a.attributes.find((x) => x.name === "groups")?.values, [
    "engineering",
    "sso-admins",
  ]);
  assert.equal(listSignatures(parseXml(F.bothSigned)).length, 2);
});

test("summarizes an AuthnRequest", () => {
  const s = summarizeSaml(parseXml(F.authnRequest));
  assert.equal(s.messageType, "AuthnRequest");
  assert.equal(
    s.assertionConsumerServiceURL,
    "https://sso.example.com/realms/acme/broker/example-idp/endpoint",
  );
  assert.equal(
    s.protocolBinding,
    "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
  );
  assert.equal(
    s.nameIdPolicy?.format,
    "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  );
});

test("detects encrypted assertions and explains error statuses", () => {
  const xml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_r1" Version="2.0" IssueInstant="2026-01-15T17:04:12Z"><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Responder"><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:InvalidNameIDPolicy"/></samlp:StatusCode></samlp:Status><saml:EncryptedAssertion><xenc:EncryptedData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"/></saml:EncryptedAssertion></samlp:Response>`;
  const s = summarizeSaml(parseXml(xml));
  assert.equal(s.encryptedAssertionCount, 1);
  assert.equal(
    s.status?.subCode,
    "urn:oasis:names:tc:SAML:2.0:status:InvalidNameIDPolicy",
  );
  assert.equal(
    explainStatusCode(s.status?.subCode)?.short,
    "Invalid NameID policy",
  );
  const hints = samlHints(s);
  assert.ok(
    hints.some(
      (h) => h.level === "error" && /Invalid NameID policy/.test(h.title),
    ),
  );
  assert.ok(
    hints.some(
      (h) =>
        /Encrypted assertion/.test(h.title) &&
        /never paste a private key/.test(h.detail),
    ),
  );
});

test("time checks flag expiry and clock skew", () => {
  const s = summarizeSaml(parseXml(F.bothSigned));
  const fresh = checkTimes(s, { now: T0 });
  assert.ok(fresh.every((c) => c.state === "ok" || c.state === "info"));
  const late = Date.parse("2026-01-15T17:09:40Z");
  const stale = checkTimes(s, { now: late });
  const exp = stale.find((c) => c.label === "Conditions NotOnOrAfter")!;
  assert.equal(exp.state, "expired");
  assert.match(exp.relative, /seconds ago/);
  assert.ok(
    samlHints(s, { times: stale, now: late }).some((h) =>
      /Allowed clock skew/.test(h.title),
    ),
  );
  // An allowed skew tolerates it.
  assert.equal(
    checkTimes(s, { now: late, clockSkewSeconds: 60 }).find(
      (c) => c.label === "Conditions NotOnOrAfter",
    )!.state,
    "ok",
  );
  const early = checkTimes(s, { now: Date.parse("2026-01-15T17:03:00Z") });
  assert.equal(
    early.find((c) => c.label === "Conditions NotBefore")!.state,
    "not-yet-valid",
  );
});

test("recognizes Keycloak endpoint patterns", () => {
  assert.deepEqual(
    parseKeycloakUrl("https://sso.example.com/realms/acme/protocol/saml"),
    {
      kind: "realm-saml",
      baseUrl: "https://sso.example.com",
      realm: "acme",
      realmUrl: "https://sso.example.com/realms/acme",
    },
  );
  assert.equal(
    parseKeycloakUrl(
      "https://sso.example.com/auth/realms/acme/broker/okta/endpoint",
    )?.alias,
    "okta",
  );
  assert.equal(
    parseKeycloakUrl(
      "https://sso.example.com/auth/realms/acme/broker/okta/endpoint",
    )?.realmUrl,
    "https://sso.example.com/auth/realms/acme",
  );
  assert.equal(
    parseKeycloakUrl(
      "https://sso.example.com/realms/acme/broker/okta/endpoint/clients/app",
    )?.kind,
    "broker-idp-initiated",
  );
  assert.equal(
    parseKeycloakUrl(
      "https://sso.example.com/realms/acme/protocol/saml/clients/app",
    )?.clientUrlName,
    "app",
  );
  assert.equal(
    parseKeycloakUrl("https://sso.example.com/realms/acme")?.kind,
    "realm",
  );
  assert.equal(parseKeycloakUrl("https://app.example.com/saml/acs"), undefined);
});

test("Keycloak hints for an audience mismatch at a broker endpoint", () => {
  const xml = F.unsignedResponse.replace(
    "<saml:Audience>https://sso.example.com/realms/acme</saml:Audience>",
    "<saml:Audience>urn:wrong:sp</saml:Audience>",
  );
  const s = summarizeSaml(parseXml(xml));
  const hints = samlHints(s);
  assert.ok(
    hints.some((h) =>
      /Audience is not Keycloak's default SP entity ID/.test(h.title),
    ),
  );
  assert.ok(hints.some((h) => /Nothing is signed/.test(h.title)));
});

test("analyzeSaml handles every bundled example end to end", async () => {
  for (const ex of EXAMPLES) {
    const a = await analyzeSaml(ex.input, { now: T0 });
    assert.equal(a.error, undefined, ex.id);
    assert.ok(a.summary && a.pretty.length > 0);
    const k = await keys(ex.certificate);
    if (a.decoded.signature)
      assert.equal(
        (await verifyRedirectSignature(a.decoded, k)).status,
        "valid",
      );
    else
      assert.ok(
        (await verifyXmlSignatures(a.document!, k)).every(
          (r) => r.status === "valid",
        ),
      );
  }
});
