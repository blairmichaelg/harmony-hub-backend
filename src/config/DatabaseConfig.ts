// src/config/DatabaseConfig.ts

import convict from 'convict';
import { z } from 'zod';

/**
 * Schema for database configuration
 * @remarks
 * This schema defines the structure and validation rules for the database configuration.
 */
const DatabaseConfigSchema = convict({
  type: {
    doc: 'Type of database',
    format: ['postgres', 'mongodb'],
    default: 'postgres',
    env: 'DB_TYPE',
  },
  url: {
    doc: 'Database connection URL',
    format: 'url',
    default: '', // Set a default value or require this variable
    env: 'DATABASE_URL',
    sensitive: true,
  },
  maxConnections: {
    doc: 'Maximum number of database connections',
    format: 'nat',
    default: 20,
    env: 'DB_MAX_CONNECTIONS',
  },
  connectionLimit: {
    doc: 'Database connection limit',
    format: 'nat',
    default: 10,
    env: 'DB_CONNECTION_LIMIT',
  },
  idleTimeoutMillis: {
    doc: 'Idle timeout in milliseconds',
    format: 'nat',
    default: 30000,
    env: 'DB_IDLE_TIMEOUT',
  },
  connectionTimeoutMillis: {
    doc: 'Connection timeout in milliseconds',
    format: 'nat',
    default: 2000,
    env: 'DB_CONNECTION_TIMEOUT',
  },
  migrations: {
    directory: {
      doc: 'Directory for database migrations',
      format: 'string',
      default: './migrations',
      env: 'DB_MIGRATIONS_DIR',
    },
    tableName: {
      doc: 'Table name for tracking migrations',
      format: 'string',
      default: 'migrations',
      env: 'DB_MIGRATIONS_TABLE',
    },
  },
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
export const databaseConfig = DatabaseConfigSchema.validate({
  // Load configuration from environment variables or use defaults
});

/**
 * Connects to the database based on the configuration
 * @returns A promise that resolves when the database connection is established
 * @throws An error if the connection fails
 */
export const connectDB = async (): Promise<void> => {
  try {
    if (databaseConfig.type === 'mongodb') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mongoose = require('mongoose');
      const conn = await mongoose.connect(databaseConfig.url, {
        maxPoolSize: databaseConfig.connectionLimit,
        serverSelectionTimeoutMS: databaseConfig.connectionTimeoutMillis,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require('pg');
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

// Validate the configuration
try {
  DatabaseConfigSchema.validate(databaseConfig);
} catch (error) {
  if (error instanceof Error) {
    console.error('Database configuration validation failed:', error.message);
    throw new Error('Invalid database configuration');
  }
  throw error;
}

export default databaseConfig;
