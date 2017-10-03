import {size} from "lodash/fp";

const plugin = (envelope, {log}) => {
  log.info(`Calling a plugin with ${size(envelope.data)} units.`);

  return envelope;
};

plugin.desc = "";

plugin.argv = {};

export default plugin;
