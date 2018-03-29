import {
  flow,
  curry,
  map,
  reduce,
  merge,
  concat,
  join,
  omit,
  keys,
  difference,
  zipObject,
  isArray,
  isString,
  isEmpty,
} from "lodash/fp";
import fs from "fs";
import dotenv from "dotenv";
import {runner, utils} from "@sugarcube/core";

import {mapFiles, parseConfigFile, parseConfigFileWithExtends} from "./";
import {info, warn, error, debug} from "./logger";
import {modules} from "./packages";

const reduceObj = reduce.convert({cap: false});
const {pluginOptions} = utils;

const haltAndCough = curry((d, e) => {
  error(e.message);
  if (d) {
    error(e);
  }
  process.exit(1);
});

// Make sure we have all requested plugins.
// <type>:<term> -> {type: "<type>", term: "<term>"}
const cliQueries = map(
  flow([
    s => {
      const results = s.match(/^([a-z_]*):(.*)/);
      return [results[1], results[2]];
    },
    zipObject(["type", "term"]),
  ])
);

// Load variables from .env
dotenv.config();

// Basic arguments for the command line tool.
const yargs = require("yargs")
  .env("SUGARCUBE_")
  .nargs("p", 1)
  .alias("p", "plugins")
  .string("p")
  .describe("p", "A list of plugins")
  .coerce("p", arg => {
    // arg can be "plugin1,plugin2" or ["plugin1", "plugin2"].
    if (isString(arg)) return arg.split(",");
    if (isArray(arg)) return arg;
    return [];
  })
  .nargs("q", 1)
  .describe(
    "q",
    [
      "Path to JSON queries file.",
      "Can be specified multiple times, or multiple files can be separated",
      "by a comma.",
    ].join(" ")
  )
  // Imitate the behavior of .config('c')
  .coerce(
    "q",
    flow([
      arg => (isArray(arg) ? arg : arg.split(",")),
      mapFiles(parseConfigFile),
    ])
  )
  .option("Q", {
    type: "array",
    desc: [
      "Queries in the form: <type>:<term>.",
      "Note that spaces have to be escaped, e.g.: ",
      "twitter_search:Keith\\ Johnstone",
    ].join(" "),
    coerce: cliQueries,
  })
  .option("d")
  .boolean("d")
  .alias("d", "debug")
  .describe("d", "Enable debug logging")
  .config("c", parseConfigFileWithExtends)
  .nargs("C", 1)
  .string("C")
  .default("C", "./.sugarcube_cache.json")
  .alias("C", "cache")
  .describe("C", "Location of the cache file.")
  .help("h")
  .alias("h", "help")
  .version();

// Load all available plugins.
const plugins = modules().plugins();

// Finalize the argument parsing for every plugin.
const {argv} = flow([
  pluginOptions,
  reduceObj(
    (memo, p, name) =>
      memo.group(keys(p.argv), `${name}: ${p.desc}`).options(p.argv),
    yargs
  ),
])(plugins);

process.on("unhandledRejection", haltAndCough(argv.debug));

// Halt if a plugin in the pipeline is not available.
const missingPlugins = flow([keys, difference(argv.plugins)])(plugins);
if (!isEmpty(missingPlugins)) {
  const msg = `Missing the following plugins: ${join(", ", missingPlugins)}`;
  haltAndCough(argv.debug, new Error(msg));
}

// We can collect queries from a file as well as the command line.
const queries = flow([
  concat(argv.q ? argv.q : []),
  concat(argv.Q ? argv.Q : []),
  concat(argv.queries ? argv.queries : []),
])([]);

let cache;
if (fs.existsSync(argv.cache)) {
  cache = JSON.parse(fs.readFileSync(argv.cache).toString());
} else {
  cache = {};
}

const argvOmit = [
  "_",
  "h",
  "help",
  "q",
  "Q",
  "d",
  "debug",
  "c",
  "p",
  "$0",
  "C",
  "cache",
  "queries",
];
const config = flow([
  omit(argvOmit),
  cfg => merge(cfg, {queries, cache, plugins}),
])(argv);

// Now we have our queries and config, we can create a sugarcube run, and
// execute it. We also wire the logging to the stream messages.
let run;

try {
  run = runner(plugins, config, queries);
} catch (e) {
  haltAndCough(argv.debug, e);
}

run.stream.onValue(msg => {
  let statsNames;
  let text;

  switch (msg.type) {
    case "log_info":
      info(msg.msg);
      break;
    case "log_warn":
      warn(msg.msg);
      break;
    case "log_error":
      error(msg.msg);
      break;
    case "log_debug":
      if (argv.debug) {
        debug(msg.msg);
      }
      break;
    case "plugin_start":
      info(`Starting the ${msg.plugin} plugin.`);
      break;
    case "plugin_end":
      info(`Finished the ${msg.plugin} plugin.`);
      break;
    case "stats":
      statsNames = Object.keys(msg.stats);
      text = isEmpty(statsNames) ? "none" : statsNames.join(", ");
      info(`receiving stats for: ${text}`);
      break;
    default:
      break;
  }
});
run.stream.onEnd(() => info("Finished the LSD."));
run.stream.onError(haltAndCough(argv.debug));

info(`Starting run ${run.marker}.`);

// Run the pipeline.
run()
  .then(() => fs.writeFileSync(argv.cache, JSON.stringify(run.cache.get())))
  .catch(haltAndCough(argv.debug));
