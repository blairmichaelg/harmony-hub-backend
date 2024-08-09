// src/utils/caching.ts

import NodeCache from 'node-cache';

import { cacheConfig } from '../config/CacheConfig';

import logger from './logging';

/**
 * Caching utility class
 */
class Cache {
  private cache: NodeCache;

  /**
   * Creates a new Cache instance
   */
  constructor() {
    this.cache = new NodeCache({
      stdTTL: cacheConfig.local.ttl,
      checkperiod: cacheConfig.local.ttl / 2,
    });
  }

  /**
   * Retrieves a value from the cache
   * @param {string} key - The cache key
   * @returns {Promise<unknown>} The cached value or undefined if not found
   */
  async get(key: string): Promise<unknown> {
    const value = this.cache.get(key);

    if (value) {
      logger.debug(`Cache hit for key: ${key}`);
    } else {
      logger.debug(`Cache miss for key: ${key}`);
    }

    return value;
  }

  /**
   * Sets a value in the cache
   * @param {string} key - The cache key
   * @param {unknown} value - The value to cache
   * @param {number} [ttl] - Optional time-to-live in seconds
   * @returns {Promise<void>}
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    this.cache.set(key, value, ttl);
    logger.debug(`Cached value for key: ${key} with TTL: ${ttl || cacheConfig.local.ttl}`);
  }

  /**
   * Deletes a value from the cache
   * @param {string} key - The cache key
   * @returns {Promise<void>}
   */
  async del(key: string): Promise<void> {
    this.cache.del(key);
    logger.debug(`Deleted cache entry for key: ${key}`);
  }
}

/**
 * Global cache instance
 */
export const cache = new Cache();
