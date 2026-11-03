/**
 * Evaluates realm client policies against one exported client, the way
 * Keycloak's DefaultClientPolicyManager does, so findings can say whether a
 * policy actually covers the client instead of guessing.
 *
 * Mirrors Keycloak 26.x:
 * - A policy applies only when `enabled` is true (null counts as disabled).
 * - Conditions are ANDed. Each votes YES, NO or ABSTAIN for the event being
 *   handled; `is-negative-logic` swaps YES and NO. In the default mode ABSTAIN
 *   is skipped, in `STRICT` mode it fails the policy, and a policy needs at
 *   least one YES and no NO to apply. A policy without conditions never applies.
 * - Conditions vote per event: client-scopes only votes on requests that carry
 *   a scope parameter, grant-type only on token and authorization requests,
 *   and the client-updater-* conditions only when a client is created or saved.
 *
 * Erasable TypeScript only, so Node can run it without a build step.
 */

/** Tri-state for what we can tell from an export. */
export type Verdict = "yes" | "no" | "unknown";

/** A condition's vote, plus "unknown" when it depends on runtime data. */
export type Vote = "yes" | "no" | "abstain" | "unknown";

/**
 * The request an executor acts on. Each maps to the Keycloak client policy
 * event the executor handles:
 * - `authorization-code`: AUTHORIZATION_REQUEST with `response_type=code`
 * - `implicit`: AUTHORIZATION_REQUEST with an implicit or hybrid response type
 * - `password`: RESOURCE_OWNER_PASSWORD_CREDENTIALS_REQUEST
 * - `save`: REGISTER or UPDATE of the client (auto-configure, URI checks)
 */
export type PolicyEvent =
  "authorization-code" | "implicit" | "password" | "save";

export type ConditionResult = {
  condition: string;
  negative: boolean;
  vote: Vote;
  reason: string;
};

export type PolicyResult = {
  policy: string;
  enabled: boolean;
  strict: boolean;
  /** Executors this policy's profiles contain. */
  executors: string[];
  /** Profiles referenced by the policy that aren't in the export or built in. */
  missingProfiles: string[];
  applies: Verdict;
  conditions: ConditionResult[];
  /** A one-line explanation of `applies`. */
  summary: string;
};

export type Coverage = {
  verdict: Verdict;
  /** Policies that cover (or might cover) the client for this executor. */
  policies: string[];
  /** Why the verdict is unknown, when it is. */
  reasons: string[];
};

type Obj = Record<string, unknown>;

