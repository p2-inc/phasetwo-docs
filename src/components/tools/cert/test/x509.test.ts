// Unit tests for the certificate / CSR decoder core.
// Run with: node --test src/components/tools/cert/test/
//
// Expected fingerprints and serials come from `openssl x509 -fingerprint`
// on the same synthetic fixtures. Private keys used for the refusal tests
// are generated at test time and never written to disk.

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";

import { bytesToBase64 } from "../der.ts";
import {
  EXAMPLE_CHAIN,
  EXAMPLE_CSR,
  EXAMPLE_SAML_BASE64,
} from "../examples.ts";
import { derFileToPem, parseFileBytes, parseText, toPem } from "../input.ts";
import {
  checkChain,
  fingerprint,
  isSelfIssued,
  keySummary,
  relativeTime,
  validityState,
  verifySignature,
  verifySignedBy,
} from "../x509.ts";

const fixtures = JSON.parse(
  readFileSync(new URL("./fixtures.json", import.meta.url), "utf8"),
) as Record<string, string>;

test("decodes the example chain with every field", async () => {
  const { certs, csrs, errors, source } = parseText(EXAMPLE_CHAIN);
  assert.deepEqual(errors, []);
  assert.equal(source, "pem");
  assert.equal(csrs.length, 0);
  assert.equal(certs.length, 3);
  const [leaf, int, root] = certs;

  assert.equal(leaf.version, 3);
  assert.equal(
    leaf.serialHex.toUpperCase(),
    "75F4978978A2E870D3699B251F4C42F6D0A64335",
  );
  assert.equal(
    leaf.subject.text,
    "CN=auth.example.com, O=Example Corp, L=San Francisco, ST=California, C=US",
  );
  assert.equal(
    leaf.issuer.text,
    "CN=Example Issuing CA R1, O=Example Trust Co, C=US",
  );
  assert.deepEqual(
    leaf.san.map((s) => `${s.type}:${s.value}`),
    [
      "DNS:auth.example.com",
      "DNS:*.auth.example.com",
      "DNS:example.com",
      "IP:192.0.2.10",
      "Email:admin@example.com",
      "URI:https://auth.example.com/",
    ],
  );
  assert.equal(keySummary(leaf.publicKey), "EC P-256");
  assert.equal(leaf.signatureAlgorithm.name, "sha256WithRSAEncryption");
  assert.deepEqual(leaf.keyUsage, ["Digital Signature"]);
  assert.deepEqual(leaf.extKeyUsage, [
    "TLS Web Server Authentication",
    "TLS Web Client Authentication",
  ]);
  assert.deepEqual(leaf.basicConstraints, { ca: false, pathLen: undefined });
  assert.ok(leaf.extensions.some((e) => e.name === "Key Usage" && e.critical));
  assert.equal(leaf.authorityKeyId, int.subjectKeyId);

  assert.equal(keySummary(int.publicKey), "RSA 2048-bit");
  assert.equal(int.publicKey.exponent, 65537);
  assert.deepEqual(int.basicConstraints, { ca: true, pathLen: 0 });
  assert.equal(int.signatureAlgorithm.name, "ecdsa-with-SHA384");

  assert.equal(keySummary(root.publicKey), "EC P-384");
  assert.ok(isSelfIssued(root));
  assert.ok(!isSelfIssued(leaf));

  assert.equal(
    await fingerprint(leaf.der, "SHA-256"),
    "3B:19:62:12:0C:21:21:66:40:31:31:C6:10:0C:6D:7F:9E:E6:90:2D:4D:34:33:A7:86:EA:9F:C1:F2:85:4F:8E",
  );
  assert.equal(
    await fingerprint(leaf.der, "SHA-1"),
    "F9:A5:E9:3B:FF:0B:82:D2:13:DD:37:F4:45:E2:F1:FD:81:1C:DA:00",
  );
});

test("verifies the chain in order and flags a reversed chain", async () => {
  const { certs } = parseText(EXAMPLE_CHAIN);
  const ok = await checkChain(certs);
  assert.ok(ok.inOrder);
  assert.deepEqual(
    ok.links.map((l) => [l.nameMatch, l.signature]),
    [
      [true, "valid"],
      [true, "valid"],
    ],
  );
  // RSA (PKCS#1 v1.5) signature over EC key, ECDSA P-384 over RSA key.
  assert.equal(await verifySignedBy(certs[0], certs[1]), "valid");
  assert.equal(await verifySignedBy(certs[0], certs[2]), "invalid");
  assert.equal(await verifySignedBy(certs[2], certs[2]), "valid");

  const rev = await checkChain(certs.slice().reverse());
  assert.equal(rev.inOrder, false);
  assert.match(rev.summary, /reverse order/);
});

test("decodes a bare base64 SAML certificate and SAML metadata XML", async () => {
  const bare = parseText(EXAMPLE_SAML_BASE64);
  assert.deepEqual(bare.errors, []);
  assert.equal(bare.source, "base64");
  const [c] = bare.certs;
  assert.equal(c.subject.text, "CN=example-realm");
  assert.ok(isSelfIssued(c));
  assert.equal(await verifySignedBy(c, c), "valid");
  assert.equal(
    await fingerprint(c.der, "SHA-256"),
    "53:86:58:F1:D4:4C:FC:E8:01:F2:1F:57:C0:94:B4:72:EE:5D:2A:75:E7:1D:80:34:1A:E5:AB:8B:F1:4C:07:AB",
  );

  const xml = `<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"><md:IDPSSODescriptor><md:KeyDescriptor use="signing"><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>\n${EXAMPLE_SAML_BASE64.match(/.{1,64}/g)!.join("\n")}\n</ds:X509Certificate></ds:X509Data></ds:KeyInfo></md:KeyDescriptor></md:IDPSSODescriptor></md:EntityDescriptor>`;
  const meta = parseText(xml);
  assert.equal(meta.source, "saml-xml");
  assert.equal(meta.certs.length, 1);
  assert.equal(meta.certs[0].serialHex, c.serialHex);
});

