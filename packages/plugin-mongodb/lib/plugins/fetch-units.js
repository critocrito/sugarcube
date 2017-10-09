import {size} from "lodash/fp";
import {flowP, tapP} from "combinators-p";
import {envelope as env, plugin as p} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const querySource = "mongodb_unit";

const fetchUnits = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return flowP(
    [
      db.fetchData,
      tapP(rs => log.info(`Fetched ${size(rs)} units.`)),
      rs => env.concatData(rs, envelope),
    ],
    queries
  );
};

const plugin = p.liftManyA2([assertDb, fetchUnits]);

plugin.desc = "Fetch units from MongoDB by their ID.";
plugin.source = {
  name: querySource,
  desc: "A unit hash ID.",
};

export default plugin;
