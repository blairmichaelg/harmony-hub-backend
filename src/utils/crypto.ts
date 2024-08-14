// src/utils/crypto.ts

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import config from '../config';
import { CustomError } from './errorUtils';
import logger from './logging';

// Define a schema for JWT settings
const JwtSettingsSchema = z.object({
  secret: z.string().nonempty(),
  expiresIn: z.string().nonempty(),
});

// Define a schema for security settings
const SecuritySettingsSchema = z.object({
  saltRounds: z.number().positive(),
});

// Validate JWT and security settings from config
const jwtSettings = JwtSettingsSchema.parse(config.auth.jwt);
const securitySettings = SecuritySettingsSchema.parse(config.security);

// Function to securely hash a password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(
      password,
      securitySettings.saltRounds,
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

// Function to compare a plain text password with a hashed password
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

// Function to generate a cryptographically secure random string
export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Function to encrypt data using AES-256-CBC
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

// Function to decrypt data using AES-256-CBC
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

// Function to generate a SHA-256 hash of a string
export const hashSHA256 = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Function to sign data using the configured JWT secret and algorithm
export const signJWT = async (payload: object): Promise<string> => {
  try {
    return jwt.sign(payload, jwtSettings.secret, {
      expiresIn: jwtSettings.expiresIn,
    });
  } catch (error) {
    logger.error('JWT signing failed:', error);
    throw new CustomError('Failed to sign JWT', 'JWT_SIGNING_ERROR', 500);
  }
};

// Function to verify a JWT token using the configured JWT secret and algorithm
export const verifyJWT = async (token: string): Promise<object | string> => {
  try {
    return jwt.verify(token, jwtSettings.secret);
  } catch (error) {
    logger.error('JWT verification failed:', error);
    throw new CustomError(
      'Failed to verify JWT',
      'JWT_VERIFICATION_ERROR',
      401,
    );
  }
};
