/**
 * Keycloak client security rule engine.
 *
 * Framework-free on purpose: no React, no DOM, no network. The page imports it,
 * and the unit tests run it directly under `node --test`. Keep this file to
 * erasable TypeScript syntax (no enums, namespaces or parameter properties) so
 * Node can strip the types without a build step.
 *
 * Field and attribute names follow Keycloak's `ClientRepresentation` and the
 * attribute constants in `OIDCConfigAttributes`, `SamlConfigAttributes`,
 * `OAuth2DeviceConfig` and `CibaConfig` (Keycloak 26.x).
 */

import {
  configuredExecutors,
  coverage,
  EXECUTOR_EVENT,
  type Coverage,
} from "./policies.ts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Category =
  | "secrets"
  | "redirects"
  | "origins"
  | "flows"
  | "authentication"
  | "scopes"
  | "tokens"
  | "logout"
  | "saml";

export type DocLink = { label: string; href: string };

export type Finding = {
  /** Stable rule id, e.g. `redirect-wildcard-all`. */
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  /** Plain-English explanation of the risk. */
  why: string;
  /** Where to change it in the Keycloak admin console. */
  where: string;
  /** What to change it to. */
  fix: string;
  /** The JSON field or attribute the finding is about. */
  field?: string;
  /** The offending values, if any. */
  values?: string[];
  docs?: DocLink[];
};

export type ClientRep = Record<string, unknown> & {
  clientId?: string;
  name?: string;
  protocol?: string;
  attributes?: Record<string, unknown>;
};

export type RealmSettings = Record<string, unknown> & { realm?: string };

export type ClientKind = "public" | "confidential" | "bearer-only" | "saml";

export type SecretState = "none" | "masked" | "plaintext";

export type FixChange = {
  path: string;
  from: unknown;
  to: unknown;
  note: string;
};

export type ClientResult = {
  clientId: string;
  name?: string;
  protocol: "openid-connect" | "saml";
  kind: ClientKind;
  enabled: boolean;
  builtIn: boolean;
  secret: SecretState;
  findings: Finding[];
  score: number;
  grade: string;
  counts: Record<Severity, number>;
  /** The redacted client, as pasted. */
  redacted: ClientRep;
  /** The redacted client with the safe fixes applied. */
  fixed: ClientRep;
  changes: FixChange[];
  /** Realm client policy coverage, when a realm export with policies was pasted. */
  policies: PolicyCoverage[];
};

export type PolicyCoverage = Coverage & {
  executor: string;
  /** What the executor does, in a few words. */
  label: string;
};

const POLICY_LABELS: Record<string, string> = {
  "pkce-enforcer": "Requires PKCE S256 on authorization requests",
  "reject-implicit-grant": "Rejects implicit and hybrid authorization requests",
  "reject-ropc-grant": "Rejects the password grant",
  "secure-redirect-uris-enforcer":
    "Rejects insecure redirect URIs when the client is saved",
};

export type ParsedInput =
  | {
      ok: true;
      source: "client" | "clients" | "realm";
      clients: ClientRep[];
      realm?: RealmSettings;
      /** Secret state of each client before masking, aligned with `clients`. */
      secretStates: SecretState[];
      /** True when the input contained at least one plaintext secret or key. */
      hadPlaintextSecrets: boolean;
      /** The input with every secret and private key masked. */
      redactedInput: unknown;
    }
  | { ok: false; error: string };

export type Analysis = {
  parsed: Extract<ParsedInput, { ok: true }>;
  realmFindings: Finding[];
  results: ClientResult[];
};

export type CheckOptions = {
  realm?: RealmSettings;
  /** Current time in milliseconds; injected so tests are deterministic. */
  now?: number;
  /** Secret state before masking, when the client was already redacted. */
  secretState?: SecretState;
};

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const SEVERITIES: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 40,
  high: 20,
  medium: 8,
  low: 3,
  info: 0,
};

export const CATEGORY_LABELS: Record<Category, string> = {
  secrets: "Secrets in the export",
  redirects: "Redirect URIs",
  origins: "Web origins",
  flows: "Grant types and flows",
  authentication: "Client authentication and PKCE",
  scopes: "Scopes and consent",
  tokens: "Token and session lifespans",
  logout: "Logout",
  saml: "SAML signing and encryption",
};

/** What Keycloak itself shows in place of a secret in a realm export. */
export const MASK = "**********";

/** Clients every realm is created with. */
export const BUILT_IN_CLIENTS = new Set([
  "account",
  "account-console",
  "admin-cli",
  "broker",
  "realm-management",
  "security-admin-console",
]);

const DOCS = {
  bcp: {
    label: "RFC 9700 for Keycloak",
    href: "/docs/security/oauth-security-bcp",
  },
  policies: {
    label: "Client Policies",
    href: "/docs/security/client-policies",
  },
  tokens: {
    label: "Tokens and Sessions",
    href: "/docs/security/tokens-and-sessions",
  },
  offline: {
    label: "Offline sessions",
    href: "/docs/security/tokens-and-sessions#offline-sessions",
  },
  rotation: {
    label: "Refresh token rotation",
    href: "/docs/security/tokens-and-sessions#refresh-token-rotation",
  },
  grants: {
    label: "Sign-in Methods and Grant Types",
    href: "/docs/authentication/sign-in-methods",
  },
  directGrant: {
    label: "The direct grant flow",
    href: "/docs/authentication/sign-in-methods#the-direct-grant-flow",
  },
  builtIn: {
    label: "Built-in clients",
    href: "/docs/authentication/sign-in-methods#built-in-clients",
  },
  builtInBlog: {
    label: "Which built-in clients to keep enabled",
    href: "/blog/keycloak-disable-admin-cli-account-clients",
  },
  serviceAccounts: {
    label: "Service Accounts",
    href: "/docs/api/service-accounts",
  },
  stuffing: {
    label: "Credential Stuffing",
    href: "/docs/security/credential-stuffing",
  },
  redirectBlog: {
    label: "How redirect URI matching works",
    href: "/blog/keycloak-invalid-redirect-uri",
  },
  dpop: {
    label: "DPoP and mTLS",
    href: "/docs/security/oauth-security-bcp#how-do-you-sender-constrain-tokens-with-dpop-or-mtls",
  },
  saml: {
    label: "SAML, simplified",
    href: "/blog/introduction-to-simple-saml",
  },
  hardening: {
    label: "Securing Keycloak in Production",
    href: "/docs/security",
  },
} satisfies Record<string, DocLink>;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const SECRET_ATTRIBUTES = [
  "saml.signing.private.key",
  "saml.encryption.private.key",
  "client.secret.rotated",
];

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function strList(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];
}

function attr(c: ClientRep, key: string): string | undefined {
  const a = c.attributes;
  if (!isObject(a)) return undefined;
  const v = a[key];
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(v)) return v.length ? String(v[0]) : undefined;
  return String(v);
}

function attrTrue(c: ClientRep, key: string): boolean {
  return attr(c, key) === "true";
}

/** Keycloak attribute booleans default to false when absent. */
function bool(c: ClientRep, key: string, dflt = false): boolean {
  const v = c[key];
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return dflt;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))
    return Number(v);
  return undefined;
}

/** Human-readable duration from seconds: `2 hours`, `30 days`. */
export function formatSeconds(s: number): string {
  if (s <= 0) return `${s} seconds`;
  const units: [number, string][] = [
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    if (s >= size && s % size === 0) {
      const n = s / size;
      return `${n} ${name}${n === 1 ? "" : "s"}`;
    }
  }
  if (s >= 3600) return `${(s / 3600).toFixed(1)} hours`;
  if (s >= 60) return `${Math.round(s / 60)} minutes`;
  return `${s} seconds`;
}

export function isMasked(v: unknown): boolean {
  return typeof v === "string" && /^\*+$/.test(v);
}

/* ------------------------------------------------------------------ */
/* URI classification                                                  */
/* ------------------------------------------------------------------ */

export type UriIssue =
  | "full-wildcard"
  | "root-wildcard"
  | "path-wildcard"
  | "wildcard-host"
  | "http"
  | "loopback-http"
  | "relative"
  | "custom-scheme";

/**
 * Classifies one registered redirect URI the way Keycloak's RedirectUtils
 * treats it: `*` matches everything, a trailing `*` is a prefix match, and a
 * `*` anywhere else is a literal character (so `https://*.example.com/` never
 * matches a real subdomain).
 */
