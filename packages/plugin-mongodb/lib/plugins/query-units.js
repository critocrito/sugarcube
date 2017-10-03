import {concat, size} from "lodash/fp";
import {envelope as env, plugin as p, utils} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const {reduceP} = utils.combinators;

const querySource = "mongodb_query_units";

const queryDb = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);
  return reduceP(
    (memo, q) =>
      db
        .findMany(db.unitsC, q, {})
        .tap(rs =>
          log.info(`Queried ${size(rs)} units for ${JSON.stringify(q)}.`)
        )
        .then(concat(memo)),
    [],
    queries
  ).then(rs => env.concatData(rs, envelope));
};

const plugin = p.liftManyA2([assertDb, queryDb]);

plugin.desc = "Run a query against MongoDB to fetch units.";
plugin.source = {
  name: querySource,
  desc: "JSON, that represents a MongoDB query.",
};

export default plugin;
