// src/config/SecurityConfig.ts

import convict from 'convict';
import { z } from 'zod';

const SecurityConfigSchema = convict({
  jwt: {
    secret: {
      doc: 'JWT secret key',
      format: 'string',
      default:
        process.env.NODE_ENV === 'production'
          ? '' // Generate a strong secret in production
          : 'default-secret-key-for-development-only',
      env: 'JWT_SECRET',
      sensitive: true,
    },
    expiresIn: {
      doc: 'JWT expiration time',
      format: 'string',
      default: '1d',
      env: 'JWT_EXPIRES_IN',
    },
  },
  bcrypt: {
    saltRounds: {
      doc: 'Number of salt rounds for bcrypt',
      format: 'nat',
      default: 12,
      env: 'BCRYPT_SALT_ROUNDS',
    },
  },
  passwordStrength: {
    minLength: {
      doc: 'Minimum password length',
      format: 'nat',
      default: 10,
      env: 'PASSWORD_MIN_LENGTH',
    },
    requireUppercase: {
      doc: 'Require uppercase characters in password',
      format: 'Boolean',
      default: true,
      env: 'PASSWORD_REQUIRE_UPPERCASE',
    },
    requireLowercase: {
      doc: 'Require lowercase characters in password',
      format: 'Boolean',
      default: true,
      env: 'PASSWORD_REQUIRE_LOWERCASE',
    },
    requireNumbers: {
      doc: 'Require numbers in password',
      format: 'Boolean',
      default: true,
      env: 'PASSWORD_REQUIRE_NUMBERS',
    },
    requireSpecialChars: {
      doc: 'Require special characters in password',
      format: 'Boolean',
      default: true,
      env: 'PASSWORD_REQUIRE_SPECIAL_CHARS',
    },
  },
  rateLimiting: {
    enabled: {
      doc: 'Enable rate limiting',
      format: 'Boolean',
      default: true,
      env: 'RATE_LIMITING_ENABLED',
    },
    maxRequests: {
      doc: 'Maximum number of requests allowed',
      format: 'nat',
      default: 100,
      env: 'RATE_LIMITING_MAX_REQUESTS',
    },
    windowMs: {
      doc: 'Time window for rate limiting in milliseconds',
      format: 'nat',
      default: 900000, // 15 minutes
      env: 'RATE_LIMITING_WINDOW_MS',
    },
  },
  cors: {
    origin: {
      doc: 'Allowed origins for CORS',
      format: Array,
      default: ['*'],
      env: 'CORS_ORIGIN',
    },
    methods: {
      doc: 'Allowed HTTP methods for CORS',
      format: Array,
      default: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      env: 'CORS_METHODS',
    },
  },
  helmet: {
    contentSecurityPolicy: {
      doc: 'Enable Content Security Policy',
      format: 'Boolean',
      default: true,
      env: 'HELMET_CONTENT_SECURITY_POLICY',
    },
    xssFilter: {
      doc: 'Enable XSS filter',
      format: 'Boolean',
      default: true,
      env: 'HELMET_XSS_FILTER',
    },
  },
  enableSSL: {
    doc: 'Enable SSL/TLS',
    format: 'Boolean',
    default: false, // Default to false for development
    env: 'ENABLE_SSL',
  },
  twoFactorAuthentication: {
    enabled: {
      doc: 'Enable two-factor authentication',
      format: 'Boolean',
      default: false,
      env: 'TWO_FACTOR_AUTH_ENABLED',
    },
    providers: {
      doc: 'Two-factor authentication providers',
      format: ['email', 'sms', 'authenticator'], // Example providers
      default: [],
      env: 'TWO_FACTOR_AUTH_PROVIDERS',
    },
  },
  oauth2: {
    enabled: {
      doc: 'Enable OAuth2/OpenID Connect authentication',
      format: 'Boolean',
      default: false,
      env: 'OAUTH2_ENABLED',
    },
    providers: {
      doc: 'OAuth2/OpenID Connect provider configurations',
      format: z.record(
        z.object({
          provider: z.string().describe('OAuth2 provider name (e.g., google, facebook)'),
          clientId: z.string().describe('OAuth2 client ID'),
          clientSecret: z.string().describe('OAuth2 client secret'),
          callbackURL: z.string().url().describe('OAuth2 callback URL'),
        })
      ),
      default: {},
      env: 'OAUTH2_PROVIDERS',
    },
  },
});

export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

// Create and validate the configuration object
export const securityConfig = SecurityConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

// Validate the configuration
try {
  SecurityConfigSchema.validate(securityConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Security configuration validation failed:', error.message);
    throw new Error('Invalid security configuration');
  }
  throw error;
}

export default securityConfig;
