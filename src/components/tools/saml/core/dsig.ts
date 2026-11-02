/**
 * XML-DSig inspection and verification for SAML messages, using WebCrypto.
 *
 * Scope is deliberately the SAML profile of XML-DSig: enveloped signatures
 * with a same-document reference (`URI="#id"` or `URI=""`), the
 * enveloped-signature transform, and C14N 1.0 / Exclusive C14N 1.0. Anything
 * outside that is reported as unsupported instead of being guessed at, so a
 * "valid" result is never a false positive.
 *
 * HTTP-Redirect binding signatures (SigAlg + Signature query parameters) are
 * verified by {@link verifyRedirectSignature}.
 */

import {
  c14nOptionsFor,
  canonicalize,
  C14N_ALGORITHMS,
  type C14nOptions,
} from "./c14n.ts";
import { base64ToBytes, type DecodedInput } from "./decode.ts";
import { NS } from "./explain.ts";
import {
  attr,
  childElements,
  descendants,
  firstChild,
  textContent,
  type XmlDocument,
  type XmlElement,
} from "./xml.ts";
import type { TrustedKey } from "./x509.ts";

const ENVELOPED = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";

type HashName = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const DIGEST_ALGORITHMS: Record<string, HashName> = {
  "http://www.w3.org/2000/09/xmldsig#sha1": "SHA-1",
  "http://www.w3.org/2001/04/xmlenc#sha256": "SHA-256",
  "http://www.w3.org/2001/04/xmldsig-more#sha384": "SHA-384",
  "http://www.w3.org/2001/04/xmlenc#sha512": "SHA-512",
};

export const SIGNATURE_ALGORITHMS: Record<
  string,
  { kind: "RSA" | "EC"; hash: HashName }
> = {
  "http://www.w3.org/2000/09/xmldsig#rsa-sha1": { kind: "RSA", hash: "SHA-1" },
  "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256": {
    kind: "RSA",
    hash: "SHA-256",
  },
  "http://www.w3.org/2001/04/xmldsig-more#rsa-sha384": {
    kind: "RSA",
    hash: "SHA-384",
  },
  "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512": {
    kind: "RSA",
    hash: "SHA-512",
  },
  "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha1": {
    kind: "EC",
    hash: "SHA-1",
  },
  "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256": {
    kind: "EC",
    hash: "SHA-256",
  },
  "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha384": {
    kind: "EC",
    hash: "SHA-384",
  },
  "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha512": {
    kind: "EC",
    hash: "SHA-512",
  },
};

/** Short name for an algorithm URI, e.g. "rsa-sha256" or "exc-c14n". */
export function algorithmName(uri: string | undefined): string {
  if (!uri) return "(none)";
  if (uri === C14N_ALGORITHMS.EXCLUSIVE) return "exc-c14n";
  if (uri === C14N_ALGORITHMS.EXCLUSIVE_WITH_COMMENTS)
    return "exc-c14n#WithComments";
  if (uri === C14N_ALGORITHMS.INCLUSIVE) return "c14n";
  if (uri === C14N_ALGORITHMS.INCLUSIVE_WITH_COMMENTS)
    return "c14n#WithComments";
  if (uri === ENVELOPED) return "enveloped-signature";
  const hash = uri.lastIndexOf("#");
  return hash === -1 ? uri : uri.slice(hash + 1);
}

export type ReferenceInfo = {
  uri: string;
  transforms: { algorithm: string; inclusivePrefixes?: string[] }[];
  digestAlgorithm: string;
  digestValue: string;
};

export type SignatureInfo = {
  /** The `ds:Signature` element. */
  element: XmlElement;
  /** Local name of the element the signature is enveloped in (e.g. "Response", "Assertion"). */
  signedElement: string;
  /** The ID of that element, when it has one. */
  signedElementId?: string;
  canonicalizationMethod: string;
  canonicalizationPrefixes?: string[];
  signatureMethod: string;
  references: ReferenceInfo[];
  /** Base64 certificates embedded in `KeyInfo` (informational only — never trusted). */
  embeddedCertificates: string[];
};

function idOf(el: XmlElement): string | undefined {
  return (
    attr(el, "ID") ??
    attr(el, "Id") ??
    attr(el, "AssertionID") ??
    attr(el, "id")
  );
}

function prefixList(el: XmlElement | undefined): string[] | undefined {
  const inc = el && firstChild(el, NS.EXC_C14N, "InclusiveNamespaces");
  const list = attr(inc, "PrefixList");
  return list === undefined ? undefined : list.split(/\s+/).filter(Boolean);
}

