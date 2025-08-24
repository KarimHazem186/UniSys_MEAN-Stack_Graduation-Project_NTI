const winston = require("winston");
const path = require("path");
const fs = require("fs");

const DailyRotateFile = require("winston-daily-rotate-file");
const util = require("util");

const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const dailyRotateTransport = new DailyRotateFile({
  // filename: 'logs/app-%DATE%.log',  // %DATE% is replaced by date
  filename: path.join(logDir, "app-%DATE%.log"), // <-- استخدم logDir

  datePattern: "YYYY-MM-DD", // rotate daily
  zippedArchive: true, // compress old logs
  maxSize: "20m", // max size per file
  maxFiles: "14d", // keep logs for 14 days
});

const cutomConsoleFormat = winston.format.printf(
  ({ level, message, stack, timestamp }) => {
    const isVerbose = process.env.LOG_VERBOSE === "true";

    if (stack && isVerbose) {
      return `\n${timestamp} ${level}: ❌ ${message}\n🧵 Stack:\n${stack}`;
    }

    if (stack) {
      const firstLine = stack.split("\n")[1]?.trim();
      const shortPath = firstLine?.replace(process.cwd(), ".");
      return `\n${timestamp} ${level}: ❌ ${message}\n📍 ${shortPath}\n🧵 LOG_VERBOSE=true to show full stack\n`;
    }
    return `[${timestamp}] [${level}]: ${message}`;
  }
);

// Custom printf-style format
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
//   levels: {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     debug: 4,
//   },
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    // winston.format.json()
    customFormat
  ),
  transports: [
    dailyRotateTransport,
    // General log file
    new winston.transports.File({
      filename: path.join(logDir, "requests.log"),
      level: "info",
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),

    // new winston.transports.Console({
    //   level: "info",
    //   format: winston.format.combine(
    //     winston.format.colorize(), // adds colors to console output
    //     winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    //     // winston.format.simple()        // simple readable format
    //     // winston.format.json()
    //     customFormat
    //   ),
    // }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
    }),
  ],
  exitOnError: false, // Don't crash app on exceptions
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        cutomConsoleFormat
      ),
    })
  );
}

// Optional: printf-style wrapper (like C's printf)
logger.printf = (level, formatStr, ...args) => {
  const formatted = util.format(formatStr, ...args);
  logger[level](formatted);
};


module.exports = logger;
