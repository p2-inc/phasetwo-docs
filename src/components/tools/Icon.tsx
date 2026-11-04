/**
 * The tools pages' icon component. It registers the bundled icon data from
 * icons-data.json before any icon renders, so these pages never fetch icon
 * definitions from api.iconify.design. Regenerate the data with
 * `node scripts/gen-tool-icons.mjs` after adding an icon.
 */
import { addCollection, Icon } from "@iconify/react";
import data from "./icons-data.json";

addCollection(data);

export { Icon };
