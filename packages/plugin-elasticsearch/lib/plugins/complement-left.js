import {size, get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {Elastic} from "../elastic";

const plugin = async (envelope, {cfg, log, stats}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);

  log.info(`Using ${host}:${port}/${index}.`);

  return Elastic.Do(
    function* complementLeft({queryByIds}) {
      const ids = envelope.data.map(u => u._sc_id_hash);
      const existing = yield queryByIds(index, ids);

      stats.update("pipeline", st => {
        const {total, created, complemented} = st;
        const newTotal = ids.length;
        const newlyCreated = ids.length - existing.length;
        return Object.assign({}, st, {
          total: Array.isArray(total) ? total.concat(newTotal) : [newTotal],
          created: Array.isArray(created)
            ? created.concat(newlyCreated)
            : [newlyCreated],
          complemented: Array.isArray(complemented)
            ? complemented.concat(existing.length)
            : [existing.length],
        });
      });

      log.info(`Left complementing ${size(existing)} existing units.`);
      return existing;
    },
    {host, port},
  ).then(([rs, history]) => {
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    return env.concatDataLeft(rs, envelope);
  });
};

plugin.argv = {};

plugin.desc = "Left complement with data stored in Elasticsearch.";

export default plugin;
