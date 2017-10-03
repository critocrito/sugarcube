import {size} from "lodash/fp";
import {envelope as env, plugin as p, data as d, utils} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const {mapP} = utils.combinators;

const querySource = "mongodb_unit";

const fetchRevisions = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return db
    .fetchRevisions(queries)
    .then(results => {
      log.info(
        `Fetched ${size(results)} out of ${size(queries)} requested revisions.`
      );

      return mapP(
        r => db.fetchUnit(r.unit).then(u => d.concatOne(r, {unit: u})),
        results
      );
    })
    .then(results => env.concatData(results, envelope));
};

const plugin = p.liftManyA2([assertDb, fetchRevisions]);

plugin.desc = "Fetch revisions of a unit from MongoDB by their ID.";
plugin.source = {
  name: querySource,
  desc: "A revision hash ID.",
};

export default plugin;
