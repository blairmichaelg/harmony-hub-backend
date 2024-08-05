// src/config/DatabaseConfig.ts

import { z } from 'zod';

import envConfig from './EnvironmentConfig';

const databaseSchema = z.object({
  url: z.string().url(),
  type: z.enum(['postgres', 'mongodb']).default('postgres'),
  maxConnections: z.number().int().positive().default(20),
  idleTimeoutMillis: z.number().int().nonnegative().default(30000),
  connectionTimeoutMillis: z.number().int().positive().default(2000),
  migrations: z.object({
    directory: z.string().default('./migrations'),
    tableName: z.string().default('knex_migrations'),
  }),
});

type DatabaseConfig = z.infer<typeof databaseSchema>;

const databaseConfig: Readonly<DatabaseConfig> = Object.freeze(
  databaseSchema.parse({
    url: envConfig.DATABASE_URL,
    type: envConfig.DATABASE_URL.includes('postgres') ? 'postgres' : 'mongodb',
    migrations: {
      directory: process.env.DB_MIGRATIONS_DIR,
      tableName: process.env.DB_MIGRATIONS_TABLE,
    },
  })
);

export default databaseConfig;
