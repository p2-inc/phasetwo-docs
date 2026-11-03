/**
 * Framework-free helpers for OpenID Connect Discovery 1.0 documents:
 * URL normalization, Keycloak detection, endpoint/capability extraction, and
 * a linter. No network I/O happens here — see `fetch.ts`.
 */
import type { Finding } from "./findings.ts";

export const WELL_KNOWN_PATH = "/.well-known/openid-configuration";

export type DiscoveryDoc = Record<string, unknown> & {
  issuer?: string;
  jwks_uri?: string;
};

export type DiscoveryTarget = {
  /** The URL to fetch the discovery document from. */
  discoveryUrl: string;
  /** The issuer the document is expected to declare, derived from the URL. */
  expectedIssuer: string;
};

/**
 * Turn whatever the user typed — an issuer, a `.well-known` URL, or a bare
 * host — into the discovery URL and the issuer that URL implies.
 */
export function resolveDiscoveryTarget(
  input: string,
): DiscoveryTarget | undefined {
  let s = input.trim();
  if (!s) return undefined;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return undefined;
  }
  u.hash = "";
  const href = u.toString();
  const idx = href.indexOf("/.well-known/");
  if (idx >= 0) {
    // Per OIDC Discovery §4, the issuer is everything before /.well-known/…
    return { discoveryUrl: href, expectedIssuer: href.slice(0, idx) };
  }
  u.search = "";
  // The issuer as typed (host normalized by URL), trailing slash preserved.
  // Per §4.1 a trailing slash is removed before appending the discovery path.
  const stripped = u.toString().replace(/\/+$/, "");
  const typedSlash = /\/$/.test(input.trim().replace(/[?#].*$/, ""));
  return {
    discoveryUrl: `${stripped}${WELL_KNOWN_PATH}`,
    expectedIssuer: typedSlash ? `${stripped}/` : stripped,
  };
}

export type KeycloakInfo = {
  realm: string;
  /** The base URL Keycloak is served from, including any /auth prefix. */
  baseUrl: string;
  legacyAuthPrefix: boolean;
  adminConsoleUrl: string;
};

/** Detect a Keycloak-style issuer: https://host[/prefix]/realms/{realm}. */
export function detectKeycloak(
  issuer: string | undefined,
): KeycloakInfo | undefined {
  if (!issuer) return undefined;
  const m = issuer.match(
    /^(https?:\/\/[^/]+(?:\/.*?)?)\/realms\/([^/?#]+)\/?$/,
  );
  if (!m) return undefined;
  const baseUrl = m[1] ?? "";
  const realm = decodeURIComponent(m[2] ?? "");
  return {
    realm,
    baseUrl,
    legacyAuthPrefix: /\/auth$/.test(baseUrl),
    adminConsoleUrl: `${baseUrl}/admin/master/console/#/${encodeURIComponent(realm)}`,
  };
}

export type EndpointRow = {
  key: string;
  url: string;
  label: string;
  description: string;
};

const ENDPOINTS: Record<string, [string, string]> = {
  authorization_endpoint: [
    "Authorization",
    "Where the browser is sent to log in and consent (authorization code flow).",
  ],
  token_endpoint: [
    "Token",
    "Exchanges codes, refresh tokens, and client credentials for tokens.",
  ],
  userinfo_endpoint: [
    "UserInfo",
    "Returns claims about the authenticated user for an access token.",
  ],
  jwks_uri: [
    "JWKS",
    "Public keys used to verify the provider's token signatures.",
  ],
  end_session_endpoint: [
    "End session (logout)",
    "RP-initiated logout — ends the user's session at the provider.",
  ],
  revocation_endpoint: [
    "Revocation",
    "Revokes access or refresh tokens (RFC 7009).",
  ],
  introspection_endpoint: [
    "Introspection",
    "Lets resource servers check whether a token is active (RFC 7662).",
  ],
  registration_endpoint: [
    "Dynamic registration",
    "Dynamic client registration (RFC 7591).",
  ],
  device_authorization_endpoint: [
    "Device authorization",
    "Starts the device code flow for input-constrained devices (RFC 8628).",
  ],
  pushed_authorization_request_endpoint: [
    "Pushed authorization (PAR)",
    "Accepts authorization request parameters server-to-server (RFC 9126).",
  ],
  backchannel_authentication_endpoint: [
    "Backchannel auth (CIBA)",
    "Client-initiated backchannel authentication.",
  ],
  check_session_iframe: [
    "Check session iframe",
    "OIDC Session Management iframe for front-end session polling.",
  ],
};

/** Endpoints in a stable, meaningful order, plus any unknown *_endpoint keys. */
export function extractEndpoints(doc: DiscoveryDoc): EndpointRow[] {
  const rows: EndpointRow[] = [];
  const seen = new Set<string>();
  for (const [key, [label, description]] of Object.entries(ENDPOINTS)) {
    const v = doc[key];
    if (typeof v === "string") {
      rows.push({ key, url: v, label, description });
      seen.add(key);
    }
  }
  for (const [key, v] of Object.entries(doc)) {
    if (seen.has(key) || typeof v !== "string") continue;
    if (/_endpoint$|_uri$/.test(key) && /^https?:\/\//.test(v))
      rows.push({ key, url: v, label: key, description: "" });
  }
  return rows;
}

export type CapabilityGroup = {
  key: string;
  label: string;
  values: string[];
};

const CAPABILITIES: [string, string][] = [
  ["response_types_supported", "Response types"],
  ["grant_types_supported", "Grant types"],
  ["code_challenge_methods_supported", "PKCE methods"],
  ["scopes_supported", "Scopes"],
  ["claims_supported", "Claims"],
  ["response_modes_supported", "Response modes"],
  ["subject_types_supported", "Subject types"],
  ["token_endpoint_auth_methods_supported", "Client auth methods"],
  ["id_token_signing_alg_values_supported", "ID token signing algs"],
  ["userinfo_signing_alg_values_supported", "UserInfo signing algs"],
  ["request_object_signing_alg_values_supported", "Request object algs"],
  ["token_endpoint_auth_signing_alg_values_supported", "Client JWT algs"],
  [
    "introspection_endpoint_auth_methods_supported",
    "Introspection auth methods",
  ],
  ["revocation_endpoint_auth_methods_supported", "Revocation auth methods"],
  ["claim_types_supported", "Claim types"],
  ["acr_values_supported", "ACR values"],
  ["display_values_supported", "Display values"],
  ["ui_locales_supported", "UI locales"],
];

export function extractCapabilities(doc: DiscoveryDoc): CapabilityGroup[] {
  const groups: CapabilityGroup[] = [];
  const seen = new Set<string>();
  for (const [key, label] of CAPABILITIES) {
    const v = doc[key];
    if (Array.isArray(v)) {
      groups.push({ key, label, values: v.map(String) });
      seen.add(key);
    }
  }
  for (const [key, v] of Object.entries(doc)) {
    if (seen.has(key) || !Array.isArray(v) || !/_supported$/.test(key))
      continue;
    if (v.every((x) => typeof x === "string"))
      groups.push({ key, label: key, values: v as string[] });
  }
  return groups;
}

/** Boolean feature flags (e.g. `backchannel_logout_supported`). */
export function extractFlags(doc: DiscoveryDoc): [string, boolean][] {
  return Object.entries(doc)
    .filter(([, v]) => typeof v === "boolean")
    .map(([k, v]) => [k, v as boolean]);
}

function strList(doc: DiscoveryDoc, key: string): string[] | undefined {
  const v = doc[key];
  return Array.isArray(v) ? v.map(String) : undefined;
}

function hostOf(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

/**
 * Lint a discovery document. `expectedIssuer` is the issuer implied by the
 * URL it was fetched from (omit it for pasted documents).
 */
export function lintDiscovery(
  doc: DiscoveryDoc,
  expectedIssuer?: string,
): Finding[] {
  const f: Finding[] = [];
  const issuer = typeof doc.issuer === "string" ? doc.issuer : undefined;
  const kc = detectKeycloak(issuer ?? expectedIssuer);

  // --- issuer -------------------------------------------------------------
  if (!issuer) {
    f.push({
      severity: "error",
      rule: "issuer-missing",
      title: "issuer is missing",
      detail:
        "The issuer is required. Clients compare it to the iss claim in every ID token.",
    });
  } else if (expectedIssuer !== undefined) {
    if (issuer === expectedIssuer) {
      f.push({
        severity: "pass",
        rule: "issuer-match",
        title: "issuer exactly matches the URL it was fetched from",
      });
    } else if (
      issuer.replace(/\/+$/, "") === expectedIssuer.replace(/\/+$/, "")
    ) {
      f.push({
        severity: "warning",
        rule: "issuer-trailing-slash",
        title: `issuer is "${issuer}" — note the trailing slash difference`,
        detail:
          "Both forms share the same discovery URL, but iss comparisons are exact string matches. Configure clients with the issuer exactly as published here.",
      });
    } else if (/\{[^}]+\}/.test(issuer)) {
      f.push({
        severity: "warning",
        rule: "issuer-template",
        title: `issuer "${issuer}" is a template, not a fixed value`,
        detail:
          "Multi-tenant endpoints publish a placeholder (such as {tenantid}) that each tenant's tokens fill in. Clients must validate iss against the specific tenant's issuer, so use the tenant-specific discovery URL instead.",
      });
    } else {
      const sameIgnoringCase =
        issuer.toLowerCase() === expectedIssuer.toLowerCase();
      f.push({
        severity: "error",
        rule: "issuer-mismatch",
        title: `issuer "${issuer}" does not match "${expectedIssuer}"`,
        detail: sameIgnoringCase
          ? "The values differ only in letter case. OIDC requires an exact, case-sensitive match."
          : kc
            ? "OIDC requires the issuer to exactly match the URL used for discovery. In Keycloak this usually means the hostname configuration (the hostname option or the realm's Frontend URL) or the reverse-proxy headers do not match the URL clients use."
            : "OIDC requires the issuer to exactly match the URL used for discovery. Clients will reject tokens because iss will not match.",
      });
    }
  }
  if (issuer) {
    try {
      const u = new URL(issuer);
      if (u.search || u.hash)
        f.push({
          severity: "error",
          rule: "issuer-query",
          title: "issuer contains a query or fragment",
          detail: "The issuer must not contain query or fragment components.",
        });
    } catch {
      f.push({
        severity: "error",
        rule: "issuer-not-url",
        title: "issuer is not a valid URL",
      });
    }
  }

  // --- required metadata (OIDC Discovery §3) ------------------------------
  const required = [
    "authorization_endpoint",
    "jwks_uri",
    "response_types_supported",
    "subject_types_supported",
    "id_token_signing_alg_values_supported",
  ];
  const responseTypes = strList(doc, "response_types_supported") ?? [];
  const implicitOnly =
    responseTypes.length > 0 && responseTypes.every((t) => !t.includes("code"));
  if (!implicitOnly) required.push("token_endpoint");
  const missing = required.filter((k) => doc[k] === undefined);
  if (missing.length)
    f.push({
      severity: "error",
      rule: "required-missing",
      title: `Missing required metadata: ${missing.join(", ")}`,
    });

  // --- https everywhere ---------------------------------------------------
  const urlEntries = Object.entries(doc).filter(
    (e): e is [string, string] =>
      typeof e[1] === "string" && /^https?:\/\//i.test(e[1]),
  );
  const insecure = urlEntries.filter(([, v]) => /^http:\/\//i.test(v));
  if (insecure.length) {
    const local = insecure.every(([, v]) =>
      /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(v),
    );
    f.push({
      severity: local ? "warning" : "error",
      rule: "https",
      title: `${insecure.length} URL${insecure.length === 1 ? " uses" : "s use"} plain http`,
      detail:
        (local
          ? "Fine for local development, but production providers must use https. "
          : "OIDC requires TLS for every endpoint. ") +
        insecure.map(([k]) => k).join(", "),
    });
  } else if (urlEntries.length) {
    f.push({
      severity: "pass",
      rule: "https",
      title: "All endpoints use https",
    });
  }

  // Mixed hosts often mean a misconfigured hostname / backchannel setting.
  const issuerHost = issuer ? hostOf(issuer) : undefined;
  if (issuerHost) {
    const browserFacing = [
      "authorization_endpoint",
      "end_session_endpoint",
      "check_session_iframe",
    ];
    const odd = browserFacing.filter((k) => {
      const v = doc[k];
      return typeof v === "string" && hostOf(v) !== issuerHost;
    });
    if (odd.length && kc)
      f.push({
        severity: "warning",
        rule: "host-mismatch",
        title: `Browser-facing endpoints use a different host than the issuer (${odd.join(", ")})`,
        detail:
          "Keycloak builds front-channel URLs from its hostname configuration. A different host here usually means the hostname option, the Frontend URL, or proxy headers are set inconsistently.",
      });
  }

  // --- PKCE ---------------------------------------------------------------
  const pkce = strList(doc, "code_challenge_methods_supported");
  if (!pkce)
    f.push({
      severity: "warning",
      rule: "pkce-unadvertised",
      title: "code_challenge_methods_supported is not advertised",
      detail:
        "Clients cannot tell whether PKCE is supported. Public clients (SPAs, mobile apps) must use PKCE with S256.",
    });
  else if (!pkce.includes("S256"))
    f.push({
      severity: "error",
      rule: "pkce-s256",
      title: "PKCE S256 is not supported",
      detail:
        "S256 is the only PKCE method recommended for production; plain offers little protection.",
    });
  else
    f.push({
      severity: "pass",
      rule: "pkce-s256",
      title: "PKCE with S256 is supported",
    });

  // --- "none" algorithms --------------------------------------------------
  // "none" for UserInfo/introspection just means a plain JSON response over
  // TLS, which is normal. For ID tokens and JARM responses it means unsigned
  // tokens travel through the browser, which is not.
  for (const key of [
    "id_token_signing_alg_values_supported",
    "authorization_signing_alg_values_supported",
  ]) {
    if (strList(doc, key)?.some((a) => a.toLowerCase() === "none"))
      f.push({
        severity: key.startsWith("id_token") ? "error" : "warning",
        rule: "alg-none",
        title: `"none" is listed in ${key}`,
        detail:
          "Unsigned tokens are trivially forgeable. Clients must never accept alg none for tokens they rely on.",
      });
  }
  if (
    strList(doc, "request_object_signing_alg_values_supported")?.some(
      (a) => a.toLowerCase() === "none",
    )
  )
    f.push({
      severity: "info",
      rule: "request-object-none",
      title: 'Unsigned request objects ("none") are accepted',
      detail:
        "This only matters if you rely on signed request objects (JAR). Providers can usually require signing per client.",
    });
  const idAlgs = strList(doc, "id_token_signing_alg_values_supported");
  if (idAlgs && idAlgs.length && idAlgs.every((a) => /^HS/i.test(a)))
    f.push({
      severity: "warning",
      rule: "hmac-only",
      title: "ID tokens can only be signed with HMAC",
      detail:
        "Symmetric signing means every client holds the verification secret. Prefer RS256, PS256, or ES256.",
    });

  // --- optional but expected endpoints ------------------------------------
  const optional: [string, string][] = [
    [
      "end_session_endpoint",
      "Without it, apps cannot perform RP-initiated logout.",
    ],
    [
      "revocation_endpoint",
      "Without it, apps cannot revoke refresh tokens on logout.",
    ],
    [
      "introspection_endpoint",
      "Without it, resource servers must validate tokens locally.",
    ],
    ["userinfo_endpoint", "Recommended by OIDC Discovery."],
  ];
  const absent = optional.filter(([k]) => doc[k] === undefined);
  for (const [k, why] of absent)
    f.push({
      severity: "info",
      rule: `missing-${k}`,
      title: `No ${k}`,
      detail: why,
    });
  if (!absent.length)
    f.push({
      severity: "pass",
      rule: "optional-endpoints",
      title: "Logout, revocation, introspection, and UserInfo are advertised",
    });

  // --- flow hygiene -------------------------------------------------------
  if (responseTypes.some((t) => t.split(" ").includes("token")))
    f.push({
      severity: "info",
      rule: "implicit",
      title: "Implicit flow response types are advertised",
      detail:
        "OAuth 2.0 Security BCP (RFC 9700) recommends against the implicit flow. Use authorization code + PKCE; disable implicit per client.",
    });
  const grants = strList(doc, "grant_types_supported");
  if (grants?.includes("password"))
    f.push({
      severity: "info",
      rule: "ropc",
      title: "The password grant is advertised",
      detail:
        "The resource owner password credentials grant is deprecated by RFC 9700. Keep it disabled on clients unless you have a legacy need.",
    });

  return f;
}

/** Keycloak-specific notes to show alongside the lint findings. */
export function keycloakNotes(
  kc: KeycloakInfo,
  doc: DiscoveryDoc,
): { title: string; body: string }[] {
  const notes: { title: string; body: string }[] = [
    {
      title: `Keycloak realm "${kc.realm}"`,
      body: `Discovery lives at ${kc.baseUrl}/realms/${kc.realm}${WELL_KNOWN_PATH} and the realm's signing keys at ${kc.baseUrl}/realms/${kc.realm}/protocol/openid-connect/certs. Manage keys under Realm settings → Keys in the admin console.`,
    },
    {
      title: "Issuer comes from the hostname configuration",
      body: "Keycloak derives the issuer from its hostname option (or the realm's Frontend URL) and, behind a proxy, the forwarded headers enabled with proxy-headers. If tokens show a different iss than your clients expect, fix the hostname setup rather than the clients.",
    },
  ];
  if (kc.legacyAuthPrefix)
    notes.push({
      title: "Legacy /auth context path",
      body: "This issuer includes /auth, the default before Keycloak 17. Newer Keycloak serves from the root unless http-relative-path is set to /auth. Changing it changes the issuer, so every client must be updated together.",
    });
  if (doc.mtls_endpoint_aliases)
    notes.push({
      title: "mTLS endpoint aliases",
      body: "mtls_endpoint_aliases lists the endpoints to use for certificate-bound tokens (RFC 8705).",
    });
  return notes;
}
