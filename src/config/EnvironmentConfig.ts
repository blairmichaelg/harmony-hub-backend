// src/config/EnvironmentConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for environment configuration
 * @remarks
 * This schema defines the structure and validation rules for the environment configuration.
 */
export const EnvironmentConfigSchema = convict({
  name: {
    doc: 'Environment name (e.g., development, production)',
    format: ['development', 'production', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  // Add more environment-specific fields as needed
});

export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;

// Create and validate the configuration object
const config = EnvironmentConfigSchema.getProperties();

export const environmentConfig: EnvironmentConfig =
  config as unknown as EnvironmentConfig;

try {
  EnvironmentConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error(
      'Environment configuration validation failed:',
      error.message,
    );
    throw new Error('Invalid Environment configuration');
  }
  throw error;
}

export default environmentConfig;
