import {plugin as p} from "@sugarcube/core";

import exists from "./exists";
import storeData from "./store-data";
// import storeRelations from "./store-relations";
// import storeRevisions from "./store-revisions";
import {assertDb} from "../utils";

const plugin = p.liftManyA2([
  assertDb,
  exists,
  storeData,
  // storeRelations,
  // storeRevisions,
]);

plugin.desc =
  "Store new units, revisions of existing units and relations between units.";

export default plugin;
