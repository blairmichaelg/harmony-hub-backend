// src/config/EnvironmentConfig.ts

import convict from 'convict';

/**
 * Schema for environment configuration
 * @remarks
 * This schema defines the structure and validation rules for the environment configuration.
 */
export const EnvironmentConfigSchema = convict({
  name: {
    doc: 'Environment name (e.g., development, production, test)',
    format: ['development', 'production', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  // Add more environment-specific fields as needed
});

// Define the EnvironmentConfig type based on the schema
export interface EnvironmentConfig {
  name: 'development' | 'production' | 'test';
  // Add more fields as needed for future extensibility
}

const config = EnvironmentConfigSchema.getProperties();

export const environmentConfig: EnvironmentConfig =
  config as unknown as EnvironmentConfig;

// Validate the configuration
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
