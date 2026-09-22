# markdown-source

Publishes a raw markdown twin of every content page. Appending `.md` to a page URL returns its source instead of the rendered HTML — `https://phasetwo.io/docs/introduction/` is also available at `https://phasetwo.io/docs/introduction/index.md`. The "Copy as Markdown" control in the page header (`src/components/MarkdownActions`) reads the same files, and the swizzles in `src/theme/DocItem/Content` and `src/theme/BlogPostItem/Content` render it.

Vendored from [FlyNumber/markdown_docusaurus_plugin](https://github.com/FlyNumber/markdown_docusaurus_plugin) v2.2.5 (MIT — see `LICENSE`), rather than taken as a dependency, because it needed changes that are specific to this site. Local changes:

- **Route filtering.** Upstream writes a `.md` for every route that has a markdown source. The API reference is generated from the OpenAPI specs into React components wrapped around a payload, so stripping those components leaves a title and a sentence — an empty page, which is worse than no file. `include` and `exclude` (configured in `docusaurus.config.js`) decide which routes get a twin, and the browser reads the same lists through the plugin's global data so the control never offers a URL that was not written.
- **No `theme/Root.js`.** Upstream mounts the control by attaching a second React root to the article header from a `MutationObserver`, and ships an unrelated hash-scroll workaround alongside it. Here it is an ordinary component rendered from two swizzles.
- **No `fs-extra`.** Node's own `fs` covers what the build step needs, so the plugin adds no dependency.

The `lib/` cleaners are upstream's, and so are most of the tests. `transformOutsideCodeFences` is what keeps the JSX-component stripping away from things like `<String>`, `<Token>` and `<Assertion>` where they appear inside fenced code blocks, which happens a lot in this content.

## Options

| Option    | Type                      | Description                                                                                                   |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `include` | `Array<string \| RegExp>` | Routes that get a `.md` twin. Strings match as path prefixes. Empty means every route with a markdown source. |
| `exclude` | `Array<string \| RegExp>` | Routes that never get one. Applied before `include`.                                                          |

## Tests

`pnpm test` — plain `node --test`, no test framework.
