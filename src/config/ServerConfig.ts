// src/config/ServerConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for server configuration
 * @remarks
 * This schema defines the structure and validation rules for the server configuration.
 */
export const ServerConfigSchema = convict({
  host: {
    doc: 'Server host',
    format: z.string().describe('Server host'),
    default: 'localhost',
    env: 'SERVER_HOST',
  },
  port: {
    doc: 'Server port',
    format: z.number().int().positive().describe('Server port'),
    default: 3000,
    env: 'SERVER_PORT',
  },
  protocol: {
    doc: 'Server protocol',
    format: ['http', 'https'],
    default: 'http',
    env: 'SERVER_PROTOCOL',
  },
  // Add more fields as needed for future extensibility
});

// Define the ServerConfig type based on the schema
export interface ServerConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  // Add more fields as needed for future extensibility
}

const config = ServerConfigSchema.getProperties();

export const serverConfig: ServerConfig = config as unknown as ServerConfig;

// Validate the configuration
try {
  ServerConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Server configuration validation failed:', error.message);
    throw new Error('Invalid server configuration');
  }
  throw error;
}

export default serverConfig;
