import {merge, size, get} from "lodash/fp";
import {flatmapP} from "dashp";
import fs from "fs";
import {envelope as env} from "@sugarcube/core";
import glob from "glob";
import pify from "pify";

import {Elastic} from "../elastic";

const globP = pify(glob);
const querySource = "glob_pattern";

const plugin = async (envelope, {cfg, log}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);
  const amount = get("elastic.amount", cfg);
  const includeFields = get("elastic.include_fields", cfg);

  const patterns = env.queriesByType(querySource, envelope);
  const files = await flatmapP(p => globP(...[p, {nodir: true}]), patterns);

  return Elastic.Do(
    function* queryData({query}) {
      let results = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const file of files) {
        let body = JSON.parse(fs.readFileSync(file));
        if (includeFields)
          body = merge(body, {
            _source: includeFields
              .concat(["_sc_*_hash"])
              .map(f => f.replace(/^_sc/, "$sc")),
          });
        const units = yield query(index, body, amount);
        log.info(`Fetched ${size(units)}/${amount} units for ${file}.`);
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
  "elastic.include_fields": {
    type: "array",
    desc: "Only include those fields when importing data.",
  },
};

plugin.desc = "Fetch units from Elasticsearch by query files.";

export default plugin;
