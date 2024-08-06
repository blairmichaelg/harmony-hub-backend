// AuthConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from './utils';

const jwtConfigSchema = z.object({
  secret: z.string().min(32),
  expiresIn: z.string(),
  algorithm: z.enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']),
});

const oauthProviderSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  callbackURL: z.string().url(),
  scope: z.array(z.string()).optional(),
});

const authConfigSchema = z.object({
  jwt: jwtConfigSchema,
  passwordHashing: z.object({
    saltRounds: z.number().int().positive(),
    pepper: z.string().optional(),
  }),
  sessionConfig: z.object({
    secret: z.string().min(32),
    resave: z.boolean(),
    saveUninitialized: z.boolean(),
    cookie: z.object({
      secure: z.boolean(),
      maxAge: z.number().int().positive(),
    }),
  }),
  rateLimiting: z.object({
    windowMs: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  oauth: z.object({
    google: oauthProviderSchema.optional(),
    facebook: oauthProviderSchema.optional(),
    github: oauthProviderSchema.optional(),
  }),
  twoFactor: z.object({
    enabled: z.boolean(),
    issuer: z.string(),
  }),
});

type AuthConfig = z.infer<typeof authConfigSchema>;

const authConfig: AuthConfig = authConfigSchema.parse({
  jwt: {
    secret: getEnvVar('JWT_SECRET'),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '1d'),
    algorithm: getEnvVar('JWT_ALGORITHM', 'HS256') as
      | 'HS256'
      | 'HS384'
      | 'HS512'
      | 'RS256'
      | 'RS384'
      | 'RS512',
  },
  passwordHashing: {
    saltRounds: parseInt(getEnvVar('PASSWORD_SALT_ROUNDS', '10'), 10),
    pepper: getEnvVar('PASSWORD_PEPPER', undefined),
  },
  sessionConfig: {
    secret: getEnvVar('SESSION_SECRET'),
    resave: getEnvVar('SESSION_RESAVE', 'false') === 'true',
    saveUninitialized: getEnvVar('SESSION_SAVE_UNINITIALIZED', 'false') === 'true',
    cookie: {
      secure: getEnvVar('SESSION_COOKIE_SECURE', 'true') === 'true',
      maxAge: parseInt(getEnvVar('SESSION_COOKIE_MAX_AGE', '86400000'), 10), // 24 hours in milliseconds
    },
  },
  rateLimiting: {
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutes
    max: parseInt(getEnvVar('RATE_LIMIT_MAX', '100'), 10),
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

export { authConfig, AuthConfig };
