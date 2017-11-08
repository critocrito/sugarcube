import {size} from "lodash/fp";
import {flowP, tapP, collectP} from "dashp";
import {envelope as env, plugin as p, data as d} from "@sugarcube/core";

import db from "../db";
import {assertDb} from "../utils";

const querySource = "mongodb_unit";

const fetchRevisions = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  return flowP(
    [
      db.fetchRevisions,
      tapP(rs => log.info(`Fetched ${size(rs)} revisions.`)),
      collectP(r => db.fetchUnit(r.unit).then(u => d.concatOne(r, {unit: u}))),
      rs => env.concatData(rs, envelope),
    ],
    queries
  );
};

const plugin = p.liftManyA2([assertDb, fetchRevisions]);

plugin.desc = "Fetch revisions of a unit from MongoDB by their ID.";
plugin.source = {
  name: querySource,
  desc: "A revision hash ID.",
};

export default plugin;
