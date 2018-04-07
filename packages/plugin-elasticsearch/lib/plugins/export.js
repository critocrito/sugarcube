import {size, get} from "lodash/fp";

import {Elastic} from "../elastic";
import {omitFromData} from "../utils";

const plugin = (envelope, {cfg, log}) => {
  const host = get("elastic.host", cfg);
  const port = get("elastic.port", cfg);
  const index = get("elastic.index", cfg);
  const omitFields = get("elastic.omit_fields", cfg);

  return Elastic.Do(
    function* indexUnits({bulk}) {
      const toIndex = omitFromData(omitFields, envelope.data);

      log.info(`Indexing ${size(toIndex)} units.`);

      const errors = yield bulk(index, {index: toIndex});

      if (size(errors) > 0) {
        errors.forEach(e =>
          log.error(
            `Unit ${e.id} threw an error (${e.error.type}): ${e.error.reason}`,
          ),
        );
        throw new Error(`Indexing units threw an error.`);
      }
    },
    host,
    port,
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
};

export default plugin;
