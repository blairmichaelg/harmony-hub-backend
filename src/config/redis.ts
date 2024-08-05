// redis.ts

import { config } from 'dotenv';
import * as joi from 'joi';

config();

export interface RedisConfigType {
  host: string;
  port: number;
  password: string;
  db: number;
  tls: boolean;
  connectTimeout: number;
  maxRetriesPerRequest: number;
  enableReadyCheck: boolean;
  keyPrefix: string;
}

const redisConfigSchema = joi.object({
  host: joi.string().required(),
  port: joi.number().port().required(),
  password: joi.string().allow('').required(),
  db: joi.number().min(0).required(),
  tls: joi.boolean().required(),
  connectTimeout: joi.number().positive().required(),
  maxRetriesPerRequest: joi.number().min(0).required(),
  enableReadyCheck: joi.boolean().required(),
  keyPrefix: joi.string().required(),
});

const redisConfig: RedisConfigType = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0', 10),
  tls: process.env.REDIS_TLS === 'true',
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  enableReadyCheck: process.env.REDIS_ENABLE_READY_CHECK === 'true',
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'harmonyhub:',
};

const { error } = redisConfigSchema.validate(redisConfig);

if (error) {
  throw new Error(`Redis Configuration Error: ${error.message}`);
}

export default redisConfig;
