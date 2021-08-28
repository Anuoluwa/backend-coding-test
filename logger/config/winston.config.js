const winston = require("winston");
const path = require("app-root-path");

const { combine, timestamp, printf } = require("winston").format;

const custom = {
  levels: {
    http: 6,
    trace: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 0,
  },
  console: {
    console: {
      level: "debug",
      handleException: true,
      json: false,
      colorize: false,
    },
  },
  colors: {
    http: "green",
    trace: "white",
    debug: "white",
    info: "greenn",
    warn: "yellow",
    error: "magenta",
    fatal: "red",
  },
  fileInfo: {
    level: "info",
    filename: `${path}/logs/app_logs_info.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  fileError: {
    level: "info",
    filename: `${path}/logs/app_logs_error.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
};

const myFormat = printf(
  ({ message, timestamp, label }) => `${timestamp} ,${label} || '', ${message}`,
);

const loggerOptions = {
  format: combine(
    timestamp(),
    winston.format.colorize({ all: true }),
    myFormat,
  ),
  levels: custom.levels,
  transports: [
    new winston.transports.File(custom.fileInfo),
    new winston.transports.File(custom.fileError),
    new winston.transports.Console(custom.console),
  ],
  exitOnError: false,
};

const logger = winston.createLogger(loggerOptions);

module.exports = logger;