function isObject(v: unknown): v is Obj {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function list(v: unknown): string[] {
  if (Array.isArray(v))
    return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string" && v) return [v];
  return [];
}

function objs(v: unknown): Obj[] {
  return Array.isArray(v) ? v.filter(isObject) : [];
}

/**
 * Executors in Keycloak's built-in global profiles
 * (services/src/main/resources/keycloak-default-client-profiles.json). A
 * realm export lists only the realm's own profiles.
 */
export const GLOBAL_PROFILES: Record<string, string[]> = {
  "fapi-1-baseline": [
    "secure-session",
    "pkce-enforcer",
    "secure-client-authenticator",
    "secure-client-uris",
    "consent-required",
    "full-scope-disabled",
  ],
  "fapi-1-advanced": [
    "secure-session",
    "confidential-client",
    "secure-client-authenticator",
    "secure-client-uris",
    "secure-request-object",
    "secure-response-type",
    "secure-signature-algorithm",
    "secure-signature-algorithm-signed-jwt",
    "consent-required",
    "full-scope-disabled",
    "holder-of-key-enforcer",
  ],
  "fapi-ciba": [
    "secure-ciba-req-sig-algorithm",
    "secure-ciba-session",
    "secure-ciba-signed-authn-req",
  ],
  "fapi-2-security-profile": [
    "confidential-client",
    "secure-client-authenticator",
    "secure-client-uris",
    "secure-signature-algorithm",
    "secure-signature-algorithm-signed-jwt",
    "consent-required",
    "full-scope-disabled",
    "reject-implicit-grant",
    "holder-of-key-enforcer",
    "pkce-enforcer",
    "secure-client-authentication-assertion",
    "secure-par-content",
  ],
  "fapi-2-message-signing": [
    "confidential-client",
    "secure-client-authenticator",
    "secure-client-uris",
    "secure-signature-algorithm",
    "secure-signature-algorithm-signed-jwt",
    "consent-required",
    "full-scope-disabled",
    "reject-implicit-grant",
    "holder-of-key-enforcer",
    "pkce-enforcer",
    "secure-par-content",
    "secure-request-object",
    "secure-client-authentication-assertion",
  ],
  "fapi-2-dpop-security-profile": [
    "confidential-client",
    "secure-client-authenticator",
    "secure-client-uris",
    "secure-signature-algorithm",
    "secure-signature-algorithm-signed-jwt",
    "consent-required",
    "full-scope-disabled",
    "reject-implicit-grant",
    "pkce-enforcer",
    "secure-client-authentication-assertion",
    "secure-par-content",
    "dpop-bind-enforcer",
  ],
  "fapi-2-dpop-message-signing": [
    "confidential-client",
    "secure-client-authenticator",
    "secure-client-uris",
    "secure-signature-algorithm",
    "secure-signature-algorithm-signed-jwt",
    "consent-required",
    "full-scope-disabled",
    "reject-implicit-grant",
    "pkce-enforcer",
    "secure-par-content",
    "secure-request-object",
    "dpop-bind-enforcer",
    "secure-client-authentication-assertion",
  ],
  "oauth-2-1-for-confidential-client": [
    "confidential-client",
    "secure-client-authenticator",
    "secure-redirect-uris-enforcer",
    "pkce-enforcer",
    "holder-of-key-enforcer",
    "reject-implicit-grant",
    "reject-ropc-grant",
  ],
  "oauth-2-1-for-public-client": [
    "secure-redirect-uris-enforcer",
    "pkce-enforcer",
    "dpop-bind-enforcer",
    "reject-implicit-grant",
    "reject-ropc-grant",
  ],
  "saml-security-profile": [
    "saml-secure-client-uris",
    "saml-signature-enforcer",
    "saml-avoid-redirect",
  ],
};

/** Which event each executor we report on acts on. */
export const EXECUTOR_EVENT: Record<string, PolicyEvent> = {
  "pkce-enforcer": "authorization-code",
  "reject-implicit-grant": "implicit",
  "reject-ropc-grant": "password",
  "secure-redirect-uris-enforcer": "save",
};

/** Grant type names the grant-type condition compares against. */
const EVENT_GRANT: Record<Exclude<PolicyEvent, "save">, string> = {
  "authorization-code": "authorization_code",
  implicit: "implicit",
  password: "password",
};

/** Keycloak's ClientAccessTypeCondition: public wins over bearer-only. */
function accessType(c: Obj): string {
  if (c.publicClient === true) return "public";
  if (c.bearerOnly === true) return "bearer-only";
  return "confidential";
}

/** Client role names from a realm export (`roles.client[clientId]`), if present. */
function clientRoles(c: Obj, realm: Obj): string[] | undefined {
  const roles = isObject(realm.roles) ? realm.roles : undefined;
  const byClient = roles && isObject(roles.client) ? roles.client : undefined;
  if (!byClient || typeof c.clientId !== "string") return undefined;
  const mine = byClient[c.clientId];
  if (!Array.isArray(mine)) return [];
  return mine
    .map((r) =>
      isObject(r) && typeof r.name === "string" ? r.name : undefined,
    )
    .filter((n): n is string => !!n);
}

/**
 * The client-attributes condition stores its config as a JSON string of
 * `[{"key": ..., "value": ...}]` (MapperTypeSerializer). Accept the parsed form
 * too, in case a tool already decoded it.
 */
function attributePairs(
  v: unknown,
): { key: string; values: string[] }[] | undefined {
  let raw: unknown = v;
  if (typeof v === "string") {
    try {
      raw = JSON.parse(v);
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(raw)) {
    const grouped = new Map<string, string[]>();
    for (const p of raw) {
      if (!isObject(p) || typeof p.key !== "string") continue;
      const vals = grouped.get(p.key) ?? [];
      if (typeof p.value === "string") vals.push(p.value);
      grouped.set(p.key, vals);
    }
    return Array.from(grouped, ([key, values]) => ({ key, values }));
  }
  if (isObject(raw)) {
    return Object.entries(raw).map(([key, val]) => ({
      key,
      values: list(val),
    }));
  }
  return undefined;
}

/** One condition's vote for one event. */
export function evaluateCondition(
  cond: Obj,
  client: Obj,
  realm: Obj,
  event: PolicyEvent,
): ConditionResult {
  const name =
    typeof cond.condition === "string" ? cond.condition : "(unnamed)";
  const cfg = isObject(cond.configuration) ? cond.configuration : {};
  const negative =
    cfg["is-negative-logic"] === true || cfg["is-negative-logic"] === "true";
  const r = (vote: Vote, reason: string): ConditionResult => ({
    condition: name,
    negative,
    vote,
    reason,
  });
  const atSave = event === "save";

  switch (name) {
    case "any-client":
      return r("yes", "matches every client");

    case "client-access-type": {
      const types = list(cfg.type);
      const t = accessType(client);
      return types.includes(t)
        ? r("yes", `client is ${t}, which is in [${types.join(", ")}]`)
        : r("no", `client is ${t}, not in [${types.join(", ") || "none"}]`);
    }

    case "client-type": {
      // ClientProtocolCondition; the provider id is "client-type".
      const want =
        typeof cfg.protocol === "string" ? cfg.protocol : "openid-connect";
      const have =
        typeof client.protocol === "string"
          ? client.protocol
          : "openid-connect";
      return have === want
        ? r("yes", `protocol is ${have}`)
        : r("no", `protocol is ${have}, condition wants ${want}`);
    }

    case "client-roles": {
      const want = list(cfg.roles);
      if (want.length === 0)
        return r("no", "no roles configured, so nothing matches");
      const have = clientRoles(client, realm);
      if (have === undefined)
        return r(
          "unknown",
          "the condition checks the client's own roles, which this export doesn't include (export with roles to evaluate it)",
        );
      const hit = want.filter((x) => have.includes(x));
      return hit.length
        ? r("yes", `client has role ${hit.join(", ")}`)
        : r("no", `client has none of [${want.join(", ")}]`);
    }

    case "client-attributes": {
      const pairs = attributePairs(cfg.attributes);
      if (!pairs || pairs.length === 0)
        return r("no", "no attributes configured, so nothing matches");
      const attrs = isObject(client.attributes) ? client.attributes : {};
      for (const { key, values } of pairs) {
        if (values.length !== 1)
          return r(
            "no",
            `attribute ${key} has ${values.length} values configured; Keycloak can't match that`,
          );
        const actual = attrs[key];
        const actualStr = Array.isArray(actual)
          ? String(actual[0])
          : actual === undefined
            ? undefined
            : String(actual);
        if (actualStr !== values[0])
          return r(
            "no",
            `attribute ${key} is ${actualStr === undefined ? "not set" : `"${actualStr}"`}, not "${values[0]}"`,
          );
      }
      return r(
        "yes",
        `all attributes match (${pairs.map((p) => `${p.key}=${p.values[0]}`).join(", ")})`,
      );
    }

    case "client-scopes": {
      // Votes only on requests that carry a scope parameter.
      if (atSave)
        return r(
          "abstain",
          "only evaluated on requests with a scope parameter",
        );
      const want = list(cfg.scopes);
      const type = typeof cfg.type === "string" ? cfg.type : "Optional";
      const defaults = list(client.defaultClientScopes);
      const optional = list(client.optionalClientScopes);
      const inDefault = want.filter((s) => defaults.includes(s));
      const inOptional = want.filter((s) => optional.includes(s));
      if (type === "Default") {
        return inDefault.length
          ? r("yes", `default scope ${inDefault.join(", ")} matches`)
          : r(
              "no",
              `none of [${want.join(", ")}] is a default scope of this client`,
            );
      }
      if (type === "Optional" || type === "Any") {
        if (type === "Any" && inDefault.length)
          return r("yes", `default scope ${inDefault.join(", ")} matches`);
        return inOptional.length
          ? r(
              "unknown",
              `matches only when the request asks for optional scope ${inOptional.join(" or ")}`,
            )
          : r(
              "no",
              `none of [${want.join(", ")}] is ${type === "Any" ? "a default or optional" : "an optional"} scope of this client`,
            );
      }
      return r("no", `unknown scope type ${type}`);
    }

    case "grant-type": {
      if (atSave)
        return r(
          "abstain",
          "only evaluated on token and authorization requests",
        );
      const grants = list(cfg.grant_types);
      const g = EVENT_GRANT[event];
      return grants.includes(g)
        ? r("yes", `${g} is in [${grants.join(", ")}]`)
        : r("no", `${g} is not in [${grants.join(", ") || "none"}]`);
    }

    case "client-updater-source-host":
    case "client-updater-source-roles":
    case "client-updater-source-groups":
    case "client-updater-context":
      if (!atSave)
        return r("abstain", "only evaluated when a client is created or saved");
      return r(
        "unknown",
        "depends on who creates or saves the client, which an export can't show",
      );

    case "acr-condition":
      return atSave
        ? r("abstain", "only evaluated on authentication requests")
        : r(
            "unknown",
            "depends on the acr_values or claims the request asks for",
          );

    case "identity-provider-alias":
      return atSave
        ? r("abstain", "only evaluated on brokered requests")
        : r("unknown", "depends on which identity provider the request uses");

    default:
      return r("unknown", `the ${name} condition isn't evaluated by this tool`);
  }
}

/** Applies negation and Keycloak's DEFAULT / STRICT aggregation. */
export function combineVotes(
  conds: ConditionResult[],
  strict: boolean,
): { applies: Verdict; summary: string } {
  if (conds.length === 0)
    return {
      applies: "no",
      summary: "the policy has no conditions, so it never applies",
    };
  let yes = 0;
  const unknown: ConditionResult[] = [];
  for (const c of conds) {
    let v = c.vote;
    if (c.negative) v = v === "yes" ? "no" : v === "no" ? "yes" : v;
    if (v === "no")
      return {
        applies: "no",
        summary: `${c.condition}${c.negative ? " (negated)" : ""} doesn't match: ${c.reason}`,
      };
    if (v === "abstain") {
      if (strict)
        return {
          applies: "no",
          summary: `${c.condition} doesn't vote on this request, and the policy is in STRICT mode`,
        };
      continue;
    }
    if (v === "unknown") unknown.push(c);
    else yes++;
  }
  if (unknown.length)
    return {
      applies: "unknown",
      summary: unknown.map((c) => `${c.condition}: ${c.reason}`).join("; "),
    };
  if (yes === 0)
    return { applies: "no", summary: "no condition votes on this request" };
  return {
    applies: "yes",
    summary: conds
      .map(
        (c) => `${c.condition}${c.negative ? " (negated)" : ""}: ${c.reason}`,
      )
      .join("; "),
  };
}

function profileExecutors(realm: Obj): Map<string, string[]> {
  const out = new Map<string, string[]>(Object.entries(GLOBAL_PROFILES));
  const cp = isObject(realm.clientProfiles) ? realm.clientProfiles : {};
  for (const p of [...objs(cp.globalProfiles), ...objs(cp.profiles)]) {
    if (typeof p.name !== "string") continue;
    out.set(
      p.name,
      objs(p.executors)
        .map((e) => e.executor)
        .filter((e): e is string => typeof e === "string"),
    );
  }
  return out;
}

/** Every realm policy, evaluated for one client and one event. */
export function evaluatePolicies(
  client: Obj,
  realm: Obj | undefined,
  event: PolicyEvent,
): PolicyResult[] {
  if (!realm) return [];
  const cpol = isObject(realm.clientPolicies) ? realm.clientPolicies : {};
  const policies = [...objs(cpol.globalPolicies), ...objs(cpol.policies)];
  const profiles = profileExecutors(realm);
  return policies.map((p) => {
    const name = typeof p.name === "string" ? p.name : "(unnamed)";
    const enabled = p.enabled === true;
    const strict =
      typeof p.mode === "string" && p.mode.toUpperCase() === "STRICT";
    const executors: string[] = [];
    const missingProfiles: string[] = [];
    for (const prof of list(p.profiles)) {
      const ex = profiles.get(prof);
      if (ex) executors.push(...ex);
      else missingProfiles.push(prof);
    }
    const conditions = objs(p.conditions).map((c) =>
      evaluateCondition(c, client, realm, event),
    );
    if (!enabled) {
      return {
        policy: name,
        enabled,
        strict,
        executors,
        missingProfiles,
        applies: "no" as Verdict,
        conditions,
        summary: "the policy is disabled",
      };
    }
    const { applies, summary } = combineVotes(conditions, strict);
    return {
      policy: name,
      enabled,
      strict,
      executors,
      missingProfiles,
      applies,
      conditions,
      summary,
    };
  });
}

/** Whether any enabled policy enforces `executor` on this client. */
export function coverage(
  client: Obj,
  realm: Obj | undefined,
  executor: string,
): Coverage {
  const event = EXECUTOR_EVENT[executor] ?? "save";
  const results = evaluatePolicies(client, realm, event).filter((p) =>
    p.executors.includes(executor),
  );
  const yes = results.filter((p) => p.applies === "yes");
  if (yes.length)
    return { verdict: "yes", policies: yes.map((p) => p.policy), reasons: [] };
  const maybe = results.filter((p) => p.applies === "unknown");
  if (maybe.length)
    return {
      verdict: "unknown",
      policies: maybe.map((p) => p.policy),
      reasons: maybe.map((p) => p.summary),
    };
  return { verdict: "no", policies: [], reasons: [] };
}

/** Executors that at least one enabled policy uses, whatever its conditions. */
export function configuredExecutors(realm: Obj | undefined): Set<string> {
  const out = new Set<string>();
  if (!realm) return out;
  const profiles = profileExecutors(realm);
  const cpol = isObject(realm.clientPolicies) ? realm.clientPolicies : {};
  for (const p of [...objs(cpol.globalPolicies), ...objs(cpol.policies)]) {
    if (p.enabled !== true) continue;
    for (const prof of list(p.profiles))
      for (const e of profiles.get(prof) ?? []) out.add(e);
  }
  return out;
}
