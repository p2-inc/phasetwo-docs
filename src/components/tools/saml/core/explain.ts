/**
 * Plain-English explanations for the URIs and codes that show up in SAML 2.0
 * messages. Pure data plus tiny lookup helpers.
 */

export const NS = {
  PROTOCOL: "urn:oasis:names:tc:SAML:2.0:protocol",
  ASSERTION: "urn:oasis:names:tc:SAML:2.0:assertion",
  METADATA: "urn:oasis:names:tc:SAML:2.0:metadata",
  DSIG: "http://www.w3.org/2000/09/xmldsig#",
  XENC: "http://www.w3.org/2001/04/xmlenc#",
  XSI: "http://www.w3.org/2001/XMLSchema-instance",
  EXC_C14N: "http://www.w3.org/2001/10/xml-exc-c14n#",
} as const;

export type Explained = { short: string; description: string };

const STATUS_PREFIX = "urn:oasis:names:tc:SAML:2.0:status:";

export const STATUS_CODES: Record<string, Explained> = {
  Success: { short: "Success", description: "The request succeeded." },
  Requester: {
    short: "Requester error",
    description:
      "The request could not be performed due to an error on the part of the requester — usually the SP sent something the IdP did not accept.",
  },
  Responder: {
    short: "Responder error",
    description:
      "The request could not be performed due to an error on the part of the responder (the IdP) — a configuration problem or policy decision on its side.",
  },
  VersionMismatch: {
    short: "Version mismatch",
    description:
      "The responder does not support the SAML version of the request.",
  },
  AuthnFailed: {
    short: "Authentication failed",
    description:
      "The IdP could not authenticate the user (wrong credentials, cancelled login, or a failed second factor).",
  },
  InvalidAttrNameOrValue: {
    short: "Invalid attribute name or value",
    description:
      "An attribute name or value in the request was not understood or not allowed.",
  },
  InvalidNameIDPolicy: {
    short: "Invalid NameID policy",
    description:
      "The IdP cannot produce a NameID in the format the SP asked for in NameIDPolicy. Align the requested NameID format with what the IdP is configured to send.",
  },
  NoAuthnContext: {
    short: "Authentication context not satisfiable",
    description:
      "The IdP cannot authenticate the user with the RequestedAuthnContext the SP asked for (for example, the SP demanded a stronger or different authentication method).",
  },
  NoAvailableIDP: {
    short: "No available IdP",
    description:
      "Used by an intermediary: none of the IdPs in the request's IDPList are available.",
  },
  NoPassive: {
    short: "Passive login not possible",
    description:
      'The SP sent IsPassive="true" (do not show a login page) but the user has no existing session at the IdP, so it cannot authenticate them silently.',
  },
  NoSupportedIDP: {
    short: "No supported IdP",
    description:
      "Used by an intermediary: none of the IdPs in the request's IDPList are supported.",
  },
  PartialLogout: {
    short: "Partial logout",
    description:
      "Logout succeeded at the responder, but not every session participant could be logged out.",
  },
  ProxyCountExceeded: {
    short: "Proxy count exceeded",
    description:
      "The IdP would have to proxy the request to another IdP, but the request's ProxyCount does not allow it.",
  },
  RequestDenied: {
    short: "Request denied",
    description:
      "The IdP chose not to respond — commonly the user is not allowed to access this SP, or a policy blocked the request.",
  },
  RequestUnsupported: {
    short: "Request unsupported",
    description:
      "The IdP does not support this request (an unknown SP, binding, or feature).",
  },
  RequestVersionDeprecated: {
    short: "Request version deprecated",
    description: "The IdP no longer accepts this SAML protocol version.",
  },
  RequestVersionTooHigh: {
    short: "Request version too high",
    description:
      "The request's protocol version is newer than the IdP supports.",
  },
  RequestVersionTooLow: {
    short: "Request version too low",
    description:
      "The request's protocol version is older than the IdP supports.",
  },
  ResourceNotRecognized: {
    short: "Resource not recognized",
    description:
      "The IdP does not recognize the resource named in the request.",
  },
  TooManyResponses: {
    short: "Too many responses",
    description:
      "The response message would contain more elements than the responder can return.",
  },
  UnknownAttrProfile: {
    short: "Unknown attribute profile",
    description:
      "An attribute profile in the request is not known to the responder.",
  },
  UnknownPrincipal: {
    short: "Unknown principal",
    description:
      "The user (principal) referenced in the request is not known to the responder.",
  },
  UnsupportedBinding: {
    short: "Unsupported binding",
    description:
      "The responder cannot send the response using the binding the SP requested (ProtocolBinding).",
  },
};

