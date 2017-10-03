import {
  flow,
  curry,
  map,
  forEach,
  concat,
  join,
  split,
  omit,
  keys,
  pickBy,
  has,
  first,
  difference,
  zipObject,
  isArray,
  isString,
  isEmpty,
} from "lodash/fp";
import dotenv from "dotenv";
import {runner} from "@sugarcube/core";

import {mapFiles, parseConfigFile, parseConfigFileWithExtends} from "./";
import {info, error, debug} from "./logger";
import {list, load} from "./plugins";

const forEachObj = forEach.convert({cap: false});

const haltAndCough = curry((d, e) => {
  error(e.message);
  if (d) {
    error(e);
  }
  process.exit(1);
});

// Make sure we have all requested plugins.
// <type>:<term>,... -> [{type: "<type>", term: "<term>"}, ...]
const cliQueries = flow([
  split(","),
  map(flow([split(":"), zipObject(["type", "term"])])),
]);

// Load variables from .env
dotenv.config();

// Basic arguments for the command line tool.
const yargs = require("yargs")
  .env("LF_")
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
  .nargs("Q", 1)
  .describe(
    "Q",
    [
      "Queries in the form: <type>:<term>[,<type>:<term>[,..]].",
      "Note that spaces have to be escaped, e.g.: ",
      // eslint-disable-next-line no-useless-escape
      "twitter_search:Keith Johnstone",
    ].join(" ")
  )
  .coerce("Q", cliQueries)
  .option("d")
  .boolean("d")
  .alias("d", "debug")
  .describe("d", "Enable debug logging")
  .config("c", parseConfigFileWithExtends)
  .help("h")
  .alias("h", "help")
  .version();

// Load all plugin functionalities and finalize the argument parsing.
const [plugins, missing] = flow([list, load])();

// eslint-disable-next-line lodash-fp/no-unused-result
flow([
  pickBy(has("argv")),
  forEachObj((p, name) =>
    yargs.group(keys(p.argv), `${name}: ${p.desc}`).options(p.argv)
  ),
])(plugins);

const {argv} = yargs;

const argvOmit = ["_", "h", "help", "q", "Q", "d", "debug", "c", "p", "$0"];
const config = omit(argvOmit, argv);

// We can collect queries from a file as well as the command line.
const queries = concat(argv.q ? argv.q : [], argv.Q ? argv.Q : []);

// Make sure all requested plugins are available.
if (!isEmpty(missing)) {
  const msg = `Missing the following modules: ${join(", ", missing)}`;
  haltAndCough(argv.debug, new Error(msg));
}

const missingPlugins = flow([keys, difference(argv.plugins)])(plugins);
if (!isEmpty(missingPlugins)) {
  const msg = `Missing the following plugins: ${join(", ", missingPlugins)}`;
  haltAndCough(argv.debug, new Error(msg));
}

// Now we have our queries and config, we can create a sugarcube run, and
// execute it. We also wire the logging to the stream messages.
let run;

try {
  run = runner(plugins, config, queries);
} catch (e) {
  haltAndCough(argv.debug, e);
}

run.stream.onValue(msg => {
  switch (msg.type) {
    case "log_info":
      info(msg.msg);
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
    default:
      break;
  }
});
run.stream.onEnd(() => info("Finished the LSD."));
run.stream.onError(haltAndCough(argv.debug));

info(`Starting run ${run.marker}.`);

// Run the pipeline.
run().catch(haltAndCough(argv.debug));
