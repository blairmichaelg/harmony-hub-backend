// src/config/ServerConfig.ts

import convict from 'convict';
import { z } from 'zod';

// Define the configuration schema
const ServerConfigSchema = convict({
  port: {
    doc: 'Server port number',
    format: 'port',
    default: 3000,
    env: 'SERVER_PORT',
  },
  host: {
    doc: 'Server host address',
    format: 'string',
    default: 'localhost',
    env: 'SERVER_HOST',
  },
  protocol: {
    doc: 'Server protocol',
    format: ['http', 'https'],
    default: 'http',
    env: 'SERVER_PROTOCOL',
  },
  apiVersion: {
    doc: 'API version',
    format: 'string',
    default: 'v1',
    env: 'API_VERSION',
  },
  maxRequestBodySize: {
    doc: 'Maximum request body size',
    format: 'string',
    default: '10mb',
    env: 'MAX_REQUEST_BODY_SIZE',
  },
  compressionLevel: {
    doc: 'Compression level for responses (0-9)',
    format: 'int',
    default: 6,
    env: 'COMPRESSION_LEVEL',
  },
  trustProxy: {
    doc: 'Whether to trust proxy headers',
    format: 'Boolean',
    default: false,
    env: 'TRUST_PROXY',
  },
  sessionSecret: {
    doc: 'Secret for session management',
    format: 'string',
    default:
      process.env.NODE_ENV === 'production'
        ? '' // Generate a strong secret in production
        : 'harmonyhub_session_secret_default_change_in_production',
    env: 'SESSION_SECRET',
    sensitive: true,
  },
  cookieSecret: {
    doc: 'Secret for cookie signing',
    format: 'string',
    default:
      process.env.NODE_ENV === 'production'
        ? '' // Generate a strong secret in production
        : 'harmonyhub_cookie_secret_default_change_in_production',
    env: 'COOKIE_SECRET',
    sensitive: true,
  },
  maxConnections: {
    doc: 'Maximum number of server connections',
    format: 'nat',
    default: 100,
    env: 'MAX_CONNECTIONS',
  },
  helmet: {
    contentSecurityPolicy: {
      doc: 'Enable Content Security Policy',
      format: 'Boolean',
      default: true,
      env: 'HELMET_CSP',
    },
    xssFilter: {
      doc: 'Enable XSS filter',
      format: 'Boolean',
      default: true,
      env: 'HELMET_XSS_FILTER',
    },
    hsts: {
      doc: 'Enable HTTP Strict Transport Security',
      format: 'Boolean',
      default: true,
      env: 'HELMET_HSTS',
    },
    noSniff: {
      doc: 'Enable noSniff',
      format: 'Boolean',
      default: true,
      env: 'HELMET_NO_SNIFF',
    },
    referrerPolicy: {
      doc: 'Enable Referrer Policy',
      format: 'Boolean',
      default: true,
      env: 'HELMET_REFERRER_POLICY',
    },
  },
  webSockets: {
    port: {
      doc: 'Port for WebSocket connections',
      format: 'port',
      default: 8080,
      env: 'WEBSOCKETS_PORT',
    },
    protocol: {
      doc: 'Protocol for WebSocket connections (ws or wss)',
      format: ['ws', 'wss'],
      default: 'ws',
      env: 'WEBSOCKETS_PROTOCOL',
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
      doc: 'Maximum number of requests allowed per window',
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
    perRoute: {
      doc: 'Per-route rate limiting configuration',
      format: z.record(
        z.object({
          maxRequests: z.number().int().positive(),
          windowMs: z.number().int().positive(),
        })
      ),
      default: {},
      env: 'RATE_LIMITING_PER_ROUTE',
    },
  },
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

// Create and validate the configuration object
export const serverConfig = ServerConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

export default serverConfig;
