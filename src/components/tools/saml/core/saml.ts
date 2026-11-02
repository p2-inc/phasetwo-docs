/**
 * Extract a structured summary from a parsed SAML 2.0 message.
 */

import { listSignatures, type SignatureInfo } from "./dsig.ts";
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

export type SamlMessageType =
  | "AuthnRequest"
  | "Response"
  | "LogoutRequest"
  | "LogoutResponse"
  | "ArtifactResolve"
  | "ArtifactResponse"
  | "AttributeQuery"
  | "Assertion"
  | "EntityDescriptor"
  | "EntitiesDescriptor"
  | "Unknown";

export type NameIdInfo = {
  value: string;
  format?: string;
  nameQualifier?: string;
  spNameQualifier?: string;
};

export type StatusInfo = {
  code?: string;
  /** Second-level status code, if any. */
  subCode?: string;
  message?: string;
};

export type SubjectConfirmationInfo = {
  method?: string;
  recipient?: string;
  notBefore?: string;
  notOnOrAfter?: string;
  inResponseTo?: string;
  address?: string;
};

export type AttributeInfo = {
  name: string;
  friendlyName?: string;
  nameFormat?: string;
  values: string[];
};

export type AuthnStatementInfo = {
  authnInstant?: string;
  sessionIndex?: string;
  sessionNotOnOrAfter?: string;
  classRef?: string;
  declRef?: string;
  authenticatingAuthorities: string[];
};

export type AssertionSummary = {
  id?: string;
  version?: string;
  issueInstant?: string;
  issuer?: string;
  signed: boolean;
  nameId?: NameIdInfo;
  /** True when the subject identifier is an EncryptedID. */
  encryptedNameId: boolean;
  subjectConfirmations: SubjectConfirmationInfo[];
  conditions?: {
    notBefore?: string;
    notOnOrAfter?: string;
    audiences: string[];
    oneTimeUse: boolean;
  };
  authnStatements: AuthnStatementInfo[];
  attributes: AttributeInfo[];
  encryptedAttributeCount: number;
};

export type EndpointInfo = {
  binding?: string;
  location?: string;
  index?: string;
};

export type MetadataSummary = {
  entityId?: string;
  idp?: {
    ssoServices: EndpointInfo[];
    sloServices: EndpointInfo[];
    nameIdFormats: string[];
    wantAuthnRequestsSigned?: string;
    signingCertificates: number;
  };
  sp?: {
    acsServices: EndpointInfo[];
    sloServices: EndpointInfo[];
    nameIdFormats: string[];
    authnRequestsSigned?: string;
    wantAssertionsSigned?: string;
    signingCertificates: number;
  };
};

export type SamlSummary = {
  messageType: SamlMessageType;
  /** Root element name as written. */
  rootName: string;
  /** True when the root is in a SAML 2.0 namespace. */
  isSaml2: boolean;
  id?: string;
  version?: string;
  issueInstant?: string;
  destination?: string;
  inResponseTo?: string;
  consent?: string;
  issuer?: string;
  // AuthnRequest
  assertionConsumerServiceURL?: string;
  assertionConsumerServiceIndex?: string;
  attributeConsumingServiceIndex?: string;
  protocolBinding?: string;
  providerName?: string;
  forceAuthn?: string;
  isPassive?: string;
  nameIdPolicy?: {
    format?: string;
    allowCreate?: string;
    spNameQualifier?: string;
  };
  requestedAuthnContext?: { comparison?: string; classRefs: string[] };
  // Responses
  status?: StatusInfo;
  // LogoutRequest
  nameId?: NameIdInfo;
  encryptedNameId?: boolean;
  sessionIndexes: string[];
  reason?: string;
  notOnOrAfter?: string;
  // Assertions
  assertions: AssertionSummary[];
  encryptedAssertionCount: number;
  // Signatures
  signatures: SignatureInfo[];
  /** The protocol message itself carries an enveloped signature. */
  messageSigned: boolean;
  /** At least one (plaintext) assertion carries an enveloped signature. */
  assertionSigned: boolean;
  metadata?: MetadataSummary;
  /** Structural problems worth flagging (not validation errors). */
  warnings: string[];
};

