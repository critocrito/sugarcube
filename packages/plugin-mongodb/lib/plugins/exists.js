import {includes, size} from "lodash/fp";
import {envelope as env, plugin as p, data as d} from "@sugarcube/core";

import db from "../db";
import {assertDb, idHashes} from "../utils";

const existsPlugin = (envelope, {log}) =>
  db.matchUnits(idHashes(envelope.data)).then((hashes) => {
    log.info(`Matched ${size(hashes)} units as existing.`);
    const f = (u) => {
      if (includes(u._sc_id_hash, hashes)) {
        return d.concatOne(u, {_sc_db_exists: true});
      }
      return d.concatOne(u, {_sc_db_exists: false});
    };
    return env.fmapData(f, envelope);
  });

const plugin = p.liftManyA2([assertDb, existsPlugin]);

plugin.desc = "Mark data units whether they are known or unknown.";

export default plugin;
