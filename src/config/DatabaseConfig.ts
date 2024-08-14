// src/config/DatabaseConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for database configuration
 * @remarks
 * This schema defines the structure and validation rules for the database configuration.
 */
export const DatabaseConfigSchema = convict({
  type: {
    doc: 'Database type (e.g., postgres, mongodb)',
    format: ['postgres', 'mongodb'],
    default: 'postgres',
    env: 'DATABASE_TYPE',
  },
  postgres: {
    doc: 'PostgreSQL configuration',
    format: z.object({
      host: z.string().describe('PostgreSQL host'),
      port: z.number().int().positive().describe('PostgreSQL port'),
      user: z.string().describe('PostgreSQL user'),
      password: z.string().describe('PostgreSQL password'),
      database: z.string().describe('PostgreSQL database name'),
      // Add more PostgreSQL-specific fields as needed
    }),
    default: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'harmonyhub',
    },
    env: 'POSTGRES_CONFIG',
  },
  mongodb: {
    doc: 'MongoDB configuration',
    format: z.object({
      url: z.string().url().describe('MongoDB connection URL'),
      // Add more MongoDB-specific fields as needed
    }),
    default: {
      url: 'mongodb://localhost:27017/harmonyhub',
    },
    env: 'MONGODB_CONFIG',
  },
  pool: {
    doc: 'Connection pool settings',
    format: z.object({
      min: z
        .number()
        .int()
        .nonnegative()
        .describe('Minimum number of connections in the pool'),
      max: z
        .number()
        .int()
        .positive()
        .describe('Maximum number of connections in the pool'),
      // Add more pool-specific fields as needed
    }),
    default: {
      min: 2,
      max: 10,
    },
    env: 'DATABASE_POOL_CONFIG',
  },
  migrations: {
    doc: 'Database migration settings',
    format: z.object({
      directory: z.string().describe('Directory containing migration files'),
      // Add more migration-specific fields as needed
    }),
    default: {
      directory: './migrations',
    },
    env: 'DATABASE_MIGRATIONS_CONFIG',
  },
  // Add more fields as needed for future extensibility
});

export type DatabaseConfig = z.ZodType<any, any, any>;

// Create and validate the configuration object
const config = DatabaseConfigSchema.getProperties();

export const databaseConfig: DatabaseConfig =
  config as unknown as DatabaseConfig;

try {
  DatabaseConfigSchema.validate({ allowed: 'strict' });
} catch (error) {
  if (error instanceof Error) {
    console.error('Database configuration validation failed:', error.message);
    throw new Error('Invalid Database configuration');
  }
  throw error;
}

export default databaseConfig;
