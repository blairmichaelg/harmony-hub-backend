// src/config/SecurityConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for security configuration
 * @remarks
 * This schema defines the structure and validation rules for the security configuration.
 */
export const SecurityConfigSchema = convict({
  jwtSecret: {
    doc: 'Secret key for signing JWT tokens',
    format: String,
    default: 'defaultSecret',
    env: 'JWT_SECRET',
    sensitive: true,
  },
  saltRounds: {
    doc: 'Number of salt rounds for hashing passwords',
    format: 'int',
    default: 10,
    env: 'SALT_ROUNDS',
  },
  tokenExpiration: {
    doc: 'Expiration time for JWT tokens',
    format: String,
    default: '1h',
    env: 'TOKEN_EXPIRATION',
  },
  fileEncryption: {
    doc: 'File encryption configuration',
    format: z.object({
      enabled: z.boolean().describe('Whether file encryption is enabled'),
      key: z.string().describe('Encryption key'),
      // Add more file encryption-specific fields as needed
    }),
    default: {
      enabled: false,
      key: 'your-secret-key', // Replace with a strong, randomly generated key
    },
    env: 'FILE_ENCRYPTION_CONFIG',
    sensitive: true,
  },
  // Add more security-specific fields as needed
});

export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

// Create and validate the configuration object
const config = SecurityConfigSchema.getProperties();

export const securityConfig: SecurityConfig =
  config as unknown as SecurityConfig;

try {
  SecurityConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Security configuration validation failed:', error.message);
    throw new Error('Invalid Security configuration');
  }
  throw error;
}

export default securityConfig;
