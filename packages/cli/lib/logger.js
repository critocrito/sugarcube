import winston, {format, transports} from "winston";

const sugarcubeFormat = format.printf(({level, message, timestamp}) => {
  return `${timestamp} - ${level}: ${message}`;
});

const createLogger = level => {
  const logger = winston.createLogger({
    level,
    format: format.combine(
      format.timestamp(),
      format.errors({stack: true}),
      format.colorize(),
      format.splat(),
      sugarcubeFormat,
    ),
    transports: [new transports.Console()],
  });
  return logger;
};

export {createLogger};
