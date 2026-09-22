/**
 * Route matching shared by the build step and the client-side button.
 *
 * A matcher is either a string (matched as a path prefix) or a RegExp (tested against
 * the route path). Both forms are compared against the route as Docusaurus generates
 * it, which starts with the baseUrl and -- with `trailingSlash: true` -- ends in "/".
 *
 * RegExp matchers cannot survive `setGlobalData`, which serializes to JSON, so they
 * are converted to a plain `{source, flags}` object on the way out and rebuilt on the
 * way in. Keeping that round trip here is what lets the build and the browser agree on
 * exactly which pages have a .md twin.
 */

function toMatcher(entry) {
  if (entry instanceof RegExp) return entry;
  if (typeof entry === "string") return entry;
  if (entry && typeof entry === "object" && typeof entry.source === "string") {
    return new RegExp(entry.source, entry.flags || "");
  }
  return null;
}

function matches(routePath, entry) {
  const matcher = toMatcher(entry);
  if (!matcher) return false;
  if (typeof matcher === "string") return routePath.startsWith(matcher);
  return matcher.test(routePath);
}

/**
 * True when the route should get a .md twin. An empty `include` means "every route
 * with a markdown source"; a non-empty one is an allowlist. `exclude` always wins.
 */
function isIncludedRoute(routePath, { include = [], exclude = [] } = {}) {
  if (typeof routePath !== "string" || routePath.length === 0) return false;
  if (exclude.some((entry) => matches(routePath, entry))) return false;
  if (include.length === 0) return true;
  return include.some((entry) => matches(routePath, entry));
}

/** Make a matcher list JSON-safe so it can be handed to the browser. */
function serializeMatchers(entries = []) {
  return entries
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry instanceof RegExp) {
        return { source: entry.source, flags: entry.flags };
      }
      return null;
    })
    .filter((entry) => entry !== null);
}

module.exports = { isIncludedRoute, serializeMatchers };
