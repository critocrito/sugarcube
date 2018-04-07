import {get, size} from "lodash/fp";
import {flowP, tapP, whenP, collectP} from "dashp";
import {envelope as env, plugin as p, data as d} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const querySource = "mongodb_relation";

const fetchRelations = (envelope, {cfg, log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return flowP(
    [
      db.fetchRelations,
      tapP(rs => log.info(`Fetched ${size(rs)} relations.`)),
      whenP(
        () => get("mongodb.embed_units", cfg),
        collectP(r =>
          db.fetchData(r.units).then(units => d.concatOne(r, {units})),
        ),
      ),
      rs => env.concatData(rs, envelope),
    ],
    queries,
  );
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
