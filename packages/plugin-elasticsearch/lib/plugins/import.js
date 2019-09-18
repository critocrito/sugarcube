import {flow, map, concat, merge, size, get} from "lodash/fp";
import {flowP, flatmapP} from "dashp";
import fs from "fs";
import {envelope as env} from "@sugarcube/core";
import glob from "glob";
import pify from "pify";

import {Elastic} from "../elastic";

const globP = pify(glob);
const querySourceGlob = "glob_pattern";
const querySourceQuery = "elastic_query";

const plugin = async (envelope, {cfg, log, stats}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);
  const amount = get("elastic.amount", cfg);
  const includeFields = get("elastic.include_fields", cfg);

  const files = await flowP(
    [
      env.queriesByType(querySourceGlob),
      flatmapP(p => globP(...[p, {nodir: true}])),
      map(file => JSON.parse(fs.readFileSync(file))),
    ],
    envelope,
  );
  const queries = flow([
    env.queriesByType(querySourceQuery),
    map(query => JSON.parse(query)),
  ])(envelope);

  log.debug(`Read ${size(files)} bodies from file.`);
  log.debug(`Read ${size(queries)} bodies from queries.`);
  log.debug(`Using ${host}:${port}/${index}.`);

  const bodies = [files, queries].reduce(concat, []);

  return Elastic.Do(
    function* queryData({query}) {
      let results = [];
      // eslint-disable-next-line no-restricted-syntax
      for (let body of bodies) {
        if (includeFields)
          body = merge(body, {
            _source: includeFields
              .concat(["_sc_*_hash"])
              .map(f => f.replace(/^_sc/, "$sc")),
          });
        const units = yield query(index, body, amount);
        log.debug(`Query: ${JSON.stringify(body)}`);
        results = results.concat(units);
      }

      log.info(`Fetched ${size(results)} units for ${size(bodies)} queries.`);
      stats.count("total", size(results));

      return results;
    },
    {host, port},
  ).then(([rs, history]) => {
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    return env.concatData(rs, envelope);
  });
};

plugin.argv = {
  "elastic.amount": {
    type: "number",
    nargs: 1,
    desc: "The amount of units to fetch.",
  },
  "elastic.include_fields": {
    type: "array",
    desc: "Only include those fields when importing data.",
  },
};

plugin.desc = "Fetch units from Elasticsearch by query files.";

export default plugin;
