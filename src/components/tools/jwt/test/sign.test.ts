// Unit tests for the JWT Generator core (signing, keys, payload helpers) and
// the generator → decoder URL-fragment hand-off.
// Run with: node --test src/components/tools/jwt/test/
//
// Every token is verified independently with jose against the exported JWKS
// and the exported PEM public key — the same paths the JWT Decoder uses.

import { test } from "node:test";
import assert from "node:assert/strict";
import { compactVerify, createLocalJWKSet, importSPKI } from "jose";

import { buildHandoffHash, parseHandoffHash } from "../handoff.ts";
import {
  ALGORITHMS,
  algInfo,
  applyTimes,
  buildHeader,
  exportPems,
  generateTestKeyPair,
  importTestKey,
  jwksJson,
  minHmacBytes,
  parsePayload,
  presetPayload,
  randomHmacSecret,
  signJwt,
  type TestKeyPair,
} from "../sign.ts";

const NOW = 1_800_000_000;

function decodeSegment(seg: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(seg, "base64url").toString("utf8"));
}

test("lists every supported algorithm, including ES512", () => {
  assert.deepEqual(
    ALGORITHMS.map((a) => a.alg),
    [
      "HS256",
      "HS384",
      "HS512",
      "RS256",
      "RS384",
      "RS512",
      "PS256",
      "PS384",
      "PS512",
      "ES256",
      "ES384",
      "ES512",
      "EdDSA",
    ],
  );
  assert.equal(algInfo("ES512").family, "EC-P521");
});

for (const info of ALGORITHMS.filter((a) => a.family === "HMAC")) {
  test(`${info.alg}: signs with a random secret of the right size`, async () => {
    const secret = randomHmacSecret(info.alg);
    assert.ok(
      new TextEncoder().encode(secret).length >= minHmacBytes(info.alg),
    );
    const header = buildHeader({ alg: info.alg, typ: "JWT", kid: "" });
    assert.deepEqual(header, { alg: info.alg, typ: "JWT" });
    const token = await signJwt({
      header,
      payload: presetPayload("simple", NOW),
      secret,
    });
    await compactVerify(token, new TextEncoder().encode(secret));
    await assert.rejects(
      compactVerify(token, new TextEncoder().encode(`${secret}x`)),
    );
  });
}

const keyCache = new Map<string, TestKeyPair>();
async function keyFor(alg: string): Promise<TestKeyPair> {
  const fam = algInfo(alg).family as TestKeyPair["family"];
  if (!keyCache.has(fam)) keyCache.set(fam, await generateTestKeyPair(fam));
  return keyCache.get(fam)!;
}

for (const info of ALGORITHMS.filter((a) => a.family !== "HMAC")) {
  test(`${info.alg}: signs and verifies via JWKS and PEM`, async () => {
    const kp = await keyFor(info.alg);
    assert.equal(kp.family, info.family);
    assert.equal(kp.origin, "generated");
    assert.equal(kp.publicJwk.d, undefined, "public JWK has no private part");

    const header = buildHeader({
      alg: info.alg,
      typ: "JWT",
      kid: kp.thumbprint,
    });
    const token = await signJwt({
      header,
      payload: presetPayload("keycloak-access", NOW),
      keyPair: kp,
    });
    const [h] = token.split(".");
    assert.deepEqual(decodeSegment(h), {
      alg: info.alg,
      typ: "JWT",
      kid: kp.thumbprint,
    });

    const jwks = JSON.parse(jwksJson(kp, info.alg, kp.thumbprint));
    assert.equal(jwks.keys.length, 1);
    assert.equal(jwks.keys[0].alg, info.alg);
    assert.equal(jwks.keys[0].use, "sig");
    assert.equal(jwks.keys[0].kid, kp.thumbprint);
    assert.equal(jwks.keys[0].d, undefined, "JWKS never carries private keys");
    await compactVerify(token, createLocalJWKSet(jwks));

    const { publicPem, privatePem } = await exportPems(kp);
    assert.match(publicPem, /^-----BEGIN PUBLIC KEY-----/);
    assert.match(privatePem, /^-----BEGIN PRIVATE KEY-----/);
    await compactVerify(token, await importSPKI(publicPem, info.alg));
  });
}

test("rejects a key from the wrong family", async () => {
  const rsa = await keyFor("RS256");
  await assert.rejects(
    signJwt({
      header: buildHeader({ alg: "ES256", typ: "JWT", kid: "" }),
      payload: {},
      keyPair: rsa,
    }),
    /needs a EC-P256 key/,
  );
  await assert.rejects(
    signJwt({
      header: buildHeader({ alg: "HS256", typ: "JWT", kid: "" }),
      payload: {},
    }),
    /Enter a secret/,
  );
});

