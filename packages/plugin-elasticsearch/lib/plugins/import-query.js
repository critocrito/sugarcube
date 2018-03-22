import {size, get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

import {Elastic} from "../elastic";

const querySource = "elastic_query";

const plugin = async (envelope, {cfg, log}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);
  const amount = get("elastic.amount", cfg);

  const queries = env.queriesByType(querySource, envelope);

  return Elastic.Do(
    function* queryData({query}) {
      let results = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const q of queries) {
        const body = JSON.parse(q);
        const units = yield query(index, body, amount);
        log.info(`Fetched ${size(units)}/${amount} units for ${q}.`);
        results = results.concat(units);
      }
      return results;
    },
    host,
    port
  ).then(([rs, history]) => {
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    return env.concatData(rs, envelope);
  });
};

plugin.argv = {
  "elastic.amount": {
    type: "number",
    nargs: 1,
    default: 1000,
    desc: "The amount of units to fetch.",
  },
};

plugin.desc = "Fetch units from Elasticsearch by queries.";

export default plugin;
