import {omit, get} from "lodash/fp";
import {envelope as env, utils} from "@sugarcube/core";

const {sToA} = utils;

const plugin = (envelope, {log, cfg}) => {
  const omitFields = sToA(",", get("workflow.omit_fields", cfg));

  if (omitFields.length === 0) {
    log.info("No fields to omit. Skipping.");
    return envelope;
  }

  log.info(`Omitting fields: ${omitFields.join(", ")}`);

  return env.fmapData(omit(omitFields), envelope);
};

plugin.argv = {
  "workflow.omit_fields": {
    type: "string",
    nargs: 1,
    desc: "List of fields to omit from data units.",
  },
};

plugin.desc = "Omit fields from data units.";

export default plugin;
