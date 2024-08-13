// src/utils/caching.ts

import Redis from 'ioredis';
import NodeCache from 'node-cache';
import { cacheConfigSchema } from '../config/CacheConfig';
import { redisConfig } from '../config/RedisConfig';
import logger from './logging';

/**
 * Generic Cache interface
 */
interface CacheInterface {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

/**
 * Local in-memory cache implementation
 */
class LocalCache implements CacheInterface {
  private cache: NodeCache;

  constructor() {
    const localConfig = cacheConfigSchema.get('local');
    this.cache = new NodeCache({
      stdTTL: localConfig.ttl,
      checkperiod: localConfig.checkInterval || undefined, // Use checkInterval from config
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = this.cache.get<T>(key);
    if (value) {
      logger.debug(`Cache hit for key: ${key}`);
    } else {
      logger.debug(`Cache miss for key: ${key}`);
    }
    return value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl || cacheConfigSchema.get('local').ttl);
    logger.debug(
      `Cached value for key: ${key} with TTL: ${
        ttl || cacheConfigSchema.get('local').ttl
      }`,
    );
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
    logger.debug(`Deleted cache entry for key: ${key}`);
  }
}

/**
 * Redis cache implementation
 */
class RedisCache implements CacheInterface {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
    });

    this.redis.on('error', (err) => {
      logger.error('Redis connection error:', err);
      // Handle the error appropriately, e.g., retry logic
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.debug(`Cache hit for key: ${key}`);
        return JSON.parse(value);
      } else {
        logger.debug(`Cache miss for key: ${key}`);
        return undefined;
      }
    } catch (err) {
      logger.error(`Error getting key ${key} from Redis:`, err);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const stringifiedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, stringifiedValue);
      } else {
        await this.redis.set(key, stringifiedValue);
      }
      logger.debug(
        `Cached value for key: ${key} with TTL: ${
          ttl || cacheConfigSchema.get('redis').ttl
        }`,
      );
    } catch (err) {
      logger.error(`Error setting key ${key} in Redis:`, err);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug(`Deleted cache entry for key: ${key}`);
    } catch (err) {
      logger.error(`Error deleting key ${key} from Redis:`, err);
    }
  }
}

/**
 * Factory function to create the appropriate cache instance
 * @returns {CacheInterface} An instance of the configured cache provider
 */
const createCache = (): CacheInterface => {
  const cacheType = cacheConfigSchema.get('local').type;

  switch (cacheType) {
    case 'local':
      logger.info('Using local in-memory cache');
      return new LocalCache();
    case 'redis':
      logger.info('Using Redis cache');
      return new RedisCache();
    default:
      throw new Error(`Unsupported cache type: ${cacheType}`);
  }
};

/**
 * Global cache instance
 */
export const cache = createCache();
