import {size} from "lodash/fp";
import {flowP, flatmapP, tapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const querySource = "mongodb_query_units";

const queryDb = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return flowP(
    [
      flatmapP(q =>
        flowP(
          [
            () => db.findMany(db.unitsC, q, {}),
            tapP(rs =>
              log.info(`Queried ${size(rs)} units for ${JSON.stringify(q)}.`)
            ),
          ],
          q
        )
      ),
      rs => env.concatData(rs, envelope),
    ],
    queries
  );
};

const plugin = p.liftManyA2([assertDb, queryDb]);

plugin.desc = "Run a query against MongoDB to fetch units.";
plugin.source = {
  name: querySource,
  desc: "JSON, that represents a MongoDB query.",
};

export default plugin;
