import {get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {Elastic} from "../elastic";

const plugin = async (envelope, {cfg, log, stats}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);

  log.info(`Using ${host}:${port}/${index}.`);

  const ids = envelope.data.map((u) => u._sc_id_hash);

  if (ids.length > 0) stats.count("total", ids.length);

  const [results, history] = await Elastic.Do(
    function* complementLeft({queryByIds}) {
      const existing = yield queryByIds(index, ids);

      log.info(`Supplementing ${existing.length} existing units.`);

      return existing;
    },
    {host, port},
  );

  history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));

  if (ids.length > 0) stats.count("new", ids.length - results.length);
  if (ids.length > 0) stats.count("existing", results.length);

  return env.concatDataLeft(results, envelope);
};

plugin.argv = {};

plugin.desc = "Left complement with data stored in Elasticsearch.";

export default plugin;
