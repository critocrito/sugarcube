import {size} from "lodash/fp";
import Promise from "bluebird";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb, unitExistsNot, unitExists} from "../utils";

const storeData = (envelope, {log}) =>
  Promise.all([
    db.updateData(env.filterData(unitExists, envelope)),
    db.storeData(env.filterData(unitExistsNot, envelope)),
  ])
    .spread((updated, created) => {
      log.info(`Updating ${size(updated)} units.`);
      log.info(`Storing ${size(created)} units.`);
    })
    .return(envelope);

const plugin = p.liftManyA2([assertDb, storeData]);

plugin.desc = "Store non existing data units in MongoDB.";

export default plugin;