/** Explain a SAML status code URI (top-level or second-level). */
export function explainStatusCode(
  uri: string | undefined,
): Explained | undefined {
  if (!uri) return undefined;
  const key = uri.startsWith(STATUS_PREFIX)
    ? uri.slice(STATUS_PREFIX.length)
    : uri;
  return STATUS_CODES[key];
}

export const NAMEID_FORMATS: Record<string, Explained> = {
  "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified": {
    short: "Unspecified",
    description:
      "No particular format; the IdP decides. Common, but the value can change if the IdP's configuration changes.",
  },
  "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress": {
    short: "Email address",
    description:
      "The user's email address. Readable, but changes if the user's email changes.",
  },
  "urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName": {
    short: "X.509 subject name",
    description: "The subject DN of an X.509 certificate.",
  },
  "urn:oasis:names:tc:SAML:1.1:nameid-format:WindowsDomainQualifiedName": {
    short: "Windows domain qualified name",
    description: "A DOMAIN\\user style name.",
  },
  "urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos": {
    short: "Kerberos principal",
    description: "A Kerberos principal name (user@REALM).",
  },
  "urn:oasis:names:tc:SAML:2.0:nameid-format:entity": {
    short: "Entity",
    description: "The entity ID of a SAML system (used for Issuer, not users).",
  },
  "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent": {
    short: "Persistent",
    description:
      "A stable, opaque identifier for this user at this SP. The best choice for linking accounts.",
  },
  "urn:oasis:names:tc:SAML:2.0:nameid-format:transient": {
    short: "Transient",
    description:
      "A one-time, random identifier that changes on every login. Do not use it to identify returning users.",
  },
};

export const BINDINGS: Record<string, Explained> = {
  "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST": {
    short: "HTTP-POST",
    description:
      "The message is base64-encoded and sent in an auto-submitted HTML form.",
  },
  "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect": {
    short: "HTTP-Redirect",
    description:
      "The message is DEFLATE-compressed, base64-encoded, and sent as a URL query parameter.",
  },
  "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact": {
    short: "HTTP-Artifact",
    description:
      "A short reference (artifact) is sent through the browser and exchanged for the real message over a back channel.",
  },
  "urn:oasis:names:tc:SAML:2.0:bindings:SOAP": {
    short: "SOAP",
    description: "A direct server-to-server SOAP call (back channel).",
  },
  "urn:oasis:names:tc:SAML:2.0:bindings:PAOS": {
    short: "PAOS (ECP)",
    description: "Reverse SOAP, used by the Enhanced Client or Proxy profile.",
  },
};

const AC = "urn:oasis:names:tc:SAML:2.0:ac:classes:";
export const AUTHN_CONTEXT_CLASSES: Record<string, Explained> = {
  [AC + "unspecified"]: {
    short: "Unspecified",
    description: "The IdP does not say how the user authenticated.",
  },
  [AC + "Password"]: {
    short: "Password",
    description: "Password over an unprotected channel.",
  },
  [AC + "PasswordProtectedTransport"]: {
    short: "Password over TLS",
    description:
      "The user signed in with a password over a protected (HTTPS) connection — the most common value.",
  },
  [AC + "X509"]: {
    short: "X.509 certificate",
    description: "The user authenticated with a client certificate.",
  },
  [AC + "TLSClient"]: {
    short: "TLS client certificate",
    description: "The user authenticated with a TLS client certificate.",
  },
  [AC + "Kerberos"]: {
    short: "Kerberos",
    description:
      "The user authenticated with Kerberos (for example, desktop SSO).",
  },
  [AC + "PreviousSession"]: {
    short: "Previous session",
    description:
      "The user was not asked to authenticate again; an existing IdP session was reused.",
  },
  [AC + "MobileTwoFactorContract"]: {
    short: "Mobile two-factor",
    description: "Two-factor authentication using a mobile device.",
  },
  [AC + "TimeSyncToken"]: {
    short: "Time-sync token",
    description: "A one-time password from a time-synchronized token.",
  },
  [AC + "Smartcard"]: {
    short: "Smartcard",
    description: "The user authenticated with a smartcard.",
  },
  [AC + "SmartcardPKI"]: {
    short: "Smartcard PKI",
    description: "A smartcard holding a private key, unlocked with a PIN.",
  },
  "urn:federation:authentication:windows": {
    short: "Windows integrated",
    description: "Windows integrated authentication (AD FS).",
  },
  "http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password":
    {
      short: "Password (Microsoft)",
      description:
        "Password authentication, as reported by Microsoft identity platforms.",
    },
  "http://schemas.microsoft.com/claims/multipleauthn": {
    short: "Multi-factor (Microsoft)",
    description:
      "Multi-factor authentication, as reported by Microsoft identity platforms.",
  },
};

