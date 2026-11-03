#!/usr/bin/env node
/**
 * Regenerates src/components/tools/icons-data.json: the Material Design Icons
 * used by the /tools pages, bundled so those pages never fetch icon data from
 * api.iconify.design at runtime.
 *
 * Run after adding or changing an `mdi:*` icon anywhere under the tools
 * directories: `node scripts/gen-tool-icons.mjs`. The tools icon test fails
 * when an icon is used but missing from the bundle.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const TOOL_DIRS = ["src/components/tools", "src/pages/tools"];
const OUT = "src/components/tools/icons-data.json";

export function collectToolIcons(root = process.cwd()) {
  const names = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else if (/\.(tsx?|jsx?|mjs)$/.test(entry)) {
        for (const m of readFileSync(path, "utf8").matchAll(
          /["'`]mdi:([a-z0-9-]+)["'`]/g,
        )) {
          names.add(m[1]);
        }
      }
    }
  };
  for (const dir of TOOL_DIRS) walk(join(root, dir));
  return [...names].sort();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const names = collectToolIcons();
  const res = await fetch(
    `https://api.iconify.design/mdi.json?icons=${names.join(",")}`,
  );
  if (!res.ok) throw new Error(`Iconify API returned ${res.status}`);
  const data = await res.json();
  const missing = names.filter((n) => !data.icons?.[n] && !data.aliases?.[n]);
  if (missing.length) throw new Error(`Unknown icons: ${missing.join(", ")}`);
  delete data.lastModified;
  writeFileSync(OUT, JSON.stringify(data) + "\n");
  console.log(`Wrote ${names.length} icons to ${OUT}`);
}