const P = NS.PROTOCOL;
const A = NS.ASSERTION;
const MD = NS.METADATA;

const KNOWN_TYPES = new Set<SamlMessageType>([
  "AuthnRequest",
  "Response",
  "LogoutRequest",
  "LogoutResponse",
  "ArtifactResolve",
  "ArtifactResponse",
  "AttributeQuery",
]);

function trimmed(el: XmlElement | undefined): string | undefined {
  if (!el) return undefined;
  return textContent(el).trim();
}

function nameIdOf(el: XmlElement | undefined): NameIdInfo | undefined {
  if (!el) return undefined;
  return {
    value: textContent(el).trim(),
    format: attr(el, "Format"),
    nameQualifier: attr(el, "NameQualifier"),
    spNameQualifier: attr(el, "SPNameQualifier"),
  };
}

function statusOf(el: XmlElement): StatusInfo | undefined {
  const status = firstChild(el, P, "Status");
  if (!status) return undefined;
  const top = firstChild(status, P, "StatusCode");
  const sub = firstChild(top, P, "StatusCode");
  return {
    code: attr(top, "Value"),
    subCode: attr(sub, "Value"),
    message: trimmed(firstChild(status, P, "StatusMessage")),
  };
}

function isSignedBy(el: XmlElement): boolean {
  return childElements(el, NS.DSIG, "Signature").length > 0;
}

function summarizeAssertion(a: XmlElement): AssertionSummary {
  const subject = firstChild(a, A, "Subject");
  const cond = firstChild(a, A, "Conditions");
  return {
    id: attr(a, "ID"),
    version: attr(a, "Version"),
    issueInstant: attr(a, "IssueInstant"),
    issuer: trimmed(firstChild(a, A, "Issuer")),
    signed: isSignedBy(a),
    nameId: nameIdOf(firstChild(subject, A, "NameID")),
    encryptedNameId: !!firstChild(subject, A, "EncryptedID"),
    subjectConfirmations: subject
      ? childElements(subject, A, "SubjectConfirmation").map((sc) => {
          const d = firstChild(sc, A, "SubjectConfirmationData");
          return {
            method: attr(sc, "Method"),
            recipient: attr(d, "Recipient"),
            notBefore: attr(d, "NotBefore"),
            notOnOrAfter: attr(d, "NotOnOrAfter"),
            inResponseTo: attr(d, "InResponseTo"),
            address: attr(d, "Address"),
          };
        })
      : [],
    conditions: cond
      ? {
          notBefore: attr(cond, "NotBefore"),
          notOnOrAfter: attr(cond, "NotOnOrAfter"),
          audiences: childElements(cond, A, "AudienceRestriction").flatMap(
            (ar) =>
              childElements(ar, A, "Audience").map((x) =>
                textContent(x).trim(),
              ),
          ),
          oneTimeUse: !!firstChild(cond, A, "OneTimeUse"),
        }
      : undefined,
    authnStatements: childElements(a, A, "AuthnStatement").map((s) => {
      const ctx = firstChild(s, A, "AuthnContext");
      return {
        authnInstant: attr(s, "AuthnInstant"),
        sessionIndex: attr(s, "SessionIndex"),
        sessionNotOnOrAfter: attr(s, "SessionNotOnOrAfter"),
        classRef: trimmed(firstChild(ctx, A, "AuthnContextClassRef")),
        declRef: trimmed(firstChild(ctx, A, "AuthnContextDeclRef")),
        authenticatingAuthorities: ctx
          ? childElements(ctx, A, "AuthenticatingAuthority").map((x) =>
              textContent(x).trim(),
            )
          : [],
      };
    }),
    attributes: childElements(a, A, "AttributeStatement").flatMap((st) =>
      childElements(st, A, "Attribute").map((at) => ({
        name: attr(at, "Name") ?? "",
        friendlyName: attr(at, "FriendlyName"),
        nameFormat: attr(at, "NameFormat"),
        values: childElements(at, A, "AttributeValue").map((v) =>
          attr(v, "nil", NS.XSI) === "true" ? "(nil)" : textContent(v).trim(),
        ),
      })),
    ),
    encryptedAttributeCount: childElements(a, A, "AttributeStatement").reduce(
      (n, st) => n + childElements(st, A, "EncryptedAttribute").length,
      0,
    ),
  };
}

