// src/utils/date.ts

import { DateTime, Duration, Interval } from 'luxon';
import { z } from 'zod';

import { authConfig } from '../config/AuthConfig';
import { cacheConfig } from '../config/CacheConfig';
import { localizationConfig } from '../config/LocalizationConfig';

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
  options: DateFormatOptions = {}
): string => {
  try {
    DateFormatOptionsSchema.parse(options);
    const { locale = localizationConfig.defaultLocale, format = 'short' } = options;
    const dateTime = DateTime.fromJSDate(new Date(date));
    const formatString =
      format === 'short'
        ? localizationConfig.dateTimeFormat.shortDate
        : localizationConfig.dateTimeFormat.longDate;

    return dateTime.setLocale(locale).toFormat(formatString);
  } catch (error) {
    logger.error('Date formatting failed:', error);
    throw new CustomError('Invalid date or formatting options', 'DATE_FORMAT_ERROR', 400);
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
  locale: string = localizationConfig.defaultLocale
): string => {
  try {
    const dateTime = DateTime.fromJSDate(new Date(time));

    return dateTime.setLocale(locale).toFormat(localizationConfig.dateTimeFormat.time);
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
export const parseJWTExpiration = (expiresIn: string = authConfig.jwt.expiresIn): Duration => {
  try {
    const match = expiresIn.match(/^(\d+)([smhdw])$/);

    if (!match) {
      throw new Error('Invalid expiration format');
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
    throw new CustomError('Invalid JWT expiration format', 'JWT_EXPIRATION_ERROR', 400);
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
export const cacheTTLToDuration = (ttlSeconds: number = cacheConfig.local.ttl): Duration => {
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
  end: Date | string | number
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
  locale: string = localizationConfig.defaultLocale
): string => {
  try {
    return duration.reconfigure({ locale }).toHuman();
  } catch (error) {
    logger.error('Duration formatting failed:', error);
    throw new CustomError('Invalid duration or locale', 'DURATION_FORMAT_ERROR', 400);
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
  date: Date | string | number = new Date()
): Interval => {
  const dateTime = DateTime.fromJSDate(new Date(date));

  switch (period) {
    case 'day':
      return Interval.fromDateTimes(dateTime.startOf('day'), dateTime.endOf('day'));
    case 'week':
      return Interval.fromDateTimes(dateTime.startOf('week'), dateTime.endOf('week'));
    case 'month':
      return Interval.fromDateTimes(dateTime.startOf('month'), dateTime.endOf('month'));
    case 'year':
      return Interval.fromDateTimes(dateTime.startOf('year'), dateTime.endOf('year'));
    default:
      throw new CustomError('Invalid time period', 'INVALID_TIME_PERIOD', 400);
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
} catch (error) {
  logger.error('Date utility function validation failed:', error);
  throw error;
}
