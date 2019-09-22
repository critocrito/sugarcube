import {snakeCase} from "lodash/fp";
import StatsD from "hot-shots";

const instrument = cfg => {
  const {statsd} = cfg;
  const name = snakeCase(cfg.name);
  const project = snakeCase(cfg.project);
  const client = new StatsD({
    host: statsd.host,
    port: statsd.port,
    telegraf: statsd.telegraf,
  });

  const fmtMetric = ({type}) => {
    return `sugarcube.${project}.${name}.${type}`;
  };

  return {
    fail: ({plugin}) => {
      const metric = fmtMetric({type: `${plugin}.fail`});
      client.increment(metric);
    },

    count: ({type, term}) => {
      const metric = fmtMetric({type});
      client.increment(metric, term == null ? 1 : term);
    },

    duration: ({type, term}) => {
      const metric = fmtMetric({type});
      client.timing(metric, term);
    },

    end: () => {
      client.close();
    },
  };
};

instrument.desc =
  "Log metrics in a StatsD backend [fail, end, count, duration].";

instrument.argv = {
  "statsd.host": {
    type: "string",
    default: "localhost",
    nargs: 1,
    desc: "The hostname of StatsD server.",
  },
  "statsd.port": {
    type: "number",
    default: 8125,
    nargs: 1,
    desc: "The port of StatsD server.",
  },
  "statsd.telegraf": {
    type: "boolean",
    default: true,
    desc: "Support the special StatsD syntax of Telegraf.",
  },
};

export default instrument;