export const SUBJECT_CONFIRMATION_METHODS: Record<string, Explained> = {
  "urn:oasis:names:tc:SAML:2.0:cm:bearer": {
    short: "Bearer",
    description:
      "Whoever presents the assertion is treated as the subject — the standard browser SSO method.",
  },
  "urn:oasis:names:tc:SAML:2.0:cm:holder-of-key": {
    short: "Holder of key",
    description:
      "The presenter must prove possession of a key named in the assertion.",
  },
  "urn:oasis:names:tc:SAML:2.0:cm:sender-vouches": {
    short: "Sender vouches",
    description: "A trusted intermediary vouches for the subject.",
  },
};

export const ATTRIBUTE_NAME_FORMATS: Record<string, Explained> = {
  "urn:oasis:names:tc:SAML:2.0:attrname-format:basic": {
    short: "Basic",
    description: 'A simple name such as "email".',
  },
  "urn:oasis:names:tc:SAML:2.0:attrname-format:uri": {
    short: "URI",
    description:
      "A URI or OID-based name such as urn:oid:0.9.2342.19200300.100.1.3.",
  },
  "urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified": {
    short: "Unspecified",
    description: "The IdP does not say how to interpret the name.",
  },
};

/** Common attribute names (OIDs and claim URIs) mapped to what they usually hold. */
export const WELL_KNOWN_ATTRIBUTES: Record<string, string> = {
  "urn:oid:0.9.2342.19200300.100.1.3": "mail (email address)",
  "urn:oid:2.5.4.42": "givenName (first name)",
  "urn:oid:2.5.4.4": "sn (last name)",
  "urn:oid:2.5.4.3": "cn (common name)",
  "urn:oid:2.16.840.1.113730.3.1.241": "displayName",
  "urn:oid:0.9.2342.19200300.100.1.1": "uid (username)",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.6": "eduPersonPrincipalName",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.7": "eduPersonEntitlement",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.1": "eduPersonAffiliation",
  "urn:oid:1.3.6.1.4.1.5923.1.1.1.10": "eduPersonTargetedID",
  "urn:oid:2.5.4.10": "o (organization)",
  "urn:oid:2.5.4.11": "ou (organizational unit)",
  "urn:oid:2.5.4.20": "telephoneNumber",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress":
    "email address (Microsoft claim)",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname":
    "first name (Microsoft claim)",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname":
    "last name (Microsoft claim)",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name":
    "user principal name (Microsoft claim)",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn":
    "user principal name (Microsoft claim)",
  "http://schemas.microsoft.com/identity/claims/displayname":
    "display name (Microsoft claim)",
  "http://schemas.microsoft.com/identity/claims/objectidentifier":
    "Entra ID object ID",
  "http://schemas.microsoft.com/identity/claims/tenantid": "Entra ID tenant ID",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups":
    "group IDs (Microsoft claim)",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
    "roles (Microsoft claim)",
  Role: "roles (Keycloak's default role list mapper)",
};

export function lookup(
  table: Record<string, Explained>,
  uri: string | undefined,
): Explained | undefined {
  return uri ? table[uri] : undefined;
}
