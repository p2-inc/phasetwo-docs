/**
 * Troubleshooting hints: generic SAML consistency checks plus Keycloak-aware
 * advice keyed off Keycloak's endpoint URL patterns.
 *
 * Link `href`s that start with "/" are pages on https://phasetwo.io; prefix
 * them with {@link DOCS_ORIGIN} when rendering outside the site.
 */

import type { DecodedInput } from "./decode.ts";
import { explainStatusCode, NAMEID_FORMATS } from "./explain.ts";
import type { SamlSummary } from "./saml.ts";
import { hasClockSkewSymptom, type TimeCheck } from "./times.ts";

export const DOCS_ORIGIN = "https://phasetwo.io";

export type HintLink = { label: string; href: string };
export type Hint = {
  level: "error" | "warning" | "info";
  title: string;
  detail: string;
  links?: HintLink[];
};

export const LINKS = {
  samlIntro: {
    label: "SAML, simplified",
    href: "/blog/introduction-to-simple-saml",
  },
  idpInitiated: {
    label: "IdP-initiated SAML with Keycloak",
    href: "/blog/keycloak-saml-identity-provider-idp-initiated-flow-with-okta",
  },
  idpBroker: {
    label: "Keycloak as an identity provider broker",
    href: "/docs/keycloak/idp",
  },
  ssoSetup: {
    label: "Configuring identity providers",
    href: "/docs/sso/setup",
  },
  idpMappers: {
    label: "Identity provider mappers",
    href: "/tutorials/identity-providers/attribute-mapping",
  },
  kcSamlIdp: {
    label: "Keycloak docs: SAML identity providers",
    href: "https://www.keycloak.org/docs/latest/server_admin/index.html#saml-v2-0-identity-providers",
  },
  kcSamlClient: {
    label: "Keycloak docs: SAML clients",
    href: "https://www.keycloak.org/docs/latest/server_admin/index.html#_client-saml-configuration",
  },
} satisfies Record<string, HintLink>;

export type KeycloakEndpoint = {
  kind:
    | "realm-saml"
    | "idp-initiated"
    | "broker-endpoint"
    | "broker-idp-initiated"
    | "broker-descriptor"
    | "realm";
  /** Scheme + host (+ legacy "/auth" context path). */
  baseUrl: string;
  realm: string;
  /** `{baseUrl}/realms/{realm}` — Keycloak's default entity ID for the realm. */
  realmUrl: string;
  /** Identity provider alias, for broker endpoints. */
  alias?: string;
  /** IdP-initiated SSO URL name, when present. */
  clientUrlName?: string;
};