function endpoints(el: XmlElement, localName: string): EndpointInfo[] {
  return childElements(el, MD, localName).map((e) => ({
    binding: attr(e, "Binding"),
    location: attr(e, "Location"),
    index: attr(e, "index"),
  }));
}

function signingCertCount(el: XmlElement): number {
  return childElements(el, MD, "KeyDescriptor").filter((kd) => {
    const use = attr(kd, "use");
    return !use || use === "signing";
  }).length;
}

function summarizeMetadata(ed: XmlElement): MetadataSummary {
  const idp = firstChild(ed, MD, "IDPSSODescriptor");
  const sp = firstChild(ed, MD, "SPSSODescriptor");
  const formats = (d: XmlElement) =>
    childElements(d, MD, "NameIDFormat").map((f) => textContent(f).trim());
  return {
    entityId: attr(ed, "entityID"),
    idp: idp
      ? {
          ssoServices: endpoints(idp, "SingleSignOnService"),
          sloServices: endpoints(idp, "SingleLogoutService"),
          nameIdFormats: formats(idp),
          wantAuthnRequestsSigned: attr(idp, "WantAuthnRequestsSigned"),
          signingCertificates: signingCertCount(idp),
        }
      : undefined,
    sp: sp
      ? {
          acsServices: endpoints(sp, "AssertionConsumerService"),
          sloServices: endpoints(sp, "SingleLogoutService"),
          nameIdFormats: formats(sp),
          authnRequestsSigned: attr(sp, "AuthnRequestsSigned"),
          wantAssertionsSigned: attr(sp, "WantAssertionsSigned"),
          signingCertificates: signingCertCount(sp),
        }
      : undefined,
  };
}

