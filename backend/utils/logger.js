const winston = require("winston");
const path = require("path");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({
      filename: path.join(__dirname, "logs", "app.log"),
    }), // Log to file
  ],
});

module.exports = logger;
