const winston = require('winston')
const {LoggingWinston} = require('@google-cloud/logging-winston')
const loggingWinston = new LoggingWinston()
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    // Add Stackdriver Logging
    loggingWinston
  ]
})

moudle.exports = {
  logger
}