test("imports PKCS#8 PEM and private JWKs for every key family", async () => {
  for (const alg of ["RS256", "ES256", "ES384", "ES512", "EdDSA"]) {
    const kp = await keyFor(alg);
    const { privatePem } = await exportPems(kp);
    const fromPem = await importTestKey(privatePem);
    const fromJwk = await importTestKey(JSON.stringify(kp.privateJwk));
    for (const imported of [fromPem, fromJwk]) {
      assert.equal(imported.family, kp.family, alg);
      assert.equal(imported.thumbprint, kp.thumbprint, alg);
      assert.equal(imported.origin, "imported");
    }
  }
});

test("explains unsupported key imports", async () => {
  await assert.rejects(importTestKey(""), /Paste a private key/);
  await assert.rejects(importTestKey("{nope"), /not valid JSON/);
  const kp = await keyFor("ES256");
  await assert.rejects(
    importTestKey(JSON.stringify(kp.publicJwk)),
    /no private part/,
  );
  await assert.rejects(
    importTestKey(JSON.stringify({ keys: [kp.publicJwk] })),
    /That is a JWKS/,
  );
  await assert.rejects(
    importTestKey(
      "-----BEGIN RSA PRIVATE KEY-----\nMIIB\n-----END RSA PRIVATE KEY-----",
    ),
    /Convert it to PKCS#8/,
  );
  await assert.rejects(
    importTestKey("-----BEGIN PUBLIC KEY-----\nMIIB\n-----END PUBLIC KEY-----"),
    /PKCS#8 PEM private key/,
  );
});

test("presets carry Keycloak-shaped claims with relative times", () => {
  const at = presetPayload("keycloak-access", NOW, 600);
  assert.equal(at.iat, NOW);
  assert.equal(at.exp, NOW + 600);
  assert.equal(at.typ, "Bearer");
  assert.equal(at.azp, "my-app");
  assert.equal(at.iss, "https://auth.example.com/realms/example");
  assert.ok(typeof at.sid === "string");
  assert.equal(at.scope, "openid email profile");
  assert.ok(Array.isArray((at.realm_access as { roles: unknown }).roles));
  assert.ok("my-app" in (at.resource_access as Record<string, unknown>));

  const id = presetPayload("keycloak-id", NOW);
  assert.equal(id.typ, "ID");
  assert.equal(id.aud, "my-app");
  assert.ok("nonce" in id && "auth_time" in id);

  assert.deepEqual(Object.keys(presetPayload("simple", NOW)), [
    "sub",
    "name",
    "iat",
    "exp",
  ]);
});

test("time helpers set iat/exp/nbf", () => {
  const withNbf = applyTimes({ sub: "x" }, NOW, { expiresIn: 3600, nbf: true });
  assert.deepEqual(withNbf, { sub: "x", iat: NOW, exp: NOW + 3600, nbf: NOW });
  const noNbf = applyTimes(withNbf, NOW + 10, { expiresIn: 60 });
  assert.deepEqual(noNbf, { sub: "x", iat: NOW + 10, exp: NOW + 70 });
});

test("payload validation", () => {
  assert.deepEqual(parsePayload('{"a":1}'), { ok: true, value: { a: 1 } });
  assert.equal(parsePayload("").ok, false);
  assert.match((parsePayload("[1]") as { error: string }).error, /object/);
  assert.match(
    (parsePayload("{a:1}") as { error: string }).error,
    /Invalid JSON/,
  );
});

test("decoder hand-off round-trips the token and public JWKS", async () => {
  const kp = await keyFor("ES512");
  const token = await signJwt({
    header: buildHeader({ alg: "ES512", typ: "JWT", kid: kp.thumbprint }),
    payload: presetPayload("simple", NOW),
    keyPair: kp,
  });
  const jwks = JSON.parse(jwksJson(kp, "ES512", kp.thumbprint));
  const hash = buildHandoffHash(token, jwks);
  assert.ok(hash.startsWith(`#token=${token}&jwks=`));
  assert.ok(!hash.includes("?"), "nothing in a query string");

  const back = parseHandoffHash(hash)!;
  assert.equal(back.token, token);
  assert.deepEqual(JSON.parse(back.jwks!), jwks);
  await compactVerify(back.token, createLocalJWKSet(JSON.parse(back.jwks!)));

  assert.deepEqual(parseHandoffHash(`#token=${token}`), { token });
  assert.equal(parseHandoffHash(""), null);
  assert.equal(parseHandoffHash("#other=1"), null);
  // A jwks value that is not a JWKS is dropped rather than trusted.
  assert.deepEqual(parseHandoffHash(`#token=${token}&jwks=%7B%7D`), { token });
  assert.deepEqual(parseHandoffHash(`#token=${token}&jwks=%7Bbad`), { token });
});
