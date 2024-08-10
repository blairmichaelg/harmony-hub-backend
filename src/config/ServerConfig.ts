// src/config/ServerConfig.ts

import convict from 'convict';

/**
 * Schema for server configuration
 * @remarks
 * This schema defines the structure and validation rules for the server configuration.
 */
const ServerConfigSchema = convict({
  host: {
    doc: 'Server host',
    format: String,
    default: 'localhost',
    env: 'SERVER_HOST',
  },
  port: {
    doc: 'Server port',
    format: 'port',
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

/**
 * Interface definition for server configuration
 */
export interface IServerConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https';
}

/**
 * Server configuration object
 * @remarks
 * This object contains the parsed and validated server configuration.
 */
const config = ServerConfigSchema.getProperties();

export const serverConfig: IServerConfig = config as unknown as IServerConfig;

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
