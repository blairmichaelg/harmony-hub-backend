// src/utils/network.ts

import { URL } from 'url';

import { CustomError } from './errorUtils';
import logger from './logging';

/**
 * Validates an IP address
 * @param {string} ip - The IP address to validate
 * @returns {boolean} True if the IP address is valid, false otherwise
 */
export const isValidIP = (ip: string): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const net = require('net');

  return net.isIP(ip);
};

/**
 * Parses a URL string
 * @param {string} urlString - The URL string to parse
 * @returns {URL} The parsed URL object
 * @throws {CustomError} If the URL is invalid
 */
export const parseURL = (urlString: string): URL => {
  try {
    return new URL(urlString);
  } catch (error) {
    logger.error('Invalid URL:', error);
    throw new CustomError('Invalid URL', 'INVALID_URL', 400);
  }
};