export function classifyUri(raw: string): UriIssue[] {
  const uri = raw.trim();
  const issues: UriIssue[] = [];
  if (uri === "*") return ["full-wildcard"];
  if (uri === "+" || uri === "-") return [];

  const trailingWildcard =
    uri.endsWith("*") && !uri.includes("?") && !uri.includes("#");

  if (uri.startsWith("/")) {
    issues.push("relative");
    if (trailingWildcard && /^\/\*$/.test(uri)) issues.push("root-wildcard");
    else if (trailingWildcard) issues.push("path-wildcard");
    return issues;
  }

  const m = /^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?([^/?#]*)([^?#]*)/.exec(uri);
  if (!m) return issues;
  const scheme = m[1].toLowerCase();
  if (
    (scheme === "http" || scheme === "https") &&
    /^\*(:\d+)?$/.test(m[3] ?? "")
  )
    return ["full-wildcard"];
  // `https://host*` puts the wildcard in the authority; it's still a prefix.
  const authority = (m[3] ?? "").replace(/\*$/, (star) =>
    trailingWildcard && !m[4] ? "" : star,
  );
  const path = m[4] ?? "";

  if (scheme !== "http" && scheme !== "https") {
    issues.push("custom-scheme");
    if (trailingWildcard) issues.push("path-wildcard");
    return issues;
  }

  const host = authority
    .replace(/^[^@]*@/, "")
    .replace(/:(\d+|\*)$/, "")
    .toLowerCase();

  if (host === "*" || authority === "*") return ["full-wildcard"];
  if (host.includes("*")) issues.push("wildcard-host");

  if (scheme === "http") {
    issues.push(LOOPBACK_HOSTS.has(host) ? "loopback-http" : "http");
  }

  if (trailingWildcard) {
    // `https://host*` and `https://host/*` both match every path on the host.
    if (path === "" || path === "*" || path === "/*") {
      issues.push("root-wildcard");
    } else {
      issues.push("path-wildcard");
    }
  }
  return issues;
}

function splitPostLogout(v: string | undefined): string[] {
  if (!v) return [];
  return v
    .split("##")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Input parsing and redaction                                         */
/* ------------------------------------------------------------------ */

function looksLikeClient(v: unknown): v is ClientRep {
  return (
    isObject(v) &&
    typeof v.clientId === "string" &&
    !("realm" in v && "clients" in v)
  );
}

/**
 * Deep-copies a client and masks every secret it carries. Returns whether any
 * plaintext secret was found.
 */
export function redactClient(c: ClientRep): {
  client: ClientRep;
  plaintext: boolean;
  state: SecretState;
} {
  const copy = JSON.parse(JSON.stringify(c)) as ClientRep;
  let plaintext = false;
  let masked = false;
  for (const key of ["secret", "registrationAccessToken"]) {
    const v = copy[key];
    if (typeof v === "string" && v.length > 0) {
      if (isMasked(v)) masked = true;
      else {
        plaintext = true;
        copy[key] = MASK;
      }
    }
  }
  if (isObject(copy.attributes)) {
    for (const key of SECRET_ATTRIBUTES) {
      const v = copy.attributes[key];
      if (typeof v === "string" && v.length > 0) {
        if (isMasked(v)) masked = true;
        else {
          plaintext = true;
          copy.attributes[key] = MASK;
        }
      }
    }
  }
  return {
    client: copy,
    plaintext,
    state: plaintext ? "plaintext" : masked ? "masked" : "none",
  };
}

/** Parses pasted text: one client, an array of clients, or a realm export. */
export function parseInput(text: string): ParsedInput {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Paste a client or realm export." };
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch (e) {
    return {
      ok: false,
      error: `That is not valid JSON: ${(e as Error).message}`,
    };
  }

  // Some tools wrap a realm export in an array of realms.
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    isObject(data[0]) &&
    "realm" in data[0] &&
    Array.isArray((data[0] as Record<string, unknown>).clients)
  ) {
    data = data[0];
  }

  let source: "client" | "clients" | "realm";
  let rawClients: unknown[];
  let realm: RealmSettings | undefined;

  if (isObject(data) && Array.isArray(data.clients)) {
    source = "realm";
    rawClients = data.clients;
    const { clients: _omit, ...rest } = data;
    realm = rest as RealmSettings;
  } else if (Array.isArray(data)) {
    source = "clients";
    rawClients = data;
  } else if (looksLikeClient(data)) {
    source = "client";
    rawClients = [data];
  } else {
    return {
      ok: false,
      error:
        "This JSON doesn't look like a Keycloak client. Expected an object with a clientId, an array of clients, or a realm export with a clients array.",
    };
  }

  const clients: ClientRep[] = [];
  const secretStates: SecretState[] = [];
  let hadPlaintextSecrets = false;
  for (const rc of rawClients) {
    if (!looksLikeClient(rc)) continue;
    const r = redactClient(rc);
    if (r.plaintext) hadPlaintextSecrets = true;
    clients.push(r.client);
    secretStates.push(r.state);
  }
  if (clients.length === 0) {
    return { ok: false, error: "No clients with a clientId were found." };
  }

  // Realm exports from kc.sh carry the realm's own keys in components.
  let redactedRealm = realm;
  if (realm) {
    redactedRealm = JSON.parse(JSON.stringify(realm)) as RealmSettings;
    const comps = (redactedRealm as Record<string, unknown>).components;
    if (isObject(comps)) {
      for (const list of Object.values(comps)) {
        if (!Array.isArray(list)) continue;
        for (const comp of list) {
          const cfg = isObject(comp) ? comp.config : undefined;
          if (!isObject(cfg)) continue;
          for (const k of ["privateKey", "secret", "bindCredential"]) {
            const v = cfg[k];
            const first = Array.isArray(v) ? v[0] : v;
            if (typeof first === "string" && first && !isMasked(first)) {
              hadPlaintextSecrets = true;
              cfg[k] = [MASK];
            }
          }
        }
      }
    }
  }

  const redactedInput =
    source === "realm"
      ? { ...redactedRealm, clients }
      : source === "clients"
        ? clients
        : clients[0];

  return {
    ok: true,
    source,
    clients,
    realm: redactedRealm,
    secretStates,
    hadPlaintextSecrets,
    redactedInput,
  };
}

/* ------------------------------------------------------------------ */
/* Realm client policies                                               */
/* ------------------------------------------------------------------ */

function strListObj(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? v.filter(isObject) : [];
}

/* ------------------------------------------------------------------ */
/* Client checks                                                       */
/* ------------------------------------------------------------------ */

type Ctx = {
  c: ClientRep;
  clientId: string;
  kind: ClientKind;
  isSaml: boolean;
  builtIn: boolean;
  realm?: RealmSettings;
  /** Whether realm client policies enforce an executor on this client. */
  policy: (executor: string) => Coverage;
  now: number;
  out: Finding[];
};

/** Sentence describing a policy that covers, or might cover, the client. */
function policyNote(cov: Coverage, executor: string, effect: string): string {
  const names = cov.policies.map((p) => `"${p}"`).join(", ");
  if (cov.verdict === "yes")
    return ` Realm client policy ${names} applies to this client and uses \`${executor}\`, so ${effect}.`;
  if (cov.verdict === "unknown")
    return ` Realm client policy ${names} uses \`${executor}\` and may cover this client, but that can't be determined from the export (${cov.reasons.join("; ")}).`;
  return "";
}

function add(ctx: Ctx, f: Finding) {
  ctx.out.push(f);
}

function clientKind(c: ClientRep): ClientKind {
  if (c.protocol === "saml") return "saml";
  if (bool(c, "bearerOnly")) return "bearer-only";
  return bool(c, "publicClient") ? "public" : "confidential";
}

function checkSecrets(ctx: Ctx, secret: SecretState) {
  if (secret !== "plaintext") return;
  add(ctx, {
    id: "secret-in-export",
    severity: "info",
    category: "secrets",
    title: "The export contains a live client secret or private key",
    why: "Exports from the admin console's Export action and from the Admin REST API include the client secret in plain text (a realm partial export masks it). Anyone who has that file can authenticate as this client. This page masked it and never stores it, but the original file still holds it.",
    where: `Clients → ${ctx.clientId} → Credentials`,
    fix: "Delete stray copies of the export. If the file was shared, committed or attached to a ticket, click Regenerate on the Credentials tab and update the application.",
    field: "secret",
    docs: [DOCS.hardening],
  });
}

function uriFindings(
  ctx: Ctx,
  uris: string[],
  label: "redirect" | "post-logout",
) {
  const isPost = label === "post-logout";
  const fieldName = isPost
    ? "attributes.post.logout.redirect.uris"
    : "redirectUris";
  const uiField = isPost
    ? "Valid post logout redirect URIs"
    : ctx.isSaml
      ? "Valid redirect URIs (used to validate the Assertion Consumer Service URL)"
      : "Valid redirect URIs";
  const where = `Clients → ${ctx.clientId} → Settings → Access settings → ${uiField}`;
  const prefix = isPost ? "post-logout-" : "redirect-";
  const what = isPost
    ? "post-logout redirect URI"
    : ctx.isSaml
      ? "ACS / redirect URI"
      : "redirect URI";
  const builtInNote = ctx.builtIn
    ? " This is a built-in client that Keycloak registers this way; its relative wildcard is resolved against the Keycloak host itself. Leave it unless you have a reason to change it, and on a Phase Two hosted cluster keep security-admin-console unchanged."
    : "";
  // secure-redirect-uris-enforcer checks registrations only when the client is
  // saved; wildcards registered before the policy keep matching.
  const uriCov =
    !isPost && !ctx.isSaml
      ? ctx.policy("secure-redirect-uris-enforcer")
      : undefined;
  const uriNote =
    uriCov && uriCov.verdict !== "no"
      ? policyNote(
          uriCov,
          "secure-redirect-uris-enforcer",
          "the client can't be saved with this wildcard, but Keycloak doesn't re-check registrations made before the policy, so it keeps matching until you replace it",
        )
      : "";

  const buckets: Record<UriIssue, string[]> = {
    "full-wildcard": [],
    "root-wildcard": [],
    "path-wildcard": [],
    "wildcard-host": [],
    http: [],
    "loopback-http": [],
    relative: [],
    "custom-scheme": [],
  };
  for (const u of uris) for (const i of classifyUri(u)) buckets[i].push(u);

  if (buckets["full-wildcard"].length) {
    add(ctx, {
      id: `${prefix}wildcard-all`,
      severity: isPost ? "high" : "critical",
      category: "redirects",
      title: `A ${what} of \`*\` accepts any URL`,
      why: isPost
        ? "After logout Keycloak will redirect the browser to any URL an attacker puts in the link, which makes your login domain an open redirector for phishing."
        : "Keycloak will send authorization codes, and tokens if the implicit flow is on, to any URL an attacker puts in the login link. That is a direct path to account takeover.",
      where,
      fix: "Replace `*` with the exact callback URLs of your application, for example `https://app.example.com/callback`.",
      field: fieldName,
      values: buckets["full-wildcard"],
      docs: [DOCS.bcp, DOCS.redirectBlog],
    });
  }
  const rootWild = buckets["root-wildcard"];
  const pathWild = buckets["path-wildcard"].filter(
    (u) => !rootWild.includes(u),
  );
  if (rootWild.length) {
    add(ctx, {
      id: `${prefix}wildcard-root`,
      severity: ctx.builtIn ? "info" : isPost ? "medium" : "high",
      category: "redirects",
      title: `Wildcard ${what} matches every path on the host`,
      why:
        "A trailing `*` is a prefix match. Any page on that host, including an open redirect or a page with user content, becomes a valid place to deliver authorization codes. RFC 9700 requires exact string matching." +
        builtInNote +
        uriNote,
      where,
      fix: "List the exact callback URLs instead of `host/*`. A client policy with the `secure-redirect-uris-enforcer` executor stops new wildcards from being saved.",
      field: fieldName,
      values: rootWild,
      docs: [DOCS.bcp, DOCS.redirectBlog, DOCS.policies],
    });
  }
  if (pathWild.length) {
    add(ctx, {
      id: `${prefix}wildcard-path`,
      severity: ctx.builtIn ? "info" : isPost ? "low" : "medium",
      category: "redirects",
      title: `Wildcard ${what} under a path`,
      why:
        "A trailing `*` accepts every URL that starts with the prefix, not only your callback. It is narrower than a whole-host wildcard, but RFC 9700 still requires exact matching." +
        builtInNote +
        uriNote,
      where,
      fix: "Replace the wildcard with the full callback URLs.",
      field: fieldName,
      values: pathWild,
      docs: [DOCS.bcp, DOCS.redirectBlog],
    });
  }
  if (buckets["wildcard-host"].length) {
    add(ctx, {
      id: `${prefix}wildcard-host`,
      severity: "low",
      category: "redirects",
      title: `Subdomain wildcard in a ${what} does not work`,
      why: "Keycloak only supports a `*` at the very end of a URI. A `*` in the host name is compared literally, so `https://*.example.com/` never matches a real subdomain. The entry is dead configuration that suggests the client is relying on something it isn't getting.",
      where,
      fix: "Register each subdomain's callback URL explicitly.",
      field: fieldName,
      values: buckets["wildcard-host"],
      docs: [DOCS.redirectBlog],
    });
  }
  if (buckets.http.length) {
    add(ctx, {
      id: `${prefix}http`,
      severity: isPost ? "medium" : "high",
      category: "redirects",
      title: `Plain \`http://\` ${what} on a non-loopback host`,
      why: isPost
        ? "The browser is sent back over an unencrypted connection, where it can be intercepted or rewritten."
        : "Authorization codes delivered over plain HTTP can be read by anyone on the network path. RFC 9700 allows `http` only for native apps' loopback redirects.",
      where,
      fix: "Change the URIs to `https://`.",
      field: fieldName,
      values: buckets.http,
      docs: [DOCS.bcp],
    });
  }
  if (buckets["loopback-http"].length) {
    add(ctx, {
      id: `${prefix}loopback`,
      severity: "low",
      category: "redirects",
      title: `Local development ${what}`,
      why: "`http://localhost` entries are usually left over from development. On a production client they let anything listening on a user's machine receive codes. Native apps should use `http://127.0.0.1` without a port, which Keycloak matches with any port as RFC 8252 describes.",
      where,
      fix: "Remove localhost entries from production clients, or use a separate client for development.",
      field: fieldName,
      values: buckets["loopback-http"],
      docs: [DOCS.bcp],
    });
  }
}

function checkRedirects(ctx: Ctx) {
  const { c } = ctx;
  const redirects = strList(c.redirectUris);
  const standard = ctx.isSaml || bool(c, "standardFlowEnabled", true);
  const implicit = bool(c, "implicitFlowEnabled");
  const needsRedirects = ctx.kind !== "bearer-only" && (standard || implicit);

  if (needsRedirects && !ctx.isSaml && redirects.length === 0) {
    add(ctx, {
      id: "redirect-missing",
      severity: "low",
      category: "redirects",
      title: "Standard flow is on but no redirect URIs are registered",
      why: "Every browser login for this client fails with `Invalid parameter: redirect_uri`. Either the flow is unused and should be off, or the client is incomplete.",
      where: `Clients → ${ctx.clientId} → Settings → Access settings → Valid redirect URIs`,
      fix: "Add the exact callback URLs, or turn off Standard flow under Capability config if the client doesn't sign users in.",
      field: "redirectUris",
      docs: [DOCS.redirectBlog],
    });
  }
  if (needsRedirects) uriFindings(ctx, redirects, "redirect");

  if (!ctx.isSaml && needsRedirects) {
    const post = splitPostLogout(attr(c, "post.logout.redirect.uris"));
    const explicit = post.filter((u) => u !== "+" && u !== "-");
    uriFindings(ctx, explicit, "post-logout");
    if (post.includes("+")) {
      const inherited = redirects.filter((u) =>
        classifyUri(u).some((i) =>
          ["full-wildcard", "root-wildcard", "path-wildcard"].includes(i),
        ),
      );
      if (inherited.length && !ctx.builtIn) {
        add(ctx, {
          id: "post-logout-inherits-wildcards",
          severity: "low",
          category: "redirects",
          title: "Post-logout redirect URIs inherit wildcard redirect URIs",
          why: '`+` in Valid post logout redirect URIs means "the same as Valid redirect URIs", so every wildcard there also applies after logout.',
          where: `Clients → ${ctx.clientId} → Settings → Logout settings → Valid post logout redirect URIs`,
          fix: "Replace `+` with the exact page users should land on after signing out.",
          field: "attributes.post.logout.redirect.uris",
          values: inherited,
          docs: [DOCS.redirectBlog],
        });
      }
    }
  }

  if (ctx.isSaml) {
    const acs = [
      "saml_assertion_consumer_url_post",
      "saml_assertion_consumer_url_redirect",
      "saml_artifact_binding_url",
    ]
      .map((k) => attr(c, k))
      .filter((v): v is string => !!v);
    const badAcs = acs.filter((u) => classifyUri(u).includes("http"));
    if (badAcs.length) {
      add(ctx, {
        id: "saml-acs-http",
        severity: "high",
        category: "saml",
        title: "Assertion Consumer Service URL uses plain HTTP",
        why: "The signed SAML response, which is the user's login, is posted over an unencrypted connection and can be captured and replayed.",
        where: `Clients → ${ctx.clientId} → Advanced → Fine Grain SAML Endpoint Configuration`,
        fix: "Use `https://` for every ACS URL.",
        field: "attributes.saml_assertion_consumer_url_post",
        values: badAcs,
        docs: [DOCS.saml],
      });
    }
    if (acs.length === 0 && redirects.length === 0) {
      add(ctx, {
        id: "saml-acs-missing",
        severity: "low",
        category: "saml",
        title: "No ACS URL and no valid redirect URIs",
        why: "Keycloak has nothing to validate the service provider's requested Assertion Consumer Service URL against, and IdP-initiated login has nowhere to post.",
        where: `Clients → ${ctx.clientId} → Settings → Valid redirect URIs, and Advanced → Fine Grain SAML Endpoint Configuration`,
        fix: "Set the ACS POST binding URL to the service provider's exact endpoint.",
        field: "attributes.saml_assertion_consumer_url_post",
      });
    }
  }
}

function checkOrigins(ctx: Ctx) {
  if (ctx.isSaml || ctx.kind === "bearer-only") return;
  const origins = strList(ctx.c.webOrigins);
  const where = `Clients → ${ctx.clientId} → Settings → Access settings → Web origins`;
  if (origins.includes("*")) {
    add(ctx, {
      id: "origins-wildcard",
      severity: ctx.kind === "public" ? "high" : "medium",
      category: "origins",
      title: "Web origins allow `*`",
      why: "Keycloak returns CORS headers to any website for this client's requests, so a script on any origin can call the token, userinfo and logout endpoints with the client's tokens. Combined with a stolen code or token, nothing in the browser stops it being used from an attacker's page.",
      where,
      fix: "Use `+` to allow only the origins of your redirect URIs, or list the exact origins (scheme, host and port, no path).",
      field: "webOrigins",
      values: ["*"],
      docs: [DOCS.bcp],
    });
  }
  const httpOrigins = origins.filter((o) => classifyUri(o).includes("http"));
  if (httpOrigins.length) {
    add(ctx, {
      id: "origins-http",
      severity: "medium",
      category: "origins",
      title: "Plain `http://` web origin on a non-loopback host",
      why: "Tokens returned to an http page can be read or altered in transit, and a network attacker can inject script into the page that then calls Keycloak with CORS allowed.",
      where,
      fix: "Serve the application over https and list the `https://` origin.",
      field: "webOrigins",
      values: httpOrigins,
    });
  }
  const hostWild = origins.filter((o) => o !== "*" && o.includes("*"));
  if (hostWild.length) {
    add(ctx, {
      id: "origins-wildcard-host",
      severity: "low",
      category: "origins",
      title: "Wildcard web origin does not work",
      why: "Keycloak compares web origins exactly; `*` is only meaningful on its own. `https://*.example.com` never matches a real origin.",
      where,
      fix: "List each origin explicitly, or use `+`.",
      field: "webOrigins",
      values: hostWild,
    });
  }
  if (origins.includes("+")) {
    const redirects = strList(ctx.c.redirectUris);
    const insecure = redirects.filter((u) => {
      const i = classifyUri(u);
      return i.includes("http") || i.includes("full-wildcard");
    });
    if (insecure.length) {
      add(ctx, {
        id: "origins-plus-inherits",
        severity: "low",
        category: "origins",
        title: "`+` web origin inherits weak redirect URIs",
        why: "`+` allows the origin of every valid redirect URI. That's the right default, but here it carries over `http://` or `*` entries from the redirect URIs.",
        where,
        fix: "Fix the redirect URIs; the web origins follow.",
        field: "webOrigins",
        values: insecure,
      });
    }
  }
}

function checkFlows(ctx: Ctx) {
  if (ctx.isSaml) {
    if (attrTrue(ctx.c, "saml.allow.ecp.flow")) {
      add(ctx, {
        id: "saml-ecp",
        severity: "low",
        category: "saml",
        title: "SAML ECP flow is allowed",
        why: "The Enhanced Client or Proxy profile sends the user's password to Keycloak through the service provider with basic authentication, outside the browser flow, so CAPTCHA, passkeys and second factors in the browser flow do not apply.",
        where: `Clients → ${ctx.clientId} → Settings → SAML capabilities → Allow ECP flow`,
        fix: "Turn it off unless a non-browser SAML client depends on it.",
        field: "attributes.saml.allow.ecp.flow",
        docs: [DOCS.grants],
      });
    }
    if (attr(ctx.c, "saml_idp_initiated_sso_url_name")) {
      add(ctx, {
        id: "saml-idp-initiated",
        severity: "info",
        category: "saml",
        title: "IdP-initiated SSO is enabled",
        why: "Unsolicited SAML responses can't be tied to a request the service provider made, so the SP can't detect a response injected into a victim's browser (login CSRF). Most SPs support it; make sure this one is meant to.",
        where: `Clients → ${ctx.clientId} → Settings → IDP-Initiated SSO URL name`,
        fix: "Clear the field if users always start at the service provider.",
        field: "attributes.saml_idp_initiated_sso_url_name",
        values: [attr(ctx.c, "saml_idp_initiated_sso_url_name") as string],
      });
    }
    return;
  }
  if (ctx.kind === "bearer-only") return;
  const { c, clientId } = ctx;
  const capability = `Clients → ${clientId} → Settings → Capability config`;

  if (bool(c, "implicitFlowEnabled")) {
    const cov = ctx.policy("reject-implicit-grant");
    add(ctx, {
      id: "flow-implicit",
      severity: cov.verdict === "yes" ? "low" : "high",
      category: "flows",
      title: "Implicit flow is enabled",
      why:
        "The implicit flow returns access tokens in the URL fragment, where they leak through browser history, referrers and logs, and it can't use PKCE or refresh token rotation. RFC 9700 says not to use it." +
        policyNote(
          cov,
          "reject-implicit-grant",
          "implicit and hybrid requests are rejected even though the switch is on. Turn it off anyway so the client doesn't depend on the policy",
        ),
      where: `${capability} → Implicit flow`,
      fix: "Turn off Implicit flow and use the authorization code flow with PKCE S256.",
      field: "implicitFlowEnabled",
      docs: [DOCS.bcp, DOCS.policies],
    });
  }

  if (bool(c, "directAccessGrantsEnabled")) {
    const cov = ctx.policy("reject-ropc-grant");
    add(ctx, {
      id: "flow-direct-access",
      severity: cov.verdict === "yes" ? "low" : "high",
      category: "flows",
      title: "Direct access grants (password grant) are enabled",
      why:
        "The client can trade a username and password for tokens at the token endpoint. That path runs only the direct grant flow, so CAPTCHA, passkeys, identity provider redirects and most second factors don't apply, and it's the first path credential-stuffing tools try. RFC 9700 says it must not be used." +
        (clientId === "admin-cli"
          ? " `admin-cli` has it on by default and its client ID is known to every attacker."
          : "") +
        policyNote(
          cov,
          "reject-ropc-grant",
          "password grant requests are rejected even though the switch is on. Turn it off anyway so the client doesn't depend on the policy",
        ),
      where: `${capability} → Direct access grants`,
      fix: "Turn off Direct access grants. Move backend integrations to a confidential client with Service account roles (client credentials), and reject the grant realm-wide with a client policy.",
      field: "directAccessGrantsEnabled",
      docs: [DOCS.directGrant, DOCS.stuffing, DOCS.serviceAccounts],
    });
  }

  if (attrTrue(c, "oauth2.device.authorization.grant.enabled")) {
    add(ctx, {
      id: "flow-device",
      severity: "medium",
      category: "flows",
      title: "OAuth 2.0 Device Authorization Grant is enabled",
      why:
        "The device flow is for TVs, CLIs and other input-constrained devices. When it's on for an ordinary app it's a ready-made phishing tool: an attacker starts a device login and sends the victim a real Keycloak page and code to approve." +
        (ctx.kind === "public"
          ? " On a public client no client secret is needed to start it."
          : ""),
      where: `${capability} → OAuth 2.0 Device Authorization Grant`,
      fix: "Turn it off unless this client is a device or CLI that needs it.",
      field: "attributes.oauth2.device.authorization.grant.enabled",
      docs: [DOCS.grants],
    });
  }

  if (attrTrue(c, "oidc.ciba.grant.enabled")) {
    add(ctx, {
      id: "flow-ciba",
      severity: "medium",
      category: "flows",
      title: "OIDC CIBA grant is enabled",
      why: "Client-initiated backchannel authentication lets the client start a login for a user without a browser, relying on an external authentication device. It's rarely needed and easy to leave on by accident.",
      where: `${capability} → OIDC CIBA Grant`,
      fix: "Turn it off unless you run a backchannel authentication provider for this client.",
      field: "attributes.oidc.ciba.grant.enabled",
      docs: [DOCS.grants],
    });
  }

  if (attrTrue(c, "standard.token.exchange.enabled")) {
    add(ctx, {
      id: "flow-token-exchange",
      severity: "low",
      category: "flows",
      title: "Standard token exchange is enabled",
      why: "Token exchange lets this client trade a user's token for another one. That's useful for service-to-service calls on a user's behalf, but a compromised client can then reach every audience it is allowed to exchange into.",
      where: `${capability} → Standard Token Exchange`,
      fix: "Keep it only on services that need it, and restrict the audiences they can request.",
      field: "attributes.standard.token.exchange.enabled",
      docs: [DOCS.grants],
    });
  }

  if (bool(c, "serviceAccountsEnabled")) {
    if (ctx.kind === "public") {
      add(ctx, {
        id: "flow-service-account-public",
        severity: "medium",
        category: "flows",
        title: "Service accounts on a public client",
        why: "Client credentials needs a client that can authenticate. A public client has no secret, so the setting is invalid: either it does nothing, or the client was meant to be confidential.",
        where: `${capability} → Service account roles`,
        fix: "Turn off Service account roles, or turn on Client authentication if this is a backend service.",
        field: "serviceAccountsEnabled",
        docs: [DOCS.serviceAccounts],
      });
    } else if (
      bool(c, "standardFlowEnabled", true) ||
      bool(c, "directAccessGrantsEnabled")
    ) {
      add(ctx, {
        id: "flow-service-account-mixed",
        severity: "low",
        category: "flows",
        title: "One client both signs users in and acts as a service account",
        why: "The same secret now unlocks the service account's roles as well as user logins, and the two can't be rotated, scoped or disabled independently.",
        where: `${capability} → Service account roles`,
        fix: "Split the machine-to-machine use into its own confidential client with only Service account roles on.",
        field: "serviceAccountsEnabled",
        docs: [DOCS.serviceAccounts],
      });
    }
    if (attrTrue(c, "client_credentials.use_refresh_token")) {
      add(ctx, {
        id: "tokens-client-credentials-refresh",
        severity: "low",
        category: "tokens",
        title: "Client credentials grant returns a refresh token",
        why: "A service account can always request a new access token with its own credentials. A refresh token only adds a long-lived credential and a session to steal.",
        where: `Clients → ${clientId} → Advanced → OpenID Connect Compatibility Modes → Use refresh tokens for client credentials grant`,
        fix: "Turn it off.",
        field: "attributes.client_credentials.use_refresh_token",
        docs: [DOCS.grants],
      });
    }
  }
}

function checkAuthentication(ctx: Ctx, secret: SecretState) {
  if (ctx.isSaml) return;
  const { c, clientId } = ctx;

  if (ctx.kind === "bearer-only") {
    add(ctx, {
      id: "auth-bearer-only",
      severity: "info",
      category: "authentication",
      title: "Bearer-only is a legacy setting",
      why: "The current admin console no longer shows bearer-only. Keycloak treats such a client as a confidential client with no flows; it's harmless, but it can't be edited the usual way.",
      where: `Clients → ${clientId} → Settings → Capability config`,
      fix: "For a resource server you manage, recreate it as a confidential client with every flow turned off.",
      field: "bearerOnly",
    });
    return;
  }

  const standard = bool(c, "standardFlowEnabled", true);
  const pkce = attr(c, "pkce.code.challenge.method");
  const pkceCov = ctx.policy("pkce-enforcer");
  const pkceEnforced = pkceCov.verdict === "yes";
  if (standard && pkce !== "S256") {
    const isPublic = ctx.kind === "public";
    const severity: Severity = pkceEnforced
      ? "info"
      : isPublic && !ctx.builtIn
        ? "high"
        : "low";
    add(ctx, {
      id: isPublic ? "auth-public-no-pkce" : "auth-confidential-no-pkce",
      severity,
      category: "authentication",
      title:
        pkce === "plain"
          ? "PKCE method is `plain`, not `S256`"
          : isPublic
            ? "Public client does not require PKCE"
            : "Confidential client does not require PKCE",
      why:
        (isPublic
          ? "A public client has no secret, so PKCE is the only thing stopping an intercepted authorization code from being redeemed by someone else. RFC 9700 requires it for public clients."
          : "PKCE also protects confidential clients against authorization code injection, and RFC 9700 recommends it for them.") +
        (pkce === "plain"
          ? " The `plain` method sends the verifier in the clear and gives no protection if the request is observed."
          : " Without the setting, Keycloak accepts requests with no challenge, or with `plain`.") +
        policyNote(
          pkceCov,
          "pkce-enforcer",
          "authorization requests without an S256 challenge are rejected",
        ),
      where: `Clients → ${clientId} → Settings → Capability config → Require PKCE, with PKCE Method set to S256`,
      fix: "Set it to S256, and enforce PKCE realm-wide with the `pkce-enforcer` client policy executor.",
      field: "attributes.pkce.code.challenge.method",
      values: pkce ? [pkce] : undefined,
      docs: [DOCS.bcp, DOCS.policies],
    });
  }

  if (ctx.kind === "public") {
    if (standard && !attrTrue(c, "dpop.bound.access.tokens") && !ctx.builtIn) {
      add(ctx, {
        id: "auth-public-no-dpop",
        severity: "info",
        category: "authentication",
        title: "Tokens are not sender-constrained",
        why: "A token stolen from a public client works anywhere until it expires. DPoP binds tokens to a key the app holds, so a copied token is useless on its own. It needs support in the application and in your APIs.",
        where: `Clients → ${clientId} → Settings → Capability config → Require DPoP bound tokens`,
        fix: "Turn it on once the application sends DPoP proofs. Until then, keep access tokens short and turn on refresh token rotation.",
        field: "attributes.dpop.bound.access.tokens",
        docs: [DOCS.dpop],
      });
    }
    return;
  }

  // Confidential OIDC client.
  const authType =
    typeof c.clientAuthenticatorType === "string"
      ? c.clientAuthenticatorType
      : "client-secret";
  const credsWhere = `Clients → ${clientId} → Credentials → Client Authenticator`;
  if (authType === "client-secret" || authType === "client-secret-jwt") {
    const created = num(attr(c, "client.secret.creation.time"));
    const rotation = attr(c, "client.secret.expiration.time");
    const ageDays =
      created !== undefined
        ? Math.floor((ctx.now / 1000 - created) / 86400)
        : undefined;
    if (ageDays !== undefined && ageDays > 365 && !rotation) {
      add(ctx, {
        id: "auth-secret-old",
        severity: "medium",
        category: "authentication",
        title: `Client secret is ${ageDays} days old with no rotation`,
        why: "A shared secret lives in every place the application is configured and deployed. The longer it goes unchanged, the more copies exist and the longer a leaked one keeps working.",
        where: `Clients → ${clientId} → Credentials → Client Secret → Regenerate`,
        fix: "Rotate the secret now, and set up rotation with the `secret-rotation` client policy executor, or move to Signed JWT.",
        field: "attributes.client.secret.creation.time",
        values: [new Date(created! * 1000).toISOString().slice(0, 10)],
        docs: [DOCS.policies],
      });
    }
    add(ctx, {
      id: "auth-shared-secret",
      severity: "low",
      category: "authentication",
      title:
        authType === "client-secret-jwt"
          ? "Client authenticates with a JWT signed by its shared secret"
          : "Client authenticates with a shared secret",
      why:
        "Anyone who copies the secret, from a config file, a CI log or an export like this one, can act as the client. RFC 9700 recommends asymmetric client authentication: a JWT signed with a private key that never leaves the application (`private_key_jwt`), or mutual TLS." +
        (rotation
          ? ""
          : ` ${secret === "plaintext" ? "This export included the secret itself. " : ""}No secret rotation is configured.`),
      where: credsWhere,
      fix: "Switch to Signed JWT with a JWKS URL or an uploaded public key, or X509 Certificate (mTLS). Enforce it with the `secure-client-authenticator` executor once every confidential client has moved.",
      field: "clientAuthenticatorType",
      values: [authType],
      docs: [DOCS.bcp, DOCS.policies],
    });
  }
}

function checkScopes(ctx: Ctx) {
  const { c, clientId } = ctx;
  if (ctx.kind === "bearer-only") return;
  if (bool(c, "fullScopeAllowed", true)) {
    add(ctx, {
      id: "scopes-full-scope",
      severity: ctx.builtIn ? "low" : "medium",
      category: "scopes",
      title: "Full scope allowed is on",
      why: "Tokens for this client carry every realm and client role the user has, not only the roles this application needs. A leaked token, or a compromised client, then reaches every API that trusts those roles.",
      where: `Clients → ${clientId} → Client scopes → ${clientId}-dedicated → Scope → Full scope allowed`,
      fix: "Turn it off, then add only the roles the application checks under Assign role on the same tab. Test first: an application that relies on a role you didn't add will lose access.",
      field: "fullScopeAllowed",
      docs: [DOCS.builtIn, DOCS.bcp],
    });
  }
  const defaults = strList(c.defaultClientScopes);
  if (defaults.includes("offline_access")) {
    add(ctx, {
      id: "scopes-offline-default",
      severity: "medium",
      category: "scopes",
      title: "`offline_access` is a default client scope",
      why: "Every login through this client creates an offline session, a long-lived credential that survives the user signing out, an admin logout and a password reset. Anyone who steals the offline token keeps access for 30 days of inactivity by default.",
      where: `Clients → ${clientId} → Client scopes → offline_access → Assigned type`,
      fix: "Change offline_access to Optional so only clients that ask for it get it, or remove it if the client never needs to work while the user is away.",
      field: "defaultClientScopes",
      values: ["offline_access"],
      docs: [DOCS.offline],
    });
    if (!bool(c, "consentRequired")) {
      add(ctx, {
        id: "scopes-offline-no-consent",
        severity: "low",
        category: "scopes",
        title: "Long-lived offline access is granted without consent",
        why: "With consent off, users are never told that this app keeps access after they sign out. That's fine for your own first-party apps, and a problem for third-party ones.",
        where: `Clients → ${clientId} → Settings → Login settings → Consent required`,
        fix: "Turn on Consent required for third-party clients, or make offline_access optional.",
        field: "consentRequired",
        docs: [DOCS.offline],
      });
    }
  }
  if (defaults.includes("microprofile-jwt")) {
    add(ctx, {
      id: "scopes-microprofile-default",
      severity: "info",
      category: "scopes",
      title: "`microprofile-jwt` is a default client scope",
      why: "It adds a `groups` claim with every realm role to every token, which widens what a token reveals and authorizes.",
      where: `Clients → ${clientId} → Client scopes`,
      fix: "Make it Optional unless the application is a MicroProfile service that reads `groups`.",
      field: "defaultClientScopes",
      values: ["microprofile-jwt"],
    });
  }
}

function lifespanFinding(
  ctx: Ctx,
  key: string,
  label: string,
  where: string,
  thresholds: { medium: number; high?: number },
  realmKey: string | undefined,
  why: string,
) {
  const v = num(attr(ctx.c, key));
  if (v === undefined || v <= 0) return;
  const realmVal = realmKey && ctx.realm ? num(ctx.realm[realmKey]) : undefined;
  let severity: Severity | undefined;
  if (thresholds.high !== undefined && v > thresholds.high) severity = "high";
  else if (v > thresholds.medium) severity = "medium";
  else if (realmVal !== undefined && realmVal > 0 && v > realmVal)
    severity = "info";
  if (!severity) return;
  add(ctx, {
    id: `tokens-${key.replace(/\./g, "-")}`,
    severity,
    category: "tokens",
    title: `${label} is overridden to ${formatSeconds(v)}`,
    why:
      why +
      (realmVal !== undefined && realmVal > 0
        ? ` The realm default is ${formatSeconds(realmVal)}.`
        : ""),
    where,
    fix: "Clear the override so the realm default applies, or set it as short as the application tolerates.",
    field: `attributes.${key}`,
    values: [String(v)],
    docs: [DOCS.tokens],
  });
}

function checkTokens(ctx: Ctx) {
  if (ctx.isSaml || ctx.kind === "bearer-only") return;
  const adv = `Clients → ${ctx.clientId} → Advanced → Advanced settings`;
  lifespanFinding(
    ctx,
    "access.token.lifespan",
    "Access Token Lifespan",
    `${adv} → Access Token Lifespan`,
    { medium: 900, high: 3600 },
    "accessTokenLifespan",
    "An access token can't be revoked once issued, and logout doesn't recall it, so its lifespan is how long a stolen one keeps working. Five to fifteen minutes is typical.",
  );
  lifespanFinding(
    ctx,
    "client.session.idle.timeout",
    "Client Session Idle",
    `${adv} → Client Session Idle`,
    { medium: 86400 },
    "ssoSessionIdleTimeout",
    "Refresh tokens keep working for as long as the session isn't idle for longer than this.",
  );
  lifespanFinding(
    ctx,
    "client.session.max.lifespan",
    "Client Session Max",
    `${adv} → Client Session Max`,
    { medium: 7 * 86400 },
    "ssoSessionMaxLifespan",
    "This caps how long a user stays signed in to this client regardless of activity.",
  );
  lifespanFinding(
    ctx,
    "client.offline.session.idle.timeout",
    "Client Offline Session Idle",
    `${adv} → Client Offline Session Idle`,
    { medium: 30 * 86400 },
    "offlineSessionIdleTimeout",
    "Offline tokens are long-lived credentials that survive logout and password resets.",
  );
  lifespanFinding(
    ctx,
    "client.offline.session.max.lifespan",
    "Client Offline Session Max",
    `${adv} → Client Offline Session Max`,
    { medium: 90 * 86400 },
    "offlineSessionMaxLifespan",
    "Offline tokens are long-lived credentials that survive logout and password resets.",
  );
}

function checkLogout(ctx: Ctx) {
  const { c, clientId } = ctx;
  if (ctx.isSaml || ctx.kind === "bearer-only" || ctx.builtIn) return;
  if (!bool(c, "standardFlowEnabled", true)) return;
  const front = bool(c, "frontchannelLogout");
  const frontUrl = attr(c, "frontchannel.logout.url");
  const backUrl = attr(c, "backchannel.logout.url");
  const logoutWhere = `Clients → ${clientId} → Settings → Logout settings`;

  if (ctx.kind === "confidential" && !front && !backUrl) {
    add(ctx, {
      id: "logout-none",
      severity: "low",
      category: "logout",
      title: "No front-channel or back-channel logout",
      why: "When the user signs out of Keycloak, or an admin ends their session after an account takeover, this application isn't told and keeps its own session until it expires.",
      where: `${logoutWhere} → Backchannel logout URL`,
      fix: "Set a Backchannel logout URL that ends the application's session, with Backchannel logout session required on. Front-channel logout works too but depends on the browser loading every app's logout page.",
      field: "attributes.backchannel.logout.url",
      docs: [DOCS.tokens],
    });
  }
  if (front && !frontUrl && !backUrl) {
    add(ctx, {
      id: "logout-front-no-url",
      severity: "info",
      category: "logout",
      title: "Front channel logout is on but has no URL",
      why: "Without a Front-channel logout URL Keycloak has nothing to load in the browser when the user signs out, so the application isn't signed out.",
      where: `${logoutWhere} → Front-channel logout URL`,
      fix: "Set the application's logout endpoint, or use a Backchannel logout URL instead.",
      field: "attributes.frontchannel.logout.url",
    });
  }
  const httpLogout = [
    frontUrl,
    backUrl,
    typeof c.adminUrl === "string" ? c.adminUrl : undefined,
  ]
    .filter((u): u is string => !!u)
    .filter((u) => classifyUri(u).includes("http"));
  if (httpLogout.length) {
    add(ctx, {
      id: "logout-http",
      severity: "medium",
      category: "logout",
      title: "Logout or admin URL uses plain HTTP",
      why: "Logout tokens and admin callbacks sent over http can be read or forged on the network path.",
      where: `${logoutWhere}, and Settings → Access settings → Admin URL`,
      fix: "Use `https://`.",
      field: "attributes.backchannel.logout.url",
      values: httpLogout,
    });
  }
}

function checkSaml(ctx: Ctx) {
  if (!ctx.isSaml) return;
  const { c, clientId } = ctx;
  const sig = `Clients → ${clientId} → Settings → Signature and Encryption`;
  const keys = `Clients → ${clientId} → Keys`;
  // Defaults match a client created in the admin console.
  const serverSig = attr(c, "saml.server.signature") !== "false";
  const assertionSig = attrTrue(c, "saml.assertion.signature");
  const clientSig = attr(c, "saml.client.signature") !== "false";
  const encrypt = attrTrue(c, "saml.encrypt");

  if (!serverSig && !assertionSig) {
    add(ctx, {
      id: "saml-unsigned",
      severity: "critical",
      category: "saml",
      title: "Neither the SAML response nor the assertion is signed",
      why: "The service provider has no way to tell a real login from one an attacker wrote. Anyone can post a forged assertion naming any user.",
      where: `${sig} → Sign documents / Sign assertions`,
      fix: "Turn on Sign documents, and Sign assertions if the service provider checks the assertion signature. Make sure the SP requires a valid signature.",
      field: "attributes.saml.server.signature",
      docs: [DOCS.saml],
    });
  } else if (!assertionSig) {
    add(ctx, {
      id: "saml-assertion-unsigned",
      severity: "low",
      category: "saml",
      title: "Assertions are not signed individually",
      why: "Only the outer response is signed. Many service providers validate the assertion signature, and some libraries have been vulnerable to signature-wrapping attacks when only the response is signed.",
      where: `${sig} → Sign assertions`,
      fix: "Turn on Sign assertions as well as Sign documents, unless the service provider can't handle it.",
      field: "attributes.saml.assertion.signature",
      docs: [DOCS.saml],
    });
  }
  if (!clientSig) {
    add(ctx, {
      id: "saml-client-signature-off",
      severity: "medium",
      category: "saml",
      title: "Client signature is not required",
      why: "Keycloak accepts unsigned AuthnRequests and logout requests for this client, so anyone can start a login or logout that appears to come from this service provider, with their own RelayState and requested NameID format.",
      where: `${keys} → Client signature required`,
      fix: "Turn on Client signature required and import the service provider's signing certificate.",
      field: "attributes.saml.client.signature",
      docs: [DOCS.saml],
    });
  }
  if (!encrypt) {
    add(ctx, {
      id: "saml-not-encrypted",
      severity: "low",
      category: "saml",
      title: "Assertions are not encrypted",
      why: "The assertion, with the user's attributes and roles, travels through the browser readable to the user, browser extensions and anything that logs the POST.",
      where: `${keys} → Encrypt assertions`,
      fix: "Turn on Encrypt assertions with the service provider's encryption certificate, if it supports it.",
      field: "attributes.saml.encrypt",
      docs: [DOCS.saml],
    });
  }
  const alg = attr(c, "saml.signature.algorithm");
  if (alg && /SHA1$/i.test(alg)) {
    add(ctx, {
      id: "saml-sha1",
      severity: "medium",
      category: "saml",
      title: `Signature algorithm is ${alg}`,
      why: "SHA-1 signatures are deprecated and collision attacks against SHA-1 are practical.",
      where: `${sig} → Signature algorithm`,
      fix: "Use RSA_SHA256 or stronger.",
      field: "attributes.saml.signature.algorithm",
      values: [alg],
    });
  }
  if (attr(c, "saml_force_name_id_format") !== "true") {
    add(ctx, {
      id: "saml-name-id-not-forced",
      severity: "info",
      category: "saml",
      title: "Name ID format is not forced",
      why: `The service provider's AuthnRequest decides the NameID format, so a request can ask for a different identifier (for example an email address instead of a persistent ID) than the ${attr(c, "saml_name_id_format") ?? "username"} format configured here.`,
      where: `Clients → ${clientId} → Settings → SAML capabilities → Force name ID format`,
      fix: "Turn on Force name ID format so the configured format always wins.",
      field: "attributes.saml_force_name_id_format",
    });
  }
}

/* ------------------------------------------------------------------ */
/* Fixes                                                               */
/* ------------------------------------------------------------------ */

function setAttr(c: ClientRep, key: string, value: string | undefined) {
  if (!isObject(c.attributes)) c.attributes = {};
  const a = c.attributes as Record<string, unknown>;
  if (value === undefined) delete a[key];
  else a[key] = value;
}

/**
 * Applies only the changes that don't need information the export lacks.
 * Wildcard redirect URIs, client authentication and SAML certificates stay
 * manual: the right value depends on the application.
 */
export function suggestFixes(
  client: ClientRep,
  findings: Finding[],
): { fixed: ClientRep; changes: FixChange[] } {
  const fixed = JSON.parse(JSON.stringify(client)) as ClientRep;
  const changes: FixChange[] = [];
  const has = (id: string) => findings.some((f) => f.id === id);
  const change = (path: string, from: unknown, to: unknown, note: string) =>
    changes.push({ path, from, to, note });

  if (typeof fixed.secret === "string") {
    delete fixed.secret;
    change(
      "secret",
      MASK,
      "(removed)",
      "Keycloak generates a new secret when this is imported as a new client. Copy it from the Credentials tab into the application.",
    );
  }
  if (has("flow-implicit")) {
    fixed.implicitFlowEnabled = false;
    change(
      "implicitFlowEnabled",
      true,
      false,
      "Use the authorization code flow with PKCE.",
    );
  }
  if (has("flow-direct-access")) {
    fixed.directAccessGrantsEnabled = false;
    change(
      "directAccessGrantsEnabled",
      true,
      false,
      "Check that no script or backend logs in with a password first.",
    );
  }
  if (has("flow-device")) {
    setAttr(fixed, "oauth2.device.authorization.grant.enabled", "false");
    change(
      "attributes.oauth2.device.authorization.grant.enabled",
      "true",
      "false",
      "Keep it on only for devices and CLIs.",
    );
  }
  if (has("flow-ciba")) {
    setAttr(fixed, "oidc.ciba.grant.enabled", "false");
    change(
      "attributes.oidc.ciba.grant.enabled",
      "true",
      "false",
      "Keep it on only with a backchannel authentication provider.",
    );
  }
  if (has("flow-service-account-public")) {
    fixed.serviceAccountsEnabled = false;
    change(
      "serviceAccountsEnabled",
      true,
      false,
      "Invalid on a public client.",
    );
  }
  if (has("tokens-client-credentials-refresh")) {
    setAttr(fixed, "client_credentials.use_refresh_token", "false");
    change(
      "attributes.client_credentials.use_refresh_token",
      "true",
      "false",
      "Service accounts re-authenticate instead.",
    );
  }
  if (has("auth-public-no-pkce") || has("auth-confidential-no-pkce")) {
    const prev = attr(client, "pkce.code.challenge.method") ?? null;
    setAttr(fixed, "pkce.code.challenge.method", "S256");
    change(
      "attributes.pkce.code.challenge.method",
      prev,
      "S256",
      has("auth-confidential-no-pkce")
        ? "Check that the server-side library sends PKCE before applying."
        : "keycloak-js and most SPA libraries send S256 already.",
    );
  }
  if (has("origins-wildcard")) {
    const prev = strList(client.webOrigins);
    const next = Array.from(new Set(prev.map((o) => (o === "*" ? "+" : o))));
    fixed.webOrigins = next;
    change(
      "webOrigins",
      prev,
      next,
      "`+` allows the origins of the valid redirect URIs.",
    );
  }
  if (has("scopes-offline-default")) {
    const d = strList(client.defaultClientScopes).filter(
      (s) => s !== "offline_access",
    );
    const o = Array.from(
      new Set([...strList(client.optionalClientScopes), "offline_access"]),
    );
    fixed.defaultClientScopes = d;
    fixed.optionalClientScopes = o;
    change(
      "defaultClientScopes",
      "… offline_access",
      "offline_access moved to optionalClientScopes",
      "Clients that need offline tokens request scope=offline_access.",
    );
  }
  if (has("scopes-full-scope")) {
    fixed.fullScopeAllowed = false;
    change(
      "fullScopeAllowed",
      true,
      false,
      "Review: add the roles the application needs to the dedicated scope before applying.",
    );
  }
  for (const key of [
    "access.token.lifespan",
    "client.session.idle.timeout",
    "client.session.max.lifespan",
    "client.offline.session.idle.timeout",
    "client.offline.session.max.lifespan",
  ]) {
    const f = findings.find(
      (x) => x.id === `tokens-${key.replace(/\./g, "-")}`,
    );
    if (f && f.severity !== "info") {
      const prev = attr(client, key);
      setAttr(fixed, key, undefined);
      change(
        `attributes.${key}`,
        prev,
        "(removed: realm default applies)",
        "Set a shorter value instead if the realm default is also long.",
      );
    }
  }
  if (has("saml-unsigned")) {
    setAttr(fixed, "saml.server.signature", "true");
    change(
      "attributes.saml.server.signature",
      "false",
      "true",
      "Service provider must trust Keycloak's signing certificate.",
    );
  }
  if (has("saml-sha1")) {
    setAttr(fixed, "saml.signature.algorithm", "RSA_SHA256");
    change(
      "attributes.saml.signature.algorithm",
      attr(client, "saml.signature.algorithm"),
      "RSA_SHA256",
      "Confirm the service provider accepts SHA-256.",
    );
  }
  if (has("saml-name-id-not-forced")) {
    setAttr(fixed, "saml_force_name_id_format", "true");
    change(
      "attributes.saml_force_name_id_format",
      attr(client, "saml_force_name_id_format") ?? null,
      "true",
      "The configured Name ID format always applies.",
    );
  }
  return { fixed, changes };
}

/* ------------------------------------------------------------------ */
/* Scoring                                                             */
/* ------------------------------------------------------------------ */

export function scoreFindings(findings: Finding[]): {
  score: number;
  grade: string;
  counts: Record<Severity, number>;
} {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<
    Severity,
    number
  >;
  let penalty = 0;
  for (const f of findings) {
    counts[f.severity]++;
    penalty += SEVERITY_WEIGHT[f.severity];
  }
  let score = Math.max(0, 100 - penalty);
  // One critical finding caps the grade, however clean the rest is.
  if (counts.critical > 0) score = Math.min(score, 39);
  const grade =
    score >= 90
      ? "A"
      : score >= 75
        ? "B"
        : score >= 60
          ? "C"
          : score >= 40
            ? "D"
            : "F";
  return { score, grade, counts };
}

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );
}

