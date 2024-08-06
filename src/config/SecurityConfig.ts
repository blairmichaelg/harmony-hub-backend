// SecurityConfig.ts

import { z } from 'zod';

import { getEnvVariables } from '../utils/envUtils';

const jwtSchema = z.object({
  secret: z.string().min(32),
  expiresIn: z.string(),
});

const bcryptSchema = z.object({
  saltRounds: z.number().int().positive(),
});

const passwordStrengthSchema = z.object({
  minLength: z.number().int().min(8),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
});

const rateLimitingSchema = z.object({
  enabled: z.boolean(),
  maxRequests: z.number().int().positive(),
  windowMs: z.number().int().positive(),
});

const corsSchema = z.object({
  origin: z.union([z.string(), z.array(z.string())]),
  methods: z.array(z.string()),
});

const helmetSchema = z.object({
  contentSecurityPolicy: z.boolean(),
  xssFilter: z.boolean(),
});

const securityConfigSchema = z.object({
  jwt: jwtSchema,
  bcrypt: bcryptSchema,
  passwordStrength: passwordStrengthSchema,
  rateLimiting: rateLimitingSchema,
  cors: corsSchema,
  helmet: helmetSchema,
});

type SecurityConfig = z.infer<typeof securityConfigSchema>;

const env = getEnvVariables();

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean =>
  value ? value.toLowerCase() === 'true' : defaultValue;

const securityConfig: SecurityConfig = securityConfigSchema.parse({
  jwt: {
    secret:
      env.JWT_SECRET ||
      (process.env.NODE_ENV === 'production'
        ? undefined
        : 'default-secret-key-for-development-only'),
    expiresIn: env.JWT_EXPIRES_IN || '1d',
  },
  bcrypt: {
    saltRounds: parseInt(env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
  passwordStrength: {
    minLength: parseInt(env.PASSWORD_MIN_LENGTH || '10', 10),
    requireUppercase: parseBoolean(env.PASSWORD_REQUIRE_UPPERCASE, true),
    requireLowercase: parseBoolean(env.PASSWORD_REQUIRE_LOWERCASE, true),
    requireNumbers: parseBoolean(env.PASSWORD_REQUIRE_NUMBERS, true),
    requireSpecialChars: parseBoolean(env.PASSWORD_REQUIRE_SPECIAL_CHARS, true),
  },
  rateLimiting: {
    enabled: parseBoolean(env.RATE_LIMITING_ENABLED, true),
    maxRequests: parseInt(env.RATE_LIMITING_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(env.RATE_LIMITING_WINDOW_MS || '900000', 10), // 15 minutes
  },
  cors: {
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : '*',
    methods: env.CORS_METHODS
      ? env.CORS_METHODS.split(',')
      : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
  helmet: {
    contentSecurityPolicy: parseBoolean(env.HELMET_CONTENT_SECURITY_POLICY, true),
    xssFilter: parseBoolean(env.HELMET_XSS_FILTER, true),
  },
});

export { securityConfig, SecurityConfig };
