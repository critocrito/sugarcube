import {size} from "lodash/fp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const querySource = "mongodb_query_units";

const queryDb = async (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  let data = [];

  for (const q of queries) {
    // eslint-disable-next-line no-await-in-loop
    const results = await db.findMany(db.unitsC, q, {
      _sc_id_hash: 1,
      _sc_source: 1,
      _sc_id: 1,
      tweet_id: 1,
    });
    log.info(`Queried ${size(results)} units for ${JSON.stringify(q)}.`);
    data = data.concat(results);
  }

  return env.concatData(data, envelope);
};

const plugin = p.liftManyA2([assertDb, queryDb]);

plugin.desc = "Run a query against MongoDB to fetch units.";
plugin.source = {
  name: querySource,
  desc: "JSON, that represents a MongoDB query.",
};

export default plugin;