/** Every XML-DSig signature in the document, with what it claims to cover. */
export function listSignatures(doc: XmlDocument): SignatureInfo[] {
  const sigs = [
    ...(doc.root.namespaceURI === NS.DSIG && doc.root.localName === "Signature"
      ? [doc.root]
      : []),
    ...descendants(doc.root, NS.DSIG, "Signature"),
  ];
  return sigs.map((sig) => {
    const si = firstChild(sig, NS.DSIG, "SignedInfo");
    const cm = firstChild(si, NS.DSIG, "CanonicalizationMethod");
    const parent = sig.parent;
    return {
      element: sig,
      signedElement: parent?.localName ?? "(document)",
      signedElementId: parent ? idOf(parent) : undefined,
      canonicalizationMethod: attr(cm, "Algorithm") ?? "",
      canonicalizationPrefixes: prefixList(cm),
      signatureMethod:
        attr(firstChild(si, NS.DSIG, "SignatureMethod"), "Algorithm") ?? "",
      references: si
        ? childElements(si, NS.DSIG, "Reference").map((ref) => ({
            uri: attr(ref, "URI") ?? "",
            transforms: childElements(
              firstChild(ref, NS.DSIG, "Transforms") ?? ref,
              NS.DSIG,
              "Transform",
            ).map((t) => ({
              algorithm: attr(t, "Algorithm") ?? "",
              inclusivePrefixes: prefixList(t),
            })),
            digestAlgorithm:
              attr(firstChild(ref, NS.DSIG, "DigestMethod"), "Algorithm") ?? "",
            digestValue: textContent(
              firstChild(ref, NS.DSIG, "DigestValue"),
            ).replace(/\s+/g, ""),
          }))
        : [],
      embeddedCertificates: descendants(sig, NS.DSIG, "X509Certificate").map(
        (c) => textContent(c).replace(/\s+/g, ""),
      ),
    };
  });
}

export type VerifyStatus = "valid" | "invalid" | "error";

export type SignatureCheck = {
  status: VerifyStatus;
  /** Plain-English result. */
  message: string;
  /** What the signature covers, e.g. "Response" or "Assertion". */
  signedElement: string;
  signedElementId?: string;
  signatureAlgorithm?: string;
  /** Per-reference digest results. */
  digests: { uri: string; matches: boolean; algorithm: string }[];
  /** Label of the trusted key that verified the signature. */
  verifiedWith?: string;
  /** Extra notes (weak algorithms, embedded certificate mismatches, …). */
  notes: string[];
};

const enc = new TextEncoder();

async function digestB64(alg: HashName, data: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest(alg, enc.encode(data)));
  let bin = "";
  for (const b of d) bin += String.fromCharCode(b);
  return btoa(bin);
}

async function importKey(
  key: TrustedKey,
  alg: { kind: "RSA" | "EC"; hash: HashName },
): Promise<CryptoKey | undefined> {
  if (key.keyType !== alg.kind) return undefined;
  const spki = key.spki as unknown as BufferSource;
  if (alg.kind === "RSA")
    return crypto.subtle.importKey(
      "spki",
      spki,
      { name: "RSASSA-PKCS1-v1_5", hash: alg.hash },
      false,
      ["verify"],
    );
  return crypto.subtle.importKey(
    "spki",
    spki,
    { name: "ECDSA", namedCurve: key.namedCurve! },
    false,
    ["verify"],
  );
}

async function verifyWithKeys(
  keys: TrustedKey[],
  alg: { kind: "RSA" | "EC"; hash: HashName },
  signature: Uint8Array,
  data: Uint8Array,
): Promise<{ key?: TrustedKey; usable: number }> {
  let usable = 0;
  for (const k of keys) {
    let ck: CryptoKey | undefined;
    try {
      ck = await importKey(k, alg);
    } catch {
      continue;
    }
    if (!ck) continue;
    usable++;
    const params =
      alg.kind === "RSA"
        ? { name: "RSASSA-PKCS1-v1_5" }
        : { name: "ECDSA", hash: alg.hash };
    if (
      await crypto.subtle.verify(
        params,
        ck,
        signature as unknown as BufferSource,
        data as unknown as BufferSource,
      )
    )
      return { key: k, usable };
  }
  return { usable };
}

function findById(doc: XmlDocument, id: string): XmlElement[] {
  const all = [doc.root, ...descendants(doc.root)];
  return all.filter((e) => idOf(e) === id);
}

