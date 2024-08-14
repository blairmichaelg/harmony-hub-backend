// src/config/AuthConfig.ts

import convict from 'convict';
import { z } from 'zod';

// Define the schema for the AuthConfig
export const AuthConfigSchema = convict({
  jwt: {
    doc: 'JWT configuration',
    format: z.object({
      secret: z
        .string()
        .nonempty({ message: 'JWT secret must be provided' })
        .describe('JWT secret key'),
      expiresIn: z.string().default('1h').describe('JWT expiration time'),
      // Add more JWT-specific fields as needed
    }),
    default: {
      secret: 'your-secret-key', // Replace with a strong, randomly generated key
      expiresIn: '1h',
    },
    env: 'JWT_CONFIG',
    sensitive: true,
  },
  oauth2: {
    doc: 'OAuth2 configuration',
    format: z.object({
      enabled: z.boolean().default(false).describe('Enable OAuth2'),
      providers: z
        .record(
          z.string(),
          z.object({
            clientId: z
              .string()
              .nonempty()
              .describe('Client ID for the OAuth2 provider'),
            clientSecret: z
              .string()
              .nonempty()
              .describe('Client secret for the OAuth2 provider'),
            callbackURL: z.string().url().describe('Callback URL'),
            // Add more provider-specific fields as needed
          }),
        )
        .default({}),
    }),
    default: {
      enabled: false,
      providers: {},
    },
    env: 'OAUTH2_CONFIG',
  },
  twoFactorAuthentication: {
    doc: 'Two-factor authentication configuration',
    format: z.object({
      enabled: z
        .boolean()
        .default(false)
        .describe('Enable two-factor authentication'),
      providers: z
        .array(z.enum(['email', 'sms', 'authenticator']))
        .default([])
        .describe('Supported two-factor authentication providers'),
      // Add more 2FA-specific fields as needed
    }),
    default: {
      enabled: false,
      providers: [],
    },
    env: 'TWO_FACTOR_AUTH_CONFIG',
  },
  rateLimiting: {
    doc: 'Rate limiting configuration',
    format: z.object({
      maxRequests: z
        .number()
        .int()
        .positive()
        .default(100)
        .describe('Maximum number of requests allowed per window'),
      windowMs: z
        .number()
        .int()
        .positive()
        .default(15 * 60 * 1000)
        .describe('Time window in milliseconds'),
      // Add more rate limiting-specific fields as needed
    }),
    default: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000,
    },
    env: 'RATE_LIMITING_CONFIG',
  },
  cors: {
    doc: 'CORS configuration',
    format: z.object({
      origin: z.array(z.string()).default(['*']).describe('Allowed origins'),
      methods: z
        .array(z.enum(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']))
        .default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
        .describe('Allowed methods'),
      // Add more CORS-specific fields as needed
    }),
    default: {
      origin: ['*'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    env: 'CORS_CONFIG',
  },
  helmet: {
    doc: 'Helmet configuration',
    format: z.object({
      contentSecurityPolicy: z
        .boolean()
        .default(true)
        .describe('Enable Content Security Policy'),
      xssFilter: z.boolean().default(true).describe('Enable XSS Filter'),
      // Add more Helmet-specific fields as needed
    }),
    default: {
      contentSecurityPolicy: true,
      xssFilter: true,
    },
    env: 'HELMET_CONFIG',
  },
  enableSSL: {
    doc: 'Enable SSL',
    format: z.boolean().default(false).describe('Enable SSL'),
    default: false,
    env: 'ENABLE_SSL',
  },
});

// Define the AuthConfig type based on the schema
export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
  };
  oauth2: {
    enabled: boolean;
    providers: Record<
      string,
      {
        clientId: string;
        clientSecret: string;
        callbackURL: string;
      }
    >;
  };
  twoFactorAuthentication: {
    enabled: boolean;
    providers: ('email' | 'sms' | 'authenticator')[];
  };
  rateLimiting: {
    maxRequests: number;
    windowMs: number;
  };
  cors: {
    origin: string[];
    methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS')[];
  };
  helmet: {
    contentSecurityPolicy: boolean;
    xssFilter: boolean;
  };
  enableSSL: boolean;
}

// Create and validate the configuration object
const config = AuthConfigSchema.getProperties();

export const authConfig: AuthConfig = config as unknown as AuthConfig;

try {
  AuthConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Auth configuration validation failed:', error.message);
    throw new Error('Invalid Auth configuration');
  }
  throw error;
}

export default authConfig;
