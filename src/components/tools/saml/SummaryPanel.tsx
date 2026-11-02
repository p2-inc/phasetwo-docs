import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

import {
  ATTRIBUTE_NAME_FORMATS,
  AUTHN_CONTEXT_CLASSES,
  BINDINGS,
  explainStatusCode,
  lookup,
  NAMEID_FORMATS,
  SUBJECT_CONFIRMATION_METHODS,
  WELL_KNOWN_ATTRIBUTES,
  type AssertionSummary,
  type Explained,
  type Hint,
  type SamlSummary,
  type TimeCheck,
  type TimeState,
} from "./core/index.ts";
import { Card, DocLink, Mono } from "./ui";

const TYPE_LABEL: Record<string, string> = {
  AuthnRequest: "AuthnRequest — a login request from an SP to an IdP",
  Response: "Response — the IdP's answer to a login request",
  LogoutRequest: "LogoutRequest — asks the other party to end the session",
  LogoutResponse: "LogoutResponse — the answer to a logout request",
  ArtifactResolve: "ArtifactResolve — exchanges an artifact for a message",
  ArtifactResponse: "ArtifactResponse — carries a resolved artifact",
  AttributeQuery: "AttributeQuery — asks for a user's attributes",
  Assertion: "Assertion — a bare assertion, outside a Response",
  EntityDescriptor: "EntityDescriptor — SAML metadata",
  EntitiesDescriptor: "EntitiesDescriptor — a metadata aggregate",
};

function Row({
  label,
  value,
  explain,
  children,
}: {
  label: string;
  value?: string;
  explain?: Explained | string;
  children?: ReactNode;
}) {
  if (value === undefined && !children) return null;
  const e =
    typeof explain === "string"
      ? explain
      : explain
        ? `${explain.short} — ${explain.description}`
        : undefined;
  return (
    <tr className="border-b border-white/5 align-top last:border-0">
      <td className="w-44 py-1.5 pr-3 text-xs font-medium text-gray-400">
        {label}
      </td>
      <td className="py-1.5">
        {value !== undefined && <Mono>{value}</Mono>}
        {children}
        {e && <div className="mt-0.5 text-xs text-gray-500">{e}</div>}
      </td>
    </tr>
  );
}

function Table({ children }: { children: ReactNode }) {
  return (
    <table className="m-0 w-full border-collapse text-left">
      <tbody>{children}</tbody>
    </table>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500 first:mt-0">
      {children}
    </div>
  );
}

const yesNo = (v: boolean) => (v ? "yes" : "no");

