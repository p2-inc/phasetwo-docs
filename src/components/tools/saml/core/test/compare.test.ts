// Tests for request/response comparison and clock-skew tolerance.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  analyzeExchange,
  analyzeSaml,
  compareRequestResponse,
  EXAMPLE_EXCHANGE,
  parseXml,
  summarizeSaml,
  type ComparisonCheck,
} from "../index.ts";

const F = JSON.parse(
  readFileSync(new URL("./fixtures.json", import.meta.url), "utf8"),
);
const T0 = Date.parse("2026-01-15T17:04:20Z");
const sum = (xml: string) => summarizeSaml(parseXml(xml));
const byId = (checks: ComparisonCheck[]) =>
  Object.fromEntries(checks.map((c) => [c.id, c.status]));

test("the bundled example pair matches on every check", async () => {
  const x = await analyzeExchange(
    EXAMPLE_EXCHANGE.request,
    EXAMPLE_EXCHANGE.response,
    { now: T0 },
  );
  assert.equal(x.error, undefined);
  assert.equal(x.swapped, false);
  assert.deepEqual(byId(x.checks), {
    "message-types": "match",
    "in-response-to": "match",
    "subject-in-response-to": "match",
    "issue-order": "match",
    "acs-destination": "match",
    "acs-recipient": "match",
    "issuer-audience": "match",
    "nameid-format": "match",
    "authn-context": "skipped",
    binding: "match",
  });
});

test("inputs in the wrong order are swapped", async () => {
  const x = await analyzeExchange(
    EXAMPLE_EXCHANGE.response,
    EXAMPLE_EXCHANGE.request,
    { now: T0 },
  );
  assert.equal(x.swapped, true);
  assert.equal(x.request.summary?.messageType, "AuthnRequest");
  assert.ok(x.checks.every((c) => c.status !== "mismatch"));
});

test("reports a mismatch for each broken field", () => {
  const req = sum(F.authnRequest);
  const res = sum(
    F.unsignedResponse
      .replace(
        /InResponseTo="ID_4c1f8e2a-93b7-4d05-a6e2-7b9d0c3f5a81"/g,
        'InResponseTo="ID_other"',
      )
      .replace(
        /Destination="[^"]+"/,
        'Destination="https://sso.example.com/realms/acme/broker/other/endpoint"',
      )
      .replace(
        /Recipient="[^"]+"/,
        'Recipient="https://sso.example.com/realms/acme/broker/other/endpoint"',
      )
      .replace(
        "<saml:Audience>https://sso.example.com/realms/acme</saml:Audience>",
        "<saml:Audience>urn:wrong:sp</saml:Audience>",
      )
      .replace("nameid-format:emailAddress", "nameid-format:transient"),
  );
  const s = byId(
    compareRequestResponse(req, res, { responseBinding: "HTTP-Redirect" }),
  );
  for (const id of [
    "in-response-to",
    "subject-in-response-to",
    "acs-destination",
    "acs-recipient",
    "issuer-audience",
    "nameid-format",
    "binding",
  ])
    assert.equal(s[id], "mismatch", id);
});

test("unknown binding for raw XML, and missing InResponseTo", () => {
  const req = sum(F.authnRequest);
  const res = sum(F.unsignedResponse.replace(/ InResponseTo="[^"]+"/g, ""));
  const s = byId(compareRequestResponse(req, res));
  assert.equal(s.binding, "info");
  assert.equal(s["in-response-to"], "mismatch");
});

test("RequestedAuthnContext: exact vs minimum", () => {
  const rac = (cmp: string, cls: string) =>
    F.authnRequest.replace(
      "</samlp:AuthnRequest>",
      `<samlp:RequestedAuthnContext Comparison="${cmp}"><saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:${cls}</saml:AuthnContextClassRef></samlp:RequestedAuthnContext></samlp:AuthnRequest>`,
    );
  const res = sum(F.unsignedResponse);
  assert.equal(
    byId(
      compareRequestResponse(
        sum(rac("exact", "PasswordProtectedTransport")),
        res,
      ),
    )["authn-context"],
    "match",
  );
  assert.equal(
    byId(compareRequestResponse(sum(rac("exact", "X509")), res))[
      "authn-context"
    ],
    "mismatch",
  );
  assert.equal(
    byId(compareRequestResponse(sum(rac("minimum", "X509")), res))[
      "authn-context"
    ],
    "info",
  );
});

test("a request without an ACS URL defers to metadata", () => {
  const req = sum(
    F.authnRequest.replace(
      / AssertionConsumerServiceURL="[^"]+"/,
      ' AssertionConsumerServiceIndex="1"',
    ),
  );
  const s = byId(compareRequestResponse(req, sum(F.unsignedResponse)));
  assert.equal(s["acs-destination"], "info");
});

test("refuses to compare two responses", async () => {
  const x = await analyzeExchange(
    EXAMPLE_EXCHANGE.response,
    EXAMPLE_EXCHANGE.response,
    { now: T0 },
  );
  assert.match(x.error!, /not an AuthnRequest or LogoutRequest/);
});

test("clockSkewSeconds widens the validity window in analyzeSaml", async () => {
  const late = Date.parse("2026-01-15T17:09:40Z");
  const strict = await analyzeSaml(EXAMPLE_EXCHANGE.response, { now: late });
  const lenient = await analyzeSaml(EXAMPLE_EXCHANGE.response, {
    now: late,
    clockSkewSeconds: 60,
  });
  const state = (a: typeof strict) =>
    a.times.find((t) => t.label === "Conditions NotOnOrAfter")!.state;
  assert.equal(state(strict), "expired");
  assert.equal(state(lenient), "ok");
  assert.match(
    lenient.times.find((t) => t.label === "Conditions NotOnOrAfter")!.note!,
    /within the 60-second clock-skew tolerance/,
  );
  assert.ok(!lenient.hints.some((h) => /clock skew/i.test(h.title)));
});
