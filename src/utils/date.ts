// src/utils/date.ts

import { DateTime, Duration, Interval } from 'luxon';
import { z } from 'zod';

import config from '../config';
import { CustomError } from './errorUtils';
import logger from './logging';

/**
 * Schema for date formatting options
 */
const DateFormatOptionsSchema = z.object({
  locale: z.string().optional().describe('Locale for date formatting'),
  format: z.enum(['short', 'long']).optional().describe('Date format style'),
});

type DateFormatOptions = z.infer<typeof DateFormatOptionsSchema>;

/**
 * Formats a date according to the specified options and localization config
 * @param {Date | string | number} date - The date to format
 * @param {DateFormatOptions} options - Formatting options
 * @returns {string} The formatted date string
 * @throws {CustomError} If date is invalid or formatting fails
 */
export const formatDate = (
  date: Date | string | number,
  options: DateFormatOptions = {},
): string => {
  try {
    DateFormatOptionsSchema.parse(options);
    const { locale = config.localization.defaultLocale, format = 'short' } =
      options;
    const dateTime = DateTime.fromJSDate(new Date(date));
    const formatString =
      format === 'short'
        ? config.localization.dateTimeFormat.shortDate
        : config.localization.dateTimeFormat.longDate;

    return dateTime.setLocale(locale).toFormat(formatString);
  } catch (error) {
    logger.error('Date formatting failed:', error);
    throw new CustomError(
      'Invalid date or formatting options',
      'DATE_FORMAT_ERROR',
      400,
    );
  }
};

/**
 * Formats a time according to the localization config
 * @param {Date | string | number} time - The time to format
 * @param {string} locale - The locale to use for formatting
 * @returns {string} The formatted time string
 * @throws {CustomError} If time is invalid or formatting fails
 */
export const formatTime = (
  time: Date | string | number,
  locale: string = config.localization.defaultLocale,
): string => {
  try {
    const dateTime = DateTime.fromJSDate(new Date(time));
    return dateTime
      .setLocale(locale)
      .toFormat(config.localization.dateTimeFormat.time);
  } catch (error) {
    logger.error('Time formatting failed:', error);
    throw new CustomError('Invalid time', 'TIME_FORMAT_ERROR', 400);
  }
};

/**
 * Parses a JWT expiration time
 * @param {string} expiresIn - JWT expiration string (e.g., '1d', '2h')
 * @returns {Duration} Luxon Duration object
 * @throws {CustomError} If parsing fails
 */
export const parseJWTExpiration = (
  expiresIn: string = config.auth.jwt.expiresIn,
): Duration => {
  try {
    const match = expiresIn.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new CustomError(
        'Invalid JWT expiration format',
        'JWT_EXPIRATION_ERROR',
        400,
      );
    }
    const [, value, unit] = match;
    const unitMap: { [key: string]: keyof Duration } = {
      s: 'seconds',
      m: 'minutes',
      h: 'hours',
      d: 'days',
      w: 'weeks',
    };

    return Duration.fromObject({ [unitMap[unit]]: parseInt(value, 10) });
  } catch (error) {
    logger.error('JWT expiration parsing failed:', error);
    throw new CustomError(
      'Invalid JWT expiration format',
      'JWT_EXPIRATION_ERROR',
      400,
    );
  }
};

/**
 * Calculates the expiration date for a given duration
 * @param {Duration} duration - The duration to add to the current date
 * @returns {DateTime} The expiration date
 */
export const calculateExpirationDate = (duration: Duration): DateTime => {
  return DateTime.now().plus(duration);
};

/**
 * Converts a cache TTL from seconds to a Luxon Duration
 * @param {number} ttlSeconds - TTL in seconds
 * @returns {Duration} Luxon Duration object
 */
export const cacheTTLToDuration = (
  ttlSeconds: number = config.cache.local.ttl,
): Duration => {
  return Duration.fromObject({ seconds: ttlSeconds });
};

/**
 * Checks if a date is expired
 * @param {Date | string | number} date - The date to check
 * @returns {boolean} True if the date is in the past, false otherwise
 */
export const isExpired = (date: Date | string | number): boolean => {
  return DateTime.fromJSDate(new Date(date)) < DateTime.now();
};

/**
 * Calculates the time difference between two dates
 * @param {Date | string | number} start - The start date
 * @param {Date | string | number} end - The end date
 * @returns {Duration} The time difference as a Luxon Duration
 */
export const calculateTimeDifference = (
  start: Date | string | number,
  end: Date | string | number,
): Duration => {
  const startDate = DateTime.fromJSDate(new Date(start));
  const endDate = DateTime.fromJSDate(new Date(end));

  return endDate.diff(startDate);
};

/**
 * Formats a duration as a human-readable string
 * @param {Duration} duration - The duration to format
 * @param {string} locale - The locale to use for formatting
 * @returns {string} A human-readable duration string
 * @throws {CustomError} If formatting fails
 */
export const formatDuration = (
  duration: Duration,
  locale: string = config.localization.defaultLocale,
): string => {
  try {
    return duration.reconfigure({ locale }).toHuman();
  } catch (error) {
    logger.error('Duration formatting failed:', error);
    throw new CustomError('Invalid duration', 'DURATION_FORMAT_ERROR', 400);
  }
};

