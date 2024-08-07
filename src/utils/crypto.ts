// src/utils/crypto.ts

import * as crypto from 'crypto';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';

import { authConfig } from '../config/AuthConfig';
import { securityConfig } from '../config/SecurityConfig';

import { CustomError } from './errorUtils';

/**
 * Schema for password hashing options
 */
const PasswordHashOptionsSchema = z.object({
  saltRounds: z.number().int().positive().default(securityConfig.bcrypt.saltRounds),
});

type PasswordHashOptions = z.infer<typeof PasswordHashOptionsSchema>;

/**
 * Schema for encryption options
 */
const EncryptionOptionsSchema = z.object({
  algorithm: z.string().default('aes-256-cbc'),
  ivLength: z.number().int().positive().default(16),
});

type EncryptionOptions = z.infer<typeof EncryptionOptionsSchema>;

/**
 * Hashes a password using bcrypt
 * @param password - The password to hash
 * @param options - Optional password hashing options
 * @returns A promise that resolves to the hashed password
 */
export async function hashPassword(
  password: string,
  options?: Partial<PasswordHashOptions>
): Promise<string> {
  const validatedOptions = PasswordHashOptionsSchema.parse(options || {});

  return bcrypt.hash(password, validatedOptions.saltRounds);
}

/**
 * Compares a password with a hashed password
 * @param password - The password to compare
 * @param hashedPassword - The hashed password to compare against
 * @returns A promise that resolves to a boolean indicating whether the password matches
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a JWT token
 * @param payload - The payload to include in the token
 * @param options - Optional JWT sign options
 * @returns A promise that resolves to the generated token
 */
export function generateToken(payload: object, options: jwt.SignOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      authConfig.jwt.secret,
      { ...options, expiresIn: authConfig.jwt.expiresIn },
      (err, token) => {
        if (err) reject(err);
        else resolve(token as string);
      }
    );
  });
}

/**
 * Verifies a JWT token
 * @param token - The token to verify
 * @returns A promise that resolves to the decoded token payload
 * @throws {CustomError} If the token is invalid
 */
export function verifyToken(token: string): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, authConfig.jwt.secret, (err, decoded) => {
      if (err) reject(new CustomError('Invalid token', 401));
      else resolve(decoded as jwt.JwtPayload);
    });
  });
}

/**
 * Encrypts data using the specified algorithm
 * @param data - The data to encrypt
 * @param key - The encryption key
 * @param options - Optional encryption options
 * @returns The encrypted data as a buffer
 */
export function encrypt(
  data: string | Buffer,
  key: string | Buffer,
  options?: Partial<EncryptionOptions>
): Buffer {
  const validatedOptions = EncryptionOptionsSchema.parse(options || {});
  const iv = crypto.randomBytes(validatedOptions.ivLength);
  const cipher = crypto.createCipheriv(validatedOptions.algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

  return Buffer.concat([iv, encrypted]);
}

/**
 * Decrypts data using the specified algorithm
 * @param data - The data to decrypt
 * @param key - The decryption key
 * @param options - Optional decryption options
 * @returns The decrypted data as a buffer
 */
export function decrypt(
  data: Buffer,
  key: string | Buffer,
  options?: Partial<EncryptionOptions>
): Buffer {
  const validatedOptions = EncryptionOptionsSchema.parse(options || {});
  const iv = data.slice(0, validatedOptions.ivLength);
  const encryptedData = data.slice(validatedOptions.ivLength);
  const decipher = crypto.createDecipheriv(validatedOptions.algorithm, key, iv);

  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

/**
 * Generates a random string of specified length
 * @param length - The length of the random string
 * @returns A random string
 */
export function generateRandomString(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Hashes data using SHA-256
 * @param data - The data to hash
 * @returns The hashed data as a hexadecimal string
 */
export function hashSHA256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
