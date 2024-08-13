// src/utils/crypto.ts

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'; // Import JWT directly

import { authConfig } from '../config/AuthConfig';
import { securityConfig } from '../config/SecurityConfig';
import { CustomError } from './errorUtils';
import logger from './logging';

/**
 * Securely hashes a password using bcrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hashed password
 * @throws {CustomError} If hashing fails
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(
      password,
      securityConfig.saltRounds,
    );
    return hashedPassword;
  } catch (error) {
    logger.error('Password hashing failed:', error);
    throw new CustomError(
      'Failed to hash password',
      'PASSWORD_HASHING_ERROR',
      500,
    );
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - The plain text password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} True if the passwords match, false otherwise
 * @throws {CustomError} If comparison fails
 */
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  try {
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    logger.error('Password comparison failed:', error);
    throw new CustomError(
      'Failed to compare passwords',
      'PASSWORD_COMPARISON_ERROR',
      500,
    );
  }
};

/**
 * Generates a cryptographically secure random string
 * @param {number} length - The desired length of the random string
 * @returns {string} The generated random string
 */
export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Encrypts data using AES-256-CBC
 * @param {string} data - The data to encrypt
 * @param {string} key - The encryption key
 * @returns {Promise<string>} The encrypted data
 * @throws {CustomError} If encryption fails
 */
export const encrypt = async (data: string, key: string): Promise<string> => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new CustomError('Failed to encrypt data', 'ENCRYPTION_ERROR', 500);
  }
};

/**
 * Decrypts data using AES-256-CBC
 * @param {string} encryptedData - The encrypted data
 * @param {string} key - The decryption key
 * @returns {Promise<string>} The decrypted data
 * @throws {CustomError} If decryption fails
 */
export const decrypt = async (
  encryptedData: string,
  key: string,
): Promise<string> => {
  try {
    const [ivHex, encryptedHex] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key),
      iv,
    );
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed:', error);
    throw new CustomError('Failed to decrypt data', 'DECRYPTION_ERROR', 500);
  }
};

/**
 * Generates a SHA-256 hash of a string
 * @param {string} data - The data to hash
 * @returns {string} The SHA-256 hash
 */
export const hashSHA256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Signs data using the configured JWT secret and algorithm
 * @param {object} payload - The data to sign
 * @returns {Promise<string>} The signed JWT token
 * @throws {CustomError} If signing fails
 */
export const signJWT = async (payload: object): Promise<string> => {
  try {
    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.expiresIn,
    });
  } catch (error) {
    logger.error('JWT signing failed:', error);
    throw new CustomError('Failed to sign JWT', 'JWT_SIGNING_ERROR', 500);
  }
};

/**
 * Verifies a JWT token using the configured JWT secret and algorithm
 * @param {string} token - The JWT token to verify
 * @returns {Promise<object | string>} The decoded payload if the token is valid, otherwise throws an error
 * @throws {CustomError} If verification fails
 */
export const verifyJWT = async (token: string): Promise<object | string> => {
  try {
    return jwt.verify(token, authConfig.jwt.secret);
  } catch (error) {
    logger.error('JWT verification failed:', error);
    throw new CustomError(
      'Failed to verify JWT',
      'JWT_VERIFICATION_ERROR',
      401,
    );
  }
};