function Badge({
  ok,
  children,
}: {
  ok: boolean | "warn";
  children: ReactNode;
}) {
  const cls =
    ok === true
      ? "border-green-400/30 bg-green-400/10 text-green-300"
      : ok === "warn"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : "border-white/10 bg-white/5 text-gray-300";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${cls}`}
    >
      {children}
    </span>
  );
}

const TIME_STYLE: Record<TimeState, { icon: string; cls: string }> = {
  ok: { icon: "mdi:check-circle", cls: "text-green-400" },
  expired: { icon: "mdi:close-circle", cls: "text-red-400" },
  "not-yet-valid": { icon: "mdi:clock-alert", cls: "text-amber-400" },
  info: { icon: "mdi:clock-outline", cls: "text-gray-400" },
  invalid: { icon: "mdi:alert", cls: "text-amber-400" },
};

function TimesTable({ times }: { times: TimeCheck[] }) {
  if (!times.length) return null;
  return (
    <div className="overflow-x-auto">
      <Table>
        {times.map((t, i) => (
          <tr
            key={i}
            className="border-b border-white/5 align-top last:border-0"
          >
            <td className="w-44 py-1.5 pr-3 text-xs font-medium text-gray-400">
              {t.label}
            </td>
            <td className="py-1.5">
              <div
                className={`flex items-center gap-1.5 text-sm ${TIME_STYLE[t.state].cls}`}
              >
                <Icon
                  icon={TIME_STYLE[t.state].icon}
                  className="size-4 shrink-0"
                />
                <span className="font-mono text-[0.8rem] text-white">
                  {t.value}
                </span>
                <span className="text-xs">({t.relative})</span>
              </div>
              {t.note && (
                <div className="mt-0.5 text-xs text-gray-500">{t.note}</div>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function AssertionBlock({
  a,
  index,
  total,
}: {
  a: AssertionSummary;
  index: number;
  total: number;
}) {
  const label = total > 1 ? `Assertion ${index + 1}` : "Assertion";
  return (
    <>
      <Sub>{label}</Sub>
      <Table>
        <Row label="ID" value={a.id} />
        <Row label="Issuer" value={a.issuer} />
        <Row label="Signed" value={yesNo(a.signed)} />
        {a.nameId && <Row label="NameID" value={a.nameId.value} />}
        {a.nameId && (
          <Row
            label="NameID Format"
            value={a.nameId.format ?? "(not set)"}
            explain={lookup(NAMEID_FORMATS, a.nameId.format)}
          />
        )}
        {a.nameId?.spNameQualifier && (
          <Row label="SPNameQualifier" value={a.nameId.spNameQualifier} />
        )}
        {a.encryptedNameId && (
          <Row label="NameID" value="(encrypted — EncryptedID)" />
        )}
        {a.subjectConfirmations.map((sc, i) => (
          <Row
            key={i}
            label="Subject confirmation"
            value={sc.method}
            explain={lookup(SUBJECT_CONFIRMATION_METHODS, sc.method)}
          >
            {(sc.recipient || sc.inResponseTo) && (
              <div className="mt-1 text-xs text-gray-400">
                {sc.recipient && (
                  <div>
                    Recipient: <Mono>{sc.recipient}</Mono>
                  </div>
                )}
                {sc.inResponseTo && (
                  <div>
                    InResponseTo: <Mono>{sc.inResponseTo}</Mono>
                  </div>
                )}
              </div>
            )}
          </Row>
        ))}
        {a.conditions && (
          <Row
            label="Audience"
            explain="The SP this assertion is for. It must equal the SP's entity ID exactly."
          >
            {a.conditions.audiences.length ? (
              a.conditions.audiences.map((x) => (
                <div key={x}>
                  <Mono>{x}</Mono>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-400">(none)</span>
            )}
          </Row>
        )}
        {a.conditions?.oneTimeUse && (
          <Row
            label="OneTimeUse"
            value="yes"
            explain="The SP must not cache or reuse this assertion."
          />
        )}
        {a.authnStatements.map((s, i) => (
          <Row
            key={i}
            label="Authentication"
            value={s.classRef ?? s.declRef ?? "(no context)"}
            explain={lookup(AUTHN_CONTEXT_CLASSES, s.classRef)}
          >
            {s.sessionIndex && (
              <div className="mt-1 text-xs text-gray-400">
                SessionIndex: <Mono>{s.sessionIndex}</Mono>
              </div>
            )}
          </Row>
        ))}
      </Table>
      {a.attributes.length > 0 && (
        <>
          <Sub>Attributes</Sub>
          <div className="overflow-x-auto">
            <table className="m-0 w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs text-gray-500">
                  <th className="py-1.5 pr-3 font-medium">Name</th>
                  <th className="py-1.5 font-medium">Value(s)</th>
                </tr>
              </thead>
              <tbody>
                {a.attributes.map((at, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 align-top last:border-0"
                  >
                    <td className="py-1.5 pr-3">
                      <Mono>{at.name}</Mono>
                      {(at.friendlyName || WELL_KNOWN_ATTRIBUTES[at.name]) && (
                        <div className="text-xs text-gray-500">
                          {[at.friendlyName, WELL_KNOWN_ATTRIBUTES[at.name]]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                      {at.nameFormat && (
                        <div
                          className="text-xs text-gray-600"
                          title={
                            lookup(ATTRIBUTE_NAME_FORMATS, at.nameFormat)
                              ?.description
                          }
                        >
                          {lookup(ATTRIBUTE_NAME_FORMATS, at.nameFormat)
                            ?.short ?? at.nameFormat}
                        </div>
                      )}
                    </td>
                    <td className="py-1.5">
                      {at.values.length ? (
                        at.values.map((v, j) => (
                          <div key={j}>
                            <Mono>{v}</Mono>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">
                          (no values)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {a.encryptedAttributeCount > 0 && (
        <p className="mb-0 mt-2 text-xs text-gray-400">
          {a.encryptedAttributeCount} encrypted attribute(s) cannot be shown.
        </p>
      )}
    </>
  );
}

export function SummaryPanel({
  summary,
  times,
}: {
  summary: SamlSummary;
  times: TimeCheck[];
}) {
  const s = summary;
  const statusTop = explainStatusCode(s.status?.code);
  const statusSub = explainStatusCode(s.status?.subCode);
  const success = s.status?.code?.endsWith(":Success");
  const isProtocol = ![
    "Assertion",
    "EntityDescriptor",
    "EntitiesDescriptor",
    "Unknown",
  ].includes(s.messageType);

  return (
    <Card title="Summary">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge ok>
          {s.messageType === "Unknown" ? s.rootName : s.messageType}
        </Badge>
        {s.status && (
          <Badge ok={success ? true : "warn"}>
            <Icon
              icon={success ? "mdi:check" : "mdi:alert"}
              className="size-3.5"
            />
            {statusTop?.short ?? s.status.code}
            {statusSub ? ` / ${statusSub.short}` : ""}
          </Badge>
        )}
        {isProtocol && (
          <Badge ok={s.messageSigned ? true : false}>
            {s.messageSigned ? "Message signed" : "Message not signed"}
          </Badge>
        )}
        {(s.assertions.length > 0 || s.messageType === "Response") && (
          <Badge ok={s.assertionSigned ? true : false}>
            {s.assertionSigned ? "Assertion signed" : "Assertion not signed"}
          </Badge>
        )}
        {s.encryptedAssertionCount > 0 && (
          <Badge ok="warn">Encrypted assertion</Badge>
        )}
      </div>

      {s.warnings.map((w, i) => (
        <div
          key={i}
          className="mb-2 flex items-start gap-1.5 text-sm text-amber-300"
        >
          <Icon icon="mdi:alert" className="mt-0.5 size-4 shrink-0" />
          <span>{w}</span>
        </div>
      ))}

      <Sub>Message</Sub>
      <Table>
        <Row
          label="Type"
          value={s.rootName}
          explain={TYPE_LABEL[s.messageType]}
        />
        <Row label="ID" value={s.id} />
        <Row
          label="InResponseTo"
          value={s.inResponseTo}
          explain="The ID of the request this answers."
        />
        <Row
          label="Issuer"
          value={s.issuer}
          explain="The entity ID of the sender."
        />
        <Row
          label="Destination"
          value={s.destination}
          explain="Where the sender intended the message to go. The receiver checks it against its own endpoint URL."
        />
        <Row
          label="ACS URL"
          value={s.assertionConsumerServiceURL}
          explain="AssertionConsumerServiceURL — where the SP wants the response posted."
        />
        <Row label="ACS index" value={s.assertionConsumerServiceIndex} />
        <Row
          label="ProtocolBinding"
          value={s.protocolBinding}
          explain={lookup(BINDINGS, s.protocolBinding)}
        />
        {s.nameIdPolicy && (
          <Row
            label="NameIDPolicy"
            value={s.nameIdPolicy.format ?? "(any format)"}
            explain={lookup(NAMEID_FORMATS, s.nameIdPolicy.format)}
          />
        )}
        {s.nameIdPolicy?.allowCreate && (
          <Row label="AllowCreate" value={s.nameIdPolicy.allowCreate} />
        )}
        {s.requestedAuthnContext && (
          <Row
            label="RequestedAuthnContext"
            value={`${s.requestedAuthnContext.comparison ?? "exact"}: ${s.requestedAuthnContext.classRefs.join(", ")}`}
          />
        )}
        <Row
          label="ForceAuthn"
          value={s.forceAuthn}
          explain={
            s.forceAuthn === "true"
              ? "The IdP must re-authenticate the user even with an existing session."
              : undefined
          }
        />
        <Row
          label="IsPassive"
          value={s.isPassive}
          explain={
            s.isPassive === "true"
              ? "The IdP must not show a login page; it fails with NoPassive if there is no session."
              : undefined
          }
        />
        {s.nameId && (
          <Row
            label="NameID"
            value={s.nameId.value}
            explain={lookup(NAMEID_FORMATS, s.nameId.format)}
          />
        )}
        {s.sessionIndexes.length > 0 && (
          <Row label="SessionIndex" value={s.sessionIndexes.join(", ")} />
        )}
        <Row label="Reason" value={s.reason} />
        {s.status && (
          <Row label="Status" value={s.status.code}>
            {statusTop && (
              <div className="mt-0.5 text-xs text-gray-500">
                {statusTop.description}
              </div>
            )}
            {s.status.subCode && (
              <div className="mt-1">
                <Mono>{s.status.subCode}</Mono>
                {statusSub && (
                  <div className="mt-0.5 text-xs text-gray-500">
                    {statusSub.description}
                  </div>
                )}
              </div>
            )}
            {s.status.message && (
              <div className="mt-1 text-xs text-gray-300">
                Message: “{s.status.message}”
              </div>
            )}
          </Row>
        )}
      </Table>

      {s.metadata && (
        <>
          <Sub>Metadata</Sub>
          <Table>
            <Row label="entityID" value={s.metadata.entityId} />
            {s.metadata.idp?.ssoServices.map((e, i) => (
              <Row
                key={`sso${i}`}
                label="SSO service"
                value={e.location}
                explain={lookup(BINDINGS, e.binding)?.short}
              />
            ))}
            {s.metadata.sp?.acsServices.map((e, i) => (
              <Row
                key={`acs${i}`}
                label="ACS"
                value={e.location}
                explain={lookup(BINDINGS, e.binding)?.short}
              />
            ))}
            {s.metadata.idp && (
              <Row
                label="IdP signing certs"
                value={String(s.metadata.idp.signingCertificates)}
              />
            )}
            {s.metadata.sp && (
              <Row
                label="SP signing certs"
                value={String(s.metadata.sp.signingCertificates)}
              />
            )}
          </Table>
        </>
      )}

      {s.signatures.length > 0 && (
        <>
          <Sub>Signatures</Sub>
          <Table>
            {s.signatures.map((sig, i) => (
              <Row
                key={i}
                label={`On <${sig.signedElement}>`}
                value={[
                  sig.signatureMethod.split("#").pop(),
                  sig.references[0]?.digestAlgorithm.split("#").pop(),
                  sig.canonicalizationMethod.split("/").pop(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </Table>
        </>
      )}

      {s.assertions.map((a, i) => (
        <AssertionBlock key={i} a={a} index={i} total={s.assertions.length} />
      ))}

      {times.length > 0 && (
        <>
          <Sub>Validity window</Sub>
          <TimesTable times={times} />
        </>
      )}
    </Card>
  );
}

const HINT_STYLE: Record<Hint["level"], { icon: string; cls: string }> = {
  error: {
    icon: "mdi:close-octagon",
    cls: "border-red-400/30 bg-red-400/[0.06] text-red-300",
  },
  warning: {
    icon: "mdi:alert",
    cls: "border-amber-400/30 bg-amber-400/[0.06] text-amber-300",
  },
  info: {
    icon: "mdi:information-outline",
    cls: "border-p2blue-500/20 bg-p2blue-500/[0.06] text-p2blue-300",
  },
};

export function HintsPanel({ hints }: { hints: Hint[] }) {
  if (!hints.length) return null;
  return (
    <Card title="Troubleshooting & Keycloak hints">
      <div className="flex flex-col gap-2.5">
        {hints.map((h, i) => (
          <div
            key={i}
            className={`rounded-xl border px-3.5 py-2.5 ${HINT_STYLE[h.level].cls}`}
          >
            <div className="flex items-start gap-1.5 text-sm font-semibold">
              <Icon
                icon={HINT_STYLE[h.level].icon}
                className="mt-0.5 size-4 shrink-0"
              />
              <span>{h.title}</span>
            </div>
            <p className="mb-0 mt-1 text-sm text-gray-300">{h.detail}</p>
            {h.links && h.links.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {h.links.map((l) => (
                  <DocLink key={l.href} link={l} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
