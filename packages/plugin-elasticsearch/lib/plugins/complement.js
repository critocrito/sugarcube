import {size, get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {Elastic} from "../elastic";

const plugin = async (envelope, {cfg, log, stats}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);

  return Elastic.Do(
    function* complement({queryByIds}) {
      const ids = envelope.data.map(u => u._sc_id_hash);
      const existing = yield queryByIds(index, ids);

      stats.update("pipeline", st => {
        const {created, complemented} = st;
        const newlyCreated = ids.length - existing.length;
        return Object.assign({}, st, {
          created: Array.isArray(created)
            ? created.concat(newlyCreated)
            : [newlyCreated],
          complemented: Array.isArray(complemented)
            ? complemented.concat(existing.length)
            : [existing.length],
        });
      });

      log.info(`Complementing ${size(existing)} existing units.`);
      return existing;
    },
    {host, port},
  ).then(([rs, history]) => {
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    return env.concatData(rs, envelope);
  });
};

plugin.argv = {};

plugin.desc = "Complement with data stored in Elasticsearch.";

export default plugin;