function weakNotes(sigAlg?: string, digestAlg?: string): string[] {
  const notes: string[] = [];
  if (sigAlg && /sha1$/.test(sigAlg))
    notes.push(
      "Uses SHA-1 for the signature, which is deprecated. Prefer RSA-SHA256.",
    );
  if (digestAlg && /sha1$/.test(digestAlg))
    notes.push(
      "Uses SHA-1 for the digest, which is deprecated. Prefer SHA-256.",
    );
  return notes;
}

function embeddedCertNotes(info: SignatureInfo, keys: TrustedKey[]): string[] {
  if (!info.embeddedCertificates.length) return [];
  const trusted = keys
    .map((k) => k.certificate && btoaDer(k.certificate.der))
    .filter(Boolean);
  if (!trusted.length) return [];
  const match = info.embeddedCertificates.some((c) => trusted.includes(c));
  return match
    ? [
        "The certificate embedded in the message's KeyInfo matches a certificate you supplied.",
      ]
    : [
        "The certificate embedded in the message's KeyInfo is not one you supplied — the IdP may have rotated its signing key, or you are using the wrong certificate.",
      ];
}

function btoaDer(der: Uint8Array): string {
  let bin = "";
  for (const b of der) bin += String.fromCharCode(b);
  return btoa(bin);
}

/** Verify one enveloped XML signature against the supplied trusted keys. */
export async function verifySignature(
  doc: XmlDocument,
  info: SignatureInfo,
  keys: TrustedKey[],
): Promise<SignatureCheck> {
  const base: SignatureCheck = {
    status: "error",
    message: "",
    signedElement: info.signedElement,
    signedElementId: info.signedElementId,
    signatureAlgorithm: info.signatureMethod,
    digests: [],
    notes: [],
  };
  const err = (message: string): SignatureCheck => ({
    ...base,
    status: "error",
    message,
  });
  const sig = info.element;
  const signedInfo = firstChild(sig, NS.DSIG, "SignedInfo");
  if (!signedInfo) return err("The signature has no SignedInfo element.");
  const c14n = c14nOptionsFor(info.canonicalizationMethod);
  if (!c14n)
    return err(
      `Unsupported canonicalization method: ${info.canonicalizationMethod || "(missing)"}.`,
    );
  const sigAlg = SIGNATURE_ALGORITHMS[info.signatureMethod];
  if (!sigAlg)
    return err(
      `Unsupported signature method: ${info.signatureMethod || "(missing)"}.`,
    );
  if (!info.references.length) return err("The signature has no Reference.");
  if (!keys.length) return err("No trusted keys to verify with.");

  const notes = [
    ...weakNotes(info.signatureMethod, info.references[0]?.digestAlgorithm),
    ...embeddedCertNotes(info, keys),
  ];

  for (const ref of info.references) {
    const hash = DIGEST_ALGORITHMS[ref.digestAlgorithm];
    if (!hash)
      return err(
        `Unsupported digest method: ${ref.digestAlgorithm || "(missing)"}.`,
      );
    let target: XmlElement;
    if (ref.uri === "") target = doc.root;
    else if (ref.uri.startsWith("#") && !ref.uri.startsWith("#xpointer(")) {
      const matches = findById(doc, ref.uri.slice(1));
      if (matches.length === 0)
        return {
          ...base,
          status: "invalid",
          message: `The signature references ${ref.uri}, but no element has that ID.`,
          notes,
        };
      if (matches.length > 1)
        return {
          ...base,
          status: "invalid",
          message: `The ID ${ref.uri} appears on ${matches.length} elements. Duplicate IDs are a signature-wrapping attack pattern; the signature is not trustworthy.`,
          notes,
        };
      target = matches[0];
    } else
      return err(
        `Unsupported reference URI: ${ref.uri}. SAML signatures reference the signed element by ID.`,
      );

    // SAML requires the signature to be enveloped in the element it signs.
    if (target !== sig.parent)
      return {
        ...base,
        status: "invalid",
        message: `The signature sits inside <${info.signedElement}> but references a different element (${ref.uri || "the whole document"}). SAML signatures must sign their parent element.`,
        notes,
      };

    let opts: C14nOptions = { exclusive: false, withComments: false };
    let enveloped = false;
    for (const t of ref.transforms) {
      if (t.algorithm === ENVELOPED) {
        enveloped = true;
        continue;
      }
      const o = c14nOptionsFor(t.algorithm);
      if (!o) return err(`Unsupported transform: ${t.algorithm}.`);
      // Same-document references (bare-name "#id" and "") never carry comments.
      opts = {
        ...o,
        withComments: false,
        inclusivePrefixes: t.inclusivePrefixes,
      };
    }
    if (!enveloped)
      notes.push(
        "The reference has no enveloped-signature transform, which is unusual for SAML.",
      );
    opts.exclude = enveloped ? sig : undefined;
    const actual = await digestB64(hash, canonicalize(target, opts));
    base.digests.push({
      uri: ref.uri,
      matches: actual === ref.digestValue,
      algorithm: ref.digestAlgorithm,
    });
  }

  if (base.digests.some((d) => !d.matches)) {
    return {
      ...base,
      status: "invalid",
      message: `Digest mismatch: the signed <${info.signedElement}> was changed after it was signed. Even whitespace or reformatting breaks a signature — decode the message exactly as it was received.`,
      notes,
    };
  }

  const canonicalSignedInfo = canonicalize(signedInfo, {
    ...c14n,
    inclusivePrefixes: info.canonicalizationPrefixes,
  });
  let sigBytes: Uint8Array;
  try {
    sigBytes = base64ToBytes(
      textContent(firstChild(sig, NS.DSIG, "SignatureValue")),
    );
  } catch {
    return err("SignatureValue is not valid base64.");
  }
  const { key, usable } = await verifyWithKeys(
    keys,
    sigAlg,
    sigBytes,
    enc.encode(canonicalSignedInfo),
  );
  if (!usable)
    return err(
      `None of the supplied keys can verify a ${algorithmName(info.signatureMethod)} signature (wrong key type).`,
    );
  if (key)
    return {
      ...base,
      status: "valid",
      message: `Signature on <${info.signedElement}> is valid and was made with ${key.label}${key.certificate ? ` (${key.certificate.subject})` : ""}.`,
      verifiedWith: key.label,
      notes,
    };
  return {
    ...base,
    status: "invalid",
    message: `The content digest matches, but the signature was not made by ${keys.length === 1 ? "the supplied key" : "any of the supplied keys"}. Check that you are using the IdP's current signing certificate.`,
    notes,
  };
}

