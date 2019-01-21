import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import exists from "./exists";
import {assertDb, unitExists} from "../utils";

const complement = (envelope, {log}) =>
  db
    .complementData(env.filterData(unitExists, envelope))
    .then(rs => {
      log.info(`Supplementing ${size(rs)} units.`);
      return rs;
    })
    .then(rs => env.concatDataLeft(rs, envelope));

const plugin = p.liftManyA2([assertDb, exists, complement]);

plugin.desc =
  "Look up existing units in the DB and add missing fields. Prefer New data.";

export default plugin;
