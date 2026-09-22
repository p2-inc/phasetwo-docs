const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isIncludedRoute, serializeMatchers } = require("../lib/route-filter");

// The lists the site actually ships, so these tests fail if the config drifts.
const SITE = {
  include: ["/docs/", "/tutorials/", "/guides/", "/updates/", "/blog/"],
  exclude: ["/api/"],
};

test("content sections get a markdown twin", () => {
  for (const route of [
    "/docs/introduction/",
    "/tutorials/authentication/totp-mfa/",
    "/guides/keycloak-upgrades/",
    "/updates/2026-09/",
    "/blog/instant-mcp-authorization-keycloak/",
  ]) {
    assert.equal(isIncludedRoute(route, SITE), true, route);
  }
});

// The API reference is generated React components, not prose. Both generated trees are
// covered by the single "/api/" prefix, and a third one would be too.
test("no API reference route gets a markdown twin", () => {
  for (const route of [
    "/api/",
    "/api/introduction/",
    "/api/get-organizations/",
    "/api/management/",
    "/api/management/create-cluster/",
    "/api/some-future-spec/whatever/",
  ]) {
    assert.equal(isIncludedRoute(route, SITE), false, route);
  }
});

test("routes outside the listed sections are skipped", () => {
  for (const route of ["/", "/pricing/hosting/", "/search/", "/extensions/"]) {
    assert.equal(isIncludedRoute(route, SITE), false, route);
  }
});

test("exclude wins over include", () => {
  const options = { include: ["/docs/"], exclude: ["/docs/internal/"] };
  assert.equal(isIncludedRoute("/docs/internal/notes/", options), false);
  assert.equal(isIncludedRoute("/docs/introduction/", options), true);
});

test("an empty include list means every route", () => {
  assert.equal(
    isIncludedRoute("/anything/", { include: [], exclude: [] }),
    true,
  );
});

test("regular expressions are supported on both lists", () => {
  const options = { include: [/^\/docs\//], exclude: [/draft/] };
  assert.equal(isIncludedRoute("/docs/introduction/", options), true);
  assert.equal(isIncludedRoute("/docs/draft-page/", options), false);
  assert.equal(isIncludedRoute("/blog/post/", options), false);
});

test("bad input never claims a route is included", () => {
  assert.equal(isIncludedRoute("", SITE), false);
  assert.equal(isIncludedRoute(undefined, SITE), false);
  assert.equal(isIncludedRoute("/docs/x/", undefined), true);
});

// Global data is serialized to JSON, so a RegExp has to survive the round trip or the
// browser and the build would disagree about which pages have a .md twin.
test("matchers survive the round trip through global data", () => {
  const serialized = JSON.parse(
    JSON.stringify({
      include: serializeMatchers(["/docs/", /^\/tutorials\//]),
      exclude: serializeMatchers([/^\/api\//]),
    }),
  );
  assert.equal(isIncludedRoute("/docs/introduction/", serialized), true);
  assert.equal(isIncludedRoute("/tutorials/x/", serialized), true);
  assert.equal(isIncludedRoute("/api/management/x/", serialized), false);
  assert.equal(isIncludedRoute("/pricing/", serialized), false);
});

test("serializeMatchers drops values it cannot represent", () => {
  assert.deepEqual(serializeMatchers(["/docs/", 42, null, undefined]), [
    "/docs/",
  ]);
});
