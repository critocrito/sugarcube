import {get, size} from "lodash/fp";
import {envelope as env, plugin as p, data as d, utils} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const {mapP} = utils.combinators;

const querySource = "mongodb_relation";

const fetchRelations = (envelope, {cfg, log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return db.fetchRelations(queries).then(results => {
    log.info(
      `Fetched ${size(results)} out of ${size(queries)} requested relations.`
    );

    if (get("mongodb.embed_units", cfg)) {
      return mapP(
        r => db.fetchData(r.units).then(units => d.concatOne(r, {units})),
        results
      ).then(rs => env.concatData(rs, envelope));
    }
    return env.concatData(results, envelope);
  });
};

const plugin = p.liftManyA2([assertDb, fetchRelations]);

plugin.desc = "Fetch relations from MongoDB by their ID.";
plugin.source = {
  name: querySource,
  desc: "A relation hash ID.",
};

plugin.argv = {
  "mongodb.embed_units": {
    type: "boolean",
    desc: "Resolve embedded units when fetching relations or revisons.",
    default: true,
  },
};

export default plugin;
