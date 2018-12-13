import {size, get} from "lodash/fp";
import fs from "fs";
import {envelope as env, utils} from "@sugarcube/core";

import {Elastic} from "../elastic";
import {omitFromData} from "../utils";

const {sToA} = utils;

const plugin = (envelope, {cfg, log}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);
  const omitFields = sToA(",", get("elastic.omit_fields", cfg));
  const mappings = get("elastic.mappings", cfg)
    ? JSON.parse(fs.readFileSync(get("elastic.mappings", cfg)))
    : {};

  if (envelope.data.length === 0) return envelope;

  log.info(`Using ${host}:${port}/${index}.`);

  return Elastic.Do(
    function* indexUnits({bulk, queryExisting}) {
      const ids = envelope.data.map(u => u._sc_id_hash);
      const existingIds = yield queryExisting(index, ids);

      const dataToIndex = env.filterData(
        u => !existingIds.includes(u._sc_id_hash),
        envelope,
      );
      const dataToUpdate = env.filterData(
        u => existingIds.includes(u._sc_id_hash),
        envelope,
      );

      const toIndex = omitFromData(omitFields, dataToIndex.data);
      const toUpdate = omitFromData(omitFields, dataToUpdate.data);

      log.info(`Indexing ${size(toIndex)} units.`);
      log.info(`Updating ${size(toUpdate)} units.`);

      const errors = yield bulk(index, {index: toIndex, update: toUpdate});

      if (size(errors) > 0) {
        errors.forEach(e =>
          log.error(`Unit ${e.id} threw an error: ${e.error}`),
        );
        throw new Error(`Indexing units threw an error.`);
      }
    },
    {host, port, mappings},
  ).then(([, history]) => {
    history.forEach(([k, meta]) => log.debug(`${k}: ${JSON.stringify(meta)}.`));
    return envelope;
  });
};

plugin.desc = "Store data in Elasticsearch.";

plugin.argv = {
  "elastic.omit_fields": {
    type: "string",
    nargs: 1,
    desc: "Omit those fields when exporting.",
  },
  "elastic.mappings": {
    type: "string",
    nargs: 1,
    desc: "Load custom index mappings from a JSON file.",
  },
};

export default plugin;