/** Build a structured summary of a parsed SAML message. */
export function summarizeSaml(doc: XmlDocument): SamlSummary {
  const root = doc.root;
  const warnings: string[] = [];
  const isProtocol = root.namespaceURI === P;
  let messageType: SamlMessageType = "Unknown";
  if (isProtocol && KNOWN_TYPES.has(root.localName as SamlMessageType))
    messageType = root.localName as SamlMessageType;
  else if (root.namespaceURI === A && root.localName === "Assertion")
    messageType = "Assertion";
  else if (
    root.namespaceURI === MD &&
    (root.localName === "EntityDescriptor" ||
      root.localName === "EntitiesDescriptor")
  )
    messageType = root.localName as SamlMessageType;
  const isSaml2 =
    root.namespaceURI === P ||
    root.namespaceURI === A ||
    root.namespaceURI === MD;
  if (!isSaml2) {
    if (/urn:oasis:names:tc:SAML:1\.[01]/.test(root.namespaceURI))
      warnings.push(
        "This is a SAML 1.x message; only SAML 2.0 is summarized in detail.",
      );
    else
      warnings.push(
        `<${root.name}> is not a SAML 2.0 element (namespace "${root.namespaceURI || "none"}").`,
      );
  }

  const signatures = isSaml2 ? listSignatures(doc) : [];
  const summary: SamlSummary = {
    messageType,
    rootName: root.name,
    isSaml2,
    id: attr(root, "ID"),
    version: attr(root, "Version"),
    issueInstant: attr(root, "IssueInstant"),
    destination: attr(root, "Destination"),
    inResponseTo: attr(root, "InResponseTo"),
    consent: attr(root, "Consent"),
    issuer: trimmed(firstChild(root, A, "Issuer")),
    sessionIndexes: [],
    assertions: [],
    encryptedAssertionCount: 0,
    signatures,
    messageSigned: false,
    assertionSigned: false,
    warnings,
  };

  if (messageType === "Assertion") {
    summary.assertions = [summarizeAssertion(root)];
    summary.assertionSigned = summary.assertions[0].signed;
    return summary;
  }
  if (messageType === "EntityDescriptor") {
    summary.metadata = summarizeMetadata(root);
    summary.messageSigned = isSignedBy(root);
    return summary;
  }
  if (!isProtocol) return summary;

  summary.messageSigned = isSignedBy(root);
  if (summary.version && summary.version !== "2.0")
    warnings.push(
      `Version is "${summary.version}"; SAML 2.0 messages must use Version="2.0".`,
    );

  if (messageType === "AuthnRequest") {
    summary.assertionConsumerServiceURL = attr(
      root,
      "AssertionConsumerServiceURL",
    );
    summary.assertionConsumerServiceIndex = attr(
      root,
      "AssertionConsumerServiceIndex",
    );
    summary.attributeConsumingServiceIndex = attr(
      root,
      "AttributeConsumingServiceIndex",
    );
    summary.protocolBinding = attr(root, "ProtocolBinding");
    summary.providerName = attr(root, "ProviderName");
    summary.forceAuthn = attr(root, "ForceAuthn");
    summary.isPassive = attr(root, "IsPassive");
    const pol = firstChild(root, P, "NameIDPolicy");
    if (pol)
      summary.nameIdPolicy = {
        format: attr(pol, "Format"),
        allowCreate: attr(pol, "AllowCreate"),
        spNameQualifier: attr(pol, "SPNameQualifier"),
      };
    const rac = firstChild(root, P, "RequestedAuthnContext");
    if (rac)
      summary.requestedAuthnContext = {
        comparison: attr(rac, "Comparison"),
        classRefs: childElements(rac, A, "AuthnContextClassRef").map((x) =>
          textContent(x).trim(),
        ),
      };
  }

  if (messageType === "LogoutRequest") {
    summary.nameId = nameIdOf(firstChild(root, A, "NameID"));
    summary.encryptedNameId = !!firstChild(root, A, "EncryptedID");
    summary.sessionIndexes = childElements(root, P, "SessionIndex").map((x) =>
      textContent(x).trim(),
    );
    summary.reason = attr(root, "Reason");
    summary.notOnOrAfter = attr(root, "NotOnOrAfter");
  }

  if (
    messageType === "Response" ||
    messageType === "LogoutResponse" ||
    messageType === "ArtifactResponse"
  ) {
    summary.status = statusOf(root);
  }

  if (messageType === "Response") {
    const direct = childElements(root, A, "Assertion");
    const all = descendants(root, A, "Assertion");
    summary.assertions = direct.map(summarizeAssertion);
    summary.encryptedAssertionCount = childElements(
      root,
      A,
      "EncryptedAssertion",
    ).length;
    summary.assertionSigned = summary.assertions.some((a) => a.signed);
    if (all.length > direct.length)
      warnings.push(
        "An Assertion is nested somewhere other than directly under the Response. This is a classic signature-wrapping pattern — treat the message as suspicious.",
      );
    if (direct.length + summary.encryptedAssertionCount > 1)
      warnings.push(
        "The Response carries more than one assertion. Most SPs expect exactly one and some reject the message.",
      );
    if (
      summary.status?.code?.endsWith(":Success") &&
      !direct.length &&
      !summary.encryptedAssertionCount
    )
      warnings.push(
        "Status is Success, but the Response contains no assertion.",
      );
  }

  const ids = new Map<string, number>();
  for (const el of [root, ...descendants(root)]) {
    const id = attr(el, "ID");
    if (id) ids.set(id, (ids.get(id) ?? 0) + 1);
  }
  for (const [id, n] of ids)
    if (n > 1)
      warnings.push(
        `The ID "${id}" appears ${n} times. IDs must be unique; duplicates are a signature-wrapping attack pattern.`,
      );

  return summary;
}