/** Verify every XML signature in the document. */
export async function verifyXmlSignatures(
  doc: XmlDocument,
  keys: TrustedKey[],
): Promise<SignatureCheck[]> {
  const out: SignatureCheck[] = [];
  for (const info of listSignatures(doc)) {
    try {
      out.push(await verifySignature(doc, info, keys));
    } catch (e) {
      out.push({
        status: "error",
        message: `Could not verify: ${(e as Error).message}`,
        signedElement: info.signedElement,
        signedElementId: info.signedElementId,
        digests: [],
        notes: [],
      });
    }
  }
  return out;
}

/** Verify an HTTP-Redirect binding query-string signature. */
export async function verifyRedirectSignature(
  decoded: DecodedInput,
  keys: TrustedKey[],
): Promise<SignatureCheck> {
  const base: SignatureCheck = {
    status: "error",
    message: "",
    signedElement: "query string",
    signatureAlgorithm: decoded.sigAlg,
    digests: [],
    notes: [],
  };
  if (!decoded.signedQuery || !decoded.signature || !decoded.sigAlg)
    return {
      ...base,
      message: "The URL has no SigAlg and Signature parameters.",
    };
  const alg = SIGNATURE_ALGORITHMS[decoded.sigAlg];
  if (!alg)
    return { ...base, message: `Unsupported SigAlg: ${decoded.sigAlg}.` };
  if (!keys.length)
    return { ...base, message: "No trusted keys to verify with." };
  let sig: Uint8Array;
  try {
    sig = base64ToBytes(decoded.signature);
  } catch {
    return { ...base, message: "The Signature parameter is not valid base64." };
  }
  const notes = weakNotes(decoded.sigAlg);
  const { key, usable } = await verifyWithKeys(
    keys,
    alg,
    sig,
    enc.encode(decoded.signedQuery),
  );
  if (!usable)
    return {
      ...base,
      message: `None of the supplied keys can verify a ${algorithmName(decoded.sigAlg)} signature (wrong key type).`,
      notes,
    };
  if (key)
    return {
      ...base,
      status: "valid",
      message: `The query-string signature is valid and was made with ${key.label}${key.certificate ? ` (${key.certificate.subject})` : ""}.`,
      verifiedWith: key.label,
      notes,
    };
  return {
    ...base,
    status: "invalid",
    message:
      "The query-string signature does not verify. Either the key is wrong, or the URL was altered (parameters re-encoded or reordered) after signing — paste the URL exactly as it was sent.",
    notes,
  };
}
