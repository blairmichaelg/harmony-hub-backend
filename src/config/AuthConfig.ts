import { z } from 'zod';

// Define the schema for the AuthConfig
export const AuthConfigSchema = z.object({
  jwt: z.object({
    secret: z.string().nonempty({
      message: 'JWT secret must be provided',
    }),
    expiresIn: z.string().default('1h'),
  }),
  oauth2: z.object({
    enabled: z.boolean().default(false),
    providers: z
      .record(
        z.object({
          clientId: z.string().nonempty(),
          clientSecret: z.string().nonempty(),
          callbackURL: z.string().url(),
        })
      )
      .default({}),
  }),
  twoFactorAuthentication: z.object({
    enabled: z.boolean().default(false),
    providers: z.array(z.enum(['email', 'sms', 'authenticator'])).default([]),
  }),
  rateLimiting: z.object({
    maxRequests: z.number().int().positive().default(100),
    windowMs: z
      .number()
      .int()
      .positive()
      .default(15 * 60 * 1000), // 15 minutes
  }),
  cors: z.object({
    origin: z.array(z.string()).default(['*']),
    methods: z
      .array(z.enum(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']))
      .default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
  }),
  helmet: z.object({
    contentSecurityPolicy: z.boolean().default(true),
    xssFilter: z.boolean().default(true),
  }),
  enableSSL: z.boolean().default(false),
});

// Define the AuthConfig type
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

// Load the configuration from environment variables
export const authConfig: AuthConfig = AuthConfigSchema.parse({
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  oauth2: {
    enabled: process.env.OAUTH2_ENABLED === 'true',
    providers: process.env.OAUTH2_PROVIDERS ? JSON.parse(process.env.OAUTH2_PROVIDERS) : {},
  },
  twoFactorAuthentication: {
    enabled: process.env.TWO_FACTOR_AUTH_ENABLED === 'true',
    providers: process.env.TWO_FACTOR_AUTH_PROVIDERS
      ? process.env.TWO_FACTOR_AUTH_PROVIDERS.split(',')
      : [],
  },
  rateLimiting: {
    maxRequests: parseInt(process.env.RATE_LIMITING_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMITING_WINDOW_MS || (15 * 60 * 1000).toString(), 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'],
    methods: process.env.CORS_METHODS
      ? process.env.CORS_METHODS.split(',')
      : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
  helmet: {
    contentSecurityPolicy: process.env.HELMET_CONTENT_SECURITY_POLICY === 'true',
    xssFilter: process.env.HELMET_XSS_FILTER === 'true',
  },
  enableSSL: process.env.ENABLE_SSL === 'true',
});
