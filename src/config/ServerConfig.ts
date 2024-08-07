// src/config/ServerConfig.ts

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

/**
 * Schema for server configuration
 * @remarks
 * This schema defines the structure and validation rules for the server configuration.
 */
export const ServerConfigSchema = z.object({
  port: z.coerce.number().int().positive().default(3000).describe('Server port number'),
  host: z.string().default('localhost').describe('Server host address'),
  protocol: z.enum(['http', 'https']).default('http').describe('Server protocol'),
  apiVersion: z.string().default('v1').describe('API version'),
  maxRequestBodySize: z.string().default('10mb').describe('Maximum request body size'),
  compressionLevel: z.coerce
    .number()
    .int()
    .min(0)
    .max(9)
    .default(6)
    .describe('Compression level for responses'),
  trustProxy: z.coerce.boolean().default(false).describe('Whether to trust proxy headers'),
  sessionSecret: z.string().min(32).describe('Secret for session management'),
  cookieSecret: z.string().min(32).describe('Secret for cookie signing'),
  maxConnections: z.coerce
    .number()
    .int()
    .positive()
    .default(100)
    .describe('Maximum number of server connections'),
  helmet: z
    .object({
      contentSecurityPolicy: z.coerce
        .boolean()
        .default(true)
        .describe('Enable Content Security Policy'),
      xssFilter: z.coerce.boolean().default(true).describe('Enable XSS filter'),
      hsts: z.coerce.boolean().default(true).describe('Enable HTTP Strict Transport Security'),
      noSniff: z.coerce.boolean().default(true).describe('Enable noSniff'),
      referrerPolicy: z.coerce.boolean().default(true).describe('Enable Referrer Policy'),
    })
    .describe('Helmet security options'),
});

/**
 * Type definition for server configuration
 */
export type ServerConfig = z.infer<typeof ServerConfigSchema>;

/**
 * Server configuration object
 * @remarks
 * This object contains the parsed and validated server configuration.
 */
export const serverConfig: ServerConfig = ServerConfigSchema.parse({
  port: getEnvVar('SERVER_PORT', '3000'),
  host: getEnvVar('SERVER_HOST', 'localhost'),
  protocol: getEnvVar('SERVER_PROTOCOL', 'http'),
  apiVersion: getEnvVar('API_VERSION', 'v1'),
  maxRequestBodySize: getEnvVar('MAX_REQUEST_BODY_SIZE', '10mb'),
  compressionLevel: getEnvVar('COMPRESSION_LEVEL', '6'),
  trustProxy: getEnvVar('TRUST_PROXY', 'false'),
  sessionSecret: getEnvVar(
    'SESSION_SECRET',
    'harmonyhub_session_secret_default_change_in_production'
  ),
  cookieSecret: getEnvVar('COOKIE_SECRET', 'harmonyhub_cookie_secret_default_change_in_production'),
  maxConnections: getEnvVar('MAX_CONNECTIONS', '100'),
  helmet: {
    contentSecurityPolicy: getEnvVar('HELMET_CSP', 'true'),
    xssFilter: getEnvVar('HELMET_XSS_FILTER', 'true'),
    hsts: getEnvVar('HELMET_HSTS', 'true'),
    noSniff: getEnvVar('HELMET_NO_SNIFF', 'true'),
    referrerPolicy: getEnvVar('HELMET_REFERRER_POLICY', 'true'),
  },
});

// Validate the configuration
try {
  ServerConfigSchema.parse(serverConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Server configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid server configuration');
  }
  throw error;
}
