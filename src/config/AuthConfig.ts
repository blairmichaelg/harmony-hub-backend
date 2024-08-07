// src/config/AuthConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from '../utils/envUtils';

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
export const AuthConfigSchema = z
  .object({
    jwt: JWTConfigSchema,
    passwordHashing: z.object({
      saltRounds: z.coerce
        .number()
        .int()
        .positive()
        .describe('Number of salt rounds for password hashing'),
      pepper: z.string().optional().describe('Optional pepper for password hashing'),
    }),
    sessionConfig: z.object({
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
    rateLimiting: z.object({
      windowMs: z.coerce.number().int().positive().describe('Rate limiting window in milliseconds'),
      max: z.coerce
        .number()
        .int()
        .positive()
        .describe('Maximum number of requests within the rate limiting window'),
    }),
    oauth: z.object({
      google: OAuthProviderSchema.optional().describe('Google OAuth configuration'),
      facebook: OAuthProviderSchema.optional().describe('Facebook OAuth configuration'),
      github: OAuthProviderSchema.optional().describe('GitHub OAuth configuration'),
    }),
    twoFactor: z.object({
      enabled: z.boolean().describe('Whether two-factor authentication is enabled'),
      issuer: z.string().describe('Issuer name for two-factor authentication'),
    }),
  })
  .refine((data) => !data.twoFactor.enabled || Object.values(data.oauth).some(Boolean), {
    message:
      'When two-factor authentication is enabled, at least one OAuth provider must be configured',
    path: ['twoFactor'],
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
export const authConfig: AuthConfig = AuthConfigSchema.parse({
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '1d'),
    algorithm: getEnvVar('JWT_ALGORITHM', 'HS256'),
  },
  passwordHashing: {
    saltRounds: getEnvVar('PASSWORD_SALT_ROUNDS', '10'),
    pepper: getEnvVar('PASSWORD_PEPPER'),
  },
  sessionConfig: {
    secret: getEnvVar('SESSION_SECRET'),
    resave: getEnvVar('SESSION_RESAVE', 'false') === 'true',
    saveUninitialized: getEnvVar('SESSION_SAVE_UNINITIALIZED', 'false') === 'true',
    cookie: {
      secure: getEnvVar('SESSION_COOKIE_SECURE', 'true') === 'true',
      maxAge: Number(getEnvVar('SESSION_COOKIE_MAX_AGE', '86400000')),
    },
  },
  rateLimiting: {
    windowMs: Number(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000')),
    max: Number(getEnvVar('RATE_LIMIT_MAX', '100')),
  },
  oauth: {
    google: getEnvVar('GOOGLE_CLIENT_ID')
      ? {
          clientId: getEnvVar('GOOGLE_CLIENT_ID'),
          clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
          callbackURL: getEnvVar('GOOGLE_CALLBACK_URL'),
          scope: parseJSON(getEnvVar('GOOGLE_SCOPE', '["profile", "email"]')),
        }
      : undefined,
    facebook: getEnvVar('FACEBOOK_CLIENT_ID')
      ? {
          clientId: getEnvVar('FACEBOOK_CLIENT_ID'),
          clientSecret: getEnvVar('FACEBOOK_CLIENT_SECRET'),
          callbackURL: getEnvVar('FACEBOOK_CALLBACK_URL'),
          scope: parseJSON(getEnvVar('FACEBOOK_SCOPE', '["email", "public_profile"]')),
        }
      : undefined,
    github: getEnvVar('GITHUB_CLIENT_ID')
      ? {
          clientId: getEnvVar('GITHUB_CLIENT_ID'),
          clientSecret: getEnvVar('GITHUB_CLIENT_SECRET'),
          callbackURL: getEnvVar('GITHUB_CALLBACK_URL'),
          scope: parseJSON(getEnvVar('GITHUB_SCOPE', '["user:email"]')),
        }
      : undefined,
  },
  twoFactor: {
    enabled: getEnvVar('TWO_FACTOR_ENABLED', 'false') === 'true',
    issuer: getEnvVar('TWO_FACTOR_ISSUER', 'YourAppName'),
  },
});

// Validate the configuration
try {
  AuthConfigSchema.parse(authConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Authentication configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid authentication configuration');
  }
  throw error;
}
