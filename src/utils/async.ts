// src/utils/async.ts

/**
 * Pauses execution asynchronously for a given number of milliseconds
 * @param {number} ms - The number of milliseconds to wait
 * @returns {Promise<void>}
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retries a function with exponential backoff on failure
 * @param {() => Promise<T>} fn - The function to retry
 * @param {number} retries - The maximum number of retries
 * @param {number} delay - The initial delay in milliseconds
 * @returns {Promise<T>} A promise resolving to the function result
 * @throws {Error} If the function fails after all retries
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number,
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);

      return retry(fn, retries - 1, delay * 2);
    }

    throw error;
  }
};
