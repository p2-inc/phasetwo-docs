const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  getFrontMatterTitle,
  withTitleHeading,
} = require("../lib/front-matter-title");

test("reads the title out of front matter", () => {
  const source = [
    "---",
    "id: introduction",
    "title: Introduction",
    "---",
    "",
    "Body.",
  ].join("\n");
  assert.equal(getFrontMatterTitle(source), "Introduction");
});

test("strips one layer of YAML quoting", () => {
  assert.equal(
    getFrontMatterTitle(
      '---\ntitle: "SAML, Simplified: a primer"\n---\n\nBody.',
    ),
    "SAML, Simplified: a primer",
  );
  assert.equal(
    getFrontMatterTitle("---\ntitle: 'Single quoted'\n---\n\nBody."),
    "Single quoted",
  );
});

test("no front matter, no title, or an empty title yields null", () => {
  assert.equal(getFrontMatterTitle("# Just a heading\n"), null);
  assert.equal(getFrontMatterTitle("---\nid: x\n---\n\nBody."), null);
  assert.equal(getFrontMatterTitle("---\ntitle:   \n---\n\nBody."), null);
  assert.equal(getFrontMatterTitle(undefined), null);
});

test("a title key in the body is not mistaken for front matter", () => {
  assert.equal(
    getFrontMatterTitle("Body text\n\ntitle: not front matter\n"),
    null,
  );
});

test("the heading is prepended to a body that has none", () => {
  assert.equal(
    withTitleHeading("Body.", "Introduction"),
    "# Introduction\n\nBody.",
  );
});

test("a body that already opens with an H1 is left alone", () => {
  const body = "# Introduction\n\nBody.";
  assert.equal(withTitleHeading(body, "Introduction"), body);
  assert.equal(
    withTitleHeading("\n\n# Introduction\n", "Other"),
    "\n\n# Introduction\n",
  );
});

test("an H2 is not treated as the page title", () => {
  assert.equal(
    withTitleHeading("## Section\n", "Page"),
    "# Page\n\n## Section\n",
  );
});

test("without a title the body is returned unchanged", () => {
  assert.equal(withTitleHeading("Body.", null), "Body.");
});
