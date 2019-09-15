import {
  flow,
  curry,
  map,
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
import path from "path";
import {inspect} from "util";
import dotenv from "dotenv";
import {runner, createFeatureDecisions} from "@sugarcube/core";
import v8 from "v8";

import {mapFiles, parseConfigFile, parseConfigFileWithExtends} from ".";
import {createLogger} from "./logger";
import {modules} from "./packages";

// eslint-disable-next-line import/no-dynamic-require
const {name: project} = require(path.resolve(process.cwd(), "package.json"));

// Make sure we have all requested plugins.
// <type>:<term> -> {type: "<type>", term: "<term>"}
const cliQueries = map(
  flow([
    s => {
      const results = s.match(/^([a-z_]*):(.*)/);
      return [results[1], results[2]];
    },
    zipObject(["type", "term"]),
  ]),
);

// Load variables from .env
dotenv.config();

// Load all available plugins.
const plugins = modules().plugins();
const features = modules().features();

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
    ].join(" "),
  )
  // Imitate the behavior of .config('c')
  .coerce(
    "q",
    flow([
      arg => (isArray(arg) ? arg : arg.split(",")),
      mapFiles(parseConfigFile),
    ]),
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
  .option("D")
  .array("D")
  .alias("D", "features")
  .describe("D", "Enable feature flags")
  .option("list-features")
  .boolean("list-features")
  .describe("list-features", "List all available feature toggles.")
  .option("list-plugins")
  .boolean("list-plugins")
  .describe("list-plugins", "List all available plugins.")
  .config("c", parseConfigFileWithExtends)
  .nargs("C", 1)
  .string("C")
  .default("C", "./.sugarcube_cache.json")
  .alias("C", "cache")
  .describe("C", "Location of the cache file.")
  .option("name")
  .describe("name", "A human friendly name for this pipeline.")
  .help("h")
  .alias("h", "help")
  .version();

// Finalize the argument parsing for every plugin.
const {argv} = Object.keys(plugins)
  .sort()
  .reduce((memo, name) => {
    const plugin = plugins[name];
    const description = plugin.desc;
    const options = plugin.argv || {};
    return memo
      .group(keys(options), `${name}: ${description}`)
      .options(options);
  }, yargs);

const logger = createLogger(argv.debug ? "debug" : "info");
const {debug, info, error} = logger;

const haltAndCough = curry((d, e) => {
  error(e.message);
  if (d) {
    error(e);
  }
  process.exit(1);
});

process.on("unhandledRejection", haltAndCough(argv.debug));

if (argv.listFeatures) {
  Object.keys(features).forEach(feature =>
    info(`${feature}: ${features[feature].desc}`),
  );
  process.exit(0);
}
if (argv.listPlugins) {
  Object.keys(plugins)
    .sort()
    .forEach(plugin => info(`${plugin}: ${plugins[plugin].desc}`));
  process.exit(0);
}

createFeatureDecisions(argv.features || []);

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

if (argv.debug) {
  const limitMb = v8.getHeapStatistics().total_available_size / 1024 / 1024;
  debug(`Memory limit set to ${Math.round(limitMb)} MB.`);
}

const argvOmit = [
  "_",
  "h",
  "help",
  "q",
  "Q",
  "d",
  "D",
  "features",
  "list-features",
  "listFeatures",
  "list-plugins",
  "listPlugins",
  "c",
  "p",
  "$0",
  "C",
  "cache",
  "queries",
];
const config = flow([
  omit(argvOmit),
  cfg => merge(cfg, {project, queries, cache, plugins}),
])(argv);

// Now we have our queries and config, we can create a sugarcube run, and
// execute it. We also listen to events emitted by the runner.
let run;

try {
  run = runner(plugins, config, queries);
} catch (e) {
  haltAndCough(argv.debug, e);
}

run.events.on("log", ({type, msg}) => logger.log(type, msg));
run.events.on("stats", ({stats}) => {
  const statsNames = Object.keys(stats);
  const text = isEmpty(statsNames) ? "none" : statsNames.join(", ");
  debug(`Receiving stats for: ${text}`);
  debug(inspect(stats, {color: true, depth: null}), stats);
});
run.events.on("plugin_start", ({plugin}) => {
  info(`Starting the ${plugin} plugin.`);
});
run.events.on("plugin_end", ({plugin}) => {
  info(`Finished the ${plugin} plugin.`);
});
run.events.on("error", haltAndCough(argv.debug));

info(`Starting run ${run.marker}.`);

// Run the pipeline.
run()
  .then(() => fs.writeFileSync(argv.cache, JSON.stringify(run.cache.get())))
  .then(() => info("Finished the LSD."))
  .catch(haltAndCough(argv.debug));
