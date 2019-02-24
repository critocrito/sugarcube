import {pick, get} from "lodash/fp";
import {envelope as env, utils} from "@sugarcube/core";

const {sToA} = utils;

const plugin = (envelope, {log, cfg}) => {
  const pickFields = sToA(",", get("workflow.pick_fields", cfg));

  if (pickFields.length === 0) {
    log.info("No fields to pick. Skipping.");
    return envelope;
  }

  log.info(`Picking fields: ${pickFields.join(", ")}`);

  return env.fmapData(pick(pickFields), envelope);
};

plugin.argv = {
  "workflow.pick_fields": {
    type: "string",
    nargs: 1,
    desc: "List of fields to pick from data units.",
  },
};

plugin.desc = "Pick fields from data units.";

export default plugin;
