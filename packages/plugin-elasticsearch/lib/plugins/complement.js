import {size, get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {Elastic} from "../elastic";

const plugin = async (envelope, {cfg, log}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);

  return Elastic.Do(
    function* complement({queryByIds}) {
      const ids = envelope.data.map(u => u._sc_id_hash);
      const existing = yield queryByIds(index, ids);
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
