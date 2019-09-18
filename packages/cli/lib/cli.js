import {
  flow,
  curry,
  map,
  filter,
  mergeAll,
  concat,
  join,
  omit,
  keys,
  difference,
  uniq,
  zipObject,
  isArray,
  isString,
  isEmpty,
} from "lodash/fp";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import {runner, createFeatureDecisions} from "@sugarcube/core";
import v8 from "v8";
import loggerInstrument from "./instruments/logger";

import {mapFiles, parseConfigFile, parseConfigFileWithExtends} from ".";
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
const instruments = modules().instruments();

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
  .nargs("I", 1)
  .alias("I", "instruments")
  .string("I")
  .describe("I", "A list of instruments")
  .coerce("I", arg => {
    // arg can be "instrument1,instrument2" or ["instrument1", "instrument2"].
    if (isString(arg)) return arg.split(",");
    if (isArray(arg)) return arg;
    return [];
  })
  .default("I", [])
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
  .option("list-instruments")
  .boolean("list-instruments")
  .describe("list-instruments", "List all available instruments.")
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

// Extend the argument parser for plugin and instrument configuration options
// and finalize the parsing.
Object.keys(instruments)
  .sort()
  .reduce((memo, name) => {
    const instrument = instruments[name];
    const description = instrument.desc;
    const options = instrument.argv || {};
    return memo
      .group(keys(options), `${name}: ${description}`)
      .options(options);
  }, yargs);

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

// Create a local version of the logger instrument, so that we can send log
// messages before the pipeline run.
const logger = loggerInstrument({debug: argv.debug, logger: argv.logger});
const error = msg => logger.log({type: "error", msg});
const debug = msg => logger.log({type: "debug", msg});

// A common exception handler. In case of error, log and simply exit.
const haltAndCough = curry((d, e) => {
  if (d) {
    error(e);
  } else {
    error(e.message);
  }
  process.exit(1);
});

process.on("unhandledRejection", haltAndCough(argv.debug));

// The next command line options just print a list of features, plugins and
// instruments and exit.
if (argv.listFeatures) {
  Object.keys(features).forEach(feature =>
    // eslint-disable-next-line no-console
    console.log(`${feature}: ${features[feature].desc}`),
  );
  process.exit(0);
}
if (argv.listInstruments) {
  Object.keys(instruments).forEach(instrument =>
    // eslint-disable-next-line no-console
    console.log(`${instrument}: ${instruments[instrument].desc}`),
  );
  process.exit(0);
}
if (argv.listPlugins) {
  Object.keys(plugins)
    .sort()
    // eslint-disable-next-line no-console
    .forEach(plugin => console.log(`${plugin}: ${plugins[plugin].desc}`));
  process.exit(0);
}

createFeatureDecisions(argv.features || []);

// Halt if a plugin in the pipeline is not available.
const missingPlugins = flow([keys, difference(argv.plugins)])(plugins);
if (!isEmpty(missingPlugins)) {
  const msg = `Missing the following plugins: ${join(", ", missingPlugins)}`;
  haltAndCough(argv.debug, new Error(msg));
}

// Halt if an instrument is not available.
const missingInstruments = flow([
  keys,
  filter(key => key !== "cli_logger"),
  difference(argv.instruments.filter(key => key !== "cli_logger")),
])(instruments);
if (!isEmpty(missingInstruments)) {
  const msg = `Missing the following instruments: ${join(
    ", ",
    missingInstruments,
  )}`;
  haltAndCough(argv.debug, new Error(msg));
}

// We can collect queries from a file as well as the command line.
const queries = flow([
  concat(argv.q ? argv.q : []),
  concat(argv.Q ? argv.Q : []),
  concat(argv.queries ? argv.queries : []),
])([]);

// Populate the persistency cache across runs.
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

// Produce the final configuration object and omit redundant or unneeded
// fields from the command line parsing.
const argvOmit = [
  "_",
  "h",
  "help",
  "q",
  "Q",
  "d",
  "D",
  "I",
  "instruments",
  "features",
  "list-features",
  "listFeatures",
  "list-plugins",
  "listPlugins",
  "list-instruments",
  "listInstruments",
  "c",
  "p",
  "$0",
  "C",
  "cache",
  "queries",
];
const config = flow([
  omit(argvOmit),
  cfg =>
    mergeAll([
      {project: "Unnamed Project", name: "Unnamed Pipeline"},
      cfg,
      {
        project,
        queries,
        plugins,
      },
    ]),
])(argv);

// Now we have our queries and config, we can create a sugarcube run, and
// execute it. We also listen to events emitted by the runner.
let run;

try {
  run = runner({cache, plugins, config, queries});
} catch (e) {
  haltAndCough(argv.debug, e);
}

// Setup all instrumentation. cli_logger is treated special, since this cli
// always includes it.
flow([
  keys,
  filter(name => argv.instruments.includes(name)),
  concat("cli_logger"),
  uniq,
])(instruments).forEach(name => {
  const instrument = instruments[name](config);
  [
    "log",
    "stats",
    "plugin_start",
    "plugin_end",
    "run",
    "end",
    "fail",
    "count",
    "duration",
  ].forEach(event => {
    if (instrument[event] != null) run.events.on(event, instrument[event]);
  });
});

// Listen for errors from the pipeline run.
run.events.on("error", haltAndCough(argv.debug));

// Run the pipeline.
run()
  .then(() => fs.writeFileSync(argv.cache, JSON.stringify(run.cache.get())))
  .catch(e => {
    haltAndCough(argv.debug, e);
  });
