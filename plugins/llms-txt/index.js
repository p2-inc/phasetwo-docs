const fs = require("fs");
const path = require("path");

/**
 * Generates /llms.txt at build time.
 *
 * llms.txt is a plain-text index that language models and AI search crawlers read to
 * understand what a site covers and which URLs are worth retrieving. We had none;
 * competitors do.
 *
 * Rather than hand-maintaining a list that goes stale, this reads the built HTML in
 * outDir and pulls the real <title> and meta description off each page. That keeps it
 * accurate for free and does not depend on any Docusaurus plugin internals.
 */

// Section order and labels. First matching prefix wins, so order matters.
const SECTIONS = [
  { prefix: "/docs/", title: "Documentation" },
  { prefix: "/tutorials/", title: "Keycloak tutorials" },
  { prefix: "/articles/", title: "Articles" },
  { prefix: "/guides/", title: "Guides" },
  { prefix: "/api/", title: "API reference" },
  { prefix: "/blog/", title: "Blog" },
  { prefix: "/keycloak-alternatives/", title: "Keycloak alternatives" },
  { prefix: "/product/", title: "Product" },
  { prefix: "/extensions/", title: "Open source extensions" },
  { prefix: "/hosting/", title: "Managed hosting" },
  { prefix: "/support/", title: "Enterprise support" },
  { prefix: "/tools/", title: "Free tools" },
];

// Listing, pagination and taxonomy pages carry no content of their own.
const EXCLUDE = [
  /^\/404/,
  /^\/search/,
  /\/tags\//,
  /\/page\/\d+/,
  /^\/blog\/archive/,
  /^\/blog\/authors/,
];

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();

function walk(dir, outDir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, outDir, acc);
    else if (entry.name === "index.html") acc.push(full);
  }
  return acc;
}

function extract(file, outDir, siteTitle) {
  const html = fs.readFileSync(file, "utf8");
  const route =
    "/" +
    path
      .relative(outDir, path.dirname(file))
      .split(path.sep)
      .filter(Boolean)
      .join("/");
  const url = route === "/" ? "/" : `${route}/`;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(
    /<meta[^>]+name="description"[^>]+content="([^"]*)"/i,
  );

  let title = titleMatch ? decode(titleMatch[1]) : "";
  // Docusaurus appends " | <site title>" to every page title; strip it.
  if (siteTitle && title.endsWith(`| ${siteTitle}`)) {
    title = title.slice(0, -`| ${siteTitle}`.length).trim();
  }
  return { url, title, description: descMatch ? decode(descMatch[1]) : "" };
}

module.exports = function llmsTxtPlugin(context, options) {
  return {
    name: "llms-txt",

    async postBuild({ outDir, siteConfig }) {
      const { url: siteUrl, title: siteTitle, tagline } = siteConfig;

      const pages = walk(outDir, outDir)
        .map((f) => extract(f, outDir, siteTitle))
        .filter((p) => p.title && !EXCLUDE.some((re) => re.test(p.url)))
        .sort((a, b) => a.url.localeCompare(b.url));

      const grouped = new Map(SECTIONS.map((s) => [s.title, []]));
      const other = [];
      for (const page of pages) {
        if (page.url === "/") continue;
        const section = SECTIONS.find((s) => page.url.startsWith(s.prefix));
        if (section) grouped.get(section.title).push(page);
        else other.push(page);
      }

      const lines = [
        `# ${siteTitle}`,
        "",
        `> ${tagline}`,
        "",
        "Phase Two provides managed Keycloak hosting, enterprise Keycloak support, and a",
        "suite of open-source Keycloak extensions (organizations/multi-tenancy, magic links,",
        "events and webhooks, SCIM provisioning, admin portal, themes, user migration).",
        "",
        "The documentation, tutorials and engineering write-ups below are about open-source",
        "Keycloak generally, not only about our hosted product, and are free to cite.",
        "",
        `- [XML sitemap](${siteUrl}/sitemap.xml)`,
        "",
      ];

      const emit = (heading, items) => {
        if (!items.length) return;
        lines.push(`## ${heading}`, "");
        for (const p of items) {
          const desc = p.description ? `: ${p.description}` : "";
          lines.push(`- [${p.title}](${siteUrl}${p.url})${desc}`);
        }
        lines.push("");
      };

      for (const { title } of SECTIONS) emit(title, grouped.get(title));
      emit("Other pages", other);

      fs.writeFileSync(path.join(outDir, "llms.txt"), lines.join("\n"), "utf8");
      console.log(
        `[llms-txt] wrote llms.txt (${pages.length} pages indexed)`,
      );
    },
  };
};
