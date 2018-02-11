import {size, get} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";
import {data} from "@sugarcube/test";

const plugin = (envelope, {cfg, log}) => {
  const dataSize = get("test.data_size", cfg);
  const units = data(dataSize);

  log.info(`Generated ${size(units)} units.`);

  return env.concat(envelope, env.envelopeData(units));
};

plugin.desc = "Generate random units.";

plugin.argv = {
  "test.data_size": {
    type: "number",
    nargs: 1,
    default: 100,
    desc: "Specify how many units to generate.",
  },
};

export default plugin;
