import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb, unitExistsNot} from "../utils";

const storeRelations = (envelope, {log}) =>
  db
    .storeRelations(env.filterData(unitExistsNot, envelope))
    .then(relations => log.info(`Storing ${size(relations)} relations.`))
    .then(() => envelope);

const plugin = p.liftManyA2([assertDb, storeRelations]);

plugin.desc = "Store relationships in MongoDB.";

export default plugin;
