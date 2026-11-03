/**
 * Authorization request / response parameter reference and URL building.
 * Framework-free.
 */

export type ParamInfo = {
  /** One-line explanation. */
  desc: string;
  /** Where it is defined. */
  spec?: string;
  /** Keycloak-specific extension parameter. */
  keycloak?: boolean;
};

/** Parameters that may appear on an authorization request. */
export const AUTHORIZE_PARAMS: Record<string, ParamInfo> = {
  response_type: {
    desc: 'What the authorization server returns. "code" is the authorization code flow — the only one you should use for new apps.',
    spec: "RFC 6749 §3.1.1",
  },
  client_id: {
    desc: "The client (application) identifier registered at the server.",
    spec: "RFC 6749 §2.2",
  },
  redirect_uri: {
    desc: "Where the server sends the user back. Must exactly match a registered redirect URI.",
    spec: "RFC 6749 §3.1.2",
  },
  scope: {
    desc: 'Space-separated scopes. "openid" makes this an OpenID Connect request and returns an ID token.',
    spec: "RFC 6749 §3.3, OIDC Core §3.1.2.1",
  },
  state: {
    desc: "An unguessable value the client stores and checks on return. Protects against CSRF and lets the app restore context.",
    spec: "RFC 6749 §10.12",
  },
  nonce: {
    desc: "A random value echoed inside the ID token. The client checks it to stop ID token replay.",
    spec: "OIDC Core §3.1.2.1",
  },
  code_challenge: {
    desc: "PKCE: a hash of the secret code_verifier. The verifier is sent later with the code, proving the same client started the flow.",
    spec: "RFC 7636 §4.2",
  },
  code_challenge_method: {
    desc: 'PKCE: how the challenge was derived. "S256" (SHA-256) — "plain" offers no protection if the request is observed.',
    spec: "RFC 7636 §4.3",
  },
  response_mode: {
    desc: 'How the response is delivered: "query", "fragment", or "form_post" (plus JWT-secured "jwt" variants).',
    spec: "OAuth 2.0 Multiple Response Types, Form Post Response Mode",
  },
  prompt: {
    desc: 'Whether to force interaction: "none" (silent; fail if login is needed), "login" (re-authenticate), "consent", "select_account", or "create" (registration).',
    spec: "OIDC Core §3.1.2.1",
  },
  max_age: {
    desc: "Maximum seconds since the user last actively authenticated. If exceeded, the server re-authenticates.",
    spec: "OIDC Core §3.1.2.1",
  },
  login_hint: {
    desc: "Prefills the username or email on the login page.",
    spec: "OIDC Core §3.1.2.1",
  },
  id_token_hint: {
    desc: "A previously issued ID token, hinting which user is expected.",
    spec: "OIDC Core §3.1.2.1",
  },
  acr_values: {
    desc: "Requested Authentication Context Class References (assurance levels). In Keycloak these map to levels of authentication (step-up).",
    spec: "OIDC Core §3.1.2.1",
  },
  ui_locales: {
    desc: "Preferred languages for the login UI, space-separated (for example de en).",
    spec: "OIDC Core §3.1.2.1",
  },
  claims_locales: {
    desc: "Preferred languages for returned claims.",
    spec: "OIDC Core §5.2",
  },
  display: {
    desc: "How the login UI is displayed: page, popup, touch, or wap.",
    spec: "OIDC Core §3.1.2.1",
  },
  claims: {
    desc: "JSON object requesting specific claims in the ID token or userinfo response.",
    spec: "OIDC Core §5.5",
  },
  request: {
    desc: "A JWT containing the request parameters (request object).",
    spec: "RFC 9101",
  },
  request_uri: {
    desc: "A reference to a request object, typically from a pushed authorization request (PAR).",
    spec: "RFC 9101, RFC 9126",
  },
  registration: {
    desc: "Dynamic client registration information.",
    spec: "OIDC Core §7.2.1",
  },
  resource: {
    desc: "The target resource server (audience) the token is for.",
    spec: "RFC 8707",
  },
  audience: {
    desc: "Non-standard audience parameter used by some providers.",
  },
  authorization_details: {
    desc: "Rich authorization request details (JSON).",
    spec: "RFC 9396",
  },
  dpop_jkt: {
    desc: "Thumbprint of the DPoP key the code will be bound to.",
    spec: "RFC 9449",
  },
  kc_idp_hint: {
    desc: "Keycloak: skip the login page and go straight to this identity provider alias.",
    keycloak: true,
  },
  kc_action: {
    desc: "Keycloak: run an application-initiated action (for example UPDATE_PASSWORD) — AIA.",
    keycloak: true,
  },
  kc_locale: {
    desc: "Keycloak: the login UI locale (prefer the standard ui_locales).",
    keycloak: true,
  },
};