/**
 * Gets the start and end of a given time period
 * @param {string} period - The time period ('day', 'week', 'month', 'year')
 * @param {Date | string | number} date - The reference date
 * @returns {Interval} An interval representing the start and end of the period
 * @throws {CustomError} If an invalid period is provided
 */
export const getTimePeriodBoundaries = (
  period: string,
  date: Date | string | number = new Date(),
): Interval => {
  const dateTime = DateTime.fromJSDate(new Date(date));

  switch (period) {
    case 'day':
      return Interval.fromDateTimes(
        dateTime.startOf('day'),
        dateTime.endOf('day'),
      );
    case 'week':
      return Interval.fromDateTimes(
        dateTime.startOf('week'),
        dateTime.endOf('week'),
      );
    case 'month':
      return Interval.fromDateTimes(
        dateTime.startOf('month'),
        dateTime.endOf('month'),
      );
    case 'year':
      return Interval.fromDateTimes(
        dateTime.startOf('year'),
        dateTime.endOf('year'),
      );
    default:
      logger.error('Invalid time period:', period);
      throw new CustomError('Invalid time period', 'TIME_PERIOD_ERROR', 400);
  }
};

/**
 * Converts a duration to a human-readable format
 * @param {Duration} duration - The duration to format
 * @returns {string} The human-readable duration string
 * @throws {CustomError} If formatting fails
 */
export const durationToHumanReadable = (duration: Duration): string => {
  try {
    return duration.toHuman();
  } catch (error) {
    logger.error('Duration to human-readable format failed:', error);
    throw new CustomError('Invalid duration', 'DURATION_FORMAT_ERROR', 400);
  }
};

/**
 * Gets the current timestamp
 * @returns {string} The current timestamp in ISO format
 */
export const getCurrentTimestamp = (): string => {
  return DateTime.now().toISO();
};

/**
 * Calculates the elapsed time from a given start time to now
 * @param {Date | string | number} startTime - The start time
 * @returns {Duration} The elapsed time as a Luxon Duration
 */
export const calculateElapsedTime = (
  startTime: Date | string | number,
): Duration => {
  const startDateTime = DateTime.fromJSDate(new Date(startTime));
  return DateTime.now().diff(startDateTime);
};

/**
 * Adds a specified amount of time to a given date
 * @param {Date | string | number} date - The date to add time to
 * @param {Duration} duration - The duration to add
 * @returns {DateTime} The new date with the added duration
 */
export const addTime = (
  date: Date | string | number,
  duration: Duration,
): DateTime => {
  const dateTime = DateTime.fromJSDate(new Date(date));
  return dateTime.plus(duration);
};

/**
 * Subtracts a specified amount of time from a given date
 * @param {Date | string | number} date - The date to subtract time from
 * @param {Duration} duration - The duration to subtract
 * @returns {DateTime} The new date with the subtracted duration
 */
export const subtractTime = (
  date: Date | string | number,
  duration: Duration,
): DateTime => {
  const dateTime = DateTime.fromJSDate(new Date(date));
  return dateTime.minus(duration);
};

/**
 * Formats a date range
 * @param {Date | string | number} startDate - The start date
 * @param {Date | string | number} endDate - The end date
 * @param {string} locale - The locale to use for formatting
 * @returns {string} The formatted date range string
 * @throws {CustomError} If date range formatting fails
 */
export const formatDateRange = (
  startDate: Date | string | number,
  endDate: Date | string | number,
  locale: string = config.localization.defaultLocale,
): string => {
  try {
    const startDateTime = DateTime.fromJSDate(new Date(startDate)).setLocale(
      locale,
    );
    const endDateTime = DateTime.fromJSDate(new Date(endDate)).setLocale(
      locale,
    );
    return `${startDateTime.toFormat(
      config.localization.dateTimeFormat.shortDate,
    )} - ${endDateTime.toFormat(config.localization.dateTimeFormat.shortDate)}`;
  } catch (error) {
    logger.error('Date range formatting failed:', error);
    throw new CustomError('Invalid date range', 'DATE_RANGE_FORMAT_ERROR', 400);
  }
};

// Validate the utility functions
try {
  formatDate(new Date());
  formatTime(new Date());
  parseJWTExpiration();
  calculateExpirationDate(Duration.fromObject({ days: 1 }));
  cacheTTLToDuration();
  isExpired(new Date());
  calculateTimeDifference(new Date(), new Date());
  formatDuration(Duration.fromObject({ days: 1 }));
  getTimePeriodBoundaries('day');
  durationToHumanReadable(Duration.fromObject({ days: 1 }));
  getCurrentTimestamp();
  calculateElapsedTime(new Date());
  addTime(new Date(), Duration.fromObject({ days: 1 }));
  subtractTime(new Date(), Duration.fromObject({ days: 1 }));
  formatDateRange(new Date(), new Date());
} catch (error) {
  logger.error('Date utility function validation failed:', error);
  throw error;
}
