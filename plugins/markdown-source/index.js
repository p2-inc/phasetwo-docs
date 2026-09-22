const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { getMarkdownUrl } = require("./lib/markdown-path");
const { cleanMarkdownForDisplay } = require("./lib/clean-markdown");
const { recordImgMapping } = require("./lib/img-mapping");
const { isIncludedRoute, serializeMatchers } = require("./lib/route-filter");
const {
  getFrontMatterTitle,
  withTitleHeading,
} = require("./lib/front-matter-title");

/**
 * Writes a raw-markdown twin of every content page into the build output, so that
 * appending `.md` to a page URL returns its source instead of the rendered HTML.
 * The "Copy as Markdown" button in the article header reads the same files.
 *
 * Vendored from https://github.com/FlyNumber/markdown_docusaurus_plugin (MIT, v2.2.5).
 * Local changes:
 *   - `include`/`exclude` route filtering. Upstream emits a .md for every route with a
 *     markdown source. The API reference is generated React components wrapped around a
 *     payload, so the component stripping below reduces those pages to a heading and a
 *     line of prose -- worse than no file at all. See docusaurus.config.js for the lists.
 *   - No theme/Root.js. The button is a normal React component rendered from the
 *     DocItem/BlogPostItem swizzles rather than a second React root mounted by a
 *     MutationObserver, and the unrelated hash-scroll workaround is dropped.
 *   - Node's own fs instead of fs-extra, so the plugin adds no dependency.
 *   - The front-matter title is restored as an H1. Titles live in front matter on this
 *     site and the cleaner strips front matter, so upstream's output opened on a
 *     paragraph with nothing naming the page.
 */

// Flatten the nested Docusaurus route tree into a flat array
function flattenRoutes(routes) {
  return routes.flatMap((route) => [
    route,
    ...(route.routes ? flattenRoutes(route.routes) : []),
  ]);
}

// Strip the baseUrl prefix from a URL path to get a build-relative path
function stripBaseUrl(urlPath, baseUrl) {
  if (baseUrl !== "/" && urlPath.startsWith(baseUrl)) {
    return urlPath.slice(baseUrl.length);
  }
  return urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
}

module.exports = function markdownSourcePlugin(context, options = {}) {
  const include = options.include || [];
  const exclude = options.exclude || [];

  return {
    name: "markdown-source-plugin",

    async contentLoaded({ actions }) {
      // The button needs the same route lists the build used, or it would offer a
      // .md URL on pages that have no .md file.
      actions.setGlobalData({
        include: serializeMatchers(include),
        exclude: serializeMatchers(exclude),
      });
    },

    async postBuild({ outDir, routes, baseUrl }) {
      const allRoutes = flattenRoutes(routes);
      const mdRoutes = allRoutes.filter((route) => {
        const src = route.metadata?.sourceFilePath;
        if (!src || !(src.endsWith(".md") || src.endsWith(".mdx")))
          return false;
        return isIncludedRoute(route.path, { include, exclude });
      });

      let copiedCount = 0;
      const imgDirsToCopy = new Map(); // sourceImgDir -> Set<destImgDir>

      for (const route of mdRoutes) {
        const sourceRelPath = route.metadata.sourceFilePath;
        const sourcePath = path.join(context.siteDir, sourceRelPath);

        // Route URL directory, used to rewrite relative image paths
        const routeDir = route.path.endsWith("/")
          ? route.path
          : route.path.replace(/[^/]+$/, "");

        // The URL the button will fetch, and where the file has to land
        const fetchUrl = getMarkdownUrl(route.path);
        const buildRelPath = stripBaseUrl(fetchUrl, baseUrl);
        const destPath = path.join(outDir, buildRelPath);

        try {
          await fsp.mkdir(path.dirname(destPath), { recursive: true });
          const content = await fsp.readFile(sourcePath, "utf8");
          const cleaned = cleanMarkdownForDisplay(content, routeDir);
          await fsp.writeFile(
            destPath,
            withTitleHeading(cleaned, getFrontMatterTitle(content)),
            "utf8",
          );
          copiedCount++;
        } catch (error) {
          console.error(
            `[markdown-source-plugin] Failed to process ${sourceRelPath}: ${error.message}`,
          );
        }

        // Track img directories next to this source file. One source directory can need
        // several destinations, because sibling docs in the same directory can be routed
        // into different URL spaces (via `slug:`).
        const imgDir = path.join(path.dirname(sourcePath), "img");
        const imgOutRelDir = stripBaseUrl(routeDir, baseUrl);
        recordImgMapping(
          imgDirsToCopy,
          imgDir,
          path.join(outDir, imgOutRelDir, "img"),
        );
      }

      let imgDirCount = 0;
      for (const [source, dests] of imgDirsToCopy) {
        if (!fs.existsSync(source)) continue;
        for (const dest of dests) {
          try {
            await fsp.cp(source, dest, { recursive: true });
            imgDirCount++;
          } catch (error) {
            console.error(
              `[markdown-source-plugin] Failed to copy ${path.relative(context.siteDir, source)}: ${error.message}`,
            );
          }
        }
      }

      console.log(
        `[markdown-source-plugin] Wrote ${copiedCount} markdown files and copied ${imgDirCount} image directories`,
      );
    },
  };
};
