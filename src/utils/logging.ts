// src/utils/logging.ts

import { Request, Response } from 'express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { z } from 'zod';

import { loggingConfig } from '../config/LoggingConfig';

/**
 * Schema for log metadata
 */
const LogMetadataSchema = z.record(z.unknown());

/**
 * Custom format for anonymization
 */
const anonymizeFormat = winston.format((info) => {
  if (loggingConfig.anonymization.enabled) {
    loggingConfig.anonymization.fields.forEach((field) => {
      if (info[field]) {
        info[field] = '[REDACTED]';
      }
    });
  }

  return info;
});

/**
 * Creates a custom format based on the config
 * @param format - The desired log format
 * @param timestamp - Whether to include timestamp
 * @returns Winston log format
 */
const createFormat = (format: string, timestamp: boolean): winston.Logform.Format => {
  const formats: winston.Logform.Format[] = [
    anonymizeFormat(),
    timestamp ? winston.format.timestamp() : winston.format.simple(),
    format === 'json' ? winston.format.json() : winston.format.simple(),
    format === 'colorized' ? winston.format.colorize() : winston.format.simple(),
  ];

  return winston.format.combine(...formats);
};

// Create console transport
const consoleTransport = new winston.transports.Console({
  level: loggingConfig.console.level,
  format: createFormat(loggingConfig.console.format, loggingConfig.console.timestamp),
});

// Create file transport
const fileTransport = new DailyRotateFile({
  level: loggingConfig.file.level,
  filename: loggingConfig.file.filename,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: loggingConfig.file.maxsize,
  maxFiles: loggingConfig.file.maxFiles,
  format: createFormat(loggingConfig.file.format, loggingConfig.file.timestamp),
});

// Configure rotation options
if (loggingConfig.rotation.enabled) {
  fileTransport.options.frequency = loggingConfig.rotation.frequency;
  fileTransport.options.maxFiles = `${loggingConfig.rotation.maxRetentionPeriod}d`;
}

// Create logger
const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [consoleTransport, fileTransport],
});

/**
 * Logs an error message with its stack trace
 * @param {Error} error - The error object
 */
export const logErrorWithStack = (error: Error): void => {
  logger.error(error.message, { stack: error.stack });
};

/**
 * Logs an HTTP request
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
export const logRequest = (req: Request, res: Response): void => {
  const { method, url, headers, body } = req;
  const { statusCode } = res;

  logger.http(`${method} ${url} - ${statusCode}`, {
    headers,
    body,
  });
};

/**
 * Anonymizes log data based on the configuration
 * @param {Record<string, unknown>} logData - The log data to anonymize
 * @returns {Record<string, unknown>} The anonymized log data
 */
export const anonymizeLogData = (logData: Record<string, unknown>): Record<string, unknown> => {
  if (!loggingConfig.anonymization.enabled) {
    return logData;
  }

  const anonymizedData = { ...logData };

  loggingConfig.anonymization.fields.forEach((field) => {
    if (anonymizedData[field]) {
      anonymizedData[field] = '[REDACTED]';
    }
  });

  return anonymizedData;
};

/**
 * Custom log method with support for additional metadata
 * @param level - Log level
 * @param message - Log message
 * @param meta - Optional metadata
 */
const customLog = (
  level: string,
  message: string,
  meta?: z.infer<typeof LogMetadataSchema>
): void => {
  logger.log(level, message, meta);
};

type LogFunction = (message: string, meta?: z.infer<typeof LogMetadataSchema>) => void;

interface ILogger {
  error: LogFunction;
  warn: LogFunction;
  info: LogFunction;
  http: LogFunction;
  verbose: LogFunction;
  debug: LogFunction;
  silly: LogFunction;
}

const loggerInterface: ILogger = {
  error: (message: string, meta?: z.infer<typeof LogMetadataSchema>): void =>
    customLog('error', message, meta),
  warn: (message: string, meta?: z.infer<typeof LogMetadataSchema>): void =>
    customLog('warn', message, meta),
  info: (message: string, meta?: z.infer<typeof LogMetadataSchema>): void =>
    customLog('info', message, meta),
  http: (message: string, meta?: z.infer<typeof LogMetadataSchema>): void =>
    customLog('http', message, meta),
  verbose: (message: string, meta?: z.infer<typeof LogMetadataSchema>): void =>
    customLog('verbose', message, meta),
  debug: (message: string, meta?: z.infer<typeof LogMetadataSchema>): void =>
    customLog('debug', message, meta),
  silly: (message: string, meta?: z.infer<typeof LogMetadataSchema>): void =>
    customLog('silly', message, meta),
};

export default loggerInterface;
