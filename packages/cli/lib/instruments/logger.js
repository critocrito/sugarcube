import {getOr} from "lodash/fp";
import formatDistance from "date-fns/formatDistance";
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

const humanDuration = s => formatDistance(new Date(0), new Date(s));

const instrument = cfg => {
  const debug = getOr(false, "debug", cfg);
  const colors = getOr(true, "logger.colors", cfg);
  const logger = createLogger(debug ? "debug" : "info", colors);

  const log = ({type, msg}) => {
    logger.log(type, msg);
  };

  const logStats = ({stats}) => {
    const {plugins, project, name} = stats.pipeline;
    const failures = getOr([], "failed", stats);
    const pluginStats = getOr({}, "plugins", stats);

    const logFailures =
      failures.length > 0
        ? `and collected ${failures.length} failures`
        : "and had no failures";

    logger.info(
      `Pipeline ${project}/${name} took ${humanDuration(
        getOr(0, "pipeline.took", stats),
      )} ${logFailures}.`,
    );

    if (plugins != null)
      plugins.forEach(p => {
        const plugin = pluginStats[p];
        const took = getOr(0, "durations.took", plugin);
        const counts = getOr({}, "counts", plugin);
        const durations = getOr({}, "durations", plugin);
        const logCounts = Object.keys(counts)
          .map(c => `${c}=${counts[c]}`)
          .join(", ");
        const logDurations = Object.keys(durations)
          .filter(d => d !== "took")
          .map(d => `${d}=${humanDuration(durations[d])}`)
          .join(", ");
        logger.info(`Plugin ${p} took ${humanDuration(took)}`);

        if (logCounts.length > 0) logger.info(`  counts: ${logCounts}`);
        if (logDurations.length > 0)
          logger.info(`  durations: ${logDurations}`);
      });
  };

  return {log, stats: logStats};
};

instrument.desc =
  "Log messages to STDOUT [log, plugin_start, plugin_end, stats].";

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
