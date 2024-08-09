// src/utils/string/sanitize.ts

import DOMPurify from 'dompurify';
import { z } from 'zod';

import { loggingConfig } from '../../config/LoggingConfig';
import logger from '../logging';

/**
 * Schema for sanitization options
 */
const SanitizeOptionsSchema = z.object({
  ALLOWED_TAGS: z.array(z.string()).optional().describe('List of allowed HTML tags'),
  ALLOWED_ATTR: z.array(z.string()).optional().describe('List of allowed HTML attributes'),
});

type SanitizeOptions = z.infer<typeof SanitizeOptionsSchema>;

/**
 * Sanitizes a string for use in search queries
 * @param {string} str - The input string to sanitize
 * @returns {string} The sanitized string
 */
export const sanitizeForSearch = (str: string): string => {
  return str
    .replace(/[^\w\s]/gi, '')
    .toLowerCase()
    .trim();
};

/**
 * Sanitizes HTML input to prevent XSS attacks
 * @param {string} html - The HTML string to sanitize
 * @param {SanitizeOptions} options - Options for HTML sanitization
 * @returns {string} The sanitized HTML string
 */
export const sanitizeHTML = (html: string, options?: SanitizeOptions): string => {
  try {
    const validatedOptions = SanitizeOptionsSchema.parse(options);

    return DOMPurify.sanitize(html, validatedOptions as DOMPurify.Config).toString();
  } catch (error) {
    logger.error('HTML sanitization failed:', error);

    return '';
  }
};

/**
 * Anonymizes sensitive data in log strings
 * @param {string} str - The log string to anonymize
 * @returns {string} The anonymized log string
 */
export const anonymizeLogData = (str: string): string => {
  if (!loggingConfig.anonymization.enabled) {
    return str;
  }

  let anonymizedStr = str;

  loggingConfig.anonymization.fields.forEach((field) => {
    const regex = new RegExp(`(${field}=)([^&\\s]+)`, 'gi');

    anonymizedStr = anonymizedStr.replace(regex, `$1****`);
  });

  return anonymizedStr;
};

/**
 * Sanitizes a filename to ensure it's safe for use in file systems
 * @param {string} filename - The filename to sanitize
 * @returns {string} The sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9-_.]/g, '_') // Replace any character that's not alphanumeric, dash, underscore, or dot with an underscore
    .replace(/_{2,}/g, '_') // Replace multiple consecutive underscores with a single one
    .replace(/^_+|_+$/g, '') // Remove leading and trailing underscores
    .toLowerCase(); // Convert to lowercase
};

// Validate the utility functions
try {
  sanitizeForSearch('Test@123');
  sanitizeHTML('<p>Test</p>', { ALLOWED_TAGS: ['p'] });
  anonymizeLogData('email=test@example.com&password=secret');
  sanitizeFilename('File Name! @#$.txt');
} catch (error) {
  logger.error('String sanitization utility function validation failed:', error);
  throw error;
}