test("verifies P-521, Ed25519, and RSA-PSS self-signed certificates", async () => {
  const cases: [string, string, string][] = [
    ["p521", "EC P-521", "ecdsa-with-SHA256"],
    ["ed25519", "Ed25519", "Ed25519"],
    ["rsaPss", "RSA 2048-bit", "RSASSA-PSS"],
  ];
  for (const [key, keyDesc, sigName] of cases) {
    const { certs, errors } = parseText(fixtures[key]);
    assert.deepEqual(errors, [], key);
    const [c] = certs;
    assert.equal(keySummary(c.publicKey), keyDesc, key);
    assert.equal(c.signatureAlgorithm.name, sigName, key);
    assert.equal(await verifySignedBy(c, c), "valid", key);
  }
});

test("decodes a PKCS#10 CSR and verifies its self-signature", async () => {
  const { certs, csrs, errors } = parseText(EXAMPLE_CSR);
  assert.deepEqual(errors, []);
  assert.equal(certs.length, 0);
  assert.equal(csrs.length, 1);
  const [csr] = csrs;
  assert.equal(csr.version, 1);
  assert.equal(
    csr.subject.text,
    "CN=sso.example.com, OU=Identity, O=Example Corp, ST=California, C=US",
  );
  assert.deepEqual(
    csr.san.map((s) => `${s.type}:${s.value}`),
    ["DNS:sso.example.com", "DNS:login.example.com", "IP:192.0.2.20"],
  );
  assert.deepEqual(csr.keyUsage, ["Digital Signature", "Key Encipherment"]);
  assert.deepEqual(csr.extKeyUsage, ["TLS Web Server Authentication"]);
  assert.deepEqual(csr.basicConstraints, { ca: false, pathLen: undefined });
  assert.equal(keySummary(csr.publicKey), "RSA 2048-bit");
  assert.equal(csr.signatureAlgorithm.name, "sha256WithRSAEncryption");
  assert.equal(csr.hasChallengePassword, false);
  assert.equal(await verifySignature(csr, csr.publicKey), "valid");

  // A tampered request no longer verifies.
  const bad = { ...csr, tbs: csr.tbs.slice() };
  bad.tbs[bad.tbs.length - 1] ^= 0x01;
  assert.equal(await verifySignature(bad, csr.publicKey), "invalid");
});

test("detects CSRs in bare base64 and DER uploads", () => {
  const der = parseText(EXAMPLE_CSR).csrs[0].der;
  assert.equal(parseText(bytesToBase64(der)).csrs.length, 1);
  const file = parseFileBytes(der);
  assert.equal(file.source, "der");
  assert.equal(file.csrs.length, 1);
  assert.match(derFileToPem(der)!, /^-----BEGIN CERTIFICATE REQUEST-----/);
  const certDer = parseText(EXAMPLE_SAML_BASE64).certs[0].der;
  assert.match(derFileToPem(certDer)!, /^-----BEGIN CERTIFICATE-----/);
});

test("refuses private keys in every form", () => {
  const pkcs8 = generateKeyPairSync("ec", {
    namedCurve: "P-256",
  }).privateKey.export({ type: "pkcs8", format: "der" });
  const pkcs1 = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  }).privateKey.export({ type: "pkcs1", format: "der" });
  const sec1 = generateKeyPairSync("ec", {
    namedCurve: "P-256",
  }).privateKey.export({ type: "sec1", format: "der" });

  for (const [name, buf] of [
    ["pkcs8", pkcs8],
    ["pkcs1", pkcs1],
    ["sec1", sec1],
  ] as const) {
    const der = new Uint8Array(buf);
    const forms = [
      parseText(toPem(der, "PRIVATE KEY")),
      parseText(bytesToBase64(der)),
      parseFileBytes(der),
    ];
    for (const r of forms) {
      assert.equal(r.certs.length + r.csrs.length, 0, name);
      assert.match(r.errors.join(" "), /private key/, name);
    }
    assert.equal(derFileToPem(der), null, name);
  }
  assert.match(
    parseText(
      "-----BEGIN RSA PRIVATE KEY-----\nMIIB\n-----END RSA PRIVATE KEY-----",
    ).errors[0],
    /private key/,
  );
});

test("reports unusable input clearly", () => {
  assert.match(parseText("hello world").errors[0], /doesn't look like/);
  assert.match(
    parseText("<xml>not a cert</xml>").errors[0],
    /Could not find a certificate/,
  );
  assert.match(
    parseText("-----BEGIN PUBLIC KEY-----\nMIIB\n-----END PUBLIC KEY-----")
      .errors[0],
    /not a certificate/,
  );
  assert.deepEqual(parseText("   "), { certs: [], csrs: [], errors: [] });
});

test("validity state and relative time", () => {
  const [leaf] = parseText(EXAMPLE_CHAIN).certs;
  const nb = leaf.notBefore.getTime();
  const na = leaf.notAfter.getTime();
  assert.equal(validityState(leaf, nb - 1000), "not-yet-valid");
  assert.equal(validityState(leaf, nb + 1000), "valid");
  assert.equal(validityState(leaf, na + 1000), "expired");
  assert.equal(relativeTime(new Date(0), 3 * 864e5), "3 days ago");
  assert.equal(relativeTime(new Date(2 * 36e5), 0), "in 2 hours");
});