/** Recognize Keycloak SAML endpoint URLs and realm entity IDs. */
export function parseKeycloakUrl(
  url: string | undefined,
): KeycloakEndpoint | undefined {
  if (!url) return undefined;
  const m =
    /^(https?:\/\/[^/?#]+(?:\/auth)?)\/realms\/([^/?#]+)(\/[^?#]*)?/i.exec(
      url.trim(),
    );
  if (!m) return undefined;
  const [, baseUrl, realmRaw, rest = ""] = m;
  let realm = realmRaw;
  try {
    realm = decodeURIComponent(realmRaw);
  } catch {
    /* keep raw */
  }
  const realmUrl = `${baseUrl}/realms/${realmRaw}`;
  const r = rest.replace(/\/+$/, "");
  let x: RegExpExecArray | null;
  if (r === "") return { kind: "realm", baseUrl, realm, realmUrl };
  if ((x = /^\/protocol\/saml\/clients\/([^/]+)$/.exec(r)))
    return {
      kind: "idp-initiated",
      baseUrl,
      realm,
      realmUrl,
      clientUrlName: x[1],
    };
  if (/^\/protocol\/saml(\/descriptor)?$/.test(r))
    return { kind: "realm-saml", baseUrl, realm, realmUrl };
  if ((x = /^\/broker\/([^/]+)\/endpoint\/clients\/([^/]+)$/.exec(r)))
    return {
      kind: "broker-idp-initiated",
      baseUrl,
      realm,
      realmUrl,
      alias: x[1],
      clientUrlName: x[2],
    };
  if ((x = /^\/broker\/([^/]+)\/endpoint\/descriptor$/.exec(r)))
    return { kind: "broker-descriptor", baseUrl, realm, realmUrl, alias: x[1] };
  if ((x = /^\/broker\/([^/]+)\/endpoint$/.exec(r)))
    return { kind: "broker-endpoint", baseUrl, realm, realmUrl, alias: x[1] };
  return undefined;
}

const sameUrl = (a?: string, b?: string) =>
  !!a && !!b && a.trim().replace(/\/+$/, "") === b.trim().replace(/\/+$/, "");
const fmtName = (f?: string) =>
  f ? (NAMEID_FORMATS[f]?.short ?? f) : "unspecified";

export type HintOptions = {
  decoded?: DecodedInput;
  times?: TimeCheck[];
  now?: number;
};

/** Generate troubleshooting hints for a summarized message. */
export function samlHints(
  summary: SamlSummary,
  opts: HintOptions = {},
): Hint[] {
  const hints: Hint[] = [];
  const t = summary.messageType;
  const assertion = summary.assertions[0];
  const recipients = summary.assertions.flatMap((a) =>
    a.subjectConfirmations.map((s) => s.recipient).filter(Boolean),
  ) as string[];
  const audiences = summary.assertions.flatMap(
    (a) => a.conditions?.audiences ?? [],
  );

  // ---- Status ----
  if (summary.status?.code && !summary.status.code.endsWith(":Success")) {
    const top = explainStatusCode(summary.status.code);
    const sub = explainStatusCode(summary.status.subCode);
    hints.push({
      level: "error",
      title: `The ${t === "LogoutResponse" ? "logout" : "login"} failed: ${top?.short ?? summary.status.code}${sub ? ` / ${sub.short}` : ""}`,
      detail: [
        sub?.description ?? top?.description,
        summary.status.message
          ? `The IdP said: "${summary.status.message}".`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      links: [LINKS.samlIntro],
    });
  }

  // ---- Generic consistency ----
  if (t === "Response") {
    if (
      summary.destination &&
      recipients.length &&
      !recipients.some((r) => sameUrl(r, summary.destination))
    )
      hints.push({
        level: "warning",
        title: "Destination and Recipient differ",
        detail: `The Response Destination (${summary.destination}) does not match the SubjectConfirmationData Recipient (${recipients[0]}). Both should be the SP's Assertion Consumer Service URL; most SPs reject the message when either is wrong.`,
      });
    if (
      !summary.messageSigned &&
      !summary.assertionSigned &&
      !summary.encryptedAssertionCount &&
      assertion
    )
      hints.push({
        level: "warning",
        title: "Nothing is signed",
        detail:
          "Neither the Response nor the Assertion carries a signature. An SP that validates signatures (as it should) will reject this message.",
      });
    if (assertion && !audiences.length)
      hints.push({
        level: "info",
        title: "No audience restriction",
        detail:
          "The assertion has no AudienceRestriction, so it is not bound to a specific SP.",
      });
    if (!summary.inResponseTo && assertion)
      hints.push({
        level: "info",
        title: "Unsolicited (IdP-initiated) response",
        detail:
          "There is no InResponseTo, so this response was not triggered by an AuthnRequest. The SP must be configured to accept IdP-initiated SSO.",
        links: [LINKS.idpInitiated],
      });
    if (summary.encryptedAssertionCount)
      hints.push({
        level: "info",
        title: "Encrypted assertion",
        detail:
          "The assertion is encrypted for the SP. Only the SP's private key can decrypt it, so its subject, conditions, and attributes cannot be shown here — and you should never paste a private key into a web page. Decrypt it at the SP, or temporarily turn off assertion encryption while debugging.",
      });
  }
  for (const s of summary.signatures) {
    if (/sha1$/.test(s.signatureMethod))
      hints.push({
        level: "warning",
        title: "SHA-1 signature",
        detail: `The signature on <${s.signedElement}> uses ${s.signatureMethod.split("#")[1]}. SHA-1 is deprecated and some SPs refuse it; switch the signer to RSA-SHA256.`,
      });
  }
  if (opts.decoded?.sigAlg && /sha1$/.test(opts.decoded.sigAlg))
    hints.push({
      level: "warning",
      title: "SHA-1 query-string signature",
      detail:
        "SigAlg is SHA-1, which is deprecated. Switch the signer to RSA-SHA256.",
    });

  if (
    opts.times &&
    opts.now !== undefined &&
    hasClockSkewSymptom(opts.times, opts.now)
  )
    hints.push({
      level: "warning",
      title: "Possible clock skew",
      detail:
        "A validity boundary was missed by only a few minutes. That is the classic sign of clocks drifting between IdP and SP. Sync both with NTP; as a stopgap, allow a small clock skew at the SP.",
    });

  // ---- Keycloak-aware ----
  const dest = parseKeycloakUrl(summary.destination ?? opts.decoded?.endpoint);
  const acs = parseKeycloakUrl(summary.assertionConsumerServiceURL);
  const issuer = parseKeycloakUrl(summary.issuer);
  const skewSymptom =
    opts.times &&
    opts.now !== undefined &&
    hasClockSkewSymptom(opts.times, opts.now);

  if (
    t === "AuthnRequest" &&
    dest &&
    (dest.kind === "realm-saml" || dest.kind === "idp-initiated")
  ) {
    hints.push({
      level: "info",
      title: `Sent to Keycloak realm "${dest.realm}" (Keycloak is the IdP)`,
      detail: `Keycloak finds the SAML client whose Client ID exactly equals the Issuer${summary.issuer ? ` ("${summary.issuer}")` : ""}. An "Invalid requester" or "client not found" error means the Issuer and Client ID differ — check scheme, trailing slashes, and case.`,
      links: [LINKS.kcSamlClient],
    });
    if (summary.assertionConsumerServiceURL)
      hints.push({
        level: "info",
        title: "Keycloak validates the ACS URL",
        detail: `Keycloak only sends the response to ${summary.assertionConsumerServiceURL} if it matches the client's "Assertion Consumer Service POST Binding URL" or one of its "Valid redirect URIs". A mismatch shows as "Invalid redirect uri".`,
        links: [LINKS.kcSamlClient],
      });
    if (summary.nameIdPolicy?.format)
      hints.push({
        level: "info",
        title: `Requests NameID format: ${fmtName(summary.nameIdPolicy.format)}`,
        detail: `Keycloak answers with the client's "Name ID format" when "Force name ID format" is on; otherwise it honors this request. Persistent NameIDs need a stable user value, and an unsatisfiable format comes back as InvalidNameIDPolicy.`,
      });
    if (!summary.messageSigned && !opts.decoded?.signature)
      hints.push({
        level: "info",
        title: "The request is unsigned",
        detail:
          'If the Keycloak client has "Client signature required" on, unsigned AuthnRequests are rejected. Either sign requests at the SP or turn the setting off.',
      });
  }

  if (t === "AuthnRequest" && acs && acs.kind === "broker-endpoint") {
    hints.push({
      level: "info",
      title: `Keycloak is the SP here, brokering to identity provider "${acs.alias}"`,
      detail: `Realm "${acs.realm}" is asking an external IdP to log the user in. The Issuer${summary.issuer ? ` ("${summary.issuer}")` : ""} is Keycloak's SP entity ID — the external IdP must have it registered as the SP / audience, and must post back to ${summary.assertionConsumerServiceURL}. Keycloak defaults the entity ID to ${acs.realmUrl}; override it with "Service provider entity ID" on the identity provider.`,
      links: [LINKS.idpBroker, LINKS.ssoSetup, LINKS.kcSamlIdp],
    });
  }

  if (
    (t === "Response" || t === "LogoutResponse") &&
    dest &&
    (dest.kind === "broker-endpoint" || dest.kind === "broker-idp-initiated")
  ) {
    hints.push({
      level: "info",
      title: `Response to Keycloak broker endpoint "${dest.alias}"`,
      detail: `An external IdP is answering realm "${dest.realm}". Keycloak matches it against the "${dest.alias}" identity provider configuration — its signing certificate, entity ID, NameID policy, and mappers.`,
      links: [LINKS.idpBroker, LINKS.kcSamlIdp],
    });
    if (audiences.length && !audiences.some((a) => sameUrl(a, dest.realmUrl)))
      hints.push({
        level: "warning",
        title: "Audience is not Keycloak's default SP entity ID",
        detail: `The assertion is for ${audiences.map((a) => `"${a}"`).join(", ")}, but Keycloak's default SP entity ID for this realm is "${dest.realmUrl}". Unless the identity provider's "Service provider entity ID" is set to the audience value, Keycloak rejects the assertion. Fix whichever side is wrong.`,
        links: [LINKS.kcSamlIdp],
      });
    if (
      t === "Response" &&
      !summary.messageSigned &&
      !summary.assertionSigned &&
      !summary.encryptedAssertionCount
    )
      hints.push({
        level: "warning",
        title: "Keycloak will reject this if signature validation is on",
        detail:
          'With "Validate signatures" on (recommended), Keycloak requires a valid signature on the Response or the Assertion; "Want Assertions signed" requires it on the Assertion itself.',
      });
    else if (
      t === "Response" &&
      summary.messageSigned &&
      !summary.assertionSigned &&
      !summary.encryptedAssertionCount
    )
      hints.push({
        level: "info",
        title: "Only the Response is signed",
        detail:
          'If the identity provider has "Want Assertions signed" on, Keycloak also requires a signature on the Assertion. Either have the IdP sign the assertion too, or turn that setting off.',
      });
    if (summary.encryptedAssertionCount)
      hints.push({
        level: "info",
        title: "Encrypted for Keycloak",
        detail: `Keycloak decrypts the assertion with the realm's encryption key. If decryption fails, the IdP is using an old or wrong Keycloak certificate — re-import Keycloak's SP metadata (${dest.realmUrl}/broker/${dest.alias}/endpoint/descriptor) at the IdP.`,
      });
    if (assertion?.nameId)
      hints.push({
        level: "info",
        title: `NameID format: ${fmtName(assertion.nameId.format)}`,
        detail: `With "Principal type" set to Subject NameID, Keycloak links the user by this value ("${assertion.nameId.value}"). Its "NameID policy format" should match what the IdP sends; a transient NameID creates a new identity link on every login. Map other attributes into the user with identity provider mappers.`,
        links: [LINKS.idpMappers],
      });
    if (!summary.inResponseTo && t === "Response")
      hints.push({
        level: "info",
        title: "IdP-initiated login to Keycloak",
        detail:
          dest.kind === "broker-idp-initiated"
            ? `This targets client URL name "${dest.clientUrlName}". That Keycloak client must have "IDP-Initiated SSO URL name" set to the same value.`
            : `Keycloak accepts unsolicited responses only at ${dest.realmUrl}/broker/${dest.alias}/endpoint/clients/{client-url-name}, for a client with "IDP-Initiated SSO URL name" set. This Destination has no client segment.`,
        links: [LINKS.idpInitiated],
      });
    if (skewSymptom)
      hints.push({
        level: "warning",
        title: 'Raise "Allowed clock skew" in Keycloak',
        detail: `The identity provider "${dest.alias}" has an "Allowed clock skew" setting (seconds). Raising it lets Keycloak tolerate small clock drift — but fix the clocks too.`,
        links: [LINKS.kcSamlIdp],
      });
  }

  if (t === "Response" && issuer && issuer.kind === "realm") {
    hints.push({
      level: "info",
      title: `Issued by Keycloak realm "${issuer.realm}"`,
      detail: `Keycloak is the IdP. The Audience is the SAML client's Client ID${audiences[0] ? ` ("${audiences[0]}")` : ""}, and the Destination comes from the client's "Assertion Consumer Service POST Binding URL". If the SP rejects the audience or destination, fix that client's settings.`,
      links: [LINKS.kcSamlClient],
    });
    if (!summary.messageSigned || !summary.assertionSigned)
      hints.push({
        level: "info",
        title: "Keycloak signing settings",
        detail: `This Response has ${summary.messageSigned ? "a signed Response" : "no Response signature"} and ${summary.assertionSigned ? "a signed Assertion" : "no Assertion signature"}. The client's "Sign documents" and "Sign assertions" switches control each one; match them to what the SP requires.`,
        links: [LINKS.kcSamlClient],
      });
    if (skewSymptom)
      hints.push({
        level: "info",
        title: "Clock skew with Keycloak as IdP",
        detail:
          "Keycloak's assertion lifetime is short by default. If the SP's clock drifts, sync it with NTP or raise the SP's tolerance; on the Keycloak client, \"Assertion Lifespan\" (Advanced tab) lengthens the window.",
      });
  }

  if (
    (t === "LogoutRequest" || t === "LogoutResponse") &&
    dest &&
    dest.kind === "realm-saml"
  )
    hints.push({
      level: "info",
      title: `Logout sent to Keycloak realm "${dest.realm}"`,
      detail:
        'Keycloak identifies the client by the Issuer and replies to its "Logout Service POST/Redirect Binding URL". If logout does not reach the SP, check those URLs and "Front channel logout" on the client.',
      links: [LINKS.kcSamlClient],
    });

  return hints;
}
