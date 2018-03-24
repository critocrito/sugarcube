import {mergeAll} from "lodash/fp";
import {envelope as env} from "@sugarcube/core";

const querySource = "workflow_merge";

const plugin = (envelope, {log}) => {
  const queries = env.queriesByType(querySource, envelope);

  const xs = queries.map(q => JSON.parse(q));

  xs.forEach(x => log.info(`Merging ${JSON.stringify(x)} into data.`));

  return env.fmapData(unit => mergeAll([unit].concat(xs)), envelope);
};

plugin.argv = {};

plugin.desc = "Merge additional fields into data units.";

export default plugin;
