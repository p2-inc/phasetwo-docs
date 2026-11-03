/**
 * Cross-check a request against the response it produced: AuthnRequest ↔
 * Response, or LogoutRequest ↔ LogoutResponse. Each check compares what the
 * request asked for with what the response delivered.
 */

import type { DecodedInput } from "./decode.ts";
import {
  analyzeSaml,
  type AnalyzeOptions,
  type SamlAnalysis,
} from "./analyze.ts";
import type { SamlSummary } from "./saml.ts";
import { parseSamlInstant } from "./times.ts";

export type ComparisonStatus =
  "match" | "mismatch" | "warning" | "info" | "skipped";

export type ComparisonCheck = {
  /** Stable identifier, e.g. "in-response-to". */
  id: string;
  label: string;
  status: ComparisonStatus;
  /** What the request asked for. */
  expected?: string;
  /** What the response delivered. */
  actual?: string;
  /** Plain-English explanation. */
  detail: string;
};

export type ComparisonOptions = {
  /** Binding the response actually arrived over (from `decodeSamlInput`). */
  responseBinding?: DecodedInput["binding"];
};

const BINDING_PREFIX = "urn:oasis:names:tc:SAML:2.0:bindings:";
const UNSPECIFIED_NAMEID =
  "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified";

const norm = (u?: string) => u?.trim().replace(/\/+$/, "");
const sameUrl = (a?: string, b?: string) => !!a && !!b && norm(a) === norm(b);
const short = (uri?: string) =>
  uri ? (uri.split(/[:#/]/).filter(Boolean).pop() ?? uri) : undefined;

const REQUEST_TYPES = new Set(["AuthnRequest", "LogoutRequest"]);
const RESPONSE_TYPES = new Set(["Response", "LogoutResponse"]);

export function isRequestType(s: SamlSummary | undefined): boolean {
  return !!s && REQUEST_TYPES.has(s.messageType);
}

export function isResponseType(s: SamlSummary | undefined): boolean {
  return !!s && RESPONSE_TYPES.has(s.messageType);
}

/** Compare a request summary with the response summary it produced. */
export function compareRequestResponse(
  request: SamlSummary,
  response: SamlSummary,
  opts: ComparisonOptions = {},
): ComparisonCheck[] {
  const checks: ComparisonCheck[] = [];
  const add = (c: ComparisonCheck) => checks.push(c);

  const pairOk =
    (request.messageType === "AuthnRequest" &&
      response.messageType === "Response") ||
    (request.messageType === "LogoutRequest" &&
      response.messageType === "LogoutResponse");
  add({
    id: "message-types",
    label: "Message types",
    status: pairOk ? "match" : "mismatch",
    expected:
      request.messageType === "LogoutRequest" ? "LogoutResponse" : "Response",
    actual: response.messageType,
    detail: pairOk
      ? `A ${response.messageType} answering a ${request.messageType}.`
      : `A ${request.messageType} is not answered by a ${response.messageType}; these two messages are not a request/response pair.`,
  });

  // InResponseTo ↔ ID
  if (!request.id) {
    add({
      id: "in-response-to",
      label: "InResponseTo ↔ request ID",
      status: "skipped",
      actual: response.inResponseTo,
      detail: "The request has no ID.",
    });
  } else if (!response.inResponseTo) {
    add({
      id: "in-response-to",
      label: "InResponseTo ↔ request ID",
      status: "mismatch",
      expected: request.id,
      detail:
        "The response has no InResponseTo, so it is unsolicited (IdP-initiated) and not an answer to this request. An SP that sent this request will usually reject it.",
    });
  } else {
    const ok = response.inResponseTo === request.id;
    add({
      id: "in-response-to",
      label: "InResponseTo ↔ request ID",
      status: ok ? "match" : "mismatch",
      expected: request.id,
      actual: response.inResponseTo,
      detail: ok
        ? "The response answers this request."
        : "The response answers a different request. Common causes: a stale browser tab, a retried login, or an SP that lost the request state (for example, a cookie that did not survive the cross-site POST).",
    });
  }
  const scIrt = response.assertions.flatMap((a) =>
    a.subjectConfirmations.map((s) => s.inResponseTo).filter(Boolean),
  ) as string[];
  if (request.id && scIrt.length) {
    const ok = scIrt.every((x) => x === request.id);
    add({
      id: "subject-in-response-to",
      label: "SubjectConfirmationData InResponseTo ↔ request ID",
      status: ok ? "match" : "mismatch",
      expected: request.id,
      actual: scIrt.join(", "),
      detail: ok
        ? "The assertion is bound to this request."
        : "The assertion's subject confirmation refers to a different request.",
    });
  }

  // Timing
  const reqAt = request.issueInstant
    ? parseSamlInstant(request.issueInstant).ms
    : undefined;
  const resAt = response.issueInstant
    ? parseSamlInstant(response.issueInstant).ms
    : undefined;
  if (reqAt !== undefined && resAt !== undefined) {
    const gap = resAt - reqAt;
    add({
      id: "issue-order",
      label: "IssueInstant order",
      status: gap < 0 ? "warning" : "match",
      expected: request.issueInstant,
      actual: response.issueInstant,
      detail:
        gap < 0
          ? `The response claims to be issued ${Math.round(-gap / 1000)} seconds before the request. The IdP's clock is behind the SP's.`
          : `The response was issued ${Math.round(gap / 1000)} seconds after the request.`,
    });
  }

  if (request.messageType === "AuthnRequest") {
    // ACS URL ↔ Destination / Recipient
    const acs = request.assertionConsumerServiceURL;
    if (!acs) {
      add({
        id: "acs-destination",
        label: "ACS URL ↔ Destination",
        status: "info",
        expected: request.assertionConsumerServiceIndex
          ? `ACS index ${request.assertionConsumerServiceIndex}`
          : "(from SP metadata)",
        actual: response.destination,
        detail:
          "The request names no AssertionConsumerServiceURL, so the IdP uses the ACS registered in the SP's metadata. Check the Destination against that.",
      });
    } else {
      const ok = sameUrl(acs, response.destination);
      add({
        id: "acs-destination",
        label: "ACS URL ↔ Destination",
        status: !response.destination ? "warning" : ok ? "match" : "mismatch",
        expected: acs,
        actual: response.destination ?? "(none)",
        detail: !response.destination
          ? "The response has no Destination. Signed responses are required to carry one."
          : ok
            ? "The IdP sent the response where the SP asked."
            : "The IdP sent the response to a different URL than the SP asked for — the IdP probably uses a registered ACS URL that differs (scheme, host, port, path, or trailing slash).",
      });
      const recipients = response.assertions.flatMap((a) =>
        a.subjectConfirmations.map((s) => s.recipient).filter(Boolean),
      ) as string[];
      if (recipients.length) {
        const rOk = recipients.every((r) => sameUrl(r, acs));
        add({
          id: "acs-recipient",
          label: "ACS URL ↔ Recipient",
          status: rOk ? "match" : "mismatch",
          expected: acs,
          actual: recipients.join(", "),
          detail: rOk
            ? "The assertion's Recipient is the requested ACS URL."
            : "SubjectConfirmationData Recipient differs from the requested ACS URL; SPs check Recipient against their own ACS URL.",
        });
      }
    }

    // Issuer ↔ Audience
    const audiences = response.assertions.flatMap(
      (a) => a.conditions?.audiences ?? [],
    );
    if (response.encryptedAssertionCount && !response.assertions.length) {
      add({
        id: "issuer-audience",
        label: "Request Issuer ↔ Audience",
        status: "skipped",
        expected: request.issuer,
        detail: "The assertion is encrypted, so its audience cannot be read.",
      });
    } else if (!request.issuer) {
      add({
        id: "issuer-audience",
        label: "Request Issuer ↔ Audience",
        status: "skipped",
        actual: audiences.join(", "),
        detail: "The request has no Issuer.",
      });
    } else if (!audiences.length) {
      add({
        id: "issuer-audience",
        label: "Request Issuer ↔ Audience",
        status: "warning",
        expected: request.issuer,
        detail:
          "The assertion has no AudienceRestriction, so it is not bound to this SP.",
      });
    } else {
      const ok = audiences.includes(request.issuer.trim());
      add({
        id: "issuer-audience",
        label: "Request Issuer ↔ Audience",
        status: ok ? "match" : "mismatch",
        expected: request.issuer,
        actual: audiences.join(", "),
        detail: ok
          ? "The assertion is addressed to the SP that asked for it."
          : "The assertion is addressed to a different entity ID than the SP that sent the request. Fix the SP entity ID registered at the IdP (or the SP's own entity ID) so they match exactly.",
      });
    }

    // NameIDPolicy ↔ NameID format
    const wanted = request.nameIdPolicy?.format;
    const nameId = response.assertions[0]?.nameId;
    if (!wanted || wanted === UNSPECIFIED_NAMEID) {
      add({
        id: "nameid-format",
        label: "NameIDPolicy ↔ NameID format",
        status: "info",
        expected: wanted ? "unspecified (any)" : "(no NameIDPolicy)",
        actual: nameId?.format ?? (nameId ? "(not set)" : undefined),
        detail: "The request accepts any NameID format.",
      });
    } else if (!nameId) {
      add({
        id: "nameid-format",
        label: "NameIDPolicy ↔ NameID format",
        status:
          response.assertions[0]?.encryptedNameId ||
          response.encryptedAssertionCount
            ? "skipped"
            : "warning",
        expected: wanted,
        detail:
          response.assertions[0]?.encryptedNameId ||
          response.encryptedAssertionCount
            ? "The NameID is encrypted."
            : "The response carries no NameID.",
      });
    } else {
      const ok = nameId.format === wanted;
      add({
        id: "nameid-format",
        label: "NameIDPolicy ↔ NameID format",
        status: ok ? "match" : "mismatch",
        expected: wanted,
        actual: nameId.format ?? "(not set)",
        detail: ok
          ? "The IdP returned the requested NameID format."
          : `The SP asked for ${short(wanted)} but got ${short(nameId.format) ?? "no format"}. Strict SPs reject this; align the IdP's NameID setting with the SP's NameIDPolicy (or have the IdP answer InvalidNameIDPolicy).`,
      });
    }

    // RequestedAuthnContext ↔ AuthnContextClassRef
    const rac = request.requestedAuthnContext;
    const got = response.assertions.flatMap((a) =>
      a.authnStatements.map((s) => s.classRef).filter(Boolean),
    ) as string[];
    if (!rac || !rac.classRefs.length) {
      add({
        id: "authn-context",
        label: "RequestedAuthnContext ↔ AuthnContextClassRef",
        status: "skipped",
        actual: got.join(", ") || undefined,
        detail:
          "The request did not ask for a specific authentication context.",
      });
    } else if (!got.length) {
      add({
        id: "authn-context",
        label: "RequestedAuthnContext ↔ AuthnContextClassRef",
        status: response.encryptedAssertionCount ? "skipped" : "warning",
        expected: rac.classRefs.join(", "),
        detail: response.encryptedAssertionCount
          ? "The assertion is encrypted."
          : "The response reports no AuthnContextClassRef.",
      });
    } else {
      const comparison = rac.comparison ?? "exact";
      const hit = got.some((g) => rac.classRefs.includes(g));
      const status: ComparisonStatus =
        comparison === "exact"
          ? hit
            ? "match"
            : "mismatch"
          : hit
            ? "match"
            : "info";
      add({
        id: "authn-context",
        label: "RequestedAuthnContext ↔ AuthnContextClassRef",
        status,
        expected: `${comparison}: ${rac.classRefs.join(", ")}`,
        actual: got.join(", "),
        detail: hit
          ? "The user authenticated with a requested context."
          : comparison === "exact"
            ? "The IdP authenticated the user with a different context than the one required. SPs enforcing it will reject the login; the IdP should have answered NoAuthnContext instead."
            : `With Comparison="${comparison}" the IdP decides which contexts are stronger, so this cannot be judged automatically.`,
      });
    }

    // ProtocolBinding ↔ actual binding
    const wantedBinding = request.protocolBinding?.startsWith(BINDING_PREFIX)
      ? request.protocolBinding.slice(BINDING_PREFIX.length)
      : request.protocolBinding;
    if (!wantedBinding) {
      add({
        id: "binding",
        label: "ProtocolBinding ↔ response binding",
        status: "skipped",
        actual: opts.responseBinding,
        detail:
          "The request does not name a ProtocolBinding; HTTP-POST is the usual default.",
      });
    } else if (!opts.responseBinding) {
      add({
        id: "binding",
        label: "ProtocolBinding ↔ response binding",
        status: "info",
        expected: wantedBinding,
        detail:
          "The response was pasted as raw XML, so the binding it arrived over is unknown. Paste the encoded value or form body to check it.",
      });
    } else {
      const ok = wantedBinding === opts.responseBinding;
      add({
        id: "binding",
        label: "ProtocolBinding ↔ response binding",
        status: ok ? "match" : "mismatch",
        expected: wantedBinding,
        actual: opts.responseBinding,
        detail: ok
          ? "The response came back over the requested binding."
          : `The SP asked for ${wantedBinding} but the response arrived over ${opts.responseBinding}.${wantedBinding === "HTTP-Artifact" ? "" : " Responses carrying assertions are normally sent with HTTP-POST."}`,
      });
    }
  }

  if (
    request.messageType === "LogoutRequest" &&
    response.messageType === "LogoutResponse" &&
    request.issuer &&
    response.issuer
  ) {
    const same = request.issuer === response.issuer;
    add({
      id: "logout-parties",
      label: "Logout parties",
      status: same ? "warning" : "info",
      expected: `a party other than ${request.issuer}`,
      actual: response.issuer,
      detail: same
        ? "The request and response have the same Issuer; a logout response should come from the party the request was sent to."
        : "The response comes from the party the logout request was sent to.",
    });
  }

  return checks;
}

export type ExchangeAnalysis = {
  request: SamlAnalysis;
  response: SamlAnalysis;
  /** True when the inputs were pasted in the opposite order and swapped. */
  swapped: boolean;
  checks: ComparisonCheck[];
  /** Why the comparison could not run, if it could not. */
  error?: string;
};

/**
 * Analyze two pasted messages and compare them. The inputs may be given in
 * either order; a response pasted first is swapped into place.
 */
export async function analyzeExchange(
  requestInput: string,
  responseInput: string,
  opts: AnalyzeOptions = {},
): Promise<ExchangeAnalysis> {
  let [request, response] = await Promise.all([
    analyzeSaml(requestInput, opts),
    analyzeSaml(responseInput, opts),
  ]);
  let swapped = false;
  if (isResponseType(request.summary) && isRequestType(response.summary)) {
    [request, response] = [response, request];
    swapped = true;
  }
  const base = { request, response, swapped, checks: [] as ComparisonCheck[] };
  if (!request.summary)
    return {
      ...base,
      error: `Request: ${request.error ?? "nothing to compare."}`,
    };
  if (!response.summary)
    return {
      ...base,
      error: `Response: ${response.error ?? "nothing to compare."}`,
    };
  if (!isRequestType(request.summary))
    return {
      ...base,
      error: `The first message is a ${request.summary.messageType}, not an AuthnRequest or LogoutRequest.`,
    };
  if (!isResponseType(response.summary))
    return {
      ...base,
      error: `The second message is a ${response.summary.messageType}, not a Response or LogoutResponse.`,
    };
  return {
    ...base,
    checks: compareRequestResponse(request.summary, response.summary, {
      responseBinding: response.decoded.binding,
    }),
  };
}