/** Parameters that may appear on an authorization response (the callback). */
export const CALLBACK_PARAMS: Record<string, ParamInfo> = {
  code: {
    desc: "The authorization code. Single-use and short-lived; exchange it at the token endpoint.",
    spec: "RFC 6749 §4.1.2",
  },
  state: {
    desc: "Echo of the state the client sent. Must match the stored value.",
    spec: "RFC 6749 §4.1.2",
  },
  iss: {
    desc: "The issuer that produced this response. Lets the client detect mix-up attacks when it talks to several servers.",
    spec: "RFC 9207",
  },
  session_state: {
    desc: "Session identifier used for OIDC session management.",
    spec: "OIDC Session Management §3",
  },
  error: {
    desc: "An OAuth error code — the request failed.",
    spec: "RFC 6749 §4.1.2.1",
  },
  error_description: {
    desc: "A human-readable explanation of the error.",
    spec: "RFC 6749 §4.1.2.1",
  },
  error_uri: {
    desc: "A link to a page about the error.",
    spec: "RFC 6749 §4.1.2.1",
  },
  access_token: {
    desc: "An access token returned directly in the URL (implicit or hybrid flow).",
    spec: "RFC 6749 §4.2.2",
  },
  token_type: {
    desc: "The access token type, usually Bearer.",
    spec: "RFC 6749 §4.2.2",
  },
  expires_in: {
    desc: "Access token lifetime in seconds.",
    spec: "RFC 6749 §4.2.2",
  },
  id_token: {
    desc: "An ID token returned directly in the URL (implicit or hybrid flow).",
    spec: "OIDC Core §3.2.2.5",
  },
  scope: {
    desc: "The granted scopes, if they differ from those requested.",
    spec: "RFC 6749 §4.2.2",
  },
  response: {
    desc: "A JWT-secured authorization response (JARM).",
    spec: "JARM",
  },
};

export type BuiltParam = {
  name: string;
  value: string;
  info?: ParamInfo;
};

export type AuthorizeRequest = {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  nonce: string;
  codeChallenge: string;
  /** Optional extras; empty values are omitted. */
  extra?: Record<string, string | undefined>;
};

/** Build an authorization code + PKCE (S256) request URL. */
export function buildAuthorizeUrl(req: AuthorizeRequest): {
  url: string;
  params: BuiltParam[];
} {
  const pairs: [string, string][] = [
    ["response_type", "code"],
    ["client_id", req.clientId],
    ["redirect_uri", req.redirectUri],
    ["scope", req.scope.trim().split(/\s+/).filter(Boolean).join(" ")],
    ["state", req.state],
    ["nonce", req.nonce],
    ["code_challenge", req.codeChallenge],
    ["code_challenge_method", "S256"],
  ];
  for (const [k, v] of Object.entries(req.extra ?? {})) {
    if (v !== undefined && v.trim() !== "") pairs.push([k, v.trim()]);
  }
  const url = new URL(req.authorizationEndpoint);
  for (const [k, v] of pairs) url.searchParams.set(k, v);
  return {
    url: url.toString(),
    params: pairs.map(([name, value]) => ({
      name,
      value,
      info: AUTHORIZE_PARAMS[name],
    })),
  };
}

/** Build an RP-initiated logout URL (OIDC RP-Initiated Logout 1.0). */
export function buildLogoutUrl(opts: {
  endSessionEndpoint: string;
  idTokenHint?: string;
  clientId: string;
  postLogoutRedirectUri: string;
  state: string;
}): string {
  const url = new URL(opts.endSessionEndpoint);
  if (opts.idTokenHint) url.searchParams.set("id_token_hint", opts.idTokenHint);
  url.searchParams.set("client_id", opts.clientId);
  url.searchParams.set("post_logout_redirect_uri", opts.postLogoutRedirectUri);
  url.searchParams.set("state", opts.state);
  return url.toString();
}
