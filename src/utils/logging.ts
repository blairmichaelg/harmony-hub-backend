// src/utils/logging.ts

import { Request } from 'express';
import { createLogger, format, transports } from 'winston';

import 'winston-daily-rotate-file';
import config from '../config';
import { CustomError } from './errorUtils';

const loggerTransports = [];

if (config.logging.console) {
  loggerTransports.push(new transports.Console());
}

if (config.logging.file) {
  loggerTransports.push(
    new transports.DailyRotateFile({
      filename: config.logging.file,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  );
}

const logger = createLogger({
  level: config.logging.level,
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    }),
  ),
  transports: loggerTransports,
});

/**
 * Logs an HTTP request
 * @param {Request} req - The Express request object
 */
export const logRequest = (req: Request): void => {
  logger.http(`HTTP ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
  });
};

/**
 * Logs an error with its stack trace
 * @param {Error} error - The error object
 */
export const logErrorWithStack = (error: Error): void => {
  if (error instanceof CustomError) {
    logger.error(error.message, {
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    });
  } else {
    logger.error(error.message, { stack: error.stack });
  }
};

/**
 * Anonymizes log data based on configuration
 * @param {LogData} logData - The log data to anonymize
 * @returns {LogData} The anonymized log data
 */
interface LogData {
  [key: string]: unknown;
  userId?: string;
  message: string;
  timestamp: Date;
}

export const anonymizeLogData = (logData: LogData): LogData => {
  const anonymizedData = { ...logData };
  if (config.logging.anonymization && config.logging.anonymization.fields) {
    config.logging.anonymization.fields.forEach((field: string) => {
      delete anonymizedData[field];
    });
  }
  return anonymizedData;
};

export default logger;
