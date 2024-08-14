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
  cors: {
    doc: 'CORS configuration',
    format: z.object({
      origin: z.string().optional(),
      methods: z.array(z.string()).optional(),
      allowedHeaders: z.array(z.string()).optional(),
      exposedHeaders: z.array(z.string()).optional(),
      credentials: z.boolean().optional(),
    }),
    default: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    env: 'CORS_CONFIG',
  },
  rateLimiting: {
    doc: 'Rate limiting configuration',
    format: z.object({
      enabled: z.boolean().describe('Whether rate limiting is enabled'),
      windowMs: z
        .number()
        .positive()
        .describe('Window duration in milliseconds'),
      max: z.number().positive().describe('Maximum requests per window'),
      keyGenerator: z
        .string()
        .optional()
        .describe('Key generator function name'),
    }),
    default: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      keyGenerator: 'ip',
    },
    env: 'RATE_LIMITING_CONFIG',
  },
  contentSecurityPolicy: {
    doc: 'Content Security Policy configuration',
    format: z.string().optional(),
    default:
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self';",
    env: 'CONTENT_SECURITY_POLICY',
  },
});

// Define the SecurityConfig type based on the schema
export interface SecurityConfig {
  jwtSecret: string;
  saltRounds: number;
  tokenExpiration: string;
  fileEncryption: {
    enabled: boolean;
    key: string;
    // Add more file encryption-specific fields as needed
  };
  cors: {
    origin?: string;
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    max: number;
    keyGenerator?: string;
  };
  contentSecurityPolicy?: string;
  // Add more fields as needed for future extensibility
}

const config = SecurityConfigSchema.getProperties();

export const securityConfig: SecurityConfig =
  config as unknown as SecurityConfig;

// Validate the configuration
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
