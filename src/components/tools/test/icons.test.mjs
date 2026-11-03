import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  TOOL_DIRS,
  collectToolIcons,
} from "../../../../scripts/gen-tool-icons.mjs";

test("every mdi icon used by the tools pages is bundled", () => {
  const data = JSON.parse(
    readFileSync(new URL("../icons-data.json", import.meta.url), "utf8"),
  );
  const missing = collectToolIcons().filter(
    (n) => !data.icons[n] && !data.aliases?.[n],
  );
  assert.deepEqual(
    missing,
    [],
    `Run \`node scripts/gen-tool-icons.mjs\` to bundle: ${missing.join(", ")}`,
  );
});

test("tools code imports Icon from the bundled wrapper, not @iconify/react", () => {
  // A direct import would still render, but fetch icon data from the API.
  const offenders = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (
        /\.(tsx?|jsx?)$/.test(entry) &&
        !path.endsWith(join("components", "tools", "Icon.tsx")) &&
        readFileSync(path, "utf8").includes("@iconify/react")
      )
        offenders.push(path);
    }
  };
  for (const dir of TOOL_DIRS) walk(dir);
  assert.deepEqual(offenders, []);
});
