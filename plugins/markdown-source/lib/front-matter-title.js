/**
 * Most pages on this site carry their title in front matter rather than as an H1 in the
 * body, and the cleaner strips front matter. Left alone the raw markdown would open on
 * its first paragraph with nothing saying what the page is, which is exactly what the
 * tools fetching it need most.
 */

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
const TITLE_LINE = /^title\s*:\s*(.+?)\s*$/m;

/** The `title` from a document's front matter, or null. */
function getFrontMatterTitle(source) {
  if (typeof source !== "string") return null;
  const block = source.match(FRONT_MATTER);
  if (!block) return null;
  const line = block[1].match(TITLE_LINE);
  if (!line) return null;
  let title = line[1].trim();
  // Strip one layer of YAML quoting, which titles containing a colon need.
  const quoted = title.match(/^(['"])([\s\S]*)\1$/);
  if (quoted) title = quoted[2];
  return title.length > 0 ? title : null;
}

/** Prepend the title as an H1, unless the body already opens with one. */
function withTitleHeading(body, title) {
  if (!title) return body;
  if (/^#\s/.test(body.trimStart())) return body;
  return `# ${title}\n\n${body}`;
}

module.exports = { getFrontMatterTitle, withTitleHeading };
