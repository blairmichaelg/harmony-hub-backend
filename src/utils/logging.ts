// src/utils/logging.ts

import { Request, Response } from 'express';
import { createLogger, format, transports } from 'winston';
import { loggingConfig } from '../config/LoggingConfig';
import { CustomError } from './errorUtils';

const logger = createLogger({
  level: loggingConfig.level,
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    }),
  ),
  transports: [
    loggingConfig.console // Use console config value
      ? new transports.Console()
      : undefined,
    loggingConfig.file
      ? new transports.File({ filename: loggingConfig.file })
      : undefined,
  ].filter(Boolean) as transports.TransportStream[],
});

/**
 * Logs an HTTP request
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
export const logRequest = (req: Request, res: Response): void => {
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
 * @param {any} logData - The log data to anonymize
 * @returns {any} The anonymized log data
 */
export const anonymizeLogData = (logData: any): any => {
  // This function is currently not used and might need to be implemented
  // based on your specific anonymization requirements.
  const anonymizedData = { ...logData };
  // Example: Remove sensitive fields
  // if (loggingConfig.anonymization && loggingConfig.anonymization.fields) {
  //   loggingConfig.anonymization.fields.forEach((field: string) => {
  //     delete anonymizedData[field];
  //   });
  // }
  return anonymizedData;
};

export default logger;