/* ------------------------------------------------------------------ */
/* Entry points                                                        */
/* ------------------------------------------------------------------ */

/** Runs every check on one client. The client is redacted first. */
export function checkClient(
  input: ClientRep,
  opts: CheckOptions = {},
): ClientResult {
  const { client, state } = redactClient(input);
  const kind = clientKind(client);
  const clientId =
    typeof client.clientId === "string" ? client.clientId : "(no clientId)";
  const ctx: Ctx = {
    c: client,
    clientId,
    kind,
    isSaml: kind === "saml",
    builtIn: BUILT_IN_CLIENTS.has(clientId) || /-realm$/.test(clientId),
    realm: opts.realm,
    policy: (executor: string) => coverage(client, opts.realm, executor),
    now: opts.now ?? Date.now(),
    out: [],
  };
  const secretState = opts.secretState ?? state;
  checkSecrets(ctx, secretState);
  checkRedirects(ctx);
  checkOrigins(ctx);
  checkFlows(ctx);
  checkAuthentication(ctx, secretState);
  checkScopes(ctx);
  checkTokens(ctx);
  checkLogout(ctx);
  checkSaml(ctx);

  const findings = sortFindings(ctx.out);
  const { score, grade, counts } = scoreFindings(findings);
  const { fixed, changes } = suggestFixes(client, findings);
  return {
    clientId,
    name: typeof client.name === "string" ? client.name : undefined,
    protocol: ctx.isSaml ? "saml" : "openid-connect",
    kind,
    enabled: bool(client, "enabled", true),
    builtIn: ctx.builtIn,
    secret: secretState,
    findings,
    score,
    grade,
    counts,
    redacted: client,
    fixed,
    changes,
    policies: hasPolicies(opts.realm)
      ? Object.keys(EXECUTOR_EVENT).map((executor) => ({
          executor,
          label: POLICY_LABELS[executor] ?? executor,
          ...coverage(client, opts.realm, executor),
        }))
      : [],
  };
}

