const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston that we want to link the colors
winston.addColors(colors);

// Custom format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
);

// Define file transports
const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
    }),
    new winston.transports.File({ 
        filename: path.join('logs', 'all.log'),
    }),
];

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || level(),
    levels,
    format,
    transports,
});

module.exports = logger;