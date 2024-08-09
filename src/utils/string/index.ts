// src/utils/string/index.ts

import { z } from 'zod';

import { localizationConfig } from '../../config/LocalizationConfig';
import { CustomError } from '../errorUtils';
import logger from '../logging';

import { anonymizeLogData, sanitizeFilename, sanitizeForSearch, sanitizeHTML } from './sanitize';

/**
 * Schema for string manipulation options
 */
const StringManipulationOptionsSchema = z.object({
  locale: z.string().optional().describe('Locale for string formatting'),
  maxLength: z.number().positive().optional().describe('Maximum length for truncation'),
});

/**
 * Type definition for string manipulation options
 */
type StringManipulationOptions = z.infer<typeof StringManipulationOptionsSchema>;

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The input string
 * @returns {string} The string with the first letter capitalized
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncates a string to a specified length
 * @param {string} str - The input string
 * @param {number} maxLength - The maximum length of the resulting string
 * @returns {string} The truncated string
 */
export const truncate = (str: string, maxLength: number): string => {
  return str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str;
};

/**
 * Removes duplicate characters from a string
 * @param {string} str - The input string
 * @returns {string} The string with duplicate characters removed
 */
export const removeDuplicates = (str: string): string => {
  return [...new Set(str)].join('');
};

/**
 * Formats a string according to the specified locale
 * @param {string} str - The input string
 * @param {StringManipulationOptions} options - Options for string manipulation
 * @returns {string} The formatted string
 * @throws {CustomError} If formatting fails
 */
export const formatString = (str: string, options?: StringManipulationOptions): string => {
  try {
    const validatedOptions = StringManipulationOptionsSchema.parse(options);
    const locale = validatedOptions.locale || localizationConfig.defaultLocale;
    const formatter = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
    const words = str.split(' ');

    return formatter.format(words);
  } catch (error) {
    logger.error('String formatting failed:', error);
    throw error;
  }
};

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailSchema = z.string().email();

  try {
    emailSchema.parse(email);

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Memoized utility function for expensive string operations
 * @param {string} input - The input string to process
 * @returns {string} The processed string
 */
export const memoizedStringOperation = ((): ((input: string) => string) => {
  const cache = new Map<string, string>();

  return (input: string): string => {
    const cachedResult = cache.get(input);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    // Simulate expensive operation
    const result = input.split('').reverse().join('');

    cache.set(input, result);

    return result;
  };
})();

// Export sanitization functions from sanitize.ts
export { anonymizeLogData, sanitizeFilename, sanitizeForSearch, sanitizeHTML } from './sanitize';

// Validate the utility functions
try {
  capitalize('test');
  truncate('Long string', 10);
  removeDuplicates('hello');
  formatString('apple banana cherry', { locale: 'en-US' });
  isValidEmail('test@example.com');
  memoizedStringOperation('reverse me');
  sanitizeForSearch('Test@123');
  sanitizeHTML('<p>Test</p>', { ALLOWED_TAGS: ['p'] });
  sanitizeFilename('File Name! @#$.txt');
  anonymizeLogData('email=test@example.com&password=secret');
} catch (error) {
  logger.error('String utility function validation failed:', error);
  throw error;
}
