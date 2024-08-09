// src/config/AuthConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for JWT configuration
 * @remarks
 * Defines the structure and validation rules for JWT settings.
 */
const JWTConfigSchema = z.object({
  secret: z.string().min(32).describe('JWT secret key, must be at least 32 characters long'),
  expiresIn: z.string().describe('JWT expiration time'),
  algorithm: z
    .enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'])
    .describe('JWT signing algorithm'),
});

/**
 * Schema for OAuth provider configuration
 * @remarks
 * Defines the structure and validation rules for OAuth providers.
 */
const OAuthProviderSchema = z.object({
  clientId: z.string().min(1).describe('OAuth client ID'),
  clientSecret: z.string().min(1).describe('OAuth client secret'),
  callbackURL: z.string().url().describe('OAuth callback URL'),
  scope: z.array(z.string()).default([]).describe('OAuth scopes'),
});

/**
 * Schema for the entire authentication configuration
 * @remarks
 * This schema defines the structure and validation rules for the authentication configuration.
 */
const AuthConfigSchema = convict({
  jwt: {
    doc: 'JWT configuration',
    format: JWTConfigSchema,
    default: {
      secret:
        process.env.NODE_ENV === 'production'
          ? '' // Generate a strong secret in production
          : 'default-secret-key-for-development-only',
      expiresIn: '1d',
      algorithm: 'HS256',
    },
    env: 'AUTH_JWT',
  },
  passwordHashing: {
    doc: 'Password hashing configuration',
    format: z.object({
      saltRounds: z.coerce
        .number()
        .int()
        .positive()
        .describe('Number of salt rounds for password hashing'),
      pepper: z.string().optional().describe('Optional pepper for password hashing'),
    }),
    default: {
      saltRounds: 10,
      pepper: '',
    },
    env: 'AUTH_PASSWORD_HASHING',
  },
  sessionConfig: {
    doc: 'Session configuration',
    format: z.object({
      secret: z.string().min(32).describe('Session secret, must be at least 32 characters long'),
      resave: z.boolean().describe('Whether to resave unchanged sessions'),
      saveUninitialized: z.boolean().describe('Whether to save uninitialized sessions'),
      cookie: z.object({
        secure: z.boolean().describe('Whether to use secure cookies'),
        maxAge: z.coerce
          .number()
          .int()
          .positive()
          .describe('Maximum age of the session cookie in milliseconds'),
      }),
    }),
    default: {
      secret:
        process.env.NODE_ENV === 'production'
          ? '' // Generate a strong secret in production
          : 'default-session-secret-for-development-only',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        maxAge: 86400000, // 1 day
      },
    },
    env: 'AUTH_SESSION',
  },
  rateLimiting: {
    doc: 'Rate limiting configuration',
    format: z.object({
      windowMs: z.coerce.number().int().positive().describe('Rate limiting window in milliseconds'),
      max: z.coerce
        .number()
        .int()
        .positive()
        .describe('Maximum number of requests within the rate limiting window'),
    }),
    default: {
      windowMs: 900000, // 15 minutes
      max: 100,
    },
    env: 'AUTH_RATE_LIMITING',
  },
  oauth: {
    doc: 'OAuth provider configurations',
    format: z.object({
      google: OAuthProviderSchema.optional().describe('Google OAuth configuration'),
      facebook: OAuthProviderSchema.optional().describe('Facebook OAuth configuration'),
      github: OAuthProviderSchema.optional().describe('GitHub OAuth configuration'),
    }),
    default: {
      google: null,
      facebook: null,
      github: null,
    },
    env: 'AUTH_OAUTH',
  },
  twoFactor: {
    doc: 'Two-factor authentication configuration',
    format: z.object({
      enabled: z.boolean().describe('Whether two-factor authentication is enabled'),
      issuer: z.string().describe('Issuer name for two-factor authentication'),
    }),
    default: {
      enabled: false,
      issuer: 'YourAppName',
    },
    env: 'AUTH_TWO_FACTOR',
  },
});

/**
 * Type definition for the authentication configuration
 */
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

/**
 * The authentication configuration object
 * @remarks
 * This object contains all the authentication-related settings and is validated against AuthConfigSchema.
 */
export const authConfig = AuthConfigSchema.validate({});

// Validate the configuration
try {
  AuthConfigSchema.validate(authConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Authentication configuration validation failed:', error.message);
    throw new Error('Invalid authentication configuration');
  }
  throw error;
}

export default authConfig;
