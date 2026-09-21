---
slug: jwks-explained
title: "JWKS explained: rotation, caching, validating tokens"
date: 2026-09-22
authors: [jpatzer]
tags: [keycloak, jwt, oidc, standards, keys]
description: What a JWKS is, what every field in a JWK means, how key rotation works, and the caching rules that keep it fast — tested against Keycloak 26.7.4 with real output.
keywords:
  - jwks
  - jwk
  - what is jwks
  - jwks url
  - jwk format
---

**A JWKS — JSON Web Key Set — is a JSON document containing a list of public keys, each encoded as a JWK (JSON Web Key). Its purpose is to let anyone verifying a signed token fetch the right public key over HTTP instead of having it configured by hand.** The token names the key it was signed with in its `kid` header; the verifier looks that `kid` up in the set.

That is the whole idea, and it buys one specific thing: the signer can change keys without anyone who verifies its tokens changing configuration. Everything else about JWKS — the field names, the caching, the rotation ordering — follows from that.

This post covers what is actually in a JWK, where the JWKS URL comes from, what Keycloak publishes and what it deliberately does not, and the two directions the traffic flows in. Every number and every error string below came from a real run.

:::info Tested against
Keycloak **26.7.4** in a container, plus Python 3.12 with `cryptography` 46 for the key
arithmetic. JWK field definitions are from [RFC 7517](https://datatracker.ietf.org/doc/html/rfc7517)
and [RFC 7518](https://datatracker.ietf.org/doc/html/rfc7518).
:::

<!-- truncate -->

## What a JWK actually contains

Here is one real entry, the RS256 signing key from a fresh realm, with the certificate blob shortened:

```json
{
  "kid": "xxymDM27bfLX9jXkfqjdHy3mAEBaFYLKrctNMDhwX_0",
  "kty": "RSA",
  "alg": "RS256",
  "use": "sig",
  "x5c": ["MIICoTCCAYkCBgGgwyYyCDANBgkqhkiG9w0BAQsFADAUMRIwEAYDVQQDDAlqd2tz…"],
  "x5t": "PkECWpk2EOHu7OnKZxf4pou7UKs",
  "x5t#S256": "MhqqkEgWgcLE7luBoJPO5MYdpUYe6oEGNtjXwbhi6mc",
  "n": "tUapUU-MLM2V0JtJsJuyt2vBphq7vWxndD-4FSqisb21Xr7Px9xv3wyI8t3ZWELCKuA2…",
  "e": "AQAB"
}
```

| Field | Meaning | Required? |
|---|---|---|
| `kty` | Key type — `RSA`, `EC`, `OKP` for Ed25519, `oct` for symmetric | Yes |
| `kid` | Key ID. An opaque string the token header points at | No, but you need it |
| `alg` | The algorithm this key is for — `RS256`, `ES256`, `EdDSA`, `RSA-OAEP` | No |
| `use` | `sig` for signature keys, `enc` for encryption keys | No |
| `n`, `e` | RSA modulus and public exponent, base64url big-endian | For `RSA` |
| `crv`, `x`, `y` | Curve and coordinates for `EC`; `crv` and `x` only for `OKP` | For `EC` / `OKP` |
| `x5c` | X.509 certificate chain, base64 (**not** base64url) DER | No |
| `x5t`, `x5t#S256` | SHA-1 and SHA-256 fingerprints of the first `x5c` certificate | No |

Two things about that list surprise people.

**The key material is `n` and `e`, not the certificate.** Those two integers *are* the public key; everything beginning `x5` is optional packaging. Reconstructing the key from them gives a 2048-bit modulus and exponent 65537, and the resulting PEM is byte-identical to the one Keycloak publishes at `GET /realms/<realm>`:

```
modulus bits: 2048
exponent:     65537
matches realm public_key:  True
x5c cert pubkey == n/e pubkey: True
```

**The certificate in `x5c` is self-signed and proves nothing.** On 26.7.4 it has subject and issuer both `CN=<realm>` and a ten-year validity, generated at the same moment as the key. Its `x5t#S256` does check out as the SHA-256 of that certificate, so the fields are internally consistent — but a verifier that tries to build a trust chain out of `x5c` is validating a certificate the token's own signer minted for itself. Use `n`/`e` and treat `x5c` as decoration. It is also two thirds of the payload: the RSA entry above is 1,476 bytes complete and 462 bytes with the `x5*` fields removed.

## Where the JWKS URL comes from

Do not hard-code it. Read it once from the discovery document, which is the only URL your code should contain:

```bash
curl -s http://localhost:8080/realms/jwks-demo/.well-known/openid-configuration \
  | jq '{issuer, jwks_uri}'
```

```json
{
  "issuer": "http://localhost:8080/realms/jwks-demo",
  "jwks_uri": "http://localhost:8080/realms/jwks-demo/protocol/openid-connect/certs"
}
```

Keycloak's JWKS lives at `/realms/<realm>/protocol/openid-connect/certs`, and its own documentation describes that path as the endpoint "used for the JSON Web Key Set (JWKS) containing the public keys used to verify any JSON Web Token". It is unauthenticated, and it is meant to be — public keys are public.

There is an older endpoint that looks like a shortcut and is a trap. `GET /realms/<realm>` returns this:

```json
{
  "realm": "jwks-demo",
  "public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtUapUU+MLM2V0JtJ…",
  "token-service": "…",
  "account-service": "…",
  "tokens-not-before": 0
}
```

One key, in PEM, with **no `kid`**. Plenty of older guides tell you to copy that string into your application config, and it works — right up to the first key rotation, at which point every token fails and nothing in your application has changed. That field can only ever name one key. The set exists precisely because one key is not enough.

## One set, several key types — and what is missing from it

A fresh realm has four keys. Ask the admin API:

```bash
docker exec kc /opt/keycloak/bin/kcadm.sh get keys -r fresh \
  --fields 'keys(algorithm,type,use,status)'
```

```json
{
  "keys" : [ {
    "status" : "ACTIVE", "type" : "OCT", "algorithm" : "AES",      "use" : "ENC"
  }, {
    "status" : "ACTIVE", "type" : "RSA", "algorithm" : "RS256",    "use" : "SIG"
  }, {
    "status" : "ACTIVE", "type" : "RSA", "algorithm" : "RSA-OAEP", "use" : "ENC"
  }, {
    "status" : "ACTIVE", "type" : "OCT", "algorithm" : "HS512",    "use" : "SIG"
  } ]
}
```

The JWKS publishes **two** of them. The HS512 and AES keys are symmetric — `type=OCT` — so publishing them would be publishing the private key. They sign and encrypt things only Keycloak needs to read: action tokens, cookies, client secrets at rest. A JWKS is a set of *public* keys, and a symmetric key has no public half, which is why an HS256-signed token can never be validated from a JWKS.

Add an EC and an Ed25519 provider and the published set grows to four entries, showing all three asymmetric encodings (`x5*` fields elided, values truncated):

```json
{"kid":"xxymDM27bfLX9jXk…","kty":"RSA","alg":"RS256",   "use":"sig","n":"tUapUU-MLM2V…","e":"AQAB"}
{"kid":"-NiudiE1_k8qgi9f…","kty":"RSA","alg":"RSA-OAEP","use":"enc","n":"zNs1NGTwegq4…","e":"AQAB"}
{"kid":"-hLF966ZR8V961cg…","kty":"EC", "alg":"ES256",   "use":"sig","crv":"P-256","x":"sMBWPgfjpdWG…","y":"BwzB5JUEdBvv…"}
{"kid":"7niZM5XmjCjhOb4f…","kty":"OKP","alg":"EdDSA",   "use":"sig","crv":"Ed25519","x":"Dz_Dcz_tkiD3…"}
```

| Entry | Full size | Without `x5*` |
|---|---|---|
| RSA / RS256 | 1,476 B | 462 B |
| RSA / RSA-OAEP | 1,479 B | 465 B |
| EC / ES256 | 217 B | 217 B |
| OKP / EdDSA | 168 B | 168 B |

Note that the EC and OKP entries carry no `x5c` or `x5t` at all — Keycloak generates a self-signed certificate for RSA providers and not for the others. **Code that reads `x5c` to get the key works on an RS256 realm and breaks the day someone adds an ES256 provider.**

So a set is not a key, and "the public key" is not a well-defined thing. Pick a key with all three of these, in this order:

1. `use` is `sig` — the `enc` entry is for JWE and has no business verifying a signature.
2. `alg` matches the algorithm you have decided to accept.
3. `kid` equals the token header's `kid`, compared as an exact string.

## `kid` is a string, not a fingerprint

`kid` is opaque by design, and this is worth internalising because it is the one place people write clever code that breaks. RFC 7638 defines a canonical JWK thumbprint, so the obvious assumption is that `kid` is that thumbprint. On Keycloak it is not:

```
RS256     kid=xxymDM27bfLX9jXk…  rfc7638-thumbprint=hJ2DnTYQSUZGDOgx…  match=False
RSA-OAEP  kid=-NiudiE1_k8qgi9f…  rfc7638-thumbprint=UwqGcDlxcaJ7-MAH…  match=False
ES256     kid=-hLF966ZR8V961cg…  rfc7638-thumbprint=9IvL617NMEz-7jAp…  match=False
EdDSA     kid=7niZM5XmjCjhOb4f…  rfc7638-thumbprint=aJXwjR806GJ8Nlzl…  match=False
```

What Keycloak actually uses is the base64url-encoded SHA-256 of the DER `SubjectPublicKeyInfo` — confirmed for all four keys above:

```
RS256    kid == b64url(sha256(DER SPKI)): True
RSA-OAEP kid == b64url(sha256(DER SPKI)): True
ES256    kid == b64url(sha256(DER SPKI)): True
EdDSA    kid == b64url(sha256(DER SPKI)): True
```

Both are stable, deterministic functions of the key, and neither is wrong — the spec does not require either. Keycloak's own docs say it plainly in the identity-provider settings: "there is no standard way for computing key ID from the key, external identity providers can use different algorithms from what Keycloak uses." **Never compute a `kid` and never parse one. Match the string you were given.**

## Rotation is additive, which is why the set is a set

A signer rotates by *adding* a key, not replacing one. Both keys sit in the JWKS, the new one signs new tokens, the old one keeps verifying tokens already in flight, and the old entry is withdrawn only after the last token it signed has expired. Nothing downstream is reconfigured at any point. That is the entire payoff of publishing a set rather than a key.

The ordering matters and it is easy to get wrong in a way that produces a brief outage; [validating Keycloak tokens in any backend](/tutorials/securing-applications/validating-tokens/) has the tested sequence, the difference between a *passive* and a *disabled* key provider, and what each does to tokens already issued. Keycloak's own advice is to [rotate keys](https://www.keycloak.org/docs/latest/server_admin/index.html#rotating-keys) every three to six months and delete the old key one to two months later.

What surprises people is that **the highest-priority key is not the only key that signs.** Which key signs a given token depends on the algorithm requested for that client, so one realm can be issuing tokens under three different `kid`s at once. Setting a client's token signature algorithm and asking for a token three times:

```
default header:
{"alg":"RS256","typ" : "JWT","kid" : "xxymDM27bfLX9jXkfqjdHy3mAEBaFYLKrctNMDhwX_0"}

with access.token.signed.response.alg=ES256:
{"alg":"ES256","typ" : "JWT","kid" : "-hLF966ZR8V961cg_3fyEG2QKKlOtttg0852nxOBd3c"}

with access.token.signed.response.alg=EdDSA:
{"alg":"EdDSA","typ" : "JWT","kid" : "7niZM5XmjCjhOb4fJrnFrxwjKPI-IQQpLOxQhIFFyyA"}
```

All three tokens are valid, from the same realm, at the same moment. A verifier that pins `RS256` — which it absolutely should, rather than trusting the token's own `alg` header — will reject the other two. That is correct behaviour, and it means **the algorithm is a contract between the client configuration and the verifier**, not something either side gets to change alone. Pin it on both sides and write it down.

## Caching: the rules, and the one that bites

Fetching a JWKS per request turns every token check into an HTTP round trip to your identity provider. On a local container the certs endpoint answers in a median of 3.8 ms (p95 4.5 ms) over 50 requests — small, and still catastrophic as a per-request cost, because it puts your API's entire traffic on Keycloak's critical path and takes your API down whenever Keycloak blinks.

The rules, in order of how often they are broken:

1. **Cache in process, in your JWT library.** Keycloak sends `Cache-Control: no-cache` with no `ETag` and no `max-age`, so every well-behaved HTTP cache, CDN and proxy in front of that endpoint will correctly refetch every single time. HTTP caching will not do this for you.
2. **Refetch when you see an unknown `kid`.** This is what makes rotation work without a restart.
3. **Rate-limit that refetch.** An unknown `kid` is attacker-controlled: the key lookup happens *before* the signature check, so anyone can make your API call Keycloak by sending a token with a random `kid`. Some libraries have a cooldown and some do not.

Rule 3 is the one that bites, and library behaviour varies more than you would expect. The [token validation tutorial](/tutorials/securing-applications/validating-tokens/) measures four of them against 25 bogus `kid`s and shows how to add a cooldown to the ones that need it.

## The other direction: when Keycloak reads *your* JWKS

A JWKS is not only something you consume. Keycloak fetches other parties' key sets in at least three places:

| Where | Why | Configured as |
|---|---|---|
| Signed JWT client authentication (`private_key_jwt`) | Verify a client assertion signed by the client's private key | Client → Keys tab → **Use JWKS URL** |
| An [external identity provider](/docs/keycloak/idp/) | Verify signatures on the external ID token | IdP → **Use JWKS URL** |
| JWE-encrypted ID tokens or UserInfo | Get the client's *encryption* public key | Client → Keys tab → **JWKS URL** |

The first is worth setting up rather than uploading a certificate, because it is the only option where the client can rotate keys on its own schedule. Keycloak's documentation is explicit about the mechanism: it "downloads new keys when it sees the token signed by an unknown kid (Key ID)". What it does not say is how often it will do that, so we measured it — a client authenticating with `private_key_jwt` against a JWKS we served ourselves:

| Scenario | Fetches of our JWKS |
|---|---|
| 20 assertions, same known `kid` | **0** — cached, no traffic at all |
| New key published, first assertion with the new `kid` | **1**, immediately, and the assertion succeeded |
| 25 assertions with random unknown `kid`s in 0.2 s | **1** |
| One more, 12 s later | **1** more |

So Keycloak both refetches on an unknown `kid` *and* rate-limits itself to roughly one fetch every ten seconds — the behaviour the library table above says several JWT libraries lack. Rotating a client's signing key needed no Keycloak-side change and cost no downtime: publish the new key, sign with it, done.

One caveat, from the same run. We published the new key and removed the old one in the same write, and an assertion signed by the old key then failed instantly:

```
400 invalid_client: Unable to load public key
```

Which is the rotation rule again, seen from the other end: **publish both keys for an overlap window.** Keycloak has no way to verify a signature from a key you have stopped serving.

### The JWKS URL is an outbound request from your server

Worth saying out loud, because it is easy to configure without thinking about it: **a JWKS URL is a URL your identity provider will fetch.** Keycloak's own documentation names this as a server-side request forgery risk — a malicious or compromised admin, or an open Dynamic Client Registration endpoint, can point a client's JWKS URI at internal infrastructure and use Keycloak to probe it. Our test above pointed a client's JWKS URL at a private address on the container host and Keycloak fetched it without complaint, which is exactly the shape of the problem.

The mitigation shipped in Keycloak is a client policy: the [Secure Client URIs Pattern executor](https://www.keycloak.org/docs/latest/server_admin/index.html#secure-client-uris-pattern-executor) validates client URI fields against an allowlist of regular expressions and rejects a client create or update that does not match. If clients in your realm use JWKS URLs at all, allowlist the specific hosts, and require `https`.

## What JWKS does not give you

Being clear about the boundary saves a lot of wasted design:

- **No revocation.** A JWKS tells you a token's signature is authentic. It says nothing about whether the session behind it still exists — a locally validated token stays valid until `exp` even after logout. If you need immediate revocation, you need introspection, and the trade is real.
- **Nothing for symmetric signing.** An HS256-signed token is verified with a shared secret. There is no public key to publish, and the JWKS is silent about it.
- **No help with opaque tokens.** If the token is not a JWT, there is nothing to verify locally.
- **Not a trust anchor.** The `x5c` chain is self-signed. Trust comes from fetching the JWKS over TLS from a host you configured, which is why the `issuer` check against a *configured* value matters as much as the signature check.
- **No protection against your own mistakes.** A correct signature on a token issued for a different audience, or by a different realm, is still a correct signature. `iss`, `aud` and `exp` are your job.

## Where to go next

If you are implementing this, the order that saves time is: read the token you are actually getting, then write the validator, then set up rotation.

- [Get a Keycloak token and read every claim](/tutorials/getting-started/your-first-token/) — what is in the thing you are about to validate.
- [Validating Keycloak tokens in any backend](/tutorials/securing-applications/validating-tokens/) — the seven checks in order, in Python, Node, Go and Java, with the JWKS caching and rotation sequence tested.
- [JSON Web Tokens](/tutorials/jwts/) for the concepts underneath, and our [JWT decoder](/tools/jwt-decoder/) to look at a real one right now — it runs in your browser and nothing is uploaded.
- [Keycloak `invalid_grant`](/blog/keycloak-invalid-grant/) for the errors that look like signature problems and are not.

Rotating signing keys, publishing a JWKS that four different runtimes can read, and keeping the overlap window correct is the kind of operational detail that is fine until the week it is not. If you would rather not own it, [managed Keycloak](/hosting/dedicated-clusters/) is what we do — and our [securing applications docs](/docs/securing-applications/) start from the same endpoints described here.
