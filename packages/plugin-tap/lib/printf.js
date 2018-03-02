/* eslint-disable no-console */
import {omit, getOr, take} from "lodash/fp";
import {inspect} from "util";

const printf = (envelope, {stats, cfg, cache}) => {
  const {data, queries} = envelope;
  const {plugins} = cfg;
  const limit = getOr(null, "tap.limit", cfg);
  // FIXME: The default from printf.argv doesn't work here.
  const selection = getOr("data", "tap.select", cfg).split(",");
  const printables = {
    data,
    queries,
    stats,
    cache,
    plugins,
    cfg: omit(["queries", "stats", "cache", "plugins"], cfg),
  };
  const opts = {colors: true, depth: null, maxArrayLength: null};

  selection.forEach(s => {
    console.log(`${s}:`);
    switch (s) {
      case "data": {
        console.log(inspect(limit ? take(limit, data) : data, opts));
        break;
      }
      case "stats": {
        console.log(inspect(stats.get(), opts));
        break;
      }
      case "cache": {
        console.log(inspect(cache.get(), opts));
        break;
      }
      default:
        console.log(inspect(printables[s], opts));
    }
  });

  return envelope;
};

printf.desc = "Print the envelope to the screen.";

printf.argv = {
  "tap.select": {
    type: "string",
    nargs: 1,
    default: "data",
    desc: "Specify what to log: data,queries,cfg,stats,cache,plugins",
  },
};

export default printf;
