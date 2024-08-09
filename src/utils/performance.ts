// src/utils/performance.ts

import { performance } from 'perf_hooks';

import logger from './logging';

/**
 * Measures the execution time of a function
 * @param {() => T} fn - The function to measure
 * @returns {Promise<[T, number]>} A promise resolving to the function result and execution time in milliseconds
 */
export const measureExecutionTime = async <T>(fn: () => Promise<T>): Promise<[T, number]> => {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();
  const executionTime = endTime - startTime;

  logger.debug(`Function execution time: ${executionTime} ms`);

  return [result, executionTime];
};