function hasPolicies(realm?: RealmSettings): boolean {
  if (!realm || !isObject(realm.clientPolicies)) return false;
  const cp = realm.clientPolicies;
  return (
    (Array.isArray(cp.policies) && cp.policies.length > 0) ||
    (Array.isArray(cp.globalPolicies) && cp.globalPolicies.length > 0)
  );
}

/** Realm-level token and session settings, when a realm export is pasted. */
export function checkRealm(realm: RealmSettings): Finding[] {
  const out: Finding[] = [];
  const name = typeof realm.realm === "string" ? realm.realm : "your realm";
  const access = num(realm.accessTokenLifespan);
  if (access !== undefined && access > 900) {
    out.push({
      id: "realm-access-token-lifespan",
      severity: access > 3600 ? "high" : "medium",
      category: "tokens",
      title: `Realm access tokens last ${formatSeconds(access)}`,
      why: "Access tokens can't be revoked and logout doesn't recall them, so the lifespan is how long a stolen token keeps working. The Keycloak default is 5 minutes.",
      where: `Realm settings (${name}) → Tokens → Access Token Lifespan`,
      fix: "Set it between 5 and 15 minutes, and let applications refresh.",
      field: "accessTokenLifespan",
      values: [String(access)],
      docs: [DOCS.tokens],
    });
  }
  const implicit = num(realm.accessTokenLifespanForImplicitFlow);
  if (implicit !== undefined && implicit > 3600) {
    out.push({
      id: "realm-implicit-lifespan",
      severity: "low",
      category: "tokens",
      title: `Implicit-flow access tokens last ${formatSeconds(implicit)}`,
      why: "Tokens returned in the URL fragment are the easiest to leak; a long lifespan makes a leaked one useful for longer.",
      where: `Realm settings (${name}) → Tokens → Access Token Lifespan For Implicit Flow`,
      fix: "Shorten it, and turn the implicit flow off on every client.",
      field: "accessTokenLifespanForImplicitFlow",
      docs: [DOCS.bcp],
    });
  }
  if (realm.revokeRefreshToken === false) {
    out.push({
      id: "realm-no-refresh-rotation",
      severity: "medium",
      category: "tokens",
      title: "Refresh token rotation is off",
      why: "A refresh token can be reused indefinitely, so a stolen one keeps minting access tokens and the theft is never detected. RFC 9700 requires rotation or sender-constraining for public clients.",
      where: `Realm settings (${name}) → Tokens → Refresh tokens → Revoke Refresh Token`,
      fix: "Turn it on with Refresh Token Max Reuse at 0, and make sure applications refresh one request at a time.",
      field: "revokeRefreshToken",
      docs: [DOCS.rotation, DOCS.bcp],
    });
  }
  if (realm.offlineSessionMaxLifespanEnabled === false) {
    out.push({
      id: "realm-offline-unlimited",
      severity: "low",
      category: "tokens",
      title: "Offline sessions have no maximum lifespan",
      why: "An offline token that is used at least once every idle period never expires.",
      where: `Realm settings (${name}) → Sessions → Offline Session Max Limited`,
      fix: "Turn it on and set Offline Session Max.",
      field: "offlineSessionMaxLifespanEnabled",
      docs: [DOCS.offline],
    });
  }
  const ssoMax = num(realm.ssoSessionMaxLifespan);
  if (ssoMax !== undefined && ssoMax > 7 * 86400) {
    out.push({
      id: "realm-sso-max",
      severity: "low",
      category: "tokens",
      title: `SSO sessions last up to ${formatSeconds(ssoMax)}`,
      why: "A session cookie stolen by a phishing proxy or malware is good for this long, whatever the user does.",
      where: `Realm settings (${name}) → Sessions → SSO Session Max`,
      fix: "Set it to the longest a user should stay signed in without re-entering credentials; the default is 10 hours.",
      field: "ssoSessionMaxLifespan",
      docs: [DOCS.tokens],
    });
  }
  const ex = configuredExecutors(realm);
  if (!ex.has("reject-ropc-grant") && "clientPolicies" in realm) {
    out.push({
      id: "realm-no-ropc-policy",
      severity: "info",
      category: "flows",
      title: "No client policy rejects the password grant",
      why: "Without a policy, any client, including new ones, can have Direct access grants turned back on.",
      where: `Realm settings (${name}) → Client policies`,
      fix: "Add a profile with `reject-ropc-grant` and a policy with the `any-client` condition.",
      docs: [DOCS.policies],
    });
  }
  return sortFindings(out);
}

