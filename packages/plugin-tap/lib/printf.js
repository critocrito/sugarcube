/* eslint-disable no-console */
import {omit, getOr, take} from "lodash/fp";
import {utils} from "@sugarcube/core";
import {inspect} from "util";

const {sToA} = utils;

const printf = (envelope, {stats, cfg, cache}) => {
  const {data, queries} = envelope;
  const {plugins} = cfg;
  const limit = getOr(null, "tap.limit", cfg);
  // FIXME: The default from printf.argv doesn't work here.
  const selection = sToA(",", getOr("data", "tap.select", cfg));
  const exclude = sToA(",", getOr([], "tap.exclude", cfg));
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
        console.log(
          inspect(
            limit
              ? take(limit, data).map(omit(exclude))
              : data.map(omit(exclude)),
            opts,
          ),
        );
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
  "tap.exclude": {
    type: "string",
    nargs: 1,
    desc: "Exclude those fields from printing to the console.",
  },
};

export default printf;
