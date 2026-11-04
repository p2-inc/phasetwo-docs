/**
 * Shareable deep links for the URL-driven tools, e.g.
 * https://phasetwo.io/tools/oidc-discovery#url=https%3A%2F%2Fissuer.example.com
 *
 * Links put the target URL in the fragment rather than the query string. A
 * fragment is never sent in the HTTP request, so the issuer or JWKS URL being
 * inspected does not land in web-server or CDN logs, and analytics page views
 * omit it by default. `?url=` is still accepted on input for convenience.
 *
 * Only the URL is ever encoded — never tokens or pasted JSON.
 */

const PARAM = "url";

function fromParams(raw: string): string | undefined {
  const params = new URLSearchParams(raw.replace(/^[#?]/, ""));
  const v = params.get(PARAM)?.trim();
  if (!v) return undefined;
  // Only http(s) targets; anything else is ignored rather than fetched.
  return /^https?:\/\//i.test(v) ? v : undefined;
}

/** Read the target URL from a location's fragment (preferred) or query. */
export function readDeepLink(loc: {
  hash: string;
  search: string;
}): string | undefined {
  return fromParams(loc.hash) ?? fromParams(loc.search);
}

/** The fragment (including "#") that deep-links a tool page to `target`. */
export function deepLinkHash(target: string): string {
  return `#${new URLSearchParams({ [PARAM]: target.trim() }).toString()}`;
}

/** Build a share link for `target` on the page at `pageUrl`. */
export function buildShareLink(pageUrl: string, target: string): string {
  const u = new URL(pageUrl);
  u.search = "";
  u.hash = deepLinkHash(target);
  return u.toString();
}