/** Parses the input and checks every client in it. */
export function analyze(
  text: string,
  now?: number,
): Analysis | { error: string } {
  const parsed = parseInput(text);
  if (!parsed.ok) return { error: parsed.error };
  const results = parsed.clients.map((c, i) =>
    checkClient(c, {
      realm: parsed.realm,
      now,
      secretState: parsed.secretStates[i],
    }),
  );
  const realmFindings = parsed.realm ? checkRealm(parsed.realm) : [];
  return { parsed, realmFindings, results };
}

/* ------------------------------------------------------------------ */
/* Report output                                                       */
/* ------------------------------------------------------------------ */

const SEV_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

function mdFinding(f: Finding, base: string): string {
  const lines = [
    `#### ${SEV_LABEL[f.severity]}: ${f.title}`,
    "",
    f.why,
    "",
    `- **Where:** ${f.where}`,
    `- **Fix:** ${f.fix}`,
  ];
  if (f.values?.length)
    lines.push(`- **Values:** ${f.values.map((v) => `\`${v}\``).join(", ")}`);
  if (f.docs?.length)
    lines.push(
      `- **Read more:** ${f.docs.map((d) => `[${d.label}](${base}${d.href})`).join(", ")}`,
    );
  return lines.join("\n");
}

/** A Markdown report. Never includes secrets: it reads only findings. */
export function toMarkdown(
  results: ClientResult[],
  realmFindings: Finding[] = [],
  opts: { realmName?: string; date?: string; base?: string } = {},
): string {
  const base = opts.base ?? "https://phasetwo.io";
  const out: string[] = ["# Keycloak client security report", ""];
  const meta = [
    opts.realmName ? `Realm: \`${opts.realmName}\`` : null,
    opts.date ? `Generated: ${opts.date}` : null,
    `Checked with the [Phase Two Keycloak Client Security Checker](${base}/tools/keycloak-client-checker). Findings are heuristics from the exported configuration; review each before changing a production client.`,
  ].filter(Boolean);
  out.push(meta.join("  \n"), "");

  if (results.length > 1) {
    out.push(
      "## Summary",
      "",
      "| Client | Type | Score | Critical | High | Medium | Low |",
      "|---|---|---|---|---|---|---|",
    );
    for (const r of results) {
      out.push(
        `| \`${r.clientId}\` | ${r.kind} | ${r.score} (${r.grade}) | ${r.counts.critical} | ${r.counts.high} | ${r.counts.medium} | ${r.counts.low} |`,
      );
    }
    out.push("");
  }
  if (realmFindings.length) {
    out.push("## Realm settings", "");
    for (const f of realmFindings) out.push(mdFinding(f, base), "");
  }
  for (const r of results) {
    out.push(`## \`${r.clientId}\``, "");
    out.push(
      `${r.protocol === "saml" ? "SAML" : "OpenID Connect"} · ${r.kind}${r.builtIn ? " · built-in" : ""}${r.enabled ? "" : " · disabled"} · **Score ${r.score}/100 (${r.grade})**`,
      "",
    );
    if (r.policies.length) {
      out.push("Realm client policies:", "");
      for (const p of r.policies) {
        const v =
          p.verdict === "yes"
            ? "enforced"
            : p.verdict === "unknown"
              ? "can't determine"
              : "not enforced";
        out.push(
          `- \`${p.executor}\` (${p.label}): **${v}**${p.policies.length ? ` by ${p.policies.map((x) => `"${x}"`).join(", ")}` : ""}${p.reasons.length ? ` (${p.reasons.join("; ")})` : ""}`,
        );
      }
      out.push("");
    }
    if (r.findings.length === 0) {
      out.push("No findings.", "");
      continue;
    }
    for (const f of r.findings) out.push(mdFinding(f, base), "");
  }
  return (
    out
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}

/* ------------------------------------------------------------------ */
/* Line diff for the fixed JSON                                        */
/* ------------------------------------------------------------------ */

export type DiffLine = { type: "same" | "add" | "del"; text: string };

/** A small LCS line diff; client JSON is a few hundred lines at most. */
export function diffLines(a: string, b: string): DiffLine[] {
  const x = a.split("\n");
  const y = b.split("\n");
  const n = x.length;
  const m = y.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] =
        x[i] === y[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) {
      out.push({ type: "same", text: x[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: x[i++] });
    } else {
      out.push({ type: "add", text: y[j++] });
    }
  }
  while (i < n) out.push({ type: "del", text: x[i++] });
  while (j < m) out.push({ type: "add", text: y[j++] });
  return out;
}
