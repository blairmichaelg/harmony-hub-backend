// src/utils/string/sanitize.ts

import DOMPurify from 'dompurify';
import { z } from 'zod';

import { loggingConfig } from '../../config/LoggingConfig';

/**
 * Schema for sanitization options
 */
const SanitizeOptionsSchema = z.object({
  ALLOWED_TAGS: z
    .array(z.string())
    .optional()
    .describe('List of allowed HTML tags'),
  ALLOWED_ATTR: z
    .array(z.string())
    .optional()
    .describe('List of allowed HTML attributes'),
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
export const sanitizeHTML = (
  html: string,
  options?: SanitizeOptions,
): string => {
  const validatedOptions = SanitizeOptionsSchema.parse(options);
  return DOMPurify.sanitize(
    html,
    validatedOptions as DOMPurify.Config,
  ).toString();
};

/**
 * Anonymizes sensitive data in log strings
 * @param {string} str - The log string to anonymize
 * @returns {string} The anonymized log string
 */
export const anonymizeLogData = (str: string): string => {
  if (!loggingConfig.anonymization?.enabled) {
    return str;
  }

  let anonymizedStr = str;

  loggingConfig.anonymization.fields.forEach((field: any) => {
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
    .replace(/[^a-zA-Z0-9-_.]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
};
