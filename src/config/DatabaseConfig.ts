// src/config/DatabaseConfig.ts

import { z } from 'zod';

import { getEnvVar } from '../utils/envUtils';

/**
 * Schema for database configuration
 * @remarks
 * This schema defines the structure and validation rules for the database configuration.
 */
export const DatabaseConfigSchema = z.object({
  type: z.enum(['postgres', 'mongodb']).describe('Type of database'),
  url: z.string().url().describe('Database connection URL'),
  maxConnections: z.coerce
    .number()
    .int()
    .positive()
    .default(20)
    .describe('Maximum number of database connections'),
  connectionLimit: z.coerce
    .number()
    .int()
    .positive()
    .default(10)
    .describe('Database connection limit'),
  idleTimeoutMillis: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(30000)
    .describe('Idle timeout in milliseconds'),
  connectionTimeoutMillis: z.coerce
    .number()
    .int()
    .positive()
    .default(2000)
    .describe('Connection timeout in milliseconds'),
  migrations: z
    .object({
      directory: z.string().describe('Directory for database migrations'),
      tableName: z.string().describe('Table name for tracking migrations'),
    })
    .describe('Database migration configuration'),
});

/**
 * Type definition for database configuration
 */
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

/**
 * Database configuration object
 * @remarks
 * This object contains the parsed and validated database configuration.
 */
export const databaseConfig: DatabaseConfig = DatabaseConfigSchema.parse({
  type: getEnvVar('DB_TYPE', 'postgres'),
  url: getEnvVar('DATABASE_URL'),
  maxConnections: getEnvVar('DB_MAX_CONNECTIONS', '20'),
  connectionLimit: getEnvVar('DB_CONNECTION_LIMIT', '10'),
  idleTimeoutMillis: getEnvVar('DB_IDLE_TIMEOUT', '30000'),
  connectionTimeoutMillis: getEnvVar('DB_CONNECTION_TIMEOUT', '2000'),
  migrations: {
    directory: getEnvVar('DB_MIGRATIONS_DIR', './migrations'),
    tableName: getEnvVar('DB_MIGRATIONS_TABLE', 'migrations'),
  },
});

// Validate the configuration
try {
  DatabaseConfigSchema.parse(databaseConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Database configuration validation failed:');
    error.errors.forEach((err) => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error('Invalid database configuration');
  }
  throw error;
}

/**
 * Connects to the database based on the configuration
 * @returns A promise that resolves when the database connection is established
 * @throws An error if the connection fails
 */
export const connectDB = async (): Promise<void> => {
  try {
    if (databaseConfig.type === 'mongodb') {
      const mongoose = await import('mongoose');
      const conn = await mongoose.connect(databaseConfig.url, {
        maxPoolSize: databaseConfig.connectionLimit,
        serverSelectionTimeoutMS: databaseConfig.connectionTimeoutMillis,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: databaseConfig.url,
        max: databaseConfig.connectionLimit,
        idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
        connectionTimeoutMillis: databaseConfig.connectionTimeoutMillis,
      });
      const client = await pool.connect();

      console.log('PostgreSQL Connected');
      client.release();
    }
  } catch (error) {
    console.error(`Error connecting to ${databaseConfig.type}:`, error);
    process.exit(1);
  }
};
