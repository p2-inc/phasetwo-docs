/**
 * Plain-English explanations of OAuth 2.0 / OpenID Connect error codes, plus
 * the common Keycloak configuration causes behind them. Framework-free.
 */

export type ErrorExplanation = {
  /** The error code as received (e.g. "invalid_grant"). */
  code: string;
  /** Short title. */
  title: string;
  /** What the error means, in plain English. */
  meaning: string;
  /** Likely causes, most common first — Keycloak-specific where useful. */
  causes: string[];
  /** Where the code is defined. */
  spec?: string;
};

type Entry = Omit<ErrorExplanation, "code">;

export const OAUTH_ERRORS: Record<string, Entry> = {
  invalid_request: {
    title: "Invalid request",
    meaning:
      "The request is missing a required parameter, has an invalid value, repeats a parameter, or is otherwise malformed.",
    causes: [
      "A required parameter is missing (response_type, client_id, redirect_uri, or code_challenge when the client requires PKCE). The error_description usually names it.",
      'Keycloak: "Missing parameter: code_challenge_method" — the client requires PKCE (Capability config → Require PKCE / PKCE Method; older versions: Advanced tab) and the request has no challenge.',
      'Keycloak: "Invalid parameter: code_challenge_method" — the method is not allowed for this client (for example plain when S256 is required).',
      "A parameter appears twice in the URL.",
    ],
    spec: "RFC 6749 §4.1.2.1, §5.2",
  },
  unauthorized_client: {
    title: "Unauthorized client",
    meaning: "This client is not allowed to use this grant or response type.",
    causes: [
      'Keycloak: "Client is not allowed to initiate browser login with given response_type" — Standard flow is turned off for the client (for code flow), or Implicit flow is off (for response_type=token / id_token).',
      'Keycloak: "Client not allowed for direct access grants" — the password grant was used but Direct access grants is off.',
      "Refreshing a token issued to a different client.",
    ],
    spec: "RFC 6749 §4.1.2.1, §5.2",
  },
  access_denied: {
    title: "Access denied",
    meaning: "The user or the authorization server refused the request.",
    causes: [
      "The user clicked Cancel or declined consent.",
      "An authentication flow step (for example a conditional or deny-access authenticator) rejected the user.",
      "The user's identity provider returned an error during brokered login.",
    ],
    spec: "RFC 6749 §4.1.2.1",
  },
  unsupported_response_type: {
    title: "Unsupported response type",
    meaning: "The server does not support this response_type for this client.",
    causes: [
      "A typo in response_type (it is space-separated, for example code id_token).",
      "Implicit or hybrid flow requested but the client has Implicit flow disabled.",
    ],
    spec: "RFC 6749 §4.1.2.1",
  },
  invalid_scope: {
    title: "Invalid scope",
    meaning: "A requested scope is unknown, malformed, or not allowed.",
    causes: [
      'Keycloak: "Invalid scopes" — the scope is not a client scope assigned to this client (Client → Client scopes) as Default or Optional.',
      "A scope name typo, or commas used instead of spaces as the separator.",
    ],
    spec: "RFC 6749 §4.1.2.1, §5.2",
  },
  server_error: {
    title: "Server error",
    meaning:
      "The authorization server hit an unexpected condition. Check the server logs.",
    causes: [
      "A misconfigured authenticator, identity provider, or protocol mapper.",
      "A custom extension threw an exception.",
    ],
    spec: "RFC 6749 §4.1.2.1",
  },
  temporarily_unavailable: {
    title: "Temporarily unavailable",
    meaning: "The server is overloaded or under maintenance. Retry later.",
    causes: ["Server overload, a restart, or a maintenance window."],
    spec: "RFC 6749 §4.1.2.1",
  },
  interaction_required: {
    title: "Interaction required",
    meaning:
      "prompt=none was requested, but the user must interact (for example to complete a required action).",
    causes: [
      "The user has a pending required action (verify email, update password, configure OTP).",
      "Silent authentication is not possible; retry without prompt=none.",
    ],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  login_required: {
    title: "Login required",
    meaning:
      "prompt=none was requested, but the user has no active session at the server.",
    causes: [
      "The user is not logged in (or the SSO session expired). This is expected for silent checks — send the user through an interactive login.",
      "Third-party cookie blocking: a silent check in a hidden iframe cannot see the server's session cookie when the app and server are on different sites.",
      "max_age was exceeded and prompt=none forbids re-authentication.",
    ],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  account_selection_required: {
    title: "Account selection required",
    meaning:
      "prompt=none was requested, but the user must choose between accounts.",
    causes: ["Retry without prompt=none, or with prompt=select_account."],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  consent_required: {
    title: "Consent required",
    meaning:
      "prompt=none was requested, but the user has not yet consented to the requested scopes.",
    causes: [
      "Keycloak: Consent required is on for the client and the user has not granted these scopes. Retry interactively, or turn off Consent required.",
    ],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  invalid_request_uri: {
    title: "Invalid request_uri",
    meaning: "The request_uri is invalid, expired, or unreachable.",
    causes: [
      "A pushed authorization request (PAR) request_uri was reused or has expired.",
    ],
    spec: "OpenID Connect Core §3.1.2.6, RFC 9126",
  },
  invalid_request_object: {
    title: "Invalid request object",
    meaning: "The signed or encrypted request object is invalid.",
    causes: [
      "The request JWT's signature, algorithm, audience, or expiry does not match the client's configuration.",
    ],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  request_not_supported: {
    title: "Request object not supported",
    meaning: "The server does not support the request parameter.",
    causes: ["Send parameters in the query string instead."],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  request_uri_not_supported: {
    title: "request_uri not supported",
    meaning: "The server does not support the request_uri parameter.",
    causes: ["Send parameters in the query string instead."],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  registration_not_supported: {
    title: "Registration not supported",
    meaning: "The server does not support the registration parameter.",
    causes: ["Remove the registration parameter."],
    spec: "OpenID Connect Core §3.1.2.6",
  },
  invalid_grant: {
    title: "Invalid grant",
    meaning:
      "The authorization code, refresh token, or other grant is invalid, expired, revoked, already used, or was issued to another client.",
    causes: [
      'Keycloak: "Code not valid" — the code was already exchanged (codes are single-use; a double-submit or a React double-render often causes this) or it expired (Keycloak codes live about a minute by default).',
      'Keycloak: "Incorrect redirect_uri" — the redirect_uri sent to the token endpoint must exactly match the one used in the authorize request.',
      'Keycloak: "PKCE verification failed" — the code_verifier does not hash to the code_challenge (verifier lost between redirects, or the wrong session state was used).',
      'Keycloak: "Session not active" / "Token is not active" / "Stale token" — the user\'s session expired, was logged out, or the refresh token was already rotated.',
    ],
    spec: "RFC 6749 §5.2",
  },
  invalid_client: {
    title: "Invalid client",
    meaning:
      "Client authentication failed: unknown client, missing credentials, or wrong credentials.",
    causes: [
      'Keycloak: "Invalid client or Invalid client credentials" — the client has Client authentication turned on (confidential) but the request sent no secret. For a browser app, turn Client authentication off to make it a public client.',
      "The client_id is misspelled or belongs to another realm.",
    ],
    spec: "RFC 6749 §5.2",
  },
  unsupported_grant_type: {
    title: "Unsupported grant type",
    meaning: "The server does not support this grant_type.",
    causes: ["A typo in grant_type, or the grant is disabled for the client."],
    spec: "RFC 6749 §5.2",
  },
  invalid_token: {
    title: "Invalid token",
    meaning:
      "The access token sent to a resource (for example userinfo) is expired, revoked, or malformed.",
    causes: [
      "The access token expired — refresh it.",
      "The user session behind the token was logged out.",
      "The token was issued by a different realm or issuer.",
    ],
    spec: "RFC 6750 §3.1",
  },
  insufficient_scope: {
    title: "Insufficient scope",
    meaning: "The access token lacks a scope the resource requires.",
    causes: ["Userinfo requires the openid scope in the access token."],
    spec: "RFC 6750 §3.1",
  },
  invalid_redirect_uri: {
    title: "Invalid redirect URI",
    meaning:
      "The redirect_uri does not match any of the client's registered redirect URIs.",
    causes: [
      "The redirect URI is not listed in the client's Valid redirect URIs. Matching is exact — scheme, host, port, path, and trailing slash all count.",
    ],
  },
};

/**
 * Error descriptions that Keycloak shows on its own error page instead of
 * redirecting. They never reach the app, so users paste them in by hand.
 */
const DESCRIPTION_PATTERNS: { re: RegExp; entry: Entry & { code: string } }[] =
  [
    {
      re: /invalid parameter:\s*redirect_uri|invalid redirect uri/i,
      entry: {
        code: "invalid_redirect_uri",
        title: 'Keycloak: "Invalid parameter: redirect_uri"',
        meaning:
          "Keycloak refused to redirect because the redirect_uri is not registered for this client. For safety it shows an error page rather than redirecting to an untrusted address.",
        causes: [
          "Add the exact redirect URI to the client's Valid redirect URIs. Scheme, host, port, path, and trailing slash all have to match (a wildcard such as https://app.example.com/* works but is broader than it needs to be).",
          "http vs https mismatch — common behind a TLS-terminating proxy that rewrites the scheme.",
          "localhost vs 127.0.0.1, or a different port in development.",
          "The client_id points at a different client (or realm) than the one you edited.",
        ],
      },
    },
    {
      re: /client not found/i,
      entry: {
        code: "client_not_found",
        title: 'Keycloak: "Client not found"',
        meaning: "No client with this client_id exists in this realm.",
        causes: [
          "A typo in client_id (it is case-sensitive).",
          "The client lives in a different realm than the issuer URL you are using.",
          "The client is disabled.",
        ],
      },
    },
    {
      re: /invalid_client_credentials|invalid client credentials/i,
      entry: { code: "invalid_client", ...OAUTH_ERRORS.invalid_client },
    },
    {
      re: /code not valid/i,
      entry: { code: "invalid_grant", ...OAUTH_ERRORS.invalid_grant },
    },
    {
      re: /pkce/i,
      entry: { code: "invalid_grant", ...OAUTH_ERRORS.invalid_grant },
    },
  ];

/** Explain an OAuth error code (and/or description) in plain English. */
export function explainError(
  code: string | undefined,
  description?: string,
): ErrorExplanation | undefined {
  const c = (code ?? "").trim();
  if (c && OAUTH_ERRORS[c]) return { code: c, ...OAUTH_ERRORS[c] };
  if (description) {
    for (const p of DESCRIPTION_PATTERNS) {
      if (p.re.test(description)) return { ...p.entry };
    }
  }
  if (c) {
    return {
      code: c,
      title: "Unrecognized error code",
      meaning:
        "This is not a standard OAuth 2.0 or OpenID Connect error code. It may be specific to the server or a custom extension — check the error_description and the server logs.",
      causes: [],
    };
  }
  return undefined;
}

/** Pull error / error_description out of a token-endpoint style JSON body. */
export function errorFromBody(
  body: unknown,
): { error?: string; description?: string } | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;
  if (typeof b.error !== "string") return undefined;
  return {
    error: b.error,
    description:
      typeof b.error_description === "string" ? b.error_description : undefined,
  };
}
