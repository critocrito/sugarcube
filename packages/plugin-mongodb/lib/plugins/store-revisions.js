import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb, unitExists} from "../utils";

const storeRevisions = (envelope, {log}) =>
  db
    .storeRevisions(env.filterData(unitExists, envelope))
    .then((revisions) => log.info(`Storing ${size(revisions)} revisions.`))
    .then(() => envelope);

const plugin = p.liftManyA2([assertDb, storeRevisions]);

plugin.desc = "Store revisions of content in MongoDB.";

export default plugin;
