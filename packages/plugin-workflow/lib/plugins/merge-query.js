import {get, set, merge} from "lodash/fp";
import {envelope as env, utils} from "@sugarcube/core";

const plugin = (envelope, {cfg, log}) => {
  const overwrite = get("workflow.overwrite_query_merge", cfg);
  const fields = utils.sToA(",", get("workflow.merge_query_fields", cfg));

  if (fields.length === 0) {
    log.info("No query fields are configured to be merged. Skipping.");
    return envelope;
  }

  log.info(
    `Merging the following fields from the query into the unit: ${fields.join(
      ", ",
    )}`,
  );

  return env.fmapData(
    unit =>
      unit._sc_queries.reduce((memo, query) => {
        const toMerge = fields.reduce((acc, field) => {
          const oldValue = get(field, unit);
          const newValue = get(field, query);

          if (!overwrite && oldValue != null) {
            log.info(
              `Not overwriting ${oldValue} with ${newValue} for field ${field} in ${
                query.type
              }/${unit._sc_id_hash}`,
            );
            return acc;
          }

          if (overwrite && oldValue != null) {
            log.info(
              `Overwriting ${oldValue} with ${newValue} for field ${field} in ${
                query.type
              }/${unit._sc_id_hash}`,
            );
          } else {
            log.info(
              `Merging ${newValue} for field ${field} in ${query.type}/${
                unit._sc_id_hash
              }`,
            );
          }

          return Object.assign(acc, set(field, newValue, {}));
        }, {});
        return merge(memo, toMerge);
      }, unit),
    envelope,
  );
};

plugin.argv = {
  "workflow.merge_query_fields": {
    type: "string",
    desc: "List the query fields to merge into the unit.",
  },
  "workflow.overwrite_query_merge": {
    type: "boolean",
    desc: "Overwrite unit values with query values when merging.",
    default: false,
  },
};

plugin.desc = "Merge fields from the query object into the unit.";

export default plugin;
