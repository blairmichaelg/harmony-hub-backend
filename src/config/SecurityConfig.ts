// src/config/SecurityConfig.ts

import { z } from 'zod';

import { getEnvVar, parseJSON } from '../utils/envUtils';

/**
 * Schema for JWT configuration
 * @remarks
 * Defines the structure and validation rules for JWT settings.
 */
const JwtSchema = z.object({
  secret: z.string().min(32).describe('JWT secret key'),
  expiresIn: z.string().describe('JWT expiration time'),
});

/**
 * Schema for bcrypt configuration
 * @remarks
 * Defines the structure and validation rules for bcrypt settings.
 */
const BcryptSchema = z.object({
  saltRounds: z.coerce.number().int().positive().describe('Number of salt rounds for bcrypt'),
});

/**
 * Schema for password strength configuration
 * @remarks
 * Defines the structure and validation rules for password strength requirements.
 */
const PasswordStrengthSchema = z.object({
  minLength: z.coerce.number().int().min(8).describe('Minimum password length'),
  requireUppercase: z.coerce.boolean().describe('Require uppercase characters in password'),
  requireLowercase: z.coerce.boolean().describe('Require lowercase characters in password'),
  requireNumbers: z.coerce.boolean().describe('Require numbers in password'),
  requireSpecialChars: z.coerce.boolean().describe('Require special characters in password'),
});

/**
 * Schema for rate limiting configuration
 * @remarks
 * Defines the structure and validation rules for rate limiting settings.
 */
const RateLimitingSchema = z.object({
  enabled: z.coerce.boolean().describe('Enable rate limiting'),
  maxRequests: z.coerce.number().int().positive().describe('Maximum number of requests allowed'),
  windowMs: z.coerce
    .number()
    .int()
    .positive()
    .describe('Time window for rate limiting in milliseconds'),
});

/**
 * Schema for CORS configuration
 * @remarks
 * Defines the structure and validation rules for CORS settings.
 */
const CorsSchema = z.object({
  origin: z.union([z.string(), z.array(z.string())]).describe('Allowed origins for CORS'),
  methods: z.array(z.string()).describe('Allowed HTTP methods for CORS'),
});

/**
 * Schema for Helmet configuration
 * @remarks
 * Defines the structure and validation rules for Helmet settings.
 */
const HelmetSchema = z.object({
  contentSecurityPolicy: z.coerce.boolean().describe('Enable Content Security Policy'),
  xssFilter: z.coerce.boolean().describe('Enable XSS filter'),
});

/**
 * Schema for security configuration
 * @remarks
 * This schema defines the structure and validation rules for the security configuration.
 */
export const SecurityConfigSchema = z.object({
  jwt: JwtSchema,
  bcrypt: BcryptSchema,
  passwordStrength: PasswordStrengthSchema,
  rateLimiting: RateLimitingSchema,
  cors: CorsSchema,
  helmet: HelmetSchema,
  enableSSL: z.coerce.boolean().describe('Enable SSL/TLS'),
});

/**
 * Type definition for security configuration
 */
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

/**
 * Security configuration object
 * @remarks
 * This object contains the parsed and validated security configuration.
 */
export const securityConfig: SecurityConfig = SecurityConfigSchema.parse({
  jwt: {
    secret: getEnvVar(
      'JWT_SECRET',
      process.env.NODE_ENV === 'production' ? undefined : 'default-secret-key-for-development-only'
    ),
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '1d'),
  },
  bcrypt: {
    saltRounds: getEnvVar('BCRYPT_SALT_ROUNDS', '12'),
  },
  passwordStrength: {
    minLength: getEnvVar('PASSWORD_MIN_LENGTH', '10'),
    requireUppercase: getEnvVar('PASSWORD_REQUIRE_UPPERCASE', 'true'),
    requireLowercase: getEnvVar('PASSWORD_REQUIRE_LOWERCASE', 'true'),
    requireNumbers: getEnvVar('PASSWORD_REQUIRE_NUMBERS', 'true'),
    requireSpecialChars: getEnvVar('PASSWORD_REQUIRE_SPECIAL_CHARS', 'true'),
  },
  rateLimiting: {
    enabled: getEnvVar('RATE_LIMITING_ENABLED', 'true'),
    maxRequests: getEnvVar('RATE_LIMITING_MAX_REQUESTS', '100'),
    windowMs: getEnvVar('RATE_LIMITING_WINDOW_MS', '900000'), // 15 minutes
  },
  cors: {
    origin: parseJSON(getEnvVar('CORS_ORIGIN', '["*"]')),
    methods: getEnvVar('CORS_METHODS', 'GET,POST,PUT,DELETE,OPTIONS').split(','),
  },
  helmet: {
    contentSecurityPolicy: getEnvVar('HELMET_CONTENT_SECURITY_POLICY', 'true'),
    xssFilter: getEnvVar('HELMET_XSS_FILTER', 'true'),
  },
  enableSSL: getEnvVar('ENABLE_SSL', 'true'),
});

// Validate the configuration
try {
  SecurityConfigSchema.parse(securityConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Security configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid security configuration');
  }
  throw error;
}
