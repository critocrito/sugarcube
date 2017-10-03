import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const querySource = "mongodb_unit";

const fetchUnits = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return db.fetchData(queries).then(results => {
    log.info(
      `Fetched ${size(results)} out of ${size(queries)} requested units.`
    );
    return env.concatData(results, envelope);
  });
};

const plugin = p.liftManyA2([assertDb, fetchUnits]);

plugin.desc = "Fetch units from MongoDB by their ID.";
plugin.source = {
  name: querySource,
  desc: "A unit hash ID.",
};

export default plugin;
