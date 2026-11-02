/**
 * Token endpoint, userinfo, and ID token validation helpers for a PUBLIC
 * client. Framework-free.
 *
 * There is deliberately no client secret support: anything shipped to a
 * browser is readable by its user, so a "secret" in a SPA is not secret.
 */
import { fetchJson, FriendlyFetchError, type JsonResponse } from "./discovery";
import { bytesToBase64Url } from "./pkce";

export type TokenResponse = {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  scope?: string;
  [key: string]: unknown;
};

/** The request we sent, for display (the code_verifier is shown on purpose — it is single-use). */
export type SentRequest = {
  method: "GET" | "POST";
  url: string;
  headers: Record<string, string>;
  body?: Record<string, string>;
};

export type EndpointResult = {
  request: SentRequest;
  response: JsonResponse;
};

async function postForm(
  url: string,
  form: Record<string, string>,
  what: string,
): Promise<EndpointResult> {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  const response = await fetchJson(
    url,
    { method: "POST", headers, body: new URLSearchParams(form).toString() },
    what,
  );
  return { request: { method: "POST", url, headers, body: form }, response };
}

/** Exchange an authorization code at the token endpoint (public client + PKCE). */
export function exchangeCode(opts: {
  tokenEndpoint: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<EndpointResult> {
  return postForm(
    opts.tokenEndpoint,
    {
      grant_type: "authorization_code",
      client_id: opts.clientId,
      code: opts.code,
      redirect_uri: opts.redirectUri,
      code_verifier: opts.codeVerifier,
    },
    "token endpoint",
  );
}

/** Use a refresh token (public client). */
export function refreshTokens(opts: {
  tokenEndpoint: string;
  clientId: string;
  refreshToken: string;
}): Promise<EndpointResult> {
  return postForm(
    opts.tokenEndpoint,
    {
      grant_type: "refresh_token",
      client_id: opts.clientId,
      refresh_token: opts.refreshToken,
    },
    "token endpoint",
  );
}

/** Call the userinfo endpoint with a bearer access token. */
export async function fetchUserinfo(opts: {
  userinfoEndpoint: string;
  accessToken: string;
}): Promise<EndpointResult> {
  const headers = {
    Authorization: `Bearer ${opts.accessToken}`,
    Accept: "application/json",
  };
  const response = await fetchJson(
    opts.userinfoEndpoint,
    { method: "GET", headers },
    "userinfo endpoint",
  );
  return {
    request: { method: "GET", url: opts.userinfoEndpoint, headers },
    response,
  };
}

export { FriendlyFetchError };

export type CheckResult = {
  name: string;
  status: "pass" | "fail" | "skip";
  message: string;
};

function hashForAlg(alg: string | undefined): string | undefined {
  if (!alg) return undefined;
  const bits = alg.match(/(256|384|512)$/)?.[1];
  if (!bits) return alg === "EdDSA" ? "SHA-512" : undefined;
  return `SHA-${bits}`;
}

/**
 * The at_hash claim: base64url of the left half of the hash of the access
 * token, using the hash that matches the ID token's alg (OIDC Core §3.1.3.6).
 */
export async function computeAtHash(
  accessToken: string,
  alg: string | undefined,
): Promise<string | undefined> {
  const hash = hashForAlg(alg);
  if (!hash) return undefined;
  const digest = new Uint8Array(
    await crypto.subtle.digest(hash, new TextEncoder().encode(accessToken)),
  );
  return bytesToBase64Url(digest.slice(0, digest.length / 2));
}

/**
 * Validate the claims of a (decoded) ID token against what the client sent.
 * Signature verification is separate (see the JWT tool's verify.ts).
 */
export async function checkIdTokenClaims(opts: {
  header: Record<string, unknown> | undefined;
  payload: Record<string, unknown> | undefined;
  expectedIssuer: string;
  clientId: string;
  expectedNonce?: string;
  accessToken?: string;
  now: number;
}): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  const p = opts.payload;
  if (!p) {
    return [
      {
        name: "ID token",
        status: "fail",
        message: "Could not decode the ID token.",
      },
    ];
  }

  // nonce
  if (opts.expectedNonce === undefined) {
    out.push({
      name: "nonce",
      status: "skip",
      message: "No stored nonce to compare.",
    });
  } else if (p.nonce === opts.expectedNonce) {
    out.push({
      name: "nonce",
      status: "pass",
      message: "Matches the nonce sent in the authorize request.",
    });
  } else {
    out.push({
      name: "nonce",
      status: "fail",
      message:
        p.nonce === undefined
          ? "The ID token has no nonce claim, but one was sent. Reject the token."
          : "Does not match the nonce sent in the authorize request. Reject the token.",
    });
  }

  // iss
  const iss = typeof p.iss === "string" ? p.iss : undefined;
  out.push(
    iss && iss.replace(/\/+$/, "") === opts.expectedIssuer.replace(/\/+$/, "")
      ? {
          name: "iss",
          status: "pass",
          message: "Matches the discovery issuer.",
        }
      : {
          name: "iss",
          status: "fail",
          message: `Expected ${opts.expectedIssuer}, got ${iss ?? "(missing)"}.`,
        },
  );

  // aud / azp
  const aud = Array.isArray(p.aud) ? p.aud : p.aud !== undefined ? [p.aud] : [];
  if (aud.includes(opts.clientId)) {
    out.push({
      name: "aud",
      status: "pass",
      message: `Contains ${opts.clientId}.`,
    });
  } else {
    out.push({
      name: "aud",
      status: "fail",
      message: `Does not contain the client_id ${opts.clientId}.`,
    });
  }
  if (aud.length > 1) {
    out.push(
      p.azp === opts.clientId
        ? {
            name: "azp",
            status: "pass",
            message: "Multiple audiences, and azp is this client.",
          }
        : {
            name: "azp",
            status: "fail",
            message: "Multiple audiences, but azp is not this client.",
          },
    );
  }

  // exp / iat
  if (typeof p.exp === "number") {
    out.push(
      p.exp * 1000 > opts.now
        ? { name: "exp", status: "pass", message: "Not expired." }
        : { name: "exp", status: "fail", message: "Expired." },
    );
  } else {
    out.push({ name: "exp", status: "fail", message: "Missing exp claim." });
  }

  // at_hash
  if (typeof p.at_hash === "string" && opts.accessToken) {
    const alg =
      typeof opts.header?.alg === "string"
        ? (opts.header.alg as string)
        : undefined;
    const expected = await computeAtHash(opts.accessToken, alg);
    if (!expected) {
      out.push({
        name: "at_hash",
        status: "skip",
        message: `Cannot compute at_hash for alg ${alg ?? "(none)"}.`,
      });
    } else if (expected === p.at_hash) {
      out.push({
        name: "at_hash",
        status: "pass",
        message: "The access token matches the ID token's at_hash.",
      });
    } else {
      out.push({
        name: "at_hash",
        status: "fail",
        message: "The access token does not match at_hash.",
      });
    }
  }

  return out;
}
