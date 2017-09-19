import winston from "winston";

// Setup logging
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  timestamp: true,
  colorize: true,
  level: "debug",
});

const {info, warn, error, debug} = winston;

export {info, warn, error, debug};
export default {info, warn, error, debug};
