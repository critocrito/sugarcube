import {getOr} from "lodash/fp";
import {inspect} from "util";
import winston, {format, transports} from "winston";

const sugarcubeFormat = format.printf(({level, message, timestamp, stack}) => {
  if (stack != null) {
    return `${timestamp} - ${level}: ${stack}`;
  }
  return `${timestamp} - ${level}: ${message}`;
});

const createLogger = (level, colorize) => {
  let formatters = [
    format.timestamp(),
    format.errors({stack: true}),
    format.splat(),
    sugarcubeFormat,
  ];
  if (colorize) formatters = [format.colorize()].concat(formatters);

  const logFormat = format.combine(...formatters);

  const logger = winston.createLogger({
    level,
    format: logFormat,
    transports: [new transports.Console()],
  });
  return logger;
};

const instrument = cfg => {
  const debug = getOr(false, "debug", cfg);
  const colors = getOr(true, "logger.colors", cfg);
  const logger = createLogger(debug ? "debug" : "info", colors);

  const log = ({type, msg}) => {
    logger.log(type, msg);
  };

  // eslint-disable-next-line camelcase
  const plugin_start = ({plugin}) => {
    logger.info(`Starting the ${plugin} plugin.`);
    logger.profile(plugin);
  };

  // eslint-disable-next-line camelcase
  const plugin_end = ({plugin}) => {
    logger.info(`Finished the ${plugin} plugin.`);
    logger.profile(plugin);
  };

  const logStats = ({stats}) => {
    const statsNames = Object.keys(stats);
    const text = statsNames.length === 0 ? "none" : statsNames.join(", ");
    logger.debug(`Receiving stats for: ${text}`);
    logger.debug(`\n${inspect(stats, {colors, depth: null})}`);
  };

  const run = ({marker}) => {
    logger.info(`Starting run ${marker}.`);
  };

  const end = () => {
    logger.info("Finished the LSD.");
  };

  return {log, plugin_start, plugin_end, stats: logStats, run, end};
};

instrument.desc =
  "Log messages to STDOUT [log, plugin_start, plugin_end, stats, run, end].";

instrument.argv = {
  debug: {
    type: "boolean",
    default: false,
    desc: "Choose the log level.",
  },
  "logger.colors": {
    type: "boolean",
    default: true,
    desc: "Use colors to log to STDOUT.",
  },
};

export default instrument;
