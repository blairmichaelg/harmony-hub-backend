// src/config/EnvironmentConfig.ts

import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

const loadEnvConfig = (): EnvConfig => {
  const envFile = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`);

  if (fs.existsSync(envFile)) {
    const envConfig = dotenv.parse(fs.readFileSync(envFile));

    Object.assign(process.env, envConfig);
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment configuration error:', error);
    process.exit(1);
  }
};

const envConfig: Readonly<EnvConfig> = Object.freeze(loadEnvConfig());

export default envConfig;
