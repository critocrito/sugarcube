import {get, size} from "lodash/fp";
import {flowP, tapP} from "dashp";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const querySource = "mongodb_unit";

const fetchUnits = (envelope, {log, cfg}) => {
  const fromUri = get("mongodb.from_uri", cfg);
  const queries = env.queriesByType(querySource, envelope);

  if (fromUri) {
    log.info(`Fetching data from ${fromUri}.`);
    db.initialize(fromUri);
  }

  return flowP(
    [
      db.fetchData,
      tapP(rs => log.info(`Fetched ${size(rs)} units.`)),
      rs => env.concatData(rs, envelope),
    ],
    queries,
  );
};

const plugin = p.liftManyA2([assertDb, fetchUnits]);

plugin.desc = "Fetch units from MongoDB by their ID.";
plugin.source = {
  name: querySource,
  desc: "A unit hash ID.",
};

export default plugin;
