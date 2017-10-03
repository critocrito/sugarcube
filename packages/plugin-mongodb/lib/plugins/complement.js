import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import exists from "./exists";
import {assertDb, unitExists, unitExistsNot} from "../utils";

const complement = (envelope, {log}) =>
  db
    .complementData(env.filterData(unitExists, envelope))
    .tap(rs => log.info(`Complementing ${size(rs)} units.`))
    .then(rs => env.concatData(rs, env.filterData(unitExistsNot, envelope)));

const plugin = p.liftManyA2([assertDb, exists, complement]);

plugin.desc = "Look up existing units in the DB and add missing fields.";

export default plugin;
